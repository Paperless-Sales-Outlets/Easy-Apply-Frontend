import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Icon from '../Icon';
import sltLogo from '../../assets/sltlogoOnly.png';

export default function Navbar() {
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  const isActive = (path) => {
    return location.pathname === path ? 'active' : '';
  };

  // Close menu when route changes
  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    if (menuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [menuOpen]);

  return (
    <nav className="top-navbar-wrapper" ref={menuRef}>
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

        {/* Desktop Navigation Links */}
        <div className="nav-links nav-links-desktop">
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
            Help &amp; Support
          </Link>
          <Link to="/profile" className={`nav-link ${isActive('/profile')}`}>
            <Icon name="user" size={18} />
            My Profile
          </Link>
        </div>

        {/* Right side: Language + Hamburger */}
        <div className="navbar-right">
          {/* Language Switcher */}
          <div className="lang-switcher">
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

          {/* Hamburger Button — mobile only */}
          <button
            className="hamburger-btn"
            onClick={() => setMenuOpen((prev) => !prev)}
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
          >
            <span className={`hamburger-icon ${menuOpen ? 'open' : ''}`}>
              <span />
              <span />
              <span />
            </span>
          </button>
        </div>
      </div>

      {/* Mobile Dropdown Menu */}
      <div className={`mobile-nav-menu ${menuOpen ? 'mobile-nav-menu--open' : ''}`}>
        <Link to="/" className={`mobile-nav-link ${isActive('/')}`} onClick={() => setMenuOpen(false)}>
          <Icon name="home" size={18} />
          Home
        </Link>
        <Link to="/check-status" className={`mobile-nav-link ${isActive('/check-status')}`} onClick={() => setMenuOpen(false)}>
          <Icon name="check-circle" size={18} />
          Application Status
        </Link>
        <Link to="/help" className={`mobile-nav-link ${isActive('/help')}`} onClick={() => setMenuOpen(false)}>
          <Icon name="help-circle" size={18} />
          Help &amp; Support
        </Link>
        <Link to="/profile" className={`mobile-nav-link ${isActive('/profile')}`} onClick={() => setMenuOpen(false)}>
          <Icon name="user" size={18} />
          My Profile
        </Link>
      </div>
    </nav>
  );
}
