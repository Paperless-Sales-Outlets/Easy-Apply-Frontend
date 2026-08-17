import React from 'react';
import { useTranslation } from 'react-i18next';
import { PRODUCTS_DATA } from './ProductCatalog';
import {
  FiShoppingCart,
  FiTrash2,
  FiPlus,
  FiArrowRight,
  FiChevronLeft,
  FiCheckCircle,
  FiShield,
  FiZap,
  FiPhone,
  FiPackage,
  FiInfo,
} from 'react-icons/fi';

export default function CartReviewStep({
  cartItems,
  onRemoveFromCart,
  onAddToCart,
  onBackToCatalog,
  onProceedToForm,
}) {
  const { t } = useTranslation();

  // Recommended add-ons that can be added directly from Cart screen
  const recommendedAddons = [
    {
      id: 'addon-mesh',
      title: 'Smart Wi-Fi 6 Mesh Extender',
      type: 'addons',
      price: 490,
      installationFee: 0,
      description: 'Eliminate dead zones with seamless whole-home Wi-Fi coverage.',
      cardBg: 'linear-gradient(135deg, #1E293B 0%, #0F172A 100%)',
    },
    {
      id: 'addon-staticip',
      title: 'Static IP Address Service',
      type: 'addons',
      price: 1200,
      installationFee: 500,
      description: 'Dedicated public IPv4 address for hosting servers, CCTV & VPNs.',
      cardBg: 'linear-gradient(135deg, #1E293B 0%, #0F172A 100%)',
    },
    {
      id: 'addon-gaming',
      title: 'Gamer Priority Boost',
      type: 'addons',
      price: 990,
      installationFee: 0,
      description: 'Ultra-low latency routing optimization for competitive online gaming.',
      cardBg: 'linear-gradient(135deg, #1E293B 0%, #0F172A 100%)',
    },
  ];

  // Calculations
  const totalMonthly = cartItems.reduce((sum, item) => sum + (item.price || 0), 0);
  const totalInstallation = cartItems.reduce((sum, item) => sum + (item.installationFee || 0), 0);

  return (
    <div style={{ width: '100%', maxWidth: '1000px', margin: '0 auto', paddingBottom: '3rem' }}>
      {/* Top Header & Navigation */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1.5rem',
        }}
      >
        <button
          type="button"
          onClick={onBackToCatalog}
          style={{
            background: 'none',
            border: 'none',
            color: '#0F57A8',
            fontWeight: '600',
            fontSize: '0.9rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.3rem',
          }}
        >
          <FiChevronLeft size={18} />
          <span>Add More Products / Back to Catalog</span>
        </button>

        <span style={{ fontSize: '0.9rem', color: '#64748B', fontWeight: '500' }}>
          Cart Review (<strong>{cartItems.length}</strong> items)
        </span>
      </div>

      <div style={{ marginBottom: '1.75rem' }}>
        <h1
          style={{
            fontSize: '1.8rem',
            fontWeight: '800',
            color: 'var(--navy, #0B2D5B)',
            marginBottom: '0.3rem',
          }}
        >
          Review & Edit Your Cart
        </h1>
        <p style={{ color: 'var(--text-secondary, #64748B)', fontSize: '0.95rem' }}>
          Review your selected products, customize add-ons, and verify charges before proceeding.
        </p>
      </div>

      {/* Main Grid: Cart Items List (Left) + Order Summary (Right) */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: cartItems.length > 0 ? '1fr 340px' : '1fr',
          gap: '1.75rem',
          alignItems: 'start',
        }}
      >
        {/* LEFT COLUMN: Selected Items List */}
        <div>
          {cartItems.length === 0 ? (
            <div
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '16px',
                padding: '3rem 2rem',
                textAlign: 'center',
                border: '1px solid #E2E8F0',
                boxShadow: '0 4px 16px rgba(0, 0, 0, 0.03)',
              }}
            >
              <FiShoppingCart size={48} style={{ color: '#94A3B8', marginBottom: '1rem' }} />
              <h3 style={{ fontSize: '1.2rem', color: '#1E293B', marginBottom: '0.5rem' }}>
                Your Cart is Empty
              </h3>
              <p style={{ color: '#64748B', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                Explore our catalog to select Fibre Broadband, PEO TV, Voice packages, or Add-ons.
              </p>
              <button
                type="button"
                className="btn btn-primary"
                onClick={onBackToCatalog}
              >
                Browse Product Catalog
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {/* Mandatory Voice Line Banner */}
              <div
                style={{
                  backgroundColor: '#EFF6FF',
                  border: '1px solid #BFDBFE',
                  borderRadius: '12px',
                  padding: '1rem 1.25rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                }}
              >
                <FiPhone size={22} style={{ color: '#1D4ED8', flexShrink: 0 }} />
                <div>
                  <strong style={{ color: '#1E3A8A', display: 'block', fontSize: '0.92rem' }}>
                    Fixed Voice Line Included (Mandatory Service)
                  </strong>
                  <span style={{ fontSize: '0.82rem', color: '#1E40AF' }}>
                    Free SLT fixed landline connection automatically included with your order.
                  </span>
                </div>
              </div>

              {/* Line Items */}
              {cartItems.map((item) => (
                <div
                  key={item.id}
                  style={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: '16px',
                    border: '1px solid #E2E8F0',
                    padding: '1.25rem',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.03)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: '1rem',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    {/* Item Icon Badge */}
                    <div
                      style={{
                        width: '48px',
                        height: '48px',
                        borderRadius: '12px',
                        background: item.cardBg || 'linear-gradient(135deg, #0F57A8 0%, #00B4D8 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#FFFFFF',
                        flexShrink: 0,
                      }}
                    >
                      <FiPackage size={22} />
                    </div>

                    <div>
                      <h4 style={{ fontSize: '1.05rem', fontWeight: '700', color: '#0F172A', margin: 0 }}>
                        {item.title}
                      </h4>
                      <p style={{ fontSize: '0.82rem', color: '#64748B', margin: '0.2rem 0 0 0' }}>
                        {item.description || item.subtitle || 'Selected SLT Telecom Package'}
                      </p>
                      {item.installationFee !== undefined && (
                        <span style={{ fontSize: '0.78rem', color: '#94A3B8', display: 'inline-block', marginTop: '0.2rem' }}>
                          One-time Installation: Rs. {item.installationFee.toLocaleString()}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Price & Remove Button */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '1.15rem', fontWeight: '800', color: '#0F172A' }}>
                        Rs. {item.price ? item.price.toLocaleString() : '0'}
                      </div>
                      <span style={{ fontSize: '0.78rem', color: '#64748B' }}>/month</span>
                    </div>

                    <button
                      type="button"
                      onClick={() => onRemoveFromCart(item.id)}
                      title="Remove item"
                      style={{
                        background: '#FEF2F2',
                        border: '1px solid #FCA5A5',
                        color: '#EF4444',
                        borderRadius: '8px',
                        width: '36px',
                        height: '36px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                      }}
                    >
                      <FiTrash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}

              {/* Recommended Add-ons Section */}
              <div style={{ marginTop: '1.5rem' }}>
                <h4 style={{ fontSize: '1rem', fontWeight: '700', color: '#0F172A', marginBottom: '0.85rem' }}>
                  Recommended Add-ons & Hardware
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '0.85rem' }}>
                  {recommendedAddons.map((addon) => {
                    const isAlreadyInCart = cartItems.some((i) => i.id === addon.id);
                    return (
                      <div
                        key={addon.id}
                        style={{
                          backgroundColor: '#FFFFFF',
                          border: '1px solid #E2E8F0',
                          borderRadius: '12px',
                          padding: '1rem',
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'space-between',
                        }}
                      >
                        <div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                            <strong style={{ fontSize: '0.9rem', color: '#0F172A' }}>{addon.title}</strong>
                            <span style={{ fontSize: '0.88rem', fontWeight: '700', color: '#0F57A8' }}>
                              +Rs. {addon.price}/mo
                            </span>
                          </div>
                          <p style={{ fontSize: '0.78rem', color: '#64748B', lineHeight: '1.4', margin: 0 }}>
                            {addon.description}
                          </p>
                        </div>

                        <button
                          type="button"
                          disabled={isAlreadyInCart}
                          onClick={() => onAddToCart(addon)}
                          style={{
                            marginTop: '0.75rem',
                            padding: '0.4rem 0.75rem',
                            borderRadius: '6px',
                            border: isAlreadyInCart ? '1px solid #A7F3D0' : '1px solid #0F57A8',
                            backgroundColor: isAlreadyInCart ? '#ECFDF5' : '#FFFFFF',
                            color: isAlreadyInCart ? '#047857' : '#0F57A8',
                            fontSize: '0.8rem',
                            fontWeight: '600',
                            cursor: isAlreadyInCart ? 'default' : 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.3rem',
                          }}
                        >
                          {isAlreadyInCart ? (
                            <>
                              <FiCheckCircle size={14} />
                              <span>Added to Cart</span>
                            </>
                          ) : (
                            <>
                              <FiPlus size={14} />
                              <span>Add to Cart</span>
                            </>
                          )}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: Order Summary Box */}
        {cartItems.length > 0 && (
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '20px',
              border: '1px solid #E2E8F0',
              padding: '1.5rem',
              boxShadow: '0 10px 25px rgba(0, 0, 0, 0.05)',
              position: 'sticky',
              top: '20px',
            }}
          >
            <h3 style={{ fontSize: '1.15rem', fontWeight: '800', color: '#0F172A', marginBottom: '1rem' }}>
              Order Summary
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.25rem' }}>
              {cartItems.map((item) => (
                <div
                  key={item.id}
                  style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}
                >
                  <span style={{ color: '#475569', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '200px' }}>
                    {item.title}
                  </span>
                  <span style={{ fontWeight: '600', color: '#0F172A' }}>
                    Rs. {item.price ? item.price.toLocaleString() : '0'}
                  </span>
                </div>
              ))}

              <div style={{ borderTop: '1px dashed #E2E8F0', paddingTop: '0.75rem', marginTop: '0.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.4rem' }}>
                  <span style={{ color: '#64748B' }}>Subtotal Monthly:</span>
                  <span style={{ fontWeight: '600', color: '#0F172A' }}>Rs. {totalMonthly.toLocaleString()}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                  <span style={{ color: '#64748B' }}>Total Installation Fee:</span>
                  <span style={{ fontWeight: '600', color: '#0F172A' }}>Rs. {totalInstallation.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Total Highlight Card */}
            <div
              style={{
                backgroundColor: '#F8FAFC',
                borderRadius: '12px',
                padding: '1rem',
                border: '1px solid #E2E8F0',
                marginBottom: '1.5rem',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <span style={{ fontSize: '0.9rem', fontWeight: '700', color: '#0F172A' }}>
                  Total Monthly Charge:
                </span>
                <span style={{ fontSize: '1.4rem', fontWeight: '900', color: '#0F57A8' }}>
                  Rs. {totalMonthly.toLocaleString()}
                </span>
              </div>
              <span style={{ fontSize: '0.78rem', color: '#64748B', display: 'block', marginTop: '0.2rem' }}>
                + One-time installation charge of Rs. {totalInstallation.toLocaleString()}
              </span>
            </div>

            {/* Main Action Button */}
            <button
              type="button"
              onClick={onProceedToForm}
              style={{
                width: '100%',
                padding: '0.95rem 1.25rem',
                borderRadius: '12px',
                border: 'none',
                background: 'linear-gradient(135deg, #0F57A8 0%, #00B4D8 100%)',
                color: '#FFFFFF',
                fontWeight: '700',
                fontSize: '1rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.6rem',
                boxShadow: '0 6px 20px rgba(15, 87, 168, 0.35)',
                transition: 'all 0.2s ease',
              }}
            >
              <span>Proceed to Customer Verification</span>
              <FiArrowRight size={18} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
