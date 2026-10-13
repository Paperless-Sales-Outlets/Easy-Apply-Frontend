import React, { useState, useEffect, useLayoutEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FiSearch, FiUser, FiLogOut, FiGrid, FiChevronDown, FiShoppingCart } from 'react-icons/fi';
import sltLogo from '../../assets/slt-logo.png';
import { getVerifiedPhone, getVerifiedName, logoutVerifiedSession, AUTH_UPDATED_EVENT } from '../../utils/authSession';
import { QUICK_SERVICES } from '../../data/quickServices';
import { getLocalCart } from '../../services/productService';

const formatPhone = (n) => (n && n.length === 9 ? `+94 ${n.slice(0, 2)} ${n.slice(2, 5)} ${n.slice(5)}` : n ? `+94 ${n}` : '');

// A little extra breathing room below the fixed nav so page content never
// feels flush against it, even before the exact height is measured.
const NAV_HEIGHT_ESTIMATE = 120;
const NAV_SPACER_BUFFER = 0;

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

export default function Navbar() {
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);
  const [searchCategory, setSearchCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [cartCount, setCartCount] = useState(() => {
    try {
      return getLocalCart().reduce((sum, item) => sum + (item.quantity || 1), 0);
    } catch (e) {
      return 0;
    }
  });
  const menuRef = useRef(null);
  const servicesRef = useRef(null);
  const searchRef = useRef(null);

  useEffect(() => {
    const syncCart = () => {
      try {
        setCartCount(getLocalCart().reduce((sum, item) => sum + (item.quantity || 1), 0));
      } catch (e) {
        setCartCount(0);
      }
    };
    syncCart();
    window.addEventListener('easyapply:cart-updated', syncCart);
    window.addEventListener('storage', syncCart);
    return () => {
      window.removeEventListener('easyapply:cart-updated', syncCart);
      window.removeEventListener('storage', syncCart);
    };
  }, []);

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
      }
    };
    document.addEventListener('mousedown', handleClickOutsideSearch);
    return () => document.removeEventListener('mousedown', handleClickOutsideSearch);
  }, []);

  const handleSelectSuggestion = (product) => {
    setSearchQuery(product.name);
    setShowSuggestions(false);
    window.dispatchEvent(new CustomEvent('easyapply:search', { detail: product.name }));
    navigate(`/new-connection/products?search=${encodeURIComponent(product.name)}`);
  };

  const handleSearchSubmit = (e) => {
    if (e) e.preventDefault();
    setShowSuggestions(false);
    if (searchQuery.trim()) {
      window.dispatchEvent(new CustomEvent('easyapply:search', { detail: searchQuery }));
      navigate(`/new-connection/products?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

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
    navigate('/login', { replace: true });
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

  const lang = (i18n.language || 'en').slice(0, 2);
  const displayName = verifiedName || formatPhone(verifiedPhone);
  // Search leads away from the task, so it is hidden inside the application funnel.
  const FUNNEL_PATHS = [
    '/new-connection', '/reconnection', '/ownership-change', '/location-change', '/termination',
    '/package-migration', '/service-vacation', '/refund-request', '/customer-request-acceptance',
    '/internet-services', '/schedule-installation', '/completion',
  ];
  const hideSearch = FUNNEL_PATHS.some(
    (p) => location.pathname === p || location.pathname.startsWith(`${p}/`)
  ) && !location.pathname.startsWith('/new-connection/');

  return (
    <>
      <header className="site-nav" ref={menuRef}>
        {/* Row 1: logo · search · language · cart · account */}
        <div className="site-nav__main">
          <Link to="/" className="site-nav__logo" aria-label="SLTMobitel EasyApply home">
            <img src={sltLogo} alt="SLTMobitel, The Connection" />
          </Link>

          {!hideSearch && (
            <div ref={searchRef} className="site-nav__search">
              <form className="site-nav__form" role="search" onSubmit={handleSearchSubmit}>
                <input
                  type="search"
                  aria-label={t('nav.searchLabel', 'Search packages, speeds, products')}
                  placeholder={t('nav.searchPlaceholder', 'Search packages, speeds, PEO TV...')}
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setShowSuggestions(true);
                  }}
                  onFocus={() => setShowSuggestions(true)}
                />
                <select
                  value={searchCategory}
                  onChange={(e) => setSearchCategory(e.target.value)}
                  aria-label="Filter search by category"
                >
                  <option value="All">All</option>
                  <option value="Fibre">Fibre</option>
                  <option value="LTE">LTE</option>
                  <option value="PEO TV">PEO TV</option>
                  <option value="Voice">Voice</option>
                </select>
                <button type="submit" aria-label="Search">
                  <FiSearch size={18} aria-hidden="true" />
                  <span>{t('nav.search', 'Search')}</span>
                </button>
              </form>

              {showSuggestions && searchQuery.trim() && (
                <div className="site-nav__suggest" role="listbox">
                  {suggestions.length > 0 ? (
                    suggestions.map((item) => (
                      <button
                        type="button"
                        role="option"
                        key={item.id}
                        className="site-nav__suggest-item"
                        onClick={() => handleSelectSuggestion(item)}
                      >
                        <span>
                          <strong style={{ display: 'block', color: 'var(--navy)', fontSize: 15 }}>{item.name}</strong>
                          <span style={{ color: 'var(--muted)', fontSize: 14 }}>
                            {item.category} · {item.speed}
                          </span>
                        </span>
                        <strong style={{ color: 'var(--navy)', whiteSpace: 'nowrap' }}>
                          Rs. {item.monthlyPrice.toLocaleString()}
                        </strong>
                      </button>
                    ))
                  ) : (
                    <div style={{ padding: 16, textAlign: 'center', color: 'var(--muted)' }}>
                      No matching packages found for "<strong>{searchQuery}</strong>"
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          <div className="site-nav__right">
            <div className="lang-seg" role="group" aria-label="Language">
              {[
                ['en', 'EN', 'English'],
                ['si', 'සිං', 'සිංහල'],
                ['ta', 'த', 'தமிழ்'],
              ].map(([code, short, full]) => (
                <button
                  key={code}
                  type="button"
                  aria-pressed={lang === code}
                  aria-label={full}
                  title={full}
                  onClick={() => i18n.changeLanguage(code)}
                >
                  {short}
                </button>
              ))}
            </div>

            <Link
              to="/cart"
              className="nav-iconbtn"
              aria-label={`Shopping Cart${cartCount > 0 ? `, ${cartCount} items` : ''}`}
              title={t('nav.cart', 'Shopping Cart')}
            >
              <FiShoppingCart size={22} aria-hidden="true" />
              {cartCount > 0 && <span className="nav-badge">{cartCount > 99 ? '99+' : cartCount}</span>}
            </Link>

            {verifiedPhone ? (
              <>
                <Link to="/profile" className="nav-account" title={t('nav.goToProfile', 'Go to My Profile')}>
                  <FiUser size={18} aria-hidden="true" />
                  <span className="nav-account__label">{displayName}</span>
                </Link>
                <button type="button" className="nav-logout" onClick={handleLogout} aria-label={t('nav.logout', 'Logout')}>
                  <FiLogOut size={18} aria-hidden="true" />
                  <span>{t('nav.logout', 'Logout')}</span>
                </button>
              </>
            ) : (
              <button type="button" className="nav-account" onClick={() => navigate('/login')}>
                <FiUser size={18} aria-hidden="true" />
                <span className="nav-account__label">{t('nav.login', 'Login')}</span>
              </button>
            )}
          </div>
        </div>

        {/* Row 2: SLT-blue navigation band */}
        <nav className="site-nav__band" aria-label="Main">
          <div className="site-nav__band-in">
            <Link to="/" className={`band-link${isActivePath('/') ? ' is-active' : ''}`} aria-current={isActivePath('/') ? 'page' : undefined}>
              {t('nav.home', 'Home')}
            </Link>

            <div className="band-services" ref={servicesRef}>
              <button
                type="button"
                className={`band-link${servicesOpen ? ' is-active' : ''}`}
                onClick={() => setServicesOpen((prev) => !prev)}
                aria-haspopup="true"
                aria-expanded={servicesOpen}
              >
                <FiGrid size={16} aria-hidden="true" />
                <span>{t('nav.services', 'Services')}</span>
                <FiChevronDown size={14} aria-hidden="true" style={{ transform: servicesOpen ? 'rotate(180deg)' : 'none' }} />
              </button>
              {servicesOpen && (
                <div className="band-menu" role="menu" aria-label={t('nav.services', 'Services')}>
                  {QUICK_SERVICES.map((srv) => {
                    const IconComp = srv.icon;
                    return (
                      <Link key={srv.id} to={srv.route} role="menuitem" onClick={() => setServicesOpen(false)}>
                        <span className="tile-sm">
                          <IconComp size={18} aria-hidden="true" />
                        </span>
                        <span>
                          <strong style={{ display: 'block', color: 'var(--navy)', fontSize: 15 }}>{srv.title}</strong>
                          <span style={{ color: 'var(--muted)', fontSize: 14 }}>{srv.desc}</span>
                        </span>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>

            <Link
              to="/check-status"
              className={`band-link${isActivePath('/check-status') ? ' is-active' : ''}`}
              aria-current={isActivePath('/check-status') ? 'page' : undefined}
            >
              {t('nav.applicationStatus', 'Application Status')}
            </Link>
            <Link
              to="/help"
              className={`band-link${isActivePath('/help') ? ' is-active' : ''}`}
              aria-current={isActivePath('/help') ? 'page' : undefined}
            >
              {t('nav.help', 'Help & Support')}
            </Link>
            {verifiedPhone && (
              <button type="button" className="band-link band-logout" onClick={handleLogout}>
                <FiLogOut size={16} aria-hidden="true" />
                <span>{t('nav.logout', 'Logout')}</span>
              </button>
            )}
          </div>
        </nav>
      </header>
      {/* Spacer so the fixed header doesn't cover page content */}
      <div style={{ height: navHeight + NAV_SPACER_BUFFER }} aria-hidden="true" />
    </>
  );
}
