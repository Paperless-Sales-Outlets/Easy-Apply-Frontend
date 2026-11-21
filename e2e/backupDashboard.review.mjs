// Click-through review of the Backup Dashboard in a real browser (Playwright + Chrome).
// It drives every part of the page, checks what it should do, and saves a screenshot of each screen.
//
// Needs a running backend + frontend against a DISPOSABLE local database; see
// docs/BACKUP_AND_RESTORE.md ("Reviewing the UI") and Easy-Apply-Backend/scripts/backup_ui_review_setup.js.
//
//   npm i --no-save playwright        (uses the installed Chrome; no browser download)
//   REVIEW_CREDS=creds.json REVIEW_PSQL=/path/to/psql REVIEW_SHOTS=./shots \
//     node e2e/backupDashboard.review.mjs
//
// Environment:
//   REVIEW_BASE   frontend URL including its base path (default http://127.0.0.1:5174/Paperlessbackup)
//   REVIEW_API    backend API URL (default http://localhost:5055/api)
//   REVIEW_CREDS  JSON from backup_ui_review_setup.js (accounts + database URL)
//   REVIEW_PSQL   psql executable, used only to change data in the disposable database
//   REVIEW_SHOTS  folder for screenshots
//   REVIEW_BULK   "1" if the database has the ui_review_bulk table (a slow first backup shows progress)

import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { chromium } from 'playwright';

const BASE = process.env.REVIEW_BASE || 'http://127.0.0.1:5174/Paperlessbackup';
const API = process.env.REVIEW_API || 'http://localhost:5055/api';
const SHOTS = path.resolve(process.env.REVIEW_SHOTS || './shots');
const creds = JSON.parse(fs.readFileSync(process.env.REVIEW_CREDS, 'utf8'));
const dbUrl = new URL(creds.database);
fs.mkdirSync(SHOTS, { recursive: true });

const results = [];
const consoleErrors = [];
let shotNo = 0;

const check = (name, ok, detail = '') => {
  results.push({ name, ok: Boolean(ok), detail });
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? `  (${detail})` : ''}`);
};

const psql = (sql) =>
  execFileSync(process.env.REVIEW_PSQL, ['-h', dbUrl.hostname, '-p', dbUrl.port, '-U', decodeURIComponent(dbUrl.username), '-d', dbUrl.pathname.slice(1), '-t', '-A', '-c', sql], {
    env: { ...process.env, PGPASSWORD: decodeURIComponent(dbUrl.password) },
    encoding: 'utf8',
  }).trim();

const dataFingerprint = () =>
  psql(`SELECT md5(string_agg(t, '|' ORDER BY t)) FROM (
          SELECT 'c:' || count(*) || ':' || md5(string_agg(c::text, ',' ORDER BY c::text)) AS t FROM customers c
          UNION ALL SELECT 'a:' || count(*) || ':' || md5(string_agg(a::text, ',' ORDER BY a::text)) FROM applications a
          UNION ALL SELECT 'p:' || count(*) || ':' || md5(string_agg(p::text, ',' ORDER BY p::text)) FROM products p) s`);

async function shot(page, name, options = {}) {
  await page.waitForTimeout(600); // let entrance animations finish before capturing
  shotNo += 1;
  const file = `${String(shotNo).padStart(2, '0')}-${name}.png`;
  await page.screenshot({ path: path.join(SHOTS, file), fullPage: options.fullPage ?? false });
  return file;
}

async function login(page, account) {
  await page.goto(`${BASE}/admin`);
  await page.locator('input[name="email"]').fill(account.email);
  await page.locator('input[name="password"]').fill(account.password);
  await page.locator('button[type="submit"]').click();
  await page.locator('aside[aria-label="Admin Navigation"]').waitFor({ timeout: 20000 });
}

const token = (page) => page.evaluate(() => sessionStorage.getItem('adminAccessToken') || localStorage.getItem('adminAccessToken'));
const apiStatus = async (page, method, url, body) => {
  const bearer = await token(page);
  return page.evaluate(async ({ method, url, body, bearer }) => {
    const res = await fetch(url, { method, headers: { Authorization: `Bearer ${bearer}`, 'Content-Type': 'application/json' }, body: body ? JSON.stringify(body) : undefined });
    return res.status;
  }, { method, url, body, bearer });
};

/** Polls the summary until no backup job is running (waitForFunction does not await async predicates). */
/** What GET /api/admin/backups/access says for the signed-in user (true / false). */
const accessAnswer = async (page) => {
  const bearer = await token(page);
  return page.evaluate(async ({ bearer, api }) => {
    const res = await fetch(`${api}/admin/backups/access`, { headers: { Authorization: `Bearer ${bearer}` } });
    return (await res.json()).allowed;
  }, { bearer, api: API });
};

const waitNoActiveJob = async (page, bearer, ms = 60000) => {
  const end = Date.now() + ms;
  while (Date.now() < end) {
    const busy = await page.evaluate(async ({ bearer, api }) => {
      const res = await fetch(`${api}/admin/backups/summary`, { headers: { Authorization: `Bearer ${bearer}` } });
      return Boolean((await res.json()).summary.activeJob);
    }, { bearer, api: API });
    if (!busy) return;
    await page.waitForTimeout(150);
  }
  throw new Error('a backup job did not finish in time');
};

const waitSettled = async (page, ms = 60000) => {
  await page.waitForFunction(() => !document.querySelector('.bk-banner-info, .bk-banner-danger'), null, { timeout: ms });
};

async function newPage(browser, viewport = { width: 1440, height: 900 }) {
  const context = await browser.newContext({ viewport, acceptDownloads: true });
  const page = await context.newPage();
  page.on('console', (msg) => {
    if (msg.type() === 'error' && !/Failed to load resource/.test(msg.text())) consoleErrors.push(msg.text().slice(0, 300));
  });
  page.on('pageerror', (error) => consoleErrors.push(`pageerror: ${error.message}`.slice(0, 300)));
  return { context, page };
}

const openBackups = async (page) => {
  await page.goto(`${BASE}/admin/backups`);
  await page.getByRole('heading', { name: 'Backups', level: 1 }).waitFor({ timeout: 20000 });
};
const openMenu = async (page, rowText) => {
  const row = page.locator('tbody tr', { hasText: rowText }).first();
  await row.getByRole('button', { name: /More actions/ }).click();
  return row;
};

const browser = await chromium.launch({ channel: 'chrome', headless: true });

try {
  // ───────────────────────── Roles that are not allowed (Manager, Staff): no access ─────────────────────────
  for (const key of ['manager', 'staff']) {
    const { context, page } = await newPage(browser);
    await login(page, creds.accounts[key]);
    const nav = await page.locator('aside[aria-label="Admin Navigation"]').innerText();
    check(`${key}: the Backups menu item is hidden`, !/Backups/i.test(nav));
    await page.goto(`${BASE}/admin/backups`);
    await page.waitForTimeout(1500);
    check(`${key}: opening /admin/backups shows no backup page`, (await page.getByRole('heading', { name: 'Backups', level: 1 }).count()) === 0);
    check(`${key}: the API answers 403 to the summary`, (await apiStatus(page, 'GET', `${API}/admin/backups/summary`)) === 403);
    check(`${key}: the API answers 403 to creating a backup`, (await apiStatus(page, 'POST', `${API}/admin/backups`, { type: 'database', note: 'should not work' })) === 403);
    check(`${key}: the API answers 403 to the activity log`, (await apiStatus(page, 'GET', `${API}/admin/backups/audit`)) === 403);
    check(`${key}: GET /access tells the frontend "not allowed"`, (await accessAnswer(page)) === false);
    if (key === 'manager') await shot(page, 'manager-has-no-backups-menu');
    await context.close();
  }

  // ───────────────────────── Admin (allowed by default) ─────────────────────────
  const { context, page } = await newPage(browser);
  await login(page, creds.accounts.admin);
  const nav = await page.locator('aside[aria-label="Admin Navigation"]').innerText();
  check('admin: the Backups menu item is visible', /Backups/.test(nav));
  check('admin: GET /access tells the frontend "allowed"', (await accessAnswer(page)) === true);
  await shot(page, 'admin-menu');

  // Empty state and first-run warning
  await openBackups(page);
  await page.getByText('No backups yet').waitFor();
  check('empty state is shown', true);
  check('"no successful backup yet" warning is shown', await page.getByText('There is no successful backup yet.').isVisible());
  await shot(page, 'empty-state', { fullPage: true });

  await page.getByRole('tab', { name: 'Storage & retention' }).click();
  await page.getByText('Maximum backups kept').waitFor();
  const storageText = await page.locator('.bk-settings-grid').innerText();
  check('storage tab shows backend, location, space used/available and the maximum of 30', /Local filesystem/.test(storageText) && /Maximum backups kept\s*30/.test(storageText) && /Available/.test(storageText));
  check('storage tab confirms a single instance and a direct DB connection', (await page.getByText('Single instance').count()) > 0 && (await page.getByText(/Direct \(/).count()) > 0);
  await shot(page, 'storage-tab', { fullPage: true });

  await page.getByRole('tab', { name: 'Activity log' }).click();
  await page.getByText('No activity yet').waitFor();
  await shot(page, 'activity-empty');
  await page.getByRole('tab', { name: 'Backups' }).click();

  // Create dialog: validation, both types, confirm step
  await page.getByRole('button', { name: 'Create backup' }).click();
  await page.getByRole('dialog').waitFor();
  await shot(page, 'create-dialog');
  await page.getByRole('button', { name: 'Continue' }).click();
  check('create: a note is required', await page.getByText(/note or reason is required/i).isVisible());
  await shot(page, 'create-validation');
  await page.getByLabel(/Note or reason/).fill('Before release v2.3 (database and files)');
  await page.getByRole('radio', { name: /Database \+ uploaded files/ }).check();
  await page.getByRole('button', { name: 'Continue' }).click();
  await page.getByText('You are about to create a backup:').waitFor();
  check('create: a confirm step summarises type and note', (await page.getByRole('dialog').innerText()).includes('Database + files'));
  await shot(page, 'create-confirm');
  await page.getByRole('button', { name: 'Start backup' }).click();

  // Live progress (real: the review database has a large table, so this backup takes several seconds)
  await page.getByText('Backup started').waitFor({ timeout: 15000 });
  await page.waitForTimeout(1500);
  const sawProgress = await page.locator('.bk-banner-info').count();
  check('progress: an "in progress" banner shows while the backup runs', sawProgress > 0 || process.env.REVIEW_BULK !== '1');
  check('progress: the Create backup button is disabled while it runs', sawProgress === 0 || (await page.getByRole('button', { name: 'Create backup' }).isDisabled()));
  await shot(page, 'progress');
  await page.getByText('finished successfully').first().waitFor({ timeout: 120000 });
  await waitSettled(page);
  check('progress: the row ends as Success', (await page.locator('tbody tr').first().innerText()).includes('Success'));
  check('summary: last successful backup shows who ran it', (await page.locator('.um-hero-tiles').innerText()).includes('Admin Reviewer'));
  await shot(page, 'first-backup-success', { fullPage: true });

  // Drop the big table so further backups are quick, then create the rest through the UI and the API
  if (process.env.REVIEW_BULK === '1') psql('DROP TABLE IF EXISTS ui_review_bulk');
  await page.locator('.admin-notice-close').click().catch(() => {});
  await page.getByRole('button', { name: 'Create backup' }).click();
  await page.getByLabel(/Note or reason/).fill('Database only, quick');
  await page.getByRole('button', { name: 'Continue' }).click();
  await page.getByRole('button', { name: 'Start backup' }).click();
  await page.locator('tbody tr', { hasText: 'Database only, quick' }).getByText('Success', { exact: true }).waitFor({ timeout: 60000 });
  await waitSettled(page);
  check('create: a "Full database" backup completes through the UI', (await page.locator('tbody tr', { hasText: 'Database only, quick' }).innerText()).includes('Full database'));

  const bearer = await token(page);
  for (let n = 1; n <= 16; n += 1) {
    const created = await page.evaluate(async ({ n, bearer, api }) => {
      const res = await fetch(`${api}/admin/backups`, { method: 'POST', headers: { Authorization: `Bearer ${bearer}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ type: n % 3 ? 'database' : 'database_files', note: `Seeded backup number ${n}` }) });
      return res.status;
    }, { n, bearer, api: API });
    if (created !== 202) throw new Error(`seeding backup ${n} returned ${created}`);
    await waitNoActiveJob(page, bearer);
  }
  // a failed backup record, for the failed state, its filter and its details
  psql(`INSERT INTO backups (file_name, backup_type, note, created_by_name, started_at, finished_at, duration_ms, status, error_message, storage_backend)
        VALUES ('slt-backup-failed.db.sltbak', 'database', 'Run that failed (seeded record)', 'Admin Reviewer', NOW() - interval '1 hour', NOW() - interval '59 minutes', 4200, 'failed',
                'Failed while dumping database: The database dump failed. See the server log for details.', 'local')`);

  // Table, pagination, filters
  await openBackups(page);
  const firstPageRows = await page.locator('tbody tr').count();
  check('table: sorted newest first, 15 rows per page', firstPageRows === 15, `${firstPageRows} rows`);
  const columns = (await page.locator('thead').innerText()).replace(/\s+/g, ' ').toLowerCase();
  for (const column of ['Backup', 'Date & time', 'Created by', 'Type', 'Note', 'Size', 'Duration', 'Status', 'Checksum', 'Storage']) {
    check(`table: has the "${column}" column`, columns.includes(column.toLowerCase()));
  }
  await shot(page, 'table-page-1', { fullPage: true });
  await page.getByRole('button', { name: '2', exact: true }).click();
  await page.waitForTimeout(800);
  check('pagination: page 2 shows the remaining backups', (await page.locator('tbody tr').count()) === 4, `${await page.locator('tbody tr').count()} rows`);
  await shot(page, 'table-page-2');
  await page.getByRole('button', { name: '1', exact: true }).click();

  await page.getByLabel('Filter by status').selectOption('failed');
  await page.waitForTimeout(800);
  check('filter: status = Failed shows only failed backups', (await page.locator('tbody tr').count()) === 1 && (await page.locator('tbody').innerText()).includes('Failed'));
  await shot(page, 'filter-failed');
  await page.getByRole('button', { name: 'Clear' }).click();
  await page.getByLabel('Filter by type').selectOption('database_files');
  await page.waitForTimeout(800);
  check('filter: type = Database + files', (await page.locator('tbody tr').count()) >= 5 && !(await page.locator('tbody').innerText()).includes('Full database'));
  await page.getByRole('button', { name: 'Clear' }).click();
  await page.getByLabel('Search backups').fill('number 7');
  await page.waitForTimeout(900);
  check('search: finds a backup by its note', (await page.locator('tbody tr').count()) === 1 && (await page.locator('tbody').innerText()).includes('Seeded backup number 7'));
  await page.getByRole('button', { name: 'Clear' }).click();
  const today = new Date().toISOString().slice(0, 10);
  await page.getByLabel('From date').fill('2999-01-01');
  await page.waitForTimeout(800);
  check('filter: a future date range shows the "no matching" state', await page.getByText('No matching backups').isVisible());
  await shot(page, 'filter-no-match');
  await page.getByRole('button', { name: 'Clear' }).click();
  await page.getByLabel('From date').fill(today);
  await page.waitForTimeout(800);
  check('filter: today as the start date still lists the backups', (await page.locator('tbody tr').count()) > 0);
  await page.getByRole('button', { name: 'Clear' }).click();
  await page.waitForTimeout(500);

  // Details (good and failed). The older backups are on page 2, so find them with search / filter.
  await page.getByLabel('Search backups').fill('Before release v2.3');
  await page.waitForTimeout(900);
  const goodRow = page.locator('tbody tr', { hasText: 'Before release v2.3' }).first();
  await goodRow.getByRole('button', { name: 'Details' }).click();
  await page.getByRole('dialog').getByText('SHA-256 checksum').waitFor();
  check('details: show the full checksum, location and what the backup contains', (await page.getByRole('dialog').innerText()).includes('uploads folder'));
  await shot(page, 'details');
  await page.getByRole('button', { name: 'Close' }).last().click();
  await page.getByRole('button', { name: 'Clear' }).click();
  await page.getByLabel('Filter by status').selectOption('failed');
  await page.waitForTimeout(800);
  await page.locator('tbody tr', { hasText: 'Run that failed' }).getByRole('button', { name: 'Details' }).click();
  check('details: a failed backup shows its error message', await page.getByRole('dialog').getByText(/The database dump failed/).isVisible());
  await shot(page, 'details-failed');
  await page.getByRole('button', { name: 'Close' }).last().click();
  await page.getByRole('button', { name: 'Clear' }).click();
  await page.getByLabel('Search backups').fill('Before release v2.3');
  await page.waitForTimeout(900);

  // Verify and test restore
  const targetNote = 'Before release v2.3';
  await openMenu(page, targetNote);
  await page.getByRole('menuitem', { name: 'Verify integrity' }).click();
  await page.getByText('Integrity check passed').waitFor({ timeout: 60000 });
  check('verify: the integrity check passes', true);
  await openMenu(page, targetNote);
  await page.getByRole('menuitem', { name: 'Test restore' }).click();
  await page.getByText('Test restore passed').waitFor({ timeout: 90000 });
  check('test restore: passes and the temporary database is dropped', psql(`SELECT count(*) FROM pg_database WHERE datname LIKE 'slt_backup_test_%'`) === '0');
  await page.locator('tbody tr', { hasText: targetNote }).getByRole('button', { name: 'Details' }).click();
  await page.getByRole('dialog').getByText('Rows restored').waitFor();
  check('test restore: details list the row counts per table', (await page.getByRole('dialog').innerText()).includes('applications'));
  await shot(page, 'details-verify-and-test-restore', { fullPage: true });
  await page.getByRole('button', { name: 'Close' }).last().click();

  // Download: password re-entry
  await openMenu(page, targetNote);
  await page.getByRole('menuitem', { name: /Download/ }).click();
  await page.getByRole('dialog').getByText('This file contains customer personal data').waitFor();
  await shot(page, 'download-modal');
  await page.getByLabel(/Your password/).fill('definitely-wrong');
  await page.getByRole('button', { name: 'Download', exact: true }).click();
  await page.getByText('Incorrect password').waitFor();
  check('download: a wrong password is refused with a clear message (and does not sign you out)', (await page.locator('aside[aria-label="Admin Navigation"]').count()) === 1);
  await shot(page, 'download-wrong-password');
  await page.getByLabel(/Your password/).fill(creds.accounts.admin.password);
  const [download] = await Promise.all([page.waitForEvent('download', { timeout: 60000 }), page.getByRole('button', { name: 'Download', exact: true }).click()]);
  const downloaded = fs.readFileSync(await download.path());
  check('download: the file arrives, encrypted (SLTB header) and non-empty', downloaded.subarray(0, 4).toString() === 'SLTB' && downloaded.length > 1000, `${downloaded.length} bytes`);
  await page.getByText('Download started').waitFor();
  await shot(page, 'download-done');

  // Delete: latest successful cannot be deleted; an older one can
  await page.getByRole('button', { name: 'Clear' }).click();
  await page.waitForTimeout(800);
  const latestSuccess = page.locator('tbody tr').filter({ hasText: 'Success' }).first();
  await latestSuccess.getByRole('button', { name: /More actions/ }).click();
  const deleteItem = page.getByRole('menuitem', { name: /Delete/ });
  check('delete: the most recent successful backup cannot be deleted', await deleteItem.isDisabled());
  // The row menu must be fully visible: not clipped by the table and not covered by neighbouring cells.
  const menuVisible = await page.evaluate(() => [...document.querySelectorAll('[role="menuitem"]')].every((item) => {
    const box = item.getBoundingClientRect();
    const top = document.elementFromPoint(box.left + box.width / 2, box.top + box.height / 2);
    return box.width > 100 && item.contains(top);
  }));
  check('menu: all five actions are fully visible and clickable (not clipped or covered)', menuVisible);
  await shot(page, 'delete-disabled-for-latest');
  await page.keyboard.press('Escape');
  await openMenu(page, 'Seeded backup number 2');
  await page.getByRole('menuitem', { name: /Delete/ }).click();
  await page.getByRole('dialog').getByText('This cannot be undone').waitFor();
  await shot(page, 'delete-modal');
  await page.getByRole('button', { name: 'Delete permanently' }).click();
  await page.getByText('Backup deleted.').waitFor();
  check('delete: an older backup is deleted after confirmation', (await page.locator('tbody tr', { hasText: 'Seeded backup number 2' }).count()) === 0);

  // Restore (high risk)
  const before = dataFingerprint();
  psql(`UPDATE customers SET name = 'CHANGED AFTER BACKUP' WHERE phone LIKE '%7'; DELETE FROM applications WHERE reference_number LIKE '%5'; INSERT INTO products (id, name, category) VALUES ('P7777', 'Added after backup', 'Fibre')`);
  check('restore: data was changed before restoring', dataFingerprint() !== before);
  await page.getByLabel('Search backups').fill(targetNote);
  await page.waitForTimeout(900);
  await openMenu(page, targetNote);
  await page.getByRole('menuitem', { name: /Restore/ }).click();
  const dialog = page.getByRole('dialog');
  await dialog.getByText('Restoring replaces ALL current data').waitFor();
  const restoreButton = dialog.getByRole('button', { name: 'Restore now' });
  check('restore: shows the replace-data warning and the safety-backup notice', (await dialog.innerText()).includes('safety backup'));
  check('restore: the button is disabled until the confirmation is typed', await restoreButton.isDisabled());
  await shot(page, 'restore-modal', { fullPage: true });
  await dialog.getByLabel(/Type RESTORE/).fill('restore');
  await dialog.getByLabel(/Your password/).fill(creds.accounts.admin.password);
  check('restore: lower-case "restore" does not unlock the button', await restoreButton.isDisabled());
  await dialog.getByLabel(/Type RESTORE/).fill('RESTORE');
  await dialog.getByLabel(/Your password/).fill('wrong-password-1');
  await restoreButton.click();
  await dialog.getByText('Incorrect password').waitFor();
  check('restore: a wrong password is refused and nothing changes', dataFingerprint() !== before);
  await shot(page, 'restore-wrong-password');
  await dialog.getByLabel(/Your password/).fill(creds.accounts.admin.password);
  await restoreButton.click();
  await page.getByText('Restore started').waitFor();
  await shot(page, 'restore-progress');
  await page.getByText(/Restore completed/).waitFor({ timeout: 120000 });
  await waitSettled(page);
  check('restore: the data matches the backup exactly afterwards', dataFingerprint() === before);
  await page.getByRole('button', { name: 'Clear' }).click();
  await page.waitForTimeout(800);
  check('restore: an "Auto pre-restore backup" was created', (await page.locator('tbody tr', { hasText: 'Auto pre-restore backup' }).count()) >= 1);
  check('restore: the backup history was not rolled back', Number(psql('SELECT count(*) FROM backups')) >= 19);
  await shot(page, 'restore-done', { fullPage: true });

  // Activity log and CSV export
  await page.getByRole('tab', { name: 'Activity log' }).click();
  await page.getByRole('cell', { name: 'Restored' }).first().waitFor();
  const activity = await page.locator('tbody').innerText();
  for (const action of ['Created', 'Verified', 'Test restored', 'Downloaded', 'Deleted', 'Restored']) check(`activity: records "${action}"`, activity.includes(action));
  check('activity: records the failed download attempt', /Failure/.test(activity));
  check('activity: records who and from which IP', /Admin Reviewer/.test(activity) && /(::1|127\.0\.0\.1|::ffff:127\.0\.0\.1)/.test(activity));
  await shot(page, 'activity-log', { fullPage: true });
  await page.getByLabel('Filter by action').selectOption('downloaded');
  await page.waitForTimeout(800);
  check('activity: the action filter works', (await page.locator('tbody tr').count()) >= 2 && !(await page.locator('tbody').innerText()).includes('Restored'));
  await shot(page, 'activity-filtered');
  const [csv] = await Promise.all([page.waitForEvent('download', { timeout: 30000 }), page.getByRole('button', { name: 'Export CSV' }).click()]);
  const csvText = fs.readFileSync(await csv.path(), 'utf8');
  check('activity: CSV export downloads with a header and rows', csvText.includes('Time (UTC)') && csvText.split('\n').length > 3, `${csv.suggestedFilename()}`);
  await page.getByRole('button', { name: 'Clear' }).click();

  // Stale-backup warning
  psql(`UPDATE backups SET finished_at = NOW() - interval '10 days' WHERE status = 'success'`);
  await openBackups(page);
  await page.getByText('Your last successful backup is out of date.').waitFor();
  check('warning: a backup older than 7 days shows the stale warning', /10 days ago/.test(await page.locator('.bk-banner-warn').first().innerText()));
  await shot(page, 'stale-warning');
  psql(`UPDATE backups SET finished_at = NOW() WHERE status = 'success'`);

  // 30-backup limit (real: create backups until 30 are stored)
  const stored = Number(psql(`SELECT count(*) FROM backups WHERE status IN ('success','in_progress')`));
  for (let n = stored; n < 30; n += 1) {
    await page.evaluate(async ({ n, bearer, api }) => {
      await fetch(`${api}/admin/backups`, { method: 'POST', headers: { Authorization: `Bearer ${bearer}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ type: 'database', note: `Filler backup ${n}` }) });
    }, { n, bearer, api: API });
    await waitNoActiveJob(page, bearer);
  }
  await openBackups(page);
  await page.getByText(/30 of 30 backups stored/).waitFor();
  check('limit: at 30 backups a clear warning asks for old ones to be deleted', true);
  await shot(page, 'limit-warning');
  await page.getByRole('button', { name: 'Create backup' }).click();
  await page.getByRole('dialog').getByText(/30-backup limit has been reached/).waitFor();
  check('limit: the Create dialog explains it and cannot continue', await page.getByRole('button', { name: 'Continue' }).isDisabled());
  await shot(page, 'limit-create-dialog');
  await page.getByRole('button', { name: 'Cancel' }).click();
  check('limit: nothing was deleted automatically', Number(psql(`SELECT count(*) FROM backups WHERE status = 'success'`)) >= 29);

  // Error messages (these two use mocked server responses, to show how errors look)
  await page.route('**/api/admin/backups/summary', (route) => route.fulfill({ status: 500, contentType: 'application/json', body: JSON.stringify({ success: false, message: 'Database temporarily unavailable.' }) }));
  await openBackups(page);
  await page.getByText(/could not be loaded|temporarily unavailable/i).first().waitFor({ timeout: 15000 });
  check('error: a failed load shows a readable message', true);
  await shot(page, 'error-load-failed');
  await page.unroute('**/api/admin/backups/summary');
  psql(`DELETE FROM backups WHERE note LIKE 'Filler backup%'`);
  await openBackups(page);
  await page.route('**/api/admin/backups', (route, request) => request.method() === 'POST'
    ? route.fulfill({ status: 503, contentType: 'application/json', body: JSON.stringify({ success: false, code: 'ENCRYPTION_NOT_CONFIGURED', message: 'Backup encryption is not configured. Ask the server administrator to set BACKUP_ENCRYPTION_KEY.' }) })
    : route.continue());
  await page.getByRole('button', { name: 'Create backup' }).click();
  await page.getByLabel(/Note or reason/).fill('This will fail');
  await page.getByRole('button', { name: 'Continue' }).click();
  await page.getByRole('button', { name: 'Start backup' }).click();
  await page.getByText(/Backup encryption is not configured/).waitFor();
  check('error: a refused backup shows the server\'s friendly message in the dialog', true);
  await shot(page, 'error-create-failed');
  await page.getByRole('button', { name: 'Cancel' }).click();
  await page.unroute('**/api/admin/backups');

  // Narrow screen
  await page.setViewportSize({ width: 390, height: 844 });
  await openBackups(page);
  await shot(page, 'mobile-page');
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  check('mobile: the page itself does not scroll sideways', overflow <= 1, `${overflow}px`);
  await page.getByRole('button', { name: 'Create backup' }).click();
  await page.getByRole('dialog').waitFor();
  const dialogBox = await page.getByRole('dialog').boundingBox();
  check('mobile: the dialog fits the screen', dialogBox && dialogBox.width <= 390 && dialogBox.x >= 0, `${Math.round(dialogBox?.width)}px wide`);
  await shot(page, 'mobile-create-dialog');
  await page.getByRole('button', { name: 'Cancel' }).click();
  await page.locator('.admin-table-wrap').first().scrollIntoViewIfNeeded();
  await shot(page, 'mobile-table');
  await page.setViewportSize({ width: 768, height: 1024 });
  await shot(page, 'tablet-page');
  await context.close();
} catch (error) {
  check('review script ran to the end', false, error.message.split('\n')[0]);
  console.error(error);
} finally {
  await browser.close();
}

check('no JavaScript errors were logged in the browser console', consoleErrors.length === 0, consoleErrors.slice(0, 3).join(' | '));
const failed = results.filter((r) => !r.ok);
fs.writeFileSync(path.join(SHOTS, 'review-results.json'), JSON.stringify({ passed: results.length - failed.length, failed: failed.length, results }, null, 2));
console.log(`\n${results.length - failed.length} passed, ${failed.length} failed. Screenshots: ${SHOTS}`);
process.exit(failed.length ? 1 : 0);
