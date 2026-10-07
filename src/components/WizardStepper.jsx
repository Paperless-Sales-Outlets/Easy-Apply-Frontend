import React from 'react';
import { motion } from 'framer-motion';

export const FULL_ONBOARDING_9_STEPS = [
  'Landing Page',
  'Contact Verification',
  'Package Selection',
  'Service Location',
  'Identity & KYC',
  'Digital Signature',
  'Payment',
  'Review & Submit',
  'Tracking'
];

export default function WizardStepper({ currentStep = 1, steps = FULL_ONBOARDING_9_STEPS, totalStepsOverride = null }) {
  const stepList = steps && steps.length > 0 ? steps : FULL_ONBOARDING_9_STEPS;
  const totalSteps = totalStepsOverride || stepList.length;
  const activeStep = Math.max(1, Math.min(currentStep, totalSteps));
  const progressPercent = totalSteps > 1 ? Math.max(0, Math.min(100, ((activeStep - 1) / (totalSteps - 1)) * 100)) : 0;

  return (
    <div className="stepper-wrapper" style={{ position: 'relative', marginBottom: '2.5rem', marginTop: '0.5rem', width: '100%', overflowX: 'auto', paddingBottom: '0.5rem' }}>
      <div style={{ minWidth: stepList.length > 5 ? '680px' : '100%', position: 'relative' }}>
        {/* Connecting Progress Bar Track */}
        <div 
          style={{
            position: 'absolute', 
            top: '17px', 
            left: '30px', 
            right: '30px', 
            height: '3px', 
            zIndex: 0
          }}
        >
          <div style={{ width: '100%', height: '100%', backgroundColor: '#e2e8f0', borderRadius: '4px' }} />
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 0.4, ease: 'easeInOut' }}
            style={{
              position: 'absolute', 
              top: 0, 
              left: 0, 
              height: '100%', 
              backgroundColor: '#0f57a8', 
              borderRadius: '4px',
              boxShadow: '0 0 6px rgba(15, 87, 168, 0.4)'
            }} 
          />
        </div>

        {/* Step Nodes */}
        <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative', zIndex: 1 }}>
          {stepList.map((label, index) => {
            const stepNum = index + 1;
            const isActive = stepNum === activeStep;
            const isCompleted = stepNum < activeStep;

            return (
              <div 
                key={stepNum} 
                style={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'center', 
                  flex: 1, 
                  minWidth: 0, 
                  padding: '0 4px' 
                }}
              >
                <motion.div
                  initial={false}
                  animate={{
                    backgroundColor: isActive ? '#0f57a8' : isCompleted ? '#0f57a8' : '#e2e8f0',
                    borderColor: isActive ? '#0f57a8' : isCompleted ? '#0f57a8' : '#cbd5e1',
                    color: (isActive || isCompleted) ? '#ffffff' : '#64748b',
                    scale: isActive ? 1.12 : 1
                  }}
                  transition={{ duration: 0.25 }}
                  style={{
                    width: '32px', 
                    height: '32px', 
                    borderRadius: '50%',
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    fontWeight: 700, 
                    fontSize: '0.82rem',
                    border: '2px solid',
                    boxShadow: isActive ? '0 0 0 4px rgba(15, 87, 168, 0.2)' : 'none',
                    cursor: 'default'
                  }}
                >
                  {isCompleted ? (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  ) : (
                    stepNum
                  )}
                </motion.div>

                <span
                  style={{
                    marginTop: '0.65rem',
                    fontSize: '0.72rem',
                    fontWeight: isActive ? 700 : 500,
                    color: isActive ? '#0f57a8' : isCompleted ? '#1e293b' : '#94a3b8',
                    textAlign: 'center',
                    lineHeight: '1.2',
                    maxWidth: '85px',
                    whiteSpace: 'normal',
                    wordBreak: 'break-word',
                    textDecoration: isActive ? 'underline' : 'none',
                    textUnderlineOffset: '3px'
                  }}
                >
                  {label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
