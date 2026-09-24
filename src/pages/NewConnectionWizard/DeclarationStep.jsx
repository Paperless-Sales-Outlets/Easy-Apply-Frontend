import React, { useState, forwardRef, useImperativeHandle } from 'react';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { FiCheckCircle, FiShield, FiFileText, FiEdit3 } from 'react-icons/fi';
import DigitalSignatureCanvas from '../../components/form/DigitalSignatureCanvas';

const DeclarationStep = forwardRef(({ formData, handleChange, setFields }, ref) => {
  const { t } = useTranslation();
  const [signatureError, setSignatureError] = useState(false);

  const isAgreed = Boolean(formData.declarationAccepted);
  const signatureVal = formData.signature || '';

  // Expose validation to parent wizard
  useImperativeHandle(ref, () => ({
    validate: () => {
      if (!isAgreed) {
        toast.error(t('wizards.newConnection.declaration.mustAgree', 'Please accept the Terms & Conditions and Customer Declaration to proceed.'));
        return false;
      }
      if (!signatureVal || signatureVal.trim() === '') {
        setSignatureError(true);
        toast.error(t('wizards.newConnection.declaration.mustSign', 'Please provide your digital signature before continuing to payment.'));
        return false;
      }
      setSignatureError(false);
      return true;
    },
  }));

  const handleAgreeToggle = (e) => {
    const checked = e.target.checked;
    if (setFields) {
      setFields({ declarationAccepted: checked });
    } else if (handleChange) {
      handleChange({ target: { name: 'declarationAccepted', type: 'checkbox', checked } });
    }
  };

  const handleSignatureChange = (sigDataUrl) => {
    setSignatureError(false);
    if (setFields) {
      setFields({ signature: sigDataUrl });
    } else if (handleChange) {
      handleChange({ target: { name: 'signature', value: sigDataUrl } });
    }
  };

  return (
    <div className="new-connection-declaration-step" style={{ maxWidth: '800px', margin: '0 auto' }}>
      {/* ── Applicant Overview Card ── */}
      <div
        style={{
          background: 'linear-gradient(135deg, rgba(15, 87, 168, 0.06), rgba(0, 168, 255, 0.04))',
          borderRadius: '16px',
          border: '1px solid rgba(15, 87, 168, 0.15)',
          padding: '1.25rem 1.5rem',
          marginBottom: '2rem',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '1rem',
        }}
      >
        <div>
          <span style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Applicant Name
          </span>
          <strong style={{ fontSize: '0.95rem', color: '#0f172a' }}>
            {formData.nameFull || `${formData.title || ''} Applicant`}
          </strong>
        </div>
        <div>
          <span style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            NIC / Identification
          </span>
          <strong style={{ fontSize: '0.95rem', color: '#0f172a' }}>
            {formData.nic || 'Verified'}
          </strong>
        </div>
        <div>
          <span style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Contact Mobile
          </span>
          <strong style={{ fontSize: '0.95rem', color: '#0f172a' }}>
            +94 {formData.mobileNumber || 'Verified'}
          </strong>
        </div>
        <div>
          <span style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Installation Address
          </span>
          <strong style={{ fontSize: '0.9rem', color: '#0f172a', wordBreak: 'break-word' }}>
            {formData.installAddress || formData.address || 'Colombo'}
          </strong>
        </div>
      </div>

      {/* ── Terms & Conditions / Declaration Card ── */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.75rem' }}>
          <FiFileText size={20} style={{ color: 'var(--slt-blue)' }} />
          <h3 style={{ margin: 0, fontSize: '1.2rem', color: '#0f172a', fontWeight: 800 }}>
            Customer Agreement &amp; Declaration
          </h3>
        </div>

        <div
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            border: '1px solid #e2e8f0',
            padding: '1.5rem',
            boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
          }}
        >
          <div
            style={{
              maxHeight: '160px',
              overflowY: 'auto',
              padding: '0.75rem 1rem',
              backgroundColor: '#f8fafc',
              borderRadius: '10px',
              border: '1px solid #e2e8f0',
              fontSize: '0.85rem',
              lineHeight: 1.6,
              color: '#475569',
              marginBottom: '1.25rem',
            }}
          >
            <p style={{ margin: '0 0 0.5rem 0', fontWeight: 600, color: '#0f172a' }}>
              Declaration by Applicant:
            </p>
            <p style={{ margin: '0 0 0.5rem 0' }}>
              1. I hereby confirm that all particulars furnished by me in this application are true and correct to the best of my knowledge.
            </p>
            <p style={{ margin: '0 0 0.5rem 0' }}>
              2. I agree to abide by the standard Terms and Conditions governing the provision of telecommunication services by Sri Lanka Telecom PLC (SLTMobitel).
            </p>
            <p style={{ margin: '0 0 0.5rem 0' }}>
              3. I acknowledge that the connection is subject to technical feasibility and network loop availability at the specified installation address.
            </p>
            <p style={{ margin: '0' }}>
              4. I authorize SLTMobitel to verify the information provided against the official records and credit databases.
            </p>
          </div>

          <label
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '0.85rem',
              cursor: 'pointer',
              userSelect: 'none',
              padding: '0.6rem 0.5rem',
              borderRadius: '8px',
            }}
          >
            <input
              type="checkbox"
              name="declarationAccepted"
              checked={isAgreed}
              onChange={handleAgreeToggle}
              style={{
                width: '20px',
                height: '20px',
                marginTop: '2px',
                cursor: 'pointer',
                accentColor: 'var(--slt-blue)',
              }}
            />
            <span style={{ fontSize: '0.92rem', color: isAgreed ? '#0f172a' : '#334155', fontWeight: isAgreed ? 700 : 500, lineHeight: 1.4 }}>
              I have read, understood, and accept the Customer Declaration and SLTMobitel Terms &amp; Conditions. <span style={{ color: '#ef4444' }}>*</span>
            </span>
          </label>
        </div>
      </div>

      {/* ── Digital Signature Canvas ── */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.75rem' }}>
          <FiEdit3 size={20} style={{ color: 'var(--slt-blue)' }} />
          <h3 style={{ margin: 0, fontSize: '1.2rem', color: '#0f172a', fontWeight: 800 }}>
            Digital Signature <span style={{ color: '#ef4444' }}>*</span>
          </h3>
        </div>

        <div
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            border: signatureError ? '2px solid #ef4444' : '1px solid #e2e8f0',
            padding: '1.5rem',
            boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
          }}
        >
          <p style={{ fontSize: '0.85rem', color: '#64748b', marginTop: 0, marginBottom: '1rem' }}>
            Please draw your signature in the box below using your mouse, trackpad, or finger on touch screens.
          </p>

          <DigitalSignatureCanvas
            label="Applicant Digital Signature"
            required
            value={signatureVal}
            onChange={handleSignatureChange}
            error={signatureError ? 'Signature is required' : ''}
          />
        </div>
      </div>
    </div>
  );
});

export default DeclarationStep;
