import React, { useState, forwardRef, useImperativeHandle, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import DigitalSignatureCanvas from '../../components/DigitalSignatureCanvas';

// A reusable file input wrapper that adds a clear (✕) button and Drag-and-Drop zone
const FileInputWithClear = forwardRef(({ label, name, accept, required, onChange }, ref) => {
  const internalRef = useRef(null);
  const inputRef = ref || internalRef;
  const [hasFile, setHasFile] = useState(false);
  const [fileName, setFileName] = useState('');
  const [isDragging, setIsDragging] = useState(false);

  const handleClear = (e) => {
    e.stopPropagation();
    e.preventDefault();
    if (inputRef.current) {
      inputRef.current.value = ''; 
    }
    setHasFile(false);
    setFileName('');
    if (onChange) onChange({ target: { files: [] } }); 
  };

  const handleChange = (e) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      setHasFile(true);
      setFileName(files[0].name);
    } else {
      setHasFile(false);
      setFileName('');
    }
    if (onChange) onChange(e);
  };

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      if (inputRef.current) {
        inputRef.current.files = e.dataTransfer.files;
        handleChange({ target: inputRef.current });
      }
    }
  };

  return (
    <div style={{ width: '100%', marginBottom: '1rem' }}>
      <label className="form-label">{label} {required && <span style={{ color: 'var(--danger, #dc3545)' }}>*</span>}</label>
      
      <div 
        onDragEnter={handleDragEnter}
        onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => inputRef.current && inputRef.current.click()}
        style={{
          border: isDragging ? '2px dashed var(--blue)' : '2px dashed var(--line)',
          backgroundColor: isDragging ? 'rgba(15, 87, 168, 0.05)' : 'var(--surface)',
          borderRadius: '12px',
          padding: '2rem 1.5rem',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          transition: 'all 0.3s ease',
          textAlign: 'center',
          position: 'relative',
          minHeight: '120px'
        }}
      >
        <input
          type="file"
          name={name}
          accept={accept}
          required={required && !hasFile}
          ref={inputRef}
          onChange={handleChange}
          style={{ opacity: 0, position: 'absolute', zIndex: -1, width: '1px', height: '1px', left: 0, top: 0 }}
        />
        
        {hasFile ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'rgba(40, 167, 69, 0.1)', color: 'var(--slt-green)', display: 'grid', placeItems: 'center' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
            </div>
            <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{fileName}</span>
            <button
              type="button"
              onClick={handleClear}
              style={{
                marginTop: '0.5rem',
                background: 'rgba(220, 53, 69, 0.1)', border: 'none', borderRadius: '20px',
                color: 'var(--danger, #dc3545)', cursor: 'pointer', padding: '0.3rem 1rem',
                fontSize: '0.85rem', fontWeight: 600
              }}
            >
              Remove
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem', pointerEvents: 'none' }}>
            <div style={{ color: isDragging ? 'var(--blue)' : 'var(--muted)' }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
            </div>
            <div>
              <span style={{ fontWeight: 600, color: 'var(--blue)' }}>Click to upload</span> <span style={{ color: 'var(--muted)' }}>or drag and drop</span>
            </div>
            <span style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>SVG, PNG, JPG or PDF</span>
          </div>
        )}
      </div>
    </div>
  );
});


const DeclarationStep = forwardRef(function DeclarationStep({ isActive, customerType = 'Residential', onPaymentIntentionChange, reconnectionData }, ref) {
  const { t } = useTranslation();
  const [signatureBase64, setSignatureBase64] = useState('');
  const [signatureError, setSignatureError] = useState(false);

  const [signatureMethod, setSignatureMethod] = useState('draw'); // 'draw' or 'upload'
  const signatureFileRef = useRef(null);

  const [paymentIntention, setPaymentIntention] = useState('online');

  // Notify parent whenever payment intention changes
  React.useEffect(() => {
    if (onPaymentIntentionChange) {
      onPaymentIntentionChange(paymentIntention);
    }
  }, [paymentIntention, onPaymentIntentionChange]);

  useImperativeHandle(ref, () => ({
    validate: () => {
      const form = document.querySelector('form');
      if (form) {
        const formData = new FormData(form);
      }

      if (signatureMethod === 'draw' && !signatureBase64) {
        setSignatureError(true);
        toast.error('Please provide your digital signature to proceed');
        return false;
      }
      if (signatureMethod === 'upload' && (!signatureFileRef.current || !signatureFileRef.current.files || signatureFileRef.current.files.length === 0)) {
        setSignatureError(true);
        toast.error('Please upload your signature document to proceed');
        return false;
      }
      return true;
    },
  }));

  return (
    <div>
      {reconnectionData && (
        <div style={{ marginBottom: '2.5rem' }}>
          <h3 style={{ color: 'var(--slt-blue)', marginBottom: '1.5rem' }}>Customer Details</h3>
          <div className="card" style={{ padding: '1.5rem', backgroundColor: 'var(--surface)', border: '1px solid var(--border-color)', borderRadius: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'rgba(15, 87, 168, 0.1)', display: 'grid', placeItems: 'center', color: 'var(--slt-blue)' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
              </div>
              <div>
                <h4 style={{ margin: 0, color: 'var(--text-primary)' }}>{reconnectionData.fullName}</h4>
                <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Account Holder</p>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
              <div style={{ color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
              </div>
              <div>
                <p style={{ margin: 0, fontSize: '0.95rem', color: 'var(--text-primary)', lineHeight: '1.5' }}>
                  <strong>Service Address:</strong><br />
                  {[reconnectionData.addressLine1, reconnectionData.addressLine2].filter(Boolean).join(', ')}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}



      <div style={{ marginTop: '2rem', padding: '1.5rem', backgroundColor: 'rgba(15, 87, 168, 0.05)', borderRadius: '12px', border: '1px solid rgba(15, 87, 168, 0.2)' }}>
        <h4 style={{ color: 'var(--slt-blue)', marginBottom: '1rem', fontSize: '1.1rem' }}>Pending Balance Settlement</h4>
        <div className="radio-group" style={{ display: 'flex', gap: '2rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
          <label className="radio-label" style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 500 }}>
            <input type="radio" name="paymentIntention" value="online" checked={paymentIntention === 'online'} onChange={() => setPaymentIntention('online')} /> 
            Pay Online Now (Recommended)
          </label>
          <label className="radio-label" style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 500 }}>
            <input type="radio" name="paymentIntention" value="paid" checked={paymentIntention === 'paid'} onChange={() => setPaymentIntention('paid')} /> 
            I have already paid
          </label>
        </div>

        {paymentIntention === 'paid' && (
          <div className="form-group mb-2" style={{ maxWidth: '400px' }}>
            <FileInputWithClear
              label="Upload Payment Receipt (PDF/JPG/PNG)"
              name="paymentReceipt"
              accept=".pdf,.jpg,.jpeg,.png"
            />
          </div>
        )}
      </div>

      <h3 style={{ color: 'var(--slt-blue)', marginBottom: '1.5rem', marginTop: '2.5rem' }}>{t('wizards.reconnection.declaration.heading')}</h3>

      <div className="card" style={{ padding: '1.5rem', backgroundColor: 'var(--surface-color)', border: '1px solid var(--border-color)', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
        <p style={{ marginBottom: '1rem' }}>
          {t('wizards.reconnection.declaration.declarationText')}
        </p>
        <label className="checkbox-label" style={{ color: 'var(--text-primary)', fontWeight: '500' }}>
          <input type="checkbox" className="checkbox-input" required={isActive} /> {t('wizards.reconnection.declaration.agreeLabel')}
        </label>
      </div>

      <div className="mt-5">
        <label className="form-label" style={{ marginBottom: '1rem', display: 'block' }}>Signature Method <span style={{ color: 'var(--danger, #dc3545)' }}>*</span></label>
        <div className="radio-group" style={{ display: 'flex', gap: '1.5rem', marginBottom: '1.5rem' }}>
          <label className="radio-label" style={{ cursor: 'pointer' }}>
            <input type="radio" name="signatureMethod" value="draw" checked={signatureMethod === 'draw'} onChange={(e) => { setSignatureMethod('draw'); setSignatureError(false); }} /> Draw Signature
          </label>
          <label className="radio-label" style={{ cursor: 'pointer' }}>
            <input type="radio" name="signatureMethod" value="upload" checked={signatureMethod === 'upload'} onChange={(e) => { setSignatureMethod('upload'); setSignatureError(false); }} /> Upload Signature
          </label>
        </div>

        {signatureMethod === 'draw' ? (
          <div>
            <DigitalSignatureCanvas
              isActive={isActive}
              required={true}
              onChange={(base64) => {
                setSignatureBase64(base64);
                if (base64) setSignatureError(false);
              }}
            />
            <input type="hidden" name="digitalSignatureBase64" value={signatureBase64} />
          </div>
        ) : (
          <div style={{ maxWidth: '400px' }}>
            <FileInputWithClear
              label="Upload Signature (PDF/JPG/PNG)"
              name="signatureDoc"
              accept=".pdf,.jpg,.jpeg,.png"
              ref={signatureFileRef}
              onChange={(e) => { if (e.target.files.length > 0) setSignatureError(false); }}
            />
          </div>
        )}

        {signatureError && (
          <p style={{ color: 'var(--danger, #dc3545)', fontSize: '0.85rem', marginTop: '0.5rem' }}>
            {signatureMethod === 'draw' ? 'Please provide your digital signature to proceed.' : 'Please upload your signature document to proceed.'}
          </p>
        )}
      </div>
    </div>
  );
});

export default DeclarationStep;
