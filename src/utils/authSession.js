// Tracks the logged-in customer session shared across the app. A customer signs
// in once (email + password, or phone + OTP) on the auth screen; every page
// after that reads the session from here instead of asking for a phone number
// and OTP again.
export const AUTH_UPDATED_EVENT = 'easyapply:auth-updated';
export const SESSION_INACTIVITY_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes of inactivity
export const LAST_ACTIVITY_KEY = 'easyapply:last_activity';
export const SESSION_EXPIRED_KEY = 'easyapply:session_expired_message';

// Everything a signed-in customer leaves behind in this browser. On a shared
// teleshop terminal the next customer must not inherit any of it — that
// includes the shopping cart and the cart's server-side session id, not just
// the identity keys.
const SESSION_KEYS = [
  // Identity / session
  'verifiedPhone',
  'customerExists',
  'accountsList',
  'selectedAccount',
  'customerData',
  'authCustomer',
  'authUser',
  'accessToken',
  'refreshToken',
  LAST_ACTIVITY_KEY,
  // Cart — 'slt_session_id' ties this browser to a cart document in MongoDB,
  // so leaving it behind would hand the next customer the previous basket.
  'easy_apply_cart',
  'slt_session_id',
  'selectedProduct',
  // Left over from an abandoned sign-up
  'signupPhone',
];

const SESSION_STORAGE_KEYS = ['selectedProduct'];

export function getVerifiedPhone() {
  return localStorage.getItem('verifiedPhone') || '';
}

export const readJson = (key) => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch (err) {
    return null;
  }
};

export function getAuthCustomer() {
  return readJson('authCustomer') || readJson('authUser');
}

export function getAuthUser() {
  return getAuthCustomer();
}

export function getVerifiedName() {
  const account = readJson('customerData');
  if (account) {
    const name = account.fullName || account.customerName || account.nameFull || '';
    if (name) return name;
  }
  return getAuthCustomer()?.name || '';
}

export function recordSessionActivity() {
  try {
    localStorage.setItem(LAST_ACTIVITY_KEY, Date.now().toString());
  } catch (_) {}
}

export function getLastSessionActivity() {
  try {
    const raw = localStorage.getItem(LAST_ACTIVITY_KEY);
    return raw ? Number(raw) : 0;
  } catch (_) {
    return 0;
  }
}

export function getSessionInactivityRemainingMs() {
  if (!getVerifiedPhone()) return null;
  const last = getLastSessionActivity();
  if (!last) return SESSION_INACTIVITY_TIMEOUT_MS;
  return Math.max(0, SESSION_INACTIVITY_TIMEOUT_MS - (Date.now() - last));
}

export function isSessionExpired() {
  if (!getVerifiedPhone()) return false;
  const last = getLastSessionActivity();
  if (!last) return false;
  return (Date.now() - last) >= SESSION_INACTIVITY_TIMEOUT_MS;
}

export function expireSessionDueToInactivity() {
  logoutVerifiedSession();
  try {
    sessionStorage.setItem(
      SESSION_EXPIRED_KEY,
      'Your session has expired due to inactivity. Please log in again.'
    );
  } catch (_) {}
  try {
    window.dispatchEvent(
      new CustomEvent('easyapply:session-expired', {
        detail: { message: 'Your session has expired due to inactivity. Please log in again.' },
      })
    );
  } catch (_) {}
}

/** A customer counts as signed in once we hold a verified phone and the session has not expired. */
export function isAuthenticated() {
  const phone = getVerifiedPhone();
  if (!phone) return false;

  if (isSessionExpired()) {
    expireSessionDueToInactivity();
    return false;
  }

  return true;
}

/** Everything the app knows about the current session, in one object. */
export function getSession() {
  const accountsList = readJson('accountsList') || [];
  const selectedAccount = readJson('selectedAccount');
  const authCustomer = getAuthCustomer();

  return {
    mobileNumber: getVerifiedPhone(),
    customerExists: localStorage.getItem('customerExists') === 'true',
    selectedAccount,
    customerData: selectedAccount,
    accountsList: accountsList.length > 0 ? accountsList : (selectedAccount ? [selectedAccount] : []),
    customer: authCustomer,
    user: authCustomer,
  };
}

/**
 * Persist a completed sign-in. `accountsList` holds the SLT connections found
 * for this phone number — an empty list means a registered app user who is not
 * yet an SLT customer, so they can only apply for a new connection.
 */
export function saveSession({ phone, customer = null, user = null, accountsList = [], selectedAccount = null, tokens = {} }) {
  const accounts = Array.isArray(accountsList) ? accountsList : [];
  const account = selectedAccount || (accounts.length === 1 ? accounts[0] : null);
  const customerProfile = customer || user;

  localStorage.setItem('verifiedPhone', phone || '');
  localStorage.setItem('customerExists', accounts.length > 0 ? 'true' : 'false');

  if (customerProfile) {
    localStorage.setItem('authCustomer', JSON.stringify(customerProfile));
    localStorage.setItem('authUser', JSON.stringify(customerProfile));
  } else {
    localStorage.removeItem('authCustomer');
    localStorage.removeItem('authUser');
  }

  if (tokens.accessToken) localStorage.setItem('accessToken', tokens.accessToken);
  if (tokens.refreshToken) localStorage.setItem('refreshToken', tokens.refreshToken);

  if (accounts.length > 0) {
    localStorage.setItem('accountsList', JSON.stringify(accounts));
  } else {
    localStorage.removeItem('accountsList');
  }

  if (account) {
    localStorage.setItem('selectedAccount', JSON.stringify(account));
    localStorage.setItem('customerData', JSON.stringify(account));
  } else {
    localStorage.removeItem('selectedAccount');
    localStorage.removeItem('customerData');
  }

  recordSessionActivity();
  notifyAuthUpdated();
}

/** Record which SLT connection the customer picked when they hold several. */
export function selectAccount(account) {
  localStorage.setItem('selectedAccount', JSON.stringify(account));
  localStorage.setItem('customerData', JSON.stringify(account));
  notifyAuthUpdated();
}

export function notifyAuthUpdated() {
  window.dispatchEvent(new Event(AUTH_UPDATED_EVENT));
}

/**
 * Sign the customer out and leave the browser clean.
 *
 * Local state is cleared synchronously so nothing is readable the moment the
 * user is logged out, then the server-side cart is emptied in the background —
 * a failed network call must never leave a customer stuck signed in.
 */
export function logoutVerifiedSession() {
  // Capture the cart's session id before wiping storage, and send the delete
  // with it explicitly. Going through the axios instance would re-create the
  // id, because its request interceptor mints a new one whenever it's absent.
  let sessionId = null;
  try { sessionId = localStorage.getItem('slt_session_id'); } catch (err) { /* private mode */ }

  let refreshToken = null;
  try { refreshToken = localStorage.getItem('refreshToken'); } catch (_) {}

  const base = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_BASE_URL) || 'http://localhost:5050/api';

  if (refreshToken) {
    fetch(`${base}/auth/logout`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
      keepalive: true,
    }).catch(() => {});
  }

  if (sessionId) {
    // Best-effort and deliberately not awaited — the local wipe below is what
    // actually protects the next customer on a shared terminal.
    fetch(`${base}/cart/clear`, {
      method: 'DELETE',
      credentials: 'include',
      headers: { 'x-session-id': sessionId },
      keepalive: true,
    }).catch(() => {});
  }

  SESSION_KEYS.forEach((key) => {
    try { localStorage.removeItem(key); } catch (err) { /* private mode */ }
  });
  SESSION_STORAGE_KEYS.forEach((key) => {
    try { sessionStorage.removeItem(key); } catch (err) { /* private mode */ }
  });

  // Tell the cart badge and catalogue the basket is now empty.
  try { window.dispatchEvent(new Event('easyapply:cart-updated')); } catch (err) { /* ignore */ }

  notifyAuthUpdated();
}
