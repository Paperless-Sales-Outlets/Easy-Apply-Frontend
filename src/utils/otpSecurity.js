import api from './api.js';

export const OTP_STORAGE_PREFIX = 'easyapply:otp_state_';

/**
 * Formats a number of seconds into MM:SS string (e.g. 300 -> '05:00', 59 -> '00:59', 899 -> '14:59')
 */
export function formatTimer(seconds) {
  const total = Math.max(0, Math.floor(Number(seconds) || 0));
  const mins = Math.floor(total / 60);
  const secs = total % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

/**
 * Normalizes an OTP target: lowercase trimmed string for email, 9 digits for phone
 */
export function normalizeOtpTarget(target) {
  const str = String(target || '').trim();
  if (str.includes('@')) {
    return str.toLowerCase();
  }
  return str.replace(/\D/g, '').slice(-9);
}

const getStorage = () => {
  try {
    if (typeof window !== 'undefined' && window.localStorage) return window.localStorage;
    if (typeof globalThis !== 'undefined' && globalThis.localStorage) return globalThis.localStorage;
    if (typeof localStorage !== 'undefined') return localStorage;
  } catch (_) {}
  return null;
};

/**
 * Saves OTP timer timestamps from backend response to localStorage for cross-refresh/tab persistence
 */
export function saveOtpTimers(target, { expiresAt, resendAvailableAt, lockedUntil } = {}) {
  const cleanTarget = normalizeOtpTarget(target);
  if (!cleanTarget) return;

  try {
    const storage = getStorage();
    if (!storage) return;

    const existingRaw = storage.getItem(`${OTP_STORAGE_PREFIX}${cleanTarget}`);
    const existing = existingRaw ? JSON.parse(existingRaw) : {};

    const updated = {
      ...existing,
      ...(expiresAt !== undefined ? { expiresAt } : {}),
      ...(resendAvailableAt !== undefined ? { resendAvailableAt } : {}),
      ...(lockedUntil !== undefined ? { lockedUntil } : {}),
      updatedAt: Date.now(),
    };

    storage.setItem(`${OTP_STORAGE_PREFIX}${cleanTarget}`, JSON.stringify(updated));
  } catch (_) {}
}

/**
 * Retrieves remaining seconds and timestamps for a phone number or email from localStorage
 */
export function getOtpTimers(target) {
  const cleanTarget = normalizeOtpTarget(target);
  if (!cleanTarget) {
    return {
      expiresIn: 0,
      resendIn: 0,
      lockoutIn: 0,
      isExpired: true,
      isLocked: false,
      canResend: true,
      expiresAt: null,
      resendAvailableAt: null,
      lockedUntil: null,
    };
  }

  try {
    const storage = getStorage();
    if (!storage) {
      return {
        expiresIn: 0,
        resendIn: 0,
        lockoutIn: 0,
        isExpired: false,
        isLocked: false,
        canResend: true,
        expiresAt: null,
        resendAvailableAt: null,
        lockedUntil: null,
      };
    }

    const raw = storage.getItem(`${OTP_STORAGE_PREFIX}${cleanTarget}`);
    if (!raw) {
      return {
        expiresIn: 0,
        resendIn: 0,
        lockoutIn: 0,
        isExpired: false,
        isLocked: false,
        canResend: true,
        expiresAt: null,
        resendAvailableAt: null,
        lockedUntil: null,
      };
    }

    const data = JSON.parse(raw);
    const now = Date.now();

    const expiresAtMs = data.expiresAt ? new Date(data.expiresAt).getTime() : 0;
    const lockedUntilMs = data.lockedUntil ? new Date(data.lockedUntil).getTime() : 0;

    const expiresIn = expiresAtMs > now ? Math.ceil((expiresAtMs - now) / 1000) : 0;
    const isExpired = expiresAtMs > 0 && now >= expiresAtMs;
    const lockoutIn = lockedUntilMs > now ? Math.ceil((lockedUntilMs - now) / 1000) : 0;
    const isLocked = lockoutIn > 0;

    // Resend rules:
    // - While OTP is valid (expiresIn > 0): Resend is blocked.
    // - Immediately after expiration (now >= expiresAtMs): Resend is enabled immediately (no 60s cooldown).
    // - Target must not be locked out.
    const canResend = !isLocked && (isExpired || expiresAtMs === 0);

    return {
      expiresIn,
      resendIn: 0, // Obsolete 60s cooldown eliminated completely
      canResend,
      lockoutIn,
      isExpired,
      isLocked,
      expiresAt: data.expiresAt || null,
      resendAvailableAt: data.expiresAt || null,
      lockedUntil: data.lockedUntil || null,
    };
  } catch (_) {
    return {
      expiresIn: 0,
      resendIn: 0,
      canResend: true,
      lockoutIn: 0,
      isExpired: false,
      isLocked: false,
      expiresAt: null,
      resendAvailableAt: null,
      lockedUntil: null,
    };
  }
}

/**
 * Clears stored OTP timestamps upon successful verification
 */
export function clearOtpTimers(target) {
  const cleanTarget = normalizeOtpTarget(target);
  if (!cleanTarget) return;
  try {
    const storage = getStorage();
    if (storage) storage.removeItem(`${OTP_STORAGE_PREFIX}${cleanTarget}`);
  } catch (_) {}
}

/**
 * Calls backend to fetch authoritative OTP and lockout status (phone or email)
 */
export async function syncOtpStatus(target) {
  const cleanTarget = normalizeOtpTarget(target);
  if (!cleanTarget) return null;

  try {
    const isMail = cleanTarget.includes('@');
    const endpoint = isMail
      ? `/otp/status-email?email=${encodeURIComponent(cleanTarget)}`
      : `/otp/status?phone=${encodeURIComponent(cleanTarget)}`;
    const res = await api.get(endpoint);
    const data = res.data;
    if (data && data.success) {
      saveOtpTimers(cleanTarget, {
        expiresAt: data.expiresAt,
        resendAvailableAt: data.resendAvailableAt,
        lockedUntil: data.lockedUntil,
      });
      return data;
    }
  } catch (_) {}
  return null;
}
