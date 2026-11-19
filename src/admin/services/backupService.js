import api from '../../shared/utils/api';

// Backup Dashboard API (Super Admin only — the server enforces it).

export const getBackupSummary = async () => (await api.get('/admin/backups/summary')).data;

export const getBackupSettings = async () => (await api.get('/admin/backups/settings')).data;

// GET /api/admin/backups — paginated, newest first. params: page, limit, status, type, search, from, to
export const getBackups = async (params = {}) => (await api.get('/admin/backups', { params })).data;

// GET /api/admin/backups/:id — full metadata plus its recent activity
export const getBackupDetails = async (id) => (await api.get(`/admin/backups/${id}`)).data;

// POST /api/admin/backups — starts a backup in the background (202)
export const createBackup = async ({ type, note }) => (await api.post('/admin/backups', { type, note })).data;

export const verifyBackup = async (id) => (await api.post(`/admin/backups/${id}/verify`)).data;

export const testRestoreBackup = async (id) => (await api.post(`/admin/backups/${id}/test-restore`)).data;

export const restoreBackup = async (id, { confirmation, password }) =>
  (await api.post(`/admin/backups/${id}/restore`, { confirmation, password })).data;

export const deleteBackup = async (id) => (await api.delete(`/admin/backups/${id}`)).data;

export const getBackupAuditLog = async (params = {}) => (await api.get('/admin/backups/audit', { params })).data;

/** Saves a Blob response as a file in the browser. */
export function saveBlob(blob, fileName) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 10_000);
}

/**
 * Download = password re-entry -> short-lived single-use link -> authenticated fetch.
 * The link alone is useless: the request also carries the session's bearer token.
 */
export async function downloadBackup(id, password) {
  const link = (await api.post(`/admin/backups/${id}/download-link`, { password })).data;
  const response = await api.get(link.path, { responseType: 'blob', timeout: 0 });
  saveBlob(response.data, link.fileName || 'backup.sltbak');
  return link.fileName;
}

/** Exports the activity log (with the same filters) as a CSV file. */
export async function exportBackupAuditCsv(params = {}) {
  const response = await api.get('/admin/backups/audit/export', { params, responseType: 'blob' });
  saveBlob(response.data, `backup-activity-${new Date().toISOString().slice(0, 10)}.csv`);
}

/**
 * A readable message from a failed request. Blob responses (downloads) carry
 * their JSON error as a Blob, so it is read before giving up.
 */
export async function backupErrorMessage(error, fallback = 'Something went wrong. Please try again.') {
  const data = error?.response?.data;
  if (data instanceof Blob) {
    try {
      const parsed = JSON.parse(await data.text());
      if (parsed?.message) return parsed.message;
    } catch {
      // not JSON: fall through
    }
  } else if (data?.message) {
    return data.message;
  }
  if (error?.response?.status === 403 && !data?.message) return 'You do not have permission to do this.';
  if (!error?.response) return 'Could not reach the server. Check your connection and try again.';
  return fallback;
}

/** The machine-readable code the server attached to a failure (e.g. BACKUP_LIMIT_REACHED), if any. */
export const backupErrorCode = (error) => error?.response?.data?.code || null;
