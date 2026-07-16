import React from 'react';
import { useTranslation } from 'react-i18next';

export default function RefundDetailsStep({ isActive }) {
  const { t } = useTranslation();

  return (
    <div>
      <h3 style={{ color: 'var(--slt-blue)', marginBottom: '1.5rem' }}>{t('wizards.refundRequest.refundDetails.heading')}</h3>
      
      <div className="card" style={{ padding: '1.5rem', border: '1px solid var(--border-color)', boxShadow: 'none', marginBottom: '1.5rem' }}>
        <div className="form-group">
          <label className="form-label">{t('wizards.refundRequest.refundDetails.paidAmount')}</label>
          <div style={{ maxWidth: '200px' }}>
            <input type="number" className="form-control" required={isActive} />
          </div>
        </div>

        <div className="form-group mt-4">
          <label className="form-label">{t('wizards.refundRequest.refundDetails.reason')}</label>
          <textarea className="form-control" rows="3" required={isActive}></textarea>
        </div>

        <div className="form-group mt-4">
          <label className="form-label">{t('wizards.refundRequest.refundDetails.receiptUpload')}</label>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
            {t('wizards.refundRequest.refundDetails.receiptNote')}
          </p>
          <input type="file" className="form-control" accept="image/*,.pdf" required={isActive} />
        </div>
      </div>

      <div className="card" style={{ padding: '1.5rem', backgroundColor: 'var(--surface-color)', border: '1px solid var(--border-color)' }}>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1.5rem', lineHeight: '1.6' }}>
          {t('wizards.refundRequest.refundDetails.declaration')}
        </p>

        <label className="checkbox-label" style={{ fontWeight: '500', color: 'var(--text-primary)', margin: 0 }}>
          <input type="checkbox" className="checkbox-input" required={isActive} /> {t('wizards.refundRequest.refundDetails.agreeLabel')}
        </label>
      </div>

    </div>
  );
}
