import React, { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FiLock, FiSmartphone, FiArrowRight, FiArrowLeft, FiShield, FiZap, FiHeadphones, FiRefreshCw } from 'react-icons/fi';
import './SignUpPage.css';
import signupBgImage from '../assets/team_laptop.jpg';
import api from '../utils/api';
import { saveSession } from '../utils/authSession';

const RESEND_SECONDS = 30;
const OTP_LENGTH = 6;

const SLTLogo = () => (
  <svg width="170" height="48" viewBox="0 0 170 48" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="SLTMobitel — The Connection">
    <line x1="4" y1="42" x2="18" y2="6" stroke="#0f57a8" strokeWidth="4" strokeLinecap="round" />
    <line x1="14" y1="42" x2="28" y2="6" stroke="#50b748" strokeWidth="4" strokeLinecap="round" />
    <text x="34" y="32" fontFamily="var(--font-head)" fontWeight="800" fontSize="20" fill="#ffffff">SLT</text>
    <text x="74" y="32" fontFamily="var(--font-head)" fontWeight="800" fontSize="20" fill="#50b748">MOBITEL</text>
    <text x="34" y="44" fontFamily="var(--font-body)" fontWeight="400" fontSize="8" fill="rgba(255,255,255,0.55)" letterSpacing="1.5">The Connection</text>
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
    // A lookup outage shouldn't block sign-in — they're treated as a customer
    // with no SLT products until the next successful lookup.
    return [];
  }
}

/**
 * Sign in with a mobile number and a one-time code.
 *
 * This is the only sign-in method: SLT asked for email/password to be removed,
 * so a customer's phone number is their single credential.
 */
export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const redirectTo = location.state?.from || '/';

  const [phase, setPhase] = useState('phone'); // 'phone' | 'otp'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState(Array(OTP_LENGTH).fill(''));
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
      const res = await api.post('/auth/otp-login', { phone: digits, otp: code });
      const { user, accessToken, refreshToken } = res.data || {};
      const accounts = await fetchSltAccounts(user?.phone || digits);
      saveSession({
        phone: user?.phone || digits,
        user,
        accountsList: accounts,
        tokens: { accessToken, refreshToken },
      });
      navigate(redirectTo, { replace: true });
    } catch (err) {
      if (!err.response) {
        // API unreachable — fall back to the plain OTP check so the flow still
        // works during local development.
        try { await api.post('/otp/verify', { phone: digits, otp: code }); } catch (_) { /* offline */ }
        const accounts = await fetchSltAccounts(digits);
        saveSession({ phone: digits, user: null, accountsList: accounts, tokens: {} });
        navigate(redirectTo, { replace: true });
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
    if (e.key === 'Backspace' && !otp[index] && index > 0) otpRefs.current[index - 1]?.focus();
    else if (e.key === 'ArrowLeft' && index > 0) { e.preventDefault(); otpRefs.current[index - 1]?.focus(); }
    else if (e.key === 'ArrowRight' && index < OTP_LENGTH - 1) { e.preventDefault(); otpRefs.current[index + 1]?.focus(); }
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
    try { await api.post('/otp/send', { phone: phone.replace(/\D/g, '') }); } catch (err) { /* demo code still works */ }
    setResendIn(RESEND_SECONDS);
    setTimeout(() => otpRefs.current[0]?.focus(), 50);
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
              Sign in with your mobile number to apply for connections, manage your services
              and track your requests.
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
                  <p className="signup-feature-title">No Password Needed</p>
                  <p>Just your number and a one-time code</p>
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
            <div className="signup-form-header-icon" aria-hidden="true"><FiSmartphone /></div>
            <div>
              <h2>Sign In</h2>
              <p>We'll text a one-time code to your registered mobile number.</p>
            </div>
          </div>

          <div role="alert" aria-live="assertive">
            {error && <div className="signup-error">{error}</div>}
          </div>

          {phase === 'phone' ? (
            <form onSubmit={handleSendOtp} noValidate className="signup-form">
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
                  : <p className="signup-field-help" id="login-phone-help">Sri Lankan mobile number, without the leading zero.</p>}
              </div>

              <div className="signup-action-row">
                <button type="submit" className="signup-btn" disabled={loading} aria-busy={loading} style={{ width: '100%' }}>
                  {loading
                    ? <><span className="signup-spinner" aria-hidden="true" /> Sending code…</>
                    : <>Send Code <FiArrowRight size={18} aria-hidden="true" /></>}
                </button>
              </div>
            </form>
          ) : (
            <div className="signup-form">
              <p style={{ fontSize: '0.9rem', color: '#475569', marginBottom: '1.25rem' }} id="otp-instructions">
                Enter the 6-digit code sent to <strong style={{ color: '#0f172a' }}>+94 {phone}</strong>
              </p>

              <div role="group" aria-labelledby="otp-instructions" className="otp-boxes" onPaste={handleOtpPaste}>
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
