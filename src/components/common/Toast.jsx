import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiCheckCircle, FiInfo, FiXCircle, FiX } from 'react-icons/fi';

export default function Toast({ toast, onClose }) {
  if (!toast) return null;

  const { type = 'success', message = '' } = toast;

  const icons = {
    success: <FiCheckCircle style={{ color: '#10b981', fontSize: '1.25rem', flexShrink: 0 }} />,
    info: <FiInfo style={{ color: '#0284c7', fontSize: '1.25rem', flexShrink: 0 }} />,
    error: <FiXCircle style={{ color: '#ef4444', fontSize: '1.25rem', flexShrink: 0 }} />,
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 50, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.9 }}
        style={{
          position: 'fixed',
          bottom: '2rem',
          right: '2rem',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          backgroundColor: '#ffffff',
          color: '#1e293b',
          padding: '0.875rem 1.25rem',
          borderRadius: '12px',
          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.15), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
          borderLeft: `4px solid ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#0284c7'}`,
          maxWidth: '380px',
        }}
      >
        {icons[type]}
        <span style={{ fontSize: '0.925rem', fontWeight: 500, flex: 1 }}>{message}</span>
        <button
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            color: '#94a3b8',
            cursor: 'pointer',
            padding: '2px',
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <FiX style={{ fontSize: '1rem' }} />
        </button>
      </motion.div>
    </AnimatePresence>
  );
}
