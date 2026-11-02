import { createContext, useContext } from 'react';

/* Carries verified mobile number, customer identification status, and selected customer account details down to form steps. */
export const VerificationContext = createContext({
  mobileNumber: '',
  customerExists: false,
  customerData: null,
  selectedAccount: null,
  accountsList: [],
  switchAccount: () => {},
});

/** Raw verification context (mobile number and existing-customer details). */
export const useVerifiedContext = () => useContext(VerificationContext);

/** The verified mobile number from context, or '' when none. */
export const useVerifiedMobile = () => {
  const ctx = useContext(VerificationContext);
  if (!ctx) return '';
  if (typeof ctx === 'string') return ctx;
  return ctx.mobileNumber || '';
};
