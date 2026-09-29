import React, { useCallback, useEffect, useState } from 'react';
import { getApplications, getAdminForms } from '../services/adminService';
import { useAdminAuth } from '../context/AdminAuthContext';
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

function shortFormLabel(label) {
  return SHORT_FORM_LABELS[label] || label;
}

function initials(name) {
  if (!name) return '?';
  return name.split(' ').filter(Boolean).map((n) => n[0]).slice(0, 2).join('').toUpperCase();
}

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
  const [selected, setSelected] = useState(null);
  const [popup, setPopup] = useState(null);
  const figureRef = React.useRef(null);
  const total = data.reduce((sum, item) => sum + item.count, 0) || 1;
  const size = 300;
  const cx = size / 2;
  const cy = size / 2;
  const radius = 100;
  const strokeWidth = 52;
  const circumference = 2 * Math.PI * radius;
  let cumulative = 0;

  const slices = data.map((item, index) => {
    const fraction = item.count / total;
    const start = cumulative;
    cumulative += fraction;
    const midAngleDeg = ((start + cumulative) / 2) * 360 - 90;
    return {
      ...item,
      index,
      color: SERVICE_PALETTE[index % SERVICE_PALETTE.length],
      dashLength: fraction * circumference,
      dashOffset: -start * circumference,
      midRad: (midAngleDeg * Math.PI) / 180,
    };
  });

  const handleClick = (index, event) => {
    const rect = figureRef.current.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    if (selected === index) {
      setSelected(null);
      setPopup(null);
    } else {
      setSelected(index);
      setPopup({ index, x, y });
    }
  };

  return (
    <div className="pie-chart-figure" ref={figureRef}>
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
              strokeWidth={strokeWidth}
              strokeDasharray={`${slice.dashLength} ${circumference - slice.dashLength}`}
              strokeDashoffset={slice.dashOffset}
              opacity={selected == null || selected === index ? 1 : 0.3}
              style={{ cursor: 'pointer' }}
              title={`${slice.label}: ${slice.count}`}
              onClick={event => handleClick(index, event)}
            />
          ))}
        </g>
      </svg>
      <div className="pie-chart-center-info">
        <div className="pci-hint">Click a segment</div>
      </div>
      {popup && (
        <div className="pie-chart-popup" style={{ left: popup.x, top: popup.y }}>
          <span className="pie-chart-popup-swatch" style={{ background: slices[popup.index].color }} />
          <div>
            <div className="pie-chart-popup-count">{slices[popup.index].count}</div>
            <div className="pie-chart-popup-label">{slices[popup.index].label}</div>
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

const STATUS_FILTERS = ['All', 'pending', 'approved', 'rejected', 'flagged'];

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
      setRecentApplications(apps.slice(0, 15));
      setDataSource('');
      setError('');
    } catch (err) {
      try {
        const { forms = [] } = await getAdminForms({ limit: 200 });
        const normalized = forms.map(normalizeForm);
        setStats(deriveStatsFromForms(forms));
        setTodayDistribution(deriveTodayDistribution(normalized));
        setRecentApplications(normalized.slice(0, 15));
        setDataSource('forms');
        setError('');
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

  const renderFormPieCard = (title, subtitle, data) => (
    <div className="dash-chart-card">
      <div className="dash-chart-card-head">
        <div>
          <h2>{title}</h2>
          <p>{subtitle}</p>
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

  const recentApplicationsSorted = [...recentApplications]
    .sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));

  const filteredApplications = recentApplicationsSorted
    .filter(app => matchesSearch(app, dashboardSearch))
    .filter(app => statusFilter === 'All' || app.status === statusFilter);

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
        <div className="dash-hero-text">
          <span className="dash-hero-eyebrow">Operations Dashboard</span>
          <h1>{greeting}{admin?.name ? `, ${admin.name.split(' ')[0]}` : ''}</h1>
          <p>Here's what's happening across service applications and field operations today.</p>
        </div>
        <div className="dash-hero-side">
          <div className="dash-hero-clock">
            <span className="dash-hero-time">{now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}</span>
            <span className="dash-hero-date">{now.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })}</span>
          </div>
          <button type="button" className="dash-refresh-btn" onClick={() => loadDashboard({ silent: true })} disabled={refreshing}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={refreshing ? 'dash-spin' : ''}>
              <path d="M21 12a9 9 0 1 1-2.64-6.36" /><polyline points="21 3 21 9 15 9" />
            </svg>
            {refreshing ? 'Refreshing…' : 'Refresh'}
          </button>
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
        {STAT_CARDS.map(card => (
          <div className="dash-stat-card" key={card.key}>
            <div className={`dash-stat-icon ${card.colorClass}`}>
              {card.icon}
            </div>
            <div className="dash-stat-body">
              <div className="dash-stat-label">{card.label}</div>
              <div className="dash-stat-value">
                {loading ? <span className="dash-skeleton dash-skeleton-num" /> : stats[card.key] ?? 0}
              </div>
              <div className="dash-stat-trend">{card.caption}</div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Operation Pie Charts ── */}
      <section className="dash-chart-grid">
        {renderFormPieCard('Total Forms by Type', '9 tracked service forms', formTotalData)}
        {renderFormPieCard('Completed Forms by Type', 'Finished vs. in-flight', formCompletedData)}
      </section>

      {/* ── Today Application Distribution ── */}
      <section className="dash-section">
        <div className="dash-chart-card">
          <div className="dash-chart-card-head">
            <div>
              <h2>Today's Application Distribution</h2>
              <p>Submitted vs. completed, per service form</p>
            </div>
            <div className="dash-chart-legend-bar">
              <span><span className="legend-dot completed" /> Completed</span>
              <span><span className="legend-dot today" /> Submitted</span>
            </div>
          </div>
          <TodayDistributionBarChart data={todayDistribution} />
        </div>
      </section>

      {/* ── Recent Applications ── */}
      <section className="dash-section">
        <div className="dash-table-card">
          <div className="dash-table-toolbar">
            <div>
              <h2>Recent Application History</h2>
              <p>Latest {filteredApplications.length} of {recentApplications.length} applications</p>
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
            <div className="admin-empty">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
              </svg>
              <p>No recent applications found.</p>
            </div>
          ) : (
            <div className="dash-table-wrap">
              <table className="admin-table dash-table">
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
                        <td style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>{serviceLabel(app.serviceType)}</td>
                        <td>
                          <span className={`admin-badge ${statusBadgeClass(app.status)}`}>
                            {statusLabel(app.status)}
                          </span>
                        </td>
                        <td style={{ fontSize: '0.82rem', color: 'var(--muted)' }}>{formatDate(app.submittedAt)}</td>
                        <td style={{ fontSize: '0.82rem', color: 'var(--muted)' }}>{app.phone}</td>
                        <td style={{ fontSize: '0.82rem', color: 'var(--muted)' }}>{app.address}</td>
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
