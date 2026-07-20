import React from 'react';
import {
  DUMMY_SUMMARY,
  DUMMY_RECENT_ACTIVITY,
  DUMMY_APPLICATIONS,
} from '../data/dummyData';

const STAT_CARDS = [
  {
    key: 'totalApplications',
    label: 'Total Applications',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" />
      </svg>
    ),
    colorClass: 'blue',
    trendKey: 'totalApplications',
  },
  {
    key: 'pendingKyc',
    label: 'Pending KYC',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="4" width="20" height="16" rx="2" /><circle cx="8.5" cy="10" r="2" />
        <path d="M14 9h4M14 13h4M6 16h12" />
      </svg>
    ),
    colorClass: 'amber',
    trendKey: 'pendingKyc',
  },
  {
    key: 'todaysAppointments',
    label: "Today's Appointments",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" />
      </svg>
    ),
    colorClass: 'green',
    trendKey: 'todaysAppointments',
  },
  {
    key: 'approvedToday',
    label: 'Approved Today',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><path d="m9 11 3 3L22 4" />
      </svg>
    ),
    colorClass: 'green',
    trendKey: 'approvedToday',
  },
];

const SERVICE_LABELS = {
  'new-connection':   'New Connection',
  'reconnection':     'Reconnection',
  'termination':      'Termination',
  'package-migration':'Package Migration',
  'ownership-change': 'Ownership Change',
  'location-change':  'Location Change',
  'refund-request':   'Refund Request',
};

const STATUS_COLORS = {
  pending:  'pending',
  approved: 'approved',
  rejected: 'rejected',
  flagged:  'flagged',
};

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric',
  });
}

export default function AdminDashboardPage({ setActivePage }) {
  const recentApps = DUMMY_APPLICATIONS.slice(0, 5);

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

      {/* ── Content Grid ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '1.25rem' }}>

        {/* Recent Applications */}
        <section>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <h2 style={{ fontSize: '1rem', fontFamily: 'var(--font-head)', color: 'var(--navy)', margin: 0 }}>
              Recent Applications
            </h2>
            <button
              className="admin-btn ghost"
              onClick={() => setActivePage('applications')}
            >
              View All →
            </button>
          </div>
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Reference</th>
                  <th>Name</th>
                  <th>Service</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {recentApps.map(app => (
                  <tr key={app.id}>
                    <td style={{ fontFamily: 'monospace', fontSize: '0.8rem', color: 'var(--blue)' }}>
                      {app.referenceNumber}
                    </td>
                    <td>{app.name}</td>
                    <td style={{ color: 'var(--muted)', fontSize: '0.82rem' }}>
                      {SERVICE_LABELS[app.serviceType] || app.serviceType}
                    </td>
                    <td>
                      <span className={`admin-badge ${STATUS_COLORS[app.status]}`}>
                        {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Recent Activity Feed */}
        <section>
          <h2 style={{ fontSize: '1rem', fontFamily: 'var(--font-head)', color: 'var(--navy)', marginBottom: '0.75rem' }}>
            Recent Activity
          </h2>
          <div className="admin-table-wrap" style={{ padding: '0.25rem 1rem' }}>
            <div className="activity-feed">
              {DUMMY_RECENT_ACTIVITY.map(item => (
                <div key={item.id} className="activity-item">
                  <div className={`activity-dot ${item.type}`} />
                  <span className="activity-msg">{item.message}</span>
                  <span className="activity-time">{item.time}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>

      {/* ── Quick Actions ── */}
      <section style={{ marginTop: '1.5rem' }}>
        <h2 style={{ fontSize: '1rem', fontFamily: 'var(--font-head)', color: 'var(--navy)', marginBottom: '0.75rem' }}>
          Quick Actions
        </h2>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          {[
            { label: '📋 Review KYC Queue', page: 'kyc' },
            { label: '📅 Today\'s Appointments', page: 'appointments' },
            { label: '📊 View Analytics', page: 'analytics' },
            { label: '📄 All Applications', page: 'applications' },
          ].map(action => (
            <button
              key={action.page}
              className="admin-btn ghost"
              style={{ padding: '0.65rem 1.25rem', fontSize: '0.88rem' }}
              onClick={() => setActivePage(action.page)}
            >
              {action.label}
            </button>
          ))}
        </div>
      </section>
    </>
  );
}
