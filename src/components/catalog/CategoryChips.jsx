import React from 'react';

const CATEGORIES = [
  'All Products',
  'Fibre Broadband',
  'LTE Home',
  'PEO TV',
  'Voice',
  'Add-ons',
];

export default function CategoryChips({ activeCategory, onSelectCategory }) {
  return (
    <div style={{ display: 'flex', gap: '0.625rem', overflowX: 'auto', paddingBottom: '0.5rem', marginBottom: '1.75rem', scrollbarWidth: 'none' }}>
      {CATEGORIES.map((cat) => {
        const isActive = activeCategory === cat;
        return (
          <button
            key={cat}
            onClick={() => onSelectCategory(cat)}
            style={{
              padding: '0.6rem 1.25rem',
              borderRadius: '9999px',
              fontSize: '0.9rem',
              fontWeight: isActive ? 600 : 500,
              backgroundColor: isActive ? '#0056b3' : '#ffffff',
              color: isActive ? '#ffffff' : '#334155',
              border: isActive ? '1px solid #0056b3' : '1px solid #e2e8f0',
              boxShadow: isActive ? '0 4px 12px rgba(0, 86, 179, 0.25)' : '0 1px 3px rgba(0, 0, 0, 0.05)',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              transition: 'all 0.2s ease',
            }}
          >
            {cat}
          </button>
        );
      })}
    </div>
  );
}
