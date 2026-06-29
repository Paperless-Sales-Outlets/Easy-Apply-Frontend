import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

export default function ServiceDetailsStep() {
  const { t } = useTranslation();
  const [terminationType, setTerminationType] = useState('permanent');

  return (
    <div>
      <h3 style={{ color: 'var(--slt-blue)', marginBottom: '1.5rem' }}>{t('wizards.termination.serviceDetails.heading')}</h3>
      
      <div className="card" style={{ padding: '1.5rem', border: '1px solid var(--border-color)', boxShadow: 'none', marginBottom: '1.5rem' }}>
        <h4 style={{ color: 'var(--text-primary)', marginBottom: '1rem' }}>{t('wizards.termination.serviceDetails.disconnectType')}</h4>
        
        <div className="form-group">
          <label className="form-label">{t('wizards.termination.serviceDetails.reqDisconnect')}</label>
          <div className="flex gap-4 flex-wrap mt-2">
            <label className="checkbox-label" style={{ margin: 0 }}><input type="checkbox" className="checkbox-input" /> {t('wizards.termination.serviceDetails.megaline')}</label>
            <label className="checkbox-label" style={{ margin: 0 }}><input type="checkbox" className="checkbox-input" /> {t('wizards.termination.serviceDetails.citylink')}</label>
            <label className="checkbox-label" style={{ margin: 0 }}><input type="checkbox" className="checkbox-input" /> {t('wizards.termination.serviceDetails.ftth')}</label>
            <label className="checkbox-label" style={{ margin: 0 }}><input type="checkbox" className="checkbox-input" /> {t('wizards.termination.serviceDetails.lte')}</label>
          </div>
        </div>

        <div className="form-group mt-4">
          <label className="form-label">{t('wizards.termination.serviceDetails.disconnectAll')}</label>
          <div className="radio-group mt-2">
            <label className="radio-label">
              <input type="radio" name="terminationType" value="permanent" checked={terminationType === 'permanent'} onChange={(e) => setTerminationType(e.target.value)} className="radio-input" /> {t('wizards.termination.serviceDetails.permanent')}
            </label>
            <label className="radio-label">
              <input type="radio" name="terminationType" value="temporary" checked={terminationType === 'temporary'} onChange={(e) => setTerminationType(e.target.value)} className="radio-input" /> {t('wizards.termination.serviceDetails.temporary')}
            </label>
          </div>
        </div>

        <div className="form-group mt-4">
          <label className="form-label">{t('wizards.termination.serviceDetails.presentNumber')}</label>
          <input type="tel" className="form-control" required />
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
            {t('wizards.termination.serviceDetails.presentNumberNote')}
          </p>
        </div>
      </div>

      <div className="card" style={{ padding: '1.5rem', border: '1px solid var(--border-color)', boxShadow: 'none' }}>
        <h4 style={{ color: 'var(--text-primary)', marginBottom: '1rem' }}>{t('wizards.termination.serviceDetails.specificServices')}</h4>
        
        <div className="flex flex-col gap-4">
          <div className="flex flex-col-mobile items-center gap-4">
            <label className="checkbox-label" style={{ margin: 0, flex: '1' }}>
              <input type="checkbox" className="checkbox-input" /> {t('wizards.termination.serviceDetails.broadband')}
            </label>
            <div className="flex items-center gap-2" style={{ flex: '1.5' }}>
              <span style={{ fontSize: '0.9rem' }}>{t('wizards.termination.serviceDetails.username')}</span>
              <input type="text" className="form-control" style={{ padding: '0.4rem' }} />
            </div>
          </div>

          <div className="flex flex-col-mobile items-center gap-4">
            <label className="checkbox-label" style={{ margin: 0, flex: '1' }}>
              <input type="checkbox" className="checkbox-input" /> {t('wizards.termination.serviceDetails.dialUp')}
            </label>
            <div className="flex items-center gap-2" style={{ flex: '1.5' }}>
              <span style={{ fontSize: '0.9rem' }}>{t('wizards.termination.serviceDetails.username')}</span>
              <input type="text" className="form-control" style={{ padding: '0.4rem' }} />
            </div>
          </div>

          <div className="flex flex-col-mobile items-center gap-4">
            <label className="checkbox-label" style={{ margin: 0, flex: '1' }}>
              <input type="checkbox" className="checkbox-input" /> {t('wizards.termination.serviceDetails.email')}
            </label>
            <div className="flex items-center gap-2" style={{ flex: '1.5' }}>
              <span style={{ fontSize: '0.9rem' }}>{t('wizards.termination.serviceDetails.username')}</span>
              <input type="text" className="form-control" style={{ padding: '0.4rem' }} />
            </div>
          </div>
        </div>

        <div className="flex gap-4 mt-6 flex-wrap">
          <label className="checkbox-label"><input type="checkbox" className="checkbox-input" /> {t('wizards.termination.serviceDetails.peoTv')}</label>
          <label className="checkbox-label"><input type="checkbox" className="checkbox-input" /> {t('wizards.termination.serviceDetails.sltPlus')}</label>
          <label className="checkbox-label"><input type="checkbox" className="checkbox-input" /> {t('wizards.termination.serviceDetails.idd')}</label>
          <label className="checkbox-label"><input type="checkbox" className="checkbox-input" /> {t('wizards.termination.serviceDetails.crbt')}</label>
          <label className="checkbox-label"><input type="checkbox" className="checkbox-input" /> {t('wizards.termination.serviceDetails.quickMeet')}</label>
          <label className="checkbox-label"><input type="checkbox" className="checkbox-input" /> {t('wizards.termination.serviceDetails.cli')}</label>
        </div>

        <div className="form-group mt-4">
          <label className="form-label">{t('wizards.termination.serviceDetails.other')}</label>
          <input type="text" className="form-control" />
        </div>
      </div>

      <div className="form-group mt-4">
        <label className="form-label">{t('wizards.termination.serviceDetails.disconnectDate')}</label>
        <div style={{ maxWidth: '200px' }}>
          <input type="date" className="form-control" required />
        </div>
      </div>

    </div>
  );
}
