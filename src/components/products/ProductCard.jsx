import React from 'react';
import { useCart } from '../../context/useCart';
import Icon from '../Icon';

const ProductCard = ({ product }) => {
  const { addItemToCart, loading } = useCart();

  const handleAddToCart = () => {
    if (product.availableQuantity <= 0) return;
    addItemToCart(product.productId, 1);
  };

  const isOutOfStock = product.availableQuantity <= 0;

  return (
    <div
      style={{
        border: '1px solid #e2e8f0',
        borderRadius: '12px',
        overflow: 'hidden',
        backgroundColor: '#ffffff',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-4px)';
        e.currentTarget.style.boxShadow = '0 12px 24px rgba(0, 0, 0, 0.1)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      {/* Product Image */}
      <div
        style={{
          position: 'relative',
          paddingTop: '66.67%',
          backgroundColor: '#f8fafc',
          overflow: 'hidden',
        }}
      >
        {product.image ? (
          <img
            src={product.image}
            alt={product.productName}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            }}
          />
        ) : (
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#94a3b8',
            }}
          >
            <Icon name="package" size={48} />
          </div>
        )}
        {isOutOfStock && (
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              fontWeight: 600,
              fontSize: '1.1rem',
            }}
          >
            Out of Stock
          </div>
        )}
        {/* Category Badge */}
        <div
          style={{
            position: 'absolute',
            top: '12px',
            left: '12px',
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            padding: '4px 12px',
            borderRadius: '16px',
            fontSize: '0.75rem',
            fontWeight: 600,
            color: '#475569',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
          }}
        >
          {product.category}
        </div>
      </div>

      {/* Product Details */}
      <div style={{ padding: '1.25rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div style={{ flex: 1 }}>
          <h3
            style={{
              fontSize: '1rem',
              fontWeight: 600,
              color: '#1e293b',
              marginBottom: '0.5rem',
              lineHeight: '1.4',
            }}
          >
            {product.productName}
          </h3>
          <p
            style={{
              fontSize: '0.85rem',
              color: '#64748b',
              marginBottom: '0.75rem',
            }}
          >
            Code: {product.productCode}
          </p>
          {product.description && (
            <p
              style={{
                fontSize: '0.85rem',
                color: '#94a3b8',
                marginBottom: '1rem',
                lineHeight: '1.5',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
              }}
            >
              {product.description}
            </p>
          )}
        </div>

        {/* Price and Stock */}
        <div style={{ marginBottom: '1rem' }}>
          <div
            style={{
              fontSize: '1.25rem',
              fontWeight: 700,
              color: '#059669',
              marginBottom: '0.25rem',
            }}
          >
            LKR {Number(product.price).toLocaleString('en-LK', { minimumFractionDigits: 2 })}
          </div>
          <div
            style={{
              fontSize: '0.8rem',
              color: isOutOfStock ? '#dc2626' : '#64748b',
            }}
          >
            {isOutOfStock ? (
              <span style={{ color: '#dc2626', fontWeight: 500 }}>Not Available</span>
            ) : (
              <span>Available: {product.availableQuantity} units</span>
            )}
          </div>
        </div>

        {/* Add to Cart Button */}
        <button
          onClick={handleAddToCart}
          disabled={isOutOfStock || loading}
          style={{
            width: '100%',
            padding: '0.75rem 1rem',
            backgroundColor: isOutOfStock ? '#cbd5e1' : '#0056b3',
            color: '#ffffff',
            border: 'none',
            borderRadius: '8px',
            fontSize: '0.9rem',
            fontWeight: 600,
            cursor: isOutOfStock || loading ? 'not-allowed' : 'pointer',
            opacity: isOutOfStock || loading ? 0.6 : 1,
            transition: 'background-color 0.2s ease',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
          }}
          onMouseEnter={(e) => {
            if (!isOutOfStock && !loading) {
              e.currentTarget.style.backgroundColor = '#004494';
            }
          }}
          onMouseLeave={(e) => {
            if (!isOutOfStock && !loading) {
              e.currentTarget.style.backgroundColor = '#0056b3';
            }
          }}
        >
          {loading ? (
            <>
              <span
                style={{
                  width: '16px',
                  height: '16px',
                  border: '2px solid #ffffff',
                  borderTopColor: 'transparent',
                  borderRadius: '50%',
                  display: 'inline-block',
                  animation: 'spin 0.8s linear infinite',
                }}
              />
              <span>Adding...</span>
            </>
          ) : (
            <>
              <Icon name="shopping-cart" size={18} />
              <span>Add to Cart</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default ProductCard;
