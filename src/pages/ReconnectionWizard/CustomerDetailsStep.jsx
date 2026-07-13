import React from 'react';
import { useTranslation } from 'react-i18next';

export default function CustomerDetailsStep() {
  const { t } = useTranslation();

  return (
    <div>
      <h3 style={{ color: 'var(--slt-blue)', marginBottom: '1.5rem' }}>{t('wizards.reconnection.customerInfo.heading')}</h3>
      
      <div className="form-group flex flex-col-mobile gap-4">
        <div style={{ flex: '1' }}>
          <label className="form-label">{t('wizards.reconnection.customerInfo.telephone')}</label>
          <input name="telephone" type="text" className="form-control" required />
        </div>
        <div style={{ flex: '1' }}>
          <label className="form-label">{t('wizards.reconnection.customerInfo.nearestTp')}</label>
          <input name="nearestTp" type="text" className="form-control" />
        </div>
      </div>

      <div className="form-group">
        <label className="form-label">{t('wizards.reconnection.customerInfo.fullName')}</label>
        <input name="fullName" type="text" className="form-control" required />
      </div>

      <div className="form-group flex flex-col-mobile gap-4">
        <div style={{ flex: '1' }}>
          <label className="form-label">{t('wizards.reconnection.customerInfo.nicBrc')}</label>
          <input name="nic" type="text" className="form-control" required />
        </div>
        <div style={{ flex: '1' }}>
          <label className="form-label">{t('wizards.reconnection.customerInfo.contactNo')}</label>
          <input name="contactNo" type="tel" className="form-control" required />
        </div>
      </div>
    </div>
  );
}
