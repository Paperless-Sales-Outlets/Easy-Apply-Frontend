import React, { useEffect, useId, useRef, useState } from 'react';

// Small presentational helpers shared by the Dashboard and User Management
// pages. Nothing here fetches data — callers pass real values in.

const prefersReducedMotion = () =>
  typeof window !== 'undefined'
  && window.matchMedia
  && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Counts from the previously shown value up/down to `value` with an ease-out.
export function useCountUp(value, duration = 900) {
  const target = Number(value) || 0;
  const [display, setDisplay] = useState(target);
  const fromRef = useRef(0);

  useEffect(() => {
    if (prefersReducedMotion()) {
      setDisplay(target);
      fromRef.current = target;
      return undefined;
    }
    const from = fromRef.current;
    const start = performance.now();
    let frame;
    const tick = (now) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - (1 - t) ** 3;
      setDisplay(Math.round(from + (target - from) * eased));
      if (t < 1) frame = requestAnimationFrame(tick);
      else fromRef.current = target;
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [target, duration]);

  return display;
}

export function AnimatedNumber({ value, duration }) {
  return <>{useCountUp(value, duration).toLocaleString('en-GB')}</>;
}

// A tiny area sparkline. `data` is an array of numbers (oldest → newest).
export function Sparkline({ data, color = 'var(--blue)', height = 44, label }) {
  const id = useId().replace(/:/g, '');
  const width = 160;
  const pad = 4;
  const max = Math.max(...data, 1);
  const step = data.length > 1 ? (width - pad * 2) / (data.length - 1) : 0;
  const points = data.map((v, i) => [pad + i * step, height - pad - (v / max) * (height - pad * 2)]);
  const line = points.map(([x, y], i) => `${i ? 'L' : 'M'}${x.toFixed(1)},${y.toFixed(1)}`).join(' ');
  const area = `${line} L${points[points.length - 1][0].toFixed(1)},${height} L${points[0][0].toFixed(1)},${height} Z`;
  const [lx, ly] = points[points.length - 1];

  return (
    <svg
      className="adm-sparkline"
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="none"
      role="img"
      aria-label={label || `Last ${data.length} days: ${data.join(', ')}`}
    >
      <defs>
        <linearGradient id={`spark-${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.28" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#spark-${id})`} />
      <path d={line} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
      <circle cx={lx} cy={ly} r="3" fill="#fff" stroke={color} strokeWidth="2" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}

// 1 … 4 5 [6] 7 8 … 23 — never more than seven page buttons.
function pageWindow(current, total) {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages = new Set([1, total, current - 1, current, current + 1]);
  if (current <= 3) [2, 3, 4].forEach((p) => pages.add(p));
  if (current >= total - 2) [total - 3, total - 2, total - 1].forEach((p) => pages.add(p));
  const sorted = [...pages].filter((p) => p >= 1 && p <= total).sort((a, b) => a - b);
  const out = [];
  sorted.forEach((p, i) => {
    if (i && p - sorted[i - 1] > 1) out.push(`gap-${p}`);
    out.push(p);
  });
  return out;
}

// Numbered pagination shared by the admin tables. `info` is the text on the left.
export function Pager({ page, totalPages, onChange, info, disabled = false, label = 'Pages' }) {
  if (!totalPages || totalPages < 1) return null;
  return (
    <nav className="ax-pager" aria-label={label}>
      <span className="ax-pager-info">{info ?? `Page ${page} of ${totalPages}`}</span>
      {totalPages > 1 && (
        <div className="ax-pager-buttons">
          <button type="button" className="ax-pager-btn" disabled={disabled || page <= 1} onClick={() => onChange(page - 1)} aria-label="Previous page">‹</button>
          {pageWindow(page, totalPages).map((item) => (typeof item === 'string' ? (
            <span className="ax-pager-gap" key={item}>…</span>
          ) : (
            <button
              type="button"
              key={item}
              className={`ax-pager-btn${item === page ? ' active' : ''}`}
              aria-current={item === page ? 'page' : undefined}
              disabled={disabled}
              onClick={() => onChange(item)}
            >
              {item}
            </button>
          )))}
          <button type="button" className="ax-pager-btn" disabled={disabled || page >= totalPages} onClick={() => onChange(page + 1)} aria-label="Next page">›</button>
        </div>
      )}
    </nav>
  );
}

// Relative "x ago" label for timestamps in tables.
export function timeAgo(value) {
  if (!value) return '';
  const diff = Date.now() - new Date(value).getTime();
  if (Number.isNaN(diff)) return '';
  const mins = Math.round(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.round(hrs / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.round(days / 30);
  if (months < 12) return `${months}mo ago`;
  return `${Math.round(months / 12)}y ago`;
}
