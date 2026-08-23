import React from 'react';
import { useTranslation } from 'react-i18next';
import { FiGrid, FiPhoneCall, FiWifi, FiTv } from 'react-icons/fi';

// `name` stays the stable English identifier the filtering logic elsewhere
// keys off (ProductCatalogPage compares activeCategory against these exact
// strings) — only `labelKey` (the displayed text) is translated.
const CATEGORIES = [
  { name: 'All Products', labelKey: 'catalog.categories.allProducts', icon: FiGrid },
  { name: 'Voice', labelKey: 'catalog.categories.voice', icon: FiPhoneCall },
  { name: 'Fibre Broadband', labelKey: 'catalog.categories.fibreBroadband', icon: FiWifi },
  { name: 'PEO TV', labelKey: 'catalog.categories.peoTv', icon: FiTv },
];

export default function CategoryChips({ activeCategory, onSelectCategory }) {
  const { t } = useTranslation();
  return (
    <div
      style={{
        backgroundColor: '#ffffff',
        padding: '0.85rem 1.5rem',
        marginBottom: '1.5rem',
        borderBottom: '1px solid #f1f5f9',
        display: 'flex',
        justifyContent: 'flex-start',
      }}
    >
      {/* Wraps to multiple lines instead of scrolling horizontally — a
          swipeable row with no visible affordance can hide options
          entirely for users who don't discover the gesture. Below 640px
          this becomes a uniform 2-column grid (see .category-chips-row
          in index.css) instead of a flex-wrap row, since content-width
          chips wrap unevenly (e.g. 2 fit on one line, then 1, then 1) —
          a fixed grid keeps every row the same shape regardless of label
          length. */}
      <div
        className="category-chips-row"
        style={{
          maxWidth: '1600px',
          margin: '0 auto',
          width: '100%',
        }}
      >
        {CATEGORIES.map((cat) => {
          const isActive = activeCategory === cat.name;
          const IconComp = cat.icon;
          return (
            <button
              key={cat.name}
              className="category-chip"
              onClick={() => onSelectCategory(cat.name)}
              style={{
                padding: '0.55rem 1.25rem',
                backgroundColor: isActive ? '#0056b3' : '#ffffff',
                color: isActive ? '#ffffff' : '#1e293b',
                border: isActive ? '1px solid #0056b3' : '1px solid #cbd5e1',
                borderRadius: '8px',
                fontSize: '0.86rem',
                fontWeight: isActive ? 700 : 600,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                boxShadow: isActive
                  ? '0 4px 12px rgba(0,86,179,0.25)'
                  : '0 1px 3px rgba(0,0,0,0.04)',
                transition: 'all 0.15s ease-in-out',
              }}
            >
              <IconComp size={16} style={{ color: isActive ? '#ffffff' : '#475569' }} />
              <span>{t(cat.labelKey, cat.name)}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
