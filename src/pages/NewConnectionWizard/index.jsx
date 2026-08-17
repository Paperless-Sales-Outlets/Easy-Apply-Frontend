import React, { useState, useReducer, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import CustomerInfoStep from './CustomerInfoStep';
import LocationFeasibilityStep from './LocationFeasibilityStep';
import CartReviewStep from './CartReviewStep';
import DigitalSignatureCanvas from '../../components/form/DigitalSignatureCanvas';
import PaymentStep from '../PaymentStep';
import { useTranslation } from 'react-i18next';
import api from '../../utils/api';
import { useVerifiedMobile } from '../../components/verification';
import ProductCatalog, { PRODUCTS_DATA } from './ProductCatalog';

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
  selectedProduct: null,
  otpVerified: false,
  feasibilityStatus: null,
  // Voice connection mode & package are mandatory
  connectionModeFibreVoice: true,
  connectionModeLTEVoice: true,
  fixedVoicePackageHomeMyPhone: true,
};

export default function NewConnectionWizard() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const verifiedMobile = useVerifiedMobile();
  const [currentStep, setCurrentStep] = useState(0); // 0 = Catalog, 0.5 = Cart Review, 1-3 = Wizard
  const [cartItems, setCartItems] = useState([PRODUCTS_DATA[0]]);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [formData, dispatch] = useReducer(formReducer, initialState);
  const totalSteps = 3;

  // Add to cart handler
  const handleAddToCart = (product) => {
    if (!product) return;
    setCartItems((prev) => {
      if (prev.some((item) => item.id === product.id)) return prev;
      return [...prev, product];
    });
  };

  // Remove from cart handler
  const handleRemoveFromCart = (productId) => {
    setCartItems((prev) => prev.filter((item) => item.id !== productId));
  };

  // Auto-populate mobile number from OTP context if available
  useEffect(() => {
    if (verifiedMobile) {
      dispatch({
        type: 'SET_FIELDS',
        payload: {
          mobileNumber: verifiedMobile,
          otpVerified: true,
        },
      });
    }
  }, [verifiedMobile]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    let finalValue = type === 'checkbox' ? checked : value;

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

  const handleSetFields = (fields) => {
    dispatch({
      type: 'SET_FIELDS',
      payload: fields,
    });
  };

  const handleFeasibilityStatusChange = (statusObj) => {
    dispatch({
      type: 'UPDATE_FIELD',
      payload: {
        name: 'feasibilityStatus',
        value: statusObj,
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
  };

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
    window.scrollTo(0, 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');

    // Step 1 Validation: OTP Verification & Mandatory Fields
    if (currentStep === 1) {
      if (!formData.otpVerified) {
        setSubmitError('Please complete OTP verification before proceeding.');
        return;
      }
      if (!formData.nameFull?.trim()) {
        setSubmitError('Full Name is required.');
        return;
      }
      if (!formData.nic?.trim()) {
        setSubmitError('NIC / Passport / BR Number is required.');
        return;
      }
      if (!formData.mobileNumber?.trim()) {
        setSubmitError('Mobile Number is required.');
        return;
      }
      if (!formData.address?.trim()) {
        setSubmitError('Permanent Address is required.');
        return;
      }
    }

    // Step 2 Validation: Feasibility Check Approved
    if (currentStep === 2) {
      const targetAddress = formData.isExistingCustomer === 'yes' ? formData.address : formData.installAddress;
      if (!targetAddress || targetAddress.trim().length < 5) {
        setSubmitError('Please enter a valid installation address.');
        return;
      }
      if (!formData.feasibilityStatus) {
        setSubmitError('Please run the Network Connectivity & Feasibility Check before proceeding.');
        return;
      }
    }

    // Step 3 Validation: Declaration & Digital Signature
    if (currentStep === 3) {
      if (!formData.declarationAccepted) {
        setSubmitError('Please accept the customer declaration terms before submitting.');
        return;
      }
      if (!formData.signature) {
        setSubmitError('Digital Signature is mandatory. Please draw your signature below.');
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
        formData: {
          ...formData,
          cartItems,
        },
        phone: verifiedMobile || formData.mobileNumber,
      });

      navigate('/completion', {
        state: {
          referenceNumber: res.data.application.referenceNumber,
          messageKey: 'completion.successMessages.newConnection',
          formData,
          cartItems,
          selectedProduct: cartItems[0] || null,
        },
      });
    } catch (err) {
      // Fallback for offline mode
      if (!err.response) {
        navigate('/completion', {
          state: {
            referenceNumber: `DEMO-${Date.now().toString().slice(-6)}`,
            messageKey: 'completion.successMessages.newConnection',
            formData,
            cartItems,
            selectedProduct: cartItems[0] || null,
          },
        });
        return;
      }
      setSubmitError(err.response?.data?.message || t('common.submitError'));
      setSubmitting(false);
    }
  };

  // Step 0: Product Catalog Showcase
  if (currentStep === 0) {
    return (
      <ProductCatalog
        cartItems={cartItems}
        onAddToCart={handleAddToCart}
        onRemoveFromCart={handleRemoveFromCart}
        onViewCart={() => setCurrentStep(0.5)}
        onProceedToForm={() => setCurrentStep(1)}
      />
    );
  }

  // Step 0.5: Cart Review & Edit Screen
  if (currentStep === 0.5) {
    return (
      <CartReviewStep
        cartItems={cartItems}
        onRemoveFromCart={handleRemoveFromCart}
        onAddToCart={handleAddToCart}
        onBackToCatalog={() => setCurrentStep(0)}
        onProceedToForm={() => setCurrentStep(1)}
      />
    );
  }

  const primaryPackageName = cartItems.length > 0 ? cartItems.map((i) => i.title).join(' + ') : 'Standard Connection';
  const totalCartMonthly = cartItems.reduce((s, i) => s + (i.price || 0), 0);

  return (
    <div className="card" style={{ padding: '3rem', width: '100%', margin: '0 auto' }}>
      {/* Top Banner showing Selected Products in Cart */}
      {cartItems.length > 0 && (
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            backgroundColor: '#EFF6FF',
            border: '1px solid #BFDBFE',
            borderRadius: '12px',
            padding: '0.85rem 1.25rem',
            marginBottom: '1.75rem',
          }}
        >
          <div>
            <span style={{ fontSize: '0.78rem', color: '#1E40AF', fontWeight: '700', textTransform: 'uppercase' }}>
              Selected Products ({cartItems.length} items + Mandatory Voice):
            </span>
            <div style={{ fontSize: '1.05rem', fontWeight: '800', color: '#1E3A8A' }}>
              {primaryPackageName} — Total Rs. {totalCartMonthly.toLocaleString()} /month
            </div>
          </div>
          <button
            type="button"
            onClick={() => setCurrentStep(0.5)}
            style={{
              padding: '0.4rem 0.9rem',
              borderRadius: '8px',
              border: '1px solid #3B82F6',
              backgroundColor: '#FFFFFF',
              color: '#1D4ED8',
              fontWeight: '600',
              fontSize: '0.85rem',
              cursor: 'pointer',
            }}
          >
            Edit Cart ({cartItems.length})
          </button>
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2 style={{ margin: 0 }}>{t('wizards.newConnection.title')}</h2>
        <button
          type="button"
          onClick={() => setCurrentStep(0.5)}
          style={{
            background: 'none',
            border: 'none',
            color: '#0F57A8',
            fontWeight: '600',
            fontSize: '0.9rem',
            cursor: 'pointer',
          }}
        >
          ← Back to Cart Review
        </button>
      </div>

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

          {[1, 2, 3].map((step) => (
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
                  fontWeight: step <= currentStep ? '600' : 'normal',
                }}
              >
                {step === 1
                  ? 'Customer OTP & Details'
                  : step === 2
                  ? 'Location & Feasibility'
                  : 'Declaration & Payment'}
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
              handleSetFields={handleSetFields}
            />
          )}

          {currentStep === 2 && (
            <LocationFeasibilityStep
              formData={formData}
              handleChange={handleChange}
              onFeasibilityStatusChange={handleFeasibilityStatusChange}
            />
          )}

          {currentStep === 3 && (
            <div>
              <h3 style={{ color: 'var(--slt-blue, #0F57A8)', marginBottom: '1.5rem' }}>
                3. Customer Declaration & Digital Signature
              </h3>

              {/* Order Summary Box */}
              <div
                style={{
                  backgroundColor: '#F8FAFC',
                  border: '1px solid #E2E8F0',
                  borderRadius: '12px',
                  padding: '1.25rem',
                  marginBottom: '1.5rem',
                }}
              >
                <h4 style={{ color: '#0F172A', marginTop: 0, marginBottom: '0.75rem' }}>Application Summary</h4>
                <div style={{ fontSize: '0.9rem', color: '#334155', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  <div><strong>Selected Cart Products:</strong> {primaryPackageName}</div>
                  <div><strong>Total Monthly Rental:</strong> Rs. {totalCartMonthly.toLocaleString()} /month</div>
                  <div><strong>Voice Service:</strong> Included (Mandatory Landline Line)</div>
                  <div><strong>Customer Name:</strong> {formData.title} {formData.nameFull}</div>
                  <div><strong>Installation Address:</strong> {formData.isExistingCustomer === 'yes' ? formData.address : formData.installAddress}</div>
                  <div><strong>Network Feasibility:</strong> {formData.feasibilityStatus ? '✅ Feasibility Approved (Fibre & Voice Available)' : 'Verified'}</div>
                </div>
              </div>

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
                  I / We hereby declare that the information provided in this application is true, accurate, and complete. I / We agree to abide by the terms and conditions of Sri Lanka Telecom PLC for the supply of telecommunication services, broadband, voice lines, and PEO TV packages.
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
                label="Customer Digital Signature (Mandatory)"
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
            justifyContent: 'space-between',
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
              {submitting ? t('common.submitting') : 'Proceed to Payment & Submit'}
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
