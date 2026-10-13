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

  // Do not surface the floating button when already on the cart page or inside admin portal
  // Also hidden inside the application funnel itself, where it only competes with the Next button.
  const path = location.pathname;
  const isExcludedPage =
    path.startsWith('/cart') ||
    path.includes('/admin') ||
    path === '/new-connection' ||
    path.startsWith('/completion') ||
    path.startsWith('/schedule-installation') ||
    path.startsWith('/payment') ||
    path.startsWith('/add-to-cart');
  if (cartCount <= 0 || isExcludedPage) {
    return null;
  }

  return (
    <button
      type="button"
      onClick={() => navigate('/cart')}
      aria-label={`View cart, ${cartCount} item${cartCount === 1 ? '' : 's'}`}
      className="float-cart"
    >
      <FiShoppingCart size={20} aria-hidden="true" />
      <span>View cart &bull; {cartCount}</span>
    </button>
  );
}
