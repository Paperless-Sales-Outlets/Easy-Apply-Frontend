import React, { useEffect, useState, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import { FiGrid, FiList, FiSliders, FiPhone, FiGlobe, FiTv } from 'react-icons/fi';
import CategoryChips from '../components/catalog/CategoryChips';
import SidebarFilters from '../components/catalog/SidebarFilters';
import ProductCard from '../components/catalog/ProductCard';
import PackageDetailModal from '../components/PackageDetailModal';
import SkeletonCard from '../components/catalog/SkeletonCard';
import Toast from '../../shared/components/common/Toast';
import HeroBannerCarousel from '../components/catalog/HeroBannerCarousel';
import { getProducts, addToCart, removeFromCart, getLocalCart } from '../services/productService';

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

const isLteOrFtthProduct = (product = {}) => {
  const productText = `${product.category || ''} ${product.name || ''} ${product.productName || ''}`.toLowerCase();
  return /\blte\b|\b4g\b|\bftth\b|\bfibre\b|\bfiber\b/.test(productText);
};

const openPackageSelectionPortal = (url) => {
  window.open(url || import.meta.env.VITE_PACKAGE_SELECTION_PORTAL_URL || 'https://dpdlab1.slt.lk:703', '_blank', 'noopener,noreferrer');
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

/** Product catalogue with category and filter controls. */
export default function ProductCatalogPage() {
  const { t, i18n } = useTranslation();
  const [products, setProducts] = useState([]);
  const [packageSelectionUrl, setPackageSelectionUrl] = useState(import.meta.env.VITE_PACKAGE_SELECTION_PORTAL_URL || 'https://dpdlab1.slt.lk:703');
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
        setPackageSelectionUrl(res.packageSelectionUrl || import.meta.env.VITE_PACKAGE_SELECTION_PORTAL_URL || 'https://dpdlab1.slt.lk:703');
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
    } catch {
      showToast(`${prod.name} added to cart!`, 'success');
    }
  };

  const handleRemoveFromCart = async (prod) => {
    const prodId = String(prod._id || prod.id);
    try {
      await removeFromCart(prodId);
      setCartItems(getLocalCart());
      showToast(`${prod.name} removed from cart.`, 'info');
    } catch {
      setCartItems(getLocalCart());
    }
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
        subtitle: t('catalog.sections.voiceSubtitle', 'Crystal clear crystal voice calling for home & enterprise'),
        icon: <FiPhone />,
        bgColor: 'var(--green-50)',
        iconColor: 'var(--green-700)',
        badgeBg: 'var(--green-100)',
        badgeColor: 'var(--green-700)',
        products: voiceProds,
      });
    }

    if (broadbandProds.length > 0 && (activeCategory === 'All Products' || activeCategory === 'Fibre Broadband' || activeCategory === 'LTE Home')) {
      sections.push({
        id: 'broadband-section',
        title: t('catalog.sections.broadbandTitle', 'Broadband Packages (Fibre & LTE - Max 1)'),
        subtitle: t('catalog.sections.broadbandSubtitle', 'High-speed broadband internet for home, 4K streaming & gaming'),
        icon: <FiGlobe />,
        bgColor: 'var(--blue-50)',
        iconColor: 'var(--blue-500)',
        badgeBg: 'var(--blue-100)',
        badgeColor: 'var(--blue-700)',
        products: broadbandProds,
      });
    }

    if (peoTvProds.length > 0 && (activeCategory === 'All Products' || activeCategory === 'PEO TV')) {
      sections.push({
        id: 'peotv-section',
        title: t('catalog.sections.peoTvTitle', 'PEO TV Packages (Max 1)'),
        subtitle: t('catalog.sections.peoTvSubtitle', 'Live HD channels, catch-up TV & cinema entertainment'),
        icon: <FiTv />,
        bgColor: '#f5f3ff',
        iconColor: '#7c3aed',
        badgeBg: '#ede9fe',
        badgeColor: '#6d28d9',
        products: peoTvProds,
      });
    }

    return sections;
  }, [filteredProducts, activeCategory, t, i18n.language]);

  return (
    <div className="catalog-root">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* Main Container */}
      <HeroBannerCarousel />

      <div className="catalog-page">

        {/* ── Voice Compulsory & Bundle Rules Status Bar (Commented out: single package selection allowed) ──
        <div
          style={{
            backgroundColor: cartCategoryAnalysis.hasVoice ? '#f1faf1' : '#f1f7fd',
            border: `1.5px solid ${cartCategoryAnalysis.hasVoice ? '#9bd89a' : '#8ebde8'}`,
            borderRadius: 'var(--radius-lg)',
            padding: '0.85rem 1.25rem',
            marginTop: '1.25rem',
            marginBottom: '0.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '0.75rem',
            boxShadow: 'var(--shadow-md)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <span style={{ fontSize: '1.2rem', color: cartCategoryAnalysis.hasVoice ? '#0f7a4d' : '#0a4b8c' }}>
              {cartCategoryAnalysis.hasVoice ? <FiCheckCircle /> : <FiAlertCircle />}
            </span>
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.88rem', color: cartCategoryAnalysis.hasVoice ? '#14532d' : '#1e40af' }}>
                {cartCategoryAnalysis.hasVoice ? t('catalog.bundleRules.selected', 'Voice Package Selected') : t('catalog.bundleRules.required', 'Voice Package Required (Compulsory)')}
              </div>
              <div style={{ fontSize: '0.78rem', color: cartCategoryAnalysis.hasVoice ? '#0f7a4d' : '#1e3a8a', fontWeight: 600 }}>
                {t('catalog.bundleRules.allowedBundles', 'Allowed bundles:')} <strong>{t('catalog.bundleRules.voiceOnly', 'Voice Only')}</strong> • <strong>{t('catalog.bundleRules.voiceBroadband', 'Voice + Broadband')}</strong> • <strong>{t('catalog.bundleRules.voiceBroadbandPeoTv', 'Voice + Broadband + PEO TV')}</strong> {t('catalog.bundleRules.maxOne', '(Max 1 package per category)')}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <span
              style={{
                padding: '0.25rem 0.65rem',
                borderRadius: '9999px',
                fontSize: '0.75rem',
                fontWeight: 700,
                backgroundColor: cartCategoryAnalysis.hasVoice ? '#e2f4e3' : '#e3effc',
                color: cartCategoryAnalysis.hasVoice ? '#0f7a4d' : '#0a4b8c',
              }}
            >
              {t('catalog.bundleRules.voiceLabel', 'Voice:')} {cartCategoryAnalysis.hasVoice ? t('catalog.bundleRules.selectedCount', 'Selected (1/1)') : t('catalog.bundleRules.requiredCount', 'Required (0/1)')}
            </span>
            <span
              style={{
                padding: '0.25rem 0.65rem',
                borderRadius: '9999px',
                fontSize: '0.75rem',
                fontWeight: 700,
                backgroundColor: cartCategoryAnalysis.hasBroadband ? '#e2f4e3' : '#eef2f7',
                color: cartCategoryAnalysis.hasBroadband ? '#0f7a4d' : '#556070',
              }}
            >
              {t('catalog.bundleRules.broadbandLabel', 'Broadband:')} {cartCategoryAnalysis.hasBroadband ? t('catalog.bundleRules.selectedCount', 'Selected (1/1)') : t('catalog.bundleRules.optionalCount', 'Optional (0/1)')}
            </span>
            <span
              style={{
                padding: '0.25rem 0.65rem',
                borderRadius: '9999px',
                fontSize: '0.75rem',
                fontWeight: 700,
                backgroundColor: cartCategoryAnalysis.hasPeoTv ? '#e2f4e3' : '#eef2f7',
                color: cartCategoryAnalysis.hasPeoTv ? '#0f7a4d' : '#556070',
              }}
            >
              {t('catalog.bundleRules.peoTvLabel', 'PEO TV:')} {cartCategoryAnalysis.hasPeoTv ? t('catalog.bundleRules.selectedCount', 'Selected (1/1)') : t('catalog.bundleRules.optionalCount', 'Optional (0/1)')}
            </span>

            {cartItems.length > 0 && (
              <button
                onClick={handleClearCartSelection}
                type="button"
                style={{
                  backgroundColor: 'var(--red-100)',
                  color: 'var(--red-700)',
                  border: '1px solid var(--red-200)',
                  padding: '0.25rem 0.65rem',
                  borderRadius: '9999px',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                {t('catalog.bundleRules.resetSelection', 'Reset Selection')} ↺
              </button>
            )}
          </div>
        </div>
        ── */}

        {/* ── Horizontal Category Pill Chips Bar ── */}
        <div id="products-section" className="scroll-target">
          <CategoryChips
            activeCategory={activeCategory}
            onSelectCategory={handleSelectCategory}
          />
        </div>

        {/* ── Main Catalog Body Layout (Sidebar Filters + Category-Wise Products) ── */}
        <div className="catalog-layout-grid">
          {/* Left Sidebar Filter Column — desktop only; hidden ≤900px in favor of the "Filters" popup below */}
          <div className="catalog-sidebar-col">
            <SidebarFilters
              activeCategory={activeCategory}
              onSelectCategory={handleSelectCategory}
              onSelectTreeNode={handleSelectTreeNode}
              activeTreeKey={treeFilter?.key || null}
              typeCounts={loading ? undefined : typeCounts}
              speedCounts={loading ? undefined : speedCounts}
              selectedTypes={selectedTypes}
              onTypeToggle={handleTypeToggle}
              selectedSpeeds={selectedSpeeds}
              onSpeedToggle={handleSpeedToggle}
              onClearAll={handleClearAll}
            />
          </div>

          {/* Mobile/tablet filter popup. Portaled to <body> because position:fixed
              breaks under the PageWrapper's animated (transformed) ancestor otherwise. */}
          {showMobileFilters &&
            createPortal(
              <div
                className="catalog-filter-modal-backdrop"
                onClick={(e) => {
                  if (e.target === e.currentTarget) setShowMobileFilters(false);
                }}
              >
                <div className="catalog-sidebar-col-inner">
                  <SidebarFilters
                    activeCategory={activeCategory}
                    onSelectCategory={(cat) => {
                      handleSelectCategory(cat);
                      setShowMobileFilters(false);
                    }}
                    onSelectTreeNode={(node, parentNode) => {
                      handleSelectTreeNode(node, parentNode);
                      setShowMobileFilters(false);
                    }}
                    activeTreeKey={treeFilter?.key || null}
                    typeCounts={loading ? undefined : typeCounts}
                    speedCounts={loading ? undefined : speedCounts}
                    selectedTypes={selectedTypes}
                    onTypeToggle={handleTypeToggle}
                    selectedSpeeds={selectedSpeeds}
                    onSpeedToggle={handleSpeedToggle}
                    onClearAll={handleClearAll}
                    onApply={() => setShowMobileFilters(false)}
                    onCloseMobile={() => setShowMobileFilters(false)}
                  />
                </div>
              </div>,
              document.body
            )}

          {/* Right Product Listing Area */}
          <div>
            {/* Toolbar */}
            <div className="catalog-toolbar">
              <p className="catalog-count">
                {t('catalog.controls.showingResults', { count: filteredProducts.length, defaultValue: 'Showing {{count}} total packages' })}
              </p>

              <div className="catalog-controls">
                <button
                  type="button"
                  className="btn btn-secondary catalog-filter-toggle-btn"
                  onClick={() => setShowMobileFilters((prev) => !prev)}
                >
                  <FiSliders size={16} aria-hidden="true" />
                  {t('catalog.controls.filters', 'Filters')}
                </button>

                <label className="catalog-sort">
                  <span>{t('catalog.controls.sortBy', 'Sort by:')}</span>
                  <select className="form-control" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                    <option value="Popularity">{t('catalog.controls.popularity', 'Popularity')}</option>
                    <option value="Price Low to High">{t('catalog.controls.priceLowHigh', 'Price: Low → High')}</option>
                    <option value="Price High to Low">{t('catalog.controls.priceHighLow', 'Price: High → Low')}</option>
                  </select>
                </label>

                <div className="catalog-view-toggle" role="group" aria-label="View">
                  <button type="button" onClick={() => setViewMode('grid')} aria-label="Grid view" aria-pressed={viewMode === 'grid'}>
                    <FiGrid size={18} aria-hidden="true" />
                  </button>
                  <button type="button" onClick={() => setViewMode('list')} aria-label="List view" aria-pressed={viewMode === 'list'}>
                    <FiList size={18} aria-hidden="true" />
                  </button>
                </div>
              </div>
            </div>

            {/* Category-Wise Product Sections */}
            {loading ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))', gap: '1.25rem' }}>
                <SkeletonCard /><SkeletonCard /><SkeletonCard /><SkeletonCard /><SkeletonCard />
              </div>
            ) : error ? (
              <div style={{ backgroundColor: '#fef3f2', border: '1px solid #f5c2bd', borderRadius: 'var(--radius-lg)', padding: '2rem', color: '#b42318', textAlign: 'center' }}>
                <p style={{ fontWeight: 600, margin: 0 }}>{error}</p>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div style={{ backgroundColor: '#ffffff', borderRadius: 'var(--radius-lg)', padding: '3rem 1.5rem', textAlign: 'center', border: '1px solid #dfe5ee' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#26344b', marginBottom: '0.5rem' }}>{t('catalog.empty.title', 'No Products Found')}</h3>
                <p style={{ fontSize: '0.875rem', color: '#52627a', marginBottom: '1rem' }}>{t('catalog.empty.subtitle', 'Try adjusting your filters or search keywords.')}</p>
                <button onClick={handleClearAll} style={{ backgroundColor: '#0056a2', color: '#ffffff', border: 'none', borderRadius: 'var(--radius)', padding: '0.5rem 1.25rem', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer' }}>
                  {t('catalog.empty.resetFilters', 'Reset Filters')}
                </button>
              </div>
            ) : (
              <div className="catalog-sections">
                {categorySections.map((section) => {
                  if (section.products.length === 0) return null;
                  return (
                    <section key={section.id} className="catalog-section">
                      <header className="catalog-section-head">
                        <div>
                          <h2 className="catalog-section-title">{section.title}</h2>
                          <p className="catalog-section-sub">{section.subtitle}</p>
                        </div>
                        <span className="catalog-section-count">
                          {t('catalog.sections.packagesAvailable', {
                            count: section.products.length,
                            defaultValue: '{{count}} Packages Available',
                          })}
                        </span>
                      </header>

                      {/* Section Cards Grid */}
                      <div className={viewMode === 'list' ? 'catalog-list' : 'catalog-grid'}>
                        {section.products.map((prod) => {
                          const prodId = String(prod._id || prod.id);
                          const isSelected = selectedProduct && String(selectedProduct._id || selectedProduct.id) === prodId;

                          const catName = (prod.category || prod.name || '').toLowerCase();
                          const prodGroup = catName.includes('voice') ? 'Voice' : catName.includes('peo') ? 'PEO TV' : 'Broadband';

                          const isInCart = cartCategoryAnalysis.selectedProdIds.has(prodId);
                          const isGroupTaken = cartCategoryAnalysis.categoriesInCart.has(prodGroup);

                          // Rule: Max 1 package per category -> disable other packages in same category once selected
                          const isCategoryDisabled = isGroupTaken && !isInCart;
                          const groupLabel = prodGroup === 'Voice'
                            ? t('catalog.categories.voice', 'Voice')
                            : prodGroup === 'PEO TV'
                              ? t('catalog.categories.peoTv', 'PEO TV')
                              : t('catalog.categories.broadband', 'Broadband');
                          const disabledReason = t('catalog.card.categorySelectedReason', { group: groupLabel, defaultValue: '1 {{group}} Selected' });

                          return (
                            <ProductCard
                              key={prodId}
                              product={prod}
                              isSelected={isSelected}
                              isFavorite={favorites.includes(prodId)}
                              isInCart={isInCart}
                              onSelect={(p) => {
                                if (isLteOrFtthProduct(p)) {
                                  const shouldContinue = window.confirm('LTE and FTTH package selection is available in our package selection portal. Would you like to continue there?');
                                  if (shouldContinue) openPackageSelectionPortal(packageSelectionUrl);
                                  return;
                                }
                                setSelectedProduct(p);
                              }}
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
                })}
              </div>
            )}
          </div>
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
