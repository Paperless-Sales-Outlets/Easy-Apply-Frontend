import React from 'react';
import { useTranslation } from 'react-i18next';

export default function DeclarationStep() {
  const { t } = useTranslation();

  return (
    <div>
      <h3 style={{ color: 'var(--slt-blue)', marginBottom: '1.5rem' }}>{t('wizards.ownershipChange.declaration.heading')}</h3>

      <div className="card" style={{ padding: '1.5rem', backgroundColor: 'var(--surface-color)', border: '1px solid var(--border-color)', marginBottom: '1.5rem' }}>
        <h4 style={{ color: 'var(--text-primary)', marginBottom: '1rem' }}>{t('wizards.ownershipChange.declaration.currConsentHeading')}</h4>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
          {t('wizards.ownershipChange.declaration.currConsentText')}
        </p>
        <label className="checkbox-label" style={{ fontWeight: '500' }}>
          <input type="checkbox" className="checkbox-input" required /> {t('wizards.ownershipChange.declaration.currConsentLabel')}
        </label>
      </div>

      <div className="card" style={{ padding: '1.5rem', backgroundColor: 'var(--surface-color)', border: '1px solid var(--border-color)' }}>
        <h4 style={{ color: 'var(--text-primary)', marginBottom: '1rem' }}>{t('wizards.ownershipChange.declaration.newDeclHeading')}</h4>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
          {t('wizards.ownershipChange.declaration.newDeclText')}
        </p>
        <label className="checkbox-label" style={{ fontWeight: '500' }}>
          <input type="checkbox" className="checkbox-input" required /> {t('wizards.ownershipChange.declaration.newDeclLabel')}
        </label>
      </div>

      <div style={{ marginTop: '1.5rem', padding: '1rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
        <ul style={{ paddingLeft: '1.5rem', lineHeight: '1.6' }}>
          <li>{t('wizards.ownershipChange.declaration.terms1')}</li>
          <li>{t('wizards.ownershipChange.declaration.terms2')}</li>
          <li>{t('wizards.ownershipChange.declaration.terms3')}</li>
        </ul>
      </div>

    </div>
  );
}
