import React from 'react';
import { useTranslation } from 'react-i18next';

export default function ConnectionPackageStep() {
  const { t } = useTranslation();

  return (
    <div>
      <h3 style={{ color: 'var(--slt-blue)', marginBottom: '1.5rem' }}>{t('wizards.newConnection.connPkg.heading')}</h3>
      
      <div className="form-group">
        <label className="form-label">{t('wizards.newConnection.connPkg.modeOfConnection')}</label>
        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '1rem', textAlign: 'left' }}>
          <thead>
            <tr>
              <th style={{ padding: '0.5rem', borderBottom: '1px solid var(--border-color)' }}></th>
              <th style={{ padding: '0.5rem', borderBottom: '1px solid var(--border-color)' }}>{t('wizards.newConnection.connPkg.voice')}</th>
              <th style={{ padding: '0.5rem', borderBottom: '1px solid var(--border-color)' }}>{t('wizards.newConnection.connPkg.broadband')}</th>
              <th style={{ padding: '0.5rem', borderBottom: '1px solid var(--border-color)' }}>{t('wizards.newConnection.connPkg.peoTv')}</th>
            </tr>
          </thead>
          <tbody>
            {[
              t('wizards.newConnection.connPkg.fibre'), 
              t('wizards.newConnection.connPkg.home4G'), 
              t('wizards.newConnection.connPkg.copper')
            ].map(type => (
              <tr key={type}>
                <td style={{ padding: '0.5rem', fontWeight: '500' }}>{type}</td>
                <td style={{ padding: '0.5rem' }}><input type="checkbox" className="checkbox-input" /></td>
                <td style={{ padding: '0.5rem' }}><input type="checkbox" className="checkbox-input" /></td>
                <td style={{ padding: '0.5rem' }}><input type="checkbox" className="checkbox-input" /></td>
              </tr>
            ))}
          </tbody>
        </table>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{t('wizards.newConnection.connPkg.fibreNote')}</p>
      </div>

      <h4 style={{ marginTop: '2rem', marginBottom: '1rem', color: 'var(--text-primary)' }}>{t('wizards.newConnection.connPkg.packageDetails')}</h4>
      
      <div className="card" style={{ padding: '1.5rem', marginBottom: '1.5rem', border: '1px solid var(--border-color)', boxShadow: 'none' }}>
        <h5 style={{ color: 'var(--slt-blue)', marginBottom: '1rem' }}>{t('wizards.newConnection.connPkg.voicePackage')}</h5>
        <div className="form-group flex gap-4">
          <label className="checkbox-label" style={{ flex: '1' }}>
            <input type="checkbox" className="checkbox-input" /> {t('wizards.newConnection.connPkg.myPhone')}
          </label>
        </div>
        <div className="form-group flex gap-4">
          <label className="checkbox-label" style={{ flex: '1' }}>
            <input type="checkbox" className="checkbox-input" /> {t('wizards.newConnection.connPkg.voicePalPremium')}
          </label>
          <label className="checkbox-label" style={{ flex: '1' }}>
            <input type="checkbox" className="checkbox-input" /> {t('wizards.newConnection.connPkg.voicePalBasic')}
          </label>
        </div>
        <div className="form-group flex gap-4">
          <label className="checkbox-label" style={{ flex: '1' }}>
            <input type="checkbox" className="checkbox-input" /> {t('wizards.newConnection.connPkg.standardVoice')}
          </label>
        </div>
        <div className="form-group flex gap-4 items-center">
          <label className="form-label" style={{ margin: 0, flex: '2' }}>{t('wizards.newConnection.connPkg.iddDeact')}</label>
          <div className="radio-group" style={{ flex: '1' }}>
            <label className="radio-label"><input type="radio" name="deactIDD" value="yes" className="radio-input" /> {t('wizards.newConnection.connPkg.yes')}</label>
            <label className="radio-label"><input type="radio" name="deactIDD" value="no" className="radio-input" /> {t('wizards.newConnection.connPkg.no')}</label>
          </div>
        </div>
      </div>

      <div className="card" style={{ padding: '1.5rem', marginBottom: '1.5rem', border: '1px solid var(--border-color)', boxShadow: 'none' }}>
        <h5 style={{ color: 'var(--slt-blue)', marginBottom: '1rem' }}>{t('wizards.newConnection.connPkg.broadbandPackage')}</h5>
        <div className="form-group">
          <label className="form-label">{t('wizards.newConnection.connPkg.selectPackage')}</label>
          <select className="form-control" defaultValue="">
            <option value="" disabled>{t('wizards.newConnection.connPkg.selectPlaceholder')}</option>
            <optgroup label={t('wizards.newConnection.connPkg.timeBased')}>
              <option value="web-lite">Web Lite</option>
              <option value="web-starter">Web Starter</option>
              <option value="web-family">Web Family Plus</option>
            </optgroup>
            <optgroup label={t('wizards.newConnection.connPkg.anytime')}>
              <option value="any-joy">Any Joy</option>
              <option value="any-beat">Any Beat</option>
              <option value="any-flix">Any Flix</option>
            </optgroup>
            <optgroup label={t('wizards.newConnection.connPkg.unlimited')}>
              <option value="fibre-unlimited-10">Fibre Unlimited 10</option>
              <option value="lte-unlimited-2">LTE Unlimited 2</option>
              <option value="adsl-unlimited-2">ADSL Unlimited 2</option>
            </optgroup>
          </select>
        </div>
        
        <div className="form-group flex gap-4 items-center">
          <label className="form-label" style={{ margin: 0, flex: '1' }}>{t('wizards.newConnection.connPkg.staticIp')}</label>
          <div className="radio-group" style={{ flex: '1' }}>
            <label className="radio-label"><input type="radio" name="staticIP" value="yes" className="radio-input" /> {t('wizards.newConnection.connPkg.yes')}</label>
            <label className="radio-label"><input type="radio" name="staticIP" value="no" className="radio-input" /> {t('wizards.newConnection.connPkg.no')}</label>
          </div>
        </div>
      </div>

      <div className="card" style={{ padding: '1.5rem', marginBottom: '1.5rem', border: '1px solid var(--border-color)', boxShadow: 'none' }}>
        <h5 style={{ color: 'var(--slt-blue)', marginBottom: '1rem' }}>{t('wizards.newConnection.connPkg.peoTvPackage')}</h5>
        <div className="form-group">
          <div className="radio-group" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)' }}>
            {['PEO Titanium', 'PEO Platinum', 'PEO Entertainment', 'PEO Gold', 'PEO Silver Plus', 'PEO Silver', 'PEO Family', 'PEO Unnatham', t('wizards.newConnection.connPkg.other')].map(pkg => (
              <label key={pkg} className="checkbox-label">
                <input type="checkbox" className="checkbox-input" /> {pkg}
              </label>
            ))}
          </div>
        </div>
      </div>

    </div>
  );
}
