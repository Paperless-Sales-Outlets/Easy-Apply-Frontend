import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { canOpenPage, landingPage, isSuperAdmin } from '../../../admin/utils/pageAccess.js';
import {
  formatBytes, formatDuration, shortChecksum, hasRunningWork, actionBlockedReason, deleteBlockedReason,
} from '../../../admin/utils/backupUtils.js';

describe('Backup Dashboard access (menu visibility)', () => {
  test('only a Super Admin can open the backups page', () => {
    assert.equal(canOpenPage({ role: 'Super Admin' }, 'backups'), true);
    assert.equal(canOpenPage({ role: ' super admin ' }, 'backups'), true);
    for (const role of ['Admin', 'Staff', 'Manager', 'Sales Officer', 'Customer']) {
      assert.equal(canOpenPage({ role, permissions: ['backups'] }, 'backups'), false, role);
    }
    assert.equal(canOpenPage(null, 'backups'), false);
  });

  test('a privilege named "backups" cannot grant access', () => {
    assert.equal(canOpenPage({ role: 'Custom', permissions: ['backups', 'all'] }, 'backups'), false);
  });

  test('a Super Admin keeps Admin pages; an Admin is not a Super Admin', () => {
    for (const page of ['users', 'audit-logs', 'branches', 'dashboard', 'kyc']) {
      assert.equal(canOpenPage({ role: 'Super Admin' }, page), true, page);
    }
    assert.equal(isSuperAdmin({ role: 'Admin' }), false);
    assert.equal(landingPage({ role: 'Super Admin' }), 'dashboard');
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
