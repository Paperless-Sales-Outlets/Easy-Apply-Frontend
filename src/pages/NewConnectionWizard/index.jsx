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
import { motion, AnimatePresence } from 'framer-motion';
import { FiAlertTriangle, FiX, FiWifi, FiArrowRight, FiMapPin } from 'react-icons/fi';
import { ALTERNATIVE_PACKAGES } from '../../services/ossService';

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
  latitude: null,
  longitude: null,
  gpsCoordinates: null,
};

const NEXT_LABEL = {
  location: 'Verify Loop Coverage →',
  identity: 'Continue to Signature →',
  signature: 'Continue to Review →',
  review: 'Continue to Payment →',
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
      } else {
        // Fallback default: 300 Mbps Fibre Broadband to test Fiber connection flow
        const defaultFibre = {
          _id: 'prod-2',
          productId: 'prod-2',
          name: '300 Mbps Fibre Broadband',
          productName: '300 Mbps Fibre Broadband',
          category: 'Fibre Broadband',
          monthlyPrice: 5499,
          installationFee: 0,
          speed: '300 Mbps',
        };
        setSelectedProduct(defaultFibre);
      }
    }
  }, [location.state]);

  const [stepIndex, setStepIndex] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [showAreaModal, setShowAreaModal] = useState(false);
  const [unavailableCity] = useState(null);
  const [formData, dispatch] = useReducer(formReducer, initialState);
  // Flow: location → loop check → NIC & selfie → signature → review → PayHere.
  // The loop check runs automatically, so it shares the "Location" stepper slot.
  const STEPS = ['location', 'loop', 'identity', 'signature', 'review', 'payment'];
  const STEPPER = ['Installation Location', 'NIC & Selfie', 'Digital Signature', 'Review', 'Payment'];
  const step = STEPS[stepIndex];
  const stepperStep = stepIndex <= 1 ? 1 : stepIndex;

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
    setStepIndex((i) => Math.min(i + 1, STEPS.length - 1));
    window.scrollTo(0, 0);
  };
  const prevStep = () => {
    setStepIndex((i) => Math.max(i - 1, 0));
    window.scrollTo(0, 0);
  };
  const goTo = (key) => {
    setStepIndex(STEPS.indexOf(key));
    window.scrollTo(0, 0);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitError('');

    if (step === 'location') {
      let activeAddress = formData.installAddress || formData.address;
      if ((!activeAddress || activeAddress.trim().length === 0) && formData.city) {
        activeAddress = `${formData.city}, ${formData.district || 'Sri Lanka'}`;
        dispatch({
          type: 'SET_FIELDS',
          payload: { installAddress: activeAddress, address: activeAddress },
        });
      }
      if (!activeAddress || activeAddress.trim().length === 0) {
        toast.error('Please specify an installation address or choose your city.');
        return;
      }

    }
    if (step === 'identity' && !identityRef.current?.validate()) return;
    if (step === 'signature' && !declarationRef.current?.validate()) return;

    nextStep();
  };

  const handleModalSwitchLTE = () => {
    const ltePackage = ALTERNATIVE_PACKAGES?.LTE?.[0] || {
      _id: 'prod-4', productId: 'prod-4', name: 'LTE Home 150 GB',
      productName: 'LTE Home 150 GB', category: 'LTE Home',
      speed: 'Up to 100 Mbps', monthlyPrice: 3999, installationFee: 2500,
    };
    setSelectedProduct(ltePackage);
    try { localStorage.setItem('selectedProduct', JSON.stringify(ltePackage)); } catch (e) {}
    dispatch({ type: 'UPDATE_FIELD', payload: { name: 'otherBroadbandPackage', value: `${ltePackage.productName} (Qty: 1)` } });
    setShowAreaModal(false);
    toast.success('Switched to 4G LTE Home Broadband — continuing your application.', { icon: '📶' });
    nextStep();
  };

  const handleModalGoBack = () => {
    setShowAreaModal(false);
  };

  const discontinueFibreRegistration = () => {
    localStorage.removeItem('selectedProduct');
    sessionStorage.removeItem('selectedProduct');
    navigate('/new-connection/products', { replace: true });
  };

  // Final step of the journey: empty the basket and land on the tracking page.
  const goToTracking = async (ref) => {
    await clearSessionCart();
    navigate(`/check-status?ref=${encodeURIComponent(ref)}`, {
      replace: true,
      state: { ref, justSubmitted: true },
    });
  };

  // Real submission — fired after payment succeeds
  const submitApplication = async (paymentRef, phoneOverride) => {
    const authUser = getAuthUser();
    const phone = phoneOverride || verifiedMobile || formData.mobileNumber || authUser?.phone || '';
    const nic = formData.nic || authUser?.NIC || authUser?.nic || '';
    const nameFull = formData.nameFull || authUser?.name || 'Customer';

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
          paymentReference: paymentRef,
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

  const MAP_TO_6_STEP = {
    location: 1,
    loop: 1,
    identity: 2,
    signature: 3,
    payment: 4,
    review: 5,
  };
  const active6Step = MAP_TO_6_STEP[step] || 1;

  const handleStepClick = (targetStepNumber) => {
    // Map target 1..6 step back to internal step key index
    const REVERSE_MAP = {
      1: 0, // location
      2: 2, // identity
      3: 3, // signature
      4: 5, // payment
      5: 4, // review
    };
    const targetIndex = REVERSE_MAP[targetStepNumber];
    if (targetIndex !== undefined) {
      if (targetIndex < stepIndex) {
        setStepIndex(targetIndex);
        window.scrollTo(0, 0);
      } else if (targetIndex > stepIndex) {
        toast.error('Please complete the current step before proceeding.');
      }
    }
  };

  return (
    <div className="card" style={{ padding: '2.5rem 2.75rem', width: '100%', margin: '0 auto', borderRadius: '24px', boxShadow: '0 12px 36px rgba(11, 45, 91, 0.08)' }}>
      {/* 6-Step Navigation Bar starting from 4th point with bubbling effect */}
      <WizardStepper currentStep={active6Step} onStepClick={handleStepClick} />

      {selectedProduct && (
        <div
          style={{
            backgroundColor: '#f0f7ff',
            border: '1.5px solid #bfdbfe',
            borderRadius: '16px',
            padding: '1rem 1.35rem',
            marginBottom: '1.75rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '0.75rem',
          }}
        >
          <div>
            <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#0f57a8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Selected Package</span>
            <h4 style={{ margin: '0.15rem 0 0 0', fontSize: '1.1rem', fontWeight: 800, color: '#0f172a' }}>
              {selectedProduct.productName}
            </h4>
          </div>
          <div style={{ display: 'flex', gap: '1.25rem', fontSize: '0.9rem', color: '#334155' }}>
            <span>Monthly: <strong style={{ color: '#0f57a8' }}>Rs. {(selectedProduct.monthlyPrice || 0).toLocaleString()}</strong></span>
            <span>Installation: <strong>Rs. {(selectedProduct.installationFee || 2500).toLocaleString()}</strong></span>
            {selectedProduct.quantity > 1 && <span>Qty: <strong>{selectedProduct.quantity}</strong></span>}
          </div>
        </div>
      )}

      <ExistingCustomerSummaryBox customerData={selectedAccount} customerExists={customerExists} />

      <form onSubmit={handleSubmit}>
        <div style={{ minHeight: '300px', marginBottom: '2rem' }}>
          {step === 'location' && (
            <CustomerInfoStep
              formData={formData}
              handleChange={handleChange}
              setFields={(fields) => dispatch({ type: 'SET_FIELDS', payload: fields })}
              selectedProduct={selectedProduct}
            />
          )}

          {step === 'loop' && (
            <LoopCheckStep
              formData={formData}
              selectedProduct={selectedProduct}
              onSelectAlternativeProduct={(newProd) => {
                setSelectedProduct(newProd);
                try {
                  localStorage.setItem('selectedProduct', JSON.stringify(newProd));
                } catch (e) {}
                dispatch({
                  type: 'UPDATE_FIELD',
                  payload: {
                    name: 'otherBroadbandPackage',
                    value: `${newProd.name || newProd.productName} (Qty: 1)`,
                  },
                });
              }}
              onAvailable={nextStep}
              onGoBack={prevStep}
              onDiscontinue={discontinueFibreRegistration}
            />
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

          {step === 'review' && (
            <ReviewStep
              formData={formData}
              selectedProduct={selectedProduct}
              goTo={goTo}
              onEditCart={() => navigate('/cart')}
            />
          )}

          {step === 'payment' && (
            <PaymentStep
              isActive
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

        <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1.5px solid #e2e8f0', paddingTop: '1.5rem' }}>
          <button type="button" className="btn btn-secondary" onClick={() => (step === 'identity' ? goTo('location') : prevStep())} disabled={stepIndex === 0 || submitting}>
            ← Back
          </button>
          {NEXT_LABEL[step] && (
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {NEXT_LABEL[step]}
            </button>
          )}
        </div>
      </form>

      {/* ── Area Not Available Modal — fires when Next is clicked with non-Colombo + Fibre ── */}
      <AnimatePresence>
        {showAreaModal && (
          <div
            style={{
              position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
              backgroundColor: 'rgba(15, 23, 42, 0.72)',
              backdropFilter: 'blur(14px)', WebkitBackdropFilter: 'blur(14px)',
              zIndex: 99999,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              padding: '1.25rem',
            }}
            onClick={handleModalGoBack}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.88, y: 24 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.88, y: 24 }}
              transition={{ duration: 0.28, ease: 'easeOut' }}
              onClick={(e) => e.stopPropagation()}
              style={{
                backgroundColor: '#ffffff',
                borderRadius: '24px',
                maxWidth: '540px',
                width: '100%',
                boxShadow: '0 30px 60px -10px rgba(0,0,0,0.45)',
                border: '1.5px solid #fed7aa',
                overflow: 'hidden',
                display: 'flex', flexDirection: 'column',
              }}
            >
              {/* Header */}
              <div style={{
                background: 'linear-gradient(135deg, #ea580c 0%, #b91c1c 100%)',
                padding: '1.75rem 2rem 1.5rem',
                color: '#ffffff', position: 'relative',
              }}>
                <button
                  type="button" onClick={handleModalGoBack}
                  style={{
                    position: 'absolute', top: '1rem', right: '1rem',
                    background: 'rgba(255,255,255,0.18)', border: 'none',
                    borderRadius: '50%', width: '34px', height: '34px',
                    display: 'grid', placeItems: 'center',
                    cursor: 'pointer', color: '#fff',
                  }}
                >
                  <FiX size={18} />
                </button>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', marginBottom: '0.65rem' }}>
                  <div style={{
                    width: '50px', height: '50px', borderRadius: '14px',
                    backgroundColor: 'rgba(255,255,255,0.2)',
                    display: 'grid', placeItems: 'center', flexShrink: 0,
                  }}>
                    <FiAlertTriangle size={26} color="#fff" />
                  </div>
                  <div>
                    <span style={{
                      display: 'inline-block',
                      backgroundColor: 'rgba(255,255,255,0.25)',
                      padding: '0.18rem 0.6rem', borderRadius: '9999px',
                      fontSize: '0.7rem', fontWeight: 800,
                      letterSpacing: '0.5px', textTransform: 'uppercase',
                      marginBottom: '0.25rem',
                    }}>Demo Feasibility Notice</span>
                    <h2 style={{ margin: 0, fontSize: '1.3rem', fontWeight: 900, lineHeight: 1.25 }}>
                      Fibre Loop Not Available in {unavailableCity?.city || formData.city}
                    </h2>
                  </div>
                </div>

                <p style={{ margin: 0, fontSize: '0.87rem', color: 'rgba(255,255,255,0.9)', lineHeight: 1.5, fontWeight: 500 }}>
                  In this demo version, active Fibre loops are only provisioned across{' '}
                  <strong style={{ color: '#fff' }}>Colombo areas</strong>. Fibre loop service is
                  not available for <strong style={{ color: '#fff' }}>{unavailableCity?.city || formData.city}</strong>.
                </p>
              </div>

              {/* Body */}
              <div style={{ padding: '1.5rem 1.75rem' }}>
                {/* LTE offer card */}
                <div style={{
                  backgroundColor: '#fff7ed', border: '1.5px solid #fed7aa',
                  borderRadius: '16px', padding: '1.1rem', marginBottom: '1.25rem',
                }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                    <div style={{
                      backgroundColor: '#ea580c', color: '#fff',
                      borderRadius: '10px', width: '34px', height: '34px',
                      display: 'grid', placeItems: 'center', flexShrink: 0,
                    }}>
                      <FiWifi size={18} />
                    </div>
                    <div>
                      <h4 style={{ margin: '0 0 0.25rem', fontSize: '0.95rem', fontWeight: 800, color: '#9a3412' }}>
                        Would you like to switch to 4G LTE Home Broadband instead?
                      </h4>
                      <p style={{ margin: 0, fontSize: '0.83rem', color: '#7c2d12', lineHeight: 1.5 }}>
                        High-speed <strong>4G LTE Home Broadband</strong> is available at your
                        location — instant plug-and-play, no cable drilling required.
                      </p>
                    </div>
                  </div>

                  {/* Package snippet */}
                  <div style={{
                    marginTop: '0.85rem', padding: '0.7rem 0.95rem',
                    backgroundColor: '#fff', borderRadius: '12px',
                    border: '1px solid #fed7aa',
                    display: 'flex', alignItems: 'center',
                    justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem',
                  }}>
                    <div>
                      <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#0f172a' }}>LTE Home 150 GB</div>
                      <div style={{ fontSize: '0.76rem', color: '#64748b', fontWeight: 600 }}>Up to 100 Mbps · Plug &amp; Play Router</div>
                    </div>
                    <div style={{ fontSize: '1rem', fontWeight: 900, color: '#ea580c' }}>
                      Rs. 3,999<span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600 }}>/mo</span>
                    </div>
                  </div>
                </div>

                {/* Action buttons */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                  <button
                    type="button"
                    onClick={handleModalSwitchLTE}
                    style={{
                      backgroundColor: '#ea580c', color: '#fff', border: 'none',
                      borderRadius: '14px', padding: '0.95rem 1.25rem',
                      fontSize: '0.97rem', fontWeight: 800, cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      gap: '0.55rem',
                      boxShadow: '0 6px 20px rgba(234,88,12,0.35)',
                    }}
                  >
                    <FiWifi size={18} />
                    <span>Yes, Switch to 4G LTE &amp; Continue</span>
                    <FiArrowRight size={17} />
                  </button>

                  <button
                    type="button"
                    onClick={handleModalGoBack}
                    style={{
                      backgroundColor: '#f8fafc', color: '#334155',
                      border: '1.5px solid #cbd5e1',
                      borderRadius: '14px', padding: '0.85rem 1.25rem',
                      fontSize: '0.91rem', fontWeight: 700, cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      gap: '0.5rem',
                    }}
                  >
                    <FiMapPin size={16} color="#0f57a8" />
                    <span>No, Go Back &amp; Choose a Colombo Area</span>
                  </button>
                </div>

                <p style={{ margin: '0.9rem 0 0', fontSize: '0.76rem', color: '#94a3b8', textAlign: 'center', fontWeight: 500 }}>
                  Demo only: Fibre loop provisioning is active across all Colombo district areas.
                </p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
