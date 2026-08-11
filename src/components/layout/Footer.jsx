import React from 'react';
import { useTranslation } from 'react-i18next';
import sltLogo from '../../assets/slt-logo.png';
import transzentLogo from '../../assets/transzent-logo.png';

export default function Footer() {
  const { t } = useTranslation();
  const year = new Date().getFullYear();

  return (
    <footer className="footer" style={{ padding: '2rem 0' }}>
      <div style={{
        maxWidth: '1600px',
        margin: '0 auto',
        padding: '0 1.5rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
          <img
            src={sltLogo}
            alt="SLTMobitel"
            style={{ height: '36px', width: 'auto', objectFit: 'contain' }}
          />
          <img
            src={transzentLogo}
            alt="Transzent"
            style={{ height: '28px', width: 'auto', objectFit: 'contain' }}
          />
        </div>
        <p style={{ margin: 0 }}>{t('footer.rights', { year })}</p>
      </div>
    </footer>
  );
}
