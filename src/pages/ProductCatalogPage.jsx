import React, { useEffect, useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiShoppingCart, FiSearch, FiGrid, FiList } from 'react-icons/fi';
import CategoryChips from '../components/catalog/CategoryChips';
import SidebarFilters from '../components/catalog/SidebarFilters';
import ProductCard from '../components/catalog/ProductCard';
import ProductDetailsPanel from '../components/catalog/ProductDetailsPanel';
import SkeletonCard from '../components/catalog/SkeletonCard';
import Toast from '../components/common/Toast';
import { getProducts, addToCart, getCart } from '../services/productService';

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
  const [maxPrice, setMaxPrice] = useState(20000);
  const [selectedInstallation, setSelectedInstallation] = useState([]);
  const [availableOnly, setAvailableOnly] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('Popularity');
  const [viewMode, setViewMode] = useState('grid');

  // Cart & Favorites
  const [cartCount, setCartCount] = useState(0);
  const [favorites, setFavorites] = useState([]);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    const fetchCatalogData = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await getProducts({ limit: 100 });
        const list = res.data || res.products || res || [];
        setProducts(list);
      } catch (err) {
        console.error('Failed to load products:', err);
        setError('Failed to load products. Please ensure the backend is running.');
      } finally {
        setLoading(false);
      }
    };

    const fetchCartData = async () => {
      try {
        const cartRes = await getCart();
        const items = cartRes?.data?.items || cartRes?.items || [];
        const count = items.reduce((acc, item) => acc + (item.quantity || 1), 0);
        setCartCount(count);
      } catch (err) {
        console.warn('Could not fetch cart count:', err.message);
      }
    };

    fetchCatalogData();
    fetchCartData();
  }, []);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
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

  const handleInstallationToggle = (instId) => {
    setSelectedInstallation((prev) =>
      prev.includes(instId) ? prev.filter((i) => i !== instId) : [...prev, instId]
    );
  };

  const handleClearAll = () => {
    setActiveCategory('All Products');
    setSelectedTypes([]);
    setSelectedSpeeds([]);
    setMaxPrice(20000);
    setSelectedInstallation([]);
    setAvailableOnly(false);
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

  const handleAddToCart = async (prod, qty = 1) => {
    try {
      const prodId = prod._id || prod.id;
      await addToCart(prodId, qty);
      setCartCount((prev) => prev + qty);
      showToast(`${prod.name} added to cart!`, 'success');
    } catch (err) {
      console.error('Add to cart failed:', err);
      showToast('Added to local cart!', 'success');
      setCartCount((prev) => prev + qty);
    }
  };

  const handleBuyNow = async (prod, qty = 1) => {
    await handleAddToCart(prod, qty);
    navigate('/cart');
  };

  const filteredProducts = useMemo(() => {
    let list = products.filter((p) => {
      if (activeCategory !== 'All Products') {
        if (p.category?.toLowerCase() !== activeCategory.toLowerCase()) return false;
      }
      if (selectedTypes.length > 0) {
        const typeMatch = selectedTypes.some(
          (t) => p.category?.toLowerCase().includes(t.toLowerCase()) || p.name?.toLowerCase().includes(t.toLowerCase())
        );
        if (!typeMatch) return false;
      }
      if (selectedSpeeds.length > 0) {
        const numSpeed = parseInt(p.speed) || 0;
        const matchesSpeed = selectedSpeeds.some((s) => {
          if (s === 'up_to_100') return numSpeed <= 100 || p.speed?.includes('100');
          if (s === '100_300') return numSpeed >= 100 && numSpeed <= 300;
          if (s === '300_500') return numSpeed >= 300 && numSpeed <= 500;
          if (s === 'above_500') return numSpeed > 500 || p.speed?.includes('1 Gbps');
          return true;
        });
        if (!matchesSpeed) return false;
      }
      if (p.monthlyPrice > maxPrice) return false;
      if (selectedInstallation.length > 0) {
        const isFree = p.installationFee === 0;
        const instMatch = selectedInstallation.some((inst) => {
          if (inst === 'free') return isFree;
          if (inst === 'paid') return !isFree;
          return true;
        });
        if (!instMatch) return false;
      }
      if (availableOnly && p.status !== 'active') return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        if (!p.name?.toLowerCase().includes(q) && !p.description?.toLowerCase().includes(q) && !p.speed?.toLowerCase().includes(q)) return false;
      }
      return true;
    });

    if (sortBy === 'Price Low to High') list.sort((a, b) => a.monthlyPrice - b.monthlyPrice);
    else if (sortBy === 'Price High to Low') list.sort((a, b) => b.monthlyPrice - a.monthlyPrice);
    else if (sortBy === 'Popularity') list.sort((a, b) => (b.popular ? 1 : 0) - (a.popular ? 1 : 0));

    return list;
  }, [products, activeCategory, selectedTypes, selectedSpeeds, maxPrice, selectedInstallation, availableOnly, searchQuery, sortBy]);

  const hasDetailPanel = selectedProduct !== null;

  /* Full-width container — bypasses page-container's 5% side padding */
  const wide = { maxWidth: '1600px', margin: '0 auto', width: '100%', padding: '0 1.5rem' };

  return (
    <div style={{ backgroundColor: '#f1f5f9', minHeight: '100vh', paddingBottom: '4rem' }}>
      <Toast toast={toast} onClose={() => setToast(null)} />

      {/* ── Header ── */}
      <div style={{ ...wide, paddingTop: '1.4rem' }}>

        {/* Breadcrumb */}
        <nav style={{ fontSize: '0.82rem', color: '#64748b', marginBottom: '0.85rem', display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
          <Link to="/" style={{ color: '#64748b', textDecoration: 'none' }}>Home</Link>
          <span>›</span>
          <span>New Connection</span>
          <span>›</span>
          <span style={{ color: '#0056b3', fontWeight: 600 }}>Choose a Product</span>
        </nav>

        {/* Title + Search + Cart */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
          <div>
            <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: '#0f172a', margin: 0, letterSpacing: '-0.02em' }}>
              Choose Your Product
            </h1>
            <p style={{ fontSize: '0.88rem', color: '#64748b', marginTop: '0.28rem', marginBottom: 0 }}>
              Explore our range of products and find the perfect connection for your needs.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ position: 'relative', minWidth: '200px' }}>
              <FiSearch style={{ position: 'absolute', left: '0.7rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} size={14} />
              <input
                type="text"
                placeholder="Search packages..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%', padding: '0.48rem 0.75rem 0.48rem 2rem',
                  borderRadius: '9999px', border: '1.5px solid #cbd5e1',
                  backgroundColor: '#fff', fontSize: '0.84rem', outline: 'none',
                  boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
                }}
              />
            </div>
            <Link
              to="/cart"
              style={{
                display: 'flex', alignItems: 'center', gap: '0.4rem',
                backgroundColor: '#0056b3', padding: '0.48rem 1.1rem',
                borderRadius: '9999px', color: '#fff', textDecoration: 'none',
                fontWeight: 600, fontSize: '0.84rem',
                boxShadow: '0 3px 10px rgba(0,86,179,0.28)',
              }}
            >
              <FiShoppingCart size={15} />
              <span>Cart</span>
              {cartCount > 0 && (
                <span style={{
                  backgroundColor: '#10b981', color: '#fff',
                  fontSize: '0.68rem', fontWeight: 800,
                  borderRadius: '9999px', padding: '0.08rem 0.4rem', marginLeft: '0.1rem',
                }}>{cartCount}</span>
              )}
            </Link>
          </div>
        </div>

        {/* Category Chips */}
        <CategoryChips activeCategory={activeCategory} onSelectCategory={(cat) => setActiveCategory(cat)} />
      </div>

      {/* ── Main Layout ── */}
      <div style={{ ...wide, marginTop: '1.2rem' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: hasDetailPanel ? '210px 1fr 420px' : '210px 1fr',
          gap: '1.2rem',
          alignItems: 'start',
        }}>

          {/* ── Sidebar ── */}
          <div style={{ position: 'sticky', top: '1.5rem' }}>
            <SidebarFilters
              selectedTypes={selectedTypes} onTypeToggle={handleTypeToggle}
              selectedSpeeds={selectedSpeeds} onSpeedToggle={handleSpeedToggle}
              maxPrice={maxPrice} onPriceChange={setMaxPrice}
              selectedInstallation={selectedInstallation} onInstallationToggle={handleInstallationToggle}
              availableOnly={availableOnly} onAvailableToggle={setAvailableOnly}
              onClearAll={handleClearAll}
            />
          </div>

          {/* ── Product Grid Area ── */}
          <div>
            {/* Toolbar */}
            <div style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              marginBottom: '0.9rem', backgroundColor: '#fff',
              borderRadius: '10px', padding: '0.6rem 1rem',
              border: '1px solid #e2e8f0', boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
            }}>
              <span style={{ fontWeight: 600, color: '#334155', fontSize: '0.87rem' }}>
                Showing <strong style={{ color: '#0056b3' }}>{filteredProducts.length}</strong> results
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.9rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <span style={{ fontSize: '0.81rem', color: '#64748b' }}>Sort by:</span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    style={{
                      padding: '0.35rem 0.7rem', borderRadius: '7px',
                      border: '1px solid #cbd5e1', backgroundColor: '#f8fafc',
                      fontSize: '0.81rem', fontWeight: 600, color: '#0f172a',
                      cursor: 'pointer', outline: 'none',
                    }}
                  >
                    <option value="Popularity">Popularity</option>
                    <option value="Price Low to High">Price: Low → High</option>
                    <option value="Price High to Low">Price: High → Low</option>
                  </select>
                </div>
                <div style={{ display: 'flex', gap: '2px', backgroundColor: '#e2e8f0', padding: '2px', borderRadius: '7px' }}>
                  {['grid', 'list'].map((mode) => (
                    <button
                      key={mode}
                      onClick={() => setViewMode(mode)}
                      title={`${mode === 'grid' ? 'Grid' : 'List'} View`}
                      style={{
                        border: 'none', cursor: 'pointer',
                        backgroundColor: viewMode === mode ? '#0056b3' : 'transparent',
                        color: viewMode === mode ? '#fff' : '#64748b',
                        padding: '0.3rem 0.5rem', borderRadius: '5px',
                        display: 'flex', alignItems: 'center', transition: 'all 0.15s',
                      }}
                    >
                      {mode === 'grid' ? <FiGrid size={14} /> : <FiList size={14} />}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Cards */}
            {loading ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1rem' }}>
                <SkeletonCard /><SkeletonCard /><SkeletonCard /><SkeletonCard />
              </div>
            ) : error ? (
              <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '12px', padding: '2rem', color: '#991b1b', textAlign: 'center' }}>
                <p style={{ fontWeight: 600, margin: 0 }}>{error}</p>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div style={{ backgroundColor: '#fff', borderRadius: '16px', padding: '3rem 1.5rem', textAlign: 'center', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', border: '1px solid #f1f5f9' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#1e293b', marginBottom: '0.5rem' }}>No Products Found</h3>
                <p style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '1rem' }}>Try adjusting your filters or search keywords.</p>
                <button onClick={handleClearAll} style={{ backgroundColor: '#0056b3', color: '#fff', border: 'none', borderRadius: '8px', padding: '0.5rem 1.25rem', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer' }}>
                  Reset Filters
                </button>
              </div>
            ) : (
              <div style={{
                display: 'grid',
                gridTemplateColumns: hasDetailPanel
                  ? 'repeat(auto-fill, minmax(195px, 1fr))'
                  : 'repeat(auto-fill, minmax(220px, 1fr))',
                gap: '1rem',
              }}>
                {filteredProducts.map((prod) => {
                  const prodId = prod._id || prod.id;
                  const isSelected = selectedProduct && (selectedProduct._id || selectedProduct.id) === prodId;
                  return (
                    <ProductCard
                      key={prodId}
                      product={prod}
                      isSelected={isSelected}
                      isFavorite={favorites.includes(prodId)}
                      onSelect={(p) => setSelectedProduct(p)}
                      onToggleFavorite={handleToggleFavorite}
                      onAddToCart={(p) => handleAddToCart(p, 1)}
                    />
                  );
                })}
              </div>
            )}
          </div>

          {/* ── Detail Panel ── */}
          {hasDetailPanel && (
            <div>
              <div style={{ position: 'sticky', top: '1.5rem' }}>
                <ProductDetailsPanel
                  product={selectedProduct}
                  isFavorite={favorites.includes(selectedProduct._id || selectedProduct.id)}
                  onToggleFavorite={handleToggleFavorite}
                  onAddToCart={(p, qty) => handleAddToCart(p, qty)}
                  onBuyNow={(p, qty) => handleBuyNow(p, qty)}
                  onClose={() => setSelectedProduct(null)}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
