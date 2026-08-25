import React from 'react';
import { motion } from 'framer-motion';
import sltlogoOnly from '../assets/sltlogoOnly.png';

export default function SLTLoader({ size = 120, className = '', text = '' }) {
  return (
    <div className={`slt-loader ${className}`} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
      <motion.img 
        src={sltlogoOnly}
        alt="Loading..."
        style={{ width: size, height: size, objectFit: 'contain' }}
        initial={{ opacity: 0.4, scale: 0.95 }}
        animate={{ opacity: [0.4, 1, 0.4], scale: [0.95, 1.05, 0.95] }}
        transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
      />
      {text && (
        <motion.span 
          initial={{ opacity: 0.5 }}
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
          style={{ fontWeight: 600, color: 'var(--slt-blue)', fontSize: '1rem', letterSpacing: '0.5px' }}
        >
          {text}
        </motion.span>
      )}
    </div>
  );
}
