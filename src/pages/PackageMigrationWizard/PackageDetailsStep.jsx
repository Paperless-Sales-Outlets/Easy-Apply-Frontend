import React from 'react';
import { useTranslation } from 'react-i18next';

export default function PackageDetailsStep({
  isActive,
  customerPackage,
  requiredPackage,
  effectiveDate,
  setEffectiveDate,
  remarks,
  setRemarks,
  showValidationErrors,
}) {
  const { t } = useTranslation();
  const today = new Date().toISOString().split('T')[0];

  return (
    <div>
      <h3 style={{ color: 'var(--slt-blue, #0056b3)', marginBottom: '1.5rem', fontWeight: 'bold' }}>
        {t('wizards.packageMigration.packageDetails.heading', 'Step 2 – Migration Schedule')}
      </h3>

      {/* Customer Current Package Summary Card */}
      {customerPackage && (
        <div
          className="card"
          style={{
            padding: '1.5rem',
            backgroundColor: '#f0f9ff',
            border: '1px solid #bae6fd',
            borderRadius: '8px',
            marginBottom: '1.5rem',
          }}
        >
          <h4 style={{ color: '#0369a1', margin: '0 0 0.75rem 0', fontSize: '1.05rem', fontWeight: '600' }}>
            Current Connected Package
          </h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem', fontSize: '0.9rem', color: '#334155' }}>
            <div><strong>Telephone:</strong> {customerPackage.telephone}</div>
            <div><strong>Current Package:</strong> {customerPackage.packageName || customerPackage.currentPackage}</div>
            <div><strong>Speed:</strong> {customerPackage.speed || 'N/A'}</div>
            <div><strong>Monthly Fee:</strong> {customerPackage.monthlyPrice ? `LKR ${customerPackage.monthlyPrice.toLocaleString()}` : 'N/A'}</div>
            <div><strong>Activation Date:</strong> {customerPackage.activationDate || 'N/A'}</div>
          </div>
        </div>
      )}

      {/* Effective Date & Remarks */}
      <div
        className="card"
        style={{
          padding: '1.5rem',
          backgroundColor: 'var(--surface-color, #ffffff)',
          border: '1px solid var(--border-color, #e2e8f0)',
          borderRadius: '8px',
          marginBottom: '1.5rem',
        }}
      >
        <div style={{ marginBottom: '1.25rem', padding: '0.75rem 1rem', backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px' }}>
          <span style={{ fontSize: '0.75rem', color: '#166534', fontWeight: 700, textTransform: 'uppercase' }}>Requested Package</span>
          <div style={{ fontSize: '0.95rem', color: '#14532d', fontWeight: 700 }}>{requiredPackage}</div>
        </div>

        {/* Effective Date */}
        <div className="form-group" style={{ marginBottom: '1.25rem' }}>
          <label className="form-label" htmlFor="pm-effectiveDate" style={{ fontWeight: '600', display: 'block', marginBottom: '0.35rem' }}>
            {t('wizards.packageMigration.packageDetails.effectiveDate', 'Effective Date')} <span style={{ color: 'red' }}>*</span>
          </label>
          <div>
            <input
              id="pm-effectiveDate"
              name="effectiveDate"
              type="date"
              min={today}
              className="form-control"
              value={effectiveDate}
              onChange={(e) => setEffectiveDate(e.target.value)}
              required={isActive}
              style={{
                width: '100%',
                padding: '0.55rem',
                borderRadius: '6px',
                border: (showValidationErrors && !effectiveDate) ? '1px solid #dc2626' : '1px solid #cbd5e1',
              }}
            />
          </div>
          <small style={{ color: '#64748b', display: 'block', marginTop: '0.3rem' }}>
            Date from which new package features & billing will apply (must be today or a future date).
          </small>
          {showValidationErrors && !effectiveDate && (
            <div style={{ color: '#dc2626', fontSize: '0.85rem', marginTop: '0.4rem' }}>
              Effective Date is required.
            </div>
          )}
        </div>

        {/* Remarks */}
        <div className="form-group">
          <label className="form-label" htmlFor="pm-remarks" style={{ fontWeight: '600', display: 'block', marginBottom: '0.35rem' }}>
            {t('wizards.packageMigration.packageDetails.remarks', 'Additional Remarks / Special Instructions')}
          </label>
          <textarea
            id="pm-remarks"
            name="remarks"
            className="form-control"
            rows="3"
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            placeholder="Any specific instructions or preferences regarding the package migration..."
            style={{ width: '100%', padding: '0.55rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}
          />
        </div>
      </div>
    </div>
  );
}
