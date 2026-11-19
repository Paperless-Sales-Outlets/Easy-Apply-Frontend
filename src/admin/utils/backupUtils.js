// Formatting and status helpers for the Backup Dashboard.

const TIME_ZONE = 'Asia/Colombo';

export function formatBytes(value) {
  if (value == null || Number.isNaN(Number(value))) return '—';
  let size = Number(value);
  if (size < 1024) return `${size} B`;
  const units = ['KB', 'MB', 'GB', 'TB'];
  let unit = -1;
  do {
    size /= 1024;
    unit += 1;
  } while (size >= 1024 && unit < units.length - 1);
  return `${size >= 100 ? size.toFixed(0) : size.toFixed(1)} ${units[unit]}`;
}

export function formatDuration(ms) {
  if (ms == null || Number.isNaN(Number(ms))) return '—';
  const total = Math.round(Number(ms) / 1000);
  if (total < 1) return '< 1 s';
  if (total < 60) return `${total} s`;
  const minutes = Math.floor(total / 60);
  const seconds = total % 60;
  if (minutes < 60) return `${minutes} min ${seconds} s`;
  return `${Math.floor(minutes / 60)} h ${minutes % 60} min`;
}

/** Date and time in Sri Lanka time, e.g. "19 Nov 2026, 14:05". */
export function formatDateTime(value) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleString('en-GB', {
    timeZone: TIME_ZONE,
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
}

/** "a1b2c3d4…e5f6" — enough to compare by eye; the full value is in the details. */
export function shortChecksum(value) {
  if (!value) return '—';
  return value.length > 14 ? `${value.slice(0, 8)}…${value.slice(-4)}` : value;
}

export const STATUS_LABELS = { success: 'Success', failed: 'Failed', in_progress: 'In progress' };
export const STATUS_BADGE = { success: 'approved', failed: 'rejected', in_progress: 'in-progress' };

export const TYPE_LABELS = {
  database: 'Full database',
  database_files: 'Database + files',
};

export const STAGE_LABELS = {
  starting: 'Starting',
  dumping_database: 'Dumping the database',
  archiving_files: 'Archiving uploaded files',
  bundling: 'Packaging',
  encrypting: 'Encrypting',
  uploading: 'Saving to storage',
  verifying: 'Verifying the saved file',
};

export const RESTORE_STAGE_LABELS = {
  pre_restore_backup: 'Taking the safety backup',
  verifying_backup: 'Checking the backup',
  restoring_database: 'Restoring the database',
  restoring_files: 'Restoring uploaded files',
};

export const AUDIT_ACTION_LABELS = {
  created: 'Created',
  verified: 'Verified',
  downloaded: 'Downloaded',
  test_restored: 'Test restored',
  restored: 'Restored',
  deleted: 'Deleted',
  failed: 'Failed',
};

/** A follow-up operation (verify / test restore / restore) that is still running on this backup. */
export const isOperationRunning = (backup) =>
  [backup?.verifyResult, backup?.testRestoreResult, backup?.restoreResult].some((r) => r?.status === 'running');

/** True when something on the page is still changing and should be polled. */
export const hasRunningWork = (backups = [], summary = null) =>
  Boolean(summary?.activeJob) || backups.some((b) => b.status === 'in_progress' || isOperationRunning(b));

/** Which operation is running, in words — for the "in progress" banner. */
export function describeActiveJob(job) {
  if (!job) return '';
  return { backup: 'A backup is running', verify: 'A verification is running', 'test restore': 'A test restore is running', restore: 'A restore is running' }[job.op] || 'An operation is running';
}

/** Why an action is unavailable for a backup, or '' when it is available. */
export function actionBlockedReason(backup, summary) {
  if (!backup || backup.status !== 'success') return 'Only a successful backup can be used.';
  if (summary?.activeJob) return 'Another backup or restore is running. Wait for it to finish.';
  return '';
}

export function deleteBlockedReason(backup, summary) {
  if (backup.status === 'in_progress') return 'This backup is still running.';
  if (summary?.activeJob?.backupId === backup.id) return 'An operation is running on this backup.';
  if (backup.status === 'success' && summary?.lastSuccess?.id === backup.id) {
    return 'The most recent successful backup cannot be deleted. Create a newer backup first.';
  }
  return '';
}
