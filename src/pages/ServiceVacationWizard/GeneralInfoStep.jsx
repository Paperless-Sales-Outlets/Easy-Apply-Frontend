import React from 'react';
import { useTranslation } from 'react-i18next';

export default function GeneralInfoStep({ isActive }) {
  const { t } = useTranslation();

  return (
    <div>
      <h3 style={{ color: 'var(--slt-blue)', marginBottom: '1.5rem' }}>{t('wizards.serviceVacation.generalInfo.heading')}</h3>
      
      <div className="form-group">
        <label className="form-label">{t('wizards.serviceVacation.generalInfo.telephone')}</label>
        <input name="telephone" type="tel" className="form-control" required={isActive} />
      </div>

      <div className="form-group flex flex-col-mobile gap-4">
        <div style={{ flex: '1', maxWidth: '150px' }}>
          <label className="form-label">{t('wizards.serviceVacation.generalInfo.title')}</label>
          <select name="title" className="form-control">
            <option>Rev</option>
            <option>Mr</option>
            <option>Ms</option>
          </select>
        </div>
        <div style={{ flex: '3' }}>
          <label className="form-label">{t('wizards.serviceVacation.generalInfo.fullName')}</label>
          <input name="fullName" type="text" className="form-control" required={isActive} />
        </div>
      </div>

      <div className="form-group">
        <label className="form-label">{t('wizards.serviceVacation.generalInfo.address')}</label>
        <textarea name="address" className="form-control" rows="3" required={isActive}></textarea>
      </div>

      <div className="form-group mt-4">
        <label className="form-label">{t('wizards.serviceVacation.generalInfo.nicBrc')}</label>
        <div style={{ maxWidth: '400px' }}>
          <input name="nic" type="text" className="form-control" required={isActive} />
        </div>
      </div>

      <div className="form-group flex flex-col-mobile gap-4 mt-4">
        <div style={{ flex: '1' }}>
          <label className="form-label">{t('wizards.serviceVacation.generalInfo.mobile')}</label>
          <input name="mobile" type="tel" className="form-control" required={isActive} />
        </div>
        <div style={{ flex: '1' }}>
          <label className="form-label">{t('wizards.serviceVacation.generalInfo.email')}</label>
          <input name="email" type="email" className="form-control" required={isActive} />
        </div>
      </div>

    </div>
  );
}
