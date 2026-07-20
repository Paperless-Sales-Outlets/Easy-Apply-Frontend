import React, { useState, useMemo } from 'react';
import { DUMMY_APPLICATIONS } from '../data/dummyData';

const SERVICE_LABELS = {
  'new-connection':    'New Connection',
  'reconnection':      'Reconnection',
  'termination':       'Termination',
  'package-migration': 'Package Migration',
  'ownership-change':  'Ownership Change',
  'location-change':   'Location Change',
  'refund-request':    'Refund Request',
  'customer-request':  'Customer Request',
};

const ALL_STATUSES = ['pending', 'approved', 'rejected', 'flagged'];

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric',
  });
}

export default function ApplicationsListPage() {
  const [search, setSearch]       = useState('');
  const [statusFilter, setStatus] = useState('');
  const [serviceFilter, setService] = useState('');
  const [apps, setApps]           = useState(DUMMY_APPLICATIONS);

  const filtered = useMemo(() => {
    return apps.filter(app => {
      const q = search.toLowerCase();
      const matchSearch = !q ||
        app.referenceNumber.toLowerCase().includes(q) ||
        app.name.toLowerCase().includes(q) ||
        app.nic.toLowerCase().includes(q);
      const matchStatus  = !statusFilter  || app.status === statusFilter;
      const matchService = !serviceFilter || app.serviceType === serviceFilter;
      return matchSearch && matchStatus && matchService;
    });
  }, [apps, search, statusFilter, serviceFilter]);

  const handleStatusChange = (id, newStatus) => {
    setApps(prev => prev.map(a => a.id === id ? { ...a, status: newStatus } : a));
  };

  return (
    <>
      <div className="admin-page-header">
        <h1 className="admin-page-title">Applications</h1>
        <p className="admin-page-subtitle">
          Manage and review all submitted service applications
        </p>
      </div>

      {/* ── Filters ── */}
      <div className="admin-filters">
        <div className="admin-search">
          <svg className="admin-search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
          </svg>
          <input
            type="text"
            placeholder="Search by reference, name, or NIC…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            aria-label="Search applications"
          />
        </div>

        <select
          className="admin-select"
          value={statusFilter}
          onChange={e => setStatus(e.target.value)}
          aria-label="Filter by status"
        >
          <option value="">All Statuses</option>
          {ALL_STATUSES.map(s => (
            <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
          ))}
        </select>

        <select
          className="admin-select"
          value={serviceFilter}
          onChange={e => setService(e.target.value)}
          aria-label="Filter by service type"
        >
          <option value="">All Services</option>
          {Object.entries(SERVICE_LABELS).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </select>

        <span style={{ fontSize: '0.82rem', color: 'var(--muted)', marginLeft: 'auto' }}>
          {filtered.length} result{filtered.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* ── Table ── */}
      <div className="admin-table-wrap">
        {filtered.length === 0 ? (
          <div className="admin-empty">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
            </svg>
            <p>No applications match the current filters.</p>
          </div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Reference</th>
                <th>Applicant</th>
                <th>NIC</th>
                <th>Service Type</th>
                <th>Submitted</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(app => (
                <tr key={app.id}>
                  <td>
                    <span style={{ fontFamily: 'monospace', fontSize: '0.8rem', color: 'var(--blue)' }}>
                      {app.referenceNumber}
                    </span>
                  </td>
                  <td>
                    <div style={{ fontWeight: 600, fontSize: '0.88rem' }}>{app.name}</div>
                    <div style={{ fontSize: '0.76rem', color: 'var(--muted)' }}>{app.email}</div>
                  </td>
                  <td style={{ fontSize: '0.82rem', color: 'var(--muted)' }}>{app.nic}</td>
                  <td style={{ fontSize: '0.82rem' }}>
                    {SERVICE_LABELS[app.serviceType] || app.serviceType}
                  </td>
                  <td style={{ fontSize: '0.82rem', color: 'var(--muted)' }}>
                    {formatDate(app.submittedAt)}
                  </td>
                  <td>
                    <span className={`admin-badge ${app.status}`}>
                      {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                    </span>
                  </td>
                  <td>
                    <div className="admin-action-group">
                      {app.status !== 'approved' && (
                        <button
                          className="admin-btn success"
                          onClick={() => handleStatusChange(app.id, 'approved')}
                          title="Approve"
                        >
                          ✓ Approve
                        </button>
                      )}
                      {app.status !== 'rejected' && (
                        <button
                          className="admin-btn danger"
                          onClick={() => handleStatusChange(app.id, 'rejected')}
                          title="Reject"
                        >
                          ✕ Reject
                        </button>
                      )}
                      {app.status !== 'flagged' && (
                        <button
                          className="admin-btn warning"
                          onClick={() => handleStatusChange(app.id, 'flagged')}
                          title="Flag"
                        >
                          ⚑ Flag
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}
