import React, { useMemo, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import ServiceDetailsStep from './ServiceDetailsStep';
import ReasonStep from './ReasonStep';
import AgreementStep from './AgreementStep';
import { useTranslation } from 'react-i18next';
import api from '../../utils/api';
import { useVerifiedMobile, useVerifiedContext } from '../../components/verification';
import ExistingCustomerSummaryBox from '../../components/ExistingCustomerSummaryBox';
import WizardStepper from '../../components/WizardStepper';

export default function TerminationWizard() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const verifiedMobile = useVerifiedMobile();
  const { customerExists, selectedAccount } = useVerifiedContext();
  const [currentStep, setCurrentStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const formRef = useRef(null);
  const totalSteps = 3;

  const nextStep = () => {
    setCurrentStep(prev => Math.min(prev + 1, totalSteps));
    window.scrollTo(0, 0);
  };
  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
    window.scrollTo(0, 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (currentStep < totalSteps) { nextStep(); return; }

    const raw = new FormData(formRef.current);
    const formData = Object.fromEntries(raw.entries());

    setSubmitting(true);
    setSubmitError('');
    try {
      const res = await api.post('/applications', {
        serviceType: 'termination',
        formData,
        phone: verifiedMobile,
      });
      navigate('/completion', {
        state: {
          referenceNumber: res.data.application.referenceNumber,
          messageKey: 'completion.successMessages.termination',
        },
      });
    } catch (err) {
      if (!err.response) {
        navigate('/completion', {
          state: {
            referenceNumber: `DEMO-${Date.now().toString().slice(-6)}`,
            messageKey: 'completion.successMessages.termination',
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
      <h2 style={{ marginBottom: '1.5rem' }}>{t('wizards.termination.title')}</h2>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>{t('wizards.termination.subtitle')}</p>

      {/* Progress Bar */}
      <WizardStepper
        currentStep={currentStep}
        steps={[t('wizards.termination.steps.s1'), t('wizards.termination.steps.s2'), t('wizards.termination.steps.s3')]}
      />

      <ExistingCustomerSummaryBox customerData={selectedAccount} customerExists={customerExists} />

      <form ref={formRef} onSubmit={handleSubmit}>

        <input type="hidden" name="presentNumber" value={selectedAccount?.telephone || verifiedMobile || ''} />
        <input type="hidden" name="fullName" value={selectedAccount?.fullName || ''} />
        <input type="hidden" name="nic" value={selectedAccount?.nic || ''} />
        <input type="hidden" name="contactNo" value={selectedAccount?.mobileNumber || verifiedMobile || ''} />
        <input type="hidden" name="fixedNo" value={selectedAccount?.fixedContactNumber || selectedAccount?.telephone || ''} />
        <input type="hidden" name="email" value={selectedAccount?.email || ''} />

        <div style={{ minHeight: '300px', marginBottom: '2rem' }}>
          <div style={{ display: currentStep === 1 ? 'block' : 'none' }}>
            <ServiceDetailsStep isActive={currentStep === 1} />
          </div>
          <div style={{ display: currentStep === 2 ? 'block' : 'none' }}>
            <ReasonStep isActive={currentStep === 2} />
          </div>
          <div style={{ display: currentStep === 3 ? 'block' : 'none' }}>
            <AgreementStep isActive={currentStep === 3} />
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
            <button type="submit" className="btn btn-danger" disabled={submitting}>
              {submitting ? t('common.submitting') : t('common.confirmTermination')}
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
