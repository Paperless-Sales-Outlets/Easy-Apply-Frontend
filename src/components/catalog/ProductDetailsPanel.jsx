import React, { useState } from 'react';
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
} from 'react-icons/fi';
import { FaHeart } from 'react-icons/fa';

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

  if (!product) {
    return (
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          padding: '3rem 2rem',
          textAlign: 'center',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
          border: '1px solid #f1f5f9',
          color: '#64748b',
        }}
      >
        <p>Select a product to view detailed specifications.</p>
      </div>
    );
  }

  const {
    _id,
    id,
    name,
    speed = '300 Mbps',
    monthlyPrice = 6990,
    installationFee = 2500,
    description,
    features = [],
    popular = false,
  } = product;

  const productId = _id || id;

  const handleDecrease = () => {
    if (quantity > 1) setQuantity(quantity - 1);
  };

  const handleIncrease = () => {
    setQuantity(quantity + 1);
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20, scale: 0.98 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 20, scale: 0.98 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      style={{
        backgroundColor: '#ffffff',
        borderRadius: '16px',
        boxShadow: '0 4px 24px rgba(0, 0, 0, 0.08)',
        border: '1px solid #e2e8f0',
        padding: '1.5rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.5rem',
        width: '100%',
      }}
    >
      {/* Top Details Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
        {/* Left Visual Hero Box */}
        <div
          style={{
            background: 'linear-gradient(135deg, #0284c7 0%, #0056b3 100%)',
            borderRadius: '16px',
            padding: '1.25rem',
            color: '#ffffff',
            display: 'flex',
            flexDirection: 'column',
            justify: 'space-between',
            position: 'relative',
            minHeight: '320px',
          }}
        >
          {/* Top Bar inside Hero Visual */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            {popular ? (
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
            ) : <span />}

            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
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

              {onClose && (
                <button
                  onClick={onClose}
                  style={{
                    background: 'rgba(255, 255, 255, 0.25)',
                    border: 'none',
                    borderRadius: '50%',
                    width: '36px',
                    height: '36px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    color: '#ffffff',
                  }}
                  title="Close details"
                >
                  <FiX size={20} />
                </button>
              )}
            </div>
          </div>

          {/* Hero Banner Text & Graphic Representation */}
          <div style={{ margin: '1rem 0', textAlign: 'center' }}>
            <div style={{ fontSize: '2.5rem', fontWeight: 900, lineHeight: 1.1 }}>
              {speed || '300 Mbps'}
            </div>
            <div style={{ fontSize: '1.1rem', fontWeight: 600, opacity: 0.9 }}>
              {name}
            </div>
          </div>

          {/* Icon strip at bottom of hero box */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: '0.5rem',
              backgroundColor: 'rgba(255, 255, 255, 0.15)',
              backdropFilter: 'blur(8px)',
              borderRadius: '12px',
              padding: '0.65rem 0.4rem',
              textAlign: 'center',
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <FiActivity size={18} />
              <span style={{ fontSize: '0.65rem', marginTop: '0.25rem' }}>Ultra-Fast Speed</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <FiDatabase size={18} />
              <span style={{ fontSize: '0.65rem', marginTop: '0.25rem' }}>Unlimited Data</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <FiShield size={18} />
              <span style={{ fontSize: '0.65rem', marginTop: '0.25rem' }}>Free Installation</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <FiClock size={18} />
              <span style={{ fontSize: '0.65rem', marginTop: '0.25rem' }}>24/7 Support</span>
            </div>
          </div>
        </div>

        {/* Right Info Section */}
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.25rem' }}>
              {name}
            </h2>
            <p style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '1rem' }}>
              {description || 'Perfect for streaming, gaming and smart homes.'}
            </p>

            <div style={{ marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.4rem' }}>
                <span style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0056b3' }}>
                  Rs. {monthlyPrice.toLocaleString()}
                </span>
                <span style={{ fontSize: '0.9rem', color: '#64748b', fontWeight: 600 }}>/month</span>
              </div>
              <div style={{ fontSize: '0.825rem', color: '#64748b', marginTop: '0.15rem' }}>
                Installation Fee: Rs. {installationFee.toLocaleString()} (One-time)
              </div>
            </div>

            {/* Checklist */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.25rem' }}>
              {(features.length > 0
                ? features
                : [
                    '300 Mbps Download / Upload Speed',
                    'Unlimited Anytime Data',
                    'Free Standard Installation',
                    'Free Wi-Fi Router',
                    '24/7 Customer Support',
                  ]
              ).map((feat, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', color: '#334155' }}>
                  <FiCheck style={{ color: '#10b981', fontWeight: 'bold' }} />
                  <span>{feat}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Quantity Selector & Action Buttons */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#334155' }}>Quantity</span>
              <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #cbd5e1', borderRadius: '8px', overflow: 'hidden' }}>
                <button
                  onClick={handleDecrease}
                  style={{
                    border: 'none',
                    backgroundColor: '#f8fafc',
                    color: '#334155',
                    padding: '0.4rem 0.75rem',
                    cursor: 'pointer',
                  }}
                >
                  <FiMinus size={14} />
                </button>
                <span style={{ padding: '0.4rem 1rem', fontSize: '0.9rem', fontWeight: 700, color: '#0f172a' }}>
                  {quantity}
                </span>
                <button
                  onClick={handleIncrease}
                  style={{
                    border: 'none',
                    backgroundColor: '#f8fafc',
                    color: '#334155',
                    padding: '0.4rem 0.75rem',
                    cursor: 'pointer',
                  }}
                >
                  <FiPlus size={14} />
                </button>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button
                onClick={() => onAddToCart(product, quantity)}
                style={{
                  flex: 1,
                  padding: '0.75rem',
                  borderRadius: '10px',
                  border: 'none',
                  backgroundColor: '#0056b3',
                  color: '#ffffff',
                  fontSize: '0.9rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  boxShadow: '0 4px 14px rgba(0, 86, 179, 0.25)',
                }}
              >
                <FiShoppingCart size={16} />
                Add to Cart
              </button>

              <button
                onClick={() => onBuyNow(product, quantity)}
                style={{
                  flex: 1,
                  padding: '0.75rem',
                  borderRadius: '10px',
                  border: '1px solid #10b981',
                  backgroundColor: '#ecfdf5',
                  color: '#047857',
                  fontSize: '0.9rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                }}
              >
                <FiZap size={16} />
                Buy Now
              </button>
            </div>
          </div>
        </div>
      </div>

      <hr style={{ border: 'none', borderTop: '1px solid #f1f5f9', margin: 0 }} />

      {/* Tabbed Section */}
      <div>
        <div style={{ display: 'flex', borderBottom: '2px solid #e2e8f0', gap: '1.5rem', marginBottom: '1.25rem' }}>
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
                  fontWeight: isActive ? 700 : 500,
                  cursor: 'pointer',
                }}
              >
                {tab}
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        {activeTab === 'Overview' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <p style={{ fontSize: '0.9rem', color: '#475569', lineHeight: 1.6, margin: 0 }}>
              Experience ultra-fast internet with {name}. Ideal for families and professionals who need high speed and reliable connectivity for all their online activities.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '1rem' }}>
              <div style={{ backgroundColor: '#f8fafc', padding: '0.85rem', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <FiTv style={{ color: '#0056b3', fontSize: '1.4rem' }} />
                <div>
                  <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 600 }}>Best for</div>
                  <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#0f172a' }}>4K Streaming</div>
                </div>
              </div>

              <div style={{ backgroundColor: '#f8fafc', padding: '0.85rem', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <FiWifi style={{ color: '#0056b3', fontSize: '1.4rem' }} />
                <div>
                  <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 600 }}>Speed</div>
                  <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#0f172a' }}>{speed}</div>
                </div>
              </div>

              <div style={{ backgroundColor: '#f8fafc', padding: '0.85rem', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <FiSmartphone style={{ color: '#0056b3', fontSize: '1.4rem' }} />
                <div>
                  <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 600 }}>Devices</div>
                  <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#0f172a' }}>Up to 10+</div>
                </div>
              </div>

              <div style={{ backgroundColor: '#f8fafc', padding: '0.85rem', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <FiFileText style={{ color: '#0056b3', fontSize: '1.4rem' }} />
                <div>
                  <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 600 }}>Contract</div>
                  <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#0f172a' }}>12 Months</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'Speed & Usage' && (
          <div style={{ fontSize: '0.9rem', color: '#475569', lineHeight: 1.6 }}>
            <p><strong>Download Speed:</strong> Up to {speed}</p>
            <p><strong>Upload Speed:</strong> Symmetrical fibre speeds up to {speed}</p>
            <p><strong>Data Cap:</strong> Truly Unlimited Anytime Data with no fair usage policy restrictions.</p>
          </div>
        )}

        {activeTab === "What's Included" && (
          <div style={{ fontSize: '0.9rem', color: '#475569', lineHeight: 1.6 }}>
            <p>✓ High-performance Wi-Fi router router unit.</p>
            <p>✓ Standard fiber optical drop wire cable and indoor socket installation.</p>
            <p>✓ Complimentary activation and initial line configuration.</p>
          </div>
        )}

        {activeTab === 'Terms & Conditions' && (
          <div style={{ fontSize: '0.9rem', color: '#475569', lineHeight: 1.6 }}>
            <p>• Minimum contract period of 12 calendar months applies.</p>
            <p>• Government taxes and levies are included in displayed pricing.</p>
            <p>• Early termination fees apply if cancelled within contract period.</p>
          </div>
        )}
      </div>
    </motion.div>
  );
}
