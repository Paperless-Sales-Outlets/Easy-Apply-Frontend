import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FiCheck, FiShoppingCart, FiChevronRight } from 'react-icons/fi';
import ProductDeviceGraphic from './ProductDeviceGraphic';

const money = (n) => `Rs. ${Number(n || 0).toLocaleString('en-LK')}`;

/**
 * Listing card: name, price, add to cart, view details. Everything else lives
 * in the details dialog. The product image sits on the right and dissolves into
 * the card (feathered mask), so there is no image box and no hard edge.
 */
export default function ProductCard({
  product,
  isSelected,
  isInCart = false,
  onSelect,
  onAddToCart,
  onRemoveFromCart,
  disabled = false,
  disabledReason = 'Category Limit Reached',
  viewMode = 'grid',
}) {
  const { t } = useTranslation();
  const [imgFailed, setImgFailed] = useState(false);

  const { name: rawName, productName, monthlyPrice: rawMonthlyPrice, price, category = 'Broadband', bannerUrl } = product;
  const name = rawName || productName || 'SLTMobitel Connection';
  const monthlyPrice = rawMonthlyPrice !== undefined ? rawMonthlyPrice : price !== undefined ? price : 0;

  const handleCart = () => {
    if (disabled) return;
    if (isInCart) onRemoveFromCart(product);
    else onAddToCart(product);
  };

  // One quiet line of detail: speed when it means something, else the first feature.
  const firstFeature = Array.isArray(product.features) && product.features.length ? product.features[0] : '';
  const showSpeed = product.speed && !['voice', 'hd tv'].includes(String(product.speed).toLowerCase());
  const detail = showSpeed ? product.speed : firstFeature || category;

  const cartButton = (
    <button
      type="button"
      className={`btn-ds ${isInCart ? 'btn-ds--outline' : 'btn-ds--buy'}`}
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
  );

  if (viewMode !== 'list') {
    return (
      <article className={`pc pc--tile${isSelected ? ' is-selected' : ''}`}>
        <button type="button" className="pc__open" onClick={() => onSelect(product)} aria-label={`${name}, ${money(monthlyPrice)}, ${t('catalog.card.viewDetails', 'View details')}`}>
          <span className="pc__pic" aria-hidden="true">
            {bannerUrl && !imgFailed ? (
              <img src={bannerUrl} alt="" loading="lazy" onError={() => setImgFailed(true)} />
            ) : (
              <span className="pc__graphic">
                <ProductDeviceGraphic name={name} category={category} />
              </span>
            )}
          </span>
          <span className="pc__title">{name}</span>
          <span className="pc__detail">{detail}</span>
        </button>
        <p className="pc__price">
          <strong>{money(monthlyPrice)}</strong>
          <small>{t('catalog.card.perMonth', '/ month')}</small>
        </p>
        <div className="pc__buy">{cartButton}</div>
      </article>
    );
  }

  return (
    <article className={`pc${viewMode === 'list' ? ' pc--row' : ''}${isSelected ? ' is-selected' : ''}`}>
      <div className="pc__media" aria-hidden="true">
        {bannerUrl && !imgFailed ? (
          <img src={bannerUrl} alt="" loading="lazy" onError={() => setImgFailed(true)} />
        ) : (
          <div className="pc__graphic">
            <ProductDeviceGraphic name={name} category={category} />
          </div>
        )}
      </div>

      <div className="pc__content">
        <div className="pc__info">
          <h3 className="pc__name">{name}</h3>
          <p className="pc__price">
            <strong>{money(monthlyPrice)}</strong>
            <small>{t('catalog.card.perMonth', '/ month')}</small>
          </p>
        </div>

        <div className="pc__actions">
          <button
            type="button"
            className={`btn-ds ${isInCart ? 'btn-ds--outline' : 'btn-ds--buy'}`}
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
      </div>
    </article>
  );
}
