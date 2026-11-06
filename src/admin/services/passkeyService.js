import api from '../../shared/utils/api.js';

/**
 * Check if the current browser and platform support WebAuthn / Passkeys.
 */
export const isPasskeySupported = () => {
  return typeof window !== 'undefined' &&
    window.PublicKeyCredential !== undefined &&
    typeof window.PublicKeyCredential === 'function';
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

// ---------------------------------------------------------------------------
// Helpers for native WebAuthn base64url <-> ArrayBuffer conversions
// ---------------------------------------------------------------------------
function base64urlToBuffer(base64url) {
  if (!base64url || typeof base64url !== 'string') return new Uint8Array(0).buffer;
  const padding = '='.repeat((4 - (base64url.length % 4)) % 4);
  const base64 = (base64url + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const output = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    output[i] = rawData.charCodeAt(i);
  }
  return output.buffer;
}

function bufferToBase64url(buffer) {
  if (!buffer) return '';
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

/**
 * Native browser WebAuthn authentication ceremony
 */
async function nativeStartAuthentication(options) {
  const publicKey = {
    ...options,
    challenge: base64urlToBuffer(options.challenge),
  };

  if (Array.isArray(options.allowCredentials)) {
    publicKey.allowCredentials = options.allowCredentials.map((cred) => ({
      ...cred,
      id: base64urlToBuffer(cred.id),
    }));
  }

  const credential = await navigator.credentials.get({ publicKey });
  if (!credential) {
    throw new Error('No passkey credential returned by browser.');
  }

  return {
    id: credential.id,
    rawId: bufferToBase64url(credential.rawId),
    type: credential.type,
    response: {
      authenticatorData: bufferToBase64url(credential.response.authenticatorData),
      clientDataJSON: bufferToBase64url(credential.response.clientDataJSON),
      signature: bufferToBase64url(credential.response.signature),
      userHandle: credential.response.userHandle ? bufferToBase64url(credential.response.userHandle) : null,
    },
  };
}

/**
 * Native browser WebAuthn registration ceremony
 */
async function nativeStartRegistration(options) {
  const publicKey = {
    ...options,
    challenge: base64urlToBuffer(options.challenge),
    user: {
      ...options.user,
      id: base64urlToBuffer(options.user.id),
    },
  };

  if (Array.isArray(options.excludeCredentials)) {
    publicKey.excludeCredentials = options.excludeCredentials.map((cred) => ({
      ...cred,
      id: base64urlToBuffer(cred.id),
    }));
  }

  const credential = await navigator.credentials.create({ publicKey });
  if (!credential) {
    throw new Error('Failed to create passkey credential on device.');
  }

  return {
    id: credential.id,
    rawId: bufferToBase64url(credential.rawId),
    type: credential.type,
    response: {
      attestationObject: bufferToBase64url(credential.response.attestationObject),
      clientDataJSON: bufferToBase64url(credential.response.clientDataJSON),
    },
  };
}

/**
 * Helper to dynamically load @simplewebauthn/browser if available,
 * falling back to native browser WebAuthn implementation seamlessly.
 */
async function performAuthentication(options) {
  try {
    const pkg = await import(/* @vite-ignore */ '@simplewebauthn/browser');
    if (pkg && pkg.startAuthentication) {
      return await pkg.startAuthentication({ optionsJSON: options });
    }
  } catch {
    // Package not installed, use robust native WebAuthn fallback
  }
  return await nativeStartAuthentication(options);
}

async function performRegistration(options) {
  try {
    const pkg = await import(/* @vite-ignore */ '@simplewebauthn/browser');
    if (pkg && pkg.startRegistration) {
      return await pkg.startRegistration({ optionsJSON: options });
    }
  } catch {
    // Package not installed, use robust native WebAuthn fallback
  }
  return await nativeStartRegistration(options);
}

/**
 * Execute Passkey Login ceremony.
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
    authResponse = await performAuthentication(options);
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
    regResponse = await performRegistration(options);
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
