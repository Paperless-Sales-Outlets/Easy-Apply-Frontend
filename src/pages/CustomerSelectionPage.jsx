import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FiUserCheck, FiUserPlus, FiArrowLeft, FiShield, FiCheckCircle } from 'react-icons/fi';

export default function CustomerSelectionPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const cartState = location.state || {};

  const handleSelectCustomerType = (type) => {
    if (type === 'existing') {
      navigate('/new-connection', {
        state: {
          ...cartState,
        },
      });
    } else {
      navigate('/new-connection', {
        state: {
          ...cartState,
        },
      });
    }
  };

  return (
    <div style={{ backgroundColor: '#f8fafc', minHeight: '100vh', padding: '2.5rem 0 4rem 0' }}>
      <div className="page-container" style={{ maxWidth: '1000px', margin: '0 auto', padding: '0 1.5rem' }}>
        
        {/* Navigation Breadcrumb */}
        <nav style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '2rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <Link to="/" style={{ color: '#64748b', textDecoration: 'none' }}>Home</Link>
          <span>›</span>
          <Link to="/cart" style={{ color: '#64748b', textDecoration: 'none' }}>Cart</Link>
          <span>›</span>
          <span style={{ color: '#0056b3', fontWeight: 600 }}>Customer Selection</span>
        </nav>

        {/* Back Link */}
        <div style={{ marginBottom: '2rem' }}>
          <button
            onClick={() => navigate('/cart')}
            style={{
              background: 'none',
              border: 'none',
              color: '#0056b3',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              fontWeight: 600,
              fontSize: '0.9rem',
              cursor: 'pointer',
              padding: 0,
            }}
          >
            <FiArrowLeft size={18} /> Return to Cart
          </button>
        </div>

        {/* Header Title */}
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <span
            style={{
              backgroundColor: '#e0f2fe',
              color: '#0284c7',
              fontSize: '0.75rem',
              fontWeight: 800,
              padding: '0.35rem 0.85rem',
              borderRadius: '9999px',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}
          >
            Step 1 of Checkout
          </span>
          <h1 style={{ fontSize: '2.2rem', fontWeight: 800, color: '#0f172a', marginTop: '0.75rem', marginBottom: '0.5rem' }}>
            Are you an existing SLTMobitel customer?
          </h1>
          <p style={{ fontSize: '1rem', color: '#64748b', maxWidth: '580px', margin: '0 auto' }}>
            Select your customer type below so we can tailor your connection journey.
          </p>
        </div>

        {/* Selection Cards Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '2rem',
            alignItems: 'stretch',
          }}
        >
          {/* Card 1: Existing Customer */}
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '20px',
              border: '2px solid #e2e8f0',
              padding: '2.5rem 2rem',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              alignItems: 'center',
              textAlign: 'center',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.04)',
              transition: 'all 0.25s ease',
              position: 'relative',
              overflow: 'hidden',
            }}
            className="hover-card"
          >
            <div
              style={{
                width: '72px',
                height: '72px',
                borderRadius: '50%',
                backgroundColor: '#eff6ff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#0056b3',
                marginBottom: '1.5rem',
              }}
            >
              <FiUserCheck size={36} />
            </div>

            <div style={{ marginBottom: '2rem' }}>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.75rem' }}>
                Existing Customer
              </h2>
              <p style={{ fontSize: '0.92rem', color: '#64748b', lineHeight: 1.6, margin: 0 }}>
                I already have an SLTMobitel connection and would like to modify or reconnect my service.
              </p>
            </div>

            <button
              onClick={() => handleSelectCustomerType('existing')}
              style={{
                backgroundColor: '#0056b3',
                color: '#ffffff',
                border: 'none',
                borderRadius: '12px',
                padding: '0.9rem 2.2rem',
                fontSize: '0.95rem',
                fontWeight: 700,
                cursor: 'pointer',
                width: '100%',
                boxShadow: '0 4px 14px rgba(0, 86, 179, 0.25)',
                transition: 'transform 0.15s ease',
              }}
            >
              Continue
            </button>
          </div>

          {/* Card 2: New Customer */}
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '20px',
              border: '2px solid #10b981',
              padding: '2.5rem 2rem',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              alignItems: 'center',
              textAlign: 'center',
              boxShadow: '0 4px 20px rgba(16, 185, 129, 0.08)',
              transition: 'all 0.25s ease',
              position: 'relative',
              overflow: 'hidden',
            }}
            className="hover-card"
          >
            <span
              style={{
                position: 'absolute',
                top: '1rem',
                right: '1rem',
                backgroundColor: '#ecfdf5',
                color: '#047857',
                fontSize: '0.7rem',
                fontWeight: 800,
                padding: '0.25rem 0.65rem',
                borderRadius: '9999px',
                display: 'flex',
                alignItems: 'center',
                gap: '0.25rem',
              }}
            >
              <FiCheckCircle size={12} /> Instant Setup
            </span>

            <div
              style={{
                width: '72px',
                height: '72px',
                borderRadius: '50%',
                backgroundColor: '#ecfdf5',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#10b981',
                marginBottom: '1.5rem',
              }}
            >
              <FiUserPlus size={36} />
            </div>

            <div style={{ marginBottom: '2rem' }}>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.75rem' }}>
                New Customer
              </h2>
              <p style={{ fontSize: '0.92rem', color: '#64748b', lineHeight: 1.6, margin: 0 }}>
                I want to apply for a brand-new SLTMobitel connection.
              </p>
            </div>

            <button
              onClick={() => handleSelectCustomerType('new')}
              style={{
                backgroundColor: '#10b981',
                color: '#ffffff',
                border: 'none',
                borderRadius: '12px',
                padding: '0.9rem 2.2rem',
                fontSize: '0.95rem',
                fontWeight: 700,
                cursor: 'pointer',
                width: '100%',
                boxShadow: '0 4px 14px rgba(16, 185, 129, 0.25)',
                transition: 'transform 0.15s ease',
              }}
            >
              Continue
            </button>
          </div>
        </div>

        {/* Security badge note */}
        <div
          style={{
            marginTop: '3.5rem',
            textAlign: 'center',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            fontSize: '0.85rem',
            color: '#64748b',
          }}
        >
          <FiShield size={16} color="#0056b3" />
          <span>Your information is encrypted & secured by SLTMobitel EasyApply.</span>
        </div>
      </div>
    </div>
  );
}
