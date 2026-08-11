import React, { useState, useRef } from 'react';
import {
  DUMMY_SUMMARY,
  DUMMY_FORM_STATS,
  DUMMY_APPLICATIONS,
} from '../data/dummyData';

const SHORT_FORM_LABELS = {
  'Customer Request Acceptance': 'Cust. Request',
};

function shortFormLabel(label) {
  return SHORT_FORM_LABELS[label] || label;
}

const STAT_CARDS = [
  {
    key: 'totalForms',
    label: 'Total Forms',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" />
      </svg>
    ),
    colorClass: 'blue',
    trendKey: 'totalForms',
  },
  {
    key: 'completedForms',
    label: 'Completed Forms',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><path d="m9 11 3 3L22 4" />
      </svg>
    ),
    colorClass: 'green',
    trendKey: 'completedForms',
  },
  {
    key: 'pendingForms',
    label: 'Pending Forms',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="4" width="20" height="16" rx="2" /><circle cx="8.5" cy="10" r="2" />
        <path d="M14 9h4M14 13h4M6 16h12" />
      </svg>
    ),
    colorClass: 'amber',
    trendKey: 'pendingForms',
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
  const figureRef = useRef(null);
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
              key={slice.label}
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
            <div className="pie-chart-popup-label">{shortFormLabel(slices[popup.index].label)}</div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminDashboardPage({ commentMap = {}, onSaveComment }) {
  const formTotalData = DUMMY_FORM_STATS.map(form => ({ service: form.label, count: form.total }));
  const formCompletedData = DUMMY_FORM_STATS.map(form => ({ service: form.label, count: form.completed }));
  const renderFormPieCard = (title, data) => (
    <div className="pie-card">
      <h2>{title}</h2>
      <div className="pie-chart-wrap">
        <FormsDonutChart data={data} />
        <div className="pie-legend">
          {generateServiceTypeLegend(data).map(item => (
            <div className="pie-legend-item" key={item.label}>
              <span className="pie-legend-swatch" style={{ background: item.color }} />
              <span>{item.label}: <strong>{item.count}</strong></span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const [expandedComments, setExpandedComments] = useState({});
  const [dashboardSearch, setDashboardSearch] = useState('');

  const matchesSearch = (app, query) => {
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return (
      app.referenceNumber.toLowerCase().includes(q)
      || app.nic.toLowerCase().includes(q)
      || app.phone.toLowerCase().includes(q)
      || app.name.toLowerCase().includes(q)
    );
  };

  const handleToggleExpanded = (id) => {
    setExpandedComments(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const recentApplications = [...DUMMY_APPLICATIONS]
    .sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));

  const filteredApplications = recentApplications.filter(app => matchesSearch(app, dashboardSearch));

  return (
    <>
      <div className="admin-page-header">
        <h1 className="admin-page-title">Operations Dashboard</h1>
        <p className="admin-page-subtitle">
          Overview of all service applications and field operations
        </p>
      </div>

      {/* ── Summary Cards ── */}
      <div className="admin-summary-grid">
        {STAT_CARDS.map(card => (
          <div className="admin-stat-card" key={card.key}>
            <div className={`admin-stat-icon ${card.colorClass}`}>
              {card.icon}
            </div>
            <div>
              <div className="admin-stat-label">{card.label}</div>
              <div className="admin-stat-value">{DUMMY_SUMMARY[card.key]}</div>
              <div className={`admin-stat-trend${DUMMY_SUMMARY.trends[card.trendKey]?.startsWith('-') ? ' down' : ''}`}>
                {DUMMY_SUMMARY.trends[card.trendKey]} vs yesterday
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Operation Pie Charts ── */}
      <section className="admin-pie-grid">
        {renderFormPieCard('Total Forms by Type (9 forms)', formTotalData)}
        {renderFormPieCard('Completed Forms by Type (9 forms)', formCompletedData)}
      </section>

      {/* ── Form Breakdown Charts ── */}
      <section>
        <h2 style={{ fontSize: '1rem', fontFamily: 'var(--font-head)', color: 'var(--navy)', marginBottom: '1rem' }}>
          Forms Breakdown
        </h2>
        <div className="form-chart-card">
          <div className="form-chart-legend-bar">
            <span><span className="legend-dot completed" /> Completed</span>
            <span><span className="legend-dot total" /> Total</span>
          </div>
          <div className="form-vchart">
            {DUMMY_FORM_STATS.map(form => {
              const maxTotal = Math.max(...DUMMY_FORM_STATS.map(f => f.total));
              const totalH = (form.total / maxTotal) * 100;
              const completedH = (form.completed / form.total) * totalH;
              return (
                <div className="form-vchart-col" key={form.id}>
                  <div className="form-vchart-bars">
                    <div className="form-vchart-bar completed" style={{ height: `${completedH}%` }} />
                    <div className="form-vchart-bar total" style={{ height: `${totalH}%` }} />
                  </div>
                  <div className="form-vchart-label">{form.label.replace('Customer Request Acceptance', 'Cust. Request')}</div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section style={{ marginTop: '1.5rem' }}>
        <h2 style={{ fontSize: '1rem', fontFamily: 'var(--font-head)', color: 'var(--navy)', marginBottom: '1rem' }}>
          Recent application history
        </h2>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1rem' }}>
          <input
            type="search"
            value={dashboardSearch}
            onChange={(e) => setDashboardSearch(e.target.value)}
            placeholder="Search reference, NIC, phone or name"
            style={{
              flex: '1 1 320px',
              minWidth: 240,
              padding: '0.75rem 1rem',
              border: '1px solid var(--line)',
              borderRadius: '12px',
              background: 'var(--surface)',
              color: 'var(--text)',
            }}
          />
        </div>
        <div className="admin-table-wrap" style={{ overflowX: 'auto' }}>
          <table className="admin-table" style={{ minWidth: 1120 }}>
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
                const comment = commentMap[app.id] || '';
                const isExpanded = expandedComments[app.id];
                const isLong = comment.length > 90;
                const visibleText = isExpanded ? comment : comment.slice(0, 90);

                return (
                  <React.Fragment key={app.id}>
                    <tr>
                      <td>
                        <span style={{ fontFamily: 'monospace', fontSize: '0.82rem', color: 'var(--blue)' }}>
                          {app.referenceNumber}
                        </span>
                      </td>
                      <td>
                        <div style={{ fontWeight: 600, fontSize: '0.88rem' }}>{app.name}</div>
                        <div style={{ fontSize: '0.76rem', color: 'var(--muted)' }}>{app.email}</div>
                      </td>
                      <td style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>{app.serviceType.replace(/-/g, ' ')}</td>
                      <td>
                        <span className={`admin-badge ${app.status}`}>
                          {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                        </span>
                      </td>
                      <td style={{ fontSize: '0.82rem', color: 'var(--muted)' }}>{new Date(app.submittedAt).toLocaleString('en-GB', {
                        day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false,
                      })}</td>
                      <td style={{ fontSize: '0.82rem', color: 'var(--muted)' }}>{app.phone}</td>
                      <td style={{ fontSize: '0.82rem', color: 'var(--muted)' }}>{app.address}</td>
                      <td style={{ fontSize: '0.82rem', color: 'var(--muted)', whiteSpace: 'pre-wrap', wordBreak: 'break-word', maxWidth: '24rem' }}>
                        {comment ? (
                          <>
                            {visibleText}
                            {isLong && !isExpanded ? '...' : ''}
                            {isLong && (
                              <button
                                type="button"
                                onClick={() => handleToggleExpanded(app.id)}
                                style={{
                                  border: 'none',
                                  background: 'transparent',
                                  color: 'var(--blue)',
                                  cursor: 'pointer',
                                  marginLeft: 4,
                                  fontSize: '0.78rem',
                                  fontWeight: 600,
                                }}
                              >
                                {isExpanded ? 'less' : 'more'}
                              </button>
                            )}
                          </>
                        ) : (
                          <span style={{ color: 'var(--muted)' }}>No comment</span>
                        )}
                      </td>
                    </tr>
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}
