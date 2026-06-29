import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

export default function AccountSetupStep() {
  const { t } = useTranslation();
  const [needInstall, setNeedInstall] = useState('no');

  return (
    <div>
      <h3 style={{ color: 'var(--slt-blue)', marginBottom: '1.5rem' }}>{t('wizards.internetServices.accountSetup.heading')}</h3>
      
      <div className="form-group">
        <label className="form-label" style={{ fontSize: '1rem', color: 'var(--text-primary)' }}>
          {t('wizards.internetServices.accountSetup.withoutAcct')}
        </label>
        
        <div className="card" style={{ padding: '1.5rem', backgroundColor: 'var(--bg-color)', border: '1px solid var(--border-color)', boxShadow: 'none' }}>
          
          <div className="flex gap-4" style={{ marginBottom: '1.5rem' }}>
            <div style={{ flex: '1' }}>
              <label className="form-label" style={{ color: 'var(--text-secondary)' }}>{t('wizards.internetServices.accountSetup.userOp1')}</label>
              <input type="text" className="form-control" placeholder={t('wizards.internetServices.accountSetup.userPlaceholder')} maxLength={14} minLength={4} />
            </div>
            <div style={{ flex: '1' }}>
              <label className="form-label" style={{ color: 'var(--text-secondary)' }}>{t('wizards.internetServices.accountSetup.passOp1')}</label>
              <input type="text" className="form-control" placeholder={t('wizards.internetServices.accountSetup.passPlaceholder')} maxLength={8} minLength={6} />
            </div>
          </div>
          
          <div className="flex gap-4">
            <div style={{ flex: '1' }}>
              <label className="form-label" style={{ color: 'var(--text-secondary)' }}>{t('wizards.internetServices.accountSetup.userOp2')}</label>
              <input type="text" className="form-control" placeholder={t('wizards.internetServices.accountSetup.userPlaceholder')} maxLength={14} minLength={4} />
            </div>
            <div style={{ flex: '1' }}>
              <label className="form-label" style={{ color: 'var(--text-secondary)' }}>{t('wizards.internetServices.accountSetup.passOp2')}</label>
              <input type="text" className="form-control" placeholder={t('wizards.internetServices.accountSetup.passPlaceholder')} maxLength={8} minLength={6} />
            </div>
          </div>
          
        </div>
      </div>

      <div className="form-group mt-4">
        <label className="form-label">{t('wizards.internetServices.accountSetup.requireInstall')}</label>
        <div className="radio-group" style={{ marginBottom: '1rem' }}>
          <label className="radio-label">
            <input type="radio" name="needInstall" value="yes" checked={needInstall === 'yes'} onChange={(e) => setNeedInstall(e.target.value)} className="radio-input" /> {t('wizards.internetServices.accountSetup.yes')}
          </label>
          <label className="radio-label">
            <input type="radio" name="needInstall" value="no" checked={needInstall === 'no'} onChange={(e) => setNeedInstall(e.target.value)} className="radio-input" /> {t('wizards.internetServices.accountSetup.no')}
          </label>
        </div>

        {needInstall === 'yes' && (
          <div className="card" style={{ padding: '1rem', backgroundColor: 'rgba(0, 166, 80, 0.05)', border: '1px solid var(--slt-green)', boxShadow: 'none' }}>
            <p style={{ fontSize: '0.9rem', color: 'var(--slt-green)', fontWeight: '500', marginBottom: '0.5rem' }}>
              {t('wizards.internetServices.accountSetup.installNote')}
            </p>
            <ul style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginLeft: '1.5rem', lineHeight: '1.8' }}>
              <li>{t('wizards.internetServices.accountSetup.pop3Only')}</li>
              <li>{t('wizards.internetServices.accountSetup.proxyOnly')}</li>
              <li>{t('wizards.internetServices.accountSetup.dnsOnly')}</li>
              <li>{t('wizards.internetServices.accountSetup.pop3Proxy')}</li>
              <li>{t('wizards.internetServices.accountSetup.pop3ProxyDns')}</li>
            </ul>
          </div>
        )}
      </div>

      <h4 style={{ marginTop: '2.5rem', marginBottom: '1rem', color: 'var(--text-primary)' }}>{t('wizards.internetServices.accountSetup.declarationHeading')}</h4>
      <div className="card" style={{ padding: '1.5rem', backgroundColor: 'var(--surface-color)', border: '1px solid var(--border-color)', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
        <p style={{ marginBottom: '1rem' }}>
          {t('wizards.internetServices.accountSetup.declarationText')}
        </p>
        <label className="checkbox-label" style={{ color: 'var(--text-primary)', fontWeight: '500' }}>
          <input type="checkbox" className="checkbox-input" required /> {t('wizards.internetServices.accountSetup.agreeLabel')}
        </label>
      </div>
      
    </div>
  );
}
