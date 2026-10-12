import React from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

export const SIX_WIZARD_STEPS = [
  { id: 1, originalPoint: 4, name: 'Service Location' },
  { id: 2, originalPoint: 5, name: 'Identity & KYC' },
  { id: 3, originalPoint: 6, name: 'Digital Signature' },
  { id: 4, originalPoint: 7, name: 'Payment' },
  { id: 5, originalPoint: 8, name: 'Review & Submit' },
  { id: 6, originalPoint: 9, name: 'Tracking' },
];

export default function WizardStepper({ currentStep = 1, onStepClick, steps = SIX_WIZARD_STEPS }) {
  // Map 4-9 point system or 1-6 system to normalized 1..6 step index
  let activeStep = 1;
  if (typeof currentStep === 'number') {
    if (currentStep >= 4 && currentStep <= 9) {
      activeStep = currentStep - 3; // 4->1, 5->2, 6->3, 7->4, 8->5, 9->6
    } else if (currentStep >= 1 && currentStep <= 6) {
      activeStep = currentStep;
    }
  }

  const totalSteps = 6;
  const progressPercent = totalSteps > 1 ? Math.max(0, Math.min(100, ((activeStep - 1) / (totalSteps - 1)) * 100)) : 0;

  const handleCircleClick = (stepId) => {
    if (onStepClick) {
      onStepClick(stepId);
    } else {
      if (stepId > activeStep) {
        toast.error('Please complete the current step before proceeding.');
      }
    }
  };

  return (
    <div
      className="stepper-6-wrapper"
      style={{
        position: 'relative',
        marginBottom: '2.25rem',
        marginTop: '0.25rem',
        width: '100%',
        padding: '0.5rem 0.25rem',
      }}
    >
      <div style={{ position: 'relative', width: '100%' }}>
        {/* Connecting Progress Line */}
        <div
          style={{
            position: 'absolute',
            top: '22px',
            left: '28px',
            right: '28px',
            height: '4px',
            backgroundColor: '#e2e8f0',
            borderRadius: '4px',
            zIndex: 0,
          }}
        >
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 0.45, ease: 'easeInOut' }}
            style={{
              height: '100%',
              backgroundColor: '#50b748',
              borderRadius: '4px',
              boxShadow: '0 0 10px rgba(80, 183, 72, 0.45)',
            }}
          />
        </div>

        {/* 1 to 6 Step Nodes with Bubbling Effect */}
        <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative', zIndex: 1 }}>
          {SIX_WIZARD_STEPS.map((stepItem) => {
            const stepNum = stepItem.id;
            const isActive = stepNum === activeStep;
            const isCompleted = stepNum < activeStep;

            return (
              <div
                key={stepNum}
                onClick={() => handleCircleClick(stepNum)}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  flex: 1,
                  cursor: isCompleted ? 'pointer' : isActive ? 'default' : 'not-allowed',
                  position: 'relative',
                }}
              >
                {/* Active Node Outer Pulsing Bubble Effect */}
                {isActive && (
                  <motion.div
                    animate={{
                      scale: [1, 1.35, 1],
                      opacity: [0.75, 0.15, 0.75],
                    }}
                    transition={{
                      duration: 1.8,
                      repeat: Infinity,
                      ease: 'easeInOut',
                    }}
                    style={{
                      position: 'absolute',
                      top: '0px',
                      width: '44px',
                      height: '44px',
                      borderRadius: '50%',
                      backgroundColor: 'rgba(15, 87, 168, 0.35)',
                      zIndex: 0,
                    }}
                  />
                )}

                {/* Step Circle Node */}
                <motion.div
                  initial={false}
                  animate={{
                    scale: isActive ? 1.18 : 1,
                    backgroundColor: isActive ? '#0f57a8' : isCompleted ? '#50b748' : '#ffffff',
                    borderColor: isActive ? '#0f57a8' : isCompleted ? '#50b748' : '#cbd5e1',
                    color: isActive || isCompleted ? '#ffffff' : '#64748b',
                    boxShadow: isActive
                      ? '0 0 0 6px rgba(15, 87, 168, 0.2), 0 4px 12px rgba(15, 87, 168, 0.3)'
                      : isCompleted
                      ? '0 2px 8px rgba(80, 183, 72, 0.25)'
                      : '0 2px 5px rgba(0, 0, 0, 0.04)',
                  }}
                  transition={{ type: 'spring', stiffness: 350, damping: 22 }}
                  style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 800,
                    fontSize: '1rem',
                    border: '2.5px solid',
                    zIndex: 1,
                    position: 'relative',
                  }}
                >
                  {isCompleted ? (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  ) : (
                    stepNum
                  )}
                </motion.div>

                {/* Step Name Label */}
                <span
                  style={{
                    marginTop: '0.45rem',
                    fontSize: '0.8rem',
                    fontWeight: isActive ? 800 : isCompleted ? 700 : 500,
                    color: isActive ? '#0f57a8' : isCompleted ? '#2e7d32' : '#64748b',
                    textAlign: 'center',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {stepItem.name}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
