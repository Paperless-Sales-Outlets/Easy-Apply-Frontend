import React from 'react';
import { useTranslation } from 'react-i18next';
import AddressInputWithMap from '../../components/form/AddressInputWithMap';

export default function CustomerInfoStep({ isActive }) {
  const { t } = useTranslation();

  return (
    <div>
      <h3 style={{ color: 'var(--slt-blue)', marginBottom: '1.5rem' }}>{t('wizards.internetServices.customerInfo.heading')}</h3>
      
      <div className="form-group flex flex-col-mobile gap-4">
        <div style={{ flex: '2' }}>
          <label className="form-label" htmlFor="is-nameFull">{t('wizards.internetServices.customerInfo.nameFull')}</label>
          <input id="is-nameFull" name="nameFull" type="text" className="form-control" required={isActive} />
        </div>
        <div style={{ flex: '1' }}>
          <label className="form-label" htmlFor="is-nic">{t('wizards.internetServices.customerInfo.nicBr')}</label>
          <input id="is-nic" name="nic" type="text" className="form-control" required={isActive} />
        </div>
      </div>

      <AddressInputWithMap
        label={t('wizards.internetServices.customerInfo.billingAddress')}
        required={isActive}
      />

      <div className="form-group flex flex-col-mobile gap-4">
        <div style={{ flex: '1' }}>
          <label className="form-label" htmlFor="is-phone">{t('wizards.internetServices.customerInfo.phone')}</label>
          <input id="is-phone" name="phone" type="tel" className="form-control" required={isActive} />
        </div>
        <div style={{ flex: '1' }}>
          <label className="form-label" htmlFor="is-fax">{t('wizards.internetServices.customerInfo.fax')}</label>
          <input id="is-fax" name="fax" type="tel" className="form-control" />
        </div>
      </div>

      <div className="form-group">
        <label className="form-label" htmlFor="is-email">{t('wizards.internetServices.customerInfo.email')}</label>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <input id="is-email" name="email" type="text" className="form-control" style={{ flex: '1' }} required={isActive} />
          <span style={{ fontWeight: '500', color: 'var(--text-secondary)' }}>{t('wizards.internetServices.customerInfo.emailDomainNote')}</span>
        </div>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
          {t('wizards.internetServices.customerInfo.emailNote')}
        </p>
      </div>

    </div>
  );
}
