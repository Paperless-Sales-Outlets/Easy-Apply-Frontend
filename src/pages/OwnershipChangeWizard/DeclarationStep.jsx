import React, { useState, forwardRef, useImperativeHandle, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { FiCheckCircle, FiEdit3, FiPaperclip, FiUploadCloud, FiTrash2, FiAlertCircle, FiDollarSign, FiFileText, FiCreditCard } from 'react-icons/fi';
import DigitalSignatureCanvas from '../../components/form/DigitalSignatureCanvas';
import { useVerifiedContext } from '../../components/verification';

// File Input wrapper with clear button and drag & drop support
const FileInputWithClear = forwardRef(({ label, name, accept = '.pdf,.jpg,.jpeg,.png', required, onChange }, ref) => {
  const internalRef = useRef(null);
  const inputRef = ref || internalRef;
  const [hasFile, setHasFile] = useState(false);
  const [fileName, setFileName] = useState('');
  const [isDragging, setIsDragging] = useState(false);

  const handleClear = (e) => {
    e.stopPropagation();
    e.preventDefault();
    if (inputRef.current) inputRef.current.value = '';
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

  return (
    <div style={{ width: '100%', marginBottom: '1rem' }}>
      <label className="form-label" style={{ fontWeight: 600 }}>
        {label} {required && <span style={{ color: 'var(--danger, #dc2626)' }}>*</span>}
      </label>
      <div
        onDragEnter={(e) => { e.preventDefault(); e.stopPropagation(); setIsDragging(true); }}
        onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
        onDragLeave={(e) => { e.preventDefault(); e.stopPropagation(); }}
        onDrop={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setIsDragging(false);
          if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            if (inputRef.current) {
              inputRef.current.files = e.dataTransfer.files;
              handleChange({ target: inputRef.current });
            }
          }
        }}
        onClick={() => inputRef.current && inputRef.current.click()}
        style={{
          border: isDragging ? '2px dashed var(--slt-blue, #0f57a8)' : '2px dashed rgba(15, 87, 168, 0.25)',
          backgroundColor: isDragging ? 'rgba(15, 87, 168, 0.08)' : '#f8fafc',
          borderRadius: '14px',
          padding: '1.5rem',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          textAlign: 'center',
          position: 'relative',
        }}
      >
        <input ref={inputRef} type="file" name={name} accept={accept} onChange={handleChange} style={{ display: 'none' }} />
        {hasFile ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: '#16a34a', fontWeight: 700 }}>
            <FiCheckCircle size={20} />
            <span style={{ wordBreak: 'break-all', fontSize: '0.92rem' }}>{fileName}</span>
            <button
              type="button"
              onClick={handleClear}
              style={{
                background: '#fee2e2',
                border: 'none',
                borderRadius: '50%',
                width: '26px',
                height: '26px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#dc2626',
                cursor: 'pointer',
                marginLeft: '0.5rem',
              }}
            >
              <FiTrash2 size={13} />
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.4rem', color: '#64748b' }}>
            <FiUploadCloud size={28} style={{ color: 'var(--slt-blue, #0f57a8)' }} />
            <span style={{ fontSize: '0.88rem', fontWeight: 600 }}>Click to browse or drag &amp; drop document</span>
            <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>PDF, PNG, or JPG (Max 5MB)</span>
          </div>
        )}
      </div>
    </div>
  );
});

const DeclarationStep = forwardRef(function DeclarationStep(
  {
    isActive,
    onPaymentIntentionChange,
    onPaymentReceiptChange,
  },
  ref
) {
  const { t } = useTranslation();
  const { selectedAccount } = useVerifiedContext();

  // Outstanding dues
  const outstandingAmount = Number(selectedAccount?.outstandingBalance || 0);
  const hasOutstanding = outstandingAmount > 0;
  const formattedOutstanding = `Rs. ${outstandingAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const [paymentIntention, setPaymentIntention] = useState('online');
  const [receiptFile, setReceiptFile] = useState(null);

  // Consents
  const [currentOwnerConsent, setCurrentOwnerConsent] = useState(false);
  const [newOwnerConsent, setNewOwnerConsent] = useState(false);

  // Current Owner Signature state
  const [currentOwnerSignMethod, setCurrentOwnerSignMethod] = useState('draw'); // 'draw' | 'upload'
  const [currentOwnerSignBase64, setCurrentOwnerSignBase64] = useState('');
  const currentOwnerSignFileRef = useRef(null);

  // New Owner Signature state
  const [newOwnerSignMethod, setNewOwnerSignMethod] = useState('draw'); // 'draw' | 'upload'
  const [newOwnerSignBase64, setNewOwnerSignBase64] = useState('');
  const newOwnerSignFileRef = useRef(null);

  const receiptFileRef = useRef(null);

  const handleSelectPaymentIntention = (val) => {
    setPaymentIntention(val);
    if (onPaymentIntentionChange) onPaymentIntentionChange(val);
  };

  useImperativeHandle(ref, () => ({
    validate: () => {
      if (!currentOwnerConsent) {
        toast.error('Current registered owner must confirm authorization consent');
        return false;
      }

      // Check current owner signature
      if (currentOwnerSignMethod === 'draw' && !currentOwnerSignBase64) {
        toast.error('Please provide digital signature of Current Registered Owner');
        return false;
      }
      if (currentOwnerSignMethod === 'upload' && (!currentOwnerSignFileRef.current?.files || currentOwnerSignFileRef.current.files.length === 0)) {
        toast.error('Please upload signature document of Current Registered Owner');
        return false;
      }

      if (!newOwnerConsent) {
        toast.error('New owner must accept ownership terms and responsibility');
        return false;
      }

      // Check new owner signature
      if (newOwnerSignMethod === 'draw' && !newOwnerSignBase64) {
        toast.error('Please provide digital signature of New Owner / Transferee');
        return false;
      }
      if (newOwnerSignMethod === 'upload' && (!newOwnerSignFileRef.current?.files || newOwnerSignFileRef.current.files.length === 0)) {
        toast.error('Please upload signature document of New Owner / Transferee');
        return false;
      }

      // Check payment receipt if already paid is chosen
      if (hasOutstanding && paymentIntention === 'paid') {
        const hasReceipt = Boolean(
          (receiptFileRef.current?.files && receiptFileRef.current.files.length > 0) || receiptFile
        );
        if (!hasReceipt) {
          toast.error('Please attach your payment receipt for outstanding dues');
          return false;
        }
      }

      return true;
    },
    getPaymentIntention: () => paymentIntention,
  }));

  return (
    <div>
      <div style={{ marginBottom: '1.75rem' }}>
        <h3 style={{ color: 'var(--slt-blue, #0f57a8)', fontWeight: 800, fontSize: '1.35rem', marginBottom: '0.35rem' }}>
          {t('wizards.ownershipChange.declaration.heading')}
        </h3>
        <p style={{ color: 'var(--text-secondary, #64748b)', fontSize: '0.92rem' }}>
          Both the current registered account holder and the new taking-over owner must authorize this transfer.
        </p>
      </div>

      {/* ── CARD 1: CURRENT REGISTERED OWNER AUTHORIZATION ── */}
      <div
        className="card"
        style={{
          backgroundColor: '#ffffff',
          border: '1.5px solid #e2e8f0',
          borderRadius: '16px',
          padding: '1.75rem',
          marginBottom: '1.75rem',
          boxShadow: '0 2px 10px rgba(0,0,0,0.03)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: 'var(--slt-blue, #0f57a8)', marginBottom: '0.75rem' }}>
          <FiEdit3 size={20} />
          <h4 style={{ margin: 0, fontWeight: 800, fontSize: '1.15rem' }}>
            {t('wizards.ownershipChange.declaration.currConsentHeading')}
          </h4>
        </div>

        {selectedAccount && (
          <div style={{ fontSize: '0.85rem', color: '#475569', marginBottom: '1rem', backgroundColor: '#f8fafc', padding: '0.65rem 1rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
            <strong>Transferor:</strong> {selectedAccount.fullName} | <strong>NIC:</strong> {selectedAccount.nic} | <strong>Line:</strong> {selectedAccount.telephone}
          </div>
        )}

        <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary, #64748b)', lineHeight: '1.5', marginBottom: '1.25rem' }}>
          {t('wizards.ownershipChange.declaration.currConsentText')}
        </p>

        <label className="checkbox-label" style={{ fontWeight: 600, fontSize: '0.92rem', color: '#0f172a', marginBottom: '1.5rem', display: 'flex', alignItems: 'flex-start' }}>
          <input
            type="checkbox"
            name="currentCustomerConsent"
            className="checkbox-input"
            checked={currentOwnerConsent}
            onChange={(e) => setCurrentOwnerConsent(e.target.checked)}
            required={isActive}
            style={{ marginTop: '0.2rem' }}
          />
          <span>{t('wizards.ownershipChange.declaration.currConsentLabel')}</span>
        </label>

        {/* Current Owner Signature Toggle */}
        <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem' }}>
            <label className="form-label" style={{ fontWeight: 700, margin: 0 }}>
              Current Owner Digital Signature <span style={{ color: 'var(--danger, #dc2626)' }}>*</span>
            </label>
            <div style={{ display: 'flex', gap: '0.35rem', backgroundColor: '#f1f5f9', padding: '0.2rem', borderRadius: '8px' }}>
              <button
                type="button"
                onClick={() => setCurrentOwnerSignMethod('draw')}
                style={{
                  border: 'none',
                  padding: '0.4rem 0.8rem',
                  borderRadius: '6px',
                  fontWeight: 700,
                  fontSize: '0.82rem',
                  cursor: 'pointer',
                  backgroundColor: currentOwnerSignMethod === 'draw' ? '#ffffff' : 'transparent',
                  color: currentOwnerSignMethod === 'draw' ? 'var(--slt-blue, #0f57a8)' : '#64748b',
                  boxShadow: currentOwnerSignMethod === 'draw' ? '0 1px 4px rgba(0,0,0,0.1)' : 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                }}
              >
                <FiEdit3 size={13} /> Draw Signature
              </button>
              <button
                type="button"
                onClick={() => setCurrentOwnerSignMethod('upload')}
                style={{
                  border: 'none',
                  padding: '0.4rem 0.8rem',
                  borderRadius: '6px',
                  fontWeight: 700,
                  fontSize: '0.82rem',
                  cursor: 'pointer',
                  backgroundColor: currentOwnerSignMethod === 'upload' ? '#ffffff' : 'transparent',
                  color: currentOwnerSignMethod === 'upload' ? 'var(--slt-blue, #0f57a8)' : '#64748b',
                  boxShadow: currentOwnerSignMethod === 'upload' ? '0 1px 4px rgba(0,0,0,0.1)' : 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                }}
              >
                <FiPaperclip size={13} /> Upload Signature
              </button>
            </div>
          </div>

          {currentOwnerSignMethod === 'draw' ? (
            <div>
              <DigitalSignatureCanvas
                label="Sign inside the box (Current Owner)"
                value={currentOwnerSignBase64}
                onChange={setCurrentOwnerSignBase64}
                required={isActive}
              />
              <input type="hidden" name="currentOwnerSignatureBase64" value={currentOwnerSignBase64} />
            </div>
          ) : (
            <FileInputWithClear
              ref={currentOwnerSignFileRef}
              name="currentOwnerSignatureDoc"
              label="Upload Scanned Signature (PDF / Image)"
              required={isActive}
            />
          )}
        </div>
      </div>

      {/* ── CARD 2: NEW OWNER UNDERTAKING & ACCEPTANCE ── */}
      <div
        className="card"
        style={{
          backgroundColor: '#ffffff',
          border: '1.5px solid #e2e8f0',
          borderRadius: '16px',
          padding: '1.75rem',
          marginBottom: '1.75rem',
          boxShadow: '0 2px 10px rgba(0,0,0,0.03)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: 'var(--slt-blue, #0f57a8)', marginBottom: '0.75rem' }}>
          <FiEdit3 size={20} />
          <h4 style={{ margin: 0, fontWeight: 800, fontSize: '1.15rem' }}>
            {t('wizards.ownershipChange.declaration.newDeclHeading')}
          </h4>
        </div>

        <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary, #64748b)', lineHeight: '1.5', marginBottom: '1.25rem' }}>
          {t('wizards.ownershipChange.declaration.newDeclText')}
        </p>

        <label className="checkbox-label" style={{ fontWeight: 600, fontSize: '0.92rem', color: '#0f172a', marginBottom: '1.5rem', display: 'flex', alignItems: 'flex-start' }}>
          <input
            type="checkbox"
            name="newApplicantDeclaration"
            className="checkbox-input"
            checked={newOwnerConsent}
            onChange={(e) => setNewOwnerConsent(e.target.checked)}
            required={isActive}
            style={{ marginTop: '0.2rem' }}
          />
          <span>{t('wizards.ownershipChange.declaration.newDeclLabel')}</span>
        </label>

        {/* New Owner Signature Toggle */}
        <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem' }}>
            <label className="form-label" style={{ fontWeight: 700, margin: 0 }}>
              New Owner Digital Signature <span style={{ color: 'var(--danger, #dc2626)' }}>*</span>
            </label>
            <div style={{ display: 'flex', gap: '0.35rem', backgroundColor: '#f1f5f9', padding: '0.2rem', borderRadius: '8px' }}>
              <button
                type="button"
                onClick={() => setNewOwnerSignMethod('draw')}
                style={{
                  border: 'none',
                  padding: '0.4rem 0.8rem',
                  borderRadius: '6px',
                  fontWeight: 700,
                  fontSize: '0.82rem',
                  cursor: 'pointer',
                  backgroundColor: newOwnerSignMethod === 'draw' ? '#ffffff' : 'transparent',
                  color: newOwnerSignMethod === 'draw' ? 'var(--slt-blue, #0f57a8)' : '#64748b',
                  boxShadow: newOwnerSignMethod === 'draw' ? '0 1px 4px rgba(0,0,0,0.1)' : 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                }}
              >
                <FiEdit3 size={13} /> Draw Signature
              </button>
              <button
                type="button"
                onClick={() => setNewOwnerSignMethod('upload')}
                style={{
                  border: 'none',
                  padding: '0.4rem 0.8rem',
                  borderRadius: '6px',
                  fontWeight: 700,
                  fontSize: '0.82rem',
                  cursor: 'pointer',
                  backgroundColor: newOwnerSignMethod === 'upload' ? '#ffffff' : 'transparent',
                  color: newOwnerSignMethod === 'upload' ? 'var(--slt-blue, #0f57a8)' : '#64748b',
                  boxShadow: newOwnerSignMethod === 'upload' ? '0 1px 4px rgba(0,0,0,0.1)' : 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                }}
              >
                <FiPaperclip size={13} /> Upload Signature
              </button>
            </div>
          </div>

          {newOwnerSignMethod === 'draw' ? (
            <div>
              <DigitalSignatureCanvas
                label="Sign inside the box (New Owner)"
                value={newOwnerSignBase64}
                onChange={setNewOwnerSignBase64}
                required={isActive}
              />
              <input type="hidden" name="newOwnerSignatureBase64" value={newOwnerSignBase64} />
            </div>
          ) : (
            <FileInputWithClear
              ref={newOwnerSignFileRef}
              name="newOwnerSignatureDoc"
              label="Upload Scanned Signature of New Owner"
              required={isActive}
            />
          )}
        </div>
      </div>

      {/* ── CARD 3: OUTSTANDING DUES SETTLEMENT (IF PENDING BALANCE > 0) ── */}
      {hasOutstanding && (
        <div
          className="card"
          style={{
            backgroundColor: 'rgba(15, 87, 168, 0.04)',
            border: '1.5px solid rgba(15, 87, 168, 0.2)',
            borderRadius: '16px',
            padding: '1.75rem',
            marginBottom: '1.75rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: 'var(--slt-blue, #0f57a8)' }}>
              <FiDollarSign size={22} />
              <h4 style={{ margin: 0, fontWeight: 800, fontSize: '1.15rem' }}>
                Pending Balance Settlement
              </h4>
            </div>
            <div style={{ backgroundColor: '#ffffff', padding: '0.4rem 0.85rem', borderRadius: '10px', border: '1px solid #cbd5e1' }}>
              <span style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 700, marginRight: '0.4rem' }}>OUTSTANDING DUES:</span>
              <span style={{ fontWeight: 800, color: '#dc2626', fontFamily: 'var(--font-body, inherit)', fontSize: '1.05rem' }}>
                {formattedOutstanding}
              </span>
            </div>
          </div>

          <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary, #64748b)', marginBottom: '1.25rem' }}>
            To complete ownership transfer, the registered outstanding arrears on this connection must be settled or proof of payment provided.
          </p>

          <input type="hidden" name="amountToPay" value={outstandingAmount} />

          {/* Radio toggle for payment intention */}
          <div
            style={{
              display: 'flex',
              backgroundColor: 'rgba(0,0,0,0.06)',
              borderRadius: '12px',
              padding: '0.25rem',
              marginBottom: '1.25rem',
              position: 'relative',
            }}
          >
            <div
              style={{
                position: 'absolute',
                top: '0.25rem',
                bottom: '0.25rem',
                left: paymentIntention === 'online' ? '0.25rem' : '50%',
                width: 'calc(50% - 0.25rem)',
                backgroundColor: '#ffffff',
                borderRadius: '8px',
                boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
                transition: 'all 0.28s cubic-bezier(0.4, 0, 0.2, 1)',
              }}
            />
            <button
              type="button"
              onClick={() => handleSelectPaymentIntention('online')}
              style={{
                flex: 1,
                padding: '0.75rem',
                background: 'none',
                border: 'none',
                borderRadius: '8px',
                fontWeight: 700,
                fontSize: '0.92rem',
                cursor: 'pointer',
                position: 'relative',
                zIndex: 1,
                color: paymentIntention === 'online' ? 'var(--slt-blue, #0f57a8)' : 'var(--text-secondary, #64748b)',
                transition: 'color 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.45rem',
              }}
            >
              <FiCreditCard size={16} /> Pay Online Now ({formattedOutstanding})
            </button>
            <button
              type="button"
              onClick={() => handleSelectPaymentIntention('paid')}
              style={{
                flex: 1,
                padding: '0.75rem',
                background: 'none',
                border: 'none',
                borderRadius: '8px',
                fontWeight: 700,
                fontSize: '0.92rem',
                cursor: 'pointer',
                position: 'relative',
                zIndex: 1,
                color: paymentIntention === 'paid' ? 'var(--slt-blue, #0f57a8)' : 'var(--text-secondary, #64748b)',
                transition: 'color 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.45rem',
              }}
            >
              <FiFileText size={16} /> I have already paid (Upload Receipt)
            </button>
            <input type="hidden" name="paymentIntention" value={paymentIntention} />
          </div>

          {paymentIntention === 'paid' && (
            <div style={{ marginTop: '1rem' }}>
              <FileInputWithClear
                ref={receiptFileRef}
                name="paymentReceipt"
                label="Attach Bank / Online Deposit Receipt"
                required={isActive}
                onChange={(e) => {
                  const has = Boolean(e.target.files && e.target.files.length > 0);
                  setReceiptFile(has ? e.target.files[0] : null);
                  if (onPaymentReceiptChange) onPaymentReceiptChange(has);
                }}
              />
            </div>
          )}
        </div>
      )}

      {/* Terms list */}
      <div style={{ padding: '1rem', fontSize: '0.82rem', color: '#64748b', backgroundColor: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
        <ul style={{ paddingLeft: '1.25rem', margin: 0, lineHeight: '1.6' }}>
          <li>{t('wizards.ownershipChange.declaration.terms1')}</li>
          <li>{t('wizards.ownershipChange.declaration.terms2')}</li>
          <li>{t('wizards.ownershipChange.declaration.terms3')}</li>
        </ul>
      </div>
    </div>
  );
});

export default DeclarationStep;
