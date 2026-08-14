import React, { useState, forwardRef, useImperativeHandle, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import DigitalSignatureCanvas from '../../components/DigitalSignatureCanvas';

const FileInputWithClear = forwardRef(function FileInputWithClear({ name, label, accept, onChange }, ref) {
  const [hasFile, setHasFile] = useState(false);
  const [fileName, setFileName] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const internalRef = useRef(null);

  const inputRef = ref || internalRef;

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      setHasFile(true);
      setFileName(e.target.files[0].name);
    } else {
      setHasFile(false);
      setFileName('');
    }
    if (onChange) onChange(e);
  };

  const clearFile = (e) => {
    e.preventDefault();
    if (inputRef.current) {
      inputRef.current.value = ''; 
    }
    setHasFile(false);
    setFileName('');
    if (onChange) onChange({ target: { files: [] } });
  };

  return (
    <div className="form-group mb-0">
      {label && <label className="form-label" style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.75rem' }}>{label}</label>}
      <div 
        style={{ 
          position: 'relative',
          border: `2px dashed ${isDragging ? 'var(--slt-blue)' : hasFile ? 'var(--slt-green)' : 'var(--border-color)'}`,
          backgroundColor: isDragging ? 'rgba(15, 87, 168, 0.05)' : hasFile ? 'rgba(0,166,80,0.02)' : 'var(--surface)',
          borderRadius: '12px',
          padding: '2rem 1.5rem',
          transition: 'all 0.3s ease',
          textAlign: 'center',
          cursor: hasFile ? 'default' : 'pointer'
        }}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          if (!hasFile && inputRef.current && e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            const dt = new DataTransfer();
            dt.items.add(e.dataTransfer.files[0]);
            inputRef.current.files = dt.files;
            handleFileChange({ target: { files: dt.files } });
          }
        }}
        onClick={() => { if (!hasFile && inputRef.current) inputRef.current.click(); }}
      >
        <input
          type="file"
          name={name}
          accept={accept}
          ref={inputRef}
          onChange={handleFileChange}
          style={{ display: 'none' }}
        />
        
        {hasFile ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem 1.25rem', backgroundColor: '#fff', borderRadius: '8px', border: '1px solid var(--border-color)', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', overflow: 'hidden' }}>
              <div style={{ color: 'var(--slt-green)' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
              </div>
              <span style={{ fontSize: '0.9rem', color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontWeight: 500 }}>
                {fileName}
              </span>
            </div>
            <div style={{ paddingLeft: '1rem', borderLeft: '1px solid var(--border-color)' }}>
              <button type="button" onClick={clearFile} style={{ background: 'none', border: 'none', color: 'var(--danger)', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', padding: '0.25rem 0.5rem', borderRadius: '4px', whiteSpace: 'nowrap' }}>
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


const AgreementStep = forwardRef(function AgreementStep({ isActive, onPaymentIntentionChange }, ref) {
  const { t } = useTranslation();
  
  const [signatureBase64, setSignatureBase64] = useState('');
  const [signatureError, setSignatureError] = useState(false);
  const [signatureMethod, setSignatureMethod] = useState('draw');
  const signatureFileRef = useRef(null);

  const [paymentIntention, setPaymentIntention] = useState('online');
  const [isAgreed, setIsAgreed] = useState(false);

  useEffect(() => {
    if (onPaymentIntentionChange) {
      onPaymentIntentionChange(paymentIntention);
    }
  }, [paymentIntention, onPaymentIntentionChange]);

  useImperativeHandle(ref, () => ({
    validate: () => {
      if (!isAgreed) {
        toast.error('You must agree to the Terms and Conditions.');
        return false;
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
      <div style={{ marginBottom: '2.5rem', padding: '1.5rem', backgroundColor: 'rgba(15, 87, 168, 0.05)', borderRadius: '12px', border: '1px solid rgba(15, 87, 168, 0.2)' }}>
        <h4 style={{ color: 'var(--slt-blue)', marginBottom: '1rem', fontSize: '1.1rem' }}>Pending Balance Settlement</h4>
        <div style={{ display: 'flex', backgroundColor: 'rgba(0,0,0,0.06)', borderRadius: '12px', padding: '0.25rem', marginBottom: '1.5rem', position: 'relative' }}>
          <div style={{
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

      <h3 style={{ color: 'var(--slt-blue)', marginBottom: '1.5rem', marginTop: '2.5rem' }}>{t('wizards.serviceVacation.agreement.heading')}</h3>

      <div 
        className="card" 
        style={{ 
          padding: '1.5rem', 
          background: 'rgba(255, 255, 255, 0.4)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          border: '1px solid rgba(255, 255, 255, 0.5)',
          boxShadow: '0 8px 32px rgba(31, 38, 135, 0.05)',
          fontSize: '0.9rem', color: 'var(--text-secondary)' 
        }}
      >
        <p style={{ marginBottom: '1rem' }}>
          {t('wizards.serviceVacation.agreement.declaration')}
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
          {t('wizards.serviceVacation.agreement.agreeLabel')}
        </label>
      </div>

      <div className="mt-5">
        <label className="form-label" style={{ marginBottom: '1rem', display: 'block' }}>Signature Method <span style={{ color: 'var(--danger)' }}>*</span></label>
        <div className="radio-group" style={{ display: 'flex', gap: '1.5rem', marginBottom: '1.5rem' }}>
          <label className="radio-label" style={{ cursor: 'pointer' }}>
            <input type="radio" name="signatureMethod" value="draw" checked={signatureMethod === 'draw'} onChange={() => { setSignatureMethod('draw'); setSignatureError(false); }} /> Draw Signature
          </label>
          <label className="radio-label" style={{ cursor: 'pointer' }}>
            <input type="radio" name="signatureMethod" value="upload" checked={signatureMethod === 'upload'} onChange={() => { setSignatureMethod('upload'); setSignatureError(false); }} /> Upload Signature
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
          <p style={{ color: 'var(--danger)', fontSize: '0.85rem', marginTop: '0.5rem' }}>
            {signatureMethod === 'draw' ? 'Please provide your digital signature to proceed.' : 'Please upload your signature document to proceed.'}
          </p>
        )}
      </div>

    </div>
  );
});

export default AgreementStep;
