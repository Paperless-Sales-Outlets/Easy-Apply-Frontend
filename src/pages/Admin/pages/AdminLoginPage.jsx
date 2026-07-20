import React, { useState } from 'react';

export default function AdminLoginPage({ onLogin }) {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    await new Promise(r => setTimeout(r, 600)); // simulate network
    const ok = onLogin(email, password);
    if (!ok) setError('Invalid email or password. Please try again.');
    setLoading(false);
  };

  return (
    <div className="admin-login-root">
      {/* Decorative skewed bars */}
      <div className="admin-login-art" aria-hidden="true">
        <span /><span /><span />
      </div>

      <div className="admin-login-card">
        <div className="admin-login-top" />

        {/* Logo */}
        <div className="admin-login-logo">
          <div className="admin-login-logo-icon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          </div>
          <h1>
            SLTMobitel EasyApply
            <small>Admin &amp; Operations Portal</small>
          </h1>
        </div>

        <h2>Sign In</h2>
        <p className="admin-login-subtitle">
          Sign in with your SLTMobitel staff credentials
        </p>

        {error && <div className="admin-login-error">{error}</div>}

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label className="form-label" htmlFor="admin-email">
              Email Address
            </label>
            <input
              id="admin-email"
              type="email"
              className="form-control"
              placeholder="name@slt.lk"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              autoComplete="username"
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="admin-password">
              Password
            </label>
            <input
              id="admin-password"
              type="password"
              className="form-control"
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', marginTop: '0.5rem' }}
            disabled={loading}
          >
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>

        <p style={{ marginTop: '1.5rem', fontSize: '0.78rem', color: 'var(--muted)', textAlign: 'center' }}>
          Demo: enter any email + password to sign in
        </p>
      </div>
    </div>
  );
}
