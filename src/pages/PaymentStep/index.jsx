import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { FiCreditCard, FiLock, FiShield, FiCheckCircle, FiSmartphone, FiFileText } from 'react-icons/fi';
import Icon from '../../components/Icon';
import SLTLoader from '../../components/SLTLoader';
import api from '../../utils/api';
import { loadPayHereSdk } from '../../utils/loadPayHereSdk';

const RESEND_SECONDS = 30;

export default function PaymentStep({
  isActive = true,
  amount = 1000,
  amountLabel = 'Pending Dues Balance',
  hasPaymentReceipt = false,
  verifiedPhone,
  onSuccess,
  feeAmount = 0,
  feeLabel = '',
}) {
  const navigate = useNavigate();
  const { t } = useTranslation();

  // OTP State
  const [phase, setPhase] = useState(verifiedPhone ? 'verified' : 'mobile'); // 'mobile' | 'otp' | 'verified'
  const [mobileNumber, setMobileNumber] = useState(verifiedPhone || '');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [resendIn, setResendIn] = useState(RESEND_SECONDS);
  const [isLoading, setIsLoading] = useState(false);
  const inputRefs = useRef([]);

  const parsedAmount = parseFloat(amount) || 0;
  const parsedFee = parseFloat(feeAmount) || 0;
  const totalAmount = parsedAmount + parsedFee;
  const formattedAmount = Number(totalAmount).toLocaleString('en-US', { minimumFractionDigits: 2 });
  const formattedPending = Number(parsedAmount).toLocaleString('en-US', { minimumFractionDigits: 2 });
  const formattedFee = Number(parsedFee).toLocaleString('en-US', { minimumFractionDigits: 2 });

  // Payment Status State
  const [statusState, setStatusState] = useState({
    type: null,
    message: '',
  });

  useEffect(() => {
    if (phase !== 'otp') return;
    setResendIn(RESEND_SECONDS);
    const id = setTimeout(() => inputRefs.current[0]?.focus(), 40);
    return () => clearTimeout(id);
  }, [phase]);

  useEffect(() => {
    if (phase !== 'otp' || resendIn <= 0) return;
    const id = setTimeout(() => setResendIn((s) => s - 1), 1000);
    return () => clearTimeout(id);
  }, [phase, resendIn]);

  const handleMobileSubmit = async (e) => {
    e.preventDefault();
    let num = mobileNumber;
    if (num.startsWith('0')) num = num.substring(1);

    if (num.length === 9 && num.startsWith('7')) {
      setError('');
      setIsLoading(true);
      try {
        const response = await api.post('/otp/send', { phone: num });
        if (response.data.success) {
          setMobileNumber(num);
          setPhase('otp');
        }
      } catch (err) {
        if (!err.response) {
          setMobileNumber(num);
          setPhase('otp');
        } else {
          setError(err.response?.data?.message || t('otp.invalidMobile'));
        }
      } finally {
        setIsLoading(false);
      }
    } else {
      setError(t('otp.invalidMobile', 'Enter a valid mobile number.'));
    }
  };

  const submitOtp = async (code) => {
    setError('');
    setIsLoading(true);

    // Development bypass: Accept 000000 or 123456 as demo code
    if (code === '000000' || code === '123456') {
      setPhase('verified');
      setIsLoading(false);
      return;
    }

    try {
      const response = await api.post('/otp/verify', { phone: mobileNumber, otp: code });
      if (response.data.success) setPhase('verified');
    } catch (err) {
      setError(err.response?.data?.message || t('otp.invalidOtp'));
      setOtp(['', '', '', '', '', '']);
      setTimeout(() => inputRefs.current[0]?.focus(), 50);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpChange = (index, raw) => {
    if (isLoading) return;
    const value = raw.replace(/\D/g, '');
    const next = [...otp];
    next[index] = value.slice(-1) || '';
    setOtp(next);
    
    if (value && index < 5) inputRefs.current[index + 1]?.focus();

    const joined = next.join('');
    if (joined.length === 6) submitOtp(joined);
    else if (error) setError('');
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) inputRefs.current[index - 1]?.focus();
  };

  // Direct Pay / Instant Demo Confirmation
  const handleInstantConfirm = async () => {
    setStatusState({ type: 'success', message: 'Submitting application & processing payment...' });
    const orderId = `PAY-${Date.now()}`;
    try {
      if (onSuccess) {
        await onSuccess(orderId, mobileNumber);
      }
    } catch (err) {
      setStatusState({
        type: 'error',
        message: err.response?.data?.message || err.message || 'Payment failed. Please try again.',
      });
    }
  };

  // PayHere Sandbox Modal Flow
  const handlePayHerePayment = async () => {
    setStatusState({ type: 'success', message: 'Opening PayHere Sandbox Gateway...' });
    const orderId = `PAY-${Date.now()}`;

    try {
      // 1. Load PayHere SDK and request parameters (stay on Step 4)
      await loadPayHereSdk();
      const res = await api.post('/payment/create', {
        orderId,
        amount: totalAmount,
        currency: 'LKR',
        itemTitle: 'SLTMobitel Service Payment',
        customerDetails: { phone: mobileNumber },
      });

      const paymentParams = res.data;
      if (window.payhere && paymentParams.hash) {
        // 2. Only submit application & navigate when payment is actually completed
        window.payhere.onCompleted = async function (completedOrderId) {
          setStatusState({ type: 'success', message: 'Payment verified! Submitting your application...' });
          try {
            if (onSuccess) {
              await onSuccess(completedOrderId || orderId, mobileNumber);
            }
          } catch (submitErr) {
            setStatusState({
              type: 'error',
              message: submitErr.response?.data?.message || submitErr.message || 'Payment confirmed, but application submission encountered an issue. Please contact support.',
            });
          }
        };

        // 3. If customer dismisses modal without paying, stay on Step 4
        window.payhere.onDismissed = function () {
          setStatusState({
            type: 'error',
            message: 'Payment was dismissed. You can retry or choose Instant Confirm.',
          });
        };

        // 4. If payment fails/cancels, stay on Step 4
        window.payhere.onError = function (error) {
          setStatusState({
            type: 'error',
            message: 'Payment error: ' + (error || 'Transaction could not be completed. Please retry.'),
          });
        };

        // 5. Open PayHere popup on Step 4
        window.payhere.startPayment({
          sandbox: true,
          merchant_id: paymentParams.merchant_id,
          return_url: paymentParams.return_url,
          cancel_url: paymentParams.cancel_url,
          notify_url: paymentParams.notify_url,
          order_id: paymentParams.order_id,
          items: 'SLTMobitel Service Payment',
          amount: paymentParams.amount || totalAmount,
          currency: 'LKR',
          hash: paymentParams.hash,
          first_name: 'Customer',
          last_name: '',
          email: 'customer@slt.lk',
          phone: `0${mobileNumber}`,
          address: 'Colombo',
          city: 'Colombo',
          country: 'Sri Lanka',
        });
        return;
      }
    } catch (err) {
      setStatusState({
        type: 'error',
        message: err.response?.data?.message || err.message || 'Payment failed. Please try again.',
      });
    }
  };

  return (
    <div style={{ maxWidth: '680px', margin: '0 auto', textAlign: 'center' }}>
      {/* Hidden input so parent form can read the authenticated number */}
      {phase === 'verified' && <input type="hidden" name="verifiedMobile" value={mobileNumber} />}

      <AnimatePresence mode="wait">
        {phase === 'mobile' && (
          <motion.div key="mobile" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: 'rgba(15, 87, 168, 0.1)', color: 'var(--slt-blue)', display: 'grid', placeItems: 'center', margin: '0 auto 1.5rem' }}>
              <FiSmartphone size={32} />
            </div>
            <h3 style={{ color: 'var(--slt-blue)', marginBottom: '0.5rem' }}>Authorization</h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>Please enter your mobile number to authorize this request.</p>
            
            <div className="form-group" style={{ textAlign: 'left', maxWidth: '400px', margin: '0 auto' }}>
              <label className="form-label">Mobile Number</label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }}>+94</span>
                <input type="tel" className="form-control" style={{ paddingLeft: '3.5rem', fontSize: '1.1rem', letterSpacing: '2px' }} placeholder="7X XXX XXXX" value={mobileNumber} onChange={(e) => setMobileNumber(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleMobileSubmit(e)} maxLength="10" />
              </div>
              {error && <p style={{ color: 'var(--danger)', fontSize: '0.85rem', marginTop: '0.5rem' }}>{error}</p>}
              
              <button type="button" className="btn btn-primary" style={{ width: '100%', marginTop: '1.5rem', height: '48px', display: 'flex', justifyContent: 'center', alignItems: 'center' }} onClick={handleMobileSubmit} disabled={isLoading}>
                {isLoading ? <SLTLoader size={24} /> : 'Send OTP'}
              </button>
            </div>
          </motion.div>
        )}

        {phase === 'otp' && (
          <motion.div key="otp" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: 'rgba(15, 87, 168, 0.1)', color: 'var(--slt-blue)', display: 'grid', placeItems: 'center', margin: '0 auto 1.5rem' }}>
              <FiShield size={32} />
            </div>
            <h3 style={{ color: 'var(--slt-blue)', marginBottom: '0.5rem' }}>Enter Verification Code</h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>We sent a 6-digit code to <strong>+94 {mobileNumber}</strong></p>

            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', marginBottom: '1.5rem' }}>
              {otp.map((d, i) => (
                <input key={i} ref={(el) => (inputRefs.current[i] = el)} type="tel" inputMode="numeric" maxLength={1} value={d} onChange={(e) => handleOtpChange(i, e.target.value)} onKeyDown={(e) => handleKeyDown(i, e)} 
                style={{ 
                  width: '48px', height: '56px', fontSize: '1.5rem', textAlign: 'center', borderRadius: '8px', 
                  border: '1.5px solid #cbd5e1', 
                  background: '#ffffff',
                  boxShadow: '0 4px 12px rgba(31, 38, 135, 0.05)'
                }} disabled={isLoading} />
              ))}
            </div>
            
            {error && <p style={{ color: 'var(--danger)', fontSize: '0.85rem', marginBottom: '1rem' }}>{error}</p>}

            <button type="button" className="btn btn-secondary" style={{ border: 'none', background: 'transparent' }} onClick={() => { setPhase('mobile'); setOtp(['', '', '', '', '', '']); setError(''); }} disabled={isLoading}>
              Change Number
            </button>
          </motion.div>
        )}

        {phase === 'verified' && (
          <motion.div key="verified" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="pay">
            <div className="pay__head">
              <span className="pay__tick" aria-hidden="true">
                <FiCheckCircle size={30} />
              </span>
              <h3>Verification Complete</h3>
              <p>Choose your preferred payment method to complete the connection request.</p>
            </div>

            <div className="pay__gateway">
              <div className="pay__gateway-top">
                <span>
                  <FiLock size={16} aria-hidden="true" /> PayHere Secured Gateway
                </span>
                <span className="pay__ssl">256-Bit SSL Encrypted</span>
              </div>
              <div className="pay__brands">
                {['VISA', 'MasterCard', 'AMEX', 'eZ Cash', 'mCash', 'FriMi', 'Genie'].map((brand) => (
                  <span key={brand} className="badge-plain">{brand}</span>
                ))}
              </div>
            </div>

            <section className="pay__receipt" aria-label="Order receipt">
              <h4>
                <FiFileText size={18} aria-hidden="true" /> Digital Order Receipt
              </h4>
              <div className="pay__row">
                <span>{amountLabel}</span>
                <strong>Rs. {formattedPending}</strong>
              </div>
              {parsedFee > 0 && (
                <div className="pay__row">
                  <span>{feeLabel || 'Fee'}</span>
                  <strong>Rs. {formattedFee}</strong>
                </div>
              )}
              <div className="pay__row pay__row--total">
                <span>Total Amount Due</span>
                <strong>Rs. {formattedAmount}</strong>
              </div>
              <div className="pay__row pay__row--meta">
                <span>Gateway Mode</span>
                <span className="pay__mode">PayHere Sandbox Verified</span>
              </div>
            </section>

            {statusState.message && (
              <div
                className={`pay__status ${statusState.type === 'error' ? 'is-error' : 'is-ok'}`}
                role={statusState.type === 'error' ? 'alert' : 'status'}
              >
                {statusState.message}
              </div>
            )}

            <div className="pay__actions">
              <button type="button" className="btn-ds btn-ds--buy btn-ds--block" style={{ minHeight: 56, fontSize: 17 }} onClick={handlePayHerePayment}>
                <FiCreditCard size={20} aria-hidden="true" />
                <span>Pay Rs. {formattedAmount} via PayHere Gateway</span>
              </button>
              <button type="button" className="btn-ds btn-ds--outline btn-ds--block" onClick={handleInstantConfirm}>
                Instant Confirm (Demo / Teleshop Pay)
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

