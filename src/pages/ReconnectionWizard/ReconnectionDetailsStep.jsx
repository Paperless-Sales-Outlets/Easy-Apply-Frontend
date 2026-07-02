import React from 'react';
import { useTranslation } from 'react-i18next';

export default function ReconnectionDetailsStep() {
  const { t } = useTranslation();

  return (
    <div>
      <h3 style={{ color: 'var(--slt-blue)', marginBottom: '1.5rem' }}>{t('wizards.reconnection.reconnectionDetails.heading')}</h3>
      
      <div className="form-group flex flex-col-mobile gap-4 items-center">
        <label className="form-label" style={{ margin: 0, flexShrink: 0 }}>
          {t('wizards.reconnection.reconnectionDetails.disconnectedFrom')}
        </label>
        <input type="date" className="form-control" style={{ flex: '1' }} />
        <span style={{ padding: '0 0.5rem' }}>{t('wizards.reconnection.reconnectionDetails.disconnectedTo')}</span>
        <input type="date" className="form-control" style={{ flex: '1' }} />
      </div>

      <div className="form-group flex gap-4 items-center">
        <label className="form-label" style={{ margin: 0 }}>
          {t('wizards.reconnection.reconnectionDetails.amountToPay')}
        </label>
        <input type="text" className="form-control" style={{ maxWidth: '200px' }} />
      </div>

      <h4 style={{ marginTop: '2rem', marginBottom: '1rem', color: 'var(--text-primary)' }}>
        {t('wizards.reconnection.reconnectionDetails.facilitiesHeading')}
      </h4>

      <div className="form-group">
        <div className="radio-group responsive-grid" style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)" }}>
          {[
            t('wizards.reconnection.reconnectionDetails.broadband'), 
            t('wizards.reconnection.reconnectionDetails.peoTv'),
            t('wizards.reconnection.reconnectionDetails.sltPlus'), 
            t('wizards.reconnection.reconnectionDetails.cli'),
            t('wizards.reconnection.reconnectionDetails.idd')
          ].map(facility => (
            <label key={facility} className="checkbox-label">
              <input type="checkbox" className="checkbox-input" /> {facility}
            </label>
          ))}
        </div>
      </div>

      <div className="form-group flex flex-col-mobile gap-4 mt-4">
        <div style={{ flex: '1' }}>
          <label className="checkbox-label" style={{ marginBottom: '0.5rem' }}>
            <input type="checkbox" className="checkbox-input" /> {t('wizards.reconnection.reconnectionDetails.dialUp')}
          </label>
          <div className="flex items-center gap-2" style={{ marginLeft: '1.5rem' }}>
            <span style={{ fontSize: '0.9rem' }}>{t('wizards.reconnection.reconnectionDetails.username')}</span>
            <input type="text" className="form-control" style={{ padding: '0.25rem 0.5rem' }} />
          </div>
        </div>
        <div style={{ flex: '1' }}>
          <label className="checkbox-label" style={{ marginBottom: '0.5rem' }}>
            <input type="checkbox" className="checkbox-input" /> {t('wizards.reconnection.reconnectionDetails.email')}
          </label>
          <div className="flex items-center gap-2" style={{ marginLeft: '1.5rem' }}>
            <span style={{ fontSize: '0.9rem' }}>{t('wizards.reconnection.reconnectionDetails.username')}</span>
            <input type="text" className="form-control" style={{ padding: '0.25rem 0.5rem' }} />
          </div>
        </div>
      </div>

      <div className="form-group mt-4 flex items-center gap-4">
        <label className="checkbox-label">
          <input type="checkbox" className="checkbox-input" /> {t('wizards.reconnection.reconnectionDetails.other')}
        </label>
        <div className="flex items-center gap-2" style={{ flex: 1 }}>
          <span style={{ fontSize: '0.9rem' }}>{t('wizards.reconnection.reconnectionDetails.specify')}</span>
          <input type="text" className="form-control" />
        </div>
      </div>

      <div className="form-group mt-4">
        <label className="form-label">{t('wizards.reconnection.reconnectionDetails.remarks')}</label>
        <textarea className="form-control" rows="3"></textarea>
      </div>

    </div>
  );
}
