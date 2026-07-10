import React from 'react';
import { useTranslation } from 'react-i18next';

export default function CustomerInfoStep() {
  const { t } = useTranslation();

  return (
    <div>
      <h3 style={{ color: 'var(--slt-blue)', marginBottom: '1.5rem' }}>{t('wizards.newConnection.customerInfo.heading')}</h3>
      
      <div className="form-group">
        <label className="form-label">{t('wizards.newConnection.customerInfo.customerType')}</label>
        <div className="radio-group">
          <label className="radio-label">
            <input type="radio" name="customerType" value="home" className="radio-input" /> {t('wizards.newConnection.customerInfo.home')}
          </label>
          <label className="radio-label">
            <input type="radio" name="customerType" value="office" className="radio-input" /> {t('wizards.newConnection.customerInfo.office')}
          </label>
          <label className="radio-label">
            <input type="radio" name="customerType" value="religious" className="radio-input" /> {t('wizards.newConnection.customerInfo.religious')}
          </label>
        </div>
      </div>

      <div className="form-group flex flex-col-mobile gap-4">
        <div style={{ flex: '1' }}>
          <label className="form-label">{t('wizards.newConnection.customerInfo.title')}</label>
          <select name="title" className="form-control" defaultValue="">
            <option value="" disabled>{t('wizards.newConnection.customerInfo.select')}</option>
            <option value="Rev">{t('wizards.newConnection.customerInfo.rev')}</option>
            <option value="Mr">{t('wizards.newConnection.customerInfo.mr')}</option>
            <option value="Ms">{t('wizards.newConnection.customerInfo.ms')}</option>
            <option value="Other">{t('wizards.newConnection.customerInfo.other')}</option>
          </select>
        </div>
        <div style={{ flex: '3' }}>
          <label className="form-label">{t('wizards.newConnection.customerInfo.nameFull')}</label>
          <input name="fullName" type="text" className="form-control" placeholder={t('wizards.newConnection.customerInfo.namePlaceholder')} />
        </div>
      </div>

      <div className="form-group flex flex-col-mobile gap-4">
        <div style={{ flex: '1' }}>
          <label className="form-label">{t('wizards.newConnection.customerInfo.dob')}</label>
          <input name="dob" type="date" className="form-control" />
        </div>
        <div style={{ flex: '1' }}>
          <label className="form-label">{t('wizards.newConnection.customerInfo.nic')}</label>
          <input name="nic" type="text" className="form-control" required />
        </div>
        <div style={{ flex: '1' }}>
          <label className="form-label">{t('wizards.newConnection.customerInfo.taxExemption')}</label>
          <input name="taxExemption" type="text" className="form-control" />
        </div>
      </div>

      <div className="form-group">
        <label className="form-label">{t('wizards.newConnection.customerInfo.address')}</label>
        <textarea name="address" className="form-control" rows="3" required></textarea>
      </div>

      <h4 style={{ marginTop: '2rem', marginBottom: '1rem', color: 'var(--text-primary)' }}>{t('wizards.newConnection.customerInfo.contactDetails')}</h4>
      
      <div className="form-group flex flex-col-mobile gap-4">
        <div style={{ flex: '1' }}>
          <label className="form-label">{t('wizards.newConnection.customerInfo.contactName')}</label>
          <input name="contactName" type="text" className="form-control" required />
        </div>
      </div>

      <div className="form-group flex flex-col-mobile gap-4">
        <div style={{ flex: '1' }}>
          <label className="form-label">{t('wizards.newConnection.customerInfo.fixedNumber')}</label>
          <input name="fixedNumber" type="tel" className="form-control" />
        </div>
        <div style={{ flex: '1' }}>
          <label className="form-label">{t('wizards.newConnection.customerInfo.mobileNumber')}</label>
          <input name="mobileNumber" type="tel" className="form-control" required />
        </div>
      </div>

      <div className="form-group flex flex-col-mobile gap-4">
        <div style={{ flex: '1' }}>
          <label className="form-label">{t('wizards.newConnection.customerInfo.faxNumber')}</label>
          <input name="faxNumber" type="tel" className="form-control" />
        </div>
        <div style={{ flex: '1' }}>
          <label className="form-label">{t('wizards.newConnection.customerInfo.email')}</label>
          <input name="email" type="email" className="form-control" required />
        </div>
      </div>
      <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
        {t('wizards.newConnection.customerInfo.mobileNote')}
      </p>

    </div>
  );
}
