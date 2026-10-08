import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { getAnalytics, getUserReports, getApplicationReports } from '../services/adminService';
import { buildReportPdf } from '../utils/reportPdf';

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

const SERVICE_TYPES = [
  'all',
  'new-connection',
  'reconnection',
  'relocation',
  'termination',
  'transfer',
  'package-migration',
  'service-vacation',
  'refund-request',
  'customer-request-acceptance',
  'internet-services',
];

const STATUSES = ['all', 'pending', 'pending payment', 'approved', 'confirmed', 'rejected', 'flagged'];

const DATE_PRESETS = [
  { key: 'today', label: 'Today' },
  { key: '7d', label: 'Last 7 days' },
  { key: '30d', label: 'Last 30 days' },
  { key: '90d', label: 'Last 90 days' },
  { key: 'month', label: 'This month' },
  { key: 'custom', label: 'Custom range' },
];

// -- Date helpers --------------------------------------------------------------
const toInputDate = (date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

// Resolves a preset into a concrete [from, to] window. Custom keeps whatever
// the operator typed into the date inputs.
const resolvePreset = (preset) => {
  const now = new Date();
  switch (preset) {
    case 'today':
      return { from: toInputDate(now), to: toInputDate(now) };
    case '7d': {
      const from = new Date(now);
      from.setDate(from.getDate() - 6);
      return { from: toInputDate(from), to: toInputDate(now) };
    }
    case '90d': {
      const from = new Date(now);
      from.setDate(from.getDate() - 89);
      return { from: toInputDate(from), to: toInputDate(now) };
    }
    case 'month':
      return { from: toInputDate(new Date(now.getFullYear(), now.getMonth(), 1)), to: toInputDate(now) };
    case '30d':
    default: {
      const from = new Date(now);
      from.setDate(from.getDate() - 29);
      return { from: toInputDate(from), to: toInputDate(now) };
    }
  }
};

const formatDay = (value) => {
  if (!value) return '-';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '-';
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
};

// `YYYY-MM-DD` is parsed by the browser as UTC midnight, which would render as
// the previous day for anyone west of Greenwich. Pin these labels to UTC.
const formatInputDay = (value) => {
  if (!value) return '-';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '-';
  return d.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  });
};

const formatDateTime = (value) => {
  if (!value) return 'No activity';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return 'No activity';
  return d.toLocaleString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

// Human-friendly "3 days ago" / "4 hrs ago" for the last-activity column.
const formatRelative = (value) => {
  if (!value) return 'No activity';
  const diff = Date.now() - new Date(value).getTime();
  if (Number.isNaN(diff)) return 'No activity';
  if (diff < 0) return 'Just now';
  const minutes = Math.floor(diff / 60000);
  if (minutes < 60) return `${Math.max(minutes, 1)} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hr${hours === 1 ? '' : 's'} ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days} day${days === 1 ? '' : 's'} ago`;
  const months = Math.floor(days / 30);
  return `${months} month${months === 1 ? '' : 's'} ago`;
};

const serviceLabel = (id) =>
  id
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

const titleCase = (value) => value.charAt(0).toUpperCase() + value.slice(1);

// -- Charts (unchanged from the previous analytics view) -----------------------
function BarChart({ data }) {
  if (!data.length) return <p className="analytics-empty">No data available.</p>;
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
  if (!data.length) return <p className="analytics-empty">No data available.</p>;

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
        <div className="pie-chart-center">
          <div className="pie-chart-center-value">{total}</div>
          <div className="pie-chart-center-label">Total</div>
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

// -- Report helpers ------------------------------------------------------------
function completionTone(rate) {
  if (rate >= 70) return 'good';
  if (rate >= 40) return 'fair';
  return 'poor';
}

function initials(name = '') {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(part => part[0].toUpperCase())
    .join('');
}

const formatAmount = (value) =>
  value == null
    ? '-'
    : `Rs. ${Number(value).toLocaleString('en-LK', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const csvCell = (value) => {
  const str = value == null ? '' : String(value);
  return /[",\n]/.test(str) ? `"${str.replace(/"/g, '""')}"` : str;
};

const downloadBlob = (content, filename, mime) => {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

const USER_REPORT_COLUMNS = [
  ['Name', r => r.name],
  ['Role', r => {
    const role = r.role || 'Staff';
    if (role === 'Admin' || role === 'admin') return 'Administrator';
    if (role === 'Manage' || role === 'manage' || role === 'Manager') return 'Manager';
    if (role === 'Staff' || role === 'staff') return 'Staff';
    return role.replace(/^\[|\]$/g, '').replace(/\[.*?\]/g, '').trim();
  }],
  ['Email', r => r.email],
  ['Phone', r => r.phone],
  ['Tasks Handled', r => r.total],
  ['Approved', r => r.approved],
  ['Confirmed', r => r.confirmed],
  ['Rejected', r => r.rejected],
  ['Flagged', r => r.flagged],
  ['Open', r => r.open],
  ['Completion Rate %', r => r.completionRate],
  ['Avg Handle Hours', r => (r.avgHandleHours == null ? '' : r.avgHandleHours)],
  ['Last Activity', r => (r.lastActionedAt ? formatDateTime(r.lastActionedAt) : 'No activity')],
  ['Top Services', r => r.services.map(s => `${s.service} (${s.count})`).join(', ')],
];

const APPLICATION_REPORT_COLUMNS = [
  ['Selected Product', r => r.product],
  ['Customer Name', r => r.customerName],
  ['NIC Number', r => r.nic],
  ['Mobile Number', r => r.mobile],
  ['Paid Amount', r => (r.paidAmount == null ? '' : r.paidAmount)],
  ['Apply Date', r => formatDateTime(r.applyDate)],
  ['Reference Number', r => r.referenceNumber],
  ['Service Type', r => r.serviceLabel],
  ['Application Status', r => r.statusLabel],
  ['Payment Status', r => r.paymentStatus],
];

// One report, one file: every section is written in order under a single
// header, separated by a blank line so a spreadsheet reads it as one document.
const buildCombinedCsv = (sections, range) => {
  const lines = [
    csvCell(`Combined Report (${formatInputDay(range.from)} to ${formatInputDay(range.to)})`),
    '',
  ];
  sections.forEach((section, index) => {
    if (index) lines.push('');
    lines.push(csvCell(section.title));
    lines.push(section.columns.map(([label]) => csvCell(label)).join(','));
    section.rows.forEach(row => {
      lines.push(section.columns.map(([, read]) => csvCell(read(row))).join(','));
    });
  });
  return lines.join('\n');
};


export default function ReportsAnalyticsPage() {
  // -- Filter state --
  const [preset, setPreset] = useState('30d');
  const [customFrom, setCustomFrom] = useState(() => resolvePreset('30d').from);
  const [customTo, setCustomTo] = useState(() => resolvePreset('30d').to);
  const [serviceType, setServiceType] = useState('all');
  const [status, setStatus] = useState('all');
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [expanded, setExpanded] = useState(null);

  // -- Data state --
  const [analytics, setAnalytics] = useState(null);
  const [reportData, setReportData] = useState(null);
  const [appData, setAppData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Debounce the search box so typing does not fire a request per keystroke.
  useEffect(() => {
    const id = setTimeout(() => setSearch(searchInput.trim()), 350);
    return () => clearTimeout(id);
  }, [searchInput]);

  const range = useMemo(
    () => (preset === 'custom' ? { from: customFrom, to: customTo } : resolvePreset(preset)),
    [preset, customFrom, customTo]
  );

  const handlePresetChange = (key) => {
    setPreset(key);
    if (key !== 'custom') {
      const next = resolvePreset(key);
      setCustomFrom(next.from);
      setCustomTo(next.to);
    }
  };

  const requestParams = useMemo(() => {
    const params = {
      from: range.from,
      to: range.to,
      serviceType,
      status,
    };
    if (search) params.search = search;
    return params;
  }, [range, serviceType, status, search]);

  // The per-user report has no role filter, so it gets its own params.
  const userReportParams = useMemo(() => {
    const params = { from: range.from, to: range.to, serviceType, status };
    if (search) params.search = search;
    return params;
  }, [range, serviceType, status, search]);

  const loadData = useCallback(() => {
    setLoading(true);
    Promise.all([
      getAnalytics(requestParams),
      getUserReports(userReportParams),
      getApplicationReports(requestParams),
    ])
      .then(([analyticsRes, reportRes, appRes]) => {
        setAnalytics(analyticsRes);
        setReportData(reportRes);
        setAppData(appRes);
        setError('');
      })
      .catch(err => {
        setError(err.response?.data?.message || err.message || 'Failed to load reports.');
      })
      .finally(() => setLoading(false));
  }, [requestParams, userReportParams]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const resetFilters = () => {
    setPreset('30d');
    const next = resolvePreset('30d');
    setCustomFrom(next.from);
    setCustomTo(next.to);
    setServiceType('all');
    setStatus('all');
    setSearchInput('');
    setSearch('');
  };

  // -- Derived values --
  const reports = reportData?.reports || [];
  const appRows = appData?.rows || [];
  const appSummary = appData?.summary;
  const totalStatus = (analytics?.statusBreakdown || []).reduce((s, d) => s + d.count, 0);
  const hasFilters = preset !== '30d' || serviceType !== 'all' || status !== 'all' || !!search;

  // The report is a single document: per-user progress first as the summary,
  // then the full application detail. Both formats emit the same two sections
  // in the same order.
  const reportSections = useMemo(
    () => [
      {
        title: 'Section 1 - User Progress Summary',
        note: `${reports.length} user${reports.length === 1 ? '' : 's'}`,
        columns: USER_REPORT_COLUMNS,
        rows: reports,
      },
      {
        title: 'Section 2 - Application Information',
        note: `${appRows.length} application${appRows.length === 1 ? '' : 's'}`,
        columns: APPLICATION_REPORT_COLUMNS,
        rows: appRows,
      },
    ],
    [reports, appRows]
  );

  const canExport = reports.length > 0 || appRows.length > 0;

  const reportFilename = `combined-report-${range.from}-to-${range.to}`;

  const exportCombinedCsv = () => {
    if (!canExport) return;
    downloadBlob(
      buildCombinedCsv(reportSections, range),
      `${reportFilename}.csv`,
      'text/csv;charset=utf-8;'
    );
  };

  const exportCombinedPdf = () => {
    if (!canExport) return;
    downloadBlob(
      buildReportPdf({
        title: 'SLTMobitel EasyApply Portal',
        subtitle: 'Operations & Analytics Report',
        generatedDate: formatInputDay(new Date().toISOString()),
        reportPeriod: `${formatInputDay(range.from)} to ${formatInputDay(range.to)}`,
        executiveSummary: {
          totalApplications: appSummary?.totalApplications ?? appRows.length,
          totalUsers: reportData?.summary?.totalUsers ?? reports.length,
          totalTasks: reportData?.summary?.totalTasks ?? 0,
          totalCollected: appSummary?.totalCollected ?? 0,
          statusBreakdown: analytics?.statusBreakdown || [],
        },
        sections: reportSections,
      }),
      `${reportFilename}.pdf`,
      'application/pdf'
    );
  };

  return (
    <>
      <div className="analytics-bleed">
        <div className="admin-page-header">
          <h1 className="admin-page-title">Reports &amp; Analytics</h1>
          <p className="admin-page-subtitle">
            One combined report - per-user progress summary first, then full application details
          </p>
        </div>
      </div>

      {/* -- Report Filters -- */}
      <div className="analytics-bleed">
        <div className="analytics-filter-card">
          <div className="analytics-filter-head">
            <h3>Report Filters</h3>
            <div className="analytics-filter-summary">
              {formatInputDay(range.from)} - {formatInputDay(range.to)}
            </div>
          </div>

          <div className="admin-filters" style={{ marginBottom: 0 }}>
            <div className="analytics-preset-group" role="group" aria-label="Date range preset">
              {DATE_PRESETS.map(option => (
                <button
                  type="button"
                  key={option.key}
                  className={`analytics-preset ${preset === option.key ? 'active' : ''}`}
                  onClick={() => handlePresetChange(option.key)}
                >
                  {option.label}
                </button>
              ))}
            </div>

            {preset === 'custom' && (
              <div className="analytics-custom-range">
                <label>
                  <span>From</span>
                  <input type="date" value={customFrom} max={customTo} onChange={e => setCustomFrom(e.target.value)} />
                </label>
                <label>
                  <span>To</span>
                  <input type="date" value={customTo} min={customFrom} onChange={e => setCustomTo(e.target.value)} />
                </label>
              </div>
            )}

            <select className="admin-select" value={serviceType} onChange={e => setServiceType(e.target.value)} aria-label="Service type">
              {SERVICE_TYPES.map(value => (
                <option key={value} value={value}>
                  {value === 'all' ? 'All service types' : serviceLabel(value)}
                </option>
              ))}
            </select>

            <select className="admin-select" value={status} onChange={e => setStatus(e.target.value)} aria-label="Application status">
              {STATUSES.map(value => (
                <option key={value} value={value}>
                  {value === 'all' ? 'All statuses' : titleCase(value)}
                </option>
              ))}
            </select>

            <div className="admin-search">
              <span className="admin-search-icon">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" />
                </svg>
              </span>
              <input
                type="text"
                placeholder="Search by user, reference, NIC or product"
                value={searchInput}
                onChange={e => setSearchInput(e.target.value)}
              />
            </div>

            <button type="button" className="admin-btn ghost" onClick={loadData} disabled={loading}>
              {loading ? 'Generating...' : 'Regenerate'}
            </button>
            {hasFilters && (
              <button type="button" className="admin-btn ghost" onClick={resetFilters}>
                Clear filters
              </button>
            )}
          </div>
        </div>
      </div>

      {error && <div className="admin-error-banner">{error}</div>}

      {loading ? (
        <div className="admin-loading">Generating report...</div>
      ) : (
        <>
          {/* -- Combined Report: user progress summary, then application detail -- */}
          <div className="analytics-bleed analytics-report-stack">
            {/* Section 1 */}
            <div className="analytics-card">
              <div className="analytics-card-head">
                <h3>Section 1 &mdash; User Progress Summary</h3>
                <div className="analytics-card-actions">
                  <span className="analytics-card-hint">
                    Task progress per admin &amp; staff member - click a row for the service breakdown
                  </span>
                  <button type="button" className="admin-btn ghost" onClick={exportCombinedCsv} disabled={!canExport}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><path d="m7 10 5 5 5-5" /><path d="M12 15V3" />
                    </svg>
                    CSV
                  </button>
                  <button type="button" className="admin-btn primary" onClick={exportCombinedPdf} disabled={!canExport}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                      <path d="M14 2v6h6" /><path d="M12 18v-6" /><path d="m9.5 14.5 2.5-2.5 2.5 2.5" />
                    </svg>
                    Download Report
                  </button>
                </div>
              </div>

              {!reports.length ? (
                <div className="admin-empty">
                  <p>No users match the selected filters.</p>
                </div>
              ) : (
                <div className="admin-table-wrap">
                  <table className="admin-table admin-table-striped report-table">
                    <thead>
                      <tr>
                        <th>User</th>
                        <th>Role</th>
                        <th className="report-num">Tasks</th>
                        <th className="report-num">Approved</th>
                        <th className="report-num">Rejected</th>
                        <th className="report-num">Flagged</th>
                        <th className="report-num">Open</th>
                        <th>Progress</th>
                        <th className="report-num">Avg Handle</th>
                        <th>Last Activity</th>
                        <th aria-label="Details" />
                      </tr>
                    </thead>
                    <tbody>
                      {reports.map(row => {
                        const isOpen = expanded === row.userId;
                        return (
                          <React.Fragment key={row.userId}>
                            <tr
                              className="report-row"
                              onClick={() => setExpanded(isOpen ? null : row.userId)}
                            >
                              <td>
                                <div className="report-user">
                                  <span className="report-avatar">{initials(row.name)}</span>
                                  <span className="report-user-meta">
                                    <strong>{row.name}</strong>
                                    <small>{row.email || row.phone || 'No contact on file'}</small>
                                  </span>
                                </div>
                              </td>
                              <td>
                                 <span className={`admin-badge ${row.role === 'Admin' || row.role === 'admin' ? 'confirmed' : 'scheduled'}`}>
                                   {row.role === 'Admin' || row.role === 'admin' ? 'Administrator' : (row.role === 'Manage' || row.role === 'manage' || row.role === 'Manager' || row.role === 'manager' ? 'Manager' : row.role)}
                                 </span>
                              </td>
                              <td className="report-num report-strong">{row.total}</td>
                              <td className="report-num report-count approved">{row.approved + row.confirmed}</td>
                              <td className="report-num report-count rejected">{row.rejected}</td>
                              <td className="report-num report-count flagged">{row.flagged}</td>
                              <td className="report-num report-count open">{row.open}</td>
                              <td>
                                <div className="report-progress">
                                  <div className="report-progress-track">
                                    <div
                                      className={`report-progress-fill ${completionTone(row.completionRate)}`}
                                      style={{ width: `${row.completionRate}%` }}
                                    />
                                  </div>
                                  <span className="report-progress-label">{row.completionRate}%</span>
                                </div>
                              </td>
                              <td className="report-num">
                                {row.avgHandleHours == null ? '-' : `${row.avgHandleHours}h`}
                              </td>
                              <td>
                                <span className="report-last">{formatRelative(row.lastActionedAt)}</span>
                              </td>
                              <td className="report-caret">
                                <svg
                                  width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                  strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                                  style={{ transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}
                                >
                                  <path d="m6 9 6 6 6-6" />
                                </svg>
                              </td>
                            </tr>
                            {isOpen && (
                              <tr className="report-detail-row">
                                <td colSpan={11}>
                                  <div className="report-detail">
                                    <div className="report-detail-block">
                                      <h4>Service Breakdown</h4>
                                      {row.services.length ? (
                                        <div className="report-chips">
                                          {row.services.map(service => (
                                            <span className="report-chip" key={service.service}>
                                              {service.service}
                                              <strong>{service.count}</strong>
                                            </span>
                                          ))}
                                        </div>
                                      ) : (
                                        <p className="report-muted">No tasks handled in this range.</p>
                                      )}
                                    </div>
                                    <div className="report-detail-block">
                                      <h4>Task Progress</h4>
                                      <ul className="report-detail-list">
                                        <li><span>Total handled</span><strong>{row.total}</strong></li>
                                        <li><span>Approved</span><strong>{row.approved}</strong></li>
                                        <li><span>Confirmed</span><strong>{row.confirmed}</strong></li>
                                        <li><span>Rejected</span><strong>{row.rejected}</strong></li>
                                        <li><span>Flagged</span><strong>{row.flagged}</strong></li>
                                        <li><span>Still open</span><strong>{row.open}</strong></li>
                                        <li><span>Avg handle time</span><strong>{row.avgHandleHours == null ? '-' : `${row.avgHandleHours} hrs`}</strong></li>
                                      </ul>
                                    </div>
                                    <div className="report-detail-block">
                                      <h4>Activity</h4>
                                      <ul className="report-detail-list">
                                        <li><span>Last actioned</span><strong>{formatDateTime(row.lastActionedAt)}</strong></li>
                                        <li><span>Contact</span><strong>{row.phone || '-'}</strong></li>
                                        <li><span>Account created</span><strong>{formatDay(row.joinedAt)}</strong></li>
                                      </ul>
                                    </div>
                                  </div>
                                </td>
                              </tr>
                            )}
                          </React.Fragment>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Section 2 */}
            <div className="analytics-card">
              <div className="analytics-card-head">
                <h3>Section 2 &mdash; Application Information</h3>
                <div className="analytics-card-actions">
                  <span className="analytics-card-hint">
                    {appSummary
                      ? `${appSummary.totalApplications} application${appSummary.totalApplications === 1 ? '' : 's'} - ${formatAmount(appSummary.totalCollected)} collected`
                      : ''}
                  </span>
                </div>
              </div>

              {!appRows.length ? (
                <div className="admin-empty">
                  <p>No applications match the selected filters.</p>
                </div>
              ) : (
                <div className="admin-table-wrap">
                  <table className="admin-table admin-table-striped app-report-table">
                    <thead>
                      <tr>
                        <th>Selected Product</th>
                        <th>Customer Name</th>
                        <th>NIC Number</th>
                        <th>Mobile Number</th>
                        <th className="report-num">Paid Amount</th>
                        <th>Apply Date</th>
                        <th>Reference Number</th>
                      </tr>
                    </thead>
                    <tbody>
                      {appRows.map(row => (
                        <tr key={row.id}>
                          <td className="app-report-product">{row.product}</td>
                          <td className="app-report-customer">{row.customerName}</td>
                          <td>{row.nic}</td>
                          <td>{row.mobile}</td>
                          <td className="report-num report-amount">{formatAmount(row.paidAmount)}</td>
                          <td>{formatDateTime(row.applyDate)}</td>
                          <td>
                            <span className="app-report-ref">{row.referenceNumber}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {appSummary?.truncated && (
                <p className="report-muted" style={{ marginTop: '0.75rem' }}>
                  Showing the first {appRows.length} applications. Narrow the date range to see the rest.
                </p>
              )}
            </div>
          </div>

          {/* -- Charts -- */}
          {analytics && (
            <>
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

              <div className="analytics-bleed analytics-bottom-row">
                <div className="analytics-card">
                  <h3>
                    Daily Submissions Trend - {formatInputDay(range.from)} to {formatInputDay(range.to)}
                  </h3>
                  <DailyTrendChart data={analytics.dailyTrend} />
                </div>
              </div>
            </>
          )}

          {!analytics && totalStatus === 0 && (
            <div className="admin-empty"><p>No submissions in the selected range.</p></div>
          )}
        </>
      )}
    </>
  );
}
