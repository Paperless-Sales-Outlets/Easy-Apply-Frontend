import React from 'react';
import { FiCheck } from 'react-icons/fi';

export default function WizardProgressBar({ steps = [], currentStep = 1 }) {
  const totalSteps = steps.length;
  if (totalSteps === 0) return null;

  return (
    <div className="wizard-nav-wrapper" style={{ width: '100%', marginBottom: '2.5rem' }}>
      <div
        className="wizard-steps-container"
        style={{
          display: 'flex',
          position: 'relative',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
        }}
      >
        {/* Background track line */}
        <div
          style={{
            position: 'absolute',
            top: '18px',
            left: `calc(100% / ${totalSteps * 2})`,
            right: `calc(100% / ${totalSteps * 2})`,
            height: '4px',
            backgroundColor: '#E2E8F0',
            zIndex: 0,
            borderRadius: '2px',
          }}
        />

        {/* Active progress fill line */}
        <div
          className="wizard-progress-bar"
          style={{
            position: 'absolute',
            top: '18px',
            left: `calc(100% / ${totalSteps * 2})`,
            height: '4px',
            backgroundColor: '#0F57A8',
            zIndex: 0,
            width: `calc((100% - (100% / ${totalSteps})) * ${Math.max(0, currentStep - 1) / Math.max(1, totalSteps - 1)})`,
            transition: 'width 0.35 ease',
            borderRadius: '2px',
          }}
        />

        {/* Step Nodes */}
        {steps.map((stepObj, index) => {
          const stepNum = stepObj.number || index + 1;
          const isCompleted = stepNum < currentStep;
          const isCurrent = stepNum === currentStep;

          return (
            <div
              key={stepNum}
              className="wizard-step"
              style={{
                position: 'relative',
                zIndex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '0.6rem',
                flex: 1,
                textAlign: 'center',
              }}
            >
              {/* Step Circle Badge */}
              <div
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '50%',
                  backgroundColor: isCompleted
                    ? '#0F57A8'
                    : isCurrent
                    ? '#0F57A8'
                    : '#FFFFFF',
                  border: isCompleted || isCurrent
                    ? '3px solid #0F57A8'
                    : '2px solid #CBD5E1',
                  color: isCompleted || isCurrent ? '#FFFFFF' : '#64748B',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: '700',
                  fontSize: '0.95rem',
                  boxShadow: isCurrent ? '0 0 12px rgba(15, 87, 168, 0.35)' : 'none',
                  transition: 'all 0.25s ease',
                }}
              >
                {isCompleted ? <FiCheck size={18} /> : stepNum}
              </div>

              {/* Step Label Underneath */}
              <span
                style={{
                  fontSize: '0.82rem',
                  fontWeight: isCurrent ? '700' : isCompleted ? '600' : '500',
                  color: isCurrent
                    ? '#0F57A8'
                    : isCompleted
                    ? '#1E293B'
                    : '#64748B',
                  maxWidth: '120px',
                  lineHeight: '1.25',
                }}
              >
                {stepObj.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
