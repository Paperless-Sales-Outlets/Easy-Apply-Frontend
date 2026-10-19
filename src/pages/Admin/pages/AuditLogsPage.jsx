import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { getAuditLogs } from '../services/adminService';

const PAGE_SIZE = 15;
const ACTIONS = ['LOGIN', 'LOGOUT', 'CREATE', 'UPDATE', 'STATUS_UPDATE', 'DELETE', 'VIEW', 'ADD_COMMENT', 'LOOP_CHECK'];

const ACTION_BADGE_CLASS = {
  LOGIN: 'audit-action-login',
  LOGOUT: 'audit-action-logout',
  CREATE: 'audit-action-create',
  UPDATE: 'audit-action-update',
  STATUS_UPDATE: 'audit-action-status',
  DELETE: 'audit-action-delete',
  VIEW: 'audit-action-view',
  ADD_COMMENT: 'audit-action-comment',
  LOOP_CHECK: 'audit-action-loop-check',
};

const ACTION_LABELS = {
  LOOP_CHECK: 'Loop Check',
};

function getLogsFromResponse(response) {
  if (Array.isArray(response)) return response;
  return response?.auditLogs || response?.logs || response?.data || [];
}

function getPaginationFromResponse(response, logCount) {
  if (response?.pagination) return response.pagination;
  return {
    currentPage: 1,
    totalPages: logCount < PAGE_SIZE ? 1 : 2,
    totalCount: logCount,
    hasPrevPage: false,
    hasNextPage: logCount === PAGE_SIZE,
  };
}

function actorName(actor) {
  if (!actor) return 'System';
  if (typeof actor === 'string') return actor;
  return actor.name || actor.email || actor.employeeNumber || actor.username || actor._id || 'System';
}

function firstValue(...values) {
  const value = values.find((candidate) => candidate != null && candidate !== '');
  return readableDetailValue(value);
}

function customerDisplay(log, details) {
  const customer = log.customer && typeof log.customer === 'object' ? log.customer : {};
  const name = firstValue(log.customerName, customer.name, customer.fullName);
  const id = firstValue(log.customerId, customer.id, customer._id, details.customerId);

  if (name !== '—' && id !== '—') return `${name} / ${id}`;
  return firstValue(name, id, typeof log.customer === 'string' ? log.customer : null, actorName(log.user || log.admin || log.actor || log.performedBy));
}

function formatDateTime(value) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);
}

function readableDetailKey(key) {
  return String(key)
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/[_-]+/g, ' ')
    .replace(/^./, (character) => character.toUpperCase());
}

function readableDetailValue(value) {
  if (value == null || value === '') return '—';
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  if (typeof value === 'object') return JSON.stringify(value);
  return String(value);
}

function formatDetails(details) {
  if (details == null || details === '') return '—';
  if (typeof details === 'string') return details;
  try {
    const entries = Object.entries(details);
    if (!entries.length) return '—';

    const isStatusChange = Object.prototype.hasOwnProperty.call(details, 'previousStatus')
      && Object.prototype.hasOwnProperty.call(details, 'newStatus');
    if (isStatusChange) {
      return `${readableDetailValue(details.previousStatus)} → ${readableDetailValue(details.newStatus)}`;
    }

    return entries
      .map(([key, value]) => `${readableDetailKey(key)}: ${readableDetailValue(value)}`)
      .join(' · ');
  } catch {
    return String(details);
  }
}

function formatLoopCheckDetails(details, result) {
  if (!details || typeof details !== 'object') return formatDetails(details);

  const area = firstValue(details.area, details.coverage?.area);
  const availability = result !== '—'
    ? result
    : details.available == null ? '—' : (details.available ? 'AVAILABLE' : 'UNAVAILABLE');

  return [
    `Result: ${availability}`,
    area !== '—' ? `Area: ${area}` : null,
  ].filter(Boolean).join(' · ') || '—';
}

function getLoopCheckResult(...values) {
  const value = values.find((candidate) => candidate != null && candidate !== '');
  if (value && typeof value === 'object') {
    return firstValue(value.loopStatus, value.status, value.available == null ? null : (value.available ? 'AVAILABLE' : 'UNAVAILABLE'));
  }
  return firstValue(value);
}

function normalizeLog(log, index) {
  const action = String(log.action || log.actionType || log.event || 'VIEW').toUpperCase();
  const details = log.details || log.metadata || {};
  const loopCheckResult = getLoopCheckResult(
    log.loopCheckResult,
    log.loopCheckStatus,
    log.loopCheck,
    log.result,
    details.loopCheckResult,
    details.loopStatus,
    details.result,
    details.coverage?.loopStatus,
    details.available == null ? null : (details.available ? 'AVAILABLE' : 'UNAVAILABLE'),
  );
  const normalizedDetails = action === 'LOOP_CHECK'
    ? formatLoopCheckDetails(details, loopCheckResult)
    : formatDetails(log.details || log.metadata || log.description || log.message);

  return {
    id: log.id || log._id || `${log.timestamp || log.createdAt || 'log'}-${index}`,
    timestamp: log.timestamp || log.createdAt || log.date || log.updatedAt,
    customer: customerDisplay(log, details),
    action,
    module: log.module || log.resource || log.area || (action === 'LOOP_CHECK' ? 'New Connection' : '—'),
    target: firstValue(
      log.connectionReference,
      log.connectionRef,
      log.referenceNumber,
      log.reference,
      details.connectionReference,
      details.connectionRef,
      details.referenceNumber,
      log.target,
      log.targetId,
      log.entityId,
    ),
    result: loopCheckResult,
    details: normalizedDetails,
  };
}

export default function AuditLogsPage() {
  const [logs, setLogs] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [filters, setFilters] = useState({ search: '', category: '', action: '', module: '', date: '' });
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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
      Object.entries(filters).forEach(([key, value]) => {
        if (value && key !== 'category') params[key] = value;
      });
      if (filters.category === 'customer') params.actorType = 'customer';
      if (filters.category === 'staff') params.actorType = 'staff';
      const response = await getAuditLogs(params);
      const responseLogs = getLogsFromResponse(response);
      setLogs(responseLogs.map(normalizeLog));
      setPagination(getPaginationFromResponse(response, responseLogs.length));
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

  const moduleOptions = useMemo(() => {
    const responseModules = pagination?.filters?.modules || pagination?.modules || [];
    const currentModules = logs.map((log) => log.module).filter((module) => module !== '—');
    return [...new Set([...responseModules, ...currentModules])].sort();
  }, [logs, pagination]);

  const updateFilter = (key, value) => {
    setPage(1);
    setFilters((current) => ({ ...current, [key]: value }));
  };

  const totalCount = pagination?.totalCount ?? logs.length;
  const currentPage = pagination?.currentPage ?? page;
  const totalPages = pagination?.totalPages ?? 1;
  const hasPrevious = pagination?.hasPrevPage ?? currentPage > 1;
  const hasNext = pagination?.hasNextPage ?? currentPage < totalPages;

  return (
    <div className="um-page audit-page">
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
                <path d="M4 4h16v16H4z" /><path d="M8 8h8M8 12h8M8 16h5" />
              </svg>
              Security &amp; compliance
            </span>
            <h1>Audit Logs</h1>
            <p>Review the activity trail across the Admin Portal, with every event linked to its user and target.</p>
          </div>
          <span className="audit-hero-icon" aria-hidden="true">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 4h16v16H4z" /><path d="M8 8h8M8 12h8M8 16h5" />
            </svg>
          </span>
        </div>
        <div className="um-hero-tiles audit-hero-tiles">
          <div className="um-hero-tile total">
            <div className="um-hero-tile-head"><span className="um-hero-tile-icon">#</span>Total events</div>
            <div className="um-hero-tile-value">{loading ? '—' : totalCount}</div>
            <div className="um-hero-tile-foot">Matching the current filters</div>
          </div>
          <div className="um-hero-tile active">
            <div className="um-hero-tile-head"><span className="um-hero-tile-icon">A</span>Action types</div>
            <div className="um-hero-tile-value">{ACTIONS.length}</div>
            <div className="um-hero-tile-foot">Tracked event categories</div>
          </div>
        </div>
      </section>

      {error && <div className="admin-error-banner" role="alert">{error}</div>}

      <section className="um-panel audit-panel">
        <div className="um-panel-head audit-panel-head">
          <div className="um-panel-title">
            <h2>Activity history</h2>
            <p>Latest administrative actions appear first.</p>
          </div>
          <div className="audit-filter-row">
            <label className="admin-search audit-search">
              <span className="admin-search-icon" aria-hidden="true">⌕</span>
              <input
                type="search"
                value={filters.search}
                placeholder="Search logs..."
                aria-label="Search audit logs"
                onChange={(event) => updateFilter('search', event.target.value)}
              />
            </label>
            <select className="admin-select" value={filters.category} aria-label="Filter by activity category" onChange={(event) => updateFilter('category', event.target.value)}>
              <option value="">All activities</option>
              <option value="customer">Customer activities</option>
              <option value="staff">Admin/staff activities</option>
            </select>
            <select className="admin-select" value={filters.action} aria-label="Filter by action" onChange={(event) => updateFilter('action', event.target.value)}>
              <option value="">All actions</option>
              {ACTIONS.map((action) => <option key={action} value={action}>{ACTION_LABELS[action] || action}</option>)}
            </select>
            <select className="admin-select" value={filters.module} aria-label="Filter by module" onChange={(event) => updateFilter('module', event.target.value)}>
              <option value="">All modules</option>
              {moduleOptions.map((module) => <option key={module} value={module}>{module}</option>)}
            </select>
            <input className="admin-select audit-date-filter" type="date" value={filters.date} aria-label="Filter by date" onChange={(event) => updateFilter('date', event.target.value)} />
          </div>
        </div>

        <div className="admin-table-wrap um-table-wrap audit-table-wrap">
          <table className="admin-table um-table audit-table">
            <thead>
              <tr>
                <th>Date &amp; Time</th>
                <th>Customer Name / ID</th>
                <th>Action</th>
                <th>Module</th>
                <th>Connection Reference</th>
                <th>Loop Check Result</th>
                <th>Details</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="7" className="audit-state">Loading audit logs...</td></tr>
              ) : logs.length === 0 ? (
                <tr><td colSpan="7" className="audit-state">No audit logs match the selected filters.</td></tr>
              ) : logs.map((log) => (
                <tr key={log.id}>
                  <td className="audit-date-cell">{formatDateTime(log.timestamp)}</td>
                  <td><span className="audit-actor">{log.customer}</span></td>
                  <td><span className={`audit-action-badge ${ACTION_BADGE_CLASS[log.action] || 'audit-action-default'}`}>{log.action}</span></td>
                  <td><span className="audit-module">{log.module}</span></td>
                  <td><span className="audit-target">{log.target}</span></td>
                  <td><span className="audit-loop-result">{log.result}</span></td>
                  <td className="audit-details" title={log.details}>{log.details}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {!loading && logs.length > 0 && (
          <div className="admin-pagination audit-pagination">
            <span>{totalCount} event{totalCount === 1 ? '' : 's'}</span>
            <button type="button" className="admin-page-btn" disabled={!hasPrevious} onClick={() => setPage((current) => current - 1)}>Previous</button>
            <span>Page {currentPage} of {totalPages}</span>
            <button type="button" className="admin-page-btn" disabled={!hasNext} onClick={() => setPage((current) => current + 1)}>Next</button>
          </div>
        )}
      </section>
    </div>
  );
}
