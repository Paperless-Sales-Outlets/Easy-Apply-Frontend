import React, { useState } from 'react';
import { useAdminAuth } from '../context/AdminAuthContext';
import { MODULE_ACCESS, DUMMY_FORM_WEEKLY } from '../data/dummyData';
import sltLogo from '../../../assets/sltlogoOnly.png';

const NAV_ICONS = {
  dashboard:    '⊞',
  kyc:          '🪪',
  appointments: '📅',
  technician:   '🔧',
  forms:        '📄',
  analytics:    '📊',
  privileges:   '🔐',
};

const NAV_ITEMS = [
  ...MODULE_ACCESS.map(item => ({ ...item, icon: NAV_ICONS[item.key] })),
  { key: 'privileges', label: 'User Privileges', icon: '🔐', roles: ['Admin'] },
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
    Staff: 'Staff Member',
    FieldTechnician: 'Field Technician',
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
            <span>↩</span> Sign Out
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
