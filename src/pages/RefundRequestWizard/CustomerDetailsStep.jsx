import React from 'react';
import { useTranslation } from 'react-i18next';

export default function CustomerDetailsStep({ isActive }) {
  const { t } = useTranslation();

  return (
    <div>
      <h3 style={{ color: 'var(--slt-blue)', marginBottom: '1.5rem' }}>{t('wizards.refundRequest.customerDetails.heading')}</h3>
      
      <div className="form-group">
        <label className="form-label">{t('wizards.refundRequest.customerDetails.fullName')}</label>
        <input name="fullName" type="text" className="form-control" required={isActive} />
      </div>

      <div className="form-group flex flex-col-mobile gap-4">
        <div style={{ flex: '1' }}>
          <label className="form-label">{t('wizards.refundRequest.customerDetails.bankName')}</label>
          <input name="bankName" type="text" className="form-control" required={isActive} />
        </div>
        <div style={{ flex: '1' }}>
          <label className="form-label">{t('wizards.refundRequest.customerDetails.bankBranch')}</label>
          <input name="bankBranch" type="text" className="form-control" required={isActive} />
        </div>
      </div>

      <div className="form-group flex flex-col-mobile gap-4 mt-4">
        <div style={{ flex: '1' }}>
          <label className="form-label">{t('wizards.refundRequest.customerDetails.nicBrc')}</label>
          <input name="nic" type="text" className="form-control" required={isActive} />
        </div>
        <div style={{ flex: '1' }}>
          <label className="form-label">{t('wizards.refundRequest.customerDetails.contactNo')}</label>
          <input name="contactNo" type="tel" className="form-control" required={isActive} />
        </div>
      </div>

      <div className="form-group mt-4">
        <label className="form-label">{t('wizards.refundRequest.customerDetails.telephone')}</label>
        <input name="telephone" type="tel" className="form-control" required={isActive} />
      </div>

    </div>
  );
}
