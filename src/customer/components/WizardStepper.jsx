import React from 'react';
import { FiCheck } from 'react-icons/fi';
import './WizardStepper.css';
import toast from 'react-hot-toast';


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

  const current = visibleSteps[activeStep - 1];

  return (
    <nav className="stepper" aria-label="Application progress">
      {/* Narrow screens: one line of text plus a bar instead of seven cramped labels */}
      <div className="stepper-compact">
        <p>
          <strong>Step {activeStep} of {totalSteps}</strong>
          <span>{current?.name}</span>
        </p>
        <div className="stepper-bar" aria-hidden="true">
          <span style={{ width: `${(activeStep / totalSteps) * 100}%` }} />
        </div>
      </div>

      <ol className="stepper-list">
        {visibleSteps.map((step, index) => {
          const stepNum = index + 1;
          const isActive = stepNum === activeStep;
          const isCompleted = stepNum < activeStep;
          const state = isActive ? 'is-current' : isCompleted ? 'is-done' : 'is-todo';
          return (
            <li key={`${step.id}-${index}`} className={`stepper-item ${state}`}>
              <button
                type="button"
                onClick={() => handleCircleClick(step, stepNum)}
                aria-current={isActive ? 'step' : undefined}
                aria-label={`${step.name}, step ${stepNum} of ${totalSteps}${isCompleted ? ', completed' : ''}`}
                disabled={!isCompleted && !isActive && !onStepClick}
              >
                <span className="stepper-dot">{isCompleted ? <FiCheck size={16} aria-hidden="true" /> : stepNum}</span>
                <span className="stepper-label">{step.name}</span>
              </button>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
