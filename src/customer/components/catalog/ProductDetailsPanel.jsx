import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  FiHeart,
  FiShoppingCart,
  FiCheck,
  FiActivity,
  FiDatabase,
  FiShield,
  FiClock,
  FiTv,
  FiWifi,
  FiSmartphone,
  FiFileText,
  FiX,
  FiPhone,
  FiGlobe,
} from 'react-icons/fi';
import { FaHeart } from 'react-icons/fa';

// Matches ProductCard: four depths of the SLT identity by product family,
// so a product looks the same in the grid and on its detail panel.
const CATEGORY_HERO_GRADIENTS = {
  Broadband: 'var(--blue-800)',
  Fibre: 'var(--blue-800)',
  LTE: 'var(--blue-700)',
  Voice: '#00566b',
  'PEO TV': 'var(--blue-900)',
  PEOTV: 'var(--blue-900)',
};

const DEFAULT_HERO_GRADIENT = 'var(--blue-800)';

/** Side panel with the selected product's details. */
export default function ProductDetailsPanel({
  product,
  isFavorite,
  onToggleFavorite,
  onAddToCart,
  onClose,
}) {
  const [activeTab, setActiveTab] = useState('Overview');

  useEffect(() => {
    if (!product || !onClose) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [product, onClose]);

  if (!product) return null;

  const {
    _id,
    id,
    name: rawName,
    productName,
    monthlyPrice: rawMonthlyPrice,
    price,
    installationFee = 1500,
    description,
    features: rawFeatures = [],
    popular = false,
    category = 'Broadband',
    bannerUrl,
  } = product;

  const name = rawName || productName || 'SLTMobitel Connection';
  const monthlyPrice = rawMonthlyPrice !== undefined ? rawMonthlyPrice : (price !== undefined ? price : 6990);
  const features = Array.isArray(rawFeatures) && rawFeatures.length > 0
    ? rawFeatures
    : (description ? [description] : ['High-speed connectivity', '24/7 SLT Customer Support']);

  const productId = _id || id;
  const catLower = (category || name || '').toLowerCase();
  const heroGradient = CATEGORY_HERO_GRADIENTS[category] || DEFAULT_HERO_GRADIENT;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.72)',
        backdropFilter: 'blur(8px)',
        zIndex: 99999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.5rem',
      }}
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.92, y: 20 }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
        style={{
          backgroundColor: 'var(--paper)',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-xl)',
          border: '1px solid var(--grey-200)',
          padding: '2rem',
          maxWidth: '840px',
          width: '100%',
          maxHeight: '90vh',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.5rem',
          position: 'relative',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Details Header Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))', gap: '1.5rem' }}>
          {/* Left Visual Hero Box */}
          <div
            style={{
              background: heroGradient,
              borderRadius: 'var(--radius-lg)',
              padding: '1.5rem',
              color: 'var(--paper)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              position: 'relative',
              minHeight: '300px',
              boxShadow: 'var(--shadow-lg)',
            }}
          >
            {/* Top Bar inside Hero Visual */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                {popular && (
                  <span
                    style={{
                      backgroundColor: 'var(--green-700)',
                      color: 'var(--paper)',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      padding: '0.25rem 0.65rem',
                      borderRadius: '9999px',
                      textTransform: 'uppercase',
                    }}
                  >
                    POPULAR
                  </span>
                )}
                {/* Voice compulsory badge commented out
                catLower.includes('voice') && (
                  <span
                    style={{
                      backgroundColor: 'var(--blue-500)',
                      color: 'var(--paper)',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      padding: '0.25rem 0.65rem',
                      borderRadius: '9999px',
                    }}
                  >
                    COMPULSORY
                  </span>
                )
                */}
              </div>

              {onToggleFavorite && (
                <button
                  onClick={() => onToggleFavorite(productId)}
                  style={{
                    background: 'rgba(255, 255, 255, 0.2)',
                    border: 'none',
                    borderRadius: '50%',
                    width: '36px',
                    height: '36px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    color: isFavorite ? '#d92d20' : '#ffffff',
                  }}
                >
                  {isFavorite ? <FaHeart size={18} /> : <FiHeart size={18} />}
                </button>
              )}
            </div>

            {/* Hero Title & Graphics */}
            <div style={{ margin: '1.5rem 0', textAlign: 'center' }}>
              <div style={{ height: '70px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.4rem', fontWeight: 700, lineHeight: 1.1, letterSpacing: '-0.02em' }}>
                {bannerUrl ? (
                  <img
                    src={bannerUrl}
                    alt={name}
                    style={{ maxHeight: '100%', maxWidth: '140px', objectFit: 'contain', filter: 'drop-shadow(0 6px 12px rgba(0,0,0,0.3))' }}
                  />
                ) : (
                  catLower.includes('voice') ? <FiPhone size={44} /> : catLower.includes('peo') ? <FiTv size={44} /> : <FiGlobe size={44} />
                )}
              </div>
              <div style={{ fontSize: '1.4rem', fontWeight: 700, marginTop: '0.75rem' }}>
                {name}
              </div>
              <div style={{ fontSize: '0.85rem', opacity: 0.85, fontWeight: 600, marginTop: '0.25rem' }}>
                {category} Service
              </div>
            </div>

            {/* Icon strip at bottom of hero box */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: '0.35rem',
                backgroundColor: 'rgba(255, 255, 255, 0.18)',
                backdropFilter: 'blur(8px)',
                borderRadius: 'var(--radius-lg)',
                padding: '0.65rem 0.35rem',
                textAlign: 'center',
              }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <FiActivity size={16} />
                <span style={{ fontSize: '0.75rem', marginTop: '0.2rem', fontWeight: 700 }}>High Quality</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <FiDatabase size={16} />
                <span style={{ fontSize: '0.75rem', marginTop: '0.2rem', fontWeight: 700 }}>Unlimited</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <FiShield size={16} />
                <span style={{ fontSize: '0.75rem', marginTop: '0.2rem', fontWeight: 700 }}>SLT Verified</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <FiClock size={16} />
                <span style={{ fontSize: '0.75rem', marginTop: '0.2rem', fontWeight: 700 }}>24/7 Support</span>
              </div>
            </div>
          </div>

          {/* Right Info Section */}
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#131f33', margin: '0 0 0.25rem 0' }}>
                  {name}
                </h2>
                {onClose && (
                  <button
                    onClick={onClose}
                    style={{
                      background: 'var(--grey-100)',
                      border: 'none',
                      borderRadius: '50%',
                      width: '32px',
                      height: '32px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      color: 'var(--grey-600)',
                      flexShrink: 0,
                    }}
                  >
                    <FiX size={18} />
                  </button>
                )}
              </div>

              <p style={{ fontSize: '0.875rem', color: '#52627a', marginBottom: '1.25rem', fontWeight: 600 }}>
                {description || `Official SLTMobitel ${category} connection package with premium features and 24/7 support.`}
              </p>

              {/* Pricing Box */}
              <div style={{ backgroundColor: '#f6f8fb', padding: '1rem 1.25rem', borderRadius: 'var(--radius-lg)', marginBottom: '1.25rem', border: '1px solid #dfe5ee' }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.4rem' }}>
                  <span style={{ fontSize: '1.75rem', fontWeight: 700, color: '#0056a2' }}>
                    Rs. {monthlyPrice ? monthlyPrice.toLocaleString() : '0'}
                  </span>
                  <span style={{ fontSize: '0.9rem', color: '#52627a', fontWeight: 700 }}>/month</span>
                </div>
                <div style={{ fontSize: '0.8rem', color: '#52627a', marginTop: '0.2rem', fontWeight: 600 }}>
                  Installation Fee: Rs. {installationFee ? installationFee.toLocaleString() : '1,500'} (One-time)
                </div>
              </div>

              {/* Features Checklist */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', marginBottom: '1.25rem' }}>
                {(features.length > 0
                  ? features
                  : [
                      'High Quality Connection',
                      'Unlimited Anytime Usage',
                      'Free Standard Setup',
                      '24/7 SLT Customer Support',
                    ]
                ).map((feat, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.88rem', color: '#26344b', fontWeight: 700 }}>
                    <div style={{ backgroundColor: '#e2f4e3', color: '#0f7a4d', width: '20px', height: '20px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <FiCheck size={12} aria-hidden="true" />
                    </div>
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
              <button
                onClick={() => {
                  if (onAddToCart) onAddToCart(product, 1);
                  if (onClose) onClose();
                }}
                style={{
                  flex: 1,
                  padding: '0.85rem 1.25rem',
                  borderRadius: 'var(--radius-lg)',
                  border: 'none',
                  background: 'var(--brand-gradient-soft)',
                  color: 'var(--paper)',
                  fontSize: '0.92rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.55rem',
                  boxShadow: 'var(--shadow-md)',
                }}
              >
                <FiShoppingCart size={18} />
                <span>Add to Cart</span>
              </button>

              <button
                onClick={onClose}
                style={{
                  padding: '0.85rem 1.5rem',
                  borderRadius: 'var(--radius-lg)',
                  border: '1px solid var(--grey-300)',
                  backgroundColor: 'var(--paper)',
                  color: 'var(--grey-700)',
                  fontSize: '0.92rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>

        <hr style={{ border: 'none', borderTop: '1px solid #eef2f7', margin: 0 }} />

        {/* Tabbed Detailed Specifications */}
        <div>
          <div style={{ display: 'flex', borderBottom: '2px solid #dfe5ee', gap: '1.5rem', marginBottom: '1rem' }}>
            {['Overview', 'Speed & Usage', "What's Included", 'Terms & Conditions'].map((tab) => {
              const isActive = activeTab === tab;
              return (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  style={{
                    padding: '0.65rem 0',
                    border: 'none',
                    background: 'none',
                    borderBottom: isActive ? '3px solid #0056a2' : '3px solid transparent',
                    marginBottom: '-2px',
                    color: isActive ? '#0056a2' : '#52627a',
                    fontSize: '0.9rem',
                    fontWeight: isActive ? 800 : 600,
                    cursor: 'pointer',
                  }}
                >
                  {tab}
                </button>
              );
            })}
          </div>

          {/* Tab Contents */}
          {activeTab === 'Overview' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <p style={{ fontSize: '0.88rem', color: '#3b4a61', lineHeight: 1.6, margin: 0, fontWeight: 500 }}>
                Experience premium connection quality with {name}. Designed specifically for SLTMobitel customers requiring ultra-reliable service for home and enterprise applications.
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.85rem' }}>
                <div style={{ backgroundColor: '#f6f8fb', padding: '0.85rem', borderRadius: 'var(--radius-lg)', display: 'flex', alignItems: 'center', gap: '0.65rem', border: '1px solid #dfe5ee' }}>
                  <FiTv style={{ color: '#0056a2', fontSize: '1.3rem' }} />
                  <div>
                    <div style={{ fontSize: '0.75rem', color: '#52627a', fontWeight: 700 }}>Service Type</div>
                    <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#131f33' }}>{category}</div>
                  </div>
                </div>

                <div style={{ backgroundColor: '#f6f8fb', padding: '0.85rem', borderRadius: 'var(--radius-lg)', display: 'flex', alignItems: 'center', gap: '0.65rem', border: '1px solid #dfe5ee' }}>
                  <FiWifi style={{ color: '#0056a2', fontSize: '1.3rem' }} />
                  <div>
                    <div style={{ fontSize: '0.75rem', color: '#52627a', fontWeight: 700 }}>Quality</div>
                    <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#131f33' }}>Premium HD</div>
                  </div>
                </div>

                <div style={{ backgroundColor: '#f6f8fb', padding: '0.85rem', borderRadius: 'var(--radius-lg)', display: 'flex', alignItems: 'center', gap: '0.65rem', border: '1px solid #dfe5ee' }}>
                  <FiSmartphone style={{ color: '#0056a2', fontSize: '1.3rem' }} />
                  <div>
                    <div style={{ fontSize: '0.75rem', color: '#52627a', fontWeight: 700 }}>Activation</div>
                    <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#131f33' }}>24 - 48 Hours</div>
                  </div>
                </div>

                <div style={{ backgroundColor: '#f6f8fb', padding: '0.85rem', borderRadius: 'var(--radius-lg)', display: 'flex', alignItems: 'center', gap: '0.65rem', border: '1px solid #dfe5ee' }}>
                  <FiFileText style={{ color: '#0056a2', fontSize: '1.3rem' }} />
                  <div>
                    <div style={{ fontSize: '0.75rem', color: '#52627a', fontWeight: 700 }}>Contract</div>
                    <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#131f33' }}>12 Months</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'Speed & Usage' && (
            <div style={{ fontSize: '0.88rem', color: '#3b4a61', lineHeight: 1.7, fontWeight: 500 }}>
              <p style={{ margin: '0 0 0.4rem 0' }}><strong>Category:</strong> {category}</p>
              <p style={{ margin: '0 0 0.4rem 0' }}><strong>Usage Allowance:</strong> Truly Unlimited Anytime Data / Calls</p>
              <p style={{ margin: 0 }}><strong>Quality Standard:</strong> SLTMobitel High-Speed Optical / Voice Network</p>
            </div>
          )}

          {activeTab === "What's Included" && (
            <div style={{ fontSize: '0.88rem', color: '#3b4a61', lineHeight: 1.7, fontWeight: 500 }}>
              <p style={{ margin: '0 0 0.4rem 0' }}><FiCheck size={13} aria-hidden="true" style={{ verticalAlign: '-2px', marginRight: '0.3rem' }} />Official SLTMobitel line registration &amp; digital provisioning.</p>
              <p style={{ margin: '0 0 0.4rem 0' }}><FiCheck size={13} aria-hidden="true" style={{ verticalAlign: '-2px', marginRight: '0.3rem' }} />Standard wiring &amp; installation cable connection.</p>
              <p style={{ margin: 0 }}><FiCheck size={13} aria-hidden="true" style={{ verticalAlign: '-2px', marginRight: '0.3rem' }} />24/7 dedicated SLTMobitel customer helpline access.</p>
            </div>
          )}

          {activeTab === 'Terms & Conditions' && (
            <div style={{ fontSize: '0.88rem', color: '#3b4a61', lineHeight: 1.7, fontWeight: 500 }}>
              <p style={{ margin: '0 0 0.4rem 0' }}>• Minimum 12-month standard service agreement applies.</p>
              <p style={{ margin: '0 0 0.4rem 0' }}>• Displayed monthly charges are inclusive of government telecommunication levies.</p>
              <p style={{ margin: 0 }}>• Subject to technical feasibility & coverage check at delivery address.</p>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
