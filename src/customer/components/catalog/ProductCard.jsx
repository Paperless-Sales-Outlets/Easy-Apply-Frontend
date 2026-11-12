import React from 'react';
import { useTranslation } from 'react-i18next';
import { FiCheck, FiShoppingCart, FiArrowRight } from 'react-icons/fi';
import ProductDeviceGraphic from './ProductDeviceGraphic';
import './catalog.css';

/** Add / remove button. Flat: label and icon change, nothing bounces. */
function AddToCartButton({ product, isInCart, disabled, disabledReason, onAddToCart, onRemoveFromCart, t }) {
  const handleClick = (e) => {
    e.stopPropagation();
    if (disabled) return;
    if (isInCart) onRemoveFromCart?.(product);
    else onAddToCart?.(product);
  };

  const cls = `btn pcard-cart ${isInCart ? 'is-in-cart' : 'btn-primary'}`;

  return (
    <button
      type="button"
      className={cls}
      onClick={handleClick}
      disabled={disabled}
      title={isInCart ? t('catalog.card.removeFromCart', 'Remove from cart') : undefined}
    >
      {disabled ? (
        disabledReason
      ) : isInCart ? (
        <>
          <FiCheck size={18} aria-hidden="true" />
          {t('catalog.card.inCart', 'In cart')}
        </>
      ) : (
        <>
          <FiShoppingCart size={18} aria-hidden="true" />
          {t('catalog.card.addToCart', 'Add to cart')}
        </>
      )}
    </button>
  );
}

/** Catalogue card for one product in grid or list view, with select and cart actions. */
export default function ProductCard({
  product,
  isSelected,
  isInCart = false,
  onSelect,
  onAddToCart,
  onRemoveFromCart,
  disabled = false,
  disabledReason = 'Category limit reached',
  viewMode = 'grid',
}) {
  const { t } = useTranslation();
  const {
    name: rawName,
    productName,
    monthlyPrice: rawMonthlyPrice,
    price,
    installationFee = 2500,
    features: rawFeatures = [],
    category = 'Broadband',
    popular = false,
    bannerUrl,
    description,
  } = product;

  const name = rawName || productName || 'SLTMobitel Connection';
  const monthlyPrice = rawMonthlyPrice !== undefined ? rawMonthlyPrice : price !== undefined ? price : 0;
  const features =
    Array.isArray(rawFeatures) && rawFeatures.length > 0
      ? rawFeatures
      : description
        ? [description]
        : ['High-speed connectivity', '24/7 SLT Customer Support'];

  const visual = bannerUrl ? (
    <img src={bannerUrl} alt="" className="pcard-img" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
  ) : (
    <div className="pcard-graphic">
      <ProductDeviceGraphic name={name} category={category} />
    </div>
  );

  const featureList = (
    <ul className="pcard-features">
      {features.slice(0, 3).map((feat, idx) => (
        <li key={idx}>
          <FiCheck size={16} aria-hidden="true" />
          <span>{String(feat).replace(/^[✓✔]\s*/, '')}</span>
        </li>
      ))}
    </ul>
  );

  const price_ = (
    <div className="pcard-price">
      <p className="pcard-amount">
        Rs. {monthlyPrice ? monthlyPrice.toLocaleString() : '0'}
        <span>{t('catalog.card.perMonth', '/month')}</span>
      </p>
      <p className="pcard-fee">
        {t('catalog.card.installation', 'Installation:')} Rs. {installationFee ? installationFee.toLocaleString() : '2,500'}
      </p>
    </div>
  );

  const cart = (
    <AddToCartButton
      product={product}
      isInCart={isInCart}
      disabled={disabled}
      disabledReason={disabledReason}
      onAddToCart={onAddToCart}
      onRemoveFromCart={onRemoveFromCart}
      t={t}
    />
  );

  const details = (
    <button type="button" className="btn btn-tertiary pcard-details" onClick={() => onSelect(product)}>
      {t('catalog.card.viewDetails', 'View details')}
      <FiArrowRight size={16} aria-hidden="true" />
    </button>
  );

  if (viewMode === 'list') {
    return (
      <article className={`pcard pcard--row${isSelected ? ' is-selected' : ''} catalog-product-list-row`}>
        <div className="pcard-media">{visual}</div>
        <div className="pcard-body">
          <h3 className="pcard-title">
            {name}
            {popular && <span className="pcard-tag">{t('catalog.card.popular', 'Popular')}</span>}
          </h3>
          {featureList}
        </div>
        <div className="pcard-side catalog-product-list-actions">
          {price_}
          <div className="pcard-actions">
            {cart}
            {details}
          </div>
        </div>
      </article>
    );
  }

  return (
    <article className={`pcard${isSelected ? ' is-selected' : ''}`}>
      <div className="pcard-media">{visual}</div>
      <div className="pcard-body">
        <h3 className="pcard-title">
          {name}
          {popular && <span className="pcard-tag">{t('catalog.card.popular', 'Popular')}</span>}
        </h3>
        {featureList}
      </div>
      <div className="pcard-foot">
        {price_}
        <div className="pcard-actions">
          {cart}
          {details}
        </div>
      </div>
    </article>
  );
}
