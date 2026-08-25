import React from 'react';
import { useTranslation } from 'react-i18next';
import Icon from './Icon';

/* Read-only "we already know who you are" panel shown once OTP is verified.
   Rendered above the step content so it stays visible across every step
   (per wireframe page 16: fields here are locked, not re-asked in the form).
   Each field is still submitted via a hidden input under its original name. */
export default function CustomerProfileSummary({ fields }) {
  const { t } = useTranslation();

  return (
    <div
      className="card"
      style={{
        padding: '1.25rem 1.5rem',
        backgroundColor: 'rgba(15, 87, 168, 0.04)',
        border: '1px solid var(--border-color)',
        marginBottom: '2rem',
        boxShadow: 'none',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1rem' }}>
        <Icon name="user-check" size={18} style={{ color: 'var(--slt-blue)', flexShrink: 0 }} />
        <h4 style={{ margin: 0, color: 'var(--slt-blue)', fontSize: '0.95rem' }}>
          {t('common.autoFilledHeading')}
        </h4>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.9rem 1.5rem' }}>
        {fields.map((f) => (
          <div key={f.name}>
            <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
              {f.label}
            </span>
            <span style={{ fontSize: '0.95rem', color: 'var(--text-primary)', fontWeight: 500, wordBreak: 'break-word' }}>
              {f.value || '—'}
            </span>
            <input type="hidden" name={f.name} value={f.value || ''} />
          </div>
        ))}
      </div>
    </div>
  );
}
