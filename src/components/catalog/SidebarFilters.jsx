import React, { useState } from 'react';
import { FiFilter, FiChevronDown, FiChevronUp, FiX } from 'react-icons/fi';

const PRODUCT_TYPES = [
  { id: 'Fibre Broadband', label: 'Fibre Broadband' },
  { id: 'LTE Home', label: 'LTE Home' },
  { id: 'PEO TV', label: 'PEO TV' },
  { id: 'Voice', label: 'Voice' },
  { id: 'Add-ons', label: 'Add-ons' },
];

const SPEEDS = [
  { id: 'up_to_100', label: 'Up to 100 Mbps' },
  { id: '100_300', label: '100 – 300 Mbps' },
  { id: '300_500', label: '300 – 500 Mbps' },
  { id: 'above_500', label: 'Above 500 Mbps' },
];

export default function SidebarFilters({
  selectedTypes = [],
  onTypeToggle,
  selectedSpeeds = [],
  onSpeedToggle,
  onClearAll,
  onApply,
  onCloseMobile,
}) {
  return (
    <aside
      style={{
        backgroundColor: '#ffffff',
        borderRadius: '16px',
        border: '1px solid #e2e8f0',
        padding: '1.25rem',
        boxShadow: '0 4px 15px rgba(0,0,0,0.03)',
        width: '100%',
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingBottom: '1rem',
          borderBottom: '1px solid #f1f5f9',
          marginBottom: '1.2rem',
        }}
      >
        <div style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a' }}>
          Filter Products
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button
            onClick={onClearAll}
            style={{
              background: 'none',
              border: 'none',
              color: '#0056b3',
              fontSize: '0.82rem',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            Clear All
          </button>
          {onCloseMobile && (
            <button
              type="button"
              onClick={onCloseMobile}
              aria-label="Close filters"
              className="catalog-filter-close-btn"
              style={{
                background: '#f1f5f9',
                border: 'none',
                borderRadius: '8px',
                width: '30px',
                height: '30px',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#334155',
                cursor: 'pointer',
              }}
            >
              <FiX size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Filter Body */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {/* Section 1: Product Type */}
        <div>
          <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.75rem' }}>
            Product Type
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            {PRODUCT_TYPES.map((pt) => {
              const checked = selectedTypes.includes(pt.id);
              return (
                <label
                  key={pt.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.6rem',
                    fontSize: '0.85rem',
                    color: '#334155',
                    cursor: 'pointer',
                  }}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => onTypeToggle(pt.id)}
                    style={{
                      width: '16px',
                      height: '16px',
                      accentColor: '#0056b3',
                      cursor: 'pointer',
                    }}
                  />
                  <span>{pt.label}</span>
                </label>
              );
            })}
          </div>
        </div>

        {/* Section 2: Speed */}
        <div>
          <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.75rem' }}>
            Speed
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            {SPEEDS.map((sp) => {
              const checked = selectedSpeeds.includes(sp.id);
              return (
                <label
                  key={sp.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.6rem',
                    fontSize: '0.85rem',
                    color: '#334155',
                    cursor: 'pointer',
                  }}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => onSpeedToggle(sp.id)}
                    style={{
                      width: '16px',
                      height: '16px',
                      accentColor: '#0056b3',
                      cursor: 'pointer',
                    }}
                  />
                  <span>{sp.label}</span>
                </label>
              );
            })}
          </div>
        </div>

        {/* Apply Filters Button */}
        <div style={{ marginTop: '0.5rem' }}>
          <button
            onClick={onApply}
            style={{
              width: '100%',
              backgroundColor: '#0056b3',
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              padding: '0.65rem 1rem',
              fontWeight: 700,
              fontSize: '0.88rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.45rem',
              boxShadow: '0 3px 10px rgba(0,86,179,0.25)',
            }}
          >
            <FiFilter size={15} />
            <span>Apply Filters</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
