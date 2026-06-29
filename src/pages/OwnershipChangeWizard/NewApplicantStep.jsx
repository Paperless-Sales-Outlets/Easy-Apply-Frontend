import React from 'react';
import { useTranslation } from 'react-i18next';

export default function NewApplicantStep() {
  const { t } = useTranslation();

  return (
    <div>
      <h3 style={{ color: 'var(--slt-blue)', marginBottom: '1.5rem' }}>{t('wizards.ownershipChange.newApplicant.heading')}</h3>
      
      <div className="form-group">
        <label className="form-label">{t('wizards.ownershipChange.newApplicant.fullName')}</label>
        <input type="text" className="form-control" required />
      </div>

      <div className="form-group flex gap-4">
        <div style={{ flex: '1' }}>
          <label className="form-label">{t('wizards.ownershipChange.newApplicant.nicBrc')}</label>
          <input type="text" className="form-control" required />
        </div>
        <div style={{ flex: '1' }}>
          <label className="form-label">{t('wizards.ownershipChange.newApplicant.contactNo')}</label>
          <input type="tel" className="form-control" required />
        </div>
      </div>

      <div className="form-group">
        <label className="form-label">{t('wizards.ownershipChange.newApplicant.email')}</label>
        <input type="email" className="form-control" required />
      </div>

      <div className="form-group">
        <label className="form-label">{t('wizards.ownershipChange.newApplicant.remarks')}</label>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
          {t('wizards.ownershipChange.newApplicant.remarksNote')}
        </p>
        <textarea className="form-control" rows="3"></textarea>
      </div>

    </div>
  );
}
