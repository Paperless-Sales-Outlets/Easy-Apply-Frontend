import React from 'react';
import { useTranslation } from 'react-i18next';

export default function PackageDetailsStep({ isActive }) {
  const { t } = useTranslation();

  return (
    <div>
      <h3 style={{ color: 'var(--slt-blue)', marginBottom: '1.5rem' }}>{t('wizards.packageMigration.packageDetails.heading')}</h3>

      <div className="card" style={{ padding: '1.5rem', backgroundColor: 'var(--surface-color)', border: '1px solid var(--border-color)', marginBottom: '1.5rem' }}>
        <div className="form-group">
          <label className="form-label" htmlFor="pm-requiredPackage">{t('wizards.packageMigration.packageDetails.requiredPackage')}</label>
          <input id="pm-requiredPackage" name="requiredPackage" type="text" className="form-control" required={isActive} />
        </div>

        <div className="form-group mt-4">
          <label className="form-label" htmlFor="pm-effectiveDate">{t('wizards.packageMigration.packageDetails.effectiveDate')}</label>
          <div style={{ maxWidth: '200px' }}>
            <input id="pm-effectiveDate" name="effectiveDate" type="date" className="form-control" required={isActive} />
          </div>
        </div>
      </div>

      <div className="form-group">
        <label className="form-label" htmlFor="pm-remarks">{t('wizards.packageMigration.packageDetails.remarks')}</label>
        <textarea id="pm-remarks" name="remarks" className="form-control" rows="3"></textarea>
      </div>

      <div className="card mt-6" style={{ padding: '1.5rem', backgroundColor: 'var(--bg-color)', border: '1px solid var(--border-color)', boxShadow: 'none' }}>
        <h4 style={{ color: 'var(--text-primary)', marginBottom: '1rem' }}>{t('wizards.packageMigration.packageDetails.declarationHeading')}</h4>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1.5rem', lineHeight: '1.6' }}>
          {t('wizards.packageMigration.packageDetails.declarationText')}
        </p>
        <label className="checkbox-label" style={{ fontWeight: '500', color: 'var(--text-primary)', margin: 0 }}>
          <input type="checkbox" name="declarationAccepted" className="checkbox-input" required={isActive} /> {t('wizards.packageMigration.packageDetails.declarationLabel')}
        </label>
      </div>

    </div>
  );
}
