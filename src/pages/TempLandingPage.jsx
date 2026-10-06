import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiTruck,
  FiUserCheck,
  FiPauseCircle,
  FiHelpCircle,
  FiPlusCircle,
  FiChevronDown,
  FiChevronRight,
  FiPhoneCall,
  FiMoon,
  FiZap,
  FiAlertTriangle,
  FiCheck,
  FiLogOut,
  FiUser,
  FiRefreshCw,
  FiArrowRight,
  FiInfo,
  FiLayers,
  FiHeadphones,
  FiX,
  FiTrendingUp,
} from 'react-icons/fi';
import sltLogo from '../assets/slt-logo.png';
import LiveStatusBadge from '../components/LiveStatusBadge';
import {
  getSession,
  getAuthUser,
  logoutVerifiedSession,
  AUTH_UPDATED_EVENT
} from '../utils/authSession';
import { useVerifiedContext } from '../components/verification';

export default function TempLandingPage() {
  const navigate = useNavigate();
  const context = useVerifiedContext();

  // Retrieve session and account state
  const [session, setSession] = useState(getSession);
  const [showSwitchModal, setShowSwitchModal] = useState(false);
  const [demoStateOverride, setDemoStateOverride] = useState(null); // 'active' | 'disconnected' | null

  useEffect(() => {
    const handleAuthSync = () => setSession(getSession());
    window.addEventListener(AUTH_UPDATED_EVENT, handleAuthSync);
    return () => window.removeEventListener(AUTH_UPDATED_EVENT, handleAuthSync);
  }, []);

  // Determine active account
  const liveAccount =
    context?.selectedAccount ||
    session?.selectedAccount ||
    session?.accountsList?.[0] ||
    null;

  const fallbackAccount = {
    accountNo: '011-2345678',
    telephone: '0112345678',
    fullName: 'Kumar Sangakkara',
    packageName: '300 Mbps Fibre Broadband',
    status: 'active',
    customerType: 'home',
    outstandingBalance: 0,
    address: 'No. 45, Galle Road, Colombo 03',
  };

  const currentAccount = liveAccount || fallbackAccount;
  const accountsList =
    (context?.accountsList && context.accountsList.length > 0)
      ? context.accountsList
      : (session?.accountsList && session.accountsList.length > 0)
      ? session.accountsList
      : [
          { ...fallbackAccount, telephone: '0112345678', status: 'active', packageName: '300 Mbps Fibre Broadband' },
          { ...fallbackAccount, telephone: '0119876543', status: 'disconnected', packageName: 'Megaline Voice + 100M LTE', outstandingBalance: 2450 },
        ];

  // Status computation
  const effectiveStatus = demoStateOverride || currentAccount?.status || 'active';
  const isDisconnected =
    effectiveStatus.toLowerCase() === 'disconnected' ||
    effectiveStatus.toLowerCase() === 'suspended' ||
    effectiveStatus.toLowerCase() === 'inactive';

  // Customer greeting name
  const rawName =
    currentAccount?.fullName ||
    currentAccount?.customerName ||
    session?.user?.name ||
    getAuthUser()?.name ||
    'Kumar';
  const firstName = rawName.trim().split(' ')[0] || 'Kumar';

  const handleLogout = () => {
    logoutVerifiedSession();
    navigate('/login');
  };

  const handleSwitchConnection = (acc) => {
    if (context?.switchAccount) {
      context.switchAccount(acc);
    }
    setShowSwitchModal(false);
  };

  // Recommended upgrades data (Streamlined & visually balanced)
  const upgrades = [
    {
      id: 'voice-unlimited',
      icon: FiPhoneCall,
      title: 'Unlimited Voice Pack',
      subtitle: 'Crystal-clear local calls anywhere in Sri Lanka',
      price: '750',
      period: 'mo',
      tag: 'Popular Add-on',
      badgeColor: '#0284c7',
      highlights: ['Unlimited SLT-Mobitel calls', 'Caller ID & Forwarding included'],
      actionLabel: 'Upgrade Package',
      route: '/package-migration',
    },
    {
      id: 'night-data',
      icon: FiMoon,
      title: 'Unlimited Night Data',
      subtitle: 'High-speed uncapped data (12:00 AM – 7:00 AM)',
      price: '990',
      period: 'mo',
      tag: 'Midnight Booster',
      badgeColor: '#7c3aed',
      highlights: ['Zero throttling / No FUP limits', 'Auto-renews monthly on bill'],
      actionLabel: 'Add to Plan',
      route: '/internet-services',
    },
    {
      id: 'fibre-speed',
      icon: FiZap,
      title: 'Fibre 1 Gbps Speed Boost',
      subtitle: 'Maximum Gigabit bandwidth for heavy multi-device streaming',
      price: '2,450',
      period: 'mo',
      tag: 'Ultra Fast',
      badgeColor: '#059669',
      highlights: ['1000 Mbps symmetrical speed', 'Priority routing & QoS'],
      actionLabel: 'Upgrade Package',
      route: '/package-migration',
    },
  ];

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#f8fafc',
        color: '#0f172a',
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      }}
    >
      {/* ── TOP HEADER / NAVBAR ── */}
      <header
        style={{
          background: '#ffffff',
          borderBottom: '1px solid #e2e8f0',
          position: 'sticky',
          top: 0,
          zIndex: 40,
        }}
      >
        <div
          style={{
            maxWidth: '1200px',
            margin: '0 auto',
            padding: '0.85rem 1.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          {/* Logo & Portal Identity */}
          <Link
            to="/templand"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.85rem',
              textDecoration: 'none',
            }}
          >
            <img
              src={sltLogo}
              alt="SLT-MOBITEL"
              style={{
                height: '36px',
                width: 'auto',
                objectFit: 'contain',
              }}
            />
            <div
              style={{
                borderLeft: '1.5px solid #e2e8f0',
                paddingLeft: '0.75rem',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <span
                style={{
                  fontSize: '0.8rem',
                  fontWeight: 800,
                  color: '#0054a6',
                  letterSpacing: '0.02em',
                }}
              >
                SelfCare Portal
              </span>
              <span style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 500 }}>
                Paperless Sales Outlet
              </span>
            </div>
          </Link>

          {/* Right Controls: Profile & Logout */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            {/* Minimalist Preview State Pill for Evaluation */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                backgroundColor: '#f1f5f9',
                padding: '0.2rem 0.35rem',
                borderRadius: '8px',
                border: '1px solid #e2e8f0',
                marginRight: '0.5rem',
              }}
            >
              <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600, padding: '0 0.35rem' }}>
                Preview:
              </span>
              <button
                type="button"
                onClick={() => setDemoStateOverride('active')}
                style={{
                  padding: '0.2rem 0.55rem',
                  borderRadius: '6px',
                  border: 'none',
                  cursor: 'pointer',
                  fontWeight: 700,
                  fontSize: '0.7rem',
                  backgroundColor: !isDisconnected ? '#16a34a' : 'transparent',
                  color: !isDisconnected ? '#ffffff' : '#64748b',
                  transition: 'all 0.15s ease',
                }}
              >
                Active
              </button>
              <button
                type="button"
                onClick={() => setDemoStateOverride('disconnected')}
                style={{
                  padding: '0.2rem 0.55rem',
                  borderRadius: '6px',
                  border: 'none',
                  cursor: 'pointer',
                  fontWeight: 700,
                  fontSize: '0.7rem',
                  backgroundColor: isDisconnected ? '#dc2626' : 'transparent',
                  color: isDisconnected ? '#ffffff' : '#64748b',
                  transition: 'all 0.15s ease',
                }}
              >
                Disconnected
              </button>
            </div>

            <Link
              to="/profile"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.45rem',
                padding: '0.45rem 0.85rem',
                borderRadius: '8px',
                backgroundColor: '#ffffff',
                border: '1px solid #e2e8f0',
                color: '#334155',
                fontSize: '0.84rem',
                fontWeight: 600,
                textDecoration: 'none',
                transition: 'all 0.15s ease',
              }}
            >
              <FiUser size={15} style={{ color: '#0054a6' }} />
              <span>Profile</span>
            </Link>

            <button
              type="button"
              onClick={handleLogout}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.45rem',
                padding: '0.45rem 0.85rem',
                borderRadius: '8px',
                backgroundColor: '#fff1f2',
                border: '1px solid #ffe4e6',
                color: '#e11d48',
                fontSize: '0.84rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              <FiLogOut size={15} />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* ── HERO GREETING & ACCOUNT SECTION ── */}
      <section
        style={{
          background: 'linear-gradient(135deg, #024388 0%, #0056b3 55%, #0866c6 100%)',
          color: '#ffffff',
          padding: '2rem 1.5rem',
          borderBottom: '1px solid rgba(0, 84, 166, 0.2)',
          boxShadow: '0 4px 20px rgba(0, 84, 166, 0.12)',
        }}
      >
        <div
          style={{
            maxWidth: '1200px',
            margin: '0 auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1.25rem',
          }}
        >
          {/* Left Column: Greeting & Connection Details */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <h1
                style={{
                  margin: 0,
                  fontSize: '1.65rem',
                  fontWeight: 800,
                  letterSpacing: '-0.02em',
                  color: '#ffffff',
                }}
              >
                Hey {firstName}!
              </h1>
            </div>

            {/* Clean, Unified Account Meta Bar */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.65rem',
                flexWrap: 'wrap',
                marginTop: '0.75rem',
              }}
            >
              {/* Account Number & Status Badge */}
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  backgroundColor: 'rgba(255, 255, 255, 0.12)',
                  backdropFilter: 'blur(8px)',
                  padding: '0.35rem 0.75rem',
                  borderRadius: '10px',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  fontSize: '0.85rem',
                  fontWeight: 700,
                }}
              >
                <span style={{ color: '#e0f2fe' }}>Account:</span>
                <span style={{ color: '#ffffff' }}>
                  #{currentAccount?.telephone || currentAccount?.accountNo || '0112345678'}
                </span>
                <LiveStatusBadge status={effectiveStatus} size="sm" />
              </div>

              {/* Switch Connection Button */}
              <button
                type="button"
                onClick={() => setShowSwitchModal(true)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  padding: '0.35rem 0.75rem',
                  borderRadius: '10px',
                  backgroundColor: 'rgba(255, 255, 255, 0.18)',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  color: '#ffffff',
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'background 0.15s ease',
                }}
              >
                <FiRefreshCw size={12} />
                <span>Switch Connection</span>
                <FiChevronDown size={14} />
              </button>

              {/* Current active plan subtitle */}
              <div
                style={{
                  fontSize: '0.82rem',
                  color: '#bae6fd',
                  fontWeight: 600,
                  paddingLeft: '0.25rem',
                }}
              >
                • {currentAccount?.packageName || currentAccount?.package || '300 Mbps Fibre Broadband'}
              </div>
            </div>
          </div>

          {/* Right Column: + New Connection Button */}
          <div>
            <Link
              to="/new-connection"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                backgroundColor: '#16a34a',
                color: '#ffffff',
                padding: '0.65rem 1.25rem',
                borderRadius: '10px',
                fontSize: '0.92rem',
                fontWeight: 700,
                textDecoration: 'none',
                boxShadow: '0 4px 14px rgba(22, 163, 74, 0.3)',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#15803d';
                e.currentTarget.style.transform = 'translateY(-1px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#16a34a';
                e.currentTarget.style.transform = 'none';
              }}
            >
              <FiPlusCircle size={17} />
              <span>+ New Connection</span>
            </Link>
          </div>
        </div>
      </section>

      {/* ── MAIN CONTENT (BALANCED 2-COLUMN LAYOUT) ── */}
      <main
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '2rem 1.5rem 3.5rem',
        }}
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(0, 1.15fr) minmax(0, 0.85fr)',
            gap: '2rem',
            alignItems: 'start',
          }}
          className="templand-grid"
        >
          {/* ═══════════════════════════════════════════════════════════
              LEFT COLUMN: RECOMMENDED UPGRADES
             ═══════════════════════════════════════════════════════════ */}
          <section>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '1rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div
                  style={{
                    width: '30px',
                    height: '30px',
                    borderRadius: '8px',
                    backgroundColor: '#eff6ff',
                    color: '#0054a6',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <FiZap size={16} />
                </div>
                <h2
                  style={{
                    margin: 0,
                    fontSize: '1.05rem',
                    fontWeight: 800,
                    color: '#0f172a',
                    letterSpacing: '0.02em',
                    textTransform: 'uppercase',
                  }}
                >
                  Recommended Upgrades
                </h2>
              </div>
              <span style={{ fontSize: '0.78rem', fontWeight: 600, color: '#64748b' }}>
                Tailored for your line
              </span>
            </div>

            {/* Upgrade Cards List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {upgrades.map((item) => {
                const ItemIcon = item.icon;
                return (
                  <motion.div
                    key={item.id}
                    whileHover={{ translateY: -2, boxShadow: '0 8px 20px rgba(0, 84, 166, 0.06)' }}
                    style={{
                      backgroundColor: '#ffffff',
                      borderRadius: '14px',
                      border: '1px solid #e2e8f0',
                      padding: '1.25rem',
                      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.03)',
                      transition: 'all 0.15s ease',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.85rem',
                    }}
                  >
                    {/* Header Row: Icon, Title & Tag */}
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.75rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div
                          style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '10px',
                            backgroundColor: `${item.badgeColor}12`,
                            color: item.badgeColor,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                          }}
                        >
                          <ItemIcon size={20} />
                        </div>
                        <div>
                          <h3 style={{ margin: 0, fontSize: '0.98rem', fontWeight: 800, color: '#0f172a' }}>
                            {item.title}
                          </h3>
                          <p style={{ margin: '0.15rem 0 0 0', fontSize: '0.82rem', color: '#64748b' }}>
                            {item.subtitle}
                          </p>
                        </div>
                      </div>

                      <span
                        style={{
                          fontSize: '0.7rem',
                          fontWeight: 700,
                          backgroundColor: `${item.badgeColor}10`,
                          color: item.badgeColor,
                          padding: '0.2rem 0.5rem',
                          borderRadius: '6px',
                          whiteSpace: 'nowrap',
                          border: `1px solid ${item.badgeColor}25`,
                        }}
                      >
                        {item.tag}
                      </span>
                    </div>

                    {/* Highlights Row */}
                    <div
                      style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: '0.5rem 1.25rem',
                        padding: '0.5rem 0',
                        borderTop: '1px solid #f1f5f9',
                        borderBottom: '1px solid #f1f5f9',
                      }}
                    >
                      {item.highlights.map((h, idx) => (
                        <div
                          key={idx}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.35rem',
                            fontSize: '0.78rem',
                            color: '#475569',
                            fontWeight: 500,
                          }}
                        >
                          <FiCheck size={13} style={{ color: '#16a34a', flexShrink: 0 }} />
                          <span>{h}</span>
                        </div>
                      ))}
                    </div>

                    {/* Footer Row: Price + Compact Action Button */}
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.25rem' }}>
                        <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>Price:</span>
                        <span style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0054a6' }}>
                          Rs. {item.price}
                        </span>
                        <span style={{ fontSize: '0.75rem', color: '#64748b' }}>/ {item.period}</span>
                      </div>

                      <button
                        type="button"
                        onClick={() => navigate(item.route)}
                        style={{
                          backgroundColor: '#0054a6',
                          color: '#ffffff',
                          border: 'none',
                          borderRadius: '8px',
                          padding: '0.5rem 1rem',
                          fontSize: '0.84rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.35rem',
                          boxShadow: '0 2px 8px rgba(0, 84, 166, 0.2)',
                          transition: 'all 0.15s ease',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = '#004080';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = '#0054a6';
                        }}
                      >
                        <span>{item.actionLabel}</span>
                        <FiArrowRight size={13} />
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </section>

          {/* ═══════════════════════════════════════════════════════════
              RIGHT COLUMN: ACCOUNT SERVICES & SUPPORT
             ═══════════════════════════════════════════════════════════ */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
            {/* ── ACCOUNT SERVICES ── */}
            <section>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '1rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <div
                    style={{
                      width: '30px',
                      height: '30px',
                      borderRadius: '8px',
                      backgroundColor: '#f0fdf4',
                      color: '#16a34a',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <FiLayers size={16} />
                  </div>
                  <h2
                    style={{
                      margin: 0,
                      fontSize: '1.05rem',
                      fontWeight: 800,
                      color: '#0f172a',
                      letterSpacing: '0.02em',
                      textTransform: 'uppercase',
                    }}
                  >
                    Account Services
                  </h2>
                </div>
                <span
                  style={{
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    color: isDisconnected ? '#dc2626' : '#16a34a',
                  }}
                >
                  {isDisconnected ? 'Line Inactive' : 'Available on this line'}
                </span>
              </div>

              {/* CONTEXTUAL BRANCH: IF ACCOUNT IS DISCONNECTED */}
              {isDisconnected ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {/* Reactivate Alert Card */}
                  <div
                    style={{
                      backgroundColor: '#fff1f2',
                      border: '1px solid #fecdd3',
                      borderRadius: '14px',
                      padding: '1.25rem',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                      <div
                        style={{
                          width: '36px',
                          height: '36px',
                          borderRadius: '8px',
                          backgroundColor: '#e11d48',
                          color: '#ffffff',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                        }}
                      >
                        <FiAlertTriangle size={18} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <h4 style={{ margin: 0, fontSize: '0.96rem', fontWeight: 800, color: '#9f1239' }}>
                          Connection is Currently Disconnected
                        </h4>
                        <p style={{ margin: '0.35rem 0 0.85rem 0', fontSize: '0.82rem', color: '#be123c', lineHeight: 1.4 }}>
                          Your broadband and telephone services are paused. Settle outstanding balance to restore service immediately.
                        </p>

                        <button
                          type="button"
                          onClick={() => navigate('/reconnection')}
                          style={{
                            backgroundColor: '#e11d48',
                            color: '#ffffff',
                            border: 'none',
                            borderRadius: '8px',
                            padding: '0.55rem 1.15rem',
                            fontWeight: 700,
                            fontSize: '0.85rem',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.45rem',
                            boxShadow: '0 2px 8px rgba(225, 29, 72, 0.25)',
                          }}
                        >
                          <FiRefreshCw size={13} />
                          <span>Reactivate Connection Now</span>
                          <FiArrowRight size={13} />
                        </button>
                      </div>
                    </div>
                  </div>

                  <div
                    style={{
                      padding: '0.85rem 1rem',
                      backgroundColor: '#f8fafc',
                      borderRadius: '10px',
                      border: '1px dashed #cbd5e1',
                      fontSize: '0.78rem',
                      color: '#64748b',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.45rem',
                    }}
                  >
                    <FiInfo size={15} style={{ color: '#94a3b8', flexShrink: 0 }} />
                    <span>Relocation, Transfer, and Vacation Hold require an active connection.</span>
                  </div>
                </div>
              ) : (
                /* CONTEXTUAL BRANCH: IF ACCOUNT IS ACTIVE (CLEAN COMPACT LIST) */
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                  {/* Relocate Line */}
                  <Link
                    to="/location-change"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.9rem 1.1rem',
                      backgroundColor: '#ffffff',
                      border: '1px solid #e2e8f0',
                      borderRadius: '12px',
                      textDecoration: 'none',
                      color: '#0f172a',
                      transition: 'all 0.15s ease',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = '#0054a6';
                      e.currentTarget.style.transform = 'translateX(3px)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = '#e2e8f0';
                      e.currentTarget.style.transform = 'none';
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div
                        style={{
                          width: '34px',
                          height: '34px',
                          borderRadius: '8px',
                          backgroundColor: '#eff6ff',
                          color: '#0284c7',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <FiTruck size={17} />
                      </div>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#0f172a' }}>
                          Relocate Line
                        </div>
                        <div style={{ fontSize: '0.76rem', color: '#64748b' }}>
                          Move connection to a new residential or office address
                        </div>
                      </div>
                    </div>
                    <FiChevronRight size={16} style={{ color: '#94a3b8' }} />
                  </Link>

                  {/* Transfer Ownership */}
                  <Link
                    to="/ownership-change"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.9rem 1.1rem',
                      backgroundColor: '#ffffff',
                      border: '1px solid #e2e8f0',
                      borderRadius: '12px',
                      textDecoration: 'none',
                      color: '#0f172a',
                      transition: 'all 0.15s ease',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = '#0054a6';
                      e.currentTarget.style.transform = 'translateX(3px)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = '#e2e8f0';
                      e.currentTarget.style.transform = 'none';
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div
                        style={{
                          width: '34px',
                          height: '34px',
                          borderRadius: '8px',
                          backgroundColor: '#f0fdf4',
                          color: '#16a34a',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <FiUserCheck size={17} />
                      </div>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#0f172a' }}>
                          Transfer Ownership
                        </div>
                        <div style={{ fontSize: '0.76rem', color: '#64748b' }}>
                          Change registered account owner or transfer legal rights
                        </div>
                      </div>
                    </div>
                    <FiChevronRight size={16} style={{ color: '#94a3b8' }} />
                  </Link>

                  {/* Vacation Hold */}
                  <Link
                    to="/service-vacation"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.9rem 1.1rem',
                      backgroundColor: '#ffffff',
                      border: '1px solid #e2e8f0',
                      borderRadius: '12px',
                      textDecoration: 'none',
                      color: '#0f172a',
                      transition: 'all 0.15s ease',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = '#0054a6';
                      e.currentTarget.style.transform = 'translateX(3px)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = '#e2e8f0';
                      e.currentTarget.style.transform = 'none';
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div
                        style={{
                          width: '34px',
                          height: '34px',
                          borderRadius: '8px',
                          backgroundColor: '#faf5ff',
                          color: '#9333ea',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <FiPauseCircle size={17} />
                      </div>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#0f172a' }}>
                          Vacation Hold
                        </div>
                        <div style={{ fontSize: '0.76rem', color: '#64748b' }}>
                          Temporarily pause service &amp; rental while traveling
                        </div>
                      </div>
                    </div>
                    <FiChevronRight size={16} style={{ color: '#94a3b8' }} />
                  </Link>

                  {/* Package Migration */}
                  <Link
                    to="/package-migration"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.9rem 1.1rem',
                      backgroundColor: '#ffffff',
                      border: '1px solid #e2e8f0',
                      borderRadius: '12px',
                      textDecoration: 'none',
                      color: '#0f172a',
                      transition: 'all 0.15s ease',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = '#0054a6';
                      e.currentTarget.style.transform = 'translateX(3px)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = '#e2e8f0';
                      e.currentTarget.style.transform = 'none';
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div
                        style={{
                          width: '34px',
                          height: '34px',
                          borderRadius: '8px',
                          backgroundColor: '#fffbeb',
                          color: '#d97706',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <FiTrendingUp size={17} />
                      </div>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#0f172a' }}>
                          Package Migration
                        </div>
                        <div style={{ fontSize: '0.76rem', color: '#64748b' }}>
                          Upgrade or change your active tariff plan
                        </div>
                      </div>
                    </div>
                    <FiChevronRight size={16} style={{ color: '#94a3b8' }} />
                  </Link>
                </div>
              )}
            </section>

            {/* ── NEED ASSISTANCE? (SLIM, INTEGRATED TILE) ── */}
            <section>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  marginBottom: '1rem',
                }}
              >
                <div
                  style={{
                    width: '30px',
                    height: '30px',
                    borderRadius: '8px',
                    backgroundColor: '#eff6ff',
                    color: '#0284c7',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <FiHeadphones size={16} />
                </div>
                <h2
                  style={{
                    margin: 0,
                    fontSize: '1.05rem',
                    fontWeight: 800,
                    color: '#0f172a',
                    letterSpacing: '0.02em',
                    textTransform: 'uppercase',
                  }}
                >
                  Need Assistance?
                </h2>
              </div>

              <div
                style={{
                  backgroundColor: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '14px',
                  padding: '1.25rem',
                  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.03)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.85rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                  <div
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '8px',
                      backgroundColor: '#eff6ff',
                      color: '#0054a6',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <FiHelpCircle size={18} />
                  </div>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '0.94rem', fontWeight: 800, color: '#0f172a' }}>
                      Experiencing issues with this connection?
                    </h3>
                    <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.8rem', color: '#64748b', lineHeight: 1.4 }}>
                      Run instant diagnostics, submit a fault report, or chat directly with support.
                    </p>
                  </div>
                </div>

                <Link
                  to="/help"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.45rem',
                    width: '100%',
                    padding: '0.55rem 1rem',
                    borderRadius: '8px',
                    border: '1.5px solid #0054a6',
                    backgroundColor: 'transparent',
                    color: '#0054a6',
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    textDecoration: 'none',
                    transition: 'all 0.15s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#eff6ff';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  <FiHelpCircle size={15} />
                  <span>Get Help / Support</span>
                </Link>

                <div
                  style={{
                    padding: '0.45rem 0.65rem',
                    backgroundColor: '#f8fafc',
                    borderRadius: '6px',
                    fontSize: '0.72rem',
                    color: '#64748b',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <span>Hotline: <strong style={{ color: '#0f172a' }}>1212</strong></span>
                  <span>WhatsApp: <strong style={{ color: '#0f172a' }}>070 500 4000</strong></span>
                </div>
              </div>
            </section>
          </div>
        </div>
      </main>

      {/* ── CONNECTION SWITCHER MODAL ── */}
      <AnimatePresence>
        {showSwitchModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed',
              inset: 0,
              backgroundColor: 'rgba(15, 23, 42, 0.55)',
              backdropFilter: 'blur(4px)',
              zIndex: 999,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '1.5rem',
            }}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 8 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 8 }}
              style={{
                backgroundColor: '#ffffff',
                borderRadius: '16px',
                padding: '1.75rem',
                maxWidth: '460px',
                width: '100%',
                boxShadow: '0 20px 40px rgba(0, 0, 0, 0.2)',
                position: 'relative',
              }}
            >
              <button
                type="button"
                onClick={() => setShowSwitchModal(false)}
                style={{
                  position: 'absolute',
                  top: '1.25rem',
                  right: '1.25rem',
                  background: 'none',
                  border: 'none',
                  color: '#64748b',
                  cursor: 'pointer',
                  padding: '0.25rem',
                }}
              >
                <FiX size={18} />
              </button>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '8px',
                    backgroundColor: '#eff6ff',
                    color: '#0054a6',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <FiRefreshCw size={16} />
                </div>
                <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: '#0f172a' }}>
                  Switch Connection
                </h3>
              </div>

              <p style={{ margin: '0 0 1.25rem 0', fontSize: '0.82rem', color: '#64748b' }}>
                Select a registered SLT service number to manage:
              </p>

              <div style={{ display: 'grid', gap: '0.65rem' }}>
                {accountsList.map((acc, idx) => {
                  const isCurrent = (acc.telephone || acc.accountNo) === (currentAccount.telephone || currentAccount.accountNo);
                  return (
                    <div
                      key={idx}
                      onClick={() => handleSwitchConnection(acc)}
                      style={{
                        padding: '0.85rem 1rem',
                        borderRadius: '10px',
                        border: isCurrent ? '2px solid #0054a6' : '1px solid #e2e8f0',
                        backgroundColor: isCurrent ? '#eff6ff' : '#f8fafc',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                          <span style={{ fontWeight: 800, fontSize: '0.92rem', color: '#0f172a' }}>
                            #{acc.telephone || acc.accountNo}
                          </span>
                          <LiveStatusBadge status={acc.status} size="sm" />
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.15rem' }}>
                          {acc.packageName || acc.package || 'Fibre Broadband'} • {acc.customerType === 'office' ? 'Business' : 'Home'}
                        </div>
                      </div>

                      <div style={{ color: isCurrent ? '#0054a6' : '#94a3b8' }}>
                        {isCurrent ? <FiCheck size={18} /> : <FiChevronRight size={16} />}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div
                style={{
                  marginTop: '1.25rem',
                  paddingTop: '0.85rem',
                  borderTop: '1px solid #e2e8f0',
                  textAlign: 'center',
                }}
              >
                <Link
                  to="/new-connection"
                  onClick={() => setShowSwitchModal(false)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    color: '#0054a6',
                    fontWeight: 700,
                    fontSize: '0.84rem',
                    textDecoration: 'none',
                  }}
                >
                  <FiPlusCircle size={15} />
                  <span>Register Another Connection</span>
                </Link>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        @media (max-width: 900px) {
          .templand-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
