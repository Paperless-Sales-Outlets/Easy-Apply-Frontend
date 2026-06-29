import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

export default function PreferencesStep() {
  const { t } = useTranslation();
  const [disconnectAction, setDisconnectAction] = useState('all');
  const [callForwarding, setCallForwarding] = useState('no');

  return (
    <div>
      <h3 style={{ color: 'var(--slt-blue)', marginBottom: '1.5rem' }}>{t('wizards.locationChange.preferences.heading')}</h3>

      <div className="form-group">
        <label className="form-label">{t('wizards.locationChange.preferences.disconnectExisting')}</label>
        <div style={{ maxWidth: '200px' }}>
          <input type="date" className="form-control" required />
        </div>
      </div>

      <div className="form-group mt-4">
        <label className="form-label">{t('wizards.locationChange.preferences.presentServices')}</label>
        
        <div className="radio-group" style={{ marginBottom: '1rem' }}>
          <label className="radio-label">
            <input type="radio" name="disconnectAction" value="all" checked={disconnectAction === 'all'} onChange={(e) => setDisconnectAction(e.target.value)} className="radio-input" /> 
            {t('wizards.locationChange.preferences.disconnectAll')}
          </label>
          <label className="radio-label">
            <input type="radio" name="disconnectAction" value="keep" checked={disconnectAction === 'keep'} onChange={(e) => setDisconnectAction(e.target.value)} className="radio-input" /> 
            {t('wizards.locationChange.preferences.keepServices')}
          </label>
        </div>

        {disconnectAction === 'keep' && (
          <div className="card flex gap-4 flex-wrap" style={{ padding: '1rem', backgroundColor: 'var(--bg-color)', border: '1px solid var(--border-color)', boxShadow: 'none' }}>
            <label className="checkbox-label" style={{ margin: 0, minWidth: '120px' }}>
              <input type="checkbox" className="checkbox-input" /> {t('wizards.locationChange.preferences.incoming')}
            </label>
            <label className="checkbox-label" style={{ margin: 0, minWidth: '120px' }}>
              <input type="checkbox" className="checkbox-input" /> {t('wizards.locationChange.preferences.outgoing')}
            </label>
            <label className="checkbox-label" style={{ margin: 0, minWidth: '120px' }}>
              <input type="checkbox" className="checkbox-input" /> {t('wizards.locationChange.preferences.broadband')}
            </label>
            <label className="checkbox-label" style={{ margin: 0, minWidth: '120px' }}>
              <input type="checkbox" className="checkbox-input" /> {t('wizards.locationChange.preferences.peoTv')}
            </label>
          </div>
        )}
      </div>

      <div className="form-group mt-4">
        <label className="form-label">{t('wizards.locationChange.preferences.callForwarding')}</label>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
          {t('wizards.locationChange.preferences.callForwardingNote')}
        </p>
        
        <div className="radio-group" style={{ marginBottom: '1rem' }}>
          <label className="radio-label">
            <input type="radio" name="callForwarding" value="yes" checked={callForwarding === 'yes'} onChange={(e) => setCallForwarding(e.target.value)} className="radio-input" /> {t('wizards.locationChange.preferences.yes')}
          </label>
          <label className="radio-label">
            <input type="radio" name="callForwarding" value="no" checked={callForwarding === 'no'} onChange={(e) => setCallForwarding(e.target.value)} className="radio-input" /> {t('wizards.locationChange.preferences.no')}
          </label>
        </div>

        {callForwarding === 'yes' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>{t('wizards.locationChange.preferences.durationReq')}</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', width: '150px' }}>
              <input type="number" min="1" max="12" className="form-control" required={callForwarding === 'yes'} />
              <span style={{ color: 'var(--text-secondary)' }}>{t('wizards.locationChange.preferences.months')}</span>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
