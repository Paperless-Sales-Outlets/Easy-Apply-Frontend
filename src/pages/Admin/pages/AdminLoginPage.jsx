import React, { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import {
  FiAlertCircle,
  FiArrowRight,
  FiBarChart2,
  FiEye,
  FiEyeOff,
  FiLock,
  FiMail,
  FiShield,
  FiUserCheck,
} from 'react-icons/fi';
import { useAdminAuth } from '../context/AdminAuthContext';
import sltLogo from '../../../assets/slt-logo.png';

const HIGHLIGHTS = [
  {
    icon: FiBarChart2,
    title: 'Live operations view',
    text: 'Applications, KYC reviews and field work in a single dashboard.',
  },
  {
    icon: FiUserCheck,
    title: 'Role-based privileges',
    text: 'Every action is scoped to the department you belong to.',
  },
  {
    icon: FiShield,
    title: 'Audited access',
    text: 'Sign-in attempts and record changes are logged for review.',
  },
];

export default function AdminLoginPage({ onLogin }) {
  const { login: contextLogin, admin, accessToken } = useAdminAuth();
  const navigate = useNavigate();
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // If already authenticated, redirect to admin dashboard
  if (admin && accessToken) {
    return <Navigate to="/admin" replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const loginFn = onLogin || contextLogin;
    const result = await loginFn(email, password);
    if (!result || !result.ok) {
      setError(result?.message || 'Invalid email or password. Please try again.');
    } else {
      navigate('/admin', { replace: true });
    }
    setLoading(false);
  };

  return (
    <div className="admin-login-root">
      {/* Decorative brand background */}
      <div className="admin-login-bg" aria-hidden="true">
        <span className="admin-login-glow admin-login-glow-blue" />
        <span className="admin-login-glow admin-login-glow-green" />
        <span className="admin-login-orb" />
        <div className="admin-login-grid" />
        <div className="admin-login-art">
          <span /><span /><span /><span />
        </div>
        <div className="admin-login-vignette" />
      </div>

      <main className="admin-login-shell">
        {/* Brand panel */}
        <section className="admin-login-aside">
          <span className="admin-login-aside-slash" aria-hidden="true" />
          <div className="admin-login-aside-inner">
            <span className="admin-login-badge">
              <FiShield size={14} aria-hidden="true" /> Restricted access
            </span>
            <h2 className="admin-login-aside-title">
              Run every EasyApply operation from one place.
            </h2>
            <p className="admin-login-aside-text">
              Review incoming applications, verify KYC, schedule appointments and
              coordinate field technicians — all backed by real-time reporting.
            </p>

            <ul className="admin-login-highlights">
              {HIGHLIGHTS.map(({ icon: Icon, title, text }) => (
                <li className="admin-login-highlight" key={title}>
                  <span className="admin-login-highlight-icon" aria-hidden="true">
                    <Icon size={17} />
                  </span>
                  <div>
                    <p className="admin-login-highlight-title">{title}</p>
                    <p className="admin-login-highlight-text">{text}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <p className="admin-login-aside-foot">
            SLTMobitel EasyApply · Authorised personnel only
          </p>
        </section>

        {/* Sign-in card */}
        <section className="admin-login-card">
          <div className="admin-login-top" />

          <div className="admin-login-card-inner">
            <div className="admin-login-logo">
              <img
                className="admin-login-logo-img"
                src={sltLogo}
                alt="SLTMobitel"
                width="250"
                height="95"
              />
              <p className="admin-login-portal">Admin Portal </p>
            </div>

            <h1 className="admin-login-title">Sign in to continue</h1>
            <p className="admin-login-subtitle">
              Sign in with your SLTMobitel staff credentials.
            </p>

            {error && (
              <div className="admin-login-error" role="alert">
                <FiAlertCircle size={16} aria-hidden="true" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} noValidate>
              <div className="admin-login-field">
                <label className="admin-login-label" htmlFor="admin-email">
                  Email Address
                </label>
                <div className="admin-login-input-wrap">
                  <span className="admin-login-input-icon" aria-hidden="true">
                    <FiMail size={16} />
                  </span>
                  <input
                    id="admin-email"
                    name="email"
                    type="email"
                    className="admin-login-input"
                    placeholder="name@slt.lk"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                    autoComplete="username"
                    autoFocus
                  />
                </div>
              </div>

              <div className="admin-login-field">
                <label className="admin-login-label" htmlFor="admin-password">
                  Password
                </label>
                <div className="admin-login-input-wrap">
                  <span className="admin-login-input-icon" aria-hidden="true">
                    <FiLock size={16} />
                  </span>
                  <input
                    id="admin-password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    className="admin-login-input has-toggle"
                    placeholder="••••••••"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    className="admin-login-toggle"
                    onClick={() => setShowPassword(v => !v)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    aria-pressed={showPassword}
                    tabIndex={-1}
                  >
                    {showPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                  </button>
                </div>
              </div>

              <button type="submit" className="admin-login-submit" disabled={loading} aria-busy={loading}>
                {loading ? (
                  <>
                    <span className="admin-login-spinner" aria-hidden="true" />
                    Signing in…
                  </>
                ) : (
                  <>
                    Sign In
                    <FiArrowRight size={17} aria-hidden="true" />
                  </>
                )}
              </button>
            </form>

            <p className="admin-login-note">
              <FiLock size={13} aria-hidden="true" />
              Protected area. All sessions are monitored and logged.
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}
