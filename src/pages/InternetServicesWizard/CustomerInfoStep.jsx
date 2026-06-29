import React from 'react';
import { useTranslation } from 'react-i18next';

export default function CustomerInfoStep() {
  const { t } = useTranslation();

  return (
    <div>
      <h3 style={{ color: 'var(--slt-blue)', marginBottom: '1.5rem' }}>{t('wizards.internetServices.customerInfo.heading')}</h3>
      
      <div className="form-group flex gap-4">
        <div style={{ flex: '2' }}>
          <label className="form-label">{t('wizards.internetServices.customerInfo.nameFull')}</label>
          <input type="text" className="form-control" required />
        </div>
        <div style={{ flex: '1' }}>
          <label className="form-label">{t('wizards.internetServices.customerInfo.nicBr')}</label>
          <input type="text" className="form-control" required />
        </div>
      </div>

      <div className="form-group">
        <label className="form-label">{t('wizards.internetServices.customerInfo.billingAddress')}</label>
        <textarea className="form-control" rows="3" required></textarea>
      </div>

      <div className="form-group flex gap-4">
        <div style={{ flex: '1' }}>
          <label className="form-label">{t('wizards.internetServices.customerInfo.phone')}</label>
          <input type="tel" className="form-control" required />
        </div>
        <div style={{ flex: '1' }}>
          <label className="form-label">{t('wizards.internetServices.customerInfo.fax')}</label>
          <input type="tel" className="form-control" />
        </div>
      </div>

      <div className="form-group">
        <label className="form-label">{t('wizards.internetServices.customerInfo.email')}</label>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <input type="text" className="form-control" style={{ flex: '1' }} required />
          <span style={{ fontWeight: '500', color: 'var(--text-secondary)' }}>{t('wizards.internetServices.customerInfo.emailDomainNote')}</span>
        </div>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
          {t('wizards.internetServices.customerInfo.emailNote')}
        </p>
      </div>

    </div>
  );
}
