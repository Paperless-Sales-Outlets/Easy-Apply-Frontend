import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FiTag,
  FiTruck,
  FiShield,
  FiArrowRight,
  FiRefreshCw,
  FiMapPin,
  FiRepeat,
  FiTrendingUp,
  FiSun,
  FiDollarSign,
  FiFileText,
  FiSmartphone,
  FiChevronRight,
} from 'react-icons/fi';

/* ── 3D Quad-Antenna Wi-Fi 6 Router on Glowing Cyber Pedestal Platform ── */
function MegaCardPedestalRouterGraphic() {
  return (
    <svg
      width="270"
      height="195"
      viewBox="0 0 280 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ filter: 'drop-shadow(0 16px 35px rgba(0,0,0,0.7))' }}
    >
      <defs>
        <filter id="neonGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <linearGradient id="pedestalRing" x1="0" y1="0" x2="1" y2="0">
          <stop stopColor="#10b981" />
          <stop offset="0.5" stopColor="#06b6d4" />
          <stop offset="1" stopColor="#3b82f6" />
        </linearGradient>
        <linearGradient id="routerBody" x1="0" y1="0" x2="0" y2="1">
          <stop stopColor="#1e293b" />
          <stop offset="1" stopColor="#090d16" />
        </linearGradient>
      </defs>

      {/* Outer Cyan/Green Glowing Ellipse Base Platform */}
      <ellipse cx="140" cy="165" rx="115" ry="25" fill="none" stroke="url(#pedestalRing)" strokeWidth="3.5" filter="url(#neonGlow)" opacity="0.95" />
      <ellipse cx="140" cy="165" rx="90" ry="19" fill="none" stroke="#10b981" strokeWidth="1.5" opacity="0.8" />
      <ellipse cx="140" cy="165" rx="115" ry="25" fill="url(#pedestalRing)" opacity="0.18" />

      {/* Animated Wi-Fi Signal Arcs Above Antennas */}
      <path d="M 115 42 A 28 28 0 0 1 165 42" fill="none" stroke="#10b981" strokeWidth="3.5" strokeLinecap="round" filter="url(#neonGlow)">
        <animate attributeName="opacity" values="1;0.2;1" dur="1.8s" repeatCount="indefinite" />
      </path>
      <path d="M 124 52 A 17 17 0 0 1 156 52" fill="none" stroke="#06b6d4" strokeWidth="3" strokeLinecap="round" filter="url(#neonGlow)">
        <animate attributeName="opacity" values="0.3;1;0.3" dur="1.8s" repeatCount="indefinite" />
      </path>
      <circle cx="140" cy="62" r="3.5" fill="#10b981" filter="url(#neonGlow)" />

      {/* 4 Tall Angled Antennas */}
      <rect x="74" y="40" width="6" height="76" rx="3" fill="#0f172a" />
      <rect x="75.5" y="36" width="3" height="8" rx="1.5" fill="#10b981" filter="url(#neonGlow)" />

      <rect x="109" y="32" width="6" height="84" rx="3" fill="#0f172a" />
      <rect x="110.5" y="28" width="3" height="8" rx="1.5" fill="#10b981" filter="url(#neonGlow)" />

      <rect x="165" y="32" width="6" height="84" rx="3" fill="#0f172a" />
      <rect x="166.5" y="28" width="3" height="8" rx="1.5" fill="#10b981" filter="url(#neonGlow)" />

      <rect x="200" y="40" width="6" height="76" rx="3" fill="#0f172a" />
      <rect x="201.5" y="36" width="3" height="8" rx="1.5" fill="#10b981" filter="url(#neonGlow)" />

      {/* Router Body Chassis */}
      <rect x="42" y="108" width="196" height="44" rx="12" fill="url(#routerBody)" stroke="#334155" strokeWidth="1.5" />
      <rect x="50" y="113" width="180" height="34" rx="8" fill="#090d16" />

      {/* Glowing LEDs */}
      <g filter="url(#neonGlow)">
        <circle cx="75" cy="130" r="3.2" fill="#10b981">
          <animate attributeName="opacity" values="1;0.3;1" dur="1.5s" repeatCount="indefinite" />
        </circle>
        <circle cx="90" cy="130" r="3.2" fill="#10b981">
          <animate attributeName="opacity" values="1;0.4;1" dur="2s" repeatCount="indefinite" />
        </circle>
        <circle cx="105" cy="130" r="3.2" fill="#10b981" />
        <circle cx="120" cy="130" r="3.2" fill="#06b6d4" />
        <circle cx="135" cy="130" r="3.2" fill="#10b981" />
      </g>

      {/* Metallic Logo Badge */}
      <rect x="165" y="123" width="42" height="14" rx="4" fill="#003828" stroke="#10b981" strokeWidth="1" />
      <text x="186" y="133.5" fontSize="7.5" fontWeight="900" fill="#10b981" textAnchor="middle" fontFamily="system-ui, sans-serif">FIBRE 6</text>

      {/* Base Drop Shadow */}
      <ellipse cx="140" cy="158" rx="95" ry="11" fill="black" opacity="0.55" />
    </svg>
  );
}

const QUICK_SERVICES = [
  {
    id: 'reconnection',
    title: 'Reconnection',
    desc: 'Reconnect your disconnected service',
    route: '/reconnection',
    icon: FiRefreshCw,
    bgColor: '#e6f4ea',
    iconColor: '#137333',
  },
  {
    id: 'relocation',
    title: 'Relocation',
    desc: 'Move your connection to a new address',
    route: '/location-change',
    icon: FiMapPin,
    bgColor: '#e8f0fe',
    iconColor: '#1a73e8',
  },
  {
    id: 'transfer',
    title: 'Transfer',
    desc: 'Transfer ownership of an existing connection',
    route: '/ownership-change',
    icon: FiRepeat,
    bgColor: '#f3e8ff',
    iconColor: '#9333ea',
  },
  {
    id: 'package-migration',
    title: 'Package Migration',
    desc: 'Migrate or upgrade to a new package',
    route: '/package-migration',
    icon: FiTrendingUp,
    bgColor: '#ffedd5',
    iconColor: '#ea580c',
  },
  {
    id: 'service-vacation',
    title: 'Service Vacation',
    desc: 'Apply for temporary service vacation',
    route: '/service-vacation',
    icon: FiSun,
    bgColor: '#fae8ff',
    iconColor: '#c026d3',
  },
  {
    id: 'refund-request',
    title: 'Refund Request',
    desc: 'Request a refund for deposits or overpayments',
    route: '/refund-request',
    icon: FiDollarSign,
    bgColor: '#fef3c7',
    iconColor: '#d97706',
  },
  {
    id: 'customer-request',
    title: 'General Customer Request',
    desc: 'Submit general requests or service inquiries',
    route: '/customer-request-acceptance',
    icon: FiFileText,
    bgColor: '#dcfce7',
    iconColor: '#16a34a',
  },
  {
    id: 'track-application',
    title: 'Track Application',
    desc: 'Track the status of your submitted application',
    route: '/check-status',
    icon: FiSmartphone,
    bgColor: '#f3e8ff',
    iconColor: '#7c3aed',
  },
];

export default function HeroBannerCarousel({ onShopNow }) {
  const navigate = useNavigate();
  const [activeDot, setActiveDot] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveDot((prev) => (prev + 1) % 5);
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(0, 1fr) 300px',
        gap: '1.25rem',
        marginBottom: '2rem',
        alignItems: 'stretch',
      }}
      className="hero-top-grid"
    >
      {/* ── Left Main Hero Banner (Navy Blue to Teal Theme) ── */}
      <div
        style={{
          background: 'linear-gradient(135deg, #001f3f 0%, #003b73 45%, #004d38 85%, #01291e 100%)',
          borderRadius: '16px',
          padding: '2.25rem 2.5rem',
          color: '#ffffff',
          position: 'relative',
          overflow: 'hidden',
          boxShadow: '0 12px 35px rgba(0, 31, 63, 0.35)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          minHeight: '280px',
        }}
      >
        {/* Glowing Background Radial Accents */}
        <div
          style={{
            position: 'absolute',
            right: '20%',
            top: '50%',
            transform: 'translateY(-50%)',
            width: '280px',
            height: '280px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(16, 185, 129, 0.25) 0%, rgba(6, 182, 212, 0.12) 50%, transparent 75%)',
            pointerEvents: 'none',
          }}
        />

        {/* Top Green Sale Badge */}
        <div style={{ marginBottom: '0.65rem' }}>
          <span
            style={{
              backgroundColor: '#047857',
              color: '#ffffff',
              fontSize: '0.75rem',
              fontWeight: 800,
              padding: '0.3rem 0.85rem',
              borderRadius: '9999px',
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
            }}
          >
            8.8 GREAT 8 SALE
          </span>
        </div>

        {/* Main Headline */}
        <h1
          style={{
            fontSize: 'clamp(2.2rem, 4.5vw, 3.2rem)',
            fontWeight: 900,
            lineHeight: 1.05,
            margin: 0,
            color: '#ffffff',
            letterSpacing: '-0.02em',
            fontFamily: 'var(--font-head)',
          }}
        >
          MEGA DEALS
        </h1>

        <p
          style={{
            fontSize: '1.15rem',
            fontWeight: 700,
            color: '#ffffff',
            marginTop: '0.35rem',
            marginBottom: '1.25rem',
          }}
        >
          Biggest Deals. Best Prices.
        </p>

        {/* Promo Features Badges */}
        <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
          <div
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.12)',
              backdropFilter: 'blur(4px)',
              borderRadius: '8px',
              padding: '0.4rem 0.85rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              fontSize: '0.82rem',
              fontWeight: 700,
            }}
          >
            <FiTag style={{ color: '#34d399' }} />
            <span>Discount Vouchers</span>
          </div>

          <div
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.12)',
              backdropFilter: 'blur(4px)',
              borderRadius: '8px',
              padding: '0.4rem 0.85rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              fontSize: '0.82rem',
              fontWeight: 700,
            }}
          >
            <FiTruck style={{ color: '#34d399' }} />
            <span>FREE Delivery</span>
          </div>

          <div
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.12)',
              backdropFilter: 'blur(4px)',
              borderRadius: '8px',
              padding: '0.4rem 0.85rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              fontSize: '0.82rem',
              fontWeight: 700,
            }}
          >
            <FiShield style={{ color: '#34d399' }} />
            <span>Trusted Connection</span>
          </div>
        </div>

        {/* Shop Now CTA Button */}
        <div>
          <button
            onClick={onShopNow}
            className="shimmer-btn"
            style={{
              backgroundColor: '#047857',
              color: '#ffffff',
              border: 'none',
              padding: '0.75rem 2rem',
              borderRadius: '9999px',
              fontWeight: 800,
              fontSize: '0.92rem',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              boxShadow: '0 4px 18px rgba(4, 120, 87, 0.45)',
            }}
          >
            <span>Shop Now</span>
            <FiArrowRight size={16} />
          </button>
        </div>

        {/* ── High-Tech 3D Pedestal Router Graphic (Center-Right Platform) ── */}
        <motion.div
          animate={{ y: [-8, 8, -8] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          style={{
            position: 'absolute',
            right: '130px',
            top: '50%',
            transform: 'translateY(-48%)',
            zIndex: 2,
            pointerEvents: 'none',
          }}
          className="hero-devices-cluster"
        >
          <MegaCardPedestalRouterGraphic />
        </motion.div>

        {/* UP TO 35% OFF Badge */}
        <motion.div
          animate={{ scale: [1, 1.06, 1] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          style={{
            position: 'absolute',
            right: '2rem',
            top: '2rem',
            backgroundColor: '#ffffff',
            color: '#064e3b',
            borderRadius: '50%',
            width: '95px',
            height: '95px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 6px 25px rgba(0, 0, 0, 0.35)',
            textAlign: 'center',
            zIndex: 3,
          }}
        >
          <span style={{ fontSize: '0.62rem', fontWeight: 800, textTransform: 'uppercase', color: '#064e3b' }}>UP TO</span>
          <span style={{ fontSize: '1.65rem', fontWeight: 900, lineHeight: 1, color: '#064e3b' }}>35%</span>
          <span style={{ fontSize: '0.68rem', fontWeight: 900, color: '#064e3b' }}>OFF</span>
        </motion.div>

        {/* Slider Pagination Dots */}
        <div
          style={{
            position: 'absolute',
            bottom: '0.85rem',
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex',
            gap: '0.45rem',
          }}
        >
          {[0, 1, 2, 3, 4].map((idx) => (
            <span
              key={idx}
              onClick={() => setActiveDot(idx)}
              style={{
                width: idx === activeDot ? '18px' : '7px',
                height: '7px',
                borderRadius: '9999px',
                backgroundColor: idx === activeDot ? '#ffffff' : 'rgba(255, 255, 255, 0.4)',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
              }}
            />
          ))}
        </div>
      </div>

      {/* ── Right Quick Action Cards (SINGLE COLUMN Layout — One by One Vertically) ── */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '0.45rem',
          height: '100%',
          justifyContent: 'space-between',
        }}
        className="quick-services-single-col"
      >
        {QUICK_SERVICES.map((srv) => {
          const IconComp = srv.icon;
          return (
            <motion.div
              key={srv.id}
              onClick={() => navigate(srv.route)}
              whileHover={{ scale: 1.02, x: -4 }}
              transition={{ type: 'spring', stiffness: 400, damping: 17 }}
              style={{
                backgroundColor: '#ffffff',
                borderRadius: '10px',
                padding: '0.45rem 0.75rem',
                border: '1px solid #e2e8f0',
                boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                cursor: 'pointer',
                flex: 1,
              }}
              className="quick-action-card-hover"
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', overflow: 'hidden' }}>
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
                <div style={{ overflow: 'hidden' }}>
                  <div
                    style={{
                      fontSize: '0.78rem',
                      fontWeight: 800,
                      color: '#0f172a',
                      lineHeight: 1.2,
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {srv.title}
                  </div>
                  <div
                    style={{
                      fontSize: '0.66rem',
                      color: '#64748b',
                      lineHeight: 1.2,
                      marginTop: '0.1rem',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {srv.desc}
                  </div>
                </div>
              </div>
              <FiChevronRight size={14} style={{ color: '#94a3b8', flexShrink: 0, marginLeft: '0.3rem' }} />
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
