import React from 'react';
import { useTranslation } from 'react-i18next';

export default function CustomerDetailsStep({ isActive }) {
  const { t } = useTranslation();

  return (
    <div>
      <h3 style={{ color: 'var(--slt-blue)', marginBottom: '1.5rem' }}>{t('wizards.refundRequest.customerDetails.heading')}</h3>

      <div className="form-group flex flex-col-mobile gap-4">
        <div style={{ flex: '1' }}>
          <label className="form-label" htmlFor="custom-bankName">{t('wizards.refundRequest.customerDetails.bankName')}</label>
          <input id="custom-bankName" name="bankName" type="text" className="form-control" required={isActive} />
        </div>
        <div style={{ flex: '1' }}>
          <label className="form-label" htmlFor="custom-bankBranch">{t('wizards.refundRequest.customerDetails.bankBranch')}</label>
          <input id="custom-bankBranch" name="bankBranch" type="text" className="form-control" required={isActive} />
        </div>
      </div>
    </div>
  );
}
