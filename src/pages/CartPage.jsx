import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  FiTrash2,
  FiArrowLeft,
  FiPlus,
  FiMinus,
  FiShoppingCart,
  FiShield,
  FiWifi,
  FiTag,
  FiBookmark,
  FiArrowRight,
  FiGrid,
} from 'react-icons/fi';
import ProductCard from '../components/catalog/ProductCard';
import ProductDeviceGraphic from '../components/catalog/ProductDeviceGraphic';
import { getCart, removeFromCart, addToCart, getProducts, getLocalCart } from '../services/productService';
import Toast from '../components/common/Toast';
import { resolveProductImage, matchCatalogProduct } from '../utils/productImage';

export default function CartPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [recommended, setRecommended] = useState([]);
  const [catalog, setCatalog] = useState([]);
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

  // One catalogue request (same API as the product page) feeds both the
  // "recommended" row and the pictures/specs of the lines already in the cart.
  const fetchRecommended = async () => {
    try {
      const productsRes = await getProducts({ limit: 100 });
      const list = productsRes.data || productsRes.products || productsRes || [];
      const products = Array.isArray(list) ? list : [];
      setCatalog(products);
      setRecommended(
        products.slice(0, 4).map((p) => ({
          ...p,
          name: p.name || p.productName,
          monthlyPrice: p.monthlyPrice ?? p.price,
          bannerUrl: resolveProductImage(p),
        }))
      );
    } catch (err) {
      console.warn('Could not fetch catalogue for cart:', err);
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

  // Cart lines only store a few fields; fill in picture, speed, features and
  // category from the live catalogue so a line looks the same as on the product page.
  const rawItems = cart?.items || [];
  const items = useMemo(
    () =>
      rawItems.map((item) => {
        const live = matchCatalogProduct(item, catalog);
        const merged = live
          ? {
              ...item,
              bannerUrl: item.bannerUrl || resolveProductImage(live),
              speed: live.speed || item.speed,
              category: live.category || item.category,
            }
          : item;
        return { ...merged, bannerUrl: resolveProductImage(merged) };
      }),
    [rawItems, catalog]
  );
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

    localStorage.setItem('selectedProduct', JSON.stringify(selectedProductData));

    // Navigate to New Connection Form Page
    navigate('/new-connection', {
      state: {
        items,
        selectedProduct: selectedProductData,
      },
    });
  };

  const money = (n) => `Rs. ${Number(n || 0).toLocaleString('en-LK')}`;

  return (
    <div className="page-wide">
      <Toast toast={toast} onClose={() => setToast(null)} />

      <nav aria-label="Breadcrumb" className="crumbs">
        <Link to="/">Home</Link>
        <span aria-hidden="true">›</span>
        <Link to="/new-connection/products">Product Catalogue</Link>
        <span aria-hidden="true">›</span>
        <span aria-current="page">Shopping Cart</span>
      </nav>

      <div className="page-head">
        <div>
          <h1 className="page-title">{t('cart.title', 'Your Shopping Cart')}</h1>
          <p className="page-lead">{t('cart.subtitle', 'Review your selected products before proceeding.')}</p>
        </div>
        <Link to="/new-connection/products" className="btn-ds btn-ds--outline">
          <FiArrowLeft size={18} aria-hidden="true" />
          <span>{t('cart.continueBrowsing', 'Continue Browsing')}</span>
        </Link>
      </div>

      {loading ? (
        <div className="empty-state" aria-busy="true">
          <p style={{ margin: 0, color: 'var(--muted)' }}>{t('common.loading', 'Loading...')}</p>
        </div>
      ) : items.length === 0 ? (
        <div className="empty-state">
          <span className="value-strip__ic" aria-hidden="true">
            <FiShoppingCart size={22} />
          </span>
          <h2 style={{ margin: 0 }}>{t('cart.emptyTitle', 'Your cart is empty')}</h2>
          <p style={{ margin: 0, color: 'var(--muted)' }}>
            {t('cart.emptyText', 'Add a package to start your application.')}
          </p>
          <Link to="/new-connection/products" className="btn-ds btn-ds--primary">
            <FiGrid size={18} aria-hidden="true" />
            <span>{t('cart.browseProducts', 'Browse Products')}</span>
          </Link>
        </div>
      ) : (
        <div className="cart-layout">
          <section aria-labelledby="cart-items-h" className="cart-list">
            <h2 id="cart-items-h" style={{ fontSize: 20, margin: 0 }}>
              {t('cart.itemsHeading', { count: totalItemCount, defaultValue: 'Cart Items ({{count}})' })}
            </h2>

            {items.map((item, idx) => {
              const prodId = item.productId || item._id || item.id;
              const prodName = item.productName || item.name || 'SLTMobitel Connection';
              const monthly = item.price || item.monthlyPrice || 0;
              const instFee = item.installationFee !== undefined ? item.installationFee : 2500;
              const qty = item.quantity || 1;

              return (
                <article key={prodId || idx} className="cart-item">
                  <div className="cart-item__media" aria-hidden="true">
                    {item.bannerUrl ? (
                      <img src={item.bannerUrl} alt="" />
                    ) : (
                      <ProductDeviceGraphic name={prodName} category={item.category || ''} />
                    )}
                  </div>

                  <div className="cart-item__main">
                    <h3>{prodName}</h3>
                    {item.speed && <span className="pc__speed"><FiWifi size={16} aria-hidden="true" />{item.speed}</span>}
                    <p className="cart-item__price">
                      <strong>{money(monthly)}</strong> <span>/ month</span>
                      <span className="cart-item__fee">Installation {money(instFee)} (one time)</span>
                    </p>
                  </div>

                  <div className="cart-item__controls">
                    <div className="qty" role="group" aria-label={`Quantity for ${prodName}`}>
                      <button
                        type="button"
                        onClick={() => handleQuantityChange(item, -1)}
                        disabled={qty <= 1}
                        aria-label="Decrease quantity"
                      >
                        <FiMinus size={16} aria-hidden="true" />
                      </button>
                      <span aria-live="polite">{qty}</span>
                      <button type="button" onClick={() => handleQuantityChange(item, 1)} aria-label="Increase quantity">
                        <FiPlus size={16} aria-hidden="true" />
                      </button>
                    </div>
                    <strong className="cart-item__line">{money(monthly * qty)}</strong>
                    <button type="button" className="cart-item__remove" onClick={() => handleRemove(prodId)}>
                      <FiTrash2 size={18} aria-hidden="true" />
                      <span>{t('cart.remove', 'Remove')}</span>
                    </button>
                  </div>
                </article>
              );
            })}

            <div className="notice">
              <FiShield size={20} aria-hidden="true" style={{ flex: 'none', marginTop: 2 }} />
              <span>
                <strong>Secure &amp; hassle-free.</strong> Your information is safe with us. We use OTP verification to
                keep your application secure.
              </span>
            </div>
          </section>

          <aside className="cart-summary" aria-labelledby="summary-h">
            <h2 id="summary-h">{t('cart.orderSummary', 'Order Summary')}</h2>
            <div className="cart-summary__body">
              <div className="cart-summary__row">
                <span>{t('cart.subtotal', 'Subtotal')} ({totalItemCount} {totalItemCount === 1 ? 'item' : 'items'})</span>
                <strong>{money(monthlyTotal)}</strong>
              </div>
              <div className="cart-summary__row">
                <span>{t('cart.installationFees', 'Installation Fees')}</span>
                <strong>{money(installationTotal)}</strong>
              </div>
              <hr className="sep" />
              <div className="cart-summary__row cart-summary__row--total">
                <span>{t('cart.totalDue', 'Total Due (First Month)')}</span>
                <strong>{money(grandTotal)}</strong>
              </div>
              <p className="cart-summary__note">
                <FiTag size={16} aria-hidden="true" />
                <span>{t('cart.installationNote', 'Installation fees are one-time charges payable during activation.')}</span>
              </p>

              <button type="button" className="btn-ds btn-ds--buy btn-ds--block" onClick={handleProceedToCheckout} style={{ minHeight: 56, fontSize: 17 }}>
                <span>{t('cart.proceedToCheckout', 'Proceed to Checkout')}</span>
                <FiArrowRight size={20} aria-hidden="true" />
              </button>
              <button
                type="button"
                className="btn-ds btn-ds--outline btn-ds--block"
                onClick={() => showToast(t('cart.savedToast', 'Cart saved for later!'), 'info')}
              >
                <FiBookmark size={18} aria-hidden="true" />
                <span>{t('cart.saveForLater', 'Save for Later')}</span>
              </button>

              <div className="cart-summary__accept">
                <span>{t('cart.weAccept', 'We Accept')}</span>
                <div>
                  {['VISA', 'Mastercard', 'AMEX', 'UnionPay', 'Cash'].map((card) => (
                    <span key={card} className="badge-plain">{card}</span>
                  ))}
                </div>
              </div>
            </div>
          </aside>
        </div>
      )}

      {recommended.length > 0 && (
        <section aria-labelledby="rec-h" className="cat-section">
          <div>
            <h2 id="rec-h" style={{ fontSize: 22, margin: 0 }}>Recommended Packages</h2>
            <p className="page-lead" style={{ fontSize: 15 }}>Popular connections for home and office.</p>
          </div>
          <div className="pgrid">
            {recommended.map((product) => (
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
            ))}
          </div>
        </section>
      )}

    </div>
  );
}
