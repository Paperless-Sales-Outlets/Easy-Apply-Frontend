import React, { useState, useReducer, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import CustomerInfoStep from './CustomerInfoStep';
import ServiceInfoStep from './ServiceInfoStep';
import ConnectionPackageStep from './ConnectionPackageStep';
import ValueAddedServicesStep from './ValueAddedServicesStep';
import PaymentStep from '../PaymentStep';
import { useTranslation } from 'react-i18next';
import api from '../../utils/api';
import { useVerifiedMobile } from '../../components/verification';

const formReducer = (state, action) => {
  switch (action.type) {
    case 'UPDATE_FIELD':
      return {
        ...state,
        [action.payload.name]: action.payload.value,
      };
    case 'SET_FIELDS':
      return {
        ...state,
        ...action.payload,
      };
    default:
      return state;
  }
};

const initialState = {
  customerType: 'home',
  title: '',
  nameFull: '',
  dob: '',
  nic: '',
  taxExemption: '',
  address: '',
  contactName: '',
  fixedNumber: '',
  mobileNumber: '',
  faxNumber: '',
  email: '',
  installAddress: '',
  billingAddress: '',
  existingNumber: '',
  separateBill: 'no',
  billingMode: 'email',
  deactIDD: 'no',
  broadbandPackage: '',
  otherBroadbandPackage: '',
  staticIP: 'no',
};

export default function NewConnectionWizard() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const verifiedMobile = useVerifiedMobile();
  const [currentStep, setCurrentStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [formData, dispatch] = useReducer(formReducer, initialState);
  const totalSteps = 5;

  // Auto-populate mobile number from OTP context
  useEffect(() => {
    if (verifiedMobile) {
      dispatch({
        type: 'SET_FIELDS',
        payload: {
          mobileNumber: verifiedMobile,
        },
      });
    }
  }, [verifiedMobile]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    let finalValue = type === 'checkbox' ? checked : value;

    // Filter out non-numeric characters for phone/number fields and cap at 10 digits
    if (['mobileNumber', 'fixedNumber', 'existingNumber'].includes(name) && typeof finalValue === 'string') {
      finalValue = finalValue.replace(/\D/g, '').slice(0, 10);
    }

    dispatch({
      type: 'UPDATE_FIELD',
      payload: {
        name,
        value: finalValue,
      },
    });
  };

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
    setSubmitError('');

    // Step 3 Validation: Checkbox groups require at least one selection each
    if (currentStep === 3) {
      // 4.0 — Connection Mode table: at least one must be ticked
      const hasConnectionMode = [
        'connectionModeFibreVoice', 'connectionModeFibreBroadband', 'connectionModeFibrePeoTv',
        'connectionModeLTEVoice', 'connectionModeLTEBroadband', 'connectionModeLTEPeoTv',
        'connectionModeCopperVoice', 'connectionModeCopperBroadband', 'connectionModeCopperPeoTv',
      ].some(key => !!formData[key]);
      if (!hasConnectionMode) {
        setSubmitError('3.1 – Please select at least one Connection Mode from the table (Voice, Broadband, or PEO TV).');
        return;
      }

      // 4.1.1 — Fixed voice packages: at least one must be ticked
      const has411 = [
        'fixedVoicePackageHomeMyPhone', 'fixedVoicePackageOffice', 'fixedVoicePackageUnlimited',
      ].some(key => !!formData[key]);
      if (!has411) {
        setSubmitError('4.1.1 – Please select at least one Fixed Voice Package.');
        return;
      }

      // 4.1.2 — 4G LTE Postpaid packages: at least one must be ticked
      const has412 = [
        'fixedVoicePackageLTEPalBasic', 'fixedVoicePackageLTEPalPremium',
        'fixedVoicePackageHomeDoublePlay', 'fixedVoicePackageOfficeDoublePlay',
      ].some(key => !!formData[key]);
      if (!has412) {
        setSubmitError('4.1.2 – Please select at least one 4G LTE Postpaid Package.');
        return;
      }

      // 4.3 — PEO TV Package: at least one must be ticked
      const peoTvPkgs = [
        'PEO Titanium', 'PEO Platinum', 'PEO Entertainment', 'PEO Gold',
        'PEO Silver Plus', 'PEO Silver', 'PEO Family', 'Other',
      ];
      const has43 = peoTvPkgs.some(pkg => !!formData[`peoTvPkg_${pkg.replace(/\s+/g, '')}`]);
      if (!has43) {
        setSubmitError('4.3 – Please select at least one PEO TV Package.');
        return;
      }
    }

    if (currentStep < totalSteps) { nextStep(); return; }

    setSubmitting(true);
    setSubmitError('');
    try {
      const res = await api.post('/applications', {
        serviceType: 'new-connection',
        formData,
        phone: verifiedMobile,
      });
      navigate('/completion', {
        state: {
          referenceNumber: res.data.application.referenceNumber,
          messageKey: 'completion.successMessages.newConnection',
        },
      });
    } catch (err) {
      // If backend is offline (no response), still navigate to completion with a mock ref
      if (!err.response) {
        navigate('/completion', {
          state: {
            referenceNumber: `DEMO-${Date.now().toString().slice(-6)}`,
            messageKey: 'completion.successMessages.newConnection',
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
      <h2 style={{ marginBottom: '1.5rem' }}>{t('wizards.newConnection.title')}</h2>

      {/* Progress Bar */}
      <div className="wizard-nav-wrapper">
        <div className="wizard-steps-container" style={{ display: "flex", marginBottom: "2rem", position: "relative" }}>
        <div style={{ position: "absolute", top: "15px", left: `calc(50% / ${totalSteps})`, right: `calc(50% / ${totalSteps})`, height: "4px", backgroundColor: "var(--border-color)", zIndex: 0 }} />
        <div className="wizard-progress-bar" style={{ position: "absolute", top: "15px", left: `calc(50% / ${totalSteps})`, height: "4px", backgroundColor: "var(--slt-green)", zIndex: 0, width: `calc((100% - 100% / ${totalSteps}) * ${(currentStep - 1) / (totalSteps - 1)})`, transition: "width 0.3s ease" }} />

        {[1, 2, 3, 4, 5].map(step => (
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
              {step === 1 ? t('wizards.newConnection.steps.s1') : step === 2 ? t('wizards.newConnection.steps.s2') : step === 3 ? t('wizards.newConnection.steps.s3') : step === 4 ? t('wizards.newConnection.steps.s4') : 'Payment'}
            </span>
          </div>
        ))}
      </div>
      </div>

      <form onSubmit={handleSubmit}>

        <div style={{ minHeight: '300px', marginBottom: '2rem' }}>
          {currentStep === 1 && (
            <CustomerInfoStep formData={formData} handleChange={handleChange} />
          )}
          {currentStep === 2 && (
            <ServiceInfoStep formData={formData} handleChange={handleChange} />
          )}
          {currentStep === 3 && (
            <ConnectionPackageStep formData={formData} handleChange={handleChange} />
          )}
          {currentStep === 4 && (
            <ValueAddedServicesStep formData={formData} handleChange={handleChange} />
          )}
          {currentStep === 5 && (
            <PaymentStep isActive={currentStep === 5} verifiedPhone={verifiedMobile} onSuccess={nextStep} />
          )}
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
              {submitting ? t('common.submitting') : t('common.submit')}
            </button>
          ) : null}
        </div>
      </form>
    </div>
  );
}
