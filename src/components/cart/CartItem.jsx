import React from 'react';
import Icon from '../Icon';

const CartItem = ({ item, onUpdateQuantity, onRemove, availableQuantity }) => {
  const handleIncrease = () => {
    if (item.quantity < availableQuantity) {
      onUpdateQuantity(item.productId, item.quantity + 1);
    }
  };

  const handleDecrease = () => {
    if (item.quantity > 1) {
      onUpdateQuantity(item.productId, item.quantity - 1);
    }
  };

  const canIncrease = item.quantity < availableQuantity;
  const canDecrease = item.quantity > 1;

  return (
    <div
      style={{
        display: 'flex',
        gap: '1rem',
        padding: '1rem',
        backgroundColor: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: '8px',
        marginBottom: '0.75rem',
        transition: 'box-shadow 0.2s ease',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.05)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      {/* Product Image */}
      <div
        style={{
          width: '80px',
          height: '80px',
          backgroundColor: '#f8fafc',
          borderRadius: '6px',
          overflow: 'hidden',
          flexShrink: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Icon name="package" size={32} color="#94a3b8" />
      </div>

      {/* Product Details */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <h4
          style={{
            fontSize: '0.95rem',
            fontWeight: 600,
            color: '#1e293b',
            marginBottom: '0.25rem',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {item.productName}
        </h4>
        <p
          style={{
            fontSize: '0.85rem',
            color: '#64748b',
            marginBottom: '0.5rem',
          }}
        >
          LKR {Number(item.price).toLocaleString('en-LK', { minimumFractionDigits: 2 })}
        </p>

        {/* Quantity Controls */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          <button
            onClick={handleDecrease}
            disabled={!canDecrease}
            style={{
              width: '28px',
              height: '28px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid #e2e8f0',
              backgroundColor: canDecrease ? '#ffffff' : '#f1f5f9',
              borderRadius: '4px',
              cursor: canDecrease ? 'pointer' : 'not-allowed',
              color: canDecrease ? '#475569' : '#94a3b8',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              if (canDecrease) {
                e.currentTarget.style.backgroundColor = '#f8fafc';
                e.currentTarget.style.borderColor = '#0056b3';
              }
            }}
            onMouseLeave={(e) => {
              if (canDecrease) {
                e.currentTarget.style.backgroundColor = '#ffffff';
                e.currentTarget.style.borderColor = '#e2e8f0';
              }
            }}
          >
            <Icon name="minus" size={14} />
          </button>
          <span
            style={{
              minWidth: '40px',
              textAlign: 'center',
              fontSize: '0.9rem',
              fontWeight: 600,
              color: '#1e293b',
            }}
          >
            {item.quantity}
          </span>
          <button
            onClick={handleIncrease}
            disabled={!canIncrease}
            style={{
              width: '28px',
              height: '28px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid #e2e8f0',
              backgroundColor: canIncrease ? '#ffffff' : '#f1f5f9',
              borderRadius: '4px',
              cursor: canIncrease ? 'pointer' : 'not-allowed',
              color: canIncrease ? '#475569' : '#94a3b8',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              if (canIncrease) {
                e.currentTarget.style.backgroundColor = '#f8fafc';
                e.currentTarget.style.borderColor = '#0056b3';
              }
            }}
            onMouseLeave={(e) => {
              if (canIncrease) {
                e.currentTarget.style.backgroundColor = '#ffffff';
                e.currentTarget.style.borderColor = '#e2e8f0';
              }
            }}
          >
            <Icon name="plus" size={14} />
          </button>
          {!canIncrease && (
            <span
              style={{
                fontSize: '0.75rem',
                color: '#dc2626',
                marginLeft: '0.5rem',
              }}
            >
              Max stock reached
            </span>
          )}
        </div>
      </div>

      {/* Subtotal and Remove */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-end',
          justifyContent: 'space-between',
        }}
      >
        <div
          style={{
            fontSize: '1rem',
            fontWeight: 700,
            color: '#059669',
          }}
        >
          LKR {Number(item.subtotal).toLocaleString('en-LK', { minimumFractionDigits: 2 })}
        </div>
        <button
          onClick={() => onRemove(item._id || item.productId)}
          style={{
            background: 'none',
            border: 'none',
            color: '#dc2626',
            cursor: 'pointer',
            padding: '0.25rem',
            borderRadius: '4px',
            transition: 'background-color 0.2s ease',
            display: 'flex',
            alignItems: 'center',
            gap: '0.25rem',
            fontSize: '0.85rem',
            fontWeight: 500,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#fef2f2';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
          }}
        >
          <Icon name="trash-2" size={16} />
          Remove
        </button>
      </div>
    </div>
  );
};

export default CartItem;
