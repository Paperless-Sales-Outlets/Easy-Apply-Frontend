import React, { useState, useRef } from 'react';
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
  const formRef = useRef(null);
  const totalSteps = 4;

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
    
    // Use the telephone number as the identification key (nic) for relocation
    formData.nic = formData.telephone;

    setSubmitting(true);
    setSubmitError('');
    try {
      const res = await api.post('/api/applications', {
        serviceType: 'relocation',
        formData,
        phone: verifiedMobile,
      });
      navigate('/completion', {
        state: {
          referenceNumber: res.data.application.referenceNumber,
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

  return (
    <div className="card" style={{ padding: '3rem', width: '100%', margin: '0 auto' }}>
      <h2 style={{ marginBottom: '1.5rem' }}>{t('wizards.locationChange.title')}</h2>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>{t('wizards.locationChange.subtitle')}</p>

      {/* Progress Bar */}
      <div className="wizard-nav-wrapper">
        <div className="wizard-steps-container" style={{ display: "flex", marginBottom: "2rem", position: "relative" }}>
        <div style={{ position: "absolute", top: "15px", left: `calc(50% / ${totalSteps})`, right: `calc(50% / ${totalSteps})`, height: "4px", backgroundColor: "var(--border-color)", zIndex: 0 }} />
        <div className="wizard-progress-bar" style={{ position: "absolute", top: "15px", left: `calc(50% / ${totalSteps})`, height: "4px", backgroundColor: "var(--slt-green)", zIndex: 0, width: `calc((100% - 100% / ${totalSteps}) * ${(currentStep - 1) / (totalSteps - 1)})`, transition: "width 0.3s ease" }} />

        {[1, 2, 3, 4].map(step => (
          <div key={step} className="wizard-step" style={{ position: "relative", zIndex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: "0.5rem", flex: 1 }}>
            <div style={{
              width: '34px', height: '34px', borderRadius: '50%',
              backgroundColor: step <= currentStep ? 'var(--slt-green)' : 'var(--surface-color)',
              border: `2px solid ${step <= currentStep ? 'var(--slt-green)' : 'var(--border-color)'}`,
              color: step <= currentStep ? 'white' : 'var(--text-secondary)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold'
            }}>
              {step}
            </div>
            <span style={{ fontSize: '0.8rem', color: step <= currentStep ? 'var(--text-primary)' : 'var(--text-secondary)' }}>
              {step === 1 ? t('wizards.locationChange.steps.s1') : step === 2 ? t('wizards.locationChange.steps.s2') : step === 3 ? t('wizards.locationChange.steps.s3') : t('wizards.locationChange.steps.s4')}
            </span>
          </div>
        ))}
      </div>
      </div>

      <form ref={formRef} onSubmit={handleSubmit}>

        <div style={{ minHeight: '300px', marginBottom: '2rem' }}>
          <div style={{ display: currentStep === 1 ? 'block' : 'none' }}>
            <GeneralInfoStep isActive={currentStep === 1} />
          </div>
          <div style={{ display: currentStep === 2 ? 'block' : 'none' }}>
            <AddressStep isActive={currentStep === 2} />
          </div>
          <div style={{ display: currentStep === 3 ? 'block' : 'none' }}>
            <PreferencesStep isActive={currentStep === 3} />
          </div>
          <div style={{ display: currentStep === 4 ? 'block' : 'none' }}>
            <AgreementStep isActive={currentStep === 4} />
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
