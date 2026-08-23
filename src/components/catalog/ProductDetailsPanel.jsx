import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  FiHeart,
  FiShoppingCart,
  FiZap,
  FiCheck,
  FiActivity,
  FiDatabase,
  FiShield,
  FiClock,
  FiMinus,
  FiPlus,
  FiTv,
  FiWifi,
  FiSmartphone,
  FiFileText,
  FiX,
  FiPhone,
  FiGlobe,
} from 'react-icons/fi';
import { FaHeart } from 'react-icons/fa';

const HERO_GRADIENTS = {
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

const DEFAULT_HERO_GRADIENT = 'linear-gradient(135deg, #0056b3 0%, #002b66 100%)';

export default function ProductDetailsPanel({
  product,
  isFavorite,
  onToggleFavorite,
  onAddToCart,
  onBuyNow,
  onClose,
}) {
  const [quantity, setQuantity] = useState(1);
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
    name,
    speed = '300 Mbps',
    monthlyPrice = 6990,
    installationFee = 1500,
    description,
    features = [],
    popular = false,
    category = 'Broadband',
  } = product;

  const productId = _id || id;
  const catLower = (category || name || '').toLowerCase();
  const heroGradient = HERO_GRADIENTS[name] || DEFAULT_HERO_GRADIENT;

  const handleDecrease = () => {
    if (quantity > 1) setQuantity(quantity - 1);
  };

  const handleIncrease = () => {
    setQuantity(quantity + 1);
  };

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
          backgroundColor: '#ffffff',
          borderRadius: '24px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)',
          border: '1px solid #e2e8f0',
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
              borderRadius: '20px',
              padding: '1.5rem',
              color: '#ffffff',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              position: 'relative',
              minHeight: '300px',
              boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
            }}
          >
            {/* Top Bar inside Hero Visual */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                {popular && (
                  <span
                    style={{
                      backgroundColor: '#10b981',
                      color: '#ffffff',
                      fontSize: '0.7rem',
                      fontWeight: 800,
                      padding: '0.25rem 0.65rem',
                      borderRadius: '9999px',
                      textTransform: 'uppercase',
                    }}
                  >
                    POPULAR
                  </span>
                )}
                {catLower.includes('voice') && (
                  <span
                    style={{
                      backgroundColor: '#0284c7',
                      color: '#ffffff',
                      fontSize: '0.7rem',
                      fontWeight: 800,
                      padding: '0.25rem 0.65rem',
                      borderRadius: '9999px',
                    }}
                  >
                    COMPULSORY
                  </span>
                )}
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
                    color: isFavorite ? '#ef4444' : '#ffffff',
                  }}
                >
                  {isFavorite ? <FaHeart size={18} /> : <FiHeart size={18} />}
                </button>
              )}
            </div>

            {/* Hero Title & Graphics */}
            <div style={{ margin: '1.5rem 0', textAlign: 'center' }}>
              <div style={{ fontSize: '2.4rem', fontWeight: 900, lineHeight: 1.1, letterSpacing: '-0.02em' }}>
                {catLower.includes('voice') ? <FiPhone size={44} /> : catLower.includes('peo') ? <FiTv size={44} /> : <FiGlobe size={44} />}
              </div>
              <div style={{ fontSize: '1.4rem', fontWeight: 900, marginTop: '0.75rem' }}>
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
                borderRadius: '12px',
                padding: '0.65rem 0.35rem',
                textAlign: 'center',
              }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <FiActivity size={16} />
                <span style={{ fontSize: '0.62rem', marginTop: '0.2rem', fontWeight: 700 }}>High Quality</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <FiDatabase size={16} />
                <span style={{ fontSize: '0.62rem', marginTop: '0.2rem', fontWeight: 700 }}>Unlimited</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <FiShield size={16} />
                <span style={{ fontSize: '0.62rem', marginTop: '0.2rem', fontWeight: 700 }}>SLT Verified</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <FiClock size={16} />
                <span style={{ fontSize: '0.62rem', marginTop: '0.2rem', fontWeight: 700 }}>24/7 Support</span>
              </div>
            </div>
          </div>

          {/* Right Info Section */}
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <h2 style={{ fontSize: '1.4rem', fontWeight: 900, color: '#0f172a', margin: '0 0 0.25rem 0' }}>
                  {name}
                </h2>
                {onClose && (
                  <button
                    onClick={onClose}
                    style={{
                      background: '#f1f5f9',
                      border: 'none',
                      borderRadius: '50%',
                      width: '32px',
                      height: '32px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      color: '#64748b',
                      flexShrink: 0,
                    }}
                  >
                    <FiX size={18} />
                  </button>
                )}
              </div>

              <p style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '1.25rem', fontWeight: 600 }}>
                {description || `Official SLTMobitel ${category} connection package with premium features and 24/7 support.`}
              </p>

              {/* Pricing Box */}
              <div style={{ backgroundColor: '#f8fafc', padding: '1rem 1.25rem', borderRadius: '12px', marginBottom: '1.25rem', border: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.4rem' }}>
                  <span style={{ fontSize: '1.75rem', fontWeight: 900, color: '#0056b3' }}>
                    Rs. {monthlyPrice ? monthlyPrice.toLocaleString() : '0'}
                  </span>
                  <span style={{ fontSize: '0.9rem', color: '#64748b', fontWeight: 700 }}>/month</span>
                </div>
                <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.2rem', fontWeight: 600 }}>
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
                  <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.88rem', color: '#1e293b', fontWeight: 700 }}>
                    <div style={{ backgroundColor: '#dcfce7', color: '#15803d', width: '20px', height: '20px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem' }}>
                      ✓
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
                  if (onAddToCart) onAddToCart(product, quantity);
                  if (onClose) onClose();
                }}
                style={{
                  flex: 1,
                  padding: '0.85rem 1.25rem',
                  borderRadius: '12px',
                  border: 'none',
                  background: 'linear-gradient(135deg, #0056b3 0%, #003b73 100%)',
                  color: '#ffffff',
                  fontSize: '0.92rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.55rem',
                  boxShadow: '0 4px 16px rgba(0, 86, 179, 0.3)',
                }}
              >
                <FiShoppingCart size={18} />
                <span>Add to Cart</span>
              </button>

              <button
                onClick={onClose}
                style={{
                  padding: '0.85rem 1.5rem',
                  borderRadius: '12px',
                  border: '1px solid #cbd5e1',
                  backgroundColor: '#ffffff',
                  color: '#475569',
                  fontSize: '0.92rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>

        <hr style={{ border: 'none', borderTop: '1px solid #f1f5f9', margin: 0 }} />

        {/* Tabbed Detailed Specifications */}
        <div>
          <div style={{ display: 'flex', borderBottom: '2px solid #e2e8f0', gap: '1.5rem', marginBottom: '1rem' }}>
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
                    borderBottom: isActive ? '3px solid #0056b3' : '3px solid transparent',
                    marginBottom: '-2px',
                    color: isActive ? '#0056b3' : '#64748b',
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
              <p style={{ fontSize: '0.88rem', color: '#475569', lineHeight: 1.6, margin: 0, fontWeight: 500 }}>
                Experience premium connection quality with {name}. Designed specifically for SLTMobitel customers requiring ultra-reliable service for home and enterprise applications.
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.85rem' }}>
                <div style={{ backgroundColor: '#f8fafc', padding: '0.85rem', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '0.65rem', border: '1px solid #e2e8f0' }}>
                  <FiTv style={{ color: '#0056b3', fontSize: '1.3rem' }} />
                  <div>
                    <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 700 }}>Service Type</div>
                    <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#0f172a' }}>{category}</div>
                  </div>
                </div>

                <div style={{ backgroundColor: '#f8fafc', padding: '0.85rem', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '0.65rem', border: '1px solid #e2e8f0' }}>
                  <FiWifi style={{ color: '#0056b3', fontSize: '1.3rem' }} />
                  <div>
                    <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 700 }}>Quality</div>
                    <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#0f172a' }}>Premium HD</div>
                  </div>
                </div>

                <div style={{ backgroundColor: '#f8fafc', padding: '0.85rem', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '0.65rem', border: '1px solid #e2e8f0' }}>
                  <FiSmartphone style={{ color: '#0056b3', fontSize: '1.3rem' }} />
                  <div>
                    <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 700 }}>Activation</div>
                    <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#0f172a' }}>24 - 48 Hours</div>
                  </div>
                </div>

                <div style={{ backgroundColor: '#f8fafc', padding: '0.85rem', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '0.65rem', border: '1px solid #e2e8f0' }}>
                  <FiFileText style={{ color: '#0056b3', fontSize: '1.3rem' }} />
                  <div>
                    <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 700 }}>Contract</div>
                    <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#0f172a' }}>12 Months</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'Speed & Usage' && (
            <div style={{ fontSize: '0.88rem', color: '#475569', lineHeight: 1.7, fontWeight: 500 }}>
              <p style={{ margin: '0 0 0.4rem 0' }}><strong>Category:</strong> {category}</p>
              <p style={{ margin: '0 0 0.4rem 0' }}><strong>Usage Allowance:</strong> Truly Unlimited Anytime Data / Calls</p>
              <p style={{ margin: 0 }}><strong>Quality Standard:</strong> SLTMobitel High-Speed Optical / Voice Network</p>
            </div>
          )}

          {activeTab === "What's Included" && (
            <div style={{ fontSize: '0.88rem', color: '#475569', lineHeight: 1.7, fontWeight: 500 }}>
              <p style={{ margin: '0 0 0.4rem 0' }}>✓ Official SLTMobitel line registration & digital provisioning.</p>
              <p style={{ margin: '0 0 0.4rem 0' }}>✓ Standard wiring & installation cable connection.</p>
              <p style={{ margin: 0 }}>✓ 24/7 dedicated SLTMobitel customer helpline access.</p>
            </div>
          )}

          {activeTab === 'Terms & Conditions' && (
            <div style={{ fontSize: '0.88rem', color: '#475569', lineHeight: 1.7, fontWeight: 500 }}>
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
