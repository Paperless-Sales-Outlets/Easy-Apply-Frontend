import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import CartItem from './CartItem';
import PayHereButton from '../PayHereButton';
import Icon from '../Icon';

const Cart = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const { cart, loading, updateItemQuantity, removeItem, clearCartItems, getCartItemCount, getCartTotal } = useCart();
  const [showPayHere, setShowPayHere] = useState(false);

  if (!isOpen) return null;

  const handleClearCart = () => {
    if (window.confirm('Are you sure you want to clear all items from your cart?')) {
      clearCartItems();
    }
  };

  const handleCheckout = () => {
    if (!totalAmount || totalAmount <= 0) {
      alert('Your cart is empty or the total is Rs. 0. Please add items before checkout.');
      return;
    }

    const hasVoicePackage = cartItems.some((item) => {
      const p = item.product || item;
      const cat = (p.category || p.name || '').toLowerCase();
      return cat.includes('voice');
    });

    if (!hasVoicePackage) {
      alert('⚠️ Voice Package Required (Compulsory):\n\nAll SLTMobitel bundles require at least 1 Voice package.\nAllowed combinations:\n• Voice Only\n• Voice + Broadband\n• Voice + Broadband + PEO TV\n\nPlease add 1 Voice package to your cart to proceed with checkout.');
      return;
    }

    setShowPayHere(true);
  };

  const handlePaymentSuccess = (orderId) => {
    setShowPayHere(false);
    clearCartItems();
    onClose();
    navigate('/thank-you', {
      state: {
        orderId,
        amount: getCartTotal(),
        serviceName: 'Cart Purchase',
      },
    });
  };

  const handlePaymentCancel = () => {
    setShowPayHere(false);
  };

  const handlePaymentError = (error) => {
    setShowPayHere(false);
    console.error('Payment error:', error);
    const message =
      error?.response?.data?.message ||
      error?.message ||
      'Payment failed. Please try again.';
    alert(`Payment Error: ${message}`);
  };

  const cartItems = cart?.items || [];
  const itemCount = getCartItemCount();
  const totalAmount = getCartTotal();

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        zIndex: 1000,
        display: 'flex',
        justifyContent: 'flex-end',
        animation: 'fadeIn 0.2s ease',
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '450px',
          backgroundColor: '#ffffff',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          animation: 'slideIn 0.3s ease',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: '1.5rem',
            borderBottom: '1px solid #e2e8f0',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            backgroundColor: '#f8fafc',
          }}
        >
          <div>
            <h2
              style={{
                fontSize: '1.25rem',
                fontWeight: 700,
                color: '#1e293b',
                margin: 0,
              }}
            >
              Shopping Cart
            </h2>
            <p
              style={{
                fontSize: '0.85rem',
                color: '#64748b',
                margin: '0.25rem 0 0 0',
              }}
            >
              {itemCount} {itemCount === 1 ? 'item' : 'items'}
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '0.5rem',
              borderRadius: '8px',
              color: '#64748b',
              transition: 'background-color 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#e2e8f0';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            <Icon name="x" size={24} />
          </button>
        </div>

        {/* Cart Items */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '1rem',
          }}
        >
          {loading ? (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100%',
                color: '#64748b',
              }}
            >
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  border: '3px solid #e2e8f0',
                  borderTopColor: '#0056b3',
                  borderRadius: '50%',
                  animation: 'spin 0.8s linear infinite',
                  marginBottom: '1rem',
                }}
              />
              <p>Loading cart...</p>
            </div>
          ) : cartItems.length === 0 ? (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100%',
                color: '#64748b',
                textAlign: 'center',
                padding: '2rem',
              }}
            >
              <Icon name="shopping-cart" size={64} color="#cbd5e1" />
              <h3
                style={{
                  fontSize: '1.1rem',
                  fontWeight: 600,
                  color: '#475569',
                  marginTop: '1rem',
                  marginBottom: '0.5rem',
                }}
              >
                Your cart is empty
              </h3>
              <p style={{ fontSize: '0.9rem', color: '#94a3b8' }}>
                Add some products to get started
              </p>
            </div>
          ) : (
            cartItems.map((item) => (
              <CartItem
                key={item._id || item.productId}
                item={item}
                onUpdateQuantity={updateItemQuantity}
                onRemove={removeItem}
                availableQuantity={item.availableQuantity || 999}
              />
            ))
          )}
        </div>

        {/* Footer */}
        {cartItems.length > 0 && (
          <div
            style={{
              padding: '1.5rem',
              borderTop: '1px solid #e2e8f0',
              backgroundColor: '#f8fafc',
            }}
          >
            {/* Summary */}
            <div style={{ marginBottom: '1rem' }}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginBottom: '0.5rem',
                  fontSize: '0.9rem',
                  color: '#64748b',
                }}
              >
                <span>Subtotal</span>
                <span>LKR {totalAmount.toLocaleString('en-LK', { minimumFractionDigits: 2 })}</span>
              </div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: '1.1rem',
                  fontWeight: 700,
                  color: '#1e293b',
                }}
              >
                <span>Total</span>
                <span style={{ color: '#059669' }}>
                  LKR {totalAmount.toLocaleString('en-LK', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button
                onClick={handleClearCart}
                disabled={loading}
                style={{
                  flex: 1,
                  padding: '0.85rem 1rem',
                  backgroundColor: '#ffffff',
                  color: '#dc2626',
                  border: '1px solid #dc2626',
                  borderRadius: '8px',
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  cursor: loading ? 'not-allowed' : 'pointer',
                  opacity: loading ? 0.6 : 1,
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  if (!loading) {
                    e.currentTarget.style.backgroundColor = '#fef2f2';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!loading) {
                    e.currentTarget.style.backgroundColor = '#ffffff';
                  }
                }}
              >
                Clear Cart
              </button>
              <button
                onClick={handleCheckout}
                disabled={loading || itemCount === 0}
                style={{
                  flex: 2,
                  padding: '0.85rem 1rem',
                  backgroundColor: '#0056b3',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  cursor: loading || itemCount === 0 ? 'not-allowed' : 'pointer',
                  opacity: loading || itemCount === 0 ? 0.6 : 1,
                  transition: 'background-color 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  if (!loading && itemCount > 0) {
                    e.currentTarget.style.backgroundColor = '#004494';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!loading && itemCount > 0) {
                    e.currentTarget.style.backgroundColor = '#0056b3';
                  }
                }}
              >
                {loading ? 'Processing...' : 'Proceed to Checkout'}
              </button>
            </div>
          </div>
        )}

        {/* PayHere Payment Modal */}
        {showPayHere && (
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.7)',
              zIndex: 2000,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <div
              style={{
                backgroundColor: '#ffffff',
                borderRadius: '12px',
                padding: '2rem',
                maxWidth: '500px',
                width: '90%',
                position: 'relative',
              }}
            >
              <button
                onClick={() => setShowPayHere(false)}
                style={{
                  position: 'absolute',
                  top: '1rem',
                  right: '1rem',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '1.5rem',
                  color: '#64748b',
                }}
              >
                ×
              </button>
              
              <h3 style={{ marginBottom: '1rem', color: '#1e293b' }}>
                Complete Your Payment
              </h3>
              
              <div style={{ marginBottom: '1.5rem' }}>
                <p style={{ color: '#64748b', marginBottom: '0.5rem' }}>
                  Total Amount:
                </p>
                <p style={{ fontSize: '1.5rem', fontWeight: 700, color: '#059669' }}>
                  LKR {totalAmount.toLocaleString('en-LK', { minimumFractionDigits: 2 })}
                </p>
              </div>

              <PayHereButton
                amount={totalAmount}
                currency="LKR"
                orderId={`CART-${Date.now()}`}
                itemTitle="Cart Purchase"
                customerDetails={{
                  phone: '',
                }}
                buttonText="Pay with PayHere"
                onSuccess={handlePaymentSuccess}
                onCancel={handlePaymentCancel}
                onError={handlePaymentError}
                sandbox={true}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;
