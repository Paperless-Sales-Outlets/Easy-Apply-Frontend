import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import Icon from '../../components/Icon';
import SLTLoader from '../../components/SLTLoader';
import api from '../../utils/api';

const RESEND_SECONDS = 30;

export default function PaymentStep({
  isActive = true,
  amount = 1000,
  hasPaymentReceipt = false,
  verifiedPhone,
  onSuccess,
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

  // Payment Status State
  const [statusState, setStatusState] = useState({
    type: null,
    message: '',
  });

  const formattedAmount = amount
    ? Number(amount).toLocaleString('en-LK', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    : '1,000.00';

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

  const handlePlaceOrder = () => {
    if (hasPaymentReceipt) {
      if (onSuccess) onSuccess();
    } else {
      setStatusState({ type: 'success', message: 'Proceeding to PayHere Sandbox...' });
      setTimeout(() => {
        if (onSuccess) onSuccess('PAYHERE-' + Date.now().toString().slice(-6));
      }, 1500);
    }
  };

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', textAlign: 'center' }}>
      
      {/* Hidden input so parent form can read the authenticated number */}
      {phase === 'verified' && <input type="hidden" name="verifiedMobile" value={mobileNumber} />}

      <AnimatePresence mode="wait">
        
        {phase === 'mobile' && (
          <motion.div key="mobile" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: 'rgba(15, 87, 168, 0.1)', color: 'var(--slt-blue)', display: 'grid', placeItems: 'center', margin: '0 auto 1.5rem' }}>
              <Icon name="smartphone" size={32} />
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
              <Icon name="message-square" size={32} />
            </div>
            <h3 style={{ color: 'var(--slt-blue)', marginBottom: '0.5rem' }}>Enter Verification Code</h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>We sent a 6-digit code to <strong>+94 {mobileNumber}</strong></p>

            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', marginBottom: '1.5rem' }}>
              {otp.map((d, i) => (
                <input key={i} ref={(el) => (inputRefs.current[i] = el)} type="tel" inputMode="numeric" maxLength={1} value={d} onChange={(e) => handleOtpChange(i, e.target.value)} onKeyDown={(e) => handleKeyDown(i, e)} style={{ width: '48px', height: '56px', fontSize: '1.5rem', textAlign: 'center', borderRadius: '8px', border: '2px solid var(--border-color)', backgroundColor: 'var(--surface)' }} disabled={isLoading} />
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
            <div style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: 'rgba(0,166,80,0.1)', color: 'var(--slt-green)', display: 'grid', placeItems: 'center', margin: '0 auto 1.5rem' }}>
              <Icon name="check-circle" size={32} />
            </div>
            <h3 style={{ color: 'var(--slt-green)', marginBottom: '0.5rem' }}>Mobile Verified!</h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '2.5rem' }}>Your request is ready to be submitted.</p>

            <div 
              style={{ 
                padding: '2rem 1.5rem', backgroundColor: '#fafafa', borderRadius: '4px 4px 12px 12px', textAlign: 'left', marginBottom: '2rem',
                position: 'relative',
                boxShadow: '0 10px 30px -10px rgba(0,0,0,0.1)',
                border: '1px solid rgba(0,0,0,0.05)',
                borderTop: 'none',
                marginTop: '10px'
              }}
            >
              {/* Receipt top colored bar */}
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', backgroundColor: 'var(--slt-blue)' }} />
              
              <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'rgba(15, 87, 168, 0.1)', display: 'grid', placeItems: 'center', margin: '0 auto 0.5rem', color: 'var(--slt-blue)' }}>
                  <Icon name="file-text" size={20} />
                </div>
                <h4 style={{ margin: 0, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '2px', fontSize: '0.9rem' }}>Digital Receipt</h4>
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '1rem', borderBottom: '2px dashed rgba(0,0,0,0.15)', marginBottom: '1rem' }}>
                <span style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>Pending Dues Balance</span>
                <span style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--text-primary)' }}>Rs. {formattedAmount}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>Payment Method</span>
                <span style={{ fontWeight: 700, color: 'var(--slt-blue)' }}>{hasPaymentReceipt ? 'Receipt Uploaded' : 'Pay Online Now'}</span>
              </div>
            </div>

            {statusState.message && (
              <div style={{ padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', backgroundColor: statusState.type === 'error' ? 'rgba(220,53,69,0.1)' : 'rgba(0,166,80,0.1)', color: statusState.type === 'error' ? 'var(--danger)' : 'var(--slt-green)' }}>
                {statusState.message}
              </div>
            )}

            <motion.button 
              type="button" 
              className="btn btn-primary" 
              style={{ 
                height: '56px', 
                fontSize: '1.1rem', 
                display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem',
                margin: '0 auto',
                overflow: 'hidden', whiteSpace: 'nowrap'
              }} 
              initial={{ width: '100%', borderRadius: '8px' }}
              animate={{ 
                width: statusState.message ? '56px' : '100%',
                borderRadius: statusState.message ? '28px' : '8px',
                pointerEvents: statusState.message ? 'none' : 'auto',
                opacity: statusState.message ? 0.8 : 1
              }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              onClick={handlePlaceOrder}
            >
              {statusState.message ? (
                <motion.div 
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                  style={{ width: '24px', height: '24px', border: '3px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%' }}
                />
              ) : (
                <>
                  {!hasPaymentReceipt ? <Icon name="credit-card" size={20} /> : <Icon name="file-text" size={20} />}
                  {hasPaymentReceipt ? 'Submit Request' : `Pay Rs. ${formattedAmount} & Confirm`}
                </>
              )}
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}