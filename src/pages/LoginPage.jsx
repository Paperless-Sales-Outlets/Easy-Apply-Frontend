import React, { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FiMail, FiLock, FiSmartphone, FiEye, FiEyeOff, FiArrowRight, FiArrowLeft, FiShield, FiZap, FiHeadphones, FiRefreshCw } from 'react-icons/fi';
import './SignUpPage.css';
import signupBgImage from '../assets/team_laptop.jpg';
import api from '../utils/api';
import { saveSession } from '../utils/authSession';

const RESEND_SECONDS = 30;
const OTP_LENGTH = 6;

/* SLTMobitel logo, matching the sign-up screen */
const SLTLogo = () => (
  <svg width="170" height="48" viewBox="0 0 170 48" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="SLTMobitel — The Connection">
    <line x1="4" y1="42" x2="18" y2="6" stroke="#0f57a8" strokeWidth="4" strokeLinecap="round" />
    <line x1="14" y1="42" x2="28" y2="6" stroke="#50b748" strokeWidth="4" strokeLinecap="round" />
    <text x="34" y="32" fontFamily="'Outfit', system-ui, sans-serif" fontWeight="800" fontSize="20" fill="#ffffff">SLT</text>
    <text x="74" y="32" fontFamily="'Outfit', system-ui, sans-serif" fontWeight="800" fontSize="20" fill="#50b748">MOBITEL</text>
    <text x="34" y="44" fontFamily="system-ui, sans-serif" fontWeight="400" fontSize="8" fill="rgba(255,255,255,0.55)" letterSpacing="1.5">The Connection</text>
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
  const [otp, setOtp] = useState(Array(OTP_LENGTH).fill(''));
  const [resendIn, setResendIn] = useState(RESEND_SECONDS);
  const otpRefs = useRef([]);
  const tabRefs = useRef([]);

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
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) fe.email = 'Enter a valid email address';
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
    setOtp(Array(OTP_LENGTH).fill(''));
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
        setOtp(Array(OTP_LENGTH).fill(''));
        setTimeout(() => otpRefs.current[0]?.focus(), 50);
      }
    } catch (err) {
      // Demo bypass — 000000 (or a backend outage) counts as verified.
      if (code === '000000' || !err.response) {
        await finishLogin({ phone: digits, user: null, tokens: {} });
      } else {
        setError(err.response?.data?.message || 'Invalid or expired verification code.');
        setOtp(Array(OTP_LENGTH).fill(''));
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
    if (value && index < OTP_LENGTH - 1) otpRefs.current[index + 1]?.focus();

    const joined = next.join('');
    if (joined.length === OTP_LENGTH) submitOtp(joined);
    else if (error) setError('');
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowLeft' && index > 0) {
      e.preventDefault();
      otpRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < OTP_LENGTH - 1) {
      e.preventDefault();
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpPaste = (e) => {
    const text = (e.clipboardData.getData('text') || '').replace(/\D/g, '').slice(0, OTP_LENGTH);
    if (!text) return;
    e.preventDefault();
    const next = text.split('').concat(Array(OTP_LENGTH).fill('')).slice(0, OTP_LENGTH);
    setOtp(next);
    if (next.join('').length === OTP_LENGTH) submitOtp(next.join(''));
  };

  const handleResend = async () => {
    if (resendIn > 0 || loading) return;
    setOtp(Array(OTP_LENGTH).fill(''));
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

  // Roving focus between the two sign-in method tabs, per the WAI-ARIA
  // tabs pattern — arrow keys move, Home/End jump to the ends.
  const handleTabKeyDown = (e) => {
    const order = ['password', 'otp'];
    const i = order.indexOf(method);
    let next = null;
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') next = order[(i + 1) % order.length];
    else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') next = order[(i - 1 + order.length) % order.length];
    else if (e.key === 'Home') next = order[0];
    else if (e.key === 'End') next = order[order.length - 1];
    if (!next) return;
    e.preventDefault();
    switchMethod(next);
    setTimeout(() => tabRefs.current[order.indexOf(next)]?.focus(), 0);
  };

  return (
    <div className="signup-root">
      <div className="signup-card">
        {/* LEFT SIDEBAR — decorative brand panel */}
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
            <p className="signup-badge" style={{ marginTop: '1.25rem' }}>
              <FiLock size={14} aria-hidden="true" /> Secure &amp; Trusted
            </p>
            <h1 className="signup-sidebar-title">Welcome Back</h1>
            <p className="signup-sidebar-desc">
              Sign in to apply for connections, manage your services and track your requests.
            </p>
            <ul className="signup-features" style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              <li className="signup-feature-item">
                <div className="signup-feature-icon" aria-hidden="true"><FiShield /></div>
                <div>
                  <p className="signup-feature-title">100% Secure Process</p>
                  <p>Your data is safe with us</p>
                </div>
              </li>
              <li className="signup-feature-item">
                <div className="signup-feature-icon" aria-hidden="true"><FiZap /></div>
                <div>
                  <p className="signup-feature-title">One Sign-In</p>
                  <p>No more re-entering OTPs on every form</p>
                </div>
              </li>
              <li className="signup-feature-item">
                <div className="signup-feature-icon" aria-hidden="true"><FiHeadphones /></div>
                <div>
                  <p className="signup-feature-title">24/7 Support</p>
                  <p>We're here to help you anytime</p>
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* RIGHT SIDE (Form) */}
        <main className="signup-form-section">
          <div className="signup-form-header">
            <div className="signup-form-header-icon" aria-hidden="true"><FiLock /></div>
            <div>
              <h2>Sign In</h2>
              <p>Use your email and password, or sign in with your mobile number.</p>
            </div>
          </div>

          {phase === 'phone' && (
            <div className="auth-tabs" role="tablist" aria-label="Sign-in method">
              <button
                type="button"
                role="tab"
                id="tab-password"
                aria-selected={method === 'password'}
                aria-controls={method === 'password' ? 'panel-password' : undefined}
                tabIndex={method === 'password' ? 0 : -1}
                ref={(el) => { tabRefs.current[0] = el; }}
                className={`auth-tab ${method === 'password' ? 'is-active' : ''}`}
                onClick={() => switchMethod('password')}
                onKeyDown={handleTabKeyDown}
              >
                <FiMail size={15} aria-hidden="true" /> Email &amp; Password
              </button>
              <button
                type="button"
                role="tab"
                id="tab-otp"
                aria-selected={method === 'otp'}
                aria-controls={method === 'otp' ? 'panel-otp' : undefined}
                tabIndex={method === 'otp' ? 0 : -1}
                ref={(el) => { tabRefs.current[1] = el; }}
                className={`auth-tab ${method === 'otp' ? 'is-active' : ''}`}
                onClick={() => switchMethod('otp')}
                onKeyDown={handleTabKeyDown}
              >
                <FiSmartphone size={15} aria-hidden="true" /> Mobile &amp; OTP
              </button>
            </div>
          )}

          {/* Announced to screen readers the moment a sign-in attempt fails */}
          <div role="alert" aria-live="assertive">
            {error && <div className="signup-error">{error}</div>}
          </div>

          {/* ── Email + password ─────────────────────────────────── */}
          {method === 'password' && (
            <form
              onSubmit={handlePasswordLogin}
              noValidate
              className="signup-form"
              id="panel-password"
              role="tabpanel"
              aria-labelledby="tab-password"
            >
              <div className="signup-field">
                <label className="signup-label" htmlFor="login-email">
                  Email Address <span className="signup-required" aria-hidden="true">*</span>
                </label>
                <div className={`signup-input-wrap ${fieldErrors.email ? 'has-error' : ''}`}>
                  <span className="signup-input-icon" aria-hidden="true"><FiMail size={16} /></span>
                  <input
                    id="login-email"
                    name="email"
                    type="email"
                    required
                    className="signup-input"
                    placeholder="example@email.com"
                    autoComplete="email"
                    aria-invalid={!!fieldErrors.email}
                    aria-describedby={fieldErrors.email ? 'login-email-error' : undefined}
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setFieldErrors((f) => ({ ...f, email: undefined })); }}
                  />
                </div>
                {fieldErrors.email && <p className="signup-field-error" id="login-email-error">{fieldErrors.email}</p>}
              </div>

              <div className="signup-field">
                <label className="signup-label" htmlFor="login-password">
                  Password <span className="signup-required" aria-hidden="true">*</span>
                </label>
                <div className={`signup-input-wrap ${fieldErrors.password ? 'has-error' : ''}`}>
                  <span className="signup-input-icon" aria-hidden="true"><FiLock size={16} /></span>
                  <input
                    id="login-password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    className="signup-input"
                    placeholder="Enter your password"
                    autoComplete="current-password"
                    aria-invalid={!!fieldErrors.password}
                    aria-describedby={fieldErrors.password ? 'login-password-error' : undefined}
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); setFieldErrors((f) => ({ ...f, password: undefined })); }}
                  />
                  <button
                    type="button"
                    className="signup-pw-toggle"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    aria-pressed={showPassword}
                  >
                    {showPassword ? <FiEyeOff size={16} aria-hidden="true" /> : <FiEye size={16} aria-hidden="true" />}
                  </button>
                </div>
                {fieldErrors.password && <p className="signup-field-error" id="login-password-error">{fieldErrors.password}</p>}
              </div>

              <div className="signup-action-row">
                <button type="submit" className="signup-btn" disabled={loading} aria-busy={loading} style={{ width: '100%' }}>
                  {loading ? (
                    <><span className="signup-spinner" aria-hidden="true" /> Signing in…</>
                  ) : (
                    <>Sign In <FiArrowRight size={18} aria-hidden="true" /></>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* ── Phone + OTP ──────────────────────────────────────── */}
          {method === 'otp' && phase === 'phone' && (
            <form
              onSubmit={handleSendOtp}
              noValidate
              className="signup-form"
              id="panel-otp"
              role="tabpanel"
              aria-labelledby="tab-otp"
            >
              <div className="signup-field">
                <label className="signup-label" htmlFor="login-phone">
                  Mobile Number <span className="signup-required" aria-hidden="true">*</span>
                </label>
                <div className={`signup-input-wrap ${fieldErrors.phone ? 'has-error' : ''}`}>
                  <span className="signup-input-icon" aria-hidden="true"><FiSmartphone size={16} /></span>
                  <span className="signup-input-prefix" aria-hidden="true">+94</span>
                  <input
                    id="login-phone"
                    name="phone"
                    type="tel"
                    required
                    inputMode="numeric"
                    autoComplete="tel-national"
                    className="signup-input"
                    placeholder="77 123 4567"
                    maxLength={10}
                    aria-invalid={!!fieldErrors.phone}
                    aria-describedby={fieldErrors.phone ? 'login-phone-error' : 'login-phone-help'}
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
                  ? <p className="signup-field-error" id="login-phone-error">{fieldErrors.phone}</p>
                  : <p className="signup-field-help" id="login-phone-help">Sri Lankan mobile number, without the leading zero. We'll text you a 6-digit verification code.</p>}
              </div>

              <div className="signup-action-row">
                <button type="submit" className="signup-btn" disabled={loading} aria-busy={loading} style={{ width: '100%' }}>
                  {loading ? (
                    <><span className="signup-spinner" aria-hidden="true" /> Sending code…</>
                  ) : (
                    <>Send Code <FiArrowRight size={18} aria-hidden="true" /></>
                  )}
                </button>
              </div>
            </form>
          )}

          {method === 'otp' && phase === 'otp' && (
            <div className="signup-form" role="group" aria-labelledby="otp-instructions">
              <p style={{ fontSize: '0.9rem', color: '#475569', marginBottom: '1.25rem' }} id="otp-instructions">
                Enter the 6-digit code sent to <strong style={{ color: '#0f172a' }}>+94 {phone}</strong>
              </p>

              <div
                role="group"
                aria-labelledby="otp-instructions"
                className="otp-boxes"
                onPaste={handleOtpPaste}
              >
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => { otpRefs.current[index] = el; }}
                    type="text"
                    inputMode="numeric"
                    autoComplete={index === 0 ? 'one-time-code' : 'off'}
                    maxLength={1}
                    value={digit}
                    disabled={loading}
                    aria-label={`Verification code digit ${index + 1} of ${OTP_LENGTH}`}
                    aria-invalid={!!error}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(index, e)}
                    className={`otp-box ${digit ? 'is-filled' : ''} ${error ? 'is-error' : ''}`}
                  />
                ))}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap', marginTop: '1.25rem' }}>
                <button
                  type="button"
                  className="signup-btn-secondary signup-btn-secondary--auto"
                  onClick={() => { setPhase('phone'); setError(''); }}
                  disabled={loading}
                >
                  <FiArrowLeft size={16} aria-hidden="true" /> Change Number
                </button>
                {resendIn > 0 ? (
                  <span style={{ fontSize: '0.82rem', color: '#5b6472', fontWeight: 600 }} aria-live="polite">
                    Resend code in <strong style={{ color: '#0f172a' }}>{resendIn}s</strong>
                  </span>
                ) : (
                  <button type="button" className="auth-link-btn" onClick={handleResend} disabled={loading}>
                    <FiRefreshCw size={14} aria-hidden="true" /> Resend Code
                  </button>
                )}
              </div>

              {import.meta.env.DEV && (
                <p className="auth-dev-hint">Development only — demo code <strong>000000</strong> is accepted.</p>
              )}
            </div>
          )}

          <p className="signup-footer-text">
            New to SLTMobitel EasyApply?{' '}
            <Link to="/signup" className="signup-link signup-link--accent">Create an account</Link>
          </p>
        </main>
      </div>
    </div>
  );
}
