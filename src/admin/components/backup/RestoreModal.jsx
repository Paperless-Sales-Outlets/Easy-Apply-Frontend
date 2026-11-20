import React, { useState } from 'react';
import BackupModal from './BackupModal';
import { restoreBackup, backupErrorMessage } from '../../services/backupService';
import { describeContents, formatBytes, formatDateTime, hasDocuments, TYPE_LABELS } from '../../utils/backupUtils';

export const RESTORE_PHRASE = 'RESTORE';

/**
 * High-risk action. Needs the typed word RESTORE and the password again. The
 * server first takes an automatic safety backup, then replaces the live data.
 */
export default function RestoreModal({ backup, onClose, onStarted }) {
  const [phrase, setPhrase] = useState('');
  const [password, setPassword] = useState('');
  const [deleteExtraDocuments, setDeleteExtraDocuments] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const phraseOk = phrase === RESTORE_PHRASE;
  const ready = phraseOk && password.length > 0;

  const submit = async (event) => {
    event.preventDefault();
    if (!ready) return;
    setBusy(true);
    setError('');
    try {
      await restoreBackup(backup.id, { confirmation: phrase, password, deleteExtraDocuments });
      onStarted();
    } catch (err) {
      setError(await backupErrorMessage(err, 'The restore could not be started.'));
      setPassword('');
    } finally {
      setBusy(false);
    }
  };

  return (
    <BackupModal
      title="Restore this backup"
      eyebrow="High-risk action"
      subtitle="This replaces the current data"
      onClose={onClose}
      busy={busy}
      footer={(
        <>
          <button type="button" className="admin-btn ghost" onClick={onClose} disabled={busy}>Cancel</button>
          <button type="submit" form="bk-restore-form" className="admin-btn danger" disabled={!ready || busy}>
            {busy ? 'Starting…' : 'Restore now'}
          </button>
        </>
      )}
    >
      {error && <div className="admin-error-banner" role="alert">{error}</div>}

      <div className="bk-callout bk-callout-danger" role="alert">
        <strong>Restoring replaces ALL current data with this backup.</strong>
        <ul>
          <li>Anything customers or staff entered after {formatDateTime(backup.startedAt)} will be lost from the live system.</li>
          <li>The portal is unavailable to everyone else while the data is replaced.</li>
          <li>Staff accounts, passwords and sessions return to how they were in the backup, so you may be signed out.</li>
          <li>It cannot be undone, except by restoring the automatic safety backup described below.</li>
        </ul>
      </div>

      <div className="bk-callout bk-callout-info">
        <strong>A safety backup is taken first.</strong>
        <span>The current data is saved as “Auto pre-restore backup”. If that safety backup fails, nothing is restored. It counts towards the backup limit and is never deleted automatically.</span>
      </div>

      <dl className="bk-facts">
        <div><dt>Restoring</dt><dd>{backup.note}</dd></div>
        <div><dt>Created</dt><dd>{formatDateTime(backup.startedAt)} by {backup.createdByName || 'unknown'}</dd></div>
        <div><dt>Type</dt><dd>{TYPE_LABELS[backup.type] || backup.type}</dd></div>
        <div><dt>Size</dt><dd>{formatBytes(backup.sizeBytes)}</dd></div>
        <div><dt>Contains</dt><dd>{describeContents(backup)}</dd></div>
        {backup.testRestoreResult?.status === 'passed'
          ? <div><dt>Test restore</dt><dd>Passed on {formatDateTime(backup.testRestoreResult.finishedAt)}</dd></div>
          : <div><dt>Test restore</dt><dd className="bk-warn-text">Not tested — consider running “Test restore” first.</dd></div>}
      </dl>

      {hasDocuments(backup) && (
        <div className="bk-callout bk-callout-warn">
          <strong>Customer documents in the storage bucket</strong>
          <span>The documents saved in this backup are uploaded back to the bucket. Files added to the bucket after the backup are normally left untouched.</span>
          <label className="bk-check">
            <input type="checkbox" checked={deleteExtraDocuments} onChange={(event) => setDeleteExtraDocuments(event.target.checked)} />
            <span><strong>Also permanently delete bucket files that are not in this backup</strong> (documents customers uploaded after it was made). Leave this unticked unless you are sure.</span>
          </label>
        </div>
      )}

      <form id="bk-restore-form" onSubmit={submit} noValidate>
        <label className="um-field">
          <span>Type <code>{RESTORE_PHRASE}</code> to confirm *</span>
          <input
            type="text"
            className={`um-input${phrase && !phraseOk ? ' invalid' : ''}${phraseOk ? ' valid' : ''}`}
            value={phrase}
            autoComplete="off"
            spellCheck={false}
            onChange={(event) => setPhrase(event.target.value)}
            autoFocus
          />
        </label>
        <label className="um-field">
          <span>Your password *</span>
          <input
            type="password"
            className="um-input"
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        </label>
      </form>
    </BackupModal>
  );
}
