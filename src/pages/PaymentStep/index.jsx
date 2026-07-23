import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Icon from '../../components/Icon';

export default function PaymentStep({ isActive, verifiedPhone, amount, onSuccess }) {
  const { t } = useTranslation();
  const [redirecting, setRedirecting] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState('card');

  // Format amount to LKR currency representation
  const formattedAmount = amount 
    ? Number(amount).toLocaleString('en-LK', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    : '1,000.00';

  const handleProceedPayment = (e) => {
    e.preventDefault();
    setRedirecting(true);

    // Simulate redirecting to secure payment gateway (IPG / Payment Gateway Widget)
    setTimeout(() => {
      setRedirecting(false);
      if (onSuccess) onSuccess();
    }, 1500);
  };

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <div style={{
          width: '60px', height: '60px', borderRadius: '50%',
          backgroundColor: 'var(--surface-color, #eff6ff)',
          color: 'var(--slt-blue, #0056b3)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 1rem', border: '1px solid #bfdbfe'
        }}>
          <Icon name="lock" size={28} />
        </div>
        <h3 style={{ color: 'var(--slt-blue)', marginBottom: '0.5rem', fontSize: '1.4rem' }}>
          Secure Payment Gateway
        </h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', lineHeight: '1.5' }}>
          You will be redirected to SLTMobitel’s encrypted Internet Payment Gateway (IPG) to process your payment securely. No payment or card details are stored on EasyApply servers.
        </p>
      </div>

      {/* Summary Card */}
      <div style={{
        backgroundColor: '#f8fafc',
        border: '1px solid #e2e8f0',
        borderRadius: '12px',
        padding: '1.25rem 1.5rem',
        marginBottom: '1.5rem',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem', fontSize: '0.9rem' }}>
          <span style={{ color: 'var(--text-secondary)' }}>Service Type:</span>
          <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Reconnection Fee</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem', fontSize: '0.9rem' }}>
          <span style={{ color: 'var(--text-secondary)' }}>Verified Mobile:</span>
          <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>+94 {verifiedPhone}</span>
        </div>
        <div style={{ borderTop: '1px dashed #cbd5e1', paddingTop: '0.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)' }}>Total Amount Payable:</span>
          <span style={{ fontWeight: 800, fontSize: '1.3rem', color: 'var(--slt-green, #16a34a)' }}>LKR {formattedAmount}</span>
        </div>
      </div>

      {/* Select Payment Method Option */}
      <div style={{ marginBottom: '1.5rem' }}>
        <label className="form-label" style={{ fontWeight: 600, marginBottom: '0.75rem', display: 'block' }}>
          Select Payment Method
        </label>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div
            onClick={() => setSelectedMethod('card')}
            style={{
              border: `2px solid ${selectedMethod === 'card' ? 'var(--slt-blue, #0056b3)' : '#e2e8f0'}`,
              borderRadius: '10px',
              padding: '1rem',
              cursor: 'pointer',
              backgroundColor: selectedMethod === 'card' ? '#f0f7ff' : '#ffffff',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              transition: 'all 0.2s ease'
            }}
          >
            <Icon name="credit-card" size={22} color={selectedMethod === 'card' ? '#0056b3' : '#64748b'} />
            <div>
              <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>Credit / Debit Card</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Visa, Mastercard, Amex</div>
            </div>
          </div>

          <div
            onClick={() => setSelectedMethod('genie')}
            style={{
              border: `2px solid ${selectedMethod === 'genie' ? 'var(--slt-blue, #0056b3)' : '#e2e8f0'}`,
              borderRadius: '10px',
              padding: '1rem',
              cursor: 'pointer',
              backgroundColor: selectedMethod === 'genie' ? '#f0f7ff' : '#ffffff',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              transition: 'all 0.2s ease'
            }}
          >
            <Icon name="smartphone" size={22} color={selectedMethod === 'genie' ? '#0056b3' : '#64748b'} />
            <div>
              <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>Mobile Wallet</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>eChannelling / Genie</div>
            </div>
          </div>
        </div>
      </div>

      <form onSubmit={handleProceedPayment}>
        {redirecting ? (
          <div style={{
            textAlign: 'center',
            padding: '1rem',
            backgroundColor: '#eff6ff',
            borderRadius: '10px',
            border: '1px solid #bfdbfe',
            color: '#1e40af',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.75rem'
          }}>
            <span className="spinner" style={{
              width: '18px', height: '18px', border: '2px solid #1e40af',
              borderTopColor: 'transparent', borderRadius: '50%', display: 'inline-block',
              animation: 'spin 0.8s linear infinite'
            }} />
            Redirecting to Secure Gateway...
          </div>
        ) : (
          <button
            type="submit"
            className="btn btn-primary"
            disabled={!isActive}
            style={{
              width: '100%',
              padding: '0.85rem',
              fontSize: '1.05rem',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              boxShadow: '0 4px 12px rgba(0, 86, 179, 0.25)'
            }}
          >
            <span>Proceed to Payment</span>
            <Icon name="arrow-right" size={18} />
          </button>
        )}
      </form>

      <div style={{
        marginTop: '1.5rem',
        textAlign: 'center',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.5rem',
        fontSize: '0.78rem',
        color: 'var(--text-secondary)'
      }}>
        <Icon name="shield-check" size={16} color="#16a34a" />
        <span>256-bit SSL Encrypted &amp; PCI-DSS Compliant Gateway</span>
      </div>
    </div>
  );
}
