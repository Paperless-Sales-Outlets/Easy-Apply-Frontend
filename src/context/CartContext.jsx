import React, { useState, useEffect } from 'react';
import { getCart, addToCart, updateCartItem, removeCartItem, clearCart } from '../services/cartService';
import { AUTH_UPDATED_EVENT, isAuthenticated } from '../utils/authSession';
import { CartContext } from './useCart';

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [notification, setNotification] = useState(null);

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  // Drop the in-memory basket the moment the customer signs out. Clearing
  // storage alone isn't enough — this state would otherwise keep rendering the
  // previous customer's items until the page happened to reload.
  useEffect(() => {
    const onAuthChange = () => {
      if (!isAuthenticated()) {
        setCart(null);
        setError(null);
      }
    };
    window.addEventListener(AUTH_UPDATED_EVENT, onAuthChange);
    return () => window.removeEventListener(AUTH_UPDATED_EVENT, onAuthChange);
  }, []);

  const fetchCart = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getCart();
      setCart(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch cart');
    } finally {
      setLoading(false);
    }
  };

  const addItemToCart = async (productId, quantity = 1, customPackage = null) => {
    setLoading(true);
    setError(null);
    try {
      await addToCart({ productId, quantity, customPackage });
      await fetchCart();
      showNotification('Product added to cart successfully');
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to add item to cart';
      setError(errorMessage);
      showNotification(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  const updateItemQuantity = async (productId, quantity) => {
    setLoading(true);
    setError(null);
    try {
      await updateCartItem({ productId, quantity });
      await fetchCart();
      showNotification('Cart updated successfully');
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to update cart';
      setError(errorMessage);
      showNotification(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  const removeItem = async (itemId) => {
    setLoading(true);
    setError(null);
    try {
      await removeCartItem(itemId);
      await fetchCart();
      showNotification('Item removed from cart');
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to remove item';
      setError(errorMessage);
      showNotification(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  const clearCartItems = async () => {
    setLoading(true);
    setError(null);
    try {
      await clearCart();
      setCart(null);
      showNotification('Cart cleared successfully');
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to clear cart';
      setError(errorMessage);
      showNotification(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  const getCartItemCount = () => {
    if (!cart || !cart.items) return 0;
    return cart.items.reduce((total, item) => total + item.quantity, 0);
  };

  const getCartTotal = () => {
    if (!cart) return 0;
    return cart.totalAmount || 0;
  };

  useEffect(() => {
    // Skip the cart fetch on admin routes: the admin portal never uses cart
    // data, and this avoids pointless /api/cart calls (and console noise).
    // Match "/admin" anywhere in the path (works with the /Paperlessbackup/
    // base path) and also for hash-based URLs.
    const isAdminRoute =
      window.location.pathname.includes('/admin') ||
      window.location.hash.startsWith('#/admin');
    if (!isAdminRoute) {
      fetchCart();
    }
  }, []);

  const value = {
    cart,
    loading,
    error,
    notification,
    addItemToCart,
    updateItemQuantity,
    removeItem,
    clearCartItems,
    getCartItemCount,
    getCartTotal,
    fetchCart,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};
