import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import GeneralInfoStep from './GeneralInfoStep';
import AddressStep from './AddressStep';
import PreferencesStep from './PreferencesStep';
import AgreementStep from './AgreementStep';
import { useTranslation } from 'react-i18next';

export default function LocationChangeWizard() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 4;

  const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, totalSteps));
  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1));
  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Location Change Form submitted!");
    alert("Location Change application submitted successfully!");
    navigate('/');
  };

  return (
    <div className="card" style={{ padding: '3rem', width: '100%', margin: '0 auto' }}>
      <h2 style={{ marginBottom: '1.5rem' }}>{t('wizards.locationChange.title')}</h2>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>{t('wizards.locationChange.subtitle')}</p>
      
      {/* Progress Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem', position: 'relative' }}>
        <div style={{ position: 'absolute', top: '15px', left: 0, right: 0, height: '4px', backgroundColor: 'var(--border-color)', zIndex: 0 }} />
        <div style={{ position: 'absolute', top: '15px', left: 0, height: '4px', backgroundColor: 'var(--slt-green)', zIndex: 0, width: `${((currentStep - 1) / (totalSteps - 1)) * 100}%`, transition: 'width 0.3s ease' }} />
        
        {[1, 2, 3, 4].map(step => (
          <div key={step} style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
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

      <form onSubmit={currentStep === totalSteps ? handleSubmit : (e) => { e.preventDefault(); nextStep(); }}>
        
        <div style={{ minHeight: '300px', marginBottom: '2rem' }}>
          {currentStep === 1 && <GeneralInfoStep />}
          {currentStep === 2 && <AddressStep />}
          {currentStep === 3 && <PreferencesStep />}
          {currentStep === 4 && <AgreementStep />}
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
