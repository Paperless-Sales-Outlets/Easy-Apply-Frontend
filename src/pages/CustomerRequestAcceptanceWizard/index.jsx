import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import WizardLayout from '../../components/wizard/WizardLayout';
import RequestDetailsStep from './RequestDetailsStep';
import DeclarationStep from './DeclarationStep';
import api from '../../utils/api';
import { useVerifiedMobile } from '../../components/verification';

export default function CustomerRequestAcceptanceWizard() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const verifiedMobile = useVerifiedMobile();
  const [currentStep, setCurrentStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const formRef = useRef(null);
  const base = 'wizards.customerRequestAcceptance';

  const steps = [t(`${base}.steps.s1`), t(`${base}.steps.s2`)];
  const totalSteps = steps.length;

  const prevStep = () => {
    setCurrentStep((s) => Math.max(s - 1, 1));
    window.scrollTo(0, 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (currentStep < totalSteps) {
      setCurrentStep((s) => s + 1);
      window.scrollTo(0, 0);
      return;
    }

    // Collect all form fields from the WizardLayout's <form>
    const raw = new FormData(e.target);
    const formData = Object.fromEntries(raw.entries());

    setSubmitting(true);
    setSubmitError('');
    try {
      const res = await api.post('/applications', {
        serviceType: 'customer-request-acceptance',
        formData,
        phone: verifiedMobile,
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
    <>
      <WizardLayout
        title={t(`${base}.title`)}
        subtitle={t(`${base}.subtitle`)}
        steps={steps}
        currentStep={currentStep}
        hintTitle={t(`${base}.hintTitle`)}
        hintItems={t(`${base}.hintItems`, { returnObjects: true })}
        onBack={prevStep}
        onSubmit={handleSubmit}
        submitLabel={submitting ? t('common.submitting') : undefined}
      >
        <div style={{ display: currentStep === 1 ? 'block' : 'none' }}>
          <RequestDetailsStep isActive={currentStep === 1} />
        </div>
        <div style={{ display: currentStep === 2 ? 'block' : 'none' }}>
          <DeclarationStep isActive={currentStep === 2} />
        </div>
      </WizardLayout>
      {submitError && (
        <p style={{ color: 'var(--danger, #dc3545)', marginTop: '1rem', fontSize: '0.9rem', textAlign: 'center' }}>
          {submitError}
        </p>
      )}
    </>
  );
}
