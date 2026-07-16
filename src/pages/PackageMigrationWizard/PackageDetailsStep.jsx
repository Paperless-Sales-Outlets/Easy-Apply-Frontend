import React from 'react';
import { useTranslation } from 'react-i18next';

export default function PackageDetailsStep({ isActive }) {
  const { t } = useTranslation();

  return (
    <div>
      <h3 style={{ color: 'var(--slt-blue)', marginBottom: '1.5rem' }}>{t('wizards.packageMigration.packageDetails.heading')}</h3>
      
      <div className="card" style={{ padding: '1.5rem', backgroundColor: 'var(--surface-color)', border: '1px solid var(--border-color)', marginBottom: '1.5rem' }}>
        <div className="form-group flex flex-col-mobile gap-4">
          <div style={{ flex: '1' }}>
            <label className="form-label">{t('wizards.packageMigration.packageDetails.existingPackage')}</label>
            <input type="text" className="form-control" required={isActive} />
          </div>
          <div style={{ flex: '1' }}>
            <label className="form-label">{t('wizards.packageMigration.packageDetails.requiredPackage')}</label>
            <input type="text" className="form-control" required={isActive} />
          </div>
        </div>

        <div className="form-group mt-4">
          <label className="form-label">{t('wizards.packageMigration.packageDetails.effectiveDate')}</label>
          <div style={{ maxWidth: '200px' }}>
            <input type="date" className="form-control" required={isActive} />
          </div>
        </div>
      </div>

      <div className="form-group">
        <label className="form-label">{t('wizards.packageMigration.packageDetails.remarks')}</label>
        <textarea className="form-control" rows="3"></textarea>
      </div>

      <div className="card mt-6" style={{ padding: '1.5rem', backgroundColor: 'var(--bg-color)', border: '1px solid var(--border-color)', boxShadow: 'none' }}>
        <label className="checkbox-label" style={{ fontWeight: '500', color: 'var(--text-primary)', margin: 0 }}>
          <input type="checkbox" className="checkbox-input" required={isActive} /> {t('wizards.packageMigration.packageDetails.declaration')}
        </label>
      </div>

    </div>
  );
}
