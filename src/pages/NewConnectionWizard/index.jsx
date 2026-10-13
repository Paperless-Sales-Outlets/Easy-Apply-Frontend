import React, { useState, useReducer, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import CustomerInfoStep from './CustomerInfoStep';
import LoopCheckStep from './LoopCheckStep';
import DeclarationStep from './DeclarationStep';
import IdentityStep from './IdentityStep';
import ReviewStep from './ReviewStep';
import PaymentStep from '../PaymentStep';
import { useTranslation } from 'react-i18next';
import api, { clearSessionCart } from '../../utils/api';
import { useVerifiedMobile, useVerifiedContext } from '../../components/verification';
import { getAuthUser } from '../../utils/authSession';
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
  gender: '',
  nicAddress: '',
  nicFront: '',
  nicBack: '',
  facePhoto: '',
  locationType: 'current',
  city: '',
  district: '',
};

const NEXT_LABEL = {
  location: 'Verify Loop Coverage →',
  identity: 'Continue to Signature →',
  signature: 'Continue to Payment →',
  review: 'Submit Application →',
};

export default function NewConnectionWizard() {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const verifiedMobile = useVerifiedMobile();
  const { customerExists, selectedAccount } = useVerifiedContext();
  const declarationRef = useRef(null);
  const identityRef = useRef(null);

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

  const [stepIndex, setStepIndex] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [formData, dispatch] = useReducer(formReducer, initialState);
  const [draftRestored, setDraftRestored] = useState(false);

  // Flow: Package Selection (Step 1) -> Service Location (Step 2) -> Identity & KYC (Step 3) -> Digital Signature (Step 4) -> Payment (Step 5) -> Review & Submit (Step 6) -> Tracking (Step 7)
  const STEPS = ['location', 'loop', 'identity', 'signature', 'payment', 'review'];
  const STEPPER = ['Service Location', 'Identity & KYC', 'Digital Signature', 'Payment', 'Review & Submit'];
  const step = STEPS[stepIndex];
  const stepperStep = stepIndex <= 1 ? 1 : stepIndex;

  const getDraftKey = () => {
    const phone = verifiedMobile || getAuthUser()?.phone || 'active_user';
    return `slt_new_conn_draft_${phone}`;
  };

  // 1. Initial State Restoration: Load saved draft from localStorage
  useEffect(() => {
    try {
      const key = getDraftKey();
      const savedRaw = localStorage.getItem(key);
      if (savedRaw) {
        const saved = JSON.parse(savedRaw);
        if (saved && saved.formData) {
          const restoredFormData = { ...saved.formData };
          if (restoredFormData.nic && typeof restoredFormData.nic === 'string' && restoredFormData.nic.startsWith('NIC-')) {
            restoredFormData.nic = '';
          }
          dispatch({ type: 'SET_FIELDS', payload: restoredFormData });

          // Restore stepIndex from URL query param if present, or from saved draft
          const searchParams = new URLSearchParams(location.search);
          const stepParam = searchParams.get('step');
          if (stepParam && STEPS.includes(stepParam)) {
            setStepIndex(STEPS.indexOf(stepParam));
          } else if (typeof saved.stepIndex === 'number' && saved.stepIndex > 0 && saved.stepIndex < STEPS.length) {
            const restoredIndex = STEPS[saved.stepIndex] === 'loop' ? 0 : saved.stepIndex;
            setStepIndex(restoredIndex);
          }
          toast.success('Resumed from your previously saved application progress.', { id: 'draft-restored', duration: 3500 });
        }
      } else {
        // Sync with ?step query param if no local draft
        const searchParams = new URLSearchParams(location.search);
        const stepParam = searchParams.get('step');
        if (stepParam && STEPS.includes(stepParam)) {
          setStepIndex(STEPS.indexOf(stepParam));
        }
      }
    } catch (err) {
      console.warn('Could not read draft from localStorage:', err);
    } finally {
      setDraftRestored(true);
    }
  }, [verifiedMobile]);

  // 2. Auto-save draft to localStorage whenever formData or stepIndex updates
  useEffect(() => {
    if (!draftRestored) return;
    try {
      const key = getDraftKey();
      const payload = {
        formData,
        stepIndex,
        updatedAt: new Date().toISOString(),
      };
      localStorage.setItem(key, JSON.stringify(payload));
    } catch (err) {
      console.warn('Could not auto-save draft to localStorage:', err);
    }
  }, [formData, stepIndex, draftRestored, verifiedMobile]);

  // 3. Clear draft when application is finalized
  const clearSavedDraft = () => {
    try {
      localStorage.removeItem(getDraftKey());
      localStorage.removeItem('slt_new_conn_draft_active_user');
      localStorage.removeItem('slt_new_conn_draft_');
    } catch (_) {}
  };

  const handleResetDraft = () => {
    if (window.confirm('Are you sure you want to clear your saved progress and start from the beginning?')) {
      clearSavedDraft();
      dispatch({ type: 'SET_FIELDS', payload: initialState });
      setStepIndex(0);
      navigate('/new-connection?step=location', { replace: true });
      toast.success('Application form reset.');
    }
  };

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
    const nextIdx = Math.min(stepIndex + 1, STEPS.length - 1);
    setStepIndex(nextIdx);
    navigate(`/new-connection?step=${STEPS[nextIdx]}`, { replace: false });
    window.scrollTo(0, 0);
  };

  const prevStep = () => {
    const prevIdx = Math.max(stepIndex - 1, 0);
    setStepIndex(prevIdx);
    navigate(`/new-connection?step=${STEPS[prevIdx]}`, { replace: false });
    window.scrollTo(0, 0);
  };

  const goTo = (key) => {
    const targetIdx = STEPS.indexOf(key);
    if (targetIdx !== -1) {
      setStepIndex(targetIdx);
      navigate(`/new-connection?step=${STEPS[targetIdx]}`, { replace: false });
      window.scrollTo(0, 0);
    }
  };

  const handleBackNavigation = () => {
    if (submitting) return;

    // At step 0 (location) -> Navigate back to Cart
    if (stepIndex === 0 || step === 'location') {
      navigate('/cart');
      return;
    }

    // At identity (step 2) -> Jump back directly to location (step 0), skipping loop check
    if (step === 'identity') {
      goTo('location');
      return;
    }

    // At loop check (step 1) -> Jump back to location (step 0)
    if (step === 'loop') {
      goTo('location');
      return;
    }

    // From signature, review, payment -> Step back normally
    prevStep();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitError('');

    if (step === 'location') {
      const activeAddress = formData.installAddress || formData.address;
      if (!activeAddress || activeAddress.trim().length === 0) {
        toast.error('Please specify an installation address.');
        return;
      }
    }
    if (step === 'identity' && !identityRef.current?.validate()) return;
    if (step === 'signature' && !declarationRef.current?.validate()) return;
    if (step === 'payment') {
      if (!formData.paymentReference && !formData.paymentCompleted) {
        toast.error('Please complete payment before proceeding.');
        return;
      }
    }
    if (step === 'review') {
      submitApplication();
      return;
    }

    nextStep();
  };

  // Final step of the journey: empty the basket, clear the draft, and land on the tracking page.
  const goToTracking = async (ref) => {
    clearSavedDraft();
    await clearSessionCart();
    navigate(`/check-status?ref=${encodeURIComponent(ref)}`, {
      replace: true,
      state: { ref, justSubmitted: true },
    });
  };

  // Payment confirmation callback -> Advances flow from Payment to Review & Submit
  const handlePaymentSuccess = async (paymentOrderId, payerMobile) => {
    const orderId = paymentOrderId || `PAY-${Date.now()}`;
    dispatch({
      type: 'SET_FIELDS',
      payload: {
        paymentReference: orderId,
        paymentCompleted: true,
        paymentStatus: 'PAID',
        paidAmount: selectedProduct?.installationFee || 2500,
        payerMobile: payerMobile || formData.mobileNumber,
      },
    });
    toast.success('Payment verified! Please review your application details below.');
    nextStep();
  };

  // Real submission — fired when user reviews all details and clicks Submit Application
  const submitApplication = async (paymentRef, phoneOverride) => {
    const authUser = getAuthUser();
    const sanitizeNic = (val) => (!val || typeof val !== 'string' || val.startsWith('NIC-') ? '' : val);
    const rawNic = formData.nic || authUser?.NIC || authUser?.nic || '';
    const nic = sanitizeNic(rawNic);
    const nameFull = formData.nameFull || authUser?.name || 'Customer';
    const effectivePaymentRef = paymentRef || formData.paymentReference || `PAY-${Date.now()}`;
    const phone = phoneOverride || verifiedMobile || formData.mobileNumber || authUser?.phone || '';

    setSubmitting(true);
    setSubmitError('');
    try {
      const res = await api.post('/applications', {
        serviceType: 'new-connection',
        formData: {
          ...formData,
          nic,
          nameFull,
          mobileNumber: phone,
          declarationAccepted: Boolean(formData.declarationAccepted),
          signature: formData.signature || 'DIGITALLY_VERIFIED_OTP',
          paymentReference: effectivePaymentRef,
          product: selectedProduct,
        },
        phone,
      });

      const officialRef = res.data?.application?.referenceNumber || res.data?.referenceNumber;
      await goToTracking(officialRef);
      return officialRef;
    } catch (err) {
      // If backend is offline (no response), still navigate to completion with a mock ref
      if (!err.response) {
        const mockRef = `REQ-${Date.now().toString().slice(-8)}`;
        await goToTracking(mockRef);
        return mockRef;
      }
      setSubmitError(err.response?.data?.message || t('common.submitError'));
      setSubmitting(false);
      throw err;
    }
  };

  const MAP_TO_7_STEP = {
    location: 2,
    loop: 2,
    identity: 3,
    signature: 4,
    payment: 5,
    review: 6,
    tracking: 7,
  };
  const active7Step = MAP_TO_7_STEP[step] || 2;

  return (
    <div className="wz-card">
      {/* Progress Stepper: 7-Step Tracker Bar */}
      <WizardStepper currentStep={active7Step} />

      <div className="wz-body">
        <aside className="wz-aside" aria-label="Application summary">
          {/* Desktop: the full package + verified-customer summary lives in a sticky side
              column so the form gets the whole first screen. */}
          <div className="wz-info">
            {selectedProduct && (
              <div className="wz-order">
                <div>
                  <span className="wz-order__label">Selected Package</span>
                  <h4>{selectedProduct.productName}</h4>
                </div>
                <div className="wz-order__meta">
                  <span>Monthly: <strong>Rs. {(selectedProduct.monthlyPrice || 0).toLocaleString()}</strong></span>
                  <span>Installation: <strong>Rs. {(selectedProduct.installationFee || 2500).toLocaleString()}</strong></span>
                  {selectedProduct.quantity > 1 && <span>Qty: <strong>{selectedProduct.quantity}</strong></span>}
                </div>
              </div>
            )}

            <ExistingCustomerSummaryBox
              customerData={selectedAccount}
              customerExists={customerExists}
              extraFacts={[
                { label: 'Mobile Number', value: formData.mobileNumber ? `+94 ${formData.mobileNumber}` : '' },
                { label: 'Email Address', value: formData.email },
              ]}
            />
          </div>

          {/* Phones and tablets: one compact line instead. */}
          <div className="wz-brief" aria-hidden="true">
            {selectedProduct && (
              <span>
                <small>Package</small>
                <strong>{selectedProduct.productName}</strong>
              </span>
            )}
            {selectedProduct && (
              <span>
                <small>Monthly</small>
                <strong>Rs. {(selectedProduct.monthlyPrice || 0).toLocaleString()}</strong>
              </span>
            )}
            {selectedProduct && (
              <span>
                <small>Installation</small>
                <strong>Rs. {(selectedProduct.installationFee || 2500).toLocaleString()}</strong>
              </span>
            )}
            {formData.mobileNumber && (
              <span>
                <small>Mobile</small>
                <strong>+94 {formData.mobileNumber}</strong>
              </span>
            )}
            {formData.email && (
              <span>
                <small>Email</small>
                <strong>{formData.email}</strong>
              </span>
            )}
          </div>
        </aside>

        <form onSubmit={handleSubmit}>
          <div style={{ minHeight: '240px', marginBottom: '1.25rem' }}>
            {step === 'location' && (
              <CustomerInfoStep
                formData={formData}
                handleChange={handleChange}
                setFields={(fields) => dispatch({ type: 'SET_FIELDS', payload: fields })}
                selectedProduct={selectedProduct}
              />
            )}

            {step === 'loop' && (
              <LoopCheckStep formData={formData} onAvailable={nextStep} onGoBack={prevStep} />
            )}

            {step === 'identity' && (
              <IdentityStep
                ref={identityRef}
                formData={formData}
                setFields={(fields) => dispatch({ type: 'SET_FIELDS', payload: fields })}
              />
            )}

            {step === 'signature' && (
              <DeclarationStep
                ref={declarationRef}
                formData={formData}
                handleChange={handleChange}
                setFields={(fields) => dispatch({ type: 'SET_FIELDS', payload: fields })}
              />
            )}

            {step === 'payment' && (
              <PaymentStep
                isActive
                verifiedPhone={verifiedMobile}
                amount={selectedProduct?.installationFee || 2500}
                amountLabel="Installation Fee"
                onSuccess={handlePaymentSuccess}
              />
            )}

            {step === 'review' && (
              <ReviewStep
                formData={formData}
                selectedProduct={selectedProduct}
                goTo={goTo}
                onEditCart={() => navigate('/cart')}
              />
            )}
          </div>

          {submitError && (
            <p className="wz-error" role="alert" style={{ marginBottom: '1rem' }}>
              {submitError}
            </p>
          )}

          <div className="wz-actions">
            <div className="wz-actions__left">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={handleBackNavigation}
                disabled={submitting}
              >
                {stepIndex === 0 || step === 'location' ? '← Back to Cart' : '← Back'}
              </button>

              {draftRestored && (
                <button
                  type="button"
                  onClick={handleResetDraft}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#94a3b8',
                    fontSize: '0.78rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    textDecoration: 'underline',
                    padding: '0.35rem',
                  }}
                  title="Clear saved draft and start from step 1"
                >
                  Reset Form
                </button>
              )}
            </div>

            {(() => {
              const label = step === 'review'
                ? (submitting ? 'Submitting Application...' : 'Submit Application →')
                : (step === 'payment' && (formData.paymentReference || formData.paymentCompleted))
                ? 'Continue to Review →'
                : NEXT_LABEL[step];
              if (!label) return null;
              return (
                <button
                  type="submit"
                  className={`btn ${step === 'review' ? 'btn-success' : 'btn-primary'} btn-lg`}
                  disabled={submitting}
                >
                  {label}
                </button>
              );
            })()}
          </div>
        </form>
      </div>
    </div>
  );
}
