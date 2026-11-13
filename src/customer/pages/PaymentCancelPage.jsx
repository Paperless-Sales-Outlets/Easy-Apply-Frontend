import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FiXCircle, FiHome } from 'react-icons/fi';

/** Shown when the customer cancels at the PayHere checkout. */
export default function PaymentCancelPage() {
  const navigate = useNavigate();

  return (
    <div
      style={{
        minHeight: '70vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
      }}
    >
      <div
        style={{
          maxWidth: '480px',
          width: '100%',
          textAlign: 'center',
          background: 'var(--paper)',
          borderRadius: 'var(--radius-lg)',
          padding: '3rem 2rem',
          boxShadow: 'var(--shadow-md)',
          border: '1px solid var(--grey-200)',
        }}
      >
        <div
          style={{
            width: '72px',
            height: '72px',
            borderRadius: '50%',
            backgroundColor: 'var(--grey-100)',
            color: 'var(--grey-600)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.5rem',
          }}
        >
          <FiXCircle size={40} />
        </div>

        <h2 style={{ marginBottom: '0.5rem' }}>Payment Cancelled</h2>
        <p style={{ color: 'var(--grey-600)', marginBottom: '2rem', lineHeight: 1.6 }}>
          Your payment was not completed. No charges have been made.
          <br />
          You can go back and try again whenever you're ready.
        </p>

        <button
          type="button"
          onClick={() => navigate('/')}
          className="btn btn-primary"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.85rem 2rem' }}
        >
          <FiHome size={18} />
          Back to Dashboard
        </button>
      </div>
    </div>
  );
}
