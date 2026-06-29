import React from 'react';
import { useTranslation } from 'react-i18next';

export default function AgreementStep() {
  const { t } = useTranslation();

  return (
    <div>
      <h3 style={{ color: 'var(--slt-blue)', marginBottom: '1.5rem' }}>{t('wizards.termination.agreement.heading')}</h3>

      <div className="card" style={{ padding: '1.5rem', backgroundColor: 'var(--surface-color)', border: '1px solid var(--border-color)', marginBottom: '1.5rem' }}>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1rem', lineHeight: '1.6' }}>
          {t('wizards.termination.agreement.para1')}
        </p>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1.5rem', lineHeight: '1.6' }}>
          {t('wizards.termination.agreement.para2')}
        </p>
        
        <label className="checkbox-label" style={{ fontWeight: '500', color: 'var(--text-primary)' }}>
          <input type="checkbox" className="checkbox-input" required /> {t('wizards.termination.agreement.agreeLabel')}
        </label>
      </div>

    </div>
  );
}
