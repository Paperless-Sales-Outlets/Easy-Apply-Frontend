import React, { useCallback, useEffect, useState } from 'react';
import { getDraftLeadById, getDraftLeadStats, getDraftLeads } from '../services/adminService';
import AdminNotice, { useAdminNotice } from '../components/AdminNotice';
import { AnimatedNumber, Pager, timeAgo } from '../components/AdminVisuals';
import DraftDetailModal from '../components/DraftDetailModal';
import { formatDate } from '../utils/leadUtils';

const PAGE_SIZE = 10;

const STEP_OPTIONS = [
  { value: 'location', label: 'Customer & Location' },
  { value: 'loop', label: 'Fibre Availability' },
  { value: 'identity', label: 'Identity & KYC' },
  { value: 'signature', label: 'Declaration & Signature' },
  { value: 'payment', label: 'Payment' },
  { value: 'review', label: 'Review & Submit' },
];

const ICON_SEARCH = (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

const ICON_LEADS = (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M19 8v6M22 11h-6" />
  </svg>
);

const ICON_SURVEY = (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 12h4l3 8 4-16 3 8h4" />
  </svg>
);

const ICON_RISK = (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z" />
    <line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
);

const ICON_OK = (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
  </svg>
);

const ICON_EMPTY = (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 12h4l3 8 4-16 3 8h4" />
  </svg>
);

const ICON_REFRESH = (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 2v6h-6" /><path d="M3 12a9 9 0 0 1 15-6.7L21 8" /><path d="M3 22v-6h6" /><path d="M21 12a9 9 0 0 1-15 6.7L3 16" />
  </svg>
);

const TABS = [
  { key: 'all', label: 'All Drafts', icon: ICON_LEADS, count: (s) => s?.total },
  { key: 'active', label: 'In Progress', icon: ICON_SURVEY, count: (s) => s?.active },
  { key: 'expired', label: 'Expired', icon: ICON_RISK, count: (s) => s?.expired },
  { key: 'payment', label: 'Reached Payment', icon: ICON_OK, count: (s) => s?.reachedPayment },
];

const AVATAR_GRADIENTS = [
  'linear-gradient(135deg, #0f57a8, #0b2d5b)',
  'linear-gradient(135deg, #50b748, #2f7f2a)',
  'linear-gradient(135deg, #2b7de9, #0a3f7e)',
  'linear-gradient(135deg, #0f7a4d, #004d38)',
  'linear-gradient(135deg, #3d6fb6, #1b3f75)',
];

function avatarGradient(key) {
  const text = String(key || '');
  let hash = 0;
  for (let i = 0; i < text.length; i += 1) hash = (hash * 31 + text.charCodeAt(i)) >>> 0;
  return AVATAR_GRADIENTS[hash % AVATAR_GRADIENTS.length];
}

const initials = (name) => (name || '').split(' ').filter(Boolean).map((n) => n[0]).slice(0, 2).join('').toUpperCase() || 'D';

const EMPTY_FILTERS = {
  search: '',
  status: '',
  stage: '',
};

export default function LeadManagementPage() {
  const notice = useAdminNotice();

  const [drafts, setDrafts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);

  const [group, setGroup] = useState('all');
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({
    currentPage: 1, totalPages: 1, totalCount: 0, pageSize: PAGE_SIZE, hasNextPage: false, hasPrevPage: false,
  });

  const [detail, setDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState('');

  const loadStats = useCallback(async () => {
    setStatsLoading(true);
    try {
      const res = await getDraftLeadStats();
      setStats(res.stats || null);
    } catch {
      setStats(null);
    } finally {
      setStatsLoading(false);
    }
  }, []);

  const loadDrafts = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = {
        page,
        limit: PAGE_SIZE,
        group: group === 'all' ? '' : group,
      };
      if (filters.search.trim()) params.search = filters.search.trim();
      if (filters.status) params.status = filters.status;
      if (filters.stage) params.stage = filters.stage;

      const res = await getDraftLeads(params);
      setDrafts(res.drafts || []);
      setPagination(res.pagination || {
        currentPage: page, totalPages: 1, totalCount: 0, pageSize: PAGE_SIZE, hasNextPage: false, hasPrevPage: false,
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load unfinished applications');
      setDrafts([]);
    } finally {
      setLoading(false);
    }
  }, [page, group, filters]);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  useEffect(() => {
    loadDrafts();
  }, [loadDrafts]);

  const setFilter = (key) => (e) => {
    setFilters((f) => ({ ...f, [key]: e.target.value }));
    setPage(1);
  };

  const clearFilters = () => {
    setFilters(EMPTY_FILTERS);
    setPage(1);
  };

  const handleTabChange = (key) => {
    setGroup(key);
    setPage(1);
  };

  const refreshAll = () => {
    loadStats();
    loadDrafts();
  };

  const openDetail = async (id) => {
    setDetail(null);
    setDetailError('');
    setDetailLoading(true);
    try {
      const res = await getDraftLeadById(id);
      setDetail(res.draft || null);
    } catch (err) {
      setDetailError(err.response?.data?.message || 'Failed to load this draft');
    } finally {
      setDetailLoading(false);
    }
  };

  const closeDetail = () => {
    setDetail(null);
    setDetailError('');
    setDetailLoading(false);
  };

  const hasFilters = Boolean(filters.search || filters.status || filters.stage);

  const heroTiles = [
    {
      key: 'total',
      tone: 'info',
      label: 'Total Drafts',
      value: stats?.total ?? 0,
      foot: `${stats?.withProduct ?? 0} selected a package`,
      icon: ICON_LEADS,
    },
    {
      key: 'active',
      tone: 'info',
      label: 'In Progress',
      value: stats?.active ?? 0,
      foot: `${stats?.stale ?? 0} idle for 7+ days`,
      meter: stats?.total ? Math.round(((stats?.active ?? 0) / stats.total) * 100) : 0,
      icon: ICON_SURVEY,
    },
    {
      key: 'expired',
      tone: 'bad',
      label: 'Expired',
      value: stats?.expired ?? 0,
      foot: 'Past the 30-day continuation window',
      meter: stats?.total ? Math.round(((stats?.expired ?? 0) / stats.total) * 100) : 0,
      icon: ICON_RISK,
    },
    {
      key: 'payment',
      tone: 'good',
      label: 'Reached Payment',
      value: stats?.reachedPayment ?? 0,
      foot: `${stats?.paidNotSubmitted ?? 0} paid but did not submit`,
      meter: stats?.total ? Math.round(((stats?.reachedPayment ?? 0) / stats.total) * 100) : 0,
      icon: ICON_OK,
    },
  ];

  const blockingReasons = stats?.blockingIssues || [];

  return (
    <div className="um-page lm-page">
      <section className="um-hero">
        <div className="um-hero-deco" aria-hidden="true">
          <span className="um-hero-orb" />
          <span className="um-hero-slash" />
          <span className="um-hero-grid" />
        </div>

        <div className="um-hero-top">
          <div className="um-hero-text">
            <span className="um-hero-eyebrow">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 12h4l3 8 4-16 3 8h4" />
              </svg>
              Abandoned applications
            </span>
            <h1>Lead Management</h1>
            <p>
              Every customer who started a new-connection application but did not finish it. See how far
              they got, what they entered and where to follow up.
            </p>
          </div>
          <button type="button" className="um-hero-action" onClick={refreshAll}>
            <span className="um-hero-action-icon">{ICON_REFRESH}</span>
            Refresh
          </button>
        </div>

        <div className="um-hero-tiles">
          {heroTiles.map((tile, idx) => (
            <div className={`um-hero-tile lm-tile lm-tile--${tile.tone}`} key={tile.key} style={{ '--i': idx }}>
              <div className="um-hero-tile-head">
                <span className="um-hero-tile-icon">{tile.icon}</span>
                {tile.label}
              </div>
              <div className="um-hero-tile-value">
                {statsLoading ? <span className="dash-skeleton um-hero-skeleton" /> : <AnimatedNumber value={tile.value} />}
              </div>
              {tile.meter != null && (
                <div className="um-hero-meter" aria-hidden="true">
                  <span style={{ width: `${statsLoading ? 0 : tile.meter}%` }} />
                </div>
              )}
              <div className="um-hero-tile-foot">{statsLoading ? '\u00a0' : tile.foot}</div>
            </div>
          ))}
        </div>
      </section>

      <AdminNotice notice={notice.notice} onDismiss={notice.dismiss} />
      {error && <div className="admin-error-banner">{error}</div>}

      {blockingReasons.length > 0 && (
        <section className="lm-reasons lmx-reasons">
          <span className="lmx-reasons-icon" aria-hidden="true">{ICON_RISK}</span>
          <div className="lmx-reasons-body">
            <div className="lm-reasons-head">
              <h2>Where customers stop</h2>
              <p>The step each unfinished application was last saved at.</p>
            </div>
            <div className="lmx-reason-list">
              {blockingReasons.map((reason) => (
                <div className="lmx-reason" key={reason.label}>
                  <span className="lmx-reason-label">{reason.label}</span>
                  <span className="lmx-reason-track" aria-hidden="true">
                    <span style={{ width: `${Math.max(8, (reason.count / blockingReasons[0].count) * 100)}%` }} />
                  </span>
                  <span className="lmx-reason-count">{reason.count} draft{reason.count === 1 ? '' : 's'}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      <div className="um-tabs lmx-tabs" role="tablist" style={{ '--tab-index': TABS.findIndex((t) => t.key === group), '--tab-count': TABS.length }}>
        <span className="um-tabs-indicator" aria-hidden="true" />
        {TABS.map((tab) => {
          const count = tab.count?.(stats);
          return (
            <button
              key={tab.key}
              type="button"
              role="tab"
              aria-selected={group === tab.key}
              className={`um-tab${group === tab.key ? ' active' : ''}`}
              onClick={() => handleTabChange(tab.key)}
            >
              <span className="um-tab-icon">{tab.icon}</span>
              <span className="um-tab-label">{tab.label}</span>
              {count != null && !statsLoading && <span className="um-tab-count">{count}</span>}
            </button>
          );
        })}
      </div>

      <section className="um-panel">
        <div className="um-panel-head">
          <div className="um-panel-title">
            <h2>Unfinished applications</h2>
            <p>
              {loading
                ? 'Loading…'
                : `Showing ${drafts.length} of ${pagination.totalCount} draft${pagination.totalCount === 1 ? '' : 's'}`}
            </p>
          </div>
          <div className="um-toolbar">
            <div className="admin-search um-search">
              <span className="admin-search-icon">{ICON_SEARCH}</span>
              <input
                type="text"
                placeholder="Search name, phone, NIC, address or package"
                value={filters.search}
                onChange={setFilter('search')}
              />
            </div>
            <select className="admin-select" value={filters.status} onChange={setFilter('status')}>
              <option value="">All Statuses</option>
              <option value="active">In progress</option>
              <option value="expired">Expired</option>
            </select>
            <select className="admin-select" value={filters.stage} onChange={setFilter('stage')}>
              <option value="">All Steps</option>
              {STEP_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            {hasFilters && (
              <button type="button" className="admin-btn ghost" onClick={clearFilters}>Clear</button>
            )}
          </div>
        </div>

        {loading ? (
          <div className="dash-table-skeleton">
            {Array.from({ length: 4 }).map((_, i) => <div className="dash-skeleton dash-skeleton-row" key={i} />)}
          </div>
        ) : drafts.length === 0 ? (
          <div className="um-empty-state">
            <span className="um-empty-icon">{ICON_EMPTY}</span>
            <h3>{hasFilters || group !== 'all' ? 'No matches' : 'No unfinished applications'}</h3>
            <p>
              {hasFilters || group !== 'all'
                ? 'Try a different tab, search term or filter.'
                : 'Drafts appear here when a customer starts a new-connection application and leaves it unfinished.'}
            </p>
          </div>
        ) : (
          <div className="admin-table-wrap um-table-wrap">
            <table className="admin-table um-table lm-table">
              <thead>
                <tr>
                  <th>Draft</th>
                  <th>Customer</th>
                  <th>Site</th>
                  <th>Package</th>
                  <th>Progress</th>
                  <th>Status &amp; reason</th>
                  <th className="lmx-actions-head">Actions</th>
                </tr>
              </thead>
              <tbody>
                {drafts.map((draft) => (
                  <tr key={draft.id} className={draft.isExpired ? 'lm-row-blocked' : ''}>
                    <td>
                      <div className="lm-ref-cell">
                        <span className="lm-ref">{draft.referenceNumber}</span>
                        <small>{timeAgo(draft.updatedAt)}</small>
                      </div>
                    </td>
                    <td>
                      <div className="um-user-cell">
                        <span className="um-avatar" style={{ background: avatarGradient(draft.phone || draft.customerName) }} aria-hidden="true">
                          {initials(draft.customerName)}
                        </span>
                        <div className="lm-customer-cell">
                          <span className="lm-customer-name">{draft.customerName}</span>
                          <span className="lm-customer-phone">{draft.phone}</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="lm-site-cell">
                        <span className="lm-site-address">{draft.address || '—'}</span>
                        <small>{[draft.city, draft.district].filter(Boolean).join(' · ') || 'Location not saved'}</small>
                      </div>
                    </td>
                    <td>
                      <div className="lm-package-cell">
                        <span>{draft.packageName || '—'}</span>
                        <small>{[draft.speed, draft.monthlyPrice ? `Rs. ${draft.monthlyPrice}` : ''].filter(Boolean).join(' · ')}</small>
                      </div>
                    </td>
                    <td>
                      <div className="lmx-survey-cell">
                        <div className="lm-checks-cell">
                          <span className="lm-checks-count">{draft.stepNumber}/{draft.stepCount} · {draft.stepLabel}</span>
                          <div className="lm-check-dots">
                            {Array.from({ length: draft.stepCount }).map((_, i) => (
                              <span
                                key={i}
                                className={`lm-check-dot lm-check-dot--${i < draft.stepIndex ? 'pass' : i === draft.stepIndex ? 'marginal' : 'pending'}`}
                              />
                            ))}
                          </div>
                        </div>
                        <div className="lm-signal-track" title={`${draft.progress}% through the wizard`}>
                          <span
                            className={`lm-signal-fill lm-signal-fill--${draft.isExpired ? 'bad' : draft.progress >= 80 ? 'good' : 'warn'}`}
                            style={{ width: `${Math.max(4, draft.progress)}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="lmx-status-cell">
                        <span className={`lm-pill lm-pill--${draft.isExpired ? 'bad' : 'info'}`}>
                          {draft.isExpired ? 'Expired' : 'In progress'}
                        </span>
                        <small className="lm-blocking-note">{draft.reason}</small>
                        <small className="lm-survey-date">
                          {draft.isExpired
                            ? `Expired ${formatDate(draft.expiredAt)}`
                            : `Resume by ${formatDate(draft.resumeUntil)}`}
                        </small>
                      </div>
                    </td>
                    <td>
                      <div className="um-row-actions lmx-row-actions">
                        <button
                          type="button"
                          className="um-action-btn edit"
                          onClick={() => openDetail(draft.id)}
                          aria-label={`Open draft ${draft.referenceNumber}`}
                        >
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8Z" /><circle cx="12" cy="12" r="3" />
                          </svg>
                          <span className="um-action-label">Review</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!loading && drafts.length > 0 && (
          <Pager
            page={pagination.currentPage || page}
            totalPages={Math.max(1, pagination.totalPages || 1)}
            onChange={setPage}
            info={`${pagination.totalCount} draft${pagination.totalCount === 1 ? '' : 's'} · page ${pagination.currentPage || page} of ${Math.max(1, pagination.totalPages || 1)}`}
            label="Draft pages"
          />
        )}
      </section>

      {(detail || detailLoading) && (
        <DraftDetailModal
          draft={detail}
          loading={detailLoading}
          error={detailError}
          onClose={closeDetail}
        />
      )}
    </div>
  );
}
