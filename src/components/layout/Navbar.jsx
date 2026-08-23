import React, { useState, useEffect, useLayoutEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FiSearch, FiGlobe, FiMenu, FiX, FiUser, FiLogOut, FiGrid, FiChevronDown } from 'react-icons/fi';
import sltLogo from '../../assets/sltlogoOnly.png';
import { getVerifiedPhone, logoutVerifiedSession, AUTH_UPDATED_EVENT } from '../../utils/authSession';
import { QUICK_SERVICES } from '../../data/quickServices';

const formatPhone = (n) => (n && n.length === 9 ? `+94 ${n.slice(0, 2)} ${n.slice(2, 5)} ${n.slice(5)}` : n ? `+94 ${n}` : '');

// A little extra breathing room below the fixed nav so page content never
// feels flush against it, even before the exact height is measured.
const NAV_HEIGHT_ESTIMATE = 88;
const NAV_SPACER_BUFFER = 16;

export default function Navbar() {
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);
  const [searchCategory, setSearchCategory] = useState('All');
  const menuRef = useRef(null);
  const servicesRef = useRef(null);

  // useLayoutEffect (not useEffect) so the spacer is sized before the browser
  // paints — otherwise content briefly renders behind the fixed nav on first
  // load. Seeded with a sane estimate so there's no gap even before that.
  const [navHeight, setNavHeight] = useState(NAV_HEIGHT_ESTIMATE);
  useLayoutEffect(() => {
    const el = menuRef.current;
    if (!el || typeof ResizeObserver === 'undefined') return;
    const update = () => setNavHeight(el.offsetHeight);
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const [verifiedPhone, setVerifiedPhone] = useState(getVerifiedPhone);

  useEffect(() => {
    const syncAuth = () => setVerifiedPhone(getVerifiedPhone());
    syncAuth();
    window.addEventListener(AUTH_UPDATED_EVENT, syncAuth);
    window.addEventListener('storage', syncAuth);
    return () => {
      window.removeEventListener(AUTH_UPDATED_EVENT, syncAuth);
      window.removeEventListener('storage', syncAuth);
    };
  }, [location.pathname]);

  const handleLogout = () => {
    logoutVerifiedSession();
    navigate('/');
  };

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
    setServicesOpen(false);
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

  useEffect(() => {
    const handleClickOutsideServices = (e) => {
      if (servicesRef.current && !servicesRef.current.contains(e.target)) {
        setServicesOpen(false);
      }
    };
    if (servicesOpen) {
      document.addEventListener('mousedown', handleClickOutsideServices);
    }
    return () => document.removeEventListener('mousedown', handleClickOutsideServices);
  }, [servicesOpen]);

  return (
    <>
    <nav className="top-navbar-wrapper" ref={menuRef} style={{ backgroundColor: '#ffffff', borderBottom: '1px solid #e2e8f0', position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100 }}>
      <div style={{ maxWidth: '1600px', margin: '0 auto', padding: 'clamp(0.75rem, 2.5vw, 1.15rem) clamp(0.5rem, 4vw, 1.5rem)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 'clamp(0.5rem, 2vw, 1.25rem)' }}>

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
            <FiSearch style={{ color: '#94a3b8', marginLeft: '0.75rem', flexShrink: 0 }} size={16} aria-hidden="true" />
            <input
              type="text"
              aria-label="Search packages, speeds, products"
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
              aria-label="Filter search by category"
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
              aria-label="Search"
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
              <FiSearch size={16} aria-hidden="true" />
            </button>
          </div>
        </div>

        {/* ── Right: Links + Language + Cart ──
            flexWrap lets this group drop onto a second line on narrow
            screens instead of overflowing/clipping — with the Services
            button added, everything no longer fits on one line at
            phone widths. Harmless on desktop since it never has to wrap
            there. */}
        <div className="navbar-right" style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'flex-end', gap: 'clamp(0.35rem, 2vw, 1.25rem)', rowGap: '0.5rem' }}>
          {/* Desktop Nav Links — display is controlled by the .nav-links-desktop media query, not inline, so it can collapse to the hamburger menu on mobile */}
          <div className="nav-links-desktop" style={{ alignItems: 'center', gap: '1.5rem' }}>
            <Link to="/" style={navLinkStyle('/')}>{t('nav.home', 'Home')}</Link>
            <Link to="/check-status" style={navLinkStyle('/check-status')}>{t('nav.applicationStatus', 'Application Status')}</Link>
            <Link to="/help" style={navLinkStyle('/help')}>{t('nav.help', 'Help & Support')}</Link>
          </div>

          {/* Services quick-access dropdown — only shown ≤1024px (see .navbar-services
              in index.css), matching the breakpoint where the landing page's quick-service
              tiles stack below the hero banner instead of sitting next to it. Above that
              width the tiles are already visible, so this would just be a duplicate. */}
          <div className="navbar-services" ref={servicesRef} style={{ position: 'relative' }}>
            <button
              type="button"
              onClick={() => setServicesOpen((prev) => !prev)}
              aria-haspopup="true"
              aria-expanded={servicesOpen}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                backgroundColor: servicesOpen ? '#eff6ff' : '#f8fafc',
                border: `1px solid ${servicesOpen ? '#bfdbfe' : '#e2e8f0'}`,
                borderRadius: '6px',
                padding: '0.4rem 0.65rem',
                fontSize: '0.82rem',
                fontWeight: 700,
                color: '#0056b3',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
              }}
            >
              <FiGrid size={15} />
              <span>Services</span>
              <FiChevronDown
                size={13}
                style={{ transform: servicesOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s ease' }}
              />
            </button>

            {servicesOpen && (
              <div
                role="menu"
                aria-label="Services"
                style={{
                  // Anchored to the viewport (fixed + right edge) rather than
                  // to the button — the button's own x-position shifts with
                  // screen width and language pill width, so a button-relative
                  // anchor could push this dropdown past the right edge of
                  // the screen on some devices, clipping it. Anchoring to a
                  // stable screen edge instead means it's never off-screen.
                  position: 'fixed',
                  top: navHeight + 8,
                  right: '1rem',
                  width: 'min(320px, calc(100vw - 2rem))',
                  backgroundColor: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '12px',
                  boxShadow: '0 12px 30px rgba(15, 23, 42, 0.14)',
                  padding: '0.5rem',
                  zIndex: 200,
                  maxHeight: '70vh',
                  overflowY: 'auto',
                }}
              >
                {QUICK_SERVICES.map((srv) => {
                  const IconComp = srv.icon;
                  return (
                    <Link
                      key={srv.id}
                      to={srv.route}
                      role="menuitem"
                      className="navbar-services-item"
                      onClick={() => setServicesOpen(false)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.65rem',
                        padding: '0.55rem 0.6rem',
                        borderRadius: '8px',
                        textDecoration: 'none',
                        color: '#0f172a',
                      }}
                    >
                      <div
                        style={{
                          backgroundColor: srv.bgColor,
                          color: srv.iconColor,
                          width: '32px',
                          height: '32px',
                          borderRadius: '8px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                        }}
                      >
                        <IconComp size={15} />
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontWeight: 700, fontSize: '0.85rem' }}>{srv.title}</div>
                        <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '0.1rem' }}>{srv.desc}</div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>

          {/* Language Switcher */}
          <div className="lang-switcher" style={{ alignItems: 'center', gap: '0.35rem', backgroundColor: '#f8fafc', padding: '0.35rem 0.65rem', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
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

          {/* Login / Logout — reflects the OTP-verified phone session shared across wizards.
              The divider lives on this group (borderLeft) instead of as a standalone "|"
              character, so it never ends up dangling alone if this group wraps to its own
              line on narrow screens. */}
          {verifiedPhone ? (
            <div className="navbar-auth" style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', borderLeft: '1px solid #cbd5e1', paddingLeft: 'clamp(0.35rem, 2vw, 1.25rem)' }}>
              <Link
                to="/profile"
                className="navbar-auth-phone"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  color: '#334155',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  textDecoration: 'none',
                  padding: '0.4rem 0.75rem',
                  borderRadius: '9999px',
                  backgroundColor: isActivePath('/profile') ? '#eff6ff' : '#f8fafc',
                  border: `1px solid ${isActivePath('/profile') ? '#bfdbfe' : '#e2e8f0'}`,
                }}
                title={t('nav.goToProfile', 'Go to My Profile')}
              >
                <FiUser size={15} style={{ color: '#50b748' }} />
                {formatPhone(verifiedPhone)}
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  background: 'none',
                  border: 'none',
                  color: '#dc2626',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  padding: 0,
                }}
              >
                <FiLogOut size={15} />
                <span>{t('nav.logout', 'Logout')}</span>
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => navigate('/verify-phone', { state: { redirectTo: '/profile' } })}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                background: 'none',
                border: 'none',
                borderLeft: '1px solid #cbd5e1',
                paddingLeft: 'clamp(0.35rem, 2vw, 1.25rem)',
                color: '#0056b3',
                fontWeight: 700,
                fontSize: '0.88rem',
                cursor: 'pointer',
              }}
            >
              <FiUser size={16} />
              <span>{t('nav.login', 'Login')}</span>
            </button>
          )}

          {/* Mobile Hamburger — display is controlled by the .hamburger-btn media query (hidden on desktop, shown ≤768px) */}
          <button
            className="hamburger-btn"
            onClick={() => setMenuOpen((prev) => !prev)}
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            style={{ cursor: 'pointer' }}
          >
            {menuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Slide Menu */}
      {menuOpen && (
        <div style={{ backgroundColor: '#ffffff', borderTop: '1px solid #e2e8f0', padding: '1rem' }}>
          {[
            { to: '/', label: t('nav.home', 'Home') },
            { to: '/check-status', label: t('nav.applicationStatus', 'Application Status') },
            { to: '/help', label: t('nav.help', 'Help & Support') },
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

          <div style={{ borderTop: '1px solid #e2e8f0', margin: '0.5rem 0', paddingTop: '0.5rem' }}>
            {verifiedPhone ? (
              <>
                <Link
                  to="/profile"
                  style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', width: '100%', padding: '0.6rem 0.75rem', color: isActivePath('/profile') ? '#0056b3' : '#0f172a', textDecoration: 'none', fontWeight: isActivePath('/profile') ? 800 : 600, fontSize: '0.95rem', backgroundColor: isActivePath('/profile') ? '#eff6ff' : 'transparent', borderRadius: '8px', borderLeft: isActivePath('/profile') ? '3px solid #0056b3' : '3px solid transparent' }}
                >
                  <FiUser size={16} style={{ color: '#50b748' }} />
                  <span>{formatPhone(verifiedPhone)}</span>
                </Link>
                <button
                  type="button"
                  onClick={handleLogout}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', width: '100%', padding: '0.6rem 0.75rem', background: 'none', border: 'none', color: '#dc2626', fontWeight: 700, fontSize: '0.95rem', cursor: 'pointer', textAlign: 'left' }}
                >
                  <FiLogOut size={16} />
                  <span>{t('nav.logout', 'Logout')}</span>
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={() => navigate('/verify-phone', { state: { redirectTo: '/profile' } })}
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', width: '100%', padding: '0.6rem 0.75rem', background: 'none', border: 'none', color: '#0056b3', fontWeight: 700, fontSize: '0.95rem', cursor: 'pointer', textAlign: 'left' }}
              >
                <FiUser size={16} />
                <span>{t('nav.login', 'Login')}</span>
              </button>
            )}
          </div>
        </div>
      )}
    </nav>
    {/* Spacer so fixed-position nav doesn't cover page content; height tracks the nav's own (responsive) height, plus a little breathing room */}
    <div style={{ height: navHeight + NAV_SPACER_BUFFER }} aria-hidden="true" />
    </>
  );
}
