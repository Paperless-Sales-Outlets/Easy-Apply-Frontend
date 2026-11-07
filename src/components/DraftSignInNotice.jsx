import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FiLock } from 'react-icons/fi';

/**
 * Shown when this browser can't save or load the customer's New Connection
 * application (no valid draft token — see services/draftService.js). Signing
 * in again issues a new one. The current session is left in place, so the
 * cart and chosen package are kept; the login page replaces the session once
 * the customer has verified their number again.
 */
export default function DraftSignInNotice({ message }) {
  const navigate = useNavigate();
  const location = useLocation();

  const signInAgain = () => {
    navigate('/login', { state: { from: location.pathname + location.search } });
  };

  return (
    <div
      role="status"
      style={{
        backgroundColor: '#fffbeb',
        border: '1.5px solid #fde68a',
        borderRadius: '14px',
        padding: '0.85rem 1.15rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '0.75rem',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.7rem', minWidth: 0 }}>
        <FiLock size={18} color="#b45309" aria-hidden="true" style={{ flexShrink: 0 }} />
        <p style={{ margin: 0, fontSize: '0.88rem', color: '#78350f', lineHeight: 1.5 }}>{message}</p>
      </div>
      <button
        type="button"
        className="btn btn-secondary"
        onClick={signInAgain}
        style={{ fontWeight: 700, fontSize: '0.88rem', padding: '0.5rem 1.1rem', borderRadius: '10px' }}
      >
        Sign in again
      </button>
    </div>
  );
}
