import React, { useState } from 'react';
import BackupModal from './BackupModal';
import { createBackup, backupErrorMessage } from '../../services/backupService';
import { TYPE_LABELS } from '../../utils/backupUtils';

const TYPES = [
  {
    value: 'database',
    title: 'Full database',
    text: 'Every table in the database. Fastest; does not include uploaded files.',
  },
  {
    value: 'database_files',
    title: 'Database + uploaded files',
    text: 'The database plus the uploads folder on the server. Takes longer and is larger.',
  },
];

const NOTE_MIN = 3;
const NOTE_MAX = 500;

/** Two steps: choose type and give a reason, then confirm. The backup itself runs in the background. */
export default function CreateBackupModal({ summary, onClose, onStarted }) {
  const [step, setStep] = useState('form');
  const [type, setType] = useState('database');
  const [note, setNote] = useState('');
  const [touched, setTouched] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const cleanNote = note.trim();
  const noteError = cleanNote.length < NOTE_MIN ? 'A note or reason is required, e.g. "Before release v2.3".' : '';
  const limitReached = Boolean(summary?.limitReached);
  const busyElsewhere = Boolean(summary?.activeJob);

  const goConfirm = (event) => {
    event.preventDefault();
    setTouched(true);
    if (noteError || limitReached || busyElsewhere) return;
    setStep('confirm');
  };

  const start = async () => {
    setSaving(true);
    setError('');
    try {
      const response = await createBackup({ type, note: cleanNote });
      onStarted(response.backup);
    } catch (err) {
      setError(await backupErrorMessage(err, 'The backup could not be started.'));
      setStep('form');
    } finally {
      setSaving(false);
    }
  };

  return (
    <BackupModal
      title="Create backup"
      subtitle={step === 'form' ? 'Step 1 of 2 — choose what to back up' : 'Step 2 of 2 — confirm'}
      onClose={onClose}
      busy={saving}
      footer={step === 'form' ? (
        <>
          <button type="button" className="admin-btn ghost" onClick={onClose}>Cancel</button>
          <button type="submit" form="bk-create-form" className="admin-btn primary" disabled={limitReached || busyElsewhere}>Continue</button>
        </>
      ) : (
        <>
          <button type="button" className="admin-btn ghost" onClick={() => setStep('form')} disabled={saving}>Back</button>
          <button type="button" className="admin-btn primary" onClick={start} disabled={saving}>
            {saving ? 'Starting…' : 'Start backup'}
          </button>
        </>
      )}
    >
      {error && <div className="admin-error-banner" role="alert">{error}</div>}

      {limitReached && (
        <div className="bk-callout bk-callout-warn" role="alert">
          <strong>The {summary.maxBackups}-backup limit has been reached.</strong>
          <span>Delete old backups you no longer need, then create a new one. Nothing is ever deleted automatically.</span>
        </div>
      )}
      {busyElsewhere && !limitReached && (
        <div className="bk-callout bk-callout-warn" role="status">
          <strong>Another operation is running.</strong>
          <span>Only one backup or restore can run at a time. Try again when it has finished.</span>
        </div>
      )}

      {step === 'form' ? (
        <form id="bk-create-form" onSubmit={goConfirm} noValidate>
          <fieldset className="bk-fieldset" disabled={limitReached}>
            <legend>Backup type</legend>
            {TYPES.map((option) => (
              <label key={option.value} className={`bk-choice${type === option.value ? ' is-selected' : ''}`}>
                <input type="radio" name="bk-type" value={option.value} checked={type === option.value} onChange={() => setType(option.value)} />
                <span>
                  <strong>{option.title}</strong>
                  <small>{option.text}</small>
                </span>
              </label>
            ))}
          </fieldset>

          <label className="um-field">
            <span>Note or reason *</span>
            <textarea
              className={`um-input bk-textarea${touched && noteError ? ' invalid' : ''}`}
              rows={3}
              maxLength={NOTE_MAX}
              value={note}
              placeholder="e.g. Before release v2.3"
              disabled={limitReached}
              aria-invalid={touched && noteError ? true : undefined}
              onChange={(event) => setNote(event.target.value)}
              onBlur={() => setTouched(true)}
              autoFocus
            />
            {touched && noteError
              ? <span className="um-field-error" role="alert">{noteError}</span>
              : <span className="um-field-hint">{cleanNote.length}/{NOTE_MAX}. Shown in the backup list and the activity log.</span>}
          </label>
        </form>
      ) : (
        <div className="bk-confirm">
          <p>You are about to create a backup:</p>
          <dl className="bk-facts">
            <div><dt>Type</dt><dd>{TYPE_LABELS[type]}</dd></div>
            <div><dt>Note</dt><dd>{cleanNote}</dd></div>
          </dl>
          <p className="bk-muted">
            The backup is encrypted and runs in the background. You can keep using the portal; this page shows its progress.
            Customer personal data is included, so handle any downloaded copy with care.
          </p>
        </div>
      )}
    </BackupModal>
  );
}
