import React from 'react';
import { useTranslation } from 'react-i18next';

export default function Footer() {
  const { t } = useTranslation();
  const year = new Date().getFullYear();

  return (
    <footer className="footer">
      <p>
        <strong>SLTMobitel</strong> — {t('footer.tagline')}
      </p>
      <p>{t('footer.rights', { year })}</p>
    </footer>
  );
}
