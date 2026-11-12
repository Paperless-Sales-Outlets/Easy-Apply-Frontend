import React, { useState } from 'react';
import { useAdminAuth } from '../context/AdminAuthContext';
import { MODULE_ACCESS } from '../data/dummyData';
import { FORM_TYPES } from '../utils/applicationUtils';
import { canOpenPage } from '../utils/pageAccess';
import sltLogo from '../../assets/slt-logo.png';
import PasskeyManagementModal from './PasskeyManagementModal';

const NAV_ICONS = {
  dashboard: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" />
      <rect x="14" y="3" width="7" height="7" />
      <rect x="3" y="14" width="7" height="7" />
      <rect x="14" y="14" width="7" height="7" />
    </svg>
  ),
  kyc: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="5" width="20" height="14" rx="2" />
      <circle cx="8" cy="12" r="2" />
      <path d="M14 10h4M14 14h4" />
    </svg>
  ),
  appointments: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <path d="M16 2v4M8 2v4M3 10h18" />
    </svg>
  ),
  technician: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
    </svg>
  ),
  forms: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" />
    </svg>
  ),
  analytics: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="20" x2="18" y2="10" />
      <line x1="12" y1="20" x2="12" y2="4" />
      <line x1="6" y1="20" x2="6" y2="14" />
    </svg>
  ),
  applications: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 4h16v4H4z" />
      <path d="M4 10h16v10H4z" />
      <path d="M8 14h8" />
      <path d="M8 18h5" />
    </svg>
  ),
  leads: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 12h4l3 8 4-16 3 8h4" />
    </svg>
  ),
  users: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M19 8v6M22 11h-6" />
    </svg>
  ),
  'audit-logs': (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 4h16v16H4z" /><path d="M8 8h8M8 12h8M8 16h5" />
    </svg>
  ),
  'sales-officers': (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><path d="M17 17h.01M17 20h.01M20 17h.01M20 20h.01" strokeWidth="3" strokeLinecap="round" />
    </svg>
  ),
  'so-dashboard': (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 3v18h18" /><path d="M7 12l4-4 4 4 4-5" />
    </svg>
  ),
};

// Every sidebar entry, keyed by page. Module entries come from MODULE_ACCESS.
const NAV_BY_KEY = {
  ...Object.fromEntries(MODULE_ACCESS.map((item) => [item.key, { ...item, icon: NAV_ICONS[item.key] }])),
  users: { key: 'users', label: 'User Management', icon: NAV_ICONS.users },
  // Sales Officer Management — Admin can manage all officers + their QR codes
  'sales-officers': { key: 'sales-officers', label: 'QR Management', icon: NAV_ICONS['sales-officers'] },
  'audit-logs': { key: 'audit-logs', label: 'Audit Logs', icon: NAV_ICONS['audit-logs'] },
  // Sales Officer personal dashboard — visible only to Sales Officer role
  'so-dashboard': { key: 'so-dashboard', label: 'My Dashboard', icon: NAV_ICONS['so-dashboard'] },
};

// Sidebar sections, in the order set by the supervisor: the overview, the
// admin's main tasks, the customer-facing operations, then field work.
// A module that is not listed here (e.g. a new one) still shows, under "More".
const NAV_SECTION_LAYOUT = [
  { key: 'overview', label: 'Overview', items: ['dashboard', 'so-dashboard'] },
  { key: 'administration', label: 'Administration', items: ['analytics', 'audit-logs', 'users'] },
  { key: 'operations', label: 'Operations', items: ['sales-officers', 'kyc', 'leads', 'forms'] },
  { key: 'field', label: 'Field Service', items: ['appointments', 'technician'] },
];

const LISTED_NAV_KEYS = new Set(NAV_SECTION_LAYOUT.flatMap((section) => section.items));
const UNLISTED_NAV_KEYS = Object.keys(NAV_BY_KEY).filter((key) => !LISTED_NAV_KEYS.has(key));

const NAV_SECTIONS = [
  ...NAV_SECTION_LAYOUT.slice(0, -1),
  ...(UNLISTED_NAV_KEYS.length ? [{ key: 'more', label: 'More', items: UNLISTED_NAV_KEYS }] : []),
  NAV_SECTION_LAYOUT[NAV_SECTION_LAYOUT.length - 1],
].map((section) => ({
  ...section,
  items: section.items.filter((key) => NAV_BY_KEY[key]).map((key) => NAV_BY_KEY[key]),
}));

const SHORT_FORM_LABELS = {
  'Customer Request Acceptance': 'Cust. Request',
};

function shortFormLabel(label) {
  return SHORT_FORM_LABELS[label] || label;
}

/** Admin portal shell: sidebar navigation, user menu and the active page content. */
export default function AdminLayout({ activePage, setActivePage, children, onSelectForm, activeFormId }) {
  const { admin, logout } = useAdminAuth();
  const [openForms, setOpenForms] = useState(activePage === 'forms');
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [passkeyModalOpen, setPasskeyModalOpen] = useState(false);

  // Only the sections this account can open something in; a lone module needs no heading.
  const visibleSections = NAV_SECTIONS
    .map(section => ({ ...section, items: section.items.filter(item => canOpenPage(admin, item.key)) }))
    .filter(section => section.items.length > 0);
  const showSectionHeadings = visibleSections.reduce((count, section) => count + section.items.length, 0) > 1;

  const handleNavClick = (item) => {
    if (item.key === 'forms') {
      setOpenForms(open => !open);
      return;
    }
    setActivePage(item.key);
    setOpenForms(false);
    setMobileNavOpen(false);
  };

  const handleFormSelect = (formId) => {
    onSelectForm?.(formId);
    setMobileNavOpen(false);
  };

  const handleSignOut = () => {
    setMobileNavOpen(false);
    logout();
  };

  const initials = admin?.name
    ? admin.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
    : 'A';

  // 'Admin' and 'Staff' are the only fixed labels — everything else is a
  // custom role name an Admin defined in User Management, shown as-is.
  const roleLabel = { Admin: 'Administrator', Staff: 'Staff' }[admin?.role] || admin?.role || 'Staff';

  return (
    <div className="admin-shell">
      {/* ── Mobile hamburger ── */}
      <button
        type="button"
        className="admin-mobile-toggle"
        aria-label={mobileNavOpen ? 'Close navigation' : 'Open navigation'}
        aria-expanded={mobileNavOpen}
        onClick={() => setMobileNavOpen(open => !open)}
      >
        {mobileNavOpen ? (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        ) : (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
            <line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        )}
      </button>

      {/* ── Mobile overlay ── */}
      {mobileNavOpen && (
        <div
          className="admin-sidebar-overlay"
          onClick={() => setMobileNavOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* ── Sidebar ── */}
      <aside className={`admin-sidebar${mobileNavOpen ? ' open' : ''}`} aria-label="Admin Navigation">
        <div className="admin-sidebar-logo">
          <img className="admin-sidebar-logo-img" src={sltLogo} alt="SLTMobitel" />
          <span className="admin-sidebar-brand-text">
            Easy Apply
            <small>Admin Portal</small>
          </span>
        </div>

        <nav className="admin-nav">
          {visibleSections.map(section => (
            <div
              className="admin-nav-section"
              key={section.key}
              role="group"
              aria-labelledby={showSectionHeadings ? `admin-nav-heading-${section.key}` : undefined}
            >
              {showSectionHeadings && (
                <div className="admin-nav-heading" id={`admin-nav-heading-${section.key}`}>{section.label}</div>
              )}
              {section.items.map(item => (
                <div className="admin-nav-group" key={item.key}>
                  <button
                    className={`admin-nav-item${activePage === item.key ? ' active' : ''}`}
                    onClick={() => handleNavClick(item)}
                  >
                    <span style={{ fontSize: '1rem' }}>{item.icon}</span>
                    {item.label}
                    {item.key === 'forms' && (
                      <span className={`admin-nav-caret${openForms ? ' open' : ''}`}>▾</span>
                    )}
                  </button>
                  {item.key === 'forms' && openForms && (
                    <div className="admin-nav-submenu">
                      {FORM_TYPES.map(form => (
                        <button
                          key={form.id}
                          className={`admin-nav-submenu-item${activeFormId === form.id ? ' active' : ''}`}
                          onClick={() => handleFormSelect(form.id)}
                        >
                          {shortFormLabel(form.label)}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ))}
        </nav>

        <div className="admin-sidebar-footer">
          <div className="admin-sidebar-user">
            <div className="admin-avatar">{initials}</div>
            <div className="admin-user-info">
              <div className="admin-user-name">{admin?.name}</div>
              <div className="admin-user-role">{roleLabel}</div>
            </div>
          </div>
          <div className="admin-sidebar-footer-actions">
            <button
              type="button"
              className="admin-passkey-manage-btn"
              onClick={() => setPasskeyModalOpen(true)}
              title="Manage device passkeys"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="7.5" cy="15.5" r="5.5" />
                <path d="m21 2-9.6 9.6" />
                <path d="m15.5 7.5 3 3L22 7l-3-3" />
              </svg>
              Passkeys
            </button>
            <button className="admin-signout-btn" onClick={handleSignOut}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            Sign Out
          </button>
        </div>
          </div>
      </aside>

      <PasskeyManagementModal
        isOpen={passkeyModalOpen}
        onClose={() => setPasskeyModalOpen(false)}
      />

      {/* ── Main Content ── */}
      <div className="admin-main">
        <div className="admin-topbar" />
        <div className={`admin-page${['dashboard', 'forms', 'analytics', 'kyc', 'appointments', 'technician', 'users', 'audit-logs', 'sales-officers', 'so-dashboard', 'leads'].includes(activePage) ? ' admin-page-wide' : ''}`}>
          {children}
        </div>
      </div>
    </div>
  );
}
