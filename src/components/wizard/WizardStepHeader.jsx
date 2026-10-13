import React from 'react';

export default function WizardStepHeader({ stepNumber, totalSteps = 9, title, description }) {
  return (
    <header className="wz-head">
      {stepNumber && (
        <span className="wz-head__eyebrow">
          STEP {stepNumber} OF {totalSteps}
        </span>
      )}
      {title && <h2 className="wz-head__title">{title}</h2>}
      {description && <p className="wz-head__desc">{description}</p>}
    </header>
  );
}
