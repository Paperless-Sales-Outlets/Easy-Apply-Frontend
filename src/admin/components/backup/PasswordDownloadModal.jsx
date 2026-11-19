import React, { useState } from 'react';
import BackupModal from './BackupModal';
import { downloadBackup, backupErrorMessage } from '../../services/backupService';
import { formatBytes, formatDateTime } from '../../utils/backupUtils';

/** Download needs the Super Admin's password again; the file then arrives through a single-use, authenticated link. */
export default function PasswordDownloadModal({ backup, onClose, onDone }) {
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const submit = async (event) => {
    event.preventDefault();
    if (!password) {
      setError('Enter your password to continue.');
      return;
    }
    setBusy(true);
    setError('');
    try {
      const fileName = await downloadBackup(backup.id, password);
      onDone(`Download started: ${fileName}`);
    } catch (err) {
      setError(await backupErrorMessage(err, 'The download failed.'));
      setPassword('');
    } finally {
      setBusy(false);
    }
  };

  return (
    <BackupModal
      title="Download backup"
      subtitle="Confirm it is you"
      onClose={onClose}
      busy={busy}
      footer={(
        <>
          <button type="button" className="admin-btn ghost" onClick={onClose} disabled={busy}>Cancel</button>
          <button type="submit" form="bk-download-form" className="admin-btn primary" disabled={busy}>
            {busy ? 'Downloading…' : 'Download'}
          </button>
        </>
      )}
    >
      {error && <div className="admin-error-banner" role="alert">{error}</div>}
      <div className="bk-callout bk-callout-info">
        <strong>This file contains customer personal data.</strong>
        <span>It is encrypted, but store it securely, do not share it, and delete your copy when it is no longer needed. This download is recorded in the activity log.</span>
      </div>
      <dl className="bk-facts">
        <div><dt>Backup</dt><dd>{backup.note}</dd></div>
        <div><dt>Created</dt><dd>{formatDateTime(backup.startedAt)}</dd></div>
        <div><dt>Size</dt><dd>{formatBytes(backup.sizeBytes)}</dd></div>
      </dl>
      <form id="bk-download-form" onSubmit={submit} noValidate>
        <label className="um-field">
          <span>Your password *</span>
          <input
            type="password"
            className="um-input"
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoFocus
          />
        </label>
      </form>
    </BackupModal>
  );
}
