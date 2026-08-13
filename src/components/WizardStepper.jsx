import React from 'react';
import { motion } from 'framer-motion';

export default function WizardStepper({ currentStep, steps }) {
  const totalSteps = steps.length;
  const progressPercent = Math.max(0, Math.min(100, ((currentStep - 1) / (totalSteps - 1)) * 100));

  return (
    <div style={{ position: 'relative', marginBottom: '3rem', marginTop: '1rem' }}>
      {/* Background Track Container */}
      <div style={{
        position: 'absolute', 
        top: '15px', 
        left: '50px', 
        right: '50px', 
        height: '4px', 
        zIndex: 0
      }}>
        {/* Empty Track */}
        <div style={{ width: '100%', height: '100%', backgroundColor: 'var(--line)', borderRadius: '2px' }} />
        {/* Animated Fill Track */}
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${progressPercent}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          style={{
            position: 'absolute', 
            top: 0, 
            left: 0, 
            height: '100%', 
            backgroundColor: 'var(--blue)', 
            borderRadius: '2px',
            boxShadow: '0 0 8px rgba(15, 87, 168, 0.4)'
          }} 
        />
      </div>

      {/* Steps */}
      <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative', zIndex: 1 }}>
        {steps.map((label, index) => {
          const stepNum = index + 1;
          const isActive = stepNum === currentStep;
          const isCompleted = stepNum < currentStep;
          const statusColor = (isActive || isCompleted) ? 'var(--blue)' : 'var(--line)';

          return (
            <div key={stepNum} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, minWidth: 0, padding: '0 4px' }}>
              <motion.div
                initial={false}
                animate={{
                  backgroundColor: (isActive || isCompleted) ? 'var(--blue)' : 'var(--surface)',
                  borderColor: statusColor,
                  color: (isActive || isCompleted) ? '#ffffff' : 'var(--muted)',
                  scale: isActive ? 1.15 : 1
                }}
                transition={{ duration: 0.3 }}
                style={{
                  width: '34px', 
                  height: '34px', 
                  borderRadius: '50%',
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  fontWeight: 'bold', 
                  border: '2px solid',
                  boxShadow: isActive ? '0 0 0 4px rgba(15, 87, 168, 0.15)' : 'none'
                }}
              >
                {isCompleted ? (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                ) : (
                  stepNum
                )}
              </motion.div>
              <motion.span
                animate={{
                  color: isActive ? 'var(--text)' : 'var(--muted)',
                  fontWeight: isActive ? 600 : 400
                }}
                style={{ marginTop: '1rem', fontSize: '0.85rem', textAlign: 'center', lineHeight: '1.2' }}
              >
                {label}
              </motion.span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
