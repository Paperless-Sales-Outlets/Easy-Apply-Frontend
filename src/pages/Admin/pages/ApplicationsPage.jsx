import React, { useCallback, useEffect, useState } from 'react';
import { FiFileText, FiCheckCircle, FiClock, FiMessageSquare } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { getApplications, getDashboardStats, updateApplicationStatus } from '../services/adminService';
import {
  formatDate,
  normalizeApplication,
  serviceLabel,
  statusBadgeClass,
  statusLabel,
} from '../utils/applicationUtils';
import ApplicationDetailModal from '../components/ApplicationDetailModal';
import ApplicationActions from '../components/ApplicationActions';

const PAGE_SIZE = 10;

export default function ApplicationsPage() {
  const [applications, setApplications] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [statusCounts, setStatusCounts] = useState({});
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState(null);
  const [detailApp, setDetailApp] = useState(null);

  const [expandedComments, setExpandedComments] = useState({});
  const [activeEditorId, setActiveEditorId] = useState(null);
  const [commentDrafts, setCommentDrafts] = useState({});

  const loadSummary = useCallback(async () => {
    try {
      const res = await getDashboardStats();
      setStatusCounts(res.statusCounts || {});
    } catch { /* summary is non-critical */ }
  }, []);

  const fetchPage = useCallback(async (pageNum) => {
    setLoading(true);
    setError('');
    try {
      const res = await getApplications({
        page: pageNum,
        limit: PAGE_SIZE,
        sortBy: 'createdAt',
        sortOrder: 'desc',
      });
      setApplications((res.applications || []).map(normalizeApplication));
      setPagination(res.pagination || null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load applications');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchPage(page); }, [page, fetchPage]);

  useEffect(() => { loadSummary(); }, [loadSummary]);

  const handleStatusChange = async (id, status) => {
    setBusyId(id);
    try {
      const current = applications.find(app => app.id === id);
      const notes = (commentDrafts[id] ?? current?.notes ?? '').trim();
      const res = await updateApplicationStatus(id, status, notes);
      toast.success(`Application marked as ${statusLabel(status)}`);
      setApplications(prev => prev.map(app => app.id === id
        ? {
            ...app,
            status,
            notes: res.application?.notes ?? notes,
            actionedBy: res.application?.actionedBy,
            actionedAt: res.application?.actionedAt,
          }
        : app));
      loadSummary();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update status');
    } finally {
      setBusyId(null);
    }
  };

  const handleToggleExpanded = (id) => {
    setExpandedComments(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleCommentChange = (id, value) => {
    setCommentDrafts(prev => ({ ...prev, [id]: value }));
  };

  const handleActionClick = (id) => {
    setActiveEditorId(prevId => {
      const nextId = prevId === id ? null : id;
      if (nextId && commentDrafts[id] === undefined) {
        const current = applications.find(app => app.id === id);
        setCommentDrafts(prev => ({ ...prev, [id]: current?.notes ?? '' }));
      }
      return nextId;
    });
  };

  const handleSaveComment = async (id) => {
    const comment = (commentDrafts[id] ?? '').trim();
    if (!comment) return;
    setBusyId(id);
    try {
      const current = applications.find(app => app.id === id);
      const res = await updateApplicationStatus(id, current?.status || 'pending', comment);
      toast.success('Comment saved');
      setApplications(prev => prev.map(app => app.id === id
        ? {
            ...app,
            notes: res.application?.notes ?? comment,
            actionedBy: res.application?.actionedBy,
            actionedAt: res.application?.actionedAt,
          }
        : app));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save comment');
    } finally {
      setBusyId(null);
      setActiveEditorId(null);
    }
  };

  const totalCount = Object.values(statusCounts).reduce((sum, n) => sum + (n || 0), 0);
  const approvedCount = (statusCounts.approved || 0) + (statusCounts.confirmed || 0);
  const pendingCount = (statusCounts.pending || 0) + (statusCounts['pending payment'] || 0);

  const goToPage = (pageNum) => {
    if (pageNum < 1 || (pagination && pageNum > pagination.totalPages)) return;
    setPage(pageNum);
  };

  return (
    <>
      <div className="admin-page-header">
        <h1 className="admin-page-title">Applications</h1>
        <p className="admin-page-subtitle">
          Application history for all submitted forms.
        </p>
      </div>

      {error && (
        <div className="admin-error-banner" role="alert">
          {error}
        </div>
      )}

      <div className="admin-summary-grid">
        <div className="admin-stat-card">
          <div className="admin-stat-icon blue">
            <FiFileText size={18} />
          </div>
          <div>
            <div className="admin-stat-label">Total applications</div>
            <div className="admin-stat-value">{totalCount}</div>
            <div className="admin-stat-trend">All form submissions</div>
          </div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-icon green">
            <FiCheckCircle size={18} />
          </div>
          <div>
            <div className="admin-stat-label">Approved</div>
            <div className="admin-stat-value">{approvedCount}</div>
            <div className="admin-stat-trend">Completed review</div>
          </div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-icon amber">
            <FiClock size={18} />
          </div>
          <div>
            <div className="admin-stat-label">Pending</div>
            <div className="admin-stat-value">{pendingCount}</div>
            <div className="admin-stat-trend">Awaiting processing</div>
          </div>
        </div>
      </div>

      <div className="form-weekly-card" style={{ overflowX: 'auto' }}>
        <h2 style={{ fontSize: '1rem', fontFamily: 'var(--font-head)', color: 'var(--navy)', marginBottom: '0.75rem' }}>
          Application history
        </h2>
        {loading ? (
          <div className="admin-loading">Loading applications…</div>
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table" style={{ minWidth: 1440 }}>
              <thead>
                <tr>
                  <th>Reference</th>
                  <th>Applicant</th>
                  <th>Service</th>
                  <th>Status</th>
                  <th>CR Number</th>
                  <th>Amount</th>
                  <th>Appointment</th>
                  <th>Phone</th>
                  <th>Comments</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {applications.map(app => {
                  const comment = app.notes || '';
                  const isExpanded = expandedComments[app.id];
                  const isLong = comment.length > 90;
                  const visibleText = isExpanded ? comment : comment.slice(0, 90);
                  const actioner = app.actionedBy || null;
                  const actionerName = actioner
                    ? (actioner.name || actioner.email || actioner._id || '')
                    : '';

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
                          {serviceLabel(app.serviceType)}
                        </td>
                        <td>
                          <span className={`admin-badge ${statusBadgeClass(app.status)}`}>
                            {statusLabel(app.status)}
                          </span>
                        </td>
                        <td style={{ fontSize: '0.82rem', color: 'var(--muted)', fontFamily: 'monospace' }}>
                          {app.officeFields?.crNumber || '—'}
                        </td>
                        <td style={{ fontSize: '0.82rem', color: 'var(--muted)' }}>
                          {app.officeFields?.amountPaid != null ? `Rs. ${Number(app.officeFields.amountPaid).toLocaleString()}` : '—'}
                        </td>
                        <td style={{ fontSize: '0.82rem', color: 'var(--muted)' }}>
                          {app.officeFields?.appointmentDate ? formatDate(app.officeFields.appointmentDate) : '—'}
                        </td>
                        <td style={{ fontSize: '0.82rem', color: 'var(--muted)' }}>{app.phone}</td>
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
                          {actionerName && (
                            <div style={{ fontSize: '0.74rem', color: 'var(--muted)', marginTop: '0.25rem' }}>
                              — {actionerName}
                              {actioner._id && (
                                <span style={{ fontFamily: 'monospace' }}> (ID: {actioner._id})</span>
                              )}
                            </div>
                          )}
                        </td>
                        <td>
                          <div className="admin-action-group">
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
                              title="Comment"
                            >
                              <FiMessageSquare size={18} />
                            </button>
                            <ApplicationActions
                              application={app}
                              busy={busyId === app.id}
                              onStatusChange={handleStatusChange}
                              onView={setDetailApp}
                            />
                          </div>
                        </td>
                      </tr>
                      {activeEditorId === app.id && (
                        <tr>
                          <td colSpan={10} style={{ padding: '0.65rem 1rem', background: 'var(--surface)', borderBottom: '1px solid var(--line)' }}>
                            <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', flexWrap: 'wrap' }}>
                              <textarea
                                value={commentDrafts[app.id] ?? app.notes ?? ''}
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
        )}

        {pagination && pagination.totalPages > 1 && (
          <div className="admin-pagination">
            <button
              type="button"
              className="admin-page-btn"
              disabled={!pagination.hasPrevPage || loading}
              onClick={() => goToPage(page - 1)}
            >
              ‹ Prev
            </button>
            <span>
              Page {pagination.currentPage} of {pagination.totalPages}
            </span>
            <button
              type="button"
              className="admin-page-btn"
              disabled={!pagination.hasNextPage || loading}
              onClick={() => goToPage(page + 1)}
            >
              Next ›
            </button>
          </div>
        )}
      </div>

      <ApplicationDetailModal application={detailApp} onClose={() => setDetailApp(null)} />
    </>
  );
}
