import test from 'node:test';
import assert from 'node:assert/strict';
import {
  SESSION_INACTIVITY_TIMEOUT_MS,
  LAST_ACTIVITY_KEY,
  SESSION_EXPIRED_KEY,
  recordSessionActivity,
  getLastSessionActivity,
  getSessionInactivityRemainingMs,
  isSessionExpired,
  expireSessionDueToInactivity,
  saveSession,
  isAuthenticated,
} from '../authSession.js';

class MockStorage {
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

test('Session Inactivity Timeout (30 minutes)', async (t) => {
  const originalLocalStorage = globalThis.localStorage;
  const originalSessionStorage = globalThis.sessionStorage;
  const originalWindow = globalThis.window;

  globalThis.localStorage = new MockStorage();
  globalThis.sessionStorage = new MockStorage();
  globalThis.window = {
    dispatchEvent: () => {},
  };

  t.after(() => {
    globalThis.localStorage = originalLocalStorage;
    globalThis.sessionStorage = originalSessionStorage;
    globalThis.window = originalWindow;
  });

  await t.test('inactivity timeout constant is exactly 30 minutes (1,800,000 ms)', () => {
    assert.equal(SESSION_INACTIVITY_TIMEOUT_MS, 30 * 60 * 1000);
    assert.equal(SESSION_INACTIVITY_TIMEOUT_MS, 1800000);
  });

  await t.test('recordSessionActivity writes current timestamp to storage', () => {
    const before = Date.now();
    recordSessionActivity();
    const recorded = getLastSessionActivity();
    const after = Date.now();

    assert.ok(recorded >= before && recorded <= after);
  });

  await t.test('isSessionExpired returns false for active session within 30 minutes', () => {
    globalThis.localStorage.setItem('verifiedPhone', '0771234567');
    // Active 10 minutes ago
    globalThis.localStorage.setItem(LAST_ACTIVITY_KEY, String(Date.now() - 10 * 60 * 1000));

    assert.equal(isSessionExpired(), false);
    const remaining = getSessionInactivityRemainingMs();
    assert.ok(remaining > 19 * 60 * 1000 && remaining <= 20 * 60 * 1000);
  });

  await t.test('isSessionExpired returns true when inactive for 30 consecutive minutes', () => {
    globalThis.localStorage.setItem('verifiedPhone', '0771234567');
    // Inactive for 30 minutes + 1 second
    globalThis.localStorage.setItem(LAST_ACTIVITY_KEY, String(Date.now() - (30 * 60 * 1000 + 1000)));

    assert.equal(isSessionExpired(), true);
    assert.equal(getSessionInactivityRemainingMs(), 0);
  });

  await t.test('expireSessionDueToInactivity sets message and clears auth', () => {
    saveSession({
      phone: '0771234567',
      customer: { name: 'Test User' },
    });
    assert.equal(globalThis.localStorage.getItem('verifiedPhone'), '0771234567');

    expireSessionDueToInactivity();

    assert.equal(globalThis.localStorage.getItem('verifiedPhone'), null);
    assert.equal(
      globalThis.sessionStorage.getItem(SESSION_EXPIRED_KEY),
      'Your session has expired due to inactivity. Please log in again.'
    );
  });
});
