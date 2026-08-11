import React, { useEffect, useRef, useState } from 'react';
import Icon from '../Icon';

/* Closed: form-control-styled button showing selected labels (or a placeholder).
   Open: a checkbox-backed panel anchored below it. Closes on outside click or Escape. */
export default function MultiSelectDropdown({ label, options, selected, onChange, placeholder }) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const handleClick = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    const handleKey = (e) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('keydown', handleKey);
    };
  }, [open]);

  const toggleOption = (value) => {
    onChange(selected.includes(value) ? selected.filter((v) => v !== value) : [...selected, value]);
  };

  const selectedLabels = options.filter((o) => selected.includes(o.value)).map((o) => o.label);

  return (
    <div className="form-group" ref={containerRef} style={{ position: 'relative' }}>
      {label && <label className="form-label">{label}</label>}
      <button
        type="button"
        className="form-control"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="true"
        aria-expanded={open}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '0.5rem',
          textAlign: 'left',
          cursor: 'pointer',
        }}
      >
        <span
          style={{
            flex: 1,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            color: selectedLabels.length ? 'var(--text-primary)' : 'var(--text-secondary)',
          }}
        >
          {selectedLabels.length ? selectedLabels.join(', ') : placeholder}
        </span>
        <Icon
          name="chevron-down"
          size={18}
          style={{ flexShrink: 0, color: 'var(--text-secondary)', transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s ease' }}
        />
      </button>

      {open && (
        <div
          className="card"
          role="group"
          aria-label={label}
          style={{
            position: 'absolute',
            top: 'calc(100% + 0.4rem)',
            left: 0,
            right: 0,
            zIndex: 20,
            padding: '0.6rem 0.9rem',
            maxHeight: '280px',
            overflowY: 'auto',
            border: '1px solid var(--border-color)',
          }}
        >
          {options.map((opt) => (
            <label key={opt.value} className="checkbox-label" style={{ padding: '0.45rem 0', margin: 0 }}>
              <input
                type="checkbox"
                className="checkbox-input"
                checked={selected.includes(opt.value)}
                onChange={() => toggleOption(opt.value)}
              />
              {opt.label}
            </label>
          ))}
        </div>
      )}
    </div>
  );
}
