import api from '../utils/api';

// Generate or retrieve session ID for anonymous cart tracking
const getSessionId = () => {
  let sessionId = localStorage.getItem('slt_session_id');
  if (!sessionId) {
    sessionId = 'sess_' + Math.random().toString(36).substring(2, 11) + Date.now();
    localStorage.setItem('slt_session_id', sessionId);
  }
  return sessionId;
};

// Helper headers for cart calls
const getCartConfig = () => ({
  headers: {
    'x-session-id': getSessionId(),
  },
});

/**
 * Fetch all active products
 */
export const getProducts = async (params = {}) => {
  const response = await api.get('/products', { params });
  return response.data;
};

/**
 * Fetch a single product by ID
 */
export const getProductById = async (id) => {
  const response = await api.get(`/products/${id}`);
  return response.data;
};

/**
 * Filter products by category or options
 */
export const filterProducts = async (category) => {
  if (!category || category === 'All Products') {
    return getProducts();
  }
  const formattedCategory = encodeURIComponent(category);
  const response = await api.get(`/products/category/${formattedCategory}`);
  return response.data;
};

/**
 * Search products by keyword, category, speed, price
 */
export const searchProducts = async (searchParams = {}) => {
  const response = await api.get('/products/search', { params: searchParams });
  return response.data;
};

/**
 * Add an item to the shopping cart
 */
export const addToCart = async (productId, quantity = 1) => {
  const response = await api.post('/cart', { productId, quantity }, getCartConfig());
  return response.data;
};

/**
 * Get current user cart details
 */
export const getCart = async () => {
  const response = await api.get('/cart', getCartConfig());
  return response.data;
};

/**
 * Remove an item from the cart
 */
export const removeFromCart = async (productId) => {
  const response = await api.delete(`/cart/${productId}`, getCartConfig());
  return response.data;
};

export default {
  getProducts,
  getProductById,
  filterProducts,
  searchProducts,
  addToCart,
  getCart,
  removeFromCart,
};
