import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiCheckCircle, FiCopy, FiHome, FiShield, FiFileText } from 'react-icons/fi';

export default function ThankYouPage() {
  const location = useLocation();
  const navigate = useNavigate();

  // Read query parameters or location state
  const query = new URLSearchParams(location.search);
  const orderId = location.state?.orderId || query.get('orderId') || 'ORD-' + Math.floor(100000 + Math.random() * 900000);
  const amount = location.state?.amount || query.get('amount') || '1,000.00';
  const paymentId = location.state?.paymentId || query.get('paymentId') || 'PAYHERE-' + Math.floor(10000000 + Math.random() * 90000000);

  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(orderId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '70vh', padding: '2rem 1rem' }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="card"
        style={{
          padding: '3rem 2.5rem',
          maxWidth: '560px',
          width: '100%',
          textAlign: 'center',
          boxShadow: 'var(--shadow-lg, 0 10px 25px rgba(0,0,0,0.08))',
          borderRadius: '16px',
          background: '#ffffff',
          border: '1px solid #e2e8f0'
        }}
      >
        {/* Success Icon Badge */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 220, delay: 0.15 }}
          style={{
            width: '88px',
            height: '88px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%)',
            color: '#15803d',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.5rem auto',
            boxShadow: '0 8px 20px rgba(22, 101, 52, 0.15)'
          }}
        >
          <FiCheckCircle size={48} />
        </motion.div>

        {/* Title */}
        <h2 style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--slt-blue, #0056b3)', marginBottom: '0.5rem' }}>
          Thank You!
        </h2>
        <p style={{ color: '#475569', fontSize: '1.05rem', lineHeight: '1.6', marginBottom: '2rem' }}>
          Your payment has been successfully processed via <strong style={{ color: '#0f172a' }}>PayHere Sandbox Gateway</strong>.
        </p>

        {/* Payment Summary Box */}
        <div style={{
          background: '#f8fafc',
          border: '1px dashed #cbd5e1',
          borderRadius: '12px',
          padding: '1.5rem',
          marginBottom: '2rem',
          textAlign: 'left'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem' }}>
            <span style={{ fontSize: '0.88rem', color: '#64748b' }}>Payment Status:</span>
            <span style={{
              background: '#dcfce7',
              color: '#15803d',
              padding: '0.25rem 0.75rem',
              borderRadius: '20px',
              fontSize: '0.82rem',
              fontWeight: 600,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem'
            }}>
              <FiShield size={14} /> Paid & Confirmed
            </span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem' }}>
            <span style={{ fontSize: '0.88rem', color: '#64748b' }}>Order Reference:</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontWeight: '700', color: '#0056b3', fontSize: '1.05rem', fontFamily: 'monospace' }}>
                {orderId}
              </span>
              <button
                onClick={handleCopy}
                style={{ background: 'none', border: 'none', color: '#0056b3', cursor: 'pointer', padding: '0.2rem' }}
                title="Copy Order ID"
              >
                <FiCopy size={16} color={copied ? "#15803d" : "currentColor"} />
              </button>
            </div>
          </div>

          {copied && (
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ color: '#15803d', fontSize: '0.75rem', textAlign: 'right', marginTop: '-0.3rem', marginBottom: '0.5rem' }}>
              Copied to clipboard!
            </motion.p>
          )}

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem' }}>
            <span style={{ fontSize: '0.88rem', color: '#64748b' }}>PayHere Transaction ID:</span>
            <span style={{ fontSize: '0.9rem', color: '#334155', fontFamily: 'monospace' }}>
              {paymentId}
            </span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.75rem', borderTop: '1px solid #e2e8f0' }}>
            <span style={{ fontSize: '0.92rem', fontWeight: 600, color: '#1e293b' }}>Total Amount Paid:</span>
            <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0056b3' }}>
              LKR {typeof amount === 'number' ? amount.toLocaleString('en-LK', { minimumFractionDigits: 2 }) : amount}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <button
            className="btn btn-primary"
            onClick={() => navigate('/')}
            style={{
              width: '100%',
              padding: '0.85rem',
              fontSize: '1rem',
              fontWeight: 600,
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: '0.5rem',
              borderRadius: '8px',
              cursor: 'pointer'
            }}
          >
            <FiHome size={18} /> Back to Home Dashboard
          </button>

          <button
            onClick={() => navigate('/check-status')}
            style={{
              width: '100%',
              padding: '0.75rem',
              fontSize: '0.95rem',
              fontWeight: 500,
              color: '#0056b3',
              background: 'transparent',
              border: '1px solid #bfdbfe',
              borderRadius: '8px',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: '0.5rem',
              cursor: 'pointer'
            }}
          >
            <FiFileText size={18} /> Check Application Status
          </button>
        </div>
      </motion.div>
    </div>
  );
}
