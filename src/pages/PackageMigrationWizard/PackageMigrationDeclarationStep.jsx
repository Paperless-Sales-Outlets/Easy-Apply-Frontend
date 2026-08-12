import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import DigitalSignatureCanvas from '../../components/form/DigitalSignatureCanvas';

export default function PackageMigrationDeclarationStep({
  isActive,
  customerPackage,
  requiredPackage,
  effectiveDate,
  declarationAccepted,
  setDeclarationAccepted,
  signature,
  setSignature,
  signatureFile,
  setSignatureFile,
  showValidationErrors,
}) {
  const { t } = useTranslation();
  const [signatureMethod, setSignatureMethod] = useState('digital');
  const [signatureFileError, setSignatureFileError] = useState('');

  const handleFileChange = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) {
      setSignatureFile(null);
      setSignatureFileError('');
      return;
    }
    const allowed = ['application/pdf', 'image/png', 'image/jpeg', 'image/jpg'];
    if (!allowed.includes(file.type)) {
      setSignatureFile(null);
      setSignatureFileError('Unsupported file format. Please upload JPG, PNG, or PDF.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setSignatureFile(null);
      setSignatureFileError('File size exceeds 5MB limit.');
      return;
    }
    setSignatureFileError('');
    setSignatureFile(file);
    setSignature('');
  };

  return (
    <div>
      <h3 style={{ color: 'var(--slt-blue, #0056b3)', marginBottom: '1.5rem', fontWeight: 'bold' }}>
        {t('wizards.packageMigration.declaration.heading', 'Step 3 – Declaration & Digital Signature')}
      </h3>

      {/* Summary Card */}
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
        <h4 style={{ color: '#0056b3', margin: '0 0 1rem 0', fontSize: '1.05rem', fontWeight: '600' }}>
          Application Summary
        </h4>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.75rem', fontSize: '0.9rem', color: '#334155' }}>
          <div><strong>Telephone:</strong> {customerPackage?.telephone || 'N/A'}</div>
          <div><strong>Customer Name:</strong> {customerPackage?.customerName || 'N/A'}</div>
          <div><strong>Current Package:</strong> {customerPackage?.packageName || customerPackage?.currentPackage || 'N/A'}</div>
          <div><strong>Requested Package:</strong> <span style={{ color: '#0284c7', fontWeight: 'bold' }}>{requiredPackage || 'N/A'}</span></div>
          <div><strong>Effective Date:</strong> {effectiveDate || 'N/A'}</div>
        </div>
      </div>

      {/* Declaration Agreement */}
      <div
        className="card"
        style={{
          padding: '1.5rem',
          backgroundColor: 'var(--bg-color, #f8fafc)',
          border: (showValidationErrors && !declarationAccepted) ? '1px solid #dc2626' : '1px solid var(--border-color, #e2e8f0)',
          borderRadius: '8px',
          marginBottom: '1.5rem',
        }}
      >
        <h4 style={{ color: 'var(--text-primary, #1e293b)', marginBottom: '0.75rem', fontWeight: '600' }}>
          {t('wizards.packageMigration.packageDetails.declarationHeading', 'Customer Declaration & Terms')}
        </h4>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary, #475569)', marginBottom: '1.25rem', lineHeight: '1.6' }}>
          I hereby request the migration of my existing SLTMobitel service connection to the requested package selected above. I declare that the details provided are accurate and complete. I agree to abide by the standard Terms & Conditions of SLTMobitel package migration services.
        </p>

        <label className="checkbox-label" style={{ fontWeight: '600', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
          <input
            type="checkbox"
            name="declarationAccepted"
            className="checkbox-input"
            checked={declarationAccepted}
            onChange={(e) => setDeclarationAccepted(e.target.checked)}
            required={isActive}
          />
          {t('wizards.packageMigration.packageDetails.declarationLabel', 'I accept the Customer Declaration and Terms & Conditions')}
        </label>
        {showValidationErrors && !declarationAccepted && (
          <div style={{ color: '#dc2626', fontSize: '0.85rem', marginTop: '0.4rem' }}>
            You must accept the declaration to submit the application.
          </div>
        )}
      </div>

      {/* Digital Signature */}
      <div
        className="card"
        style={{
          padding: '1.5rem',
          backgroundColor: 'var(--surface-color, #ffffff)',
          border: (showValidationErrors && !signature && !signatureFile) ? '1px solid #dc2626' : '1px solid var(--border-color, #e2e8f0)',
          borderRadius: '8px',
          marginBottom: '1.5rem',
        }}
      >
        <h4 style={{ color: '#1e293b', margin: '0 0 1rem 0', fontSize: '1.05rem', fontWeight: '600' }}>
          Digital Signature <span style={{ color: 'red' }}>*</span>
        </h4>

        <div style={{ display: 'flex', gap: '1.25rem', marginBottom: '1rem' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer', fontWeight: '500' }}>
            <input
              type="radio"
              name="pmSigMethod"
              value="digital"
              checked={signatureMethod === 'digital'}
              onChange={() => setSignatureMethod('digital')}
            />
            Draw Signature
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer', fontWeight: '500' }}>
            <input
              type="radio"
              name="pmSigMethod"
              value="upload"
              checked={signatureMethod === 'upload'}
              onChange={() => setSignatureMethod('upload')}
            />
            Upload Signature Document / Image
          </label>
        </div>

        {signatureMethod === 'digital' ? (
          <DigitalSignatureCanvas
            label="Draw Digital Signature below"
            required
            value={signature}
            onChange={(val) => setSignature(val)}
            error={showValidationErrors && !signature && !signatureFile ? 'Digital Signature is mandatory (BRD 5.6).' : ''}
          />
        ) : (
          <div>
            <input
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={handleFileChange}
              style={{ display: 'block', width: '100%', padding: '0.4rem 0' }}
            />
            <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Supported Formats: PDF, JPG, PNG (Max 5MB)</span>

            {signatureFileError && (
              <div style={{ color: '#dc2626', fontSize: '0.82rem', marginTop: '0.3rem' }}>{signatureFileError}</div>
            )}

            {signatureFile && (
              <div style={{ color: '#0056b3', fontSize: '0.85rem', marginTop: '0.5rem', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span>✓ {signatureFile.name} ({(signatureFile.size / (1024 * 1024)).toFixed(2)} MB)</span>
                <button
                  type="button"
                  onClick={() => setSignatureFile(null)}
                  style={{ background: 'none', border: 'none', color: '#dc2626', cursor: 'pointer', fontSize: '0.8rem', textDecoration: 'underline' }}
                >
                  Remove
                </button>
              </div>
            )}

            {showValidationErrors && !signatureFile && !signature && (
              <div style={{ color: '#dc2626', fontSize: '0.82rem', marginTop: '0.4rem' }}>
                Signature file upload is required.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
