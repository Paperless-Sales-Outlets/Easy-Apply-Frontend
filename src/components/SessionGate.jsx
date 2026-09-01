import React, { useCallback, useEffect, useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiPackage, FiShoppingCart, FiUser } from 'react-icons/fi';
import { VerificationContext } from './verification';
import { AUTH_UPDATED_EVENT, getSession, isAuthenticated, selectAccount } from '../utils/authSession';

/**
 * Guards the customer-facing pages.
 *
 * Sign-in now happens once, up front, on the auth screen — so instead of asking
 * for a phone number and OTP on every wizard, this reads the session that was
 * established there and hands it down through VerificationContext. It also
 * enforces the rule that every service except New Connection is only open to
 * customers who already hold an SLT product.
 */

// New Connection is the one service open to customers with no SLT product yet.
const OPEN_TO_NEW_CUSTOMERS = ['/new-connection'];

export function requiresExistingAccount(pathname) {
  return !OPEN_TO_NEW_CUSTOMERS.some((path) => pathname.startsWith(path));
}

export default function SessionGate({ children, requireExistingCustomer }) {
  const location = useLocation();
  const navigate = useNavigate();
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

  const needsExisting = requireExistingCustomer ?? requiresExistingAccount(location.pathname);

  // Registered, but not an SLT customer yet — this service isn't available to
  // them, so point them at the one that is.
  if (needsExisting && !session.customerExists) {
    return (
      <main style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem 1rem' }}>
        <motion.div
          role="alert"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          style={{
            maxWidth: '520px',
            width: '100%',
            backgroundColor: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '20px',
            boxShadow: '0 20px 50px rgba(0, 86, 179, 0.08)',
            padding: '2.5rem 2rem',
            textAlign: 'center',
          }}
        >
          <div
            style={{
              width: '62px',
              height: '62px',
              borderRadius: '18px',
              backgroundColor: '#eff6ff',
              color: '#0056b3',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.25rem auto',
            }}
          >
            <FiPackage size={28} aria-hidden="true" />
          </div>

          <h2 style={{ fontSize: '1.4rem', fontWeight: 900, color: '#0f172a', margin: '0 0 0.5rem 0' }}>
            This service is for existing SLT customers
          </h2>
          <p style={{ fontSize: '0.92rem', color: '#64748b', margin: '0 0 1.75rem 0', lineHeight: 1.6 }}>
            We couldn't find an SLT product registered to{' '}
            <strong style={{ color: '#0f172a' }}>+94 {session.mobileNumber}</strong>. Reconnection,
            relocation, transfers, package changes and the other account services are only available
            once you have an active SLT connection. You can apply for one now.
          </p>

          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => navigate('/')}
              style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}
            >
              <FiShoppingCart size={16} aria-hidden="true" /> Browse Packages
            </button>
          </div>
        </motion.div>
      </main>
    );
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
            backgroundColor: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '20px',
            boxShadow: '0 20px 50px rgba(0, 86, 179, 0.08)',
            padding: '2.25rem 2rem',
          }}
        >
          <h2 style={{ fontSize: '1.3rem', fontWeight: 900, color: '#0f172a', margin: '0 0 0.4rem 0' }}>
            Choose an account
          </h2>
          <p style={{ fontSize: '0.9rem', color: '#64748b', margin: '0 0 1.5rem 0' }}>
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
                  borderRadius: '14px',
                  border: '1.5px solid #e2e8f0',
                  backgroundColor: '#f8fafc',
                  cursor: 'pointer',
                }}
              >
                <FiUser size={20} color="#0056b3" aria-hidden="true" />
                <span>
                  <strong style={{ display: 'block', color: '#0f172a', fontSize: '0.95rem' }}>
                    {account.fullName || account.customerName || 'SLT Account'}
                  </strong>
                  <span style={{ fontSize: '0.82rem', color: '#64748b' }}>
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
