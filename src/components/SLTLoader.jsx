import React from 'react';
import { motion } from 'framer-motion';

export default function SLTLoader({ size = 48, className = '', text = '' }) {
  const cyan = "#00AEEF";
  const darkBlue = "#0054A6";
  const green = "#4DB848";

  const getTransition = (delay) => ({
    repeat: Infinity,
    duration: 1.5,
    ease: "easeInOut",
    delay: delay
  });

  return (
    <div className={`slt-loader ${className}`} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
      <div style={{ width: size, height: size }}>
        <svg viewBox="0 0 100 100" width="100%" height="100%">
          {/* Rotate 45deg to create the forward-leaning slashes */}
          <g transform="rotate(45 50 50) translate(0, -5)">
            {/* Cyan Pill (Top Left) */}
            <motion.rect 
              x="28" y="10" width="16" height="38" rx="8" fill={cyan}
              initial={{ opacity: 0.2, scale: 0.95 }}
              animate={{ opacity: [0.2, 1, 0.2], scale: [0.95, 1, 0.95] }}
              transition={getTransition(0)}
            />
            
            {/* Dark Blue Pill (Bottom Left) */}
            <motion.rect 
              x="28" y="56" width="16" height="38" rx="8" fill={darkBlue}
              initial={{ opacity: 0.2, scale: 0.95 }}
              animate={{ opacity: [0.2, 1, 0.2], scale: [0.95, 1, 0.95] }}
              transition={getTransition(0.2)}
            />
            
            {/* Green Dot (Center Right) */}
            <motion.circle 
              cx="64" cy="40" r="8" fill={green}
              initial={{ opacity: 0.2, scale: 0.95 }}
              animate={{ opacity: [0.2, 1, 0.2], scale: [0.95, 1, 0.95] }}
              transition={getTransition(0.4)}
            />
            
            {/* Green Pill (Bottom Right) */}
            <motion.rect 
              x="56" y="56" width="16" height="38" rx="8" fill={green}
              initial={{ opacity: 0.2, scale: 0.95 }}
              animate={{ opacity: [0.2, 1, 0.2], scale: [0.95, 1, 0.95] }}
              transition={getTransition(0.6)}
            />
          </g>
        </svg>
      </div>
      {text && (
        <motion.span 
          initial={{ opacity: 0.5 }}
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
          style={{ fontWeight: 600, color: 'var(--blue)', fontSize: '0.9rem', letterSpacing: '0.5px' }}
        >
          {text}
        </motion.span>
      )}
    </div>
  );
}
