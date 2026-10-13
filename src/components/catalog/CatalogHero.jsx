import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FiArrowRight } from 'react-icons/fi';
import heroArt from '../../assets/HeroSLT.png';

// Slim brand banner: SLT's diagonal-slab motif in flat colour, one headline,
// two actions. The photograph is decoration, so it is a CSS background that
// phones never download (hidden below 900px).
export default function CatalogHero({ onShopNow }) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <section className="shop-hero" aria-label={t('catalog.hero.label', 'Welcome')}>
      <span className="shop-hero__slab" aria-hidden="true" style={{ width: 150, height: 520, right: '38%', top: -150, background: '#1b6bb8' }} />
      <span className="shop-hero__slab" aria-hidden="true" style={{ width: 70, height: 420, right: '33%', top: -110, background: 'var(--green)' }} />
      <div className="shop-hero__copy">
        <span className="shop-hero__tag">{t('catalog.hero.tag', 'APPLY ONLINE')}</span>
        <h1>{t('catalog.hero.title', 'Fast, stable internet for your whole home')}</h1>
        <p>{t('catalog.hero.subtitle', 'Pick a package, check coverage and apply online. No teleshop queue.')}</p>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <button type="button" className="btn-ds btn-ds--buy" onClick={onShopNow}>
            <span>{t('catalog.hero.shopNow', 'Shop packages')}</span>
            <FiArrowRight size={18} aria-hidden="true" />
          </button>
          <button type="button" className="btn-ds btn-ds--ghost" onClick={() => navigate('/services')}>
            {t('catalog.hero.services', 'Application services')}
          </button>
        </div>
      </div>
      <div className="shop-hero__art" aria-hidden="true" style={{ backgroundImage: `url(${heroArt})` }} />
    </section>
  );
}
