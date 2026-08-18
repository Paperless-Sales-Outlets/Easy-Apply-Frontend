import React, { forwardRef, useImperativeHandle, useRef, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { FiCheckCircle, FiShield, FiX, FiRefreshCw } from 'react-icons/fi';
import api from '../../utils/api';

const RESEND_SECONDS = 30;

const NewApplicantStep = forwardRef(function NewApplicantStep({ isActive }, ref) {
  const { t } = useTranslation();

  const [contactNo, setContactNo] = useState('');
  const [verified, setVerified] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [sending, setSending] = useState(false);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [otpError, setOtpError] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [resendIn, setResendIn] = useState(RESEND_SECONDS);
  const inputRefs = useRef([]);

  useEffect(() => {
    if (!modalOpen) return;
    setResendIn(RESEND_SECONDS);
    const id = setTimeout(() => inputRefs.current[0]?.focus(), 50);
    return () => clearTimeout(id);
  }, [modalOpen]);

  useEffect(() => {
    if (!modalOpen || resendIn <= 0) return;
    const id = setTimeout(() => setResendIn((s) => s - 1), 1000);
    return () => clearTimeout(id);
  }, [modalOpen, resendIn]);

  // Expose validate() so the parent wizard can block advancing past this step
  // until the new applicant's phone number has been OTP-verified.
  useImperativeHandle(ref, () => ({
    validate: () => {
      if (!verified) {
        toast.error('Please verify the new applicant’s phone number to proceed');
        return false;
      }
      return true;
    },
  }));

  const sendOtp = async () => {
    if (!/^\d{9,10}$/.test(contactNo.replace(/\D/g, ''))) {
      toast.error('Please enter a valid mobile number first');
      return;
    }
    setSending(true);
    try {
      await api.post('/otp/send', { phone: contactNo });
    } catch (err) {
      // Demo/offline fallback — proceed to the OTP modal regardless.
    } finally {
      setSending(false);
      setOtp(['', '', '', '', '', '']);
      setOtpError('');
      setModalOpen(true);
    }
  };

  const submitOtp = async (code) => {
    setVerifying(true);
    setOtpError('');
    try {
      const res = await api.post('/otp/verify', { phone: contactNo, otp: code });
      if (res.data && res.data.success) {
        setVerified(true);
        setModalOpen(false);
      } else {
        setOtpError(res.data?.message || 'Invalid or expired verification code.');
        setOtp(['', '', '', '', '', '']);
        setTimeout(() => inputRefs.current[0]?.focus(), 50);
      }
    } catch (err) {
      // Demo bypass — 000000 (or any offline failure) counts as verified.
      if (code === '000000' || !err.response) {
        setVerified(true);
        setModalOpen(false);
      } else {
        setOtpError(err.response?.data?.message || 'Invalid or expired verification code.');
        setOtp(['', '', '', '', '', '']);
        setTimeout(() => inputRefs.current[0]?.focus(), 50);
      }
    } finally {
      setVerifying(false);
    }
  };

  const handleOtpChange = (index, raw) => {
    if (verifying) return;
    const value = raw.replace(/\D/g, '');
    const next = [...otp];
    next[index] = value.slice(-1) || '';
    setOtp(next);

    if (value && index < 5) inputRefs.current[index + 1]?.focus();

    const joined = next.join('');
    if (joined.length === 6) submitOtp(joined);
    else if (otpError) setOtpError('');
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleResend = async () => {
    if (resendIn > 0 || verifying) return;
    setOtp(['', '', '', '', '', '']);
    setOtpError('');
    try {
      await api.post('/otp/send', { phone: contactNo });
    } catch (err) {
      // fine — demo code still works
    }
    setResendIn(RESEND_SECONDS);
    setTimeout(() => inputRefs.current[0]?.focus(), 50);
  };

  const handleContactNoChange = (e) => {
    setContactNo(e.target.value.replace(/\D/g, '').slice(0, 10));
    setVerified(false);
  };

  return (
    <div>
      <h3 style={{ color: 'var(--slt-blue)', marginBottom: '1.5rem' }}>{t('wizards.ownershipChange.newApplicant.heading')}</h3>

      <div className="form-group">
        <label className="form-label" htmlFor="na-fullName">{t('wizards.ownershipChange.newApplicant.fullName')}</label>
        <input id="na-fullName" name="fullName" type="text" className="form-control" required={isActive} />
      </div>

      <div className="form-group flex flex-col-mobile gap-4">
        <div style={{ flex: '1', minWidth: 0 }}>
          <label className="form-label" htmlFor="na-nic">{t('wizards.ownershipChange.newApplicant.nicBrc')}</label>
          <input id="na-nic" name="nic" type="text" className="form-control" required={isActive} />
        </div>
        <div style={{ flex: '1', minWidth: 0 }}>
          <label className="form-label" htmlFor="na-contactNo">{t('wizards.ownershipChange.newApplicant.contactNo')}</label>
          <div style={{ position: 'relative', display: 'flex', gap: '0.5rem', alignItems: 'stretch' }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <input
                id="na-contactNo"
                name="contactNo"
                type="tel"
                inputMode="numeric"
                className="form-control"
                value={contactNo}
                onChange={handleContactNoChange}
                readOnly={verified}
                disabled={verified}
                placeholder="7X XXX XXXX"
                required={isActive}
                style={verified ? { paddingRight: '2.25rem' } : undefined}
              />
              {verified && (
                <FiCheckCircle
                  size={18}
                  style={{ position: 'absolute', right: '0.65rem', top: '50%', transform: 'translateY(-50%)', color: '#16a34a' }}
                  title="Phone number verified"
                />
              )}
            </div>
            {verified ? (
              <button
                type="button"
                onClick={() => setVerified(false)}
                className="btn btn-secondary"
                style={{ whiteSpace: 'nowrap', flexShrink: 0 }}
              >
                Change
              </button>
            ) : (
              <button
                type="button"
                onClick={sendOtp}
                disabled={sending || !contactNo}
                className="btn btn-primary"
                style={{ whiteSpace: 'nowrap', flexShrink: 0 }}
              >
                {sending ? 'Sending...' : 'Verify'}
              </button>
            )}
          </div>
          {/* Hidden field so the parent form's FormData scrape captures verification status */}
          <input type="hidden" name="contactNoVerified" value={verified ? 'true' : 'false'} />
          {!verified && (
            <span style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: '0.35rem', display: 'block' }}>
              We'll text a 6-digit code to confirm this number belongs to the new applicant.
            </span>
          )}
        </div>
      </div>

      <div className="form-group">
        <label className="form-label" htmlFor="na-email">{t('wizards.ownershipChange.newApplicant.email')}</label>
        <input id="na-email" name="email" type="email" className="form-control" required={isActive} />
      </div>

      <div className="form-group">
        <label className="form-label" htmlFor="na-remarks">{t('wizards.ownershipChange.newApplicant.remarks')}</label>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
          {t('wizards.ownershipChange.newApplicant.remarksNote')}
        </p>
        <textarea id="na-remarks" name="newRemarks" className="form-control" rows="3"></textarea>
      </div>

      {/* OTP Verification Modal — blurs everything behind it */}
      <AnimatePresence>
        {modalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 1000,
              backgroundColor: 'rgba(15, 23, 42, 0.45)',
              backdropFilter: 'blur(6px)',
              WebkitBackdropFilter: 'blur(6px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '1rem',
            }}
            onClick={() => setModalOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.2 }}
              onClick={(e) => e.stopPropagation()}
              style={{
                backgroundColor: '#ffffff',
                borderRadius: '20px',
                padding: '2.25rem 2rem',
                width: '100%',
                maxWidth: '380px',
                boxShadow: '0 24px 60px rgba(0, 0, 0, 0.25)',
                textAlign: 'center',
                position: 'relative',
              }}
            >
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                style={{
                  position: 'absolute',
                  top: '1rem',
                  right: '1rem',
                  background: 'none',
                  border: 'none',
                  color: '#94a3b8',
                  cursor: 'pointer',
                  display: 'flex',
                }}
                aria-label="Close"
              >
                <FiX size={20} />
              </button>

              <div
                style={{
                  backgroundColor: '#dcfce7',
                  color: '#16a34a',
                  width: '54px',
                  height: '54px',
                  borderRadius: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1.25rem auto',
                }}
              >
                <FiShield size={26} />
              </div>

              <h3 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#0f172a', margin: '0 0 0.3rem 0' }}>
                Verify New Applicant's Number
              </h3>
              <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '1.5rem', fontWeight: 500 }}>
                Enter the 6-digit code sent to <strong style={{ color: '#0f172a' }}>+94 {contactNo}</strong>
              </p>

              <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => { inputRefs.current[index] = el; }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    disabled={verifying}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    style={{
                      width: '44px',
                      height: '52px',
                      borderRadius: '12px',
                      border: digit ? '2px solid #10b981' : otpError ? '2px solid #dc2626' : '1.5px solid #cbd5e1',
                      backgroundColor: digit ? '#f0fdf4' : '#ffffff',
                      fontSize: '1.3rem',
                      fontWeight: 900,
                      color: '#0f172a',
                      textAlign: 'center',
                      outline: 'none',
                    }}
                  />
                ))}
              </div>

              {otpError && (
                <p style={{ color: '#dc2626', fontSize: '0.82rem', marginBottom: '1rem', fontWeight: 700 }}>
                  ⚠️ {otpError}
                </p>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
                {resendIn > 0 ? (
                  <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>
                    Resend code in <strong style={{ color: '#0f172a' }}>{resendIn}s</strong>
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={handleResend}
                    disabled={verifying}
                    style={{ background: 'none', border: 'none', color: '#0056b3', fontSize: '0.82rem', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
                  >
                    <FiRefreshCw size={13} />
                    <span>Resend Code</span>
                  </button>
                )}

                <div
                  style={{
                    backgroundColor: '#eff6ff',
                    color: '#1e40af',
                    padding: '0.35rem 0.8rem',
                    borderRadius: '9999px',
                    fontSize: '0.75rem',
                    fontWeight: 800,
                    border: '1px solid #bfdbfe',
                  }}
                >
                  💡 Demo Code: <strong>000000</strong>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});

export default NewApplicantStep;
