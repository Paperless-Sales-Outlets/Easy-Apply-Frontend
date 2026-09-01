import React, { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FiMail, FiLock, FiSmartphone, FiEye, FiEyeOff, FiArrowRight, FiArrowLeft, FiShield, FiZap, FiHeadphones, FiRefreshCw } from 'react-icons/fi';
import './SignUpPage.css';
import signupBgImage from '../assets/team_laptop.jpg';
import api from '../utils/api';
import { saveSession } from '../utils/authSession';

const RESEND_SECONDS = 30;

/* SLTMobitel logo, matching the sign-up screen */
const SLTLogo = () => (
  <svg width="170" height="48" viewBox="0 0 170 48" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="SLTMobitel">
    <line x1="4" y1="42" x2="18" y2="6" stroke="#0f57a8" strokeWidth="4" strokeLinecap="round" />
    <line x1="14" y1="42" x2="28" y2="6" stroke="#50b748" strokeWidth="4" strokeLinecap="round" />
    <text x="34" y="32" fontFamily="'Outfit', system-ui, sans-serif" fontWeight="800" fontSize="20" fill="#ffffff">SLT</text>
    <text x="74" y="32" fontFamily="'Outfit', system-ui, sans-serif" fontWeight="800" fontSize="20" fill="#50b748">MOBITEL</text>
    <text x="34" y="44" fontFamily="system-ui, sans-serif" fontWeight="400" fontSize="8" fill="rgba(255,255,255,0.45)" letterSpacing="1.5">The Connection</text>
  </svg>
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
    // A lookup outage shouldn't block sign-in — they'll simply be treated as a
    // customer with no SLT products until the next successful lookup.
    return [];
  }
}

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const redirectTo = location.state?.from || '/';

  const [method, setMethod] = useState('password'); // 'password' | 'otp'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  // Email + password
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Phone + OTP
  const [phase, setPhase] = useState('phone'); // 'phone' | 'otp'
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [resendIn, setResendIn] = useState(RESEND_SECONDS);
  const otpRefs = useRef([]);

  useEffect(() => {
    if (phase !== 'otp') return;
    setResendIn(RESEND_SECONDS);
    const id = setTimeout(() => otpRefs.current[0]?.focus(), 50);
    return () => clearTimeout(id);
  }, [phase]);

  useEffect(() => {
    if (phase !== 'otp' || resendIn <= 0) return;
    const id = setTimeout(() => setResendIn((s) => s - 1), 1000);
    return () => clearTimeout(id);
  }, [phase, resendIn]);

  const finishLogin = async ({ phone: sessionPhone, user, tokens }) => {
    const accounts = await fetchSltAccounts(sessionPhone);
    saveSession({ phone: sessionPhone, user, accountsList: accounts, tokens });
    navigate(redirectTo, { replace: true });
  };

  /* ── Email + password ─────────────────────────────────────────── */
  const handlePasswordLogin = async (e) => {
    e.preventDefault();
    const fe = {};
    if (!email.trim()) fe.email = 'Email address is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) fe.email = 'Enter a valid email';
    if (!password) fe.password = 'Password is required';
    setFieldErrors(fe);
    if (Object.keys(fe).length) return;

    setError('');
    setLoading(true);
    try {
      const res = await api.post('/auth/login', { email: email.trim(), password });
      const { user, accessToken, refreshToken } = res.data || {};
      await finishLogin({
        phone: user?.phone || '',
        user,
        tokens: { accessToken, refreshToken },
      });
    } catch (err) {
      setError(
        err.response?.data?.message ||
        (err.response ? 'Invalid email or password.' : 'Unable to reach the server. Please try again.')
      );
    } finally {
      setLoading(false);
    }
  };

  /* ── Phone + OTP ──────────────────────────────────────────────── */
  const handleSendOtp = async (e) => {
    e.preventDefault();
    const digits = phone.replace(/\D/g, '');
    if (digits.length < 9) {
      setFieldErrors({ phone: 'Enter a valid 9-digit mobile number' });
      return;
    }
    setFieldErrors({});
    setError('');
    setLoading(true);

    try {
      // Only registered numbers can sign in — everyone else is sent to register.
      const check = await api.post('/auth/check-phone', { phone: digits });
      if (!check.data?.registered) {
        localStorage.setItem('signupPhone', digits);
        setLoading(false);
        navigate('/signup');
        return;
      }
    } catch (err) {
      setError('Unable to verify your number right now. Please try again.');
      setLoading(false);
      return;
    }

    try {
      await api.post('/otp/send', { phone: digits });
    } catch (err) {
      // Offline/demo mode — still let them key in the code.
    }
    setOtp(['', '', '', '', '', '']);
    setPhase('otp');
    setLoading(false);
  };

  const submitOtp = async (code) => {
    const digits = phone.replace(/\D/g, '');
    setError('');
    setLoading(true);
    try {
      const res = await api.post('/otp/verify', { phone: digits, otp: code });
      if (res.data?.success) {
        await finishLogin({ phone: digits, user: null, tokens: {} });
      } else {
        setError(res.data?.message || 'Invalid or expired verification code.');
        setOtp(['', '', '', '', '', '']);
        setTimeout(() => otpRefs.current[0]?.focus(), 50);
      }
    } catch (err) {
      // Demo bypass — 000000 (or a backend outage) counts as verified.
      if (code === '000000' || !err.response) {
        await finishLogin({ phone: digits, user: null, tokens: {} });
      } else {
        setError(err.response?.data?.message || 'Invalid or expired verification code.');
        setOtp(['', '', '', '', '', '']);
        setTimeout(() => otpRefs.current[0]?.focus(), 50);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (index, raw) => {
    if (loading) return;
    const value = raw.replace(/\D/g, '');
    const next = [...otp];
    next[index] = value.slice(-1) || '';
    setOtp(next);
    if (value && index < 5) otpRefs.current[index + 1]?.focus();

    const joined = next.join('');
    if (joined.length === 6) submitOtp(joined);
    else if (error) setError('');
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) otpRefs.current[index - 1]?.focus();
  };

  const handleOtpPaste = (e) => {
    const text = (e.clipboardData.getData('text') || '').replace(/\D/g, '').slice(0, 6);
    if (!text) return;
    const next = text.split('').concat(Array(6).fill('')).slice(0, 6);
    setOtp(next);
    if (next.join('').length === 6) submitOtp(next.join(''));
  };

  const handleResend = async () => {
    if (resendIn > 0 || loading) return;
    setOtp(['', '', '', '', '', '']);
    setError('');
    try {
      await api.post('/otp/send', { phone: phone.replace(/\D/g, '') });
    } catch (err) {
      // demo code still works offline
    }
    setResendIn(RESEND_SECONDS);
    setTimeout(() => otpRefs.current[0]?.focus(), 50);
  };

  const switchMethod = (next) => {
    setMethod(next);
    setError('');
    setFieldErrors({});
    setPhase('phone');
  };

  const tabStyle = (active) => ({
    flex: 1,
    padding: '0.7rem 1rem',
    borderRadius: '10px',
    border: 'none',
    cursor: 'pointer',
    fontWeight: 800,
    fontSize: '0.88rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.45rem',
    backgroundColor: active ? '#ffffff' : 'transparent',
    color: active ? '#0f57a8' : '#64748b',
    boxShadow: active ? '0 2px 6px rgba(15, 87, 168, 0.15)' : 'none',
    transition: 'all 0.2s ease',
  });

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
            backgroundRepeat: 'no-repeat',
          }}
        >
          <div className="signup-sidebar-inner">
            <SLTLogo />
            <div className="signup-badge" style={{ marginTop: '1.25rem' }}>
              <FiLock size={14} /> Secure &amp; Trusted
            </div>
            <h1 className="signup-sidebar-title">Welcome Back</h1>
            <p className="signup-sidebar-desc">
              Sign in to apply for connections, manage your services and track your requests.
            </p>
            <div className="signup-features">
              <div className="signup-feature-item">
                <div className="signup-feature-icon"><FiShield /></div>
                <div>
                  <h4>100% Secure Process</h4>
                  <p>Your data is safe with us</p>
                </div>
              </div>
              <div className="signup-feature-item">
                <div className="signup-feature-icon"><FiZap /></div>
                <div>
                  <h4>One Sign-In</h4>
                  <p>No more re-entering OTPs on every form</p>
                </div>
              </div>
              <div className="signup-feature-item">
                <div className="signup-feature-icon"><FiHeadphones /></div>
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
          <div className="signup-form-header">
            <div className="signup-form-header-icon"><FiLock /></div>
            <div>
              <h2>Sign In</h2>
              <p>Use your email and password, or sign in with your mobile number.</p>
            </div>
          </div>

          {phase === 'phone' && (
            <div
              style={{
                display: 'flex',
                gap: '0.35rem',
                backgroundColor: '#f1f5f9',
                padding: '0.35rem',
                borderRadius: '12px',
                marginBottom: '1.5rem',
              }}
            >
              <button type="button" style={tabStyle(method === 'password')} onClick={() => switchMethod('password')}>
                <FiMail size={15} /> Email &amp; Password
              </button>
              <button type="button" style={tabStyle(method === 'otp')} onClick={() => switchMethod('otp')}>
                <FiSmartphone size={15} /> Mobile &amp; OTP
              </button>
            </div>
          )}

          {error && <div className="signup-error" role="alert">{error}</div>}

          {/* ── Email + password ─────────────────────────────────── */}
          {method === 'password' && (
            <form onSubmit={handlePasswordLogin} noValidate className="signup-form">
              <div className="signup-field">
                <label className="signup-label">Email Address <span className="signup-required">*</span></label>
                <div className={`signup-input-wrap ${fieldErrors.email ? 'has-error' : ''}`}>
                  <span className="signup-input-icon"><FiMail size={16} /></span>
                  <input
                    type="email"
                    className="signup-input"
                    placeholder="example@email.com"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setFieldErrors((f) => ({ ...f, email: undefined })); }}
                  />
                </div>
                {fieldErrors.email && <p className="signup-field-error">{fieldErrors.email}</p>}
              </div>

              <div className="signup-field">
                <label className="signup-label">Password <span className="signup-required">*</span></label>
                <div className={`signup-input-wrap ${fieldErrors.password ? 'has-error' : ''}`}>
                  <span className="signup-input-icon"><FiLock size={16} /></span>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className="signup-input"
                    placeholder="••••••••••••"
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); setFieldErrors((f) => ({ ...f, password: undefined })); }}
                  />
                  <button type="button" className="signup-pw-toggle" onClick={() => setShowPassword((v) => !v)} aria-label={showPassword ? 'Hide password' : 'Show password'}>
                    {showPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                  </button>
                </div>
                {fieldErrors.password && <p className="signup-field-error">{fieldErrors.password}</p>}
              </div>

              <div className="signup-action-row">
                <button type="submit" className={`signup-btn ${loading ? 'loading' : ''}`} disabled={loading} style={{ width: '100%' }}>
                  {loading ? <div className="signup-spinner" /> : <>Sign In <FiArrowRight size={18} /></>}
                </button>
              </div>
            </form>
          )}

          {/* ── Phone + OTP ──────────────────────────────────────── */}
          {method === 'otp' && phase === 'phone' && (
            <form onSubmit={handleSendOtp} noValidate className="signup-form">
              <div className="signup-field">
                <label className="signup-label">Mobile Number <span className="signup-required">*</span></label>
                <div className={`signup-input-wrap ${fieldErrors.phone ? 'has-error' : ''}`}>
                  <span className="signup-input-icon"><FiSmartphone size={16} /></span>
                  <span className="signup-input-prefix">+94</span>
                  <input
                    type="tel"
                    inputMode="numeric"
                    className="signup-input"
                    placeholder="77 123 4567"
                    maxLength={10}
                    value={phone}
                    onChange={(e) => {
                      let val = e.target.value.replace(/\D/g, '');
                      if (val.startsWith('0')) val = val.slice(1);
                      setPhone(val.slice(0, 9));
                      setFieldErrors((f) => ({ ...f, phone: undefined }));
                    }}
                  />
                </div>
                {fieldErrors.phone
                  ? <p className="signup-field-error">{fieldErrors.phone}</p>
                  : <p className="signup-field-help">We'll text you a 6-digit verification code</p>}
              </div>

              <div className="signup-action-row">
                <button type="submit" className={`signup-btn ${loading ? 'loading' : ''}`} disabled={loading} style={{ width: '100%' }}>
                  {loading ? <div className="signup-spinner" /> : <>Send Code <FiArrowRight size={18} /></>}
                </button>
              </div>
            </form>
          )}

          {method === 'otp' && phase === 'otp' && (
            <div className="signup-form">
              <p style={{ fontSize: '0.9rem', color: '#475569', marginBottom: '1.25rem' }}>
                Enter the 6-digit code sent to <strong style={{ color: '#0f172a' }}>+94 {phone}</strong>
              </p>

              <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }} onPaste={handleOtpPaste}>
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => { otpRefs.current[index] = el; }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    disabled={loading}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(index, e)}
                    style={{
                      flex: 1,
                      height: '54px',
                      borderRadius: '12px',
                      border: digit ? '2px solid #10b981' : error ? '2px solid #dc2626' : '1.5px solid #cbd5e1',
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

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  className="signup-btn-secondary"
                  onClick={() => { setPhase('phone'); setError(''); }}
                  disabled={loading}
                >
                  <FiArrowLeft size={16} /> Change Number
                </button>
                {resendIn > 0 ? (
                  <span style={{ fontSize: '0.82rem', color: '#64748b', fontWeight: 600 }}>
                    Resend code in <strong style={{ color: '#0f172a' }}>{resendIn}s</strong>
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={handleResend}
                    disabled={loading}
                    style={{ background: 'none', border: 'none', color: '#0056b3', fontSize: '0.85rem', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
                  >
                    <FiRefreshCw size={14} /> Resend Code
                  </button>
                )}
              </div>

              <div
                style={{
                  marginTop: '1.25rem',
                  backgroundColor: '#eff6ff',
                  color: '#1e40af',
                  padding: '0.4rem 0.85rem',
                  borderRadius: '9999px',
                  fontSize: '0.75rem',
                  fontWeight: 800,
                  border: '1px solid #bfdbfe',
                  display: 'inline-block',
                }}
              >
                💡 Demo Code: <strong>000000</strong>
              </div>
            </div>
          )}

          <p className="signup-footer-text">
            New to SLTMobitel EasyApply?{' '}
            <Link to="/signup" className="signup-link signup-link--accent">Create an account</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
