import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

export default function ReasonStep() {
  const { t } = useTranslation();
  const [showCompetitorDetails, setShowCompetitorDetails] = useState(false);

  const reasons = [
    "Repair Issues",
    "Non Payment",
    "Bill Dispute",
    "Moved to no coverage area",
    "Financial Issues",
    "Better Competitor Offer*",
    "Business Close / Migrations",
    "Convert to Mobile",
    "Migrate to FTTH",
    "Migrate to LTE",
    "Customer Care Issues",
    "Poor voice quality",
    "Requirement over",
    "Short Term Requirement",
    "Speed Issues",
    "Children Addicted to Internet",
    "Megaline Disconnections",
    "Need Mobility",
    "Poor Signal Quality",
    "Interruptions to Internet",
    "Delay in Channel Swapping",
    "Children Addicted to TV"
  ];

  const handleReasonChange = (e, reason) => {
    if (reason === "Better Competitor Offer*") {
      setShowCompetitorDetails(e.target.checked);
    }
  };

  return (
    <div>
      <h3 style={{ color: 'var(--slt-blue)', marginBottom: '1.5rem' }}>{t('wizards.termination.reason.heading')}</h3>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
        {t('wizards.termination.reason.desc')}
      </p>

      <div className="card" style={{ padding: '1.5rem', backgroundColor: 'var(--surface-color)', border: '1px solid var(--border-color)', boxShadow: 'none' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1rem' }}>
          {reasons.map((reason, idx) => (
            <label key={idx} className="checkbox-label" style={{ margin: 0 }}>
              <input 
                type="checkbox" 
                className="checkbox-input" 
                onChange={(e) => handleReasonChange(e, reason)} 
              /> 
              {t(`wizards.termination.reason.reasons.${reason}`)}
            </label>
          ))}
        </div>
      </div>

      {showCompetitorDetails && (
        <div className="card mt-6" style={{ padding: '1.5rem', border: '1px solid var(--slt-green)', backgroundColor: 'rgba(0, 166, 80, 0.02)' }}>
          <h4 style={{ color: 'var(--text-primary)', marginBottom: '1rem' }}>{t('wizards.termination.reason.compDetails')}</h4>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
            {t('wizards.termination.reason.compDetailsDesc')}
          </p>
          
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '600px' }}>
              <thead>
                <tr style={{ backgroundColor: 'var(--bg-color)', borderBottom: '2px solid var(--border-color)' }}>
                  <th style={{ padding: '0.8rem' }}>{t('wizards.termination.reason.operatorName')}</th>
                  <th style={{ padding: '0.8rem' }}>Airtel</th>
                  <th style={{ padding: '0.8rem' }}>Dialog</th>
                  <th style={{ padding: '0.8rem' }}>Etisalat</th>
                  <th style={{ padding: '0.8rem' }}>Lanka Bell</th>
                  <th style={{ padding: '0.8rem' }}>Mobitel</th>
                  <th style={{ padding: '0.8rem' }}>Hutch</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={{ padding: '0.8rem', fontWeight: 'bold' }}>{t('wizards.termination.reason.pkgName')}</td>
                  <td style={{ padding: '0.4rem' }}><input type="text" className="form-control" style={{ padding: '0.4rem' }} /></td>
                  <td style={{ padding: '0.4rem' }}><input type="text" className="form-control" style={{ padding: '0.4rem' }} /></td>
                  <td style={{ padding: '0.4rem' }}><input type="text" className="form-control" style={{ padding: '0.4rem' }} /></td>
                  <td style={{ padding: '0.4rem' }}><input type="text" className="form-control" style={{ padding: '0.4rem' }} /></td>
                  <td style={{ padding: '0.4rem' }}><input type="text" className="form-control" style={{ padding: '0.4rem' }} /></td>
                  <td style={{ padding: '0.4rem' }}><input type="text" className="form-control" style={{ padding: '0.4rem' }} /></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="form-group mt-6">
        <label className="form-label">{t('wizards.termination.reason.addComments')}</label>
        <textarea className="form-control" rows="3"></textarea>
      </div>

    </div>
  );
}
