import React from 'react';
import { useTranslation } from 'react-i18next';

export default function ConnectionPackageStep({ formData, handleChange }) {
  const { t } = useTranslation();

  return (
    <div>
      <h3 style={{ color: 'var(--slt-blue)', marginBottom: '1.5rem' }}>{t('wizards.newConnection.connPkg.heading')}</h3>
      
      <div className="form-group">
        <label className="form-label">{t('wizards.newConnection.connPkg.modeOfConnection')}</label>
        <div className="table-container">
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
              <tr>
                <td style={{ padding: '0.5rem', fontWeight: '500' }}>{t('wizards.newConnection.connPkg.fibre')}</td>
                <td style={{ padding: '0.5rem' }}>
                  <input 
                    name="connectionModeFibreVoice" 
                    type="checkbox" 
                    className="checkbox-input" 
                    checked={!!formData.connectionModeFibreVoice} 
                    onChange={handleChange} 
                  />
                </td>
                <td style={{ padding: '0.5rem' }}>
                  <input 
                    name="connectionModeFibreBroadband" 
                    type="checkbox" 
                    className="checkbox-input" 
                    checked={!!formData.connectionModeFibreBroadband} 
                    onChange={handleChange} 
                  />
                </td>
                <td style={{ padding: '0.5rem' }}>
                  <input 
                    name="connectionModeFibrePeoTv" 
                    type="checkbox" 
                    className="checkbox-input" 
                    checked={!!formData.connectionModeFibrePeoTv} 
                    onChange={handleChange} 
                  />
                </td>
              </tr>
              <tr>
                <td style={{ padding: '0.5rem', fontWeight: '500' }}>{t('wizards.newConnection.connPkg.home4G')}</td>
                <td style={{ padding: '0.5rem' }}>
                  <input 
                    name="connectionModeLTEVoice" 
                    type="checkbox" 
                    className="checkbox-input" 
                    checked={!!formData.connectionModeLTEVoice} 
                    onChange={handleChange} 
                  />
                </td>
                <td style={{ padding: '0.5rem' }}>
                  <input 
                    name="connectionModeLTEBroadband" 
                    type="checkbox" 
                    className="checkbox-input" 
                    checked={!!formData.connectionModeLTEBroadband} 
                    onChange={handleChange} 
                  />
                </td>
                <td style={{ padding: '0.5rem' }}>
                  <input 
                    name="connectionModeLTEPeoTv" 
                    type="checkbox" 
                    className="checkbox-input" 
                    checked={!!formData.connectionModeLTEPeoTv} 
                    onChange={handleChange} 
                  />
                </td>
              </tr>
              <tr>
                <td style={{ padding: '0.5rem', fontWeight: '500' }}>{t('wizards.newConnection.connPkg.copper')}</td>
                <td style={{ padding: '0.5rem' }}>
                  <input 
                    name="connectionModeCopperVoice" 
                    type="checkbox" 
                    className="checkbox-input" 
                    checked={!!formData.connectionModeCopperVoice} 
                    onChange={handleChange} 
                  />
                </td>
                <td style={{ padding: '0.5rem' }}>
                  <input 
                    name="connectionModeCopperBroadband" 
                    type="checkbox" 
                    className="checkbox-input" 
                    checked={!!formData.connectionModeCopperBroadband} 
                    onChange={handleChange} 
                  />
                </td>
                <td style={{ padding: '0.5rem' }}>
                  <input 
                    name="connectionModeCopperPeoTv" 
                    type="checkbox" 
                    className="checkbox-input" 
                    checked={!!formData.connectionModeCopperPeoTv} 
                    onChange={handleChange} 
                  />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{t('wizards.newConnection.connPkg.fibreNote')}</p>
      </div>

      <h4 style={{ marginTop: '2rem', marginBottom: '1rem', color: 'var(--text-primary)' }}>{t('wizards.newConnection.connPkg.packageDetails')}</h4>
      
      <div className="card" style={{ padding: '1.5rem', marginBottom: '1.5rem', border: '1px solid var(--border-color)', boxShadow: 'none' }}>
        <h5 style={{ color: 'var(--slt-blue)', marginBottom: '1rem' }}>{t('wizards.newConnection.connPkg.voicePackage')}</h5>
        
        <h6 style={{ color: 'var(--text-primary)', marginBottom: '0.5rem' }}>4.1.1 Fixed voice packages</h6>
        <div className="form-group flex flex-col-mobile gap-4">
          <label className="checkbox-label" style={{ flex: '1' }}>
            <input 
              name="fixedVoicePackageHomeMyPhone" 
              type="checkbox" 
              className="checkbox-input" 
              checked={!!formData.fixedVoicePackageHomeMyPhone} 
              onChange={handleChange} 
            /> a) Home My phone
          </label>
          <label className="checkbox-label" style={{ flex: '1' }}>
            <input 
              name="fixedVoicePackageOffice" 
              type="checkbox" 
              className="checkbox-input" 
              checked={!!formData.fixedVoicePackageOffice} 
              onChange={handleChange} 
            /> b) Office Package
          </label>
          <label className="checkbox-label" style={{ flex: '1' }}>
            <input 
              name="fixedVoicePackageUnlimited" 
              type="checkbox" 
              className="checkbox-input" 
              checked={!!formData.fixedVoicePackageUnlimited} 
              onChange={handleChange} 
            /> c) Voice Unlimited
          </label>
        </div>
        
        <h6 style={{ color: 'var(--text-primary)', marginBottom: '0.5rem' }}>4.1.2 4G LTE Postpaid packages</h6>
        <div className="form-group flex flex-col-mobile gap-4">
          <label className="checkbox-label" style={{ flex: '1' }}>
            <input 
              name="fixedVoicePackageLTEPalBasic" 
              type="checkbox" 
              className="checkbox-input" 
              checked={!!formData.fixedVoicePackageLTEPalBasic} 
              onChange={handleChange} 
            /> a) Voice Pal Basic
          </label>
          <label className="checkbox-label" style={{ flex: '1' }}>
            <input 
              name="fixedVoicePackageLTEPalPremium" 
              type="checkbox" 
              className="checkbox-input" 
              checked={!!formData.fixedVoicePackageLTEPalPremium} 
              onChange={handleChange} 
            /> b) Voice Pal Premium
          </label>
        </div>
        <div className="form-group flex flex-col-mobile gap-4">
          <label className="checkbox-label" style={{ flex: '1' }}>
            <input 
              name="fixedVoicePackageHomeDoublePlay" 
              type="checkbox" 
              className="checkbox-input" 
              checked={!!formData.fixedVoicePackageHomeDoublePlay} 
              onChange={handleChange} 
            /> c) Home Double Play
          </label>
          <label className="checkbox-label" style={{ flex: '1' }}>
            <input 
              name="fixedVoicePackageOfficeDoublePlay" 
              type="checkbox" 
              className="checkbox-input" 
              checked={!!formData.fixedVoicePackageOfficeDoublePlay} 
              onChange={handleChange} 
            /> d) Office Double Play
          </label>
        </div>
        <div className="form-group flex flex-col-mobile gap-4 items-start">
          <label className="form-label" style={{ margin: 0, flex: '2' }}>{t('wizards.newConnection.connPkg.iddDeact')}</label>
          <div className="radio-group" style={{ flex: '1' }}>
            <label className="radio-label">
              <input 
                type="radio" 
                name="deactIDD" 
                value="yes" 
                className="radio-input" 
                checked={formData.deactIDD === 'yes'} 
                onChange={handleChange} 
              /> {t('wizards.newConnection.connPkg.yes')}
            </label>
            <label className="radio-label">
              <input 
                type="radio" 
                name="deactIDD" 
                value="no" 
                className="radio-input" 
                checked={formData.deactIDD === 'no'} 
                onChange={handleChange} 
              /> {t('wizards.newConnection.connPkg.no')}
            </label>
          </div>
        </div>
      </div>

      <div className="card" style={{ padding: '1.5rem', marginBottom: '1.5rem', border: '1px solid var(--border-color)', boxShadow: 'none' }}>
        <h5 style={{ color: 'var(--slt-blue)', marginBottom: '1rem' }}>{t('wizards.newConnection.connPkg.broadbandPackage')}</h5>
        <div className="form-group">
          <label className="form-label">{t('wizards.newConnection.connPkg.selectPackage')}</label>
          <select 
            name="broadbandPackage" 
            className="form-control" 
            value={formData.broadbandPackage || ''} 
            onChange={handleChange}
          >
            <option value="" disabled>{t('wizards.newConnection.connPkg.selectPlaceholder')}</option>
            <optgroup label="Fibre">
              <option value="fiber-starter">Fiber Starter (2,590)</option>
              <option value="trio-vibe">Trio Vibe (3,530)</option>
              <option value="trio-vibe-plus">Trio Vibe Plus (4,100)</option>
              <option value="trio-shine">Trio Shine (4,950)</option>
              <option value="unlimited-home">Unlimited Home (5,900)</option>
              <option value="unlimited-home-plus">Unlimited Home Plus (9,900)</option>
              <option value="unlimited-twin">Unlimited Twin (14,900)</option>
              <option value="unlimited-pro">Unlimited Pro (19,900)</option>
              <option value="unlimited-edge">Unlimited Edge (29,900)</option>
              <option value="unlimited-turbo">Unlimited Turbo (39,900)</option>
              <option value="ultra-prime">Ultra Prime (75,000)</option>
              <option value="ultra-flash-prime">Ultra Flash Prime (75,000)</option>
            </optgroup>
            <optgroup label="ADSL">
              <option value="any-beat">Any Beat (1,550)</option>
              <option value="any-flix">Any Flix (2,150)</option>
              <option value="any-tide">Any Tide (3,890)</option>
              <option value="unlimited-4-adsl">Unlimited 4 (5,790)</option>
              <option value="unlimited-8-adsl">Unlimited 8 (7,490)</option>
            </optgroup>
            <optgroup label="LTE 4G">
              <option value="hbb-anytime-50">HBB Anytime 50 (1,290)</option>
              <option value="hbb-anytime-85">HBB Anytime 85 (1,890)</option>
              <option value="hbb-anytime-115">HBB Anytime 115 (2,590)</option>
              <option value="hbb-anytime-200">HBB Anytime 200 (3,990)</option>
              <option value="hbb-anytime-400">HBB Anytime 400 (7,990)</option>
              <option value="unlimited-flash-5">Unlimited Flash 5 (2,350)</option>
              <option value="unlimited-flash-10">Unlimited Flash 10 (4,090)</option>
              <option value="unlimited-2">Unlimited 2 (2,950)</option>
              <option value="unlimited-4-lte">Unlimited 4 (5,150)</option>
              <option value="unlimited-8-lte">Unlimited 8 (7,090)</option>
            </optgroup>
          </select>
        </div>
        
        <div className="form-group">
          <label className="form-label">Others</label>
          <input 
            name="otherBroadbandPackage" 
            type="text" 
            className="form-control" 
            placeholder="Specify other package" 
            value={formData.otherBroadbandPackage || ''} 
            onChange={handleChange} 
          />
        </div>
        
        <div className="form-group flex gap-4 items-center">
          <label className="form-label" style={{ margin: 0, flex: '1' }}>{t('wizards.newConnection.connPkg.staticIp')}</label>
          <div className="radio-group" style={{ flex: '1' }}>
            <label className="radio-label">
              <input 
                type="radio" 
                name="staticIP" 
                value="yes" 
                className="radio-input" 
                checked={formData.staticIP === 'yes'} 
                onChange={handleChange} 
              /> {t('wizards.newConnection.connPkg.yes')}
            </label>
            <label className="radio-label">
              <input 
                type="radio" 
                name="staticIP" 
                value="no" 
                className="radio-input" 
                checked={formData.staticIP === 'no'} 
                onChange={handleChange} 
              /> {t('wizards.newConnection.connPkg.no')}
            </label>
          </div>
        </div>
      </div>

      <div className="card" style={{ padding: '1.5rem', marginBottom: '1.5rem', border: '1px solid var(--border-color)', boxShadow: 'none' }}>
        <h5 style={{ color: 'var(--slt-blue)', marginBottom: '1rem' }}>{t('wizards.newConnection.connPkg.peoTvPackage')}</h5>
        <div className="form-group">
          <div className="radio-group responsive-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)" }}>
            {[
              'PEO Titanium', 'PEO Platinum', 'PEO Entertainment', 'PEO Gold', 
              'PEO Silver Plus', 'PEO Silver', 'PEO Family', 'PEO Unnatham', 'Other'
            ].map((pkg, index) => {
              const safeName = `peoTvPkg_${pkg.replace(/\s+/g, '')}`;
              return (
                <label key={pkg} className="checkbox-label">
                  <input 
                    name={safeName} 
                    type="checkbox" 
                    className="checkbox-input" 
                    checked={!!formData[safeName]} 
                    onChange={handleChange} 
                  /> {pkg === 'Other' ? t('wizards.newConnection.connPkg.other') : pkg}
                </label>
              );
            })}
          </div>
        </div>
      </div>

    </div>
  );
}
