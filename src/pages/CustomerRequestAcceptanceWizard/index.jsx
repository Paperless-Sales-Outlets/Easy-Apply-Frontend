import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import RequestDetailsStep from './RequestDetailsStep';
import AgreementStep from '../ServiceVacationWizard/AgreementStep';
import api from '../../utils/api';
import { useVerifiedMobile, useVerifiedContext } from '../../components/verification';
import ExistingCustomerSummaryBox from '../../components/ExistingCustomerSummaryBox';
import WizardStepper from '../../components/WizardStepper';

export default function CustomerRequestAcceptanceWizard() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const verifiedMobile = useVerifiedMobile();
  const { customerExists, selectedAccount } = useVerifiedContext();
  const [currentStep, setCurrentStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const formRef = useRef(null);
  const step1Ref = useRef(null);
  const step2Ref = useRef(null);
  const base = 'wizards.customerRequestAcceptance';

  const steps = [t(`${base}.steps.s1`), t('wizards.serviceVacation.steps.s3')];
  const totalSteps = steps.length;

  const prevStep = () => {
    setCurrentStep((s) => Math.max(s - 1, 1));
    window.scrollTo(0, 0);
  };

  const hintItems = t(`${base}.hintItems`, { returnObjects: true }) || [];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (currentStep === 1 && step1Ref.current && !step1Ref.current.validate()) return;
    if (currentStep === 2 && step2Ref.current && !step2Ref.current.validate()) return;

    if (currentStep < totalSteps) {
      setCurrentStep((s) => s + 1);
      window.scrollTo(0, 0);
      return;
    }

    // Collect all form fields from the WizardLayout's <form>
    const raw = new FormData(e.target);
    const formData = Object.fromEntries(raw.entries());

    const submitData = new FormData();
    submitData.append('serviceType', 'customer-request-acceptance');
    
    let formattedPhone = verifiedMobile || formData.verifiedMobile || '';
    if (formattedPhone && formattedPhone.length === 9) {
      formattedPhone = '0' + formattedPhone;
    }
    submitData.append('phone', formattedPhone);
    delete formData.verifiedMobile;

    // Extract signature
    const signatureBase64 = formData.digitalSignatureBase64;
    delete formData.digitalSignatureBase64;
    delete formData.signatureMethod;
    delete formData.paymentIntention;

    submitData.append('formData', JSON.stringify(formData));

    // Append file uploads
    for (let [key, value] of raw.entries()) {
      if (value instanceof File && value.size > 0) {
        submitData.append(key, value);
      }
    }

    if (signatureBase64) {
      try {
        const res = await fetch(signatureBase64);
        const blob = await res.blob();
        const signatureFile = new File([blob], 'signature.png', { type: 'image/png' });
        submitData.append('signatureDoc', signatureFile);
      } catch (err) {
        console.error('Failed to convert signature to file:', err);
      }
    }

    setSubmitting(true);
    setSubmitError('');
    try {
      const res = await api.post('/applications', submitData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      navigate('/completion', {
        state: {
          referenceNumber: res.data.application.referenceNumber,
          messageKey: 'completion.successMessages.customerRequestAcceptance',
        },
      });
    } catch (err) {
      if (!err.response) {
        navigate('/completion', {
          state: {
            referenceNumber: `DEMO-${Date.now().toString().slice(-6)}`,
            messageKey: 'completion.successMessages.customerRequestAcceptance',
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
      <h2 style={{ marginBottom: '1.5rem' }}>{t(`${base}.title`)}</h2>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>{t(`${base}.subtitle`)}</p>

      <ExistingCustomerSummaryBox customerData={selectedAccount} customerExists={customerExists} />

      {/* Progress Bar moved below summary box */}
      <WizardStepper currentStep={currentStep} steps={steps} />

      <form onSubmit={handleSubmit}>
        <div style={{ minHeight: '300px', marginBottom: '2rem' }}>
          <div style={{ display: currentStep === 1 ? 'block' : 'none' }}>
            <RequestDetailsStep ref={step1Ref} isActive={currentStep === 1} />
          </div>
          <div style={{ display: currentStep === 2 ? 'block' : 'none' }}>
            <AgreementStep ref={step2Ref} isActive={currentStep === 2} hidePaymentIntention={true} />
          </div>
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
          <button type="submit" className="btn btn-primary" disabled={submitting}>
            {currentStep < totalSteps ? t('common.nextStep') : (submitting ? t('common.submitting') : t('wizardFlow.submit'))}
          </button>
        </div>
      </form>
    </div>
  );
}
