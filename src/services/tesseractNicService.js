// src/services/tesseractNicService.js
// 100% Client-Side & Private OCR for Sri Lankan National Identity Cards
import {
  parseSriLankanNIC,
  extractNICFromText,
  extractFullNameFromOCR,
  extractAddressFromOCR,
  cleanNIC,
  deriveGenderAndDOBFromNIC,
  deriveServiceAreaFromAddress,
} from '../utils/nicParser';

/**
 * Preprocesses image on an HTML5 canvas using GPU-accelerated canvas filter
 * for fast, crystal-clear OCR text recognition.
 */
function preprocessImageForOCR(base64Image) {
  return new Promise((resolve) => {
    if (!base64Image || typeof base64Image !== 'string' || !base64Image.startsWith('data:image')) {
      return resolve(base64Image);
    }
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        // Scale to ideal OCR resolution (1200px - 1600px width)
        let targetWidth = img.width;
        let targetHeight = img.height;
        if (targetWidth < 1000) {
          const scale = 1200 / targetWidth;
          targetWidth = 1200;
          targetHeight = Math.round(targetHeight * scale);
        } else if (targetWidth > 1800) {
          const scale = 1600 / targetWidth;
          targetWidth = 1600;
          targetHeight = Math.round(targetHeight * scale);
        }

        canvas.width = targetWidth;
        canvas.height = targetHeight;

        // Apply fast GPU filter for grayscale and crisp contrast
        if (ctx.filter) {
          ctx.filter = 'grayscale(100%) contrast(140%) brightness(102%)';
        }
        ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

        resolve(canvas.toDataURL('image/jpeg', 0.92));
      } catch {
        resolve(base64Image);
      }
    };
    img.onerror = () => resolve(base64Image);
    img.src = base64Image;
  });
}

/**
 * Scans NIC on the client device using in-browser Tesseract.js WebAssembly worker.
 *
 * @param {Object} params
 * @param {string} [params.nicFront] - Base64 data URL of NIC front side
 * @param {string} [params.nicBack] - Base64 data URL of NIC back side
 * @param {Function} [params.onStatusChange] - Status callback for UI loading feedback
 * @returns {Promise<Object>} Normalized extracted details
 */
export async function scanNICTesseract({ nicFront, nicBack, onStatusChange }) {
  if (!nicFront && !nicBack) {
    throw new Error('At least one NIC image (Front or Back) is required for scanning.');
  }

  if (onStatusChange) {
    onStatusChange({ status: 'SCANNING', message: 'Analyzing NIC with on-device OCR...' });
  }

  const { createWorker } = await import('tesseract.js');
  let worker = null;

  try {
    // English traineddata is fast, lightweight (~4MB) and recognizes all NIC numbers, names and addresses
    worker = await createWorker('eng');

    let frontText = '';
    let rawBack = '';

    // 1. Scan Front image if provided
    if (nicFront) {
      if (onStatusChange) {
        onStatusChange({ status: 'SCANNING', message: 'Scanning NIC front...' });
      }
      const processedFront = await preprocessImageForOCR(nicFront);
      const frontResult = await worker.recognize(processedFront);
      frontText = frontResult.data.text || '';
    }

    // 2. Scan Back image if provided
    if (nicBack) {
      if (onStatusChange) {
        onStatusChange({ status: 'SCANNING', message: 'Scanning NIC reverse side...' });
      }
      const processedBack = await preprocessImageForOCR(nicBack);
      const backResult = await worker.recognize(processedBack);
      rawBack = backResult.data.text || '';
    }

    await worker.terminate();
    worker = null;

    // Combine texts for multi-pass extraction
    const combinedText = `${frontText}\n${rawBack}`;

    // 3. Extract NIC number from frontText or rawBack
    let mathNIC = extractNICFromText(frontText) || extractNICFromText(rawBack) || extractNICFromText(combinedText);

    // 4. Extract Full Name from frontText or combined
    let fullName = extractFullNameFromOCR(frontText) || extractFullNameFromOCR(combinedText);

    // 5. Extract Address from backText or combined
    let address = extractAddressFromOCR(rawBack) || extractAddressFromOCR(combinedText);

    // Derive Gender and DOB from mathNIC if found
    let derivedInfo = null;
    if (mathNIC?.nic) {
      derivedInfo = deriveGenderAndDOBFromNIC(mathNIC.nic);
    }

    // Derive Service Area from Address if found
    let areaInfo = null;
    if (address) {
      areaInfo = deriveServiceAreaFromAddress(address);
    }

    const hasAnyFound = Boolean(mathNIC?.nic || fullName || address);

    if (!hasAnyFound) {
      if (onStatusChange) {
        onStatusChange({ status: 'ERROR', message: 'Could not auto-detect text. You can enter details manually.' });
      }
      return {
        success: false,
        message: 'Could not auto-read card details clearly. Please check or enter details below.',
      };
    }

    if (onStatusChange) {
      onStatusChange({ status: 'SUCCESS', message: 'NIC details extracted successfully!' });
    }

    return {
      success: true,
      engine: 'TESSERACT_CLIENT_PRIVATE',
      nicNumber: mathNIC?.nic || '',
      fullName: fullName || '',
      address: address || '',
      city: areaInfo?.city || '',
      district: areaInfo?.district || '',
      serviceArea: areaInfo?.district ? `${areaInfo.city}, ${areaInfo.district}` : '',
      dob: derivedInfo?.dob || mathNIC?.dob || '',
      gender: derivedInfo?.gender || mathNIC?.gender || 'Male',
      suggestedTitle: derivedInfo?.gender === 'Female' ? 'Ms.' : 'Mr.',
      warnings: mathNIC?.warnings || [],
    };
  } catch (err) {
    if (worker) {
      try {
        await worker.terminate();
      } catch {
        // ignore termination errors
      }
    }
    console.warn('Tesseract OCR error:', err.message);
    if (onStatusChange) {
      onStatusChange({ status: 'ERROR', message: 'Could not read document. Enter details manually.' });
    }
    return {
      success: false,
      message: 'Could not read document. You can fill details manually.',
    };
  }
}
