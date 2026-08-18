import React, { useState, forwardRef, useImperativeHandle, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
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
          border: isDragging ? '2px dashed var(--slt-blue)' : '2px dashed rgba(15, 87, 168, 0.2)',
          backgroundColor: isDragging ? 'rgba(15, 87, 168, 0.08)' : 'var(--surface)',
          borderRadius: '16px',
          padding: '2.5rem 1.5rem',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          textAlign: 'center',
          position: 'relative',
          minHeight: '140px'
        }}
        onMouseEnter={(e) => {
          if (!isDragging) {
            e.currentTarget.style.backgroundColor = 'rgba(15, 87, 168, 0.02)';
            e.currentTarget.style.borderColor = 'rgba(15, 87, 168, 0.4)';
          }
        }}
        onMouseLeave={(e) => {
          if (!isDragging) {
            e.currentTarget.style.backgroundColor = 'var(--surface)';
            e.currentTarget.style.borderColor = 'rgba(15, 87, 168, 0.2)';
          }
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
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'rgba(16, 185, 129, 0.1)', color: '#10b981', display: 'grid', placeItems: 'center', boxShadow: '0 4px 12px rgba(16, 185, 129, 0.2)' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
            </div>
            <div>
              <span style={{ fontWeight: 600, color: 'var(--text-primary)', display: 'block', marginBottom: '0.25rem' }}>{fileName}</span>
              <button
                type="button"
                onClick={handleClear}
                style={{
                  background: 'none', border: 'none', color: 'var(--danger, #ef4444)', fontSize: '0.85rem',
                  cursor: 'pointer', padding: '0.25rem 0.75rem', borderRadius: '8px',
                  backgroundColor: 'rgba(239, 68, 68, 0.1)', fontWeight: 600
                }}
              >
                Remove File
              </button>
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ width: '56px', height: '56px', borderRadius: '50%', backgroundColor: 'rgba(15, 87, 168, 0.08)', color: 'var(--slt-blue)', display: 'grid', placeItems: 'center', transition: 'all 0.3s ease' }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="17 8 12 3 7 8"></polyline>
                <line x1="12" y1="3" x2="12" y2="15"></line>
              </svg>
            </div>
            <div>
              <span style={{ fontWeight: 600, color: 'var(--slt-blue)', display: 'block', marginBottom: '0.25rem', fontSize: '1.05rem' }}>
                {isDragging ? 'Drop file here' : 'Click or drag file here to upload'}
              </span>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Maximum file size 5MB</span>
            </div>
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
  const [isAgreed, setIsAgreed] = useState(false);

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
      <div style={{ marginTop: '2rem', padding: '1.5rem', backgroundColor: 'rgba(15, 87, 168, 0.05)', borderRadius: '12px', border: '1px solid rgba(15, 87, 168, 0.2)' }}>
        <h4 style={{ color: 'var(--slt-blue)', marginBottom: '1rem', fontSize: '1.1rem' }}>Pending Balance Settlement</h4>
        <div 
          style={{ 
            display: 'flex', backgroundColor: 'rgba(0,0,0,0.06)', borderRadius: '12px', padding: '0.25rem', marginBottom: '1.5rem', position: 'relative'
          }}
        >
          {/* Animated Background Pill */}
          <div 
            style={{
              position: 'absolute', top: '0.25rem', bottom: '0.25rem', 
              left: paymentIntention === 'online' ? '0.25rem' : '50%',
              width: 'calc(50% - 0.25rem)',
              backgroundColor: '#fff', borderRadius: '8px',
              boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
            }} 
          />
          <button 
            type="button" 
            onClick={() => setPaymentIntention('online')}
            style={{ 
              flex: 1, padding: '0.75rem', background: 'none', border: 'none', borderRadius: '8px', 
              fontWeight: 600, fontSize: '0.95rem', cursor: 'pointer', position: 'relative', zIndex: 1,
              color: paymentIntention === 'online' ? 'var(--slt-blue)' : 'var(--text-secondary)',
              transition: 'color 0.3s ease'
            }}
          >
            Pay Online Now (Recommended)
          </button>
          <button 
            type="button" 
            onClick={() => setPaymentIntention('paid')}
            style={{ 
              flex: 1, padding: '0.75rem', background: 'none', border: 'none', borderRadius: '8px', 
              fontWeight: 600, fontSize: '0.95rem', cursor: 'pointer', position: 'relative', zIndex: 1,
              color: paymentIntention === 'paid' ? 'var(--slt-blue)' : 'var(--text-secondary)',
              transition: 'color 0.3s ease'
            }}
          >
            I have already paid
          </button>
          {/* Hidden inputs to preserve form submission */}
          <input type="radio" name="paymentIntention" value="online" checked={paymentIntention === 'online'} readOnly style={{ display: 'none' }} />
          <input type="radio" name="paymentIntention" value="paid" checked={paymentIntention === 'paid'} readOnly style={{ display: 'none' }} />
        </div>

        {paymentIntention === 'paid' && (
          <div className="form-group mb-2">
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
        <label 
          style={{ 
            display: 'inline-flex', alignItems: 'center', gap: '0.75rem', 
            color: 'var(--text-primary)', fontWeight: 600, cursor: 'pointer',
            userSelect: 'none'
          }}
        >
          <div style={{ position: 'relative', width: '22px', height: '22px' }}>
            <input 
              type="checkbox" 
              required={isActive} 
              checked={isAgreed}
              onChange={(e) => setIsAgreed(e.target.checked)}
              style={{ opacity: 0, position: 'absolute', width: '100%', height: '100%', cursor: 'pointer', margin: 0, zIndex: 2 }} 
            />
            <motion.div
              animate={{
                backgroundColor: isAgreed ? 'var(--slt-blue)' : '#ffffff',
                borderColor: isAgreed ? 'var(--slt-blue)' : 'rgba(0,0,0,0.2)'
              }}
              style={{
                position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                border: '2px solid', borderRadius: '6px',
                display: 'grid', placeItems: 'center', pointerEvents: 'none'
              }}
            >
              <motion.svg
                width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: isAgreed ? 1 : 0, opacity: isAgreed ? 1 : 0 }}
                transition={{ duration: 0.3 }}
              >
                <motion.polyline points="20 6 9 17 4 12" />
              </motion.svg>
            </motion.div>
          </div>
          {t('wizards.reconnection.declaration.agreeLabel')}
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
          <div>
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
