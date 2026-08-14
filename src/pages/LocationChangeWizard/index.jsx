import React, { useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import GeneralInfoStep from './GeneralInfoStep';
import AddressStep from './AddressStep';
import PreferencesStep from './PreferencesStep';
import AgreementStep from './AgreementStep';
import { useTranslation } from 'react-i18next';
import api from '../../utils/api';
import { useVerifiedMobile } from '../../components/verification';
import { FiCheck, FiArrowRight, FiArrowLeft, FiSend } from 'react-icons/fi';

export default function LocationChangeWizard() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const verifiedMobile = useVerifiedMobile();

  const [currentStep, setCurrentStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  // Consolidated form data state across wizard steps
  const [formData, setFormData] = useState({});
  const [agreed, setAgreed] = useState(false);
  const [signature, setSignature] = useState(null);
  const [signatureFile, setSignatureFile] = useState(null);
  const [signatureFileError, setSignatureFileError] = useState('');
  const [isGeneralInfoStepValid, setIsGeneralInfoStepValid] = useState(false);
  const [isAddressStepValid, setIsAddressStepValid] = useState(false);
  const [isPreferencesStepValid, setIsPreferencesStepValid] = useState(false);
  const [showValidationErrors, setShowValidationErrors] = useState(false);

  const formRef = useRef(null);
  const totalSteps = 4;

  const updateFormData = useCallback((stepData) => {
    setFormData((prev) => ({ ...prev, ...stepData }));
  }, []);

  const nextStep = () => {
    if (formRef.current) {
      const raw = new FormData(formRef.current);
      const domData = Object.fromEntries(raw.entries());
      setFormData((prev) => ({ ...domData, ...prev }));
    }
    setCurrentStep((prev) => Math.min(prev + 1, totalSteps));
    window.scrollTo(0, 0);
  };

  const handleNext = () => {
    if (currentStep === 1 && !isGeneralInfoStepValid) {
      setShowValidationErrors(true);
      return;
    }

    if (currentStep === 2 && !isAddressStepValid) {
      setShowValidationErrors(true);
      return;
    }

    if (currentStep === 3 && !isPreferencesStepValid) {
      setShowValidationErrors(true);
      return;
    }

    setShowValidationErrors(false);
    nextStep();
  };

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
    window.scrollTo(0, 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (currentStep < totalSteps) {
      handleNext();
      return;
    }

    if (!agreed || (!signature && !signatureFile)) {
      setSubmitError('Please accept the agreement and provide a signature before submitting.');
      window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
      return;
    }

    const raw = formRef.current ? new FormData(formRef.current) : new FormData();
    const finalStepData = Object.fromEntries(raw.entries());
    const completePayload = {
      ...formData,
      ...finalStepData,
      agreed,
      signature,
      nic: formData.nic || formData.telephone || finalStepData.telephone || '',
    };

    setSubmitting(true);
    setSubmitError('');

    try {
      const fd = new FormData();
      fd.append('serviceType', 'relocation');
      fd.append('phone', verifiedMobile || formData.mobile || formData.telephone || '');
      fd.append('formData', JSON.stringify(completePayload));

      const maybeFiles = [
        ['proofOfAddress', completePayload.proofOfAddress],
        ['sketchFile', completePayload.sketchFile],
        ['authorizationLetter', completePayload.authorizationLetter],
        ['brcFile', completePayload.brcFile],
        ['signatureFile', signatureFile],
      ];

      maybeFiles.forEach(([key, file]) => {
        if (file instanceof File) fd.append(key, file);
      });

      const res = await api.post('/applications', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      navigate('/completion', {
        state: {
          referenceNumber: res.data?.application?.referenceNumber || `REF-${Date.now().toString().slice(-6)}`,
          messageKey: 'completion.successMessages.locationChange',
        },
      });
    } catch (err) {
      if (!err.response) {
        navigate('/completion', {
          state: {
            referenceNumber: `SLT-LOC-${Date.now().toString().slice(-6)}`,
            messageKey: 'completion.successMessages.locationChange',
          },
        });
        return;
      }
      setSubmitError(err.response?.data?.message || t('common.submitError', 'Failed to submit relocation application.'));
      setSubmitting(false);
    }
  };

  const isStep4Valid = agreed && (Boolean(signature) || Boolean(signatureFile));

  const stepsInfo = [
    { num: 1, label: t('wizards.locationChange.steps.s1', 'General Info') },
    { num: 2, label: t('wizards.locationChange.steps.s2', 'New Address') },
    { num: 3, label: t('wizards.locationChange.steps.s3', 'Preferences') },
    { num: 4, label: t('wizards.locationChange.steps.s4', 'Agreement') },
  ];

  return (
    <div
      style={{
        width: '100%',
        margin: '0 auto',
        padding: '2rem 1.5rem',
      }}
    >
      {/* Top Header Card */}
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '20px',
          padding: '2rem 2.5rem',
          marginBottom: '2rem',
          boxShadow: '0 8px 30px rgba(0, 86, 179, 0.08)',
          border: '1px solid #e2e8f0',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '5px',
            background: 'linear-gradient(90deg, #0056b3 0%, #003b73 50%, #10b981 100%)',
          }}
        />

        <div style={{ display: 'inline-block', backgroundColor: '#e0f2fe', color: '#0369a1', fontSize: '0.75rem', fontWeight: 800, padding: '0.25rem 0.75rem', borderRadius: '9999px', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.65rem' }}>
          SLTMobitel EasyApply Services
        </div>

        <h2
          style={{
            margin: 0,
            fontSize: '1.85rem',
            fontWeight: 900,
            color: '#0f172a',
            letterSpacing: '-0.02em',
          }}
        >
          {t('wizards.locationChange.title', 'Application for Location Change')}
        </h2>

        <p style={{ color: '#64748b', fontSize: '0.95rem', fontWeight: 600, marginTop: '0.4rem', marginBottom: 0 }}>
          {t('wizards.locationChange.subtitle', 'Relocate your Megaline, FTTH, or LTE connection to a new address seamlessly.')}
        </p>

        {/* High-End Interactive Stepper Bar */}
        <div style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid #f1f5f9' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative' }}>
            {/* Connecting Line */}
            <div
              style={{
                position: 'absolute',
                top: '20px',
                left: '10%',
                right: '10%',
                height: '3px',
                backgroundColor: '#e2e8f0',
                zIndex: 0,
              }}
            />
            <div
              style={{
                position: 'absolute',
                top: '20px',
                left: '10%',
                height: '3px',
                backgroundColor: '#10b981',
                zIndex: 0,
                width: `${((currentStep - 1) / (totalSteps - 1)) * 80}%`,
                transition: 'width 0.35s ease-in-out',
              }}
            />

            {stepsInfo.map((st) => {
              const isDone = st.num < currentStep;
              const isCurrent = st.num === currentStep;

              return (
                <div
                  key={st.num}
                  style={{
                    position: 'relative',
                    zIndex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '0.5rem',
                    flex: 1,
                    minWidth: 0,
                  }}
                >
                  <div
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      backgroundColor: isDone
                        ? '#10b981'
                        : isCurrent
                        ? '#0056b3'
                        : '#ffffff',
                      border: `2.5px solid ${isDone ? '#10b981' : isCurrent ? '#0056b3' : '#cbd5e1'}`,
                      color: isDone || isCurrent ? '#ffffff' : '#64748b',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 800,
                      fontSize: '0.92rem',
                      boxShadow: isCurrent ? '0 4px 14px rgba(0, 86, 179, 0.35)' : 'none',
                      transition: 'all 0.25s ease',
                    }}
                  >
                    {isDone ? <FiCheck size={18} /> : st.num}
                  </div>
                  <span
                    style={{
                      fontSize: '0.82rem',
                      fontWeight: isCurrent ? 800 : isDone ? 700 : 500,
                      color: isCurrent ? '#0056b3' : isDone ? '#10b981' : '#64748b',
                      textAlign: 'center',
                      wordBreak: 'break-word',
                      maxWidth: '100%',
                    }}
                  >
                    {st.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Wizard Form Body */}
      <form ref={formRef} onSubmit={handleSubmit}>
        <div style={{ minHeight: '320px', marginBottom: '2rem' }}>
          {currentStep === 1 && (
            <GeneralInfoStep
              isActive
              formData={formData}
              onChange={updateFormData}
              onValidationChange={setIsGeneralInfoStepValid}
              showValidationErrors={showValidationErrors}
            />
          )}

          {currentStep === 2 && (
            <AddressStep
              isActive
              formData={formData}
              onDataChange={updateFormData}
              onValidationChange={setIsAddressStepValid}
              showValidationErrors={showValidationErrors}
            />
          )}

          {currentStep === 3 && (
            <PreferencesStep
              isActive
              formData={formData}
              selectedServiceType={formData?.serviceType || 'FTTH'}
              customerType={formData?.customerType || 'individual'}
              onDataChange={updateFormData}
              onValidationChange={setIsPreferencesStepValid}
              showValidationErrors={showValidationErrors}
            />
          )}

          {currentStep === 4 && (
            <AgreementStep
              isActive
              formData={formData}
              agreed={agreed}
              setAgreed={setAgreed}
              signature={signature}
              setSignature={setSignature}
              signatureFile={signatureFile}
              setSignatureFile={setSignatureFile}
            />
          )}
        </div>

        {submitError && (
          <div
            style={{
              padding: '0.85rem 1.25rem',
              marginBottom: '1.5rem',
              backgroundColor: '#fef2f2',
              border: '1.5px solid #fca5a5',
              borderRadius: '12px',
              color: '#dc2626',
              fontSize: '0.9rem',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '0.55rem',
            }}
          >
            <FiAlertCircle size={18} />
            <span>{submitError}</span>
          </div>
        )}

        {/* Bottom Wizard Navigation Control Bar */}
        <div
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            padding: '1.25rem 2rem',
            boxShadow: '0 8px 30px rgba(0, 0, 0, 0.04)',
            border: '1px solid #e2e8f0',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: '1.5rem',
          }}
        >
          <button
            type="button"
            onClick={prevStep}
            disabled={currentStep === 1 || submitting}
            style={{
              padding: '0.85rem 1.85rem',
              borderRadius: '12px',
              border: '1.5px solid #cbd5e1',
              backgroundColor: currentStep === 1 ? '#f8fafc' : '#ffffff',
              color: currentStep === 1 ? '#cbd5e1' : '#334155',
              cursor: currentStep === 1 || submitting ? 'not-allowed' : 'pointer',
              fontWeight: 800,
              fontSize: '0.9rem',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              transition: 'all 0.15s ease',
            }}
          >
            <FiArrowLeft size={18} />
            <span>Back</span>
          </button>

          {currentStep < totalSteps ? (
            <button
              type="submit"
              disabled={submitting}
              style={{
                padding: '0.85rem 2.25rem',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #0056b3 0%, #003b73 100%)',
                color: '#ffffff',
                border: 'none',
                fontWeight: 800,
                fontSize: '0.95rem',
                cursor: submitting ? 'not-allowed' : 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.55rem',
                boxShadow: '0 4px 16px rgba(0, 86, 179, 0.3)',
                transition: 'all 0.15s ease',
              }}
            >
              <span>Next Step</span>
              <FiArrowRight size={18} />
            </button>
          ) : (
            <button
              type="submit"
              disabled={submitting || !isStep4Valid}
              style={{
                padding: '0.85rem 2.5rem',
                borderRadius: '12px',
                background: isStep4Valid && !submitting ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' : '#cbd5e1',
                color: '#ffffff',
                border: 'none',
                fontWeight: 800,
                fontSize: '0.95rem',
                cursor: isStep4Valid && !submitting ? 'pointer' : 'not-allowed',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.55rem',
                boxShadow: isStep4Valid && !submitting ? '0 4px 18px rgba(16, 185, 129, 0.35)' : 'none',
                transition: 'all 0.15s ease',
              }}
            >
              <FiSend size={18} />
              <span>{submitting ? 'Submitting Application...' : 'Submit Relocation Application'}</span>
            </button>
          )}
        </div>
      </form>
    </div>
  );
}