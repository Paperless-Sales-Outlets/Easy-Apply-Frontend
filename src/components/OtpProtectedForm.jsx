import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSmartphone, FiShield, FiArrowRight } from 'react-icons/fi';
import { useTranslation } from 'react-i18next';

export default function OtpProtectedForm({ children }) {
  const { t } = useTranslation();
  const [isVerified, setIsVerified] = useState(false);
  const [step, setStep] = useState(1); 
  const [mobileNumber, setMobileNumber] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const inputRefs = useRef([]);

  const handleMobileSubmit = (e) => {
    e.preventDefault();
    if (mobileNumber.length >= 9) {
      setStep(2);
      setError('');
    } else {
      setError(t('otp.invalidMobile'));
    }
  };

  const handleOtpChange = (index, value) => {
    if (isNaN(value)) return;
    
    const newOtp = [...otp];
    if (value.length > 1) {
       const pasted = value.slice(0, 6).split('');
       for(let i = 0; i < pasted.length; i++) {
          if (index + i < 6) newOtp[index + i] = pasted[i];
       }
       setOtp(newOtp);
       const nextIndex = Math.min(index + pasted.length, 5);
       if(inputRefs.current[nextIndex]) inputRefs.current[nextIndex].focus();
    } else {
       newOtp[index] = value;
       setOtp(newOtp);
       if (value !== '' && index < 5) {
         if(inputRefs.current[index + 1]) inputRefs.current[index + 1].focus();
       }
    }

    const currentOtp = newOtp.join('');
    if (currentOtp.length === 6) {
      if (currentOtp === '123456') {
        setError('');
        setTimeout(() => setIsVerified(true), 400); 
      } else {
        setError(t('otp.invalidOtp'));
      }
    } else {
      setError('');
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      if(inputRefs.current[index - 1]) inputRefs.current[index - 1].focus();
    }
  };

  if (isVerified) {
    return <>{children}</>;
  }

  return (
    <div style={{ position: 'relative', minHeight: '60vh', width: '100%' }}>
      <div style={{ display: 'none' }}>{children}</div>
      <div style={{
        position: 'fixed',
        top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: 'rgba(244, 246, 248, 0.85)',
        backdropFilter: 'blur(12px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px'
      }}>
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          className="card"
          style={{
            padding: '2.5rem',
            maxWidth: '420px',
            width: '100%',
            textAlign: 'center',
            boxShadow: 'var(--shadow-lg)',
            borderRadius: 'var(--radius-lg)',
            background: 'var(--surface-color)',
            border: '1px solid var(--border-color)'
          }}
        >
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            background: 'rgba(0, 91, 159, 0.1)',
            color: 'var(--slt-blue)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.5rem auto'
          }}>
            {step === 1 ? <FiSmartphone size={32} /> : <FiShield size={32} />}
          </div>

          <h2 style={{ marginBottom: '1rem', color: 'var(--text-primary)', fontSize: '1.5rem', fontWeight: 600 }}>
            {step === 1 ? t('otp.verifyIdentity') : t('otp.enterOtp')}
          </h2>
          
          <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', lineHeight: '1.5', fontSize: '0.95rem' }}>
            {step === 1 
              ? t('otp.verifyInstruction')
              : t('otp.otpSentTo').replace('{mobileNumber}', mobileNumber)}
          </p>

          <AnimatePresence mode="wait">
            {step === 1 ? (
              <motion.form 
                key="mobile-form"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                onSubmit={handleMobileSubmit}
              >
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1.5rem' }}>
                  <div style={{
                    padding: '0.875rem 1rem',
                    background: '#f9fafb',
                    border: '1px solid #d2d6dc',
                    borderRight: 'none',
                    borderRadius: 'var(--radius-md) 0 0 var(--radius-md)',
                    fontWeight: '600',
                    color: 'var(--text-primary)'
                  }}>
                    +94
                  </div>
                  <input
                    type="tel"
                    value={mobileNumber}
                    onChange={(e) => setMobileNumber(e.target.value.replace(/\D/g, '').slice(0, 9))}
                    placeholder="7X XXX XXXX"
                    className="form-control"
                    style={{
                      borderTopLeftRadius: 0,
                      borderBottomLeftRadius: 0
                    }}
                    autoFocus
                  />
                </div>
                {error && <p style={{ color: '#dc3545', fontSize: '0.875rem', marginTop: '-1rem', marginBottom: '1rem', textAlign: 'left' }}>{error}</p>}
                
                <button 
                  type="submit"
                  className="btn btn-primary"
                  style={{ 
                    width: '100%', 
                    padding: '1rem',
                    fontSize: '1rem',
                    gap: '0.5rem',
                  }}
                >
                  {t('otp.sendOtp')} <FiArrowRight />
                </button>
              </motion.form>
            ) : (
              <motion.div
                key="otp-form"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
              >
                <div className="otp-input-group">
                  {otp.map((digit, index) => (
                    <input
                      key={index}
                      ref={el => inputRefs.current[index] = el}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(index, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(index, e)}
                      className="otp-input"
                      style={{
                        boxShadow: digit ? '0 0 0 2px rgba(0,91,159,0.1)' : 'none'
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = 'var(--slt-blue)';
                        e.target.style.background = 'var(--surface-color)';
                        e.target.style.boxShadow = '0 0 0 4px rgba(0, 91, 159, 0.15)';
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = '#d2d6dc';
                        e.target.style.background = '#f9fafb';
                        e.target.style.boxShadow = digit ? '0 0 0 2px rgba(0,91,159,0.1)' : 'none';
                      }}
                    />
                  ))}
                </div>
                {error && (
                  <motion.p 
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    style={{ color: '#dc3545', fontSize: '0.875rem', marginTop: '-1rem', marginBottom: '1.5rem' }}
                  >
                    {error}
                  </motion.p>
                )}
                
                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                  {t('otp.didNotReceive')} <button onClick={() => { setStep(1); setOtp(['', '', '', '', '', '']); setError(''); }} style={{ background: 'none', border: 'none', color: 'var(--slt-blue)', fontWeight: 600, cursor: 'pointer', padding: 0 }}>{t('otp.changeNumber')}</button>
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}
