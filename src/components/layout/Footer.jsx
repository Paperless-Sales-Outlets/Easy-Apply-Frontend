import React from 'react';
import { useTranslation } from 'react-i18next';
import sltLogo from '../../assets/slt-logo.png';
import transzentLogo from '../../assets/transzent-logo.png';

export default function Footer() {
  const { t } = useTranslation();
  const year = new Date().getFullYear();

  return (
    <footer className="footer" style={{ padding: '2rem 0' }}>
      <div
        className="footer-container"
        style={{
          maxWidth: '1600px',
          margin: '0 auto',
          padding: '0 1.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem'
        }}
      >
        <div className="footer-logos-group" style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', flexWrap: 'wrap' }}>
          <img
            src={sltLogo}
            alt="SLTMobitel"
            style={{ height: '32px', width: 'auto', objectFit: 'contain' }}
          />
          <img
            src={transzentLogo}
            alt="Transzent"
            style={{ height: '24px', width: 'auto', objectFit: 'contain' }}
          />
        </div>
        <p style={{ margin: 0, fontSize: '0.85rem' }}>{t('footer.rights', { year })}</p>
      </div>
    </footer>
  );
}
