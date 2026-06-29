import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CustomerInfoStep from './CustomerInfoStep';
import ServiceInfoStep from './ServiceInfoStep';
import ConnectionPackageStep from './ConnectionPackageStep';
import ValueAddedServicesStep from './ValueAddedServicesStep';

export default function NewConnectionWizard() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 4;

  const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, totalSteps));
  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1));
  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Form submitted!");
    alert("Application submitted successfully!");
    navigate('/');
  };

  return (
    <div className="card" style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      <h2 style={{ marginBottom: '1.5rem' }}>New Services Application</h2>
      
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
              {step === 1 ? 'Customer' : step === 2 ? 'Service' : step === 3 ? 'Connection' : 'Add-ons'}
            </span>
          </div>
        ))}
      </div>

      <form onSubmit={currentStep === totalSteps ? handleSubmit : (e) => { e.preventDefault(); nextStep(); }}>
        
        <div style={{ minHeight: '300px', marginBottom: '2rem' }}>
          {currentStep === 1 && <CustomerInfoStep />}
          {currentStep === 2 && <ServiceInfoStep />}
          {currentStep === 3 && <ConnectionPackageStep />}
          {currentStep === 4 && <ValueAddedServicesStep />}
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem' }}>
          <button type="button" className="btn btn-secondary" onClick={prevStep} disabled={currentStep === 1}>
            Previous
          </button>
          {currentStep < totalSteps ? (
            <button type="button" className="btn btn-primary" onClick={nextStep}>
              Next Step
            </button>
          ) : (
            <button type="submit" className="btn btn-success">
              Submit Application
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
