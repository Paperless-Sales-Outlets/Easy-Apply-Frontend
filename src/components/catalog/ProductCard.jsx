import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { FiCheck, FiHeart, FiShoppingCart, FiPackage } from 'react-icons/fi';
import { FaHeart } from 'react-icons/fa';
import ProductDeviceGraphic from './ProductDeviceGraphic';

/**
 * Animated Add to Cart Button
 * Features a tactile bounce, a package dropping into the shopping cart,
 * and a smooth gradient color change from SLT Blue to SLT Green with checkmark.
 */
function AnimatedAddToCartButton({
  product,
  isInCart,
  disabled,
  disabledReason,
  onAddToCart,
  onRemoveFromCart,
  t,
  style = {},
  fullWidth = false,
}) {
  const [isAdding, setIsAdding] = useState(false);

  const handleClick = (e) => {
    e.stopPropagation();
    if (disabled) return;

    if (isInCart) {
      if (onRemoveFromCart) onRemoveFromCart(product);
    } else {
      setIsAdding(true);
      if (onAddToCart) onAddToCart(product);
      setTimeout(() => {
        setIsAdding(false);
      }, 750);
    }
  };

  const isSuccessState = isInCart || isAdding;

  return (
    <motion.button
      type="button"
      onClick={handleClick}
      disabled={disabled}
      title={isInCart ? t('catalog.card.removeFromCart', 'Remove from cart') : undefined}
      whileTap={{ scale: disabled ? 1 : 0.94 }}
      whileHover={{ scale: disabled ? 1 : 1.02 }}
      animate={{
        backgroundColor: isSuccessState ? '#16a34a' : disabled ? '#e2e8f0' : '#0056b3',
        color: isSuccessState ? '#ffffff' : disabled ? '#475569' : '#ffffff',
        boxShadow: disabled
          ? 'none'
          : isSuccessState
            ? '0 4px 14px rgba(22, 163, 74, 0.35)'
            : '0 4px 14px rgba(0, 86, 179, 0.25)',
      }}
      transition={{ duration: 0.3 }}
      style={{
        position: 'relative',
        overflow: 'hidden',
        width: fullWidth ? '100%' : 'auto',
        border: disabled ? '1px solid #cbd5e1' : 'none',
        borderRadius: '8px',
        padding: '0.55rem 0.95rem',
        fontWeight: 800,
        fontSize: '0.82rem',
        cursor: disabled ? 'not-allowed' : 'pointer',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.45rem',
        whiteSpace: 'nowrap',
        ...style,
      }}
    >
      {/* ── Cart / Check Icon with Falling Item Animation ── */}
      <span style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 18, height: 18 }}>
        <AnimatePresence mode="wait">
          {isInCart && !isAdding ? (
            <motion.span
              key="check"
              initial={{ scale: 0, rotate: -45 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 450, damping: 22 }}
              style={{ display: 'inline-flex' }}
            >
              <FiCheck size={16} />
            </motion.span>
          ) : isAdding ? (
            <motion.span key="animating" style={{ position: 'relative', display: 'inline-flex' }}>
              {/* Dropping Package/Item */}
              <motion.span
                initial={{ y: -16, x: -3, scale: 0.5, opacity: 0 }}
                animate={{
                  y: [-16, -3, 2],
                  x: [-3, 0, 1],
                  scale: [0.6, 0.9, 0.4],
                  opacity: [0, 1, 0.9, 0],
                }}
                transition={{ duration: 0.45, ease: 'easeIn' }}
                style={{
                  position: 'absolute',
                  top: '-4px',
                  left: '3px',
                  color: '#fef08a',
                  zIndex: 2,
                }}
              >
                <FiPackage size={11} />
              </motion.span>

              {/* Cart bounces upon catching the item */}
              <motion.span
                animate={{
                  rotate: [0, -14, 10, -5, 0],
                  scale: [1, 1.25, 0.9, 1.1, 1],
                }}
                transition={{ duration: 0.55, delay: 0.12 }}
                style={{ display: 'inline-flex' }}
              >
                <FiShoppingCart size={15} />
              </motion.span>
            </motion.span>
          ) : (
            <motion.span
              key="cart"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ duration: 0.2 }}
              style={{ display: 'inline-flex' }}
            >
              <FiShoppingCart size={15} />
            </motion.span>
          )}
        </AnimatePresence>
      </span>

      {/* ── Animated Text ── */}
      <span style={{ position: 'relative', display: 'inline-block', overflow: 'hidden' }}>
        <AnimatePresence mode="wait">
          {disabled ? (
            <motion.span
              key="disabled"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {disabledReason}
            </motion.span>
          ) : isAdding ? (
            <motion.span
              key="adding"
              initial={{ y: 8, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -8, opacity: 0 }}
              transition={{ duration: 0.25 }}
            >
              {t('catalog.card.added', 'Added! ✓')}
            </motion.span>
          ) : isInCart ? (
            <motion.span
              key="incart"
              initial={{ y: 8, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -8, opacity: 0 }}
              transition={{ duration: 0.25 }}
            >
              {t('catalog.card.inCart', 'In Cart')}
            </motion.span>
          ) : (
            <motion.span
              key="add"
              initial={{ y: -8, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 8, opacity: 0 }}
              transition={{ duration: 0.25 }}
            >
              {t('catalog.card.addToCart', 'Add to Cart')}
            </motion.span>
          )}
        </AnimatePresence>
      </span>
    </motion.button>
  );
}

// Cards are tinted by product family, using four depths of the SLT navy →
// green identity rather than a different hue per product. Category still reads
// at a glance, but the catalogue looks like one product instead of a swatch
// book.
const CATEGORY_GRADIENTS = {
  Broadband: 'linear-gradient(135deg, #003b73 0%, #001f3f 100%)',
  Fibre: 'linear-gradient(135deg, #003b73 0%, #001f3f 100%)',
  LTE: 'linear-gradient(135deg, #0b4a91 0%, #00305e 100%)',
  Voice: 'linear-gradient(135deg, #00566b 0%, #012f3d 100%)',
  'PEO TV': 'linear-gradient(135deg, #004d38 0%, #01291e 100%)',
  PEOTV: 'linear-gradient(135deg, #004d38 0%, #01291e 100%)',
};

const DEFAULT_GRADIENT = 'linear-gradient(135deg, #003b73 0%, #001f3f 100%)';

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
    popular = false,
    bannerUrl,
    description,
  } = product;

  const name = rawName || productName || 'SLTMobitel Connection';
  const monthlyPrice = rawMonthlyPrice !== undefined ? rawMonthlyPrice : (price !== undefined ? price : 0);
  const features = Array.isArray(rawFeatures) && rawFeatures.length > 0 
    ? rawFeatures 
    : (description ? [description] : ['High-speed connectivity', '24/7 SLT Customer Support']);

  const cardGradient = CATEGORY_GRADIENTS[category] || DEFAULT_GRADIENT;

  if (viewMode === 'list') {
    return (
      <motion.div
        whileHover={{ y: -2, boxShadow: '0 10px 28px rgba(0, 86, 179, 0.14)' }}
        transition={{ type: 'spring', stiffness: 350, damping: 25 }}
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          border: isSelected ? '2px solid #0056b3' : '1px solid #e2e8f0',
          overflow: 'hidden',
          boxShadow: isSelected ? '0 8px 25px rgba(0,86,179,0.2)' : '0 2px 10px rgba(0,0,0,0.03)',
          display: 'flex',
          alignItems: 'stretch',
          gap: '1rem',
          padding: '0.85rem',
        }}
        className="catalog-product-list-row"
      >
        {/* Left gradient icon tile */}
        <div
          style={{
            background: cardGradient,
            borderRadius: '12px',
            width: '92px',
            minWidth: '92px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
          }}
        >
          <div style={{ width: '56px', height: '56px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {bannerUrl ? (
              <img
                src={bannerUrl}
                alt={name}
                style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.3))' }}
                onError={(e) => { e.currentTarget.style.display = 'none'; }}
              />
            ) : (
              <ProductDeviceGraphic name={name} category={category} />
            )}
          </div>
          {popular && (
            <span
              style={{
                position: 'absolute',
                top: '0.35rem',
                left: '0.35rem',
                backgroundColor: '#047857',
                color: '#ffffff',
                fontSize: '0.55rem',
                fontWeight: 900,
                padding: '0.15rem 0.4rem',
                borderRadius: '9999px',
                letterSpacing: '0.03em',
              }}
            >
              {t('catalog.card.popular', 'POPULAR')}
            </span>
          )}
        </div>

        {/* Middle: title + features */}
        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '0.35rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <h3 style={{ fontSize: '0.98rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>{name}</h3>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleFavorite(_id || id);
              }}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: isFavorite ? '#f87171' : '#cbd5e1',
                display: 'flex',
                flexShrink: 0,
              }}
            >
              {isFavorite ? <FaHeart size={13} /> : <FiHeart size={13} />}
            </button>
          </div>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexWrap: 'wrap', gap: '0.25rem 0.9rem' }}>
            {features.slice(0, 3).map((feat, idx) => {
              const cleanText = String(feat).replace(/^[✓✔]\s*/, '');
              return (
                <li key={idx} style={{ fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.3rem', color: '#64748b', fontWeight: 500 }}>
                  <FiCheck size={12} style={{ color: '#16a34a', flexShrink: 0 }} />
                  <span>{cleanText}</span>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Right: price + actions */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            flexShrink: 0,
            flexWrap: 'wrap',
            justifyContent: 'flex-end',
          }}
          className="catalog-product-list-actions"
        >
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '1.1rem', fontWeight: 900, color: '#0f172a', whiteSpace: 'nowrap' }}>
              Rs. {monthlyPrice ? monthlyPrice.toLocaleString() : '0'}
              <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600 }}>{t('catalog.card.perMo', '/mo')}</span>
            </div>
            <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>
              {t('catalog.card.installation', 'Installation:')} Rs. {installationFee ? installationFee.toLocaleString() : '2,500'}
            </div>
          </div>

          <button
            onClick={() => onSelect(product)}
            style={{
              backgroundColor: '#f8fafc',
              color: '#0056b3',
              border: '1px solid #cbd5e1',
              borderRadius: '8px',
              padding: '0.5rem 0.85rem',
              fontWeight: 700,
              fontSize: '0.78rem',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
            }}
          >
            {t('catalog.card.details', 'Details')}
          </button>

          <AnimatedAddToCartButton
            product={product}
            isInCart={isInCart}
            disabled={disabled}
            disabledReason={disabledReason}
            onAddToCart={onAddToCart}
            onRemoveFromCart={onRemoveFromCart}
            t={t}
            style={{ padding: '0.5rem 0.9rem', fontSize: '0.8rem' }}
          />
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      whileHover={{ y: -7, boxShadow: '0 18px 40px rgba(0, 86, 179, 0.18)' }}
      transition={{ type: 'spring', stiffness: 350, damping: 25 }}
      style={{
        backgroundColor: '#ffffff',
        borderRadius: '16px',
        border: isSelected ? '2px solid #0056b3' : '1px solid #e2e8f0',
        overflow: 'hidden',
        boxShadow: isSelected ? '0 8px 25px rgba(0,86,179,0.2)' : '0 4px 15px rgba(0,0,0,0.04)',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
      }}
    >
      {/* Top Visual Showcase (Hero Image with Ambient Blurred Backdrop) */}
      <div
        style={{
          height: '165px',
          backgroundColor: '#0f172a',
          borderBottom: '1px solid #e2e8f0',
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
        }}
      >
        {/* Layer 1: Ambient Blurred Background */}
        {bannerUrl ? (
          <>
            <div
              style={{
                position: 'absolute',
                inset: '-20px',
                backgroundImage: `url(${bannerUrl})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                filter: 'blur(26px) saturate(2) brightness(0.7)',
                opacity: 0.65,
                transform: 'scale(1.3)',
                pointerEvents: 'none',
              }}
            />
            {/* Subtle Gradient Overlay for depth */}
            <div
              style={{
                position: 'absolute',
                inset: 0,
                background: 'linear-gradient(180deg, rgba(15, 23, 42, 0.1) 0%, rgba(15, 23, 42, 0.45) 100%)',
                pointerEvents: 'none',
              }}
            />
          </>
        ) : (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: cardGradient,
              opacity: 0.9,
            }}
          />
        )}

        {/* Floating Badges */}
        <div style={{ position: 'absolute', top: '0.75rem', left: '0.75rem', zIndex: 3 }}>
          {popular && (
            <span
              style={{
                backgroundColor: '#10b981',
                color: '#ffffff',
                fontSize: '0.62rem',
                fontWeight: 900,
                padding: '0.2rem 0.55rem',
                borderRadius: '9999px',
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)',
              }}
            >
              {t('catalog.card.popular', 'POPULAR')}
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite(_id || id);
          }}
          aria-label={
            isFavorite
              ? t('catalog.card.removeFavorite', 'Remove {{name}} from favourites', { name })
              : t('catalog.card.addFavorite', 'Add {{name}} to favourites', { name })
          }
          aria-pressed={!!isFavorite}
          style={{
            position: 'absolute',
            top: '0.75rem',
            right: '0.75rem',
            zIndex: 3,
            background: 'rgba(255, 255, 255, 0.85)',
            backdropFilter: 'blur(8px)',
            border: 'none',
            borderRadius: '50%',
            width: '30px',
            height: '30px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(0,0,0,0.18)',
            color: isFavorite ? '#ef4444' : '#64748b',
            transition: 'all 0.15s ease',
          }}
        >
          {isFavorite ? <FaHeart size={13} aria-hidden="true" /> : <FiHeart size={13} aria-hidden="true" />}
        </button>

        {/* Foreground Centered Sharp Graphic */}
        <div
          style={{
            position: 'relative',
            zIndex: 2,
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '0.85rem 1rem',
          }}
        >
          {bannerUrl ? (
            <img
              src={bannerUrl}
              alt={name}
              style={{
                maxHeight: '135px',
                maxWidth: '92%',
                objectFit: 'contain',
                borderRadius: '8px',
                filter: 'drop-shadow(0 8px 18px rgba(0,0,0,0.4))',
                transition: 'transform 0.25s ease',
              }}
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          ) : (
            <div style={{ width: '85px', height: '85px', filter: 'drop-shadow(0 6px 14px rgba(0,0,0,0.25))' }}>
              <ProductDeviceGraphic name={name} category={category} />
            </div>
          )}
        </div>
      </div>

      {/* Card Body */}
      <div style={{ padding: '1.15rem', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', backgroundColor: '#ffffff' }}>
        <div>
          {/* Category Chip */}
          <div style={{ fontSize: '0.68rem', fontWeight: 800, color: '#0056b3', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.35rem' }}>
            {category}
          </div>

          {/* Product Title */}
          <h3
            style={{
              fontSize: '1.05rem',
              fontWeight: 800,
              lineHeight: 1.3,
              color: '#0f172a',
              margin: '0 0 0.65rem 0',
            }}
          >
            {name}
          </h3>

          {/* Features List */}
          <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 1rem 0', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
            {features.slice(0, 3).map((feat, idx) => {
              const cleanText = String(feat).replace(/^[✓✔]\s*/, '');
              return (
                <li
                  key={idx}
                  style={{
                    fontSize: '0.76rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    color: '#475569',
                    fontWeight: 500,
                  }}
                >
                  <FiCheck size={13} style={{ color: '#16a34a', flexShrink: 0 }} />
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{cleanText}</span>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Pricing & Actions */}
        <div>
          <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '0.75rem', marginBottom: '0.65rem' }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.3rem', marginBottom: '0.2rem' }}>
              <span style={{ fontSize: '1.25rem', fontWeight: 900, color: '#0f172a' }}>
                Rs. {monthlyPrice ? monthlyPrice.toLocaleString() : '0'}
              </span>
              <span style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 600 }}>{t('catalog.card.perMonth', '/month')}</span>
            </div>
            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
              {t('catalog.card.installation', 'Installation:')} Rs. {installationFee ? installationFee.toLocaleString() : '2,500'}
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
            <AnimatedAddToCartButton
              product={product}
              isInCart={isInCart}
              disabled={disabled}
              disabledReason={disabledReason}
              onAddToCart={onAddToCart}
              onRemoveFromCart={onRemoveFromCart}
              t={t}
              fullWidth={true}
              style={{ padding: '0.55rem 0.75rem', fontSize: '0.82rem' }}
            />

            <button
              onClick={() => onSelect(product)}
              style={{
                width: '100%',
                backgroundColor: '#f8fafc',
                color: '#0056b3',
                border: '1px solid #cbd5e1',
                borderRadius: '8px',
                padding: '0.45rem 0.75rem',
                fontWeight: 700,
                fontSize: '0.78rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.35rem',
                transition: 'all 0.15s ease',
              }}
            >
              {t('catalog.card.viewDetails', 'View Details')}
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
