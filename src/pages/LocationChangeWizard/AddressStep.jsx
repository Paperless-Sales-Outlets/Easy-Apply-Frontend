import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

export default function AddressStep({ isActive }) {
  const { t } = useTranslation();
  const [billingEffective, setBillingEffective] = useState('immediately');

  return (
    <div>
      <h3 style={{ color: 'var(--slt-blue)', marginBottom: '1.5rem' }}>{t('wizards.locationChange.address.heading')}</h3>
      
      <div className="card" style={{ padding: '1.5rem', border: '1px solid var(--border-color)', boxShadow: 'none', marginBottom: '2rem' }}>
        <h4 style={{ color: 'var(--text-primary)', marginBottom: '1rem' }}>{t('wizards.locationChange.address.serviceHeading')}</h4>
        
        <div className="form-group">
          <label className="form-label">{t('wizards.locationChange.address.newServiceAddress')}</label>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
            {t('wizards.locationChange.address.newServiceAddressNote')}
          </p>
          <textarea className="form-control" rows="3" required={isActive}></textarea>
          <div style={{ marginTop: '0.5rem', padding: '0.5rem', backgroundColor: 'rgba(0, 166, 80, 0.05)', borderLeft: '3px solid var(--slt-green)', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            <strong>{t('wizards.locationChange.address.serviceAddressNote1').split(':')[0]}:</strong> {t('wizards.locationChange.address.serviceAddressNote1').split(':')[1]}<br />
            {t('wizards.locationChange.address.serviceAddressNote2')}
          </div>
        </div>

        <div className="form-group mt-4">
          <label className="form-label">{t('wizards.locationChange.address.routeDiagram')}</label>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
            {t('wizards.locationChange.address.routeDiagramNote')}
          </p>
          <input type="file" className="form-control" accept="image/*" />
        </div>

        <div className="form-group flex flex-col-mobile gap-4 mt-4">
          <div style={{ flex: '1' }}>
            <label className="form-label">{t('wizards.locationChange.address.nearestSlt1')}</label>
            <input type="tel" className="form-control" placeholder={t('wizards.locationChange.address.notReq4g')} />
          </div>
          <div style={{ flex: '1' }}>
            <label className="form-label">{t('wizards.locationChange.address.nearestSlt2')}</label>
            <input type="tel" className="form-control" placeholder={t('wizards.locationChange.address.notReq4g')} />
          </div>
        </div>
      </div>


      <div className="card" style={{ padding: '1.5rem', border: '1px solid var(--border-color)', boxShadow: 'none' }}>
        <h4 style={{ color: 'var(--text-primary)', marginBottom: '1rem' }}>{t('wizards.locationChange.address.billingHeading')}</h4>
        
        <div className="form-group">
          <label className="form-label">{t('wizards.locationChange.address.newBillingAddress')}</label>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
            {t('wizards.locationChange.address.newBillingAddressNote')}
          </p>
          <textarea className="form-control" rows="3"></textarea>
        </div>

        <div className="form-group mt-4">
          <label className="form-label">{t('wizards.locationChange.address.billingEffective')}</label>
          <div className="radio-group">
            <label className="radio-label">
              <input type="radio" name="billingEffective" value="immediately" checked={billingEffective === 'immediately'} onChange={(e) => setBillingEffective(e.target.value)} className="radio-input" /> {t('wizards.locationChange.address.effectiveImmediately')}
            </label>
            <label className="radio-label">
              <input type="radio" name="billingEffective" value="after-service" checked={billingEffective === 'after-service'} onChange={(e) => setBillingEffective(e.target.value)} className="radio-input" /> {t('wizards.locationChange.address.effectiveAfter')}
            </label>
          </div>
        </div>
      </div>

    </div>
  );
}
