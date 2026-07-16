import React from 'react';
import { useTranslation } from 'react-i18next';

export default function GeneralInfoStep({ isActive }) {
  const { t } = useTranslation();

  return (
    <div>
      <h3 style={{ color: 'var(--slt-blue)', marginBottom: '1.5rem' }}>{t('wizards.locationChange.generalInfo.heading')}</h3>
      
      <div className="form-group flex flex-col-mobile gap-4">
        <div style={{ flex: '1' }}>
          <label className="form-label">{t('wizards.locationChange.generalInfo.telephone')}</label>
          <input
            name="telephone"
            type="tel"
            className="form-control"
            inputMode="numeric"
            maxLength={10}
            required={isActive}
            pattern="^([1-9][0-9]{8}|0[0-9]{9})$"
            title="Enter 9 digits (not starting with 0) or 10 digits starting with 0"
          />
        </div>
        <div style={{ flex: '2' }}>
          <label className="form-label">{t('wizards.locationChange.generalInfo.legalOwner')}</label>
          <input name="legalOwner" type="text" className="form-control" required={isActive} />
        </div>
      </div>

      <h4 style={{ color: 'var(--text-primary)', marginTop: '2rem', marginBottom: '1rem' }}>{t('wizards.locationChange.generalInfo.contactHeading')}</h4>
      <div className="card" style={{ padding: '1.5rem', backgroundColor: 'var(--bg-color)', border: '1px solid var(--border-color)', boxShadow: 'none' }}>
        
        <div className="form-group">
          <label className="form-label">{t('wizards.locationChange.generalInfo.contactPerson')}</label>
          <input name="contactPerson" type="text" className="form-control" required={isActive} />
        </div>

        <div className="form-group flex flex-col-mobile gap-4 mt-4">
          <div style={{ flex: '1' }}>
            <label className="form-label">{t('wizards.locationChange.generalInfo.tel')}</label>
            <input
              name="tel"
              type="tel"
              className="form-control"
              inputMode="numeric"
              maxLength={10}
              required={isActive}
              pattern="^([1-9][0-9]{8}|0[0-9]{9})$"
              title="Enter 9 digits (not starting with 0) or 10 digits starting with 0"
            />
          </div>
          <div style={{ flex: '1' }}>
            <label className="form-label">{t('wizards.locationChange.generalInfo.mobile')}</label>
            <input
              name="mobile"
              type="tel"
              className="form-control"
              inputMode="numeric"
              maxLength={10}
              required={isActive}
              pattern="^([1-9][0-9]{8}|0[0-9]{9})$"
              title="Enter 9 digits (not starting with 0) or 10 digits starting with 0"
            />
          </div>
        </div>

        <div className="form-group mt-4">
          <label className="form-label">{t('wizards.locationChange.generalInfo.email')}</label>
          <input name="email" type="email" className="form-control" required={isActive} />
        </div>

      </div>

    </div>
  );
}
