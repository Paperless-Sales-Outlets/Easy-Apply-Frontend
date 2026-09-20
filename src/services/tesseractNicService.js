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
 * Human-readable labels for the phases Tesseract reports. Anything not listed
 * is internal chatter and is not worth showing.
 */
const PROGRESS_LABELS = {
  'loading tesseract core': 'Starting the scanner\u2026',
  'initializing tesseract': 'Starting the scanner\u2026',
  'loading language traineddata': 'Loading the text model \u2014 slower the first time\u2026',
  'loaded language traineddata': 'Text model ready\u2026',
  'initializing api': 'Preparing to read your card\u2026',
  'recognizing text': 'Reading your card\u2026',
};

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
  // tesseract.js is not installed - return error to allow app to run
  console.error('tesseract.js is not installed. Run: npm install tesseract.js to enable OCR scanning.');
  if (onStatusChange) {
    onStatusChange({ status: 'ERROR', message: 'OCR library not available. Please enter details manually.' });
  }
  return {
    success: false,
    message: 'OCR library not installed. Please enter your details manually.',
  };
}
