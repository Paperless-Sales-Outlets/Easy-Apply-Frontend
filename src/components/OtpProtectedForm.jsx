import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import Icon from './Icon';
import { VerificationContext } from './verification';
import api from '../utils/api';

const RESEND_SECONDS = 30;

const formatNumber = (n) =>
  n.length === 9 ? `+94 ${n.slice(0, 2)} ${n.slice(2, 5)} ${n.slice(5)}` : `+94 ${n}`;

const swap = {
  initial: { opacity: 0, x: 16 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -16 },
  transition: { duration: 0.18 },
};

export default function OtpProtectedForm({ children }) {
  const { t } = useTranslation();
  const [phase, setPhase] = useState('mobile'); // 'mobile' | 'otp' | 'verified'
  const [done, setDone] = useState(true);
  const [mobileNumber, setMobileNumber] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [resendIn, setResendIn] = useState(RESEND_SECONDS);
  const [isLoading, setIsLoading] = useState(false);
  const inputRefs = useRef([]);

  // Focus the first code box and (re)start the resend countdown on entry.
  useEffect(() => {
    if (phase !== 'otp') return;
    setResendIn(RESEND_SECONDS);
    const id = setTimeout(() => inputRefs.current[0]?.focus(), 40);
    return () => clearTimeout(id);
  }, [phase]);

  // Tick the resend countdown down to zero.
  useEffect(() => {
    if (phase !== 'otp' || resendIn <= 0) return;
    const id = setTimeout(() => setResendIn((s) => s - 1), 1000);
    return () => clearTimeout(id);
  }, [phase, resendIn]);

  // Brief "verified" beat before handing over to the form.
  useEffect(() => {
    if (phase !== 'verified') return;
    const id = setTimeout(() => setDone(true), 800);
    return () => clearTimeout(id);
  }, [phase]);

  const handleMobileSubmit = async (e) => {
    e.preventDefault();
    if (mobileNumber.length === 9) {
      setError('');
      setIsLoading(true);
      try {
        const response = await api.post('/auth/send-otp', { phone: mobileNumber });
        if (response.data.success) {
          setPhase('otp');
        }
      } catch (err) {
        setError(err.response?.data?.message || t('otp.invalidMobile'));
      } finally {
        setIsLoading(false);
      }
    } else {
      setError(t('otp.invalidMobile'));
    }
  };

  const submitOtp = async (code) => {
    setError('');
    setIsLoading(true);
    try {
      const response = await api.post('/auth/verify-otp', {
        phone: mobileNumber,
        otp: code,
      });
      if (response.data.success) {
        setPhase('verified');
      }
    } catch (err) {
      setError(err.response?.data?.message || t('otp.invalidOtp'));
      // Clear OTP input digits on failed verification
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
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
    
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    const joined = next.join('');
    if (joined.length === 6) {
      submitOtp(joined);
    } else if (error) {
      setError('');
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    if (isLoading) return;
    
    const text = (e.clipboardData.getData('text') || '').replace(/\D/g, '').slice(0, 6);
    if (!text) return;
    e.preventDefault();
    const next = ['', '', '', '', '', ''];
    text.split('').forEach((ch, i) => {
      next[i] = ch;
    });
    setOtp(next);
    inputRefs.current[Math.min(text.length, 5)]?.focus();
    if (text.length === 6) {
      submitOtp(text);
    }
  };

  const handleResend = async () => {
    if (resendIn > 0 || isLoading) return;
    setOtp(['', '', '', '', '', '']);
    setError('');
    setIsLoading(true);
    try {
      const response = await api.post('/auth/send-otp', { phone: mobileNumber });
      if (response.data.success) {
        setResendIn(RESEND_SECONDS);
        setNotice(t('otp.resent'));
        inputRefs.current[0]?.focus();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to resend code');
    } finally {
      setIsLoading(false);
    }
  };

  const changeNumber = () => {
    setOtp(['', '', '', '', '', '']);
    setError('');
    setNotice('');
    setPhase('mobile');
  };

  if (done) {
    return <VerificationContext.Provider value={mobileNumber}>{children}</VerificationContext.Provider>;
  }

  return (
    <div className="otp-screen">
      <motion.div
        className="otp-card"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
      >
        <AnimatePresence mode="wait">
          {phase === 'mobile' && (
            <motion.div key="mobile" {...swap}>
              <div className="otp-icon">
                <Icon name="smartphone" size={26} />
              </div>
              <h2 className="otp-title">{t('otp.verifyTitle')}</h2>
              <p className="otp-text">{t('otp.verifyText')}</p>

              <form onSubmit={handleMobileSubmit}>
                <label className="sr-only" htmlFor="otp-mobile">
                  {t('otp.mobileLabel')}
                </label>
                <div className="otp-field">
                  <span className="prefix">+94</span>
                  <input
                    id="otp-mobile"
                    type="tel"
                    inputMode="numeric"
                    autoComplete="tel-national"
                    className="form-control"
                    placeholder="7X XXX XXXX"
                    value={mobileNumber}
                    disabled={isLoading}
                    aria-invalid={error ? 'true' : undefined}
                    onChange={(e) =>
                      setMobileNumber(e.target.value.replace(/\D/g, '').slice(0, 9))
                    }
                    autoFocus
                  />
                </div>
                <p className="otp-error" role="alert">
                  {error}
                </p>
                <button type="submit" className="btn btn-primary btn-block" disabled={isLoading}>
                  {isLoading ? '...' : <>{t('otp.sendCode')} <Icon name="arrow-right" size={18} /></>}
                </button>
              </form>
            </motion.div>
          )}

          {phase === 'otp' && (
            <motion.div key="otp" {...swap}>
              <div className="otp-icon">
                <Icon name="shield" size={26} />
              </div>
              <h2 className="otp-title">{t('otp.codeTitle')}</h2>
              <p className="otp-text" style={{ marginBottom: 'var(--s2)' }}>
                {t('otp.codeText')}
              </p>
              <p className="otp-number-row">
                <span className="otp-number">{formatNumber(mobileNumber)}</span>
                <button type="button" className="otp-change" onClick={changeNumber} disabled={isLoading}>
                  {t('otp.changeNumber')}
                </button>
              </p>

              <fieldset className="otp-fieldset">
                <legend className="sr-only">{t('otp.codeLegend')}</legend>
                <div className="otp-input-group" onPaste={handlePaste}>
                  {otp.map((digit, index) => (
                    <input
                      key={index}
                      ref={(el) => {
                        inputRefs.current[index] = el;
                      }}
                      className="otp-input"
                      type="text"
                      inputMode="numeric"
                      autoComplete="one-time-code"
                      maxLength={1}
                      value={digit}
                      disabled={isLoading}
                      data-filled={digit ? 'true' : 'false'}
                      aria-label={t('otp.digitLabel', { n: index + 1 })}
                      aria-invalid={error ? 'true' : undefined}
                      onChange={(e) => handleOtpChange(index, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(index, e)}
                    />
                  ))}
                </div>
              </fieldset>

              <p className="otp-error" role="alert">
                {error}
              </p>

              {resendIn > 0 ? (
                <span className="otp-resend">{t('otp.resendIn', { seconds: resendIn })}</span>
              ) : (
                <button type="button" className="otp-change" onClick={handleResend} disabled={isLoading}>
                  {isLoading ? '...' : t('otp.resend')}
                </button>
              )}

              <p className="otp-hint">{t('otp.hint', 'The verification code will be printed in the server terminal console.')}</p>
              <span className="sr-only" role="status" aria-live="polite">
                {notice}
              </span>
            </motion.div>
          )}

          {phase === 'verified' && (
            <motion.div key="verified" {...swap}>
              <div className="otp-icon is-success">
                <Icon name="check" size={28} />
              </div>
              <h2 className="otp-title">{t('otp.verifiedTitle')}</h2>
              <p className="otp-text" style={{ marginBottom: 0 }}>
                {t('otp.verifiedText')}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
