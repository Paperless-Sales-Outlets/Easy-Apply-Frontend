import React from 'react';
import { useTranslation } from 'react-i18next';

export default function DeclarationStep() {
  const { t } = useTranslation();

  return (
    <div>
      <h3 style={{ color: 'var(--slt-blue)', marginBottom: '1.5rem' }}>{t('wizards.customerRequestAcceptance.declaration.heading')}</h3>
      
      <div className="card" style={{ padding: '1.5rem', backgroundColor: 'var(--surface-color)', border: '1px solid var(--border-color)', marginBottom: '1.5rem' }}>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1.5rem', lineHeight: '1.6' }}>
          {t('wizards.customerRequestAcceptance.declaration.declarationText')}
        </p>

        <label className="checkbox-label" style={{ fontWeight: '500', color: 'var(--text-primary)', margin: 0 }}>
          <input type="checkbox" className="checkbox-input" required /> {t('wizards.customerRequestAcceptance.declaration.agreeLabel')}
        </label>
      </div>

    </div>
  );
}
