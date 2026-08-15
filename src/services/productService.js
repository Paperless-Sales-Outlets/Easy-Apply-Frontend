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

// ── Rich mock catalogue used when the backend /products endpoint is unavailable ──
const MOCK_PRODUCTS = [
  {
    _id: 'mock-1', id: 'mock-1', productId: 'mock-1', productCode: 'SLT-FBB-050',
    productName: 'Fibre Broadband 50 Mbps', name: 'Fibre Broadband 50 Mbps',
    description: 'Blazing-fast fibre with 50 Mbps symmetric speeds. Perfect for everyday browsing, streaming, and video calls.',
    category: 'Fibre Broadband', speed: '50 Mbps', monthlyPrice: 2990, price: 2990,
    installationFee: 0, availableQuantity: 999, popular: false, status: 'active',
    features: ['50 Mbps Download / Upload', 'Unlimited Data', 'Free Standard Installation', 'Free Wi-Fi Router', '24/7 Support'],
  },
  {
    _id: 'mock-2', id: 'mock-2', productId: 'mock-2', productCode: 'SLT-FBB-100',
    productName: 'Fibre Broadband 100 Mbps', name: 'Fibre Broadband 100 Mbps',
    description: 'Supercharged fibre for heavy users, remote workers, and families with multiple devices.',
    category: 'Fibre Broadband', speed: '100 Mbps', monthlyPrice: 4490, price: 4490,
    installationFee: 0, availableQuantity: 999, popular: true, status: 'active',
    features: ['100 Mbps Download / Upload', 'Unlimited Data', 'Free Premium Installation', 'Free Dual-band Router', 'Priority Support'],
  },
  {
    _id: 'mock-3', id: 'mock-3', productId: 'mock-3', productCode: 'SLT-FBB-200',
    productName: 'Fibre Broadband 200 Mbps', name: 'Fibre Broadband 200 Mbps',
    description: 'Ultra-fast symmetric fibre ideal for gaming, 4K streaming, and smart homes.',
    category: 'Fibre Broadband', speed: '200 Mbps', monthlyPrice: 6990, price: 6990,
    installationFee: 0, availableQuantity: 999, popular: true, status: 'active',
    features: ['200 Mbps Download / Upload', 'Unlimited Data', 'Free Express Installation', 'Free Wi-Fi 6 Router', 'Dedicated Support Line'],
  },
  {
    _id: 'mock-4', id: 'mock-4', productId: 'mock-4', productCode: 'SLT-FBB-500',
    productName: 'Fibre Broadband 500 Mbps', name: 'Fibre Broadband 500 Mbps',
    description: 'Enterprise-grade fibre for power users, content creators, and home offices.',
    category: 'Fibre Broadband', speed: '500 Mbps', monthlyPrice: 9990, price: 9990,
    installationFee: 0, availableQuantity: 999, popular: false, status: 'active',
    features: ['500 Mbps Download / Upload', 'Unlimited Data', 'Free Express Installation', 'Free Wi-Fi 6E Router', 'VIP Support'],
  },
  {
    _id: 'mock-5', id: 'mock-5', productId: 'mock-5', productCode: 'SLT-PEOTV-BASIC',
    productName: 'PEO TV Basic', name: 'PEO TV Basic',
    description: 'Enjoy 50+ live channels in crisp quality with the PEO TV Basic package.',
    category: 'PEO TV', speed: null, monthlyPrice: 1490, price: 1490,
    installationFee: 500, availableQuantity: 999, popular: false, status: 'active',
    features: ['50+ Live Channels', 'SD & HD Quality', 'Electronic Programme Guide', '7-day Catch-up TV'],
  },
  {
    _id: 'mock-6', id: 'mock-6', productId: 'mock-6', productCode: 'SLT-PEOTV-GOLD',
    productName: 'PEO TV Gold', name: 'PEO TV Gold',
    description: 'Premium entertainment with 100+ HD channels, sports packages, and VOD.',
    category: 'PEO TV', speed: null, monthlyPrice: 2990, price: 2990,
    installationFee: 500, availableQuantity: 999, popular: true, status: 'active',
    features: ['100+ HD Channels', 'Sports & Movies Pack', 'Video on Demand', '30-day Catch-up TV', 'Multi-screen Support'],
  },
  {
    _id: 'mock-7', id: 'mock-7', productId: 'mock-7', productCode: 'SLT-VOICE-HOME',
    productName: 'Home Voice (MyPhone)', name: 'Home Voice (MyPhone)',
    description: 'Affordable landline with unlimited local calls and free caller ID.',
    category: 'Voice', speed: null, monthlyPrice: 890, price: 890,
    installationFee: 1500, availableQuantity: 999, popular: false, status: 'active',
    features: ['Unlimited Local Calls', 'Free Caller ID', 'Call Waiting & Forwarding', 'Low International Rates'],
  },
  {
    _id: 'mock-8', id: 'mock-8', productId: 'mock-8', productCode: 'SLT-LTE-100',
    productName: '4G LTE Broadband 100 Mbps', name: '4G LTE Broadband 100 Mbps',
    description: 'Flexible wireless broadband where fibre isn\'t available yet. No landline required.',
    category: 'LTE Broadband', speed: '100 Mbps', monthlyPrice: 4990, price: 4990,
    installationFee: 2500, availableQuantity: 999, popular: false, status: 'active',
    features: ['100 Mbps LTE Speed', '200 GB Monthly Data', 'Free 4G Router', 'No Line Rental', 'Nationwide Coverage'],
  },
];

/**
 * Fetch all active products.
 * Falls back to rich mock data when the backend returns a non-2xx response
 * (e.g. 500 Internal Server Error while the products collection is being set up).
 */
export const getProducts = async (params = {}) => {
  try {
    const response = await api.get('/products', { params });
    return response.data;
  } catch (err) {
    console.warn('Backend /products unavailable (status:', err.response?.status ?? 'network error', '), using mock product catalogue.');
    return { success: true, data: MOCK_PRODUCTS, products: MOCK_PRODUCTS };
  }
};

/**
 * Fetch a single product by ID
 */
export const getProductById = async (id) => {
  try {
    const response = await api.get(`/products/${id}`);
    return response.data;
  } catch (err) {
    console.warn('Backend /products/:id unavailable, using mock data.');
    const found = MOCK_PRODUCTS.find(p => p._id === id || p.id === id || p.productId === id);
    return { success: true, data: found || null };
  }
};

/**
 * Filter products by category or options
 */
export const filterProducts = async (category) => {
  if (!category || category === 'All Products') {
    return getProducts();
  }
  try {
    const formattedCategory = encodeURIComponent(category);
    const response = await api.get(`/products/category/${formattedCategory}`);
    return response.data;
  } catch (err) {
    console.warn('Backend /products/category unavailable, filtering mock data.');
    const filtered = MOCK_PRODUCTS.filter(p => p.category === category);
    return { success: true, data: filtered };
  }
};

/**
 * Search products by keyword, category, speed, price
 */
export const searchProducts = async (searchParams = {}) => {
  try {
    const response = await api.get('/products/search', { params: searchParams });
    return response.data;
  } catch (err) {
    console.warn('Backend /products/search unavailable, searching mock data.');
    const q = (searchParams.q || '').toLowerCase();
    const filtered = q
      ? MOCK_PRODUCTS.filter(p =>
          p.productName.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q)
        )
      : MOCK_PRODUCTS;
    return { success: true, data: filtered };
  }
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
  // 'storage' only fires in OTHER tabs, so broadcast a same-tab event too
  // (the navbar cart badge and any other listeners rely on this to update live).
  window.dispatchEvent(new Event('easyapply:cart-updated'));
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
