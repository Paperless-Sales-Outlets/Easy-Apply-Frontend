import React from 'react';
import { useTranslation } from 'react-i18next';
import sltLogo from '../../assets/slt-logo.png';
import transzentLogo from '../../assets/transzent-logo.png';

export default function Footer() {
  const { t } = useTranslation();
  const year = new Date().getFullYear();

  return (
    <footer className="site-footer">
      <div className="site-footer__in">
        <div className="site-footer__logos">
          <span className="plate">
            <img src={sltLogo} alt="SLTMobitel" />
          </span>
          <span className="plate">
            <img src={transzentLogo} alt="Transzent" />
          </span>
        </div>
        <p style={{ margin: 0 }}>{t('footer.rights', { year })}</p>
      </div>
    </footer>
  );
}
