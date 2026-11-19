import React, { useEffect, useRef, useState } from 'react';
import { Pager } from '../AdminVisuals';
import {
  STAGE_LABELS, RESTORE_STAGE_LABELS, STATUS_BADGE, STATUS_LABELS, TYPE_LABELS,
  actionBlockedReason, deleteBlockedReason, formatBytes, formatDateTime, formatDuration, isOperationRunning, shortChecksum,
} from '../../utils/backupUtils';

const ICON_SEARCH = (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

const ICON_DB = (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <ellipse cx="12" cy="5" rx="8" ry="3" /><path d="M4 5v6c0 1.66 3.58 3 8 3s8-1.34 8-3V5" /><path d="M4 11v6c0 1.66 3.58 3 8 3s8-1.34 8-3v-6" />
  </svg>
);

function runningLabel(backup) {
  if (backup.status === 'in_progress') return STAGE_LABELS[backup.stage] || 'Working';
  if (backup.restoreResult?.status === 'running') return RESTORE_STAGE_LABELS[backup.restoreResult.stage] || 'Restoring';
  if (backup.testRestoreResult?.status === 'running') return 'Test restore running';
  if (backup.verifyResult?.status === 'running') return 'Verifying';
  return '';
}

/** A compact "⋯" menu of the actions available for one backup. Unavailable actions are disabled with the reason as a tooltip. */
function RowActions({ backup, summary, onAction }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const onDown = (event) => { if (ref.current && !ref.current.contains(event.target)) setOpen(false); };
    const onKey = (event) => { if (event.key === 'Escape') setOpen(false); };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const blocked = actionBlockedReason(backup, summary);
  const deleteBlocked = deleteBlockedReason(backup, summary);
  const items = [
    { key: 'verify', label: 'Verify integrity', reason: blocked },
    { key: 'download', label: 'Download…', reason: blocked },
    { key: 'test-restore', label: 'Test restore', reason: blocked },
    { key: 'restore', label: 'Restore…', reason: blocked, danger: true },
    { key: 'delete', label: 'Delete…', reason: deleteBlocked, danger: true },
  ];

  return (
    <div className="bk-actions" ref={ref}>
      <button type="button" className="admin-btn ghost bk-details-btn" onClick={() => onAction('details', backup)}>Details</button>
      <button
        type="button"
        className="admin-btn ghost bk-menu-btn"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={`More actions for ${backup.note}`}
        onClick={() => setOpen((value) => !value)}
      >
        ⋯
      </button>
      {open && (
        <div className="bk-menu" role="menu">
          {items.map((item) => (
            <button
              key={item.key}
              type="button"
              role="menuitem"
              className={`bk-menu-item${item.danger ? ' is-danger' : ''}`}
              disabled={Boolean(item.reason)}
              title={item.reason || undefined}
              onClick={() => { setOpen(false); onAction(item.key, backup); }}
            >
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/** "Recent backups": filters, the table and pagination. Data and actions live in the page. */
export default function BackupsTab({
  backups, pagination, loading, error, filters, searchInput, onSearchInput, onFilter, onClear, page, onPage, summary, onAction,
}) {
  const hasFilters = Boolean(filters.search || filters.status || filters.type || filters.from || filters.to);
  const totalCount = pagination?.totalCount ?? backups.length;
  const pageSize = pagination?.pageSize ?? 15;
  const totalPages = Math.max(1, pagination?.totalPages ?? 1);
  const first = totalCount ? (page - 1) * pageSize + 1 : 0;
  const last = Math.min(totalCount, (page - 1) * pageSize + backups.length);

  return (
    <section className="um-panel">
      <div className="um-panel-head alog-head">
        <div className="um-panel-title">
          <h2>Recent backups</h2>
          <p>{loading && !backups.length ? 'Loading…' : totalCount ? `Showing ${first}–${last} of ${totalCount}` : 'No backups'}</p>
        </div>
        <div className="alog-filters">
          <div className="admin-search um-search alog-search">
            <span className="admin-search-icon">{ICON_SEARCH}</span>
            <input
              type="search"
              value={searchInput}
              placeholder="Search note or backup ID"
              aria-label="Search backups"
              onChange={(event) => onSearchInput(event.target.value)}
            />
          </div>
          <select className="admin-select" value={filters.status} aria-label="Filter by status" onChange={(event) => onFilter('status', event.target.value)}>
            <option value="">All statuses</option>
            {Object.entries(STATUS_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </select>
          <select className="admin-select" value={filters.type} aria-label="Filter by type" onChange={(event) => onFilter('type', event.target.value)}>
            <option value="">All types</option>
            {Object.entries(TYPE_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </select>
          <div className="ax-range" role="group" aria-label="Date range">
            <input type="date" value={filters.from} max={filters.to || undefined} aria-label="From date" onChange={(event) => onFilter('from', event.target.value)} />
            <span aria-hidden="true">to</span>
            <input type="date" value={filters.to} min={filters.from || undefined} aria-label="To date" onChange={(event) => onFilter('to', event.target.value)} />
          </div>
          {hasFilters && <button type="button" className="admin-btn ghost ax-clear" onClick={onClear}>Clear</button>}
        </div>
      </div>

      {error && <div className="admin-error-banner" role="alert">{error}</div>}

      {loading && !backups.length ? (
        <div className="dash-table-skeleton">
          {Array.from({ length: 5 }).map((_, i) => <div className="dash-skeleton dash-skeleton-row" key={i} />)}
        </div>
      ) : backups.length === 0 ? (
        <div className="um-empty-state">
          <span className="um-empty-icon">{ICON_DB}</span>
          <h3>{hasFilters ? 'No matching backups' : 'No backups yet'}</h3>
          <p>{hasFilters ? 'Try a different search, status, type or date range.' : 'Use “Create backup” to take the first one. Backups are only ever created manually.'}</p>
        </div>
      ) : (
        <div className="admin-table-wrap um-table-wrap">
          <table className="admin-table um-table bk-table">
            <thead>
              <tr>
                <th>Backup</th>
                <th>Date &amp; time</th>
                <th>Created by</th>
                <th>Type</th>
                <th>Note</th>
                <th className="bk-num">Size</th>
                <th>Duration</th>
                <th>Status</th>
                <th>Checksum</th>
                <th>Storage</th>
                <th aria-label="Actions" />
              </tr>
            </thead>
            <tbody>
              {backups.map((backup) => {
                const progress = runningLabel(backup);
                return (
                  <tr key={backup.id}>
                    <td>
                      <div className="bk-name" title={backup.fileName}>
                        <strong className="bk-mono">{backup.id.slice(0, 8)}</strong>
                        {backup.purpose === 'pre_restore' && <span className="admin-badge scheduled">Auto</span>}
                      </div>
                    </td>
                    <td>{formatDateTime(backup.startedAt)}</td>
                    <td>{backup.createdByName || '—'}</td>
                    <td>{TYPE_LABELS[backup.type] || backup.type}</td>
                    <td><span className="bk-note" title={backup.note}>{backup.note}</span></td>
                    <td className="bk-num">{formatBytes(backup.sizeBytes)}</td>
                    <td>{backup.status === 'in_progress' ? '…' : formatDuration(backup.durationMs)}</td>
                    <td>
                      <span className={`admin-badge ${STATUS_BADGE[backup.status] || ''}`}>{STATUS_LABELS[backup.status] || backup.status}</span>
                      {progress && <small className="bk-progress-text"><span className="bk-spinner" aria-hidden="true" />{progress}</small>}
                      {!progress && backup.status === 'success' && backup.verifyResult?.status === 'failed' && <small className="bk-warn-text">Verify failed</small>}
                      {!progress && backup.status === 'success' && backup.restoreResult?.status === 'failed' && <small className="bk-warn-text">Restore failed</small>}
                    </td>
                    <td><span className="bk-mono" title={backup.checksum || ''}>{shortChecksum(backup.checksum)}</span></td>
                    <td><span className="bk-note" title={backup.storagePath || ''}>{backup.storageBackend === 's3' ? 'S3' : 'Local'}{backup.storagePath ? ` · ${backup.storagePath}` : ''}</span></td>
                    <td>
                      <RowActions backup={backup} summary={summary} onAction={onAction} />
                      {isOperationRunning(backup) && <span className="sr-only">An operation is running</span>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {!loading && totalPages > 1 && <Pager page={page} totalPages={totalPages} onChange={onPage} label="Backup pages" />}
    </section>
  );
}
