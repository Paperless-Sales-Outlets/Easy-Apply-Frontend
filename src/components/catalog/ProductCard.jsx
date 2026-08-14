import React from 'react';
import { motion } from 'framer-motion';
import { FiCheck, FiHeart, FiShoppingCart } from 'react-icons/fi';
import { FaHeart } from 'react-icons/fa';
import ProductDeviceGraphic from './ProductDeviceGraphic';

const CARD_GRADIENTS = {
  '500 Mbps Fibre Broadband': 'linear-gradient(135deg, #1d074d 0%, #120435 100%)',
  '300 Mbps Fibre Broadband': 'linear-gradient(135deg, #003e92 0%, #002256 100%)',
  '1 Gbps Fibre Broadband': 'linear-gradient(135deg, #013e28 0%, #002316 100%)',
  'LTE Home 150 GB': 'linear-gradient(135deg, #371866 0%, #1e0b3c 100%)',
  'LTE Home 300 GB': 'linear-gradient(135deg, #5c0717 0%, #34020b 100%)',
  'Fibre Voice Home': 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
  'Voice Unlimited': 'linear-gradient(135deg, #0d9488 0%, #0f766e 100%)',
  'Megaline Voice Basic': 'linear-gradient(135deg, #0284c7 0%, #075985 100%)',
  'Voice Business Prime': 'linear-gradient(135deg, #4338ca 0%, #3730a3 100%)',
  'PEO TV Gold Pack': 'linear-gradient(135deg, #b45309 0%, #78350f 100%)',
  'PEO TV Starter Pack': 'linear-gradient(135deg, #c026d3 0%, #86198f 100%)',
  'PEO TV Entertainment': 'linear-gradient(135deg, #d97706 0%, #92400e 100%)',
  'PEO TV Titanium': 'linear-gradient(135deg, #be123c 0%, #881337 100%)',
};

const DEFAULT_GRADIENT = 'linear-gradient(135deg, #0056b3 0%, #002b66 100%)';

export default function ProductCard({
  product,
  isSelected,
  isFavorite,
  isInCart = false,
  onSelect,
  onToggleFavorite,
  onAddToCart,
  disabled = false,
  disabledReason = 'Category Limit Reached',
}) {
  const {
    _id,
    id,
    name,
    monthlyPrice,
    installationFee = 2500,
    features = [],
    category = 'Broadband',
    popular = false,
  } = product;

  const cardGradient = CARD_GRADIENTS[name] || DEFAULT_GRADIENT;

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
      {/* Top Banner with Gradient */}
      <div
        style={{
          background: cardGradient,
          padding: '1.25rem 1.1rem 1rem 1.1rem',
          color: '#ffffff',
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          minHeight: '230px',
        }}
      >
        {/* Top Badges Row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem', zIndex: 2 }}>
          {popular ? (
            <span
              style={{
                backgroundColor: '#047857',
                color: '#ffffff',
                fontSize: '0.62rem',
                fontWeight: 900,
                padding: '0.2rem 0.55rem',
                borderRadius: '9999px',
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
              }}
            >
              POPULAR
            </span>
          ) : (
            <span />
          )}

          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite(_id || id);
            }}
            style={{
              background: 'rgba(255, 255, 255, 0.15)',
              border: 'none',
              borderRadius: '50%',
              width: '28px',
              height: '28px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: isFavorite ? '#f87171' : '#ffffff',
            }}
          >
            {isFavorite ? <FaHeart size={13} /> : <FiHeart size={13} />}
          </button>
        </div>

        {/* 3D Device Graphic Positioned Top Right */}
        <div
          style={{
            position: 'absolute',
            right: '0.75rem',
            top: '2.2rem',
            width: '80px',
            height: '80px',
            zIndex: 1,
          }}
        >
          <ProductDeviceGraphic name={name} category={category} />
        </div>

        {/* Product Title */}
        <div style={{ zIndex: 2, paddingRight: '75px', marginBottom: '0.75rem' }}>
          <h3
            style={{
              fontSize: '1.05rem',
              fontWeight: 800,
              lineHeight: 1.25,
              color: '#ffffff',
              margin: 0,
            }}
          >
            {name}
          </h3>
        </div>

        {/* Features List */}
        <div style={{ zIndex: 2 }}>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
            {features.slice(0, 3).map((feat, idx) => {
              const cleanText = String(feat).replace(/^[✓✔]\s*/, '');
              return (
                <li
                  key={idx}
                  style={{
                    fontSize: '0.74rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    color: 'rgba(255, 255, 255, 0.95)',
                    fontWeight: 500,
                  }}
                >
                  <FiCheck size={12} style={{ color: '#34d399', flexShrink: 0 }} />
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{cleanText}</span>
                </li>
              );
            })}
          </ul>
        </div>
      </div>

      {/* Bottom Card Body */}
      <div style={{ padding: '1.1rem', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', backgroundColor: '#ffffff' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.3rem', marginBottom: '0.2rem' }}>
            <span style={{ fontSize: '1.25rem', fontWeight: 900, color: '#0f172a' }}>
              Rs. {monthlyPrice ? monthlyPrice.toLocaleString() : '0'}
            </span>
            <span style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 600 }}>/month</span>
          </div>
          <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '0.5rem' }}>
            Installation: Rs. {installationFee ? installationFee.toLocaleString() : '2,500'}
          </div>
        </div>

        <div style={{ marginTop: '0.65rem', display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
          <button
            onClick={() => !disabled && !isInCart && onAddToCart(product)}
            disabled={disabled || isInCart}
            style={{
              width: '100%',
              backgroundColor: isInCart ? '#16a34a' : disabled ? '#e2e8f0' : '#0056b3',
              color: isInCart ? '#ffffff' : disabled ? '#475569' : '#ffffff',
              border: disabled ? '1px solid #cbd5e1' : 'none',
              borderRadius: '8px',
              padding: '0.55rem 0.75rem',
              fontWeight: 800,
              fontSize: '0.82rem',
              cursor: disabled || isInCart ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.45rem',
              boxShadow: disabled || isInCart ? 'none' : '0 3px 10px rgba(0,86,179,0.25)',
              transition: 'all 0.15s ease',
            }}
          >
            {isInCart ? <FiCheck size={16} /> : <FiShoppingCart size={15} />}
            <span>{isInCart ? 'In Cart ✓' : disabled ? disabledReason : 'Add to Cart'}</span>
          </button>

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
            View Details
          </button>
        </div>
      </div>
    </motion.div>
  );
}
