import React, { useState } from 'react';
import { FiFileText, FiCheckCircle, FiClock, FiMessageSquare } from 'react-icons/fi';
import { DUMMY_APPLICATIONS } from '../data/dummyData';

const SERVICE_LABELS = {
  'new-connection': 'New Connection',
  'reconnection': 'Reconnection',
  'location-change': 'Location Change',
  'termination': 'Termination',
  'ownership-change': 'Ownership Change',
  'package-migration': 'Package Migration',
  'service-vacation': 'Service Vacation',
  'refund-request': 'Refund Request',
  'customer-request-acceptance': 'Customer Request Acceptance',
};

function formatDate(iso) {
  return new Date(iso).toLocaleString('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false,
  });
}

export default function ApplicationsPage({ commentMap = {}, onSaveComment }) {
  const [expandedComments, setExpandedComments] = useState({});
  const [activeEditorId, setActiveEditorId] = useState(null);
  const [commentDrafts, setCommentDrafts] = useState({});

  const recentApplications = [...DUMMY_APPLICATIONS]
    .sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));

  const totals = recentApplications.reduce((acc, app) => {
    acc.total += 1;
    acc[app.status] = (acc[app.status] || 0) + 1;
    return acc;
  }, { total: 0, pending: 0, approved: 0, rejected: 0, flagged: 0 });

  const handleToggleExpanded = (id) => {
    setExpandedComments(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleCommentChange = (id, value) => {
    setCommentDrafts(prev => ({ ...prev, [id]: value }));
  };

  const handleActionClick = (id) => {
    setActiveEditorId(prevId => {
      const nextId = prevId === id ? null : id;
      if (nextId && commentMap[id] && commentDrafts[id] === undefined) {
        setCommentDrafts(prev => ({ ...prev, [id]: commentMap[id] }));
      }
      return nextId;
    });
  };

  const handleSaveComment = (id) => {
    const comment = (commentDrafts[id] ?? commentMap[id] ?? '').trim();
    if (!comment) return;
    onSaveComment?.(id, comment);
    setActiveEditorId(null);
  };

  return (
    <>
      <div className="admin-page-header">
        <h1 className="admin-page-title">Applications</h1>
        <p className="admin-page-subtitle">
          Recent application history for submitted forms.
        </p>
      </div>

      <div className="admin-summary-grid">
        <div className="admin-stat-card">
          <div className="admin-stat-icon blue">
            <FiFileText size={18} />
          </div>
          <div>
            <div className="admin-stat-label">Total applications</div>
            <div className="admin-stat-value">{totals.total}</div>
            <div className="admin-stat-trend">Latest form submissions</div>
          </div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-icon green">
            <FiCheckCircle size={18} />
          </div>
          <div>
            <div className="admin-stat-label">Approved</div>
            <div className="admin-stat-value">{totals.approved}</div>
            <div className="admin-stat-trend">Completed review</div>
          </div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-icon amber">
            <FiClock size={18} />
          </div>
          <div>
            <div className="admin-stat-label">Pending</div>
            <div className="admin-stat-value">{totals.pending}</div>
            <div className="admin-stat-trend">Awaiting processing</div>
          </div>
        </div>
      </div>

      <div className="form-weekly-card" style={{ overflowX: 'auto' }}>
        <h2 style={{ fontSize: '1rem', fontFamily: 'var(--font-head)', color: 'var(--navy)', marginBottom: '0.75rem' }}>
          Recent submission history
        </h2>
        <div className="admin-table-wrap">
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
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {recentApplications.map(app => {
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
                      <td style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>
                        {SERVICE_LABELS[app.serviceType] || app.serviceType}
                      </td>
                      <td>
                        <span className={`admin-badge ${app.status}`}>
                          {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                        </span>
                      </td>
                      <td style={{ fontSize: '0.82rem', color: 'var(--muted)' }}>{formatDate(app.submittedAt)}</td>
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
                      <td>
                        <button
                          type="button"
                          onClick={() => handleActionClick(app.id)}
                          style={{
                            border: 'none',
                            background: 'transparent',
                            cursor: 'pointer',
                            color: 'var(--navy)',
                            padding: '0.25rem',
                          }}
                          aria-label={comment ? 'Edit comment' : 'Add comment'}
                        >
                          <FiMessageSquare size={18} />
                        </button>
                      </td>
                    </tr>
                    {activeEditorId === app.id && (
                      <tr>
                        <td colSpan={9} style={{ padding: '0.65rem 1rem', background: 'var(--surface)', borderBottom: '1px solid var(--line)' }}>
                          <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', flexWrap: 'wrap' }}>
                            <textarea
                              value={commentDrafts[app.id] ?? commentMap[app.id] ?? ''}
                              onChange={(e) => handleCommentChange(app.id, e.target.value)}
                              placeholder="Enter admin comment for this application"
                              style={{
                                flex: 1,
                                minHeight: '90px',
                                padding: '0.85rem',
                                border: '1px solid var(--line)',
                                borderRadius: '10px',
                                fontFamily: 'inherit',
                                fontSize: '0.9rem',
                                resize: 'vertical',
                              }}
                            />
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.35rem' }}>
                              <button
                                type="button"
                                onClick={() => handleSaveComment(app.id)}
                                style={{
                                  padding: '0.75rem 1rem',
                                  backgroundColor: 'var(--blue)',
                                  color: '#fff',
                                  border: 'none',
                                  borderRadius: '10px',
                                  cursor: 'pointer',
                                  minWidth: '100px',
                                }}
                              >
                                Save comment
                              </button>
                              <button
                                type="button"
                                onClick={() => setActiveEditorId(null)}
                                style={{
                                  padding: '0.75rem 1rem',
                                  backgroundColor: 'transparent',
                                  color: 'var(--navy)',
                                  border: '1px solid var(--line)',
                                  borderRadius: '10px',
                                  cursor: 'pointer',
                                  minWidth: '100px',
                                }}
                              >
                                Cancel
                              </button>
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
      </div>
    </>
  );
}
