import React from 'react';
import { useTranslation } from 'react-i18next';
import { FiGrid, FiPhoneCall, FiWifi, FiTv } from 'react-icons/fi';
import { motion } from 'framer-motion';

// `name` stays the stable English identifier the filtering logic elsewhere
// keys off (ProductCatalogPage compares activeCategory against these exact
// strings) — only `labelKey` (the displayed text) is translated.
const CATEGORIES = [
  { name: 'All Products', labelKey: 'catalog.categories.allProducts', icon: FiGrid, iconColor: '#0f172a' },
  { name: 'Fibre Broadband', labelKey: 'catalog.categories.fibreBroadband', icon: FiWifi, iconColor: '#0284c7' },
  { name: 'PEO TV', labelKey: 'catalog.categories.peoTv', icon: FiTv, iconColor: '#7c3aed' },
  { name: 'Voice', labelKey: 'catalog.categories.voice', icon: FiPhoneCall, iconColor: '#16a34a' },
];

export default function CategoryChips({ activeCategory, onSelectCategory }) {
  const { t } = useTranslation();

  return (
    <div
      style={{
        backgroundColor: '#ffffff',
        padding: '1rem 1.5rem',
        marginBottom: '1.5rem',
        borderBottom: '1px solid #f1f5f9',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <div
        className="category-chips-row"
        style={{
          maxWidth: '1600px',
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          gap: '0.6rem',
          flexWrap: 'wrap',
          backgroundColor: '#f8fafc',
          padding: '0.4rem',
          borderRadius: '16px',
          border: '1px solid #e2e8f0',
        }}
      >
        {CATEGORIES.map((cat) => {
          const isActive = activeCategory === cat.name;
          const IconComp = cat.icon;

          return (
            <motion.button
              key={cat.name}
              type="button"
              className="category-chip"
              onClick={() => onSelectCategory(cat.name)}
              whileTap={{ scale: 0.96 }}
              whileHover={{ scale: isActive ? 1 : 1.02 }}
              style={{
                flex: '1 1 auto',
                minWidth: '140px',
                padding: '0.65rem 1.25rem',
                backgroundColor: isActive ? 'transparent' : 'transparent',
                background: isActive
                  ? 'linear-gradient(135deg, #0056b3 0%, #0284c7 100%)'
                  : 'transparent',
                color: isActive ? '#ffffff' : '#334155',
                border: 'none',
                borderRadius: '12px',
                fontSize: '0.88rem',
                fontWeight: isActive ? 800 : 600,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.55rem',
                boxShadow: isActive
                  ? '0 4px 14px rgba(0, 86, 179, 0.28)'
                  : 'none',
                transition: 'all 0.18s ease-in-out',
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.backgroundColor = '#ffffff';
                  e.currentTarget.style.color = '#0056b3';
                  e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.04)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.color = '#334155';
                  e.currentTarget.style.boxShadow = 'none';
                }
              }}
            >
              <IconComp
                size={16}
                style={{
                  color: isActive ? '#ffffff' : cat.iconColor,
                  transition: 'color 0.15s ease',
                }}
              />
              <span>{t(cat.labelKey, cat.name)}</span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
