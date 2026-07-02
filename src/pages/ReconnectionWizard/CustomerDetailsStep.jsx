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
          <input type="text" className="form-control" />
        </div>
        <div style={{ flex: '1' }}>
          <label className="form-label">{t('wizards.reconnection.customerInfo.nearestTp')}</label>
          <input type="text" className="form-control" />
        </div>
      </div>

      <div className="form-group">
        <label className="form-label">{t('wizards.reconnection.customerInfo.fullName')}</label>
        <input type="text" className="form-control" />
      </div>

      <div className="form-group flex flex-col-mobile gap-4">
        <div style={{ flex: '1' }}>
          <label className="form-label">{t('wizards.reconnection.customerInfo.nicBrc')}</label>
          <input type="text" className="form-control" />
        </div>
        <div style={{ flex: '1' }}>
          <label className="form-label">{t('wizards.reconnection.customerInfo.contactNo')}</label>
          <input type="tel" className="form-control" />
        </div>
      </div>
    </div>
  );
}
