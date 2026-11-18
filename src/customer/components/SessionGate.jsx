import React, { useCallback, useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiUser } from 'react-icons/fi';
import { VerificationContext } from './verification';
import { AUTH_UPDATED_EVENT, getSession, isAuthenticated, selectAccount } from '../../shared/utils/authSession';

/**
 * Guards the customer-facing pages.
 *
 * Sign-in now happens once, up front, on the auth screen — so instead of asking
 * for a phone number and OTP on every wizard, this reads the session that was
 * established there and hands it down through VerificationContext.
 */

/** Renders children only for a signed-in customer; otherwise prompts sign-in. */
export default function SessionGate({ children }) {
  const location = useLocation();
  const [session, setSession] = useState(getSession);

  useEffect(() => {
    const sync = () => setSession(getSession());
    sync();
    window.addEventListener(AUTH_UPDATED_EVENT, sync);
    window.addEventListener('storage', sync);
    return () => {
      window.removeEventListener(AUTH_UPDATED_EVENT, sync);
      window.removeEventListener('storage', sync);
    };
  }, [location.pathname]);

  const switchAccount = useCallback((account) => {
    selectAccount(account);
    setSession(getSession());
  }, []);

  if (!isAuthenticated()) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  // Several connections on one number — let them say which one this request is for.
  if (session.customerExists && session.accountsList.length > 1 && !session.selectedAccount) {
    return (
      <main style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem 1rem' }}>
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          style={{
            maxWidth: '560px',
            width: '100%',
            backgroundColor: 'var(--paper)',
            border: '1px solid var(--grey-200)',
            borderRadius: 'var(--radius-lg)',
            boxShadow: 'var(--shadow-xl)',
            padding: '2.25rem 2rem',
          }}
        >
          <h2 style={{ fontSize: '1.3rem', fontWeight: 700, color: '#131f33', margin: '0 0 0.4rem 0' }}>
            Choose an account
          </h2>
          <p style={{ fontSize: '0.9rem', color: '#52627a', margin: '0 0 1.5rem 0' }}>
            This mobile number has more than one SLT connection. Pick the one this request is for.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {session.accountsList.map((account, idx) => (
              <button
                key={account.accountNumber || account.telephone || idx}
                type="button"
                onClick={() => switchAccount(account)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.85rem',
                  textAlign: 'left',
                  padding: '1rem 1.15rem',
                  borderRadius: 'var(--radius-lg)',
                  border: '1.5px solid var(--grey-200)',
                  backgroundColor: 'var(--grey-50)',
                  cursor: 'pointer',
                }}
              >
                <FiUser size={20} color="#0056a2" aria-hidden="true" />
                <span>
                  <strong style={{ display: 'block', color: '#131f33', fontSize: '0.95rem' }}>
                    {account.fullName || account.customerName || 'SLT Account'}
                  </strong>
                  <span style={{ fontSize: '0.82rem', color: '#52627a' }}>
                    {account.telephone || account.accountNumber}
                  </span>
                </span>
              </button>
            ))}
          </div>
        </motion.div>
      </main>
    );
  }

  return (
    <VerificationContext.Provider
      value={{
        mobileNumber: session.mobileNumber,
        customerExists: session.customerExists,
        customerData: session.selectedAccount,
        selectedAccount: session.selectedAccount,
        accountsList: session.accountsList,
        switchAccount,
      }}
    >
      {children}
    </VerificationContext.Provider>
  );
}
