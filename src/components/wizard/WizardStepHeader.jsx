import React from 'react';

export default function WizardStepHeader({ stepNumber, totalSteps = 9, title, description }) {
  return (
    <div style={{ marginBottom: '1.75rem' }}>
      {stepNumber && (
        <span 
          style={{ 
            display: 'inline-block',
            fontSize: '0.75rem', 
            fontWeight: 800, 
            color: '#0f57a8', 
            textTransform: 'uppercase', 
            letterSpacing: '0.08em',
            marginBottom: '0.35rem' 
          }}
        >
          STEP {stepNumber} OF {totalSteps}
        </span>
      )}
      {title && (
        <h2 
          style={{ 
            fontSize: '1.65rem', 
            fontWeight: 800, 
            color: '#0b2d5b', 
            margin: '0 0 0.4rem 0',
            letterSpacing: '-0.02em',
            lineHeight: 1.25
          }}
        >
          {title}
        </h2>
      )}
      {description && (
        <p style={{ fontSize: '0.95rem', color: '#64748b', margin: 0, lineHeight: 1.5 }}>
          {description}
        </p>
      )}
    </div>
  );
}
