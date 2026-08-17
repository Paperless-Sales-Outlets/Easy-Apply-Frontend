import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiCheckCircle, FiCopy, FiHome, FiDownload, FiFileText } from 'react-icons/fi';
import { useTranslation } from 'react-i18next';
import { generateAndDownloadBill } from '../utils/billGenerator';

export default function CompletionPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const refNumber = location.state?.referenceNumber || `REQ-${Math.floor(10000000 + Math.random() * 90000000)}`;
  const formData = location.state?.formData || {};
  const cartItems = location.state?.cartItems || [];
  const selectedProduct = location.state?.selectedProduct || null;

  const [copied, setCopied] = useState(false);
  const [downloaded, setDownloaded] = useState(false);

  const messageKey = location.state?.messageKey || 'completion.defaultMessage';
  const message = t(messageKey);

  const rawName = `${formData.title || ''} ${formData.nameFull || formData.name || formData.fullName || ''}`.trim();
  const invoiceData = {
    referenceNumber: refNumber,
    customerName: rawName && rawName !== 'Valued Customer' ? rawName : 'Kamal Perera',
    nic: formData.nic || formData.nicBrc || formData.idNumber || '19881401234V',
    phone: formData.mobileNumber || formData.phone || formData.contactNo || '0771234567',
    email: formData.email || 'kamal.perera@gmail.com',
    address: formData.installAddress || formData.address || formData.addressLine1 || 'No. 45/2, Temple Road, Nugegoda, Colombo',
    cartItems,
    selectedProduct,
  };

  // Automatically trigger bill download on page mount
  useEffect(() => {
    const timer = setTimeout(() => {
      generateAndDownloadBill(invoiceData);
      setDownloaded(true);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  const handleCopy = () => {
    navigator.clipboard.writeText(refNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleManualDownloadBill = () => {
    generateAndDownloadBill(invoiceData);
    setDownloaded(true);
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '70vh', padding: '2rem 1rem' }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="card"
        style={{
          padding: '3rem',
          maxWidth: '580px',
          width: '100%',
          textAlign: 'center',
          boxShadow: 'var(--shadow-lg)',
          borderRadius: 'var(--radius-lg)',
          backgroundColor: '#FFFFFF',
        }}
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
          style={{
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            background: 'rgba(0, 166, 80, 0.1)',
            color: 'var(--slt-green, #10B981)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.5rem auto',
          }}
        >
          <FiCheckCircle size={44} />
        </motion.div>

        <h2 style={{ marginBottom: '0.5rem', color: 'var(--navy, #0B2D5B)', fontWeight: '800' }}>
          Payment & Application Confirmed!
        </h2>
        <p style={{ color: 'var(--text-secondary, #64748B)', marginBottom: '1.75rem', fontSize: '1rem', lineHeight: '1.5' }}>
          {message}
        </p>

        {/* Reference Number Box */}
        <div
          style={{
            background: '#F8FAFC',
            border: '1px dashed #CBD5E1',
            borderRadius: '12px',
            padding: '1.25rem',
            marginBottom: '1.5rem',
          }}
        >
          <p
            style={{
              fontSize: '0.8rem',
              color: 'var(--text-secondary)',
              marginBottom: '0.4rem',
              textTransform: 'uppercase',
              letterSpacing: '1px',
              fontWeight: '700',
            }}
          >
            Application Reference Number
          </p>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem' }}>
            <span style={{ fontSize: '1.6rem', fontWeight: '800', color: 'var(--slt-blue, #0F57A8)', letterSpacing: '1.5px' }}>
              {refNumber}
            </span>
            <button
              onClick={handleCopy}
              style={{ background: 'none', border: 'none', color: 'var(--slt-blue)', cursor: 'pointer', padding: '0.5rem' }}
              title="Copy Reference Number"
            >
              <FiCopy size={20} color={copied ? '#10B981' : 'currentColor'} />
            </button>
          </div>
          {copied && (
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ color: '#10B981', fontSize: '0.78rem', marginTop: '0.4rem' }}>
              Copied to clipboard!
            </motion.p>
          )}
        </div>

        {/* Bill Downloaded Notification Alert */}
        <div
          style={{
            backgroundColor: '#ECFDF5',
            border: '1px solid #A7F3D0',
            borderRadius: '12px',
            padding: '1rem',
            marginBottom: '1.75rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            textAlign: 'left',
          }}
        >
          <FiFileText size={28} style={{ color: '#059669', flexShrink: 0 }} />
          <div>
            <strong style={{ color: '#065F46', display: 'block', fontSize: '0.92rem' }}>
              Official Bill Invoice Generated
            </strong>
            <span style={{ fontSize: '0.82rem', color: '#047857' }}>
              Your SLT Mobitel Bill Invoice has been automatically generated and downloaded to your device.
            </span>
          </div>
        </div>

        {/* Manual Download Bill Button */}
        <button
          className="btn btn-primary"
          onClick={handleManualDownloadBill}
          style={{
            width: '100%',
            padding: '0.9rem',
            fontSize: '0.95rem',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '0.6rem',
            marginBottom: '0.85rem',
            backgroundColor: '#0F57A8',
            fontWeight: '700',
            boxShadow: '0 4px 14px rgba(15, 87, 168, 0.25)',
          }}
        >
          <FiDownload size={18} />
          <span>Download Official Bill Invoice (HTML / Printable)</span>
        </button>

        {/* Back to Dashboard Button */}
        <button
          className="btn btn-secondary"
          onClick={() => navigate('/')}
          style={{
            width: '100%',
            padding: '0.85rem',
            fontSize: '0.95rem',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          <FiHome size={18} /> {t('completion.backToDashboard')}
        </button>
      </motion.div>
    </div>
  );
}
