// Which admin pages a signed-in account may open. A module page's key is also
// the privilege that grants it; Admins can open every page.

const ADMIN_ONLY_PAGES = new Set(['users', 'branches', 'sales-officers', 'audit-logs']);

// Where an account lands when the page it asked for is not available to it.
const LANDING_PAGES = ['so-dashboard', 'dashboard', 'leads', 'kyc', 'forms', 'analytics', 'appointments', 'technician', 'users'];

const roleIs = (account, pattern) => pattern.test(String(account?.role || '').trim());

/** True when the account may open this page. */
export function canOpenPage(account, page) {
  if (page === 'so-dashboard') return roleIs(account, /^sales\s*officer$/i);
  if (roleIs(account, /^admin$/i)) return true;
  if (ADMIN_ONLY_PAGES.has(page)) return false;
  return (account?.permissions || []).includes(page);
}

/** The first page this account may open, or null when it has none. */
export const landingPage = (account) => LANDING_PAGES.find((page) => canOpenPage(account, page)) || null;
