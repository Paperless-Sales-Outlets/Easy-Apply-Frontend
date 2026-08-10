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

// Helper to get local cart array
export const getLocalCart = () => {
  try {
    const raw = localStorage.getItem('easy_apply_cart');
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
};

// Helper to save local cart array
export const saveLocalCart = (items) => {
  try {
    localStorage.setItem('easy_apply_cart', JSON.stringify(items));
  } catch (e) {}
};

/**
 * Add an item to the shopping cart (Product object or Product ID)
 */
export const addToCart = async (productOrId, quantity = 1) => {
  const prodObj = typeof productOrId === 'object' && productOrId !== null ? productOrId : { _id: productOrId, id: productOrId };
  const productId = prodObj._id || prodObj.id || productOrId;

  // Local cart sync
  const currentItems = getLocalCart();
  const existingIdx = currentItems.findIndex(i => (i.productId || i._id || i.id) === productId);

  let updatedItems = [...currentItems];
  if (existingIdx > -1) {
    updatedItems[existingIdx] = {
      ...updatedItems[existingIdx],
      quantity: updatedItems[existingIdx].quantity + quantity,
    };
  } else {
    updatedItems.push({
      productId,
      _id: productId,
      id: productId,
      productName: prodObj.name || prodObj.productName || 'SLTMobitel Connection',
      name: prodObj.name || prodObj.productName || 'SLTMobitel Connection',
      monthlyPrice: prodObj.monthlyPrice || prodObj.price || 6990,
      price: prodObj.monthlyPrice || prodObj.price || 6990,
      installationFee: prodObj.installationFee !== undefined ? prodObj.installationFee : 2500,
      speed: prodObj.speed || '300 Mbps',
      category: prodObj.category || 'Fibre Broadband',
      popular: !!prodObj.popular,
      quantity,
      features: prodObj.features || [
        '300 Mbps Download / Upload Speed',
        'Unlimited Anytime Data',
        'Free Standard Installation',
        'Free Wi-Fi Router',
        '24/7 Customer Support',
      ],
    });
  }
  saveLocalCart(updatedItems);

  // Try API call
  try {
    const response = await api.post('/cart', { productId, quantity }, getCartConfig());
    return response.data;
  } catch (err) {
    console.warn('Backend cart endpoint error, fallback to local cart:', err.message);
    return { success: true, data: { items: updatedItems } };
  }
};

/**
 * Get current user cart details
 */
export const getCart = async () => {
  try {
    const response = await api.get('/cart', getCartConfig());
    const cartRes = response.data?.data || response.data?.cart || response.data || {};
    const apiItems = cartRes.items || [];
    
    if (apiItems.length > 0) {
      saveLocalCart(apiItems);
      return response.data;
    }
  } catch (err) {
    console.warn('Backend getCart failed, using local cart fallback:', err.message);
  }

  const localItems = getLocalCart();
  return {
    success: true,
    data: {
      items: localItems,
    },
    cart: {
      items: localItems,
    },
  };
};

/**
 * Remove an item from the cart
 */
export const removeFromCart = async (productId) => {
  const localItems = getLocalCart().filter(i => (i.productId || i._id || i.id) !== productId);
  saveLocalCart(localItems);

  try {
    const response = await api.delete(`/cart/${productId}`, getCartConfig());
    return response.data;
  } catch (err) {
    return { success: true, data: { items: localItems } };
  }
};

/**
 * Clear the shopping cart
 */
export const clearCart = async () => {
  saveLocalCart([]);
  try {
    const response = await api.delete('/cart/clear', getCartConfig());
    return response.data;
  } catch (err) {
    return { success: true, data: { items: [] } };
  }
};

export default {
  getProducts,
  getProductById,
  filterProducts,
  searchProducts,
  addToCart,
  getCart,
  removeFromCart,
  clearCart,
  getLocalCart,
  saveLocalCart,
};
