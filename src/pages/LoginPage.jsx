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
  FiAlertCircle,
} from 'react-icons/fi';
import './SignUpPage.css';
import signupBgImage from '../assets/team_laptop.jpg';
import sltlogoOnly from '../assets/sltlogoOnly.png';
import api from '../utils/api';
import { saveSession, SESSION_EXPIRED_KEY } from '../utils/authSession';
import { formatTimer, saveOtpTimers, getOtpTimers, clearOtpTimers } from '../utils/otpSecurity';

const OTP_EXPIRY_SECONDS = 300;
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

  // Inactivity Session Expired Banner Message
  const [sessionExpiredMsg, setSessionExpiredMsg] = useState(() => {
    const fromState = location.state?.message || (location.state?.sessionExpired ? 'Your session has expired due to inactivity. Please log in again.' : '');
    const fromStorage = sessionStorage.getItem(SESSION_EXPIRED_KEY);
    const msg = fromState || fromStorage || '';
    if (fromStorage) {
      try { sessionStorage.removeItem(SESSION_EXPIRED_KEY); } catch (_) { }
    }
    return msg;
  });

  // Input states (raw values)
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');

  // Verification states
  const [phoneVerified, setPhoneVerified] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);

  // Mobile OTP state
  const [phoneOtpSent, setPhoneOtpSent] = useState(false);
  const [phoneOtp, setPhoneOtp] = useState(Array(OTP_LENGTH).fill(''));
  const [phoneExpiresIn, setPhoneExpiresIn] = useState(OTP_EXPIRY_SECONDS);
  const [phoneLockoutIn, setPhoneLockoutIn] = useState(0);
  const [phoneOtpExpired, setPhoneOtpExpired] = useState(false);
  const [phoneLockedOut, setPhoneLockedOut] = useState(false);
  const [phoneSending, setPhoneSending] = useState(false);
  const [phoneVerifying, setPhoneVerifying] = useState(false);
  const [phoneError, setPhoneError] = useState('');

  // Email OTP state
  const [emailOtpSent, setEmailOtpSent] = useState(false);
  const [emailOtp, setEmailOtp] = useState(Array(OTP_LENGTH).fill(''));
  const [emailExpiresIn, setEmailExpiresIn] = useState(OTP_EXPIRY_SECONDS);
  const [emailLockoutIn, setEmailLockoutIn] = useState(0);
  const [emailOtpExpired, setEmailOtpExpired] = useState(false);
  const [emailLockedOut, setEmailLockedOut] = useState(false);
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

  // Restore active OTP timers and lockout state from localStorage on phone change or refresh
  useEffect(() => {
    const digits = phone.replace(/\D/g, '');
    if (digits.length === 9) {
      const timers = getOtpTimers(digits);
      if (timers.lockoutIn > 0) {
        setPhoneLockedOut(true);
        setPhoneLockoutIn(timers.lockoutIn);
        setPhoneError('Too many incorrect OTP attempts. OTP verification is locked for 15 minutes.');
      } else {
        setPhoneLockedOut(false);
        setPhoneLockoutIn(0);
      }

      if (timers.expiresIn > 0) {
        setPhoneOtpSent(true);
        setPhoneExpiresIn(timers.expiresIn);
        setPhoneOtpExpired(false);
      } else if (timers.isExpired) {
        setPhoneOtpSent(true);
        setPhoneExpiresIn(0);
        setPhoneOtpExpired(true);
        setPhoneError('Your OTP has expired. Please request a new OTP.');
      }
    }
  }, [phone]);

  // 15-Minute Lockout Countdown: runs every second during lockout
  useEffect(() => {
    if (!phoneLockedOut || phoneLockoutIn <= 0) return;
    const timer = setInterval(() => {
      setPhoneLockoutIn((prev) => {
        if (prev <= 1) {
          setPhoneLockedOut(false);
          setPhoneError('');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [phoneLockedOut, phoneLockoutIn]);

  // 5-Minute OTP Expiry Countdown for Mobile: continuous visible timer from 05:00 to 00:00
  useEffect(() => {
    if (!phoneOtpSent || phoneVerified || phoneLockedOut || phoneExpiresIn <= 0) return;
    const timer = setInterval(() => {
      setPhoneExpiresIn((prev) => {
        if (prev <= 1) {
          setPhoneOtpExpired(true);
          setPhoneError('Your OTP has expired. Please request a new OTP.');
          setPhoneOtp(Array(OTP_LENGTH).fill(''));
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [phoneOtpSent, phoneVerified, phoneLockedOut, phoneExpiresIn]);

  // Restore active OTP timers and lockout state from localStorage on email change or refresh
  useEffect(() => {
    const trimmed = email.trim().toLowerCase();
    if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      const timers = getOtpTimers(trimmed);
      if (timers.lockoutIn > 0) {
        setEmailLockedOut(true);
        setEmailLockoutIn(timers.lockoutIn);
        setEmailError('Too many incorrect OTP attempts. Email verification is locked for 15 minutes.');
      } else {
        setEmailLockedOut(false);
        setEmailLockoutIn(0);
      }

      if (timers.expiresIn > 0) {
        setEmailOtpSent(true);
        setEmailExpiresIn(timers.expiresIn);
        setEmailOtpExpired(false);
      } else if (timers.isExpired) {
        setEmailOtpSent(true);
        setEmailExpiresIn(0);
        setEmailOtpExpired(true);
        setEmailError('Your OTP has expired. Please request a new OTP.');
      }
    }
  }, [email]);

  // 15-Minute Lockout Countdown for Email: runs every second during lockout
  useEffect(() => {
    if (!emailLockedOut || emailLockoutIn <= 0) return;
    const timer = setInterval(() => {
      setEmailLockoutIn((prev) => {
        if (prev <= 1) {
          setEmailLockedOut(false);
          setEmailError('');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [emailLockedOut, emailLockoutIn]);

  // 5-Minute OTP Expiry Countdown for Email: continuous visible timer from 05:00 to 00:00
  useEffect(() => {
    if (!emailOtpSent || emailVerified || emailLockedOut || emailExpiresIn <= 0) return;
    const timer = setInterval(() => {
      setEmailExpiresIn((prev) => {
        if (prev <= 1) {
          setEmailOtpExpired(true);
          setEmailError('Your OTP has expired. Please request a new OTP.');
          setEmailOtp(Array(OTP_LENGTH).fill(''));
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [emailOtpSent, emailVerified, emailLockedOut, emailExpiresIn]);

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

    if (phoneSending || phoneVerifying) return;

    if (phoneLockedOut || phoneLockoutIn > 0) {
      setPhoneError(`Too many incorrect OTP attempts. OTP verification is locked for 15 minutes. Try again in ${formatTimer(phoneLockoutIn)}`);
      return;
    }

    if (phoneOtpSent && !phoneOtpExpired && phoneExpiresIn > 0) {
      setPhoneError('A valid OTP has already been sent. Please wait for it to expire before requesting a new one.');
      return;
    }

    setPhoneError('');
    setGeneralError('');
    setPhoneSending(true);

    try {
      const res = await api.post('/otp/send', { phone: digits });
      const data = res.data;
      saveOtpTimers(digits, {
        expiresAt: data.expiresAt,
        resendAvailableAt: data.resendAvailableAt,
        lockedUntil: null,
      });

      setPhoneOtp(Array(OTP_LENGTH).fill(''));
      setPhoneOtpSent(true);
      setPhoneOtpExpired(false);
      setPhoneLockedOut(false);
      setPhoneLockoutIn(0);
      setPhoneExpiresIn(data.expiresIn || OTP_EXPIRY_SECONDS);
      setTimeout(() => phoneOtpRefs.current[0]?.focus(), 80);
    } catch (err) {
      const resData = err.response?.data || {};
      if (err.response?.status === 429) {
        if (resData.code === 'OTP_LOCKED' || resData.lockoutRemaining > 0) {
          const rem = resData.lockoutRemaining || 900;
          setPhoneLockedOut(true);
          setPhoneLockoutIn(rem);
          saveOtpTimers(digits, { lockedUntil: resData.lockedUntil || new Date(Date.now() + rem * 1000).toISOString() });
          setPhoneError(resData.message || 'Too many incorrect OTP attempts. OTP verification is locked for 15 minutes.');
        } else if (resData.code === 'OTP_STILL_VALID') {
          const rem = resData.otpRemaining;
          if (rem > 0) setPhoneExpiresIn(rem);
          setPhoneOtpExpired(false);
          if (resData.expiresAt) saveOtpTimers(digits, { expiresAt: resData.expiresAt });
          setPhoneError('A verification code is already active. Please use the code already sent or wait for it to expire.');
        } else {
          setPhoneError(resData.message || 'Too many requests. Please wait.');
        }
      } else {
        setPhoneError(resData.message || 'Could not send verification code. Please check your mobile number.');
      }
    } finally {
      setPhoneSending(false);
    }
  };

  // Submit Mobile OTP
  const submitPhoneOtp = async (code) => {
    if (phoneLockedOut || phoneLockoutIn > 0) {
      setPhoneError(`Too many incorrect OTP attempts. OTP verification is locked for 15 minutes.`);
      return;
    }

    if (phoneOtpExpired || phoneExpiresIn <= 0) {
      setPhoneError('Your OTP has expired. Please request a new OTP.');
      return;
    }

    setPhoneVerifying(true);
    setPhoneError('');
    const digits = phone.replace(/\D/g, '');

    try {
      await api.post('/otp/verify', { phone: digits, otp: code });
      clearOtpTimers(digits);
      setPhoneVerified(true);
      setPhoneOtpSent(false);
      setPhoneLockedOut(false);
      setPhoneLockoutIn(0);
    } catch (err) {
      const resData = err.response?.data || {};
      const status = err.response?.status;

      if (status === 429 && (resData.code === 'OTP_LOCKED' || resData.lockoutRemaining > 0)) {
        const rem = resData.lockoutRemaining || 900;
        setPhoneLockedOut(true);
        setPhoneLockoutIn(rem);
        saveOtpTimers(digits, { lockedUntil: resData.lockedUntil || new Date(Date.now() + rem * 1000).toISOString() });
        setPhoneError(resData.message || 'Too many incorrect OTP attempts. OTP verification is locked for 15 minutes.');
        setPhoneOtp(Array(OTP_LENGTH).fill(''));
      } else if (resData.code === 'OTP_EXPIRED') {
        setPhoneOtpExpired(true);
        setPhoneExpiresIn(0);
        setPhoneError(resData.message || 'Your OTP has expired. Please request a new OTP.');
        setPhoneOtp(Array(OTP_LENGTH).fill(''));
      } else {
        setPhoneError(resData.message || 'Invalid or expired verification code.');
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

    if (emailSending || emailVerifying) return;

    if (emailLockedOut || emailLockoutIn > 0) {
      setEmailError(`Too many incorrect OTP attempts. Email verification is locked for 15 minutes. Try again in ${formatTimer(emailLockoutIn)}`);
      return;
    }

    if (emailOtpSent && !emailOtpExpired && emailExpiresIn > 0) {
      setEmailError('A valid OTP has already been sent. Please wait for it to expire before requesting a new one.');
      return;
    }

    setEmailError('');
    setGeneralError('');
    setEmailSending(true);

    try {
      const res = await api.post('/otp/send-email', { email: trimmed });
      const data = res.data;
      saveOtpTimers(trimmed, {
        expiresAt: data.expiresAt,
        resendAvailableAt: data.resendAvailableAt,
        lockedUntil: null,
      });

      setEmailOtp(Array(OTP_LENGTH).fill(''));
      setEmailOtpSent(true);
      setEmailOtpExpired(false);
      setEmailLockedOut(false);
      setEmailLockoutIn(0);
      setEmailExpiresIn(data.expiresIn || OTP_EXPIRY_SECONDS);
      setTimeout(() => emailOtpRefs.current[0]?.focus(), 80);
    } catch (err) {
      const resData = err.response?.data || {};
      if (err.response?.status === 429) {
        if (resData.code === 'OTP_LOCKED' || resData.lockoutRemaining > 0) {
          const rem = resData.lockoutRemaining || 900;
          setEmailLockedOut(true);
          setEmailLockoutIn(rem);
          saveOtpTimers(trimmed, { lockedUntil: resData.lockedUntil || new Date(Date.now() + rem * 1000).toISOString() });
          setEmailError(resData.message || 'Too many incorrect OTP attempts. Email verification is locked for 15 minutes.');
        } else if (resData.code === 'OTP_STILL_VALID') {
          const rem = resData.otpRemaining;
          if (rem > 0) setEmailExpiresIn(rem);
          setEmailOtpExpired(false);
          if (resData.expiresAt) saveOtpTimers(trimmed, { expiresAt: resData.expiresAt });
          setEmailError('A verification code is already active. Please use the code already sent or wait for it to expire.');
        } else {
          setEmailError(resData.message || 'Too many requests. Please wait.');
        }
      } else {
        setEmailError(resData.message || 'Could not send verification code. Please check your email address.');
      }
    } finally {
      setEmailSending(false);
    }
  };

  // Submit Email OTP
  const submitEmailOtp = async (code) => {
    if (emailLockedOut || emailLockoutIn > 0) {
      setEmailError(`Too many incorrect OTP attempts. Email verification is locked for 15 minutes.`);
      return;
    }

    if (emailOtpExpired || emailExpiresIn <= 0) {
      setEmailError('Your OTP has expired. Please request a new OTP.');
      return;
    }

    setEmailVerifying(true);
    setEmailError('');
    const cleanEmail = email.trim().toLowerCase();

    try {
      await api.post('/otp/verify-email', { email: cleanEmail, otp: code });
      clearOtpTimers(cleanEmail);
      setEmailVerified(true);
      setEmailOtpSent(false);
      setEmailLockedOut(false);
      setEmailLockoutIn(0);
    } catch (err) {
      const resData = err.response?.data || {};
      const status = err.response?.status;

      if (status === 429 && (resData.code === 'OTP_LOCKED' || resData.lockoutRemaining > 0)) {
        const rem = resData.lockoutRemaining || 900;
        setEmailLockedOut(true);
        setEmailLockoutIn(rem);
        saveOtpTimers(cleanEmail, { lockedUntil: resData.lockedUntil || new Date(Date.now() + rem * 1000).toISOString() });
        setEmailError(resData.message || 'Too many incorrect OTP attempts. Email verification is locked for 15 minutes.');
        setEmailOtp(Array(OTP_LENGTH).fill(''));
      } else if (resData.code === 'OTP_EXPIRED') {
        setEmailOtpExpired(true);
        setEmailExpiresIn(0);
        setEmailError(resData.message || 'Your OTP has expired. Please request a new OTP.');
        setEmailOtp(Array(OTP_LENGTH).fill(''));
      } else {
        setEmailError(resData.message || 'Invalid or expired verification code.');
        setEmailOtp(Array(OTP_LENGTH).fill(''));
        setTimeout(() => emailOtpRefs.current[0]?.focus(), 50);
      }
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

            {/* Inactivity Session Expiry Notification */}
            {sessionExpiredMsg && (
              <div
                role="alert"
                style={{
                  backgroundColor: '#fef2f2',
                  color: '#991b1b',
                  border: '1.5px solid #fecaca',
                  borderRadius: '12px',
                  padding: '0.85rem 1rem',
                  marginBottom: '1.25rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.65rem',
                  fontSize: '0.9rem',
                  fontWeight: 700,
                  boxShadow: '0 2px 8px rgba(220, 38, 38, 0.08)',
                }}
              >
                <FiAlertCircle size={20} color="#dc2626" style={{ flexShrink: 0 }} />
                <span>{sessionExpiredMsg}</span>
              </div>
            )}

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
                    ) : phoneOtpSent ? null : (
                      <button
                        type="button"
                        className="login-inline-action-btn"
                        onClick={handleSendPhoneOtp}
                        disabled={phone.length !== 9 || phoneSending || phoneLockedOut}
                        id="btn-get-code-phone"
                      >
                        {phoneSending ? 'Sending…' : 'Get Code'}
                      </button>
                    )}
                  </div>
                </div>
                {phoneError && <p className="signup-field-error">{phoneError}</p>}

                {/* Inline Expandable OTP Panel for Mobile */}
                {phoneOtpSent && !phoneVerified && (
                  <div className="login-inline-otp-panel">
                    {/* 15-Minute Lockout Display */}
                    {phoneLockedOut && (
                      <div
                        role="alert"
                        style={{
                          backgroundColor: '#fff1f2',
                          border: '1.5px solid #fecdd3',
                          color: '#be123c',
                          padding: '0.85rem 1rem',
                          borderRadius: '10px',
                          marginBottom: '1rem',
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
                          OTP verification locked. Try again in {formatTimer(phoneLockoutIn)}
                        </div>
                      </div>
                    )}

                    <div className="login-inline-otp-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '0.75rem' }}>
                      <span className="login-inline-otp-title" style={{ fontWeight: 700 }}>Enter 6-digit SMS verification code</span>
                      {!phoneLockedOut && (
                        <div style={{ fontSize: '0.82rem' }}>
                          {phoneOtpExpired ? (
                            <span style={{ color: '#dc2626', fontWeight: 700 }}>
                              Your OTP has expired. Please request a new OTP.
                            </span>
                          ) : (
                            <span style={{ color: '#0369a1', fontWeight: 700 }}>
                              OTP expires in {formatTimer(phoneExpiresIn)}
                            </span>
                          )}
                        </div>
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
                          disabled={phoneVerifying || phoneLockedOut || phoneOtpExpired}
                          aria-label={`Digit ${idx + 1}`}
                          className={`login-otp-box ${digit ? 'is-filled' : ''} ${phoneError ? 'is-error' : ''}`}
                          onChange={(e) => handlePhoneOtpChange(idx, e.target.value)}
                          onKeyDown={(e) => handlePhoneOtpKeyDown(idx, e)}
                        />
                      ))}
                    </div>

                    {/* Resend OTP Bar — strictly hidden while OTP is valid, shown immediately AFTER expiration */}
                    {phoneOtpExpired && !phoneLockedOut && (
                      <div style={{ marginTop: '0.85rem' }}>
                        <button
                          type="button"
                          className="login-resend-btn"
                          onClick={handleSendPhoneOtp}
                          disabled={phoneSending || phoneVerifying}
                          id="btn-resend-phone-otp"
                        >
                          <FiRefreshCw size={12} aria-hidden="true" />
                          <span>{phoneSending ? 'Sending…' : 'Resend OTP'}</span>
                        </button>
                      </div>
                    )}

                    {import.meta.env.DEV && (
                      <p className="auth-dev-hint" style={{ margin: '0.65rem 0 0 0', padding: '0.35rem 0.65rem' }}>
                        Development mode: demo code <strong>000000</strong> is accepted when OTP is valid and active.
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
                  ) : emailOtpSent ? null : (
                    <button
                      type="button"
                      className="login-inline-action-btn"
                      onClick={handleSendEmailOtp}
                      disabled={!phoneVerified || !isValidEmail || emailSending || emailLockedOut}
                      id="btn-get-code-email"
                    >
                      {emailSending ? 'Sending…' : 'Get Code'}
                    </button>
                  )}
                </div>
                {emailError && <p className="signup-field-error">{emailError}</p>}

                {/* Inline Expandable OTP Panel for Email */}
                {emailOtpSent && !emailVerified && (
                  <div className="login-inline-otp-panel">
                    {/* 15-Minute Lockout Display */}
                    {emailLockedOut && (
                      <div
                        role="alert"
                        style={{
                          backgroundColor: '#fff1f2',
                          border: '1.5px solid #fecdd3',
                          color: '#be123c',
                          padding: '0.85rem 1rem',
                          borderRadius: '10px',
                          marginBottom: '1rem',
                          textAlign: 'center',
                          fontWeight: 600,
                          fontSize: '0.88rem',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.45rem', marginBottom: '0.35rem' }}>
                          <FiLock size={16} />
                          <span>Too many incorrect OTP attempts. Email verification is locked for 15 minutes.</span>
                        </div>
                        <div style={{ color: '#9f1239', fontWeight: 800, fontSize: '0.95rem' }}>
                          Email verification locked. Try again in {formatTimer(emailLockoutIn)}
                        </div>
                      </div>
                    )}

                    <div className="login-inline-otp-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '0.75rem' }}>
                      <span className="login-inline-otp-title" style={{ fontWeight: 700 }}>Enter 6-digit email verification code</span>
                      {!emailLockedOut && (
                        <div style={{ fontSize: '0.82rem' }}>
                          {emailOtpExpired ? (
                            <span style={{ color: '#dc2626', fontWeight: 700 }}>
                              Your OTP has expired. Please request a new OTP.
                            </span>
                          ) : (
                            <span style={{ color: '#0369a1', fontWeight: 700 }}>
                              OTP expires in {formatTimer(emailExpiresIn)}
                            </span>
                          )}
                        </div>
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
                          disabled={emailVerifying || emailLockedOut || emailOtpExpired}
                          aria-label={`Digit ${idx + 1}`}
                          className={`login-otp-box ${digit ? 'is-filled' : ''} ${emailError ? 'is-error' : ''}`}
                          onChange={(e) => handleEmailOtpChange(idx, e.target.value)}
                          onKeyDown={(e) => handleEmailOtpKeyDown(idx, e)}
                        />
                      ))}
                    </div>

                    {/* Resend OTP Bar — strictly hidden while OTP is valid, shown immediately AFTER expiration */}
                    {emailOtpExpired && !emailLockedOut && (
                      <div style={{ marginTop: '0.85rem' }}>
                        <button
                          type="button"
                          className="login-resend-btn"
                          onClick={handleSendEmailOtp}
                          disabled={emailSending || emailVerifying}
                          id="btn-resend-email-otp"
                        >
                          <FiRefreshCw size={12} aria-hidden="true" />
                          <span>{emailSending ? 'Sending…' : 'Resend OTP'}</span>
                        </button>
                      </div>
                    )}

                    {import.meta.env.DEV && (
                      <p className="auth-dev-hint" style={{ margin: '0.65rem 0 0 0', padding: '0.35rem 0.65rem' }}>
                        Development mode: demo code <strong>000000</strong> is accepted when OTP is valid and active.
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
