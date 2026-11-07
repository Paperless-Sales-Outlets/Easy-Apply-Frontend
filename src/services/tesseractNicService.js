// src/services/tesseractNicService.js
// Client-side OCR for Sri Lankan National Identity Cards.
import {
  extractNICFromText,
  extractFullNameFromOCR,
  extractAddressFromOCR,
  cleanNIC,
  deriveGenderAndDOBFromNIC,
  deriveServiceAreaFromAddress,
} from '../utils/nicParser';
import api from '../utils/api';

/**
 * Preprocesses image on an in-memory HTML5 canvas (rescaling + balanced grayscale + sharpening convolution)
 * to maximize local Tesseract character recognition accuracy on Sri Lankan NICs.
 */
function preprocessImageForOCR(base64Image) {
  return new Promise((resolve) => {
    if (!base64Image || typeof base64Image !== 'string' || !base64Image.startsWith('data:image')) {
      resolve(base64Image);
      return;
    }

    const img = new Image();
    if (base64Image.startsWith('http')) {
      img.crossOrigin = 'anonymous';
    }
    img.onload = () => {
      try {
        if (!img.width || !img.height) {
          resolve(base64Image);
          return;
        }

        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(base64Image);
          return;
        }

        // Scale to optimal OCR width (1400px - 1800px)
        let targetWidth = img.width;
        let targetHeight = img.height;
        if (targetWidth < 1200) {
          const scale = 1400 / targetWidth;
          targetWidth = 1400;
          targetHeight = Math.round(targetHeight * scale);
        } else if (targetWidth > 1800) {
          const scale = 1600 / targetWidth;
          targetWidth = 1600;
          targetHeight = Math.round(targetHeight * scale);
        }

        canvas.width = targetWidth;
        canvas.height = targetHeight;
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

        // Export clean, uncorrupted high-resolution JPEG for Leptonica's built-in Otsu engine
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
 * Scan NIC images using high-accuracy server-side PaddleOCR (deep learning) with
 * automatic fallback to client-side Tesseract.js.
 *
 * @param {Object} params
 * @param {string} [params.nicFront] - NIC front image (data URL or supported image source)
 * @param {string} [params.nicBack] - NIC back image (data URL or supported image source)
 * @param {string} [params.expectedNIC] - Expected NIC from customer input for OCR disambiguation
 * @param {Function} [params.onStatusChange] - Progress status callback
 * @returns {Promise<Object>} OCR result, extracted data, and review metadata
 */
export async function scanNICTesseract({ nicFront, nicBack, expectedNIC, onStatusChange }) {
  if (!nicFront && !nicBack) {
    throw new Error('At least one NIC image (Front or Back) is required for scanning.');
  }

  // 1. Primary: Try Deep Learning PaddleOCR on backend
  try {
    onStatusChange?.({
      status: 'SCANNING',
      message: 'Analyzing NIC with AI Deep-Learning OCR...',
    });

    const backendRes = await api.post(
      '/ocr/scan-nic',
      { nicFront, nicBack, expectedNIC },
      { timeout: 15000 }
    );

    if (backendRes?.data?.success) {
      const data = backendRes.data;
      console.log('[Unified OCR] Backend PaddleOCR success:', data);

      onStatusChange?.({
        status: 'SUCCESS',
        message: data.fetchedCount >= 3
          ? (data.missingFields?.length > 0
            ? 'Core NIC details extracted with AI! Please review.'
            : 'NIC details extracted with AI!')
          : 'Partial text detected. Please review details.',
      });

      return {
        ...data,
        engine: 'PADDLE_OCR_NODE_ONNX',
      };
    }
  } catch (backendErr) {
    console.warn(
      '[Unified OCR] Backend PaddleOCR unavailable or timed out, falling back to on-device Tesseract:',
      backendErr?.message
    );
  }

  // 2. Fallback: On-device Tesseract.js
  onStatusChange?.({
    status: 'SCANNING',
    message: 'Analyzing NIC with on-device OCR...',
  });

  let worker = null;
  try {
    const { createWorker } = await import('tesseract.js');
    worker = await createWorker('eng');

    let frontText = '';
    let backText = '';

    if (nicFront) {
      onStatusChange?.({ status: 'SCANNING', message: 'Scanning NIC front...' });
      const processedFront = await preprocessImageForOCR(nicFront);
      const result = await worker.recognize(processedFront);
      frontText = result?.data?.text || '';
    }

    if (nicBack) {
      onStatusChange?.({ status: 'SCANNING', message: 'Scanning NIC reverse side...' });
      const processedBack = await preprocessImageForOCR(nicBack);
      const result = await worker.recognize(processedBack);
      backText = result?.data?.text || '';
    }

    console.log('[Tesseract.js RAW Front]:', frontText);
    if (nicBack) console.log('[Tesseract.js RAW Back]:', backText);

    const combinedText = `${frontText}\n${backText}`;
    const nicResult =
      extractNICFromText(frontText, { expectedNIC }) ||
      extractNICFromText(backText, { expectedNIC }) ||
      extractNICFromText(combinedText, { expectedNIC });

    let nicNumber = nicResult?.nic ? cleanNIC(nicResult.nic) : '';
    // If expectedNIC was provided and matches partial digits on card, accept it
    if (!nicNumber && expectedNIC) {
      const cleanExp = cleanNIC(expectedNIC);
      if (cleanExp && (combinedText.includes(cleanExp.slice(0, 6)) || combinedText.includes(cleanExp.slice(-6)))) {
        nicNumber = cleanExp;
      }
    }

    const fullName =
      extractFullNameFromOCR(frontText) ||
      extractFullNameFromOCR(combinedText) ||
      '';
    const address =
      extractAddressFromOCR(backText) ||
      extractAddressFromOCR(combinedText) ||
      '';

    const derivedInfo = nicNumber ? deriveGenderAndDOBFromNIC(nicNumber) : null;
    const areaInfo = address ? deriveServiceAreaFromAddress(address) : null;

    const city = areaInfo?.city || '';
    const district = areaInfo?.district || '';
    const rawGender = derivedInfo?.gender || nicResult?.gender || '';
    const gender = /^female$/i.test(rawGender)
      ? 'Female'
      : /^male$/i.test(rawGender)
        ? 'Male'
        : rawGender;
    const dob = derivedInfo?.dob || nicResult?.dob || '';

    // Check presence of the 5 core identity fields:
    const hasNic = Boolean(nicNumber);
    const hasName = Boolean(fullName && fullName.trim().length > 2 && fullName.toLowerCase() !== 'customer');
    const hasDob = Boolean(dob);
    const hasGender = Boolean(gender);
    const hasAddress = Boolean(address);

    const missingFields = [];
    if (!hasNic) missingFields.push('nicNumber');
    if (!hasName) missingFields.push('fullName');
    if (!hasDob) missingFields.push('dob');
    if (!hasGender) missingFields.push('gender');
    if (!hasAddress) missingFields.push('address');

    const fetchedCount = 5 - missingFields.length;

    // If completely no text or fewer than 1 field could be found at all:
    if (!nicNumber && !fullName && !address && frontText.trim().length < 5) {
      onStatusChange?.({
        status: 'ERROR',
        message: 'Could not auto-detect text. You can enter details manually.',
      });
      return {
        success: false,
        message: 'Could not auto-read card details clearly. Please check or enter details below.',
        rawFront: frontText,
        rawBack: backText,
      };
    }

    const extractionStatus = !nicNumber
      ? 'FAILED'
      : missingFields.length > 0
        ? 'PARTIAL'
        : 'COMPLETE';
    const isPartial = missingFields.length > 0;
    const manualReviewRequired = isPartial;

    const exceptionFlags = [];
    if (isPartial) exceptionFlags.push('PARTIAL_DATA_FETCHED');
    if (!hasNic) exceptionFlags.push('NIC_NUMBER_MISSING_IN_OCR');
    if (!hasName) exceptionFlags.push('NAME_MISSING_IN_OCR');
    if (!hasAddress) exceptionFlags.push('ADDRESS_MISSING_IN_OCR');

    onStatusChange?.({
      status: 'SUCCESS',
      message: fetchedCount >= 3
        ? (missingFields.length > 0
          ? 'Core NIC details extracted! Please review and complete missing fields.'
          : 'NIC details extracted successfully!')
        : 'Partial text detected. Please review details.',
    });

    return {
      success: true,
      engine: 'TESSERACT_CLIENT_PRIVATE',
      nicNumber,
      fullName,
      address,
      city,
      district,
      serviceArea: city && district ? `${city}, ${district}` : (city || district),
      dob,
      gender,
      suggestedTitle:
        gender === 'Female' ? 'Ms.' : gender === 'Male' ? 'Mr.' : (nicResult?.suggestedTitle || ''),
      warnings: Array.isArray(nicResult?.warnings) ? nicResult.warnings : [],
      extractionStatus,
      isPartial,
      missingFields,
      exceptionFlags,
      fetchedCount,
      manualReviewRequired,
      reviewReason: manualReviewRequired
        ? `Auto KYC partial: ${fetchedCount} of 5 fields detected from document.`
        : null,
      rawFront: frontText,
      rawBack: backText,
    };
  } catch (err) {
    console.warn('Tesseract OCR error:', err);
    onStatusChange?.({
      status: 'ERROR',
      message: 'Could not read document. Enter details manually.',
    });
    return {
      success: false,
      message: 'Could not read document. You can fill details manually.',
    };
  } finally {
    if (worker) {
      try {
        await worker.terminate();
      } catch {
        // Ignore cleanup errors.
      }
    }
  }
}