import axios from 'axios';
import api from '../utils/api';
import { mapHubTemplateToProductCard } from '../utils/productHubAdapter';

const TEMPLATES_API_URL = import.meta.env.VITE_PRODUCT_HUB_API_URL || 'https://product-hub-api-7hkn.onrender.com/templates';

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

// The catalogue shown to customers is a curated list (DEFAULT_MOCKUP_PRODUCTS
// in ProductCatalogPage) that doesn't share product names with whatever is
// actually seeded in the real database, so it never resolves to a real
// MongoDB _id — only mock ids like 'prod-1' or 'mock-3'. Posting one of those
// to the backend cart is guaranteed to 500 with "Product not found", so we
// check first and only sync to the backend for products that have a real id.
const isRealObjectId = (id) => typeof id === 'string' && /^[a-f0-9]{24}$/i.test(id);

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

export const normalizeBackendProduct = (p) => {
  const catLower = (p.category || '').toLowerCase();
  let normalizedCat = 'Fibre Broadband';
  if (catLower.includes('voice') || catLower === 'voice') normalizedCat = 'Voice';
  else if (catLower.includes('peo') || catLower === 'peo-tv' || catLower.includes('tv')) normalizedCat = 'PEO TV';
  else if (catLower.includes('lte') || catLower.includes('4g')) normalizedCat = 'LTE Home';
  else if (catLower.includes('package') || catLower.includes('bundle')) normalizedCat = 'Fibre Broadband';

  return {
    id: p._id || p.productId || p.id,
    _id: p._id || p.productId || p.id,
    productId: p.productId || p._id,
    name: p.name || p.productName || 'SLTMobitel Connection',
    productName: p.productName || p.name || 'SLTMobitel Connection',
    monthlyPrice: p.monthlyPrice !== undefined ? p.monthlyPrice : (p.price || 0),
    price: p.price !== undefined ? p.price : (p.monthlyPrice || 0),
    installationFee: p.installationFee !== undefined ? p.installationFee : 2500,
    category: normalizedCat,
    speed: p.speed || (catLower.includes('voice') ? 'Voice' : catLower.includes('peo') ? 'HD TV' : '100 Mbps'),
    features: (Array.isArray(p.features) && p.features.length > 0)
      ? p.features
      : (p.description ? [p.description, 'High Reliability', '24/7 Support'] : ['Unlimited Anytime Data', 'Free Standard Setup', '24/7 Customer Support']),
    description: p.description || '',
    popular: Boolean(p.popular || (p.price > 4000)),
    bannerUrl: p.bannerUrl || p.imageUrl || '',
  };
};

/**
 * Fetch all active products from Product Hub API.
 * Falls back to local backend or rich mock data when unavailable.
 */
export const getProducts = async (params = {}) => {
  try {
    const token = import.meta.env.VITE_PRODUCT_HUB_TOKEN;

    const response = await axios.get(TEMPLATES_API_URL, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      params,
    });

    const items = response.data?.data || response.data || [];

    // Filter product entries: ONLY valid service packages with a price/monthly rental > 0
    // and belonging to core telecom packages (Voice, Broadband, PEO TV),
    // while filtering out standalone hardware devices / router photos.
    const productEntries = Array.isArray(items)
      ? items.filter((item) => {
          const t = item.template || {};
          const fv = t.fieldValues || t.effectiveFieldValues || {};
          const price = Number(t.price) || Number(fv['Monthly Rental']) || Number(fv['Package Monthly Rental']) || 0;

          // Must have an active package price > 0
          if (price <= 0) return false;

          const nameLower = (t.name || '').toLowerCase();
          if (nameLower.includes('router') || nameLower.includes('splitter') || nameLower.includes('cable') || nameLower.includes('adapter')) {
            return false;
          }

          return true;
        })
      : [];

    if (productEntries.length > 0) {
      // Transform using the adapter
      const transformedProducts = productEntries.map(mapHubTemplateToProductCard);
      console.log(`✅ [Product Hub API] Connected successfully! Loaded ${transformedProducts.length} live packages from ${TEMPLATES_API_URL}`);

      return {
        success: true,
        data: transformedProducts,
        products: transformedProducts,
      };
    }

    console.warn('⚠️ [Product Hub API] Connected but returned 0 packages. Falling back to local backend...');
    // If API returned empty array, try fallback backend /products (excluding hardware devices/accessories)
    const backendRes = await api.get('/products', { params });
    const rawBackendList = backendRes.data?.data || backendRes.data?.products || backendRes.data || [];
    const packagesOnly = Array.isArray(rawBackendList)
      ? rawBackendList.filter((p) => {
          const cat = (p.category || '').toLowerCase();
          return !['devices', 'accessories', 'hardware'].includes(cat) && !p.productCode?.startsWith('SLT-ROUTER') && !p.productCode?.startsWith('SLT-SPLITTER') && !p.productCode?.startsWith('SLT-CAT6');
        })
      : [];
    const normalized = packagesOnly.length > 0 ? packagesOnly.map(normalizeBackendProduct) : MOCK_PRODUCTS;
    return { success: true, data: normalized, products: normalized };
  } catch (err) {
    console.warn(`⚠️ [Product Hub API] Connection issue (${err.response?.status || err.message}). Falling back to local catalog.`);
    try {
      const backendRes = await api.get('/products', { params });
      const rawBackendList = backendRes.data?.data || backendRes.data?.products || backendRes.data || [];
      const packagesOnly = Array.isArray(rawBackendList)
        ? rawBackendList.filter((p) => {
            const cat = (p.category || '').toLowerCase();
            return !['devices', 'accessories', 'hardware'].includes(cat) && !p.productCode?.startsWith('SLT-ROUTER') && !p.productCode?.startsWith('SLT-SPLITTER') && !p.productCode?.startsWith('SLT-CAT6');
          })
        : [];
      const normalized = packagesOnly.length > 0 ? packagesOnly.map(normalizeBackendProduct) : MOCK_PRODUCTS;
      return { success: true, data: normalized, products: normalized };
    } catch {
      return { success: true, data: MOCK_PRODUCTS, products: MOCK_PRODUCTS };
    }
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

  // Only the real DB catalogue has ids the backend can look up — skip the
  // network call entirely for mock/curated-catalogue ids instead of firing
  // a request that's guaranteed to 500.
  if (!isRealObjectId(productId)) {
    return { success: true, data: { items: updatedItems } };
  }

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

  if (!isRealObjectId(productId)) {
    return { success: true, data: { items: localItems } };
  }

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
