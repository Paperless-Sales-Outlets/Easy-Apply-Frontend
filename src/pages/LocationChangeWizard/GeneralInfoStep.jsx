import React from 'react';
import { useTranslation } from 'react-i18next';

export default function GeneralInfoStep() {
  const { t } = useTranslation();

  return (
    <div>
      <h3 style={{ color: 'var(--slt-blue)', marginBottom: '1.5rem' }}>{t('wizards.locationChange.generalInfo.heading')}</h3>
      
      <div className="form-group flex gap-4">
        <div style={{ flex: '1' }}>
          <label className="form-label">{t('wizards.locationChange.generalInfo.telephone')}</label>
          <input type="tel" className="form-control" required />
        </div>
        <div style={{ flex: '2' }}>
          <label className="form-label">{t('wizards.locationChange.generalInfo.legalOwner')}</label>
          <input type="text" className="form-control" required />
        </div>
      </div>

      <h4 style={{ color: 'var(--text-primary)', marginTop: '2rem', marginBottom: '1rem' }}>{t('wizards.locationChange.generalInfo.contactHeading')}</h4>
      <div className="card" style={{ padding: '1.5rem', backgroundColor: 'var(--bg-color)', border: '1px solid var(--border-color)', boxShadow: 'none' }}>
        
        <div className="form-group">
          <label className="form-label">{t('wizards.locationChange.generalInfo.contactPerson')}</label>
          <input type="text" className="form-control" required />
        </div>

        <div className="form-group flex gap-4 mt-4">
          <div style={{ flex: '1' }}>
            <label className="form-label">{t('wizards.locationChange.generalInfo.tel')}</label>
            <input type="tel" className="form-control" required />
          </div>
          <div style={{ flex: '1' }}>
            <label className="form-label">{t('wizards.locationChange.generalInfo.mobile')}</label>
            <input type="tel" className="form-control" />
          </div>
        </div>

        <div className="form-group flex gap-4 mt-4">
          <div style={{ flex: '1' }}>
            <label className="form-label">{t('wizards.locationChange.generalInfo.email')}</label>
            <input type="email" className="form-control" />
          </div>
          <div style={{ flex: '1' }}>
            <label className="form-label">{t('wizards.locationChange.generalInfo.fax')}</label>
            <input type="tel" className="form-control" />
          </div>
        </div>

      </div>

    </div>
  );
}
