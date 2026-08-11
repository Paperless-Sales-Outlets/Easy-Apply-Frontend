import React from 'react';
import { useTranslation } from 'react-i18next';

export default function NewApplicantStep({ isActive }) {
  const { t } = useTranslation();

  return (
    <div>
      <h3 style={{ color: 'var(--slt-blue)', marginBottom: '1.5rem' }}>{t('wizards.ownershipChange.newApplicant.heading')}</h3>

      <div className="form-group">
        <label className="form-label" htmlFor="na-fullName">{t('wizards.ownershipChange.newApplicant.fullName')}</label>
        <input id="na-fullName" name="fullName" type="text" className="form-control" required={isActive} />
      </div>

      <div className="form-group flex flex-col-mobile gap-4">
        <div style={{ flex: '1', minWidth: 0 }}>
          <label className="form-label" htmlFor="na-nic">{t('wizards.ownershipChange.newApplicant.nicBrc')}</label>
          <input id="na-nic" name="nic" type="text" className="form-control" required={isActive} />
        </div>
        <div style={{ flex: '1', minWidth: 0 }}>
          <label className="form-label" htmlFor="na-contactNo">{t('wizards.ownershipChange.newApplicant.contactNo')}</label>
          <input id="na-contactNo" name="contactNo" type="tel" className="form-control" required={isActive} />
        </div>
      </div>

      <div className="form-group">
        <label className="form-label" htmlFor="na-email">{t('wizards.ownershipChange.newApplicant.email')}</label>
        <input id="na-email" name="email" type="email" className="form-control" required={isActive} />
      </div>

      <div className="form-group">
        <label className="form-label" htmlFor="na-remarks">{t('wizards.ownershipChange.newApplicant.remarks')}</label>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
          {t('wizards.ownershipChange.newApplicant.remarksNote')}
        </p>
        <textarea id="na-remarks" name="newRemarks" className="form-control" rows="3"></textarea>
      </div>

    </div>
  );
}
