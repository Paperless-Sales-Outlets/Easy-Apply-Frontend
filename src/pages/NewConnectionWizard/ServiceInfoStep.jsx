import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import AddressInputWithMap from '../../components/form/AddressInputWithMap';

export default function ServiceInfoStep({ formData, handleChange }) {
  const { t } = useTranslation();

  // The bill almost always goes to the address being connected, so that is the
  // default. Unticking reveals the field for the cases where it differs.
  const [billingSameAsInstall, setBillingSameAsInstall] = useState(true);

  useEffect(() => {
    if (!billingSameAsInstall) return;
    if (formData.billingAddress === formData.installAddress) return;
    handleChange({ target: { name: 'billingAddress', value: formData.installAddress || '' } });
  }, [billingSameAsInstall, formData.installAddress]);

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

      <div className="form-group" style={{ marginBottom: billingSameAsInstall ? '1.25rem' : '0.75rem' }}>
        <label style={{ display: 'flex', alignItems: 'flex-start', gap: '0.55rem', fontSize: '0.9rem', color: 'var(--text-primary)', cursor: 'pointer', fontWeight: 600 }}>
          <input
            type="checkbox"
            checked={billingSameAsInstall}
            onChange={(e) => setBillingSameAsInstall(e.target.checked)}
            style={{ marginTop: '0.2rem', accentColor: 'var(--slt-blue)' }}
          />
          <span>
            {t('wizards.newConnection.serviceInfo.billingSameAsInstall', 'Send my bill to the installation address')}
            {billingSameAsInstall && formData.installAddress && (
              <span style={{ display: 'block', fontWeight: 500, color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                {formData.installAddress}
              </span>
            )}
          </span>
        </label>
      </div>

      {!billingSameAsInstall && (
        <AddressInputWithMap
          name="billingAddress"
          label={t('wizards.newConnection.serviceInfo.billingAddress')}
          placeholder={t('wizards.newConnection.serviceInfo.billingAddressPlaceholder')}
          value={formData.billingAddress || ''}
          onChange={handleChange}
        />
      )}

      {/* Whether this person is already an SLTMobitel customer is established at
          sign-in, so asking again here is redundant. The account number is
          carried through automatically; existing customers are only asked the
          one thing that is genuinely a choice — a separate bill or not. */}
      {formData.isExistingCustomer === 'yes' && (
        <div className="form-group" style={{ marginTop: '1.5rem' }}>
          <span className="form-label" id="nc-separateBill-label">
            {t('wizards.newConnection.serviceInfo.separateBill')}
          </span>
          <div className="radio-group" role="radiogroup" aria-labelledby="nc-separateBill-label" style={{ display: 'flex', gap: '1.5rem', marginTop: '0.4rem' }}>
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
                checked={formData.separateBill !== 'yes'}
                onChange={handleChange}
              /> {t('wizards.newConnection.serviceInfo.no', 'No')}
            </label>
          </div>
          <input type="hidden" name="existingNumber" value={formData.existingNumber || ''} />
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
