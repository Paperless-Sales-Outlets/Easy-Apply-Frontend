import React, { useState } from 'react';
import BackupModal from './BackupModal';
import { deleteBackup, backupErrorMessage } from '../../services/backupService';
import { formatBytes, formatDateTime } from '../../utils/backupUtils';

/** Permanent delete, with an explicit confirmation. Deleting is always a manual decision. */
export default function DeleteBackupModal({ backup, onClose, onDeleted }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const confirm = async () => {
    setBusy(true);
    setError('');
    try {
      await deleteBackup(backup.id);
      onDeleted();
    } catch (err) {
      setError(await backupErrorMessage(err, 'The backup could not be deleted.'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <BackupModal
      title="Delete backup"
      subtitle="This cannot be undone"
      onClose={onClose}
      busy={busy}
      footer={(
        <>
          <button type="button" className="admin-btn ghost" onClick={onClose} disabled={busy}>Cancel</button>
          <button type="button" className="admin-btn danger" onClick={confirm} disabled={busy}>
            {busy ? 'Deleting…' : 'Delete permanently'}
          </button>
        </>
      )}
    >
      {error && <div className="admin-error-banner" role="alert">{error}</div>}
      <p>
        {backup.status === 'failed'
          ? 'This failed backup record will be removed.'
          : 'The backup file will be permanently removed from storage.'}
      </p>
      <dl className="bk-facts">
        <div><dt>Backup</dt><dd>{backup.note}</dd></div>
        <div><dt>Created</dt><dd>{formatDateTime(backup.startedAt)}</dd></div>
        {backup.sizeBytes != null && <div><dt>Size</dt><dd>{formatBytes(backup.sizeBytes)}</dd></div>}
      </dl>
      <p className="bk-muted">The deletion is recorded in the activity log.</p>
    </BackupModal>
  );
}
