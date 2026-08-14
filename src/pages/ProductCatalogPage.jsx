import React, { useEffect, useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiGrid, FiList, FiCheckCircle, FiClock, FiShield, FiSliders, FiLock, FiPhone, FiGlobe, FiTv, FiAlertCircle, FiCheck } from 'react-icons/fi';
import CategoryChips from '../components/catalog/CategoryChips';
import SidebarFilters from '../components/catalog/SidebarFilters';
import ProductCard from '../components/catalog/ProductCard';
import ProductDetailsPanel from '../components/catalog/ProductDetailsPanel';
import SkeletonCard from '../components/catalog/SkeletonCard';
import Toast from '../components/common/Toast';
import HeroBannerCarousel from '../components/catalog/HeroBannerCarousel';
import { getProducts, addToCart, getLocalCart, clearCart } from '../services/productService';

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
    features: ['100+ Live HD Channels', 'Sports & Movies Pack', 'Catch-up TV'],
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
    features: ['50+ Live HD Channels', '7-Day Catch-up TV', 'Rewind Live TV'],
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
    features: ['75+ Premium Channels', 'Kids & News Pack', 'Pause Live TV'],
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
    features: ['All 130+ HD Channels', '4K Movies & VOD', 'Multi-Room Support'],
  },
];

export default function ProductCatalogPage() {
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [activeCategory, setActiveCategory] = useState('All Products');
  const [selectedTypes, setSelectedTypes] = useState([]);
  const [selectedSpeeds, setSelectedSpeeds] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('Popularity');
  const [viewMode, setViewMode] = useState('grid');

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
          const merged = DEFAULT_MOCKUP_PRODUCTS.map((mock) => {
            const found = list.find((p) => p.name?.toLowerCase().trim() === mock.name.toLowerCase().trim());
            return found ? { ...mock, ...found, features: mock.features, monthlyPrice: mock.monthlyPrice } : mock;
          });
          setProducts(merged);
        } else {
          setProducts(DEFAULT_MOCKUP_PRODUCTS);
        }
      } catch (err) {
        console.warn('Using mockup products:', err);
        setProducts(DEFAULT_MOCKUP_PRODUCTS);
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

  const handleClearAll = () => {
    setActiveCategory('All Products');
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

      if (group !== 'Voice' && !cartCategoryAnalysis.hasVoice) {
        showToast(`Added ${prod.name}! Remember: 1 Voice package is COMPULSORY to checkout.`, 'info');
      } else {
        showToast(`${prod.name} added to cart!`, 'success');
      }
    } catch (err) {
      showToast(`${prod.name} added to cart!`, 'success');
    }
  };

  const handleClearCartSelection = async () => {
    await clearCart();
    setCartItems([]);
    showToast('Selection reset. All packages are now unselected.', 'info');
  };

  const filteredProducts = useMemo(() => {
    let list = products.filter((p) => {
      // Category filter
      if (activeCategory !== 'All Products') {
        const cat = (p.category || p.name || '').toLowerCase();
        if (activeCategory === 'Voice' && !cat.includes('voice')) return false;
        if (activeCategory === 'Fibre Broadband' && !cat.includes('fibre') && !cat.includes('broadband')) return false;
        if (activeCategory === 'PEO TV' && !cat.includes('peo')) return false;
      }
      // Product Type checkbox filter
      if (selectedTypes.length > 0) {
        const matchType = selectedTypes.some((type) => {
          const catName = (p.category || '').toLowerCase();
          return catName.includes(type.toLowerCase());
        });
        if (!matchType) return false;
      }
      // Search query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const nameMatch = p.name.toLowerCase().includes(q);
        const catMatch = (p.category || '').toLowerCase().includes(q);
        if (!nameMatch && !catMatch) return false;
      }
      return true;
    });

    // Sorting logic
    if (sortBy === 'Price Low to High') {
      list.sort((a, b) => a.monthlyPrice - b.monthlyPrice);
    } else if (sortBy === 'Price High to Low') {
      list.sort((a, b) => b.monthlyPrice - a.monthlyPrice);
    }

    return list;
  }, [products, activeCategory, selectedTypes, searchQuery, sortBy]);

  // Group filtered products into Category Sections (Voice, Broadband, PEO TV)
  const categorySections = useMemo(() => {
    const voiceProds = filteredProducts.filter((p) => (p.category || p.name || '').toLowerCase().includes('voice'));
    const broadbandProds = filteredProducts.filter((p) => {
      const cat = (p.category || p.name || '').toLowerCase();
      return cat.includes('fibre') || cat.includes('lte') || cat.includes('broadband');
    });
    const peoTvProds = filteredProducts.filter((p) => (p.category || p.name || '').toLowerCase().includes('peo'));

    const sections = [];

    if (activeCategory === 'All Products' || activeCategory === 'Voice') {
      sections.push({
        id: 'voice-section',
        title: 'Voice Packages (Compulsory - Max 1)',
        subtitle: '1 Voice package is required for all connection bundles',
        icon: <FiPhone />,
        bgColor: '#e0f2fe',
        iconColor: '#0284c7',
        products: voiceProds,
      });
    }

    if (activeCategory === 'All Products' || activeCategory === 'Fibre Broadband' || activeCategory === 'LTE Home') {
      sections.push({
        id: 'broadband-section',
        title: 'Broadband Packages (Fibre & LTE - Max 1)',
        subtitle: 'High-speed internet for home, gaming & business',
        icon: <FiGlobe />,
        bgColor: '#e6f4ea',
        iconColor: '#137333',
        products: broadbandProds,
      });
    }

    if (activeCategory === 'All Products' || activeCategory === 'PEO TV') {
      sections.push({
        id: 'peotv-section',
        title: 'PEO TV Packages (Max 1)',
        subtitle: 'Live HD channels, catch-up TV & 4K entertainment',
        icon: <FiTv />,
        bgColor: '#fef3c7',
        iconColor: '#d97706',
        products: peoTvProds,
      });
    }

    return sections;
  }, [filteredProducts, activeCategory]);

  return (
    <div style={{ backgroundColor: '#f8fafc', minHeight: '100vh', paddingBottom: '3rem' }}>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* Main Container */}
      <div style={{ maxWidth: '1440px', margin: '0 auto', padding: '1.5rem 1.5rem' }}>
        {/* ── Top Hero Banner & Quick Actions Section ── */}
        <HeroBannerCarousel onShopNow={() => {}} />

        {/* ── Voice Compulsory & Bundle Rules Status Bar ── */}
        <div
          style={{
            backgroundColor: cartCategoryAnalysis.hasVoice ? '#f0fdf4' : '#eff6ff',
            border: `1.5px solid ${cartCategoryAnalysis.hasVoice ? '#86efac' : '#93c5fd'}`,
            borderRadius: '14px',
            padding: '0.85rem 1.25rem',
            marginTop: '1.25rem',
            marginBottom: '0.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '0.75rem',
            boxShadow: '0 4px 15px rgba(0, 0, 0, 0.03)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <span style={{ fontSize: '1.2rem', color: cartCategoryAnalysis.hasVoice ? '#16a34a' : '#1d4ed8' }}>
              {cartCategoryAnalysis.hasVoice ? <FiCheckCircle /> : <FiAlertCircle />}
            </span>
            <div>
              <div style={{ fontWeight: 800, fontSize: '0.88rem', color: cartCategoryAnalysis.hasVoice ? '#14532d' : '#1e40af' }}>
                {cartCategoryAnalysis.hasVoice ? 'Voice Package Selected' : 'Voice Package Required (Compulsory)'}
              </div>
              <div style={{ fontSize: '0.78rem', color: cartCategoryAnalysis.hasVoice ? '#15803d' : '#1e3a8a', fontWeight: 600 }}>
                Allowed bundles: <strong>Voice Only</strong> • <strong>Voice + Broadband</strong> • <strong>Voice + Broadband + PEO TV</strong> (Max 1 package per category)
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <span
              style={{
                padding: '0.25rem 0.65rem',
                borderRadius: '9999px',
                fontSize: '0.75rem',
                fontWeight: 800,
                backgroundColor: cartCategoryAnalysis.hasVoice ? '#dcfce7' : '#dbeafe',
                color: cartCategoryAnalysis.hasVoice ? '#15803d' : '#1d4ed8',
              }}
            >
              Voice: {cartCategoryAnalysis.hasVoice ? 'Selected (1/1)' : 'Required (0/1)'}
            </span>
            <span
              style={{
                padding: '0.25rem 0.65rem',
                borderRadius: '9999px',
                fontSize: '0.75rem',
                fontWeight: 800,
                backgroundColor: cartCategoryAnalysis.hasBroadband ? '#dcfce7' : '#f1f5f9',
                color: cartCategoryAnalysis.hasBroadband ? '#15803d' : '#64748b',
              }}
            >
              Broadband: {cartCategoryAnalysis.hasBroadband ? 'Selected (1/1)' : 'Optional (0/1)'}
            </span>
            <span
              style={{
                padding: '0.25rem 0.65rem',
                borderRadius: '9999px',
                fontSize: '0.75rem',
                fontWeight: 800,
                backgroundColor: cartCategoryAnalysis.hasPeoTv ? '#dcfce7' : '#f1f5f9',
                color: cartCategoryAnalysis.hasPeoTv ? '#15803d' : '#64748b',
              }}
            >
              PEO TV: {cartCategoryAnalysis.hasPeoTv ? 'Selected (1/1)' : 'Optional (0/1)'}
            </span>

            {cartItems.length > 0 && (
              <button
                onClick={handleClearCartSelection}
                type="button"
                style={{
                  backgroundColor: '#fee2e2',
                  color: '#dc2626',
                  border: '1px solid #fca5a5',
                  padding: '0.25rem 0.65rem',
                  borderRadius: '9999px',
                  fontSize: '0.75rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                Reset Selection ↺
              </button>
            )}
          </div>
        </div>

        {/* ── Horizontal Category Pill Chips Bar ── */}
        <CategoryChips
          activeCategory={activeCategory}
          onSelectCategory={(cat) => setActiveCategory(cat)}
        />

        {/* ── Main Catalog Body Layout (Sidebar Filters + Category-Wise Products) ── */}
        <div style={{ display: 'grid', gridTemplateColumns: '260px minmax(0, 1fr)', gap: '1.5rem', marginTop: '1.5rem' }}>
          {/* Left Sidebar Filter Column */}
          <div>
            <SidebarFilters
              selectedTypes={selectedTypes}
              onTypeToggle={handleTypeToggle}
              selectedSpeeds={selectedSpeeds}
              onSpeedToggle={handleSpeedToggle}
              onClearAll={handleClearAll}
            />
          </div>

          {/* Right Product Listing Area */}
          <div>
            {/* Toolbar Header */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '1.2rem',
                width: '100%',
              }}
            >
              <div style={{ fontSize: '0.92rem', color: '#475569', fontWeight: 600 }}>
                Showing <strong style={{ color: '#0f172a' }}>{filteredProducts.length}</strong> total results across categories
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <span style={{ fontSize: '0.82rem', color: '#64748b' }}>Sort by:</span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    style={{
                      padding: '0.4rem 0.75rem',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      backgroundColor: '#ffffff',
                      fontSize: '0.82rem',
                      fontWeight: 700,
                      color: '#0f172a',
                      cursor: 'pointer',
                      outline: 'none',
                    }}
                  >
                    <option value="Popularity">Popularity</option>
                    <option value="Price Low to High">Price: Low → High</option>
                    <option value="Price High to Low">Price: High → Low</option>
                  </select>
                </div>

                <div style={{ display: 'flex', gap: '2px', backgroundColor: '#f1f5f9', padding: '3px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <button
                    onClick={() => setViewMode('grid')}
                    style={{
                      border: 'none',
                      backgroundColor: viewMode === 'grid' ? '#0056b3' : 'transparent',
                      color: viewMode === 'grid' ? '#ffffff' : '#64748b',
                      padding: '0.35rem 0.55rem',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                    }}
                  >
                    <FiGrid size={15} />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    style={{
                      border: 'none',
                      backgroundColor: viewMode === 'list' ? '#0056b3' : 'transparent',
                      color: viewMode === 'list' ? '#ffffff' : '#64748b',
                      padding: '0.35rem 0.55rem',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                    }}
                  >
                    <FiList size={15} />
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
              <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '12px', padding: '2rem', color: '#991b1b', textAlign: 'center' }}>
                <p style={{ fontWeight: 600, margin: 0 }}>{error}</p>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div style={{ backgroundColor: '#fff', borderRadius: '16px', padding: '3rem 1.5rem', textAlign: 'center', border: '1px solid #e2e8f0' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#1e293b', marginBottom: '0.5rem' }}>No Products Found</h3>
                <p style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '1rem' }}>Try adjusting your filters or search keywords.</p>
                <button onClick={handleClearAll} style={{ backgroundColor: '#0056b3', color: '#fff', border: 'none', borderRadius: '8px', padding: '0.5rem 1.25rem', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer' }}>
                  Reset Filters
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
                {categorySections.map((section) => {
                  if (section.products.length === 0) return null;
                  return (
                    <div key={section.id} style={{ backgroundColor: '#ffffff', borderRadius: '18px', border: '1px solid #e2e8f0', padding: '1.5rem', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
                      {/* Section Header */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', paddingBottom: '0.75rem', borderBottom: '2px solid #f1f5f9' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <div style={{ backgroundColor: section.bgColor, color: section.iconColor, width: '38px', height: '38px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', fontWeight: 900 }}>
                            {section.icon}
                          </div>
                          <div>
                            <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 900, color: '#0f172a' }}>{section.title}</h3>
                            <span style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 600 }}>{section.subtitle}</span>
                          </div>
                        </div>
                        <span style={{ backgroundColor: '#f1f5f9', color: '#0056b3', padding: '0.3rem 0.85rem', borderRadius: '9999px', fontSize: '0.78rem', fontWeight: 800 }}>
                          {section.products.length} Packages Available
                        </span>
                      </div>

                      {/* Section Cards Grid */}
                      <div
                        style={
                          viewMode === 'list'
                            ? { display: 'flex', flexDirection: 'column', gap: '0.85rem' }
                            : {
                                display: 'grid',
                                gridTemplateColumns: `repeat(${Math.min(section.products.length, 5)}, minmax(0, 1fr))`,
                                gap: '1rem',
                              }
                        }
                        className={viewMode === 'list' ? '' : 'catalog-product-5-col-grid'}
                      >
                        {section.products.map((prod) => {
                          const prodId = String(prod._id || prod.id);
                          const isSelected = selectedProduct && String(selectedProduct._id || selectedProduct.id) === prodId;
                          
                          const catName = (prod.category || prod.name || '').toLowerCase();
                          const prodGroup = catName.includes('voice') ? 'Voice' : catName.includes('peo') ? 'PEO TV' : 'Broadband';

                          const isInCart = cartCategoryAnalysis.selectedProdIds.has(prodId);
                          const isGroupTaken = cartCategoryAnalysis.categoriesInCart.has(prodGroup);

                          // Rule: Max 1 package per category -> disable other packages in same category once selected
                          const isCategoryDisabled = isGroupTaken && !isInCart;
                          const disabledReason = `1 ${prodGroup} Selected`;

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
                              disabled={isCategoryDisabled}
                              disabledReason={disabledReason}
                              viewMode={viewMode}
                            />
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* ── Bottom Value Propositions Footer Strip (Exact 5 Icons Bar) ── */}
        <div
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            border: '1px solid #e2e8f0',
            padding: '1.25rem 2rem',
            marginTop: '2.5rem',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '1.5rem',
            boxShadow: '0 4px 15px rgba(0, 0, 0, 0.03)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <div style={{ backgroundColor: '#e0f2fe', color: '#0284c7', padding: '0.65rem', borderRadius: '12px' }}>
              <FiCheckCircle size={22} />
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: '0.88rem', color: '#0f172a' }}>100% Guaranteed</div>
              <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Authentic SLT Services</div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <div style={{ backgroundColor: '#dcfce7', color: '#16a34a', padding: '0.65rem', borderRadius: '12px' }}>
              <FiClock size={22} />
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: '0.88rem', color: '#0f172a' }}>Express Activation</div>
              <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Connected in 24-48 Hrs</div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <div style={{ backgroundColor: '#fef3c7', color: '#d97706', padding: '0.65rem', borderRadius: '12px' }}>
              <FiShield size={22} />
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: '0.88rem', color: '#0f172a' }}>Secure Payments</div>
              <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Bank Grade Security</div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <div style={{ backgroundColor: '#f3e8ff', color: '#9333ea', padding: '0.65rem', borderRadius: '12px' }}>
              <FiSliders size={22} />
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: '0.88rem', color: '#0f172a' }}>Flexi Customization</div>
              <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Tailored Add-on Options</div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <div style={{ backgroundColor: '#fae8ff', color: '#c026d3', padding: '0.65rem', borderRadius: '12px' }}>
              <FiLock size={22} />
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: '0.88rem', color: '#0f172a' }}>Paperless Process</div>
              <div style={{ fontSize: '0.75rem', color: '#64748b' }}>100% Online Verification</div>
            </div>
          </div>
        </div>
      </div>

      {/* Product Details Side Panel Modal */}
      {selectedProduct && (
        <ProductDetailsPanel
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onAddToCart={(prod) => {
            handleAddToCart(prod, 1);
            setSelectedProduct(null);
          }}
        />
      )}
    </div>
  );
}
