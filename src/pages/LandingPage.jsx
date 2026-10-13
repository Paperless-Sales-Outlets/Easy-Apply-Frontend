import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FiArrowRight, FiCreditCard, FiCamera, FiHome, FiPackage, FiPhoneCall, FiShield } from 'react-icons/fi';
import sltLogo from '../assets/slt-logo.png';
import HeroVisual from '../components/HeroVisual';
import { isAuthenticated } from '../utils/authSession';

const READY = [
  { icon: FiCreditCard, text: 'NIC, front & back' },
  { icon: FiCamera, text: 'Phone or laptop camera' },
  { icon: FiHome, text: 'Installation address' },
  { icon: FiCreditCard, text: 'Card for the fee' },
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
    <div className="lp">
      <section className="lp__copy">
        <img className="lp__logo rise" style={{ '--i': 0 }} src={sltLogo} alt="SLTMobitel, The Connection" />

        <div className="lp__body">
          <p className="lp__eyebrow rise" style={{ '--i': 1 }}>
            <span className="lp__tick" aria-hidden="true">
              <i />
              <i />
            </span>
            New connection
          </p>
          <h1 className="lp__title rise" style={{ '--i': 2 }}>
            Your connection,
            <br />
            just a few taps away.
          </h1>
          <p className="lp__lead rise" style={{ '--i': 3 }}>
            Apply for a new connection, manage your services and track requests, all in one secure place. No password,
            no teleshop visit.
          </p>

          <div className="lp__actions rise" style={{ '--i': 4 }}>
            <button type="button" id="btn-start-application" className="btn-ds btn-ds--primary lp__cta" onClick={handleStartApplication}>
              <span>{isUserAuthenticated ? 'Continue application' : 'Start new application'}</span>
              <FiArrowRight size={20} aria-hidden="true" />
            </button>
            <button type="button" id="card-track-application" className="btn-ds btn-ds--outline lp__cta" onClick={() => navigate('/check-status')}>
              <FiPackage size={20} aria-hidden="true" />
              <span>Track my application</span>
            </button>
          </div>
          <p className="lp__note rise" style={{ '--i': 5 }}>
            Already started? Enter your mobile number to pick up where you left off. Your progress is saved automatically.
          </p>

          <ul className="lp__ready rise" style={{ '--i': 6 }} aria-label="Have these ready">
            {READY.map(({ icon: Icon, text }) => (
              <li key={text}>
                <Icon size={20} aria-hidden="true" />
                <span>{text}</span>
              </li>
            ))}
          </ul>
        </div>

        <footer className="lp__foot rise" style={{ '--i': 7 }}>
          <a href="tel:1212">
            <FiPhoneCall size={16} aria-hidden="true" /> Need help? Call 1212
          </a>
          <span>
            <FiShield size={16} aria-hidden="true" /> Protected connection
          </span>
          <span className="lp__copy-note">&copy; 2026 SLT-Mobitel</span>
        </footer>
      </section>

      <aside className="lp__visual">
        <HeroVisual focus="mobile" />
      </aside>
    </div>
  );
}
