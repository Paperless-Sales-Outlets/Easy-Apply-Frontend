import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  FiShoppingCart,
  FiCheck,
  FiArrowRight,
  FiZap,
  FiPhoneCall,
  FiTv,
  FiPackage,
} from 'react-icons/fi';

export const PRODUCTS_DATA = [
  // ================= Unlimited Packages =================
  {
    id: 'unlimited-home',
    title: 'Unlimited Home',
    category: 'unlimited',
    categoryLabel: 'Unlimited Packages',
    price: 5900,
    taxNote: '5900 LKR + Tax',
    speed: 100,
    speedLabel: '100Mbps/50Mbps',
    badges: [
      { text: 'Unlimited Internet', subtext: '100Mbps/50Mbps' },
      { text: 'Unlimited Voice', subtext: '' },
    ],
    features: ['Unlimited Data', '100Mbps High Speed', 'Unlimited SLT Voice Calls'],
    description: 'Perfect entry-level unlimited fibre broadband for home web browsing & HD streaming.',
    installationFee: 2500,
    cardBg: 'linear-gradient(180deg, #0A356A 0%, #062349 100%)',
  },
  {
    id: 'unlimited-home-plus',
    title: 'Unlimited Home Plus',
    category: 'unlimited',
    categoryLabel: 'Unlimited Packages',
    price: 9900,
    taxNote: '9900 LKR + Tax',
    speed: 200,
    speedLabel: '200Mbps/100Mbps',
    isPopular: true,
    badges: [
      { text: 'Unlimited Internet', subtext: '200Mbps/100Mbps' },
      { text: 'Unlimited Voice', subtext: '' },
    ],
    features: ['Unlimited Data', '200Mbps Ultra Speed', 'Unlimited SLT Voice Calls'],
    description: 'Ultra-fast 200Mbps unlimited internet for multi-device 4K streaming and work from home.',
    installationFee: 2500,
    cardBg: 'linear-gradient(180deg, #0266B3 0%, #014175 100%)',
  },
  {
    id: 'unlimited-twin',
    title: 'Unlimited Twin',
    category: 'unlimited',
    categoryLabel: 'Unlimited Packages',
    price: 14900,
    taxNote: '14900 LKR + Tax',
    speed: 200,
    speedLabel: '200Mbps/200Mbps',
    badges: [
      { text: 'Unlimited Internet', subtext: '200Mbps/200Mbps' },
      { text: 'Unlimited Voice', subtext: '' },
    ],
    features: ['Symmetrical 200Mbps Upload/Download', 'Unlimited Data', 'Unlimited Voice'],
    description: 'Symmetrical 200Mbps speeds for heavy content uploaders, gamers & tech enthusiasts.',
    installationFee: 2500,
    cardBg: 'linear-gradient(180deg, #0A356A 0%, #062349 100%)',
  },
  {
    id: 'unlimited-pro',
    title: 'Unlimited Pro',
    category: 'unlimited',
    categoryLabel: 'Unlimited Packages',
    price: 19900,
    taxNote: '19900 LKR + Tax',
    speed: 500,
    speedLabel: '500Mbps/200Mbps',
    badges: [
      { text: 'Unlimited Internet', subtext: '500Mbps/200Mbps' },
      { text: 'Unlimited Voice', subtext: '' },
    ],
    features: ['500Mbps Gigabit Class', 'Unlimited Data', 'Priority VIP Support'],
    description: 'Top-tier 500Mbps extreme performance for power users and smart home networks.',
    installationFee: 2500,
    cardBg: 'linear-gradient(180deg, #0A356A 0%, #062349 100%)',
  },

  // ================= Trio Packages =================
  {
    id: 'trio-vibe',
    title: 'Trio Vibe',
    category: 'trio',
    categoryLabel: 'Trio Packages',
    price: 3530,
    taxNote: '3530 LKR + Tax',
    speed: 300,
    speedLabel: '300Mbps/150Mbps',
    isPopular: true,
    badges: [
      { text: '40GB', subtext: '300Mbps/150Mbps' },
      { text: 'Unlimited Voice', subtext: 'Free Peo TV' },
    ],
    features: ['40GB High Speed Data', 'Unlimited Voice Line', 'Free PEO TV Connection'],
    description: 'Triple play package combining high-speed 300Mbps Fibre, Voice calls, and free PEO TV.',
    installationFee: 2500,
    cardBg: 'linear-gradient(180deg, #0266B3 0%, #014175 100%)',
  },
  {
    id: 'trio-vibe-plus',
    title: 'Trio Vibe Plus',
    category: 'trio',
    categoryLabel: 'Trio Packages',
    price: 4100,
    taxNote: '4100 LKR + Tax',
    speed: 300,
    speedLabel: '300Mbps/150Mbps',
    badges: [
      { text: '40GB', subtext: '300Mbps/150Mbps' },
      { text: 'Unlimited Voice', subtext: 'Free Peo TV' },
    ],
    features: ['40GB High Speed Data', 'Unlimited Voice Line', 'Free PEO TV HD Pack'],
    description: 'Enhanced Trio bundle with extra HD channels and high-speed data allowance.',
    installationFee: 2500,
    cardBg: 'linear-gradient(180deg, #0A356A 0%, #062349 100%)',
  },
  {
    id: 'trio-shine',
    title: 'Trio Shine',
    category: 'trio',
    categoryLabel: 'Trio Packages',
    price: 4950,
    taxNote: '4950 LKR + Tax',
    speed: 300,
    speedLabel: '300Mbps/150Mbps',
    badges: [
      { text: '100GB', subtext: '300Mbps/150Mbps' },
      { text: 'Unlimited Voice', subtext: 'Free Peo TV' },
    ],
    features: ['100GB High Speed Data', 'Unlimited Voice Line', 'Free PEO TV HD Pack'],
    description: 'Generous 100GB data Trio package with full voice line & PEO TV entertainment.',
    installationFee: 2500,
    cardBg: 'linear-gradient(180deg, #0A356A 0%, #062349 100%)',
  },

  // ================= Any Time Packages =================
  {
    id: 'fiber-starter',
    title: 'FIBER STARTER',
    category: 'anytime',
    categoryLabel: 'Any Time Packages',
    price: 2690,
    taxNote: '2690 LKR + Tax',
    speed: 100,
    speedLabel: '100Mbps/50Mbps',
    badges: [
      { text: '80GB', subtext: '100Mbps/50Mbps' },
    ],
    features: ['80GB Any Time Data', '100Mbps Speed', 'Mandatory Voice Line Included'],
    description: 'Affordable starter fibre internet plan with 80GB data anytime use.',
    installationFee: 2500,
    cardBg: 'linear-gradient(180deg, #0266B3 0%, #014175 100%)',
  },
  {
    id: 'fiber-flash',
    title: 'FIBER FLASH',
    category: 'anytime',
    categoryLabel: 'Any Time Packages',
    price: 4290,
    taxNote: '4290 LKR + Tax',
    speed: 100,
    speedLabel: '100Mbps/50Mbps',
    badges: [
      { text: '150GB', subtext: '100Mbps/50Mbps' },
    ],
    features: ['150GB Any Time Data', '100Mbps Speed', 'Mandatory Voice Line Included'],
    description: 'High data allowance anytime broadband package for streaming & everyday browsing.',
    installationFee: 2500,
    cardBg: 'linear-gradient(180deg, #0A356A 0%, #062349 100%)',
  },
  {
    id: 'fiber-champ',
    title: 'FIBER CHAMP',
    category: 'anytime',
    categoryLabel: 'Any Time Packages',
    price: 6890,
    taxNote: '6890 LKR + Tax',
    speed: 200,
    speedLabel: '200Mbps/100Mbps',
    badges: [
      { text: '250GB', subtext: '200Mbps/100Mbps' },
    ],
    features: ['250GB Any Time Data', '200Mbps Speed', 'Mandatory Voice Line Included'],
    description: 'Massive 250GB data cap with 200Mbps ultra-fast optical internet speed.',
    installationFee: 2500,
    cardBg: 'linear-gradient(180deg, #0A356A 0%, #062349 100%)',
  },
];

export default function ProductCatalog({
  cartItems = [],
  onAddToCart,
  onRemoveFromCart,
  onViewCart,
  onProceedToForm,
}) {
  const { t } = useTranslation();

  // Active Category tab state ('unlimited' by default)
  const [activeCategoryTab, setActiveCategoryTab] = useState('unlimited');
  const [selectedProduct, setSelectedProduct] = useState(PRODUCTS_DATA[1]); // Default to Unlimited Home Plus as in screenshot

  // Categories definition matching screenshots
  const categoryTabs = [
    { key: 'unlimited', label: 'Unlimited Packages' },
    { key: 'trio', label: 'Trio Packages' },
    { key: 'anytime', label: 'Any Time Packages' },
  ];

  // Filter products by active category tab
  const displayedProducts = useMemo(() => {
    return PRODUCTS_DATA.filter((p) => p.category === activeCategoryTab);
  }, [activeCategoryTab]);

  const handleSelectPackage = (product) => {
    setSelectedProduct(product);
    onAddToCart(product);
  };

  return (
    <div style={{ width: '100%', maxWidth: '1200px', margin: '0 auto', paddingBottom: '3rem' }}>
      {/* Main Title Banner matching screenshot */}
      <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
        <h1
          style={{
            fontSize: '2.25rem',
            fontWeight: '800',
            color: '#1E293B',
            marginBottom: '0.35rem',
            letterSpacing: '-0.02em',
            fontFamily: 'system-ui, -apple-system, sans-serif',
          }}
        >
          Get a Life with Fibre
        </h1>
        <p style={{ color: '#475569', fontSize: '1.25rem', fontWeight: '500', margin: 0 }}>
          It's Decision Time. Choose Your Package
        </p>
      </div>

      {/* Main Dark Navy Outer Container Card matching screenshot */}
      <div
        style={{
          backgroundColor: '#1E4B88',
          borderRadius: '24px',
          padding: '1.75rem 1.5rem',
          boxShadow: '0 20px 45px rgba(11, 45, 91, 0.3)',
          border: '1px solid #2C5E9E',
        }}
      >
        {/* Top 3-Step Navigation Indicator matching screenshot: (1) Package Selection --- (2) Customer Details --- (3) Summary */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '1rem',
            marginBottom: '1.75rem',
            padding: '0.75rem 1rem',
            maxWidth: '650px',
            margin: '0 auto 1.75rem auto',
          }}
        >
          {/* Step 1 */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                backgroundColor: '#0072CE',
                color: '#FFFFFF',
                fontWeight: '800',
                fontSize: '0.95rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 10px rgba(0, 114, 206, 0.5)',
              }}
            >
              1
            </div>
            <span style={{ color: '#FFFFFF', fontWeight: '700', fontSize: '0.95rem' }}>
              Package Selection
            </span>
          </div>

          <div style={{ width: '50px', height: '2px', backgroundColor: 'rgba(255, 255, 255, 0.3)' }} />

          {/* Step 2 */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', opacity: 0.75 }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                backgroundColor: '#0C2B54',
                color: '#FFFFFF',
                fontWeight: '700',
                fontSize: '0.95rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px solid rgba(255, 255, 255, 0.4)',
              }}
            >
              2
            </div>
            <span style={{ color: 'rgba(255, 255, 255, 0.85)', fontWeight: '600', fontSize: '0.95rem' }}>
              Customer Details
            </span>
          </div>

          <div style={{ width: '50px', height: '2px', backgroundColor: 'rgba(255, 255, 255, 0.3)' }} />

          {/* Step 3 */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', opacity: 0.75 }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                backgroundColor: '#0C2B54',
                color: '#FFFFFF',
                fontWeight: '700',
                fontSize: '0.95rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px solid rgba(255, 255, 255, 0.4)',
              }}
            >
              3
            </div>
            <span style={{ color: 'rgba(255, 255, 255, 0.85)', fontWeight: '600', fontSize: '0.95rem' }}>
              Summary
            </span>
          </div>
        </div>

        {/* Category Tabs Header Row matching screenshot */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '0',
            borderBottom: 'none',
          }}
        >
          <div style={{ display: 'flex', gap: '0.4rem' }}>
            {categoryTabs.map((tab) => {
              const isActive = activeCategoryTab === tab.key;
              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => {
                    setActiveCategoryTab(tab.key);
                    const firstInCat = PRODUCTS_DATA.find((p) => p.category === tab.key);
                    if (firstInCat) setSelectedProduct(firstInCat);
                  }}
                  style={{
                    padding: '0.8rem 1.6rem',
                    borderRadius: '12px 12px 0 0',
                    border: 'none',
                    backgroundColor: isActive ? '#0C2B54' : 'transparent',
                    color: isActive ? '#FFFFFF' : 'rgba(255, 255, 255, 0.75)',
                    fontWeight: isActive ? '800' : '600',
                    fontSize: '1.05rem',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            {/* View Cart Pill Button */}
            {cartItems.length > 0 && (
              <button
                type="button"
                onClick={onViewCart}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.55rem 1.25rem',
                  borderRadius: '9999px',
                  border: 'none',
                  backgroundColor: '#0F57A8',
                  color: '#FFFFFF',
                  fontWeight: '700',
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.25)',
                }}
              >
                <FiShoppingCart size={16} />
                <span>Cart ({cartItems.length})</span>
              </button>
            )}

            {/* (X) Close button matching top right of screenshot modal */}
            <div
              style={{
                width: '24px',
                height: '24px',
                borderRadius: '50%',
                border: '1px solid rgba(255, 255, 255, 0.5)',
                color: 'rgba(255, 255, 255, 0.8)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.8rem',
                cursor: 'pointer',
              }}
              title="Package Catalog"
            >
              ✕
            </div>
          </div>
        </div>

        {/* Product Cards Container matching screenshot */}
        <div
          style={{
            backgroundColor: '#0C2B54',
            borderRadius: '0 16px 16px 16px',
            padding: '1.5rem',
            border: '1px solid rgba(255, 255, 255, 0.1)',
          }}
        >
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
              gap: '1.25rem',
            }}
          >
            {displayedProducts.map((product) => {
              const isSelected = selectedProduct?.id === product.id;
              const isInCart = cartItems.some((item) => item.id === product.id);

              return (
                <div
                  key={product.id}
                  onClick={() => handleSelectPackage(product)}
                  style={{
                    backgroundColor: isSelected ? '#0072CE' : '#0A356A',
                    borderRadius: '16px',
                    border: isSelected ? '3px solid #00B4D8' : '1px solid rgba(255, 255, 255, 0.12)',
                    padding: '1.5rem 1.25rem',
                    color: '#FFFFFF',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    minHeight: '340px',
                    boxShadow: isSelected
                      ? '0 0 24px rgba(0, 180, 216, 0.45)'
                      : '0 4px 12px rgba(0, 0, 0, 0.2)',
                    transition: 'all 0.2s ease',
                    position: 'relative',
                  }}
                >
                  {/* Card Header Title */}
                  <div style={{ textAlign: 'center', marginBottom: '1.25rem' }}>
                    <h3
                      style={{
                        fontSize: '1.35rem',
                        fontWeight: '800',
                        color: '#FFFFFF',
                        margin: '0 0 0.25rem 0',
                        lineHeight: '1.2',
                      }}
                    >
                      {product.title}
                    </h3>
                  </div>

                  {/* Specification Badges (Light Blue Pills from Screenshot) */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', marginBottom: '1.5rem' }}>
                    {product.badges.map((badge, bIdx) => (
                      <div
                        key={bIdx}
                        style={{
                          backgroundColor: '#D6E8FE',
                          borderRadius: '10px',
                          padding: '0.65rem 0.5rem',
                          textAlign: 'center',
                          boxShadow: '0 2px 6px rgba(0, 0, 0, 0.1)',
                        }}
                      >
                        <div style={{ fontSize: '0.92rem', fontWeight: '800', color: '#002D62', lineHeight: '1.2' }}>
                          {badge.text}
                        </div>
                        {badge.subtext && (
                          <div style={{ fontSize: '0.75rem', fontWeight: '600', color: '#004A9E', marginTop: '0.15rem' }}>
                            {badge.subtext}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Price Block from Screenshot: "9900 LKR + Tax (Per Month)" */}
                  <div style={{ textAlign: 'center', marginBottom: '1.25rem' }}>
                    <div
                      style={{
                        fontSize: '1.45rem',
                        fontWeight: '900',
                        color: '#FFFFFF',
                        lineHeight: '1.1',
                        letterSpacing: '-0.02em',
                      }}
                    >
                      {product.taxNote}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'rgba(255, 255, 255, 0.8)', marginTop: '0.25rem' }}>
                      (Per Month)
                    </div>
                  </div>

                  {/* Action Button */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelectPackage(product);
                    }}
                    style={{
                      width: '100%',
                      padding: '0.75rem 1rem',
                      borderRadius: '10px',
                      border: 'none',
                      backgroundColor: isSelected ? '#FFFFFF' : 'rgba(255, 255, 255, 0.15)',
                      color: isSelected ? '#003366' : '#FFFFFF',
                      fontWeight: '800',
                      fontSize: '0.92rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.4rem',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    {isSelected ? (
                      <>
                        <FiCheck size={18} color="#003366" />
                        <span>Package Selected</span>
                      </>
                    ) : (
                      <>
                        <FiCheck size={18} />
                        <span>Select Package</span>
                      </>
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Bottom Bar: Selected Package Summary & Proceed to Customer Details Step */}
        <div
          style={{
            marginTop: '1.5rem',
            backgroundColor: '#0C2B54',
            borderRadius: '16px',
            padding: '1.25rem 1.75rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            flexWrap: 'wrap',
            gap: '1rem',
          }}
        >
          <div>
            <span style={{ fontSize: '0.8rem', color: 'rgba(255, 255, 255, 0.7)', textTransform: 'uppercase', fontWeight: '700' }}>
              Selected Package:
            </span>
            <div style={{ fontSize: '1.15rem', fontWeight: '800', color: '#FFFFFF' }}>
              {selectedProduct ? `${selectedProduct.title} — ${selectedProduct.taxNote}` : 'Please select a package'}
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              if (selectedProduct) {
                onAddToCart(selectedProduct);
              }
              onProceedToForm();
            }}
            style={{
              padding: '0.85rem 2rem',
              borderRadius: '12px',
              border: 'none',
              background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
              color: '#FFFFFF',
              fontWeight: '800',
              fontSize: '1.05rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.6rem',
              boxShadow: '0 6px 18px rgba(16, 185, 129, 0.4)',
            }}
          >
            <span>Proceed to Customer Details (Step 2)</span>
            <FiArrowRight size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}

