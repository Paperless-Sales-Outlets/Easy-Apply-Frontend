import test from 'node:test';
import assert from 'node:assert/strict';
import {
  formatTimer,
  saveOtpTimers,
  getOtpTimers,
  clearOtpTimers,
  OTP_STORAGE_PREFIX,
} from '../otpSecurity.js';

// Setup minimal localStorage mock for Node test environment
class MockLocalStorage {
  constructor() {
    this.store = new Map();
  }
  getItem(key) {
    return this.store.has(key) ? this.store.get(key) : null;
  }
  setItem(key, value) {
    this.store.set(key, String(value));
  }
  removeItem(key) {
    this.store.delete(key);
  }
  clear() {
    this.store.clear();
  }
}

test('formatTimer', async (t) => {
  await t.test('formats 5 minutes as 05:00', () => {
    assert.equal(formatTimer(300), '05:00');
  });

  await t.test('formats 4 minutes 59 seconds as 04:59', () => {
    assert.equal(formatTimer(299), '04:59');
  });

  await t.test('formats 59 seconds as 00:59', () => {
    assert.equal(formatTimer(59), '00:59');
  });

  await t.test('formats 0 seconds as 00:00', () => {
    assert.equal(formatTimer(0), '00:00');
  });

  await t.test('formats negative numbers safely as 00:00', () => {
    assert.equal(formatTimer(-10), '00:00');
  });

  await t.test('formats 14 minutes 59 seconds as 14:59 (for 15-minute lockout display)', () => {
    assert.equal(formatTimer(899), '14:59');
  });

  await t.test('formats 15 minutes as 15:00', () => {
    assert.equal(formatTimer(900), '15:00');
  });

  await t.test('handles non-numeric or null input gracefully as 00:00', () => {
    assert.equal(formatTimer(null), '00:00');
    assert.equal(formatTimer(undefined), '00:00');
    assert.equal(formatTimer('abc'), '00:00');
  });
});

test('saveOtpTimers, getOtpTimers and clearOtpTimers', async (t) => {
  const originalLocalStorage = globalThis.localStorage;
  globalThis.localStorage = new MockLocalStorage();

  t.after(() => {
    globalThis.localStorage = originalLocalStorage;
  });

  await t.test('saves and retrieves accurate remaining countdown seconds', () => {
    const phone = '0771234567';
    const now = Date.now();
    const expiresAt = new Date(now + 300 * 1000).toISOString();
    const resendAvailableAt = new Date(now + 60 * 1000).toISOString();

    saveOtpTimers(phone, { expiresAt, resendAvailableAt });

    const timers = getOtpTimers(phone);
    assert.ok(timers.expiresIn >= 298 && timers.expiresIn <= 300);
    assert.ok(timers.resendIn >= 58 && timers.resendIn <= 60);
    assert.equal(timers.isExpired, false);
    assert.equal(timers.isLocked, false);
  });

  await t.test('reports isExpired=true when expiresAt is in the past', () => {
    const phone = '0771234567';
    const now = Date.now();
    const pastExpiresAt = new Date(now - 10 * 1000).toISOString();

    saveOtpTimers(phone, { expiresAt: pastExpiresAt });

    const timers = getOtpTimers(phone);
    assert.equal(timers.expiresIn, 0);
    assert.equal(timers.isExpired, true);
  });

  await t.test('saves and reports active lockout state', () => {
    const phone = '0771234567';
    const now = Date.now();
    const lockedUntil = new Date(now + 15 * 60 * 1000).toISOString();

    saveOtpTimers(phone, { lockedUntil });

    const timers = getOtpTimers(phone);
    assert.equal(timers.isLocked, true);
    assert.ok(timers.lockoutIn >= 898 && timers.lockoutIn <= 900);
  });

  await t.test('clears OTP state on demand', () => {
    const phone = '0771234567';
    clearOtpTimers(phone);
    const timers = getOtpTimers(phone);
    assert.equal(timers.isLocked, false);
    assert.equal(timers.expiresIn, 0);
  });
});
