import React from 'react';
import { useTranslation } from 'react-i18next';

export default function CustomerInfoStep() {
  const { t } = useTranslation();

  return (
    <div>
      <h3 style={{ color: 'var(--slt-blue)', marginBottom: '1.5rem' }}>{t('wizards.packageMigration.customerInfo.heading')}</h3>
      
      <div className="form-group">
        <label className="form-label">{t('wizards.packageMigration.customerInfo.telephone')}</label>
        <input type="tel" className="form-control" required />
      </div>

      <div className="form-group">
        <label className="form-label">{t('wizards.packageMigration.customerInfo.fullName')}</label>
        <input type="text" className="form-control" required />
      </div>

      <div className="form-group flex flex-col-mobile gap-4">
        <div style={{ flex: '1' }}>
          <label className="form-label">{t('wizards.packageMigration.customerInfo.nicBrc')}</label>
          <input type="text" className="form-control" required />
        </div>
        <div style={{ flex: '1' }}>
          <label className="form-label">{t('wizards.packageMigration.customerInfo.contactNo')}</label>
          <input type="tel" className="form-control" required />
        </div>
      </div>

    </div>
  );
}
