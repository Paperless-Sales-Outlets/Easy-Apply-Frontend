import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FiXCircle, FiHome } from 'react-icons/fi';

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
          background: '#fff',
          borderRadius: '24px',
          padding: '3rem 2rem',
          boxShadow: '0 20px 50px rgba(0,0,0,0.07)',
          border: '1px solid #e2e8f0',
        }}
      >
        <div
          style={{
            width: '72px',
            height: '72px',
            borderRadius: '50%',
            backgroundColor: '#fff1f2',
            color: '#e11d48',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.5rem',
          }}
        >
          <FiXCircle size={40} />
        </div>

        <h2 style={{ color: '#0f172a', marginBottom: '0.5rem' }}>Payment Cancelled</h2>
        <p style={{ color: '#64748b', marginBottom: '2rem', lineHeight: 1.6 }}>
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
