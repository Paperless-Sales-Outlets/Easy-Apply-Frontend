// ─── Admin Dummy Data ────────────────────────────────────────────────────────
// Centralized mock data used across all Admin dashboard pages.
// Replace each dataset with real API calls when backend is wired up.

// ── User Privileges ────────────────────────────────────────────────────────────
export const SYSTEM_ROLES = [
  'Admin',
  'Manager',
  'SalesOfficer',
];

export const MODULE_ACCESS = [
  { key: 'dashboard',    label: 'Dashboard',    roles: ['Admin', 'Staff', 'Manager', 'SalesOfficer'] },
  { key: 'kyc',          label: 'KYC Review',   roles: ['Admin', 'Staff', 'Manager'] },
  { key: 'appointments', label: 'Appointments', roles: ['Admin', 'Staff', 'Manager'] },
  { key: 'technician',   label: 'My Jobs',      roles: ['Admin', 'Staff', 'SalesOfficer'] },
  { key: 'forms',        label: 'Forms',        roles: ['Admin', 'Staff', 'Manager'] },
  { key: 'analytics',    label: 'Reports & Analytics', roles: ['Admin', 'Staff', 'Manager'] },
];

// ── User Management ────────────────────────────────────────────────────────
// Roles themselves are no longer a fixed list here — an Admin creates and
// maintains them from User Management (see services/adminService.js
// getStaffRoles/createStaffRole/updateStaffRole/deleteStaffRole), each one a
// name plus a default set of MODULE_ACCESS keys.

// ── Two-Week Form Submission Data ─────────────────────────────────────────────
function generateDailyData() {
  const days = [];
  const start = new Date('2026-07-17');
  for (let i = 13; i >= 0; i--) {
    const d = new Date(start);
    d.setDate(start.getDate() - i);
    const dateStr = d.toISOString().slice(0, 10);
    const day = d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
    days.push({
      date: dateStr,
      day,
      submitted: Math.floor(Math.random() * 6) + 1,
      completed: Math.floor(Math.random() * 4),
    });
  }
  return days;
}

export const DUMMY_FORM_WEEKLY = [
  { id: 'new-connection', label: 'New Connection', daily: generateDailyData() },
  { id: 'reconnection', label: 'Reconnection', daily: generateDailyData() },
  { id: 'relocation', label: 'Relocation', daily: generateDailyData() },
  { id: 'termination', label: 'Termination', daily: generateDailyData() },
  { id: 'transfer', label: 'Transfer', daily: generateDailyData() },
  { id: 'package-migration', label: 'Package Migration', daily: generateDailyData() },
  { id: 'service-vacation', label: 'Service Vacation', daily: generateDailyData() },
  { id: 'refund-request', label: 'Refund Request', daily: generateDailyData() },
  { id: 'customer-request-acceptance', label: 'Customer Request Acceptance', daily: generateDailyData() },
];
