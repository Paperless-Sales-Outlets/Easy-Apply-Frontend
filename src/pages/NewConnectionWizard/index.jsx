import React, { useState, useReducer, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import CustomerInfoStep from './CustomerInfoStep';
// import ServiceInfoStep from './ServiceInfoStep';
// import ValueAddedServicesStep from './ValueAddedServicesStep';
import LoopCheckStep from './LoopCheckStep';
import PaymentStep from '../PaymentStep';
import { useTranslation } from 'react-i18next';
import api from '../../utils/api';
import { useVerifiedMobile, useVerifiedContext } from '../../components/verification';
import WizardStepper from '../../components/WizardStepper';
import ExistingCustomerSummaryBox from '../../components/ExistingCustomerSummaryBox';

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
  locationType: 'current',
  city: '',
  district: '',
};

export default function NewConnectionWizard() {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const verifiedMobile = useVerifiedMobile();
  const { customerExists, selectedAccount } = useVerifiedContext();

  const [selectedProduct, setSelectedProduct] = useState(null);

  useEffect(() => {
    const fromState = location.state?.selectedProduct;
    if (fromState) {
      setSelectedProduct(fromState);
    } else {
      const stored = localStorage.getItem('selectedProduct');
      if (stored) {
        try {
          setSelectedProduct(JSON.parse(stored));
        } catch (e) { }
      }
    }
  }, [location.state]);

  const [currentStep, setCurrentStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [formData, dispatch] = useReducer(formReducer, initialState);
  const totalSteps = 3;

  useEffect(() => {
    if (selectedProduct?.productName) {
      dispatch({
        type: 'UPDATE_FIELD',
        payload: {
          name: 'otherBroadbandPackage',
          value: `${selectedProduct.productName} (Qty: ${selectedProduct.quantity || 1})`,
        },
      });
    }
  }, [selectedProduct]);

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
    setCurrentStep((prev) => Math.min(prev + 1, totalSteps));
    window.scrollTo(0, 0);
  };
  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
    window.scrollTo(0, 0);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitError('');

    // Ensure installation address / location is selected in Step 1
    if (currentStep === 1) {
      const activeAddress = formData.installAddress || formData.address;
      if (!activeAddress || activeAddress.trim().length === 0) {
        toast.error('Please specify an installation address.');
        return;
      }
    }

    if (currentStep < totalSteps) nextStep();
  };

  // Real submission — fired after payment succeeds
  const submitApplication = async (paymentRef, phoneOverride) => {
    const phone = phoneOverride || verifiedMobile || formData.mobileNumber;
    setSubmitting(true);
    setSubmitError('');
    try {
      const res = await api.post('/applications', {
        serviceType: 'new-connection',
        formData: {
          ...formData,
          paymentReference: paymentRef,
          product: selectedProduct,
        },
        phone,
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
      <h2 style={{ marginBottom: selectedProduct ? '0.75rem' : '1.5rem' }}>{t('wizards.newConnection.title')}</h2>

      {selectedProduct && (
        <div
          style={{
            backgroundColor: '#eff6ff',
            border: '1.5px solid #bfdbfe',
            borderRadius: '12px',
            padding: '0.85rem 1.25rem',
            marginBottom: '1.75rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '0.75rem',
          }}
        >
          <div>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#0284c7', textTransform: 'uppercase' }}>Selected Product</span>
            <h4 style={{ margin: '0.1rem 0 0 0', fontSize: '1.05rem', fontWeight: 800, color: '#0f172a' }}>
              {selectedProduct.productName}
            </h4>
          </div>
          <div style={{ display: 'flex', gap: '1.25rem', fontSize: '0.88rem', color: '#334155' }}>
            <span>Monthly: <strong style={{ color: '#0056b3' }}>Rs. {(selectedProduct.monthlyPrice || 0).toLocaleString()}</strong></span>
            <span>Installation: <strong>Rs. {(selectedProduct.installationFee || 2500).toLocaleString()}</strong></span>
            {selectedProduct.quantity > 1 && <span>Qty: <strong>{selectedProduct.quantity}</strong></span>}
          </div>
        </div>
      )}

      {/* Progress Stepper: 3 Clean Steps */}
      <WizardStepper
        currentStep={currentStep}
        steps={[
          'Installation Location',
          'Loop Coverage Check',
          'Payment Gateway',
        ]}
      />

      <ExistingCustomerSummaryBox customerData={selectedAccount} customerExists={customerExists} />

      <form onSubmit={handleSubmit}>
        <div style={{ minHeight: '300px', marginBottom: '2rem' }}>
          {/* Step 1: Installation Location (Current or New with City Dropdown & Map) */}
          {currentStep === 1 && (
            <CustomerInfoStep
              formData={formData}
              handleChange={handleChange}
              setFields={(fields) => dispatch({ type: 'SET_FIELDS', payload: fields })}
              selectedProduct={selectedProduct}
            />
          )}

          {/* Commented out legacy intermediate steps per new simplified flow
          {currentStep === 2 && (
            <ServiceInfoStep formData={formData} handleChange={handleChange} />
          )}
          {currentStep === 3 && (
            <ValueAddedServicesStep
              isActive={currentStep === 3}
              formData={formData}
              handleChange={handleChange}
            />
          )}
          */}

          {/* Step 2: Backend Loop Availability Check */}
          {currentStep === 2 && (
            <LoopCheckStep
              formData={formData}
              onAvailable={nextStep}
              onGoBack={prevStep}
            />
          )}

          {/* Step 3: Payment Gateway */}
          {currentStep === 3 && (
            <PaymentStep
              isActive={currentStep === 3}
              verifiedPhone={verifiedMobile}
              amount={selectedProduct?.installationFee || 2500}
              amountLabel="Installation Fee"
              onSuccess={submitApplication}
            />
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
          {currentStep === 1 && (
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              Verify Loop Coverage →
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
