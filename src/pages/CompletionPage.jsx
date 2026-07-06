import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiCheckCircle, FiCopy, FiHome } from 'react-icons/fi';
import { useTranslation } from 'react-i18next';

export default function CompletionPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useTranslation();
  
  const [refNumber, setRefNumber] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    // Generate a random reference number
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = 'REQ-';
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setRefNumber(result);
  }, []);

  const message = location.state?.message || "Application submitted successfully!";

  const handleCopy = () => {
    navigator.clipboard.writeText(refNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="card"
        style={{ 
          padding: '3rem', 
          maxWidth: '500px', 
          width: '100%', 
          textAlign: 'center',
          boxShadow: 'var(--shadow-lg)',
          borderRadius: 'var(--radius-lg)'
        }}
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
          style={{
            width: '80px', height: '80px', borderRadius: '50%',
            background: 'rgba(0, 166, 80, 0.1)', color: 'var(--slt-green)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 1.5rem auto'
          }}
        >
          <FiCheckCircle size={40} />
        </motion.div>

        <h2 style={{ marginBottom: '1rem', color: 'var(--text-primary)' }}>Success!</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', fontSize: '1.1rem' }}>
          {message}
        </p>

        <div style={{
          background: '#f9fafb', border: '1px dashed #d2d6dc', borderRadius: '8px', padding: '1.5rem', marginBottom: '2rem'
        }}>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
            Reference Number
          </p>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem' }}>
            <span style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--slt-blue)', letterSpacing: '2px' }}>
              {refNumber}
            </span>
            <button 
              onClick={handleCopy}
              style={{ background: 'none', border: 'none', color: 'var(--slt-blue)', cursor: 'pointer', padding: '0.5rem' }}
              title="Copy Reference Number"
            >
              <FiCopy size={20} color={copied ? "var(--slt-green)" : "currentColor"} />
            </button>
          </div>
          {copied && <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ color: 'var(--slt-green)', fontSize: '0.75rem', marginTop: '0.5rem' }}>Copied to clipboard!</motion.p>}
        </div>

        <button 
          className="btn btn-primary" 
          onClick={() => navigate('/')}
          style={{ width: '100%', padding: '1rem', fontSize: '1rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }}
        >
          <FiHome /> Back to Dashboard
        </button>
      </motion.div>
    </div>
  );
}
