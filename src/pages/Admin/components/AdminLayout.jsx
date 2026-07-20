import React from 'react';
import { useAdminAuth } from '../context/AdminAuthContext';
import sltLogo from '../../../assets/sltlogoOnly.png';

const NAV_ITEMS = [
  { key: 'dashboard',    label: 'Dashboard',        icon: '⊞', roles: ['Admin','Staff','FieldTechnician'] },
  { key: 'applications', label: 'Applications',     icon: '📋', roles: ['Admin','Staff'] },
  { key: 'kyc',          label: 'KYC Review',       icon: '🪪', roles: ['Admin','Staff'] },
  { key: 'appointments', label: 'Appointments',     icon: '📅', roles: ['Admin','Staff'] },
  { key: 'technician',   label: 'My Jobs',          icon: '🔧', roles: ['Admin','FieldTechnician'] },
  { key: 'analytics',   label: 'Analytics',        icon: '📊', roles: ['Admin','Staff'] },
];

export default function AdminLayout({ activePage, setActivePage, children }) {
  const { admin, logout } = useAdminAuth();

  const visibleNav = NAV_ITEMS.filter(item =>
    item.roles.includes(admin?.role || 'Admin')
  );

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
            <button
              key={item.key}
              className={`admin-nav-item${activePage === item.key ? ' active' : ''}`}
              onClick={() => setActivePage(item.key)}
            >
              <span style={{ fontSize: '1rem' }}>{item.icon}</span>
              {item.label}
            </button>
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
        <div className="admin-page">
          {children}
        </div>
      </div>
    </div>
  );
}
