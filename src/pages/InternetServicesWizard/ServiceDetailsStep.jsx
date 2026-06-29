import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

export default function ServiceDetailsStep() {
  const { t } = useTranslation();
  const [appType, setAppType] = useState('new');

  return (
    <div>
      <h3 style={{ color: 'var(--slt-blue)', marginBottom: '1.5rem' }}>{t('wizards.internetServices.serviceDetails.heading')}</h3>
      
      <div className="form-group">
        <label className="form-label">{t('wizards.internetServices.serviceDetails.appType')}</label>
        <div className="radio-group" style={{ marginBottom: '1rem' }}>
          <label className="radio-label">
            <input type="radio" name="appType" value="new" checked={appType === 'new'} onChange={(e) => setAppType(e.target.value)} className="radio-input" /> {t('wizards.internetServices.serviceDetails.newApp')}
          </label>
          <label className="radio-label">
            <input type="radio" name="appType" value="existing" checked={appType === 'existing'} onChange={(e) => setAppType(e.target.value)} className="radio-input" /> {t('wizards.internetServices.serviceDetails.existing')}
          </label>
        </div>

        {appType === 'existing' && (
          <div className="card" style={{ padding: '1rem', backgroundColor: 'var(--bg-color)', border: '1px solid var(--border-color)', boxShadow: 'none' }}>
            <div className="flex gap-4">
              <div style={{ flex: '1' }}>
                <label className="form-label">{t('wizards.internetServices.serviceDetails.existingUser')}</label>
                <input type="text" className="form-control" />
              </div>
              <div style={{ flex: '1' }}>
                <label className="form-label">{t('wizards.internetServices.serviceDetails.existingPkg')}</label>
                <input type="text" className="form-control" />
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="form-group mt-4">
        <label className="form-label">{t('wizards.internetServices.serviceDetails.svcType')}</label>
        
        <div style={{ marginBottom: '1rem' }}>
          <label className="form-label" style={{ fontWeight: 'normal' }}>{t('wizards.internetServices.serviceDetails.domainName')}</label>
          <input type="text" className="form-control" />
        </div>

        <div className="card" style={{ padding: '1.5rem', border: '1px solid var(--border-color)', boxShadow: 'none', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          
          <label className="checkbox-label">
            <input type="checkbox" className="checkbox-input" /> {t('wizards.internetServices.serviceDetails.hostingDns')}
          </label>
          
          <div className="flex gap-4 items-center">
            <label className="checkbox-label" style={{ flex: '1', margin: 0 }}>
              <input type="checkbox" className="checkbox-input" /> {t('wizards.internetServices.serviceDetails.virtualMail')}
            </label>
            <div className="flex items-center gap-2" style={{ flex: '2' }}>
              <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>{t('wizards.internetServices.serviceDetails.internetPkg')}</span>
              <input type="text" className="form-control" style={{ padding: '0.5rem' }} />
            </div>
          </div>

          <label className="checkbox-label">
            <input type="checkbox" className="checkbox-input" /> {t('wizards.internetServices.serviceDetails.pop3')}
          </label>

          <div className="flex gap-4 items-center">
            <label className="checkbox-label" style={{ flex: '1', margin: 0 }}>
              <input type="checkbox" className="checkbox-input" /> {t('wizards.internetServices.serviceDetails.virtualWeb')}
            </label>
            <div className="flex items-center gap-2" style={{ flex: '2' }}>
              <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>{t('wizards.internetServices.serviceDetails.webCapacity')}</span>
              <input type="number" className="form-control" style={{ padding: '0.5rem' }} />
            </div>
          </div>

        </div>
      </div>

      <div className="form-group mt-4">
        <label className="form-label">{t('wizards.internetServices.serviceDetails.accessType')}</label>
        <div className="radio-group">
          <label className="radio-label">
            <input type="radio" name="accessType" value="analog" className="radio-input" /> {t('wizards.internetServices.serviceDetails.analog')}
          </label>
          <label className="radio-label">
            <input type="radio" name="accessType" value="isdn" className="radio-input" /> {t('wizards.internetServices.serviceDetails.isdn')}
          </label>
        </div>
      </div>

    </div>
  );
}
