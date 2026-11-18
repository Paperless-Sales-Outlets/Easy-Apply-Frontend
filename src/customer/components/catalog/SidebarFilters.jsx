import React from 'react';
import { FiX } from 'react-icons/fi';

const PRODUCT_TYPES = [
  { id: 'Fibre Broadband', label: 'Fibre Broadband' },
  { id: 'PEO TV', label: 'PEO TV' },
  { id: 'LTE Home', label: 'LTE Home (Wireless)' },
  { id: 'Voice', label: 'Voice Megaline' },
];

const SPEEDS = [
  { id: 'up_to_100', label: 'Up to 100 Mbps' },
  { id: '100_300', label: '100 – 300 Mbps' },
  { id: '300_500', label: '300 – 500 Mbps' },
  { id: 'above_500', label: 'Above 500 Mbps' },
];

/** One native checkbox row; a count sits on the right and an empty option is disabled. */
function Option({ label, count, checked, onChange }) {
  const empty = count === 0 && !checked;
  return (
    <label className={`filter-option${empty ? ' is-empty' : ''}`}>
      <input type="checkbox" checked={checked} disabled={empty} onChange={onChange} />
      <span className="filter-option-label">{label}</span>
      {count !== null && count !== undefined && <span className="filter-option-count">{count}</span>}
    </label>
  );
}

/** Sidebar filters (type, speed) for the product catalogue. */
export default function SidebarFilters({
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
    <aside className="filters" aria-label="Filter packages">
      <div className="filters-head">
        <h2 className="filters-title">
          Filters
          {activeCount > 0 && <span className="filters-active">{activeCount} selected</span>}
        </h2>
        <div className="filters-head-actions">
          {activeCount > 0 && (
            <button type="button" className="btn btn-tertiary filters-reset" onClick={onClearAll}>
              Clear all
            </button>
          )}
          {onCloseMobile && (
            <button
              type="button"
              className="btn btn-tertiary catalog-filter-close-btn"
              onClick={onCloseMobile}
              aria-label="Close filters"
            >
              <FiX size={20} aria-hidden="true" />
            </button>
          )}
        </div>
      </div>

      <fieldset className="filters-group">
        <legend>Product type</legend>
        {PRODUCT_TYPES.map((pt) => (
          <Option
            key={pt.id}
            label={pt.label}
            count={typeCounts ? typeCounts[pt.id] || 0 : null}
            checked={selectedTypes.includes(pt.id)}
            onChange={() => onTypeToggle(pt.id)}
          />
        ))}
      </fieldset>

      <fieldset className="filters-group">
        <legend>Connection speed</legend>
        {SPEEDS.map((sp) => (
          <Option
            key={sp.id}
            label={sp.label}
            count={speedCounts ? speedCounts[sp.id] || 0 : null}
            checked={selectedSpeeds.includes(sp.id)}
            onChange={() => onSpeedToggle(sp.id)}
          />
        ))}
      </fieldset>

      {onApply && (
        <button type="button" className="btn btn-primary filters-apply" onClick={onApply}>
          Show results
        </button>
      )}
    </aside>
  );
}
