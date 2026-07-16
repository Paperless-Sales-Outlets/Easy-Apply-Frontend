import React from 'react';
import { useTranslation } from 'react-i18next';
import sltLogo from '../../assets/slt-logo.png';
import transzentLogo from '../../assets/transzent-logo.png';

export default function Footer() {
  const { t } = useTranslation();
  const year = new Date().getFullYear();

  return (
    <footer className="footer">
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '2rem',
        marginBottom: '0.75rem',
        flexWrap: 'wrap',
      }}>
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
      <p>{t('footer.rights', { year })}</p>
    </footer>
  );
}
