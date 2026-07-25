import React from 'react';
import { useTranslation } from 'react-i18next';
import AddressInputWithMap from '../../components/form/AddressInputWithMap';

export default function ServiceInfoStep({ formData, handleChange }) {
  const { t } = useTranslation();

  return (
    <div>
      <h3 style={{ color: 'var(--slt-blue)', marginBottom: '1.5rem' }}>
        {t('wizards.newConnection.serviceInfo.heading')}
      </h3>
      
      <AddressInputWithMap
        name="installAddress"
        label={t('wizards.newConnection.serviceInfo.installAddress')}
        value={formData.installAddress || ''}
        onChange={handleChange}
        required
      />

      <AddressInputWithMap
        name="billingAddress"
        label={t('wizards.newConnection.serviceInfo.billingAddress')}
        placeholder={t('wizards.newConnection.serviceInfo.billingAddressPlaceholder')}
        value={formData.billingAddress || ''}
        onChange={handleChange}
      />

      <h4 style={{ marginTop: '2rem', marginBottom: '1rem', color: 'var(--text-primary)' }}>
        {t('wizards.newConnection.serviceInfo.existingCustomer')}
      </h4>

      {/* Existing Customer Radio Selector */}
      <div className="form-group" style={{ marginBottom: '1.25rem' }}>
        <label className="form-label">
          {t('wizards.newConnection.serviceInfo.areYouExistingCustomer', 'Are you an existing SLTMobitel customer?')}
        </label>
        <div className="radio-group" style={{ display: 'flex', gap: '1.5rem', marginTop: '0.4rem' }}>
          <label className="radio-label" style={{ cursor: 'pointer' }}>
            <input 
              type="radio" 
              name="isExistingCustomer" 
              value="yes" 
              className="radio-input" 
              checked={formData.isExistingCustomer === 'yes'} 
              onChange={handleChange} 
            /> {t('wizards.newConnection.serviceInfo.yes', 'Yes')}
          </label>
          <label className="radio-label" style={{ cursor: 'pointer' }}>
            <input 
              type="radio" 
              name="isExistingCustomer" 
              value="no" 
              className="radio-input" 
              checked={formData.isExistingCustomer !== 'yes'} 
              onChange={handleChange} 
            /> {t('wizards.newConnection.serviceInfo.no', 'No')}
          </label>
        </div>
      </div>

      {/* Conditional Existing Customer Details */}
      {formData.isExistingCustomer === 'yes' && (
        <div className="form-group flex gap-4 items-center" style={{ marginTop: '0.75rem', padding: '1.25rem', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
          <div style={{ flex: '1' }}>
            <label className="form-label">{t('wizards.newConnection.serviceInfo.existingNumber')} *</label>
            <input 
              name="existingNumber" 
              type="text" 
              className="form-control" 
              placeholder="e.g. 0112123456 or Account No"
              value={formData.existingNumber || ''} 
              onChange={handleChange} 
              required={formData.isExistingCustomer === 'yes'}
            />
          </div>
          <div style={{ flex: '1' }}>
            <label className="form-label">{t('wizards.newConnection.serviceInfo.separateBill')}</label>
            <div className="radio-group">
              <label className="radio-label" style={{ cursor: 'pointer' }}>
                <input 
                  type="radio" 
                  name="separateBill" 
                  value="yes" 
                  className="radio-input" 
                  checked={formData.separateBill === 'yes'} 
                  onChange={handleChange} 
                /> {t('wizards.newConnection.serviceInfo.yes', 'Yes')}
              </label>
              <label className="radio-label" style={{ cursor: 'pointer' }}>
                <input 
                  type="radio" 
                  name="separateBill" 
                  value="no" 
                  className="radio-input" 
                  checked={formData.separateBill === 'no'} 
                  onChange={handleChange} 
                /> {t('wizards.newConnection.serviceInfo.no', 'No')}
              </label>
            </div>
          </div>
        </div>
      )}

      <h4 style={{ marginTop: '2rem', marginBottom: '1rem', color: 'var(--text-primary)' }}>
        {t('wizards.newConnection.serviceInfo.billingMode')}
      </h4>
      <div className="form-group radio-group">
        <label className="radio-label" style={{ cursor: 'pointer' }}>
          <input 
            type="radio" 
            name="billingMode" 
            value="email" 
            className="radio-input" 
            checked={formData.billingMode === 'email'} 
            onChange={handleChange} 
            required 
          /> {t('wizards.newConnection.serviceInfo.ebillEmail')}
        </label>
        <label className="radio-label" style={{ cursor: 'pointer' }}>
          <input 
            type="radio" 
            name="billingMode" 
            value="sms" 
            className="radio-input" 
            checked={formData.billingMode === 'sms'} 
            onChange={handleChange} 
          /> {t('wizards.newConnection.serviceInfo.ebillSms')}
        </label>
        <label className="radio-label" style={{ cursor: 'pointer' }}>
          <input 
            type="radio" 
            name="billingMode" 
            value="post" 
            className="radio-input" 
            checked={formData.billingMode === 'post'} 
            onChange={handleChange} 
          /> {t('wizards.newConnection.serviceInfo.printedBill')}
        </label>
      </div>
      <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
        {t('wizards.newConnection.serviceInfo.natureNote')}
      </p>
    </div>
  );
}
