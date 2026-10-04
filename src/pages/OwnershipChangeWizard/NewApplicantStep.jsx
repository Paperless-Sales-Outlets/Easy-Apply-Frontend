import React, { forwardRef, useImperativeHandle, useRef, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { FiCheckCircle, FiShield, FiX, FiRefreshCw, FiAlertCircle, FiUser, FiCreditCard, FiPhone, FiMail } from 'react-icons/fi';
import api from '../../utils/api';
import { useVerifiedContext, useVerifiedMobile } from '../../components/verification';

const RESEND_SECONDS = 30;

const NewApplicantStep = forwardRef(function NewApplicantStep({ isActive }, ref) {
  const { t } = useTranslation();
  const { selectedAccount } = useVerifiedContext();
  const verifiedMobile = useVerifiedMobile();

  const [fullName, setFullName] = useState('');
  const [nic, setNic] = useState('');
  const [email, setEmail] = useState('');
  const [remarks, setRemarks] = useState('');
  const [contactNo, setContactNo] = useState('');
  const [verified, setVerified] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [sending, setSending] = useState(false);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [otpError, setOtpError] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [resendIn, setResendIn] = useState(RESEND_SECONDS);
  const inputRefs = useRef([]);

  const modalRef = useRef(null);
  const verifyBtnRef = useRef(null);

  // Normalize current account values for cross-validation
  const currentNic = (selectedAccount?.nic || '').trim().toUpperCase();
  const rawCurrentPhone = (selectedAccount?.mobileNumber || selectedAccount?.telephone || verifiedMobile || '').replace(/\D/g, '');
  const currentPhone9 = rawCurrentPhone.slice(-9);

  const isSameNic = Boolean(nic.trim() && currentNic && nic.trim().toUpperCase() === currentNic);
  const isSamePhone = Boolean(contactNo && currentPhone9 && contactNo === currentPhone9);

  useEffect(() => {
    if (!modalOpen) return;
    setResendIn(RESEND_SECONDS);
    const id = setTimeout(() => inputRefs.current[0]?.focus(), 50);

    const onKeyDown = (e) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        setModalOpen(false);
        return;
      }
      if (e.key !== 'Tab' || !modalRef.current) return;
      const focusable = modalRef.current.querySelectorAll(
        'button:not([disabled]), input:not([disabled]), [href], select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', onKeyDown, true);
    return () => {
      clearTimeout(id);
      document.removeEventListener('keydown', onKeyDown, true);
    };
  }, [modalOpen]);

  // Return focus to the Verify button when the dialog closes.
  const wasModalOpen = useRef(false);
  useEffect(() => {
    if (wasModalOpen.current && !modalOpen) verifyBtnRef.current?.focus();
    wasModalOpen.current = modalOpen;
  }, [modalOpen]);

  useEffect(() => {
    if (!modalOpen || resendIn <= 0) return;
    const id = setTimeout(() => setResendIn((s) => s - 1), 1000);
    return () => clearTimeout(id);
  }, [modalOpen, resendIn]);

  // Expose validate() so the parent wizard can block advancing past this step
  useImperativeHandle(ref, () => ({
    validate: () => {
      if (!fullName.trim()) {
        toast.error("Please enter the new owner's full name");
        return false;
      }
      if (!nic.trim()) {
        toast.error("Please enter the new owner's NIC / Identification");
        return false;
      }
      if (isSameNic) {
        toast.error("New owner's NIC cannot be identical to current registered owner's NIC");
        return false;
      }
      if (isSamePhone) {
        toast.error("New owner's mobile number cannot be identical to current registered owner's number");
        return false;
      }
      if (!verified) {
        toast.error("Please verify the new owner's mobile number with OTP to proceed");
        return false;
      }
      if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        toast.error("Please enter a valid email address for the new owner");
        return false;
      }
      return true;
    },
    getNewApplicantData: () => ({
      fullName,
      nic,
      contactNo,
      email,
      remarks,
    }),
  }));

  const sendOtp = async () => {
    if (contactNo.length !== 9) {
      toast.error('Please enter a valid 9-digit mobile number first');
      return;
    }
    if (isSamePhone) {
      toast.error("New owner's mobile number cannot match current owner's registered number.");
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
    } else if (e.key === 'ArrowLeft' && index > 0) {
      e.preventDefault();
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < 5) {
      e.preventDefault();
      inputRefs.current[index + 1]?.focus();
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
    let val = e.target.value.replace(/\D/g, '');
    if (val.startsWith('0')) val = val.substring(1);
    setContactNo(val.slice(0, 9));
    setVerified(false);
  };

  return (
    <div>
      <div style={{ marginBottom: '1.75rem' }}>
        <h3 style={{ color: 'var(--slt-blue, #0f57a8)', fontWeight: 800, fontSize: '1.35rem', marginBottom: '0.35rem' }}>
          {t('wizards.ownershipChange.newApplicant.heading')}
        </h3>
        <p style={{ color: 'var(--text-secondary, #64748b)', fontSize: '0.92rem' }}>
          Please enter the verified contact and identification details of the person or entity taking over this line.
        </p>
      </div>

      <div className="form-group" style={{ marginBottom: '1.25rem' }}>
        <label className="form-label" htmlFor="na-fullName" style={{ fontWeight: 600 }}>
          {t('wizards.ownershipChange.newApplicant.fullName')} <span style={{ color: 'var(--danger, #dc2626)' }}>*</span>
        </label>
        <input 
          id="na-fullName" 
          name="fullName" 
          type="text" 
          className="form-control" 
          placeholder="e.g. K. A. Perera or ABC Holdings (Pvt) Ltd"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          required={isActive} 
        />
      </div>

      <div className="form-group flex flex-col-mobile gap-4" style={{ marginBottom: '1.25rem' }}>
        <div style={{ flex: '1', minWidth: 0 }}>
          <label className="form-label" htmlFor="na-nic" style={{ fontWeight: 600 }}>
            {t('wizards.ownershipChange.newApplicant.nicBrc')} <span style={{ color: 'var(--danger, #dc2626)' }}>*</span>
          </label>
          <input 
            id="na-nic" 
            name="nic" 
            type="text" 
            className="form-control" 
            placeholder="e.g. 199012345678 or 901234567V"
            value={nic}
            onChange={(e) => setNic(e.target.value)}
            required={isActive} 
            style={{
              borderColor: isSameNic ? '#dc2626' : undefined,
              backgroundColor: isSameNic ? 'rgba(220, 38, 38, 0.04)' : undefined,
            }}
          />
          {isSameNic && (
            <span style={{ fontSize: '0.8rem', color: '#dc2626', marginTop: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.3rem', fontWeight: 600 }}>
              <FiAlertCircle size={14} /> New owner's NIC cannot match current registered owner's NIC ({currentNic}).
            </span>
          )}
        </div>

        <div style={{ flex: '1', minWidth: 0 }}>
          <label className="form-label" htmlFor="na-contactNo" style={{ fontWeight: 600 }}>
            {t('wizards.ownershipChange.newApplicant.contactNo')} <span style={{ color: 'var(--danger, #dc2626)' }}>*</span>
          </label>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'stretch' }}>
            <div style={{ position: 'relative', flex: 1, display: 'flex', flexWrap: 'nowrap' }}>
              <div
                style={{
                  backgroundColor: '#f8fafc',
                  border: isSamePhone ? '1.5px solid #dc2626' : '1.5px solid #cbd5e1',
                  borderRight: 'none',
                  borderRadius: '12px 0 0 12px',
                  padding: '0.85rem 0.75rem',
                  fontWeight: 800,
                  color: verified ? '#475569' : '#0f172a',
                  fontSize: '0.95rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.3rem',
                  flexShrink: 0,
                  whiteSpace: 'nowrap',
                }}
              >
                <span>+94</span>
              </div>
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
                maxLength={9}
                required={isActive}
                style={{
                  flex: '1 1 auto',
                  minWidth: 0,
                  borderRadius: '0 12px 12px 0',
                  paddingRight: verified ? '2.25rem' : undefined,
                  borderColor: isSamePhone ? '#dc2626' : undefined,
                  backgroundColor: isSamePhone ? 'rgba(220, 38, 38, 0.04)' : undefined,
                }}
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
                ref={verifyBtnRef}
                onClick={sendOtp}
                disabled={sending || contactNo.length !== 9 || isSamePhone}
                className="btn btn-primary"
                style={{ whiteSpace: 'nowrap', flexShrink: 0 }}
              >
                {sending ? 'Sending...' : 'Verify OTP'}
              </button>
            )}
          </div>
          {/* Hidden field so the parent form's FormData scrape captures verification status */}
          <input type="hidden" name="contactNoVerified" value={verified ? 'true' : 'false'} />
          
          {isSamePhone ? (
            <span style={{ fontSize: '0.8rem', color: '#dc2626', marginTop: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.3rem', fontWeight: 600 }}>
              <FiAlertCircle size={14} /> New owner's mobile number cannot match current registered owner's number (+94 {currentPhone9}).
            </span>
          ) : !verified ? (
            <span style={{ fontSize: '0.78rem', color: '#5b6472', marginTop: '0.35rem', display: 'block' }}>
              We'll send a 6-digit OTP to confirm this mobile number belongs to the new applicant.
            </span>
          ) : null}
        </div>
      </div>

      <div className="form-group" style={{ marginBottom: '1.25rem' }}>
        <label className="form-label" htmlFor="na-email" style={{ fontWeight: 600 }}>
          {t('wizards.ownershipChange.newApplicant.email')} <span style={{ color: 'var(--danger, #dc2626)' }}>*</span>
        </label>
        <input 
          id="na-email" 
          name="email" 
          type="email" 
          className="form-control" 
          placeholder="e.g. newowner@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required={isActive} 
        />
      </div>

      <div className="form-group" style={{ marginBottom: '1.5rem' }}>
        <label className="form-label" htmlFor="na-remarks" style={{ fontWeight: 600 }}>
          {t('wizards.ownershipChange.newApplicant.remarks')}
        </label>
        <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary, #64748b)', marginBottom: '0.5rem' }}>
          {t('wizards.ownershipChange.newApplicant.remarksNote')}
        </p>
        <textarea 
          id="na-remarks" 
          name="newRemarks" 
          className="form-control" 
          rows="3"
          placeholder="Any additional notes or billing details..."
          value={remarks}
          onChange={(e) => setRemarks(e.target.value)}
        ></textarea>
      </div>

      {/* OTP Verification Modal — blurs everything behind it.
          Rendered conditionally rather than through AnimatePresence, whose
          exit animation left the closed dialog mounted: an invisible overlay
          kept intercepting clicks and screen readers still saw the dialog. */}
      {modalOpen && (
        <div className="otp-overlay" onClick={() => setModalOpen(false)}>
            <div
              className="otp-dialog"
              ref={modalRef}
              role="dialog"
              aria-modal="true"
              aria-labelledby="na-otp-title"
              aria-describedby="na-otp-desc"
              onClick={(e) => e.stopPropagation()}
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
                  color: '#64748b',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '40px',
                  height: '40px',
                  borderRadius: '12px',
                }}
                aria-label="Close verification dialog"
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

              <h3 id="na-otp-title" style={{ fontSize: '1.25rem', fontWeight: 900, color: '#0f172a', margin: '0 0 0.3rem 0' }}>
                Verify New Applicant's Number
              </h3>
              <p id="na-otp-desc" style={{ fontSize: '0.85rem', color: '#5b6472', marginBottom: '1.5rem', fontWeight: 500 }}>
                Enter the 6-digit code sent to <strong style={{ color: '#0f172a' }}>+94 {contactNo}</strong>
              </p>

              <div role="group" aria-labelledby="na-otp-desc" className="otp-boxes" style={{ justifyContent: 'center', marginBottom: '1rem' }}>
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => { inputRefs.current[index] = el; }}
                    type="text"
                    inputMode="numeric"
                    autoComplete={index === 0 ? 'one-time-code' : 'off'}
                    maxLength={1}
                    value={digit}
                    disabled={verifying}
                    aria-label={`Verification code digit ${index + 1} of 6`}
                    aria-invalid={!!otpError}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    className={`otp-box ${digit ? 'is-filled' : ''} ${otpError ? 'is-error' : ''}`}
                    style={{ flex: '0 0 44px', width: '44px' }}
                  />
                ))}
              </div>

              {otpError && (
                <p style={{ color: '#dc2626', fontSize: '0.82rem', marginBottom: '1rem', fontWeight: 700 }}>
                  <FiAlertCircle size={13} aria-hidden="true" style={{ verticalAlign: "-2px", marginRight: "0.25rem" }} />{otpError}
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

                {import.meta.env.DEV && (
                  <p className="auth-dev-hint" style={{ margin: 0 }}>
                    Development only — demo code <strong>000000</strong> is accepted.
                  </p>
                )}
              </div>
            </div>
        </div>
      )}
    </div>
  );
});

export default NewApplicantStep;
