import React from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from './Icon';

const BillingSection = ({ selectedPackage, onAddToCart }) => {
  const navigate = useNavigate();

  // Mock billing data
  const mockBillingData = {
    package: selectedPackage || {
      name: 'Fibre Broadband 50Mbps',
      price: 2500,
      duration: 'Monthly',
      features: ['50 Mbps Speed', 'Unlimited Data', 'Free Installation'],
    },
    additionalCharges: [
      { name: 'Installation Fee', amount: 1000 },
      { name: 'Equipment Rental', amount: 500 },
      { name: 'Tax (15%)', amount: 525 },
    ],
    subtotal: 4000,
    tax: 600,
    total: 4600,
  };

  const handleAddToCart = () => {
    if (onAddToCart) {
      onAddToCart(mockBillingData);
    } else {
      // Navigate to cart page with package info
      navigate('/add-to-cart', {
        state: {
          package: mockBillingData.package,
          billingDetails: mockBillingData,
        },
      });
    }
  };

  return (
    <div
      style={{
        backgroundColor: '#f8fafc',
        border: '1px solid #e2e8f0',
        borderRadius: '12px',
        padding: '1.5rem',
        marginTop: '2rem',
      }}
    >
      {/* Add to Cart Button */}
      <div style={{ marginBottom: '1.5rem' }}>
        <button
          onClick={handleAddToCart}
          style={{
            width: '100%',
            padding: '0.85rem 1.5rem',
            backgroundColor: '#0056b3',
            color: '#ffffff',
            border: 'none',
            borderRadius: '8px',
            fontSize: '1rem',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            transition: 'background-color 0.2s ease',
            boxShadow: '0 4px 12px rgba(0, 86, 179, 0.25)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#004494';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#0056b3';
          }}
        >
          <Icon name="shopping-cart" size={20} />
          <span>Add to Cart</span>
        </button>
      </div>

      {/* Billing Header */}
      <h3
        style={{
          fontSize: '1.1rem',
          fontWeight: 600,
          color: '#1e293b',
          marginBottom: '1rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
        }}
      >
        <Icon name="file-text" size={20} color="#0056b3" />
        Billing Summary
      </h3>

      {/* Selected Package */}
      <div
        style={{
          backgroundColor: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: '8px',
          padding: '1rem',
          marginBottom: '1rem',
        }}
      >
        <div
          style={{
            fontSize: '1rem',
            fontWeight: 600,
            color: '#1e293b',
            marginBottom: '0.5rem',
          }}
        >
          {mockBillingData.package.name}
        </div>
        <div
          style={{
            fontSize: '0.9rem',
            color: '#64748b',
            marginBottom: '0.75rem',
          }}
        >
          {mockBillingData.package.duration} Plan
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
          {mockBillingData.package.features.map((feature, index) => (
            <span
              key={index}
              style={{
                fontSize: '0.8rem',
                backgroundColor: '#f0f7ff',
                color: '#0056b3',
                padding: '0.25rem 0.75rem',
                borderRadius: '12px',
                fontWeight: 500,
              }}
            >
              {feature}
            </span>
          ))}
        </div>
      </div>

      {/* Additional Charges */}
      <div style={{ marginBottom: '1rem' }}>
        <div
          style={{
            fontSize: '0.9rem',
            fontWeight: 600,
            color: '#475569',
            marginBottom: '0.75rem',
          }}
        >
          Additional Charges
        </div>
        {mockBillingData.additionalCharges.map((charge, index) => (
          <div
            key={index}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              padding: '0.5rem 0',
              borderBottom: index < mockBillingData.additionalCharges.length - 1 ? '1px solid #e2e8f0' : 'none',
              fontSize: '0.85rem',
              color: '#64748b',
            }}
          >
            <span>{charge.name}</span>
            <span style={{ fontWeight: 500, color: '#1e293b' }}>
              LKR {charge.amount.toLocaleString('en-LK')}
            </span>
          </div>
        ))}
      </div>

      {/* Totals */}
      <div
        style={{
          backgroundColor: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: '8px',
          padding: '1rem',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginBottom: '0.5rem',
            fontSize: '0.9rem',
            color: '#64748b',
          }}
        >
          <span>Subtotal</span>
          <span>LKR {mockBillingData.subtotal.toLocaleString('en-LK')}</span>
        </div>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginBottom: '0.75rem',
            fontSize: '0.9rem',
            color: '#64748b',
          }}
        >
          <span>Tax (15%)</span>
          <span>LKR {mockBillingData.tax.toLocaleString('en-LK')}</span>
        </div>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            paddingTop: '0.75rem',
            borderTop: '2px solid #e2e8f0',
            fontSize: '1.1rem',
            fontWeight: 700,
            color: '#1e293b',
          }}
        >
          <span>Total</span>
          <span style={{ color: '#059669' }}>
            LKR {mockBillingData.total.toLocaleString('en-LK')}
          </span>
        </div>
      </div>

      {/* Note */}
      <div
        style={{
          marginTop: '1rem',
          padding: '0.75rem',
          backgroundColor: '#fffbeb',
          border: '1px solid #fef08a',
          borderRadius: '6px',
          fontSize: '0.8rem',
          color: '#92400e',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
        }}
      >
        <Icon name="info" size={16} color="#92400e" />
        <span>
          This is a mock billing summary. Actual charges may vary based on your selected package and location.
        </span>
      </div>
    </div>
  );
};

export default BillingSection;
