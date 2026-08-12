import React, { useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import GeneralInfoStep from './GeneralInfoStep';
import AddressStep from './AddressStep';
import PreferencesStep from './PreferencesStep';
import AgreementStep from './AgreementStep';
import { useTranslation } from 'react-i18next';
import api from '../../utils/api';
import { useVerifiedMobile } from '../../components/verification';

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
    setFormData(prev => ({ ...prev, ...stepData }));
  }, []);

  const nextStep = () => {
    // Collect serializable form fields from current step DOM before advancing.
    // Non-serializable values (files, formatted address strings) are already
    // stored in formData via onDataChange callbacks, so we only add DOM entries
    // that are not already present in formData.
    if (formRef.current) {
      const raw = new FormData(formRef.current);
      const domData = Object.fromEntries(raw.entries());
      // Merge: React-state values take priority over DOM values for keys that
      // are already set (e.g. currentAddress, newAddress, proofOfAddress)
      setFormData(prev => ({ ...domData, ...prev }));
    }
    setCurrentStep(prev => Math.min(prev + 1, totalSteps));
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
    setCurrentStep(prev => Math.max(prev - 1, 1));
    window.scrollTo(0, 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (currentStep < totalSteps) {
      handleNext();
      return;
    }

    // Step 4 final submission validation
    if (!agreed || (!signature && !signatureFile)) {
      setSubmitError('Please accept the agreement and provide a signature by drawing or uploading a file.');
      window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
      return;
    }

    // Combine current form DOM state with overall accumulated data
    const raw = formRef.current ? new FormData(formRef.current) : new FormData();
    const finalStepData = Object.fromEntries(raw.entries());
    const completePayload = {
      ...formData,
      ...finalStepData,
      agreed,
      signature,
      nic: formData.nic || formData.telephone || finalStepData.telephone || ''
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
        ['nicFront', completePayload.nicFront],
        ['nicBack', completePayload.nicBack],
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
            referenceNumber: `DEMO-${Date.now().toString().slice(-6)}`,
            messageKey: 'completion.successMessages.locationChange',
          },
        });
        return;
      }
      setSubmitError(err.response?.data?.message || t('common.submitError'));
      setSubmitting(false);
    }
  };

  const isStep4Valid = agreed && (!!signature || !!signatureFile);

  return (
    <div className="card" style={{ padding: '3rem', width: '100%', margin: '0 auto' }}>
      <h2 style={{ marginBottom: '0.5rem', color: '#1e3a8a', fontWeight: '700' }}>
        {t('wizards.locationChange.title', 'Application for Location Change')}
      </h2>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
        {t('wizards.locationChange.subtitle', 'Relocate your Megaline, FTTH, or LTE service to a new address.')}
      </p>

      {/* Wizard Step Navigation */}
      <div className="wizard-nav-wrapper">
        <div className="wizard-steps-container" style={{ display: "flex", marginBottom: "2.5rem", position: "relative" }}>
          <div style={{ position: "absolute", top: "17px", left: `calc(100% / ${totalSteps * 2})`, right: `calc(100% / ${totalSteps * 2})`, height: "3px", backgroundColor: "#e2e8f0", zIndex: 0 }} />
          <div className="wizard-progress-bar" style={{ position: "absolute", top: "17px", left: `calc(100% / ${totalSteps * 2})`, height: "3px", backgroundColor: "#22c55e", zIndex: 0, width: `calc((100% - 100% / ${totalSteps}) * ${(currentStep - 1) / (totalSteps - 1)})`, transition: "width 0.3s ease" }} />

          {[1, 2, 3, 4].map(step => (
            <div key={step} className="wizard-step" style={{ position: "relative", zIndex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: "0.5rem", flex: 1 }}>
              <div style={{
                width: '36px', height: '36px', borderRadius: '50%',
                backgroundColor: step <= currentStep ? '#22c55e' : '#ffffff',
                border: `2px solid ${step <= currentStep ? '#22c55e' : '#cbd5e1'}`,
                color: step <= currentStep ? '#ffffff' : '#64748b',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '0.9rem'
              }}>
                {step}
              </div>
              <span style={{ fontSize: '0.8rem', fontWeight: step === currentStep ? '600' : '400', color: step <= currentStep ? '#1e293b' : '#64748b' }}>
                {step === 1 ? t('wizards.locationChange.steps.s1', 'General Info') : step === 2 ? t('wizards.locationChange.steps.s2', 'Address') : step === 3 ? t('wizards.locationChange.steps.s3', 'Preferences') : t('wizards.locationChange.steps.s4', 'Agreement')}
              </span>
            </div>
          ))}
        </div>
      </div>

      <form ref={formRef} onSubmit={handleSubmit}>
        <div style={{ minHeight: "300px", marginBottom: "2rem" }}>
          {currentStep === 1 && <GeneralInfoStep
            isActive
            formData={formData}
            onChange={updateFormData}
            onValidationChange={setIsGeneralInfoStepValid}
            showValidationErrors={showValidationErrors}
          />}
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
          <div style={{
            padding: '0.75rem 1rem',
            marginBottom: '1rem',
            backgroundColor: '#fef2f2',
            border: '1px solid #fecaca',
            borderRadius: '6px',
            color: '#dc2626',
            fontSize: '0.9rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <span style={{ fontSize: '1.1rem' }}>⚠</span>
            {submitError}
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border-color, #e2e8f0)', paddingTop: '1.5rem' }}>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={prevStep}
            disabled={currentStep === 1 || submitting}
            style={{ padding: '0.6rem 1.5rem', borderRadius: '6px', border: '1px solid #cbd5e1', backgroundColor: '#fff', color: '#334155', cursor: currentStep === 1 ? 'not-allowed' : 'pointer' }}
          >
            {t('common.previous', 'Back')}
          </button>

          {currentStep < totalSteps ? (
            <button
              type="submit"
              className="btn btn-primary"
              disabled={submitting}
              style={{ padding: '0.6rem 1.75rem', borderRadius: '6px', backgroundColor: '#0056b3', color: '#fff', border: 'none', fontWeight: '600', cursor: 'pointer' }}
            >
              {t('common.nextStep', 'Next Step')}
            </button>
          ) : (
            <button
              type="submit"
              className="btn btn-success"
              disabled={submitting || !isStep4Valid}
              style={{
                padding: '0.6rem 1.75rem',
                borderRadius: '6px',
                backgroundColor: (isStep4Valid && !submitting) ? '#0056b3' : '#94a3b8',
                color: '#ffffff',
                border: 'none',
                fontWeight: '600',
                cursor: (isStep4Valid && !submitting) ? 'pointer' : 'not-allowed',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              {submitting ? (
                <>
                  <span style={{ display: 'inline-block', width: '14px', height: '14px', border: '2px solid #fff', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                  {t('common.submitting', 'Submitting... Please wait...')}
                </>
              ) : (
                t('common.submit', 'Submit Application')
              )}
            </button>
          )}
        </div>
      </form>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}