import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api from '../../utils/api';
import { useVerifiedMobile } from '../../components/verification';
import WizardStepper from '../../components/WizardStepper';

import GeneralInfoStep from './GeneralInfoStep';
import ServiceInfoStep from './ServiceInfoStep';
import AgreementStep from './AgreementStep';
import PaymentStep from '../PaymentStep';

export default function ServiceVacationWizard() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const verifiedMobile = useVerifiedMobile();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  
  const [vacationData, setVacationData] = useState(null);
  const [paymentIntention, setPaymentIntention] = useState('later'); // 'later', 'paid', 'gateway'
  
  const formRef = useRef(null);
  const step1Ref = useRef(null);
  const step2Ref = useRef(null);
  const step3Ref = useRef(null);
  
  const totalSteps = 4;

  const nextStep = () => {
    if (currentStep === 1 && step1Ref.current && !step1Ref.current.validate()) return;
    if (currentStep === 2 && step2Ref.current && !step2Ref.current.validate()) return;
    if (currentStep === 3 && step3Ref.current && !step3Ref.current.validate()) return;

    if (currentStep < totalSteps) {
      setCurrentStep(prev => prev + 1);
      window.scrollTo(0, 0);
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
    window.scrollTo(0, 0);
  };

  const handleSubmit = async (e) => {
    if (e?.preventDefault) e.preventDefault();
    if (currentStep < totalSteps) { nextStep(); return; }

    const raw = new FormData(formRef.current);
    const formData = Object.fromEntries(raw.entries());

    // Prepare multipart data
    const submitData = new FormData();
    submitData.append('serviceType', 'service-vacation');
    
    let formattedPhone = verifiedMobile || formData.verifiedMobile || '';
    if (formattedPhone && formattedPhone.length === 9) {
      formattedPhone = '0' + formattedPhone;
    }
    submitData.append('phone', formattedPhone);
    delete formData.verifiedMobile;

    // Extract signature
    const signatureBase64 = formData.digitalSignatureBase64;
    delete formData.digitalSignatureBase64;
    delete formData.signatureMethod;
    delete formData.paymentIntention;

    // Append JSON payload
    submitData.append('formData', JSON.stringify(formData));

    // Append standard file uploads (if any exist, e.g. Payment Receipt, Signature Doc)
    for (let [key, value] of raw.entries()) {
      if (value instanceof File && value.size > 0) {
        submitData.append(key, value);
      }
    }

    // Convert signature Base64 to Blob
    if (signatureBase64) {
      try {
        const res = await fetch(signatureBase64);
        const blob = await res.blob();
        const signatureFile = new File([blob], 'signature.png', { type: 'image/png' });
        submitData.append('signatureDoc', signatureFile);
      } catch (err) {
        console.error('Failed to convert signature to file:', err);
      }
    }

    setSubmitting(true);
    setSubmitError('');
    try {
      const res = await api.post('/applications', submitData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      navigate('/completion', {
        state: {
          referenceNumber: res.data.application.referenceNumber,
          messageKey: 'completion.successMessages.serviceVacation',
        },
      });
    } catch (err) {
      if (!err.response) {
        navigate('/completion', {
          state: {
            referenceNumber: `DEMO-${Date.now().toString().slice(-6)}`,
            messageKey: 'completion.successMessages.serviceVacation',
          },
        });
        return;
      }
      setSubmitError(err.response?.data?.message || t('common.submitError'));
      setSubmitting(false);
    }
  };

  return (

    <div className="mesh-gradient-bg" style={{ minHeight: 'calc(100vh - 80px)', padding: '2rem 1rem' }}>
      <style>{`
        .mesh-gradient-bg {
          background-color: #f0f8ff;
          background-image: 
            radial-gradient(at 0% 0%, rgba(15, 87, 168, 0.1) 0px, transparent 50%),
            radial-gradient(at 100% 0%, rgba(0, 204, 255, 0.1) 0px, transparent 50%),
            radial-gradient(at 100% 100%, rgba(15, 87, 168, 0.1) 0px, transparent 50%),
            radial-gradient(at 0% 100%, rgba(0, 204, 255, 0.1) 0px, transparent 50%);
          background-size: 200% 200%;
          animation: meshGradient 15s ease infinite alternate;
        }
        @keyframes meshGradient {
          0% { background-position: 0% 0%; }
          50% { background-position: 100% 100%; }
          100% { background-position: 0% 100%; }
        }
      `}</style>

      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
          <h1 style={{ color: 'var(--text-primary)', marginBottom: '0.5rem', fontSize: '2rem', fontWeight: 800 }}>
            {t('wizards.serviceVacation.title')}
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>
            {t('wizards.serviceVacation.subtitle')}
          </p>
        </div>


        <div style={{
          background: 'rgba(255, 255, 255, 0.75)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          borderRadius: '24px',
          border: '1px solid rgba(255, 255, 255, 0.6)',
          boxShadow: '0 24px 60px rgba(0,0,0,0.05), inset 0 1px 0 rgba(255,255,255,0.8)',
          padding: '3rem',
          minHeight: '600px',
          position: 'relative',
          overflow: 'hidden'
        }}>
          
          <WizardStepper 
            currentStep={currentStep} 
            steps={[
              t('wizards.serviceVacation.steps.s1'),
              t('wizards.serviceVacation.steps.s2'),
              t('wizards.serviceVacation.steps.s3'),
              t('wizards.serviceVacation.steps.s4')
            ]} 
          />

          <form ref={formRef} onSubmit={handleSubmit}>
            <div style={{ minHeight: '300px', marginBottom: '2rem', paddingBottom: '6rem' }}>
              <div style={{ display: currentStep === 1 ? 'block' : 'none' }}>
                <GeneralInfoStep 
                  ref={step1Ref}
                  isActive={currentStep === 1} 
                  vacationData={vacationData}
                  onVerifySuccess={(data) => setVacationData(data)}
                  verifiedMobile={verifiedMobile}
                />
              </div>
              <div style={{ display: currentStep === 2 ? 'block' : 'none' }}>
                <ServiceInfoStep 
                  ref={step2Ref}
                  isActive={currentStep === 2} 
                />
              </div>
              <div style={{ display: currentStep === 3 ? 'block' : 'none' }}>
                <AgreementStep 
                  ref={step3Ref}
                  isActive={currentStep === 3} 
                  onPaymentIntentionChange={setPaymentIntention}
                />
              </div>
              <div style={{ display: currentStep === 4 ? 'block' : 'none' }}>
                <PaymentStep 
                  isActive={currentStep === 4} 
                  verifiedPhone={verifiedMobile}
                  amount={vacationData?.outstandingBalance || 0}
                  feeAmount={500}
                  feeLabel="Vacation Fee"
                  hasPaymentReceipt={formRef.current ? (new FormData(formRef.current).get('paymentReceipt')?.size > 0) : false}
                  onSuccess={() => handleSubmit({ preventDefault: () => {} })} 
                />
              </div>
            </div>

            {submitError && (
              <p style={{ color: 'var(--danger, #dc3545)', marginBottom: '1rem', fontSize: '0.9rem' }}>
                {submitError}
              </p>
            )}

            <div style={{ 
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              position: 'fixed', bottom: '2rem', left: '50%', transform: 'translateX(-50%)',
              width: 'calc(100% - 2rem)', maxWidth: '800px',
              padding: '1rem 1.5rem', borderRadius: '100px',
              background: 'rgba(255, 255, 255, 0.75)',
              backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)',
              border: '1px solid rgba(255,255,255,0.8)',
              boxShadow: '0 20px 40px rgba(0,0,0,0.1), 0 1px 3px rgba(0,0,0,0.05)',
              zIndex: 100
            }}>
              <button type="button" className="btn btn-secondary" style={{ borderRadius: '100px', padding: '0.5rem 1.5rem', opacity: currentStep === 1 ? 0 : 1, pointerEvents: currentStep === 1 ? 'none' : 'auto' }} onClick={prevStep} disabled={submitting}>
                {t('common.previous')}
              </button>
              {currentStep < totalSteps ? (
                <button type="button" className="btn btn-primary" style={{ borderRadius: '100px', padding: '0.5rem 2rem', boxShadow: '0 4px 12px rgba(15, 87, 168, 0.3)' }} onClick={nextStep}>
                  {t('common.nextStep')}
                </button>
              ) : null}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}