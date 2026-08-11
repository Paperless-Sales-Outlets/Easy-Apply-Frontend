import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import MultiSelectDropdown from '../../components/form/MultiSelectDropdown';

const RESET_FIELDSET = { border: 0, margin: 0, padding: 0 };
const RESET_LEGEND = { padding: 0 };

const FACILITY_OPTIONS = [
  { name: 'facilityMegaline', key: 'megaline' },
  { name: 'facilityCitylink', key: 'citylink' },
  { name: 'facilityFtth', key: 'ftth' },
  { name: 'facilityLte', key: 'lte' },
];

const SERVICE_OPTIONS = [
  { value: 'broadband', fieldName: 'serviceBroadband', key: 'broadband', usernameField: 'broadbandUsername' },
  { value: 'dialUp', fieldName: 'serviceDialUp', key: 'dialUp', usernameField: 'dialUpUsername' },
  { value: 'email', fieldName: 'serviceEmail', key: 'email', usernameField: 'emailUsername' },
  { value: 'peoTv', fieldName: 'servicePeoTv', key: 'peoTv' },
  { value: 'sltPlus', fieldName: 'serviceSltPlus', key: 'sltPlus' },
  { value: 'idd', fieldName: 'serviceIdd', key: 'idd' },
  { value: 'crbt', fieldName: 'serviceCrbt', key: 'crbt' },
  { value: 'quickMeet', fieldName: 'serviceQuickMeet', key: 'quickMeet' },
  { value: 'cli', fieldName: 'serviceCli', key: 'cli' },
];

export default function ServiceDetailsStep({ isActive }) {
  const { t } = useTranslation();
  const [terminationType, setTerminationType] = useState('permanent');
  const [selectedServices, setSelectedServices] = useState([]);

  const serviceOptions = SERVICE_OPTIONS.map((o) => ({
    value: o.value,
    label: t(`wizards.termination.serviceDetails.${o.key}`),
  }));

  const selectedWithUsername = SERVICE_OPTIONS.filter((o) => o.usernameField && selectedServices.includes(o.value));

  return (
    <div>
      <h3 style={{ color: 'var(--slt-blue)', marginBottom: '1.5rem' }}>{t('wizards.termination.serviceDetails.heading')}</h3>

      <div className="card" style={{ padding: '1.5rem', border: '1px solid var(--border-color)', boxShadow: 'none', marginBottom: '1.5rem' }}>
        <h4 style={{ color: 'var(--text-primary)', marginBottom: '1rem' }}>{t('wizards.termination.serviceDetails.disconnectType')}</h4>

        <fieldset className="form-group" style={RESET_FIELDSET}>
          <legend className="form-label" style={RESET_LEGEND}>{t('wizards.termination.serviceDetails.reqDisconnect')}</legend>
          <div className="chip-row mt-2">
            {FACILITY_OPTIONS.map((f) => (
              <label className="chip" key={f.name}>
                <input type="checkbox" name={f.name} />
                {t(`wizards.termination.serviceDetails.${f.key}`)}
              </label>
            ))}
          </div>
        </fieldset>

        <div className="form-group mt-4">
          <label className="form-label" htmlFor="term-terminationType">{t('wizards.termination.serviceDetails.disconnectAll')}</label>
          <select
            id="term-terminationType"
            name="terminationType"
            className="form-control"
            value={terminationType}
            onChange={(e) => setTerminationType(e.target.value)}
            style={{ maxWidth: '280px' }}
          >
            <option value="permanent">{t('wizards.termination.serviceDetails.permanent')}</option>
            <option value="temporary">{t('wizards.termination.serviceDetails.temporary')}</option>
          </select>
        </div>
      </div>

      <div className="card" style={{ padding: '1.5rem', border: '1px solid var(--border-color)', boxShadow: 'none' }}>
        <h4 style={{ color: 'var(--text-primary)', marginBottom: '1rem' }}>{t('wizards.termination.serviceDetails.specificServices')}</h4>

        <MultiSelectDropdown
          label={t('wizards.termination.serviceDetails.selectServicesLabel')}
          placeholder={t('wizards.termination.serviceDetails.selectServicesPlaceholder')}
          options={serviceOptions}
          selected={selectedServices}
          onChange={setSelectedServices}
        />

        {selectedServices.map((value) => {
          const opt = SERVICE_OPTIONS.find((o) => o.value === value);
          return <input key={opt.fieldName} type="hidden" name={opt.fieldName} value="true" />;
        })}

        {selectedWithUsername.length > 0 && (
          <div className="flex flex-col gap-4 mt-4">
            {selectedWithUsername.map((o) => (
              <div key={o.usernameField} style={{ maxWidth: '400px' }}>
                <label className="form-label" htmlFor={`term-${o.usernameField}`}>
                  {t('wizards.termination.serviceDetails.usernameFor', { service: t(`wizards.termination.serviceDetails.${o.key}`) })}
                </label>
                <input id={`term-${o.usernameField}`} name={o.usernameField} type="text" className="form-control" />
              </div>
            ))}
          </div>
        )}

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
