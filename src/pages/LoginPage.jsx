import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import sltLogo from '../assets/sltlogoOnly.png';
import { useAuth } from '../context/AuthContext';
import Icon from '../components/Icon';

export default function LoginPage() {
  const { t } = useTranslation();
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Redirect target after login (defaults to dashboard "/")
  const from = location.state?.from?.pathname || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    const result = await login(email, password);
    setIsSubmitting(false);

    if (result.success) {
      navigate(from, { replace: true });
    } else {
      setError(result.error);
    }
  };

  return (
    <div className="otp-screen" style={{ minHeight: '80vh' }}>
      <motion.div
        className="otp-card"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        style={{ maxWidth: '420px', width: '100%' }}
      >
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
          <img src={sltLogo} alt="SLTMobitel Logo" style={{ height: '55px', width: 'auto', objectFit: 'contain' }} />
        </div>
        <h2 className="otp-title" style={{ color: 'var(--slt-blue)' }}>{t('login.title', 'Sign In')}</h2>
        <p className="otp-text">{t('login.subtitle', 'Access your customer application forms')}</p>

        {error && (
          <div 
            style={{ 
              backgroundColor: '#fef2f2', 
              border: '1px solid #fecaca', 
              color: '#991b1b', 
              padding: '0.8rem', 
              borderRadius: '6px', 
              fontSize: '0.85rem',
              marginBottom: '1.5rem',
              textAlign: 'left'
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ textAlign: 'left' }}>
          <div className="form-group" style={{ marginBottom: '1.25rem' }}>
            <label className="form-label" htmlFor="login-email" style={{ fontWeight: '600' }}>
              {t('login.email', 'Email Address')}
            </label>
            <input
              id="login-email"
              type="email"
              className="form-control"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoFocus
            />
          </div>

          <div className="form-group" style={{ marginBottom: '1.5rem' }}>
            <label className="form-label" htmlFor="login-password" style={{ fontWeight: '600' }}>
              {t('login.password', 'Password')}
            </label>
            <input
              id="login-password"
              type="password"
              className="form-control"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button 
            type="submit" 
            className="btn btn-primary btn-block" 
            disabled={isSubmitting}
            style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', height: '46px' }}
          >
            {isSubmitting ? '...' : t('login.button', 'Sign In')}
            {!isSubmitting && <Icon name="arrow-right" size={18} />}
          </button>
        </form>

        <p style={{ marginTop: '1.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
          {t('login.noAccount', "Don't have an account?")}{' '}
          <Link to="/register" style={{ color: 'var(--slt-green)', fontWeight: '600', textDecoration: 'none' }}>
            {t('login.registerLink', 'Register Now')}
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
