import React from 'react';
import { useTranslation } from 'react-i18next';

export default function ValueAddedServicesStep() {
  const { t } = useTranslation();

  return (
    <div>
      <h3 style={{ color: 'var(--slt-blue)', marginBottom: '1.5rem' }}>{t('wizards.newConnection.vas.heading')}</h3>
      
      <div className="form-group">
        <label className="form-label">{t('wizards.newConnection.vas.requiredVas')}</label>
        <div className="radio-group" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)' }}>
          {[
            t('wizards.newConnection.vas.vasA'), t('wizards.newConnection.vas.vasB'), 
            t('wizards.newConnection.vas.vasC'), t('wizards.newConnection.vas.vasD'),
            t('wizards.newConnection.vas.vasE'), t('wizards.newConnection.vas.vasF'),
            t('wizards.newConnection.vas.vasG'), t('wizards.newConnection.vas.vasH'),
            t('wizards.newConnection.vas.vasI'), t('wizards.newConnection.vas.vasJ'), 
            t('wizards.newConnection.vas.vasK'), t('wizards.newConnection.vas.vasL')
          ].map(vas => (
            <label key={vas} className="checkbox-label">
              <input type="checkbox" className="checkbox-input" /> {vas}
            </label>
          ))}
        </div>
      </div>

      <div className="form-group mt-4">
        <label className="form-label">{t('wizards.newConnection.vas.otherVas')}</label>
        <div className="radio-group">
          {[
            t('wizards.newConnection.vas.otherA'), t('wizards.newConnection.vas.otherB'), 
            t('wizards.newConnection.vas.otherC'), t('wizards.newConnection.vas.otherD'), 
            t('wizards.newConnection.vas.otherE')
          ].map(vas => (
            <label key={vas} className="checkbox-label">
              <input type="checkbox" className="checkbox-input" /> {vas}
            </label>
          ))}
        </div>
      </div>

      <h4 style={{ marginTop: '2rem', marginBottom: '1rem', color: 'var(--text-primary)' }}>{t('wizards.newConnection.vas.agreementHeading')}</h4>
      <div className="card" style={{ padding: '1.5rem', backgroundColor: 'var(--surface-color)', border: '1px solid var(--border-color)', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
        <p style={{ marginBottom: '1rem' }}>
          {t('wizards.newConnection.vas.agreementText')}
        </p>
        <label className="checkbox-label" style={{ color: 'var(--text-primary)', fontWeight: '500' }}>
          <input type="checkbox" className="checkbox-input" required /> {t('wizards.newConnection.vas.agreeLabel')}
        </label>
      </div>
      
    </div>
  );
}
