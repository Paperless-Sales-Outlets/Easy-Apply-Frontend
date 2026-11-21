import React, { useCallback, useEffect, useRef, useState } from 'react';
import AdminNotice, { useAdminNotice } from '../components/AdminNotice';
import BackupsTab from '../components/backup/BackupsTab';
import ActivityLogTab from '../components/backup/ActivityLogTab';
import StorageSettingsTab from '../components/backup/StorageSettingsTab';
import CreateBackupModal from '../components/backup/CreateBackupModal';
import BackupDetailsModal from '../components/backup/BackupDetailsModal';
import PasswordDownloadModal from '../components/backup/PasswordDownloadModal';
import RestoreModal from '../components/backup/RestoreModal';
import DeleteBackupModal from '../components/backup/DeleteBackupModal';
import {
  getBackups, getBackupSummary, verifyBackup, testRestoreBackup, backupErrorMessage,
} from '../services/backupService';
import {
  RESTORE_STAGE_LABELS, STAGE_LABELS, STATUS_BADGE, STATUS_LABELS,
  describeActiveJob, formatBytes, formatDateTime, hasRunningWork,
} from '../utils/backupUtils';

const PAGE_SIZE = 15;
const FAST_POLL_MS = 2500; // while something is running
const IDLE_POLL_MS = 30000;
const EMPTY_FILTERS = { search: '', status: '', type: '', from: '', to: '' };

const TABS = [
  { key: 'backups', label: 'Backups' },
  { key: 'activity', label: 'Activity log' },
  { key: 'storage', label: 'Storage & retention' },
];

const ICON_DB = (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
    <ellipse cx="12" cy="5" rx="8" ry="3" /><path d="M4 5v6c0 1.66 3.58 3 8 3s8-1.34 8-3V5" /><path d="M4 11v6c0 1.66 3.58 3 8 3s8-1.34 8-3v-6" />
  </svg>
);
const ICON_PLUS = (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 5v14M5 12h14" />
  </svg>
);

const signature = (b) => `${b.status}|${b.verifyResult?.status || ''}|${b.testRestoreResult?.status || ''}|${b.restoreResult?.status || ''}`;

/** Backup Dashboard: summary, manual backups, history, activity log and storage settings. */
export default function BackupDashboardPage() {
  const [summary, setSummary] = useState(null);
  const [backups, setBackups] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [searchInput, setSearchInput] = useState('');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tab, setTab] = useState('backups');
  const [modal, setModal] = useState(null); // { type, backup }
  const notice = useAdminNotice(8000);

  const previous = useRef(null);
  const inFlight = useRef(false);
  const noticeRef = useRef(notice);
  noticeRef.current = notice;

  useEffect(() => {
    const id = setTimeout(() => {
      setFilters((current) => (current.search === searchInput.trim() ? current : { ...current, search: searchInput.trim() }));
      setPage(1);
    }, 350);
    return () => clearTimeout(id);
  }, [searchInput]);

  const announceChanges = useCallback((rows) => {
    const before = previous.current;
    previous.current = new Map(rows.map((b) => [b.id, signature(b)]));
    if (!before) return;
    const n = noticeRef.current;
    for (const b of rows) {
      const old = before.get(b.id);
      if (!old || old === signature(b)) continue;
      const [oldStatus, oldVerify, oldTest, oldRestore] = old.split('|');
      const label = b.purpose === 'pre_restore' ? 'The safety backup' : 'The backup';
      if (oldStatus === 'in_progress' && b.status === 'success') n.success(`${label} finished successfully.`);
      else if (oldStatus === 'in_progress' && b.status === 'failed') n.error(`${label} failed. Open “Details” to see why.`);
      if (oldVerify === 'running' && b.verifyResult?.status === 'passed') n.success('Integrity check passed.');
      if (oldVerify === 'running' && b.verifyResult?.status === 'failed') n.error(`Integrity check failed: ${b.verifyResult.error || 'see Details.'}`);
      if (oldTest === 'running' && b.testRestoreResult?.status === 'passed') n.success('Test restore passed; the temporary database was dropped.');
      if (oldTest === 'running' && b.testRestoreResult?.status === 'failed') n.error(`Test restore failed: ${b.testRestoreResult.error || 'see Details.'}`);
      if (oldRestore === 'running' && b.restoreResult?.status === 'success') n.success('Restore completed. If you are signed out, sign in again.');
      if (oldRestore === 'running' && b.restoreResult?.status === 'failed') n.error(`Restore failed: ${b.restoreResult.error || 'see Details.'}`);
    }
  }, []);

  const load = useCallback(async ({ silent = false } = {}) => {
    if (inFlight.current) return null;
    inFlight.current = true;
    if (!silent) setLoading(true);
    try {
      const params = { page, limit: PAGE_SIZE };
      for (const key of ['search', 'status', 'type', 'from', 'to']) if (filters[key]) params[key] = filters[key];
      const [summaryResponse, listResponse] = await Promise.all([getBackupSummary(), getBackups(params)]);
      setSummary(summaryResponse.summary);
      setBackups(listResponse.backups || []);
      setPagination(listResponse.pagination || null);
      setError('');
      announceChanges(listResponse.backups || []);
      return { summary: summaryResponse.summary, backups: listResponse.backups || [] };
    } catch (err) {
      // A failed background poll should not wipe what is on screen.
      setError(await backupErrorMessage(err, 'The backup list could not be loaded.'));
      return null;
    } finally {
      inFlight.current = false;
      if (!silent) setLoading(false);
    }
  }, [page, filters, announceChanges]);

  // Reload when the page or filters change.
  useEffect(() => {
    previous.current = null; // a different page of results is not a "change"
    load();
  }, [load]);

  // Poll: quickly while something runs, slowly otherwise.
  const busy = hasRunningWork(backups, summary);
  useEffect(() => {
    const id = setInterval(() => load({ silent: true }), busy ? FAST_POLL_MS : IDLE_POLL_MS);
    return () => clearInterval(id);
  }, [busy, load]);

  const updateFilter = (key, value) => {
    setPage(1);
    setFilters((current) => ({ ...current, [key]: value }));
  };
  const clearFilters = () => {
    setSearchInput('');
    setFilters(EMPTY_FILTERS);
    setPage(1);
  };

  const closeModal = () => setModal(null);

  const runSimple = async (fn, startedMessage, backup) => {
    try {
      await fn(backup.id);
      notice.info(startedMessage);
      await load({ silent: true });
    } catch (err) {
      notice.error(await backupErrorMessage(err));
    }
  };

  const handleAction = (type, backup) => {
    if (type === 'verify') return runSimple(verifyBackup, 'Verification started. This can take a few minutes.', backup);
    if (type === 'test-restore') return runSimple(testRestoreBackup, 'Test restore started. The live database is not touched.', backup);
    return setModal({ type, id: backup.id, snapshot: backup });
  };

  // Always show the freshest copy of the backup a dialog is about.
  const modalBackup = modal ? backups.find((b) => b.id === modal.id) || modal.snapshot : null;

  const restoring = backups.find((b) => b.restoreResult?.status === 'running');
  const running = backups.find((b) => b.status === 'in_progress');
  const lastStatus = summary?.lastStatus;
  const createDisabled = Boolean(summary?.activeJob);
  const daysOld = summary?.daysSinceLastSuccess;

  const tiles = [
    {
      key: 'last', cls: 'total', label: 'Last successful backup',
      value: summary?.lastSuccess ? formatDateTime(summary.lastSuccess.finishedAt) : summary ? 'None yet' : null,
      foot: summary?.lastSuccess ? `By ${summary.lastSuccess.createdByName || 'unknown'}` : 'Create the first backup',
    },
    {
      key: 'count', cls: 'roles', label: 'Backups stored',
      value: summary ? `${summary.count} / ${summary.maxBackups}` : null,
      foot: summary?.limitReached ? 'Limit reached — delete old backups' : 'Nothing is deleted automatically',
    },
    {
      key: 'size', cls: 'active', label: 'Storage used',
      value: summary ? formatBytes(summary.totalBytes) : null,
      foot: 'By successful backups',
    },
    {
      key: 'status', cls: 'status', label: 'Last backup status',
      value: summary ? (lastStatus ? <span className={`admin-badge ${STATUS_BADGE[lastStatus] || ''}`}>{STATUS_LABELS[lastStatus]}</span> : '—') : null,
      foot: summary?.lastRun ? formatDateTime(summary.lastRun.startedAt) : 'No runs yet',
    },
  ];

  return (
    <div className="um-page bk-page">
      <section className="um-hero">
        <div className="um-hero-deco" aria-hidden="true">
          <span className="um-hero-orb" />
          <span className="um-hero-slash" />
          <span className="um-hero-grid" />
        </div>
        <div className="um-hero-top">
          <div className="um-hero-text">
            <span className="um-hero-eyebrow">{ICON_DB} Admin · Data protection</span>
            <h1>Backups</h1>
            <p>Create, check and restore encrypted database backups. Backups are only made when you start one — there is no schedule.</p>
          </div>
          <button
            type="button"
            className="um-hero-action"
            onClick={() => setModal({ type: 'create' })}
            disabled={createDisabled}
            title={createDisabled ? 'Another backup or restore is running.' : undefined}
          >
            <span className="um-hero-action-icon">{ICON_PLUS}</span>
            Create backup
          </button>
        </div>
        <div className="um-hero-tiles">
          {tiles.map((tile, idx) => (
            <div className={`um-hero-tile ${tile.cls}`} key={tile.key} style={{ '--i': idx }}>
              <div className="um-hero-tile-head">{tile.label}</div>
              <div className="um-hero-tile-value bk-tile-value">
                {tile.value == null ? <span className="dash-skeleton um-hero-skeleton" /> : tile.value}
              </div>
              <div className="um-hero-tile-foot">{tile.foot}</div>
            </div>
          ))}
        </div>
      </section>

      <AdminNotice notice={notice.notice} onDismiss={notice.dismiss} />

      {summary && summary.isStale && (
        <div className="bk-banner bk-banner-warn" role="alert">
          <strong>{summary.lastSuccess ? 'Your last successful backup is out of date.' : 'There is no successful backup yet.'}</strong>
          <span>
            {summary.lastSuccess
              ? `It was made ${daysOld} day${daysOld === 1 ? '' : 's'} ago (the warning starts after ${summary.warningDays}). Create a new backup.`
              : 'Create a backup so the data can be recovered if something goes wrong.'}
          </span>
        </div>
      )}

      {summary?.limitReached && (
        <div className="bk-banner bk-banner-warn" role="alert">
          <strong>{summary.count} of {summary.maxBackups} backups stored.</strong>
          <span>Delete old backups you no longer need before creating another. Nothing is deleted automatically.</span>
        </div>
      )}

      {restoring ? (
        <div className="bk-banner bk-banner-danger" role="status">
          <span className="bk-spinner" aria-hidden="true" />
          <strong>Restore in progress: {RESTORE_STAGE_LABELS[restoring.restoreResult.stage] || 'working'}…</strong>
          <span>The portal is unavailable to other users while data is replaced. Keep this page open; it updates by itself.</span>
        </div>
      ) : (summary?.activeJob || running) && (
        <div className="bk-banner bk-banner-info" role="status">
          <span className="bk-spinner" aria-hidden="true" />
          <strong>{describeActiveJob(summary?.activeJob) || 'A backup is running'}{running?.stage ? `: ${STAGE_LABELS[running.stage] || running.stage}` : ''}…</strong>
          <span>You can keep using the portal. This page updates by itself, and only one operation runs at a time.</span>
        </div>
      )}

      <div className="um-tabs" role="tablist" style={{ '--tab-index': TABS.findIndex((t) => t.key === tab), '--tab-count': TABS.length }}>
        <span className="um-tabs-indicator" aria-hidden="true" />
        {TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            role="tab"
            aria-selected={tab === t.key}
            className={`um-tab${tab === t.key ? ' active' : ''}`}
            onClick={() => setTab(t.key)}
          >
            <span className="um-tab-label">{t.label}</span>
          </button>
        ))}
      </div>

      {tab === 'backups' && (
        <BackupsTab
          backups={backups}
          pagination={pagination}
          loading={loading}
          error={error}
          filters={filters}
          searchInput={searchInput}
          onSearchInput={setSearchInput}
          onFilter={updateFilter}
          onClear={clearFilters}
          page={page}
          onPage={setPage}
          summary={summary}
          onAction={handleAction}
        />
      )}
      {tab === 'activity' && <ActivityLogTab />}
      {tab === 'storage' && <StorageSettingsTab summary={summary} />}

      {modal?.type === 'create' && (
        <CreateBackupModal
          summary={summary}
          onClose={closeModal}
          onStarted={() => {
            closeModal();
            setTab('backups');
            setPage(1);
            notice.info('Backup started. Progress is shown below.');
            load({ silent: true });
          }}
        />
      )}
      {modal?.type === 'details' && modalBackup && <BackupDetailsModal backup={modalBackup} onClose={closeModal} />}
      {modal?.type === 'download' && modalBackup && (
        <PasswordDownloadModal
          backup={modalBackup}
          onClose={closeModal}
          onDone={(message) => { closeModal(); notice.success(message); load({ silent: true }); }}
        />
      )}
      {modal?.type === 'restore' && modalBackup && (
        <RestoreModal
          backup={modalBackup}
          onClose={closeModal}
          onStarted={() => { closeModal(); notice.info('Restore started. A safety backup is being taken first.'); load({ silent: true }); }}
        />
      )}
      {modal?.type === 'delete' && modalBackup && (
        <DeleteBackupModal
          backup={modalBackup}
          onClose={closeModal}
          onDeleted={() => { closeModal(); notice.success('Backup deleted.'); load({ silent: true }); }}
        />
      )}
    </div>
  );
}
