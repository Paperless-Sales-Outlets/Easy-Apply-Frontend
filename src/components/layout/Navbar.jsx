import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Icon from '../Icon';
import sltLogo from '../../assets/sltlogoOnly.png';

export default function Navbar() {
  const { t, i18n } = useTranslation();
  const location = useLocation();

  const isActive = (path) => {
    return location.pathname === path ? 'active' : '';
  };

  return (
    <nav className="top-navbar-wrapper">
      <div className="top-navbar-container">

        {/* Logo */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}>
          <img
            src={sltLogo}
            alt="SLTMobitel logo"
            style={{ height: '36px', width: 'auto', objectFit: 'contain', marginRight: '8px' }}
          />
          <span
            style={{
              fontFamily: 'var(--font-head)',
              fontSize: '1.2rem',
              fontWeight: 700,
              lineHeight: 1.1,
              color: 'var(--navy)'
            }}
          >
            {t('nav.title')}
          </span>
        </Link>

        {/* Navigation Links */}
        <div className="nav-links">
          <Link to="/" className={`nav-link ${isActive('/')}`}>
            <Icon name="home" size={18} />
            Home
          </Link>
          <Link to="/check-status" className={`nav-link ${isActive('/check-status')}`}>
            <Icon name="check-circle" size={18} />
            Application Status
          </Link>
          <Link to="/help" className={`nav-link ${isActive('/help')}`}>
            <Icon name="help-circle" size={18} />
            Help & Support
          </Link>
          <Link to="/profile" className={`nav-link ${isActive('/profile')}`}>
            <Icon name="user" size={18} />
            My Profile
          </Link>
        </div>

        {/* Language Switcher */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.3rem',
            padding: '0.4rem 0.6rem',
            backgroundColor: '#f8fafc',
            borderRadius: '8px',
            border: '1px solid var(--line)',
          }}
        >
          <Icon name="globe" size={16} style={{ color: 'var(--blue)' }} />
          <select
            value={i18n.language}
            onChange={(e) => i18n.changeLanguage(e.target.value)}
            aria-label="Language"
            style={{
              border: 'none',
              backgroundColor: 'transparent',
              outline: 'none',
              fontSize: '0.85rem',
              fontFamily: 'var(--font-body)',
              color: 'var(--text)',
              cursor: 'pointer',
            }}
          >
            <option value="en">English</option>
            <option value="si">සිංහල</option>
            <option value="ta">தமிழ்</option>
          </select>
        </div>

      </div>
    </nav>
  );
}
