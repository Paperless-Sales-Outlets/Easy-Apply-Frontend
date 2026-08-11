import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

const RESET_FIELDSET = { border: 0, margin: 0, padding: 0 };
const RESET_LEGEND = { padding: 0 };

export default function ServiceDetailsStep({ isActive }) {
  const { t } = useTranslation();
  const [terminationType, setTerminationType] = useState('permanent');

  return (
    <div>
      <h3 style={{ color: 'var(--slt-blue)', marginBottom: '1.5rem' }}>{t('wizards.termination.serviceDetails.heading')}</h3>

      <div className="card" style={{ padding: '1.5rem', border: '1px solid var(--border-color)', boxShadow: 'none', marginBottom: '1.5rem' }}>
        <h4 style={{ color: 'var(--text-primary)', marginBottom: '1rem' }}>{t('wizards.termination.serviceDetails.disconnectType')}</h4>

        <fieldset className="form-group" style={RESET_FIELDSET}>
          <legend className="form-label" style={RESET_LEGEND}>{t('wizards.termination.serviceDetails.reqDisconnect')}</legend>
          <div className="flex gap-4 flex-wrap mt-2">
            <label className="checkbox-label" style={{ margin: 0 }}><input type="checkbox" name="facilityMegaline" className="checkbox-input" /> {t('wizards.termination.serviceDetails.megaline')}</label>
            <label className="checkbox-label" style={{ margin: 0 }}><input type="checkbox" name="facilityCitylink" className="checkbox-input" /> {t('wizards.termination.serviceDetails.citylink')}</label>
            <label className="checkbox-label" style={{ margin: 0 }}><input type="checkbox" name="facilityFtth" className="checkbox-input" /> {t('wizards.termination.serviceDetails.ftth')}</label>
            <label className="checkbox-label" style={{ margin: 0 }}><input type="checkbox" name="facilityLte" className="checkbox-input" /> {t('wizards.termination.serviceDetails.lte')}</label>
          </div>
        </fieldset>

        <fieldset className="form-group mt-4" style={RESET_FIELDSET}>
          <legend className="form-label" style={RESET_LEGEND}>{t('wizards.termination.serviceDetails.disconnectAll')}</legend>
          <div className="radio-group mt-2">
            <label className="radio-label">
              <input type="radio" name="terminationType" value="permanent" checked={terminationType === 'permanent'} onChange={(e) => setTerminationType(e.target.value)} className="radio-input" /> {t('wizards.termination.serviceDetails.permanent')}
            </label>
            <label className="radio-label">
              <input type="radio" name="terminationType" value="temporary" checked={terminationType === 'temporary'} onChange={(e) => setTerminationType(e.target.value)} className="radio-input" /> {t('wizards.termination.serviceDetails.temporary')}
            </label>
          </div>
        </fieldset>
      </div>

      <div className="card" style={{ padding: '1.5rem', border: '1px solid var(--border-color)', boxShadow: 'none' }}>
        <h4 style={{ color: 'var(--text-primary)', marginBottom: '1rem' }}>{t('wizards.termination.serviceDetails.specificServices')}</h4>

        <div className="flex flex-col gap-4">
          <div className="flex flex-col-mobile items-center gap-4">
            <label className="checkbox-label" style={{ margin: 0, flex: '1' }}>
              <input type="checkbox" name="serviceBroadband" className="checkbox-input" /> {t('wizards.termination.serviceDetails.broadband')}
            </label>
            <div className="flex items-center gap-2" style={{ flex: '1.5', minWidth: 0 }}>
              <label htmlFor="term-broadbandUsername" style={{ fontSize: '0.9rem' }}>{t('wizards.termination.serviceDetails.username')}</label>
              <input id="term-broadbandUsername" name="broadbandUsername" type="text" className="form-control" style={{ padding: '0.4rem' }} />
            </div>
          </div>

          <div className="flex flex-col-mobile items-center gap-4">
            <label className="checkbox-label" style={{ margin: 0, flex: '1' }}>
              <input type="checkbox" name="serviceDialUp" className="checkbox-input" /> {t('wizards.termination.serviceDetails.dialUp')}
            </label>
            <div className="flex items-center gap-2" style={{ flex: '1.5', minWidth: 0 }}>
              <label htmlFor="term-dialUpUsername" style={{ fontSize: '0.9rem' }}>{t('wizards.termination.serviceDetails.username')}</label>
              <input id="term-dialUpUsername" name="dialUpUsername" type="text" className="form-control" style={{ padding: '0.4rem' }} />
            </div>
          </div>

          <div className="flex flex-col-mobile items-center gap-4">
            <label className="checkbox-label" style={{ margin: 0, flex: '1' }}>
              <input type="checkbox" name="serviceEmail" className="checkbox-input" /> {t('wizards.termination.serviceDetails.email')}
            </label>
            <div className="flex items-center gap-2" style={{ flex: '1.5', minWidth: 0 }}>
              <label htmlFor="term-emailUsername" style={{ fontSize: '0.9rem' }}>{t('wizards.termination.serviceDetails.username')}</label>
              <input id="term-emailUsername" name="emailUsername" type="text" className="form-control" style={{ padding: '0.4rem' }} />
            </div>
          </div>
        </div>

        <fieldset className="mt-6" style={RESET_FIELDSET}>
          <legend className="sr-only">{t('wizards.termination.serviceDetails.specificServices')}</legend>
          <div className="flex gap-4 flex-wrap">
            <label className="checkbox-label"><input type="checkbox" name="servicePeoTv" className="checkbox-input" /> {t('wizards.termination.serviceDetails.peoTv')}</label>
            <label className="checkbox-label"><input type="checkbox" name="serviceSltPlus" className="checkbox-input" /> {t('wizards.termination.serviceDetails.sltPlus')}</label>
            <label className="checkbox-label"><input type="checkbox" name="serviceIdd" className="checkbox-input" /> {t('wizards.termination.serviceDetails.idd')}</label>
            <label className="checkbox-label"><input type="checkbox" name="serviceCrbt" className="checkbox-input" /> {t('wizards.termination.serviceDetails.crbt')}</label>
            <label className="checkbox-label"><input type="checkbox" name="serviceQuickMeet" className="checkbox-input" /> {t('wizards.termination.serviceDetails.quickMeet')}</label>
            <label className="checkbox-label"><input type="checkbox" name="serviceCli" className="checkbox-input" /> {t('wizards.termination.serviceDetails.cli')}</label>
          </div>
        </fieldset>

        <div className="form-group mt-4">
          <label className="form-label" htmlFor="term-otherServices">{t('wizards.termination.serviceDetails.other')}</label>
          <input id="term-otherServices" name="otherServices" type="text" className="form-control" />
        </div>
      </div>

      <div className="form-group mt-4">
        <label className="form-label" htmlFor="term-disconnectDate">{t('wizards.termination.serviceDetails.disconnectDate')}</label>
        <div style={{ maxWidth: '200px' }}>
          <input id="term-disconnectDate" name="disconnectDate" type="date" className="form-control" required={isActive} />
        </div>
      </div>

    </div>
  );
}
