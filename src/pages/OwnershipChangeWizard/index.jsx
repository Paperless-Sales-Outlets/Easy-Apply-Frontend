import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CurrentCustomerStep from './CurrentCustomerStep';
import NewApplicantStep from './NewApplicantStep';
import DocumentsStep from './DocumentsStep';
import DeclarationStep from './DeclarationStep';
import { useTranslation } from 'react-i18next';

export default function OwnershipChangeWizard() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 4;

  const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, totalSteps));
  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1));
  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Ownership Change Form submitted!");
    navigate('/completion', { state: { messageKey: 'completion.successMessages.ownershipChange' } });
  };

  return (
    <div className="card" style={{ padding: '3rem', width: '100%', margin: '0 auto' }}>
      <h2 style={{ marginBottom: '1.5rem' }}>{t('wizards.ownershipChange.title')}</h2>
      
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
              {step === 1 ? t('wizards.ownershipChange.steps.s1') : step === 2 ? t('wizards.ownershipChange.steps.s2') : step === 3 ? t('wizards.ownershipChange.steps.s3') : t('wizards.ownershipChange.steps.s4')}
            </span>
          </div>
        ))}
      </div>
      </div>

      <form onSubmit={(e) => { e.preventDefault(); if (currentStep < totalSteps) { nextStep(); } else { handleSubmit(e); } }}>
        
        <div style={{ minHeight: '300px', marginBottom: '2rem' }}>
          {currentStep === 1 && <CurrentCustomerStep />}
          {currentStep === 2 && <NewApplicantStep />}
          {currentStep === 3 && <DocumentsStep />}
          {currentStep === 4 && <DeclarationStep />}
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
