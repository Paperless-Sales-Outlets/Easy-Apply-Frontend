// src/services/tesseractNicService.js
// 100% Client-Side & Private OCR (No external server or cloud exposure)
import {
  parseSriLankanNIC,
  extractNICFromText,
  extractFullNameFromOCR,
  extractAddressFromOCR,
} from '../utils/nicParser';

/**
 * Preprocesses image on an in-memory HTML5 canvas (grayscale + contrast enhancement)
 * to maximize local Tesseract character recognition accuracy.
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
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);

        const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imgData.data;

        // Grayscale conversion & contrast boost
        const contrast = 1.35;
        const factor = (259 * (contrast * 255 + 255)) / (255 * (259 - contrast * 255));

        for (let i = 0; i < data.length; i += 4) {
          const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
          const adjusted = Math.min(255, Math.max(0, factor * (gray - 128) + 128));
          data[i] = adjusted;
          data[i + 1] = adjusted;
          data[i + 2] = adjusted;
        }

        ctx.putImageData(imgData, 0, 0);
        resolve(canvas.toDataURL('image/jpeg', 0.95));
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
 * Guarantees that citizen identity documents never leave the user's browser.
 *
 * @param {Object} params
 * @param {string} params.nicFront - Base64 data URL of NIC front side
 * @param {string} [params.nicBack] - Base64 data URL of NIC back side
 * @param {Function} [params.onStatusChange] - Status callback for UI loading feedback
 * @returns {Promise<Object>} Normalized extracted details
 */
export async function scanNICTesseract({ nicFront, nicBack, onStatusChange }) {
  if (!nicFront) {
    throw new Error('NIC Front image is required for scanning.');
  }

  if (onStatusChange) {
    onStatusChange({ status: 'SCANNING', message: 'Fetching your details (Private On-Device OCR)...' });
  }

  // Dynamically import tesseract.js so it only loads into memory when needed
  const { createWorker } = await import('tesseract.js');
  const worker = await createWorker('eng');

  try {
    // 1. Preprocess and recognize text from front side
    const processedFront = await preprocessImageForOCR(nicFront);
    const frontResult = await worker.recognize(processedFront);
    const frontText = frontResult.data.text || '';

    // 2. Mathematically extract and decode NIC number
    const mathNIC = extractNICFromText(frontText);

    // 3. Extract Full Name heuristically from front text
    const fullName = extractFullNameFromOCR(frontText);

    let address = '';
    let rawBack = '';
    // 4. Recognize text from back side if provided
    if (nicBack) {
      if (onStatusChange) {
        onStatusChange({ status: 'SCANNING', message: 'Scanning reverse side locally...' });
      }
      const processedBack = await preprocessImageForOCR(nicBack);
      const backResult = await worker.recognize(processedBack);
      rawBack = backResult.data.text || '';
      address = extractAddressFromOCR(rawBack);
    }

    await worker.terminate();

    if (!mathNIC) {
      if (onStatusChange) {
        onStatusChange({ status: 'ERROR', message: 'Could not detect a valid NIC number. Please enter manually.' });
      }
      return {
        success: false,
        message: 'Could not detect a valid Sri Lankan NIC number. You can fill your details manually.',
      };
    }

    if (onStatusChange) {
      onStatusChange({ status: 'SUCCESS', message: 'Details verified locally.' });
    }

    if (import.meta.env.DEV) {
      console.log('[Tesseract.js RAW Front]:', frontText);
      if (nicBack) console.log('[Tesseract.js RAW Back]:', rawBack);
      console.log('[Tesseract.js Extracted]:', {
        nic: mathNIC.nic,
        fullName,
        address,
        dob: mathNIC.dob,
        gender: mathNIC.gender,
      });
    }

    return {
      success: true,
      engine: 'TESSERACT_CLIENT_PRIVATE',
      nicNumber: mathNIC.nic,
      fullName: fullName || '',
      address: address || '',
      city: '',
      district: '',
      dob: mathNIC.dob,
      gender: mathNIC.gender,
      suggestedTitle: mathNIC.suggestedTitle,
      warnings: mathNIC.warnings || [],
    };
  } catch (err) {
    await worker.terminate();
    console.warn('Tesseract OCR error:', err.message);
    if (onStatusChange) {
      onStatusChange({ status: 'ERROR', message: 'Could not auto-extract details. Please enter manually.' });
    }
    return {
      success: false,
      message: 'Could not read document locally. You can fill your details manually.',
    };
  }
}
