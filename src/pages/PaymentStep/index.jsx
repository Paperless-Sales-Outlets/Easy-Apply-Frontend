import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { FiCreditCard, FiLock, FiShield, FiCheckCircle, FiSmartphone, FiFileText } from 'react-icons/fi';
import Icon from '../../components/Icon';
import SLTLoader from '../../components/SLTLoader';
import api from '../../utils/api';
import { loadPayHereSdk } from '../../utils/loadPayHereSdk';
import { formatTimer, saveOtpTimers, getOtpTimers, clearOtpTimers } from '../../utils/otpSecurity';

const RESEND_SECONDS = 60;
const OTP_EXPIRY_SECONDS = 300;

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
  const [expiresIn, setExpiresIn] = useState(OTP_EXPIRY_SECONDS);
  const [resendIn, setResendIn] = useState(RESEND_SECONDS);
  const [lockoutIn, setLockoutIn] = useState(0);
  const [isOtpExpired, setIsOtpExpired] = useState(false);
  const [isLockedOut, setIsLockedOut] = useState(false);
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

  // Restore active OTP timers and lockout state from localStorage on phone change or refresh
  useEffect(() => {
    const num = mobileNumber.replace(/\D/g, '').slice(-9);
    if (num.length === 9) {
      const timers = getOtpTimers(num);
      if (timers.lockoutIn > 0) {
        setIsLockedOut(true);
        setLockoutIn(timers.lockoutIn);
        setError('Too many incorrect OTP attempts. OTP verification is locked for 15 minutes.');
      } else {
        setIsLockedOut(false);
        setLockoutIn(0);
      }

      if (timers.expiresIn > 0) {
        setExpiresIn(timers.expiresIn);
        setIsOtpExpired(false);
        if (phase === 'mobile') setPhase('otp');
      } else if (timers.isExpired) {
        setExpiresIn(0);
        setIsOtpExpired(true);
        if (phase === 'mobile') setPhase('otp');
      }

      if (timers.resendIn > 0) {
        setResendIn(timers.resendIn);
      } else {
        setResendIn(0);
      }
    }
  }, [mobileNumber]);

  // 15-Minute Lockout Countdown
  useEffect(() => {
    if (!isLockedOut || lockoutIn <= 0) return;
    const timer = setInterval(() => {
      setLockoutIn((prev) => {
        if (prev <= 1) {
          setIsLockedOut(false);
          setError('');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [isLockedOut, lockoutIn]);

  // 5-Minute OTP Expiry Countdown
  useEffect(() => {
    if (phase !== 'otp' || isLockedOut || expiresIn <= 0) return;
    const timer = setInterval(() => {
      setExpiresIn((prev) => {
        if (prev <= 1) {
          setIsOtpExpired(true);
          setError('Your OTP has expired. Please request a new OTP.');
          setOtp(['', '', '', '', '', '']);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [phase, isLockedOut, expiresIn]);

  // Focus first input on phase switch
  useEffect(() => {
    if (phase !== 'otp') return;
    const id = setTimeout(() => inputRefs.current[0]?.focus(), 40);
    return () => clearTimeout(id);
  }, [phase]);

  const handleMobileSubmit = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    let num = mobileNumber.replace(/\D/g, '');
    if (num.startsWith('0')) num = num.substring(1);
    num = num.slice(-9);

    if (num.length === 9) {
      if (isLockedOut || lockoutIn > 0) {
        setError(`Too many incorrect OTP attempts. OTP verification is locked for 15 minutes. Try again in ${formatTimer(lockoutIn)}`);
        return;
      }

      setError('');
      setIsLoading(true);
      try {
        const response = await api.post('/otp/send', { phone: num });
        const data = response.data;
        saveOtpTimers(num, {
          expiresAt: data.expiresAt,
          resendAvailableAt: data.resendAvailableAt,
          lockedUntil: null,
        });

        setMobileNumber(num);
        setExpiresIn(data.expiresIn || OTP_EXPIRY_SECONDS);
        setResendIn(data.resendCooldown || RESEND_SECONDS);
        setIsOtpExpired(false);
        setIsLockedOut(false);
        setLockoutIn(0);
        setOtp(['', '', '', '', '', '']);
        setPhase('otp');
      } catch (err) {
        const resData = err.response?.data || {};
        if (err.response?.status === 429) {
          if (resData.code === 'OTP_LOCKED' || resData.lockoutRemaining > 0) {
            const rem = resData.lockoutRemaining || 900;
            setIsLockedOut(true);
            setLockoutIn(rem);
            saveOtpTimers(num, { lockedUntil: resData.lockedUntil || new Date(Date.now() + rem * 1000).toISOString() });
            setError(resData.message || 'Too many incorrect OTP attempts. OTP verification is locked for 15 minutes.');
          } else if (resData.code === 'OTP_STILL_VALID') {
            // OTP still valid — do not show resend, update expiry display
            const rem = resData.otpRemaining;
            if (rem > 0) setExpiresIn(rem);
            setIsOtpExpired(false);
            if (resData.expiresAt) saveOtpTimers(num, { expiresAt: resData.expiresAt });
            setError('A verification code is already active. Please use the code already sent or wait for it to expire.');
            setPhase('otp');
          } else if (resData.code === 'RESEND_COOLDOWN' || resData.cooldownRemaining > 0) {
            const rem = resData.cooldownRemaining || 60;
            setResendIn(rem);
            saveOtpTimers(num, { resendAvailableAt: resData.resendAvailableAt || new Date(Date.now() + rem * 1000).toISOString() });
            setError(resData.message || `Please wait ${rem} seconds before requesting a new OTP.`);
          } else {
            setError(resData.message || 'Rate limit exceeded.');
          }
        } else {
          setError(resData.message || t('otp.invalidMobile', 'Enter a valid mobile number.'));
        }
      } finally {
        setIsLoading(false);
      }
    } else {
      setError(t('otp.invalidMobile', 'Enter a valid 9-digit mobile number.'));
    }
  };

  const submitOtp = async (code) => {
    if (isLockedOut || lockoutIn > 0) {
      setError('Too many incorrect OTP attempts. OTP verification is locked for 15 minutes.');
      return;
    }
    if (isOtpExpired || expiresIn <= 0) {
      setError('Your OTP has expired. Please request a new OTP.');
      return;
    }

    setError('');
    setIsLoading(true);

    try {
      const response = await api.post('/otp/verify', { phone: mobileNumber, otp: code });
      if (response.data.success) {
        clearOtpTimers(mobileNumber);
        setPhase('verified');
      }
    } catch (err) {
      const resData = err.response?.data || {};
      const status = err.response?.status;

      if (status === 429 && (resData.code === 'OTP_LOCKED' || resData.lockoutRemaining > 0)) {
        const rem = resData.lockoutRemaining || 900;
        setIsLockedOut(true);
        setLockoutIn(rem);
        saveOtpTimers(mobileNumber, { lockedUntil: resData.lockedUntil || new Date(Date.now() + rem * 1000).toISOString() });
        setError(resData.message || 'Too many incorrect OTP attempts. OTP verification is locked for 15 minutes.');
        setOtp(['', '', '', '', '', '']);
      } else if (resData.code === 'OTP_EXPIRED') {
        setIsOtpExpired(true);
        setExpiresIn(0);
        setError(resData.message || 'Your OTP has expired. Please request a new OTP.');
        setOtp(['', '', '', '', '', '']);
      } else {
        setError(resData.message || t('otp.invalidOtp', 'Invalid verification code. Please try again.'));
        setOtp(['', '', '', '', '', '']);
        setTimeout(() => inputRefs.current[0]?.focus(), 50);
      }
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
    <div style={{ maxWidth: '640px', margin: '0 auto', textAlign: 'center' }}>
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
            <p style={{ color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>We sent a 6-digit code to <strong>+94 {mobileNumber}</strong></p>

            {/* 15-Minute Lockout Banner */}
            {isLockedOut && (
              <div
                role="alert"
                style={{
                  backgroundColor: '#fff1f2',
                  border: '1.5px solid #fecdd3',
                  color: '#be123c',
                  padding: '0.85rem 1rem',
                  borderRadius: '12px',
                  marginBottom: '1.25rem',
                  textAlign: 'center',
                  fontWeight: 600,
                  fontSize: '0.88rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.45rem', marginBottom: '0.35rem' }}>
                  <FiLock size={16} />
                  <span>Too many incorrect OTP attempts. OTP verification is locked for 15 minutes.</span>
                </div>
                <div style={{ color: '#9f1239', fontWeight: 800, fontSize: '0.95rem' }}>
                  OTP verification locked. Try again in {formatTimer(lockoutIn)}
                </div>
              </div>
            )}

            {/* 5-Minute Expiry Countdown */}
            {!isLockedOut && !isOtpExpired && (
              <div style={{ marginBottom: '1.25rem', fontSize: '0.88rem' }}>
                <span style={{ color: '#0369a1', fontWeight: 700 }}>
                  OTP expires in {formatTimer(expiresIn)}
                </span>
              </div>
            )}

            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', marginBottom: '1.5rem' }}>
              {otp.map((d, i) => (
                <input
                  key={i}
                  ref={(el) => (inputRefs.current[i] = el)}
                  type="tel"
                  inputMode="numeric"
                  maxLength={1}
                  value={d}
                  onChange={(e) => handleOtpChange(i, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(i, e)}
                  style={{
                    width: '48px', height: '56px', fontSize: '1.5rem', textAlign: 'center', borderRadius: '8px',
                    border: '1.5px solid #cbd5e1',
                    background: '#ffffff',
                    boxShadow: '0 4px 12px rgba(31, 38, 135, 0.05)'
                  }}
                  disabled={isLoading || isLockedOut || isOtpExpired}
                />
              ))}
            </div>

            {error && <p style={{ color: 'var(--danger)', fontSize: '0.85rem', marginBottom: '1rem', fontWeight: 700 }}>{error}</p>}

            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1.25rem', marginTop: '0.5rem' }}>
              <button
                type="button"
                className="btn btn-secondary"
                style={{ border: 'none', background: 'transparent' }}
                onClick={() => { setPhase('mobile'); setOtp(['', '', '', '', '', '']); setError(''); }}
                disabled={isLoading}
              >
                Change Number
              </button>

              {/* Resend section: visible immediately AFTER OTP has expired */}
              {isOtpExpired && !isLockedOut && (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.35rem' }}>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    style={{
                      border: 'none',
                      background: 'transparent',
                      color: '#0056b3',
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                    onClick={handleMobileSubmit}
                    disabled={isLoading}
                    id="btn-resend-payment-otp"
                  >
                    {isLoading ? 'Sending…' : 'Resend OTP'}
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {phase === 'verified' && (
          <motion.div key="verified" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
            <div style={{ width: '56px', height: '56px', borderRadius: '50%', backgroundColor: 'rgba(0,166,80,0.1)', color: 'var(--green-text)', display: 'grid', placeItems: 'center', margin: '0 auto 1.25rem' }}>
              <FiCheckCircle size={30} />
            </div>
            <h3 style={{ color: 'var(--green-text)', marginBottom: '0.35rem', fontSize: '1.35rem' }}>Verification Complete</h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '1.75rem', fontSize: '0.92rem' }}>Choose your preferred payment method to complete the connection request.</p>

            {/* PayHere Gateway Banner & Badges */}
            <div
              style={{
                backgroundColor: '#f8fafc',
                border: '1.5px solid #e2e8f0',
                borderRadius: '14px',
                padding: '1.25rem',
                marginBottom: '1.5rem',
                textAlign: 'left',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.85rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <FiLock color="#0056b3" size={16} />
                  <span style={{ fontWeight: 800, fontSize: '0.92rem', color: '#0f172a' }}>PayHere Secured Gateway</span>
                </div>
                <span style={{ fontSize: '0.72rem', backgroundColor: '#e0f2fe', color: '#0369a1', fontWeight: 800, padding: '0.2rem 0.55rem', borderRadius: '20px', textTransform: 'uppercase' }}>
                  256-Bit SSL Encrypted
                </span>
              </div>

              {/* Supported payment icons */}
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
                {['VISA', 'MasterCard', 'AMEX', 'eZ Cash', 'mCash', 'FriMi', 'Genie'].map((brand) => (
                  <span
                    key={brand}
                    style={{
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      backgroundColor: '#ffffff',
                      border: '1px solid #cbd5e1',
                      borderRadius: '6px',
                      padding: '0.3rem 0.6rem',
                      color: '#334155',
                    }}
                  >
                    {brand}
                  </span>
                ))}
              </div>
            </div>

            {/* Digital Receipt Breakdown */}
            <div
              style={{
                padding: '1.75rem 1.5rem', borderRadius: '14px', textAlign: 'left', marginBottom: '1.75rem',
                backgroundColor: '#ffffff',
                boxShadow: '0 4px 20px rgba(0, 86, 179, 0.06)',
                border: '1px solid #e2e8f0',
                position: 'relative'
              }}
            >
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', backgroundColor: '#0056b3', borderRadius: '14px 14px 0 0' }} />

              <div style={{ textAlign: 'center', marginBottom: '1.25rem' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: 'rgba(15, 87, 168, 0.1)', display: 'grid', placeItems: 'center', margin: '0 auto 0.4rem', color: 'var(--slt-blue)' }}>
                  <FiFileText size={18} />
                </div>
                <h4 style={{ margin: 0, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '1.5px', fontSize: '0.85rem', fontWeight: 800 }}>Digital Order Receipt</h4>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.75rem', borderBottom: parsedFee > 0 ? 'none' : '1px dashed #cbd5e1', marginBottom: parsedFee > 0 ? '0.4rem' : '0.75rem' }}>
                <span style={{ color: '#64748b', fontWeight: 500, fontSize: '0.92rem' }}>{amountLabel}</span>
                <span style={{ fontWeight: 700, fontSize: '1.05rem', color: '#0f172a' }}>Rs. {formattedPending}</span>
              </div>

              {parsedFee > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.75rem', borderBottom: '1px dashed #cbd5e1', marginBottom: '0.75rem' }}>
                  <span style={{ color: '#64748b', fontWeight: 500, fontSize: '0.92rem' }}>{feeLabel || 'Fee'}</span>
                  <span style={{ fontWeight: 700, fontSize: '1.05rem', color: '#0f172a' }}>Rs. {formattedFee}</span>
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.85rem', borderBottom: '1px solid #f1f5f9', marginBottom: '0.85rem' }}>
                <span style={{ color: '#0f172a', fontWeight: 800, fontSize: '1.05rem' }}>Total Amount Due</span>
                <span style={{ fontWeight: 900, fontSize: '1.25rem', color: '#0056b3' }}>Rs. {formattedAmount}</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: '#64748b', fontWeight: 500, fontSize: '0.88rem' }}>Gateway Mode</span>
                <span style={{ fontWeight: 700, color: '#059669', fontSize: '0.88rem' }}>PayHere Sandbox Verified</span>
              </div>
            </div>

            {statusState.message && (
              <div style={{ padding: '0.85rem 1rem', borderRadius: '8px', marginBottom: '1.25rem', backgroundColor: statusState.type === 'error' ? '#fef2f2' : '#ecfdf5', color: statusState.type === 'error' ? '#dc2626' : '#059669', border: `1px solid ${statusState.type === 'error' ? '#fecaca' : '#a7f3d0'}`, fontSize: '0.92rem', fontWeight: 600 }}>
                {statusState.message}
              </div>
            )}

            {/* Action Buttons: PayHere Sandbox Gateway & Fast Demo Checkout */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <button
                type="button"
                className="btn btn-primary"
                style={{
                  height: '52px',
                  fontSize: '1.05rem',
                  fontWeight: 800,
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  gap: '0.65rem',
                  backgroundColor: '#0056b3',
                  borderRadius: '10px',
                  boxShadow: '0 4px 14px rgba(0, 86, 179, 0.25)',
                }}
                onClick={handlePayHerePayment}
              >
                <FiCreditCard size={20} />
                Pay Rs. {formattedAmount} via PayHere Gateway
              </button>

              <button
                type="button"
                className="btn btn-secondary"
                style={{
                  height: '46px',
                  fontSize: '0.92rem',
                  fontWeight: 700,
                  backgroundColor: '#f8fafc',
                  color: '#334155',
                  border: '1.5px solid #cbd5e1',
                  borderRadius: '10px',
                }}
                onClick={handleInstantConfirm}
              >
                Instant Confirm (Demo / Teleshop Pay)
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

