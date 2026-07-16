import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Icon from '../Icon';
import sltLogo from '../../assets/sltlogoOnly.png';

export default function Navbar() {
  const { t, i18n } = useTranslation();

  return (
    <nav className="navbar">
      <div
        className="site-container"
        style={{
          padding: '0.9rem 2rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '0.75rem',
        }}
      >
        <Link
          to="/"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            textDecoration: 'none',
            color: 'var(--navy)',
          }}
        >
          <img
            src={sltLogo}
            alt="SLTMobitel logo"
            style={{ height: '36px', width: 'auto', objectFit: 'contain' }}
          />
          <span
            style={{
              fontFamily: 'var(--font-head)',
              fontSize: '1.2rem',
              fontWeight: 700,
              lineHeight: 1.1,
            }}
          >
            {t('nav.title')}
          </span>
        </Link>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
          }}
        >

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.3rem',
              padding: '0.4rem 0.6rem',
              backgroundColor: 'var(--paper)',
              borderRadius: '8px',
              border: '1px solid var(--line)',
            }}
          >
            <Icon name="globe" size={16} style={{ color: 'var(--blue)' }} />
            <select
              value={i18n.language}
              onChange={(e) => i18n.changeLanguage(e.target.value)}
              aria-label="Language"
              style={{
                border: 'none',
                backgroundColor: 'transparent',
                outline: 'none',
                fontSize: '0.85rem',
                fontFamily: 'var(--font-body)',
                color: 'var(--text)',
                cursor: 'pointer',
              }}
            >
              <option value="en">English</option>
              <option value="si">සිංහල</option>
              <option value="ta">தமிழ்</option>
            </select>
          </div>
        </div>
      </div>
    </nav>
  );
}
