// Which admin pages a signed-in account may open. A module page's key is also
// the privilege that grants it; Admins can open every page except the ones
// reserved for the Super Admin.

const ADMIN_ONLY_PAGES = new Set(['users', 'branches', 'sales-officers', 'audit-logs']);

// Backup Dashboard: Super Admin only. The server enforces this too (403) — this
// only keeps the menu item and page out of everyone else's sight.
const SUPER_ADMIN_ONLY_PAGES = new Set(['backups']);

// Where an account lands when the page it asked for is not available to it.
const LANDING_PAGES = ['so-dashboard', 'dashboard', 'leads', 'kyc', 'forms', 'analytics', 'appointments', 'technician', 'users'];

const roleIs = (account, pattern) => pattern.test(String(account?.role || '').trim());

export const isSuperAdmin = (account) => roleIs(account, /^super\s*admin$/i);

/** True when the account may open this page. */
export function canOpenPage(account, page) {
  if (SUPER_ADMIN_ONLY_PAGES.has(page)) return isSuperAdmin(account);
  if (page === 'so-dashboard') return roleIs(account, /^sales\s*officer$/i);
  if (roleIs(account, /^(super\s*)?admin$/i)) return true;
  if (ADMIN_ONLY_PAGES.has(page)) return false;
  return (account?.permissions || []).includes(page);
}

/** The first page this account may open, or null when it has none. */
export const landingPage = (account) => LANDING_PAGES.find((page) => canOpenPage(account, page)) || null;
