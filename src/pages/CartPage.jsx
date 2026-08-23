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
} from 'react-icons/fi';
import ProductCard from '../components/catalog/ProductCard';
import ProductDeviceGraphic from '../components/catalog/ProductDeviceGraphic';
import { getCart, removeFromCart, addToCart, getProducts, getLocalCart } from '../services/productService';
import Toast from '../components/common/Toast';

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
    try {
      await removeFromCart(productId);
      showToast('Item removed from cart', 'info');
      fetchCartData();
    } catch (err) {
      showToast('Item removed', 'info');
      fetchCartData();
    }
  };

  const handleQuantityChange = async (item, delta) => {
    const newQty = item.quantity + delta;
    if (newQty < 1) return;
    try {
      await addToCart(item, delta);
      fetchCartData();
    } catch (err) {
      fetchCartData();
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
    const selectedProductData = {
      productId: primaryItem.productId || primaryItem._id || primaryItem.id,
      productName: primaryItem.productName || primaryItem.name,
      monthlyPrice: primaryItem.price || primaryItem.monthlyPrice,
      installationFee: primaryItem.installationFee !== undefined ? primaryItem.installationFee : 2500,
      quantity: primaryItem.quantity,
    };

    sessionStorage.setItem('selectedProduct', JSON.stringify(selectedProductData));

    // Navigate to New Connection Form Page
    navigate('/new-connection', {
      state: {
        items,
        selectedProduct: selectedProductData,
      },
    });
  };

  return (
    <div style={{ backgroundColor: '#f8fafc', minHeight: '100vh', padding: '2rem 0 5rem 0' }}>
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
              Your Shopping Cart
            </h1>
            <p style={{ fontSize: '0.9rem', color: '#64748b', marginTop: '0.35rem', marginBottom: 0 }}>
              Review your selected products before proceeding.
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
              borderRadius: '10px',
              backgroundColor: '#ffffff',
              border: '1.5px solid #0056b3',
              boxShadow: '0 2px 6px rgba(0, 86, 179, 0.08)',
              transition: 'all 0.15s ease',
            }}
          >
            <FiArrowLeft size={16} /> Continue Browsing
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
                borderRadius: '24px',
                padding: '4.5rem 2rem',
                textAlign: 'center',
                boxShadow: '0 10px 30px rgba(0, 0, 0, 0.04)',
                border: '1px solid #e2e8f0',
                marginBottom: '3rem',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              {/* Gradient Accent Bar */}
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: '4px',
                  background: 'linear-gradient(90deg, #0056b3 0%, #10b981 100%)',
                }}
              />

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
                <FiZap size={13} /> SLTMobitel EasyApply
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
                Your cart is currently empty
              </h2>

              <p style={{ fontSize: '0.98rem', color: '#64748b', marginBottom: '2.5rem', maxWidth: '540px', marginLeft: 'auto', marginRight: 'auto', lineHeight: 1.6 }}>
                Looks like you haven't added any SLTMobitel products yet. Explore our high-speed Fibre Broadband, 4G LTE Home, and PEO TV packages to build your connection.
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
                  <FiGrid size={16} /> Browse Products
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
                  { title: 'Free Installation', text: 'On all eligible packages', icon: '⚡' },
                  { title: '24/7 Customer Support', text: "We're here to help you", icon: '🎧' },
                  { title: 'Trusted Network', text: "Sri Lanka's No.1 Network", icon: '📡' },
                  { title: '100% Secure Payments', text: 'Your payments are safe with us', icon: '🔒' },
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
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '1.4rem',
                        flexShrink: 0,
                      }}
                    >
                      {benefit.icon}
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
                  <span>Cart Items ({totalItemCount})</span>
                </div>

                {items.map((item, idx) => {
                  const prodId = item.productId || item._id || item.id;
                  const prodName = item.productName || item.name || 'SLTMobitel Connection';
                  const monthly = item.price || item.monthlyPrice || 0;
                  const instFee = item.installationFee !== undefined ? item.installationFee : 2500;
                  const speed = item.speed || '300 Mbps';
                  const isPopular = item.popular !== undefined ? item.popular : true;

                  return (
                    <div
                      key={idx}
                      style={{
                        backgroundColor: '#ffffff',
                        borderRadius: '16px',
                        padding: '1.5rem',
                        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.04)',
                        border: '1px solid #e2e8f0',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '1rem',
                      }}
                    >
                      <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', alignItems: 'flex-start' }}>

                        {/* Left visual box with POPULAR badge and Device Graphic */}
                        <div
                          style={{
                            width: '140px',
                            height: '140px',
                            borderRadius: '14px',
                            background: 'linear-gradient(135deg, #091e42 0%, #0056b3 100%)',
                            position: 'relative',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#fff',
                            flexShrink: 0,
                            overflow: 'hidden',
                            padding: '0.5rem',
                          }}
                        >
                          {isPopular && (
                            <span
                              style={{
                                position: 'absolute',
                                top: '0.5rem',
                                left: '0.5rem',
                                backgroundColor: '#10b981',
                                color: '#ffffff',
                                fontSize: '0.62rem',
                                fontWeight: 800,
                                padding: '0.2rem 0.5rem',
                                borderRadius: '4px',
                                textTransform: 'uppercase',
                                letterSpacing: '0.04em',
                              }}
                            >
                              POPULAR
                            </span>
                          )}
                          <ProductDeviceGraphic name={prodName} speed={speed} category={item.category} size="small" />
                        </div>

                        {/* Product Title & Features */}
                        <div style={{ flex: 1, minWidth: '240px' }}>
                          <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.85rem 0' }}>
                            {prodName}
                          </h3>

                          {/* 5 Feature Icons Strip */}
                          <div
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.85rem',
                              backgroundColor: '#f8fafc',
                              padding: '0.6rem 0.85rem',
                              borderRadius: '10px',
                              border: '1px solid #f1f5f9',
                              marginBottom: '1rem',
                              flexWrap: 'wrap',
                            }}
                          >
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', fontSize: '0.68rem', color: '#475569', textAlign: 'center' }}>
                              <FiActivity size={15} color="#0056b3" />
                              <span style={{ marginTop: '0.2rem', fontWeight: 600 }}>{speed}</span>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', fontSize: '0.68rem', color: '#475569', textAlign: 'center' }}>
                              <FiDatabase size={15} color="#0056b3" />
                              <span style={{ marginTop: '0.2rem', fontWeight: 600 }}>Unlimited Data</span>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', fontSize: '0.68rem', color: '#475569', textAlign: 'center' }}>
                              <FiWifi size={15} color="#0056b3" />
                              <span style={{ marginTop: '0.2rem', fontWeight: 600 }}>Free Router</span>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', fontSize: '0.68rem', color: '#475569', textAlign: 'center' }}>
                              <FiTag size={15} color="#0056b3" />
                              <span style={{ marginTop: '0.2rem', fontWeight: 600 }}>Free Setup</span>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', fontSize: '0.68rem', color: '#475569', textAlign: 'center' }}>
                              <FiHeadphones size={15} color="#0056b3" />
                              <span style={{ marginTop: '0.2rem', fontWeight: 600 }}>24/7 Support</span>
                            </div>
                          </div>

                          {/* Pricing Row */}
                          <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.4rem', flexWrap: 'wrap' }}>
                            <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0056b3' }}>
                              Rs. {monthly.toLocaleString()}
                            </span>
                            <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>/month</span>
                            <span style={{ fontSize: '0.825rem', color: '#475569', fontWeight: 600, marginLeft: '0.5rem' }}>
                              Installation Fee: Rs. {instFee.toLocaleString()} (One-time)
                            </span>
                          </div>
                        </div>

                        {/* Right: Quantity Selector, Remove Button & Item Total */}
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', justifyContent: 'space-between', alignSelf: 'stretch', gap: '1rem' }}>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                            {/* Quantity Selector [- 1 +] */}
                            <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #cbd5e1', borderRadius: '8px', overflow: 'hidden', backgroundColor: '#fff' }}>
                              <button
                                onClick={() => handleQuantityChange(item, -1)}
                                style={{ border: 'none', background: '#f8fafc', padding: '0.35rem 0.65rem', cursor: 'pointer', color: '#334155' }}
                                title="Decrease quantity"
                              >
                                <FiMinus size={12} />
                              </button>
                              <span style={{ padding: '0.35rem 0.75rem', fontSize: '0.875rem', fontWeight: 700, color: '#0f172a', minWidth: '28px', textAlign: 'center' }}>
                                {item.quantity}
                              </span>
                              <button
                                onClick={() => handleQuantityChange(item, 1)}
                                style={{ border: 'none', background: '#f8fafc', padding: '0.35rem 0.65rem', cursor: 'pointer', color: '#334155' }}
                                title="Increase quantity"
                              >
                                <FiPlus size={12} />
                              </button>
                            </div>

                            {/* Trash Icon */}
                            <button
                              onClick={() => handleRemove(prodId)}
                              style={{
                                background: 'none',
                                border: 'none',
                                color: '#ef4444',
                                cursor: 'pointer',
                                padding: '0.4rem',
                                display: 'flex',
                                alignItems: 'center',
                                borderRadius: '6px',
                              }}
                              title="Remove item"
                            >
                              <FiTrash2 size={18} />
                            </button>
                          </div>

                          <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0056b3' }}>
                            Rs. {(monthly * item.quantity).toLocaleString()} <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 500 }}>/month</span>
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
                    borderRadius: '14px',
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
                      Secure & Hassle-Free
                    </h4>
                    <p style={{ margin: '0.15rem 0 0 0', fontSize: '0.8rem', color: '#475569' }}>
                      Your information is safe with us. We use OTP verification to ensure a secure application process.
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
                    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
                    border: '1px solid #e2e8f0',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '1.25rem',
                    position: 'sticky',
                    top: '1.5rem',
                  }}
                >
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                    Order Summary
                  </h3>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', fontSize: '0.9rem', color: '#475569' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span>Subtotal ({totalItemCount} {totalItemCount === 1 ? 'item' : 'items'})</span>
                      <strong style={{ color: '#0f172a' }}>Rs. {monthlyTotal.toLocaleString()}</strong>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                        Installation Fees <FiInfo size={13} color="#94a3b8" />
                      </span>
                      <strong style={{ color: '#0f172a' }}>Rs. {installationTotal.toLocaleString()}</strong>
                    </div>

                    <hr style={{ border: 'none', borderTop: '1px solid #f1f5f9', margin: '0.35rem 0' }} />

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                      <span style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0f172a' }}>
                        Total Due (First Month)
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
                      borderRadius: '10px',
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
                    <span>Installation fees are one-time charges payable during activation.</span>
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
                    Proceed to Checkout <FiArrowRight size={18} />
                  </button>

                  {/* Secondary Save for Later Button */}
                  <button
                    onClick={() => showToast('Cart saved for later!', 'info')}
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
                    <FiBookmark size={15} /> Save for Later
                  </button>

                  {/* We Accept Footer */}
                  <div style={{ marginTop: '0.5rem', paddingTop: '1rem', borderTop: '1px solid #f1f5f9' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', display: 'block', marginBottom: '0.5rem' }}>
                      We Accept
                    </span>
                    <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                      {['VISA', 'Mastercard', 'AMEX', 'UnionPay', 'Cash'].map((card) => (
                        <span
                          key={card}
                          style={{
                            backgroundColor: '#f8fafc',
                            border: '1px solid #e2e8f0',
                            borderRadius: '6px',
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
                { title: 'Free Installation', text: 'On all eligible packages', icon: '⚡' },
                { title: '24/7 Customer Support', text: "We're here to help you", icon: '🎧' },
                { title: 'Trusted Network', text: "Sri Lanka's No.1 Network", icon: '📡' },
                { title: '100% Secure Payments', text: 'Your payments are safe with us', icon: '🔒' },
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
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1.35rem',
                      flexShrink: 0,
                    }}
                  >
                    {benefit.icon}
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
