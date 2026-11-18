import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FiSearch, FiGlobe, FiMenu, FiX, FiUser, FiLogOut, FiChevronDown } from 'react-icons/fi';
import sltLogo from '../../../assets/sltlogoOnly.png';
import { getVerifiedPhone, getVerifiedName, logoutVerifiedSession, AUTH_UPDATED_EVENT } from '../../../shared/utils/authSession';

const formatPhone = (n) => (n && n.length === 9 ? `+94 ${n.slice(0, 2)} ${n.slice(2, 5)} ${n.slice(5)}` : n ? `+94 ${n}` : '');

// Searchable products dataset for navbar suggestions
const SEARCHABLE_PRODUCTS = [
  { id: 'prod-1', name: '500 Mbps Fibre Broadband', category: 'Fibre Broadband', speed: '500 Mbps', monthlyPrice: 7999 },
  { id: 'prod-2', name: '300 Mbps Fibre Broadband', category: 'Fibre Broadband', speed: '300 Mbps', monthlyPrice: 5499 },
  { id: 'prod-3', name: '1 Gbps Fibre Broadband', category: 'Fibre Broadband', speed: '1 Gbps', monthlyPrice: 10999 },
  { id: 'prod-4', name: 'LTE Home 150 GB', category: 'LTE Home', speed: '100 Mbps', monthlyPrice: 3999 },
  { id: 'prod-5', name: 'LTE Home 300 GB', category: 'LTE Home', speed: '100 Mbps', monthlyPrice: 4999 },
  { id: 'prod-8', name: 'Fibre Voice Home', category: 'Voice', speed: 'Voice', monthlyPrice: 990 },
  { id: 'prod-9', name: 'Voice Unlimited', category: 'Voice', speed: 'Voice', monthlyPrice: 1490 },
  { id: 'prod-10', name: 'Megaline Voice Basic', category: 'Voice', speed: 'Voice', monthlyPrice: 790 },
  { id: 'prod-11', name: 'Voice Business Prime', category: 'Voice', speed: 'Voice', monthlyPrice: 1990 },
  { id: 'prod-6', name: 'PEO TV Gold Pack', category: 'PEO TV', speed: 'HD TV', monthlyPrice: 2990 },
  { id: 'prod-7', name: 'PEO TV Starter Pack', category: 'PEO TV', speed: 'HD TV', monthlyPrice: 1490 },
  { id: 'prod-12', name: 'PEO TV Entertainment', category: 'PEO TV', speed: 'HD TV', monthlyPrice: 2190 },
  { id: 'prod-13', name: 'PEO TV Titanium', category: 'PEO TV', speed: '4K HD TV', monthlyPrice: 3890 },
];

/** Site header: navigation, language switch, cart and account menu. */
export default function Navbar() {
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchCategory, setSearchCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const searchRef = useRef(null);
  const searchInputRef = useRef(null);
  const userRef = useRef(null);

  // Filter search suggestions
  const suggestions = React.useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase().trim();
    return SEARCHABLE_PRODUCTS.filter((p) => {
      if (searchCategory !== 'All') {
        const cat = p.category.toLowerCase();
        if (searchCategory.toLowerCase() === 'fibre' && !cat.includes('fibre')) return false;
        if (searchCategory.toLowerCase() === 'lte' && !cat.includes('lte')) return false;
        if (searchCategory.toLowerCase() === 'peo tv' && !cat.includes('peo')) return false;
        if (searchCategory.toLowerCase() === 'voice' && !cat.includes('voice')) return false;
      }
      return (
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.speed.toLowerCase().includes(q)
      );
    }).slice(0, 6);
  }, [searchQuery, searchCategory]);

  useEffect(() => {
    const handleClickOutsideSearch = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowSuggestions(false);
        setSearchOpen(false);
      }
      if (userRef.current && !userRef.current.contains(e.target)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutsideSearch);
    return () => document.removeEventListener('mousedown', handleClickOutsideSearch);
  }, []);

  useEffect(() => {
    if (searchOpen) searchInputRef.current?.focus();
  }, [searchOpen]);

  const handleSelectSuggestion = (product) => {
    setSearchQuery(product.name);
    setShowSuggestions(false);
    setSearchOpen(false);
    window.dispatchEvent(new CustomEvent('easyapply:search', { detail: product.name }));
    navigate(`/new-connection/products?search=${encodeURIComponent(product.name)}`);
  };

  const handleSearchSubmit = (e) => {
    if (e) e.preventDefault();
    setShowSuggestions(false);
    setSearchOpen(false);
    if (searchQuery.trim()) {
      window.dispatchEvent(new CustomEvent('easyapply:search', { detail: searchQuery }));
      navigate(`/new-connection/products?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const [verifiedPhone, setVerifiedPhone] = useState(getVerifiedPhone);
  const [verifiedName, setVerifiedName] = useState(getVerifiedName);

  useEffect(() => {
    const syncAuth = () => {
      setVerifiedPhone(getVerifiedPhone());
      setVerifiedName(getVerifiedName());
    };
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
    navigate('/', { replace: true });
  };

  const isActivePath = (path) =>
    path === '/' ? location.pathname === '/' : location.pathname.startsWith(path);

  // Same 44px box as the other nav controls, text centred in it; the active
  // underline is an inset shadow so it never shifts the text off the line.
  const navLinkStyle = (path) => ({
    display: 'inline-flex',
    alignItems: 'center',
    height: '44px',
    boxSizing: 'border-box',
    textDecoration: 'none',
    fontSize: '0.95rem',
    lineHeight: 1,
    ...(isActivePath(path)
      ? { color: 'var(--blue-600)', fontWeight: 700, boxShadow: 'inset 0 -3px 0 var(--blue-600)' }
      : { color: 'var(--grey-800)', fontWeight: 600 }),
  });

  useEffect(() => {
    setMenuOpen(false);
    setUserMenuOpen(false);
    setSearchOpen(false);
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
    <>
      <nav className="top-navbar-wrapper" ref={menuRef} style={{ backgroundColor: '#ffffff', borderBottom: '1px solid #dfe5ee', position: 'sticky', top: 0, zIndex: 100 }}>
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
                fontWeight: 700,
                color: 'var(--blue-900)',
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

        {/* ── Desktop Nav Links ── */}
        <div className="nav-links-desktop" style={{ alignItems: 'center', gap: '1.75rem', marginLeft: 'clamp(0.5rem, 2.5vw, 2rem)', marginRight: 'auto', opacity: searchOpen ? 0 : 1, pointerEvents: searchOpen ? 'none' : 'auto', transition: 'opacity 0.2s ease' }}>
          <Link to="/check-status" style={navLinkStyle('/check-status')}>
            {t('nav.applicationStatus', 'Application Status')}
          </Link>
          <Link to="/help" style={navLinkStyle('/help')}>
            {t('nav.help', 'Help & Support')}
          </Link>
        </div>

          {/* ── Right: Navigation, Language and Authentication ── */}
          <div
            className="navbar-right"
            style={{
              display: 'flex',
              alignItems: 'center',
              flexWrap: 'wrap',
              justifyContent: 'flex-end',
              gap: 'clamp(0.35rem, 2vw, 1.25rem)',
              rowGap: '0.5rem',
              flexShrink: 0,
            }}
          >
            {/* Search: icon only; expands inline when clicked (hidden on checkout/scheduling funnel pages) */}
            {!location.pathname.startsWith('/schedule-installation') && !location.pathname.startsWith('/completion') && (
            <div
              ref={searchRef}
              className="nav-center-search"
              style={{ position: 'relative', width: '44px', height: '44px', flexShrink: 0 }}
            >
              <button
                  type="button"
                  onClick={() => setSearchOpen(true)}
                  aria-label="Open search"
                  title="Search"
                  style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '50%',
                    border: '1px solid var(--grey-200)',
                    backgroundColor: 'var(--grey-50)',
                    color: 'var(--blue-600)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    opacity: searchOpen ? 0 : 1,
                    pointerEvents: searchOpen ? 'none' : 'auto',
                    transition: 'opacity 0.2s ease',
                  }}
                >
                  <FiSearch size={17} aria-hidden="true" />
                </button>
                <form
                  onSubmit={handleSearchSubmit}
                  onKeyDown={(e) => {
                    if (e.key === 'Escape') {
                      setSearchOpen(false);
                      setShowSuggestions(false);
                    }
                  }}
                  className="nav-search-form"
                  aria-hidden={!searchOpen}
                  style={{
                    position: 'absolute',
                    top: 0,
                    right: 0,
                    zIndex: 5,
                    display: 'flex',
                    alignItems: 'center',
                    width: searchOpen ? 'min(380px, calc(100vw - 2rem))' : '44px',
                    height: '44px',
                    backgroundColor: 'var(--paper)',
                    border: '1.5px solid var(--blue-600)',
                    borderRadius: '9999px',
                    overflow: 'hidden',
                    boxShadow: '0 0 0 3px rgba(0, 86, 179, 0.12)',
                    opacity: searchOpen ? 1 : 0,
                    visibility: searchOpen ? 'visible' : 'hidden',
                    transition: `width 0.3s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.25s ease, visibility 0s linear ${searchOpen ? '0s' : '0.3s'}`,
                  }}
                >
                  <FiSearch style={{ color: '#94a1b5', marginLeft: '0.85rem', flexShrink: 0 }} size={16} aria-hidden="true" />
                  <input
                    ref={searchInputRef}
                    type="text"
                    aria-label="Search packages, speeds, products"
                    placeholder="Search packages, speeds, products..."
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setShowSuggestions(true);
                    }}
                    onFocus={() => setShowSuggestions(true)}
                    style={{
                      flex: 1,
                      minWidth: 0,
                      padding: '0 0.6rem',
                      border: 'none',
                      outline: 'none',
                      fontSize: '0.85rem',
                      color: 'var(--grey-900)',
                      backgroundColor: 'transparent',
                    }}
                  />
                  <select
                    value={searchCategory}
                    onChange={(e) => setSearchCategory(e.target.value)}
                    aria-label="Filter search by category"
                    style={{
                      border: 'none',
                      borderLeft: '1px solid var(--grey-200)',
                      backgroundColor: 'transparent',
                      padding: '0 0.5rem',
                      height: '60%',
                      fontSize: '0.8rem',
                      color: 'var(--grey-700)',
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
                    aria-label="Close search"
                    onClick={() => {
                      setSearchOpen(false);
                      setShowSuggestions(false);
                    }}
                    style={{ background: 'none', border: 'none', color: '#94a1b5', cursor: 'pointer', padding: '0 0.75rem 0 0.35rem', display: 'flex', alignItems: 'center' }}
                  >
                    <FiX size={16} />
                  </button>
                </form>
            {/* Live Search Suggestions Dropdown */}
            {showSuggestions && searchQuery.trim() && (
              <div
                style={{
                  position: 'absolute',
                  top: 'calc(100% + 4px)',
                  right: 0,
                  width: 'min(380px, calc(100vw - 2rem))',
                  backgroundColor: 'var(--paper)',
                  borderRadius: 'var(--radius-lg)',
                  boxShadow: 'var(--shadow-lg)',
                  border: '1px solid var(--grey-200)',
                  zIndex: 1000,
                  overflow: 'hidden',
                  maxHeight: '380px',
                  overflowY: 'auto',
                }}
              >
                {suggestions.length > 0 ? (
                  suggestions.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => handleSelectSuggestion(item)}
                      style={{
                        padding: '0.75rem 1rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        cursor: 'pointer',
                        borderBottom: '1px solid var(--grey-100)',
                        transition: 'background-color 0.15s ease',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#f6f8fb';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }}
                    >
                      <div>
                        <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#131f33' }}>
                          {item.name}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#52627a', display: 'flex', gap: '0.5rem', marginTop: '0.15rem' }}>
                          <span style={{ backgroundColor: '#f1f7fd', color: '#0056a2', padding: '0.1rem 0.4rem', borderRadius: 'var(--radius-sm)', fontWeight: 700 }}>
                            {item.category}
                          </span>
                          <span>• {item.speed}</span>
                        </div>
                      </div>
                      <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0056a2', whiteSpace: 'nowrap' }}>
                        Rs. {item.monthlyPrice.toLocaleString()} <span style={{ fontSize: '0.75rem', color: '#52627a', fontWeight: 500 }}>/mo</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div style={{ padding: '1rem', textAlign: 'center', color: '#52627a', fontSize: '0.85rem' }}>
                    No matching packages found for "<strong>{searchQuery}</strong>"
                  </div>
                )}
              </div>
            )}
            </div>
            )}

            {/* Language Switcher */}
            <div
              className="lang-switcher"
              style={{
                alignItems: 'center',
                gap: '0.35rem',
                backgroundColor: 'var(--grey-50)',
                padding: '0.35rem 0.65rem',
                borderRadius: 'var(--radius)',
                border: '1px solid var(--grey-200)',
              }}
            >
              <FiGlobe style={{ color: '#0056a2' }} size={15} />
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
                  color: 'var(--grey-800)',
                  cursor: 'pointer',
                }}
              >
                <option value="en">English</option>
                <option value="si">සිංහල</option>
                <option value="ta">தமிழ்</option>
              </select>
            </div>

            {/* Login / Logout */}
            {verifiedPhone ? (
              <div
                className="navbar-auth"
                ref={userRef}
                style={{
                  position: 'relative',
                  borderLeft: '1px solid var(--grey-300)',
                  paddingLeft: 'clamp(0.35rem, 2vw, 1.25rem)',
                }}
              >
                <button
                  type="button"
                  onClick={() => setUserMenuOpen((o) => !o)}
                  aria-haspopup="menu"
                  aria-expanded={userMenuOpen}
                  className="navbar-auth-phone"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    color: 'var(--grey-800)',
                    fontWeight: 700,
                    fontSize: '0.85rem',
                    padding: '0.3rem 0.6rem 0.3rem 0.35rem',
                    borderRadius: '9999px',
                    backgroundColor: userMenuOpen || isActivePath('/profile') ? '#f1f7fd' : '#f6f8fb',
                    border: `1px solid ${userMenuOpen || isActivePath('/profile') ? '#c3dcf5' : '#dfe5ee'}`,
                    cursor: 'pointer',
                  }}
                >
                  <span style={{ width: '26px', height: '26px', borderRadius: '50%', backgroundColor: '#0056a2', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.78rem', fontWeight: 700 }}>
                    {(verifiedName || '#').trim().charAt(0).toUpperCase()}
                  </span>
                  <span style={{ maxWidth: '140px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {verifiedName || formatPhone(verifiedPhone)}
                  </span>
                  <FiChevronDown size={14} style={{ transition: 'transform 0.2s', transform: userMenuOpen ? 'rotate(180deg)' : 'none' }} />
                </button>

                {userMenuOpen && (
                  <div
                    role="menu"
                    style={{
                      position: 'absolute',
                      top: 'calc(100% + 8px)',
                      right: 0,
                      minWidth: '200px',
                      backgroundColor: 'var(--paper)',
                      border: '1px solid var(--grey-200)',
                      borderRadius: 'var(--radius-lg)',
                      boxShadow: 'var(--shadow-lg)',
                      padding: '0.4rem',
                      zIndex: 1000,
                    }}
                  >
                    <div style={{ padding: '0.5rem 0.75rem 0.6rem', borderBottom: '1px solid #eef2f7', marginBottom: '0.3rem' }}>
                      <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#131f33' }}>{verifiedName || t('nav.account', 'My Account')}</div>
                      <div style={{ fontSize: '0.75rem', color: '#52627a' }}>{formatPhone(verifiedPhone)}</div>
                    </div>
                    <Link
                      to="/profile"
                      role="menuitem"
                      style={{ display: 'flex', alignItems: 'center', gap: '0.55rem', padding: '0.55rem 0.75rem', borderRadius: 'var(--radius)', color: '#131f33', textDecoration: 'none', fontWeight: 600, fontSize: '0.88rem' }}
                      onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#f6f8fb'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
                    >
                      <FiUser size={15} style={{ color: '#0056a2' }} />
                      {t('nav.myProfile', 'My Profile')}
                    </Link>
                    <button
                      type="button"
                      role="menuitem"
                      onClick={handleLogout}
                      style={{ display: 'flex', alignItems: 'center', gap: '0.55rem', width: '100%', padding: '0.55rem 0.75rem', borderRadius: 'var(--radius)', background: 'none', border: 'none', color: '#b42318', fontWeight: 600, fontSize: '0.95rem', cursor: 'pointer', textAlign: 'left' }}
                      onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#fef3f2'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
                    >
                      <FiLogOut size={15} />
                      {t('nav.logout', 'Logout')}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                type="button"
                className="navbar-login-btn"
                onClick={() => navigate('/login')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  background: 'none',
                  border: 'none',
                  borderLeft: '1px solid var(--grey-300)',
                  paddingLeft: 'clamp(0.35rem, 2vw, 1.25rem)',
                  color: 'var(--blue-600)',
                  fontWeight: 700,
                  fontSize: '0.95rem',
                  cursor: 'pointer',
                }}
              >
                <FiUser size={16} />
                <span>{t('nav.login', 'Login')}</span>
              </button>
            )}

            {/* Mobile Hamburger */}
            <button
              className="hamburger-btn"
              type="button"
              onClick={() => setMenuOpen((prev) => !prev)}
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={menuOpen}
              style={{ cursor: 'pointer' }}
            >
              {menuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
            </button>
          </div>
        </div>
        {/* Mobile Slide Menu */}
        {menuOpen && (
          <div style={{ backgroundColor: '#ffffff', borderTop: '1px solid #dfe5ee', padding: '1rem' }}>
            {[
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
                    color: active ? '#0056a2' : '#131f33',
                    textDecoration: 'none',
                    fontWeight: active ? 800 : 600,
                    backgroundColor: active ? '#f1f7fd' : 'transparent',
                    borderRadius: 'var(--radius)',
                    borderLeft: active ? '3px solid #0056a2' : '3px solid transparent',
                  }}
                >
                  {label}
                </Link>
              );
            })}

            <div style={{ borderTop: '1px solid #dfe5ee', margin: '0.5rem 0', paddingTop: '0.5rem' }}>
              {verifiedPhone ? (
                <>
                  <Link
                    to="/profile"
                    style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', width: '100%', padding: '0.6rem 0.75rem', color: isActivePath('/profile') ? '#0056a2' : '#131f33', textDecoration: 'none', fontWeight: isActivePath('/profile') ? 800 : 600, fontSize: '0.95rem', backgroundColor: isActivePath('/profile') ? '#f1f7fd' : 'transparent', borderRadius: 'var(--radius)', borderLeft: isActivePath('/profile') ? '3px solid #0056a2' : '3px solid transparent' }}
                  >
                    <FiUser size={16} style={{ color: '#50b748' }} />
                    <span>{verifiedName || formatPhone(verifiedPhone)}</span>
                  </Link>
                  <button
                    type="button"
                    onClick={handleLogout}
                    style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', width: '100%', padding: '0.6rem 0.75rem', background: 'none', border: 'none', color: '#b42318', fontWeight: 700, fontSize: '0.95rem', cursor: 'pointer', textAlign: 'left' }}
                  >
                    <FiLogOut size={16} />
                    <span>{t('nav.logout', 'Logout')}</span>
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => navigate('/login')}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', width: '100%', padding: '0.6rem 0.75rem', background: 'none', border: 'none', color: '#0056a2', fontWeight: 700, fontSize: '0.95rem', cursor: 'pointer', textAlign: 'left' }}
                >
                  <FiUser size={16} />
                  <span>{t('nav.login', 'Login')}</span>
                </button>
              )}
            </div>
          </div>
        )}
      </nav>
    </>
  );
}