import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiShield, FiX, FiRefreshCw, FiCheck } from 'react-icons/fi';
import './SignUpPage.css';
import signupBgImage from '../assets/team_laptop.jpg';
import api from '../utils/api';
import { saveSession } from '../utils/authSession';

const RESEND_SECONDS = 30;

/* ── SVG icons (inline, zero dependencies) ─────────────────────── */
const IconUser = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
  </svg>
);

const IconMail = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
    <rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
  </svg>
);

const IconPhone = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.41 12 19.79 19.79 0 0 1 1.21 3.18 2 2 0 0 1 3.22 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.09 8.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21 16v.92z"/>
  </svg>
);

const IconLock = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
    <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
  </svg>
);

const IconEye = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/>
  </svg>
);

const IconEyeOff = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
    <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/><line x1="2" y1="2" x2="22" y2="22"/>
  </svg>
);

const IconShield = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="24" height="24">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/>
  </svg>
);

const IconZap = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="24" height="24">
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
  </svg>
);

const IconHeadphones = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="24" height="24">
    <path d="M3 18v-6a9 9 0 0 1 18 0v6"/><path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"/>
  </svg>
);

const IconCard = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
    <rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/>
  </svg>
);

const IconCalendar = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
  </svg>
);

const IconGlobe = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
    <circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
  </svg>
);

const IconMapPin = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
  </svg>
);

const IconBuilding = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
    <rect x="4" y="2" width="16" height="20" rx="2" ry="2"/><path d="M9 22v-4h6v4"/><path d="M8 6h.01"/><path d="M16 6h.01"/><path d="M12 6h.01"/><path d="M12 10h.01"/><path d="M12 14h.01"/><path d="M16 10h.01"/><path d="M16 14h.01"/><path d="M8 10h.01"/><path d="M8 14h.01"/>
  </svg>
);

const IconArrowLeft = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="18" height="18">
    <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
  </svg>
);

const IconArrowRight = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="18" height="18">
    <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
  </svg>
);

/* ── SLTMobitel Logo ─────────────────────────────────────────────── */
const SLTLogo = () => (
  <svg width="170" height="48" viewBox="0 0 170 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <line x1="4" y1="42" x2="18" y2="6" stroke="#0f57a8" strokeWidth="4" strokeLinecap="round"/>
    <line x1="14" y1="42" x2="28" y2="6" stroke="#50b748" strokeWidth="4" strokeLinecap="round"/>
    <text x="34" y="32" fontFamily="'Outfit', system-ui, sans-serif" fontWeight="800" fontSize="20" fill="#ffffff">SLT</text>
    <text x="74" y="32" fontFamily="'Outfit', system-ui, sans-serif" fontWeight="800" fontSize="20" fill="#50b748">MOBITEL</text>
    <text x="34" y="44" fontFamily="system-ui, sans-serif" fontWeight="400" fontSize="8" fill="rgba(255,255,255,0.45)" letterSpacing="1.5">The Connection</text>
  </svg>
);

/* ── Helpers ─────────────────────────────────────────────────────── */
const API = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5050/api';

function PasswordStrength({ password }) {
  if (!password) return null;
  let strength = 0;
  if (password.length >= 8) strength++;
  if (/[A-Z]/.test(password)) strength++;
  if (/[0-9]/.test(password)) strength++;
  if (/[^A-Za-z0-9]/.test(password)) strength++;

  const labels = ['', 'Weak', 'Fair', 'Good', 'Strong'];
  const colors = ['', '#ef4444', '#f59e0b', '#3b82f6', '#059669'];

  return (
    <div className="signup-pw-strength">
      <div className="signup-pw-bars">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="signup-pw-bar" style={{ background: i <= strength ? colors[strength] : '#e2e8f0' }} />
        ))}
      </div>
      {strength > 0 && (
        <span className="signup-pw-strength-text" style={{ color: colors[strength] }}>{labels[strength]}</span>
      )}
    </div>
  );
}

/* ── Main Component ──────────────────────────────────────────────── */
export default function SignUpPage() {
  const navigate = useNavigate();

  const prefilledPhone = (() => {
    const stored = localStorage.getItem('signupPhone') || '';
    if (stored) localStorage.removeItem('signupPhone');
    return stored;
  })();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  const [form, setForm] = useState({
    // Step 1
    phone: prefilledPhone,
    email: '',
    password: '',
    confirmPassword: '',
    // Step 2
    title: 'Mr.',
    fullName: '',
    dob: '',
    gender: 'Male',
    nic: '',
    nationality: 'Sri Lankan',
    contactNumber: '',
    // Step 3
    addressLine1: '',
    addressLine2: '',
    city: '',
    district: 'Colombo',
    postalCode: '',
    preferredContact: 'SMS',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);

  // ── Inline phone verification ────────────────────────────────────
  // The number is confirmed by OTP right here on the form, the same way the
  // Ownership Transfer wizard verifies a new applicant's number.
  const [phoneVerified, setPhoneVerified] = useState(false);
  const [otpModalOpen, setOtpModalOpen] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [otpError, setOtpError] = useState('');
  const [resendIn, setResendIn] = useState(RESEND_SECONDS);
  const otpRefs = useRef([]);

  useEffect(() => {
    if (!otpModalOpen) return;
    setResendIn(RESEND_SECONDS);
    const id = setTimeout(() => otpRefs.current[0]?.focus(), 50);
    return () => clearTimeout(id);
  }, [otpModalOpen]);

  useEffect(() => {
    if (!otpModalOpen || resendIn <= 0) return;
    const id = setTimeout(() => setResendIn((s) => s - 1), 1000);
    return () => clearTimeout(id);
  }, [otpModalOpen, resendIn]);

  const normalisedPhone = () => {
    let digits = form.phone.replace(/\D/g, '');
    if (digits.startsWith('0')) digits = digits.slice(1);
    return digits;
  };

  const sendOtp = async () => {
    const digits = normalisedPhone();
    if (digits.length !== 9) {
      setFieldErrors((fe) => ({ ...fe, phone: 'Enter a valid 9-digit mobile number first' }));
      return;
    }

    setSendingOtp(true);
    try {
      // Don't let someone register a number that already has an account.
      const check = await api.post('/auth/check-phone', { phone: digits });
      if (check.data?.registered) {
        setFieldErrors((fe) => ({ ...fe, phone: 'This number already has an account. Please sign in instead.' }));
        setSendingOtp(false);
        return;
      }
    } catch (err) {
      // Lookup unavailable — carry on; the register call still guards duplicates.
    }

    try {
      await api.post('/otp/send', { phone: digits });
    } catch (err) {
      // Offline/demo mode — still open the code entry.
    }
    setSendingOtp(false);
    setOtp(['', '', '', '', '', '']);
    setOtpError('');
    setOtpModalOpen(true);
  };

  const submitOtp = async (code) => {
    const digits = normalisedPhone();
    setVerifyingOtp(true);
    setOtpError('');
    try {
      const res = await api.post('/otp/verify', { phone: digits, otp: code });
      if (res.data?.success) {
        setPhoneVerified(true);
        setOtpModalOpen(false);
      } else {
        setOtpError(res.data?.message || 'Invalid or expired verification code.');
        setOtp(['', '', '', '', '', '']);
        setTimeout(() => otpRefs.current[0]?.focus(), 50);
      }
    } catch (err) {
      // Demo bypass — 000000 (or a backend outage) counts as verified.
      if (code === '000000' || !err.response) {
        setPhoneVerified(true);
        setOtpModalOpen(false);
      } else {
        setOtpError(err.response?.data?.message || 'Invalid or expired verification code.');
        setOtp(['', '', '', '', '', '']);
        setTimeout(() => otpRefs.current[0]?.focus(), 50);
      }
    } finally {
      setVerifyingOtp(false);
    }
  };

  const handleOtpChange = (index, raw) => {
    if (verifyingOtp) return;
    const value = raw.replace(/\D/g, '');
    const next = [...otp];
    next[index] = value.slice(-1) || '';
    setOtp(next);
    if (value && index < 5) otpRefs.current[index + 1]?.focus();

    const joined = next.join('');
    if (joined.length === 6) submitOtp(joined);
    else if (otpError) setOtpError('');
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) otpRefs.current[index - 1]?.focus();
  };

  const handleResendOtp = async () => {
    if (resendIn > 0 || verifyingOtp) return;
    setOtp(['', '', '', '', '', '']);
    setOtpError('');
    try {
      await api.post('/otp/send', { phone: normalisedPhone() });
    } catch (err) {
      // demo code still works offline
    }
    setResendIn(RESEND_SECONDS);
    setTimeout(() => otpRefs.current[0]?.focus(), 50);
  };

  const set = (field) => (e) => {
    let value = e.target.value;
    if (field === 'phone' || field === 'contactNumber') {
      value = value.replace(/\D/g, '').slice(0, 10);
    }
    // Editing the number invalidates any OTP already confirmed for it.
    if (field === 'phone') setPhoneVerified(false);
    if (field === 'nic') {
      value = value.slice(0, 12);
    }
    setForm(f => ({ ...f, [field]: value }));
    setFieldErrors(fe => ({ ...fe, [field]: undefined }));
    setError('');
  };

  const validateStep1 = () => {
    const fe = {};
    if (!form.phone?.trim()) fe.phone = 'Phone number is required';
    else if (!/^\d{9,10}$/.test(form.phone.replace(/[\s+\-()]/g, ''))) fe.phone = 'Enter a valid phone number';
    
    if (!form.email?.trim()) fe.email = 'Email address is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) fe.email = 'Enter a valid email';
    
    if (!form.phone?.trim()) fe.phone = 'Phone number is required';
    else if (!phoneVerified) fe.phone = 'Please verify your mobile number to continue';

    if (!form.password) fe.password = 'Password is required';
    else if (form.password.length < 8) fe.password = 'At least 8 characters required';
    else if (!/[A-Z]/.test(form.password)) fe.password = 'Include at least one uppercase letter';
    else if (!/[a-z]/.test(form.password)) fe.password = 'Include at least one lowercase letter';
    else if (!/[0-9]/.test(form.password)) fe.password = 'Include at least one number';
    else if (!/[^A-Za-z0-9]/.test(form.password)) fe.password = 'Include at least one special character';
    
    if (!form.confirmPassword) fe.confirmPassword = 'Please confirm your password';
    else if (form.password !== form.confirmPassword) fe.confirmPassword = 'Passwords do not match';
    
    return fe;
  };

  const validateStep2 = () => {
    const fe = {};
    if (!form.title) fe.title = 'Title is required';
    if (!form.fullName?.trim()) fe.fullName = 'Full Name is required';
    if (!form.dob) fe.dob = 'Date of birth is required';
    if (!form.gender) fe.gender = 'Gender is required';
    if (!form.nic?.trim()) fe.nic = 'NIC / Passport is required';
    if (!form.nationality) fe.nationality = 'Nationality is required';
    return fe;
  };

  const validateStep3 = () => {
    const fe = {};
    if (!form.addressLine1?.trim()) fe.addressLine1 = 'Address Line 1 is required';
    if (!form.city?.trim()) fe.city = 'City is required';
    if (!form.district) fe.district = 'District is required';
    if (!form.postalCode?.trim()) fe.postalCode = 'Postal Code is required';
    if (!form.preferredContact) fe.preferredContact = 'Preferred contact method is required';
    return fe;
  };

  const nextStep = () => {
    let fe = {};
    if (step === 1) fe = validateStep1();
    if (step === 2) fe = validateStep2();
    
    if (Object.keys(fe).length > 0) {
      setFieldErrors(fe);
      return;
    }
    setStep(s => Math.min(s + 1, 3));
    window.scrollTo(0, 0);
  };

  const prevStep = () => {
    setStep(s => Math.max(s - 1, 1));
    window.scrollTo(0, 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (step < 3) return nextStep();

    const fe = validateStep3();
    if (Object.keys(fe).length > 0) { 
      setFieldErrors(fe); 
      return; 
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch(`${API}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: `${form.title} ${form.fullName.trim()}`,
          email: form.email.trim(),
          phone: form.phone.replace(/[\s+\-()]/g, ''),
          NIC: form.nic.trim().toUpperCase(),
          password: form.password,
          role: 'Customer',
          title: form.title,
          dob: form.dob,
          gender: form.gender,
          nationality: form.nationality,
          contactNumber: form.contactNumber.trim(),
          addressLine1: form.addressLine1.trim(),
          addressLine2: form.addressLine2.trim(),
          city: form.city.trim(),
          district: form.district,
          postalCode: form.postalCode.trim(),
          preferredContact: form.preferredContact
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || 'Registration failed. Please try again.');
      } else {
        // Registered and phone-verified — sign them straight in. A brand new
        // account has no SLT connections yet, so the lookup usually comes back
        // empty and they'll only be offered New Connection.
        let accounts = [];
        try {
          const lookup = await api.post('/customers/lookup', { phoneNumber: normalisedPhone() });
          if (lookup.data?.customerExists && Array.isArray(lookup.data.customers)) {
            accounts = lookup.data.customers;
          }
        } catch (lookupErr) {
          // Non-fatal — they can still apply for a new connection.
        }

        saveSession({
          phone: normalisedPhone(),
          user: data.user || null,
          accountsList: accounts,
          tokens: { accessToken: data.accessToken, refreshToken: data.refreshToken },
        });
        navigate('/', { replace: true });
      }
    } catch {
      setError('Unable to connect to the server. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="signup-root">
      <div className="signup-card">
        
        {/* LEFT SIDEBAR */}
        <div 
          className="signup-sidebar" 
          style={{ 
            backgroundImage: `linear-gradient(160deg, rgba(6, 40, 110, 0.95) 0%, rgba(6, 40, 110, 0.88) 40%, rgba(3, 70, 50, 0.95) 100%), url(${signupBgImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center bottom',
            backgroundRepeat: 'no-repeat'
          }}
        >
          <div className="signup-sidebar-inner">
            <div className="signup-badge">
              <IconLock /> Secure &amp; Trusted
            </div>
            <h1 className="signup-sidebar-title">Create Your Account</h1>
            <p className="signup-sidebar-desc">
              Join SLTMobitel EasyApply and enjoy seamless self-service for connections, relocations and upgrades.
            </p>
            <div className="signup-features">
              <div className="signup-feature-item">
                <div className="signup-feature-icon"><IconShield /></div>
                <div>
                  <h4>100% Secure Process</h4>
                  <p>Your data is safe with us</p>
                </div>
              </div>
              <div className="signup-feature-item">
                <div className="signup-feature-icon"><IconZap /></div>
                <div>
                  <h4>Instant Verification</h4>
                  <p>Quick and easy account setup</p>
                </div>
              </div>
              <div className="signup-feature-item">
                <div className="signup-feature-icon"><IconHeadphones /></div>
                <div>
                  <h4>24/7 Support</h4>
                  <p>We're here to help you anytime</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT SIDE (Form) */}
        <div className="signup-form-section">
          
          {/* Stepper Header */}
          <div className="signup-stepper">
            <div className={`signup-step ${step >= 1 ? 'active' : ''}`}>
              <div className="signup-step-num">1</div>
              <span>Account Details</span>
            </div>
            <div className={`signup-step-line ${step >= 2 ? 'active-line' : ''}`}></div>
            <div className={`signup-step ${step >= 2 ? 'active' : ''}`}>
              <div className="signup-step-num">2</div>
              <span>Personal Details</span>
            </div>
            <div className={`signup-step-line ${step >= 3 ? 'active-line' : ''}`}></div>
            <div className={`signup-step ${step >= 3 ? 'active' : ''}`}>
              <div className="signup-step-num">3</div>
              <span>Address Details</span>
            </div>
          </div>

          <div className="signup-form-header">
            <div className="signup-form-header-icon">
              {step === 1 && <IconUser />}
              {step === 2 && <IconUser />}
              {step === 3 && <IconMapPin />}
            </div>
            <div>
              <h2>{step === 1 ? 'Account Information' : step === 2 ? 'Personal Information' : 'Address Information'}</h2>
              <p>
                {step === 1 ? 'Please fill in your details to create your account' : 
                 step === 2 ? 'Please provide your personal details' : 
                 'Please provide your address details'}
              </p>
            </div>
          </div>

          {error && <div className="signup-error" role="alert">{error}</div>}

          <form onSubmit={handleSubmit} noValidate className="signup-form">
            
            {/* STEP 1 FIELDS */}
            {step === 1 && (
              <>
                <div className="signup-row">
                  <div className="signup-field">
                    <label className="signup-label">Mobile Number <span className="signup-required">*</span></label>
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'stretch' }}>
                      <div className={`signup-input-wrap ${fieldErrors.phone ? 'has-error' : ''}`} style={{ flex: 1 }}>
                        <span className="signup-input-icon"><IconPhone /></span>
                        <span className="signup-input-prefix">+94</span>
                        <input
                          type="tel"
                          className="signup-input"
                          placeholder="77 123 4567"
                          value={form.phone}
                          onChange={set('phone')}
                          maxLength="10"
                          readOnly={phoneVerified}
                        />
                      </div>
                      {phoneVerified ? (
                        <span
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.3rem',
                            padding: '0 0.9rem',
                            borderRadius: '12px',
                            backgroundColor: '#dcfce7',
                            color: '#16a34a',
                            fontSize: '0.8rem',
                            fontWeight: 800,
                            whiteSpace: 'nowrap',
                          }}
                        >
                          <FiCheck size={15} /> Verified
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={sendOtp}
                          disabled={sendingOtp}
                          style={{
                            padding: '0 1.1rem',
                            borderRadius: '12px',
                            border: 'none',
                            backgroundColor: '#0f57a8',
                            color: '#ffffff',
                            fontSize: '0.82rem',
                            fontWeight: 800,
                            cursor: sendingOtp ? 'wait' : 'pointer',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {sendingOtp ? 'Sending…' : 'Verify'}
                        </button>
                      )}
                    </div>
                    {fieldErrors.phone
                      ? <p className="signup-field-error">{fieldErrors.phone}</p>
                      : <p className="signup-field-help">
                          {phoneVerified
                            ? 'Mobile number confirmed'
                            : "Verify this number with a 6-digit code — we'll use it for important updates"}
                        </p>}
                  </div>

                  <div className="signup-field">
                    <label className="signup-label">Email Address <span className="signup-required">*</span></label>
                    <div className={`signup-input-wrap ${fieldErrors.email ? 'has-error' : ''}`}>
                      <span className="signup-input-icon"><IconMail /></span>
                      <input type="email" className="signup-input" placeholder="example@email.com" value={form.email} onChange={set('email')} />
                    </div>
                    {fieldErrors.email && <p className="signup-field-error">{fieldErrors.email}</p>}
                  </div>
                </div>
                
                <div className="signup-row">
                  <div className="signup-field">
                    <label className="signup-label">Password <span className="signup-required">*</span></label>
                    <div className={`signup-input-wrap ${fieldErrors.password ? 'has-error' : ''}`}>
                      <span className="signup-input-icon"><IconLock /></span>
                      <input type={showPassword ? 'text' : 'password'} autoComplete="new-password" className="signup-input" placeholder="••••••••••••" value={form.password} onChange={set('password')} />
                      <button type="button" className="signup-pw-toggle" onClick={() => setShowPassword(!showPassword)}>{showPassword ? <IconEyeOff /> : <IconEye />}</button>
                    </div>
                    {fieldErrors.password ? <p className="signup-field-error">{fieldErrors.password}</p> : <p className="signup-field-help">Minimum 8 characters with uppercase, lowercase, number and special character</p>}
                    <PasswordStrength password={form.password} />
                  </div>

                  <div className="signup-field">
                    <label className="signup-label">Confirm Password <span className="signup-required">*</span></label>
                    <div className={`signup-input-wrap ${fieldErrors.confirmPassword ? 'has-error' : ''}`}>
                      <span className="signup-input-icon"><IconLock /></span>
                      <input type={showConfirmPw ? 'text' : 'password'} autoComplete="new-password" className="signup-input" placeholder="••••••••••••" value={form.confirmPassword} onChange={set('confirmPassword')} />
                      <button type="button" className="signup-pw-toggle" onClick={() => setShowConfirmPw(!showConfirmPw)}>{showConfirmPw ? <IconEyeOff /> : <IconEye />}</button>
                    </div>
                    {fieldErrors.confirmPassword ? <p className="signup-field-error">{fieldErrors.confirmPassword}</p> : <p className="signup-field-help">Please confirm your password</p>}
                  </div>
                </div>
              </>
            )}

            {/* STEP 2 FIELDS */}
            {step === 2 && (
              <>
                <div className="signup-row">
                  <div className="signup-field">
                    <label className="signup-label">Title <span className="signup-required">*</span></label>
                    <div className={`signup-input-wrap ${fieldErrors.title ? 'has-error' : ''}`}>
                      <span className="signup-input-icon"><IconUser /></span>
                      <select className="signup-input signup-select" value={form.title} onChange={set('title')}>
                        <option value="Mr.">Mr.</option>
                        <option value="Mrs.">Mrs.</option>
                        <option value="Ms.">Ms.</option>
                        <option value="Dr.">Dr.</option>
                        <option value="Rev.">Rev.</option>
                      </select>
                    </div>
                    {fieldErrors.title && <p className="signup-field-error">{fieldErrors.title}</p>}
                  </div>
                  <div className="signup-field">
                    <label className="signup-label">Date of Birth <span className="signup-required">*</span></label>
                    <div className={`signup-input-wrap ${fieldErrors.dob ? 'has-error' : ''}`}>
                      <span className="signup-input-icon"><IconCalendar /></span>
                      <input type="date" className="signup-input" value={form.dob} onChange={set('dob')} />
                    </div>
                    {fieldErrors.dob && <p className="signup-field-error">{fieldErrors.dob}</p>}
                  </div>
                </div>

                <div className="signup-row">
                  <div className="signup-field">
                    <label className="signup-label">Full Name (As per NIC/Passport) <span className="signup-required">*</span></label>
                    <div className={`signup-input-wrap ${fieldErrors.fullName ? 'has-error' : ''}`}>
                      <span className="signup-input-icon"><IconUser /></span>
                      <input type="text" className="signup-input" placeholder="John Michael Perera" value={form.fullName} onChange={set('fullName')} />
                    </div>
                    {fieldErrors.fullName && <p className="signup-field-error">{fieldErrors.fullName}</p>}
                  </div>
                  <div className="signup-field">
                    <label className="signup-label">Gender <span className="signup-required">*</span></label>
                    <div className="signup-radio-group">
                      <label className="signup-radio-label">
                        <input type="radio" name="gender" value="Male" checked={form.gender === 'Male'} onChange={set('gender')} /> Male
                      </label>
                      <label className="signup-radio-label">
                        <input type="radio" name="gender" value="Female" checked={form.gender === 'Female'} onChange={set('gender')} /> Female
                      </label>
                      <label className="signup-radio-label">
                        <input type="radio" name="gender" value="Other" checked={form.gender === 'Other'} onChange={set('gender')} /> Other
                      </label>
                    </div>
                    {fieldErrors.gender && <p className="signup-field-error">{fieldErrors.gender}</p>}
                  </div>
                </div>

                <div className="signup-row">
                  <div className="signup-field">
                    <label className="signup-label">NIC / Passport / BR Number <span className="signup-required">*</span></label>
                    <div className={`signup-input-wrap ${fieldErrors.nic ? 'has-error' : ''}`}>
                      <span className="signup-input-icon"><IconCard /></span>
                      <input type="text" className="signup-input" placeholder="e.g. 199012345678" value={form.nic} onChange={set('nic')} maxLength="12" />
                    </div>
                    {fieldErrors.nic ? <p className="signup-field-error">{fieldErrors.nic}</p> : <p className="signup-field-help">Enter your National Identity Card, Passport or Birth Registration number</p>}
                  </div>
                  <div className="signup-field">
                    <label className="signup-label">Nationality <span className="signup-required">*</span></label>
                    <div className={`signup-input-wrap ${fieldErrors.nationality ? 'has-error' : ''}`}>
                      <span className="signup-input-icon"><IconGlobe /></span>
                      <select className="signup-input signup-select" value={form.nationality} onChange={set('nationality')}>
                        <option value="Sri Lankan">Sri Lankan</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    {fieldErrors.nationality && <p className="signup-field-error">{fieldErrors.nationality}</p>}
                  </div>
                </div>

                <div className="signup-row">
                  <div className="signup-field">
                    <label className="signup-label">Contact Number (Optional)</label>
                    <div className="signup-input-wrap">
                      <span className="signup-input-icon"><IconPhone /></span>
                      <input type="tel" className="signup-input" placeholder="011 2 345 678" value={form.contactNumber} onChange={set('contactNumber')} maxLength="10" />
                    </div>
                  </div>
                  <div></div>
                </div>
              </>
            )}

            {/* STEP 3 FIELDS */}
            {step === 3 && (
              <>
                <div className="signup-row">
                  <div className="signup-field">
                    <label className="signup-label">Address Line 1 <span className="signup-required">*</span></label>
                    <div className={`signup-input-wrap ${fieldErrors.addressLine1 ? 'has-error' : ''}`}>
                      <span className="signup-input-icon"><IconMapPin /></span>
                      <input type="text" className="signup-input" placeholder="123, Galle Road" value={form.addressLine1} onChange={set('addressLine1')} />
                    </div>
                    {fieldErrors.addressLine1 && <p className="signup-field-error">{fieldErrors.addressLine1}</p>}
                  </div>
                  <div className="signup-field">
                    <label className="signup-label">Address Line 2 (Optional)</label>
                    <div className="signup-input-wrap">
                      <input type="text" className="signup-input" style={{ paddingLeft: '1rem' }} placeholder="Colombo 03" value={form.addressLine2} onChange={set('addressLine2')} />
                    </div>
                  </div>
                </div>

                <div className="signup-row">
                  <div className="signup-field">
                    <label className="signup-label">City <span className="signup-required">*</span></label>
                    <div className={`signup-input-wrap ${fieldErrors.city ? 'has-error' : ''}`}>
                      <span className="signup-input-icon"><IconBuilding /></span>
                      <input type="text" className="signup-input" placeholder="Colombo" value={form.city} onChange={set('city')} />
                    </div>
                    {fieldErrors.city && <p className="signup-field-error">{fieldErrors.city}</p>}
                  </div>
                  <div className="signup-field">
                    <label className="signup-label">District <span className="signup-required">*</span></label>
                    <div className={`signup-input-wrap ${fieldErrors.district ? 'has-error' : ''}`}>
                      <span className="signup-input-icon"><IconBuilding /></span>
                      <select className="signup-input signup-select" value={form.district} onChange={set('district')}>
                        <option value="Ampara">Ampara</option>
                        <option value="Anuradhapura">Anuradhapura</option>
                        <option value="Badulla">Badulla</option>
                        <option value="Batticaloa">Batticaloa</option>
                        <option value="Colombo">Colombo</option>
                        <option value="Galle">Galle</option>
                        <option value="Gampaha">Gampaha</option>
                        <option value="Hambantota">Hambantota</option>
                        <option value="Jaffna">Jaffna</option>
                        <option value="Kalutara">Kalutara</option>
                        <option value="Kandy">Kandy</option>
                        <option value="Kegalle">Kegalle</option>
                        <option value="Kilinochchi">Kilinochchi</option>
                        <option value="Kurunegala">Kurunegala</option>
                        <option value="Mannar">Mannar</option>
                        <option value="Matale">Matale</option>
                        <option value="Matara">Matara</option>
                        <option value="Monaragala">Monaragala</option>
                        <option value="Mullaitivu">Mullaitivu</option>
                        <option value="Nuwara Eliya">Nuwara Eliya</option>
                        <option value="Polonnaruwa">Polonnaruwa</option>
                        <option value="Puttalam">Puttalam</option>
                        <option value="Ratnapura">Ratnapura</option>
                        <option value="Trincomalee">Trincomalee</option>
                        <option value="Vavuniya">Vavuniya</option>
                      </select>
                    </div>
                    {fieldErrors.district && <p className="signup-field-error">{fieldErrors.district}</p>}
                  </div>
                </div>

                <div className="signup-row">
                  <div className="signup-field">
                    <label className="signup-label">Postal Code <span className="signup-required">*</span></label>
                    <div className={`signup-input-wrap ${fieldErrors.postalCode ? 'has-error' : ''}`}>
                      <span className="signup-input-icon"><IconBuilding /></span>
                      <input type="text" className="signup-input" placeholder="00300" value={form.postalCode} onChange={set('postalCode')} />
                    </div>
                    {fieldErrors.postalCode && <p className="signup-field-error">{fieldErrors.postalCode}</p>}
                  </div>
                  <div className="signup-field">
                    <label className="signup-label">Preferred Contact Method <span className="signup-required">*</span></label>
                    <div className="signup-contact-methods">
                      <div className={`signup-contact-method ${form.preferredContact === 'Email' ? 'active' : ''}`} onClick={() => setForm({...form, preferredContact: 'Email'})}>
                        <IconMail /> Email
                      </div>
                      <div className={`signup-contact-method ${form.preferredContact === 'SMS' ? 'active' : ''}`} onClick={() => setForm({...form, preferredContact: 'SMS'})}>
                        <IconPhone /> SMS
                      </div>
                      <div className={`signup-contact-method ${form.preferredContact === 'Call' ? 'active' : ''}`} onClick={() => setForm({...form, preferredContact: 'Call'})}>
                        <IconPhone /> Call
                      </div>
                    </div>
                    {fieldErrors.preferredContact && <p className="signup-field-error">{fieldErrors.preferredContact}</p>}
                  </div>
                </div>

                <div className="signup-secure-box">
                  <div className="signup-secure-icon">
                    <IconShield />
                  </div>
                  <div>
                    <h5>Your Information is Secure</h5>
                    <p>We use industry-standard encryption to protect your personal data.<br/>Your information will only be used to provide you with our services.</p>
                  </div>
                </div>
              </>
            )}

            {/* BUTTONS */}
            <div className="signup-action-row">
              {step === 1 ? (
                <>
                  <button type="button" className="signup-btn-secondary" onClick={() => navigate(-1)}>Cancel</button>
                  <button type="submit" className="signup-btn">
                    Continue <IconArrowRight />
                  </button>
                </>
              ) : (
                <>
                  <button type="button" className="signup-btn-secondary" onClick={prevStep}>
                    <IconArrowLeft /> Back
                  </button>
                  <button type="submit" className={`signup-btn ${loading ? 'loading' : ''}`} disabled={loading}>
                    {loading ? <div className="signup-spinner" /> : (step === 3 ? 'Create Account' : 'Continue')}
                    {!loading && <IconArrowRight />}
                  </button>
                </>
              )}
            </div>
            
            {step === 1 && (
              <p className="signup-footer-text">
                Already have an account? <Link to="/login" className="signup-link signup-link--accent">Sign In</Link>
              </p>
            )}
          </form>
        </div>
      </div>

      {/* OTP Verification Modal — blurs everything behind it */}
      <AnimatePresence>
        {otpModalOpen && (
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
            onClick={() => setOtpModalOpen(false)}
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
                onClick={() => setOtpModalOpen(false)}
                style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', display: 'flex' }}
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
                Verify Your Mobile Number
              </h3>
              <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '1.5rem', fontWeight: 500 }}>
                Enter the 6-digit code sent to <strong style={{ color: '#0f172a' }}>+94 {normalisedPhone()}</strong>
              </p>

              <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => { otpRefs.current[index] = el; }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    disabled={verifyingOtp}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(index, e)}
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
                    onClick={handleResendOtp}
                    disabled={verifyingOtp}
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
}
