import React from 'react';
import { useTranslation } from 'react-i18next';

export default function CustomerDetailsStep({ isActive }) {
  const { t } = useTranslation();

  return (
    <div>
      <h3 style={{ color: 'var(--slt-blue)', marginBottom: '1.5rem' }}>{t('wizards.reconnection.customerInfo.heading')}</h3>
      
      <div className="form-group">
        <label className="form-label">{t('wizards.reconnection.customerInfo.telephone')}</label>
        <input 
          name="telephone" 
          type="tel" 
          inputMode="numeric"
          pattern="^([1-9][0-9]{8}|0[0-9]{9})$"
          title="Enter 9 digits (not starting with 0) or 10 digits starting with 0"
          className="form-control" 
          required={isActive} 
        />
      </div>

      <div className="form-group">
        <label className="form-label">{t('wizards.reconnection.customerInfo.fullName')}</label>
        <input name="fullName" type="text" className="form-control" required={isActive} />
      </div>

      <div className="form-group flex flex-col-mobile gap-4">
        <div style={{ flex: '1' }}>
          <label className="form-label">{t('wizards.reconnection.customerInfo.nicBrc')}</label>
          <input name="nic" type="text" className="form-control" required={isActive} />
        </div>
        <div style={{ flex: '1' }}>
          <label className="form-label">{t('wizards.reconnection.customerInfo.contactNo')}</label>
          <input 
            name="contactNo" 
            type="tel" 
            inputMode="numeric"
            pattern="^([1-9][0-9]{8}|0[0-9]{9})$"
            maxLength={10}
            title="Enter 9 digits (not starting with 0) or 10 digits starting with 0"
            className="form-control" 
            required={isActive} 
          />
        </div>
      </div>
    </div>
  );
}
