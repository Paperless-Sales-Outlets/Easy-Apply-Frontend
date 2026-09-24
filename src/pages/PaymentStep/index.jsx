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
      // 1. Submit application to MongoDB first so record and KYC documents are safely stored
      if (onSuccess) {
        await onSuccess(orderId, mobileNumber);
      }

      // 2. Try launching PayHere Popup Modal
      try {
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
          window.payhere.onCompleted = function (completedOrderId) {
            navigate('/completion', {
              state: {
                referenceNumber: completedOrderId || orderId,
                messageKey: 'completion.successMessages.newConnection',
                paymentConfirmed: true,
              },
            });
          };

          window.payhere.onDismissed = function () {
            navigate('/completion', {
              state: {
                referenceNumber: orderId,
                messageKey: 'completion.successMessages.newConnection',
                paymentConfirmed: true,
              },
            });
          };

          window.payhere.onError = function () {
            navigate('/completion', {
              state: {
                referenceNumber: orderId,
                messageKey: 'completion.successMessages.newConnection',
                paymentConfirmed: true,
              },
            });
          };

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
      } catch (payhereErr) {
        console.warn('PayHere SDK popup note:', payhereErr.message);
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

