import React, { useState, useReducer, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import CustomerInfoStep from './CustomerInfoStep';
import ServiceInfoStep from './ServiceInfoStep';
import ConnectionPackageStep from './ConnectionPackageStep';
import ValueAddedServicesStep from './ValueAddedServicesStep';
import DigitalSignatureCanvas from '../../components/form/DigitalSignatureCanvas';
import PaymentStep from '../PaymentStep';
import BillingSection from '../../components/BillingSection';
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
  vatNumber: '',
  taxExemption: '',
  address: '',
  contactName: '',
  designation: '',
  fixedNumber: '',
  mobileNumber: '',
  faxNumber: '',
  email: '',
  installAddress: '',
  billingAddress: '',
  isExistingCustomer: 'no',
  existingNumber: '',
  separateBill: 'no',
  billingMode: 'email',
  deactIDD: 'no',
  broadbandPackage: '',
  otherBroadbandPackage: '',
  staticIP: 'no',
  declarationAccepted: false,
  signature: '',
  nicFront: null,
  nicBack: null,
  passportDoc: null,
  brcDoc: null,
  vatDoc: null,
  taxExemptionDoc: null,
};

export default function NewConnectionWizard() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const verifiedMobile = useVerifiedMobile();
  const [currentStep, setCurrentStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [formData, dispatch] = useReducer(formReducer, initialState);
  const [showBilling, setShowBilling] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState(null);
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
    if (['mobileNumber', 'fixedNumber', 'existingNumber', 'faxNumber'].includes(name) && typeof finalValue === 'string') {
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

  const handleFileChange = (name, fileData) => {
    dispatch({
      type: 'UPDATE_FIELD',
      payload: {
        name,
        value: fileData,
      },
    });
  };

  const handleSignatureChange = (base64Data) => {
    dispatch({
      type: 'UPDATE_FIELD',
      payload: {
        name: 'signature',
        value: base64Data,
      },
    });
  };

  const nextStep = () => {
    setCurrentStep((prev) => Math.min(prev + 1, totalSteps));
    window.scrollTo(0, 0);
    
    // Show billing section after package selection (step 3)
    if (currentStep === 3) {
      setShowBilling(true);
      // Set mock selected package
      setSelectedPackage({
        name: 'Fibre Broadband 50Mbps',
        price: 2500,
        duration: 'Monthly',
        features: ['50 Mbps Speed', 'Unlimited Data', 'Free Installation'],
      });
    }
  };

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
    window.scrollTo(0, 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');

    // Step 1 Validation: Mandatory Documents & Conditional Fields
    if (currentStep === 1) {
      if (formData.customerType === 'foreign') {
        if (!formData.passportDoc) {
          setSubmitError('Mandatory upload missing: Please upload your Passport document (BRD 5.1.3).');
          return;
        }
      } else {
        if (!formData.nicFront || !formData.nicBack) {
          setSubmitError('Mandatory upload missing: Please upload both NIC Front and NIC Back documents (BRD 5.1.3).');
          return;
        }
      }

      if (formData.customerType === 'business') {
        if (!formData.vatNumber?.trim()) {
          setSubmitError('VAT Registration Number is required for business customers.');
          return;
        }
        if (!formData.brcDoc) {
          setSubmitError('Mandatory upload missing: Business Registration Certificate (BRC) is required for business customers.');
          return;
        }
      }
    }

    // Step 3 Validation: Broadband Mandatory, Voice & PEO TV Conditional (BRD 5.1.6)
    if (currentStep === 3) {
      // Broadband connection mode is mandatory
      const hasBroadbandMode = [
        'connectionModeFibreBroadband',
        'connectionModeLTEBroadband',
        'connectionModeCopperBroadband',
      ].some((key) => !!formData[key]);

      if (!hasBroadbandMode) {
        setSubmitError('3.1 Broadband Connection Mode is mandatory (BRD 5.1.6). Please select at least one Broadband option.');
        return;
      }

      if (!formData.broadbandPackage) {
        setSubmitError('3.2 Broadband Package selection is mandatory (BRD 5.1.6).');
        return;
      }

      // Voice packages — conditional (only required if Voice connection mode is selected)
      const isVoiceSelected = [
        'connectionModeFibreVoice',
        'connectionModeLTEVoice',
        'connectionModeCopperVoice',
      ].some((key) => !!formData[key]);

      if (isVoiceSelected) {
        const hasVoicePkg = [
          'fixedVoicePackageHomeMyPhone',
          'fixedVoicePackageOffice',
          'fixedVoicePackageUnlimited',
          'fixedVoicePackageLTEPalBasic',
          'fixedVoicePackageLTEPalPremium',
          'fixedVoicePackageHomeDoublePlay',
          'fixedVoicePackageOfficeDoublePlay',
        ].some((key) => !!formData[key]);

        if (!hasVoicePkg) {
          setSubmitError('4.1 Please select at least one Voice Package since Voice Connection Mode is selected.');
          return;
        }
      }

      // PEO TV package — conditional (only required if PEO TV connection mode is selected)
      const isPeoTvSelected = [
        'connectionModeFibrePeoTv',
        'connectionModeLTEPeoTv',
        'connectionModeCopperPeoTv',
      ].some((key) => !!formData[key]);

      if (isPeoTvSelected) {
        const peoTvPkgs = [
          'PEO Titanium',
          'PEO Platinum',
          'PEO Entertainment',
          'PEO Gold',
          'PEO Silver Plus',
          'PEO Silver',
          'PEO Family',
          'Other',
        ];
        const hasPeoTvPkg = peoTvPkgs.some(
          (pkg) => !!formData[`peoTvPkg_${pkg.replace(/\s+/g, '')}`]
        );
        if (!hasPeoTvPkg) {
          setSubmitError('4.3 Please select at least one PEO TV Package since PEO TV Connection Mode is selected.');
          return;
        }
      }
    }

    // Step 5 Validation: Declaration & Digital Signature (BRD 5.1.4)
    if (currentStep === 5) {
      if (!formData.declarationAccepted) {
        setSubmitError('Please accept the customer declaration terms before submitting.');
        return;
      }
      if (!formData.signature) {
        setSubmitError('Digital Signature is mandatory (BRD 5.1.4). Please draw your signature below.');
        return;
      }
    }

    if (currentStep < totalSteps) {
      nextStep();
      return;
    }

    // Submit Application to POST /api/applications
    setSubmitting(true);
    setSubmitError('');

    try {
      const res = await api.post('/applications', {
        serviceType: 'new-connection',
        formData,
        phone: verifiedMobile || formData.mobileNumber,
      });

      navigate('/completion', {
        state: {
          referenceNumber: res.data.application.referenceNumber,
          messageKey: 'completion.successMessages.newConnection',
        },
      });
    } catch (err) {
      // Fallback for offline mode
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
        <div
          className="wizard-steps-container"
          style={{ display: 'flex', marginBottom: '2rem', position: 'relative' }}
        >
          <div
            style={{
              position: 'absolute',
              top: '15px',
              left: `calc(50% / ${totalSteps})`,
              right: `calc(50% / ${totalSteps})`,
              height: '4px',
              backgroundColor: 'var(--border-color)',
              zIndex: 0,
            }}
          />
          <div
            className="wizard-progress-bar"
            style={{
              position: 'absolute',
              top: '15px',
              left: `calc(50% / ${totalSteps})`,
              height: '4px',
              backgroundColor: 'var(--slt-green)',
              zIndex: 0,
              width: `calc((100% - 100% / ${totalSteps}) * ${(currentStep - 1) / (totalSteps - 1)})`,
              transition: 'width 0.3s ease',
            }}
          />

          {[1, 2, 3, 4, 5].map((step) => (
            <div
              key={step}
              className="wizard-step"
              style={{
                position: 'relative',
                zIndex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '0.5rem',
                flex: 1,
              }}
            >
              <div
                style={{
                  width: '34px',
                  height: '34px',
                  borderRadius: '50%',
                  backgroundColor: step <= currentStep ? 'var(--slt-green)' : 'var(--surface-color)',
                  border: `2px solid ${step <= currentStep ? 'var(--slt-green)' : 'var(--border-color)'}`,
                  color: step <= currentStep ? 'white' : 'var(--text-secondary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 'bold',
                }}
              >
                {step}
              </div>
              <span
                style={{
                  fontSize: '0.8rem',
                  color: step <= currentStep ? 'var(--text-primary)' : 'var(--text-secondary)',
                }}
              >
                {step === 1
                  ? t('wizards.newConnection.steps.s1')
                  : step === 2
                  ? t('wizards.newConnection.steps.s2')
                  : step === 3
                  ? t('wizards.newConnection.steps.s3')
                  : step === 4
                  ? t('wizards.newConnection.steps.s4')
                  : 'Declaration & Submit'}
              </span>
            </div>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div style={{ minHeight: '300px', marginBottom: '2rem' }}>
          {currentStep === 1 && (
            <CustomerInfoStep
              formData={formData}
              handleChange={handleChange}
              handleFileChange={handleFileChange}
            />
          )}

          {currentStep === 2 && (
            <ServiceInfoStep formData={formData} handleChange={handleChange} />
          )}

          {currentStep === 3 && (
            <ConnectionPackageStep formData={formData} handleChange={handleChange} />
          )}

          {currentStep === 4 && (
            <>
              <ValueAddedServicesStep formData={formData} handleChange={handleChange} />
              {showBilling && <BillingSection selectedPackage={selectedPackage} />}
            </>
          )}

          {currentStep === 5 && (
            <div>
              <h3 style={{ color: 'var(--slt-blue)', marginBottom: '1.5rem' }}>
                5. Customer Declaration & Digital Signature (BRD 5.1.4)
              </h3>

              {/* Declaration Text Box */}
              <div
                style={{
                  padding: '1.25rem',
                  backgroundColor: 'var(--surface-color, #f8f9fa)',
                  border: '1px solid var(--border-color, #dee2e6)',
                  borderRadius: '8px',
                  fontSize: '0.9rem',
                  lineHeight: '1.6',
                  color: 'var(--text-primary)',
                  marginBottom: '1.5rem',
                }}
              >
                <p style={{ fontWeight: '600', marginBottom: '0.5rem' }}>Customer Declaration:</p>
                <p>
                  I / We hereby declare that the information provided in this application is true, accurate, and complete. I / We agree to abide by the terms and conditions of Sri Lanka Telecom PLC for the supply of telecommunication services, broadband, and PEO TV packages.
                </p>
              </div>

              {/* Declaration Checkbox */}
              <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                <label
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '0.75rem',
                    cursor: 'pointer',
                    fontWeight: '500',
                  }}
                >
                  <input
                    type="checkbox"
                    name="declarationAccepted"
                    checked={formData.declarationAccepted}
                    onChange={handleChange}
                    style={{ marginTop: '0.2rem', width: '18px', height: '18px' }}
                    required
                  />
                  <span>
                    I confirm that I have read, understood, and accept the Customer Declaration terms & conditions above.
                  </span>
                </label>
              </div>

              {/* Digital Signature Canvas Component */}
              <DigitalSignatureCanvas
                label="Customer Digital Signature (Mandatory - BRD 5.1.4)"
                required
                value={formData.signature}
                onChange={handleSignatureChange}
              />
            </div>
          )}
        </div>

        {submitError && (
          <p
            style={{
              color: 'var(--danger, #dc3545)',
              marginBottom: '1rem',
              fontSize: '0.9rem',
              padding: '0.75rem 1rem',
              backgroundColor: 'rgba(220, 53, 69, 0.08)',
              borderRadius: '6px',
              borderLeft: '4px solid var(--danger, #dc3545)',
            }}
          >
            {submitError}
          </p>
        )}

        <div
          style={{
            display: 'flex',
            justify: 'space-between',
            borderTop: '1px solid var(--border-color)',
            paddingTop: '1.5rem',
          }}
        >
          <button
            type="button"
            className="btn btn-secondary"
            onClick={prevStep}
            disabled={currentStep === 1 || submitting}
          >
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
