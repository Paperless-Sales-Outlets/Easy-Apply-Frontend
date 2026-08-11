import React from 'react';
import { FiHeart, FiShoppingCart, FiCheck } from 'react-icons/fi';
import { FaHeart } from 'react-icons/fa';
import ProductDeviceGraphic from './ProductDeviceGraphic';

const GRADIENTS = {
  '300 Mbps Fibre Broadband':  'linear-gradient(140deg, #0369a1 0%, #1e3a8a 100%)',
  '500 Mbps Fibre Broadband':  'linear-gradient(140deg, #4c1d95 0%, #1e1b4b 100%)',
  '1 Gbps Fibre Broadband':    'linear-gradient(140deg, #065f46 0%, #064e3b 100%)',
  'LTE Home 150 GB':           'linear-gradient(140deg, #9f1239 0%, #500724 100%)',
  'LTE Home 300 GB':           'linear-gradient(140deg, #0d6e6e 0%, #115e59 100%)',
  'PEO TV Starter Pack':       'linear-gradient(140deg, #c2410c 0%, #7c2d12 100%)',
  'Voice Home Phone':          'linear-gradient(140deg, #1d4ed8 0%, #1e3a8a 100%)',
  'Add-on Static IP':          'linear-gradient(140deg, #6d28d9 0%, #3b0764 100%)',
  default:                     'linear-gradient(140deg, #0284c7 0%, #0056b3 100%)',
};

export default function ProductCard({
  product,
  isSelected,
  isFavorite,
  onSelect,
  onToggleFavorite,
  onAddToCart,
}) {
  const {
    _id,
    id,
    name,
    category,
    monthlyPrice = 0,
    installationFee = 0,
    features = [],
    popular = false,
  } = product;

  const productId = _id || id;
  const gradient = GRADIENTS[name] || GRADIENTS.default;

  return (
    <div
      onClick={() => onSelect(product)}
      style={{
        backgroundColor: '#ffffff',
        borderRadius: '14px',
        overflow: 'hidden',
        boxShadow: isSelected
          ? '0 6px 24px rgba(0, 86, 179, 0.28)'
          : '0 2px 10px rgba(0, 0, 0, 0.08)',
        border: isSelected ? '2px solid #0056b3' : '1.5px solid #e8edf3',
        transition: 'transform 0.22s ease, box-shadow 0.22s ease',
        display: 'flex',
        flexDirection: 'column',
        cursor: 'pointer',
      }}
      onMouseEnter={e => {
        if (!isSelected) {
          e.currentTarget.style.transform = 'translateY(-4px)';
          e.currentTarget.style.boxShadow = '0 10px 30px rgba(0,0,0,0.14)';
        }
      }}
      onMouseLeave={e => {
        if (!isSelected) {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = '0 2px 10px rgba(0,0,0,0.08)';
        }
      }}
    >
      {/* ── Banner ── */}
      <div
        style={{
          background: gradient,
          padding: '0.85rem 0.85rem 0 0.85rem',
          height: '200px',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Subtle highlight blob */}
        <div style={{
          position: 'absolute', top: '-40px', left: '-20px',
          width: '130px', height: '130px', borderRadius: '50%',
          background: 'rgba(255,255,255,0.07)', pointerEvents: 'none',
        }} />

        {/* Row 1: Badge + Heart */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexShrink: 0,
          zIndex: 2,
        }}>
          {popular ? (
            <span style={{
              backgroundColor: '#10b981',
              color: '#fff',
              fontSize: '0.58rem',
              fontWeight: 800,
              letterSpacing: '0.07em',
              padding: '0.18rem 0.6rem',
              borderRadius: '9999px',
              textTransform: 'uppercase',
            }}>
              POPULAR
            </span>
          ) : <span />}

          <button
            onClick={e => { e.stopPropagation(); onToggleFavorite(productId); }}
            style={{
              background: 'rgba(255,255,255,0.2)',
              border: 'none',
              borderRadius: '50%',
              width: '30px',
              height: '30px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: isFavorite ? '#f87171' : '#fff',
              flexShrink: 0,
            }}
            aria-label="Favorite"
          >
            {isFavorite ? <FaHeart size={13} /> : <FiHeart size={13} />}
          </button>
        </div>

        {/* Row 2: Text left / Device right — fills remaining height */}
        <div style={{
          display: 'flex',
          flex: 1,
          alignItems: 'flex-end',
          zIndex: 2,
          overflow: 'hidden',
        }}>
          {/* Left: Title + Features */}
          <div style={{
            flex: '1 1 0',
            minWidth: 0,
            paddingBottom: '0.65rem',
            paddingRight: '0.35rem',
          }}>
            <h3 style={{
              fontSize: '0.98rem',
              fontWeight: 800,
              lineHeight: 1.25,
              color: '#fff',
              marginBottom: '0.45rem',
              wordBreak: 'break-word',
            }}>
              {name}
            </h3>
            <ul style={{
              listStyle: 'none', padding: 0, margin: 0,
              display: 'flex', flexDirection: 'column', gap: '0.22rem',
            }}>
              {features.slice(0, 4).map((feat, idx) => (
                <li key={idx} style={{
                  fontSize: '0.7rem',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '0.28rem',
                  color: 'rgba(255,255,255,0.92)',
                  lineHeight: 1.3,
                }}>
                  <FiCheck size={10} style={{ flexShrink: 0, marginTop: '1px', strokeWidth: 3 }} />
                  <span style={{ overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical' }}>
                    {feat}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Right: Device Graphic — fixed width, flush bottom */}
          <div style={{
            flexShrink: 0,
            width: '110px',
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'center',
            alignSelf: 'flex-end',
            overflow: 'hidden',
          }}>
            <ProductDeviceGraphic name={name} category={category} />
          </div>
        </div>
      </div>

      {/* ── Pricing & Buttons ── */}
      <div style={{
        padding: '0.85rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.75rem',
        flex: 1,
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.2rem', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a' }}>
              Rs. {monthlyPrice.toLocaleString()}
            </span>
            <span style={{ fontSize: '0.73rem', color: '#64748b', fontWeight: 500 }}>/month</span>
          </div>
          <div style={{ fontSize: '0.73rem', color: '#94a3b8', marginTop: '0.1rem' }}>
            Installation: {installationFee === 0 ? 'Free' : `Rs. ${installationFee.toLocaleString()}`}
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.45rem' }}>
          <button
            onClick={e => { e.stopPropagation(); onSelect(product); }}
            style={{
              flex: 1,
              padding: '0.52rem 0.3rem',
              borderRadius: '7px',
              border: '1.5px solid #0056b3',
              backgroundColor: 'transparent',
              color: '#0056b3',
              fontSize: '0.75rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'background 0.18s',
              whiteSpace: 'nowrap',
            }}
            onMouseEnter={e => e.currentTarget.style.backgroundColor = '#eff6ff'}
            onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            View Details
          </button>

          <button
            onClick={e => { e.stopPropagation(); onAddToCart(product); }}
            style={{
              flex: 1,
              padding: '0.52rem 0.3rem',
              borderRadius: '7px',
              border: 'none',
              backgroundColor: '#0056b3',
              color: '#fff',
              fontSize: '0.75rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.3rem',
              boxShadow: '0 3px 8px rgba(0,86,179,0.25)',
              transition: 'background 0.18s',
              whiteSpace: 'nowrap',
            }}
            onMouseEnter={e => e.currentTarget.style.backgroundColor = '#004494'}
            onMouseLeave={e => e.currentTarget.style.backgroundColor = '#0056b3'}
          >
            <FiShoppingCart size={12} strokeWidth={2.5} />
            <span>Add to Cart</span>
          </button>
        </div>
      </div>
    </div>
  );
}
