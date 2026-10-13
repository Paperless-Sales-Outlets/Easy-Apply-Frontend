import React, { useEffect, useState, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import { FiGrid, FiList, FiCheckCircle, FiClock, FiShield, FiSliders, FiLock, FiPhone, FiGlobe, FiTv, FiFilter } from 'react-icons/fi';
import CategoryChips from '../components/catalog/CategoryChips';
import SidebarFilters from '../components/catalog/SidebarFilters';
import ProductCard from '../components/catalog/ProductCard';
import ProductDetailsPanel from '../components/catalog/ProductDetailsPanel';
import PackageDetailModal from '../components/PackageDetailModal';
import SkeletonCard from '../components/catalog/SkeletonCard';
import Toast from '../components/common/Toast';
import CatalogHero from '../components/catalog/CatalogHero';
import { getProducts, addToCart, removeFromCart, getLocalCart, clearCart } from '../services/productService';

const DEFAULT_MOCKUP_PRODUCTS = [
  // ── 🌐 Broadband Category (5 Packages) ──
  {
    _id: 'prod-1',
    id: 'prod-1',
    name: '500 Mbps Fibre Broadband',
    category: 'Fibre Broadband',
    monthlyPrice: 7999,
    installationFee: 0,
    popular: true,
    speed: '500 Mbps',
    features: ['Ideal for smart homes', 'Ultra-fast speed', 'Unlimited data'],
  },
  {
    _id: 'prod-2',
    id: 'prod-2',
    name: '300 Mbps Fibre Broadband',
    category: 'Fibre Broadband',
    monthlyPrice: 5499,
    installationFee: 0,
    popular: true,
    speed: '300 Mbps',
    features: ['Ultra-fast speed', 'Great for streaming', 'Unlimited data'],
  },
  {
    _id: 'prod-3',
    id: 'prod-3',
    name: '1 Gbps Fibre Broadband',
    category: 'Fibre Broadband',
    monthlyPrice: 10999,
    installationFee: 0,
    popular: true,
    speed: '1 Gbps',
    features: ['Superfast downloads', 'Perfect for gaming', 'Unlimited data'],
  },
  {
    _id: 'prod-4',
    id: 'prod-4',
    name: 'LTE Home 150 GB',
    category: 'LTE Home',
    monthlyPrice: 3999,
    installationFee: 2500,
    popular: true,
    speed: '100 Mbps',
    features: ['Plug & Play', 'Best for home use', '150GB data'],
  },
  {
    _id: 'prod-5',
    id: 'prod-5',
    name: 'LTE Home 300 GB',
    category: 'LTE Home',
    monthlyPrice: 4999,
    installationFee: 2500,
    popular: true,
    speed: '100 Mbps',
    features: ['Plug & Play', 'Best for heavy users', '300GB data'],
  },

  // ── 📞 Voice Category (4 Packages - Compulsory 1 Required) ──
  {
    _id: 'prod-8',
    id: 'prod-8',
    name: 'Fibre Voice Home',
    category: 'Voice',
    monthlyPrice: 990,
    installationFee: 1500,
    popular: true,
    speed: 'Voice',
    features: ['Unlimited SLT Calls', 'Crystal Clear Audio', 'Caller ID Included'],
  },
  {
    _id: 'prod-9',
    id: 'prod-9',
    name: 'Voice Unlimited',
    category: 'Voice',
    monthlyPrice: 1490,
    installationFee: 1500,
    popular: true,
    speed: 'Voice',
    features: ['Unlimited Local Calls', 'Free Value Services', 'IDD Discount'],
  },
  {
    _id: 'prod-10',
    id: 'prod-10',
    name: 'Megaline Voice Basic',
    category: 'Voice',
    monthlyPrice: 790,
    installationFee: 1000,
    popular: false,
    speed: 'Voice',
    features: ['Reliable Landline', 'Low Call Rates', 'Standard Connection'],
  },
  {
    _id: 'prod-11',
    id: 'prod-11',
    name: 'Voice Business Prime',
    category: 'Voice',
    monthlyPrice: 1990,
    installationFee: 2000,
    popular: false,
    speed: 'Voice',
    features: ['Multi-line Support', 'Auto Attendant', 'Hunting Lines Included'],
  },

  // ── 📺 PEO TV Category (4 Packages) ──
  {
    _id: 'prod-6',
    id: 'prod-6',
    name: 'PEO TV Gold Pack',
    category: 'PEO TV',
    monthlyPrice: 2990,
    installationFee: 500,
    popular: true,
    speed: 'HD TV',
    bannerUrl: 'https://res.cloudinary.com/zipy7m0d/image/upload/v1789621770/product-info-hub/images/fields/peo_qpdary.jpg',
    features: ['120+ Live TV Channels', 'Crystal Clear Digital Quality', 'Free Standard Setup & Support'],
  },
  {
    _id: 'prod-7',
    id: 'prod-7',
    name: 'PEO TV Starter Pack',
    category: 'PEO TV',
    monthlyPrice: 1490,
    installationFee: 500,
    popular: false,
    speed: 'HD TV',
    bannerUrl: 'https://res.cloudinary.com/zipy7m0d/image/upload/v1789621770/product-info-hub/images/fields/peo_qpdary.jpg',
    features: ['50+ Live TV Channels', 'Crystal Clear Digital Quality', 'Free Standard Setup & Support'],
  },
  {
    _id: 'prod-12',
    id: 'prod-12',
    name: 'PEO TV Entertainment',
    category: 'PEO TV',
    monthlyPrice: 2190,
    installationFee: 500,
    popular: true,
    speed: 'HD TV',
    bannerUrl: 'https://res.cloudinary.com/zipy7m0d/image/upload/v1789621770/product-info-hub/images/fields/peo_qpdary.jpg',
    features: ['105+ Live TV Channels', 'Crystal Clear Digital Quality', 'Free Standard Setup & Support'],
  },
  {
    _id: 'prod-13',
    id: 'prod-13',
    name: 'PEO TV Titanium',
    category: 'PEO TV',
    monthlyPrice: 3890,
    installationFee: 500,
    popular: false,
    speed: '4K HD TV',
    bannerUrl: 'https://res.cloudinary.com/zipy7m0d/image/upload/v1789621770/product-info-hub/images/fields/peo_qpdary.jpg',
    features: ['135+ Live TV Channels', '4K Ultra HD & Digital Audio', 'Free Standard Setup & Support'],
  },
];

const getPeoTvChannelsCount = (name = '', price = 0) => {
  const lower = String(name).toLowerCase();
  if (lower.includes('silver plus')) return 85;
  if (lower.includes('silver')) return 77;
  if (lower.includes('family')) return 95;
  if (lower.includes('entertainment')) return 105;
  if (lower.includes('gold')) return 120;
  if (lower.includes('titanium')) return 135;
  if (lower.includes('platinum')) return 150;
  if (lower.includes('starter')) return 50;
  if (price >= 3500) return 135;
  if (price >= 2000) return 120;
  if (price >= 1600) return 95;
  if (price >= 1300) return 85;
  if (price >= 1100) return 77;
  return 75;
};

const normalizeName = (s = '') => String(s).toLowerCase().replace(/\s+/g, ' ').trim();

// Maps a category/name string onto the Product Type filter ids. LTE is checked before
// broadband because the live API labels LTE products "LTE Broadband".
const getProductGroup = (text = '') => {
  const lower = String(text || '').toLowerCase();
  if (!lower) return null;
  if (lower.includes('peo') || /\btv\b/.test(lower)) return 'PEO TV';
  if (lower.includes('voice') || lower.includes('megaline')) return 'Voice';
  if (lower.includes('lte') || lower.includes('4g')) return 'LTE Home';
  if (lower.includes('fibre') || lower.includes('fiber') || lower.includes('broadband')) return 'Fibre Broadband';
  return null;
};

// Category chip names that the category filter below understands
const CHIP_CATEGORIES = ['Voice', 'Fibre Broadband', 'PEO TV'];

// Collects ids and names of a hierarchy node and all its descendants
const collectTreeMatchers = (node, ids = new Set(), names = new Set()) => {
  if (!node) return { ids, names };
  if (node.id) ids.add(String(node.id));
  if (node.name) names.add(normalizeName(node.name));
  (node.children || []).forEach((child) => collectTreeMatchers(child, ids, names));
  return { ids, names };
};

export default function ProductCatalogPage() {
  const { t, i18n } = useTranslation();
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [activeCategory, setActiveCategory] = useState('All Products');
  // Category Tree selection: { key, ids:Set, names:Set, group } or null
  const [treeFilter, setTreeFilter] = useState(null);
  const [selectedTypes, setSelectedTypes] = useState([]);
  const [selectedSpeeds, setSelectedSpeeds] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('Popularity');
  const [viewMode, setViewMode] = useState('grid');
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Cart Items State Sync (reads the same local cart used by the Cart page & navbar badge)
  const [cartItems, setCartItems] = useState(() => getLocalCart());

  useEffect(() => {
    const syncCart = () => setCartItems(getLocalCart());
    window.addEventListener('easyapply:cart-updated', syncCart);
    window.addEventListener('storage', syncCart);
    return () => {
      window.removeEventListener('easyapply:cart-updated', syncCart);
      window.removeEventListener('storage', syncCart);
    };
  }, []);

  // Favorites & Toast
  const [favorites, setFavorites] = useState([]);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    const fetchCatalogData = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await getProducts({ limit: 100 });
        const list = res.data || res.products || res || [];
        if (Array.isArray(list) && list.length > 0) {
          // Normalize and use live products directly
          const normalized = list
            .filter((p) => {
              const rawName = (p.name || p.productName || '').toLowerCase();
              return !rawName.includes('test') && (p.monthlyPrice > 0 || p.price > 0 || rawName.includes('peo'));
            })
            .map((p) => {
              const rawName = p.name || p.productName || 'SLT Package';
              const cat = (p.category || '').toLowerCase();
              const mock = DEFAULT_MOCKUP_PRODUCTS.find(
                (m) => m.name?.toLowerCase().trim() === rawName.toLowerCase().trim()
              );

              let dynamicFeatures = Array.isArray(p.features) && p.features.length > 0 ? p.features : (mock?.features || null);
              
              // Resolve non-zero price with tariff fallback
              let price = Number(p.monthlyPrice ?? p.price ?? 0);
              if (price === 0) {
                const lowerName = rawName.toLowerCase();
                if (lowerName.includes('silver plus')) price = 1375;
                else if (lowerName.includes('silver')) price = 1125;
                else if (lowerName.includes('family')) price = 1625;
                else if (lowerName.includes('entertainment')) price = 1875;
                else if (lowerName.includes('gold')) price = 2100;
                else if (lowerName.includes('titanium')) price = 3890;
                else if (lowerName.includes('starter') || lowerName.includes('basic')) price = 1490;
                else if (mock?.monthlyPrice) price = mock.monthlyPrice;
              }

              // For PEO TV products, always prioritize real channel count
              if (cat.includes('peo') || cat.includes('tv') || rawName.toLowerCase().includes('peo')) {
                const count = getPeoTvChannelsCount(rawName, price);
                dynamicFeatures = [
                  `${count}+ Live TV Channels`,
                  'Crystal Clear Digital Quality',
                  'Free Standard Setup & Support',
                ];
              }

              if (!dynamicFeatures || dynamicFeatures.length === 0) {
                dynamicFeatures = ['High-speed connectivity', 'Unlimited Entertainment', '24/7 SLT Support'];
              }

              const isPeo = cat.includes('peo') || cat.includes('tv') || rawName.toLowerCase().includes('peo');
              const peoCloudinaryImg = 'https://res.cloudinary.com/zipy7m0d/image/upload/v1789621770/product-info-hub/images/fields/peo_qpdary.jpg';

              return {
                ...p,
                name: rawName,
                monthlyPrice: price,
                price: price,
                installationFee: p.installationFee !== undefined ? p.installationFee : (mock?.installationFee ?? 2500),
                features: dynamicFeatures,
                category: p.category || mock?.category || (isPeo ? 'PEO TV' : 'Broadband'),
                speed: p.speed || mock?.speed || null,
                popular: p.popular ?? (mock?.popular || false),
                bannerUrl: p.bannerUrl || p.image || (isPeo ? peoCloudinaryImg : (mock?.bannerUrl || null)),
                image: p.image || p.bannerUrl || (isPeo ? peoCloudinaryImg : (mock?.bannerUrl || null)),
              };
            });

          // Set live products directly from API without merging mock DB data
          setProducts(normalized);
        } else {
          setProducts([]);
        }
      } catch (err) {
        console.warn('Live products fetch failed:', err);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCatalogData();
  }, []);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3800);
  };

  const handleTypeToggle = (type) => {
    setSelectedTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  };

  const handleSpeedToggle = (speedId) => {
    setSelectedSpeeds((prev) =>
      prev.includes(speedId) ? prev.filter((s) => s !== speedId) : [...prev, speedId]
    );
  };

  // Category chips select a whole category, so they replace any tree selection
  const handleSelectCategory = (cat) => {
    setActiveCategory(cat);
    setTreeFilter(null);
  };

  const handleSelectTreeNode = (node, parentNode) => {
    const key = node.id || node.name;

    if (parentNode) {
      // Clicking the already-selected package goes back to its parent category
      if (treeFilter?.key === key) {
        handleSelectTreeNode(parentNode, null);
        return;
      }
      const parentGroup = getProductGroup(parentNode.name);
      setActiveCategory(CHIP_CATEGORIES.includes(parentGroup) ? parentGroup : 'All Products');
      setTreeFilter({ key, group: null, ...collectTreeMatchers(node) });
      return;
    }

    // Root node: map "Peo TV" etc. onto the matching chip category; anything else
    // (e.g. "data") filters by the packages listed under that node.
    const group = getProductGroup(node.name);
    if (CHIP_CATEGORIES.includes(group)) {
      setActiveCategory(group);
      setTreeFilter(null);
    } else {
      setActiveCategory('All Products');
      setTreeFilter({ key, group, ...collectTreeMatchers(node) });
    }
  };

  const handleClearAll = () => {
    setActiveCategory('All Products');
    setTreeFilter(null);
    setSelectedTypes([]);
    setSelectedSpeeds([]);
    setSearchQuery('');
    setSortBy('Popularity');
  };

  const handleToggleFavorite = (id) => {
    setFavorites((prev) => {
      const exists = prev.includes(id);
      if (exists) {
        showToast('Removed from favorites', 'info');
        return prev.filter((favId) => favId !== id);
      } else {
        showToast('Added to favorites', 'success');
        return [...prev, id];
      }
    });
  };

  // Cart Category Rule Analysis (Voice compulsory, max 1 per category)
  const cartCategoryAnalysis = useMemo(() => {
    const selectedProdIds = new Set();
    const categoriesInCart = new Set();

    cartItems.forEach((item) => {
      const p = item.product || item;
      const id = String(item.productId || p._id || p.id || '');
      if (id) selectedProdIds.add(id);

      const cat = (p.category || item.category || p.name || item.productName || '').toLowerCase();
      if (cat.includes('voice')) categoriesInCart.add('Voice');
      else if (cat.includes('peo')) categoriesInCart.add('PEO TV');
      else categoriesInCart.add('Broadband');
    });

    return {
      selectedProdIds,
      categoriesInCart,
      hasVoice: categoriesInCart.has('Voice'),
      hasBroadband: categoriesInCart.has('Broadband'),
      hasPeoTv: categoriesInCart.has('PEO TV'),
    };
  }, [cartItems]);

  const handleAddToCart = async (prod, qty = 1) => {
    const prodId = String(prod._id || prod.id);
    const catName = (prod.category || prod.name || '').toLowerCase();
    const group = catName.includes('voice') ? 'Voice' : catName.includes('peo') ? 'PEO TV' : 'Broadband';

    // Rule: Max 1 product per category allowed
    if (cartCategoryAnalysis.categoriesInCart.has(group) && !cartCategoryAnalysis.selectedProdIds.has(prodId)) {
      showToast(`Only 1 ${group} package is allowed per customer. Remove existing ${group} package to change.`, 'warning');
      return;
    }

    try {
      await addToCart(prod, qty);
      setCartItems(getLocalCart());
      showToast(`${prod.name} added to cart!`, 'success');
    } catch (err) {
      showToast(`${prod.name} added to cart!`, 'success');
    }
  };

  const handleRemoveFromCart = async (prod) => {
    const prodId = String(prod._id || prod.id);
    try {
      await removeFromCart(prodId);
      setCartItems(getLocalCart());
      showToast(`${prod.name} removed from cart.`, 'info');
    } catch (err) {
      setCartItems(getLocalCart());
    }
  };

  const handleClearCartSelection = async () => {
    await clearCart();
    setCartItems([]);
    showToast('Selection reset. All packages are now unselected.', 'info');
  };

  const location = useLocation();

  // Sync search query from URL parameter or navbar custom event
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const q = params.get('search');
    if (q) {
      setSearchQuery(q);
    }
  }, [location.search]);

  useEffect(() => {
    const handleCustomSearch = (e) => {
      if (e.detail) {
        setSearchQuery(e.detail);
      }
    };
    window.addEventListener('easyapply:search', handleCustomSearch);
    return () => window.removeEventListener('easyapply:search', handleCustomSearch);
  }, []);

  // Speed string parser helper (converts "500 Mbps", "1 Gbps", "Up to 100Mbps" to numeric Mbps).
  // Only Mbps/Gbps units count, so data allowances like "150 GB" are not mistaken for speeds.
  const parseSpeedMbps = (...values) => {
    for (const value of values) {
      const match = String(value || '').toLowerCase().match(/(\d+(?:\.\d+)?)\s*(gbps|mbps|gb\/s|mb\/s)/);
      if (match) return parseFloat(match[1]) * (match[2].startsWith('g') ? 1000 : 1);
    }
    return 0;
  };

  const getTypeOf = (p) => getProductGroup(p.category) || getProductGroup(p.name);

  const matchesSpeedRange = (p, speedId) => {
    const speedVal = parseSpeedMbps(p.speed, p.name);
    if (speedId === 'up_to_100') return speedVal > 0 && speedVal <= 100;
    if (speedId === '100_300') return speedVal > 100 && speedVal <= 300;
    if (speedId === '300_500') return speedVal > 300 && speedVal <= 500;
    if (speedId === 'above_500') return speedVal > 500;
    return false;
  };

  // `skip` leaves one checkbox group out, which is how the per-option counts are worked out
  const matchesFilters = (p, skip = null) => {
      // Category filter
      if (activeCategory !== 'All Products') {
        const cat = (p.category || p.name || '').toLowerCase();
        if (activeCategory === 'Voice' && !cat.includes('voice')) return false;
        if (activeCategory === 'Fibre Broadband' && !cat.includes('fibre') && !cat.includes('broadband')) return false;
        if (activeCategory === 'PEO TV' && !cat.includes('peo')) return false;
      }
      // Category Tree filter (matches by product id or name against the selected node's subtree)
      if (treeFilter) {
        const prodId = String(p._id || p.id || p.productId || '');
        const inTree =
          treeFilter.ids.has(prodId) ||
          treeFilter.names.has(normalizeName(p.name)) ||
          (treeFilter.group && getProductGroup(p.category) === treeFilter.group);
        if (!inTree) return false;
      }
      // Product Type checkbox filter
      if (skip !== 'type' && selectedTypes.length > 0) {
        if (!selectedTypes.includes(getTypeOf(p))) return false;
      }
      // Connection Speed checkbox filter logic
      if (skip !== 'speed' && selectedSpeeds.length > 0) {
        if (!selectedSpeeds.some((speedId) => matchesSpeedRange(p, speedId))) return false;
      }
      // Search query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const nameMatch = p.name.toLowerCase().includes(q);
        const catMatch = (p.category || '').toLowerCase().includes(q);
        const speedMatch = (p.speed || '').toLowerCase().includes(q);
        if (!nameMatch && !catMatch && !speedMatch) return false;
      }
      return true;
  };

  const filteredProducts = useMemo(() => {
    let list = products.filter((p) => matchesFilters(p));

    // Sorting logic
    if (sortBy === 'Price Low to High') {
      list.sort((a, b) => a.monthlyPrice - b.monthlyPrice);
    } else if (sortBy === 'Price High to Low') {
      list.sort((a, b) => b.monthlyPrice - a.monthlyPrice);
    }

    return list;
  }, [products, activeCategory, treeFilter, selectedTypes, selectedSpeeds, searchQuery, sortBy]);

  // How many products each sidebar checkbox would show, given the other active filters
  const { typeCounts, speedCounts } = useMemo(() => {
    const typeCounts = {};
    const speedCounts = { up_to_100: 0, '100_300': 0, '300_500': 0, above_500: 0 };
    products.forEach((p) => {
      if (matchesFilters(p, 'type')) {
        const type = getTypeOf(p);
        if (type) typeCounts[type] = (typeCounts[type] || 0) + 1;
      }
      if (matchesFilters(p, 'speed')) {
        Object.keys(speedCounts).forEach((speedId) => {
          if (matchesSpeedRange(p, speedId)) speedCounts[speedId] += 1;
        });
      }
    });
    return { typeCounts, speedCounts };
  }, [products, activeCategory, treeFilter, selectedTypes, selectedSpeeds, searchQuery]);

  // Filter options come from the live API products: only types / speed bands the
  // catalogue really contains are offered (counts above still follow the active filters).
  const typeOptions = useMemo(() => {
    const present = new Set();
    products.forEach((p) => {
      const type = getTypeOf(p);
      if (type) present.add(type);
    });
    return ['PEO TV', 'Fibre Broadband', 'LTE Home', 'Voice']
      .filter((id) => present.has(id))
      .map((id) => ({ id, label: id }));
  }, [products]);

  const speedOptions = useMemo(
    () =>
      [
        { id: 'up_to_100', label: 'Up to 100 Mbps' },
        { id: '100_300', label: '100 – 300 Mbps' },
        { id: '300_500', label: '300 – 500 Mbps' },
        { id: 'above_500', label: 'Above 500 Mbps' },
      ].filter((opt) => products.some((p) => matchesSpeedRange(p, opt.id))),
    [products]
  );

  const availableChipCategories = useMemo(
    () => CHIP_CATEGORIES.filter((c) => products.some((p) => getTypeOf(p) === c)),
    [products]
  );

  // Group filtered products into Category Sections (Voice, Broadband, PEO TV)
  const categorySections = useMemo(() => {
    const voiceProds = filteredProducts.filter((p) => (p.category || p.name || '').toLowerCase().includes('voice'));
    const broadbandProds = filteredProducts.filter((p) => {
      const cat = (p.category || p.name || '').toLowerCase();
      return cat.includes('fibre') || cat.includes('lte') || cat.includes('broadband');
    });
    const peoTvProds = filteredProducts.filter((p) => (p.category || p.name || '').toLowerCase().includes('peo'));

    const sections = [];

    if (voiceProds.length > 0 && (activeCategory === 'All Products' || activeCategory === 'Voice')) {
      sections.push({
        id: 'voice-section',
        title: t('catalog.sections.voiceTitle', 'Voice Packages (Max 1)'),
        subtitle: t('catalog.sections.voiceSubtitle', 'Voice packages for crystal clear home & office calls'),
        icon: <FiPhone />,
        products: voiceProds,
      });
    }

    if (broadbandProds.length > 0 && (activeCategory === 'All Products' || activeCategory === 'Fibre Broadband' || activeCategory === 'LTE Home')) {
      sections.push({
        id: 'broadband-section',
        title: t('catalog.sections.broadbandTitle', 'Broadband Packages (Fibre & LTE - Max 1)'),
        subtitle: t('catalog.sections.broadbandSubtitle', 'High-speed internet for home, gaming & business'),
        icon: <FiGlobe />,
        products: broadbandProds,
      });
    }

    if (peoTvProds.length > 0 && (activeCategory === 'All Products' || activeCategory === 'PEO TV')) {
      sections.push({
        id: 'peotv-section',
        title: t('catalog.sections.peoTvTitle', 'PEO TV Packages (Max 1)'),
        subtitle: t('catalog.sections.peoTvSubtitle', 'Live HD channels, catch-up TV & 4K entertainment'),
        icon: <FiTv />,
        products: peoTvProds,
      });
    }

    return sections;
  }, [filteredProducts, activeCategory, t, i18n.language]);

  const sidebarProps = {
    activeCategory,
    onSelectTreeNode: handleSelectTreeNode,
    onSelectCategory: handleSelectCategory,
    activeTreeKey: treeFilter?.key || null,
    typeOptions: loading ? undefined : typeOptions,
    speedOptions: loading ? undefined : speedOptions,
    typeCounts: loading ? undefined : typeCounts,
    speedCounts: loading ? undefined : speedCounts,
    selectedTypes,
    onTypeToggle: handleTypeToggle,
    selectedSpeeds,
    onSpeedToggle: handleSpeedToggle,
    onClearAll: handleClearAll,
  };

  const valueProps = [
    { icon: FiCheckCircle, title: t('catalog.value.guaranteed', '100% Guaranteed'), text: t('catalog.value.guaranteedText', 'Authentic SLT Services') },
    { icon: FiClock, title: t('catalog.value.express', 'Express Activation'), text: t('catalog.value.expressText', 'Connected in 24-48 Hrs') },
    { icon: FiShield, title: t('catalog.value.secure', 'Secure Payments'), text: t('catalog.value.secureText', 'Bank Grade Security') },
    { icon: FiSliders, title: t('catalog.value.flexi', 'Flexi Customization'), text: t('catalog.value.flexiText', 'Tailored Add-on Options') },
    { icon: FiLock, title: t('catalog.value.paperless', 'Paperless Process'), text: t('catalog.value.paperlessText', '100% Online Verification') },
  ];

  return (
    <div>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div className="shop-page">
        <CatalogHero
          onShopNow={() =>
            document.getElementById('products-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
          }
        />

        <div className="shop-layout" id="products-section" style={{ scrollMarginTop: 140 }}>
          {/* Filters: live category tree + product-type / speed options derived from the API */}
          <div className="shop-sidebar">
            <SidebarFilters {...sidebarProps} />
          </div>

          {/* Phone filter sheet. Portaled to <body> because position:fixed breaks
              under the PageWrapper's animated (transformed) ancestor otherwise. */}
          {showMobileFilters &&
            createPortal(
              <div
                className="filter-sheet-backdrop"
                onClick={(e) => {
                  if (e.target === e.currentTarget) setShowMobileFilters(false);
                }}
              >
                <div className="filter-sheet" role="dialog" aria-modal="true" aria-label={t('catalog.filters.title', 'Filter products')}>
                  <SidebarFilters
                    {...sidebarProps}
                    onSelectCategory={(cat) => {
                      handleSelectCategory(cat);
                      setShowMobileFilters(false);
                    }}
                    onSelectTreeNode={(node, parentNode) => {
                      handleSelectTreeNode(node, parentNode);
                      setShowMobileFilters(false);
                    }}
                    onApply={() => setShowMobileFilters(false)}
                    onCloseMobile={() => setShowMobileFilters(false)}
                  />
                </div>
              </div>,
              document.body
            )}

          <div className="shop-main">
            <CategoryChips
              activeCategory={activeCategory}
              onSelectCategory={handleSelectCategory}
              available={loading ? undefined : availableChipCategories}
            />

            <div className="shop-toolbar">
              <h2>
                {t('catalog.title', 'All packages')}
                {!loading && (
                  <span className="shop-count">
                    {t('catalog.controls.results', { count: filteredProducts.length, defaultValue: '{{count}} results' })}
                  </span>
                )}
              </h2>
              <div className="shop-toolbar__ctrls">
                <button
                  type="button"
                  className="btn-ds btn-ds--outline filter-toggle"
                  onClick={() => setShowMobileFilters(true)}
                  style={{ minHeight: 44 }}
                >
                  <FiFilter size={16} aria-hidden="true" />
                  <span>{t('catalog.controls.filters', 'Filters')}</span>
                </button>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 600, color: 'var(--muted)' }}>
                  <span>{t('catalog.controls.sortBy', 'Sort by:')}</span>
                  <select className="ctrl-select" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                    <option value="Popularity">{t('catalog.controls.popularity', 'Popularity')}</option>
                    <option value="Price Low to High">{t('catalog.controls.priceLowHigh', 'Price: Low → High')}</option>
                    <option value="Price High to Low">{t('catalog.controls.priceHighLow', 'Price: High → Low')}</option>
                  </select>
                </label>
                <div className="view-toggle" role="group" aria-label={t('catalog.controls.view', 'View')}>
                  <button type="button" onClick={() => setViewMode('grid')} aria-label="Grid view" aria-pressed={viewMode === 'grid'}>
                    <FiGrid size={18} aria-hidden="true" />
                  </button>
                  <button type="button" onClick={() => setViewMode('list')} aria-label="List view" aria-pressed={viewMode === 'list'}>
                    <FiList size={18} aria-hidden="true" />
                  </button>
                </div>
              </div>
            </div>

            {loading ? (
              <div className="pgrid" aria-busy="true">
                <SkeletonCard />
                <SkeletonCard />
                <SkeletonCard />
                <SkeletonCard />
              </div>
            ) : error ? (
              <div className="empty-state" role="alert">
                <p style={{ fontWeight: 700, color: 'var(--danger)', margin: 0 }}>{error}</p>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="empty-state">
                <h3 style={{ margin: 0 }}>{t('catalog.empty.title', 'No Products Found')}</h3>
                <p style={{ margin: 0, color: 'var(--muted)' }}>
                  {t('catalog.empty.subtitle', 'Try adjusting your filters or search keywords.')}
                </p>
                <button type="button" className="btn-ds btn-ds--primary" onClick={handleClearAll}>
                  {t('catalog.empty.resetFilters', 'Reset Filters')}
                </button>
              </div>
            ) : (
              categorySections.map((section) => {
                if (section.products.length === 0) return null;
                return (
                  <section key={section.id} className="cat-section" aria-labelledby={`${section.id}-h`}>
                    <div className="cat-section__head">
                      <span className="cat-section__tile" aria-hidden="true">
                        {section.icon}
                      </span>
                      <div>
                        <h3 id={`${section.id}-h`}>{section.title}</h3>
                        <p>{section.subtitle}</p>
                      </div>
                      <span className="cat-section__count">
                        {t('catalog.sections.packagesAvailable', {
                          count: section.products.length,
                          defaultValue: '{{count}} Packages Available',
                        })}
                      </span>
                    </div>

                    <div className={`pgrid${viewMode === 'list' ? ' pgrid--list' : ''}`}>
                      {section.products.map((prod) => {
                        const prodId = String(prod._id || prod.id);
                        const isSelected = selectedProduct && String(selectedProduct._id || selectedProduct.id) === prodId;

                        const catName = (prod.category || prod.name || '').toLowerCase();
                        const prodGroup = catName.includes('voice') ? 'Voice' : catName.includes('peo') ? 'PEO TV' : 'Broadband';

                        const isInCart = cartCategoryAnalysis.selectedProdIds.has(prodId);
                        const isGroupTaken = cartCategoryAnalysis.categoriesInCart.has(prodGroup);

                        // Rule: Max 1 package per category -> disable other packages in same category once selected
                        const isCategoryDisabled = isGroupTaken && !isInCart;
                        const groupLabel =
                          prodGroup === 'Voice'
                            ? t('catalog.categories.voice', 'Voice')
                            : prodGroup === 'PEO TV'
                              ? t('catalog.categories.peoTv', 'PEO TV')
                              : t('catalog.categories.broadband', 'Broadband');
                        const disabledReason = t('catalog.card.categorySelectedReason', {
                          group: groupLabel,
                          defaultValue: '1 {{group}} Selected',
                        });

                        return (
                          <ProductCard
                            key={prodId}
                            product={prod}
                            isSelected={isSelected}
                            isFavorite={favorites.includes(prodId)}
                            isInCart={isInCart}
                            onSelect={(p) => setSelectedProduct(p)}
                            onToggleFavorite={handleToggleFavorite}
                            onAddToCart={(p) => handleAddToCart(p, 1)}
                            onRemoveFromCart={handleRemoveFromCart}
                            disabled={isCategoryDisabled}
                            disabledReason={disabledReason}
                            viewMode={viewMode}
                          />
                        );
                      })}
                    </div>
                  </section>
                );
              })
            )}
          </div>
        </div>

        <div className="value-strip">
          {valueProps.map(({ icon: Icon, title, text }) => (
            <div key={title} className="value-strip__item">
              <span className="value-strip__ic">
                <Icon size={22} aria-hidden="true" />
              </span>
              <div>
                <strong>{title}</strong>
                <span>{text}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Product Details & Specifications Hub Modal */}
      {selectedProduct && (
        <PackageDetailModal
          isOpen={Boolean(selectedProduct)}
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onSelectPackage={(prod) => {
            handleAddToCart(prod, 1);
            setSelectedProduct(null);
          }}
        />
      )}
    </div>
  );
}
