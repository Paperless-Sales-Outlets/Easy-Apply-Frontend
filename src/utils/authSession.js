// Tracks the OTP-verified phone session shared across wizards (see
// OtpProtectedForm) so the Navbar can show a global Login/Logout affordance
// without needing every page to sit inside VerificationContext.
export const AUTH_UPDATED_EVENT = 'easyapply:auth-updated';

export function getVerifiedPhone() {
  return localStorage.getItem('verifiedPhone') || '';
}

export function getVerifiedName() {
  try {
    const data = localStorage.getItem('customerData');
    if (data) {
      const parsed = JSON.parse(data);
      return parsed.fullName || parsed.customerName || parsed.nameFull || '';
    }
  } catch (err) {
    // ignore
  }
  return '';
}

export function notifyAuthUpdated() {
  window.dispatchEvent(new Event(AUTH_UPDATED_EVENT));
}

export function logoutVerifiedSession() {
  localStorage.removeItem('verifiedPhone');
  localStorage.removeItem('customerExists');
  localStorage.removeItem('selectedAccount');
  localStorage.removeItem('customerData');
  notifyAuthUpdated();
}
