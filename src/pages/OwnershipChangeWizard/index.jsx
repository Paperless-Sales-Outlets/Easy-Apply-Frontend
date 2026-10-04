import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiAlertTriangle,
  FiArrowRight,
  FiCheckCircle,
  FiSmartphone,
  FiCreditCard,
  FiEdit3,
  FiInfo,
  FiX,
  FiClipboard,
  FiClock,
  FiDollarSign,
} from 'react-icons/fi';
import NewApplicantStep from './NewApplicantStep';
import DocumentsStep from './DocumentsStep';
import DeclarationStep from './DeclarationStep';
import PaymentStep from '../PaymentStep';
import api from '../../utils/api';
import { useVerifiedMobile, useVerifiedContext } from '../../components/verification';
import ExistingCustomerSummaryBox from '../../components/ExistingCustomerSummaryBox';
import WizardStepper from '../../components/WizardStepper';

export default function OwnershipChangeWizard() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const verifiedMobile = useVerifiedMobile();
  const { customerExists, selectedAccount } = useVerifiedContext();

  const [currentStep, setCurrentStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [paymentIntention, setPaymentIntention] = useState('online');
  const [hasPaymentReceipt, setHasPaymentReceipt] = useState(false);
  const [showDisconnectedModal, setShowDisconnectedModal] = useState(false);
  const [showReadinessModal, setShowReadinessModal] = useState(false);

  const formRef = useRef(null);
  const newApplicantStepRef = useRef(null);
  const declarationStepRef = useRef(null);

  // Check if current connection is disconnected
  const isDisconnected =
    selectedAccount?.status?.toLowerCase() === 'disconnected' ||
    selectedAccount?.status?.toLowerCase() === 'deactivated';

  useEffect(() => {
    if (isDisconnected) {
      setShowDisconnectedModal(true);
    } else {
      // Show readiness modal on first load if not seen in session
      const seen = sessionStorage.getItem('seen_ownership_readiness');
      if (!seen) {
        setShowReadinessModal(true);
      }
    }
  }, [isDisconnected]);

  const handleDismissReadiness = () => {
    sessionStorage.setItem('seen_ownership_readiness', 'true');
    setShowReadinessModal(false);
  };

  const outstandingBalance = Number(selectedAccount?.outstandingBalance || 0);
  const hasOutstanding = outstandingBalance > 0;
  const requiresOnlinePaymentStep = hasOutstanding && paymentIntention === 'online';

  const totalSteps = requiresOnlinePaymentStep ? 4 : 3;

  const stepsList = [
    t('wizards.ownershipChange.steps.s1'),
    t('wizards.ownershipChange.steps.s2'),
    t('wizards.ownershipChange.steps.s3'),
  ];
  if (requiresOnlinePaymentStep) {
    stepsList.push(t('wizards.ownershipChange.steps.s4'));
  }

  const nextStep = () => {
    setCurrentStep((prev) => Math.min(prev + 1, totalSteps));
    window.scrollTo(0, 0);
  };

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
    window.scrollTo(0, 0);
  };

  const handleSubmit = async (e, paymentRef = null, phoneOverride = null) => {
    if (e && typeof e.preventDefault === 'function') {
      e.preventDefault();
    }

    if (isDisconnected) {
      setShowDisconnectedModal(true);
      return;
    }

    if (currentStep < totalSteps && !paymentRef) {
      if (currentStep === 1 && newApplicantStepRef.current && !newApplicantStepRef.current.validate()) {
        return;
      }
      if (currentStep === 3 && declarationStepRef.current && !declarationStepRef.current.validate()) {
        return;
      }
      nextStep();
      return;
    }

    const raw = new FormData(formRef.current);
    const formData = Object.fromEntries(raw.entries());

    // Construct FormData for multipart/form-data submission
    const submitData = new FormData();
    submitData.append('serviceType', 'transfer');

    let formattedPhone = phoneOverride || formData.contactNo || verifiedMobile || selectedAccount?.telephone || '';
    if (formattedPhone && formattedPhone.length === 9) {
      formattedPhone = `0${formattedPhone}`;
    }
    submitData.append('phone', formattedPhone);

    // Supplement current customer account info
    if (selectedAccount) {
      formData.currentTelephone = selectedAccount.telephone;
      formData.currentCustomerName = selectedAccount.fullName;
      formData.currentNic = selectedAccount.nic;
      formData.currentPackage = selectedAccount.package || selectedAccount.packageName;
      formData.accountStatus = selectedAccount.status;
      formData.outstandingBalance = selectedAccount.outstandingBalance;
    }

    if (paymentRef) {
      formData.paymentRef = paymentRef;
      formData.paymentStatus = 'paid';
    } else if (hasPaymentReceipt) {
      formData.paymentStatus = 'pending verification';
    }

    // Extract signature base64 strings
    const currentOwnerSignBase64 = formData.currentOwnerSignatureBase64;
    const newOwnerSignBase64 = formData.newOwnerSignatureBase64;

    delete formData.currentOwnerSignatureBase64;
    delete formData.newOwnerSignatureBase64;

    // Send non-file fields as JSON
    submitData.append('formData', JSON.stringify(formData));

    // Append file inputs
    for (const [key, value] of raw.entries()) {
      if (value instanceof File && value.size > 0) {
        submitData.append(key, value);
      }
    }

    // Convert signature base64 to Blob files if drawn
    if (currentOwnerSignBase64) {
      try {
        const response = await fetch(currentOwnerSignBase64);
        const blob = await response.blob();
        submitData.append('currentOwnerSignatureDoc', new File([blob], 'current_owner_signature.png', { type: 'image/png' }));
      } catch (err) {
        console.error('Failed to convert current owner signature:', err);
      }
    }

    if (newOwnerSignBase64) {
      try {
        const response = await fetch(newOwnerSignBase64);
        const blob = await response.blob();
        submitData.append('newOwnerSignatureDoc', new File([blob], 'new_owner_signature.png', { type: 'image/png' }));
      } catch (err) {
        console.error('Failed to convert new owner signature:', err);
      }
    }

    setSubmitting(true);
    setSubmitError('');

    try {
      const res = await api.post('/applications', submitData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      navigate('/completion', {
        state: {
          referenceNumber: res.data.application.referenceNumber,
          messageKey: 'completion.successMessages.ownershipChange',
        },
      });
    } catch (err) {
      if (!err.response) {
        navigate('/completion', {
          state: {
            referenceNumber: `REQ-${Math.floor(10000000 + Math.random() * 90000000)}`,
            messageKey: 'completion.successMessages.ownershipChange',
          },
        });
        return;
      }
      setSubmitError(err.response?.data?.message || t('common.submitError'));
      setSubmitting(false);
    }
  };

  return (
    <div className="card" style={{ padding: '3rem', width: '100%', margin: '0 auto' }}>
      {/* Header bar with title and checklist toggle */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
          marginBottom: '1.5rem',
        }}
      >
        <h2 style={{ margin: 0 }}>{t('wizards.ownershipChange.title')}</h2>

        <button
          type="button"
          onClick={() => setShowReadinessModal(true)}
          style={{
            backgroundColor: 'rgba(15, 87, 168, 0.08)',
            border: '1px solid rgba(15, 87, 168, 0.25)',
            color: 'var(--slt-blue, #0f57a8)',
            borderRadius: '10px',
            padding: '0.45rem 0.95rem',
            fontWeight: 700,
            fontSize: '0.85rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.45rem',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(15, 87, 168, 0.15)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(15, 87, 168, 0.08)';
          }}
        >
          <FiClipboard size={16} /> What You'll Need
        </button>
      </div>

      <ExistingCustomerSummaryBox customerData={selectedAccount} customerExists={customerExists} />

      {/* Disconnected Line Alert Banner */}
      {isDisconnected && (
        <div
          style={{
            backgroundColor: '#fff1f2',
            border: '1.5px solid #fecdd3',
            borderRadius: '14px',
            padding: '1.25rem 1.5rem',
            marginBottom: '1.75rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                backgroundColor: '#ffe4e6',
                color: '#e11d48',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <FiAlertTriangle size={22} />
            </div>
            <div>
              <div style={{ fontWeight: 800, color: '#9f1239', fontSize: '1rem' }}>
                Connection Disconnected
              </div>
              <div style={{ fontSize: '0.85rem', color: '#be123c', marginTop: '0.15rem' }}>
                This line (+94 {selectedAccount?.telephone}) is currently disconnected. An active line is required before transferring ownership.
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={() => navigate('/reconnection')}
            className="btn btn-primary"
            style={{
              backgroundColor: '#e11d48',
              borderColor: '#be123c',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              fontWeight: 700,
              padding: '0.65rem 1.25rem',
            }}
          >
            Reactivate Connection <FiArrowRight />
          </button>
        </div>
      )}

      {/* Stepper */}
      <WizardStepper currentStep={currentStep} steps={stepsList} />

      <form ref={formRef} onSubmit={handleSubmit}>
        <input type="hidden" name="currentTelephone" value={selectedAccount?.telephone || verifiedMobile || ''} />
        <input type="hidden" name="currentCustomerName" value={selectedAccount?.fullName || ''} />
        <input type="hidden" name="currentNic" value={selectedAccount?.nic || ''} />
        <input type="hidden" name="currentContactNo" value={selectedAccount?.mobileNumber || verifiedMobile || ''} />

        <div style={{ minHeight: '300px', marginBottom: '2rem' }}>
          {/* STEP 1: New Owner Details */}
          <div style={{ display: currentStep === 1 ? 'block' : 'none' }}>
            <NewApplicantStep ref={newApplicantStepRef} isActive={currentStep === 1} />
          </div>

          {/* STEP 2: Supporting Documents */}
          <div style={{ display: currentStep === 2 ? 'block' : 'none' }}>
            <DocumentsStep isActive={currentStep === 2} />
          </div>

          {/* STEP 3: Ownership Agreement & Signatures */}
          <div style={{ display: currentStep === 3 ? 'block' : 'none' }}>
            <DeclarationStep
              ref={declarationStepRef}
              isActive={currentStep === 3}
              onPaymentIntentionChange={setPaymentIntention}
              onPaymentReceiptChange={setHasPaymentReceipt}
            />
          </div>

          {/* STEP 4 (Optional): Online Dues Checkout */}
          {requiresOnlinePaymentStep && (
            <div style={{ display: currentStep === 4 ? 'block' : 'none' }}>
              <PaymentStep
                isActive={currentStep === 4}
                verifiedPhone={verifiedMobile}
                amount={outstandingBalance}
                amountLabel="Pending Dues Balance"
                hasPaymentReceipt={hasPaymentReceipt}
                onSuccess={(paymentRef, phoneOverride) => handleSubmit(null, paymentRef, phoneOverride)}
              />
            </div>
          )}
        </div>

        {submitError && (
          <p style={{ color: 'var(--danger, #dc3545)', marginBottom: '1rem', fontSize: '0.9rem' }}>
            {submitError}
          </p>
        )}

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            borderTop: '1px solid var(--border-color)',
            paddingTop: '1.5rem',
            gap: '1rem',
          }}
        >
          <button
            type="button"
            className="btn btn-secondary"
            onClick={prevStep}
            disabled={currentStep === 1 || submitting}
          >
            {t('common.previous')}
          </button>

          {currentStep < totalSteps ? (
            <button
              type="submit"
              className="btn btn-primary"
              disabled={submitting || isDisconnected}
            >
              {t('common.nextStep')}
            </button>
          ) : !requiresOnlinePaymentStep ? (
            <button
              type="submit"
              className="btn btn-success"
              disabled={submitting || isDisconnected}
            >
              {submitting ? t('common.submitting') : t('common.submit')}
            </button>
          ) : null}
        </div>
      </form>

      {/* ── MODAL 1: WHAT YOU'LL NEED (READINESS CHECKLIST) ── */}
      <AnimatePresence>
        {showReadinessModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(15, 23, 42, 0.65)',
              backdropFilter: 'blur(6px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 9999,
              padding: '1.25rem',
            }}
            onClick={handleDismissReadiness}
          >
            <motion.div
              initial={{ scale: 0.92, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.92, opacity: 0, y: 15 }}
              onClick={(e) => e.stopPropagation()}
              style={{
                backgroundColor: '#ffffff',
                borderRadius: '24px',
                padding: '2.25rem',
                maxWidth: '540px',
                width: '100%',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.3)',
                position: 'relative',
                maxHeight: '90vh',
                overflowY: 'auto',
              }}
            >
              {/* Close Icon Button */}
              <button
                type="button"
                onClick={handleDismissReadiness}
                style={{
                  position: 'absolute',
                  top: '1.25rem',
                  right: '1.25rem',
                  background: '#f1f5f9',
                  border: 'none',
                  borderRadius: '50%',
                  width: '36px',
                  height: '36px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#64748b',
                  cursor: 'pointer',
                }}
              >
                <FiX size={18} />
              </button>

              {/* Header */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                <div
                  style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '12px',
                    backgroundColor: 'rgba(15, 87, 168, 0.1)',
                    color: 'var(--slt-blue, #0f57a8)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <FiClipboard size={24} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontWeight: 800, color: '#0f172a', fontSize: '1.25rem' }}>
                    Before You Begin
                  </h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#16a34a', fontSize: '0.78rem', fontWeight: 700, marginTop: '2px' }}>
                    <FiClock size={12} /> Takes about 3–5 minutes
                  </div>
                </div>
              </div>

              <p style={{ color: '#64748b', fontSize: '0.88rem', lineHeight: '1.5', marginBottom: '1.5rem' }}>
                Please have the following items on hand so you can complete the transfer without interruptions:
              </p>

              {/* Checklist Items */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', marginBottom: '1.5rem' }}>
                {/* 1. Phone & OTP */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '0.85rem',
                    padding: '0.85rem 1rem',
                    backgroundColor: '#f8fafc',
                    borderRadius: '12px',
                    border: '1px solid #e2e8f0',
                  }}
                >
                  <div style={{ color: 'var(--slt-blue, #0f57a8)', marginTop: '2px' }}>
                    <FiSmartphone size={20} />
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.92rem' }}>
                      1. New Owner's Phone for SMS OTP
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '2px' }}>
                      The new owner will receive a 6-digit SMS verification code that must be entered on Step 1.
                    </div>
                  </div>
                </div>

                {/* 2. NIC Copy */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '0.85rem',
                    padding: '0.85rem 1rem',
                    backgroundColor: '#f8fafc',
                    borderRadius: '12px',
                    border: '1px solid #e2e8f0',
                  }}
                >
                  <div style={{ color: 'var(--slt-blue, #0f57a8)', marginTop: '2px' }}>
                    <FiCreditCard size={20} />
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.92rem' }}>
                      2. New Owner's NIC / Passport Copy
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '2px' }}>
                      Photos of the Front &amp; Back sides (JPG/PNG) or a single scanned PDF document.
                    </div>
                  </div>
                </div>

                {/* 3. Both Signatures */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '0.85rem',
                    padding: '0.85rem 1rem',
                    backgroundColor: '#f8fafc',
                    borderRadius: '12px',
                    border: '1px solid #e2e8f0',
                  }}
                >
                  <div style={{ color: 'var(--slt-blue, #0f57a8)', marginTop: '2px' }}>
                    <FiEdit3 size={20} />
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.92rem' }}>
                      3. Digital Signatures of Both Parties
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '2px' }}>
                      Both Current Owner &amp; New Owner can draw directly on screen or upload signed images.
                    </div>
                  </div>
                </div>

                {/* 4. Arrears / Bill settlement */}
                {hasOutstanding && (
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '0.85rem',
                      padding: '0.85rem 1rem',
                      backgroundColor: '#fffbeb',
                      borderRadius: '12px',
                      border: '1px solid #fde68a',
                    }}
                  >
                    <div style={{ color: '#d97706', marginTop: '2px' }}>
                      <FiDollarSign size={20} />
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, color: '#92400e', fontSize: '0.92rem' }}>
                        4. Pending Balance Settlement (Rs. {outstandingBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })})
                      </div>
                      <div style={{ fontSize: '0.8rem', color: '#b45309', marginTop: '2px' }}>
                        You can pay online via PayHere or upload a bank payment deposit slip.
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Helpful Tip Box */}
              <div
                style={{
                  padding: '0.75rem 1rem',
                  backgroundColor: '#eff6ff',
                  border: '1px solid #bfdbfe',
                  borderRadius: '12px',
                  fontSize: '0.82rem',
                  color: '#1e40af',
                  lineHeight: '1.45',
                  marginBottom: '1.5rem',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '0.5rem',
                }}
              >
                <FiInfo size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
                <span>
                  <strong>Tip:</strong> If the new applicant isn't beside you right now, you can still proceed as long as they are reachable by phone to relay the 6-digit OTP code and have shared their NIC photo with you.
                </span>
              </div>

              {/* Start Button */}
              <button
                type="button"
                onClick={handleDismissReadiness}
                className="btn btn-primary"
                style={{
                  width: '100%',
                  height: '48px',
                  fontWeight: 800,
                  fontSize: '1rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  borderRadius: '12px',
                }}
              >
                I Have Everything Ready — Start <FiArrowRight />
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── MODAL 2: DISCONNECTED LINE WARNING ── */}
      <AnimatePresence>
        {showDisconnectedModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(15, 23, 42, 0.65)',
              backdropFilter: 'blur(5px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 9999,
              padding: '1.5rem',
            }}
            onClick={() => setShowDisconnectedModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              style={{
                backgroundColor: '#ffffff',
                borderRadius: '20px',
                padding: '2.25rem',
                maxWidth: '480px',
                width: '100%',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                textAlign: 'center',
              }}
            >
              <div
                style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  backgroundColor: '#fee2e2',
                  color: '#dc2626',
                  display: 'grid',
                  placeItems: 'center',
                  margin: '0 auto 1.25rem',
                }}
              >
                <FiAlertTriangle size={32} />
              </div>

              <h3 style={{ color: '#0f172a', fontWeight: 800, fontSize: '1.35rem', marginBottom: '0.6rem' }}>
                Reconnection Required First
              </h3>

              <p style={{ color: '#64748b', fontSize: '0.92rem', lineHeight: '1.55', marginBottom: '1.75rem' }}>
                Your selected connection (<strong>+94 {selectedAccount?.telephone}</strong>) is currently <strong>Disconnected</strong>.
                Ownership transfer can only be processed on active connections. Please reactivate this line first.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <button
                  type="button"
                  onClick={() => navigate('/reconnection')}
                  className="btn btn-primary"
                  style={{
                    backgroundColor: '#e11d48',
                    borderColor: '#be123c',
                    width: '100%',
                    height: '48px',
                    fontWeight: 700,
                    fontSize: '0.98rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                  }}
                >
                  Go to Reconnection Wizard <FiArrowRight />
                </button>

                <button
                  type="button"
                  onClick={() => setShowDisconnectedModal(false)}
                  className="btn btn-secondary"
                  style={{ width: '100%', height: '44px', fontWeight: 600 }}
                >
                  Stay on Page / Review Details
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
