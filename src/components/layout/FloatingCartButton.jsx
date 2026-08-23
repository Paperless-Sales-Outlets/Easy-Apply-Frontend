import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FiShoppingCart } from 'react-icons/fi';
import { getLocalCart } from '../../services/productService';

const countCartItems = () => {
  try {
    return getLocalCart().reduce((acc, item) => acc + (item.quantity || 1), 0);
  } catch (e) {
    return 0;
  }
};

// Uber-Eats-style floating "View cart" pill, pinned bottom-right — replaces
// the old navbar Cart link so it's visible from anywhere without competing
// for space in the top nav.
export default function FloatingCartButton() {
  const navigate = useNavigate();
  const location = useLocation();
  const [cartCount, setCartCount] = useState(countCartItems);

  useEffect(() => {
    const sync = () => setCartCount(countCartItems());
    sync();
    window.addEventListener('easyapply:cart-updated', sync);
    window.addEventListener('storage', sync);
    return () => {
      window.removeEventListener('easyapply:cart-updated', sync);
      window.removeEventListener('storage', sync);
    };
  }, []);

  // Only surface the floating button on the landing page, Help & Support,
  // and My Profile — everywhere else (wizards, cart, catalog, admin) it
  // would just be noise on top of a page that already has its own flow.
  const isAllowedPage = location.pathname === '/' || location.pathname.startsWith('/help') || location.pathname.startsWith('/profile');
  if (cartCount <= 0 || !isAllowedPage) {
    return null;
  }

  return (
    <button
      type="button"
      onClick={() => navigate('/cart')}
      aria-label={`View cart, ${cartCount} item${cartCount === 1 ? '' : 's'}`}
      style={{
        position: 'fixed',
        right: 'clamp(1rem, 4vw, 2rem)',
        bottom: 'clamp(1rem, 4vw, 2rem)',
        zIndex: 90,
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        backgroundColor: '#0f172a',
        color: '#ffffff',
        border: 'none',
        borderRadius: '9999px',
        padding: '1.15rem 2rem',
        fontSize: '1.1rem',
        fontWeight: 700,
        cursor: 'pointer',
        boxShadow: '0 14px 32px rgba(15, 23, 42, 0.35)',
      }}
    >
      <FiShoppingCart size={22} />
      <span>View cart &bull; {cartCount}</span>
    </button>
  );
}
