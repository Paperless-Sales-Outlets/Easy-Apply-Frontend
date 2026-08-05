import React from 'react';

const PRODUCT_TYPES = ['Fibre Broadband', 'LTE Home', 'PEO TV', 'Voice', 'Add-ons'];

const SPEED_OPTIONS = [
  { id: 'up_to_100', label: 'Up to 100 Mbps' },
  { id: '100_300', label: '100 – 300 Mbps' },
  { id: '300_500', label: '300 – 500 Mbps' },
  { id: 'above_500', label: 'Above 500 Mbps' },
];

const INSTALLATION_FEE_OPTIONS = [
  { id: 'free', label: 'Free Installation' },
  { id: 'paid', label: 'Paid Installation' },
];

export default function SidebarFilters({
  selectedTypes = [],
  onTypeToggle,
  selectedSpeeds = [],
  onSpeedToggle,
  maxPrice = 20000,
  onPriceChange,
  selectedInstallation = [],
  onInstallationToggle,
  availableOnly = false,
  onAvailableToggle,
  onClearAll,
}) {
  return (
    <aside
      style={{
        backgroundColor: '#ffffff',
        borderRadius: '16px',
        padding: '1.5rem',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
        border: '1px solid #f1f5f9',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.25rem',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
          Filter Products
        </h3>
        <button
          onClick={onClearAll}
          style={{
            background: 'none',
            border: 'none',
            color: '#0056b3',
            fontSize: '0.825rem',
            fontWeight: 600,
            cursor: 'pointer',
            padding: 0,
          }}
        >
          Clear All
        </button>
      </div>

      <hr style={{ border: 'none', borderTop: '1px solid #f1f5f9', margin: 0 }} />

      {/* Product Type Section */}
      <div>
        <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: '0.75rem' }}>
          Product Type
        </h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
          {PRODUCT_TYPES.map((type) => {
            const checked = selectedTypes.includes(type);
            return (
              <label
                key={type}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.6rem',
                  fontSize: '0.85rem',
                  color: '#475569',
                  cursor: 'pointer',
                  userSelect: 'none',
                }}
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => onTypeToggle(type)}
                  style={{
                    width: '16px',
                    height: '16px',
                    accentColor: '#0056b3',
                    borderRadius: '4px',
                    cursor: 'pointer',
                  }}
                />
                {type}
              </label>
            );
          })}
        </div>
      </div>

      <hr style={{ border: 'none', borderTop: '1px solid #f1f5f9', margin: 0 }} />

      {/* Speed Section */}
      <div>
        <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: '0.75rem' }}>
          Speed
        </h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
          {SPEED_OPTIONS.map((spd) => {
            const checked = selectedSpeeds.includes(spd.id);
            return (
              <label
                key={spd.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.6rem',
                  fontSize: '0.85rem',
                  color: '#475569',
                  cursor: 'pointer',
                  userSelect: 'none',
                }}
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => onSpeedToggle(spd.id)}
                  style={{
                    width: '16px',
                    height: '16px',
                    accentColor: '#0056b3',
                    borderRadius: '4px',
                    cursor: 'pointer',
                  }}
                />
                {spd.label}
              </label>
            );
          })}
        </div>
      </div>

      <hr style={{ border: 'none', borderTop: '1px solid #f1f5f9', margin: 0 }} />

      {/* Price Range Section */}
      <div>
        <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: '0.75rem' }}>
          Price Range <span style={{ fontWeight: 400, color: '#64748b' }}>(Monthly)</span>
        </h4>
        <input
          type="range"
          min="0"
          max="20000"
          step="500"
          value={maxPrice}
          onChange={(e) => onPriceChange(Number(e.target.value))}
          style={{
            width: '100%',
            accentColor: '#0056b3',
            cursor: 'pointer',
            marginBottom: '0.4rem',
          }}
        />
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.775rem', color: '#64748b', fontWeight: 600 }}>
          <span>Rs. 0</span>
          <span>Rs. {maxPrice.toLocaleString()}+</span>
        </div>
      </div>

      <hr style={{ border: 'none', borderTop: '1px solid #f1f5f9', margin: 0 }} />

      {/* Installation Fee Section */}
      <div>
        <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: '0.75rem' }}>
          Installation Fee
        </h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
          {INSTALLATION_FEE_OPTIONS.map((inst) => {
            const checked = selectedInstallation.includes(inst.id);
            return (
              <label
                key={inst.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.6rem',
                  fontSize: '0.85rem',
                  color: '#475569',
                  cursor: 'pointer',
                  userSelect: 'none',
                }}
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => onInstallationToggle(inst.id)}
                  style={{
                    width: '16px',
                    height: '16px',
                    accentColor: '#0056b3',
                    borderRadius: '4px',
                    cursor: 'pointer',
                  }}
                />
                {inst.label}
              </label>
            );
          })}
        </div>
      </div>

      <hr style={{ border: 'none', borderTop: '1px solid #f1f5f9', margin: 0 }} />

      {/* Availability Section */}
      <div>
        <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: '0.75rem' }}>
          Availability
        </h4>
        <label
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.6rem',
            fontSize: '0.85rem',
            color: '#475569',
            cursor: 'pointer',
            userSelect: 'none',
          }}
        >
          <input
            type="checkbox"
            checked={availableOnly}
            onChange={() => onAvailableToggle(!availableOnly)}
            style={{
              width: '16px',
              height: '16px',
              accentColor: '#0056b3',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          />
          Available Now
        </label>
      </div>
    </aside>
  );
}
