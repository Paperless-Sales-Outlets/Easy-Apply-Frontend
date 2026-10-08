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
    <div className="um-page privileges-page">
      <section className="um-hero privileges-hero">
        <div className="um-hero-deco" aria-hidden="true">
          <span className="um-hero-orb" />
          <span className="um-hero-slash" />
          <span className="um-hero-grid" />
        </div>
        <div className="um-hero-top">
          <div className="um-hero-text">
            <span className="um-hero-eyebrow">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2 4 5v6c0 5 3.4 9.4 8 11 4.6-1.6 8-6 8-11V5l-8-3Z" />
              </svg>
              Access governance
            </span>
            <h1>User Privileges</h1>
            <p>Review role coverage, module access and the people connected to each permission set.</p>
          </div>
          <span className="privileges-hero-icon" aria-hidden="true">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          </span>
        </div>
        <div className="um-hero-tiles privileges-hero-tiles">
          {summaryCards.map(card => (
            <div className={`um-hero-tile ${card.colorClass}`} key={card.key}>
              <div className="um-hero-tile-head"><span className="um-hero-tile-icon">{card.icon}</span>{card.label}</div>
              <div className="um-hero-tile-value">{card.value}</div>
              <div className="um-hero-tile-foot">{card.hint}</div>
            </div>
          ))}
          <div className="um-hero-tile privileges-total">
            <div className="um-hero-tile-head"><span className="um-hero-tile-icon">{totalPrivileges}</span>Access grants</div>
            <div className="um-hero-tile-value">{totalPrivileges}</div>
            <div className="um-hero-tile-foot">Across all modules</div>
          </div>
        </div>
      </section>

      {error && <div className="admin-error-banner">{error}</div>}

      {/* ── Summary Cards ── */}
      {/* ── Role Privilege Cards ── */}
      <section className="um-panel privileges-section">
        <div className="privileges-section-head">
          <div><span className="privileges-kicker">ROLE COVERAGE</span><h2>Roles &amp; module access</h2><p>See how much of the portal each role can access.</p></div>
        </div>
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
      </section>

      {/* ── Privilege Matrix ── */}
      <section className="um-panel privileges-section privileges-matrix-section">
        <div className="privileges-section-head">
          <div><span className="privileges-kicker">PERMISSION MATRIX</span><h2>Module access matrix</h2><p>Every check represents an active role permission.</p></div>
        </div>
        <div className="admin-table-wrap um-table-wrap">
        <table className="admin-table um-table priv-matrix">
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
      </section>

      {/* ── Registered Users ── */}
      <section className="um-panel privileges-section privileges-users-section">
        <div className="priv-users-head">
          <div><span className="privileges-kicker">DIRECTORY</span><h2>Registered users</h2><p>Filter people by the role assigned to their account.</p></div>
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
          <div className="admin-table-wrap um-table-wrap">
            <table className="admin-table um-table priv-users-table">
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
      </section>
    </div>
  );
}
