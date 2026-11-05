import {
  startAuthentication,
  startRegistration,
  browserSupportsWebAuthn,
} from '@simplewebauthn/browser';
import api from '../../../utils/api.js';

/**
 * Check if the current browser and platform support WebAuthn / Passkeys.
 */
export const isPasskeySupported = () => {
  return browserSupportsWebAuthn();
};

/**
 * Friendly error parser for WebAuthn browser ceremonies.
 */
export const formatPasskeyError = (err) => {
  if (!err) return 'An unknown passkey error occurred.';
  if (err.name === 'NotAllowedError') {
    return 'Passkey prompt was cancelled, timed out, or not permitted by device.';
  }
  if (err.name === 'InvalidStateError') {
    return 'This passkey / device has already been registered for this account.';
  }
  if (err.name === 'NotSupportedError') {
    return 'Passkey authentication is not supported by your browser or operating system.';
  }
  if (err.name === 'SecurityError') {
    return 'Security error: The current origin or domain does not permit passkey operations.';
  }
  if (err.response?.data?.message) {
    return err.response.data.message;
  }
  return err.message || 'Passkey operation failed. Please try again.';
};

/**
 * Execute Passkey Login ceremony.
 * 1. Request authentication options from backend.
 * 2. Invoke browser/device passkey authenticator (Windows Hello, Touch ID, PIN, etc.).
 * 3. Send response to backend for cryptographic verification.
 * 4. Return authenticated user session tokens.
 */
export const loginWithPasskey = async (email = '') => {
  if (!isPasskeySupported()) {
    throw new Error('Your browser does not support passkey authentication.');
  }

  // 1. Fetch challenge and options from backend
  const optionsPayload = email && typeof email === 'string' && email.trim()
    ? { email: email.trim().toLowerCase() }
    : {};

  const optionsRes = await api.post('/auth/passkey/login-options', optionsPayload);
  const { options, challengeId } = optionsRes.data;

  if (!options || !challengeId) {
    throw new Error('Failed to retrieve passkey authentication options from server.');
  }

  // 2. Invoke device passkey prompt
  let authResponse;
  try {
    authResponse = await startAuthentication({ optionsJSON: options });
  } catch (ceremonyErr) {
    throw new Error(formatPasskeyError(ceremonyErr));
  }

  // 3. Verify assertion with backend
  const verifyRes = await api.post('/auth/passkey/login-verify', {
    response: authResponse,
    challengeId,
  });

  return verifyRes.data;
};

/**
 * Execute Passkey Registration ceremony for an authenticated administrator.
 */
export const registerPasskey = async (deviceName = '') => {
  if (!isPasskeySupported()) {
    throw new Error('Your browser does not support passkey authentication.');
  }

  // 1. Fetch registration challenge and options
  const optionsRes = await api.get('/auth/passkey/registration-options');
  const { options, challengeId } = optionsRes.data;

  if (!options || !challengeId) {
    throw new Error('Failed to retrieve passkey registration options.');
  }

  // 2. Invoke device passkey registration prompt
  let regResponse;
  try {
    regResponse = await startRegistration({ optionsJSON: options });
  } catch (ceremonyErr) {
    throw new Error(formatPasskeyError(ceremonyErr));
  }

  // 3. Send to backend for verification and persistence
  const verifyRes = await api.post('/auth/passkey/verify-registration', {
    response: regResponse,
    challengeId,
    deviceName: deviceName || 'Device Passkey',
  });

  return verifyRes.data;
};

/**
 * List all passkeys registered by the authenticated administrator.
 */
export const listPasskeys = async () => {
  const res = await api.get('/auth/passkey/list');
  return res.data?.passkeys || [];
};

/**
 * Delete a passkey by ID.
 */
export const deletePasskey = async (passkeyId) => {
  const res = await api.delete(`/auth/passkey/${passkeyId}`);
  return res.data;
};
