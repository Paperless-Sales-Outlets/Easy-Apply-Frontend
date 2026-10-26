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

/**
 * Preprocess an image with the browser canvas to improve OCR readability.
 * If preprocessing is unavailable, use the original image.
 */
function preprocessImageForOCR(base64Image) {
  return new Promise((resolve) => {
    if (
      !base64Image ||
      typeof base64Image !== 'string' ||
      !base64Image.startsWith('data:image')
    ) {
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

        if ('filter' in ctx) {
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
 * Scan NIC images locally using a Tesseract.js browser worker.
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

    const combinedText = `${frontText}\n${backText}`;
    const nicResult =
      extractNICFromText(frontText, { expectedNIC }) ||
      extractNICFromText(backText, { expectedNIC }) ||
      extractNICFromText(combinedText, { expectedNIC });

    const nicNumber = nicResult?.nic ? cleanNIC(nicResult.nic) : '';
    const fullName =
      extractFullNameFromOCR(frontText) ||
      extractFullNameFromOCR(combinedText) ||
      '';
    const address =
      extractAddressFromOCR(backText) ||
      extractAddressFromOCR(combinedText) ||
      '';

    if (!nicNumber && !fullName && !address) {
      onStatusChange?.({
        status: 'ERROR',
        message: 'Could not auto-detect text. You can enter details manually.',
      });
      return {
        success: false,
        message: 'Could not auto-read card details clearly. Please check or enter details below.',
      };
    }

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

    const missingFields = [];
    if (!nicNumber) missingFields.push('nicNumber');
    if (!fullName) missingFields.push('fullName');
    if (!address) missingFields.push('address');

    const extractionStatus = !nicNumber
      ? 'FAILED'
      : missingFields.length > 0
        ? 'PARTIAL'
        : 'COMPLETE';
    const isPartial = missingFields.length > 0;
    const manualReviewRequired = extractionStatus !== 'COMPLETE';

    const exceptionFlags = [];
    if (isPartial) exceptionFlags.push('PARTIAL_DATA_FETCHED');
    if (!nicNumber) exceptionFlags.push('NIC_NUMBER_MISSING_IN_OCR');
    if (!fullName) exceptionFlags.push('NAME_MISSING_IN_OCR');
    if (!address) exceptionFlags.push('ADDRESS_MISSING_IN_OCR');

    onStatusChange?.({
      status: 'SUCCESS',
      message: manualReviewRequired
        ? 'Some NIC details were extracted. Please review the missing information.'
        : 'NIC details extracted successfully!',
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
      dob: derivedInfo?.dob || nicResult?.dob || '',
      gender: gender || '',
      suggestedTitle:
        gender === 'Female' ? 'Ms.' : gender === 'Male' ? 'Mr.' : (nicResult?.suggestedTitle || ''),
      warnings: Array.isArray(nicResult?.warnings) ? nicResult.warnings : [],
      extractionStatus,
      isPartial,
      missingFields,
      exceptionFlags,
      manualReviewRequired,
      reviewReason: manualReviewRequired
        ? 'Auto KYC incomplete: one or more identity fields could not be extracted from the document.'
        : null,
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