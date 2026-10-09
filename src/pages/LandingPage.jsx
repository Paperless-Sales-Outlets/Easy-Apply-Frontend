import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
  FiZap,
  FiArrowRight,
  FiCheckCircle,
  FiCreditCard,
  FiCamera,
  FiHome,
  FiPackage,
  FiChevronRight,
  FiPhoneCall,
  FiShield,
} from 'react-icons/fi';
import sltLogo from '../assets/slt-logo.png';
import './LandingPage.css';
import { isAuthenticated } from '../utils/authSession';

const HERO_PHRASES = [
  { id: 0, text: 'Your connection,' },
  { id: 1, text: 'just a few taps away.' },
];

export default function LandingPage() {
  const navigate = useNavigate();
  const isUserAuthenticated = isAuthenticated();
  const [phraseIndex, setPhraseIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setPhraseIndex((prev) => (prev === 0 ? 1 : 0));
    }, 3200);
    return () => clearInterval(timer);
  }, []);

  const handleStartApplication = () => {
    // If already signed in, go straight to product catalog / new connection
    if (isUserAuthenticated) {
      navigate('/new-connection/products');
    } else {
      // Direct user to entry verification gateway, targeting the new connection flow
      navigate('/login', { state: { from: '/new-connection/products' } });
    }
  };

  const handleTrackApplication = () => {
    navigate('/check-status');
  };

  return (
    <div className="landing-root">
      {/* ── LEFT HERO BRAND PANEL ───────────────────────────────── */}
      <section className="landing-hero">
        {/* Animated Fiber Optic Light Streams & Network Mesh */}
        <div className="landing-fiber-bg" aria-hidden="true">
          <svg
            className="landing-fiber-svg"
            viewBox="0 0 1000 1000"
            preserveAspectRatio="xMidYMid slice"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              {/* Cyan Fiber Gradient */}
              <linearGradient id="fiberGradCyan" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#00aef0" stopOpacity="0.2" />
                <stop offset="50%" stopColor="#38bdf8" stopOpacity="1" />
                <stop offset="100%" stopColor="#ffffff" stopOpacity="1" />
              </linearGradient>

              {/* Emerald Fiber Gradient */}
              <linearGradient id="fiberGradEmerald" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#059669" stopOpacity="0.2" />
                <stop offset="50%" stopColor="#34d399" stopOpacity="1" />
                <stop offset="100%" stopColor="#a7f3d0" stopOpacity="1" />
              </linearGradient>

              {/* Blue / Violet Gradient */}
              <linearGradient id="fiberGradBlue" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#0284c7" stopOpacity="0.2" />
                <stop offset="50%" stopColor="#60a5fa" stopOpacity="1" />
                <stop offset="100%" stopColor="#bae6fd" stopOpacity="1" />
              </linearGradient>

              {/* Node Radial Glow */}
              <radialGradient id="nodeGlowCyan" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#38bdf8" stopOpacity="1" />
                <stop offset="60%" stopColor="#0284c7" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#0284c7" stopOpacity="0" />
              </radialGradient>

              <radialGradient id="nodeGlowEmerald" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#34d399" stopOpacity="1" />
                <stop offset="60%" stopColor="#059669" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#059669" stopOpacity="0" />
              </radialGradient>
            </defs>

            {/* ── Network Constellation Connecting Mesh Lines ── */}
            <g className="network-mesh-lines">
              <line x1="260" y1="200" x2="470" y2="290" className="mesh-line" />
              <line x1="470" y1="290" x2="620" y2="460" className="mesh-line" />
              <line x1="620" y1="460" x2="410" y2="610" className="mesh-line" />
              <line x1="410" y1="610" x2="760" y2="770" className="mesh-line" />
              <line x1="190" y1="450" x2="410" y2="610" className="mesh-line" />
              <line x1="190" y1="450" x2="260" y2="200" className="mesh-line" />
            </g>

            {/* ── Base Fiber Optic Strands (Subtle Glow Guides) ── */}
            <g className="fiber-base-strands">
              {/* Strand 1 */}
              <path
                d="M -50,180 C 180,90 320,310 560,250 C 780,190 860,420 1050,380"
                className="fiber-strand fiber-strand-cyan"
              />
              {/* Strand 2 */}
              <path
                d="M -50,420 C 160,480 340,160 590,220 C 810,270 860,650 1050,710"
                className="fiber-strand fiber-strand-emerald"
              />
              {/* Strand 3 */}
              <path
                d="M 140,-50 C 190,240 450,340 410,610 C 370,810 650,890 820,1050"
                className="fiber-strand fiber-strand-blue"
              />
              {/* Strand 4 */}
              <path
                d="M -50,760 C 220,710 390,920 660,810 C 850,730 920,880 1050,850"
                className="fiber-strand fiber-strand-emerald"
              />
              {/* Strand 5 */}
              <path
                d="M -50,290 C 280,240 460,540 760,470 C 920,430 970,590 1050,570"
                className="fiber-strand fiber-strand-cyan"
              />
            </g>

            {/* ── Active Optical Laser Light Pulses (Flowing along Fibers) ── */}
            <g className="fiber-active-pulses">
              {/* Pulse 1: High speed Cyan Beam */}
              <path
                d="M -50,180 C 180,90 320,310 560,250 C 780,190 860,420 1050,380"
                className="fiber-pulse fiber-pulse-1"
                stroke="url(#fiberGradCyan)"
              />
              {/* Pulse 2: Radiant Emerald Data Beam */}
              <path
                d="M -50,420 C 160,480 340,160 590,220 C 810,270 860,650 1050,710"
                className="fiber-pulse fiber-pulse-2"
                stroke="url(#fiberGradEmerald)"
              />
              {/* Pulse 3: Vertical-diagonal Blue Wave */}
              <path
                d="M 140,-50 C 190,240 450,340 410,610 C 370,810 650,890 820,1050"
                className="fiber-pulse fiber-pulse-3"
                stroke="url(#fiberGradBlue)"
              />
              {/* Pulse 4: Lower Loop Emerald Surge */}
              <path
                d="M -50,760 C 220,710 390,920 660,810 C 850,730 920,880 1050,850"
                className="fiber-pulse fiber-pulse-4"
                stroke="url(#fiberGradEmerald)"
              />
              {/* Pulse 5: Mid-line Ultra-fast Photon */}
              <path
                d="M -50,290 C 280,240 460,540 760,470 C 920,430 970,590 1050,570"
                className="fiber-pulse fiber-pulse-5"
                stroke="url(#fiberGradCyan)"
              />
            </g>

            {/* ── Pulsing Network Hub Nodes (ODN / Distribution Hubs) ── */}
            <g className="network-nodes">
              {/* Node 1 */}
              <g className="network-node" transform="translate(260, 200)">
                <circle className="node-ring node-ring-cyan" r="16" />
                <circle className="node-halo" r="8" fill="url(#nodeGlowCyan)" />
                <circle className="node-core node-core-cyan" r="3.5" />
              </g>

              {/* Node 2 */}
              <g className="network-node" transform="translate(470, 290)">
                <circle className="node-ring node-ring-emerald" r="18" style={{ animationDelay: '1.2s' }} />
                <circle className="node-halo" r="9" fill="url(#nodeGlowEmerald)" />
                <circle className="node-core node-core-emerald" r="4" />
              </g>

              {/* Node 3 */}
              <g className="network-node" transform="translate(620, 460)">
                <circle className="node-ring node-ring-cyan" r="15" style={{ animationDelay: '0.6s' }} />
                <circle className="node-halo" r="8" fill="url(#nodeGlowCyan)" />
                <circle className="node-core node-core-cyan" r="3.5" />
              </g>

              {/* Node 4 */}
              <g className="network-node" transform="translate(410, 610)">
                <circle className="node-ring node-ring-emerald" r="20" style={{ animationDelay: '2.1s' }} />
                <circle className="node-halo" r="10" fill="url(#nodeGlowEmerald)" />
                <circle className="node-core node-core-emerald" r="4" />
              </g>

              {/* Node 5 */}
              <g className="network-node" transform="translate(760, 770)">
                <circle className="node-ring node-ring-cyan" r="16" style={{ animationDelay: '1.8s' }} />
                <circle className="node-halo" r="8" fill="url(#nodeGlowCyan)" />
                <circle className="node-core node-core-cyan" r="3.5" />
              </g>

              {/* Node 6 */}
              <g className="network-node" transform="translate(190, 450)">
                <circle className="node-ring node-ring-emerald" r="17" style={{ animationDelay: '2.7s' }} />
                <circle className="node-halo" r="8" fill="url(#nodeGlowEmerald)" />
                <circle className="node-core node-core-emerald" r="3.5" />
              </g>
            </g>
          </svg>
        </div>

        <div className="landing-hero-content">
          {/* Brand Logo Badge */}
          <div className="landing-brand-badge">
            <img src={sltLogo} alt="SLTMobitel - The Connection" className="landing-brand-logo" />
          </div>

          {/* 100% Online Live Pill */}
          <div className="landing-live-pill">
            <span className="landing-live-dot" aria-hidden="true" />
            <span>New connections · 100% online</span>
          </div>

          {/* Main Hero Headline - Alternating Two-Phase Cycle (Guaranteed No-Overlap) */}
          <h1 className="landing-hero-title landing-cycle-title">
            <AnimatePresence mode="wait">
              <motion.span
                key={phraseIndex}
                initial={{ opacity: 0, y: 16, filter: 'blur(5px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                exit={{ opacity: 0, y: -16, filter: 'blur(5px)' }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className={`landing-phrase ${phraseIndex === 1 ? 'landing-gradient-text' : 'phrase-lead'}`}
              >
                {HERO_PHRASES[phraseIndex].text}
              </motion.span>
            </AnimatePresence>
          </h1>

          {/* Subtitle */}
          <p className="landing-hero-desc">
            Apply for a new connection, manage your services and track requests — all in one secure place.
          </p>

          {/* 3 KPI Feature Metric Cards */}
          <div className="landing-kpi-grid">
            <div className="landing-kpi-card">
              <span className="landing-kpi-val">~10 min</span>
              <span className="landing-kpi-label">to apply</span>
            </div>
            <div className="landing-kpi-card">
              <span className="landing-kpi-val">Zero</span>
              <span className="landing-kpi-label">paper forms or queues</span>
            </div>
            <div className="landing-kpi-card">
              <span className="landing-kpi-val">24/7</span>
              <span className="landing-kpi-label">apply &amp; track anytime</span>
            </div>
          </div>

          {/* Consolidated 2x2 Trust Features Grid */}
          <div className="landing-trust-grid">
            <div className="landing-trust-item">
              <FiCheckCircle size={17} className="landing-trust-check" aria-hidden="true" />
              <span>No password needed</span>
            </div>
            <div className="landing-trust-item">
              <FiCheckCircle size={17} className="landing-trust-check" aria-hidden="true" />
              <span>No Teleshop visit required</span>
            </div>
            <div className="landing-trust-item">
              <FiCheckCircle size={17} className="landing-trust-check" aria-hidden="true" />
              <span>Save &amp; continue anytime</span>
            </div>
            <div className="landing-trust-item">
              <FiCheckCircle size={17} className="landing-trust-check" aria-hidden="true" />
              <span>SLT secure payment gateway</span>
            </div>
          </div>

          {/* Copyright Footer */}
          <footer className="landing-hero-footer">
            &copy; 2026 SLT-Mobitel &middot; The National ICT Solutions Provider
          </footer>
        </div>
      </section>

      {/* ── RIGHT INTERACTIVE ACTION HUB ───────────────────────── */}
      <main className="landing-hub">
        <div className="landing-action-card">
          <span className="landing-card-category">New Connection</span>
          <h2 className="landing-card-title">Let's get you connected</h2>
          <p className="landing-card-subtitle">
            Start a new application or pick up right where you left off.
          </p>

          {/* Primary CTA Button */}
          <button
            type="button"
            className="landing-start-btn"
            onClick={handleStartApplication}
            id="btn-start-application"
          >
            <div className="start-btn-icon" aria-hidden="true">
              <FiZap size={22} />
            </div>
            <div className="start-btn-text">
              <span className="start-btn-title">
                {isUserAuthenticated ? 'Continue application' : 'Start new application'}
              </span>

            </div>
            <div className="start-btn-arrow" aria-hidden="true">
              <FiArrowRight size={18} />
            </div>
          </button>

          {/* Clear Continuity Notice with High Contrast */}
          <p className="landing-continuity-notice">
            Already started? Enter your <strong>mobile number</strong> to pick up right where you left off — your progress is automatically saved.
          </p>

          {/* "HAVE THESE READY" Checklist Box */}
          <div className="landing-checklist-box">
            <span className="checklist-heading">Have these ready</span>
            <div className="checklist-grid">
              <div className="checklist-item">
                <div className="checklist-icon-wrap" aria-hidden="true">
                  <FiCreditCard size={16} />
                </div>
                <span>Your NIC (front &amp; back)</span>
              </div>
              <div className="checklist-item">
                <div className="checklist-icon-wrap" aria-hidden="true">
                  <FiCamera size={16} />
                </div>
                <span>Phone or laptop with a camera</span>
              </div>
              <div className="checklist-item">
                <div className="checklist-icon-wrap" aria-hidden="true">
                  <FiHome size={16} />
                </div>
                <span>Installation address</span>
              </div>
              <div className="checklist-item">
                <div className="checklist-icon-wrap" aria-hidden="true">
                  <FiCreditCard size={16} />
                </div>
                <span>Card for the connection fee</span>
              </div>
            </div>
          </div>

          {/* "Track my application" Quick Card */}
          <div
            className="landing-track-card"
            onClick={handleTrackApplication}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleTrackApplication(); }}
            id="card-track-application"
          >
            <div className="track-icon-badge" aria-hidden="true">
              <FiPackage size={20} />
            </div>
            <div className="track-card-text">
              <span className="track-card-title">Track my application</span>
              <p className="track-card-sub">Check the status of a submitted application</p>
            </div>
            <FiChevronRight size={18} color="#94a3b8" aria-hidden="true" />
          </div>

          {/* Support and Protected Connection Footer */}
          <div className="landing-support-footer">
            <a href="tel:1212" className="support-item">
              <FiPhoneCall size={14} aria-hidden="true" />
              <span>Need help? Call 1212</span>
            </a>
            <div className="support-item">
              <FiShield size={14} aria-hidden="true" />
              <span>Protected connection</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
