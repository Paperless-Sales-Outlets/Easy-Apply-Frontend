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

function requiresExistingAccount(pathname) {
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
          className="gate gate--center"
          style={{ maxWidth: 520 }}
        >
          <span className="gate__icon" aria-hidden="true">
            <FiPackage size={28} />
          </span>

          <h2 className="gate__title">This service is for existing SLT customers</h2>
          <p className="gate__text">
            We couldn't find an SLT product registered to <strong>+94 {session.mobileNumber}</strong>. Reconnection,
            relocation, transfers, package changes and the other account services are only available once you have an
            active SLT connection. You can apply for one now.
          </p>

          <button type="button" className="btn-ds btn-ds--primary" onClick={() => navigate('/')}>
            <FiShoppingCart size={18} aria-hidden="true" />
            <span>Browse Packages</span>
          </button>
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
          className="gate"
          style={{ maxWidth: 560 }}
        >
          <h2 className="gate__title">Choose an account</h2>
          <p className="gate__text">
            This mobile number has more than one SLT connection. Pick the one this request is for.
          </p>

          <div className="gate__list">
            {session.accountsList.map((account, idx) => (
              <button
                key={account.accountNumber || account.telephone || idx}
                type="button"
                className="gate__account"
                onClick={() => switchAccount(account)}
              >
                <FiUser size={22} aria-hidden="true" />
                <span>
                  <strong>{account.fullName || account.customerName || 'SLT Account'}</strong>
                  <span>{account.telephone || account.accountNumber}</span>
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
