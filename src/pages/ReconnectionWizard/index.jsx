import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import ReconnectionDetailsStep from './ReconnectionDetailsStep';
import WizardStepper from '../../components/WizardStepper';
import DeclarationStep from './DeclarationStep';
import PaymentStep from '../PaymentStep';
import api from '../../utils/api';
import { useVerifiedMobile, useVerifiedContext } from '../../components/verification';
import ExistingCustomerSummaryBox from '../../components/ExistingCustomerSummaryBox';

export default function ReconnectionWizard() {
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
      const stored = sessionStorage.getItem('selectedProduct');

      if (stored) {
        try {
          setSelectedProduct(JSON.parse(stored));
        } catch (e) {
          console.warn('Failed to parse selected product from sessionStorage:', e);
        }
      }
    }
  }, [location.state]);

  const [currentStep, setCurrentStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [paymentIntention, setPaymentIntention] = useState('online');
  const [reconnectionData, setReconnectionData] = useState(null);

  // The customer's account is already verified via OTP + real DB lookup
  // before reaching this wizard — reuse it instead of asking/looking it up again.
  useEffect(() => {
    if (selectedAccount) setReconnectionData(selectedAccount);
  }, [selectedAccount]);

  const formRef = useRef(null);
  const step2Ref = useRef(null);
  const step3Ref = useRef(null);

  const totalSteps = 3;

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

    if (currentStep < totalSteps) {
      if (
        currentStep === 1 &&
        step2Ref.current &&
        !step2Ref.current.validate()
      ) {
        return;
      }

      if (
        currentStep === 2 &&
        step3Ref.current &&
        !step3Ref.current.validate()
      ) {
        return;
      }

      nextStep();
      return;
    }

    const raw = new FormData(formRef.current);
    const formData = Object.fromEntries(raw.entries());

    // Construct FormData for multipart/form-data submission
    const submitData = new FormData();

    submitData.append('serviceType', 'reconnection');

    // Ensure phone is 10 digits starting with 0
    let formattedPhone = formData.verifiedMobile || verifiedMobile || '';

    if (formattedPhone && formattedPhone.length === 9) {
      formattedPhone = `0${formattedPhone}`;
    }

    submitData.append('phone', formattedPhone);

    delete formData.verifiedMobile;

    // Extract digital signature base64 and delete from JSON formData
    const signatureBase64 = formData.digitalSignatureBase64;

    delete formData.digitalSignatureBase64;
    delete formData.signatureUpload;

    // Send non-file fields as JSON
    submitData.append('formData', JSON.stringify(formData));

    // Append file inputs explicitly
    for (const [key, value] of raw.entries()) {
      if (value instanceof File && value.size > 0) {
        submitData.append(key, value);
      }
    }

    // Convert signature Base64 to Blob and append as file
    if (signatureBase64) {
      try {
        const response = await fetch(signatureBase64);
        const blob = await response.blob();

        const signatureFile = new File(
          [blob],
          'signature.png',
          {
            type: 'image/png',
          }
        );

        submitData.append('signatureDoc', signatureFile);
      } catch (err) {
        console.error(
          'Failed to convert signature to file:',
          err
        );
      }
    }

    setSubmitting(true);
    setSubmitError('');

    try {
      const res = await api.post(
        '/applications',
        submitData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      navigate('/completion', {
        state: {
          referenceNumber:
            res.data.application.referenceNumber,
          messageKey:
            'completion.successMessages.reconnection',
        },
      });
    } catch (err) {
      // Development fallback
      if (!err.response) {
        navigate('/completion', {
          state: {
            referenceNumber: `DEMO-${Date.now()
              .toString()
              .slice(-6)}`,
            messageKey:
              'completion.successMessages.reconnection',
          },
        });

        return;
      }

      setSubmitError(
        err.response?.data?.message ||
          t('common.submitError')
      );

      setSubmitting(false);
    }
  };

  return (
    <div
      className="card"
      style={{
        padding: '3rem',
        width: '100%',
        margin: '0 auto',
      }}
    >
      <h2
        style={{
          marginBottom: selectedProduct
            ? '0.75rem'
            : '1.5rem',
        }}
      >
        {t('wizards.reconnection.title')}
      </h2>

      <ExistingCustomerSummaryBox customerData={selectedAccount} customerExists={customerExists} />

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
            <span
              style={{
                fontSize: '0.75rem',
                fontWeight: 700,
                color: '#0284c7',
                textTransform: 'uppercase',
              }}
            >
              Selected Product
            </span>

            <h4
              style={{
                margin: '0.1rem 0 0 0',
                fontSize: '1.05rem',
                fontWeight: 800,
                color: '#0f172a',
              }}
            >
              {selectedProduct.productName}
            </h4>
          </div>

          <div
            style={{
              display: 'flex',
              gap: '1.25rem',
              fontSize: '0.88rem',
              color: '#334155',
              flexWrap: 'wrap',
            }}
          >
            <span>
              Monthly:{' '}
              <strong style={{ color: '#0056b3' }}>
                Rs.{' '}
                {(
                  selectedProduct.monthlyPrice || 0
                ).toLocaleString()}
              </strong>
            </span>

            <span>
              Installation:{' '}
              <strong>
                Rs.{' '}
                {(
                  selectedProduct.installationFee ||
                  2500
                ).toLocaleString()}
              </strong>
            </span>

            {selectedProduct.quantity > 1 && (
              <span>
                Qty:{' '}
                <strong>
                  {selectedProduct.quantity}
                </strong>
              </span>
            )}
          </div>
        </div>
      )}

      <WizardStepper
        currentStep={currentStep}
        steps={[
          'Existing Account Verification',
          'Details & Documents',
          'Checkout & Auth',
        ]}
      />

      <form
        ref={formRef}
        onSubmit={handleSubmit}
      >
        <div
          style={{
            minHeight: '300px',
            marginBottom: '2rem',
          }}
        >
          {/* STEP 1 */}
          <div
            style={{
              display:
                currentStep === 1
                  ? 'block'
                  : 'none',
            }}
          >
            <ReconnectionDetailsStep
              ref={step2Ref}
              isActive={currentStep === 1}
              reconnectionData={reconnectionData}
            />
          </div>

          {/* STEP 2 */}
          <div
            style={{
              display:
                currentStep === 2
                  ? 'block'
                  : 'none',
            }}
          >
            <DeclarationStep
              ref={step3Ref}
              isActive={currentStep === 2}
              onPaymentIntentionChange={
                setPaymentIntention
              }
              reconnectionData={reconnectionData}
              customerType={
                reconnectionData?.customerType ===
                'office'
                  ? 'Business'
                  : reconnectionData?.customerType ===
                      'foreign'
                    ? 'Foreign'
                    : 'Residential'
              }
            />
          </div>

          {/* STEP 3 */}
          <div
            style={{
              display:
                currentStep === 3
                  ? 'block'
                  : 'none',
            }}
          >
            <PaymentStep
              isActive={currentStep === 3}
              verifiedPhone={verifiedMobile}
              amount={
                formRef.current
                  ? new FormData(
                      formRef.current
                    ).get('amountToPay')
                  : null
              }
              hasPaymentReceipt={
                formRef.current
                  ? new FormData(
                      formRef.current
                    ).get('paymentReceipt')
                      ?.size > 0
                  : false
              }
              onSuccess={() =>
                handleSubmit({
                  preventDefault: () => {},
                })
              }
            />
          </div>
        </div>

        {submitError && (
          <p
            style={{
              color:
                'var(--danger, #dc3545)',
              marginBottom: '1rem',
              fontSize: '0.9rem',
            }}
          >
            {submitError}
          </p>
        )}

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            borderTop:
              '1px solid var(--border-color)',
            paddingTop: '1.5rem',
            gap: '1rem',
          }}
        >
          <button
            type="button"
            className="btn btn-secondary"
            onClick={prevStep}
            disabled={
              currentStep === 1 ||
              submitting
            }
          >
            {t('common.previous')}
          </button>

          {currentStep < totalSteps - 1 ? (
            <button
              type="submit"
              className="btn btn-primary"
              disabled={submitting}
            >
              {t('common.nextStep')}
            </button>
          ) : currentStep ===
            totalSteps - 1 ? (
            <button
              type="submit"
              className="btn btn-success"
              disabled={submitting}
            >
              {submitting
                ? t('common.submitting')
                : paymentIntention === 'paid'
                  ? 'Submit Reconnection Request'
                  : `Proceed to Pay Rs. ${
                      reconnectionData
                        ?.outstandingBalance ||
                      '0.00'
                    }`}
            </button>
          ) : null}
        </div>
      </form>
    </div>
  );
}