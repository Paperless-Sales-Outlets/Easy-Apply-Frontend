import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { getApplications, getAdminForms } from '../services/adminService';
import { useAdminAuth } from '../context/AdminAuthContext';
import { AnimatedNumber, Sparkline, timeAgo } from '../components/AdminVisuals';
import {
  formatDate,
  normalizeApplication,
  normalizeForm,
  deriveStatsFromApplications,
  deriveStatsFromForms,
  deriveTodayDistribution,
  serviceLabel,
  statusBadgeClass,
  statusLabel,
} from '../utils/applicationUtils';

const SHORT_FORM_LABELS = {
  'Customer Request Acceptance': 'Cust. Request',
};

// Dashboard history shows only work that is still awaiting action.
const PENDING_STATUSES = ['pending', 'pending payment'];
const RECENT_LIMIT = 15;

function shortFormLabel(label) {
  return SHORT_FORM_LABELS[label] || label;
}

function initials(name) {
  if (!name) return '?';
  return name.split(' ').filter(Boolean).map((n) => n[0]).slice(0, 2).join('').toUpperCase();
}

const DAY_MS = 86400000;
const TREND_DAYS = 7;
const CLOSED_STATUSES = ['approved', 'confirmed'];

const statusOf = (app) => String(app.status || 'pending').toLowerCase();
const actionedOn = (app) => app.actionedAt || app.updatedAt;

function startOfDay(value) {
  const d = new Date(value);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

// Applications per local day for the last TREND_DAYS days (oldest → newest),
// bucketed by whichever date `pickDate` returns (null = not counted).
function dailySeries(apps, pickDate) {
  const today = startOfDay(Date.now());
  const counts = Array(TREND_DAYS).fill(0);
  apps.forEach((app) => {
    const when = pickDate(app);
    if (!when) return;
    const idx = TREND_DAYS - 1 - Math.round((today - startOfDay(when)) / DAY_MS);
    if (idx >= 0 && idx < TREND_DAYS) counts[idx] += 1;
  });
  return counts;
}

// 7-day trend source + colour for each summary card.
const KPI_TRENDS = {
  todaySubmissions: { color: '#0f57a8', pick: (a) => a.submittedAt },
  pendingKyc: { color: '#d08a00', pick: (a) => (PENDING_STATUSES.includes(statusOf(a)) ? a.submittedAt : null) },
  approvedToday: { color: '#3a9636', pick: (a) => (CLOSED_STATUSES.includes(statusOf(a)) ? actionedOn(a) : null) },
  rejectedToday: { color: '#c4372c', pick: (a) => (statusOf(a) === 'rejected' ? actionedOn(a) : null) },
};

// Status order + colour for the pipeline bar in the hero.
const PIPELINE = [
  { key: 'pending', label: 'Pending', color: '#eba834' },
  { key: 'pending payment', label: 'Pending Payment', color: '#f6cf7a' },
  { key: 'approved', label: 'Approved', color: '#50b748' },
  { key: 'confirmed', label: 'Confirmed', color: '#5aa9f0' },
  { key: 'rejected', label: 'Rejected', color: '#e0645a' },
  { key: 'flagged', label: 'Flagged', color: '#a98bf0' },
];

const CARD_ICONS = {
  donut: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21.2 15.9A10 10 0 1 1 8 2.8" /><path d="M22 12A10 10 0 0 0 12 2v10z" />
    </svg>
  ),
  check: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><path d="m9 11 3 3L22 4" />
    </svg>
  ),
  bars: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 3v18h18" /><path d="M7 16v-5M12 16V8M17 16v-8" />
    </svg>
  ),
  inbox: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 12h-6l-2 3h-4l-2-3H2" /><path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" />
    </svg>
  ),
};

const STAT_CARDS = [
  {
    key: 'todaySubmissions',
    label: 'Today Submissions',
    caption: 'Applications submitted today',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" />
      </svg>
    ),
    colorClass: 'blue',
  },
  {
    key: 'pendingKyc',
    label: 'Pending KYC',
    caption: 'Awaiting verification',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="4" width="20" height="16" rx="2" /><circle cx="8.5" cy="10" r="2" />
        <path d="M14 9h4M14 13h4M6 16h12" />
      </svg>
    ),
    colorClass: 'amber',
  },
  {
    key: 'approvedToday',
    label: 'Approved Today',
    caption: 'Approved applications today',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><path d="m9 11 3 3L22 4" />
      </svg>
    ),
    colorClass: 'green',
  },
  {
    key: 'rejectedToday',
    label: 'Rejected Today',
    caption: 'Rejected applications today',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" /><path d="m4.9 4.9 14.2 14.2" />
      </svg>
    ),
    colorClass: 'red',
  },
];

const SERVICE_PALETTE = [
  '#0b2d5b',
  '#0a3f7e',
  '#0f57a8',
  '#1a6fc4',
  '#2c8f92',
  '#149b6e',
  '#3e8f1f',
  '#57b531',
  '#86c95e',
];

function generateServiceTypeLegend(serviceTypes) {
  return serviceTypes.map((item, index) => ({
    label: item.service,
    count: item.count,
    color: SERVICE_PALETTE[index % SERVICE_PALETTE.length],
  }));
}

function FormsDonutChart({ data }) {
  const [hovered, setHovered] = useState(null);
  const total = data.reduce((sum, item) => sum + item.count, 0) || 1;
  const size = 300;
  const cx = size / 2;
  const cy = size / 2;
  const radius = 100;
  const strokeWidth = 52;
  const circumference = 2 * Math.PI * radius;
  let cumulative = 0;

  // The popup is anchored to the outer edge of each segment, expressed as a
  // percentage of the figure so it scales with the responsive donut.
  const anchorPct = ((radius + strokeWidth / 2) / size) * 100;

  const slices = data.map((item, index) => {
    const fraction = item.count / total;
    const start = cumulative;
    cumulative += fraction;
    const midAngleDeg = ((start + cumulative) / 2) * 360 - 90;
    const midRad = (midAngleDeg * Math.PI) / 180;
    return {
      ...item,
      // The dashboard feeds this chart { service, count }; accept a plain
      // `label` too so the popup always has a form name to show.
      label: item.label || item.service,
      index,
      color: SERVICE_PALETTE[index % SERVICE_PALETTE.length],
      dashLength: fraction * circumference,
      dashOffset: -start * circumference,
      tipX: 50 + anchorPct * Math.cos(midRad),
      tipY: 50 + anchorPct * Math.sin(midRad),
      tipSide: Math.cos(midRad) >= 0 ? 'right' : 'left',
    };
  });

  const active = hovered == null ? null : slices[hovered];

  return (
    <div className="pie-chart-figure">
      <svg viewBox={`0 0 ${size} ${size}`} width="240" height="240" style={{ display: 'block' }}>
        <g transform={`rotate(-90 ${cx} ${cy})`}>
          {slices.map((slice, index) => (
            <circle
              key={`${slice.index}-${index}`}
              cx={cx}
              cy={cy}
              r={radius}
              fill="none"
              stroke={slice.color}
              strokeWidth={hovered === index ? strokeWidth + 8 : strokeWidth}
              strokeDasharray={`${slice.dashLength} ${circumference - slice.dashLength}`}
              strokeDashoffset={slice.dashOffset}
              opacity={hovered == null || hovered === index ? 1 : 0.35}
              style={{ cursor: 'pointer', transition: 'opacity 0.18s ease, stroke-width 0.18s ease' }}
              role="img"
              aria-label={`${slice.label}: ${slice.count} forms`}
              onMouseEnter={() => setHovered(index)}
              onMouseLeave={() => setHovered(current => (current === index ? null : current))}
            />
          ))}
        </g>
      </svg>
      <div className="pie-chart-center-info">
        {active ? (
          <>
            <div className="pci-count">{active.count}</div>
            <div className="pci-label">{active.label}</div>
          </>
        ) : (
          <div className="pci-hint"></div>
        )}
      </div>
      {active && (
        <div
          className={`pie-chart-popup pie-chart-popup--${active.tipSide}`}
          style={{ left: `${active.tipX}%`, top: `${active.tipY}%` }}
        >
          <span className="pie-chart-popup-swatch" style={{ background: active.color }} />
          <div>
            <div className="pie-chart-popup-count">{active.count}</div>
            <div className="pie-chart-popup-label">{active.label}</div>
          </div>
        </div>
      )}
    </div>
  );
}

function TodayDistributionBarChart({ data }) {
  const [popup, setPopup] = useState(null);
  const figureRef = React.useRef(null);
  const max = Math.max(...data.map(f => Math.max(f.submitted, f.completed)), 0);

  const niceMax = max > 0 ? Math.ceil(max / 5) * 5 || 5 : 5;
  const tickCount = 5;
  const ticks = Array.from({ length: tickCount + 1 }, (_, i) => Math.round((niceMax / tickCount) * i));

  const handleClick = (index, which, event) => {
    const rect = figureRef.current.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    if (popup && popup.index === index && popup.which === which) {
      setPopup(null);
    } else {
      setPopup({ index, which, x, y });
    }
  };

  return (
    <div className="form-vchart-wrap">
      <div className="form-vchart-yaxis">
        {ticks.filter(t => t > 0).map((tick) => (
          <div
            key={tick}
            className="form-vchart-ytick"
            style={{ bottom: `${niceMax ? (tick / niceMax) * 100 : 0}%` }}
          >
            {tick}
          </div>
        ))}
      </div>
      <div className="form-vchart-body">
        <div className="form-vchart" ref={figureRef}>
          <div className="form-vchart-gridlines">
            {ticks.map((tick) => (
              <div
                key={tick}
                className={`form-vchart-gridline${tick === 0 ? ' baseline' : ''}`}
                style={{ bottom: `${(tick / niceMax) * 100}%` }}
              />
            ))}
          </div>
          {data.map((item, index) => {
            const subH = niceMax ? (item.submitted / niceMax) * 100 : 0;
            const comH = niceMax ? (item.completed / niceMax) * 100 : 0;
            return (
              <div className="form-vchart-col" key={item.id}>
                <div className="form-vchart-bars">
                  <div
                    className="form-vchart-bar completed clickable"
                    style={{ height: `${comH}%` }}
                    title={`Completed: ${item.completed}`}
                    onClick={event => handleClick(index, 'completed', event)}
                  />
                  <div
                    className="form-vchart-bar today clickable"
                    style={{ height: `${subH}%` }}
                    title={`Submitted: ${item.submitted}`}
                    onClick={event => handleClick(index, 'submitted', event)}
                  />
                </div>
              </div>
            );
          })}
          {popup && (
            <div className="pie-chart-popup" style={{ left: popup.x, top: popup.y }}>
              <span className="pie-chart-popup-swatch" style={{ background: popup.which === 'completed' ? 'var(--green)' : 'var(--blue)' }} />
              <div>
                <div className="pie-chart-popup-count">
                  {popup.which === 'completed' ? data[popup.index].completed : data[popup.index].submitted}
                </div>
                <div className="pie-chart-popup-label">
                  {popup.which === 'completed' ? 'Completed today' : 'Submitted today'} — {data[popup.index].label}
                </div>
              </div>
            </div>
          )}
        </div>
        <div className="form-vchart-xaxis">
          {data.map((item) => (
            <div className="form-vchart-xlabel" key={item.id}>{shortFormLabel(item.label)}</div>
          ))}
        </div>
      </div>
    </div>
  );
}

const STATUS_FILTERS = ['All', ...PENDING_STATUSES];

export default function AdminDashboardPage() {
  const { admin } = useAdminAuth();
  const [stats, setStats] = useState({});
  const [recentApplications, setRecentApplications] = useState([]);
  const [todayDistribution, setTodayDistribution] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [dataSource, setDataSource] = useState('');
  const [expandedComments, setExpandedComments] = useState({});
  const [dashboardSearch, setDashboardSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [now, setNow] = useState(new Date());
  const [lastUpdated, setLastUpdated] = useState(null);

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(t);
  }, []);

  const loadDashboard = useCallback(async ({ silent } = {}) => {
    if (silent) setRefreshing(true); else setLoading(true);

    try {
      const res = await getApplications({ limit: 200, sortBy: 'createdAt', sortOrder: 'desc' });
      const apps = (res.applications || []).map(normalizeApplication);
      setStats(deriveStatsFromApplications(apps));
      setTodayDistribution(deriveTodayDistribution(apps));
      setRecentApplications(apps);
      setDataSource('');
      setError('');
      setLastUpdated(new Date());
    } catch (err) {
      try {
        const { forms = [] } = await getAdminForms({ limit: 200 });
        const normalized = forms.map(normalizeForm);
        setStats(deriveStatsFromForms(forms));
        setTodayDistribution(deriveTodayDistribution(normalized));
        setRecentApplications(normalized);
        setDataSource('forms');
        setError('');
        setLastUpdated(new Date());
      } catch {
        setError(err.response?.data?.message || 'Failed to load dashboard data');
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { loadDashboard(); }, [loadDashboard]);

  const { byServiceType = [] } = stats;
  const formTotalData = byServiceType.map(form => ({ service: form.label, count: form.total }));
  const formCompletedData = byServiceType.map(form => ({ service: form.label, count: form.completed }));

  const renderFormPieCard = (title, subtitle, data, icon) => (
    <div className="dash-chart-card">
      <div className="dash-chart-card-head">
        <div className="dash-card-title">
          <span className="dash-card-icon">{icon}</span>
          <div>
            <h2>{title}</h2>
            <p>{subtitle}</p>
          </div>
        </div>
        <div className="dash-card-total">
          <strong><AnimatedNumber value={data.reduce((sum, item) => sum + item.count, 0)} /></strong>
          <span>forms</span>
        </div>
      </div>
      <div className="pie-chart-wrap">
        <FormsDonutChart data={data} />
        <div className="pie-legend">
          {generateServiceTypeLegend(data).map((item, index) => (
            <div className="pie-legend-item" key={`${item.label}-${index}`}>
              <span className="pie-legend-swatch" style={{ background: item.color }} />
              <span>{item.label}: <strong>{item.count}</strong></span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const matchesSearch = (app, query) => {
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return (
      String(app.referenceNumber || '').toLowerCase().includes(q)
      || String(app.nic || '').toLowerCase().includes(q)
      || String(app.phone || '').toLowerCase().includes(q)
      || String(app.name || '').toLowerCase().includes(q)
    );
  };

  const handleToggleExpanded = (id) => {
    setExpandedComments(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // The dashboard history lists the newest applications still awaiting action —
  // everything already approved, confirmed, rejected or flagged is handled and
  // does not need to sit in front of the team. Capped at RECENT_LIMIT rows.
  const pendingApplications = [...recentApplications]
    .filter(app => PENDING_STATUSES.includes(String(app.status || 'pending').toLowerCase()))
    .sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt))
    .slice(0, RECENT_LIMIT);

  const filteredApplications = pendingApplications
    .filter(app => matchesSearch(app, dashboardSearch))
    .filter(app => statusFilter === 'All' || app.status === statusFilter);

  const kpiSeries = useMemo(
    () => Object.fromEntries(Object.entries(KPI_TRENDS).map(([key, t]) => [key, dailySeries(recentApplications, t.pick)])),
    [recentApplications]
  );

  // Oldest application still waiting for action (all of them, not just the 15 shown).
  const oldestPendingDays = useMemo(() => {
    const times = recentApplications
      .filter((app) => PENDING_STATUSES.includes(statusOf(app)) && app.submittedAt)
      .map((app) => startOfDay(app.submittedAt));
    if (!times.length) return null;
    return Math.round((startOfDay(Date.now()) - Math.min(...times)) / DAY_MS);
  }, [recentApplications]);

  const pipeline = useMemo(() => {
    const counts = {};
    recentApplications.forEach((app) => { counts[statusOf(app)] = (counts[statusOf(app)] || 0) + 1; });
    return PIPELINE.map((stage) => ({ ...stage, count: counts[stage.key] || 0 }));
  }, [recentApplications]);
  const pipelineTotal = pipeline.reduce((sum, stage) => sum + stage.count, 0);
  const awaitingAction = pipeline.filter((st) => PENDING_STATUSES.includes(st.key)).reduce((sum, st) => sum + st.count, 0);

  const todayTotals = todayDistribution.reduce(
    (acc, item) => ({ submitted: acc.submitted + item.submitted, completed: acc.completed + item.completed }),
    { submitted: 0, completed: 0 }
  );

  const kpiBadge = (key) => {
    if (key === 'pendingKyc') {
      if (oldestPendingDays == null) return { text: 'Queue clear', tone: 'good' };
      return { text: oldestPendingDays === 0 ? 'Oldest: today' : `Oldest: ${oldestPendingDays}d`, tone: oldestPendingDays > 2 ? 'warn' : 'neutral' };
    }
    const series = kpiSeries[key] || [];
    const delta = (series[TREND_DAYS - 1] || 0) - (series[TREND_DAYS - 2] || 0);
    if (delta === 0) return { text: 'Same as yesterday', tone: 'neutral' };
    return { text: `${delta > 0 ? '▲' : '▼'} ${Math.abs(delta)} vs yesterday`, tone: delta > 0 ? 'up' : 'down' };
  };

  const greeting = (() => {
    const h = now.getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  })();

  return (
    <div className="dash-page">
      {/* ── Hero header ── */}
      <div className="dash-hero">
        <div className="dash-hero-deco" aria-hidden="true">
          <span className="dash-hero-orb" />
          <span className="dash-hero-slash" />
          <span className="dash-hero-grid" />
        </div>

        <div className="dash-hero-main">
          <span className="dash-hero-eyebrow">
            <span className="dash-live-dot" /> Operations Dashboard
          </span>
          <h1>{greeting}{admin?.name ? `, ${admin.name.split(' ')[0]}` : ''}</h1>
          <p>
            {loading
              ? 'Gathering today\'s activity…'
              : awaitingAction > 0
                ? <><strong>{awaitingAction}</strong> application{awaitingAction === 1 ? ' is' : 's are'} waiting for action · <strong>{stats.todaySubmissions ?? 0}</strong> submitted today</>
                : <>All caught up — no applications are waiting · <strong>{stats.todaySubmissions ?? 0}</strong> submitted today</>}
          </p>

          <div className="dash-pipeline">
            <div className="dash-pipeline-head">
              <span>Application pipeline</span>
              <span>Latest {pipelineTotal} applications</span>
            </div>
            <div className="dash-pipeline-bar" role="img" aria-label={pipeline.map((st) => `${st.label}: ${st.count}`).join(', ')}>
              {pipelineTotal === 0
                ? <span className="dash-pipeline-empty" />
                : pipeline.filter((st) => st.count > 0).map((st) => (
                  <span key={st.key} style={{ flexGrow: st.count, background: st.color }} title={`${st.label}: ${st.count}`} />
                ))}
            </div>
            <div className="dash-pipeline-legend">
              {pipeline.map((st) => (
                <span key={st.key} className={st.count === 0 ? 'is-zero' : ''}>
                  <i style={{ background: st.color }} />{st.label}<b>{st.count}</b>
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="dash-hero-side">
          <div className="dash-hero-clock">
            <span className="dash-hero-time">{now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}</span>
            <span className="dash-hero-date">{now.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</span>
          </div>
          <button type="button" className="dash-refresh-btn" onClick={() => loadDashboard({ silent: true })} disabled={refreshing}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={refreshing ? 'dash-spin' : ''}>
              <path d="M21 12a9 9 0 1 1-2.64-6.36" /><polyline points="21 3 21 9 15 9" />
            </svg>
            {refreshing ? 'Refreshing…' : 'Refresh data'}
          </button>
          <span className="dash-hero-updated">
            {lastUpdated ? `Updated ${lastUpdated.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}` : 'Loading…'}
          </span>
        </div>
      </div>

      {error && (
        <div className="admin-error-banner" role="alert">
          {error}
        </div>
      )}

      {dataSource === 'forms' && (
        <div className="admin-note-banner" role="status">
          Showing data from the forms API — dashboard stats endpoint is currently unavailable.
        </div>
      )}

      {/* ── Summary Cards ── */}
      <div className="dash-stat-grid">
        {STAT_CARDS.map((card, idx) => {
          const badge = kpiBadge(card.key);
          return (
            <div className={`dash-stat-card ${card.colorClass}`} key={card.key} style={{ '--i': idx }}>
              <div className="dash-stat-top">
                <div className={`dash-stat-icon ${card.colorClass}`}>
                  {card.icon}
                </div>
                {!loading && <span className={`dash-stat-badge ${badge.tone}`}>{badge.text}</span>}
              </div>
              <div className="dash-stat-label">{card.label}</div>
              <div className="dash-stat-value">
                {loading ? <span className="dash-skeleton dash-skeleton-num" /> : <AnimatedNumber value={stats[card.key] ?? 0} />}
              </div>
              <div className="dash-stat-trend">{card.caption}</div>
              <div className="dash-stat-spark">
                {!loading && (
                  <Sparkline
                    data={kpiSeries[card.key]}
                    color={KPI_TRENDS[card.key].color}
                    label={`${card.label}, last ${TREND_DAYS} days: ${kpiSeries[card.key].join(', ')}`}
                  />
                )}
                <span>Last {TREND_DAYS} days</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Operation Pie Charts ── */}
      <section className="dash-chart-grid">
        {renderFormPieCard('Total Forms by Type', '9 tracked service forms', formTotalData, CARD_ICONS.donut)}
        {renderFormPieCard('Completed Forms by Type', 'Approved or confirmed, per form', formCompletedData, CARD_ICONS.check)}
      </section>

      {/* ── Today Application Distribution ── */}
      <section className="dash-section">
        <div className="dash-chart-card">
          <div className="dash-chart-card-head">
            <div className="dash-card-title">
              <span className="dash-card-icon">{CARD_ICONS.bars}</span>
              <div>
                <h2>Today's Application Distribution</h2>
                <p>Submitted vs. completed, per service form</p>
              </div>
            </div>
            <div className="dash-today-chips">
              <span className="dash-today-chip submitted">
                <span className="legend-dot today" /> Submitted <strong><AnimatedNumber value={todayTotals.submitted} /></strong>
              </span>
              <span className="dash-today-chip completed">
                <span className="legend-dot completed" /> Completed <strong><AnimatedNumber value={todayTotals.completed} /></strong>
              </span>
            </div>
          </div>
          <TodayDistributionBarChart data={todayDistribution} />
        </div>
      </section>

      {/* ── Recent Applications ── */}
      <section className="dash-section">
        <div className="dash-table-card">
          <div className="dash-table-toolbar">
            <div className="dash-card-title">
              <span className="dash-card-icon">{CARD_ICONS.inbox}</span>
              <div>
                <h2>
                  Recent Application History
                  <span className="dash-count-pill">{filteredApplications.length}</span>
                </h2>
                <p>Newest applications still awaiting action</p>
              </div>
            </div>
            <div className="dash-table-controls">
              <div className="admin-search dash-search">
                <span className="admin-search-icon">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                  </svg>
                </span>
                <input
                  type="search"
                  value={dashboardSearch}
                  onChange={(e) => setDashboardSearch(e.target.value)}
                  placeholder="Search reference, NIC, phone or name"
                />
              </div>
              <select className="admin-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                {STATUS_FILTERS.map((s) => (
                  <option key={s} value={s}>{s === 'All' ? 'All Statuses' : statusLabel(s)}</option>
                ))}
              </select>
            </div>
          </div>

          {loading ? (
            <div className="dash-table-skeleton">
              {Array.from({ length: 5 }).map((_, i) => <div className="dash-skeleton dash-skeleton-row" key={i} />)}
            </div>
          ) : filteredApplications.length === 0 ? (
            <div className="dash-empty">
              <span className="dash-empty-icon">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><path d="m9 11 3 3L22 4" />
                </svg>
              </span>
              <h3>{dashboardSearch || statusFilter !== 'All' ? 'No matches' : 'Inbox zero'}</h3>
              <p>{dashboardSearch || statusFilter !== 'All' ? 'No pending applications match your search or filter.' : 'Every application has been actioned. Nice work!'}</p>
            </div>
          ) : (
            <div className="dash-table-wrap">
              <table className="admin-table admin-table-striped dash-table">
                <thead>
                  <tr>
                    <th>Reference</th>
                    <th>Applicant</th>
                    <th>Service</th>
                    <th>Status</th>
                    <th>Submitted</th>
                    <th>Phone</th>
                    <th>Address</th>
                    <th>Comments</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredApplications.map(app => {
                    const comment = app.notes || '';
                    const isExpanded = expandedComments[app.id];
                    const isLong = comment.length > 90;
                    const visibleText = isExpanded ? comment : comment.slice(0, 90);
                    const actioner = app.actionedBy || null;
                    const actionerName = actioner
                      ? (actioner.name || actioner.email || actioner._id || '')
                      : '';

                    return (
                      <tr key={app.id}>
                        <td>
                          <span className="dash-ref">{app.referenceNumber}</span>
                        </td>
                        <td>
                          <div className="dash-applicant-cell">
                            <div className="dash-avatar">{initials(app.name)}</div>
                            <div>
                              <div className="dash-applicant-name">{app.name}</div>
                              <div className="dash-applicant-email">{app.email}</div>
                            </div>
                          </div>
                        </td>
                        <td><span className="dash-service-tag">{serviceLabel(app.serviceType)}</span></td>
                        <td>
                          <span className={`admin-badge ${statusBadgeClass(app.status)}`}>
                            {statusLabel(app.status)}
                          </span>
                        </td>
                        <td>
                          <div className="dash-date">
                            <span>{formatDate(app.submittedAt)}</span>
                            <small>{timeAgo(app.submittedAt)}</small>
                          </div>
                        </td>
                        <td className="dash-muted-cell">{app.phone || '—'}</td>
                        <td className="dash-muted-cell"><span className="dash-address" title={app.address}>{app.address || '—'}</span></td>
                        <td className="dash-comment-cell">
                          {comment ? (
                            <>
                              {visibleText}
                              {isLong && !isExpanded ? '...' : ''}
                              {isLong && (
                                <button type="button" className="dash-more-btn" onClick={() => handleToggleExpanded(app.id)}>
                                  {isExpanded ? 'less' : 'more'}
                                </button>
                              )}
                            </>
                          ) : (
                            <span style={{ color: 'var(--muted)' }}>No comment</span>
                          )}
                          {actionerName && (
                            <div style={{ fontSize: '0.74rem', color: 'var(--muted)', marginTop: '0.25rem' }}>
                              — {actionerName}
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
