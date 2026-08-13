import React, { useState } from 'react';
import { useAdminAuth } from '../context/AdminAuthContext';
import { MODULE_ACCESS, DUMMY_FORM_WEEKLY } from '../data/dummyData';
import sltLogo from '../../../assets/sltlogoOnly.png';

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
  privileges: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  ),
};

const NAV_ITEMS = [
  ...MODULE_ACCESS.map(item => ({ ...item, icon: NAV_ICONS[item.key] })),
  { key: 'privileges', label: 'User Privileges', icon: NAV_ICONS.privileges, roles: ['Admin'] },
];

const SHORT_FORM_LABELS = {
  'Customer Request Acceptance': 'Cust. Request',
};

function shortFormLabel(label) {
  return SHORT_FORM_LABELS[label] || label;
}

export default function AdminLayout({ activePage, setActivePage, children, onSelectForm, activeFormId }) {
  const { admin, logout } = useAdminAuth();
  const [openForms, setOpenForms] = useState(activePage === 'forms');

  const visibleNav = NAV_ITEMS.filter(item =>
    item.roles.includes(admin?.role || 'Admin')
  );

  const handleNavClick = (item) => {
    if (item.key === 'forms') {
      setOpenForms(open => !open);
      return;
    }
    setActivePage(item.key);
    setOpenForms(false);
  };

  const initials = admin?.name
    ? admin.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
    : 'A';

  const roleLabel = {
    Admin: 'Administrator',
    Staff: 'Staff',
    Manager: 'Manager',
    SalesOfficer: 'Sales Officer',
  }[admin?.role] || 'Staff';

  return (
    <div className="admin-shell">
      {/* ── Sidebar ── */}
      <aside className="admin-sidebar" aria-label="Admin Navigation">
        <div className="admin-sidebar-logo">
          <img src={sltLogo} alt="SLTMobitel" style={{ height: 32, width: 'auto' }} />
          <span>
            SLTMobitel EasyApply
            <small>Admin Portal</small>
          </span>
        </div>

        <nav className="admin-nav">
          {visibleNav.map(item => (
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
                  {DUMMY_FORM_WEEKLY.map(form => (
                    <button
                      key={form.id}
                      className={`admin-nav-submenu-item${activeFormId === form.id ? ' active' : ''}`}
                      onClick={() => onSelectForm?.(form.id)}
                    >
                      {shortFormLabel(form.label)}
                    </button>
                  ))}
                </div>
              )}
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
          <button className="admin-signout-btn" onClick={logout}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            Sign Out
          </button>
        </div>
      </aside>

      {/* ── Main Content ── */}
      <div className="admin-main">
        <div className="admin-topbar" />
        <div className={`admin-page${activePage === 'forms' || activePage === 'dashboard' ? ' admin-page-wide' : ''}`}>
          {children}
        </div>
      </div>
    </div>
  );
}
