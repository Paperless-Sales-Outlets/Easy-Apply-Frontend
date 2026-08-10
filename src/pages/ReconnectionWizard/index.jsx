import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import ReconnectionDetailsStep from './ReconnectionDetailsStep';
import WizardStepper from '../../components/WizardStepper';
import DeclarationStep from './DeclarationStep';
import PaymentStep from '../PaymentStep';
import api from '../../utils/api';
import { useVerifiedMobile } from '../../components/verification';

export default function ReconnectionWizard() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const verifiedMobile = useVerifiedMobile();
  const [currentStep, setCurrentStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [paymentIntention, setPaymentIntention] = useState('online');
  const [reconnectionData, setReconnectionData] = useState(null);
  const formRef = useRef(null);
  const step2Ref = useRef(null);
  const step3Ref = useRef(null);
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
    if (currentStep < totalSteps) {
      if (currentStep === 1 && step2Ref.current && !step2Ref.current.validate()) return;
      if (currentStep === 2 && step3Ref.current && !step3Ref.current.validate()) return;
      nextStep();
      return;
    }

    const raw = new FormData(formRef.current);
    const formData = Object.fromEntries(raw.entries());

    // Construct FormData for multipart/form-data submission
    const submitData = new FormData();
    submitData.append('serviceType', 'reconnection');
    
    // Ensure phone is 10 digits starting with 0
    let formattedPhone = formData.verifiedMobile || '';
    if (formattedPhone && formattedPhone.length === 9) {
      formattedPhone = '0' + formattedPhone;
    }
    submitData.append('phone', formattedPhone);
    delete formData.verifiedMobile;
    
    // Extract digital signature base64 and delete from JSON formData to save space
    const signatureBase64 = formData.digitalSignatureBase64;
    delete formData.digitalSignatureBase64;
    delete formData.signatureUpload;

    // We stringify the non-file fields to send them as a single field
    submitData.append('formData', JSON.stringify(formData));

    // Append all file inputs explicitly
    for (let [key, value] of raw.entries()) {
      if (value instanceof File && value.size > 0) {
        submitData.append(key, value);
      }
    }

    // Convert signature Base64 to Blob and append as a file
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
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      navigate('/completion', {
        state: {
          referenceNumber: res.data.application.referenceNumber,
          messageKey: 'completion.successMessages.reconnection',
        },
      });
    } catch (err) {
      if (!err.response) {
        navigate('/completion', {
          state: {
            referenceNumber: `DEMO-${Date.now().toString().slice(-6)}`,
            messageKey: 'completion.successMessages.reconnection',
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
      <h2 style={{ marginBottom: '1.5rem' }}>{t('wizards.reconnection.title')}</h2>

      <WizardStepper 
        currentStep={currentStep} 
        steps={[
          'Select Services',
          'Details & Documents',
          'Checkout & Auth'
        ]} 
      />

      <form ref={formRef} onSubmit={handleSubmit}>

        <div style={{ minHeight: '300px', marginBottom: '2rem' }}>
          <div style={{ display: currentStep === 1 ? 'block' : 'none' }}>
            <ReconnectionDetailsStep 
              ref={step2Ref} 
              isActive={currentStep === 1} 
              reconnectionData={reconnectionData} 
              onVerifySuccess={(data) => setReconnectionData(data)} 
            />
          </div>
          <div style={{ display: currentStep === 2 ? 'block' : 'none' }}>
            <DeclarationStep 
              ref={step3Ref} 
              isActive={currentStep === 2} 
              onPaymentIntentionChange={setPaymentIntention}
              reconnectionData={reconnectionData}
              customerType={
                reconnectionData?.customerType === 'office' ? 'Business' 
                : reconnectionData?.customerType === 'foreign' ? 'Foreign' 
                : 'Residential'
              } 
            />
          </div>
          <div style={{ display: currentStep === 3 ? 'block' : 'none' }}>
            <PaymentStep 
              isActive={currentStep === 3} 
              verifiedPhone={verifiedMobile}
              amount={formRef.current ? new FormData(formRef.current).get('amountToPay') : null}
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

        <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem' }}>
          <button type="button" className="btn btn-secondary" onClick={prevStep} disabled={currentStep === 1 || submitting}>
            {t('common.previous')}
          </button>
          {currentStep < totalSteps - 1 ? (
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {t('common.nextStep')}
            </button>
          ) : currentStep === totalSteps - 1 ? (
            <button type="submit" className="btn btn-success" disabled={submitting}>
              {submitting 
                ? t('common.submitting') 
                : paymentIntention === 'paid' 
                  ? 'Submit Reconnection Request' 
                  : `Proceed to Pay Rs. ${reconnectionData?.outstandingBalance || '0.00'}`
              }
            </button>
          ) : null}
        </div>
      </form>
    </div>
  );
}
