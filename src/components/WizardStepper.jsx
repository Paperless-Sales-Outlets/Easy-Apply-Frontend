import React from 'react';
import { motion } from 'framer-motion';

export default function WizardStepper({ currentStep, steps }) {
  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      flexWrap: 'wrap', 
      gap: '0.75rem', 
      marginBottom: '3rem', 
      marginTop: '1rem',
      padding: '0 1rem' 
    }}>
      {steps.map((label, index) => {
        const stepNum = index + 1;
        const isActive = stepNum === currentStep;
        const isCompleted = stepNum < currentStep;
        
        // Colors matching the "All Products" style tabs
        const bg = isActive ? 'var(--slt-blue)' : isCompleted ? 'rgba(15, 87, 168, 0.05)' : '#ffffff';
        const color = isActive ? '#ffffff' : isCompleted ? 'var(--slt-blue)' : 'var(--text-secondary)';
        const border = isActive ? '1px solid var(--slt-blue)' : isCompleted ? '1px solid rgba(15, 87, 168, 0.2)' : '1px solid rgba(0,0,0,0.1)';

        return (
          <motion.div
            key={stepNum}
            initial={false}
            animate={{ backgroundColor: bg, color, border }}
            transition={{ duration: 0.3 }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.6rem 1.25rem',
              borderRadius: '999px',
              fontSize: '0.9rem',
              fontWeight: isActive ? 600 : 500,
              boxShadow: isActive ? '0 4px 12px rgba(15, 87, 168, 0.2)' : '0 2px 8px rgba(0,0,0,0.02)',
              position: 'relative'
            }}
          >
            {isCompleted ? (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            ) : (
              <span style={{ 
                width: '18px', height: '18px', borderRadius: '50%', 
                background: isActive ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.05)', 
                display: 'grid', placeItems: 'center', fontSize: '0.75rem' 
              }}>
                {stepNum}
              </span>
            )}
            {label}
          </motion.div>
        );
      })}
    </div>
  );
}
