import React, { useEffect, useState } from 'react';
import BackupModal from './BackupModal';
import { getBackupDetails } from '../../services/backupService';
import {
  AUDIT_ACTION_LABELS, RESTORE_STAGE_LABELS, STAGE_LABELS, STATUS_BADGE, STATUS_LABELS, TYPE_LABELS,
  describeContents, formatBytes, formatDateTime, formatDuration,
} from '../../utils/backupUtils';

const RESULT_BADGE = { passed: 'approved', success: 'approved', failed: 'rejected', running: 'in-progress' };
const RESULT_LABEL = { passed: 'Passed', success: 'Succeeded', failed: 'Failed', running: 'Running…' };

function ResultBlock({ title, result, children }) {
  return (
    <section className="bk-section">
      <h4>
        {title}
        {result && <span className={`admin-badge ${RESULT_BADGE[result.status] || ''}`}>{RESULT_LABEL[result.status] || result.status}</span>}
      </h4>
      {!result ? (
        <p className="bk-muted">Not run yet.</p>
      ) : (
        <>
          <p className="bk-muted">
            {result.status === 'running' ? 'Started' : 'Finished'} {formatDateTime(result.finishedAt || result.startedAt)}
            {result.startedBy?.name ? ` · by ${result.startedBy.name}` : ''}
            {result.durationMs != null ? ` · ${formatDuration(result.durationMs)}` : ''}
          </p>
          {result.error && <div className="admin-error-banner" role="alert">{result.error}</div>}
          {children}
        </>
      )}
    </section>
  );
}

/** Full metadata, the error message of a failed backup, the latest check results and recent activity. */
export default function BackupDetailsModal({ backup, onClose }) {
  const [activity, setActivity] = useState([]);
  const [loadError, setLoadError] = useState('');
  const refreshKey = `${backup.status}|${backup.verifyResult?.status}|${backup.testRestoreResult?.status}|${backup.restoreResult?.status}`;

  useEffect(() => {
    let cancelled = false;
    getBackupDetails(backup.id)
      .then((response) => { if (!cancelled) setActivity(response.activity || []); })
      .catch(() => { if (!cancelled) setLoadError('Recent activity could not be loaded.'); });
    return () => { cancelled = true; };
  }, [backup.id, refreshKey]);

  const restore = backup.restoreResult;

  return (
    <BackupModal
      title="Backup details"
      subtitle={backup.note}
      onClose={onClose}
      wide
      footer={<button type="button" className="admin-btn ghost" onClick={onClose}>Close</button>}
    >
      <dl className="bk-facts bk-facts-grid">
        <div><dt>Status</dt><dd><span className={`admin-badge ${STATUS_BADGE[backup.status] || ''}`}>{STATUS_LABELS[backup.status] || backup.status}</span>{backup.status === 'in_progress' && backup.stage ? ` ${STAGE_LABELS[backup.stage] || ''}` : ''}</dd></div>
        <div><dt>Type</dt><dd>{TYPE_LABELS[backup.type] || backup.type}{backup.purpose === 'pre_restore' ? ' (automatic, before a restore)' : ''}</dd></div>
        <div><dt>Created by</dt><dd>{backup.createdByName || '—'}</dd></div>
        <div><dt>Started</dt><dd>{formatDateTime(backup.startedAt)}</dd></div>
        <div><dt>Finished</dt><dd>{formatDateTime(backup.finishedAt)}</dd></div>
        <div><dt>Duration</dt><dd>{formatDuration(backup.durationMs)}</dd></div>
        <div><dt>Size</dt><dd>{formatBytes(backup.sizeBytes)}</dd></div>
        {backup.status === 'success' && <div className="bk-wide"><dt>Contains</dt><dd>{describeContents(backup)}</dd></div>}
        <div className="bk-wide"><dt>Backup ID</dt><dd className="bk-mono">{backup.id}</dd></div>
        <div className="bk-wide"><dt>File name</dt><dd className="bk-mono">{backup.fileName}</dd></div>
        <div className="bk-wide"><dt>SHA-256 checksum</dt><dd className="bk-mono">{backup.checksum || '—'}</dd></div>
        <div><dt>Storage</dt><dd>{backup.storageBackend === 's3' ? 'S3-compatible object storage' : 'Local filesystem'}</dd></div>
        <div className="bk-wide"><dt>Location</dt><dd className="bk-mono">{backup.storagePath || '—'}</dd></div>
      </dl>

      {backup.status === 'failed' && (
        <section className="bk-section">
          <h4>Error</h4>
          <div className="admin-error-banner" role="alert">{backup.errorMessage || 'The backup failed.'}</div>
          <p className="bk-muted">Technical details are in the server log. Nothing was stored for this backup.</p>
        </section>
      )}

      {backup.status === 'success' && (
        <>
          <ResultBlock title="Integrity check" result={backup.verifyResult}>
            {backup.verifyResult?.checks?.length > 0 && (
              <ul className="bk-checks">
                {backup.verifyResult.checks.map((check) => (
                  <li key={check.name}><span aria-hidden="true">✓</span> {check.name}{check.detail ? <small> — {check.detail}</small> : null}</li>
                ))}
              </ul>
            )}
          </ResultBlock>

          <ResultBlock title="Test restore" result={backup.testRestoreResult}>
            {backup.testRestoreResult?.tables?.length > 0 && (
              <>
                <div className="admin-table-wrap bk-mini-table">
                  <table className="admin-table">
                    <thead><tr><th>Table</th><th className="bk-num">Rows restored</th></tr></thead>
                    <tbody>
                      {backup.testRestoreResult.tables.map((table) => (
                        <tr key={table.name}><td>{table.name}</td><td className="bk-num">{table.rows.toLocaleString('en-GB')}</td></tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <p className="bk-muted">
                  {backup.testRestoreResult.totalRows.toLocaleString('en-GB')} rows in total.
                  {backup.testRestoreResult.tempDatabaseDropped ? ' The temporary database was dropped.' : ' The temporary database could not be dropped — ask the server administrator to remove it.'}
                </p>
              </>
            )}
          </ResultBlock>

          {restore && (
            <ResultBlock title="Restore" result={restore}>
              {restore.status === 'running' && restore.stage && <p>{RESTORE_STAGE_LABELS[restore.stage] || restore.stage}…</p>}
              {restore.documents && <p className="bk-muted">Storage bucket: {restore.documents.uploaded} file(s) restored{restore.documents.deleted ? `, ${restore.documents.deleted} extra file(s) deleted` : ', none deleted'}.</p>}
              {restore.preRestoreBackupId && <p className="bk-muted">Safety backup ID: <span className="bk-mono">{restore.preRestoreBackupId}</span></p>}
            </ResultBlock>
          )}
        </>
      )}

      <section className="bk-section">
        <h4>Recent activity</h4>
        {loadError && <p className="bk-muted">{loadError}</p>}
        {!loadError && activity.length === 0 && <p className="bk-muted">No activity recorded.</p>}
        {activity.length > 0 && (
          <ul className="bk-activity">
            {activity.map((entry) => (
              <li key={entry.id}>
                <span className={`admin-badge ${entry.result === 'success' ? 'approved' : 'rejected'}`}>{AUDIT_ACTION_LABELS[entry.action] || entry.action}</span>
                <span>{entry.actorName || 'System'}</span>
                <span className="bk-muted">{formatDateTime(entry.createdAt)}{entry.result === 'failure' ? ' · failed' : ''}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </BackupModal>
  );
}
