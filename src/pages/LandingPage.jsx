import React from 'react';
import { useNavigate } from 'react-router-dom';
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

export default function LandingPage() {
  const navigate = useNavigate();
  const isUserAuthenticated = isAuthenticated();

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

          {/* Main Hero Headline */}
          <h1 className="landing-hero-title">
            Your connection, <span className="landing-gradient-text">just a few taps away.</span>
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
              <span className="start-btn-sub">About 10 minutes &middot; saves automatically as you go</span>
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
