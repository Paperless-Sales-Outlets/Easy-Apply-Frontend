import React from 'react';
import { FiGrid, FiPhoneCall, FiWifi, FiTv } from 'react-icons/fi';

const CATEGORIES = [
  { name: 'All Products', icon: FiGrid },
  { name: 'Voice', icon: FiPhoneCall },
  { name: 'Fibre Broadband', icon: FiWifi },
  { name: 'PEO TV', icon: FiTv },
];

export default function CategoryChips({ activeCategory, onSelectCategory }) {
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
          entirely for users who don't discover the gesture. */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '0.85rem',
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
                gap: '0.5rem',
                boxShadow: isActive
                  ? '0 4px 12px rgba(0,86,179,0.25)'
                  : '0 1px 3px rgba(0,0,0,0.04)',
                transition: 'all 0.15s ease-in-out',
              }}
            >
              <IconComp size={16} style={{ color: isActive ? '#ffffff' : '#475569' }} />
              <span>{cat.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
