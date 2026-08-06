import React from 'react';
import { useTranslation } from 'react-i18next';

export default function ServiceDetailsStep({ isActive }) {
  const { t } = useTranslation();

  return (
    <div>
      <h3 style={{ color: 'var(--slt-blue)', marginBottom: '1.5rem' }}>{t('wizards.ownershipChange.serviceDetails.heading')}</h3>

      <div className="form-group">
        <label className="form-label">{t('wizards.ownershipChange.serviceDetails.telephone')}</label>
        <input name="currentTelephone" type="tel" className="form-control" required={isActive} />
      </div>
    </div>
  );
}
