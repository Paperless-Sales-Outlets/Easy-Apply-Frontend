import React, { useCallback, useEffect, useState } from 'react';
import { FiActivity, FiCheckCircle, FiCreditCard, FiEye, FiFileText, FiPhone, FiSearch } from 'react-icons/fi';
import { getApplications, getDashboardStats } from '../services/adminService';
import { FORM_TYPES, formatDateOnly, normalizeApplication, statusBadgeClass, statusLabel } from '../utils/applicationUtils';
import ApplicationDetailModal from '../components/ApplicationDetailModal';

const HISTORY_PAGE_SIZE = 10;

// Two-letter monogram for the applicant avatar in the history table.
function getInitials(name) {
  const parts = String(name || '').trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

function RecentHistory({ formId, fromDate, toDate, onFromDateChange, onToDateChange }) {
  const [history, setHistory] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [detailApp, setDetailApp] = useState(null);
  const [expandedComments, setExpandedComments] = useState({});
  const [searchQuery, setSearchQuery] = useState('');

  const fetchPage = useCallback(async (pageNum) => {
    setLoading(true);
    try {
      const params = {
        serviceType: formId,
        page: pageNum,
        limit: HISTORY_PAGE_SIZE,
        sortBy: 'createdAt',
        sortOrder: 'desc',
      };
      if (fromDate) params.startDate = fromDate;
      if (toDate) params.endDate = toDate;

      const res = await getApplications(params);
      setHistory((res.applications || []).map(normalizeApplication));
      setPagination(res.pagination || null);
    } catch {
      setHistory([]);
      setPagination(null);
    } finally {
      setLoading(false);
    }
  }, [formId, fromDate, toDate]);

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

  const rangeLabel = (fromDate || toDate)
    ? `${fromDate ? formatDateOnly(fromDate) : 'Earliest'} – ${toDate ? formatDateOnly(toDate) : 'Today'}`
    : 'All time';

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

  return (
    <div className="um-panel form-weekly-card form-history-card">
      <div className="form-section-heading">
        <div>
          <span className="form-section-kicker">APPLICATION QUEUE</span>
          <h2>Recent History</h2>
        </div>
        <span className="form-history-count">{pagination?.totalCount ?? history.length} total</span>
      </div>
      <div className="form-history-toolbar">
        <p>
          Latest submissions for this form type — {pagination?.totalCount ?? history.length} total
        </p>
        <div className="form-history-tools">
          <label className="fh-date-field">
            <span>From</span>
            <input
              type="date"
              value={fromDate}
              max={toDate || undefined}
              onChange={(e) => onFromDateChange(e.target.value)}
              aria-label="Filter submissions from date"
            />
          </label>
          <label className="fh-date-field">
            <span>To</span>
            <input
              type="date"
              value={toDate}
              min={fromDate || undefined}
              onChange={(e) => onToDateChange(e.target.value)}
              aria-label="Filter submissions to date"
            />
          </label>
          {(fromDate || toDate) && (
            <button
              type="button"
              className="fh-date-clear"
              onClick={() => { onFromDateChange(''); onToDateChange(''); }}
            >
              Clear
            </button>
          )}
          <span className="fh-date-range">{rangeLabel}</span>
          <div className="form-history-search">
            <FiSearch size={15} className="form-history-search-icon" aria-hidden="true" />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search reference, NIC, phone or name"
              aria-label="Search application history"
            />
          </div>
        </div>
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
        <div className="admin-table-wrap um-table-wrap form-history-wrap">
          <table className="admin-table um-table admin-table-striped form-history-table">
            <thead>
              <tr>
                <th>Applicant</th>
                <th>Reference</th>
                <th>Contact</th>
                <th>Installation address</th>
                <th>Status</th>
                <th>Comment</th>
                <th className="fh-actions-head">Actions</th>
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
                        <div className="fh-applicant">
                          <span className="fh-avatar" aria-hidden="true">{getInitials(app.name)}</span>
                          <div className="fh-applicant-text">
                            <span className="fh-name">{app.name || 'Unknown applicant'}</span>
                            <span className="fh-email">{app.email || 'No email on file'}</span>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="fh-ref">
                          <span className="fh-ref-number">{app.referenceNumber}</span>
                          <span className="fh-ref-date">{formatDateOnly(app.submittedAt)}</span>
                        </div>
                      </td>
                      <td>
                        <div className="fh-contact">
                          <span className="fh-contact-line"><FiCreditCard size={13} /> {app.nic || '—'}</span>
                          <span className="fh-contact-line"><FiPhone size={13} /> {app.phone || '—'}</span>
                        </div>
                      </td>
                      <td className="fh-address">{app.address || '—'}</td>
                      <td>
                        <span className={`admin-badge ${statusBadgeClass(app.status)}`}>
                          {statusLabel(app.status)}
                        </span>
                      </td>
                      <td className={`fh-comment${isExpanded ? ' is-expanded' : ''}`}>
                        {comment ? (
                          <>
                            <span className="fh-comment-text">{visibleText}</span>
                            {comment.length > 90 && (
                              <button
                                type="button"
                                className="fh-comment-toggle"
                                onClick={() => handleToggleCommentExpand(app.id)}
                              >
                                {isExpanded ? 'Show less' : 'Show more'}
                              </button>
                            )}
                          </>
                        ) : (
                          <span className="fh-comment-empty">No comment</span>
                        )}
                        {actionerName && (
                          <div className="fh-comment-author">
                            by {actionerName}
                          </div>
                        )}
                      </td>
                      <td className="fh-actions-cell">
                        <button
                          type="button"
                          className="fh-view-btn"
                          onClick={() => setDetailApp(app)}
                          title="View full customer details"
                        >
                          <FiEye size={15} /> View
                        </button>
                      </td>
                    </tr>
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

      <ApplicationDetailModal
        application={detailApp}
        onClose={() => setDetailApp(null)}
        onUpdated={handleUpdated}
      />
    </div>
  );
}

export default function FormsPage({ initialFormId }) {
  const [stats, setStats] = useState({ total: 0, completed: 0 });
  const [statsLoading, setStatsLoading] = useState(true);
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
      })
      .catch(() => {
        if (!cancelled) setStats({ total: 0, completed: 0 });
      })
      .finally(() => {
        if (!cancelled) setStatsLoading(false);
      });

    return () => { cancelled = true; };
  }, [form, fromDate, toDate]);

  const hasFilter = Boolean(fromDate || toDate);
  const completionRate = stats.total ? Math.round((stats.completed / stats.total) * 100) : 0;

  if (!form) {
    return (
      <div className="admin-empty">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" />
        </svg>
        <p>Select a form type from the Forms menu to view its submissions and history.</p>
      </div>
    );
  }

  return (
    <div className="um-page forms-um-page">
      <div className="um-hero form-um-hero">
        <div className="um-hero-deco" aria-hidden="true">
          <span className="um-hero-orb" />
          <span className="um-hero-slash" />
          <span className="um-hero-grid" />
        </div>
        <div className="um-hero-top">
          <div className="um-hero-text">
            <span className="um-hero-eyebrow"><FiFileText size={13} /> Form Operations</span>
            <h1>{form.label}</h1>
            <p>Track submission flow, completion progress and applicant history in one place.</p>
          </div>
          <span className="form-um-hero-icon" aria-hidden="true"><FiActivity size={26} /></span>
        </div>

        <div className="um-hero-tiles form-um-tiles">
          <div className="um-hero-tile total">
            <div className="um-hero-tile-head"><span className="um-hero-tile-icon"><FiFileText size={16} /></span>Total submissions</div>
            <div className="um-hero-tile-value">
              {statsLoading ? <span className="um-hero-skeleton" /> : stats.total}
            </div>
            <div className="um-hero-tile-foot">{hasFilter ? 'In selected range' : 'All time'}</div>
          </div>
          <div className="um-hero-tile active">
            <div className="um-hero-tile-head"><span className="um-hero-tile-icon"><FiCheckCircle size={16} /></span>Completed forms</div>
            <div className="um-hero-tile-value">
              {statsLoading ? <span className="um-hero-skeleton" /> : stats.completed}
            </div>
            <div className="um-hero-tile-foot">{hasFilter ? 'Approved or confirmed in range' : 'Approved or confirmed'}</div>
          </div>
          <div className="um-hero-tile roles">
            <div className="um-hero-tile-head"><span className="um-hero-tile-icon"><FiActivity size={16} /></span>Completion rate</div>
            <div className="um-hero-tile-value">
              {statsLoading ? <span className="um-hero-skeleton" /> : `${completionRate}%`}
            </div>
            <div className="um-hero-tile-foot">{hasFilter ? 'In selected range' : 'Across this form type'}</div>
          </div>
        </div>
      </div>

      <RecentHistory
        formId={form.id}
        fromDate={fromDate}
        toDate={toDate}
        onFromDateChange={setFromDate}
        onToDateChange={setToDate}
      />
    </div>
  );
}
