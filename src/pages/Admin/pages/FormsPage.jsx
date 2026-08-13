import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { FiMessageSquare } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { getApplications, updateApplicationStatus } from '../services/adminService';
import { FORM_TYPES, formatDateOnly, normalizeApplication, statusBadgeClass, statusLabel } from '../utils/applicationUtils';
import ApplicationDetailModal from '../components/ApplicationDetailModal';
import ApplicationActions from '../components/ApplicationActions';

const CHART_DAYS = 14;
const CHART_LIMIT = 200;
const HISTORY_PAGE_SIZE = 10;

const COMPLETED_STATUSES = ['approved', 'confirmed'];

function toDateKey(dt) {
  const y = dt.getFullYear();
  const m = String(dt.getMonth() + 1).padStart(2, '0');
  const d = String(dt.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function buildDailySeries(apps, days = CHART_DAYS) {
  const buckets = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    buckets.push({
      date: toDateKey(d),
      day: d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }),
      submitted: 0,
      completed: 0,
    });
  }

  const findBucket = (key) => buckets.find((b) => b.date === key);

  apps.forEach((app) => {
    if (!app.submittedAt) return;
    const subBucket = findBucket(toDateKey(new Date(app.submittedAt)));
    if (subBucket) subBucket.submitted += 1;

    // Count completions on the actual approval/completion date, not the
    // submission date, so the completed bars reflect the correct day.
    if (COMPLETED_STATUSES.includes(app.status)) {
      const completedOn = app.actionedAt || app.updatedAt;
      if (completedOn) {
        const comBucket = findBucket(toDateKey(new Date(completedOn)));
        if (comBucket) comBucket.completed += 1;
      }
    }
  });

  return buckets;
}

function buildScale(maxValue) {
  const max = Math.max(1, Math.ceil(maxValue));
  if (max <= 5) return Array.from({ length: max + 1 }, (_, i) => i);
  const rawStep = max / 5;
  const magnitude = Math.pow(10, Math.floor(Math.log10(rawStep)));
  const normalized = rawStep / magnitude;
  let step;
  if (normalized <= 1) step = 1;
  else if (normalized <= 2) step = 2;
  else if (normalized <= 5) step = 5;
  else step = 10;
  step *= magnitude;
  const ticks = [];
  for (let v = 0; v <= max; v += step) ticks.push(Math.round(v));
  if (ticks[ticks.length - 1] !== max) ticks.push(max);
  return ticks;
}

function FormDetailBarChart({ daily }) {
  const [popup, setPopup] = useState(null);
  const chartRef = useRef(null);
  const maxBar = Math.max(...daily.map(d => Math.max(d.submitted, d.completed)), 1);
  const ticks = buildScale(maxBar);

  const handleBarClick = (index, which, event) => {
    const rect = chartRef.current.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    if (popup && popup.index === index && popup.which === which) {
      setPopup(null);
    } else {
      setPopup({ index, which, x, y });
    }
  };

  return (
    <>
      <div className="form-detail-chart-wrap">
        <div className="form-detail-yaxis">
          {ticks.map(tick => (
            <span
              key={tick}
              className="form-detail-tick"
              style={{ bottom: `${(tick / maxBar) * 100}%` }}
            >
              {tick}
            </span>
          ))}
        </div>
        <div className="form-detail-chart" ref={chartRef}>
          <div className="form-detail-grid">
            {ticks.map(tick => (
              <div
                key={tick}
                className="form-detail-gridline"
                style={{ bottom: `${(tick / maxBar) * 100}%` }}
              />
            ))}
          </div>
          <div className="form-detail-bars-row">
            {daily.map((d, index) => {
              const subH = (d.submitted / maxBar) * 100;
              const comH = (d.completed / maxBar) * 100;
              return (
                <div className="form-detail-col" key={d.date}>
                  <div className="form-detail-bars">
                    <div
                      className="form-weekly-bar completed clickable"
                      style={{ height: `${comH}%` }}
                      title={`Completed ${d.date}: ${d.completed}`}
                      onClick={event => handleBarClick(index, 'completed', event)}
                    />
                    <div
                      className="form-weekly-bar submitted clickable"
                      style={{ height: `${subH}%` }}
                      title={`Submitted ${d.date}: ${d.submitted}`}
                      onClick={event => handleBarClick(index, 'submitted', event)}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      <div className="form-detail-day-row">
        {daily.map(d => (
          <div className="form-detail-day" key={d.date}>{d.day}</div>
        ))}
      </div>
      {popup && (
        <div className="pie-chart-popup" style={{ left: popup.x, top: popup.y }}>
          <span className="pie-chart-popup-swatch" style={{ background: popup.which === 'completed' ? 'var(--green)' : 'var(--blue)' }} />
          <div>
            <div className="pie-chart-popup-count">
              {popup.which === 'completed' ? daily[popup.index].completed : daily[popup.index].submitted}
            </div>
            <div className="pie-chart-popup-label">
              {popup.which === 'completed' ? 'Completed' : 'Submitted'} —{' '}
              {daily[popup.index].day}, {new Date(`${daily[popup.index].date}T00:00:00`).getFullYear()}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function RecentHistory({ formId }) {
  const [history, setHistory] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);
  const [detailApp, setDetailApp] = useState(null);
  const [activeEditorId, setActiveEditorId] = useState(null);
  const [commentDrafts, setCommentDrafts] = useState({});
  const [expandedComments, setExpandedComments] = useState({});
  const [searchQuery, setSearchQuery] = useState('');

  const fetchPage = useCallback(async (pageNum) => {
    setLoading(true);
    try {
      const res = await getApplications({
        serviceType: formId,
        page: pageNum,
        limit: HISTORY_PAGE_SIZE,
        sortBy: 'createdAt',
        sortOrder: 'desc',
      });
      setHistory((res.applications || []).map(normalizeApplication));
      setPagination(res.pagination || null);
    } catch {
      setHistory([]);
      setPagination(null);
    } finally {
      setLoading(false);
    }
  }, [formId]);

  useEffect(() => {
    setPage(1);
    fetchPage(1);
  }, [formId, fetchPage]);

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

  const filteredHistory = history.filter(app => matchesSearch(app, searchQuery));

  const handleStatusChange = async (id, status) => {
    setBusyId(id);
    try {
      const current = history.find(app => app.id === id);
      const notes = (commentDrafts[id] ?? current?.notes ?? '').trim();
      const res = await updateApplicationStatus(id, status, notes);
      toast.success(`Application marked as ${statusLabel(status)}`);
      setHistory(prev => prev.map(app => app.id === id
        ? {
            ...app,
            status,
            notes: res.application?.notes ?? notes,
            actionedBy: res.application?.actionedBy,
            actionedAt: res.application?.actionedAt,
          }
        : app));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update status');
    } finally {
      setBusyId(null);
    }
  };

  const handleActionClick = (id) => {
    setActiveEditorId(prevId => {
      const nextId = prevId === id ? null : id;
      if (nextId && commentDrafts[id] === undefined) {
        const current = history.find(app => app.id === id);
        setCommentDrafts(prev => ({ ...prev, [id]: current?.notes ?? '' }));
      }
      return nextId;
    });
  };

  const handleToggleCommentExpand = (id) => {
    setExpandedComments(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleCommentChange = (id, value) => {
    setCommentDrafts(prev => ({ ...prev, [id]: value }));
  };

  const handleSave = async (id) => {
    const comment = (commentDrafts[id] ?? '').trim();
    if (!comment) return;
    setBusyId(id);
    try {
      const current = history.find(app => app.id === id);
      const res = await updateApplicationStatus(id, current?.status || 'pending', comment);
      toast.success('Comment saved');
      setHistory(prev => prev.map(app => app.id === id
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

  const goToPage = (pageNum) => {
    if (pageNum < 1 || (pagination && pageNum > pagination.totalPages)) return;
    setPage(pageNum);
    fetchPage(pageNum);
  };

  return (
    <div className="form-weekly-card">
      <h2 style={{ fontSize: '1rem', fontFamily: 'var(--font-head)', color: 'var(--navy)', marginBottom: '0.25rem' }}>
        Recent History
      </h2>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1rem', alignItems: 'center' }}>
        <p style={{ fontSize: '0.82rem', color: 'var(--muted)', margin: 0 }}>
          Latest submissions for this form type — {pagination?.totalCount ?? history.length} total
        </p>
        <input
          type="search"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search reference, NIC, phone or name"
          style={{
            flex: '1 1 240px',
            minWidth: 240,
            padding: '0.75rem 1rem',
            border: '1px solid var(--line)',
            borderRadius: '12px',
            background: 'var(--surface)',
            color: 'var(--text)',
          }}
        />
      </div>

      {loading ? (
        <div className="admin-loading">Loading history…</div>
      ) : filteredHistory.length === 0 ? (
        <div className="admin-empty">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
          </svg>
          <p>No submissions found for this form type yet.</p>
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
                <th>Comments</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredHistory.map(app => {
                const comment = app.notes || '';
                const isExpanded = expandedComments[app.id];
                const visibleText = comment.length > 90 && !isExpanded ? `${comment.slice(0, 90)}...` : comment;
                const actioner = app.actionedBy || null;
                const actionerName = actioner
                  ? (actioner.name || actioner.email || actioner._id || '')
                  : '';

                return (
                  <React.Fragment key={app.id}>
                    <tr>
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
                      <td style={{ fontSize: '0.82rem', color: 'var(--muted)' }}>{formatDateOnly(app.submittedAt)}</td>
                      <td>
                        <span className={`admin-badge ${statusBadgeClass(app.status)}`}>
                          {statusLabel(app.status)}
                        </span>
                      </td>
                      <td style={{ fontSize: '0.82rem', color: 'var(--muted)', whiteSpace: 'pre-wrap', wordBreak: 'break-word', maxWidth: '24rem' }}>
                        {comment ? (
                          <>
                            {visibleText}
                            {comment.length > 90 && (
                              <button
                                type="button"
                                onClick={() => handleToggleCommentExpand(app.id)}
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
                        <td colSpan={9} style={{ padding: '0.65rem 1rem', background: 'var(--surface)', borderBottom: '1px solid var(--line)' }}>
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
                                onClick={() => handleSave(app.id)}
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

      <ApplicationDetailModal application={detailApp} onClose={() => setDetailApp(null)} />
    </div>
  );
}

export default function FormsPage({ initialFormId }) {
  const [chartApps, setChartApps] = useState([]);
  const [chartLoading, setChartLoading] = useState(true);

  const form = FORM_TYPES.find(f => f.id === initialFormId) || null;

  useEffect(() => {
    if (!form) return;
    let cancelled = false;
    setChartLoading(true);
    getApplications({ serviceType: form.id, limit: CHART_LIMIT, sortBy: 'createdAt', sortOrder: 'desc' })
      .then((res) => {
        if (cancelled) return;
        setChartApps((res.applications || []).map(normalizeApplication));
      })
      .catch(() => {
        if (!cancelled) setChartApps([]);
      })
      .finally(() => {
        if (!cancelled) setChartLoading(false);
      });
    return () => { cancelled = true; };
  }, [form]);

  const daily = useMemo(() => buildDailySeries(chartApps), [chartApps]);
  const totalSubmitted = daily.reduce((s, d) => s + d.submitted, 0);
  const totalCompleted = daily.reduce((s, d) => s + d.completed, 0);

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

        {chartLoading ? (
          <div className="admin-loading">Loading chart data…</div>
        ) : (
          <FormDetailBarChart daily={daily} />
        )}
      </div>

      <RecentHistory formId={form.id} />
    </>
  );
}
