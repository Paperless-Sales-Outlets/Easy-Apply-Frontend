import React from 'react';

/** Heading and 'step N of M' label for a wizard step. */
export default function WizardStepHeader({ title, description }) {
  return (
    <header style={{ marginBottom: 'var(--s5)' }}>
      {title && <h2 style={{ fontSize: 'var(--text-2xl)', marginBottom: 'var(--s2)' }}>{title}</h2>}
      {description && (
        <p style={{ fontSize: 'var(--text-base)', color: 'var(--grey-600)', maxWidth: '42rem' }}>{description}</p>
      )}
    </header>
  );
}
