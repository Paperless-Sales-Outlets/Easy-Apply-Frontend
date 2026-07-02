import React from 'react';
import { useTranslation } from 'react-i18next';

export default function GeneralInfoStep() {
  const { t } = useTranslation();

  return (
    <div>
      <h3 style={{ color: 'var(--slt-blue)', marginBottom: '1.5rem' }}>{t('wizards.serviceVacation.generalInfo.heading')}</h3>
      
      <div className="form-group">
        <label className="form-label">{t('wizards.serviceVacation.generalInfo.telephone')}</label>
        <input type="tel" className="form-control" required />
      </div>

      <div className="form-group flex flex-col-mobile gap-4">
        <div style={{ flex: '1', maxWidth: '150px' }}>
          <label className="form-label">{t('wizards.serviceVacation.generalInfo.title')}</label>
          <select className="form-control">
            <option>Rev</option>
            <option>Mr</option>
            <option>Ms</option>
          </select>
        </div>
        <div style={{ flex: '3' }}>
          <label className="form-label">{t('wizards.serviceVacation.generalInfo.fullName')}</label>
          <input type="text" className="form-control" required />
        </div>
      </div>

      <div className="form-group">
        <label className="form-label">{t('wizards.serviceVacation.generalInfo.address')}</label>
        <textarea className="form-control" rows="3" required></textarea>
      </div>

      <div className="form-group mt-4">
        <label className="form-label">{t('wizards.serviceVacation.generalInfo.nicBrc')}</label>
        <div style={{ maxWidth: '400px' }}>
          <input type="text" className="form-control" required />
        </div>
      </div>

      <div className="form-group flex flex-col-mobile gap-4 mt-4">
        <div style={{ flex: '1' }}>
          <label className="form-label">{t('wizards.serviceVacation.generalInfo.mobile')}</label>
          <input type="tel" className="form-control" required />
        </div>
        <div style={{ flex: '1' }}>
          <label className="form-label">{t('wizards.serviceVacation.generalInfo.email')}</label>
          <input type="email" className="form-control" required />
        </div>
      </div>

    </div>
  );
}
