import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Icon from '../components/Icon';

// Images
import fibreRouterImg from '../assets/products/fibre_router.png';
import lteRouterImg from '../assets/products/lte_router.png';
import peoTvBoxImg from '../assets/products/peo_tv_box.png';
import homePhoneImg from '../assets/products/home_phone.png';

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

const VOICE_PRODUCTS = [
  { id: 1, title: 'Fibre Voice', type: 'purple', price: '499', image: homePhoneImg },
  { id: 2, title: 'Megaline (Copper)', type: 'orange', price: '349', image: homePhoneImg },
  { id: 3, title: '4G LTE Voice', type: 'red', price: '399', image: homePhoneImg },
];

const DATA_PRODUCTS = [
  { id: 4, title: 'Web Starter', type: 'blue', price: '1,490', image: fibreRouterImg },
  { id: 5, title: 'Web Family Plus', type: 'green', price: '2,990', image: lteRouterImg },
  { id: 6, title: 'Web Pro', type: 'blue', price: '4,490', image: fibreRouterImg },
];

const PEOTV_PRODUCTS = [
  { id: 7, title: 'PEO Family', type: 'orange', price: '1,999', image: peoTvBoxImg },
  { id: 8, title: 'PEO Platinum', type: 'purple', price: '3,499', image: peoTvBoxImg },
  { id: 9, title: 'PEO Titanium', type: 'red', price: '4,999', image: peoTvBoxImg },
];

function ProductCard({ product }) {
  return (
    <div className={`product-card product-card-${product.type}`}>
      <h3 className="product-title">{product.title}</h3>
      <div className="product-image-container">
        <img src={product.image} alt={product.title} />
      </div>
      <div className="product-card-footer">
        <div className="product-price">
          Rs. {product.price}<span> / mo</span>
        </div>
        <Link
          to="/add-to-cart"
          state={{
            package: {
              id: product.id,
              name: product.title,
              price: parseFloat(product.price.replace(',', '')),
              recurringPrice: parseFloat(product.price.replace(',', '')),
              recurringCycle: 'Monthly',
              image: product.image
            }
          }}
          className="product-btn-primary"
        >
          Add to Cart
        </Link>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { t } = useTranslation();

  return (
    <div style={{ backgroundColor: '#fcfcfc', minHeight: '100vh' }}>
      {/* Secondary Hero Bar - from 2nd screenshot */}
      <div style={{ borderBottom: '1px solid var(--line)', padding: '2rem 0', background: 'white' }}>
        <div className="site-container" style={{ padding: '0 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ margin: '0 0 0.5rem 0', fontSize: '2rem' }}>Online Application Forms</h1>
            <p style={{ margin: 0, color: 'var(--muted)', fontSize: '1.05rem' }}>Explore our products and choose the service you need.</p>
          </div>
          <div className="search-cart-bar">
            <div className="search-input-wrapper">
              <Icon name="search" size={18} className="search-icon" />
              <input type="text" placeholder="Search products..." />
            </div>
            <Link to="/add-to-cart" className="btn-cart">
              <Icon name="shopping-cart" size={18} />
              Cart
            </Link>
          </div>
        </div>
      </div>

      <div className="dashboard-layout">

        {/* Sidebar (Our Services) */}
        <aside className="sidebar-section">
          <div className="sidebar-box">
            <div className="sidebar-title">Our Services</div>
            <div className="sidebar-menu">
              {SERVICES.map(service => (
                <Link to={service.route} key={service.id} className="sidebar-btn">
                  {service.title}
                </Link>
              ))}
              <div style={{ marginTop: '0.5rem' }}>
                <button className="sidebar-btn" style={{ background: '#f1f5f9', justifyContent: 'center' }}>
                  View All Services
                </button>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content (Our Products) */}
        <main className="main-content-section">
          <div className="main-content-header">
            <h2>Our Products</h2>
            <button className="btn-view-all">View All -{'>'}</button>
          </div>

          {/* Voice Category */}
          <div className="category-section">
            <div className="category-title">Voice</div>
            <div className="product-grid">
              {VOICE_PRODUCTS.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>

          {/* Data Category */}
          <div className="category-section">
            <div className="category-title">Data</div>
            <div className="product-grid">
              {DATA_PRODUCTS.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>

          {/* Peo TV Category */}
          <div className="category-section">
            <div className="category-title">Peo TV</div>
            <div className="product-grid">
              {PEOTV_PRODUCTS.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>

        </main>
      </div>
    </div>
  );
}
