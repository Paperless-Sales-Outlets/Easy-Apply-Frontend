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
  { key: 'leads',        label: 'Lead Management', roles: ['Admin', 'Staff', 'Manager'] },
  { key: 'analytics',    label: 'Reports & Analytics', roles: ['Admin', 'Staff', 'Manager'] },
];

// ── User Management ────────────────────────────────────────────────────────
// Roles themselves are no longer a fixed list here — an Admin creates and
// maintains them from User Management (see services/adminService.js
// getStaffRoles/createStaffRole/updateStaffRole/deleteStaffRole), each one a
// name plus a default set of MODULE_ACCESS keys.
