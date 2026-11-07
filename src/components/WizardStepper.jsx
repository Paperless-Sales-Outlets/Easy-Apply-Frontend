import React from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

// Done steps are green, the current step blue, upcoming steps white.
const BLUE = '#0f57a8';
const GREEN = '#3a9636';

// Existing New Connection wizard (original workflow points 4 through 9).
export const SIX_WIZARD_STEPS = [
  { id: 1, originalPoint: 4, name: 'Service Location' },
  { id: 2, originalPoint: 5, name: 'Identity & KYC' },
  { id: 3, originalPoint: 6, name: 'Digital Signature' },
  { id: 4, originalPoint: 7, name: 'Payment' },
  { id: 5, originalPoint: 8, name: 'Review & Submit' },
  { id: 6, originalPoint: 9, name: 'Tracking' },
];

// Full seven-step onboarding, including package selection.
export const FULL_ONBOARDING_7_STEPS = [
  'Package Selection',
  'Service Location',
  'Identity & KYC',
  'Digital Signature',
  'Payment',
  'Review & Submit',
  'Tracking',
];

/**
 * @param {Object} props
 * @param {number} props.currentStep - 1-based step index by default.
 * @param {Function} [props.onStepClick] - Called when a step is clicked.
 * @param {Array<string|Object>} [props.steps] - Step names or { id, name, originalPoint } objects.
 * @param {number|null} [props.totalStepsOverride] - Limits the displayed step count.
 * @param {'index'|'original'} [props.stepNumbering] - Use 'original' for legacy points 4-9.
 */
export default function WizardStepper({
  currentStep = 1,
  onStepClick,
  steps = FULL_ONBOARDING_7_STEPS,
  totalStepsOverride = null,
  stepNumbering = 'index',
}) {
  const sourceSteps = Array.isArray(steps) && steps.length > 0
    ? steps
    : FULL_ONBOARDING_7_STEPS;

  const normalizedSteps = sourceSteps.map((step, index) =>
    typeof step === 'string'
      ? { id: index + 1, name: step }
      : {
          ...step,
          id: step.id ?? index + 1,
          name: step.name ?? `Step ${index + 1}`,
        }
  );

  const totalSteps =
    Number.isInteger(totalStepsOverride) && totalStepsOverride > 0
      ? Math.min(totalStepsOverride, normalizedSteps.length)
      : normalizedSteps.length;

  const visibleSteps = normalizedSteps.slice(0, totalSteps);
  const requestedStep = Number(currentStep);
  const originalIndex = stepNumbering === 'original'
    ? visibleSteps.findIndex((step) => step.originalPoint === requestedStep)
    : -1;

  const activeStep = Math.max(
    1,
    Math.min(
      totalSteps,
      originalIndex >= 0
        ? originalIndex + 1
        : Number.isFinite(requestedStep) ? requestedStep : 1
    )
  );

  const progressPercent = totalSteps > 1
    ? Math.max(0, Math.min(100, ((activeStep - 1) / (totalSteps - 1)) * 100))
    : 0;

  const handleCircleClick = (step, stepNum) => {
    if (onStepClick) {
      const stepId = stepNumbering === 'original' && step.originalPoint != null
        ? step.originalPoint
        : step.id;
      onStepClick(stepId);
    } else if (stepNum > activeStep) {
      toast.error('Please complete the current step before proceeding.');
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
        {/* Connecting progress line */}
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
              position: 'absolute',
              top: 0,
              left: 0,
              height: '100%',
              backgroundColor: GREEN,
              borderRadius: '4px',
              boxShadow: '0 0 10px rgba(58, 150, 54, 0.25)',
            }}
          />
        </div>

        {/* Six or seven steps, depending on the supplied list */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            position: 'relative',
            zIndex: 1,
          }}
        >
          {visibleSteps.map((step, index) => {
            const stepNum = index + 1;
            const isActive = stepNum === activeStep;
            const isCompleted = stepNum < activeStep;

            return (
              <button
                key={`${step.id}-${index}`}
                type="button"
                onClick={() => handleCircleClick(step, stepNum)}
                aria-current={isActive ? 'step' : undefined}
                aria-label={`${step.name}, step ${stepNum} of ${totalSteps}${isCompleted ? ', completed' : ''}`}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  flex: 1,
                  minWidth: 0,
                  cursor: isCompleted && onStepClick
                    ? 'pointer'
                    : isActive ? 'default' : 'not-allowed',
                  position: 'relative',
                  border: 0,
                  background: 'transparent',
                  padding: 0,
                  font: 'inherit',
                }}
              >
                {/* Current step pulse */}
                {isActive && (
                  <motion.span
                    aria-hidden="true"
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
                      top: 0,
                      width: '44px',
                      height: '44px',
                      borderRadius: '50%',
                      backgroundColor: 'rgba(15, 87, 168, 0.35)',
                      pointerEvents: 'none',
                      zIndex: 0,
                    }}
                  />
                )}

                {/* Step circle */}
                <motion.span
                  initial={false}
                  animate={{
                    scale: isActive ? 1.12 : 1,
                    backgroundColor: isActive ? BLUE : isCompleted ? GREEN : '#ffffff',
                    borderColor: isActive ? BLUE : isCompleted ? GREEN : '#cbd5e1',
                    color: isActive || isCompleted ? '#ffffff' : '#64748b',
                    boxShadow: isActive
                      ? '0 0 0 6px rgba(15, 87, 168, 0.2), 0 4px 12px rgba(15, 87, 168, 0.3)'
                      : isCompleted
                        ? '0 2px 8px rgba(58, 150, 54, 0.25)'
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
                    boxSizing: 'border-box',
                  }}
                >
                  {isCompleted ? (
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  ) : (
                    stepNum
                  )}
                </motion.span>

                {/* Step label */}
                <span
                  style={{
                    marginTop: '0.65rem',
                    fontSize: '0.75rem',
                    fontWeight: isActive ? 800 : isCompleted ? 700 : 500,
                    color: isActive ? BLUE : isCompleted ? '#2e7d32' : '#64748b',
                    textAlign: 'center',
                    whiteSpace: 'normal',
                    overflowWrap: 'anywhere',
                    padding: '0 0.15rem',
                  }}
                >
                  {step.name}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
