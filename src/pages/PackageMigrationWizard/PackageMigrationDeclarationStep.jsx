import React, { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import {
  FiCheckCircle,
  FiEdit3,
  FiUploadCloud,
  FiTrash2,
  FiShield,
  FiFileText,
  FiPhone,
  FiUser,
  FiLayers,
  FiCalendar,
  FiArrowRight,
} from 'react-icons/fi';
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
  const [signatureMethod, setSignatureMethod] = useState('digital'); // 'digital' | 'upload'
  const [signatureFileError, setSignatureFileError] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

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

  const handleClearFile = (e) => {
    e.stopPropagation();
    setSignatureFile(null);
    setSignatureFileError('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div style={{ width: '100%', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: '1.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.35rem' }}>
          <div
            style={{
              backgroundColor: '#eff6ff',
              color: '#0056b3',
              width: '36px',
              height: '36px',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <FiShield size={20} />
          </div>
          <h3 style={{ margin: 0, color: '#0056b3', fontSize: '1.3rem', fontWeight: 800 }}>
            {t('wizards.packageMigration.declaration.heading', 'Step 3 – Declaration & Digital Signature')}
          </h3>
        </div>
        <p style={{ margin: 0, color: '#64748b', fontSize: '0.92rem', paddingLeft: '2.8rem' }}>
          Review your upgradation details, confirm the legal declaration, and provide your digital signature.
        </p>
      </div>

      {/* ── CARD 1: APPLICATION SUMMARY CARD ── */}
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          padding: '1.75rem 2rem',
          border: '1.5px solid #e2e8f0',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.04)',
          marginBottom: '1.75rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.85rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <FiFileText size={18} style={{ color: '#0056b3' }} />
            <h4 style={{ margin: 0, color: '#0f172a', fontSize: '1.05rem', fontWeight: 800 }}>
              Service Upgradation Summary
            </h4>
          </div>
          <span style={{ fontSize: '0.75rem', fontWeight: 800, backgroundColor: '#eff6ff', color: '#0056b3', padding: '0.25rem 0.75rem', borderRadius: '9999px' }}>
            Review Before Signing
          </span>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '1rem',
          }}
        >
          {/* Telephone */}
          <div style={{ padding: '0.85rem 1rem', backgroundColor: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#64748b', fontSize: '0.78rem', fontWeight: 700, marginBottom: '0.25rem' }}>
              <FiPhone size={13} />
              <span>TELEPHONE / ACCOUNT</span>
            </div>
            <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0f172a' }}>
              {customerPackage?.telephone || customerPackage?.accountNumber || 'N/A'}
            </div>
          </div>

          {/* Customer Name */}
          <div style={{ padding: '0.85rem 1rem', backgroundColor: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#64748b', fontSize: '0.78rem', fontWeight: 700, marginBottom: '0.25rem' }}>
              <FiUser size={13} />
              <span>CUSTOMER NAME</span>
            </div>
            <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0f172a' }}>
              {customerPackage?.fullName || customerPackage?.customerName || 'N/A'}
            </div>
          </div>

          {/* Existing Package */}
          <div style={{ padding: '0.85rem 1rem', backgroundColor: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#64748b', fontSize: '0.78rem', fontWeight: 700, marginBottom: '0.25rem' }}>
              <FiLayers size={13} />
              <span>CURRENT PACKAGE</span>
            </div>
            <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#475569' }}>
              {customerPackage?.packageName || customerPackage?.package || customerPackage?.currentPackage || 'N/A'}
            </div>
          </div>

          {/* Upgraded Package */}
          <div style={{ padding: '0.85rem 1rem', backgroundColor: '#f0fdf4', borderRadius: '12px', border: '1.5px solid #86efac' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#166534', fontSize: '0.78rem', fontWeight: 800, marginBottom: '0.25rem' }}>
              <FiCheckCircle size={13} />
              <span>REQUESTED UPGRADED PACKAGE</span>
            </div>
            <div style={{ fontSize: '1rem', fontWeight: 800, color: '#15803d' }}>
              {requiredPackage || 'N/A'}
            </div>
          </div>

          {/* Effective Date */}
          <div style={{ padding: '0.85rem 1rem', backgroundColor: '#eff6ff', borderRadius: '12px', border: '1.5px solid #93c5fd' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#0056b3', fontSize: '0.78rem', fontWeight: 800, marginBottom: '0.25rem' }}>
              <FiCalendar size={13} />
              <span>EFFECTIVE DATE</span>
            </div>
            <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0056b3' }}>
              {effectiveDate || 'N/A'}
            </div>
          </div>
        </div>
      </div>

      {/* ── CARD 2: CUSTOMER DECLARATION & TERMS CARD ── */}
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          padding: '1.75rem 2rem',
          border: (showValidationErrors && !declarationAccepted) ? '2px solid #dc2626' : '1.5px solid #e2e8f0',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.04)',
          marginBottom: '1.75rem',
          transition: 'all 0.2s ease',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1rem' }}>
          <FiShield size={18} style={{ color: '#0056b3' }} />
          <h4 style={{ margin: 0, color: '#0f172a', fontSize: '1.05rem', fontWeight: 800 }}>
            {t('wizards.packageMigration.packageDetails.declarationHeading', 'Customer Declaration & Terms')}
          </h4>
        </div>

        <div
          style={{
            backgroundColor: '#f8fafc',
            borderRadius: '12px',
            padding: '1.25rem',
            border: '1px solid #e2e8f0',
            marginBottom: '1.25rem',
            fontSize: '0.88rem',
            color: '#334155',
            lineHeight: '1.6',
          }}
        >
          <p style={{ margin: '0 0 0.75rem 0' }}>
            {t(
              'wizards.packageMigration.packageDetails.declarationText',
              'I hereby declare that the information provided in this service upgradation application is true and accurate to the best of my knowledge. I understand that upgrading to the requested package may change my monthly charges, contract terms, and service features, and I agree to bear any applicable upgradation fees as per SLT\'s prevailing terms and conditions.'
            )}
          </p>
          <ul style={{ margin: 0, paddingLeft: '1.25rem', color: '#64748b', fontSize: '0.82rem' }}>
            <li style={{ marginBottom: '0.35rem' }}>I confirm I am the registered owner of this connection or authorized representative.</li>
            <li style={{ marginBottom: '0.35rem' }}>I acknowledge billing adjustments take effect from the confirmed schedule date.</li>
            <li>I agree to comply with SLTMobitel Standard Terms & Conditions for broadband and telecom services.</li>
          </ul>
        </div>

        {/* Declaration Checkbox Container */}
        <label
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '0.75rem',
            padding: '1rem 1.25rem',
            borderRadius: '12px',
            border: declarationAccepted ? '1.5px solid #16a34a' : '1.5px solid #cbd5e1',
            backgroundColor: declarationAccepted ? '#f0fdf4' : '#ffffff',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}
        >
          <input
            type="checkbox"
            name="declarationAccepted"
            checked={declarationAccepted}
            onChange={(e) => setDeclarationAccepted(e.target.checked)}
            required={isActive}
            style={{
              width: '18px',
              height: '18px',
              marginTop: '0.15rem',
              cursor: 'pointer',
              accentColor: '#0056b3',
            }}
          />
          <div>
            <div style={{ fontWeight: 800, fontSize: '0.92rem', color: declarationAccepted ? '#15803d' : '#0f172a' }}>
              {t('wizards.packageMigration.packageDetails.declarationLabel', 'I accept the Customer Declaration and Terms & Conditions')} <span style={{ color: '#dc2626' }}>*</span>
            </div>
            <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '0.15rem' }}>
              Check this box to confirm your agreement and authorization.
            </div>
          </div>
        </label>

        {showValidationErrors && !declarationAccepted && (
          <div style={{ color: '#dc2626', fontSize: '0.84rem', marginTop: '0.5rem', fontWeight: 700 }}>
            You must accept the Customer Declaration to proceed.
          </div>
        )}
      </div>

      {/* ── CARD 3: DIGITAL SIGNATURE CARD ── */}
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          padding: '1.75rem 2rem',
          border: (showValidationErrors && !signature && !signatureFile) ? '2px solid #dc2626' : '1.5px solid #e2e8f0',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.04)',
          marginBottom: '1.75rem',
          transition: 'all 0.2s ease',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.85rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <FiEdit3 size={18} style={{ color: '#0056b3' }} />
            <h4 style={{ margin: 0, color: '#0f172a', fontSize: '1.05rem', fontWeight: 800 }}>
              Digital Signature <span style={{ color: '#dc2626' }}>*</span>
            </h4>
          </div>

          {/* Toggle pill buttons */}
          <div style={{ display: 'flex', gap: '0.35rem', backgroundColor: '#f1f5f9', padding: '0.25rem', borderRadius: '10px' }}>
            <button
              type="button"
              onClick={() => setSignatureMethod('digital')}
              style={{
                border: 'none',
                padding: '0.45rem 0.9rem',
                borderRadius: '8px',
                fontWeight: 700,
                fontSize: '0.82rem',
                cursor: 'pointer',
                backgroundColor: signatureMethod === 'digital' ? '#ffffff' : 'transparent',
                color: signatureMethod === 'digital' ? '#0056b3' : '#64748b',
                boxShadow: signatureMethod === 'digital' ? '0 2px 6px rgba(0,0,0,0.08)' : 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                transition: 'all 0.15s ease',
              }}
            >
              <FiEdit3 size={14} /> Draw Signature
            </button>
            <button
              type="button"
              onClick={() => setSignatureMethod('upload')}
              style={{
                border: 'none',
                padding: '0.45rem 0.9rem',
                borderRadius: '8px',
                fontWeight: 700,
                fontSize: '0.82rem',
                cursor: 'pointer',
                backgroundColor: signatureMethod === 'upload' ? '#ffffff' : 'transparent',
                color: signatureMethod === 'upload' ? '#0056b3' : '#64748b',
                boxShadow: signatureMethod === 'upload' ? '0 2px 6px rgba(0,0,0,0.08)' : 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                transition: 'all 0.15s ease',
              }}
            >
              <FiUploadCloud size={14} /> Upload Signature Document
            </button>
          </div>
        </div>

        {signatureMethod === 'digital' ? (
          <div>
            <DigitalSignatureCanvas
              label="Sign inside the box using your mouse, stylus, or fingertip"
              required={isActive}
              value={signature}
              onChange={(val) => setSignature(val)}
              error={showValidationErrors && !signature && !signatureFile ? 'Digital Signature is mandatory.' : ''}
            />
          </div>
        ) : (
          <div>
            <div
              onDragEnter={(e) => { e.preventDefault(); e.stopPropagation(); setIsDragging(true); }}
              onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
              onDragLeave={(e) => { e.preventDefault(); e.stopPropagation(); setIsDragging(false); }}
              onDrop={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setIsDragging(false);
                if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                  const droppedFile = e.dataTransfer.files[0];
                  handleFileChange({ target: { files: [droppedFile] } });
                }
              }}
              onClick={() => fileInputRef.current && fileInputRef.current.click()}
              style={{
                border: isDragging ? '2px dashed #0056b3' : (signatureFile ? '2px solid #86efac' : '2px dashed #93c5fd'),
                backgroundColor: isDragging ? '#eff6ff' : (signatureFile ? '#f0fdf4' : '#f8fafc'),
                borderRadius: '14px',
                padding: '1.75rem',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                textAlign: 'center',
              }}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={handleFileChange}
                style={{ display: 'none' }}
              />

              {signatureFile ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#16a34a' }}>
                  <FiCheckCircle size={24} />
                  <div style={{ textAlign: 'left' }}>
                    <div style={{ fontWeight: 800, fontSize: '0.92rem', color: '#15803d' }}>
                      {signatureFile.name}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: '#166534' }}>
                      {(signatureFile.size / (1024 * 1024)).toFixed(2)} MB &middot; File ready for submission
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleClearFile}
                    style={{
                      background: '#fee2e2',
                      border: 'none',
                      borderRadius: '50%',
                      width: '30px',
                      height: '30px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#dc2626',
                      cursor: 'pointer',
                      marginLeft: '0.75rem',
                      transition: 'all 0.15s ease',
                    }}
                    title="Remove File"
                  >
                    <FiTrash2 size={15} />
                  </button>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.4rem' }}>
                  <FiUploadCloud size={32} style={{ color: '#0056b3' }} />
                  <span style={{ fontSize: '0.92rem', fontWeight: 800, color: '#0056b3' }}>
                    Click to browse or drag & drop signature file
                  </span>
                  <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                    Supported formats: PDF, PNG, JPG (Max 5MB)
                  </span>
                </div>
              )}
            </div>

            {signatureFileError && (
              <div style={{ color: '#dc2626', fontSize: '0.84rem', marginTop: '0.5rem', fontWeight: 700 }}>
                {signatureFileError}
              </div>
            )}

            {showValidationErrors && !signatureFile && !signature && (
              <div style={{ color: '#dc2626', fontSize: '0.84rem', marginTop: '0.5rem', fontWeight: 700 }}>
                Signature file upload or drawn digital signature is required.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
