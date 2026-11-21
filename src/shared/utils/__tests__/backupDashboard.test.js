import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { canOpenPage, landingPage } from '../../../admin/utils/pageAccess.js';
import {
  formatBytes, formatDuration, shortChecksum, hasRunningWork, actionBlockedReason, deleteBlockedReason,
} from '../../../admin/utils/backupUtils.js';

describe('Backups menu item and page: the server decides, not a role name', () => {
  test('hidden until the server says the user may use backups', () => {
    for (const role of ['Admin', 'Staff', 'Manager', 'Sales Officer', 'Customer', 'Super Admin']) {
      assert.equal(canOpenPage({ role }, 'backups'), false, `${role} without a server answer`);
      assert.equal(canOpenPage({ role }, 'backups', { backups: false }), false, `${role} refused by the server`);
    }
  });

  test('shown when the server says yes, whatever the role is called', () => {
    for (const role of ['Admin', 'Manager', 'Team Lead']) {
      assert.equal(canOpenPage({ role }, 'backups', { backups: true }), true, role);
    }
  });

  test('only a real boolean true opens it (never a truthy string)', () => {
    assert.equal(canOpenPage({ role: 'Admin' }, 'backups', { backups: 'true' }), false);
    assert.equal(canOpenPage({ role: 'Admin' }, 'backups', { backups: 1 }), false);
    assert.equal(canOpenPage({ role: 'Admin' }, 'backups', { backups: undefined }), false);
  });

  test('a privilege named "backups" cannot grant access', () => {
    assert.equal(canOpenPage({ role: 'Custom', permissions: ['backups', 'all'] }, 'backups'), false);
  });

  test('other pages are unchanged: Admin opens them all, there is no special Super Admin role', () => {
    for (const page of ['users', 'audit-logs', 'branches', 'dashboard', 'kyc']) {
      assert.equal(canOpenPage({ role: 'Admin' }, page), true, page);
      assert.equal(canOpenPage({ role: 'Super Admin' }, page), false, `Super Admin ${page}`);
    }
    assert.equal(canOpenPage({ role: 'Staff', permissions: ['kyc'] }, 'kyc'), true);
    assert.equal(canOpenPage({ role: 'Staff', permissions: [] }, 'users'), false);
    assert.equal(landingPage({ role: 'Admin' }), 'dashboard');
    assert.equal(landingPage({ role: 'Admin' }, { backups: true }), 'dashboard', 'backups is never a landing page');
  });
});

describe('Backup formatting helpers', () => {
  test('formatBytes', () => {
    assert.equal(formatBytes(null), '—');
    assert.equal(formatBytes(512), '512 B');
    assert.equal(formatBytes(1536), '1.5 KB');
    assert.equal(formatBytes(5 * 1024 * 1024), '5.0 MB');
    assert.equal(formatBytes(250 * 1024 ** 3), '250 GB');
  });

  test('formatDuration', () => {
    assert.equal(formatDuration(null), '—');
    assert.equal(formatDuration(200), '< 1 s');
    assert.equal(formatDuration(42_000), '42 s');
    assert.equal(formatDuration(125_000), '2 min 5 s');
    assert.equal(formatDuration(3_900_000), '1 h 5 min');
  });

  test('shortChecksum keeps both ends', () => {
    assert.equal(shortChecksum(null), '—');
    assert.equal(shortChecksum('a'.repeat(64)), 'aaaaaaaa…aaaa');
  });
});

describe('Backup row rules', () => {
  const ok = { id: 'b1', status: 'success' };

  test('actions need a successful backup and no running job', () => {
    assert.equal(actionBlockedReason(ok, { activeJob: null }), '');
    assert.match(actionBlockedReason({ id: 'b2', status: 'failed' }, {}), /successful/);
    assert.match(actionBlockedReason(ok, { activeJob: { op: 'backup' } }), /running/);
  });

  test('the most recent successful backup cannot be deleted', () => {
    assert.match(deleteBlockedReason(ok, { lastSuccess: { id: 'b1' } }), /most recent/);
    assert.equal(deleteBlockedReason(ok, { lastSuccess: { id: 'other' } }), '');
    assert.equal(deleteBlockedReason({ id: 'f', status: 'failed' }, { lastSuccess: { id: 'f' } }), '');
    assert.match(deleteBlockedReason({ id: 'r', status: 'in_progress' }, {}), /running/);
  });

  test('polling is needed while anything runs', () => {
    assert.equal(hasRunningWork([ok], { activeJob: null }), false);
    assert.equal(hasRunningWork([{ status: 'in_progress' }], null), true);
    assert.equal(hasRunningWork([{ status: 'success', verifyResult: { status: 'running' } }], null), true);
    assert.equal(hasRunningWork([ok], { activeJob: { op: 'restore' } }), true);
  });
});
