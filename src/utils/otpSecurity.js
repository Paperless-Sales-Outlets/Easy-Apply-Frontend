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
 * Saves OTP timer timestamps from backend response to localStorage for cross-refresh/tab persistence
 */
export function saveOtpTimers(phone, { expiresAt, resendAvailableAt, lockedUntil } = {}) {
  const cleanPhone = String(phone || '').replace(/\D/g, '').slice(-9);
  if (!cleanPhone) return;

  try {
    const existingRaw = localStorage.getItem(`${OTP_STORAGE_PREFIX}${cleanPhone}`);
    const existing = existingRaw ? JSON.parse(existingRaw) : {};

    const updated = {
      ...existing,
      ...(expiresAt !== undefined ? { expiresAt } : {}),
      ...(resendAvailableAt !== undefined ? { resendAvailableAt } : {}),
      ...(lockedUntil !== undefined ? { lockedUntil } : {}),
      updatedAt: Date.now(),
    };

    localStorage.setItem(`${OTP_STORAGE_PREFIX}${cleanPhone}`, JSON.stringify(updated));
  } catch (_) {}
}

/**
 * Retrieves remaining seconds and timestamps for a phone number from localStorage
 */
export function getOtpTimers(phone) {
  const cleanPhone = String(phone || '').replace(/\D/g, '').slice(-9);
  if (!cleanPhone) {
    return {
      expiresIn: 0,
      resendIn: 0,
      lockoutIn: 0,
      isExpired: true,
      isLocked: false,
      expiresAt: null,
      resendAvailableAt: null,
      lockedUntil: null,
    };
  }

  try {
    const raw = localStorage.getItem(`${OTP_STORAGE_PREFIX}${cleanPhone}`);
    if (!raw) {
      return {
        expiresIn: 0,
        resendIn: 0,
        lockoutIn: 0,
        isExpired: false,
        isLocked: false,
        expiresAt: null,
        resendAvailableAt: null,
        lockedUntil: null,
      };
    }

    const data = JSON.parse(raw);
    const now = Date.now();

    const expiresAtMs = data.expiresAt ? new Date(data.expiresAt).getTime() : 0;
    const resendAtMs = data.resendAvailableAt ? new Date(data.resendAvailableAt).getTime() : 0;
    const lockedUntilMs = data.lockedUntil ? new Date(data.lockedUntil).getTime() : 0;

    const expiresIn = expiresAtMs > now ? Math.ceil((expiresAtMs - now) / 1000) : 0;
    const resendIn = resendAtMs > now ? Math.ceil((resendAtMs - now) / 1000) : 0;
    const lockoutIn = lockedUntilMs > now ? Math.ceil((lockedUntilMs - now) / 1000) : 0;

    return {
      expiresIn,
      resendIn,
      lockoutIn,
      isExpired: expiresAtMs > 0 && now >= expiresAtMs,
      isLocked: lockoutIn > 0,
      expiresAt: data.expiresAt || null,
      resendAvailableAt: data.resendAvailableAt || null,
      lockedUntil: data.lockedUntil || null,
    };
  } catch (_) {
    return {
      expiresIn: 0,
      resendIn: 0,
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
export function clearOtpTimers(phone) {
  const cleanPhone = String(phone || '').replace(/\D/g, '').slice(-9);
  if (!cleanPhone) return;
  try {
    localStorage.removeItem(`${OTP_STORAGE_PREFIX}${cleanPhone}`);
  } catch (_) {}
}

/**
 * Calls backend to fetch authoritative OTP and lockout status
 */
export async function syncOtpStatus(phone) {
  const cleanPhone = String(phone || '').replace(/\D/g, '').slice(-9);
  if (!cleanPhone) return null;

  try {
    const res = await api.get(`/otp/status?phone=${cleanPhone}`);
    const data = res.data;
    if (data && data.success) {
      saveOtpTimers(cleanPhone, {
        expiresAt: data.expiresAt,
        resendAvailableAt: data.resendAvailableAt,
        lockedUntil: data.lockedUntil,
      });
      return data;
    }
  } catch (_) {}
  return null;
}
