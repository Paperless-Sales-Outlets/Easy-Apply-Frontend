import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { getProducts } from '../services/cartService';
import ProductList from '../components/products/ProductList';
import SearchBar from '../components/common/SearchBar';
import FilterPanel from '../components/common/FilterPanel';
import Cart from '../components/cart/Cart';
import Icon from '../components/Icon';

const AddToCartPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { cart, loading, notification, getCartItemCount, addItemToCart } = useCart();
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const [packageFromWizard, setPackageFromWizard] = useState(null);
  const packageAddedRef = useRef(false);

  useEffect(() => {
    fetchProducts();
    
    // Check if package info was passed from wizard or dashboard
    if (location.state?.package && !packageAddedRef.current) {
      setPackageFromWizard(location.state.package);
      packageAddedRef.current = true;
      
      const packageId = location.state.package.id ? `pkg-${location.state.package.id}` : 'pkg-new-connection';
      addItemToCart(packageId, 1, location.state.package);

      // Clear the state so it doesn't get re-added on page refresh
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state, navigate, location.pathname]);

  useEffect(() => {
    applyFilters();
  }, [products, searchTerm, selectedCategory, minPrice, maxPrice]);

  const fetchProducts = async () => {
    setLoadingProducts(true);
    try {
      const response = await getProducts();
      setProducts(response.data || []);
      
      // Extract unique categories
      const uniqueCategories = [...new Set((response.data || []).map(p => p.category).filter(Boolean))];
      setCategories(uniqueCategories);
    } catch (error) {
      console.error('Failed to fetch products:', error);
    } finally {
      setLoadingProducts(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...products];

    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (product) =>
          product.productName?.toLowerCase().includes(term) ||
          product.productCode?.toLowerCase().includes(term) ||
          product.description?.toLowerCase().includes(term)
      );
    }

    // Category filter
    if (selectedCategory) {
      filtered = filtered.filter((product) => product.category === selectedCategory);
    }

    // Price range filter
    if (minPrice) {
      filtered = filtered.filter((product) => Number(product.price) >= Number(minPrice));
    }
    if (maxPrice) {
      filtered = filtered.filter((product) => Number(product.price) <= Number(maxPrice));
    }

    setFilteredProducts(filtered);
  };

  const handleSearch = (term) => {
    setSearchTerm(term);
  };

  const handleCategoryFilter = (category) => {
    setSelectedCategory(category);
  };

  const handlePriceRangeChange = (min, max) => {
    setMinPrice(min);
    setMaxPrice(max);
  };

  const cartItemCount = getCartItemCount();

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--page-bg)' }}>
      {/* Header */}
      <div
        style={{
          backgroundColor: '#ffffff',
          borderBottom: '1px solid #e2e8f0',
          padding: '1rem 2rem',
          position: 'sticky',
          top: 0,
          zIndex: 100,
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
        }}
      >
        <div
          style={{
            maxWidth: 'var(--page-max)',
            margin: '0 auto',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div>
            <h1
              style={{
                fontSize: '1.5rem',
                fontWeight: 700,
                color: '#1e293b',
                margin: 0,
              }}
            >
              Paperless Sales Outlet
            </h1>
            <p
              style={{
                fontSize: '0.85rem',
                color: '#64748b',
                margin: '0.25rem 0 0 0',
              }}
            >
              Browse and add products to your cart
            </p>
          </div>
          <button
            onClick={() => setIsCartOpen(true)}
            style={{
              position: 'relative',
              padding: '0.75rem 1.25rem',
              backgroundColor: '#0056b3',
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              fontSize: '0.9rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              transition: 'background-color 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#004494';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#0056b3';
            }}
          >
            <Icon name="shopping-cart" size={20} />
            <span>Cart</span>
            {cartItemCount > 0 && (
              <span
                style={{
                  position: 'absolute',
                  top: '-8px',
                  right: '-8px',
                  backgroundColor: '#dc2626',
                  color: '#ffffff',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {cartItemCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div
        style={{
          maxWidth: 'var(--page-max)',
          margin: '0 auto',
          padding: '2rem',
        }}
      >
        {/* Package from Wizard */}
        {packageFromWizard && (
          <div
            style={{
              backgroundColor: '#f0f7ff',
              border: '1px solid #bfdbfe',
              borderRadius: '12px',
              padding: '1.5rem',
              marginBottom: '2rem',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ flex: 1 }}>
                <h3
                  style={{
                    fontSize: '1.1rem',
                    fontWeight: 600,
                    color: '#1e293b',
                    marginBottom: '0.5rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                  }}
                >
                  <Icon name="check-circle" size={20} color="#059669" />
                  Package Added from New Connection
                </h3>
                <div
                  style={{
                    fontSize: '1rem',
                    fontWeight: 600,
                    color: '#0056b3',
                    marginBottom: '0.25rem',
                  }}
                >
                  {packageFromWizard.name}
                </div>
                <div style={{ fontSize: '0.9rem', color: '#64748b', marginBottom: '0.75rem' }}>
                  {packageFromWizard.duration} Plan
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                  {(packageFromWizard.features || []).map((feature, index) => (
                    <span
                      key={index}
                      style={{
                        fontSize: '0.8rem',
                        backgroundColor: '#ffffff',
                        color: '#0056b3',
                        padding: '0.25rem 0.75rem',
                        borderRadius: '12px',
                        fontWeight: 500,
                        border: '1px solid #bfdbfe',
                      }}
                    >
                      {feature}
                    </span>
                  ))}
                </div>
              </div>
              <button
                onClick={() => setPackageFromWizard(null)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#64748b',
                  cursor: 'pointer',
                  padding: '0.5rem',
                  borderRadius: '8px',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#e2e8f0';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                <Icon name="x" size={20} />
              </button>
            </div>
          </div>
        )}

        {/* Search and Filters */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            marginBottom: '2rem',
            gap: '1.5rem',
          }}
        >
          <SearchBar onSearch={handleSearch} placeholder="Search products by name, code, or description..." />
          <div style={{ flex: 1, maxWidth: '600px' }}>
            <FilterPanel
              categories={categories}
              onFilterChange={handleCategoryFilter}
              onPriceRangeChange={handlePriceRangeChange}
            />
          </div>
        </div>

        {/* Results Count */}
        <div
          style={{
            marginBottom: '1.5rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <p
            style={{
              fontSize: '0.9rem',
              color: '#64748b',
              margin: 0,
            }}
          >
            Showing {filteredProducts.length} of {products.length} products
          </p>
          {(searchTerm || selectedCategory || minPrice || maxPrice) && (
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('');
                setMinPrice('');
                setMaxPrice('');
              }}
              style={{
                background: 'none',
                border: 'none',
                color: '#0056b3',
                fontSize: '0.85rem',
                fontWeight: 500,
                cursor: 'pointer',
                padding: '0.25rem 0.5rem',
                borderRadius: '8px',
              }}
            >
              Clear Filters
            </button>
          )}
        </div>

        {/* Product List */}
        <ProductList products={filteredProducts} loading={loadingProducts} />
      </div>

      {/* Cart Sidebar */}
      <Cart isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />

      {/* Notification Toast */}
      {notification && (
        <div
          style={{
            position: 'fixed',
            bottom: '2rem',
            right: '2rem',
            padding: '1rem 1.5rem',
            borderRadius: '8px',
            backgroundColor: notification.type === 'error' ? '#fef2f2' : '#f0fdf4',
            border: `1px solid ${notification.type === 'error' ? '#fecaca' : '#bbf7d0'}`,
            color: notification.type === 'error' ? '#dc2626' : '#166534',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
            zIndex: 1001,
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            animation: 'slideInUp 0.3s ease',
          }}
        >
          <Icon
            name={notification.type === 'error' ? 'alert-circle' : 'check-circle'}
            size={20}
            color={notification.type === 'error' ? '#dc2626' : '#166534'}
          />
          <span style={{ fontWeight: 500 }}>{notification.message}</span>
        </div>
      )}

      {/* Add CSS animations */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideIn {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
        @keyframes slideInUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
};

export default AddToCartPage;
