import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { getAuditLogs } from '../services/adminService';
import { AnimatedNumber, Pager, timeAgo } from '../components/AdminVisuals';

const PAGE_SIZE = 15;

const svg = (paths, strokeWidth = 2.2) => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">{paths}</svg>
);

const ACTION_META = {
  LOGIN: { label: 'Sign in', cls: 'audit-action-login', icon: svg(<><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" /><path d="m10 17 5-5-5-5" /><path d="M15 12H3" /></>) },
  LOGOUT: { label: 'Sign out', cls: 'audit-action-logout', icon: svg(<><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><path d="m16 17 5-5-5-5" /><path d="M21 12H9" /></>) },
  CREATE: { label: 'Created', cls: 'audit-action-create', icon: svg(<><path d="M12 5v14M5 12h14" /></>, 2.6) },
  UPDATE: { label: 'Updated', cls: 'audit-action-update', icon: svg(<><path d="M12 20h9" /><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" /></>) },
  STATUS_UPDATE: { label: 'Status change', cls: 'audit-action-status', icon: svg(<><path d="M17 1l4 4-4 4" /><path d="M3 11V9a4 4 0 0 1 4-4h14" /><path d="m7 23-4-4 4-4" /><path d="M21 13v2a4 4 0 0 1-4 4H3" /></>) },
  DELETE: { label: 'Deleted', cls: 'audit-action-delete', icon: svg(<><path d="M3 6h18" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></>) },
  VIEW: { label: 'Viewed', cls: 'audit-action-view', icon: svg(<><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8Z" /><circle cx="12" cy="12" r="3" /></>) },
  ADD_COMMENT: { label: 'Comment', cls: 'audit-action-comment', icon: svg(<><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></>) },
};

const ACTIONS = Object.keys(ACTION_META);

// Modules the backend records today; any other module seen in the results is added to the list.
const KNOWN_MODULES = [
  'Application', 'Appointments', 'Authentication', 'Forms/Requests', 'KYC',
  'Lead Management', 'Sales Officer Management', 'User Management',
];

const EMPTY_FILTERS = { search: '', action: '', module: '', from: '', to: '' };

const ICON_SEARCH = (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

const ICON_LOG = (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 4h16v16H4z" /><path d="M8 8h8M8 12h8M8 16h5" />
  </svg>
);

const ICON_TODAY = (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" />
  </svg>
);

const ICON_SYSTEM = (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="4" y="7" width="16" height="12" rx="3" /><path d="M12 3v4M9 12h.01M15 12h.01M9 16h6" />
  </svg>
);

const ICON_CHEVRON = (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m6 9 6 6 6-6" />
  </svg>
);

// The API reads a bare YYYY-MM-DD as UTC midnight, which is 05:30 in Sri Lanka —
// send the local day's start / end as full timestamps instead.
const dayStartIso = (value) => new Date(`${value}T00:00:00`).toISOString();
const dayEndIso = (value) => new Date(`${value}T23:59:59.999`).toISOString();

const startOfToday = () => {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
};

function getLogsFromResponse(response) {
  if (Array.isArray(response)) return response;
  return response?.auditLogs || response?.logs || response?.data || [];
}

function actorName(log) {
  const actor = log.userName || log.user || log.admin || log.actor || log.performedBy;
  if (!actor) return 'System';
  if (typeof actor === 'string') return actor;
  return actor.name || actor.email || actor.employeeNumber || actor.username || 'System';
}

// "System" (no user on the entry) and the automated reviewers, e.g. "Automated KYC".
const isAutomated = (name) => /^system$/i.test(name) || /^automated\b/i.test(name);

const initials = (name) => (name || '').split(' ').filter(Boolean).map((n) => n[0]).slice(0, 2).join('').toUpperCase() || '?';

function readableKey(key) {
  return String(key)
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/[_-]+/g, ' ')
    .replace(/^./, (character) => character.toUpperCase());
}

function readableValue(value) {
  if (value == null || value === '') return '—';
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  if (Array.isArray(value)) return value.length ? value.map(readableValue).join(', ') : '—';
  if (typeof value === 'object') return JSON.stringify(value);
  return String(value);
}

function normalizeLog(log, index) {
  const metadata = log.metadata && typeof log.metadata === 'object' ? log.metadata : null;
  return {
    id: log.id || log._id || `${log.timestamp || log.createdAt || 'log'}-${index}`,
    timestamp: log.timestamp || log.createdAt || log.date || log.updatedAt,
    actor: actorName(log),
    action: String(log.action || log.event || 'VIEW').toUpperCase(),
    module: log.module || log.resource || log.area || '—',
    target: log.reference || log.referenceNumber || log.target || log.targetId || log.entityId || '',
    description: log.description || log.message || (typeof log.details === 'string' ? log.details : ''),
    metadata: metadata && Object.keys(metadata).length ? metadata : null,
  };
}

function dayLabel(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Unknown date';
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);
  if (date.toDateString() === today.toDateString()) return 'Today';
  if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';
  return date.toLocaleDateString('en-GB', { weekday: 'long', day: '2-digit', month: 'short', year: 'numeric' });
}

const timeOnly = (value) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
};

function MetadataView({ metadata }) {
  const isStatusChange = 'previousStatus' in metadata && 'newStatus' in metadata;
  const entries = Object.entries(metadata).filter(([key]) => !(isStatusChange && (key === 'previousStatus' || key === 'newStatus')));
  return (
    <div className="alog-meta">
      {isStatusChange && (
        <div className="alog-meta-change">
          <span className="alog-meta-from">{readableValue(metadata.previousStatus)}</span>
          <span className="alog-meta-arrow" aria-hidden="true">→</span>
          <span className="alog-meta-to">{readableValue(metadata.newStatus)}</span>
        </div>
      )}
      {entries.length > 0 && (
        <dl className="alog-meta-grid">
          {entries.map(([key, value]) => (
            <div key={key} className={readableValue(value).length > 60 ? 'is-wide' : undefined}>
              <dt>{readableKey(key)}</dt>
              <dd>{readableValue(value)}</dd>
            </div>
          ))}
        </dl>
      )}
    </div>
  );
}

export default function AuditLogsPage() {
  const [logs, setLogs] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [searchInput, setSearchInput] = useState('');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expanded, setExpanded] = useState(null);
  const [summary, setSummary] = useState(null);

  // Debounce the search box so typing does not fire a request per keystroke.
  useEffect(() => {
    const id = setTimeout(() => {
      setFilters((current) => (current.search === searchInput.trim() ? current : { ...current, search: searchInput.trim() }));
      setPage(1);
    }, 350);
    return () => clearTimeout(id);
  }, [searchInput]);

  const loadLogs = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = {
        page,
        limit: PAGE_SIZE,
        sortBy: 'createdAt',
        sortOrder: 'desc',
      };
      if (filters.search) params.search = filters.search;
      if (filters.action) params.action = filters.action;
      if (filters.module) params.module = filters.module;
      if (filters.from) params.from = dayStartIso(filters.from);
      if (filters.to) params.to = dayEndIso(filters.to);
      const response = await getAuditLogs(params);
      const responseLogs = getLogsFromResponse(response);
      setLogs(responseLogs.map(normalizeLog));
      setPagination(response?.pagination || null);
      setExpanded(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load audit logs');
      setLogs([]);
      setPagination(null);
    } finally {
      setLoading(false);
    }
  }, [filters, page]);

  useEffect(() => {
    loadLogs();
  }, [loadLogs]);

  // Headline counts for today — each is a one-row count query.
  useEffect(() => {
    let cancelled = false;
    const today = { from: startOfToday(), to: new Date().toISOString() };
    const count = (params) => getAuditLogs({ ...params, page: 1, limit: 1 })
      .then((res) => res?.pagination?.totalCount ?? 0)
      .catch(() => null);
    Promise.all([
      count(today),
      count({ ...today, action: 'LOGIN' }),
      count({ ...today, action: 'STATUS_UPDATE' }),
    ]).then(([todayCount, signIns, statusChanges]) => {
      if (!cancelled) setSummary({ today: todayCount, signIns, statusChanges });
    });
    return () => { cancelled = true; };
  }, []);

  const moduleOptions = useMemo(() => {
    const seen = logs.map((log) => log.module).filter((module) => module !== '—');
    return [...new Set([...KNOWN_MODULES, ...seen])].sort();
  }, [logs]);

  const updateFilter = (key, value) => {
    setPage(1);
    setFilters((current) => ({ ...current, [key]: value }));
  };

  const hasFilters = Boolean(filters.search || filters.action || filters.module || filters.from || filters.to);
  const clearFilters = () => {
    setSearchInput('');
    setFilters(EMPTY_FILTERS);
    setPage(1);
  };

  const totalCount = pagination?.totalCount ?? logs.length;
  const currentPage = pagination?.currentPage ?? page;
  const totalPages = Math.max(1, pagination?.totalPages ?? 1);
  const firstShown = totalCount ? (currentPage - 1) * PAGE_SIZE + 1 : 0;
  const lastShown = Math.min(totalCount, (currentPage - 1) * PAGE_SIZE + logs.length);

  // Rows grouped under a day heading, newest first (the API already sorts).
  const groups = useMemo(() => {
    const out = [];
    logs.forEach((log) => {
      const label = dayLabel(log.timestamp);
      const last = out[out.length - 1];
      if (last && last.label === label) last.logs.push(log);
      else out.push({ label, logs: [log] });
    });
    return out;
  }, [logs]);

  const tiles = [
    { key: 'total', cls: 'total', icon: ICON_LOG, label: hasFilters ? 'Matching events' : 'Total events', value: totalCount, foot: hasFilters ? 'With the current filters' : 'Every recorded action' },
    { key: 'today', cls: 'roles', icon: ICON_TODAY, label: 'Events today', value: summary?.today, foot: 'Since midnight' },
    { key: 'signins', cls: 'active', icon: ACTION_META.LOGIN.icon, label: 'Sign-ins today', value: summary?.signIns, foot: 'Successful logins' },
    { key: 'status', cls: 'status', icon: ACTION_META.STATUS_UPDATE.icon, label: 'Status changes today', value: summary?.statusChanges, foot: 'Applications, KYC and leads' },
  ];

  return (
    <div className="um-page audit-page alog-page">
      <section className="um-hero audit-hero">
        <div className="um-hero-deco" aria-hidden="true">
          <span className="um-hero-orb" />
          <span className="um-hero-slash" />
          <span className="um-hero-grid" />
        </div>
        <div className="um-hero-top">
          <div className="um-hero-text">
            <span className="um-hero-eyebrow">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
              Security &amp; compliance
            </span>
            <h1>Audit Logs</h1>
            <p>Every action taken in the Admin Portal, who took it and what it changed.</p>
          </div>
        </div>
        <div className="um-hero-tiles">
          {tiles.map((tile, idx) => (
            <div className={`um-hero-tile ${tile.cls}`} key={tile.key} style={{ '--i': idx }}>
              <div className="um-hero-tile-head"><span className="um-hero-tile-icon">{tile.icon}</span>{tile.label}</div>
              <div className="um-hero-tile-value">
                {tile.value == null || (tile.key === 'total' && loading && !pagination)
                  ? <span className="dash-skeleton um-hero-skeleton" />
                  : <AnimatedNumber value={tile.value} />}
              </div>
              <div className="um-hero-tile-foot">{tile.foot}</div>
            </div>
          ))}
        </div>
      </section>

      {error && <div className="admin-error-banner" role="alert">{error}</div>}

      <section className="um-panel audit-panel">
        <div className="um-panel-head alog-head">
          <div className="um-panel-title">
            <h2>Activity history</h2>
            <p>{loading ? 'Loading…' : totalCount ? `Showing ${firstShown}–${lastShown} of ${totalCount.toLocaleString('en-GB')} events` : 'No events'}</p>
          </div>
          <div className="alog-filters">
            <div className="admin-search um-search alog-search">
              <span className="admin-search-icon">{ICON_SEARCH}</span>
              <input
                type="search"
                value={searchInput}
                placeholder="Search user, description or reference"
                aria-label="Search audit logs"
                onChange={(event) => setSearchInput(event.target.value)}
              />
            </div>
            <select className="admin-select" value={filters.action} aria-label="Filter by action" onChange={(event) => updateFilter('action', event.target.value)}>
              <option value="">All actions</option>
              {ACTIONS.map((action) => <option key={action} value={action}>{ACTION_META[action].label}</option>)}
            </select>
            <select className="admin-select" value={filters.module} aria-label="Filter by module" onChange={(event) => updateFilter('module', event.target.value)}>
              <option value="">All modules</option>
              {moduleOptions.map((module) => <option key={module} value={module}>{module}</option>)}
            </select>
            <div className="ax-range" role="group" aria-label="Date range">
              <input type="date" value={filters.from} max={filters.to || undefined} aria-label="From date" onChange={(event) => updateFilter('from', event.target.value)} />
              <span aria-hidden="true">to</span>
              <input type="date" value={filters.to} min={filters.from || undefined} aria-label="To date" onChange={(event) => updateFilter('to', event.target.value)} />
            </div>
            {hasFilters && <button type="button" className="admin-btn ghost ax-clear" onClick={clearFilters}>Clear</button>}
          </div>
        </div>

        {loading ? (
          <div className="dash-table-skeleton">
            {Array.from({ length: 5 }).map((_, i) => <div className="dash-skeleton dash-skeleton-row" key={i} />)}
          </div>
        ) : logs.length === 0 ? (
          <div className="um-empty-state">
            <span className="um-empty-icon">{ICON_LOG}</span>
            <h3>{hasFilters ? 'No matching events' : 'No activity yet'}</h3>
            <p>{hasFilters ? 'Try a different search, action, module or date range.' : 'Actions taken in the Admin Portal will be listed here.'}</p>
          </div>
        ) : (
          <div className="admin-table-wrap um-table-wrap alog-table-wrap">
            <table className="admin-table um-table alog-table">
              <thead>
                <tr>
                  <th>Time</th>
                  <th>User</th>
                  <th>Action</th>
                  <th>Module</th>
                  <th>What happened</th>
                  <th aria-label="Details" />
                </tr>
              </thead>
              <tbody>
                {groups.map((group) => (
                  <React.Fragment key={group.label}>
                    <tr className="alog-day-row">
                      <td colSpan={6}>
                        <span className="alog-day">{group.label}</span>
                        <span className="alog-day-count">{group.logs.length} event{group.logs.length === 1 ? '' : 's'}</span>
                      </td>
                    </tr>
                    {group.logs.map((log) => {
                      const meta = ACTION_META[log.action];
                      const open = expanded === log.id;
                      const automated = isAutomated(log.actor);
                      return (
                        <React.Fragment key={log.id}>
                          <tr
                            className={`alog-row${log.metadata ? ' is-expandable' : ''}${open ? ' is-open' : ''}`}
                            onClick={log.metadata ? () => setExpanded(open ? null : log.id) : undefined}
                          >
                            <td>
                              <div className="alog-time" title={new Date(log.timestamp).toLocaleString('en-GB')}>
                                <strong>{timeOnly(log.timestamp)}</strong>
                                <small>{timeAgo(log.timestamp)}</small>
                              </div>
                            </td>
                            <td>
                              <div className="alog-actor">
                                <span className={`alog-avatar${automated ? ' is-system' : ''}`} aria-hidden="true">
                                  {automated ? ICON_SYSTEM : initials(log.actor)}
                                </span>
                                <span className="alog-actor-name">{log.actor}</span>
                              </div>
                            </td>
                            <td>
                              <span className={`audit-action-badge alog-action ${meta?.cls || 'audit-action-default'}`} title={log.action}>
                                {meta?.icon}
                                {meta?.label || readableKey(log.action.toLowerCase())}
                              </span>
                            </td>
                            <td><span className="alog-module">{log.module}</span></td>
                            <td>
                              <div className="alog-what">
                                <span className="alog-desc">{log.description || '—'}</span>
                                {log.target && <span className="alog-target" title={log.target}>{log.target}</span>}
                              </div>
                            </td>
                            <td className="alog-caret-cell">
                              {log.metadata && (
                                <button
                                  type="button"
                                  className={`alog-caret${open ? ' is-open' : ''}`}
                                  aria-expanded={open}
                                  aria-label={open ? 'Hide details' : 'Show details'}
                                  onClick={(event) => { event.stopPropagation(); setExpanded(open ? null : log.id); }}
                                >
                                  {ICON_CHEVRON}
                                </button>
                              )}
                            </td>
                          </tr>
                          {open && (
                            <tr className="alog-detail-row">
                              <td colSpan={6}><MetadataView metadata={log.metadata} /></td>
                            </tr>
                          )}
                        </React.Fragment>
                      );
                    })}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!loading && totalPages > 1 && (
          <Pager page={currentPage} totalPages={totalPages} onChange={setPage} label="Audit log pages" />
        )}
      </section>
    </div>
  );
}
