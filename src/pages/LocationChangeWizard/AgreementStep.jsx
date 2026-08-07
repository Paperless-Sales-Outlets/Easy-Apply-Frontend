import React, { useRef, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

export default function AgreementStep({ 
  isActive, 
  formData = {}, 
  agreed,
  setAgreed,
  signature,
  setSignature,
  signatureFile,
  setSignatureFile,
}) {
  const { t } = useTranslation();

  // State management
  const [signatureMethod, setSignatureMethod] = useState('digital');
  const [signatureFileError, setSignatureFileError] = useState('');
  const [isDrawing, setIsDrawing] = useState(false);
  const signatureData = signature;

  const canvasRef = useRef(null);

  useEffect(() => {
    if (isActive && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      ctx.lineWidth = 2;
      ctx.lineCap = 'round';
      ctx.strokeStyle = '#000000';
    }
  }, [isActive]);

  const startDrawing = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    const clientX = e.clientX || (e.touches && e.touches[0].clientX);
    const clientY = e.clientY || (e.touches && e.touches[0].clientY);

    ctx.beginPath();
    ctx.moveTo(clientX - rect.left, clientY - rect.top);
    setIsDrawing(true);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    const clientX = e.clientX || (e.touches && e.touches[0].clientX);
    const clientY = e.clientY || (e.touches && e.touches[0].clientY);

    ctx.lineTo(clientX - rect.left, clientY - rect.top);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    const canvas = canvasRef.current;
    if (canvas) {
      const data = canvas.toDataURL();
      if (setSignature) {
        setSignature(data);
      }
    }
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      if (setSignature) {
        setSignature(null);
      }
    }
  };

  const handleSignatureFileChange = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) {
      setSignatureFile(null);
      setSignatureFileError('');
      return;
    }
    const allowedTypes = ['application/pdf', 'image/png', 'image/jpeg'];
    if (!allowedTypes.includes(file.type)) {
      setSignatureFile(null);
      setSignatureFileError('Unsupported file type. Upload JPG, PNG, or PDF.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setSignatureFile(null);
      setSignatureFileError('File size exceeds 5MB.');
      return;
    }
    setSignatureFileError('');
    setSignatureFile(file);
    if (setSignature) {
      setSignature(null);
    }
  };

  const handleCheckboxChange = (e) => {
    const checked = e.target.checked;
    if (setAgreed) {
      setAgreed(checked);
    }
  };

  return (
    <div style={{ width: '100%' }}>
      <h3 style={{ color: 'var(--slt-blue)', marginBottom: '1.5rem' }}>
        {t('wizards.locationChange.agreement.heading', 'Review & Agreement')}
      </h3>

      {/* 1. APPLICATION SUMMARY */}
      <div className="card" style={{ padding: '1.5rem', backgroundColor: 'var(--surface-color)', border: '1px solid var(--border-color)', borderRadius: '8px', marginBottom: '1.5rem' }}>
        <h4 style={{ color: 'var(--slt-blue)', marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
          {t('wizards.locationChange.summary.title', 'Application Summary')}
        </h4>
        <div style={{ marginBottom: '1.25rem' }}>
          <h5 style={{ fontWeight: '600', color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
            {t('wizards.locationChange.summary.customerInfo', 'Customer Information')}
          </h5>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
            <div><strong>Telephone:</strong> {formData.telephone || 'N/A'}</div>
            <div><strong>Legal Owner:</strong> {formData.legalOwner || 'N/A'}</div>
            <div><strong>Service Type:</strong> {formData.serviceType || 'N/A'}</div>
          </div>
        </div>
        <hr style={{ border: 'none', borderTop: '1px solid var(--border-color)', margin: '1rem 0' }} />
        <div style={{ marginBottom: '1.25rem' }}>
          <h5 style={{ fontWeight: '600', color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
            {t('wizards.locationChange.summary.addressInfo', 'Relocation Address')}
          </h5>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '0.75rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
            <div><strong>Current Address:</strong> {formData.currentAddress || 'N/A'}</div>
            <div><strong>New Address:</strong> {formData.newAddress || 'N/A'}</div>
          </div>
        </div>
        <hr style={{ border: 'none', borderTop: '1px solid var(--border-color)', margin: '1rem 0' }} />
        <div>
          <h5 style={{ fontWeight: '600', color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
            {t('wizards.locationChange.summary.preferences', 'Preferences')}
          </h5>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
            <div><strong>Relocation Date:</strong> {formData.relocationDate || 'N/A'}</div>
            <div><strong>Call Forwarding:</strong> {formData.callForwarding ? 'Yes' : 'No'}</div>
          </div>
        </div>
      </div>

      {/* 2. UPLOADED DOCUMENTS SUMMARY */}
      <div className="card" style={{ padding: '1.5rem', backgroundColor: 'var(--surface-color)', border: '1px solid var(--border-color)', borderRadius: '8px', marginBottom: '1.5rem' }}>
        <h4 style={{ color: 'var(--slt-blue)', marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
          {t('wizards.locationChange.documents.title', 'Uploaded Documents')}
        </h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.9rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: 'var(--text-primary)', fontWeight: '500' }}>Proof of Address</span>
            {formData.proofOfAddress ? (
              <span style={{ color: '#22c55e', fontWeight: '600' }}>✔ {formData.proofOfAddress.name || 'Uploaded'}</span>
            ) : (
              <span style={{ color: 'var(--text-secondary)' }}>Not provided</span>
            )}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: 'var(--text-primary)', fontWeight: '500' }}>Authorization Letter</span>
            {formData.authorizationLetter ? (
              <span style={{ color: '#22c55e', fontWeight: '600' }}>✔ {formData.authorizationLetter.name || 'Uploaded'}</span>
            ) : (
              <span style={{ color: 'var(--text-secondary)' }}>Not provided</span>
            )}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: 'var(--text-primary)', fontWeight: '500' }}>BRC (Business Registration)</span>
            {formData.brc ? (
              <span style={{ color: '#22c55e', fontWeight: '600' }}>✔ {formData.brc.name || 'Uploaded'}</span>
            ) : (
              <span style={{ color: 'var(--text-secondary)' }}>Not provided</span>
            )}
          </div>
        </div>
      </div>

      {/* 3. TERMS & CONDITIONS */}
      <div className="card" style={{ padding: '1.5rem', backgroundColor: 'var(--surface-color)', border: '1px solid var(--border-color)', borderRadius: '8px', marginBottom: '1.5rem' }}>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1rem', lineHeight: '1.6' }}>
          {t('wizards.locationChange.agreement.para1')}
        </p>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1rem', lineHeight: '1.6' }}>
          {t('wizards.locationChange.agreement.para2')}
        </p>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1.5rem', lineHeight: '1.6' }}>
          {t('wizards.locationChange.agreement.para3')}
        </p>
        <label className="checkbox-label" style={{ fontWeight: '500', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
          <input 
            type="checkbox" 
            className="checkbox-input" 
            checked={agreed}
            onChange={handleCheckboxChange}
          /> 
          {t('wizards.locationChange.agreement.agreeLabel', 'I agree to the Declaration and Terms & Conditions')}
        </label>
      </div>

      {/* 4. SIGNATURE */}
      <div className="card" style={{ padding: '1.5rem', backgroundColor: 'var(--surface-color)', border: '1px solid var(--border-color)', borderRadius: '8px', marginBottom: '1.5rem' }}>
        <label style={{ display: 'block', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
          {t('wizards.locationChange.agreement.signatureLabel', 'Signature')}
        </label>

        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', color: signatureMethod === 'digital' ? 'var(--text-primary)' : 'var(--text-secondary)' }}>
            <input
              type="radio"
              name="signatureMethod"
              value="digital"
              checked={signatureMethod === 'digital'}
              onChange={() => setSignatureMethod('digital')}
              style={{ cursor: 'pointer' }}
            />
            Digital Signature
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', color: signatureMethod === 'upload' ? 'var(--text-primary)' : 'var(--text-secondary)' }}>
            <input
              type="radio"
              name="signatureMethod"
              value="upload"
              checked={signatureMethod === 'upload'}
              onChange={() => setSignatureMethod('upload')}
              style={{ cursor: 'pointer' }}
            />
            Upload Signature Image / PDF
          </label>
        </div>

        {signatureMethod === 'digital' ? (
          <>
            <div style={{ border: '1px dashed var(--border-color)', borderRadius: '6px', backgroundColor: '#ffffff', position: 'relative', touchAction: 'none' }}>
              <canvas
                ref={canvasRef}
                width={500}
                height={160}
                style={{ width: '100%', height: '160px', display: 'block', cursor: 'crosshair' }}
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                onTouchStart={startDrawing}
                onTouchMove={draw}
                onTouchEnd={stopDrawing}
              />
              {!signatureData && !isDrawing && (
                <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', color: '#9ca3af', pointerEvents: 'none', fontSize: '0.9rem' }}>
                  Draw your signature
                </div>
              )}
            </div>
            <button
              type="button"
              onClick={clearSignature}
              style={{
                marginTop: '0.75rem',
                padding: '0.4rem 0.8rem',
                fontSize: '0.85rem',
                backgroundColor: 'transparent',
                border: '1px solid var(--border-color)',
                borderRadius: '4px',
                color: 'var(--text-primary)',
                cursor: 'pointer'
              }}
            >
              Clear Signature
            </button>
          </>
        ) : (
          <div>
            <input
              type="file"
              name="signatureFile"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={handleSignatureFileChange}
              style={{ display: 'block', width: '100%', padding: '0.4rem 0' }}
            />
            <span style={{ fontSize: '0.8rem', color: '#666' }}>Accepted formats: JPG, PNG, PDF (Max 5MB)</span>
            {signatureFileError && (
              <div style={{ color: '#dc3545', fontSize: '0.82rem', marginTop: '4px' }}>
                {signatureFileError}
              </div>
            )}
            {signatureFile && (
              <div style={{ marginTop: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', color: 'var(--text-primary)' }}>
                <span>{signatureFile.name}</span>
                <button
                  type="button"
                  onClick={() => {
                    setSignatureFile(null);
                    setSignatureFileError('');
                  }}
                  style={{ background: 'none', border: 'none', color: '#dc3545', cursor: 'pointer', textDecoration: 'underline', fontSize: '0.9rem' }}
                >
                  Remove
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}