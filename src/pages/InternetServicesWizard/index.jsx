import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CustomerInfoStep from './CustomerInfoStep';
import ServiceDetailsStep from './ServiceDetailsStep';
import AccountSetupStep from './AccountSetupStep';
import { useTranslation } from 'react-i18next';

export default function InternetServicesWizard() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 3;

  const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, totalSteps));
  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1));
  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Internet Services Form submitted!");
    alert("Internet Services application submitted successfully!");
    navigate('/');
  };

  return (
    <div className="card" style={{ padding: '3rem', width: '100%', margin: '0 auto' }}>
      <h2 style={{ marginBottom: '1.5rem' }}>{t('wizards.internetServices.title')}</h2>
      
      {/* Progress Bar */}
      <div className="wizard-nav-wrapper">
        <div className="wizard-steps-container" style={{ display: "flex", marginBottom: "2rem", position: "relative" }}>
        <div style={{ position: "absolute", top: "15px", left: `calc(50% / ${totalSteps})`, right: `calc(50% / ${totalSteps})`, height: "4px", backgroundColor: "var(--border-color)", zIndex: 0 }} />
        <div className="wizard-progress-bar" style={{ position: "absolute", top: "15px", left: `calc(50% / ${totalSteps})`, height: "4px", backgroundColor: "var(--slt-green)", zIndex: 0, width: `calc((100% - 100% / ${totalSteps}) * ${(currentStep - 1) / (totalSteps - 1)})`, transition: "width 0.3s ease" }} />
        
        {[1, 2, 3].map(step => (
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
              {step === 1 ? t('wizards.internetServices.steps.s1') : step === 2 ? t('wizards.internetServices.steps.s2') : t('wizards.internetServices.steps.s3')}
            </span>
          </div>
        ))}
      </div>
      </div>

      <form onSubmit={currentStep === totalSteps ? handleSubmit : (e) => { e.preventDefault(); nextStep(); }}>
        
        <div style={{ minHeight: '300px', marginBottom: '2rem' }}>
          {currentStep === 1 && <CustomerInfoStep />}
          {currentStep === 2 && <ServiceDetailsStep />}
          {currentStep === 3 && <AccountSetupStep />}
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem' }}>
          <button type="button" className="btn btn-secondary" onClick={prevStep} disabled={currentStep === 1}>
            {t('common.previous')}
          </button>
          {currentStep < totalSteps ? (
            <button type="button" className="btn btn-primary" onClick={nextStep}>
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
