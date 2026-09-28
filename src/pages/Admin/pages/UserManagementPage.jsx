import React, { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import {
  MODULE_ACCESS,
  CREATABLE_ROLES,
  MANAGED_ROLES,
  MANAGED_ROLE_LABELS,
  DEFAULT_ROLE_MODULES,
} from '../data/dummyData';
import {
  getAdminUsers,
  createAdminUser,
  updateAdminUser,
  deleteAdminUser,
} from '../services/adminService';
import { useAdminAuth } from '../context/AdminAuthContext';

const ROLE_BADGE_CLASS = {
  Admin: 'approved',
  Manager: 'scheduled',
  SalesOfficer: 'pending',
  CustomerCareOfficer: 'in-progress',
};

const EMPTY_FORM = {
  name: '',
  email: '',
  phone: '',
  NIC: '',
  role: CREATABLE_ROLES[0],
  password: '',
  permissions: DEFAULT_ROLE_MODULES[CREATABLE_ROLES[0]] || [],
};

function generatePassword() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%';
  let out = '';
  for (let i = 0; i < 10; i++) out += chars[Math.floor(Math.random() * chars.length)];
  return out;
}

function initials(name) {
  if (!name) return '?';
  return name.split(' ').filter(Boolean).map((n) => n[0]).slice(0, 2).join('').toUpperCase();
}

export default function UserManagementPage() {
  const { admin } = useAdminAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  const [modalOpen, setModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [showPassword, setShowPassword] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  const [pendingDelete, setPendingDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const loadUsers = () => {
    setLoading(true);
    getAdminUsers()
      .then((res) => setUsers(res.users || []))
      .catch((err) => setError(err.response?.data?.message || 'Failed to load users'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const summary = useMemo(() => {
    const active = users.filter((u) => u.isActive !== false).length;
    return {
      total: users.length,
      active,
      inactive: users.length - active,
      roles: new Set(users.map((u) => u.role)).size,
    };
  }, [users]);

  const roleCounts = useMemo(() => {
    const counts = {};
    MANAGED_ROLES.forEach((r) => { counts[r] = 0; });
    users.forEach((u) => {
      if (counts[u.role] !== undefined) counts[u.role] += 1;
    });
    return counts;
  }, [users]);

  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      if (roleFilter !== 'All' && u.role !== roleFilter) return false;
      if (statusFilter === 'Active' && u.isActive === false) return false;
      if (statusFilter === 'Inactive' && u.isActive !== false) return false;
      if (search.trim()) {
        const q = search.trim().toLowerCase();
        const haystack = `${u.name} ${u.email || ''} ${u.phone} ${u.NIC}`.toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
  }, [users, roleFilter, statusFilter, search]);

  const openAddModal = () => {
    setEditingUser(null);
    setForm(EMPTY_FORM);
    setFormError('');
    setShowPassword(false);
    setModalOpen(true);
  };

  const openEditModal = (user) => {
    setEditingUser(user);
    setForm({
      name: user.name || '',
      email: user.email || '',
      phone: user.phone || '',
      NIC: user.NIC || '',
      // Always reflect the account's real role — including 'Admin', which
      // isn't a role this screen lets you *create* but must still show
      // correctly when editing an existing admin, or saving would silently
      // downgrade them.
      role: user.role,
      password: '',
      permissions: user.permissions && user.permissions.length ? user.permissions : (DEFAULT_ROLE_MODULES[user.role] || []),
    });
    setFormError('');
    setShowPassword(false);
    setModalOpen(true);
  };

  const closeModal = () => {
    if (saving) return;
    setModalOpen(false);
  };

  const handleRoleChange = (role) => {
    setForm((f) => ({ ...f, role, permissions: DEFAULT_ROLE_MODULES[role] || [] }));
  };

  const togglePermission = (key) => {
    setForm((f) => ({
      ...f,
      permissions: f.permissions.includes(key)
        ? f.permissions.filter((k) => k !== key)
        : [...f.permissions, key],
    }));
  };

  const handleGeneratePassword = () => {
    const pwd = generatePassword();
    setForm((f) => ({ ...f, password: pwd }));
    setShowPassword(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!form.name.trim() || !form.phone.trim() || !form.NIC.trim()) {
      setFormError('Name, phone number and NIC are required.');
      return;
    }
    if (!editingUser && form.password.trim().length < 6) {
      setFormError('Password must be at least 6 characters.');
      return;
    }
    if (form.password && form.password.trim().length > 0 && form.password.trim().length < 6) {
      setFormError('Password must be at least 6 characters.');
      return;
    }

    setSaving(true);
    try {
      if (editingUser) {
        const payload = {
          name: form.name.trim(),
          email: form.email.trim() || '',
          phone: form.phone.trim(),
          NIC: form.NIC.trim(),
          role: form.role,
          permissions: form.permissions,
        };
        if (form.password.trim()) payload.password = form.password.trim();
        const res = await updateAdminUser(editingUser.id, payload);
        setUsers((prev) => prev.map((u) => (u.id === editingUser.id ? res.user : u)));
        toast.success('User updated');
      } else {
        const res = await createAdminUser({
          name: form.name.trim(),
          email: form.email.trim() || undefined,
          phone: form.phone.trim(),
          NIC: form.NIC.trim(),
          password: form.password.trim(),
          role: form.role,
          permissions: form.permissions,
        });
        setUsers((prev) => [res.user, ...prev]);
        toast.success('User created');
      }
      setModalOpen(false);
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to save user';
      setFormError(message);
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (user) => {
    try {
      const res = await updateAdminUser(user.id, { isActive: user.isActive === false });
      setUsers((prev) => prev.map((u) => (u.id === user.id ? res.user : u)));
      toast.success(res.user.isActive ? 'User activated' : 'User deactivated');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update status');
    }
  };

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    setDeleting(true);
    try {
      await deleteAdminUser(pendingDelete.id);
      setUsers((prev) => prev.filter((u) => u.id !== pendingDelete.id));
      toast.success('User removed');
      setPendingDelete(null);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to remove user');
    } finally {
      setDeleting(false);
    }
  };

  const summaryCards = [
    {
      key: 'total', label: 'Total Staff Users', value: summary.total, hint: 'Across all roles', colorClass: 'blue',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      ),
    },
    {
      key: 'active', label: 'Active Users', value: summary.active, hint: 'Can sign in now', colorClass: 'green',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
        </svg>
      ),
    },
    {
      key: 'inactive', label: 'Inactive Users', value: summary.inactive, hint: 'Access suspended', colorClass: 'red',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" /><line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
        </svg>
      ),
    },
    {
      key: 'roles', label: 'Roles In Use', value: summary.roles, hint: 'Distinct roles assigned', colorClass: 'amber',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
      ),
    },
  ];

  return (
    <>
      <div className="admin-page-header um-header">
        <div>
          <h1 className="admin-page-title">User Management</h1>
          <p className="admin-page-subtitle">
            Add Managers, Sales Officers and Customer Care Officers, and control what each one can access
          </p>
        </div>
        <button type="button" className="admin-btn primary um-add-btn" onClick={openAddModal}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Add User
        </button>
      </div>

      {error && <div className="admin-error-banner">{error}</div>}

      {/* ── Summary Cards ── */}
      <div className="admin-summary-grid um-summary-grid">
        {summaryCards.map((card) => (
          <div className="admin-stat-card" key={card.key}>
            <div className={`admin-stat-icon ${card.colorClass}`}>{card.icon}</div>
            <div>
              <div className="admin-stat-label">{card.label}</div>
              <div className="admin-stat-value">{card.value}</div>
              <div className="admin-stat-trend">{card.hint}</div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Role Cards ── */}
      <div className="priv-role-grid um-role-grid">
        {MANAGED_ROLES.map((role) => (
          <div className="priv-role-card" key={role}>
            <div className="priv-role-head">
              <span className="priv-role-name">{MANAGED_ROLE_LABELS[role]}</span>
              <span className={`admin-badge ${ROLE_BADGE_CLASS[role] || ''}`}>{roleCounts[role] || 0} users</span>
            </div>
            <div className="priv-role-sub">Default module access</div>
            <div className="priv-role-modules">
              {(DEFAULT_ROLE_MODULES[role] || []).map((key) => {
                const mod = MODULE_ACCESS.find((m) => m.key === key);
                return mod ? <span className="priv-role-chip" key={key}>{mod.label}</span> : null;
              })}
            </div>
          </div>
        ))}
      </div>

      {/* ── Toolbar ── */}
      <div className="um-toolbar">
        <div className="admin-search um-search">
          <span className="admin-search-icon">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </span>
          <input
            type="text"
            placeholder="Search by name, email, phone or NIC"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select className="admin-select" value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
          <option value="All">All Roles</option>
          {MANAGED_ROLES.map((r) => <option key={r} value={r}>{MANAGED_ROLE_LABELS[r]}</option>)}
        </select>
        <select className="admin-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="All">All Statuses</option>
          <option value="Active">Active</option>
          <option value="Inactive">Inactive</option>
        </select>
      </div>

      {/* ── Users Table ── */}
      {loading ? (
        <div className="admin-loading">Loading users…</div>
      ) : filteredUsers.length === 0 ? (
        <div className="admin-empty card" style={{ padding: '2rem 1rem' }}>
          <p>No users found.</p>
        </div>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table um-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Contact</th>
                <th>NIC</th>
                <th>Role</th>
                <th>Privileges</th>
                <th>Status</th>
                <th>Added</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((u) => (
                <tr key={u.id}>
                  <td>
                    <div className="um-user-cell">
                      <div className="um-avatar">{initials(u.name)}</div>
                      <span style={{ fontWeight: 600 }}>{u.name}</span>
                    </div>
                  </td>
                  <td>
                    <div className="um-contact-cell">
                      <span>{u.email || '—'}</span>
                      <span className="um-contact-sub">{u.phone}</span>
                    </div>
                  </td>
                  <td>{u.NIC}</td>
                  <td>
                    <span className={`admin-badge ${ROLE_BADGE_CLASS[u.role] || ''}`}>
                      {MANAGED_ROLE_LABELS[u.role] || u.role}
                    </span>
                  </td>
                  <td>
                    <div className="um-priv-chips">
                      {(u.permissions && u.permissions.length ? u.permissions : []).slice(0, 3).map((key) => {
                        const mod = MODULE_ACCESS.find((m) => m.key === key);
                        return mod ? <span className="priv-role-chip" key={key}>{mod.label}</span> : null;
                      })}
                      {u.permissions && u.permissions.length > 3 && (
                        <span className="priv-role-chip um-more-chip">+{u.permissions.length - 3}</span>
                      )}
                      {(!u.permissions || u.permissions.length === 0) && <span className="um-contact-sub">No modules</span>}
                    </div>
                  </td>
                  <td>
                    <button
                      type="button"
                      className={`um-status-toggle ${u.isActive === false ? 'inactive' : 'active'}`}
                      onClick={() => handleToggleActive(u)}
                      disabled={String(admin?.id) === String(u.id)}
                      title={String(admin?.id) === String(u.id) ? 'You cannot change your own status' : 'Toggle status'}
                    >
                      <span className="um-status-dot" />
                      {u.isActive === false ? 'Inactive' : 'Active'}
                    </button>
                  </td>
                  <td>{new Date(u.createdAt).toLocaleDateString('en-GB')}</td>
                  <td>
                    <div className="admin-action-group" style={{ justifyContent: 'flex-end' }}>
                      <button type="button" className="admin-btn ghost" onClick={() => openEditModal(u)}>
                        Edit
                      </button>
                      <button
                        type="button"
                        className="admin-btn danger"
                        onClick={() => setPendingDelete(u)}
                        disabled={String(admin?.id) === String(u.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Add / Edit Modal ── */}
      {modalOpen && (
        <div className="admin-modal-overlay" onClick={closeModal}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <div>
                <h3>{editingUser ? 'Edit User' : 'Add New User'}</h3>
                <div className="admin-modal-subtitle">
                  {editingUser ? 'Update profile, role and module access' : 'Create a Manager, Sales Officer or Customer Care Officer account'}
                </div>
              </div>
              <button type="button" className="admin-modal-close" onClick={closeModal} aria-label="Close">×</button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="admin-modal-body">
                {formError && <div className="admin-error-banner" style={{ marginBottom: '1rem' }}>{formError}</div>}

                <div className="um-form-grid">
                  <label className="um-field">
                    <span>Full Name *</span>
                    <input
                      type="text"
                      className="um-input"
                      value={form.name}
                      onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                      placeholder="e.g. Kasun Perera"
                      required
                    />
                  </label>
                  <label className="um-field">
                    <span>Email Address</span>
                    <input
                      type="email"
                      className="um-input"
                      value={form.email}
                      onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                      placeholder="name@slt.lk"
                    />
                  </label>
                  <label className="um-field">
                    <span>Phone Number *</span>
                    <input
                      type="text"
                      className="um-input"
                      value={form.phone}
                      onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                      placeholder="07XXXXXXXX"
                      required
                    />
                  </label>
                  <label className="um-field">
                    <span>NIC / Passport *</span>
                    <input
                      type="text"
                      className="um-input"
                      value={form.NIC}
                      onChange={(e) => setForm((f) => ({ ...f, NIC: e.target.value }))}
                      placeholder="e.g. 981234567V"
                      required
                    />
                  </label>
                  <label className="um-field">
                    <span>Role *</span>
                    <select
                      className="um-input"
                      value={form.role}
                      onChange={(e) => handleRoleChange(e.target.value)}
                      disabled={editingUser?.role === 'Admin'}
                    >
                      {editingUser?.role === 'Admin' && (
                        <option value="Admin">{MANAGED_ROLE_LABELS.Admin}</option>
                      )}
                      {CREATABLE_ROLES.map((r) => (
                        <option key={r} value={r}>{MANAGED_ROLE_LABELS[r]}</option>
                      ))}
                    </select>
                    {editingUser?.role === 'Admin' && (
                      <span className="um-field-hint">Administrator accounts can't be re-assigned from here.</span>
                    )}
                  </label>
                  <label className="um-field">
                    <span>{editingUser ? 'New Password (optional)' : 'Password *'}</span>
                    <div className="um-password-row">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        className="um-input"
                        value={form.password}
                        onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                        placeholder={editingUser ? 'Leave blank to keep current' : 'Minimum 6 characters'}
                        required={!editingUser}
                      />
                      <button type="button" className="um-inline-btn" onClick={() => setShowPassword((s) => !s)}>
                        {showPassword ? 'Hide' : 'Show'}
                      </button>
                      <button type="button" className="um-inline-btn" onClick={handleGeneratePassword}>
                        Generate
                      </button>
                    </div>
                  </label>
                </div>

                <h4>Module Privileges</h4>
                <p className="admin-modal-empty" style={{ marginBottom: '0.75rem' }}>
                  Prefilled from the selected role's defaults — adjust as needed for this user.
                </p>
                <div className="um-privileges-grid">
                  {MODULE_ACCESS.map((mod) => (
                    <label className="um-priv-checkbox" key={mod.key}>
                      <input
                        type="checkbox"
                        checked={form.permissions.includes(mod.key)}
                        onChange={() => togglePermission(mod.key)}
                      />
                      <span>{mod.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="um-modal-footer">
                <button type="button" className="admin-btn ghost" onClick={closeModal} disabled={saving}>
                  Cancel
                </button>
                <button type="submit" className="admin-btn primary" disabled={saving}>
                  {saving ? 'Saving…' : editingUser ? 'Save Changes' : 'Create User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Delete Confirmation ── */}
      {pendingDelete && (
        <div className="admin-modal-overlay" onClick={() => !deleting && setPendingDelete(null)}>
          <div className="admin-modal um-confirm-modal" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h3>Remove User</h3>
              <button type="button" className="admin-modal-close" onClick={() => setPendingDelete(null)} aria-label="Close">×</button>
            </div>
            <div className="admin-modal-body">
              <p>
                Are you sure you want to permanently remove <strong>{pendingDelete.name}</strong>
                {' '}({MANAGED_ROLE_LABELS[pendingDelete.role] || pendingDelete.role})? This cannot be undone.
              </p>
            </div>
            <div className="um-modal-footer">
              <button type="button" className="admin-btn ghost" onClick={() => setPendingDelete(null)} disabled={deleting}>
                Cancel
              </button>
              <button type="button" className="admin-btn danger" onClick={confirmDelete} disabled={deleting}>
                {deleting ? 'Removing…' : 'Remove User'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
