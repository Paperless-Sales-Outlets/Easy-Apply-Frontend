import React from 'react';

export default function ExistingCustomerSummaryBox({ customerData, customerExists, onSwitchAccount }) {
  if (customerExists === false) {
    return (
      <div
        style={{
          backgroundColor: '#eff6ff',
          border: '1.5px solid #93c5fd',
          borderRadius: '14px',
          padding: '1rem 1.25rem',
          marginBottom: '1.5rem',
          boxShadow: '0 2px 8px rgba(30,58,138,0.05)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem', color: '#1e40af' }}>
          <span style={{ fontSize: '1.1rem', fontWeight: 900 }}>ℹ</span>
          <span style={{ fontSize: '0.95rem', fontWeight: 800 }}>New Customer</span>
        </div>
        <p style={{ fontSize: '0.84rem', color: '#1e3a8a', margin: '0.35rem 0 0 0', fontWeight: 600 }}>
          No existing customer account was found for this number in the database. Please fill in your details below.
        </p>
      </div>
    );
  }

  if (!customerData) return null;

  return (
    <div
      style={{
        backgroundColor: '#f0fdf4',
        border: '1.5px solid #86efac',
        borderRadius: '14px',
        padding: '1.25rem 1.5rem',
        marginBottom: '1.5rem',
        boxShadow: '0 4px 15px rgba(16,185,129,0.08)',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1rem',
          borderBottom: '1px solid #bbf7d0',
          paddingBottom: '0.65rem',
          flexWrap: 'wrap',
          gap: '0.5rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem' }}>
          <div
            style={{
              backgroundColor: '#16a34a',
              color: '#ffffff',
              borderRadius: '50%',
              width: '22px',
              height: '22px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.75rem',
              fontWeight: 900,
            }}
          >
            ✓
          </div>
          <span style={{ fontSize: '0.95rem', fontWeight: 800, color: '#14532d' }}>
            Customer Information Verified
          </span>
          <span
            style={{
              fontSize: '0.72rem',
              backgroundColor: '#dcfce7',
              color: '#15803d',
              padding: '0.2rem 0.6rem',
              borderRadius: '9999px',
              fontWeight: 800,
            }}
          >
            Auto-filled from Database
          </span>
        </div>

        {onSwitchAccount && (
          <button
            onClick={onSwitchAccount}
            type="button"
            style={{
              background: 'none',
              border: 'none',
              color: '#0056b3',
              fontSize: '0.82rem',
              fontWeight: 800,
              cursor: 'pointer',
              textDecoration: 'underline',
            }}
          >
            Switch Account
          </button>
        )}
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem',
        }}
      >
        <div>
          <div style={{ fontSize: '0.72rem', color: '#475569', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.03em' }}>
            Customer Name
          </div>
          <div style={{ fontSize: '0.92rem', fontWeight: 800, color: '#0f172a', marginTop: '0.15rem' }}>
            {customerData.fullName || customerData.customerName || '—'}
          </div>
        </div>

        <div>
          <div style={{ fontSize: '0.72rem', color: '#475569', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.03em' }}>
            NIC / Passport / BRC
          </div>
          <div style={{ fontSize: '0.92rem', fontWeight: 800, color: '#0f172a', marginTop: '0.15rem' }}>
            {customerData.nic || '—'}
          </div>
        </div>

        <div>
          <div style={{ fontSize: '0.72rem', color: '#475569', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.03em' }}>
            Telephone Number
          </div>
          <div style={{ fontSize: '0.92rem', fontWeight: 800, color: '#0f172a', marginTop: '0.15rem' }}>
            {customerData.telephone || customerData.phoneNumber || '—'}
          </div>
        </div>

        <div>
          <div style={{ fontSize: '0.72rem', color: '#475569', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.03em' }}>
            Account Number
          </div>
          <div style={{ fontSize: '0.92rem', fontWeight: 800, color: '#0056b3', marginTop: '0.15rem' }}>
            {customerData.accountNumber || '—'}
          </div>
        </div>

        <div>
          <div style={{ fontSize: '0.72rem', color: '#475569', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.03em' }}>
            Email Address
          </div>
          <div style={{ fontSize: '0.92rem', fontWeight: 800, color: '#0f172a', marginTop: '0.15rem' }}>
            {customerData.email || '—'}
          </div>
        </div>

        <div>
          <div style={{ fontSize: '0.72rem', color: '#475569', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.03em' }}>
            Current Package
          </div>
          <div style={{ fontSize: '0.92rem', fontWeight: 800, color: '#0f172a', marginTop: '0.15rem' }}>
            {customerData.package || customerData.packageName || '—'}
          </div>
        </div>

        <div style={{ gridColumn: '1 / -1' }}>
          <div style={{ fontSize: '0.72rem', color: '#475569', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.03em' }}>
            Registered Address
          </div>
          <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#334155', marginTop: '0.15rem' }}>
            {customerData.address || '—'}
          </div>
        </div>
      </div>
    </div>
  );
}
