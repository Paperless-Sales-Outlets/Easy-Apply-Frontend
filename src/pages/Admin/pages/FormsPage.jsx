import React from 'react';
import { DUMMY_FORM_WEEKLY, DUMMY_APPLICATIONS } from '../data/dummyData';

const MAX_BAR = Math.max(
  ...DUMMY_FORM_WEEKLY.flatMap(f => f.daily.map(d => d.submitted)),
  1
);

const SERVICE_TO_FORM = {
  'new-connection': 'new-connection',
  'reconnection': 'reconnection',
  'location-change': 'relocation',
  'termination': 'termination',
  'ownership-change': 'transfer',
  'package-migration': 'package-migration',
  'service-vacation': 'service-vacation',
  'refund-request': 'refund-request',
  'customer-request-acceptance': 'customer-request-acceptance',
};

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric',
  });
}

function RecentHistory({ formId }) {
  const history = DUMMY_APPLICATIONS
    .filter(app => SERVICE_TO_FORM[app.serviceType] === formId)
    .sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));

  return (
    <div className="form-weekly-card">
      <h2 style={{ fontSize: '1rem', fontFamily: 'var(--font-head)', color: 'var(--navy)', marginBottom: '0.25rem' }}>
        Recent History
      </h2>
      <p style={{ fontSize: '0.82rem', color: 'var(--muted)', marginBottom: '1rem' }}>
        Latest submissions for this form type — {history.length} recent application{history.length !== 1 ? 's' : ''}
      </p>

      {history.length === 0 ? (
        <div className="admin-empty">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
          </svg>
          <p>No recent submissions for this form type yet.</p>
        </div>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Reference</th>
                <th>Applicant</th>
                <th>NIC</th>
                <th>Phone</th>
                <th>Address</th>
                <th>Submitted</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {history.map(app => (
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
                  <td style={{ fontSize: '0.82rem', color: 'var(--muted)' }}>{app.phone}</td>
                  <td style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>{app.address}</td>
                  <td style={{ fontSize: '0.82rem', color: 'var(--muted)' }}>{formatDate(app.submittedAt)}</td>
                  <td>
                    <span className={`admin-badge ${app.status}`}>
                      {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default function FormsPage({ initialFormId }) {
  const form = DUMMY_FORM_WEEKLY.find(f => f.id === initialFormId) || null;

  if (!form) {
    return (
      <div className="admin-empty">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" />
        </svg>
        <p>Select a form type from the Forms menu to view its submission charts.</p>
      </div>
    );
  }

  const totalSubmitted = form.daily.reduce((s, d) => s + d.submitted, 0);
  const totalCompleted = form.daily.reduce((s, d) => s + d.completed, 0);

  return (
    <>
      <div className="admin-page-header">
        <h1 className="admin-page-title" style={{ marginBottom: 0 }}>{form.label}</h1>
        <p className="admin-page-subtitle">
          {totalCompleted} completed out of {totalSubmitted} submissions in the last 14 days
        </p>
      </div>

      <div className="form-weekly-card">
        <div className="form-weekly-legend">
          <span><span className="fw-dot submitted" /> Submitted</span>
          <span><span className="fw-dot completed" /> Completed</span>
        </div>

        <div className="form-detail-chart">
          {form.daily.map(d => {
            const subH = (d.submitted / MAX_BAR) * 100;
            const comH = (d.completed / d.submitted) * subH || 0;
            return (
              <div className="form-detail-col" key={d.date}>
                <div className="form-detail-bars">
                  <div className="form-weekly-bar completed" style={{ height: `${comH}%` }} />
                  <div className="form-weekly-bar submitted" style={{ height: `${subH}%` }} />
                </div>
                <div className="form-detail-day">{d.day}</div>
                <div className="form-detail-values">
                  <span>{d.submitted}</span>
                  <span>{d.completed}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <RecentHistory formId={form.id} />
    </>
  );
}
