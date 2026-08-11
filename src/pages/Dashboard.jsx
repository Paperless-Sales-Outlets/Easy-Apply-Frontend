import React, { useEffect, useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FiShoppingCart, FiSearch } from 'react-icons/fi';
import Icon from '../components/Icon';
import ProductCard from '../components/catalog/ProductCard';
import ProductDetailsPanel from '../components/catalog/ProductDetailsPanel';
import Toast from '../components/common/Toast';
import { getProducts, addToCart, getCart } from '../services/productService';

const SERVICES = [
  { id: 'new-connection', title: 'New Connection >', route: '/new-connection' },
  { id: 'reconnection', title: 'Reconnection >', route: '/reconnection' },
  { id: 'relocation', title: 'Relocation >', route: '/location-change' },
  { id: 'termination', title: 'Termination >', route: '/termination' },
  { id: 'transfer', title: 'Ownership Transfer >', route: '/ownership-change' },
  { id: 'package-migration', title: 'Package Migration >', route: '/package-migration' },
  { id: 'service-vacation', title: 'Service Vacation >', route: '/service-vacation' },
  { id: 'refund-request', title: 'Refund Request >', route: '/refund-request' },
  { id: 'customer-request', title: 'Customer Request Acceptance >', route: '/customer-request-acceptance' },
];

const FALLBACK_PRODUCTS = [
  // Voice
  {
    _id: 'v-1', id: 'v-1', name: 'Fibre Voice Home', category: 'Voice',
    monthlyPrice: 499, installationFee: 1500, popular: false,
    features: ['Unlimited Local Calls', 'Crystal Clear Audio', 'Caller ID Included', 'Call Forwarding'],
  },
  {
    _id: 'v-2', id: 'v-2', name: 'Megaline (Copper) Voice', category: 'Voice',
    monthlyPrice: 349, installationFee: 2000, popular: false,
    features: ['Reliable Landline', 'Low Monthly Rental', 'International Calling Support'],
  },
  {
    _id: 'v-3', id: 'v-3', name: '4G LTE Voice', category: 'Voice',
    monthlyPrice: 399, installationFee: 2500, popular: true,
    features: ['Wireless Landline', 'HD Voice Quality', 'No Cables Needed', 'Easy Plug & Play'],
  },
  // Data
  {
    _id: 'd-1', id: 'd-1', name: '300 Mbps Fibre Broadband', category: 'Fibre Broadband',
    monthlyPrice: 2990, installationFee: 0, popular: true,
    features: ['300 Mbps Download / Upload', 'Unlimited Data', 'Free Wi-Fi 6 Router', '24/7 Support'],
  },
  {
    _id: 'd-2', id: 'd-2', name: '500 Mbps Fibre Broadband', category: 'Fibre Broadband',
    monthlyPrice: 4490, installationFee: 0, popular: true,
    features: ['500 Mbps Download / Upload', 'Unlimited Data', 'Free Premium Installation', 'VIP Support'],
  },
  {
    _id: 'd-3', id: 'd-3', name: 'LTE Home 150 GB', category: 'LTE Broadband',
    monthlyPrice: 1490, installationFee: 2500, popular: false,
    features: ['100 Mbps LTE Speed', '150 GB Anytime Data', 'Free 4G Router', 'Nationwide Coverage'],
  },
  // Peo TV
  {
    _id: 'p-1', id: 'p-1', name: 'PEO TV Starter Pack', category: 'PEO TV',
    monthlyPrice: 1490, installationFee: 500, popular: false,
    features: ['50+ Live HD Channels', '7-Day Catch-up TV', 'Rewind & Pause Live TV'],
  },
  {
    _id: 'p-2', id: 'p-2', name: 'PEO TV Gold Pack', category: 'PEO TV',
    monthlyPrice: 2990, installationFee: 500, popular: true,
    features: ['100+ HD Channels', 'Sports & Movies Pack', 'Video on Demand', 'Multi-Screen Support'],
  },
  {
    _id: 'p-3', id: 'p-3', name: 'PEO TV Platinum Pack', category: 'PEO TV',
    monthlyPrice: 4999, installationFee: 0, popular: false,
    features: ['All Premium HD Channels', '4K Ultra HD Content', 'Free HD Setup Box', '30-Day Catch-Up'],
  },
];

export default function Dashboard() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [cartCount, setCartCount] = useState(0);
  const [toast, setToast] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [favorites, setFavorites] = useState([]);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  useEffect(() => {
    const fetchCatalogData = async () => {
      try {
        const res = await getProducts({ limit: 100 });
        const list = res.data || res.products || res || [];
        if (Array.isArray(list) && list.length > 0) {
          setProducts(list);
        } else {
          setProducts(FALLBACK_PRODUCTS);
        }
      } catch (err) {
        console.warn('Using fallback products for dashboard:', err);
        setProducts(FALLBACK_PRODUCTS);
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

  const handleAddToCart = async (prod, qty = 1) => {
    try {
      await addToCart(prod, qty);
      const cartRes = await getCart();
      const items = cartRes?.data?.items || cartRes?.items || [];
      const count = items.reduce((acc, item) => acc + (item.quantity || 1), 0);
      setCartCount(count);
      showToast(`${prod.name || prod.productName || 'Package'} added to cart!`, 'success');
    } catch (err) {
      showToast(`${prod.name || prod.productName || 'Package'} added to cart!`, 'success');
    }
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

  const filteredProducts = useMemo(() => {
    if (!searchQuery.trim()) return products;
    const q = searchQuery.toLowerCase();
    return products.filter((p) => {
      const name = (p.name || p.productName || '').toLowerCase();
      const cat = (p.category || '').toLowerCase();
      return name.includes(q) || cat.includes(q);
    });
  }, [products, searchQuery]);

  const voiceProducts = useMemo(() => {
    const list = filteredProducts.filter((p) =>
      p.category?.toLowerCase().includes('voice') || p.name?.toLowerCase().includes('voice') || p.name?.toLowerCase().includes('phone')
    );
    return list.length > 0 ? list : FALLBACK_PRODUCTS.filter(p => p.category === 'Voice');
  }, [filteredProducts]);

  const dataProducts = useMemo(() => {
    const list = filteredProducts.filter((p) =>
      p.category?.toLowerCase().includes('broadband') || p.category?.toLowerCase().includes('data') || p.category?.toLowerCase().includes('lte') || p.name?.toLowerCase().includes('fibre') || p.name?.toLowerCase().includes('web')
    );
    return list.length > 0 ? list : FALLBACK_PRODUCTS.filter(p => p.category.includes('Broadband') || p.category.includes('LTE'));
  }, [filteredProducts]);

  const peoTvProducts = useMemo(() => {
    const list = filteredProducts.filter((p) =>
      p.category?.toLowerCase().includes('peo') || p.name?.toLowerCase().includes('peo') || p.name?.toLowerCase().includes('tv')
    );
    return list.length > 0 ? list : FALLBACK_PRODUCTS.filter(p => p.category === 'PEO TV');
  }, [filteredProducts]);

  const hasDetailPanel = selectedProduct !== null;

  return (
    <div style={{ backgroundColor: '#f8fafc', minHeight: '100vh', paddingBottom: '3rem' }}>
      <Toast toast={toast} onClose={() => setToast(null)} />

      {/* Secondary Hero Bar */}
      <div style={{ borderBottom: '1px solid var(--line)', padding: '1.2rem 0', background: 'white' }}>
        <div className="site-container" style={{ padding: '0 2rem', display: 'flex', justifyContent: 'flex-end', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div className="search-cart-bar" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div className="search-input-wrapper" style={{ position: 'relative' }}>
              <FiSearch style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} size={16} />
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  paddingLeft: '2.2rem',
                  paddingRight: '1rem',
                  paddingTop: '0.5rem',
                  paddingBottom: '0.5rem',
                  borderRadius: '9999px',
                  border: '1.5px solid #cbd5e1',
                  fontSize: '0.875rem',
                  outline: 'none',
                  width: '240px',
                }}
              />
            </div>
            <button
              onClick={() => navigate('/cart')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.45rem',
                backgroundColor: '#0056b3',
                color: '#fff',
                padding: '0.52rem 1.25rem',
                borderRadius: '9999px',
                border: 'none',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: '0.875rem',
                boxShadow: '0 3px 10px rgba(0,86,179,0.25)',
              }}
            >
              <FiShoppingCart size={16} />
              <span>Cart</span>
              {cartCount > 0 && (
                <span
                  style={{
                    backgroundColor: '#10b981',
                    color: '#fff',
                    fontSize: '0.7rem',
                    fontWeight: 800,
                    borderRadius: '9999px',
                    padding: '0.1rem 0.45rem',
                    marginLeft: '0.2rem',
                  }}
                >
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: '1600px', margin: '1.5rem auto 0', padding: '0 1.5rem' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: hasDetailPanel ? '210px 1fr 420px' : '210px 1fr',
          gap: '1.2rem',
          alignItems: 'start',
        }}>
          {/* Sidebar (Our Services) */}
          <aside style={{ position: 'sticky', top: '1.5rem' }}>
            <div className="sidebar-box">
              <div className="sidebar-title">Our Services</div>
              <div className="sidebar-menu">
                {SERVICES.slice(0, 5).map((service) => (
                  <Link to={service.route} key={service.id} className="sidebar-btn">
                    {service.title}
                  </Link>
                ))}
                <div style={{ marginTop: '0.5rem' }}>
                  <button
                    className="sidebar-btn"
                    style={{ background: '#f1f5f9', justifyContent: 'center' }}
                    onClick={() => navigate('/services')}
                  >
                    View All Services
                  </button>
                </div>
              </div>
            </div>
          </aside>

          {/* Main Content (Our Products) */}
          <main style={{ flex: 1 }}>
            <div className="main-content-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>Our Products</h2>
              <button className="btn-view-all" onClick={() => navigate('/new-connection/products')}>
                View All -&gt;
              </button>
            </div>

            {/* Voice Category */}
            <div className="category-section" style={{ marginBottom: '2.5rem' }}>
              <div className="category-title" style={{ fontSize: '1.2rem', fontWeight: 700, color: '#1e293b', marginBottom: '1rem', borderBottom: '2px solid #e2e8f0', paddingBottom: '0.4rem' }}>
                Voice
              </div>
              <div className="product-grid" style={{ display: 'grid', gridTemplateColumns: hasDetailPanel ? 'repeat(auto-fill, minmax(200px, 1fr))' : 'repeat(auto-fill, minmax(240px, 1fr))', gap: '1.25rem' }}>
                {voiceProducts.map((product) => {
                  const prodId = product._id || product.id;
                  return (
                    <ProductCard
                      key={prodId}
                      product={product}
                      isSelected={selectedProduct && (selectedProduct._id || selectedProduct.id) === prodId}
                      isFavorite={favorites.includes(prodId)}
                      onSelect={(p) => setSelectedProduct(p)}
                      onToggleFavorite={handleToggleFavorite}
                      onAddToCart={(p) => handleAddToCart(p, 1)}
                    />
                  );
                })}
              </div>
            </div>

            {/* Data Category */}
            <div className="category-section" style={{ marginBottom: '2.5rem' }}>
              <div className="category-title" style={{ fontSize: '1.2rem', fontWeight: 700, color: '#1e293b', marginBottom: '1rem', borderBottom: '2px solid #e2e8f0', paddingBottom: '0.4rem' }}>
                Data &amp; Broadband
              </div>
              <div className="product-grid" style={{ display: 'grid', gridTemplateColumns: hasDetailPanel ? 'repeat(auto-fill, minmax(200px, 1fr))' : 'repeat(auto-fill, minmax(240px, 1fr))', gap: '1.25rem' }}>
                {dataProducts.map((product) => {
                  const prodId = product._id || product.id;
                  return (
                    <ProductCard
                      key={prodId}
                      product={product}
                      isSelected={selectedProduct && (selectedProduct._id || selectedProduct.id) === prodId}
                      isFavorite={favorites.includes(prodId)}
                      onSelect={(p) => setSelectedProduct(p)}
                      onToggleFavorite={handleToggleFavorite}
                      onAddToCart={(p) => handleAddToCart(p, 1)}
                    />
                  );
                })}
              </div>
            </div>

            {/* Peo TV Category */}
            <div className="category-section" style={{ marginBottom: '2.5rem' }}>
              <div className="category-title" style={{ fontSize: '1.2rem', fontWeight: 700, color: '#1e293b', marginBottom: '1rem', borderBottom: '2px solid #e2e8f0', paddingBottom: '0.4rem' }}>
                Peo TV
              </div>
              <div className="product-grid" style={{ display: 'grid', gridTemplateColumns: hasDetailPanel ? 'repeat(auto-fill, minmax(200px, 1fr))' : 'repeat(auto-fill, minmax(240px, 1fr))', gap: '1.25rem' }}>
                {peoTvProducts.map((product) => {
                  const prodId = product._id || product.id;
                  return (
                    <ProductCard
                      key={prodId}
                      product={product}
                      isSelected={selectedProduct && (selectedProduct._id || selectedProduct.id) === prodId}
                      isFavorite={favorites.includes(prodId)}
                      onSelect={(p) => setSelectedProduct(p)}
                      onToggleFavorite={handleToggleFavorite}
                      onAddToCart={(p) => handleAddToCart(p, 1)}
                    />
                  );
                })}
              </div>
            </div>
          </main>

          {/* ── Sticky Side Detail Panel ── */}
          {hasDetailPanel && (
            <div>
              <div style={{ position: 'sticky', top: '1.5rem' }}>
                <ProductDetailsPanel
                  product={selectedProduct}
                  isFavorite={favorites.includes(selectedProduct._id || selectedProduct.id)}
                  onToggleFavorite={handleToggleFavorite}
                  onAddToCart={(p, qty) => handleAddToCart(p, qty)}
                  onBuyNow={(p, qty) => {
                    handleAddToCart(p, qty);
                    navigate('/cart');
                  }}
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
