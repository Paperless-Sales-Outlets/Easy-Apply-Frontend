import React from 'react';
import { useTranslation } from 'react-i18next';

export default function CustomerDetailsStep() {
  const { t } = useTranslation();

  return (
    <div>
      <h3 style={{ color: 'var(--slt-blue)', marginBottom: '1.5rem' }}>{t('wizards.refundRequest.customerDetails.heading')}</h3>
      
      <div className="form-group">
        <label className="form-label">{t('wizards.refundRequest.customerDetails.fullName')}</label>
        <input type="text" className="form-control" required />
      </div>

      <div className="form-group flex flex-col-mobile gap-4">
        <div style={{ flex: '1' }}>
          <label className="form-label">{t('wizards.refundRequest.customerDetails.bankName')}</label>
          <input type="text" className="form-control" required />
        </div>
        <div style={{ flex: '1' }}>
          <label className="form-label">{t('wizards.refundRequest.customerDetails.bankBranch')}</label>
          <input type="text" className="form-control" required />
        </div>
      </div>

      <div className="form-group flex flex-col-mobile gap-4 mt-4">
        <div style={{ flex: '1' }}>
          <label className="form-label">{t('wizards.refundRequest.customerDetails.nicBrc')}</label>
          <input type="text" className="form-control" required />
        </div>
        <div style={{ flex: '1' }}>
          <label className="form-label">{t('wizards.refundRequest.customerDetails.contactNo')}</label>
          <input type="tel" className="form-control" required />
        </div>
      </div>

      <div className="form-group mt-4">
        <label className="form-label">{t('wizards.refundRequest.customerDetails.telephone')}</label>
        <input type="tel" className="form-control" required />
      </div>

    </div>
  );
}
