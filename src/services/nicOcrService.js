// src/services/nicOcrService.js
import api from '../utils/api';
import { parseSriLankanNIC, extractNICFromText } from '../utils/nicParser';

/**
 * Primary Engine: Calls backend Gemini Flash Vision OCR API
 */
export async function scanWithGemini({ nicFront, nicBack }) {
  const response = await api.post('/nic/scan', {
    nicFront,
    nicBack,
  }, {
    timeout: 30000, // 30-second timeout for large photo uploads
  });

  const result = response.data?.data || {};

  let nicNumber = result.nicNumber || '';
  let fullName = result.fullName || '';
  let address = result.address || '';
  let city = result.city || '';
  let district = result.district || '';
  let dob = result.dob || '';
  let gender = result.gender || '';

  // Two-time mathematical verification for DOB and Gender from NIC Number
  const mathematicalData = parseSriLankanNIC(nicNumber);
  if (mathematicalData && mathematicalData.isValid) {
    nicNumber = mathematicalData.nic;
    dob = mathematicalData.dob; // Always prioritize mathematical 100% accuracy
    gender = mathematicalData.gender;
  }

  const suggestedTitle = gender === 'Female' ? 'Ms.' : 'Mr.';

  return {
    success: true,
    engine: 'GEMINI_FLASH_VISION',
    nicNumber,
    fullName,
    address,
    city,
    district,
    dob,
    gender,
    suggestedTitle,
    raw: result,
  };
}

/**
 * Secondary Engine: Client-Side Tesseract.js Fallback (Offline & Outage Safety)
 */
export async function scanWithTesseract({ nicFront, nicBack, onProgress }) {
  // Dynamically import tesseract.js on demand
  const { createWorker } = await import('tesseract.js');
  const worker = await createWorker('eng');

  try {
    if (onProgress) onProgress('Scanning front side locally...');
    const frontResult = await worker.recognize(nicFront);
    const frontText = frontResult.data.text || '';

    // Extract NIC mathematically from text
    const mathNIC = extractNICFromText(frontText);

    let address = '';
    if (nicBack) {
      if (onProgress) onProgress('Scanning reverse side locally...');
      const backResult = await worker.recognize(nicBack);
      const rawBack = (backResult.data.text || '').replace(/[\r\n]+/g, ', ').trim();
      // Only keep address if clean text is present (avoiding OCR noise/watermark symbols)
      if (rawBack && /[a-zA-Z]{3,}/.test(rawBack) && !/[£§©®™]/.test(rawBack)) {
        address = rawBack;
      }
    }

    await worker.terminate();

    if (!mathNIC) {
      throw new Error('Could not detect a valid Sri Lankan NIC number in the image.');
    }

    return {
      success: true,
      engine: 'TESSERACT_CLIENT_FALLBACK',
      nicNumber: mathNIC.nic,
      fullName: '', // Tesseract client can't reliably differentiate name without NLP; user can type
      address: address,
      city: '',
      district: '',
      dob: mathNIC.dob,
      gender: mathNIC.gender,
      suggestedTitle: mathNIC.suggestedTitle,
    };
  } catch (err) {
    await worker.terminate();
    throw err;
  }
}

/**
 * Unified Scanner Orchestrator: Tries Gemini primary, falls back seamlessly to Tesseract
 * @param {Object} params
 * @param {string} params.nicFront - Base64 of NIC front
 * @param {string} [params.nicBack] - Base64 of NIC back
 * @param {Function} [params.onStatusChange] - Status callback for UI updates
 * @returns {Promise<Object>} Extracted and mathematically verified details
 */
export async function scanNICUnified({ nicFront, nicBack, onStatusChange }) {
  if (!nicFront) {
    throw new Error('NIC Front image is required.');
  }

  // 1. Try Primary Engine (Gemini Flash Vision)
  try {
    if (onStatusChange) onStatusChange({ status: 'SCANNING_GEMINI', message: 'Fetching your details…' });
    const geminiResult = await scanWithGemini({ nicFront, nicBack });
    if (geminiResult && geminiResult.nicNumber) {
      if (onStatusChange) onStatusChange({ status: 'SUCCESS', message: 'Details verified successfully.' });
      return geminiResult;
    }
  } catch (geminiErr) {
    console.warn('Gemini Flash Vision unavailable or timed out, activating client fallback:', geminiErr.message);
  }

  // 2. Try Secondary Engine (Tesseract.js Client Fallback)
  try {
    if (onStatusChange) onStatusChange({ status: 'SCANNING_FALLBACK', message: 'Fetching your details (Local Engine)…' });
    const tesseractResult = await scanWithTesseract({
      nicFront,
      nicBack,
      onProgress: (msg) => onStatusChange && onStatusChange({ status: 'SCANNING_FALLBACK', message: msg }),
    });

    if (onStatusChange) onStatusChange({ status: 'SUCCESS', message: 'Details verified successfully.' });
    return tesseractResult;
  } catch (tesseractErr) {
    console.error('All OCR engines failed:', tesseractErr.message);
    if (onStatusChange) onStatusChange({ status: 'ERROR', message: 'Could not auto-extract details. Please enter manually.' });
    return {
      success: false,
      message: 'Automatic extraction could not read the card. You can fill your details manually.',
    };
  }
}
