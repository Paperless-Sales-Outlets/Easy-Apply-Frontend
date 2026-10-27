import React from 'react';
import {
  FiFilter,
  FiX,
  FiCheck,
  FiGlobe,
  FiTv,
  FiPhone,
  FiWifi,
  FiZap,
  FiGrid,
  FiRotateCcw,
} from 'react-icons/fi';

const PRODUCT_TYPES = [
  { id: 'Fibre Broadband', label: 'Fibre Broadband', icon: FiGlobe, iconColor: '#0284c7' },
  { id: 'PEO TV', label: 'PEO TV', icon: FiTv, iconColor: '#7c3aed' },
  { id: 'LTE Home', label: 'LTE Home (Wireless)', icon: FiWifi, iconColor: '#ea580c' },
  { id: 'Voice', label: 'Voice Megaline', icon: FiPhone, iconColor: '#16a34a' },
];

const SPEEDS = [
  { id: 'up_to_100', label: 'Up to 100 Mbps', tier: 'Basic' },
  { id: '100_300', label: '100 – 300 Mbps', tier: 'Fast' },
  { id: '300_500', label: '300 – 500 Mbps', tier: 'Ultra' },
  { id: 'above_500', label: 'Above 500 Mbps', tier: 'Gigabit' },
];

export default function SidebarFilters({
  activeCategory = 'All Products',
  onSelectCategory,
  onSelectTreeNode, // kept for backwards compatibility
  activeTreeKey = null, // kept for backwards compatibility
  typeCounts,
  speedCounts,
  selectedTypes = [],
  onTypeToggle,
  selectedSpeeds = [],
  onSpeedToggle,
  onClearAll,
  onApply,
  onCloseMobile,
}) {
  const activeCount = selectedTypes.length + selectedSpeeds.length;

  return (
    <aside
      style={{
        backgroundColor: '#ffffff',
        borderRadius: '18px',
        border: '1px solid #e2e8f0',
        padding: '1.4rem',
        boxShadow: '0 10px 30px -5px rgba(15, 23, 42, 0.05), 0 0 1px rgba(15, 23, 42, 0.1)',
        width: '100%',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Top Brand Accent Line */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '3.5px',
          background: 'linear-gradient(90deg, #0056b3 0%, #0ea5e9 60%, #10b981 100%)',
        }}
      />

      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingBottom: '1rem',
          borderBottom: '1px solid #f1f5f9',
          marginBottom: '1.1rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '10px',
              backgroundColor: '#eff6ff',
              color: '#0056b3',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <FiFilter size={16} />
          </div>
          <div>
            <div style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a', lineHeight: 1.2 }}>
              Filters
            </div>
            {activeCount > 0 && (
              <span style={{ fontSize: '0.72rem', color: '#0ea5e9', fontWeight: 700 }}>
                {activeCount} active {activeCount === 1 ? 'filter' : 'filters'}
              </span>
            )}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          {activeCount > 0 && (
            <button
              onClick={onClearAll}
              type="button"
              style={{
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                color: '#475569',
                fontSize: '0.76rem',
                fontWeight: 700,
                padding: '0.35rem 0.65rem',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.3rem',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#fee2e2';
                e.currentTarget.style.color = '#dc2626';
                e.currentTarget.style.borderColor = '#fca5a5';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#f8fafc';
                e.currentTarget.style.color = '#475569';
                e.currentTarget.style.borderColor = '#e2e8f0';
              }}
            >
              <FiRotateCcw size={11} /> Reset
            </button>
          )}

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
                width: '32px',
                height: '32px',
                display: 'flex',
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

      {/* Active Filter Badges Quick Bar */}
      {activeCount > 0 && (
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '0.4rem',
            padding: '0.65rem',
            backgroundColor: '#f8fafc',
            borderRadius: '12px',
            marginBottom: '1.25rem',
            border: '1px dashed #cbd5e1',
          }}
        >
          {selectedTypes.map((typeId) => (
            <span
              key={`badge-${typeId}`}
              onClick={() => onTypeToggle(typeId)}
              title="Click to remove"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.3rem',
                backgroundColor: '#eff6ff',
                color: '#0056b3',
                fontSize: '0.74rem',
                fontWeight: 700,
                padding: '0.2rem 0.55rem',
                borderRadius: '9999px',
                cursor: 'pointer',
                border: '1px solid #bfdbfe',
                transition: 'all 0.15s ease',
              }}
            >
              {typeId}
              <FiX size={12} />
            </span>
          ))}

          {selectedSpeeds.map((speedId) => {
            const sp = SPEEDS.find((s) => s.id === speedId);
            return (
              <span
                key={`badge-${speedId}`}
                onClick={() => onSpeedToggle(speedId)}
                title="Click to remove"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.3rem',
                  backgroundColor: '#ecfdf5',
                  color: '#047857',
                  fontSize: '0.74rem',
                  fontWeight: 700,
                  padding: '0.2rem 0.55rem',
                  borderRadius: '9999px',
                  cursor: 'pointer',
                  border: '1px solid #a7f3d0',
                  transition: 'all 0.15s ease',
                }}
              >
                {sp ? sp.label : speedId}
                <FiX size={12} />
              </span>
            );
          })}
        </div>
      )}

      {/* Filter Body */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.6rem' }}>
        {/* Section 1: Product Type */}
        <div>
          <div
            style={{
              fontSize: '0.82rem',
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              color: '#64748b',
              marginBottom: '0.75rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
            }}
          >
            <FiGrid size={13} color="#0056b3" /> Product Type
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {PRODUCT_TYPES.map((pt) => {
              const checked = selectedTypes.includes(pt.id);
              const count = typeCounts ? typeCounts[pt.id] || 0 : null;
              const isEmpty = count === 0 && !checked;
              const IconComponent = pt.icon;

              return (
                <div
                  key={pt.id}
                  onClick={() => {
                    if (!isEmpty) onTypeToggle(pt.id);
                  }}
                  role="checkbox"
                  aria-checked={checked}
                  tabIndex={isEmpty ? -1 : 0}
                  onKeyDown={(e) => {
                    if ((e.key === ' ' || e.key === 'Enter') && !isEmpty) {
                      e.preventDefault();
                      onTypeToggle(pt.id);
                    }
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.65rem',
                    padding: '0.6rem 0.75rem',
                    borderRadius: '12px',
                    border: `1.5px solid ${checked ? '#0056b3' : '#f1f5f9'}`,
                    backgroundColor: checked ? '#f0f7ff' : '#ffffff',
                    cursor: isEmpty ? 'not-allowed' : 'pointer',
                    opacity: isEmpty ? 0.45 : 1,
                    transition: 'all 0.15s ease',
                    boxShadow: checked ? '0 2px 8px rgba(0, 86, 179, 0.08)' : 'none',
                  }}
                  onMouseEnter={(e) => {
                    if (!isEmpty && !checked) {
                      e.currentTarget.style.backgroundColor = '#f8fafc';
                      e.currentTarget.style.borderColor = '#cbd5e1';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isEmpty && !checked) {
                      e.currentTarget.style.backgroundColor = '#ffffff';
                      e.currentTarget.style.borderColor = '#f1f5f9';
                    }
                  }}
                >
                  {/* Custom Checkbox Pill */}
                  <div
                    style={{
                      width: '18px',
                      height: '18px',
                      borderRadius: '5px',
                      border: `1.8px solid ${checked ? '#0056b3' : '#cbd5e1'}`,
                      backgroundColor: checked ? '#0056b3' : '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      transition: 'all 0.15s ease',
                    }}
                  >
                    {checked && <FiCheck size={12} color="#ffffff" strokeWidth={3} />}
                  </div>

                  {/* Icon */}
                  <IconComponent size={15} color={checked ? '#0056b3' : pt.iconColor} />

                  {/* Label */}
                  <span
                    style={{
                      fontSize: '0.86rem',
                      fontWeight: checked ? 700 : 600,
                      color: checked ? '#0056b3' : '#1e293b',
                      flex: 1,
                    }}
                  >
                    {pt.label}
                  </span>

                  {/* Count Badge */}
                  {count !== null && (
                    <span
                      style={{
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        padding: '0.15rem 0.45rem',
                        borderRadius: '9999px',
                        backgroundColor: checked ? '#dbeafe' : '#f1f5f9',
                        color: checked ? '#0056b3' : '#64748b',
                      }}
                    >
                      {count}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Section 2: Connection Speed */}
        <div>
          <div
            style={{
              fontSize: '0.82rem',
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              color: '#64748b',
              marginBottom: '0.75rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
            }}
          >
            <FiZap size={13} color="#0056b3" /> Connection Speed
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {SPEEDS.map((sp) => {
              const checked = selectedSpeeds.includes(sp.id);
              const count = speedCounts ? speedCounts[sp.id] || 0 : null;
              const isEmpty = count === 0 && !checked;

              return (
                <div
                  key={sp.id}
                  onClick={() => {
                    if (!isEmpty) onSpeedToggle(sp.id);
                  }}
                  role="checkbox"
                  aria-checked={checked}
                  tabIndex={isEmpty ? -1 : 0}
                  onKeyDown={(e) => {
                    if ((e.key === ' ' || e.key === 'Enter') && !isEmpty) {
                      e.preventDefault();
                      onSpeedToggle(sp.id);
                    }
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.65rem',
                    padding: '0.6rem 0.75rem',
                    borderRadius: '12px',
                    border: `1.5px solid ${checked ? '#0056b3' : '#f1f5f9'}`,
                    backgroundColor: checked ? '#f0f7ff' : '#ffffff',
                    cursor: isEmpty ? 'not-allowed' : 'pointer',
                    opacity: isEmpty ? 0.45 : 1,
                    transition: 'all 0.15s ease',
                    boxShadow: checked ? '0 2px 8px rgba(0, 86, 179, 0.08)' : 'none',
                  }}
                  onMouseEnter={(e) => {
                    if (!isEmpty && !checked) {
                      e.currentTarget.style.backgroundColor = '#f8fafc';
                      e.currentTarget.style.borderColor = '#cbd5e1';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isEmpty && !checked) {
                      e.currentTarget.style.backgroundColor = '#ffffff';
                      e.currentTarget.style.borderColor = '#f1f5f9';
                    }
                  }}
                >
                  {/* Custom Checkbox Pill */}
                  <div
                    style={{
                      width: '18px',
                      height: '18px',
                      borderRadius: '5px',
                      border: `1.8px solid ${checked ? '#0056b3' : '#cbd5e1'}`,
                      backgroundColor: checked ? '#0056b3' : '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      transition: 'all 0.15s ease',
                    }}
                  >
                    {checked && <FiCheck size={12} color="#ffffff" strokeWidth={3} />}
                  </div>

                  {/* Label */}
                  <span
                    style={{
                      fontSize: '0.86rem',
                      fontWeight: checked ? 700 : 600,
                      color: checked ? '#0056b3' : '#1e293b',
                      flex: 1,
                    }}
                  >
                    {sp.label}
                  </span>

                  {/* Tier Pill */}
                  <span
                    style={{
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      padding: '0.12rem 0.4rem',
                      borderRadius: '6px',
                      backgroundColor: '#f1f5f9',
                      color: '#475569',
                    }}
                  >
                    {sp.tier}
                  </span>

                  {/* Count Badge */}
                  {count !== null && (
                    <span
                      style={{
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        padding: '0.15rem 0.45rem',
                        borderRadius: '9999px',
                        backgroundColor: checked ? '#dbeafe' : '#f1f5f9',
                        color: checked ? '#0056b3' : '#64748b',
                      }}
                    >
                      {count}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Apply Filters Button (for mobile drawer/popup) */}
        {onApply && (
          <div style={{ marginTop: '0.5rem' }}>
            <button
              onClick={onApply}
              type="button"
              style={{
                width: '100%',
                background: 'linear-gradient(135deg, #0056b3 0%, #0284c7 100%)',
                color: '#ffffff',
                border: 'none',
                borderRadius: '12px',
                padding: '0.75rem 1rem',
                fontWeight: 800,
                fontSize: '0.9rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.45rem',
                boxShadow: '0 4px 14px rgba(0, 86, 179, 0.25)',
                transition: 'all 0.15s ease',
              }}
            >
              <FiFilter size={15} />
              <span>Show Results</span>
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}
