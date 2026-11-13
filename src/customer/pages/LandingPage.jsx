import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiArrowRight, FiCheck, FiCreditCard, FiCamera, FiHome, FiPackage, FiPhoneCall } from 'react-icons/fi';
import sltLogo from '../../assets/slt-logo.png';
import './LandingPage.css';
import { isAuthenticated } from '../../shared/utils/authSession';

const PROMISES = [
  'No Teleshop visit required',
  'Save and continue any time',
  'SLT secure payment gateway',
  'Protected connection',
];

const CHECKLIST = [
  { icon: FiCreditCard, text: 'Your NIC (front and back)' },
  { icon: FiCamera, text: 'A phone or laptop with a camera' },
  { icon: FiHome, text: 'Your installation address' },
  { icon: FiCreditCard, text: 'A card for the connection fee' },
];

/** Public landing page shown to signed-out visitors. */
export default function LandingPage() {
  const navigate = useNavigate();
  const signedIn = isAuthenticated();

  const [fill, setFill] = useState(null);

  // Going to the sign-in screen: blue floods out from the pressed button,
  // then the login box rises in on the blue page it lands on.
  const go = (e, to, from) => {
    if (signedIn) return navigate(to);
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) return navigate('/login', { state: { from } });
    const r = e.currentTarget.getBoundingClientRect();
    const x = r.left + r.width / 2;
    const y = r.top + r.height / 2;
    const far = Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y));
    setFill({ x, y, scale: (far * 2) / 40 + 2 });
    setTimeout(() => navigate('/login', { state: { from } }), 520);
    return undefined;
  };

  const start = (e) => go(e, '/new-connection/products', '/new-connection/products');
  const track = (e) => go(e, '/check-status', '/check-status');

  return (
    <div className="landing-root">
      {fill && (
        <motion.div
          aria-hidden="true"
          className="landing-fill"
          style={{ left: fill.x - 20, top: fill.y - 20 }}
          initial={{ scale: 0 }}
          animate={{ scale: fill.scale }}
          transition={{ duration: 0.5, ease: [0.5, 0, 0.75, 0] }}
        />
      )}
      <section className="landing-hero" aria-labelledby="landing-title">
        <div className="landing-hero-content">
          <img src={sltLogo} alt="SLTMobitel - The Connection" className="landing-brand" />

          <h1 id="landing-title" className="landing-hero-title">
            Your connection, just a few taps away.
          </h1>
          <p className="landing-hero-desc">
            Apply for a new connection, manage your services and track requests, all in one secure place.
            Most people finish in about 10 minutes.
          </p>

          <ul className="landing-promises">
            {PROMISES.map((text) => (
              <li key={text}>
                <FiCheck size={18} aria-hidden="true" />
                <span>{text}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <main className="landing-hub">
        <div className="landing-action-card">
          <h2 className="landing-card-title">Start your application</h2>
          <p className="landing-card-subtitle">
            Already started? Enter your mobile number and pick up where you left off. Your progress is saved.
          </p>

          <button type="button" className="btn btn-primary landing-start-btn" onClick={start} id="btn-start-application">
            {signedIn ? 'Continue application' : 'Start new application'}
            <FiArrowRight size={18} aria-hidden="true" />
          </button>

          <section className="landing-checklist" aria-labelledby="landing-ready">
            <h3 id="landing-ready" className="landing-checklist-title">Have these ready</h3>
            <ul>
              {CHECKLIST.map(({ icon: Icon, text }) => (
                <li key={text}>
                  <Icon size={18} aria-hidden="true" />
                  <span>{text}</span>
                </li>
              ))}
            </ul>
          </section>

          <button type="button" className="landing-track" onClick={track} id="card-track-application">
            <FiPackage size={20} aria-hidden="true" />
            <span className="landing-track-text">
              <strong>Track my application</strong>
              <span>Check the status of a submitted application</span>
            </span>
            <FiArrowRight size={18} aria-hidden="true" />
          </button>

          <div className="landing-support">
            <a href="tel:1212">
              <FiPhoneCall size={16} aria-hidden="true" />
              Need help? Call 1212
            </a>
          </div>
        </div>
      </main>
    </div>
  );
}
