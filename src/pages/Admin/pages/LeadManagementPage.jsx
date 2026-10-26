import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  createLead,
  deleteLead,
  getAdminUsers,
  getLeadCheckCatalog,
  getLeadStats,
  getLeads,
  resolveLead,
  updateLead,
  updateLeadChecks,
} from '../services/adminService';
import AdminNotice, { useAdminNotice } from '../components/AdminNotice';
import { AnimatedNumber, Pager, timeAgo } from '../components/AdminVisuals';
import LeadDetailModal from '../components/LeadDetailModal';
import LeadFormModal from '../components/LeadFormModal';
import LeadSurveyModal from '../components/LeadSurveyModal';
import {
  FALLBACK_CHECK_CATALOG,
  LEAD_RISK_OPTIONS,
  LEAD_SOURCE_OPTIONS,
  LEAD_STATUS_OPTIONS,
  checkSummary,
  formatDate,
  leadRiskLabel,
  leadRiskTone,
  leadStatusLabel,
  leadStatusTone,
  signalStrengthPercent,
  signalStrengthTone,
  sourceLabel,
} from '../utils/leadUtils';

const PAGE_SIZE = 10;

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

// `count` reads the matching figure from the stats call; At Risk has no exact
// figure there (a lead can be both ruled out and high risk), so it shows none.
const TABS = [
  { key: 'all', label: 'All Leads', icon: ICON_LEADS, count: (s) => s?.total },
  { key: 'awaitingSurvey', label: 'Awaiting Survey', icon: ICON_SURVEY, count: (s) => s?.awaitingSurvey },
  { key: 'atRisk', label: 'At Risk', icon: ICON_RISK },
  { key: 'qualified', label: 'Qualified', icon: ICON_OK, count: (s) => s?.qualified },
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

const initials = (name) => (name || '').split(' ').filter(Boolean).map((n) => n[0]).slice(0, 2).join('').toUpperCase() || 'L';

const EMPTY_FILTERS = {
  search: '',
  status: '',
  riskLevel: '',
  source: '',
};

// Pulls the optical reading off a lead so the table can show it without
// walking the whole checklist every render.
const signalOf = (lead) => (lead?.checks || []).find((c) => c.key === 'signal-strength');

export default function LeadManagementPage() {
  const notice = useAdminNotice();

  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);

  const [catalog, setCatalog] = useState(FALLBACK_CHECK_CATALOG);
  const [staff, setStaff] = useState([]);

  const [group, setGroup] = useState('all');
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({
    currentPage: 1, totalPages: 1, totalCount: 0, pageSize: PAGE_SIZE, hasNextPage: false, hasPrevPage: false,
  });

  const [detailLead, setDetailLead] = useState(null);
  const [surveyLead, setSurveyLead] = useState(null);
  const [formLead, setFormLead] = useState(undefined); // undefined = closed, null = create
  const [pendingDelete, setPendingDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const loadStats = useCallback(async () => {
    setStatsLoading(true);
    try {
      const res = await getLeadStats();
      setStats(res.stats || null);
    } catch {
      // The header tiles are a nicety — a failure here must not blank the page.
      setStats(null);
    } finally {
      setStatsLoading(false);
    }
  }, []);

  const loadLeads = useCallback(async () => {
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
      if (filters.riskLevel) params.riskLevel = filters.riskLevel;
      if (filters.source) params.source = filters.source;

      const res = await getLeads(params);
      setLeads(res.leads || []);
      setPagination(res.pagination || {
        currentPage: page, totalPages: 1, totalCount: 0, pageSize: PAGE_SIZE, hasNextPage: false, hasPrevPage: false,
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load leads');
      setLeads([]);
    } finally {
      setLoading(false);
    }
  }, [page, group, filters]);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  useEffect(() => {
    loadLeads();
  }, [loadLeads]);

  // The catalogue drives the survey form — the API copy wins, the bundled one
  // keeps the screen usable if the request fails.
  useEffect(() => {
    let cancelled = false;
    getLeadCheckCatalog()
      .then((res) => {
        if (!cancelled && Array.isArray(res.checks) && res.checks.length) setCatalog(res.checks);
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, []);

  // Staff accounts are only used for the assignment picker, and the endpoint
  // is Admin-only — a failure just means the picker stays hidden.
  useEffect(() => {
    let cancelled = false;
    getAdminUsers()
      .then((res) => {
        if (!cancelled) setStaff(res.users || []);
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, []);

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

  const hasFilters = Boolean(filters.search || filters.status || filters.riskLevel || filters.source);

  const heroTiles = useMemo(() => {
    const byRisk = stats?.byRisk || {};
    const atRisk = (byRisk.critical || 0) + (byRisk.high || 0);
    const cleared = stats?.qualified ?? 0;
    const total = stats?.total ?? 0;
    return [
      {
        key: 'total',
        tone: 'info',
        label: 'Total Leads',
        value: total,
        foot: `${(stats?.bySource?.portal || 0)} from the online portal`,
        icon: ICON_LEADS,
      },
      {
        key: 'awaiting',
        tone: 'info',
        label: 'Awaiting Survey',
        value: stats?.awaitingSurvey ?? 0,
        foot: `${stats?.unassigned ?? 0} still unassigned`,
        meter: total ? Math.round(((stats?.awaitingSurvey ?? 0) / total) * 100) : 0,
        icon: ICON_SURVEY,
      },
      {
        key: 'risk',
        tone: 'bad',
        label: 'At Risk',
        value: atRisk,
        foot: `${stats?.notFeasible ?? 0} ruled out as not feasible`,
        meter: total ? Math.round((atRisk / total) * 100) : 0,
        icon: ICON_RISK,
      },
      {
        key: 'qualified',
        tone: 'good',
        label: 'Qualified',
        value: cleared,
        foot: `${byRisk.none || 0} sites with no issues`,
        meter: total ? Math.round((cleared / total) * 100) : 0,
        icon: ICON_OK,
      },
    ];
  }, [stats]);

  const blockingReasons = stats?.blockingIssues || [];

  const handleSaveSurvey = async (checks) => {
    const res = await updateLeadChecks(surveyLead.id, checks);
    setSurveyLead(null);
    setLeads((prev) => prev.map((l) => (l.id === res.lead.id ? res.lead : l)));
    if (detailLead?.id === res.lead.id) setDetailLead(res.lead);
    loadStats();
    const failed = res.lead.evaluation?.failed || 0;
    notice.success(
      failed
        ? `Survey saved — ${failed} check${failed === 1 ? '' : 's'} failed on ${res.lead.referenceNumber}.`
        : `Survey saved for ${res.lead.referenceNumber}.`
    );
  };

  const handleSaveLead = async (payload) => {
    if (formLead) {
      const res = await updateLead(formLead.id, payload);
      setLeads((prev) => prev.map((l) => (l.id === res.lead.id ? res.lead : l)));
      if (detailLead?.id === res.lead.id) setDetailLead(res.lead);
      setFormLead(undefined);
      notice.success(`${res.lead.referenceNumber} was updated.`);
    } else {
      const res = await createLead(payload);
      setLeads((prev) => [res.lead, ...prev]);
      setFormLead(undefined);
      notice.success(`Lead ${res.lead.referenceNumber} was captured.`);
    }
    loadStats();
  };

  const handleResolve = async ({ resolution, note }) => {
    const res = await resolveLead(detailLead.id, { resolution, note });
    setDetailLead(res.lead);
    setLeads((prev) => prev.map((l) => (l.id === res.lead.id ? res.lead : l)));
    loadStats();
    notice.success(`${res.lead.referenceNumber} was marked as ${res.lead.status.replace('-', ' ')}.`);
  };

  const handleStatusChange = async (status) => {
    try {
      const res = await updateLead(detailLead.id, { status });
      setDetailLead(res.lead);
      setLeads((prev) => prev.map((l) => (l.id === res.lead.id ? res.lead : l)));
      notice.success(`${res.lead.referenceNumber} moved to ${leadStatusLabel(status)}.`);
      loadStats();
    } catch (err) {
      notice.error(err.response?.data?.message || 'Failed to change the lead status');
    }
  };

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    setDeleting(true);
    try {
      await deleteLead(pendingDelete.id);
      setLeads((prev) => prev.filter((l) => l.id !== pendingDelete.id));
      if (detailLead?.id === pendingDelete.id) setDetailLead(null);
      setPendingDelete(null);
      notice.success(`${pendingDelete.referenceNumber} was removed.`);
      loadStats();
    } catch (err) {
      notice.error(err.response?.data?.message || 'Failed to remove the lead');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="um-page lm-page">
      {/* ── Hero ── */}
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
              Serviceability
            </span>
            <h1>Lead Management</h1>
            <p>
              Track every new-connection lead, record the site survey and catch the reasons a
              service would break before the customer is committed.
            </p>
          </div>
          <button
            type="button"
            className="um-hero-action"
            onClick={() => setFormLead(null)}
          >
            <span className="um-hero-action-icon">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
              </svg>
            </span>
            Capture Lead
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

      {/* ── Why leads fail ── */}
      {blockingReasons.length > 0 && (
        <section className="lm-reasons lmx-reasons">
          <span className="lmx-reasons-icon" aria-hidden="true">{ICON_RISK}</span>
          <div className="lmx-reasons-body">
            <div className="lm-reasons-head">
              <h2>What is blocking leads</h2>
              <p>Why sites have been ruled out or flagged, across every lead.</p>
            </div>
            <div className="lmx-reason-list">
              {blockingReasons.map((reason) => (
                <div className="lmx-reason" key={reason.label}>
                  <span className="lmx-reason-label">{reason.label}</span>
                  <span className="lmx-reason-track" aria-hidden="true">
                    <span style={{ width: `${Math.max(8, (reason.count / blockingReasons[0].count) * 100)}%` }} />
                  </span>
                  <span className="lmx-reason-count">{reason.count} lead{reason.count === 1 ? '' : 's'}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Tabs ── */}
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

      {/* ── Lead table ── */}
      <section className="um-panel">
        <div className="um-panel-head">
          <div className="um-panel-title">
            <h2>Leads</h2>
            <p>
              {loading
                ? 'Loading…'
                : `Showing ${leads.length} of ${pagination.totalCount} lead${pagination.totalCount === 1 ? '' : 's'}`}
            </p>
          </div>
          <div className="um-toolbar">
            <div className="admin-search um-search">
              <span className="admin-search-icon">{ICON_SEARCH}</span>
              <input
                type="text"
                placeholder="Search name, phone, NIC, address or reference"
                value={filters.search}
                onChange={setFilter('search')}
              />
            </div>
            <select className="admin-select" value={filters.status} onChange={setFilter('status')}>
              <option value="">All Statuses</option>
              {LEAD_STATUS_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            <select className="admin-select" value={filters.riskLevel} onChange={setFilter('riskLevel')}>
              <option value="">All Risk Levels</option>
              {LEAD_RISK_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            <select className="admin-select" value={filters.source} onChange={setFilter('source')}>
              <option value="">All Sources</option>
              {LEAD_SOURCE_OPTIONS.map((opt) => (
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
        ) : leads.length === 0 ? (
          <div className="um-empty-state">
            <span className="um-empty-icon">{ICON_EMPTY}</span>
            <h3>{hasFilters || group !== 'all' ? 'No matches' : 'No leads yet'}</h3>
            <p>
              {hasFilters || group !== 'all'
                ? 'Try a different tab, search term or filter.'
                : 'Use “Capture Lead” to log the first new-connection enquiry.'}
            </p>
          </div>
        ) : (
          <div className="admin-table-wrap um-table-wrap">
            <table className="admin-table um-table lm-table">
              <thead>
                <tr>
                  <th>Reference</th>
                  <th>Customer</th>
                  <th>Site</th>
                  <th>Package</th>
                  <th>Survey</th>
                  <th>Status &amp; risk</th>
                  <th className="lmx-actions-head">Actions</th>
                </tr>
              </thead>
              <tbody>
                {leads.map((lead) => {
                  const signal = signalOf(lead);
                  const signalValue = signal?.value || '';
                  const pct = signalStrengthPercent(signalValue);
                  const tone = signalStrengthTone(signalValue);
                  const checks = checkSummary(lead);
                  const blocked = (lead.blockingIssues || []).length > 0;

                  return (
                    <tr key={lead.id} className={blocked ? 'lm-row-blocked' : ''}>
                      <td>
                        <div className="lm-ref-cell">
                          <span className="lm-ref">{lead.referenceNumber}</span>
                          <small>{timeAgo(lead.createdAt)}</small>
                        </div>
                      </td>
                      <td>
                        <div className="um-user-cell">
                          <span className="um-avatar" style={{ background: avatarGradient(lead.phone || lead.customerName) }} aria-hidden="true">
                            {initials(lead.customerName)}
                          </span>
                          <div className="lm-customer-cell">
                            <span className="lm-customer-name">{lead.customerName}</span>
                            <span className="lm-customer-phone">{lead.phone}</span>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="lm-site-cell">
                          <span className="lm-site-address">{lead.address}</span>
                          <small>{lead.district || sourceLabel(lead.source)}</small>
                        </div>
                      </td>
                      <td>
                        <div className="lm-package-cell">
                          <span>{lead.packageName || '—'}</span>
                          <small>{[lead.speed, lead.technology].filter(Boolean).join(' · ')}</small>
                        </div>
                      </td>
                      <td>
                        <div className="lmx-survey-cell">
                          <div className="lm-checks-cell">
                            <span className="lm-checks-count">{checks.cleared}/{checks.total} checks</span>
                            <div className="lm-check-dots">
                              {lead.checks.map((check) => (
                                <span
                                  key={check.key}
                                  className={`lm-check-dot lm-check-dot--${check.status}`}
                                  title={`${check.label}: ${check.status}`}
                                />
                              ))}
                            </div>
                          </div>
                          {pct === null ? (
                            <span className="lm-muted">Signal not measured</span>
                          ) : (
                            <div className="lm-signal-cell" title={`Optical signal ${signalValue}`}>
                              <span className={`lm-signal-value lm-signal-value--${tone}`}>{signalValue}</span>
                              <div className="lm-signal-track">
                                <span className={`lm-signal-fill lm-signal-fill--${tone}`} style={{ width: `${pct}%` }} />
                              </div>
                            </div>
                          )}
                        </div>
                      </td>
                      <td>
                        <div className="lmx-status-cell">
                          <span className={`lm-pill lm-pill--${leadStatusTone(lead.status)}`}>
                            {leadStatusLabel(lead.status)}
                          </span>
                          <span className={`lm-pill lm-pill--${leadRiskTone(lead.riskLevel)}`}>
                            {leadRiskLabel(lead.riskLevel)}
                          </span>
                          {blocked && (
                            <small className="lm-blocking-note">{lead.blockingIssues.length} blocking</small>
                          )}
                          {lead.surveyDate && (
                            <small className="lm-survey-date">Survey {formatDate(lead.surveyDate)}</small>
                          )}
                        </div>
                      </td>
                      <td>
                        <div className="um-row-actions lmx-row-actions">
                          <button
                            type="button"
                            className="um-action-btn edit"
                            onClick={() => setDetailLead(lead)}
                            aria-label={`Open lead ${lead.referenceNumber}`}
                          >
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8Z" /><circle cx="12" cy="12" r="3" />
                            </svg>
                            <span className="um-action-label">Review</span>
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

        {!loading && leads.length > 0 && (
          <Pager
            page={pagination.currentPage || page}
            totalPages={Math.max(1, pagination.totalPages || 1)}
            onChange={setPage}
            info={`${pagination.totalCount} lead${pagination.totalCount === 1 ? '' : 's'} · page ${pagination.currentPage || page} of ${Math.max(1, pagination.totalPages || 1)}`}
            label="Lead pages"
          />
        )}
      </section>

      {/* ── Modals ── */}
      {formLead !== undefined && (
        <LeadFormModal
          lead={formLead}
          staff={staff}
          onClose={() => setFormLead(undefined)}
          onSave={handleSaveLead}
        />
      )}

      {surveyLead && (
        <LeadSurveyModal
          lead={surveyLead}
          catalog={catalog}
          onClose={() => setSurveyLead(null)}
          onSave={handleSaveSurvey}
        />
      )}

      {detailLead && (
        <LeadDetailModal
          lead={detailLead}
          onClose={() => setDetailLead(null)}
          onRecordSurvey={() => {
            setSurveyLead(detailLead);
          }}
          onResolve={handleResolve}
          onEdit={() => {
            setFormLead(detailLead);
            setDetailLead(null);
          }}
          onStatusChange={handleStatusChange}
          onDelete={() => {
            setPendingDelete(detailLead);
          }}
        />
      )}

      {pendingDelete && (
        <div className="admin-modal-overlay ax-overlay-top" onClick={deleting ? undefined : () => setPendingDelete(null)}>
          <div className="admin-modal ax-modal ax-confirm" onClick={(e) => e.stopPropagation()} role="alertdialog" aria-modal="true" aria-labelledby="lm-delete-title">
            <div className="ax-modal-body ax-confirm-body">
              <span className="ax-confirm-icon" aria-hidden="true">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 6h18" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                </svg>
              </span>
              <h3 id="lm-delete-title">Remove this lead?</h3>
              <p>
                <strong>{pendingDelete.referenceNumber}</strong> · {pendingDelete.customerName}
                <br />
                Its survey results and notes are deleted with it. This cannot be undone.
              </p>
            </div>
            <div className="ax-modal-foot">
              <button type="button" className="admin-btn ghost" onClick={() => setPendingDelete(null)} disabled={deleting} autoFocus>Cancel</button>
              <button type="button" className="admin-btn danger" onClick={confirmDelete} disabled={deleting}>
                {deleting ? 'Removing…' : 'Remove Lead'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
