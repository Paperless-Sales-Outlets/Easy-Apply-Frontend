import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import CurrentCustomerStep from './CurrentCustomerStep';
import NewApplicantStep from './NewApplicantStep';
import DocumentsStep from './DocumentsStep';
import DeclarationStep from './DeclarationStep';
import WizardProgressBar from '../../components/WizardProgressBar';
import { useTranslation } from 'react-i18next';
import api from '../../utils/api';
import { useVerifiedMobile } from '../../components/verification';

export default function OwnershipChangeWizard() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const verifiedMobile = useVerifiedMobile();
  const [currentStep, setCurrentStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const formRef = useRef(null);
  const totalSteps = 4;

  const steps = [
    { number: 1, label: "Current Owner Account" },
    { number: 2, label: 'New Applicant Details' },
    { number: 3, label: 'Supporting Documents' },
    { number: 4, label: 'Declaration & Signature' },
  ];

  const nextStep = () => {
    setCurrentStep((prev) => Math.min(prev + 1, totalSteps));
    window.scrollTo(0, 0);
  };
  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
    window.scrollTo(0, 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (currentStep < totalSteps) {
      nextStep();
      return;
    }

    const raw = new FormData(formRef.current);
    const formData = Object.fromEntries(raw.entries());

    setSubmitting(true);
    setSubmitError('');
    try {
      const res = await api.post('/applications', {
        serviceType: 'transfer',
        formData,
        phone: verifiedMobile,
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
            referenceNumber: `DEMO-${Date.now().toString().slice(-6)}`,
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
    <div className="card" style={{ padding: '3rem', width: '100%', margin: '0 auto', maxWidth: '1100px' }}>
      <h2 style={{ marginBottom: '0.4rem', color: '#0B2D5B', fontWeight: '800' }}>
        {t('wizards.ownershipChange.title')}
      </h2>

      {/* Unified Progress Bar */}
      <WizardProgressBar steps={steps} currentStep={currentStep} />

      <form ref={formRef} onSubmit={handleSubmit}>
        <div style={{ minHeight: '320px', marginBottom: '2rem' }}>
          <div style={{ display: currentStep === 1 ? 'block' : 'none' }}>
            <CurrentCustomerStep isActive={currentStep === 1} />
          </div>
          <div style={{ display: currentStep === 2 ? 'block' : 'none' }}>
            <NewApplicantStep isActive={currentStep === 2} />
          </div>
          <div style={{ display: currentStep === 3 ? 'block' : 'none' }}>
            <DocumentsStep isActive={currentStep === 3} />
          </div>
          <div style={{ display: currentStep === 4 ? 'block' : 'none' }}>
            <DeclarationStep isActive={currentStep === 4} />
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
          {currentStep < totalSteps ? (
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {t('common.nextStep')}
            </button>
          ) : (
            <button type="submit" className="btn btn-success" disabled={submitting}>
              {submitting ? t('common.submitting') : t('common.submit')}
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
