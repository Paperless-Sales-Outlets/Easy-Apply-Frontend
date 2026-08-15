import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import RequestDetailsStep from './RequestDetailsStep';
import DeclarationStep from './DeclarationStep';
import api from '../../utils/api';
import { useVerifiedMobile } from '../../components/verification';
import WizardStepper from '../../components/WizardStepper';

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

  const hintItems = t(`${base}.hintItems`, { returnObjects: true }) || [];

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
    <div className="card" style={{ padding: '3rem', width: '100%', margin: '0 auto' }}>
      <h2 style={{ marginBottom: '1.5rem' }}>{t(`${base}.title`)}</h2>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>{t(`${base}.subtitle`)}</p>

      {/* Progress Bar */}
      <WizardStepper currentStep={currentStep} steps={steps} />

      {hintItems.length > 0 && (
        <div
          className="card"
          style={{ padding: '1.25rem 1.5rem', backgroundColor: 'var(--surface-color)', border: '1px solid var(--border-color)', boxShadow: 'none', marginBottom: '2rem' }}
        >
          <h4 style={{ margin: '0 0 0.5rem 0', color: 'var(--text-primary)' }}>{t(`${base}.hintTitle`)}</h4>
          <ul style={{ margin: 0, paddingLeft: '1.25rem', color: 'var(--text-secondary)' }}>
            {hintItems.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div style={{ minHeight: '300px', marginBottom: '2rem' }}>
          <div style={{ display: currentStep === 1 ? 'block' : 'none' }}>
            <RequestDetailsStep isActive={currentStep === 1} />
          </div>
          <div style={{ display: currentStep === 2 ? 'block' : 'none' }}>
            <DeclarationStep isActive={currentStep === 2} />
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
