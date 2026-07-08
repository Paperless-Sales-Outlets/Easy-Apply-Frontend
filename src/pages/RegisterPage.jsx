import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import sltLogo from '../assets/sltlogoOnly.png';
import Icon from '../components/Icon';

export default function RegisterPage() {
  const { t } = useTranslation();
  const { register } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [NIC, setNic] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    // Basic frontend format check for phone number (should be 9 digits)
    if (phone.replace(/\D/g, '').length !== 9) {
      setError(t('validation.mobile', 'Enter a valid 9-digit mobile number.'));
      setIsSubmitting(false);
      return;
    }

    const result = await register(name, email, phone, NIC, password);
    setIsSubmitting(false);

    if (result.success) {
      navigate('/', { replace: true });
    } else {
      setError(result.error);
    }
  };

  return (
    <div className="otp-screen" style={{ minHeight: '85vh', padding: '2rem 1rem' }}>
      <motion.div
        className="otp-card"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        style={{ maxWidth: '460px', width: '100%' }}
      >
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
          <img src={sltLogo} alt="SLTMobitel Logo" style={{ height: '55px', width: 'auto', objectFit: 'contain' }} />
        </div>
        <h2 className="otp-title" style={{ color: 'var(--slt-green)' }}>{t('register.title', 'Create Account')}</h2>
        <p className="otp-text">{t('register.subtitle', 'Register once to manage all portal requests')}</p>

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
          <div className="form-group" style={{ marginBottom: '1rem' }}>
            <label className="form-label" htmlFor="reg-name" style={{ fontWeight: '600' }}>
              {t('register.name', 'Full Name')}
            </label>
            <input
              id="reg-name"
              type="text"
              className="form-control"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              autoFocus
            />
          </div>

          <div className="form-group" style={{ marginBottom: '1rem' }}>
            <label className="form-label" htmlFor="reg-email" style={{ fontWeight: '600' }}>
              {t('register.email', 'Email Address')}
            </label>
            <input
              id="reg-email"
              type="email"
              className="form-control"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group" style={{ marginBottom: '1rem' }}>
            <label className="form-label" htmlFor="reg-phone" style={{ fontWeight: '600' }}>
              {t('register.phone', 'Phone Number')}
            </label>
            <div style={{ display: 'flex', alignItems: 'center', position: 'relative' }}>
              <span 
                style={{ 
                  position: 'absolute', 
                  left: '1rem', 
                  fontSize: '0.9rem', 
                  color: 'var(--text-secondary)',
                  fontWeight: '500' 
                }}
              >
                +94
              </span>
              <input
                id="reg-phone"
                type="tel"
                className="form-control"
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 9))}
                style={{ paddingLeft: '3.2rem' }}
                required
              />
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: '1rem' }}>
            <label className="form-label" htmlFor="reg-nic" style={{ fontWeight: '600' }}>
              {t('register.NIC', 'NIC / Passport / BR Number')}
            </label>
            <input
              id="reg-nic"
              type="text"
              className="form-control"
              value={NIC}
              onChange={(e) => setNic(e.target.value)}
              required
            />
          </div>

          <div className="form-group" style={{ marginBottom: '1.5rem' }}>
            <label className="form-label" htmlFor="reg-password" style={{ fontWeight: '600' }}>
              {t('register.password', 'Password')}
            </label>
            <input
              id="reg-password"
              type="password"
              className="form-control"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
            />
          </div>

          <button 
            type="submit" 
            className="btn btn-success btn-block" 
            disabled={isSubmitting}
            style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', height: '46px' }}
          >
            {isSubmitting ? '...' : t('register.button', 'Register')}
            {!isSubmitting && <Icon name="check" size={18} />}
          </button>
        </form>

        <p style={{ marginTop: '1.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
          {t('register.haveAccount', 'Already have an account?')}{' '}
          <Link to="/login" style={{ color: 'var(--slt-blue)', fontWeight: '600', textDecoration: 'none' }}>
            {t('register.loginLink', 'Sign In')}
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
