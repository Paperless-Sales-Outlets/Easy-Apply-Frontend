import api from '../../shared/utils/api';

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
export const MOCK_PRODUCTS = [
  // ── 🌐 Fibre Broadband Packages ──
  {
    _id: 'prod-fbb-100', id: 'prod-fbb-100', productId: 'prod-fbb-100', productCode: 'SLT-FBB-100',
    productName: 'Fibre Broadband 100 Mbps', name: 'Fibre Broadband 100 Mbps',
    description: 'High-speed symmetric fibre connection for seamless streaming, remote work, and home connectivity.',
    category: 'Fibre Broadband', speed: '100 Mbps', monthlyPrice: 4490, price: 4490,
    installationFee: 0, availableQuantity: 999, popular: true, status: 'active',
    features: ['100 Mbps Download & Upload', 'Unlimited Anytime Data', 'Free Standard Installation', 'Dual-Band Wi-Fi Router Included', '24/7 Priority Support'],
  },
  {
    _id: 'prod-fbb-200', id: 'prod-fbb-200', productId: 'prod-fbb-200', productCode: 'SLT-FBB-200',
    productName: 'Fibre Broadband 200 Mbps', name: 'Fibre Broadband 200 Mbps',
    description: 'Blazing fast speeds engineered for power users, competitive gaming, 4K multi-screen streaming, and smart home ecosystems.',
    category: 'Fibre Broadband', speed: '200 Mbps', monthlyPrice: 6990, price: 6990,
    installationFee: 0, availableQuantity: 999, popular: true, status: 'active',
    features: ['200 Mbps Download & Upload', 'Unlimited Anytime Data', 'Free Express Setup', 'Wi-Fi 6 Router Included', '24/7 Dedicated Support'],
  },
  {
    _id: 'prod-fbb-300', id: 'prod-fbb-300', productId: 'prod-fbb-300', productCode: 'SLT-FBB-300',
    productName: 'Fibre Broadband 300 Mbps', name: 'Fibre Broadband 300 Mbps',
    description: 'Heavy workload bandwidth for smart homes, digital creators, video editing, and simultaneous multi-user gaming.',
    category: 'Fibre Broadband', speed: '300 Mbps', monthlyPrice: 8490, price: 8490,
    installationFee: 0, availableQuantity: 999, popular: false, status: 'active',
    features: ['300 Mbps Download & Upload', 'Unlimited Anytime Data', 'Free Standard Installation', 'Gigabit ONT Router', 'Low Latency Gaming'],
  },
  {
    _id: 'prod-fbb-500', id: 'prod-fbb-500', productId: 'prod-fbb-500', productCode: 'SLT-FBB-500',
    productName: 'Fibre Broadband 500 Mbps', name: 'Fibre Broadband 500 Mbps',
    description: 'Gigabit-class performance for power households and home studios demanding instantaneous uploads and downloads.',
    category: 'Fibre Broadband', speed: '500 Mbps', monthlyPrice: 9990, price: 9990,
    installationFee: 0, availableQuantity: 999, popular: false, status: 'active',
    features: ['500 Mbps Symmetric Fibre', 'Unlimited Anytime Data', 'Free Express Installation', 'Wi-Fi 6E Mesh Ready Router', 'VIP Support'],
  },
  {
    _id: 'prod-fbb-1g', id: 'prod-fbb-1g', productId: 'prod-fbb-1g', productCode: 'SLT-FBB-1000',
    productName: 'Fibre Broadband 1 Gbps', name: 'Fibre Broadband 1 Gbps',
    description: 'The pinnacle of residential internet with true 1,000 Mbps throughput for ultimate speed and uncompromised bandwidth.',
    category: 'Fibre Broadband', speed: '1 Gbps', monthlyPrice: 14990, price: 14990,
    installationFee: 0, availableQuantity: 999, popular: false, status: 'active',
    features: ['1,000 Mbps Ultra Throughput', 'Unlimited High-Speed Data', 'Free White-Glove Installation', 'Enterprise Wi-Fi 6 Gateway', 'Dedicated SLA'],
  },

  // ── 📡 LTE Broadband Packages ──
  {
    _id: 'prod-lte-150', id: 'prod-lte-150', productId: 'prod-lte-150', productCode: 'SLT-LTE-150',
    productName: 'LTE Home 150 GB', name: 'LTE Home 150 GB',
    description: 'Instant wireless 4G connectivity across Sri Lanka without needing physical landlines. Plug and play right out of the box.',
    category: 'LTE Home', speed: '100 Mbps', monthlyPrice: 3990, price: 3990,
    installationFee: 1500, availableQuantity: 999, popular: false, status: 'active',
    features: ['150 GB Monthly Data', 'Speeds up to 100 Mbps', 'Plug & Play 4G Router', 'No Landline Needed', 'Nationwide 4G Coverage'],
  },
  {
    _id: 'prod-lte-300', id: 'prod-lte-300', productId: 'prod-lte-300', productCode: 'SLT-LTE-300',
    productName: 'LTE Home 300 GB', name: 'LTE Home 300 GB',
    description: 'Heavy quota wireless internet for family entertainment, online schooling, and remote work.',
    category: 'LTE Home', speed: '100 Mbps', monthlyPrice: 5990, price: 5990,
    installationFee: 1500, availableQuantity: 999, popular: false, status: 'active',
    features: ['300 GB Monthly Data', 'High-Speed 4G LTE', 'Dual-Band LTE Router', 'Instant Activation', '24/7 SLT Support'],
  },

  // ── 📞 Voice Packages ──
  {
    _id: 'prod-voice-home', id: 'prod-voice-home', productId: 'prod-voice-home', productCode: 'SLT-VOICE-HOME',
    productName: 'Fibre Voice Home (MyPhone)', name: 'Fibre Voice Home (MyPhone)',
    description: 'Crystal-clear digital telephone service over fibre with unlimited local SLT calling and smart call handling features.',
    category: 'Voice', speed: 'Voice', monthlyPrice: 890, price: 890,
    installationFee: 0, availableQuantity: 999, popular: true, status: 'active',
    features: ['Unlimited Local SLT Calls', 'Crystal Clear HD Audio', 'Free Caller ID & Call Waiting', 'Discounted IDD Rates', 'Keep Your Number'],
  },
  {
    _id: 'prod-voice-unlimited', id: 'prod-voice-unlimited', productId: 'prod-voice-unlimited', productCode: 'SLT-VOICE-UNL',
    productName: 'Voice Unlimited Prime', name: 'Voice Unlimited Prime',
    description: 'Comprehensive fixed voice package designed for frequent callers with unlimited calls across all domestic networks.',
    category: 'Voice', speed: 'Voice', monthlyPrice: 1490, price: 1490,
    installationFee: 0, availableQuantity: 999, popular: false, status: 'active',
    features: ['Unlimited Local Calls to Any Network', 'Free Value-Added Features Pack', 'Call Forwarding & Conference Calling', 'Priority Support'],
  },
  {
    _id: 'prod-voice-megaline', id: 'prod-voice-megaline', productId: 'prod-voice-megaline', productCode: 'SLT-VOICE-MEGA',
    productName: 'Megaline Voice Landline', name: 'Megaline Voice Landline',
    description: 'Traditional, highly dependable copper landline phone with continuous battery-backed reliability even during power cuts.',
    category: 'Voice', speed: 'Voice', monthlyPrice: 690, price: 690,
    installationFee: 1000, availableQuantity: 999, popular: false, status: 'active',
    features: ['Reliable Copper Wire Connection', 'Operates During Power Outages', 'Keep Existing Number', 'Affordable Standard Rates'],
  },

  // ── 📺 PEO TV Packages ──
  {
    _id: 'prod-peo-basic', id: 'prod-peo-basic', productId: 'prod-peo-basic', productCode: 'SLT-PEO-BASIC',
    productName: 'PEO TV Basic', name: 'PEO TV Basic',
    description: 'Essential digital television entertainment with live Sri Lankan and international channels, 7-day catch-up, and interactive TV guide.',
    category: 'PEO TV', speed: 'HD TV', monthlyPrice: 1490, price: 1490,
    installationFee: 500, availableQuantity: 999, popular: false, status: 'active',
    features: ['50+ Live Channels (SD & HD)', '7-Day Catch-up TV', 'Pause & Rewind Live TV', 'Electronic Programme Guide', 'Free Standard Setup'],
  },
  {
    _id: 'prod-peo-silver', id: 'prod-peo-silver', productId: 'prod-peo-silver', productCode: 'SLT-PEO-SILVER',
    productName: 'PEO TV Silver Plus', name: 'PEO TV Silver Plus',
    description: 'Rich family entertainment with news, kids, movies, documentaries, and music channels with crystal-clear digital sound.',
    category: 'PEO TV', speed: 'HD TV', monthlyPrice: 1890, price: 1890,
    installationFee: 500, availableQuantity: 999, popular: true, status: 'active',
    features: ['85+ Live HD Channels', '7-Day Catch-up TV', 'Family & Kids Entertainment Pack', 'On-Demand Movies & Series', 'Parental Lock'],
  },
  {
    _id: 'prod-peo-gold', id: 'prod-peo-gold', productId: 'prod-peo-gold', productCode: 'SLT-PEO-GOLD',
    productName: 'PEO TV Gold', name: 'PEO TV Gold',
    description: 'The premier television experience with live international sports, blockbuster movies, global news, and full VOD catalogue access.',
    category: 'PEO TV', speed: 'HD TV', monthlyPrice: 2690, price: 2690,
    installationFee: 500, availableQuantity: 999, popular: true, status: 'active',
    features: ['120+ Live HD Channels', 'Premium Sports (Cricket, Football, Tennis)', '30-Day Catch-up TV', 'Full Video-On-Demand Library', 'Multi-Screen Access'],
  },
  {
    _id: 'prod-peo-titanium', id: 'prod-peo-titanium', productId: 'prod-peo-titanium', productCode: 'SLT-PEO-TITAN',
    productName: 'PEO TV Titanium Entertainment', name: 'PEO TV Titanium Entertainment',
    description: 'All-inclusive VIP television package featuring every HD and 4K channel, unlimited cloud DVR recording, and complimentary pay-per-view events.',
    category: 'PEO TV', speed: 'HD TV', monthlyPrice: 3890, price: 3890,
    installationFee: 500, availableQuantity: 999, popular: false, status: 'active',
    features: ['140+ All-Inclusive Channels', 'All Premium Sports & 4K Channels', 'Unlimited Cloud DVR Recording', '30-Day Catch-up TV & VOD', 'VIP Concierge Support'],
  },
];

/** Maps a backend product record to the shape the catalogue UI expects. */
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
    installationFee: p.installationFee !== undefined ? Number(p.installationFee) : 0,
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
    const response = await api.get('/products', { params });
    const rawList = response.data?.data || response.data?.products || [];
    const count = rawList.length;
    const hubUrl = response.data?.hubUrl || 'https://dpdlab1.slt.lk:703/api/templates';
    const source = response.data?.source === 'LIVE_PRODUCT_HUB' ? 'LIVE PRODUCT HUB' : 'LOCAL DATABASE';

    // Fallback: If 0 products returned from API & DB, serve local demo products
    if (count === 0) {
      console.warn('⚠️ [Product Hub API & DB] Empty product list returned. Falling back to local demo products.');
      return {
        success: true,
        data: MOCK_PRODUCTS,
        products: MOCK_PRODUCTS,
        source: 'LOCAL_DEMO',
        hubUrl,
      };
    }

    console.log(
      `%c[Product Hub API]%c Connected! %c${count} Live Products Loaded %c| Source: ${source} | %c${hubUrl}`,
      'background: #0f57a8; color: #fff; font-weight: bold; padding: 2px 6px; border-radius: 3px;',
      'color: #16a34a; font-weight: bold; padding-left: 4px;',
      'background: #dcfce7; color: #166534; font-weight: bold; padding: 2px 6px; border-radius: 3px;',
      'color: #64748b; font-weight: 500;',
      'color: #2563eb; text-decoration: underline;'
    );

    return response.data;
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
      return { success: true, data: normalized, products: normalized, source: 'LOCAL_DEMO' };
    } catch {
      return { success: true, data: MOCK_PRODUCTS, products: MOCK_PRODUCTS, source: 'LOCAL_DEMO' };
    }
  }
};

/**
 * Fetch a single product by ID
 */
export const getProductById = async (id) => {
  try {
    const response = await api.get(`/products/${id}`);
    if (response.data?.data) return response.data;
  } catch {
    console.warn('Backend /products/:id unavailable, using mock data.');
  }
  const found = MOCK_PRODUCTS.find(p => p._id === id || p.id === id || p.productId === id || p.productCode === id);
  return { success: true, data: found || null };
};

/**
 * Fetch deep product specifications, fixed terms, and tables from Product Info Hub
 * (API 2: https://dpdlab1.slt.lk:703/public-api/v1/integration/products/{productId})
 */
export const getProductDetails = async (productId) => {
  if (!productId) return { success: false, message: 'Invalid product ID' };

  // 1. Try direct live Product Info Hub endpoint
  try {
    const directHubUrl = `https://dpdlab1.slt.lk:703/public-api/v1/integration/products/${productId}`;
    const directRes = await fetch(directHubUrl, {
      headers: { 'Accept': 'application/json' },
      signal: AbortSignal.timeout(5000),
    });

    if (directRes.ok) {
      const json = await directRes.json();
      return {
        success: true,
        source: 'LIVE_PRODUCT_HUB',
        product: json.product,
        tables: json.tables || [],
      };
    }
  } catch (directErr) {
    console.warn(`[Product Hub Direct API] ${directErr.message}, trying backend proxy...`);
  }

  // 2. Try backend endpoint proxy
  try {
    const response = await api.get(`/products/${productId}/details`);
    if (response.data && response.data.success) {
      return response.data;
    }
  } catch (backendErr) {
    console.warn(`[Backend Product Details API] ${backendErr.message}`);
  }

  // 3. Fallback Notice (Preserving reference fallback structure commented as requested)
  /*
  const FALLBACK_SPEC_REFERENCE = {
    product: {
      id: productId,
      productName: 'SLT Fibre & Entertainment Package',
      category: 'Broadband',
      monthlyPrice: 4490,
      fixedFields: [
        { name: 'Commitment Period', type: 'Fixed', value: '1 Year' },
        { name: 'Applicable Tax Rate', type: 'Fixed', value: '42.02%' },
        { name: 'Early Termination Fee', type: 'Fixed', value: '2500' },
      ],
      features: { 'High Speed Fibre': 'Symmetric 100 Mbps' },
      tables: []
    }
  };
  */

  return {
    success: false,
    source: 'NOTICE',
    message: 'Network Notice: Detailed specifications currently in design or unavailable from Product Info Hub.',
    data: null,
  };
};

// Helper to get local cart array
export const getLocalCart = () => {
  try {
    const raw = localStorage.getItem('easy_apply_cart');
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

// Helper to save local cart array
export const saveLocalCart = (items) => {
  try {
    localStorage.setItem('easy_apply_cart', JSON.stringify(items));
  } catch {}
  // 'storage' only fires in OTHER tabs, so broadcast a same-tab event too
  // (the navbar cart badge and any other listeners rely on this to update live).
  window.dispatchEvent(new Event('easyapply:cart-updated'));
};

/**
 * Add an item to the shopping cart (Product object or Product ID)
 */
export const addToCart = async (productOrId, quantity = 1) => {
  let prodObj = typeof productOrId === 'object' && productOrId !== null ? { ...productOrId } : { _id: productOrId, id: productOrId };
  const productId = prodObj._id || prodObj.id || productOrId;

  // If price is missing or zero, resolve from live Product Hub Cart endpoint
  if ((!prodObj.monthlyPrice && !prodObj.price) && productId) {
    try {
      const liveItem = await getProductCartItem(productId);
      if (liveItem && (liveItem.price || liveItem.monthlyPrice)) {
        prodObj.monthlyPrice = liveItem.monthlyPrice || liveItem.price;
        prodObj.price = liveItem.price || liveItem.monthlyPrice;
        prodObj.name = liveItem.productName || liveItem.name || prodObj.name;
        prodObj.productName = liveItem.productName || liveItem.name || prodObj.productName;
      }
    } catch (e) {
      console.warn('Live cart item resolution warning:', e);
    }
  }

  // Local cart sync
  const currentItems = getLocalCart();
  const existingIdx = currentItems.findIndex(i => (i.productId || i._id || i.id) === productId);

  let updatedItems = [...currentItems];
  const itemPrice = Number(prodObj.monthlyPrice || prodObj.price || 0);
  if (existingIdx > -1) {
    updatedItems[existingIdx] = {
      ...updatedItems[existingIdx],
      quantity: updatedItems[existingIdx].quantity + quantity,
      monthlyPrice: itemPrice || updatedItems[existingIdx].monthlyPrice,
      price: itemPrice || updatedItems[existingIdx].price,
    };
  } else {
    updatedItems.push({
      productId,
      _id: productId,
      id: productId,
      productName: prodObj.name || prodObj.productName || 'SLTMobitel Package',
      name: prodObj.name || prodObj.productName || 'SLTMobitel Package',
      monthlyPrice: itemPrice,
      price: itemPrice,
      installationFee: prodObj.installationFee !== undefined ? Number(prodObj.installationFee) : 0,
      speed: prodObj.speed || 'HD TV',
      category: prodObj.category || 'PEO TV',
      popular: !!prodObj.popular,
      quantity,
      features: prodObj.features || [
        'Live TV & Digital Quality',
        '24/7 Customer Support',
      ],
    });
  }
  saveLocalCart(updatedItems);

  // Try API call — the backend resolves both ObjectIds and product codes (e.g. BB-003);
  // ids it doesn't know fall back to the local cart below.
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
  const localItems = getLocalCart();
  try {
    const response = await api.get('/cart', getCartConfig());
    const cartRes = response.data?.data || response.data?.cart || response.data || {};
    const apiItems = cartRes.items || [];
    
    if (apiItems.length > 0) {
      const enrichedItems = apiItems.map((apiItem) => {
        const localMatch = localItems.find(
          (li) => (li.productId || li.id || li._id) === (apiItem.productId || apiItem.id || apiItem._id)
        );
        return {
          ...apiItem,
          name: apiItem.productName || apiItem.name || localMatch?.name || 'SLTMobitel Connection',
          productName: apiItem.productName || localMatch?.productName || 'SLTMobitel Connection',
          monthlyPrice: apiItem.price !== undefined ? apiItem.price : (apiItem.monthlyPrice !== undefined ? apiItem.monthlyPrice : (localMatch?.monthlyPrice || 0)),
          price: apiItem.price !== undefined ? apiItem.price : (apiItem.monthlyPrice !== undefined ? apiItem.monthlyPrice : (localMatch?.price || 0)),
          installationFee: apiItem.installationFee !== undefined
            ? Number(apiItem.installationFee)
            : (localMatch?.installationFee !== undefined ? Number(localMatch.installationFee) : 0),
          category: apiItem.category || localMatch?.category || 'Broadband',
          speed: apiItem.speed || localMatch?.speed || '',
          features: apiItem.features || localMatch?.features || [],
        };
      });
      saveLocalCart(enrichedItems);
      return {
        ...response.data,
        data: {
          ...cartRes,
          items: enrichedItems,
        },
        cart: {
          ...cartRes,
          items: enrichedItems,
        },
      };
    }
  } catch (err) {
    console.warn('Backend getCart failed, using local cart fallback:', err.message);
  }

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
  } catch {
    return { success: true, data: { items: localItems } };
  }
};

/**
 * Fetch Left Sidebar Category Tree (Hierarchy) from backend /api/products/hierarchy
 */
export const getProductHierarchy = async () => {
  try {
    const res = await api.get('/products/hierarchy');
    return res.data?.data || res.data || [];
  } catch (err) {
    console.warn('Failed to fetch product hierarchy:', err);
    return [];
  }
};

/**
 * Fetch Product Cart item by ID from backend /api/products/cart-item/:id
 */
export const getProductCartItem = async (productId) => {
  try {
    const res = await api.get(`/products/cart-item/${productId}`);
    return res.data?.data || res.data || null;
  } catch (err) {
    console.warn(`Failed to fetch cart product ${productId}:`, err);
    return null;
  }
};
