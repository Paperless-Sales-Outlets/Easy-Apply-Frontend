import React from 'react';
import { useTranslation } from 'react-i18next';
import { FiArrowRight } from 'react-icons/fi';
import HeroVisual from '../HeroVisual';

// Same language as the sign-in page: the live SLT advert over its own blurred
// colour wash, one clear action. Nothing else competes with the products.
export default function CatalogHero({ onShopNow }) {
  const { t } = useTranslation();

  return (
    <section className="shop-hero" aria-label={t('catalog.hero.label', 'Welcome')}>
      <HeroVisual variant="band" />
      <div className="shop-hero__copy">
        <h1>{t('catalog.hero.title', 'Choose your package')}</h1>
        <p>{t('catalog.hero.subtitle', 'Pick a package, check coverage and apply online.')}</p>
        <button type="button" className="btn-ds btn-ds--buy" onClick={onShopNow}>
          <span>{t('catalog.hero.shopNow', 'Browse packages')}</span>
          <FiArrowRight size={18} aria-hidden="true" />
        </button>
      </div>
    </section>
  );
}
