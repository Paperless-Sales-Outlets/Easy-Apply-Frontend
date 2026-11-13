import React, { useCallback, useEffect, useRef, useState } from 'react';
import { FiActivity, FiAlertTriangle, FiCheckCircle, FiCreditCard, FiEye, FiFileText, FiPhone, FiSearch } from 'react-icons/fi';
import { getApplications, getDashboardStats } from '../services/adminService';
import { FORM_TYPES, STATUS_LABELS, formatDateOnly, normalizeApplication, statusBadgeClass, statusLabel } from '../utils/applicationUtils';
import { AnimatedNumber, Pager, timeAgo } from '../components/AdminVisuals';
import ApplicationDetailModal from '../components/ApplicationDetailModal';

const HISTORY_PAGE_SIZE = 10;

const STATUS_VIEWS = [{ key: '', label: 'All' }, ...Object.entries(STATUS_LABELS).map(([key, label]) => ({ key, label }))];

const AVATAR_GRADIENTS = [
  'linear-gradient(135deg, #0f57a8, #0b2d5b)',
  'linear-gradient(135deg, #50b748, #2f7f2a)',
  'linear-gradient(135deg, #2b7de9, #0a3f7e)',
  'linear-gradient(135deg, #0f7a4d, #004d38)',
  'linear-gradient(135deg, #3d6fb6, #1b3f75)',
];

// A stable colour per applicant, so the same person reads the same everywhere.
function avatarGradient(key) {
  const text = String(key || '');
  let hash = 0;
  for (let i = 0; i < text.length; i += 1) hash = (hash * 31 + text.charCodeAt(i)) >>> 0;
  return AVATAR_GRADIENTS[hash % AVATAR_GRADIENTS.length];
}

// Two-letter monogram for the applicant avatar in the history table.
function getInitials(name) {
  const parts = String(name || '').trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

function RecentHistory({ formId, fromDate, toDate, onFromDateChange, onToDateChange, onRetry }) {
  const [history, setHistory] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadFailed, setLoadFailed] = useState(false);
  const [detailApp, setDetailApp] = useState(null);
  const [expandedComments, setExpandedComments] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const [appliedSearch, setAppliedSearch] = useState('');
  const [status, setStatus] = useState('');
  const latestRequest = useRef(0);

  // Search once typing pauses.
  useEffect(() => {
    const id = setTimeout(() => setAppliedSearch(searchQuery.trim()), 350);
    return () => clearTimeout(id);
  }, [searchQuery]);

  const fetchPage = useCallback(async (pageNum) => {
    const requestId = latestRequest.current + 1;
    latestRequest.current = requestId;
    setLoading(true);
    try {
      const params = {
        serviceType: formId,
        page: pageNum,
        limit: HISTORY_PAGE_SIZE,
        sortBy: 'createdAt',
        sortOrder: 'desc',
        lite: true,
      };
      if (fromDate) params.startDate = fromDate;
      if (toDate) params.endDate = toDate;
      if (status) params.status = status;
      if (appliedSearch) params.search = appliedSearch;

      const res = await getApplications(params);
      if (requestId !== latestRequest.current) return;
      setHistory((res.applications || []).map(normalizeApplication));
      setPagination(res.pagination || null);
      setLoadFailed(false);
    } catch {
      if (requestId !== latestRequest.current) return;
      setHistory([]);
      setPagination(null);
      setLoadFailed(true);
    } finally {
      if (requestId === latestRequest.current) setLoading(false);
    }
  }, [formId, fromDate, toDate, status, appliedSearch]);

  useEffect(() => {
    setPage(1);
    fetchPage(1);
  }, [formId, fetchPage]);

  const totalCount = pagination?.totalCount ?? history.length;
  const hasFilters = Boolean(fromDate || toDate || status || searchQuery);

  const handleToggleCommentExpand = (id) => {
    setExpandedComments(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleUpdated = (updated) => {
    setHistory(prev => prev.map(app => (app.id === updated.id ? { ...app, ...updated } : app)));
    setDetailApp(prev => (prev && prev.id === updated.id ? { ...prev, ...updated } : prev));
  };

  const goToPage = (pageNum) => {
    if (pageNum < 1 || (pagination && pageNum > pagination.totalPages)) return;
    setPage(pageNum);
    fetchPage(pageNum);
  };

  const retry = () => {
    fetchPage(page);
    onRetry();
  };

  const clearFilters = () => {
    onFromDateChange('');
    onToDateChange('');
    setStatus('');
    setSearchQuery('');
  };

  return (
    <>
      <section className="um-panel frm-panel">
        <div className="um-panel-head frm-head">
          <div className="um-panel-title">
            <h2>Submissions</h2>
            <p>
              {loading
                ? 'Loading…'
                : loadFailed
                  ? 'Not loaded'
                  : appliedSearch
                    ? `${totalCount} match${totalCount === 1 ? '' : 'es'}`
                    : `${totalCount} submission${totalCount === 1 ? '' : 's'}${fromDate || toDate ? ' in the selected range' : ''}`}
            </p>
          </div>
          <div className="um-toolbar">
            <div className="admin-search um-search">
              <span className="admin-search-icon"><FiSearch size={15} aria-hidden="true" /></span>
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search reference, NIC, phone or name"
                aria-label="Search application history"
              />
            </div>
            <div className="ax-range" role="group" aria-label="Submission dates">
              <input
                type="date"
                value={fromDate}
                max={toDate || undefined}
                onChange={(e) => onFromDateChange(e.target.value)}
                aria-label="Filter submissions from date"
              />
              <span aria-hidden="true">to</span>
              <input
                type="date"
                value={toDate}
                min={fromDate || undefined}
                onChange={(e) => onToDateChange(e.target.value)}
                aria-label="Filter submissions to date"
              />
            </div>
            {hasFilters && (
              <button type="button" className="admin-btn ghost ax-clear" onClick={clearFilters}>Clear</button>
            )}
          </div>
        </div>

        <div className="frm-status-bar">
          <div className="ax-seg ax-seg--scroll" role="group" aria-label="Application status">
            {STATUS_VIEWS.map((view) => (
              <button
                key={view.key || 'all'}
                type="button"
                className={`ax-seg-btn${status === view.key ? ' active' : ''}`}
                aria-pressed={status === view.key}
                onClick={() => setStatus(view.key)}
              >
                {view.key && <span className={`frm-dot ${statusBadgeClass(view.key)}`} aria-hidden="true" />}
                {view.label}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="dash-table-skeleton">
            {Array.from({ length: 5 }).map((_, i) => <div className="dash-skeleton dash-skeleton-row" key={i} />)}
          </div>
        ) : loadFailed ? (
          <div className="um-empty-state" role="alert">
            <span className="um-empty-icon"><FiAlertTriangle size={24} /></span>
            <h3>Could not load submissions</h3>
            <p>Check your connection, then try again.</p>
            <button type="button" className="admin-btn primary" style={{ marginTop: '0.75rem' }} onClick={retry}>Retry</button>
          </div>
        ) : history.length === 0 ? (
          <div className="um-empty-state">
            <span className="um-empty-icon"><FiFileText size={24} /></span>
            <h3>{hasFilters ? 'No matching submissions' : 'No submissions yet'}</h3>
            <p>{hasFilters ? 'Try a different search, status or date range.' : 'Applications for this form will appear here as customers submit them.'}</p>
          </div>
        ) : (
          <div className="admin-table-wrap um-table-wrap">
            <table className="admin-table um-table frm-table">
              <thead>
                <tr>
                  <th>Applicant</th>
                  <th>Reference</th>
                  <th>Contact</th>
                  <th>Address</th>
                  <th>Status</th>
                  <th>Comment</th>
                  <th className="frm-actions-head">Actions</th>
                </tr>
              </thead>
              <tbody>
                {history.map(app => {
                  const comment = app.notes || '';
                  const isExpanded = expandedComments[app.id];
                  const visibleText = comment.length > 90 && !isExpanded ? `${comment.slice(0, 90)}...` : comment;
                  const actioner = app.actionedBy || null;
                  const actionerName = actioner
                    ? (actioner.name || actioner.email || actioner._id || '')
                    : '';

                  return (
                    <tr key={app.id}>
                      <td>
                        <div className="um-user-cell">
                          <span className="um-avatar" style={{ background: avatarGradient(app.nic || app.name) }} aria-hidden="true">{getInitials(app.name)}</span>
                          <div className="frm-applicant-text">
                            <span className="um-user-name">{app.name || 'Unknown applicant'}</span>
                            <span className="frm-sub">{app.email || 'No email on file'}</span>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="frm-ref">
                          <span className="frm-ref-number">{app.referenceNumber}</span>
                          <span className="frm-sub" title={formatDateOnly(app.submittedAt)}>{timeAgo(app.submittedAt) || formatDateOnly(app.submittedAt)}</span>
                        </div>
                      </td>
                      <td>
                        <div className="frm-contact">
                          <span><FiCreditCard size={13} aria-hidden="true" /> {app.nic || '—'}</span>
                          <span><FiPhone size={13} aria-hidden="true" /> {app.phone || '—'}</span>
                        </div>
                      </td>
                      <td><span className="frm-address" title={app.address || ''}>{app.address || '—'}</span></td>
                      <td>
                        <span className={`admin-badge ${statusBadgeClass(app.status)}`}>
                          {statusLabel(app.status)}
                        </span>
                      </td>
                      <td className={`frm-comment${isExpanded ? ' is-expanded' : ''}`}>
                        {comment ? (
                          <>
                            <span className="frm-comment-text">{visibleText}</span>
                            {comment.length > 90 && (
                              <button
                                type="button"
                                className="frm-comment-toggle"
                                onClick={() => handleToggleCommentExpand(app.id)}
                              >
                                {isExpanded ? 'Show less' : 'Show more'}
                              </button>
                            )}
                            {actionerName && <span className="frm-comment-author">— {actionerName}</span>}
                          </>
                        ) : (
                          <span className="frm-comment-empty">No comment</span>
                        )}
                      </td>
                      <td>
                        <div className="um-row-actions frm-row-actions">
                          <button
                            type="button"
                            className="um-action-btn edit"
                            onClick={() => setDetailApp(app)}
                            aria-label={`Open application ${app.referenceNumber}`}
                          >
                            <FiEye size={15} />
                            <span className="um-action-label">Open</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {pagination && pagination.totalPages > 1 && (
          <Pager
            page={pagination.currentPage || page}
            totalPages={pagination.totalPages}
            onChange={goToPage}
            disabled={loading}
            label="Submission pages"
          />
        )}
      </section>

      {/* Outside the panel: its entrance animation would otherwise trap the fixed overlay */}
      <ApplicationDetailModal
        application={detailApp}
        onClose={() => setDetailApp(null)}
        onUpdated={handleUpdated}
      />
    </>
  );
}

/** Browse submitted application forms; `initialFormId` opens a specific form on load. */
export default function FormsPage({ initialFormId }) {
  const [stats, setStats] = useState({ total: 0, completed: 0 });
  const [statsLoading, setStatsLoading] = useState(true);
  const [statsFailed, setStatsFailed] = useState(false);
  const [statsAttempt, setStatsAttempt] = useState(0);
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  const form = FORM_TYPES.find(f => f.id === initialFormId) || null;

  useEffect(() => {
    if (!form) return undefined;
    let cancelled = false;
    setStatsLoading(true);

    const params = {};
    if (fromDate) params.startDate = fromDate;
    if (toDate) params.endDate = toDate;

    getDashboardStats(params)
      .then((res) => {
        if (cancelled) return;
        const entry = (res.byServiceType || []).find(t => t.id === form.id);
        setStats({ total: entry?.total || 0, completed: entry?.completed || 0 });
        setStatsFailed(false);
      })
      .catch(() => {
        if (cancelled) return;
        setStats({ total: 0, completed: 0 });
        setStatsFailed(true);
      })
      .finally(() => {
        if (!cancelled) setStatsLoading(false);
      });

    return () => { cancelled = true; };
  }, [form, fromDate, toDate, statsAttempt]);

  const hasFilter = Boolean(fromDate || toDate);
  const completionRate = stats.total ? Math.round((stats.completed / stats.total) * 100) : 0;
  const rangeLabel = hasFilter
    ? `${fromDate ? formatDateOnly(fromDate) : 'Earliest'} – ${toDate ? formatDateOnly(toDate) : 'Today'}`
    : 'All time';

  if (!form) {
    return (
      <div className="um-page">
        <div className="um-panel">
          <div className="um-empty-state">
            <span className="um-empty-icon"><FiFileText size={24} /></span>
            <h3>Choose a form</h3>
            <p>Select a form type from the Forms menu to view its submissions and history.</p>
          </div>
        </div>
      </div>
    );
  }

  const tiles = [
    { key: 'total', cls: 'total', icon: <FiFileText size={15} />, label: 'Total submissions', value: stats.total, foot: hasFilter ? 'In the selected range' : 'All time' },
    { key: 'completed', cls: 'active', icon: <FiCheckCircle size={15} />, label: 'Completed', value: stats.completed, foot: 'Approved or confirmed' },
    { key: 'open', cls: 'open', icon: <FiActivity size={15} />, label: 'Not completed', value: Math.max(0, stats.total - stats.completed), foot: 'Pending, flagged or rejected' },
    { key: 'rate', cls: 'roles', icon: <FiActivity size={15} />, label: 'Completion rate', value: completionRate, suffix: '%', meter: completionRate, foot: hasFilter ? 'In the selected range' : 'Across this form type' },
  ];

  return (
    <div className="um-page forms-um-page frm-page">
      <section className="um-hero form-um-hero">
        <div className="um-hero-deco" aria-hidden="true">
          <span className="um-hero-orb" />
          <span className="um-hero-slash" />
          <span className="um-hero-grid" />
        </div>
        <div className="um-hero-top">
          <div className="um-hero-text">
            <span className="um-hero-eyebrow"><FiFileText size={13} /> Forms</span>
            <h1>{form.label}</h1>
            <p>Every {form.label.toLowerCase()} application, its progress and the team&apos;s comments.</p>
          </div>
          <span className="frm-range-chip">{rangeLabel}</span>
        </div>

        <div className="um-hero-tiles">
          {tiles.map((tile, idx) => (
            <div className={`um-hero-tile ${tile.cls}`} key={tile.key} style={{ '--i': idx }}>
              <div className="um-hero-tile-head"><span className="um-hero-tile-icon">{tile.icon}</span>{tile.label}</div>
              <div className="um-hero-tile-value">
                {statsLoading
                  ? <span className="dash-skeleton um-hero-skeleton" />
                  : statsFailed ? '—' : <><AnimatedNumber value={tile.value} />{tile.suffix}</>}
              </div>
              {tile.meter != null && (
                <div className="um-hero-meter" aria-hidden="true"><span style={{ width: `${statsLoading ? 0 : tile.meter}%` }} /></div>
              )}
              <div className="um-hero-tile-foot">{tile.foot}</div>
            </div>
          ))}
        </div>
      </section>

      <RecentHistory
        formId={form.id}
        fromDate={fromDate}
        toDate={toDate}
        onFromDateChange={setFromDate}
        onToDateChange={setToDate}
        onRetry={() => setStatsAttempt((attempt) => attempt + 1)}
      />
    </div>
  );
}
