import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FiCheck, FiHeart, FiShoppingCart, FiWifi, FiChevronRight } from 'react-icons/fi';
import ProductDeviceGraphic from './ProductDeviceGraphic';

// One tag colour per product family so category reads at a glance.
const tagFor = (category = '', name = '') => {
  const text = `${category} ${name}`.toLowerCase();
  if (text.includes('peo') || /\btv\b/.test(text)) return { mod: 'tv', label: 'PEO TV' };
  if (text.includes('voice') || text.includes('megaline')) return { mod: 'voice', label: 'Voice' };
  if (text.includes('lte') || text.includes('4g')) return { mod: 'lte', label: 'LTE' };
  return { mod: 'fibre', label: 'Fibre' };
};

const money = (n) => `Rs. ${Number(n || 0).toLocaleString('en-LK')}`;

export default function ProductCard({
  product,
  isSelected,
  isFavorite,
  isInCart = false,
  onSelect,
  onToggleFavorite,
  onAddToCart,
  onRemoveFromCart,
  disabled = false,
  disabledReason = 'Category Limit Reached',
  viewMode = 'grid',
}) {
  const { t } = useTranslation();
  const [imgFailed, setImgFailed] = useState(false);

  const {
    _id,
    id,
    name: rawName,
    productName,
    monthlyPrice: rawMonthlyPrice,
    price,
    installationFee = 2500,
    features: rawFeatures = [],
    category = 'Broadband',
    speed,
    bannerUrl,
    description,
  } = product;

  const productId = String(_id || id);
  const name = rawName || productName || 'SLTMobitel Connection';
  const monthlyPrice = rawMonthlyPrice !== undefined ? rawMonthlyPrice : price !== undefined ? price : 0;
  const features =
    Array.isArray(rawFeatures) && rawFeatures.length > 0
      ? rawFeatures
      : description
        ? [description]
        : ['High-speed connectivity', '24/7 SLT Customer Support'];
  const tag = tagFor(category, name);
  const showSpeed = speed && !['voice', 'hd tv'].includes(String(speed).toLowerCase());
  const fee = Number(installationFee) || 0;

  const handleCart = () => {
    if (disabled) return;
    if (isInCart) onRemoveFromCart(product);
    else onAddToCart(product);
  };

  const media = (
    <div className="pc__media">
      <span className={`pc__tag pc__tag--${tag.mod}`}>{tag.label}</span>
      {bannerUrl && !imgFailed ? (
        <img src={bannerUrl} alt="" loading="lazy" onError={() => setImgFailed(true)} />
      ) : (
        <div className="pc__graphic" aria-hidden="true">
          <ProductDeviceGraphic name={name} category={category} />
        </div>
      )}
      <button
        type="button"
        className="pc__fav"
        aria-pressed={isFavorite}
        aria-label={isFavorite ? `Remove ${name} from favourites` : `Save ${name} to favourites`}
        onClick={(e) => {
          e.stopPropagation();
          onToggleFavorite(productId);
        }}
      >
        <FiHeart size={20} aria-hidden="true" fill={isFavorite ? 'currentColor' : 'none'} />
      </button>
    </div>
  );

  const priceBlock = (
    <div className="pc__price">
      <strong>
        {money(monthlyPrice)} <small>{t('catalog.card.perMonth', '/ month')}</small>
      </strong>
      <span>
        {fee > 0
          ? t('catalog.card.installFee', { amount: money(fee), defaultValue: '+ {{amount}} installation' })
          : t('catalog.card.noInstallFee', 'No installation fee')}
      </span>
    </div>
  );

  const actions = (
    <div className="pc__actions">
      <button
        type="button"
        className={`btn-ds ${isInCart ? 'btn-ds--outline' : 'btn-ds--buy'} btn-ds--block`}
        onClick={handleCart}
        disabled={disabled}
        aria-label={isInCart ? `${name}: ${t('catalog.card.removeFromCart', 'remove from cart')}` : undefined}
      >
        {isInCart ? (
          <>
            <FiCheck size={18} aria-hidden="true" />
            <span>{t('catalog.card.inCart', 'In Cart')}</span>
          </>
        ) : disabled ? (
          <span>{disabledReason}</span>
        ) : (
          <>
            <FiShoppingCart size={18} aria-hidden="true" />
            <span>{t('catalog.card.addToCart', 'Add to Cart')}</span>
          </>
        )}
      </button>
      <button type="button" className="pc__link" onClick={() => onSelect(product)}>
        <span>{t('catalog.card.viewDetails', 'View details')}</span>
        <FiChevronRight size={16} aria-hidden="true" />
      </button>
    </div>
  );

  const main = (
    <div className="pc__main" style={viewMode === 'list' ? undefined : { display: 'grid', gap: 10 }}>
      <h3 className="pc__name">{name}</h3>
      {showSpeed && (
        <span className="pc__speed">
          <FiWifi size={16} aria-hidden="true" />
          {speed}
        </span>
      )}
      <ul className="pc__feats">
        {features.slice(0, 3).map((f) => (
          <li key={f}>
            <FiCheck size={14} aria-hidden="true" />
            <span>{f}</span>
          </li>
        ))}
      </ul>
    </div>
  );

  if (viewMode === 'list') {
    return (
      <article className={`pc pc--row${isSelected ? ' is-selected' : ''}`}>
        {media}
        <div className="pc__body">
          {main}
          {priceBlock}
          {actions}
        </div>
      </article>
    );
  }

  return (
    <article className={`pc${isSelected ? ' is-selected' : ''}`}>
      {media}
      <div className="pc__body">
        {main}
        {priceBlock}
        {actions}
      </div>
    </article>
  );
}
