import test from 'node:test';
import assert from 'node:assert/strict';
import {
  formatTimer,
  normalizeOtpTarget,
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

  await t.test('formats 1 second as 00:01', () => {
    assert.equal(formatTimer(1), '00:01');
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

  await t.test('saves and retrieves accurate 5-minute countdown seconds; resend is blocked while valid', () => {
    const phone = '0771234567';
    const now = Date.now();
    const expiresAt = new Date(now + 300 * 1000).toISOString();
    const resendAvailableAt = expiresAt;

    saveOtpTimers(phone, { expiresAt, resendAvailableAt });

    const timers = getOtpTimers(phone);
    assert.ok(timers.expiresIn >= 298 && timers.expiresIn <= 300);
    assert.equal(timers.isExpired, false);
    assert.equal(timers.canResend, false, 'Resend is blocked while OTP is valid');
    assert.equal(timers.resendIn, 0, 'No additional cooldown countdown');
    assert.equal(timers.isLocked, false);
  });

  await t.test('reports isExpired=true and enables immediate resend with NO 60s cooldown', () => {
    const phone = '0771234567';
    const now = Date.now();
    // OTP expired 10 seconds ago
    const pastExpiresAt = new Date(now - 10 * 1000).toISOString();

    saveOtpTimers(phone, { expiresAt: pastExpiresAt, resendAvailableAt: pastExpiresAt });

    const timers = getOtpTimers(phone);
    assert.equal(timers.expiresIn, 0);
    assert.equal(timers.isExpired, true);
    assert.equal(timers.canResend, true, 'Resend is immediately enabled upon expiry');
    assert.equal(timers.resendIn, 0, 'No 60-second cooldown period');
  });

  await t.test('simulating page reload calculates timers from server timestamps without resetting to 05:00', () => {
    const phone = '0771234567';
    const t0 = Date.now();
    const expiresAt = new Date(t0 + 300 * 1000).toISOString();

    // Step 1: Initial OTP issue
    saveOtpTimers(phone, { expiresAt, resendAvailableAt: expiresAt });
    const initialTimers = getOtpTimers(phone);
    assert.equal(initialTimers.isExpired, false);
    assert.ok(initialTimers.expiresIn >= 298 && initialTimers.expiresIn <= 300);
    assert.equal(initialTimers.canResend, false);

    // Step 2: Simulate page reload 180 seconds later (2 minutes left of 5 minutes)
    const simulatedNow = t0 + 180 * 1000;
    const originalDateNow = Date.now;
    Date.now = () => simulatedNow;
    try {
      const reloadedTimers = getOtpTimers(phone);
      assert.equal(reloadedTimers.isExpired, false, 'Still within first 5 minutes');
      assert.ok(reloadedTimers.expiresIn >= 118 && reloadedTimers.expiresIn <= 120,
        `expiresIn should be ~120s after 180s elapsed (got ${reloadedTimers.expiresIn})`);
      assert.equal(reloadedTimers.canResend, false, 'Resend still blocked during 5-minute validity');

      // Step 3: Simulate page reload 305 seconds later (5 seconds after OTP expired)
      Date.now = () => t0 + 305 * 1000;
      const expiredReloaded = getOtpTimers(phone);
      assert.equal(expiredReloaded.isExpired, true, 'OTP has expired after 305s');
      assert.equal(expiredReloaded.expiresIn, 0);
      assert.equal(expiredReloaded.canResend, true, 'Resend is immediately available upon reload after expiry');
      assert.equal(expiredReloaded.resendIn, 0, 'No 60-second waiting period');
    } finally {
      Date.now = originalDateNow;
    }
  });

  await t.test('saves and reports active lockout state', () => {
    const phone = '0771234567';
    const now = Date.now();
    const lockedUntil = new Date(now + 15 * 60 * 1000).toISOString();

    saveOtpTimers(phone, { lockedUntil });

    const timers = getOtpTimers(phone);
    assert.equal(timers.isLocked, true);
    assert.equal(timers.canResend, false, 'Cannot resend while locked out');
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

test('normalizeOtpTarget', async (t) => {
  await t.test('normalizes phone numbers to standard 9 digits', () => {
    assert.equal(normalizeOtpTarget('0771234567'), '771234567');
    assert.equal(normalizeOtpTarget('+94 77 123 4567'), '771234567');
    assert.equal(normalizeOtpTarget('771234567'), '771234567');
  });

  await t.test('normalizes email addresses to lower-case trimmed string', () => {
    assert.equal(normalizeOtpTarget('User@Example.Com '), 'user@example.com');
    assert.equal(normalizeOtpTarget('  TEST.CUSTOMER@SLT.LK  '), 'test.customer@slt.lk');
  });
});

test('Email OTP Security: saveOtpTimers, getOtpTimers and clearOtpTimers with email target (Identical to Mobile)', async (t) => {
  const originalLocalStorage = globalThis.localStorage;
  globalThis.localStorage = new MockLocalStorage();

  t.after(() => {
    globalThis.localStorage = originalLocalStorage;
  });

  const email = 'customer.verify@slt.lk';

  await t.test('saves and retrieves accurate 5-minute countdown for email; resend is blocked while valid', () => {
    const now = Date.now();
    const expiresAt = new Date(now + 300 * 1000).toISOString();

    saveOtpTimers(email, { expiresAt, resendAvailableAt: expiresAt });

    const timers = getOtpTimers(email);
    assert.ok(timers.expiresIn >= 298 && timers.expiresIn <= 300);
    assert.equal(timers.isExpired, false);
    assert.equal(timers.canResend, false, 'Resend blocked while Email OTP is valid');
    assert.equal(timers.resendIn, 0);
    assert.equal(timers.isLocked, false);
  });

  await t.test('reports isExpired=true and enables immediate resend for email with NO 60s cooldown', () => {
    const now = Date.now();
    // Email OTP expired 10 seconds ago
    const pastExpiresAt = new Date(now - 10 * 1000).toISOString();

    saveOtpTimers(email, { expiresAt: pastExpiresAt, resendAvailableAt: pastExpiresAt });

    const timers = getOtpTimers(email);
    assert.equal(timers.expiresIn, 0);
    assert.equal(timers.isExpired, true);
    assert.equal(timers.canResend, true, 'Email resend is immediately enabled upon expiry');
    assert.equal(timers.resendIn, 0, 'No 60-second waiting period for email');
  });

  await t.test('saves and reports 15-minute lockout state for email target', () => {
    const now = Date.now();
    const lockedUntil = new Date(now + 15 * 60 * 1000).toISOString();

    saveOtpTimers(email, { lockedUntil });

    const timers = getOtpTimers(email);
    assert.equal(timers.isLocked, true);
    assert.equal(timers.canResend, false);
    assert.ok(timers.lockoutIn >= 898 && timers.lockoutIn <= 900);
  });

  await t.test('clears email OTP state on demand', () => {
    clearOtpTimers(email);
    const timers = getOtpTimers(email);
    assert.equal(timers.isLocked, false);
    assert.equal(timers.expiresIn, 0);
  });
});
