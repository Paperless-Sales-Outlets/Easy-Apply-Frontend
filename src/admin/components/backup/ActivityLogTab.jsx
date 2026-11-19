import React, { useCallback, useEffect, useState } from 'react';
import { Pager } from '../AdminVisuals';
import { getBackupAuditLog, exportBackupAuditCsv, backupErrorMessage } from '../../services/backupService';
import { AUDIT_ACTION_LABELS, formatDateTime } from '../../utils/backupUtils';

const PAGE_SIZE = 20;
const EMPTY = { search: '', action: '', result: '', from: '', to: '' };

const summarize = (details = {}) => {
  const parts = [];
  if (details.note) parts.push(details.note);
  if (details.reason) parts.push(details.reason);
  if (details.error) parts.push(details.error);
  if (details.stage) parts.push(`during ${String(details.stage).replace(/_/g, ' ')}`);
  if (details.preRestoreBackupId) parts.push(`safety backup ${String(details.preRestoreBackupId).slice(0, 8)}`);
  if (details.totalRows != null) parts.push(`${details.totalRows} rows`);
  return parts.join(' · ') || '—';
};

/** Read-only history of every backup action, with filters and CSV export. */
export default function ActivityLogTab() {
  const [filters, setFilters] = useState(EMPTY);
  const [searchInput, setSearchInput] = useState('');
  const [page, setPage] = useState(1);
  const [logs, setLogs] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    const id = setTimeout(() => {
      setFilters((current) => (current.search === searchInput.trim() ? current : { ...current, search: searchInput.trim() }));
      setPage(1);
    }, 350);
    return () => clearTimeout(id);
  }, [searchInput]);

  const params = useCallback(() => {
    const out = {};
    for (const key of ['search', 'action', 'result', 'from', 'to']) if (filters[key]) out[key] = filters[key];
    return out;
  }, [filters]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError('');
    getBackupAuditLog({ ...params(), page, limit: PAGE_SIZE })
      .then((response) => {
        if (cancelled) return;
        setLogs(response.logs || []);
        setPagination(response.pagination || null);
      })
      .catch(async (err) => {
        if (!cancelled) {
          setLogs([]);
          setError(await backupErrorMessage(err, 'The activity log could not be loaded.'));
        }
      })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [params, page]);

  const update = (key, value) => {
    setPage(1);
    setFilters((current) => ({ ...current, [key]: value }));
  };
  const hasFilters = Object.values(filters).some(Boolean);

  const exportCsv = async () => {
    setExporting(true);
    setError('');
    try {
      await exportBackupAuditCsv(params());
    } catch (err) {
      setError(await backupErrorMessage(err, 'The export failed.'));
    } finally {
      setExporting(false);
    }
  };

  const totalCount = pagination?.totalCount ?? logs.length;
  const totalPages = Math.max(1, pagination?.totalPages ?? 1);

  return (
    <section className="um-panel">
      <div className="um-panel-head alog-head">
        <div className="um-panel-title">
          <h2>Activity log</h2>
          <p>{loading ? 'Loading…' : `${totalCount.toLocaleString('en-GB')} recorded action${totalCount === 1 ? '' : 's'} · read-only`}</p>
        </div>
        <div className="alog-filters">
          <input
            type="search"
            className="um-input bk-filter-search"
            value={searchInput}
            placeholder="Search user, backup or IP"
            aria-label="Search activity"
            onChange={(event) => setSearchInput(event.target.value)}
          />
          <select className="admin-select" value={filters.action} aria-label="Filter by action" onChange={(event) => update('action', event.target.value)}>
            <option value="">All actions</option>
            {Object.entries(AUDIT_ACTION_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </select>
          <select className="admin-select" value={filters.result} aria-label="Filter by result" onChange={(event) => update('result', event.target.value)}>
            <option value="">Any result</option>
            <option value="success">Success</option>
            <option value="failure">Failure</option>
          </select>
          <div className="ax-range" role="group" aria-label="Date range">
            <input type="date" value={filters.from} max={filters.to || undefined} aria-label="From date" onChange={(event) => update('from', event.target.value)} />
            <span aria-hidden="true">to</span>
            <input type="date" value={filters.to} min={filters.from || undefined} aria-label="To date" onChange={(event) => update('to', event.target.value)} />
          </div>
          {hasFilters && <button type="button" className="admin-btn ghost ax-clear" onClick={() => { setSearchInput(''); setFilters(EMPTY); setPage(1); }}>Clear</button>}
          <button type="button" className="admin-btn ghost" onClick={exportCsv} disabled={exporting || totalCount === 0}>
            {exporting ? 'Exporting…' : 'Export CSV'}
          </button>
        </div>
      </div>

      {error && <div className="admin-error-banner" role="alert">{error}</div>}

      {loading ? (
        <div className="dash-table-skeleton">
          {Array.from({ length: 5 }).map((_, i) => <div className="dash-skeleton dash-skeleton-row" key={i} />)}
        </div>
      ) : logs.length === 0 ? (
        <div className="um-empty-state">
          <h3>{hasFilters ? 'No matching activity' : 'No activity yet'}</h3>
          <p>{hasFilters ? 'Try different filters.' : 'Every backup, check, download, restore and deletion is recorded here.'}</p>
        </div>
      ) : (
        <div className="admin-table-wrap um-table-wrap">
          <table className="admin-table um-table">
            <thead>
              <tr><th>When</th><th>Action</th><th>Result</th><th>Who</th><th>IP address</th><th>Backup</th><th>Details</th></tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id}>
                  <td>{formatDateTime(log.createdAt)}</td>
                  <td>{AUDIT_ACTION_LABELS[log.action] || log.action}</td>
                  <td><span className={`admin-badge ${log.result === 'success' ? 'approved' : 'rejected'}`}>{log.result === 'success' ? 'Success' : 'Failure'}</span></td>
                  <td>{log.actorName || 'System'}</td>
                  <td className="bk-mono">{log.ipAddress || '—'}</td>
                  <td><span className="bk-mono" title={log.backupName || ''}>{log.backupId ? log.backupId.slice(0, 8) : '—'}</span></td>
                  <td><span className="bk-note bk-note-wide" title={summarize(log.details)}>{summarize(log.details)}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {!loading && totalPages > 1 && <Pager page={page} totalPages={totalPages} onChange={setPage} label="Activity pages" />}
    </section>
  );
}
