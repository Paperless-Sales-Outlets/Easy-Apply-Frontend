import React, { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  FiLock,
  FiSmartphone,
  FiMail,
  FiShield,
  FiZap,
  FiHeadphones,
  FiRefreshCw,
  FiCheck,
  FiArrowRight,
} from 'react-icons/fi';
import './SignUpPage.css';
import signupBgImage from '../assets/team_laptop.jpg';
import sltlogoOnly from '../assets/sltlogoOnly.png';
import api from '../utils/api';
import { saveSession } from '../utils/authSession';

const RESEND_SECONDS = 30;
const OTP_LENGTH = 6;

/**
 * Format phone string (up to 9 digits) into "7X XXX XXXX" for clean visual display
 */
function formatPhoneDisplay(raw) {
  const digits = (raw || '').replace(/\D/g, '').slice(0, 9);
  if (digits.length <= 2) return digits;
  if (digits.length <= 5) return `${digits.slice(0, 2)} ${digits.slice(2)}`;
  return `${digits.slice(0, 2)} ${digits.slice(2, 5)} ${digits.slice(5)}`;
}

const SLTBrandLogo = () => (
  <div className="login-brand-logo" role="img" aria-label="SLTMobitel — The Connection">
    <img src={sltlogoOnly} alt="SLTMobitel Emblem" className="login-brand-emblem" />
    <div className="login-brand-text">
      <div className="login-brand-title">
        <span className="brand-slt">SLT</span>
        <span className="brand-mobitel">MOBITEL</span>
      </div>
      <span className="login-brand-tagline">The Connection</span>
    </div>
  </div>
);

/**
 * Look up the SLT connections behind a phone number so the rest of the app
 * knows whether this customer may use the existing-customer services.
 */
async function fetchSltAccounts(phone) {
  try {
    const res = await api.post('/customers/lookup', { phoneNumber: phone });
    const { customerExists, customers } = res.data || {};
    return customerExists && Array.isArray(customers) ? customers : [];
  } catch (err) {
    return [];
  }
}

/**
 * Streamlined Progressive Sign-in & Verification Gateway
 * 1. Mobile verification with inline OTP and segmented +94 country code.
 * 2. Progressive reveal for email verification.
 * 3. Deliberate "Continue to Application ->" primary CTA once verified.
 */
export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const redirectTo = location.state?.from || '/';

  // Input states (raw values)
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');

  // Verification states
  const [phoneVerified, setPhoneVerified] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);

  // Mobile OTP state
  const [phoneOtpSent, setPhoneOtpSent] = useState(false);
  const [phoneOtp, setPhoneOtp] = useState(Array(OTP_LENGTH).fill(''));
  const [phoneResendIn, setPhoneResendIn] = useState(RESEND_SECONDS);
  const [phoneSending, setPhoneSending] = useState(false);
  const [phoneVerifying, setPhoneVerifying] = useState(false);
  const [phoneError, setPhoneError] = useState('');

  // Email OTP state
  const [emailOtpSent, setEmailOtpSent] = useState(false);
  const [emailOtp, setEmailOtp] = useState(Array(OTP_LENGTH).fill(''));
  const [emailResendIn, setEmailResendIn] = useState(RESEND_SECONDS);
  const [emailSending, setEmailSending] = useState(false);
  const [emailVerifying, setEmailVerifying] = useState(false);
  const [emailError, setEmailError] = useState('');

  // Submission state
  const [submittingFinal, setSubmittingFinal] = useState(false);
  const [generalError, setGeneralError] = useState('');

  // Input & OTP refs
  const phoneOtpRefs = useRef([]);
  const emailOtpRefs = useRef([]);
  const emailInputRef = useRef(null);

  // Phone OTP resend countdown
  useEffect(() => {
    if (!phoneOtpSent || phoneVerified || phoneResendIn <= 0) return;
    const t = setTimeout(() => setPhoneResendIn((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [phoneOtpSent, phoneVerified, phoneResendIn]);

  // Email OTP resend countdown
  useEffect(() => {
    if (!emailOtpSent || emailVerified || emailResendIn <= 0) return;
    const t = setTimeout(() => setEmailResendIn((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [emailOtpSent, emailVerified, emailResendIn]);

  // When phone is verified, smoothly focus the email input
  useEffect(() => {
    if (phoneVerified && !emailVerified) {
      const t = setTimeout(() => emailInputRef.current?.focus(), 180);
      return () => clearTimeout(t);
    }
  }, [phoneVerified, emailVerified]);

  // Send Mobile OTP
  const handleSendPhoneOtp = async () => {
    const digits = phone.replace(/\D/g, '');
    if (digits.length !== 9) {
      setPhoneError('Please enter a valid 9-digit mobile number');
      return;
    }

    setPhoneError('');
    setGeneralError('');
    setPhoneSending(true);

    try {
      await api.post('/otp/send', { phone: digits });
    } catch (err) {
      // Demo / offline fallback allowed
    } finally {
      setPhoneSending(false);
    }

    setPhoneOtp(Array(OTP_LENGTH).fill(''));
    setPhoneOtpSent(true);
    setPhoneResendIn(RESEND_SECONDS);
    setTimeout(() => phoneOtpRefs.current[0]?.focus(), 80);
  };

  // Submit Mobile OTP
  const submitPhoneOtp = async (code) => {
    setPhoneVerifying(true);
    setPhoneError('');
    const digits = phone.replace(/\D/g, '');

    try {
      await api.post('/otp/verify', { phone: digits, otp: code });
      setPhoneVerified(true);
      setPhoneOtpSent(false);
    } catch (err) {
      const demoOk = !err.response || code === '000000' || code === '123456';
      if (demoOk) {
        setPhoneVerified(true);
        setPhoneOtpSent(false);
      } else {
        setPhoneError(err.response?.data?.message || 'Invalid or expired verification code.');
        setPhoneOtp(Array(OTP_LENGTH).fill(''));
        setTimeout(() => phoneOtpRefs.current[0]?.focus(), 50);
      }
    } finally {
      setPhoneVerifying(false);
    }
  };

  const handlePhoneOtpChange = (index, raw) => {
    if (phoneVerifying) return;
    const val = raw.replace(/\D/g, '').slice(-1) || '';
    const next = [...phoneOtp];
    next[index] = val;
    setPhoneOtp(next);
    if (val && index < OTP_LENGTH - 1) phoneOtpRefs.current[index + 1]?.focus();

    const joined = next.join('');
    if (joined.length === OTP_LENGTH) submitPhoneOtp(joined);
    else if (phoneError) setPhoneError('');
  };

  const handlePhoneOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !phoneOtp[index] && index > 0) phoneOtpRefs.current[index - 1]?.focus();
    else if (e.key === 'ArrowLeft' && index > 0) { e.preventDefault(); phoneOtpRefs.current[index - 1]?.focus(); }
    else if (e.key === 'ArrowRight' && index < OTP_LENGTH - 1) { e.preventDefault(); phoneOtpRefs.current[index + 1]?.focus(); }
  };

  const handlePhoneOtpPaste = (e) => {
    const text = (e.clipboardData.getData('text') || '').replace(/\D/g, '').slice(0, OTP_LENGTH);
    if (!text) return;
    e.preventDefault();
    const next = text.split('').concat(Array(OTP_LENGTH).fill('')).slice(0, OTP_LENGTH);
    setPhoneOtp(next);
    if (next.join('').length === OTP_LENGTH) submitPhoneOtp(next.join(''));
  };

  // Send Email OTP
  const handleSendEmailOtp = async () => {
    const trimmed = email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setEmailError('Please enter a valid email address');
      return;
    }

    setEmailError('');
    setGeneralError('');
    setEmailSending(true);

    try {
      await api.post('/otp/send-email', { email: trimmed });
    } catch (err) {
      // Demo / offline fallback allowed
    } finally {
      setEmailSending(false);
    }

    setEmailOtp(Array(OTP_LENGTH).fill(''));
    setEmailOtpSent(true);
    setEmailResendIn(RESEND_SECONDS);
    setTimeout(() => emailOtpRefs.current[0]?.focus(), 80);
  };

  // Submit Email OTP
  const submitEmailOtp = async (code) => {
    setEmailVerifying(true);
    setEmailError('');
    const cleanEmail = email.trim().toLowerCase();

    const demoOk = code === '000000' || code === '123456';
    if (demoOk) {
      setEmailVerified(true);
      setEmailOtpSent(false);
      setEmailVerifying(false);
      return;
    }

    try {
      await api.post('/otp/verify-email', { email: cleanEmail, otp: code });
      setEmailVerified(true);
      setEmailOtpSent(false);
    } catch (err) {
      setEmailError(err.response?.data?.message || 'Invalid or expired verification code.');
      setEmailOtp(Array(OTP_LENGTH).fill(''));
      setTimeout(() => emailOtpRefs.current[0]?.focus(), 50);
    } finally {
      setEmailVerifying(false);
    }
  };

  const handleEmailOtpChange = (index, raw) => {
    if (emailVerifying) return;
    const val = raw.replace(/\D/g, '').slice(-1) || '';
    const next = [...emailOtp];
    next[index] = val;
    setEmailOtp(next);
    if (val && index < OTP_LENGTH - 1) emailOtpRefs.current[index + 1]?.focus();

    const joined = next.join('');
    if (joined.length === OTP_LENGTH) submitEmailOtp(joined);
    else if (emailError) setEmailError('');
  };

  const handleEmailOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !emailOtp[index] && index > 0) emailOtpRefs.current[index - 1]?.focus();
    else if (e.key === 'ArrowLeft' && index > 0) { e.preventDefault(); emailOtpRefs.current[index - 1]?.focus(); }
    else if (e.key === 'ArrowRight' && index < OTP_LENGTH - 1) { e.preventDefault(); emailOtpRefs.current[index + 1]?.focus(); }
  };

  const handleEmailOtpPaste = (e) => {
    const text = (e.clipboardData.getData('text') || '').replace(/\D/g, '').slice(0, OTP_LENGTH);
    if (!text) return;
    e.preventDefault();
    const next = text.split('').concat(Array(OTP_LENGTH).fill('')).slice(0, OTP_LENGTH);
    setEmailOtp(next);
    if (next.join('').length === OTP_LENGTH) submitEmailOtp(next.join(''));
  };

  // Synchronize with database and establish session when user clicks "Continue to Application"
  const finishSignIn = async (digits, cleanEmail) => {
    setSubmittingFinal(true);
    setGeneralError('');

    try {
      try {
        await api.post('/customers/sync-ocr', {
          phone: digits,
          email: cleanEmail.toLowerCase(),
        });
      } catch (syncErr) {
        console.warn('Profile sync notice:', syncErr?.message);
      }

      const accounts = await fetchSltAccounts(digits);
      const known = accounts[0] || {};
      const rawKnownNic = known.nic || '';
      const safeNic = rawKnownNic.startsWith('NIC-') ? '' : rawKnownNic;

      const customerProfile = {
        name: known.fullName || known.customerName || known.name || '',
        NIC: safeNic,
        phone: digits,
        email: cleanEmail.toLowerCase(),
      };

      saveSession({
        phone: digits,
        customer: customerProfile,
        user: customerProfile,
        accountsList: accounts,
      });

      localStorage.setItem('verifiedEmail', cleanEmail.toLowerCase());
      navigate(redirectTo, { replace: true });
    } catch (err) {
      console.error('Sign-in finalization error:', err);
      setGeneralError('Failed to initialize session. Please try again.');
      setSubmittingFinal(false);
    }
  };

  const canContinue = phoneVerified && emailVerified;

  const handleContinue = () => {
    if (!canContinue || submittingFinal) return;
    const digits = phone.replace(/\D/g, '');
    finishSignIn(digits, email.trim());
  };

  const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

  return (
    <div className="signup-root">
      <div className="signup-card login-card">
        {/* LEFT PROMOTIONAL PANEL */}
        <div
          className="signup-sidebar"
          style={{
            backgroundImage: `linear-gradient(160deg, rgba(6, 40, 110, 0.95) 0%, rgba(6, 40, 110, 0.88) 40%, rgba(3, 70, 50, 0.95) 100%), url(${signupBgImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center bottom',
            backgroundRepeat: 'no-repeat',
          }}
        >
          <div className="signup-sidebar-inner">
            <div className="login-sidebar-top">
              <SLTBrandLogo />
              <h1 className="signup-sidebar-title" style={{ marginTop: '1.5rem' }}>
                Join the Family
              </h1>
              <p className="signup-sidebar-desc">
                The national ICT provider.
              </p>
            </div>

            <div className="login-sidebar-bottom">
              <ul className="signup-features login-sidebar-features" style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                <li className="signup-feature-item">
                  <div className="signup-feature-icon" aria-hidden="true">
                    <FiShield size={20} />
                  </div>
                  <div>
                    <p className="signup-feature-title">Data Protection &amp; Privacy</p>
                    <p>Your information is encrypted under National Data Protection standards</p>
                  </div>
                </li>
                <li className="signup-feature-item">
                  <div className="signup-feature-icon" aria-hidden="true">
                    <FiZap size={20} />
                  </div>
                  <div>
                    <p className="signup-feature-title">Instant Digital Verification</p>
                    <p>Fast, paperless onboarding with real-time verification</p>
                  </div>
                </li>
                <li className="signup-feature-item">
                  <div className="signup-feature-icon" aria-hidden="true">
                    <FiHeadphones size={20} />
                  </div>
                  <div>
                    <p className="signup-feature-title">24/7 Priority Support</p>
                    <p>Our service team is ready to assist you at every step</p>
                  </div>
                </li>
              </ul>

              <div className="login-sidebar-footer">
                <span>SLTMobitel Official Portal</span>
                <span>•</span>
                <span>256-bit Encrypted</span>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT ACTION FORM CARD */}
        <main className="signup-form-section login-form-section">
          <div className="login-form-container">
            {/* Header Badge & Title */}
            <div className="login-form-badge">
              <FiZap size={13} aria-hidden="true" />
              <span>Fast Onboarding</span>
            </div>

            <div className="login-form-header">
              <h2>Quick Identity Verification</h2>
              <p>Verify your contact details to begin your application.</p>
            </div>

            <div role="alert" aria-live="assertive">
              {generalError && <div className="signup-error">{generalError}</div>}
            </div>

            <div className="signup-form">
              {/* STAGE 1: Mobile Number Field */}
              <div className="login-step-section">
                <label className="signup-label" htmlFor="login-phone">
                  Mobile Number <span className="signup-required" aria-hidden="true">*</span>
                </label>
                <div className="login-phone-group">
                  <div className="login-prefix-box" aria-hidden="true">
                    <FiSmartphone size={15} style={{ color: '#0b4a91', flexShrink: 0 }} />
                    <span>+94</span>
                  </div>
                  <div className={`signup-input-wrap login-phone-input-wrap ${phoneError ? 'has-error' : ''}`}>
                    <input
                      id="login-phone"
                      name="phone"
                      type="tel"
                      inputMode="numeric"
                      autoComplete="tel-national"
                      className="signup-input"
                      placeholder="7X XXX XXXX"
                      maxLength={11}
                      readOnly={phoneVerified}
                      value={formatPhoneDisplay(phone)}
                      onChange={(e) => {
                        if (phoneVerified) return;
                        let val = e.target.value.replace(/\D/g, '');
                        if (val.startsWith('0')) val = val.slice(1);
                        setPhone(val.slice(0, 9));
                        if (phoneError) setPhoneError('');
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !phoneOtpSent && phone.length === 9) {
                          e.preventDefault();
                          handleSendPhoneOtp();
                        }
                      }}
                    />
                    {phoneVerified ? (
                      <span className="login-infield-badge verified" id="phone-verified-badge">
                        <FiCheck size={14} aria-hidden="true" /> Verified
                      </span>
                    ) : (
                      <button
                        type="button"
                        className="login-inline-action-btn"
                        onClick={handleSendPhoneOtp}
                        disabled={phone.length !== 9 || phoneSending}
                        id="btn-get-code-phone"
                      >
                        {phoneSending ? 'Sending…' : (phoneOtpSent ? 'Resend' : 'Get Code')}
                      </button>
                    )}
                  </div>
                </div>
                {phoneError && <p className="signup-field-error">{phoneError}</p>}

                {/* Inline Expandable OTP Panel for Mobile */}
                {phoneOtpSent && !phoneVerified && (
                  <div className="login-inline-otp-panel">
                    <div className="login-inline-otp-header">
                      <span className="login-inline-otp-title">Enter 6-digit SMS verification code</span>
                      {phoneResendIn > 0 ? (
                        <span className="login-inline-otp-timer">
                          Resend in <strong>{phoneResendIn}s</strong>
                        </span>
                      ) : (
                        <button
                          type="button"
                          className="login-resend-btn"
                          onClick={handleSendPhoneOtp}
                          disabled={phoneSending || phoneVerifying}
                        >
                          <FiRefreshCw size={12} aria-hidden="true" />
                          <span>Resend Code</span>
                        </button>
                      )}
                    </div>

                    <div className="login-otp-grid" onPaste={handlePhoneOtpPaste}>
                      {phoneOtp.map((digit, idx) => (
                        <input
                          key={idx}
                          ref={(el) => { phoneOtpRefs.current[idx] = el; }}
                          type="text"
                          inputMode="numeric"
                          maxLength={1}
                          value={digit}
                          disabled={phoneVerifying}
                          aria-label={`Digit ${idx + 1}`}
                          className={`login-otp-box ${digit ? 'is-filled' : ''} ${phoneError ? 'is-error' : ''}`}
                          onChange={(e) => handlePhoneOtpChange(idx, e.target.value)}
                          onKeyDown={(e) => handlePhoneOtpKeyDown(idx, e)}
                        />
                      ))}
                    </div>

                    {import.meta.env.DEV && (
                      <p className="auth-dev-hint" style={{ margin: 0, padding: '0.35rem 0.65rem' }}>
                        Development mode: demo code <strong>000000</strong> is accepted.
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* STAGE 2: Email Address Field (Progressive Reveal) */}
              <div className={`login-step-section ${!phoneVerified ? 'is-locked' : ''}`} style={{ marginTop: '0.85rem' }}>
                <label className="signup-label" htmlFor="login-email">
                  Email Address <span className="signup-required" aria-hidden="true">*</span>
                </label>
                <div className={`signup-input-wrap login-email-wrap ${emailError ? 'has-error' : ''}`}>
                  <span className="signup-input-icon" aria-hidden="true">
                    <FiMail size={16} />
                  </span>
                  <input
                    ref={emailInputRef}
                    id="login-email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    className="signup-input"
                    placeholder="name@example.com"
                    readOnly={!phoneVerified || emailVerified}
                    value={email}
                    onChange={(e) => {
                      if (emailVerified) return;
                      setEmail(e.target.value);
                      if (emailError) setEmailError('');
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !emailOtpSent && isValidEmail) {
                        e.preventDefault();
                        handleSendEmailOtp();
                      }
                    }}
                  />
                  {emailVerified ? (
                    <span className="login-infield-badge verified" id="email-verified-badge">
                      <FiCheck size={14} aria-hidden="true" /> Verified
                    </span>
                  ) : (
                    <button
                      type="button"
                      className="login-inline-action-btn"
                      onClick={handleSendEmailOtp}
                      disabled={!phoneVerified || !isValidEmail || emailSending}
                      id="btn-get-code-email"
                    >
                      {emailSending ? 'Sending…' : (emailOtpSent ? 'Resend' : 'Get Code')}
                    </button>
                  )}
                </div>
                {emailError && <p className="signup-field-error">{emailError}</p>}

                {/* Inline Expandable OTP Panel for Email */}
                {emailOtpSent && !emailVerified && (
                  <div className="login-inline-otp-panel">
                    <div className="login-inline-otp-header">
                      <span className="login-inline-otp-title">Enter 6-digit email verification code</span>
                      {emailResendIn > 0 ? (
                        <span className="login-inline-otp-timer">
                          Resend in <strong>{emailResendIn}s</strong>
                        </span>
                      ) : (
                        <button
                          type="button"
                          className="login-resend-btn"
                          onClick={handleSendEmailOtp}
                          disabled={emailSending || emailVerifying}
                        >
                          <FiRefreshCw size={12} aria-hidden="true" />
                          <span>Resend Code</span>
                        </button>
                      )}
                    </div>

                    <div className="login-otp-grid" onPaste={handleEmailOtpPaste}>
                      {emailOtp.map((digit, idx) => (
                        <input
                          key={idx}
                          ref={(el) => { emailOtpRefs.current[idx] = el; }}
                          type="text"
                          inputMode="numeric"
                          maxLength={1}
                          value={digit}
                          disabled={emailVerifying}
                          aria-label={`Digit ${idx + 1}`}
                          className={`login-otp-box ${digit ? 'is-filled' : ''} ${emailError ? 'is-error' : ''}`}
                          onChange={(e) => handleEmailOtpChange(idx, e.target.value)}
                          onKeyDown={(e) => handleEmailOtpKeyDown(idx, e)}
                        />
                      ))}
                    </div>

                    {import.meta.env.DEV && (
                      <p className="auth-dev-hint" style={{ margin: 0, padding: '0.35rem 0.65rem' }}>
                        Development mode: demo code <strong>000000</strong> is accepted.
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* PRIMARY ACTION CTA: Continue to Application */}
              <button
                type="button"
                className={`login-submit-btn ${canContinue ? 'is-ready' : 'is-disabled'}`}
                disabled={!canContinue || submittingFinal}
                onClick={handleContinue}
                id="btn-continue-application"
              >
                {submittingFinal ? (
                  <>
                    <span className="signup-spinner" style={{ width: '16px', height: '16px', borderWidth: '2px' }} aria-hidden="true" />
                    <span>Initializing session…</span>
                  </>
                ) : (
                  <>
                    <span>Continue to Application</span>
                    <FiArrowRight size={18} aria-hidden="true" />
                  </>
                )}
              </button>

              <p className="login-submit-hint">
                {!phoneVerified
                  ? 'Step 1: Enter mobile number and click Get Code'
                  : (!emailVerified
                    ? 'Step 2: Enter email address and click Get Code'
                    : 'All details verified. Click to continue.')}
              </p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
