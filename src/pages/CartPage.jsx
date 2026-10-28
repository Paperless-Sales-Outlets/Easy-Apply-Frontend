import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import {
  FiTrash2,
  FiArrowLeft,
  FiPlus,
  FiMinus,
  FiShoppingCart,
  FiShield,
  FiActivity,
  FiDatabase,
  FiWifi,
  FiHeadphones,
  FiTag,
  FiBookmark,
  FiArrowRight,
  FiInfo,
  FiGrid,
  FiZap,
  FiCheck,
} from 'react-icons/fi';
import ProductCard from '../components/catalog/ProductCard';
import ProductDeviceGraphic from '../components/catalog/ProductDeviceGraphic';
import { getCart, removeFromCart, addToCart, getProducts, getLocalCart } from '../services/productService';
import Toast from '../components/common/Toast';

/**
 * Cleans duplicate category suffixes and cleans spacing in package titles
 * e.g. "FTTH Broadband Fibre Double Play ( PeoTV + Voice) - Broadband"
 *   -> "FTTH Broadband Fibre Double Play (PeoTV + Voice)"
 */
const cleanCartTitle = (name = '') => {
  let cleaned = String(name || '').trim();
  // Fix spacing in parentheses like '( PeoTV + Voice)' -> '(PeoTV + Voice)'
  cleaned = cleaned.replace(/\(\s+/g, '(').replace(/\s+\)/g, ')');
  // Strip duplicate category suffixes if the category keyword is already present in title
  if (/broadband/i.test(cleaned)) {
    cleaned = cleaned.replace(/\s*-\s*broadband$/i, '');
  }
  if (/voice/i.test(cleaned)) {
    cleaned = cleaned.replace(/\s*-\s*voice$/i, '');
  }
  if (/peo\s*tv/i.test(cleaned)) {
    cleaned = cleaned.replace(/\s*-\s*peo\s*tv$/i, '');
  }
  return cleaned.trim();
};

export default function CartPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [recommended, setRecommended] = useState([]);
  const [toast, setToast] = useState(null);

  const fetchCartData = async () => {
    setLoading(true);
    try {
      const res = await getCart();
      const items = res?.data?.items || res?.cart?.items || res?.items || getLocalCart();
      setCart({ items });
    } catch (err) {
      console.warn('Could not fetch backend cart, using fallback:', err);
      setCart({ items: getLocalCart() });
    } finally {
      setLoading(false);
    }
  };

  const fetchRecommended = async () => {
    try {
      const productsRes = await getProducts({ limit: 4 });
      const products = productsRes.data || productsRes.products || productsRes || [];
      setRecommended(products.slice(0, 4));
    } catch (err) {
      console.warn('Could not fetch recommended products:', err);
    }
  };

  useEffect(() => {
    fetchCartData();
    fetchRecommended();
  }, []);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const handleRemove = async (productId) => {
    // Optimistic removal (instant 0ms UI update)
    setCart((prev) => {
      if (!prev?.items) return prev;
      return {
        ...prev,
        items: prev.items.filter((i) => (i.productId || i._id || i.id) !== productId),
      };
    });

    try {
      await removeFromCart(productId);
      showToast('Item removed from cart', 'info');
    } catch {
      showToast('Item removed', 'info');
    }
  };

  const handleQuantityChange = async (item, delta) => {
    const newQty = (item.quantity || 1) + delta;
    if (newQty < 1) return;

    const itemId = item.productId || item._id || item.id;

    // 1. Instant optimistic state update (0ms, zero flickering or page reloads)
    setCart((prev) => {
      if (!prev?.items) return prev;
      return {
        ...prev,
        items: prev.items.map((i) => {
          const id = i.productId || i._id || i.id;
          return id === itemId ? { ...i, quantity: newQty } : i;
        }),
      };
    });

    // 2. Persist in background (backend API & localStorage) without full page reload
    try {
      await addToCart(item, delta);
    } catch (err) {
      console.warn('Could not sync cart quantity:', err);
    }
  };

  const items = cart?.items || [];
  const monthlyTotal = items.reduce((sum, item) => sum + (item.price || item.monthlyPrice || 0) * item.quantity, 0);
  const installationTotal = items.reduce((sum, item) => sum + (item.installationFee !== undefined ? item.installationFee : 2500) * item.quantity, 0);
  const grandTotal = monthlyTotal + installationTotal;
  const totalItemCount = items.reduce((sum, item) => sum + (item.quantity || 1), 0);

  const handleProceedToCheckout = () => {
    if (items.length === 0) {
      showToast('Your cart is empty. Please add a product first.', 'error');
      return;
    }

    const primaryItem = items[0];
    const itemRawName = primaryItem.productName || primaryItem.name || '';
    const isFibre = /fibre|fiber|ftth/i.test(itemRawName) || /fibre|fiber|ftth/i.test(primaryItem.category || '');
    const selectedProductData = {
      productId: primaryItem.productId || primaryItem._id || primaryItem.id,
      productName: itemRawName,
      name: itemRawName,
      category: primaryItem.category || (isFibre ? 'Fibre Broadband' : 'Broadband'),
      monthlyPrice: primaryItem.price || primaryItem.monthlyPrice,
      installationFee: primaryItem.installationFee !== undefined ? primaryItem.installationFee : 2500,
      quantity: primaryItem.quantity,
      speed: primaryItem.speed,
      features: primaryItem.features,
    };

    localStorage.setItem('selectedProduct', JSON.stringify(selectedProductData));

    // Navigate to New Connection Form Page
    navigate('/new-connection', {
      state: {
        items,
        selectedProduct: selectedProductData,
      },
    });
  };

  return (
    <div style={{ backgroundColor: 'var(--page-bg)', minHeight: '100vh', padding: '2rem 0 5rem 0' }}>
      <Toast toast={toast} onClose={() => setToast(null)} />

      <div className="page-container" style={{ maxWidth: '1380px', margin: '0 auto', padding: '0 1.5rem' }}>

        {/* Breadcrumbs */}
        <nav style={{ fontSize: '0.825rem', color: '#64748b', marginBottom: '1.25rem', display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
          <Link to="/" style={{ color: '#64748b', textDecoration: 'none' }}>Home</Link>
          <span>›</span>
          <Link to="/new-connection/products" style={{ color: '#64748b', textDecoration: 'none' }}>Product Catalogue</Link>
          <span>›</span>
          <span style={{ color: '#0056b3', fontWeight: 600 }}>Shopping Cart</span>
        </nav>

        {/* Page Title & Header Action */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.75rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ fontSize: '1.9rem', fontWeight: 800, color: '#0f172a', margin: 0, letterSpacing: '-0.02em' }}>
              {t('cart.title', 'Your Shopping Cart')}
            </h1>
            <p style={{ fontSize: '0.9rem', color: '#64748b', marginTop: '0.35rem', marginBottom: 0 }}>
              {t('cart.subtitle', 'Review your selected products before proceeding.')}
            </p>
          </div>

          <Link
            to="/new-connection/products"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              color: '#0056b3',
              textDecoration: 'none',
              fontWeight: 700,
              fontSize: '0.875rem',
              padding: '0.6rem 1.25rem',
              borderRadius: '12px',
              backgroundColor: '#ffffff',
              border: '1.5px solid #0056b3',
              boxShadow: '0 2px 6px rgba(0, 86, 179, 0.08)',
              transition: 'all 0.15s ease',
            }}
          >
            <FiArrowLeft size={16} /> {t('cart.continueBrowsing', 'Continue Browsing')}
          </Link>
        </div>

        {loading ? (
          <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', padding: '4rem', textAlign: 'center', color: '#64748b', border: '1px solid #e2e8f0' }}>
            Loading your cart...
          </div>
        ) : items.length === 0 ? (
          /* ── STUNNING EMPTY CART VIEW ── */
          <>
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              style={{
                backgroundColor: '#ffffff',
                borderRadius: '16px',
                padding: '4.5rem 2rem',
                textAlign: 'center',
                boxShadow: '0 10px 30px rgba(0, 0, 0, 0.04)',
                border: '1px solid #e2e8f0',
                marginBottom: '3rem',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              {/* SLTMobitel Badge */}
              <span
                style={{
                  display: 'flex',
                  width: 'fit-content',
                  alignItems: 'center',
                  gap: '0.35rem',
                  backgroundColor: '#eff6ff',
                  color: '#0056b3',
                  fontSize: '0.75rem',
                  fontWeight: 800,
                  padding: '0.35rem 0.85rem',
                  borderRadius: '9999px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  margin: '0 auto 1.5rem auto',
                }}
              >
                <FiZap size={13} /> {t('cart.badge', 'SLTMobitel EasyApply')}
              </span>

              {/* Empty Cart Icon */}
              <div
                style={{
                  display: 'flex',
                  width: '124px',
                  height: '124px',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '50%',
                  backgroundColor: '#eff6ff',
                  color: '#0056b3',
                  margin: '0 auto 1.75rem auto',
                }}
              >
                <FiShoppingCart size={54} />
              </div>

              <h2 style={{ fontSize: '1.85rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.6rem', letterSpacing: '-0.02em' }}>
                {t('cart.emptyTitle', 'Your cart is currently empty')}
              </h2>

              <p style={{ fontSize: '0.98rem', color: '#64748b', marginBottom: '2.5rem', maxWidth: '540px', marginLeft: 'auto', marginRight: 'auto', lineHeight: 1.6 }}>
                {t('cart.emptyText', "Looks like you haven't added any SLTMobitel products yet. Explore our high-speed Fibre Broadband, 4G LTE Home, and PEO TV packages to build your connection.")}
              </p>

              {/* Action Button */}
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <Link
                  to="/new-connection/products"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.55rem',
                    backgroundColor: '#0056b3',
                    color: '#ffffff',
                    padding: '0.95rem 2.5rem',
                    borderRadius: '12px',
                    fontWeight: 700,
                    fontSize: '0.95rem',
                    textDecoration: 'none',
                    boxShadow: '0 6px 20px rgba(0, 86, 179, 0.28)',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <FiGrid size={16} /> {t('cart.browseProducts', 'Browse Products')}
                </Link>
              </div>
            </motion.div>

            {/* Recommended Packages Section */}
            <section style={{ marginBottom: '3.5rem' }}>
              <div style={{ marginBottom: '1.5rem' }}>
                <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.35rem 0' }}>
                  Recommended Packages
                </h3>
                <p style={{ fontSize: '0.88rem', color: '#64748b', margin: 0 }}>
                  Handpicked top-rated connections for home and office.
                </p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1.25rem' }}>
                {recommended.length > 0 ? (
                  recommended.map((product) => (
                    <ProductCard
                      key={product._id || product.id}
                      product={product}
                      onSelect={() => navigate('/new-connection/products')}
                      onToggleFavorite={() => { }}
                      onAddToCart={() => {
                        addToCart(product, 1);
                        fetchCartData();
                        showToast(`${product.name} added to cart!`, 'success');
                      }}
                    />
                  ))
                ) : (
                  <div style={{ gridColumn: '1 / -1', padding: '2rem', backgroundColor: '#ffffff', borderRadius: '16px', color: '#64748b', textAlign: 'center', border: '1px solid #e2e8f0' }}>
                    Loading recommended packages...
                  </div>
                )}
              </div>
            </section>

            {/* Benefits Bar */}
            <section>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', marginBottom: '1.25rem' }}>
                Why choose EasyApply?
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
                {[
                  { title: 'Free Installation', text: 'On all eligible packages', Icon: FiZap },
                  { title: '24/7 Customer Support', text: "We're here to help you", Icon: FiHeadphones },
                  { title: 'Trusted Network', text: "Sri Lanka's No.1 Network", Icon: FiWifi },
                  { title: '100% Secure Payments', text: 'Your payments are safe with us', Icon: FiShield },
                ].map((benefit) => (
                  <div
                    key={benefit.title}
                    style={{
                      backgroundColor: '#ffffff',
                      borderRadius: '16px',
                      padding: '1.35rem 1.25rem',
                      border: '1px solid #e2e8f0',
                      boxShadow: '0 4px 18px rgba(15, 23, 42, 0.03)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '1rem',
                    }}
                  >
                    <div
                      style={{
                        width: '48px',
                        height: '48px',
                        borderRadius: '12px',
                        backgroundColor: '#eff6ff',
                        color: '#0b4a91',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      <benefit.Icon size={22} aria-hidden="true" />
                    </div>
                    <div>
                      <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.2rem 0' }}>
                        {benefit.title}
                      </h4>
                      <p style={{ fontSize: '0.825rem', color: '#64748b', margin: 0 }}>
                        {benefit.text}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </>
        ) : (
          /* ── NON-EMPTY CART VIEW (Matches Image 3 Exactly) ── */
          <>
            <div className="cart-layout-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '1.75rem', alignItems: 'start', marginBottom: '2.5rem' }}>

              {/* Left Column: Cart Items List (8 cols) */}
              <div className="cart-layout-items" style={{ gridColumn: 'span 8', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.05rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.25rem' }}>
                  <FiShoppingCart color="#0056b3" size={20} />
                  <span>{t('cart.itemsHeading', { count: totalItemCount, defaultValue: 'Cart Items ({{count}})' })}</span>
                </div>

                {items.map((item, idx) => {
                  const prodId = item.productId || item._id || item.id;
                  const prodName = item.productName || item.name || 'SLTMobitel Connection';
                  const monthly = item.price || item.monthlyPrice || 0;
                  const instFee = item.installationFee !== undefined ? item.installationFee : 2500;
                  const speed = item.speed || '';
                  const isPopular = item.popular !== undefined ? item.popular : true;
                  const cleanedTitle = cleanCartTitle(prodName);
                  const itemSubtotal = monthly * (item.quantity || 1);

                  return (
                    <div
                      key={prodId || idx}
                      style={{
                        backgroundColor: '#ffffff',
                        borderRadius: '20px',
                        padding: '1.4rem 1.5rem',
                        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.03)',
                        border: '1px solid #e2e8f0',
                        position: 'relative',
                        overflow: 'hidden',
                        transition: 'box-shadow 0.2s ease',
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          gap: '1.25rem',
                          alignItems: 'center',
                          flexWrap: 'wrap',
                        }}
                      >
                        {/* 1. Left visual tile with Device Graphic */}
                        <div
                          style={{
                            width: '100px',
                            height: '100px',
                            borderRadius: '16px',
                            background: 'linear-gradient(135deg, #0a1f3b 0%, #0056b3 100%)',
                            position: 'relative',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                            overflow: 'hidden',
                            padding: '0.4rem',
                            boxShadow: '0 4px 12px rgba(0, 86, 179, 0.15)',
                          }}
                        >
                          {isPopular && (
                            <span
                              style={{
                                position: 'absolute',
                                top: '0.4rem',
                                left: '0.4rem',
                                backgroundColor: '#10b981',
                                color: '#ffffff',
                                fontSize: '0.55rem',
                                fontWeight: 900,
                                padding: '0.15rem 0.4rem',
                                borderRadius: '9999px',
                                textTransform: 'uppercase',
                                letterSpacing: '0.04em',
                                zIndex: 2,
                              }}
                            >
                              POPULAR
                            </span>
                          )}
                          <ProductDeviceGraphic name={cleanedTitle} speed={speed} category={item.category} size="small" />
                        </div>

                        {/* 2. Middle: Package Title, Features & Unit Price */}
                        <div style={{ flex: '1 1 240px', minWidth: '220px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem', flexWrap: 'wrap' }}>
                            <span
                              style={{
                                fontSize: '0.68rem',
                                fontWeight: 800,
                                textTransform: 'uppercase',
                                letterSpacing: '0.04em',
                                padding: '0.18rem 0.5rem',
                                borderRadius: '6px',
                                backgroundColor: '#eff6ff',
                                color: '#0056b3',
                                border: '1px solid #bfdbfe',
                              }}
                            >
                              {item.category || 'Package'}
                            </span>
                            {speed && (
                              <span
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '0.2rem',
                                  fontSize: '0.72rem',
                                  fontWeight: 700,
                                  color: '#0284c7',
                                }}
                              >
                                <FiZap size={12} /> {speed}
                              </span>
                            )}
                          </div>

                          <h3
                            style={{
                              fontSize: '1.15rem',
                              fontWeight: 800,
                              color: '#0f172a',
                              margin: '0 0 0.5rem 0',
                              lineHeight: 1.35,
                            }}
                          >
                            {cleanedTitle}
                          </h3>

                          {/* Dynamic Features List */}
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem 0.75rem', marginBottom: '0.65rem' }}>
                            {(Array.isArray(item.features) && item.features.length > 0
                              ? item.features.slice(0, 3)
                              : ['High Speed Connectivity', '24/7 Support']
                            ).map((feat, fIdx) => (
                              <span
                                key={fIdx}
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '0.3rem',
                                  fontSize: '0.75rem',
                                  color: '#64748b',
                                  fontWeight: 500,
                                }}
                              >
                                <FiCheck size={13} style={{ color: '#16a34a', flexShrink: 0 }} />
                                <span>{String(feat).replace(/^[✓✔]\s*/, '')}</span>
                              </span>
                            ))}
                          </div>

                          {/* Package Unit Price & Installation Fee */}
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
                            <div style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>
                              Unit Price: <strong style={{ color: '#0f172a', fontSize: '0.95rem' }}>Rs. {monthly.toLocaleString()}</strong> <span style={{ fontSize: '0.75rem' }}>/mo</span>
                            </div>
                            {instFee === 0 ? (
                              <span
                                style={{
                                  backgroundColor: '#dcfce7',
                                  color: '#15803d',
                                  padding: '0.15rem 0.5rem',
                                  borderRadius: '6px',
                                  fontSize: '0.72rem',
                                  fontWeight: 700,
                                }}
                              >
                                Free Installation
                              </span>
                            ) : (
                              <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 500 }}>
                                Installation: Rs. {instFee.toLocaleString()}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* 3. Right: Quantity Controls, Subtotal & Delete Action */}
                        <div
                          style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'flex-end',
                            justifyContent: 'center',
                            gap: '0.75rem',
                            flexShrink: 0,
                            marginLeft: 'auto',
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            {/* Quantity Stepper [- 1 +] */}
                            <div
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                border: '1.5px solid #cbd5e1',
                                borderRadius: '10px',
                                overflow: 'hidden',
                                backgroundColor: '#f8fafc',
                                boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                              }}
                            >
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.preventDefault();
                                  handleQuantityChange(item, -1);
                                }}
                                style={{
                                  border: 'none',
                                  background: 'transparent',
                                  padding: '0.4rem 0.7rem',
                                  cursor: item.quantity <= 1 ? 'not-allowed' : 'pointer',
                                  color: item.quantity <= 1 ? '#94a3b8' : '#1e293b',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  transition: 'background-color 0.15s ease',
                                }}
                                disabled={item.quantity <= 1}
                                title="Decrease quantity"
                              >
                                <FiMinus size={12} strokeWidth={2.5} />
                              </button>
                              <span
                                style={{
                                  padding: '0.4rem 0.75rem',
                                  fontSize: '0.9rem',
                                  fontWeight: 800,
                                  color: '#0f172a',
                                  minWidth: '32px',
                                  textAlign: 'center',
                                  backgroundColor: '#ffffff',
                                }}
                              >
                                {item.quantity}
                              </span>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.preventDefault();
                                  handleQuantityChange(item, 1);
                                }}
                                style={{
                                  border: 'none',
                                  background: 'transparent',
                                  padding: '0.4rem 0.7rem',
                                  cursor: 'pointer',
                                  color: '#1e293b',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  transition: 'background-color 0.15s ease',
                                }}
                                title="Increase quantity"
                              >
                                <FiPlus size={12} strokeWidth={2.5} />
                              </button>
                            </div>

                            {/* Trash Icon */}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.preventDefault();
                                handleRemove(prodId);
                              }}
                              style={{
                                background: '#fef2f2',
                                border: '1px solid #fee2e2',
                                color: '#ef4444',
                                cursor: 'pointer',
                                padding: '0.5rem',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                borderRadius: '10px',
                                transition: 'all 0.15s ease',
                              }}
                              title="Remove item"
                            >
                              <FiTrash2 size={16} />
                            </button>
                          </div>

                          {/* Line Item Subtotal */}
                          <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                              Item Subtotal
                            </div>
                            <div style={{ fontSize: '1.2rem', fontWeight: 900, color: '#0056b3' }}>
                              Rs. {itemSubtotal.toLocaleString()}
                              <span style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 600 }}>/mo</span>
                            </div>
                            {item.quantity > 1 && (
                              <div style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 500 }}>
                                {item.quantity} × Rs. {monthly.toLocaleString()}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {/* Secure & Hassle-Free Banner */}
                <div
                  style={{
                    backgroundColor: '#eff6ff',
                    border: '1px solid #bfdbfe',
                    borderRadius: '16px',
                    padding: '1rem 1.25rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.85rem',
                  }}
                >
                  <div
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '50%',
                      backgroundColor: '#dbeafe',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#0056b3',
                      flexShrink: 0,
                    }}
                  >
                    <FiShield size={18} />
                  </div>
                  <div>
                    <h4 style={{ margin: 0, fontSize: '0.9rem', fontWeight: 800, color: '#0f172a' }}>
                      {t('cart.secure', 'Secure & Hassle-Free')}
                    </h4>
                    <p style={{ margin: '0.15rem 0 0 0', fontSize: '0.8rem', color: '#475569' }}>
                      {t('cart.secureText', 'Your information is safe with us. We use OTP verification to ensure a secure application process.')}
                    </p>
                  </div>
                </div>

              </div>

              {/* Right Column: Order Summary (4 cols) */}
              <div className="cart-layout-summary" style={{ gridColumn: 'span 4' }}>
                <div
                  style={{
                    backgroundColor: '#ffffff',
                    borderRadius: '20px',
                    padding: '1.75rem',
                    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.04)',
                    border: '1px solid #e2e8f0',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '1.25rem',
                    position: 'sticky',
                    top: 'calc(var(--nav-height, 90px) + 1.25rem)',
                  }}
                >
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                    {t('cart.orderSummary', 'Order Summary')}
                  </h3>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', fontSize: '0.9rem', color: '#475569' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span>{t('cart.subtotalWithCount', { count: totalItemCount, defaultValue: `Subtotal (${totalItemCount} ${totalItemCount === 1 ? 'item' : 'items'})` })}</span>
                      <strong style={{ color: '#0f172a' }}>Rs. {monthlyTotal.toLocaleString()}</strong>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                        {t('cart.installationFees', 'Installation Fees')} <FiInfo size={13} color="#94a3b8" />
                      </span>
                      <strong style={{ color: '#0f172a' }}>Rs. {installationTotal.toLocaleString()}</strong>
                    </div>

                    <hr style={{ border: 'none', borderTop: '1px solid #f1f5f9', margin: '0.35rem 0' }} />

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                      <span style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0f172a' }}>
                        {t('cart.totalDue', 'Total Due (First Month)')}
                      </span>
                      <span style={{ fontSize: '1.35rem', fontWeight: 900, color: '#0056b3' }}>
                        Rs. {grandTotal.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* Green Notice Banner */}
                  <div
                    style={{
                      backgroundColor: '#ecfdf5',
                      border: '1px solid #a7f3d0',
                      borderRadius: '12px',
                      padding: '0.75rem 0.9rem',
                      fontSize: '0.78rem',
                      color: '#047857',
                      lineHeight: 1.4,
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '0.4rem',
                    }}
                  >
                    <FiTag size={14} style={{ marginTop: '2px', flexShrink: 0 }} />
                    <span>{t('cart.installationNote', 'Installation fees are one-time charges payable during activation.')}</span>
                  </div>

                  {/* Primary Checkout Button */}
                  <button
                    onClick={handleProceedToCheckout}
                    style={{
                      backgroundColor: '#0056b3',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '12px',
                      padding: '0.95rem',
                      fontSize: '0.95rem',
                      fontWeight: 800,
                      cursor: 'pointer',
                      width: '100%',
                      boxShadow: '0 4px 14px rgba(0, 86, 179, 0.28)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.5rem',
                      transition: 'transform 0.15s ease',
                    }}
                  >
                    {t('cart.proceedToCheckout', 'Proceed to Checkout')} <FiArrowRight size={18} />
                  </button>

                  {/* Secondary Save for Later Button */}
                  <button
                    onClick={() => showToast(t('cart.savedToast', 'Cart saved for later!'), 'info')}
                    style={{
                      backgroundColor: '#ffffff',
                      color: '#0056b3',
                      border: '1.5px solid #cbd5e1',
                      borderRadius: '12px',
                      padding: '0.85rem',
                      fontSize: '0.9rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.4rem',
                    }}
                  >
                    <FiBookmark size={15} /> {t('cart.saveForLater', 'Save for Later')}
                  </button>

                  {/* We Accept Footer */}
                  <div style={{ marginTop: '0.5rem', paddingTop: '1rem', borderTop: '1px solid #f1f5f9' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', display: 'block', marginBottom: '0.5rem' }}>
                      {t('cart.weAccept', 'We Accept')}
                    </span>
                    <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                      {['VISA', 'Mastercard', 'AMEX', 'UnionPay', 'Cash'].map((card) => (
                        <span
                          key={card}
                          style={{
                            backgroundColor: '#f8fafc',
                            border: '1px solid #e2e8f0',
                            borderRadius: '8px',
                            padding: '0.2rem 0.55rem',
                            fontSize: '0.7rem',
                            fontWeight: 700,
                            color: '#334155',
                          }}
                        >
                          {card}
                        </span>
                      ))}
                    </div>
                  </div>

                </div>
              </div>

            </div>

            {/* Bottom Benefits Bar (4 items matching Image 3) */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
              {[
                { title: 'Free Installation', text: 'On all eligible packages', Icon: FiZap },
                { title: '24/7 Customer Support', text: "We're here to help you", Icon: FiHeadphones },
                { title: 'Trusted Network', text: "Sri Lanka's No.1 Network", Icon: FiWifi },
                { title: '100% Secure Payments', text: 'Your payments are safe with us', Icon: FiShield },
              ].map((benefit) => (
                <div
                  key={benefit.title}
                  style={{
                    backgroundColor: '#ffffff',
                    borderRadius: '16px',
                    padding: '1.25rem',
                    border: '1px solid #e2e8f0',
                    boxShadow: '0 4px 18px rgba(15, 23, 42, 0.03)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                  }}
                >
                  <div
                    style={{
                      width: '46px',
                      height: '46px',
                      borderRadius: '12px',
                      backgroundColor: '#eff6ff',
                      color: '#0b4a91',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <benefit.Icon size={22} aria-hidden="true" />
                  </div>
                  <div>
                    <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.2rem 0' }}>
                      {benefit.title}
                    </h4>
                    <p style={{ fontSize: '0.825rem', color: '#64748b', margin: 0 }}>
                      {benefit.text}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

      </div>
    </div>
  );
}
