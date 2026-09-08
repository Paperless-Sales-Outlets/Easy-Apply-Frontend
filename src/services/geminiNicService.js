// src/services/geminiNicService.js
// Cloud AI NIC OCR Service via Google Gemini Flash Vision API (Backend Proxy)
import api from '../utils/api';
import { parseSriLankanNIC } from '../utils/nicParser';

/**
 * Scans NIC card using Google Gemini Flash Vision AI through backend proxy endpoint.
 *
 * @param {Object} params
 * @param {string} params.nicFront - Base64 data URL of NIC front side
 * @param {string} [params.nicBack] - Base64 data URL of NIC back side
 * @param {Function} [params.onStatusChange] - Status callback for UI loading feedback
 * @returns {Promise<Object>} Normalized extracted details
 */
export async function scanNICGemini({ nicFront, nicBack, onStatusChange }) {
  if (!nicFront) {
    throw new Error('NIC Front image is required for scanning.');
  }

  if (onStatusChange) {
    onStatusChange({ status: 'SCANNING', message: 'Fetching your details (Gemini Cloud AI)...' });
  }

  try {
    const response = await api.post(
      '/nic/scan',
      { nicFront, nicBack },
      { timeout: 30000 } // 30-second timeout for large photo uploads
    );

    const result = response.data?.data || {};

    let nicNumber = (result.nicNumber || '').trim();
    let fullName = (result.fullName || '').trim();
    let address = (result.address || '').trim();
    let city = (result.city || '').trim();
    let district = (result.district || '').trim();
    let dob = (result.dob || '').trim();
    let gender = (result.gender || '').trim();

    // Two-time mathematical verification for DOB and Gender from NIC Number
    const mathematicalData = parseSriLankanNIC(nicNumber);
    if (mathematicalData && mathematicalData.isValid) {
      nicNumber = mathematicalData.nic;
      dob = mathematicalData.dob; // Always prioritize mathematical 100% accuracy
      gender = mathematicalData.gender;
    }

    const suggestedTitle = gender === 'Female' ? 'Ms.' : 'Mr.';

    if (onStatusChange) {
      onStatusChange({ status: 'SUCCESS', message: 'Details verified successfully.' });
    }

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
  } catch (err) {
    console.warn('Gemini Vision OCR error:', err.response?.data?.message || err.message);
    if (onStatusChange) {
      onStatusChange({ status: 'ERROR', message: 'Could not auto-extract details. Please enter manually.' });
    }
    return {
      success: false,
      message: err.response?.data?.message || 'Could not auto-extract details. You can enter them manually.',
    };
  }
}
