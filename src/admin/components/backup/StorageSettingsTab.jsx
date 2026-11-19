import React, { useEffect, useState } from 'react';
import { getBackupSettings, backupErrorMessage } from '../../services/backupService';
import { formatBytes } from '../../utils/backupUtils';

function Row({ label, children, hint }) {
  return (
    <div className="bk-setting">
      <dt>{label}</dt>
      <dd>{children}{hint && <small>{hint}</small>}</dd>
    </div>
  );
}

/** Read-only: where backups are kept, how much room is left, and the retention rules (set in the server's .env). */
export default function StorageSettingsTab({ summary }) {
  const [settings, setSettings] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    getBackupSettings()
      .then((response) => { if (!cancelled) setSettings(response.settings); })
      .catch(async (err) => { if (!cancelled) setError(await backupErrorMessage(err, 'Settings could not be loaded.')); });
    return () => { cancelled = true; };
  }, []);

  if (error) return <div className="admin-error-banner" role="alert">{error}</div>;
  if (!settings) return <div className="dash-table-skeleton"><div className="dash-skeleton dash-skeleton-row" /><div className="dash-skeleton dash-skeleton-row" /></div>;

  const isLocal = settings.storageBackend === 'local';
  const total = settings.totalBytes;
  const usedPct = total && settings.usedBytes != null ? Math.min(100, Math.round((settings.usedBytes / total) * 100)) : null;
  const count = summary?.count ?? 0;

  return (
    <div className="bk-settings-grid">
      <section className="um-panel">
        <div className="um-panel-head"><div className="um-panel-title"><h2>Storage</h2><p>Where backup files are kept</p></div></div>
        <dl className="bk-settings">
          <Row label="Storage backend">{isLocal ? 'Local filesystem' : 'S3-compatible object storage'}</Row>
          <Row label="Location"><span className="bk-mono">{settings.storageLocation}</span></Row>
          <Row label="Used by backups">{settings.usedBytes == null ? 'Unknown' : formatBytes(settings.usedBytes)}</Row>
          <Row label="Available">
            {settings.availableBytes == null ? (isLocal ? 'Unknown' : 'Not limited by the server') : formatBytes(settings.availableBytes)}
            {total ? <small>of {formatBytes(total)} on this disk</small> : null}
          </Row>
          {usedPct != null && (
            <div className="bk-meter" role="img" aria-label={`${usedPct}% of the disk is in use`}>
              <span style={{ width: `${usedPct}%` }} />
            </div>
          )}
          {settings.storageError && <p className="bk-warn-text">{settings.storageError}</p>}
        </dl>
      </section>

      <section className="um-panel">
        <div className="um-panel-head"><div className="um-panel-title"><h2>Retention</h2><p>Backups are manual only — there is no schedule</p></div></div>
        <dl className="bk-settings">
          <Row label="Maximum backups kept" hint="BACKUP_MAX_COUNT">{settings.maxBackups}</Row>
          <Row label="Currently stored">{count} of {settings.maxBackups}</Row>
          <Row label="Stale-backup warning after" hint="BACKUP_WARNING_DAYS">{settings.warningDays} day{settings.warningDays === 1 ? '' : 's'}</Row>
          <Row label="Download link lifetime">{settings.downloadLinkTtlSec} seconds, single use</Row>
          <Row label="Automatic deletion">Never. At the limit you must delete old backups yourself.</Row>
        </dl>
      </section>

      <section className="um-panel">
        <div className="um-panel-head"><div className="um-panel-title"><h2>Server readiness</h2><p>What this feature needs on the server</p></div></div>
        <dl className="bk-settings">
          <Row label="Encryption key">
            {settings.encryptionConfigured ? <span className="bk-ok-text">Configured (AES-256-GCM)</span> : <span className="bk-warn-text">Missing — backups cannot be created</span>}
          </Row>
          <Row label="pg_dump">{settings.tools?.pgDump ? <span className="bk-ok-text">{settings.tools.pgDump}</span> : <span className="bk-warn-text">Not found</span>}</Row>
          <Row label="pg_restore">{settings.tools?.pgRestore ? <span className="bk-ok-text">{settings.tools.pgRestore}</span> : <span className="bk-warn-text">Not found</span>}</Row>
        </dl>
        <p className="bk-muted bk-settings-note">These settings are changed in the server’s environment file, not here. See docs/BACKUP_AND_RESTORE.md.</p>
      </section>
    </div>
  );
}
