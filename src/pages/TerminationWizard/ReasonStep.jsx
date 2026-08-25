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

  const reasonFieldName = (reason) => `reason_${reason.replace(/[^a-zA-Z0-9]+/g, '')}`;

  const competitors = ['Airtel', 'Dialog', 'Etisalat', 'Lanka Bell', 'Mobitel', 'Hutch'];

  return (
    <div>
      <h3 style={{ color: 'var(--slt-blue)', marginBottom: '1.5rem' }}>{t('wizards.termination.reason.heading')}</h3>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
        {t('wizards.termination.reason.desc')}
      </p>

      <fieldset className="card" style={{ padding: '1.5rem', backgroundColor: 'var(--surface-color)', border: '1px solid var(--border-color)', boxShadow: 'none', margin: 0 }}>
        <legend className="sr-only">{t('wizards.termination.reason.heading')}</legend>
        <div className="responsive-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))", gap: "1rem" }}>
          {reasons.map((reason, idx) => (
            <label key={idx} className="checkbox-label" style={{ margin: 0 }}>
              <input
                type="checkbox"
                name={reasonFieldName(reason)}
                className="checkbox-input"
                onChange={(e) => handleReasonChange(e, reason)}
              />
              {t(`wizards.termination.reason.reasons.${reason}`)}
            </label>
          ))}
        </div>
      </fieldset>

      {showCompetitorDetails && (
        <div className="card mt-6" style={{ padding: '1.5rem', border: '1px solid var(--slt-green)', backgroundColor: 'rgba(0, 166, 80, 0.02)' }}>
          <h4 style={{ color: 'var(--text-primary)', marginBottom: '1rem' }}>{t('wizards.termination.reason.compDetails')}</h4>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
            {t('wizards.termination.reason.compDetailsDesc')}
          </p>

          <div className="table-container">
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '600px' }}>
              <thead>
                <tr style={{ backgroundColor: 'var(--bg-color)', borderBottom: '2px solid var(--border-color)' }}>
                  <th style={{ padding: '0.8rem' }} scope="col">{t('wizards.termination.reason.operatorName')}</th>
                  {competitors.map((name) => (
                    <th key={name} style={{ padding: '0.8rem' }} scope="col">{name}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr>
                  <th style={{ padding: '0.8rem', fontWeight: 'bold' }} scope="row">{t('wizards.termination.reason.pkgName')}</th>
                  {competitors.map((name) => (
                    <td key={name} style={{ padding: '0.4rem' }}>
                      <input
                        type="text"
                        name={`competitorPkg_${name.replace(/\s+/g, '')}`}
                        className="form-control"
                        style={{ padding: '0.4rem' }}
                        aria-label={`${t('wizards.termination.reason.pkgName')} - ${name}`}
                      />
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="form-group mt-6">
        <label className="form-label" htmlFor="term-addComments">{t('wizards.termination.reason.addComments')}</label>
        <textarea id="term-addComments" name="additionalComments" className="form-control" rows="3"></textarea>
      </div>

    </div>
  );
}
