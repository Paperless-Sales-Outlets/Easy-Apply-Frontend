import React, { useState, useEffect } from 'react';
import { SYSTEM_ROLES, MODULE_ACCESS } from '../data/dummyData';
import { getUsers } from '../services/adminService';

const ROLE_LABELS = {
  Admin: 'Administrator',
  Staff: 'Staff',
  Customer: 'Customer',
};

const ROLE_BADGE = {
  Admin: 'approved',
  Staff: 'pending',
  Customer: 'rejected',
};

export default function UserPrivilegesPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('All');

  useEffect(() => {
    getUsers()
      .then(res => setUsers(res.users || []))
      .catch(err => setError(err.response?.data?.message || 'Failed to load users'))
      .finally(() => setLoading(false));
  }, []);

  const totalPrivileges = MODULE_ACCESS.reduce((sum, mod) => sum + mod.roles.length, 0);

  const countForRole = (role) =>
    MODULE_ACCESS.filter(mod => mod.roles.includes(role)).length;

  const filteredUsers = filter === 'All' ? users : users.filter(u => u.role === filter);

  const summaryCards = [
    {
      key: 'users',
      label: 'Total Users',
      value: users.length,
      hint: 'Registered in system',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      ),
      colorClass: 'blue',
    },
    {
      key: 'roles',
      label: 'Roles Available',
      value: new Set(users.map(u => u.role)).size,
      hint: 'Active user roles',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="11" width="18" height="11" rx="2" />
          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
      ),
      colorClass: 'amber',
    },
    {
      key: 'modules',
      label: 'System Modules',
      value: MODULE_ACCESS.length,
      hint: 'Accessible admin modules',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
          <rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" />
        </svg>
      ),
      colorClass: 'green',
    },
  ];

  return (
    <>
      <div className="admin-page-header">
        <h1 className="admin-page-title">User Privileges</h1>
        <p className="admin-page-subtitle">
          Review user roles, module access, and registered users
        </p>
      </div>

      {error && <div className="admin-error-banner">{error}</div>}

      {/* ── Summary Cards ── */}
      <div className="admin-summary-grid">
        {summaryCards.map(card => (
          <div className="admin-stat-card" key={card.key}>
            <div className={`admin-stat-icon ${card.colorClass}`}>
              {card.icon}
            </div>
            <div>
              <div className="admin-stat-label">{card.label}</div>
              <div className="admin-stat-value">{card.value}</div>
              <div className="admin-stat-trend">{card.hint}</div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Role Privilege Cards ── */}
      <div className="priv-role-grid">
        {SYSTEM_ROLES.map(role => (
          <div className="priv-role-card" key={role}>
            <div className="priv-role-head">
              <span className="priv-role-name">{role}</span>
              <span className="admin-badge approved">{countForRole(role)} modules</span>
            </div>
            <div className="priv-role-sub">{ROLE_LABELS[role] || role}</div>
            <div className="priv-role-modules">
              {MODULE_ACCESS.filter(mod => mod.roles.includes(role)).map(mod => (
                <span className="priv-role-chip" key={mod.key}>{mod.label}</span>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* ── Privilege Matrix ── */}
      <div className="admin-table-wrap">
        <table className="admin-table priv-matrix">
          <thead>
            <tr>
              <th>Module</th>
              {SYSTEM_ROLES.map(role => (
                <th key={role} style={{ textAlign: 'center' }}>
                  {role}
                  <div style={{ fontWeight: 400, color: 'var(--muted)', letterSpacing: 0, textTransform: 'none' }}>
                    {countForRole(role)} granted
                  </div>
                </th>
              ))}
              <th style={{ textAlign: 'center' }}>Grants</th>
            </tr>
          </thead>
          <tbody>
            {MODULE_ACCESS.map(mod => (
              <tr key={mod.key}>
                <td style={{ fontWeight: 600 }}>{mod.label}</td>
                {SYSTEM_ROLES.map(role => (
                  <td key={role} style={{ textAlign: 'center' }}>
                    {mod.roles.includes(role) ? (
                      <span className="priv-check" title={`${role} can access ${mod.label}`}>✓</span>
                    ) : (
                      <span className="priv-dash" title={`${role} cannot access ${mod.label}`}>—</span>
                    )}
                  </td>
                ))}
                <td style={{ textAlign: 'center' }}>
                  <span className="admin-badge pending">{mod.roles.length}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ── Registered Users ── */}
      <div style={{ marginTop: '2rem' }}>
        <div className="priv-users-head">
          <h3 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--navy)' }}>Registered Users</h3>
          <div className="priv-filter-row">
            {['All', ...SYSTEM_ROLES, 'Customer'].filter((v, i, a) => a.indexOf(v) === i).map(r => (
              <button
                key={r}
                className={`admin-btn ${filter === r ? '' : 'ghost'}`}
                style={{ fontSize: '0.78rem', padding: '0.35rem 0.8rem' }}
                onClick={() => setFilter(r)}
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="admin-loading">Loading users…</div>
        ) : filteredUsers.length === 0 ? (
          <div className="admin-empty card" style={{ padding: '2rem 1rem' }}>
            <p>No users found.</p>
          </div>
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table priv-users-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>NIC</th>
                  <th>Role</th>
                  <th>Registered</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map(u => (
                  <tr key={u.id}>
                    <td style={{ fontWeight: 600 }}>{u.name}</td>
                    <td>{u.email}</td>
                    <td>{u.phone}</td>
                    <td>{u.NIC}</td>
                    <td>
                      <span className={`admin-badge ${ROLE_BADGE[u.role] || ''}`}>
                        {u.role}
                      </span>
                    </td>
                    <td>{new Date(u.createdAt).toLocaleDateString('en-GB')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
