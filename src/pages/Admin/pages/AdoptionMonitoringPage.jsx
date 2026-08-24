import React, { useState, useEffect } from 'react';
import { getAnalytics } from '../services/adminService';

const SLT_PIE_COLORS = [
  '#0f57a8', // blue
  '#57b531', // green
  '#0a3f7e', // blue-deep
  '#3e8f1f', // green-deep
  '#0b2d5b', // navy
  '#2b7de9', // lighter blue
  '#7cc463', // lighter green
  '#eab034', // amber (for pending-type)
  '#d97706', // dark amber
  '#c4372c', // red
];

const STATUS_COLORS = {
  Pending: '#2b7de9',
  'Pending Payment': '#0a3f7e',
  Approved: '#57b531',
  Confirmed: '#0f57a8',
  Rejected: '#3e8f1f',
  Flagged: '#0b2d5b',
};

function BarChart({ data }) {
  if (!data.length) return <p style={{ color: 'var(--muted)', fontSize: '0.85rem' }}>No data available.</p>;
  const max = Math.max(...data.map(d => d.count), 1);

  return (
    <div className="service-bar-list">
      {data.map(item => (
        <div className="service-bar-item" key={item.service}>
          <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
            <span style={{ fontWeight: 600, fontSize: '0.83rem' }}>{item.service}</span>
            <div className="service-bar-bg">
              <div className="service-bar-fill" style={{ width: `${(item.count / max) * 100}%` }} />
            </div>
          </div>
          <span className="service-bar-count">{item.count}</span>
        </div>
      ))}
    </div>
  );
}

function DailyTrendChart({ data }) {
  const [tooltip, setTooltip] = useState(null);
  if (!data.length) return <p style={{ color: 'var(--muted)', fontSize: '0.85rem' }}>No data available.</p>;

  const max = Math.max(...data.map(d => d.count), 1);
  const niceMax = Math.ceil(max / 5) * 5 || 5;

  const svgW = 1100;
  const svgH = 420;
  const padL = 50;
  const padR = 24;
  const padT = 24;
  const padB = 52;
  const chartW = svgW - padL - padR;
  const chartH = svgH - padT - padB;

  const points = data.map((d, i) => ({
    x: padL + (i / (data.length - 1 || 1)) * chartW,
    y: padT + chartH - (d.count / niceMax) * chartH,
    ...d,
  }));

  const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');

  const tickCount = 5;
  const yTicks = Array.from({ length: tickCount + 1 }, (_, i) => Math.round((niceMax / tickCount) * i));

  const xLabelStep = Math.ceil(data.length / 8);

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const mouseX = ((e.clientX - rect.left) / rect.width) * svgW;
    let closest = points[0];
    let minDist = Infinity;
    points.forEach(p => {
      const dist = Math.abs(p.x - mouseX);
      if (dist < minDist) { minDist = dist; closest = p; }
    });
    if (minDist < 30) {
      setTooltip({ x: closest.x, y: closest.y, date: closest.day, count: closest.count });
    } else {
      setTooltip(null);
    }
  };

  return (
    <div style={{ overflowX: 'auto' }}>
      <svg
        viewBox={`0 0 ${svgW} ${svgH}`}
        width="100%"
        height="420"
        style={{ display: 'block', minWidth: '600px' }}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setTooltip(null)}
      >
        {yTicks.map(tick => {
          const y = padT + chartH - (tick / niceMax) * chartH;
          return (
            <g key={tick}>
              <line x1={padL} y1={y} x2={svgW - padR} y2={y} stroke="rgba(11,45,91,0.1)" strokeDasharray={tick === 0 ? '0' : '4 3'} />
              <text x={padL - 10} y={y + 4} textAnchor="end" fontSize="12" fill="#8a94a6" fontWeight="500">{tick}</text>
            </g>
          );
        })}

        <path
          d={`${pathD} L ${points[points.length - 1].x} ${padT + chartH} L ${points[0].x} ${padT + chartH} Z`}
          fill="url(#areaGradient)"
        />

        <path d={pathD} fill="none" stroke="var(--blue)" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />

        {points.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r="4" fill="#fff" stroke="var(--blue)" strokeWidth="2" style={{ cursor: 'pointer' }} />
        ))}

        {points.map((p, i) => (
          i % xLabelStep === 0 || i === data.length - 1 ? (
            <text key={i} x={p.x} y={svgH - padB + 20} textAnchor="middle" fontSize="11" fill="#8a94a6" fontWeight="500">
              {p.day}
            </text>
          ) : null
        ))}

        <defs>
          <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--blue)" stopOpacity="0.18" />
            <stop offset="100%" stopColor="var(--blue)" stopOpacity="0.02" />
          </linearGradient>
        </defs>

        {tooltip && (
          <g>
            <line x1={tooltip.x} y1={padT} x2={tooltip.x} y2={padT + chartH} stroke="var(--blue)" strokeWidth="1" strokeDasharray="3 3" opacity="0.5" />
            <rect x={tooltip.x - 52} y={tooltip.y - 46} width="104" height="36" rx="8" fill="var(--navy)" />
            <text x={tooltip.x} y={tooltip.y - 24} textAnchor="middle" fontSize="14" fontWeight="700" fill="#fff">{tooltip.count}</text>
            <text x={tooltip.x} y={tooltip.y - 14} textAnchor="middle" fontSize="10" fill="rgba(255,255,255,0.7)">{tooltip.date}</text>
          </g>
        )}
      </svg>
    </div>
  );
}

function PieChart({ data }) {
  const [selected, setSelected] = useState(null);
  const total = data.reduce((s, d) => s + d.count, 0) || 1;
  const size = 340;
  const cx = size / 2;
  const cy = size / 2;
  const radius = 115;
  const strokeW = 58;
  const circumference = 2 * Math.PI * radius;
  let cumulative = 0;

  const slices = data.map((item, i) => {
    const fraction = item.count / total;
    const start = cumulative;
    cumulative += fraction;
    return {
      ...item,
      color: STATUS_COLORS[item.status] || SLT_PIE_COLORS[i % SLT_PIE_COLORS.length],
      dashLength: fraction * circumference,
      dashOffset: -start * circumference,
    };
  });

  return (
    <div className="analytics-pie-layout">
      <div className="pie-chart-figure lg">
        <svg viewBox={`0 0 ${size} ${size}`} style={{ display: 'block', width: '100%', height: '100%' }}>
          <g transform={`rotate(-90 ${cx} ${cy})`}>
            {slices.map((slice, i) => (
              <circle
                key={slice.status}
                cx={cx} cy={cy} r={radius}
                fill="none" stroke={slice.color}
                strokeWidth={strokeW}
                strokeDasharray={`${slice.dashLength} ${circumference - slice.dashLength}`}
                strokeDashoffset={slice.dashOffset}
                opacity={selected == null || selected === i ? 1 : 0.3}
                style={{ cursor: 'pointer', transition: 'opacity 0.2s' }}
                onClick={() => setSelected(selected === i ? null : i)}
              />
            ))}
          </g>
        </svg>
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center' }}>
          <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--navy)' }}>{total}</div>
          <div style={{ fontSize: '0.8rem', color: 'var(--muted)', fontWeight: 600 }}>Total</div>
        </div>
      </div>
      <div className="analytics-pie-legend">
        {data.map((item, i) => (
          <div key={item.status} style={{ display: 'flex', alignItems: 'center', gap: '0.7rem' }}>
            <span style={{ width: '14px', height: '14px', borderRadius: '4px', background: STATUS_COLORS[item.status] || SLT_PIE_COLORS[i % SLT_PIE_COLORS.length], flexShrink: 0 }} />
            <span style={{ color: 'var(--text)' }}>{item.status}: <strong>{item.count}</strong></span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function AdoptionMonitoringPage() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getAnalytics()
      .then(data => {
        if (cancelled) return;
        setAnalytics(data);
        setError('');
      })
      .catch(err => {
        if (cancelled) return;
        setError(err.response?.data?.message || err.message || 'Failed to load analytics.');
      })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  const totalSubmissions = (analytics?.byServiceType || []).reduce((s, d) => s + d.count, 0);
  const totalStatus = (analytics?.statusBreakdown || []).reduce((s, d) => s + d.count, 0);

  return (
    <>
      <div className="analytics-bleed">
        <div className="admin-page-header">
          <h1 className="admin-page-title">Analytics</h1>
          <p className="admin-page-subtitle">
            Submissions by service type, daily trend, and status breakdown
          </p>
        </div>
      </div>

      {error && <div className="admin-error-banner">{error}</div>}

      {loading ? (
        <div className="admin-loading">Loading analytics…</div>
      ) : !analytics ? (
        <div className="admin-empty"><p>No analytics data available.</p></div>
      ) : (
        <>
          {/* ── Summary Cards (full-bleed) ── */}
          <div className="analytics-bleed">
            <div className="admin-summary-grid" style={{ marginTop: 0 }}>
              <div className="admin-stat-card">
                <div className="admin-stat-icon blue">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" />
                  </svg>
                </div>
                <div>
                  <div className="admin-stat-label">Total Submissions</div>
                  <div className="admin-stat-value">{totalSubmissions}</div>
                  <div className="admin-stat-trend">All time</div>
                </div>
              </div>
              <div className="admin-stat-card">
                <div className="admin-stat-icon green">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><path d="m9 11 3 3L22 4" />
                  </svg>
                </div>
                <div>
                  <div className="admin-stat-label">Service Types</div>
                  <div className="admin-stat-value">{analytics.byServiceType.length}</div>
                  <div className="admin-stat-trend">Active categories</div>
                </div>
              </div>
              <div className="admin-stat-card">
                <div className="admin-stat-icon amber">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" />
                  </svg>
                </div>
                <div>
                  <div className="admin-stat-label">Status Categories</div>
                  <div className="admin-stat-value">{analytics.statusBreakdown.length}</div>
                  <div className="admin-stat-trend">{totalStatus} total tracked</div>
                </div>
              </div>
            </div>
          </div>

          {/* ── Top row: Service Type bar chart + Pie chart (full-bleed) ── */}
          <div className="analytics-bleed">
            <div className="analytics-top-row">
              <div className="analytics-card">
                <h3>Submissions by Service Type</h3>
                <BarChart data={analytics.byServiceType} />
              </div>
              <div className="analytics-card">
                <h3>Status Breakdown</h3>
                <PieChart data={analytics.statusBreakdown} />
              </div>
            </div>
          </div>

          {/* ── Bottom row: Daily Trend full width (full-bleed) ── */}
          <div className="analytics-bleed analytics-bottom-row">
            <div className="analytics-card">
              <h3>Daily Submissions Trend — Last 30 Days</h3>
              <DailyTrendChart data={analytics.dailyTrend} />
            </div>
          </div>
        </>
      )}
    </>
  );
}
