// Tracks the OTP-verified phone session shared across wizards (see
// OtpProtectedForm) so the Navbar can show a global Login/Logout affordance
// without needing every page to sit inside VerificationContext.
export const AUTH_UPDATED_EVENT = 'easyapply:auth-updated';

export function getVerifiedPhone() {
  return sessionStorage.getItem('verifiedPhone') || '';
}

export function notifyAuthUpdated() {
  window.dispatchEvent(new Event(AUTH_UPDATED_EVENT));
}

export function logoutVerifiedSession() {
  sessionStorage.removeItem('verifiedPhone');
  sessionStorage.removeItem('customerExists');
  sessionStorage.removeItem('selectedAccount');
  sessionStorage.removeItem('customerData');
  notifyAuthUpdated();
}
