import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FiArrowRight,
  FiCheck,
  FiCreditCard,
  FiCamera,
  FiHome,
  FiPackage,
  FiChevronRight,
  FiPhoneCall,
  FiShield,
} from 'react-icons/fi';
import sltLogo from '../assets/slt-logo.png';
import { isAuthenticated } from '../utils/authSession';

const TRUST = [
  'No password needed',
  'No Teleshop visit required',
  'Save & continue anytime',
  'SLT secure payment gateway',
];

const READY = [
  { icon: FiCreditCard, text: 'Your NIC (front & back)' },
  { icon: FiCamera, text: 'Phone or laptop with a camera' },
  { icon: FiHome, text: 'Installation address' },
  { icon: FiCreditCard, text: 'Card for the connection fee' },
];

export default function LandingPage() {
  const navigate = useNavigate();
  const isUserAuthenticated = isAuthenticated();

  const handleStartApplication = () => {
    // Signed in: straight to the catalogue. Otherwise sign in first, then land there.
    if (isUserAuthenticated) navigate('/new-connection/products');
    else navigate('/login', { state: { from: '/new-connection/products' } });
  };

  return (
    <div className="landing">
      <header className="landing__bar">
        <img src={sltLogo} alt="SLTMobitel, The Connection" />
        <a className="landing__help" href="tel:1212">
          <FiPhoneCall size={18} aria-hidden="true" />
          <span>Need help? Call 1212</span>
        </a>
      </header>

      <main className="landing__main">
        <section className="landing__hero">
          <span className="shop-hero__slab" aria-hidden="true" style={{ width: 130, height: 380, right: -30, bottom: -150, background: '#1b6bb8' }} />
          <span className="shop-hero__slab" aria-hidden="true" style={{ width: 60, height: 300, right: 60, bottom: -150, background: 'var(--green)' }} />
          <div className="landing__hero-copy">
            <span className="shop-hero__tag">NEW CONNECTION</span>
            <h1>Your connection, just a few taps away.</h1>
            <p>Apply for a new connection, manage your services and track requests, all in one secure place.</p>
            <ul className="landing__trust">
              {TRUST.map((item) => (
                <li key={item}>
                  <FiCheck size={18} aria-hidden="true" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="landing__card" aria-labelledby="landing-start-h">
          <h2 id="landing-start-h">Let's get you connected</h2>
          <p className="landing__muted">Start a new application or pick up right where you left off.</p>

          <button type="button" id="btn-start-application" className="btn-ds btn-ds--buy btn-ds--block landing__cta" onClick={handleStartApplication}>
            <span>{isUserAuthenticated ? 'Continue application' : 'Start new application'}</span>
            <FiArrowRight size={20} aria-hidden="true" />
          </button>

          <p className="landing__muted">
            Already started? Enter your <strong>mobile number</strong> to pick up right where you left off. Your progress is saved automatically.
          </p>

          <div className="landing__ready">
            <h3>Have these ready</h3>
            <ul>
              {READY.map(({ icon: Icon, text }) => (
                <li key={text}>
                  <span className="landing__ready-ic" aria-hidden="true">
                    <Icon size={18} />
                  </span>
                  <span>{text}</span>
                </li>
              ))}
            </ul>
          </div>

          <button type="button" id="card-track-application" className="landing__track" onClick={() => navigate('/check-status')}>
            <span className="landing__ready-ic" aria-hidden="true">
              <FiPackage size={18} />
            </span>
            <span style={{ flex: 1, textAlign: 'left' }}>
              <strong>Track my application</strong>
              <small>Check the status of a submitted application</small>
            </span>
            <FiChevronRight size={20} aria-hidden="true" />
          </button>

          <p className="landing__muted" style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <FiShield size={16} aria-hidden="true" /> Protected connection
          </p>
        </section>
      </main>

      <footer className="landing__foot">&copy; 2026 SLT-Mobitel &middot; The National ICT Solutions Provider</footer>
    </div>
  );
}
