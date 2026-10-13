import React from 'react';
import { FiCheck } from 'react-icons/fi';

export const FULL_ONBOARDING_7_STEPS = [
  'Package Selection',
  'Service Location',
  'Identity & KYC',
  'Digital Signature',
  'Payment',
  'Review & Submit',
  'Tracking'
];

export const FULL_ONBOARDING_9_STEPS = FULL_ONBOARDING_7_STEPS;

/**
 * Progress band. On a laptop it shows every step with its label; on a phone it
 * collapses to "Step 3 of 7 · Identity & KYC" above a segmented bar, so the
 * label never has to be squeezed under a tiny dot.
 */
export default function WizardStepper({ currentStep = 1, steps = FULL_ONBOARDING_7_STEPS, totalStepsOverride = null }) {
  const stepList = steps && steps.length > 0 ? steps : FULL_ONBOARDING_7_STEPS;
  const total = totalStepsOverride || stepList.length;
  const active = Math.max(1, Math.min(currentStep, total));

  return (
    <nav className="wz-steps" aria-label="Application progress">
      <p className="wz-steps__now" aria-hidden="true">
        {`Step ${active} of ${total} · ${stepList[active - 1] || ''}`}
      </p>
      <ol className="wz-steps__list">
        {stepList.map((label, index) => {
          const n = index + 1;
          const state = n < active ? 'is-done' : n === active ? 'is-now' : '';
          return (
            <li
              key={label + n}
              className={`wz-steps__item ${state}`}
              aria-current={n === active ? 'step' : undefined}
            >
              <b>{n < active ? <FiCheck size={14} aria-label="Done" /> : `STEP ${n}`}</b>
              <span>{label}</span>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
