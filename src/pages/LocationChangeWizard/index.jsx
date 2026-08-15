import React, { useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import GeneralInfoStep from './GeneralInfoStep';
import AddressStep from './AddressStep';
import PreferencesStep from './PreferencesStep';
import AgreementStep from './AgreementStep';
import { useTranslation } from 'react-i18next';
import api from '../../utils/api';
import { useVerifiedMobile, useVerifiedContext } from '../../components/verification';
import WizardStepper from '../../components/WizardStepper';
import ExistingCustomerSummaryBox from '../../components/ExistingCustomerSummaryBox';

export default function LocationChangeWizard() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const verifiedMobile = useVerifiedMobile();
  const { customerExists, selectedAccount } = useVerifiedContext();

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
    t('wizards.locationChange.steps.s1', 'Existing Account Verification'),
    t('wizards.locationChange.steps.s2', 'New Address'),
    t('wizards.locationChange.steps.s3', 'Preferences'),
    t('wizards.locationChange.steps.s4', 'Agreement'),
  ];

  return (
    <div className="card" style={{ padding: '3rem', width: '100%', margin: '0 auto' }}>
      <h2 style={{ marginBottom: '1.5rem' }}>{t('wizards.locationChange.title', 'Application for Location Change')}</h2>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
        {t('wizards.locationChange.subtitle', 'Relocate your Megaline, FTTH, or LTE connection to a new address seamlessly.')}
      </p>

      {/* Progress Bar */}
      <WizardStepper currentStep={currentStep} steps={stepsInfo} />

      <ExistingCustomerSummaryBox customerData={selectedAccount} customerExists={customerExists} />

      <form ref={formRef} onSubmit={handleSubmit}>
        <div style={{ minHeight: '300px', marginBottom: '2rem' }}>
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
          <p style={{ color: 'var(--danger, #dc3545)', marginBottom: '1rem', fontSize: '0.9rem' }}>
            {submitError}
          </p>
        )}

        <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem' }}>
          <button type="button" className="btn btn-secondary" onClick={prevStep} disabled={currentStep === 1 || submitting}>
            {t('common.previous')}
          </button>
          {currentStep < totalSteps ? (
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {t('common.nextStep')}
            </button>
          ) : (
            <button type="submit" className="btn btn-success" disabled={submitting || !isStep4Valid}>
              {submitting ? t('common.submitting') : 'Submit Relocation Application'}
            </button>
          )}
        </div>
      </form>
    </div>
  );
}