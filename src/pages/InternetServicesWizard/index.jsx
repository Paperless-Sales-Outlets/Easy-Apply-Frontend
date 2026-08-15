import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import CustomerInfoStep from './CustomerInfoStep';
import ServiceDetailsStep from './ServiceDetailsStep';
import AccountSetupStep from './AccountSetupStep';
import { useTranslation } from 'react-i18next';
import api from '../../utils/api';
import { useVerifiedMobile } from '../../components/verification';
import WizardStepper from '../../components/WizardStepper';

export default function InternetServicesWizard() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const verifiedMobile = useVerifiedMobile();
  const [currentStep, setCurrentStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const formRef = useRef(null);
  const totalSteps = 3;

  const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, totalSteps));
  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1));
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (currentStep < totalSteps) { nextStep(); return; }

    const raw = new FormData(formRef.current);
    const formData = Object.fromEntries(raw.entries());

    setSubmitting(true);
    setSubmitError('');
    try {
      const res = await api.post('/applications', {
        serviceType: 'internet-services',
        formData,
        phone: verifiedMobile,
      });
      navigate('/completion', {
        state: {
          referenceNumber: res.data.application.referenceNumber,
          messageKey: 'completion.successMessages.internetServices',
        },
      });
    } catch (err) {
      if (!err.response) {
        navigate('/completion', {
          state: {
            referenceNumber: `DEMO-${Date.now().toString().slice(-6)}`,
            messageKey: 'completion.successMessages.internetServices',
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
      <h2 style={{ marginBottom: '1.5rem' }}>{t('wizards.internetServices.title')}</h2>
      
      {/* Progress Bar */}
      <WizardStepper
        currentStep={currentStep}
        steps={[
          t('wizards.internetServices.steps.s1'),
          t('wizards.internetServices.steps.s2'),
          t('wizards.internetServices.steps.s3'),
        ]}
      />

      <form ref={formRef} onSubmit={(e) => { e.preventDefault(); if (currentStep < totalSteps) { nextStep(); } else { handleSubmit(e); } }}>
        
        <div style={{ minHeight: '300px', marginBottom: '2rem' }}>
          <div style={{ display: currentStep === 1 ? 'block' : 'none' }}>
            <CustomerInfoStep isActive={currentStep === 1} />
          </div>
          <div style={{ display: currentStep === 2 ? 'block' : 'none' }}>
            <ServiceDetailsStep isActive={currentStep === 2} />
          </div>
          <div style={{ display: currentStep === 3 ? 'block' : 'none' }}>
            <AccountSetupStep isActive={currentStep === 3} />
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem' }}>
          <button type="button" className="btn btn-secondary" onClick={prevStep} disabled={currentStep === 1}>
            {t('common.previous')}
          </button>
          {currentStep < totalSteps ? (
            <button type="submit" className="btn btn-primary">
              {t('common.nextStep')}
            </button>
          ) : (
            <button type="submit" className="btn btn-success">
              {t('common.submit')}
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
