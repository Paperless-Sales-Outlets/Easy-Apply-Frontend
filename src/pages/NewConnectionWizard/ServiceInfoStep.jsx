import React from 'react';
import { useTranslation } from 'react-i18next';

export default function ServiceInfoStep() {
  const { t } = useTranslation();

  return (
    <div>
      <h3 style={{ color: 'var(--slt-blue)', marginBottom: '1.5rem' }}>{t('wizards.newConnection.serviceInfo.heading')}</h3>
      
      <div className="form-group">
        <label className="form-label">{t('wizards.newConnection.serviceInfo.installAddress')}</label>
        <textarea className="form-control" rows="3"></textarea>
      </div>

      <div className="form-group">
        <label className="form-label">{t('wizards.newConnection.serviceInfo.billingAddress')}</label>
        <textarea className="form-control" rows="3" placeholder={t('wizards.newConnection.serviceInfo.billingAddressPlaceholder')}></textarea>
      </div>

      <h4 style={{ marginTop: '2rem', marginBottom: '1rem', color: 'var(--text-primary)' }}>{t('wizards.newConnection.serviceInfo.existingCustomer')}</h4>
      
      <div className="form-group flex gap-4 items-center">
        <div style={{ flex: '1' }}>
          <label className="form-label">{t('wizards.newConnection.serviceInfo.existingNumber')}</label>
          <input type="text" className="form-control" />
        </div>
        <div style={{ flex: '1' }}>
          <label className="form-label">{t('wizards.newConnection.serviceInfo.separateBill')}</label>
          <div className="radio-group">
            <label className="radio-label">
              <input type="radio" name="separateBill" value="yes" className="radio-input" /> {t('wizards.newConnection.serviceInfo.yes')}
            </label>
            <label className="radio-label">
              <input type="radio" name="separateBill" value="no" className="radio-input" /> {t('wizards.newConnection.serviceInfo.no')}
            </label>
          </div>
        </div>
      </div>

      <h4 style={{ marginTop: '2rem', marginBottom: '1rem', color: 'var(--text-primary)' }}>{t('wizards.newConnection.serviceInfo.billingMode')}</h4>
      <div className="form-group radio-group">
        <label className="radio-label">
          <input type="radio" name="billingMode" value="email" className="radio-input" /> {t('wizards.newConnection.serviceInfo.ebillEmail')}
        </label>
        <label className="radio-label">
          <input type="radio" name="billingMode" value="sms" className="radio-input" /> {t('wizards.newConnection.serviceInfo.ebillSms')}
        </label>
        <label className="radio-label">
          <input type="radio" name="billingMode" value="post" className="radio-input" /> {t('wizards.newConnection.serviceInfo.printedBill')}
        </label>
      </div>
      <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{t('wizards.newConnection.serviceInfo.natureNote')}</p>

    </div>
  );
}
