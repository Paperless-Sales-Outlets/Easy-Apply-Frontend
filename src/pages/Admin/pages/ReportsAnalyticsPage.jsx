import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { FiDollarSign, FiDownload, FiFileText, FiList, FiPercent, FiRefreshCw, FiSearch, FiUsers } from 'react-icons/fi';
import { getAnalytics, getUserReports, getApplicationReports } from '../services/adminService';
import { AnimatedNumber } from '../components/AdminVisuals';
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

// One colour per status, matching the status badges used across the portal.
const STATUS_COLORS = {
  Pending: '#eab034',
  'Pending Payment': '#d97706',
  Approved: '#57b531',
  Confirmed: '#0f57a8',
  Rejected: '#c4372c',
  Flagged: '#6a3fb5',
};

const STATUSES = ['all', 'pending', 'pending payment', 'approved', 'confirmed', 'rejected', 'flagged'];

const DATE_PRESETS = [
  { key: 'today', label: 'Today' },
  { key: '7d', label: '7 days' },
  { key: '30d', label: '30 days' },
  { key: '90d', label: '90 days' },
  { key: 'month', label: 'This month' },
  { key: 'custom', label: 'Custom' },
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

const titleCase = (value) => value.charAt(0).toUpperCase() + value.slice(1);

const roleLabel = (role) => {
  if (role === 'Admin' || role === 'admin') return 'Administrator';
  if (['Manage', 'manage', 'Manager', 'manager'].includes(role)) return 'Manager';
  return role || 'Staff';
};

// -- Charts --------------------------------------------------------------------
function BarChart({ data }) {
  if (!data.length) return <p className="analytics-empty rpt-chart-empty">No submissions in this range.</p>;
  const max = Math.max(...data.map(d => d.count), 1);
  const total = data.reduce((sum, d) => sum + d.count, 0) || 1;

  return (
    <div className="rpt-bars">
      {data.map(item => (
        <div className="rpt-bar" key={item.service}>
          <div className="rpt-bar-head">
            <span className="rpt-bar-label">{item.service}</span>
            <span className="rpt-bar-value"><strong>{item.count}</strong> · {Math.round((item.count / total) * 100)}%</span>
          </div>
          <div className="rpt-bar-track">
            <div className="rpt-bar-fill" style={{ width: `${(item.count / max) * 100}%` }} />
          </div>
        </div>
      ))}
    </div>
  );
}

function DailyTrendChart({ data }) {
  const [tooltip, setTooltip] = useState(null);
  if (!data.length) return <p className="analytics-empty rpt-chart-empty">No submissions in this range.</p>;

  const max = Math.max(...data.map(d => d.count), 1);
  const niceMax = Math.ceil(max / 5) * 5 || 5;

  const svgW = 1100;
  const svgH = 340;
  const padL = 44;
  const padR = 20;
  const padT = 20;
  const padB = 40;
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
    setTooltip({ x: closest.x, y: closest.y, date: closest.day, count: closest.count });
  };

  // Keep the tooltip inside the chart at both ends.
  const tipX = tooltip ? Math.min(Math.max(tooltip.x, padL + 56), svgW - padR - 56) : 0;
  const tipY = tooltip ? Math.max(tooltip.y - 54, 2) : 0;

  return (
    <div className="rpt-trend">
      <svg
        viewBox={`0 0 ${svgW} ${svgH}`}
        className="rpt-trend-svg"
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setTooltip(null)}
        role="img"
        aria-label={`Daily submissions, highest ${max}`}
      >
        <defs>
          <linearGradient id="rptAreaGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#0f57a8" stopOpacity="0.22" />
            <stop offset="100%" stopColor="#0f57a8" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="rptLineGradient" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#2b7de9" />
            <stop offset="100%" stopColor="#3a9636" />
          </linearGradient>
        </defs>

        {yTicks.map(tick => {
          const y = padT + chartH - (tick / niceMax) * chartH;
          return (
            <g key={tick}>
              <line x1={padL} y1={y} x2={svgW - padR} y2={y} stroke="rgba(11,45,91,0.08)" strokeDasharray={tick === 0 ? '0' : '4 4'} vectorEffect="non-scaling-stroke" />
              <text x={padL - 10} y={y + 4} textAnchor="end" fontSize="12" fill="#8a94a6" fontWeight="500">{tick}</text>
            </g>
          );
        })}

        <path
          d={`${pathD} L ${points[points.length - 1].x} ${padT + chartH} L ${points[0].x} ${padT + chartH} Z`}
          fill="url(#rptAreaGradient)"
        />

        <path d={pathD} fill="none" stroke="url(#rptLineGradient)" strokeWidth="2.75" strokeLinejoin="round" strokeLinecap="round" vectorEffect="non-scaling-stroke" />

        {points.map((p, i) => (
          // The last day is always labelled, so drop a stepped label that would sit on top of it.
          (i % xLabelStep === 0 && data.length - 1 - i >= xLabelStep / 2) || i === data.length - 1 ? (
            <text key={i} x={p.x} y={svgH - padB + 24} textAnchor="middle" fontSize="11" fill="#8a94a6" fontWeight="500">
              {p.day}
            </text>
          ) : null
        ))}

        {tooltip && (
          <g pointerEvents="none">
            <line x1={tooltip.x} y1={padT} x2={tooltip.x} y2={padT + chartH} stroke="#0f57a8" strokeWidth="1" strokeDasharray="3 3" opacity="0.45" vectorEffect="non-scaling-stroke" />
            <circle cx={tooltip.x} cy={tooltip.y} r="5.5" fill="#fff" stroke="#0f57a8" strokeWidth="2.5" vectorEffect="non-scaling-stroke" />
            <rect x={tipX - 52} y={tipY} width="104" height="40" rx="9" fill="#0b2d5b" />
            <text x={tipX} y={tipY + 18} textAnchor="middle" fontSize="15" fontWeight="800" fill="#fff">{tooltip.count}</text>
            <text x={tipX} y={tipY + 32} textAnchor="middle" fontSize="10" fill="rgba(255,255,255,0.72)">{tooltip.date}</text>
          </g>
        )}
      </svg>
    </div>
  );
}

function DonutChart({ data }) {
  const [selected, setSelected] = useState(null);
  const total = data.reduce((s, d) => s + d.count, 0);
  if (!total) return <p className="analytics-empty rpt-chart-empty">No submissions in this range.</p>;

  const size = 220;
  const cx = size / 2;
  const cy = size / 2;
  const radius = 82;
  const strokeW = 30;
  const circumference = 2 * Math.PI * radius;
  const gap = data.length > 1 ? 3 : 0;
  let cumulative = 0;

  const slices = data.map((item, i) => {
    const fraction = item.count / total;
    const start = cumulative;
    cumulative += fraction;
    return {
      ...item,
      color: STATUS_COLORS[item.status] || SLT_PIE_COLORS[i % SLT_PIE_COLORS.length],
      pct: Math.round(fraction * 100),
      dashLength: Math.max(0, fraction * circumference - gap),
      dashOffset: -start * circumference,
    };
  });

  const active = selected == null ? null : slices[selected];

  return (
    <div className="rpt-donut">
      <div className="rpt-donut-figure">
        <svg viewBox={`0 0 ${size} ${size}`} role="img" aria-label="Status breakdown">
          <circle cx={cx} cy={cy} r={radius} fill="none" stroke="#eef3f9" strokeWidth={strokeW} />
          <g transform={`rotate(-90 ${cx} ${cy})`}>
            {slices.map((slice, i) => (
              <circle
                key={slice.status}
                cx={cx} cy={cy} r={radius}
                fill="none" stroke={slice.color}
                strokeWidth={selected === i ? strokeW + 6 : strokeW}
                strokeDasharray={`${slice.dashLength} ${circumference - slice.dashLength}`}
                strokeDashoffset={slice.dashOffset}
                opacity={selected == null || selected === i ? 1 : 0.28}
                className="rpt-donut-slice"
                onMouseEnter={() => setSelected(i)}
                onMouseLeave={() => setSelected(null)}
              />
            ))}
          </g>
        </svg>
        <div className="rpt-donut-center">
          <strong>{active ? active.count : total}</strong>
          <span>{active ? active.status : 'Applications'}</span>
        </div>
      </div>
      <ul className="rpt-legend">
        {slices.map((slice, i) => (
          <li
            key={slice.status}
            className={selected === i ? 'is-active' : ''}
            onMouseEnter={() => setSelected(i)}
            onMouseLeave={() => setSelected(null)}
          >
            <span className="rpt-legend-swatch" style={{ background: slice.color }} />
            <span className="rpt-legend-label">{slice.status}</span>
            <span className="rpt-legend-track"><span style={{ width: `${slice.pct}%`, background: slice.color }} /></span>
            <strong className="rpt-legend-count">{slice.count}</strong>
            <span className="rpt-legend-pct">{slice.pct}%</span>
          </li>
        ))}
      </ul>
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

function SectionHead({ step, title, hint, children }) {
  return (
    <div className="um-panel-head rpt-section-head">
      <div className="rpt-section-title">
        {step && <span className="rpt-step">{step}</span>}
        <div className="um-panel-title">
          <h2>{title}</h2>
          {hint && <p>{hint}</p>}
        </div>
      </div>
      {children}
    </div>
  );
}

export default function ReportsAnalyticsPage() {
  // -- Filter state --
  const [preset, setPreset] = useState('30d');
  const [customFrom, setCustomFrom] = useState(() => resolvePreset('30d').from);
  const [customTo, setCustomTo] = useState(() => resolvePreset('30d').to);
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
      serviceType: 'new-connection',
      status,
    };
    if (search) params.search = search;
    return params;
  }, [range, status, search]);

  // The per-user report has no role filter, so it gets its own params.
  const userReportParams = useMemo(() => {
    const params = { from: range.from, to: range.to, serviceType: 'new-connection', status };
    if (search) params.search = search;
    return params;
  }, [range, status, search]);

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
    setStatus('all');
    setSearchInput('');
    setSearch('');
  };

  // -- Derived values --
  const reports = reportData?.reports || [];
  const appRows = appData?.rows || [];
  const appSummary = appData?.summary;
  const hasFilters = preset !== '30d' || status !== 'all' || !!search;
  const totalUsers = reportData?.summary?.totalUsers ?? reports.length;
  const totalTasks = reportData?.summary?.totalTasks ?? reports.reduce((sum, row) => sum + (row.total || 0), 0);
  const totalCollected = appSummary?.totalCollected ?? 0;
  const completedTasks = reports.reduce((sum, row) => sum + (row.approved || 0) + (row.confirmed || 0), 0);
  const completionRate = totalTasks ? Math.round((completedTasks / totalTasks) * 100) : 0;
  const firstLoad = loading && !analytics && !reportData;

  const trend = analytics?.dailyTrend || [];
  const trendTotal = trend.reduce((sum, d) => sum + d.count, 0);
  const trendPeak = trend.reduce((best, d) => (d.count > (best?.count ?? -1) ? d : best), null);
  const trendAverage = trend.length ? (trendTotal / trend.length).toFixed(1) : '0';

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

  const tiles = [
    { key: 'users', cls: 'total', icon: <FiUsers size={15} />, label: 'Users covered', value: totalUsers, foot: 'Staff who handled applications' },
    { key: 'tasks', cls: 'active', icon: <FiList size={15} />, label: 'Tasks handled', value: totalTasks, foot: `${completedTasks} approved or confirmed` },
    { key: 'rate', cls: 'roles', icon: <FiPercent size={15} />, label: 'Completion rate', value: completionRate, suffix: '%', meter: completionRate, foot: 'Approved or confirmed' },
    { key: 'collected', cls: 'collected', icon: <FiDollarSign size={15} />, label: 'Collected', money: formatAmount(totalCollected), foot: 'From application payments' },
  ];

  return (
    <div className="analytics-page um-page rpt-page">
      <section className="um-hero analytics-hero">
        <div className="um-hero-deco" aria-hidden="true">
          <span className="um-hero-orb" />
          <span className="um-hero-slash" />
          <span className="um-hero-grid" />
        </div>
        <div className="um-hero-top">
          <div className="um-hero-text">
            <span className="um-hero-eyebrow">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 3v18h18M7 16v-5M12 16V8M17 16v-8" />
              </svg>
              Operations intelligence
            </span>
            <h1>Reports &amp; Analytics</h1>
            <p>Team progress, service demand and payments for {formatInputDay(range.from)} – {formatInputDay(range.to)}.</p>
          </div>
          <div className="rpt-hero-actions">
            <button type="button" className="rpt-glass-btn" onClick={exportCombinedCsv} disabled={!canExport || loading}>
              <FiDownload size={15} /> CSV
            </button>
            <button type="button" className="um-hero-action" onClick={exportCombinedPdf} disabled={!canExport || loading}>
              <span className="um-hero-action-icon rpt-no-spin"><FiFileText size={15} /></span>
              Download Report
            </button>
          </div>
        </div>
        <div className="um-hero-tiles">
          {tiles.map((tile, idx) => (
            <div className={`um-hero-tile ${tile.cls}`} key={tile.key} style={{ '--i': idx }}>
              <div className="um-hero-tile-head"><span className="um-hero-tile-icon">{tile.icon}</span>{tile.label}</div>
              <div className={`um-hero-tile-value${tile.money ? ' rpt-money' : ''}`}>
                {firstLoad
                  ? <span className="dash-skeleton um-hero-skeleton" />
                  : tile.money ?? <><AnimatedNumber value={tile.value} />{tile.suffix}</>}
              </div>
              {tile.meter != null && (
                <div className="um-hero-meter" aria-hidden="true"><span style={{ width: `${firstLoad ? 0 : tile.meter}%` }} /></div>
              )}
              <div className="um-hero-tile-foot">{tile.foot}</div>
            </div>
          ))}
        </div>
      </section>

      {/* -- Report Filters -- */}
      <section className="um-panel rpt-filters">
        <div className="rpt-filter-row">
          <div className="ax-seg ax-seg--scroll" role="group" aria-label="Date range preset">
            {DATE_PRESETS.map(option => (
              <button
                type="button"
                key={option.key}
                className={`ax-seg-btn${preset === option.key ? ' active' : ''}`}
                aria-pressed={preset === option.key}
                onClick={() => handlePresetChange(option.key)}
              >
                {option.label}
              </button>
            ))}
          </div>

          {preset === 'custom' && (
            <div className="ax-range" role="group" aria-label="Custom date range">
              <input type="date" value={customFrom} max={customTo} onChange={e => setCustomFrom(e.target.value)} aria-label="From date" />
              <span aria-hidden="true">to</span>
              <input type="date" value={customTo} min={customFrom} onChange={e => setCustomTo(e.target.value)} aria-label="To date" />
            </div>
          )}

          <select className="admin-select" value={status} onChange={e => setStatus(e.target.value)} aria-label="Application status">
            {STATUSES.map(value => (
              <option key={value} value={value}>
                {value === 'all' ? 'All statuses' : titleCase(value)}
              </option>
            ))}
          </select>

          <div className="admin-search um-search rpt-search">
            <span className="admin-search-icon"><FiSearch size={15} /></span>
            <input
              type="text"
              placeholder="Search user, reference, NIC or product"
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
              aria-label="Search the report"
            />
          </div>

          <div className="rpt-filter-end">
            {hasFilters && (
              <button type="button" className="admin-btn ghost ax-clear" onClick={resetFilters}>Clear</button>
            )}
            <button
              type="button"
              className={`rpt-icon-btn${loading ? ' is-spinning' : ''}`}
              onClick={loadData}
              disabled={loading}
              aria-label="Regenerate the report"
              title="Regenerate"
            >
              <FiRefreshCw size={15} />
            </button>
          </div>
        </div>
      </section>

      {error && <div className="admin-error-banner">{error}</div>}

      {firstLoad ? (
        <section className="um-panel">
          <div className="dash-table-skeleton">
            {Array.from({ length: 5 }).map((_, i) => <div className="dash-skeleton dash-skeleton-row" key={i} />)}
          </div>
        </section>
      ) : (
        <div className={`rpt-body${loading ? ' is-refreshing' : ''}`}>
          {/* -- Charts -- */}
          {analytics && (
            <>
              <div className="rpt-chart-grid">
                <section className="um-panel rpt-chart-card">
                  <SectionHead title="Submissions by service" hint="Share of applications per service type" />
                  <div className="rpt-chart-body"><BarChart data={analytics.byServiceType || []} /></div>
                </section>
                <section className="um-panel rpt-chart-card">
                  <SectionHead title="Status breakdown" hint="Where applications stand now" />
                  <div className="rpt-chart-body"><DonutChart data={analytics.statusBreakdown || []} /></div>
                </section>
              </div>

              <section className="um-panel rpt-chart-card">
                <SectionHead title="Daily submissions" hint={`${formatInputDay(range.from)} – ${formatInputDay(range.to)}`}>
                  <div className="rpt-trend-stats">
                    <span><strong>{trendTotal}</strong> total</span>
                    <span><strong>{trendAverage}</strong> per day</span>
                    {trendPeak && trendPeak.count > 0 && <span><strong>{trendPeak.count}</strong> peak · {trendPeak.day}</span>}
                  </div>
                </SectionHead>
                <div className="rpt-chart-body"><DailyTrendChart data={trend} /></div>
              </section>
            </>
          )}

          {/* -- Section 1 -- */}
          <section className="um-panel">
            <SectionHead step="1" title="User progress summary" hint="Tasks handled per admin and staff member. Click a row for the service breakdown.">
              <span className="ax-count">{reports.length} user{reports.length === 1 ? '' : 's'}</span>
            </SectionHead>

            {!reports.length ? (
              <div className="um-empty-state">
                <span className="um-empty-icon"><FiUsers size={22} /></span>
                <h3>No users in this report</h3>
                <p>No one handled an application with the selected filters.</p>
              </div>
            ) : (
              <div className="admin-table-wrap um-table-wrap">
                <table className="admin-table um-table report-table rpt-user-table">
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
                      <th className="report-num">Avg time</th>
                      <th>Last active</th>
                      <th aria-label="Details" />
                    </tr>
                  </thead>
                  <tbody>
                    {reports.map(row => {
                      const isOpen = expanded === row.userId;
                      return (
                        <React.Fragment key={row.userId}>
                          <tr
                            className={`report-row${isOpen ? ' is-open' : ''}`}
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
                              <span className={`ax-chip ${row.role === 'Admin' || row.role === 'admin' ? 'ax-chip--info' : 'ax-chip--neutral'}`}>
                                {roleLabel(row.role)}
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
                              <span className={`alog-caret${isOpen ? ' is-open' : ''}`} aria-hidden="true">
                                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                  <path d="m6 9 6 6 6-6" />
                                </svg>
                              </span>
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
          </section>

          {/* -- Section 2 -- */}
          <section className="um-panel">
            <SectionHead
              step="2"
              title="Application information"
              hint={appSummary
                ? `${appSummary.totalApplications} application${appSummary.totalApplications === 1 ? '' : 's'} · ${formatAmount(appSummary.totalCollected)} collected`
                : 'Every application in the selected range'}
            >
              <span className="ax-count">{appRows.length} row{appRows.length === 1 ? '' : 's'}</span>
            </SectionHead>

            {!appRows.length ? (
              <div className="um-empty-state">
                <span className="um-empty-icon"><FiFileText size={22} /></span>
                <h3>No applications in this report</h3>
                <p>Try a wider date range or a different status.</p>
              </div>
            ) : (
              <div className="admin-table-wrap um-table-wrap">
                <table className="admin-table um-table app-report-table">
                  <thead>
                    <tr>
                      <th>Selected product</th>
                      <th>Customer name</th>
                      <th>NIC number</th>
                      <th>Mobile number</th>
                      <th className="report-num">Paid amount</th>
                      <th>Apply date</th>
                      <th>Reference number</th>
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
              <p className="rpt-truncated">
                Showing the first {appRows.length} applications. Narrow the date range to see the rest.
              </p>
            )}
          </section>
        </div>
      )}
    </div>
  );
}
