import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import Icon from '../Icon';

/* Closed: form-control-styled button showing selected labels (or a placeholder).
   Open: a checkbox-backed panel portalled to <body> so it floats above the
   surrounding card instead of being visually trapped inside it. Closes on
   outside click, Escape, or scroll of an ancestor. */
export default function MultiSelectDropdown({ label, options, selected, onChange, placeholder }) {
  const [open, setOpen] = useState(false);
  const [rect, setRect] = useState(null);
  const triggerRef = useRef(null);
  const panelRef = useRef(null);

  useLayoutEffect(() => {
    if (!open || !triggerRef.current) return;
    const r = triggerRef.current.getBoundingClientRect();
    setRect({ top: r.bottom + 6, left: r.left, width: r.width });
  }, [open]);

  useEffect(() => {
    if (!open) return undefined;
    const handlePointerDown = (e) => {
      if (
        triggerRef.current && !triggerRef.current.contains(e.target) &&
        panelRef.current && !panelRef.current.contains(e.target)
      ) {
        setOpen(false);
      }
    };
    const handleKey = (e) => {
      if (e.key === 'Escape') setOpen(false);
    };
    const handleReposition = () => setOpen(false);
    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleKey);
    window.addEventListener('scroll', handleReposition, true);
    window.addEventListener('resize', handleReposition);
    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleKey);
      window.removeEventListener('scroll', handleReposition, true);
      window.removeEventListener('resize', handleReposition);
    };
  }, [open]);

  const toggleOption = (value) => {
    onChange(selected.includes(value) ? selected.filter((v) => v !== value) : [...selected, value]);
  };

  const selectedLabels = options.filter((o) => selected.includes(o.value)).map((o) => o.label);

  return (
    <div className="form-group">
      {label && <label className="form-label">{label}</label>}
      <button
        ref={triggerRef}
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

      {open && rect && createPortal(
        <div
          ref={panelRef}
          role="group"
          aria-label={label}
          style={{
            position: 'fixed',
            top: rect.top,
            left: rect.left,
            width: rect.width,
            zIndex: 1000,
            background: 'var(--surface)',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border-color)',
            boxShadow: '0 12px 32px rgba(15, 23, 42, 0.18)',
            padding: '0.6rem 0.9rem',
            maxHeight: '280px',
            overflowY: 'auto',
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
        </div>,
        document.body
      )}
    </div>
  );
}
