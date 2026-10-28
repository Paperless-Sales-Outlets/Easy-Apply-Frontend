import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiCheck,
  FiShoppingCart,
  FiPackage,
  FiArrowRight,
} from 'react-icons/fi';
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
      whileTap={{ scale: disabled ? 1 : 0.95 }}
      whileHover={{ scale: disabled ? 1 : 1.02 }}
      animate={{
        background: isSuccessState
          ? 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)'
          : disabled
            ? '#e2e8f0'
            : 'linear-gradient(135deg, #0056b3 0%, #0284c7 100%)',
        color: isSuccessState ? '#ffffff' : disabled ? '#64748b' : '#ffffff',
        boxShadow: disabled
          ? 'none'
          : isSuccessState
            ? '0 4px 14px rgba(22, 163, 74, 0.35)'
            : '0 4px 14px rgba(0, 86, 179, 0.25)',
      }}
      transition={{ duration: 0.25 }}
      style={{
        position: 'relative',
        overflow: 'hidden',
        width: fullWidth ? '100%' : 'auto',
        border: disabled ? '1px solid #cbd5e1' : 'none',
        borderRadius: '12px',
        padding: '0.62rem 1.1rem',
        fontWeight: 800,
        fontSize: '0.84rem',
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
              <FiCheck size={16} strokeWidth={3} />
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


  // Category Theme Colors & Hero Backdrop
  const categoryTheme = (() => {
    const lower = category.toLowerCase();
    if (lower.includes('peo') || lower.includes('tv')) {
      return {
        tagBg: '#faf5ff',
        tagColor: '#7c3aed',
        tagBorder: '#e9d5ff',
        heroBg: 'linear-gradient(135deg, #1e1135 0%, #2e1065 100%)',
      };
    }
    if (lower.includes('voice') || lower.includes('megaline')) {
      return {
        tagBg: '#f0fdf4',
        tagColor: '#16a34a',
        tagBorder: '#bbf7d0',
        heroBg: 'linear-gradient(135deg, #063828 0%, #064e3b 100%)',
      };
    }
    if (lower.includes('lte')) {
      return {
        tagBg: '#fff7ed',
        tagColor: '#ea580c',
        tagBorder: '#fed7aa',
        heroBg: 'linear-gradient(135deg, #2e1107 0%, #451a03 100%)',
      };
    }
    return {
      tagBg: '#eff6ff',
      tagColor: '#0056b3',
      tagBorder: '#bfdbfe',
      heroBg: 'linear-gradient(135deg, #0a1f3b 0%, #0f3260 100%)',
    };
  })();

  /* ─────────────────────────────────────────────────────────────
   * 1. LIST VIEW RENDERING
   * ───────────────────────────────────────────────────────────── */
  if (viewMode === 'list') {
    return (
      <motion.div
        whileHover={{ y: -3, boxShadow: '0 12px 30px rgba(0, 86, 179, 0.12)' }}
        transition={{ type: 'spring', stiffness: 350, damping: 25 }}
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '18px',
          border: isSelected ? '2px solid #0056b3' : '1px solid #e2e8f0',
          overflow: 'hidden',
          boxShadow: isSelected ? '0 8px 25px rgba(0,86,179,0.18)' : '0 2px 10px rgba(0,0,0,0.03)',
          display: 'flex',
          alignItems: 'stretch',
          gap: '1.25rem',
          padding: '1rem',
          position: 'relative',
        }}
        className="catalog-product-list-row"
      >
        {/* Left Visual Icon / Graphic Tile */}
        <div
          style={{
            background: categoryTheme.heroBg,
            borderRadius: '14px',
            width: '105px',
            minWidth: '105px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <div style={{ width: '65px', height: '65px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {bannerUrl ? (
              <img
                src={bannerUrl}
                alt={name}
                style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', filter: 'drop-shadow(0 6px 12px rgba(0,0,0,0.35))' }}
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
                top: '0.4rem',
                left: '0.4rem',
                backgroundColor: '#10b981',
                color: '#ffffff',
                fontSize: '0.55rem',
                fontWeight: 900,
                padding: '0.15rem 0.45rem',
                borderRadius: '9999px',
                letterSpacing: '0.04em',
              }}
            >
              POPULAR
            </span>
          )}
        </div>

        {/* Middle: Title */}
        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '0.35rem' }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>{name}</h3>

          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexWrap: 'wrap', gap: '0.25rem 1rem' }}>
            {features.slice(0, 3).map((feat, idx) => {
              const cleanText = String(feat).replace(/^[✓✔]\s*/, '');
              return (
                <li key={idx} style={{ fontSize: '0.76rem', display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#64748b', fontWeight: 500 }}>
                  <FiCheck size={13} style={{ color: '#16a34a', flexShrink: 0 }} />
                  <span>{cleanText}</span>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Right: Price & Quick Action Buttons */}
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
            <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#0f172a', whiteSpace: 'nowrap' }}>
              Rs. {monthlyPrice ? monthlyPrice.toLocaleString() : '0'}
              <span style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 600 }}>{t('catalog.card.perMo', '/mo')}</span>
            </div>
            <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
              {t('catalog.card.installation', 'Installation:')} Rs. {installationFee ? installationFee.toLocaleString() : '2,500'}
            </div>
          </div>

          <button
            onClick={() => onSelect(product)}
            style={{
              backgroundColor: '#f8fafc',
              color: '#0056b3',
              border: '1px solid #cbd5e1',
              borderRadius: '12px',
              padding: '0.55rem 0.95rem',
              fontWeight: 700,
              fontSize: '0.8rem',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              transition: 'all 0.15s ease',
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
            style={{ padding: '0.55rem 1rem', fontSize: '0.82rem' }}
          />
        </div>
      </motion.div>
    );
  }

  /* ─────────────────────────────────────────────────────────────
   * 2. GRID VIEW RENDERING (MODERN ELEVATED CARD)
   * ───────────────────────────────────────────────────────────── */
  return (
    <motion.div
      whileHover={{ y: -7, boxShadow: '0 20px 40px rgba(0, 86, 179, 0.15)' }}
      transition={{ type: 'spring', stiffness: 350, damping: 25 }}
      style={{
        backgroundColor: '#ffffff',
        borderRadius: '20px',
        border: isSelected ? '2px solid #0056b3' : '1px solid #e2e8f0',
        overflow: 'hidden',
        boxShadow: isSelected ? '0 8px 30px rgba(0,86,179,0.2)' : '0 4px 20px rgba(0,0,0,0.04)',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        position: 'relative',
      }}
    >
      {/* Top Visual Showcase (Hero Image with Ambient Blurred Backdrop) */}
      <div
        style={{
          height: '175px',
          background: categoryTheme.heroBg,
          borderBottom: '1px solid #f1f5f9',
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
                filter: 'blur(26px) saturate(2) brightness(0.65)',
                opacity: 0.65,
                transform: 'scale(1.3)',
                pointerEvents: 'none',
              }}
            />
            <div
              style={{
                position: 'absolute',
                inset: 0,
                background: 'linear-gradient(180deg, rgba(15, 23, 42, 0.1) 0%, rgba(15, 23, 42, 0.5) 100%)',
                pointerEvents: 'none',
              }}
            />
          </>
        ) : null}

        {/* Floating Top Badges */}
        <div style={{ position: 'absolute', top: '0.85rem', left: '0.85rem', zIndex: 3 }}>
          {popular && (
            <span
              style={{
                backgroundColor: '#10b981',
                color: '#ffffff',
                fontSize: '0.64rem',
                fontWeight: 900,
                padding: '0.22rem 0.6rem',
                borderRadius: '9999px',
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
                boxShadow: '0 3px 10px rgba(0, 0, 0, 0.25)',
              }}
            >
              {t('catalog.card.popular', 'POPULAR')}
            </span>
          )}
        </div>


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
            padding: '1rem',
          }}
        >
          {bannerUrl ? (
            <img
              src={bannerUrl}
              alt={name}
              style={{
                maxHeight: '140px',
                maxWidth: '90%',
                objectFit: 'contain',
                borderRadius: '8px',
                filter: 'drop-shadow(0 8px 20px rgba(0,0,0,0.45))',
                transition: 'transform 0.25s ease',
              }}
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          ) : (
            <div style={{ width: '90px', height: '90px', filter: 'drop-shadow(0 8px 18px rgba(0,0,0,0.3))' }}>
              <ProductDeviceGraphic name={name} category={category} />
            </div>
          )}
        </div>
      </div>

      {/* Card Body */}
      <div style={{ padding: '1.25rem', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', backgroundColor: '#ffffff' }}>
        <div>

          {/* Product Title */}
          <h3
            style={{
              fontSize: '1.08rem',
              fontWeight: 800,
              lineHeight: 1.35,
              color: '#0f172a',
              margin: '0 0 0.75rem 0',
            }}
          >
            {name}
          </h3>

          {/* Features List */}
          <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 1.15rem 0', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            {features.slice(0, 3).map((feat, idx) => {
              const cleanText = String(feat).replace(/^[✓✔]\s*/, '');
              return (
                <li
                  key={idx}
                  style={{
                    fontSize: '0.78rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.45rem',
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
          <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '0.85rem', marginBottom: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.35rem', marginBottom: '0.2rem' }}>
              <span style={{ fontSize: '1.35rem', fontWeight: 900, color: '#0f172a', letterSpacing: '-0.02em' }}>
                Rs. {monthlyPrice ? monthlyPrice.toLocaleString() : '0'}
              </span>
              <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>{t('catalog.card.perMonth', '/month')}</span>
            </div>
            <div style={{ fontSize: '0.74rem', color: '#64748b' }}>
              {t('catalog.card.installation', 'Installation:')} Rs. {installationFee ? installationFee.toLocaleString() : '2,500'}
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <AnimatedAddToCartButton
              product={product}
              isInCart={isInCart}
              disabled={disabled}
              disabledReason={disabledReason}
              onAddToCart={onAddToCart}
              onRemoveFromCart={onRemoveFromCart}
              t={t}
              fullWidth={true}
              style={{ padding: '0.65rem 0.85rem', fontSize: '0.84rem' }}
            />

            <button
              onClick={() => onSelect(product)}
              type="button"
              style={{
                width: '100%',
                backgroundColor: '#f8fafc',
                color: '#0056b3',
                border: '1px solid #cbd5e1',
                borderRadius: '12px',
                padding: '0.5rem 0.75rem',
                fontWeight: 700,
                fontSize: '0.8rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.35rem',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#eff6ff';
                e.currentTarget.style.borderColor = '#bfdbfe';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#f8fafc';
                e.currentTarget.style.borderColor = '#cbd5e1';
              }}
            >
              <span>{t('catalog.card.viewDetails', 'View Details')}</span>
              <FiArrowRight size={13} />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
