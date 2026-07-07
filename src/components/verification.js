import { createContext, useContext } from 'react';

/* Carries the OTP-verified mobile number down to the form steps so
   they can pre-fill it. Empty string until verification completes. */
export const VerificationContext = createContext('');

export const useVerifiedMobile = () => useContext(VerificationContext);
