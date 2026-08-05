import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiTrash2, FiArrowLeft, FiShield, FiPlus, FiMinus } from 'react-icons/fi';
import { getCart, removeFromCart, addToCart } from '../services/productService';
import Toast from '../components/common/Toast';

export default function CartPage() {
  const navigate = useNavigate();

  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  const fetchCartData = async () => {
    setLoading(true);
    try {
      const res = await getCart();
      setCart(res.data || res.cart || res);
    } catch (err) {
      console.warn('Could not fetch backend cart, using fallback:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCartData();
  }, []);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const handleRemove = async (productId) => {
    try {
      await removeFromCart(productId);
      showToast('Item removed from cart', 'info');
      fetchCartData();
    } catch (err) {
      showToast('Item removed', 'info');
      if (cart && cart.items) {
        setCart({
          ...cart,
          items: cart.items.filter((i) => i.productId !== productId),
        });
      }
    }
  };

  const handleQuantityChange = async (item, delta) => {
    const newQty = item.quantity + delta;
    if (newQty < 1) return;
    try {
      await addToCart(item.productId, delta);
      fetchCartData();
    } catch (err) {
      // Local update
      if (cart && cart.items) {
        setCart({
          ...cart,
          items: cart.items.map((i) =>
            i.productId === item.productId ? { ...i, quantity: newQty } : i
          ),
        });
      }
    }
  };

  const items = cart?.items || [];
  const monthlyTotal = items.reduce((sum, item) => sum + (item.price || item.monthlyPrice || 0) * item.quantity, 0);
  const installationTotal = items.reduce((sum, item) => sum + (item.installationFee || 2500) * item.quantity, 0);
  const grandTotal = monthlyTotal + installationTotal;

  const handleProceedToBuy = () => {
    if (items.length === 0) {
      showToast('Your cart is empty. Please add a product first.', 'error');
      return;
    }
    // Navigate to OTP verification & New Connection Wizard
    navigate('/new-connection');
  };

  return (
    <div style={{ backgroundColor: '#f8fafc', minHeight: '100vh', padding: '2rem 0' }}>
      <Toast toast={toast} onClose={() => setToast(null)} />

      <div className="page-container">
        {/* Breadcrumbs */}
        <nav style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '1.5rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <Link to="/" style={{ color: '#64748b', textDecoration: 'none' }}>Home</Link>
          <span>›</span>
          <Link to="/new-connection/products" style={{ color: '#64748b', textDecoration: 'none' }}>Product Catalogue</Link>
          <span>›</span>
          <span style={{ color: '#0056b3', fontWeight: 600 }}>Shopping Cart</span>
        </nav>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
            Your Shopping Cart
          </h1>
          <Link
            to="/new-connection/products"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              color: '#0056b3',
              textDecoration: 'none',
              fontWeight: 600,
              fontSize: '0.9rem',
            }}
          >
            <FiArrowLeft size={16} /> Continue Browsing
          </Link>
        </div>

        {loading ? (
          <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', padding: '3rem', textAlign: 'center', color: '#64748b' }}>
            Loading your cart...
          </div>
        ) : items.length === 0 ? (
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '16px',
              padding: '4rem 2rem',
              textAlign: 'center',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
              border: '1px solid #f1f5f9',
            }}
          >
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#1e293b', marginBottom: '0.5rem' }}>
              Your cart is currently empty
            </h3>
            <p style={{ fontSize: '0.9rem', color: '#64748b', marginBottom: '1.5rem' }}>
              Explore our range of fiber broadband, LTE home, and PEO TV packages.
            </p>
            <Link
              to="/new-connection/products"
              style={{
                backgroundColor: '#0056b3',
                color: '#ffffff',
                padding: '0.75rem 1.75rem',
                borderRadius: '10px',
                textDecoration: 'none',
                fontWeight: 700,
                fontSize: '0.9rem',
                display: 'inline-block',
              }}
            >
              Browse Catalogue
            </Link>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '1.5rem' }}>
            {/* Cart Items List (8 cols) */}
            <div style={{ gridColumn: 'span 8', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {items.map((item, idx) => (
                <div
                  key={idx}
                  style={{
                    backgroundColor: '#ffffff',
                    borderRadius: '16px',
                    padding: '1.25rem',
                    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
                    border: '1px solid #e2e8f0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '1rem',
                  }}
                >
                  <div>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a', margin: '0 0 0.25rem 0' }}>
                      {item.productName || item.name || 'SLTMobitel Connection'}
                    </h3>
                    <div style={{ fontSize: '0.85rem', color: '#64748b' }}>
                      Monthly Charge: <strong style={{ color: '#0056b3' }}>Rs. {(item.price || item.monthlyPrice || 0).toLocaleString()}</strong>
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.15rem' }}>
                      Installation: Rs. {(item.installationFee || 2500).toLocaleString()}
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                    {/* Quantity Controls */}
                    <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #cbd5e1', borderRadius: '8px', overflow: 'hidden' }}>
                      <button
                        onClick={() => handleQuantityChange(item, -1)}
                        style={{ border: 'none', background: '#f8fafc', padding: '0.35rem 0.6rem', cursor: 'pointer' }}
                      >
                        <FiMinus size={12} />
                      </button>
                      <span style={{ padding: '0.35rem 0.75rem', fontSize: '0.875rem', fontWeight: 700 }}>
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => handleQuantityChange(item, 1)}
                        style={{ border: 'none', background: '#f8fafc', padding: '0.35rem 0.6rem', cursor: 'pointer' }}
                      >
                        <FiPlus size={12} />
                      </button>
                    </div>

                    <button
                      onClick={() => handleRemove(item.productId)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#ef4444',
                        cursor: 'pointer',
                        padding: '0.5rem',
                        display: 'flex',
                        alignItems: 'center',
                      }}
                      title="Remove item"
                    >
                      <FiTrash2 size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Summary Side Panel (4 cols) */}
            <div style={{ gridColumn: 'span 4' }}>
              <div
                style={{
                  backgroundColor: '#ffffff',
                  borderRadius: '16px',
                  padding: '1.5rem',
                  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.06)',
                  border: '1px solid #e2e8f0',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1.25rem',
                  position: 'sticky',
                  top: '1.5rem',
                }}
              >
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                  Order Summary
                </h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', fontSize: '0.9rem', color: '#475569' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Monthly Charges Total</span>
                    <strong style={{ color: '#0f172a' }}>Rs. {monthlyTotal.toLocaleString()}</strong>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>One-time Installation</span>
                    <strong style={{ color: '#0f172a' }}>Rs. {installationTotal.toLocaleString()}</strong>
                  </div>

                  <hr style={{ border: 'none', borderTop: '1px solid #f1f5f9', margin: '0.5rem 0' }} />

                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.1rem', color: '#0f172a', fontWeight: 800 }}>
                    <span>Total Initial Payable</span>
                    <span style={{ color: '#0056b3' }}>Rs. {grandTotal.toLocaleString()}</span>
                  </div>
                </div>

                <button
                  onClick={handleProceedToBuy}
                  style={{
                    backgroundColor: '#10b981',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '10px',
                    padding: '0.85rem',
                    fontSize: '0.95rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    width: '100%',
                    boxShadow: '0 4px 14px rgba(16, 185, 129, 0.3)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                  }}
                >
                  <FiShield size={18} />
                  Proceed to Buy (OTP Verification)
                </button>

                <p style={{ fontSize: '0.75rem', color: '#94a3b8', textAlign: 'center', margin: 0 }}>
                  Proceeding will send a 6-digit OTP code to verify your mobile connection before entering the EasyApply wizard.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
