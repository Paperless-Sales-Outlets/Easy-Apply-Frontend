import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FiSearch, FiShoppingCart, FiGlobe, FiMenu, FiX } from 'react-icons/fi';
import sltLogo from '../../assets/sltlogoOnly.png';
import { getLocalCart } from '../../services/productService';

const countCartItems = () => {
  try {
    return getLocalCart().reduce((acc, item) => acc + (item.quantity || 1), 0);
  } catch (e) {
    return 0;
  }
};

export default function Navbar() {
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchCategory, setSearchCategory] = useState('All');
  const menuRef = useRef(null);

  const [cartCount, setCartCount] = useState(countCartItems);

  useEffect(() => {
    const syncCartCount = () => setCartCount(countCartItems());
    syncCartCount();
    window.addEventListener('easyapply:cart-updated', syncCartCount);
    window.addEventListener('storage', syncCartCount);
    return () => {
      window.removeEventListener('easyapply:cart-updated', syncCartCount);
      window.removeEventListener('storage', syncCartCount);
    };
  }, []);

  const isActivePath = (path) =>
    path === '/' ? location.pathname === '/' : location.pathname.startsWith(path);

  const navLinkStyle = (path) =>
    isActivePath(path)
      ? {
          color: '#0056b3',
          textDecoration: 'none',
          fontWeight: 800,
          fontSize: '0.88rem',
          position: 'relative',
          paddingBottom: '0.25rem',
          borderBottom: '2.5px solid #0056b3',
        }
      : {
          color: '#334155',
          textDecoration: 'none',
          fontWeight: 600,
          fontSize: '0.88rem',
          position: 'relative',
          paddingBottom: '0.25rem',
          borderBottom: '2.5px solid transparent',
        };

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

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
    <nav className="top-navbar-wrapper" ref={menuRef} style={{ backgroundColor: '#ffffff', borderBottom: '1px solid #e2e8f0', position: 'sticky', top: 0, zIndex: 100 }}>
      <div style={{ maxWidth: '1600px', margin: '0 auto', padding: 'clamp(0.4rem, 2vw, 0.65rem) clamp(0.5rem, 4vw, 1.5rem)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 'clamp(0.5rem, 2vw, 1.25rem)' }}>

        {/* ── Left: Logo ── */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none', gap: '0.45rem', flexShrink: 0 }}>
          <img
            src={sltLogo}
            alt="SLTMobitel logo"
            style={{ height: '26px', width: 'auto', objectFit: 'contain' }}
          />
          <span
            style={{
              fontFamily: 'var(--font-head)',
              fontSize: '1.05rem',
              fontWeight: 800,
              color: '#191970',
              letterSpacing: '-0.02em',
              whiteSpace: 'nowrap',
              display: 'inline-flex',
              gap: '0.3rem',
            }}
          >
            <span>SLTMobitel</span>
            <span style={{ fontWeight: 700 }}>EasyApply</span>
          </span>
        </Link>

        {/* ── Center Search Input Bar (Matching Image exact design) ── */}
        <div style={{ flex: 1, maxWidth: '580px', display: 'flex', alignItems: 'center' }} className="nav-center-search">
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              width: '100%',
              backgroundColor: '#ffffff',
              border: '1.5px solid #cbd5e1',
              borderRadius: '8px',
              overflow: 'hidden',
              boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
            }}
          >
            <FiSearch style={{ color: '#94a3b8', marginLeft: '0.75rem', flexShrink: 0 }} size={16} />
            <input
              type="text"
              placeholder="Search packages, speeds, products..."
              style={{
                flex: 1,
                padding: '0.5rem 0.75rem',
                border: 'none',
                outline: 'none',
                fontSize: '0.85rem',
                color: '#0f172a',
                backgroundColor: 'transparent',
              }}
            />
            <select
              value={searchCategory}
              onChange={(e) => setSearchCategory(e.target.value)}
              style={{
                border: 'none',
                borderLeft: '1px solid #e2e8f0',
                backgroundColor: '#transparent',
                padding: '0.5rem 0.6rem',
                fontSize: '0.8rem',
                color: '#475569',
                fontWeight: 600,
                outline: 'none',
                cursor: 'pointer',
              }}
            >
              <option value="All">All</option>
              <option value="Fibre">Fibre</option>
              <option value="LTE">LTE</option>
              <option value="PEO TV">PEO TV</option>
              <option value="Voice">Voice</option>
            </select>
            <button
              type="button"
              style={{
                backgroundColor: '#0056b3',
                color: '#ffffff',
                border: 'none',
                padding: '0.55rem 1.1rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <FiSearch size={16} />
            </button>
          </div>
        </div>

        {/* ── Right: Links + Language + Cart ── */}
        <div className="navbar-right" style={{ display: 'flex', alignItems: 'center', gap: 'clamp(0.35rem, 2vw, 1.25rem)', flexShrink: 0 }}>
          {/* Desktop Nav Links */}
          <div className="nav-links-desktop" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            <Link to="/" style={navLinkStyle('/')}>Home</Link>
            <Link to="/check-status" style={navLinkStyle('/check-status')}>Application Status</Link>
            <Link to="/help" style={navLinkStyle('/help')}>Help &amp; Support</Link>
            <Link to="/profile" style={navLinkStyle('/profile')}>My Profile</Link>
          </div>

          {/* Language Switcher */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', backgroundColor: '#f8fafc', padding: '0.35rem 0.65rem', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
            <FiGlobe style={{ color: '#0056b3' }} size={15} />
            <select
              value={i18n.language}
              onChange={(e) => i18n.changeLanguage(e.target.value)}
              aria-label="Language"
              style={{
                border: 'none',
                backgroundColor: 'transparent',
                outline: 'none',
                fontSize: '0.82rem',
                fontWeight: 600,
                color: '#334155',
                cursor: 'pointer',
              }}
            >
              <option value="en">English</option>
              <option value="si">සිංහල</option>
              <option value="ta">தமிழ்</option>
            </select>
          </div>

          <span style={{ color: '#cbd5e1' }}>|</span>

          {/* Cart Button with Count Badge */}
          <Link
            to="/cart"
            className="navbar-cart-link"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              color: '#334155',
              textDecoration: 'none',
              fontWeight: 700,
              fontSize: '0.88rem',
            }}
          >
            <FiShoppingCart size={18} style={{ color: '#0056b3' }} />
            <span>Cart</span>
            {cartCount > 0 && (
              <span
                style={{
                  backgroundColor: '#047857',
                  color: '#ffffff',
                  fontSize: '0.7rem',
                  fontWeight: 900,
                  borderRadius: '9999px',
                  padding: '0.1rem 0.5rem',
                }}
              >
                {cartCount}
              </span>
            )}
          </Link>

          {/* Mobile Hamburger */}
          <button
            className="hamburger-btn"
            onClick={() => setMenuOpen((prev) => !prev)}
            style={{ display: 'none', background: 'none', border: 'none', cursor: 'pointer', padding: '0.4rem' }}
          >
            {menuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Slide Menu */}
      {menuOpen && (
        <div style={{ backgroundColor: '#ffffff', borderTop: '1px solid #e2e8f0', padding: '1rem' }}>
          {[
            { to: '/', label: 'Home' },
            { to: '/check-status', label: 'Application Status' },
            { to: '/help', label: 'Help & Support' },
            { to: '/profile', label: 'My Profile' },
          ].map(({ to, label }) => {
            const active = isActivePath(to);
            return (
              <Link
                key={to}
                to={to}
                style={{
                  display: 'block',
                  padding: '0.6rem 0.75rem',
                  color: active ? '#0056b3' : '#0f172a',
                  textDecoration: 'none',
                  fontWeight: active ? 800 : 600,
                  backgroundColor: active ? '#eff6ff' : 'transparent',
                  borderRadius: '8px',
                  borderLeft: active ? '3px solid #0056b3' : '3px solid transparent',
                }}
              >
                {label}
              </Link>
            );
          })}
        </div>
      )}
    </nav>
  );
}
