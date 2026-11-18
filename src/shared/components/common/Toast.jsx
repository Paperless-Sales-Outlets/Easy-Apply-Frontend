import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiCheckCircle, FiInfo, FiXCircle, FiX } from 'react-icons/fi';

/** Inline toast message; renders nothing when `toast` is empty. */
export default function Toast({ toast, onClose }) {
  if (!toast) return null;

  const { type = 'success', message = '' } = toast;

  const icons = {
    success: <FiCheckCircle style={{ color: '#0f7a4d', fontSize: '1.25rem', flexShrink: 0 }} />,
    info: <FiInfo style={{ color: '#1a6cbd', fontSize: '1.25rem', flexShrink: 0 }} />,
    error: <FiXCircle style={{ color: '#d92d20', fontSize: '1.25rem', flexShrink: 0 }} />,
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
          backgroundColor: 'var(--paper)',
          color: 'var(--grey-800)',
          padding: '0.875rem 1.25rem',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-lg)',
          borderLeft: `4px solid ${type === 'success' ? '#0f7a4d' : type === 'error' ? '#d92d20' : '#1a6cbd'}`,
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
            color: 'var(--grey-400)',
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
