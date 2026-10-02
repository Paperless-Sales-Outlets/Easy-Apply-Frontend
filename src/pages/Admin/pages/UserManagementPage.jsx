import React, { useEffect, useMemo, useState } from 'react';
import {
  getAdminUsers,
  createAdminUser,
  updateAdminUser,
  deleteAdminUser,
  getStaffRoles,
  createStaffRole,
  updateStaffRole,
  deleteStaffRole,
  getPrivileges,
  createPrivilege,
  updatePrivilege,
  deletePrivilege,
} from '../services/adminService';
import { useAdminAuth } from '../context/AdminAuthContext';
import AdminNotice, { useAdminNotice } from '../components/AdminNotice';

const ROLE_BADGE_PALETTE = ['scheduled', 'pending', 'in-progress', 'flagged', 'completed', 'cancelled'];
const ROLE_AVATAR_PALETTE = [
  'linear-gradient(135deg, #0f57a8, #0b2d5b)',
  'linear-gradient(135deg, #57b531, #3a9636)',
  'linear-gradient(135deg, #eba834, #b87a00)',
  'linear-gradient(135deg, #a855f7, #5a28a8)',
  'linear-gradient(135deg, #2c8f92, #0a3f7e)',
  'linear-gradient(135deg, #c4372c, #8f271e)',
];

function roleBadgeClass(roleName, roles) {
  if (roleName === 'Admin') return 'approved';
  const idx = roles.findIndex((r) => r.name === roleName);
  return ROLE_BADGE_PALETTE[idx >= 0 ? idx % ROLE_BADGE_PALETTE.length : 0];
}

function avatarGradient(roleName, roles) {
  if (roleName === 'Admin') return ROLE_AVATAR_PALETTE[0];
  const idx = roles.findIndex((r) => r.name === roleName);
  return ROLE_AVATAR_PALETTE[(idx >= 0 ? idx % ROLE_AVATAR_PALETTE.length : 1)];
}

const EMPTY_USER_FORM = {
  employeeNumber: '',
  name: '',
  email: '',
  role: '',
  password: '',
  confirmPassword: '',
  permissions: [],
};

const EMPTY_ROLE_FORM = { name: '', permissions: [] };
const EMPTY_PRIVILEGE_FORM = { name: '', description: '' };
const PRIVILEGE_DESCRIPTION_MAX = 300;

// Employee Number is the account's permanent unique id: a leading '0'
// followed by 5 digits (e.g. 000001..099999), auto-assigned — never typed.
const EMPLOYEE_NUMBER_LENGTH = 5;
const EMAIL_DOMAIN = 'slt.com.lk';
const EMAIL_PATTERN = new RegExp(`^[a-zA-Z0-9._%+-]+@${EMAIL_DOMAIN.replace(/\./g, '\\.')}$`, 'i');

// Next free employee number, derived from whatever's already assigned so it
// keeps incrementing even if the list is filtered/out of order.
function nextEmployeeNumber(users) {
  const highest = users.reduce((max, u) => {
    const match = /^0(\d{5})$/.exec(u.employeeNumber || '');
    if (!match) return max;
    return Math.max(max, parseInt(match[1], 10));
  }, 0);
  return '0' + String(highest + 1).padStart(EMPLOYEE_NUMBER_LENGTH, '0');
}

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

const EyeIcon = ({ open }) => open ? (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
    <line x1="1" y1="1" x2="23" y2="23" />
  </svg>
) : (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8Z" /><circle cx="12" cy="12" r="3" />
  </svg>
);

const NAME_PATTERN = /^[\p{L}][\p{L}\s.'-]*$/u;
const ROLE_NAME_PATTERN = /^[\p{L}\p{N}][\p{L}\p{N}\s&-]*$/u;
const RESERVED_ROLE_NAMES = ['admin', 'administrator', 'customer'];
const PRIVILEGE_DESCRIPTION_MIN = 10;

const USER_FIELDS = ['name', 'email', 'role', 'password', 'confirmPassword'];
const ROLE_FIELDS = ['name'];
const PRIVILEGE_FIELDS = ['name', 'description'];

const sameText = (a, b) => String(a || '').trim().toLowerCase() === String(b || '').trim().toLowerCase();

// Each validator is pure: it returns { field: message } for every field that is
// currently invalid, so the UI can decide *when* to reveal them (on blur, then live).
function validateUserForm(form, { editingUser, users }) {
  const errors = {};
  const name = form.name.trim();
  const email = form.email.trim();

  if (!name) errors.name = 'Full name is required.';
  else if (name.length < 2) errors.name = 'Full name must be at least 2 characters.';
  else if (name.length > 60) errors.name = 'Full name must be 60 characters or fewer.';
  else if (!NAME_PATTERN.test(name)) errors.name = 'Use letters, spaces, apostrophes, hyphens or full stops only.';

  if (!email) errors.email = 'Email address is required.';
  else if (!EMAIL_PATTERN.test(email)) errors.email = `Must be a valid ${EMAIL_DOMAIN} address, e.g. name@${EMAIL_DOMAIN}.`;
  else if (users.some((u) => u.id !== editingUser?.id && sameText(u.email, email))) {
    errors.email = 'Another account already uses this email address.';
  }

  if (!form.role) errors.role = 'Please select a role.';

  if (!editingUser && !form.password) errors.password = 'Password is required.';
  else if (form.password && form.password.length < 6) errors.password = 'Password must be at least 6 characters.';
  else if (form.password && /\s/.test(form.password)) errors.password = 'Password cannot contain spaces.';

  if (!editingUser || form.password) {
    if (!form.confirmPassword) errors.confirmPassword = 'Please confirm the password.';
    else if (form.password !== form.confirmPassword) errors.confirmPassword = 'Passwords do not match.';
  }

  return errors;
}

function validateRoleForm(roleForm, { editingRole, roles }) {
  const errors = {};
  const name = roleForm.name.trim();

  if (!name) errors.name = 'Role name is required.';
  else if (name.length < 2) errors.name = 'Role name must be at least 2 characters.';
  else if (name.length > 40) errors.name = 'Role name must be 40 characters or fewer.';
  else if (!ROLE_NAME_PATTERN.test(name)) errors.name = 'Use letters, numbers, spaces, & or hyphens only.';
  else if (RESERVED_ROLE_NAMES.includes(name.toLowerCase())) errors.name = `"${name}" is a reserved system role.`;
  else if (roles.some((r) => r.id !== editingRole?.id && sameText(r.name, name))) {
    errors.name = 'A role with this name already exists.';
  }

  return errors;
}

function validatePrivilegeForm(privForm, { editingPriv, privileges }) {
  const errors = {};
  const name = privForm.name.trim();
  const description = privForm.description.trim();

  if (!name) errors.name = 'Privilege name is required.';
  else if (name.length < 2) errors.name = 'Privilege name must be at least 2 characters.';
  else if (name.length > 60) errors.name = 'Privilege name must be 60 characters or fewer.';
  else if (privileges.some((p) => p.id !== editingPriv?.id && sameText(p.name, name))) {
    errors.name = 'A privilege with this name already exists.';
  }

  if (!description) errors.description = 'Describe what this privilege allows.';
  else if (description.length < PRIVILEGE_DESCRIPTION_MIN) {
    errors.description = `Add a little more detail (at least ${PRIVILEGE_DESCRIPTION_MIN} characters).`;
  }

  return errors;
}

// Reveals a field's error only once the user has left it (or tried to submit),
// then keeps it in sync as they type. Returns what the input needs: a state
// class, the message, and accessibility + blur wiring.
function makeField(prefix, key, errors, touched, value, onTouch, required = true) {
  const error = touched[key] ? errors[key] : undefined;
  const valid = !!touched[key] && !errors[key] && String(value ?? '').length > 0;
  const errorId = `${prefix}-${key}-error`;
  return {
    cls: error ? ' invalid' : valid ? ' valid' : '',
    error,
    errorId,
    props: {
      onBlur: onTouch,
      'aria-invalid': error ? true : undefined,
      'aria-describedby': error ? errorId : undefined,
      'aria-required': required || undefined,
    },
  };
}

function FieldError({ id, message }) {
  if (!message) return null;
  return <span id={id} className="um-field-error" role="alert">{message}</span>;
}

const touchAll = (fields) => Object.fromEntries(fields.map((f) => [f, true]));

const TABS = [
  { key: 'team', label: 'Team Members' },
  { key: 'roles', label: 'Roles & Access' },
  { key: 'privileges', label: 'Privileges' },
];

export default function UserManagementPage() {
  const { admin } = useAdminAuth();
  const notice = useAdminNotice();
  const [activeTab, setActiveTab] = useState('team');

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [roles, setRoles] = useState([]);
  const [rolesLoading, setRolesLoading] = useState(true);

  const [privileges, setPrivileges] = useState([]);
  const [privilegesLoading, setPrivilegesLoading] = useState(true);

  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  // ── Add/Edit User modal ──
  const [modalOpen, setModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [form, setForm] = useState(EMPTY_USER_FORM);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');
  const [userTouched, setUserTouched] = useState({});
  const [userSubmitted, setUserSubmitted] = useState(false);

  const [pendingDelete, setPendingDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // ── Add/Edit Role modal ──
  const [roleModalOpen, setRoleModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState(null);
  const [roleForm, setRoleForm] = useState(EMPTY_ROLE_FORM);
  const [roleSaving, setRoleSaving] = useState(false);
  const [roleFormError, setRoleFormError] = useState('');
  const [pendingDeleteRole, setPendingDeleteRole] = useState(null);
  const [deletingRole, setDeletingRole] = useState(false);

  // ── Privileges tab ──
  const [privSearch, setPrivSearch] = useState('');
  const [privModalOpen, setPrivModalOpen] = useState(false);
  const [editingPriv, setEditingPriv] = useState(null);
  const [privForm, setPrivForm] = useState(EMPTY_PRIVILEGE_FORM);
  const [privTouched, setPrivTouched] = useState({});
  const [privSubmitted, setPrivSubmitted] = useState(false);
  const [roleTouched, setRoleTouched] = useState({});
  const [roleSubmitted, setRoleSubmitted] = useState(false);
  const [privFormError, setPrivFormError] = useState('');
  const [privSaving, setPrivSaving] = useState(false);
  const [pendingDeletePriv, setPendingDeletePriv] = useState(null);
  const [deletingPriv, setDeletingPriv] = useState(false);

  const loadUsers = () => {
    setLoading(true);
    getAdminUsers()
      .then((res) => setUsers(res.users || []))
      .catch((err) => setError(err.response?.data?.message || 'Failed to load users'))
      .finally(() => setLoading(false));
  };

  const loadRoles = () => {
    setRolesLoading(true);
    getStaffRoles()
      .then((res) => setRoles(res.roles || []))
      .catch((err) => setError(err.response?.data?.message || 'Failed to load roles'))
      .finally(() => setRolesLoading(false));
  };

  const loadPrivileges = ({ silent } = {}) => {
    if (!silent) setPrivilegesLoading(true);
    getPrivileges()
      .then((res) => setPrivileges(res.privileges || []))
      .catch((err) => setError(err.response?.data?.message || 'Failed to load privileges'))
      .finally(() => setPrivilegesLoading(false));
  };

  useEffect(() => {
    loadUsers();
    loadRoles();
    loadPrivileges();
  }, []);

  const privilegeByKey = useMemo(
    () => Object.fromEntries(privileges.map((p) => [p.key, p])),
    [privileges]
  );

  const visiblePrivileges = useMemo(() => {
    const q = privSearch.trim().toLowerCase();
    if (!q) return privileges;
    return privileges.filter((p) =>
      [p.name, p.description, p.key].some((v) => String(v || '').toLowerCase().includes(q))
    );
  }, [privileges, privSearch]);

  const roleNames = useMemo(() => ['Admin', ...roles.map((r) => r.name)], [roles]);

  const adminCount = useMemo(() => users.filter((u) => u.role === 'Admin').length, [users]);

  const summary = useMemo(() => {
    const active = users.filter((u) => u.isActive !== false).length;
    return {
      total: users.length,
      active,
      inactive: users.length - active,
      roles: new Set(users.map((u) => u.role)).size,
    };
  }, [users]);

  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      if (roleFilter !== 'All' && u.role !== roleFilter) return false;
      if (statusFilter === 'Active' && u.isActive === false) return false;
      if (statusFilter === 'Inactive' && u.isActive !== false) return false;
      if (search.trim()) {
        const q = search.trim().toLowerCase();
        const haystack = `${u.name} ${u.email || ''} ${u.employeeNumber || ''}`.toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
  }, [users, roleFilter, statusFilter, search]);

  // ── Live validation (errors surface per field on blur, then update as you type) ──

  const userErrors = useMemo(() => validateUserForm(form, { editingUser, users }), [form, editingUser, users]);
  const roleErrors = useMemo(() => validateRoleForm(roleForm, { editingRole, roles }), [roleForm, editingRole, roles]);
  const privErrors = useMemo(() => validatePrivilegeForm(privForm, { editingPriv, privileges }), [privForm, editingPriv, privileges]);

  const touchField = (setter) => (key) => () => setter((t) => (t[key] ? t : { ...t, [key]: true }));
  const uf = Object.fromEntries(USER_FIELDS.map((k) => [
    k,
    makeField('um-user', k, userErrors, userTouched, form[k], touchField(setUserTouched)(k), k !== 'confirmPassword' || !editingUser),
  ]));
  const rf = Object.fromEntries(ROLE_FIELDS.map((k) => [
    k,
    makeField('um-role', k, roleErrors, roleTouched, roleForm[k], touchField(setRoleTouched)(k)),
  ]));
  const pf = Object.fromEntries(PRIVILEGE_FIELDS.map((k) => [
    k,
    makeField('um-priv', k, privErrors, privTouched, privForm[k], touchField(setPrivTouched)(k)),
  ]));

  // ── User modal handlers ──

  const openAddModal = () => {
    setEditingUser(null);
    const defaultRole = roles[0];
    setForm({
      ...EMPTY_USER_FORM,
      employeeNumber: nextEmployeeNumber(users),
      role: defaultRole?.name || '',
      permissions: defaultRole?.permissions || [],
    });
    setFormError('');
    setUserTouched({});
    setUserSubmitted(false);
    setShowPassword(false);
    setShowConfirmPassword(false);
    setModalOpen(true);
  };

  const openEditModal = (user) => {
    setEditingUser(user);
    setForm({
      employeeNumber: user.employeeNumber || '',
      name: user.name || '',
      email: user.email || '',
      // Always reflect the account's real role — including 'Admin', which
      // isn't a role this screen lets you *create* but must still show
      // correctly when editing an existing admin, or saving would silently
      // downgrade them.
      role: user.role,
      password: '',
      confirmPassword: '',
      permissions: user.permissions && user.permissions.length
        ? user.permissions
        : (roles.find((r) => r.name === user.role)?.permissions || []),
    });
    setFormError('');
    setUserTouched({});
    setUserSubmitted(false);
    setShowPassword(false);
    setShowConfirmPassword(false);
    setModalOpen(true);
  };

  const closeModal = () => {
    if (saving) return;
    setModalOpen(false);
  };

  const handleRoleChange = (roleName) => {
    const role = roles.find((r) => r.name === roleName);
    setForm((f) => ({ ...f, role: roleName, permissions: role?.permissions || [] }));
  };

  const handleGeneratePassword = () => {
    const pwd = generatePassword();
    setForm((f) => ({ ...f, password: pwd, confirmPassword: pwd }));
    setShowPassword(true);
    setShowConfirmPassword(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    setUserSubmitted(true);
    setUserTouched(touchAll(USER_FIELDS));
    if (Object.keys(userErrors).length > 0) return;

    setSaving(true);
    try {
      if (editingUser) {
        const payload = {
          name: form.name.trim(),
          email: form.email.trim(),
          employeeNumber: form.employeeNumber.trim(),
          role: form.role,
          permissions: form.permissions,
        };
        if (form.password) payload.password = form.password;
        const res = await updateAdminUser(editingUser.id, payload);
        setUsers((prev) => prev.map((u) => (u.id === editingUser.id ? res.user : u)));
        notice.success(`${res.user.name} was updated.`);
      } else {
        const res = await createAdminUser({
          name: form.name.trim(),
          email: form.email.trim(),
          employeeNumber: form.employeeNumber.trim(),
          password: form.password,
          role: form.role,
          permissions: form.permissions,
        });
        setUsers((prev) => [res.user, ...prev]);
        notice.success(`${res.user.name} was added as ${res.user.role}.`);
      }
      setModalOpen(false);
      loadRoles();
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to save user';
      setFormError(message);
      notice.error(message);
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (user) => {
    try {
      const res = await updateAdminUser(user.id, { isActive: user.isActive === false });
      setUsers((prev) => prev.map((u) => (u.id === user.id ? res.user : u)));
      notice.success(`${res.user.name} is now ${res.user.isActive ? 'active' : 'inactive'}.`);
    } catch (err) {
      notice.error(err.response?.data?.message || 'Failed to update status');
    }
  };

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    setDeleting(true);
    try {
      await deleteAdminUser(pendingDelete.id);
      setUsers((prev) => prev.filter((u) => u.id !== pendingDelete.id));
      notice.success(`${pendingDelete.name} was removed.`);
      setPendingDelete(null);
      loadRoles();
    } catch (err) {
      notice.error(err.response?.data?.message || 'Failed to remove user');
    } finally {
      setDeleting(false);
    }
  };

  // ── Privilege handlers ──

  const openAddPrivModal = () => {
    setEditingPriv(null);
    setPrivForm(EMPTY_PRIVILEGE_FORM);
    setPrivTouched({});
    setPrivSubmitted(false);
    setPrivFormError('');
    setPrivModalOpen(true);
  };

  const openEditPrivModal = (priv) => {
    setEditingPriv(priv);
    setPrivForm({ name: priv.name, description: priv.description });
    setPrivTouched({});
    setPrivSubmitted(false);
    setPrivFormError('');
    setPrivModalOpen(true);
  };

  const closePrivModal = () => {
    if (privSaving) return;
    setPrivModalOpen(false);
  };

  const handlePrivSubmit = async (e) => {
    e.preventDefault();
    setPrivFormError('');

    setPrivSubmitted(true);
    setPrivTouched(touchAll(PRIVILEGE_FIELDS));
    if (Object.keys(privErrors).length > 0) return;

    setPrivSaving(true);
    try {
      const payload = { name: privForm.name.trim(), description: privForm.description.trim() };
      if (editingPriv) {
        const res = await updatePrivilege(editingPriv.id, payload);
        setPrivileges((prev) => prev.map((p) => (p.id === editingPriv.id ? res.privilege : p)));
        notice.success(`Privilege "${res.privilege.name}" updated.`);
      } else {
        const res = await createPrivilege(payload);
        setPrivileges((prev) => [...prev, res.privilege]);
        notice.success(`Privilege "${res.privilege.name}" created — you can now add it to any role.`);
      }
      setPrivModalOpen(false);
    } catch (err) {
      setPrivFormError(err.response?.data?.message || 'Failed to save privilege');
    } finally {
      setPrivSaving(false);
    }
  };

  const confirmDeletePriv = async () => {
    if (!pendingDeletePriv) return;
    setDeletingPriv(true);
    try {
      await deletePrivilege(pendingDeletePriv.id);
      setPrivileges((prev) => prev.filter((p) => p.id !== pendingDeletePriv.id));
      notice.success(`Privilege "${pendingDeletePriv.name}" removed.`);
      setPendingDeletePriv(null);
    } catch (err) {
      notice.error(err.response?.data?.message || 'Failed to remove privilege');
    } finally {
      setDeletingPriv(false);
    }
  };

  // ── Role modal handlers ──

  const openAddRoleModal = () => {
    setEditingRole(null);
    setRoleForm(EMPTY_ROLE_FORM);
    setRoleFormError('');
    setRoleTouched({});
    setRoleSubmitted(false);
    setRoleModalOpen(true);
  };

  const openEditRoleModal = (role) => {
    setEditingRole(role);
    setRoleForm({ name: role.name, permissions: role.permissions || [] });
    setRoleFormError('');
    setRoleTouched({});
    setRoleSubmitted(false);
    setRoleModalOpen(true);
  };

  const closeRoleModal = () => {
    if (roleSaving) return;
    setRoleModalOpen(false);
  };

  const toggleRolePermission = (key) => {
    setRoleForm((f) => ({
      ...f,
      permissions: f.permissions.includes(key)
        ? f.permissions.filter((k) => k !== key)
        : [...f.permissions, key],
    }));
  };

  const handleRoleSubmit = async (e) => {
    e.preventDefault();
    setRoleFormError('');

    setRoleSubmitted(true);
    setRoleTouched(touchAll(ROLE_FIELDS));
    if (Object.keys(roleErrors).length > 0) return;

    setRoleSaving(true);
    try {
      if (editingRole) {
        const res = await updateStaffRole(editingRole.id, {
          name: roleForm.name.trim(),
          permissions: roleForm.permissions,
        });
        setRoles((prev) => prev.map((r) => (r.id === editingRole.id ? res.role : r)));
        notice.success(`Role "${res.role.name}" updated.`);
        loadUsers();
        loadPrivileges({ silent: true });
      } else {
        const res = await createStaffRole({
          name: roleForm.name.trim(),
          permissions: roleForm.permissions,
        });
        setRoles((prev) => [...prev, res.role]);
        notice.success(`Role "${res.role.name}" created.`);
        loadPrivileges({ silent: true });
      }
      setRoleModalOpen(false);
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to save role';
      setRoleFormError(message);
      notice.error(message);
    } finally {
      setRoleSaving(false);
    }
  };

  const confirmDeleteRole = async () => {
    if (!pendingDeleteRole) return;
    setDeletingRole(true);
    try {
      await deleteStaffRole(pendingDeleteRole.id);
      setRoles((prev) => prev.filter((r) => r.id !== pendingDeleteRole.id));
      notice.success(`Role "${pendingDeleteRole.name}" removed.`);
      loadPrivileges({ silent: true });
      setPendingDeleteRole(null);
    } catch (err) {
      notice.error(err.response?.data?.message || 'Failed to remove role');
    } finally {
      setDeletingRole(false);
    }
  };

  // The page-level action button follows the active tab.
  const HEADER_ACTIONS = {
    team: { label: 'Add User', onClick: openAddModal },
    roles: { label: 'Add Role', onClick: openAddRoleModal },
    privileges: { label: 'Add Privilege', onClick: openAddPrivModal },
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
    <div className="um-page">
      <div className="admin-page-header um-header">
        <div>
          <h1 className="admin-page-title">User Management</h1>
          <p className="admin-page-subtitle">
            Add staff accounts and control what each one can access
          </p>
        </div>
        <div className="um-header-actions">
          <button
            type="button"
            className="admin-btn primary um-add-btn"
            onClick={HEADER_ACTIONS[activeTab].onClick}
            disabled={activeTab === 'team' && roles.length === 0}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            {HEADER_ACTIONS[activeTab].label}
          </button>
        </div>
      </div>

      <AdminNotice notice={notice.notice} onDismiss={notice.dismiss} />
      {error && <div className="admin-error-banner">{error}</div>}
      {!rolesLoading && roles.length === 0 && (
        <div className="admin-notice admin-notice-info" role="status">
          <span className="admin-notice-icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" />
            </svg>
          </span>
          <span className="admin-notice-text">
            No roles defined yet — open <strong>Roles &amp; Access</strong> and add one (e.g. Manager, Sales Officer) before adding users.
          </span>
        </div>
      )}

      {/* ── Summary Cards ── */}
      <div className="um-stat-grid">
        {summaryCards.map((card) => (
          <div className="um-stat-card" key={card.key}>
            <div className={`um-stat-icon ${card.colorClass}`}>{card.icon}</div>
            <div>
              <div className="um-stat-label">{card.label}</div>
              <div className="um-stat-value">{card.value}</div>
              <div className="um-stat-trend">{card.hint}</div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Tabs ── */}
      <div className="um-tabs" role="tablist">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            type="button"
            role="tab"
            aria-selected={activeTab === tab.key}
            className={`um-tab${activeTab === tab.key ? ' active' : ''}`}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
            <span className="um-tab-count">
              {tab.key === 'team' ? users.length : tab.key === 'roles' ? roles.length + 1 : privileges.length}
            </span>
          </button>
        ))}
      </div>

      {/* ── Team Members Tab ── */}
      {activeTab === 'team' && (
        <>
          <div className="um-toolbar">
            <div className="admin-search um-search">
              <span className="admin-search-icon">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
              </span>
              <input
                type="text"
                placeholder="Search by name, email or employee number"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <select className="admin-select" value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
              <option value="All">All Roles</option>
              {roleNames.map((r) => <option key={r} value={r}>{r === 'Admin' ? 'Administrator' : r}</option>)}
            </select>
            <select className="admin-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="All">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>

          {loading ? (
            <div className="um-table-card">
              <div className="dash-table-skeleton">
                {Array.from({ length: 4 }).map((_, i) => <div className="dash-skeleton dash-skeleton-row" key={i} />)}
              </div>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="um-empty-state">
              <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
              <p>No team members match your filters.</p>
            </div>
          ) : (
            <div className="um-table-card">
              <div className="admin-table-wrap">
                <table className="admin-table um-table">
                  <thead>
                    <tr>
                      <th>Employee No.</th>
                      <th>Full Name</th>
                      <th>Email Address</th>
                      <th>Role</th>
                      <th>Status</th>
                      <th>Added</th>
                      <th style={{ textAlign: 'center' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((u) => (
                      <tr key={u.id}>
                        <td className="um-employee-no">{u.employeeNumber || '—'}</td>
                        <td>
                          <div className="um-user-cell">
                            <div className="um-avatar" style={{ background: avatarGradient(u.role, roles) }}>{initials(u.name)}</div>
                            <span style={{ fontWeight: 600 }}>{u.name}</span>
                          </div>
                        </td>
                        <td>{u.email || '—'}</td>
                        <td>
                          <span className={`admin-badge ${roleBadgeClass(u.role, roles)}`}>
                            {u.role === 'Admin' ? 'Administrator' : u.role}
                          </span>
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
                          <div className="um-row-actions">
                            <button type="button" className="um-action-btn edit" onClick={() => openEditModal(u)} aria-label="Edit user">
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4Z" />
                              </svg>
                              <span className="um-action-label">Edit</span>
                            </button>
                            <button
                              type="button"
                              className="um-action-btn delete"
                              onClick={() => setPendingDelete(u)}
                              disabled={String(admin?.id) === String(u.id)}
                              aria-label="Remove user"
                            >
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                              </svg>
                              <span className="um-action-label">Delete</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}

      {/* ── Roles & Access Tab ── */}
      {activeTab === 'roles' && (
        <>
          <div className="um-role-grid">
            <div className="um-role-card admin">
              <div className="um-role-card-accent" />
              <div className="priv-role-head">
                <span className="priv-role-name">Administrator</span>
                <span className="admin-badge approved">{adminCount} users</span>
              </div>
              <div className="priv-role-sub">Full system access · reserved role</div>
              <div className="priv-role-modules">
                <span className="priv-role-chip">All modules</span>
              </div>
            </div>
            {roles.map((role, idx) => (
              <div className="um-role-card" key={role.id}>
                <div className="um-role-card-accent" style={{ background: ROLE_AVATAR_PALETTE[(idx + 1) % ROLE_AVATAR_PALETTE.length] }} />
                <div className="priv-role-head">
                  <span className="priv-role-name">{role.name}</span>
                  <span className={`admin-badge ${roleBadgeClass(role.name, roles)}`}>{role.userCount || 0} users</span>
                </div>
                <div className="priv-role-sub">Default privileges</div>
                <div className="priv-role-modules">
                  {(role.permissions || []).length === 0 && <span className="um-contact-sub">No privileges</span>}
                  {(role.permissions || []).map((key) => {
                    const priv = privilegeByKey[key];
                    return priv ? <span className="priv-role-chip" key={key} title={priv.description}>{priv.name}</span> : null;
                  })}
                </div>
                <div className="um-role-card-actions">
                  <button type="button" className="um-inline-btn" onClick={() => openEditRoleModal(role)}>Edit</button>
                  <button type="button" className="um-inline-btn danger" onClick={() => setPendingDeleteRole(role)}>Delete</button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* ── Privileges Tab ── */}
      {activeTab === 'privileges' && (
        <>
          <div className="um-toolbar">
            <div className="admin-search um-search">
              <span className="admin-search-icon">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
              </span>
              <input
                type="search"
                value={privSearch}
                onChange={(e) => setPrivSearch(e.target.value)}
                placeholder="Search privileges by name or description"
              />
            </div>
          </div>

          {privilegesLoading ? (
            <div className="um-priv-grid">
              {Array.from({ length: 6 }).map((_, i) => <div className="dash-skeleton um-priv-skeleton" key={i} />)}
            </div>
          ) : visiblePrivileges.length === 0 ? (
            <div className="um-empty-state">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              <p>{privSearch ? 'No privileges match your search.' : 'No privileges yet.'}</p>
            </div>
          ) : (
            <div className="um-priv-grid">
              {visiblePrivileges.map((priv) => {
                const inUse = priv.roleCount + priv.userCount > 0;
                return (
                  <div className={`um-priv-card${priv.isSystem ? ' system' : ''}`} key={priv.id}>
                    <div className="um-priv-card-head">
                      <div className="um-priv-icon">
                        {priv.isSystem ? (
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12 2 4 5v6c0 5 3.4 9.4 8 11 4.6-1.6 8-6 8-11V5l-8-3Z" /><path d="m9 12 2 2 4-4" />
                          </svg>
                        ) : (
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="8" cy="15" r="4" /><path d="m10.85 12.15 8.65-8.65M18 5l3 3M15 8l2 2" />
                          </svg>
                        )}
                      </div>
                      <div className="um-priv-title">
                        <h4>{priv.name}</h4>
                        <code>{priv.key}</code>
                      </div>
                      <span className={`um-priv-tag${priv.isSystem ? ' system' : ''}`}>{priv.isSystem ? 'Built-in' : 'Custom'}</span>
                    </div>

                    <p className="um-priv-desc">{priv.description}</p>

                    <div className="um-priv-card-foot">
                      <span className="um-priv-usage" title="Roles and users currently holding this privilege">
                        <strong>{priv.roleCount}</strong> {priv.roleCount === 1 ? 'role' : 'roles'}
                        <i aria-hidden="true">·</i>
                        <strong>{priv.userCount}</strong> {priv.userCount === 1 ? 'user' : 'users'}
                      </span>
                      <div className="um-priv-actions">
                        <button type="button" className="um-inline-btn" onClick={() => openEditPrivModal(priv)}>Edit</button>
                        <button
                          type="button"
                          className="um-inline-btn danger"
                          onClick={() => setPendingDeletePriv(priv)}
                          disabled={priv.isSystem}
                          title={priv.isSystem ? 'Built-in privileges cannot be deleted' : inUse ? 'Still in use — remove it from roles first' : 'Delete privilege'}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* ── Add / Edit User Modal ── */}
      {modalOpen && (
        <div className="admin-modal-overlay" onClick={closeModal}>
          <div className="admin-modal um-modal um-user-modal" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header um-modal-header">
              <div className="um-modal-header-identity">
                <div className="um-modal-avatar" style={{ background: avatarGradient(form.role, roles) }}>
                  {initials(form.name) || '?'}
                </div>
                <div>
                  <h3>{editingUser ? 'Edit User' : 'Add New User'}</h3>
                  <div className="admin-modal-subtitle">
                    {editingUser ? 'Update profile and role — privileges follow the selected role' : 'Create a staff account — privileges follow the selected role'}
                  </div>
                </div>
              </div>
              <button type="button" className="admin-modal-close" onClick={closeModal} aria-label="Close">×</button>
            </div>

            <form onSubmit={handleSubmit} noValidate>
              <div className="admin-modal-body">
                {userSubmitted && Object.keys(userErrors).length > 0 && (
                  <div className="admin-error-banner" role="alert" style={{ marginBottom: '1rem' }}>Please fix the highlighted fields before continuing.</div>
                )}
                {formError && <div className="admin-error-banner" role="alert" style={{ marginBottom: '1rem' }}>{formError}</div>}

                <div className="um-form-grid um-form-vertical">
                  <label className="um-field">
                    <span>Employee Number</span>
                    <div className="um-input-icon-wrap">
                      <span className="um-input-icon-glyph">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="3" y="4" width="18" height="16" rx="2" /><path d="M7 8h10M7 12h6M3 16h18" />
                        </svg>
                      </span>
                      <input
                        type="text"
                        className="um-input um-input-icon"
                        value={form.employeeNumber}
                        disabled
                        readOnly
                      />
                    </div>
                    <span className="um-field-hint">Auto-generated — this is the account's permanent unique ID.</span>
                  </label>

                  <label className="um-field">
                    <span>Full Name *</span>
                    <div className="um-input-icon-wrap">
                      <span className="um-input-icon-glyph">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
                        </svg>
                      </span>
                      <input
                        type="text"
                        className={`um-input um-input-icon${uf.name.cls}`}
                        {...uf.name.props}
                        value={form.name}
                        maxLength={60}
                        autoComplete="off"
                        onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                        placeholder="e.g. Kasun Perera"
                      />
                    </div>
                    <FieldError id={uf.name.errorId} message={uf.name.error} />
                  </label>

                  <label className="um-field">
                    <span>Email Address *</span>
                    <div className="um-input-icon-wrap">
                      <span className="um-input-icon-glyph">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="2" y="4" width="20" height="16" rx="2" /><path d="m22 6-10 7L2 6" />
                        </svg>
                      </span>
                      <input
                        type="email"
                        className={`um-input um-input-icon${uf.email.cls}`}
                        {...uf.email.props}
                        value={form.email}
                        autoComplete="off"
                        onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                        placeholder={`name@${EMAIL_DOMAIN}`}
                      />
                    </div>
                    <FieldError id={uf.email.errorId} message={uf.email.error} />
                  </label>

                  <label className="um-field">
                    <span>Role *</span>
                    <select
                      className={`um-input${uf.role.cls}`}
                      {...uf.role.props}
                      value={form.role}
                      onChange={(e) => handleRoleChange(e.target.value)}
                      disabled={editingUser?.role === 'Admin'}
                    >
                      {editingUser?.role === 'Admin' && (
                        <option value="Admin">Administrator</option>
                      )}
                      {roles.map((r) => (
                        <option key={r.id} value={r.name}>{r.name}</option>
                      ))}
                    </select>
                    {editingUser?.role === 'Admin' && (
                      <span className="um-field-hint">Administrator accounts can't be re-assigned from here.</span>
                    )}
                    <FieldError id={uf.role.errorId} message={uf.role.error} />
                  </label>

                  <label className="um-field">
                    <span>{editingUser ? 'New Password (optional)' : 'Password *'}</span>
                    <div className="um-input-icon-wrap">
                      <span className="um-input-icon-glyph">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
                        </svg>
                      </span>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        className={`um-input um-input-icon um-input-icon-both${uf.password.cls}`}
                        {...uf.password.props}
                        value={form.password}
                        autoComplete="new-password"
                        onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                        placeholder={editingUser ? 'Leave blank to keep current' : 'Minimum 6 characters'}
                      />
                      <button
                        type="button"
                        className="um-eye-btn"
                        onClick={() => setShowPassword((s) => !s)}
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                        title={showPassword ? 'Hide password' : 'Show password'}
                      >
                        <EyeIcon open={showPassword} />
                      </button>
                    </div>
                    <button type="button" className="um-generate-link" onClick={handleGeneratePassword}>
                      Generate a strong password
                    </button>
                    <FieldError id={uf.password.errorId} message={uf.password.error} />
                  </label>

                  <label className="um-field">
                    <span>Confirm Password{!editingUser ? ' *' : ''}</span>
                    <div className="um-input-icon-wrap">
                      <span className="um-input-icon-glyph">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
                        </svg>
                      </span>
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        className={`um-input um-input-icon um-input-icon-both${uf.confirmPassword.cls}`}
                        {...uf.confirmPassword.props}
                        value={form.confirmPassword}
                        autoComplete="new-password"
                        onChange={(e) => setForm((f) => ({ ...f, confirmPassword: e.target.value }))}
                        placeholder="Re-enter password"
                      />
                      <button
                        type="button"
                        className="um-eye-btn"
                        onClick={() => setShowConfirmPassword((s) => !s)}
                        aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                        title={showConfirmPassword ? 'Hide password' : 'Show password'}
                      >
                        <EyeIcon open={showConfirmPassword} />
                      </button>
                    </div>
                    <FieldError id={uf.confirmPassword.errorId} message={uf.confirmPassword.error} />
                  </label>
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

      {/* ── Delete User Confirmation ── */}
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
                {' '}({pendingDelete.role === 'Admin' ? 'Administrator' : pendingDelete.role})? This cannot be undone.
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

      {/* ── Add / Edit Role Modal ── */}
      {roleModalOpen && (
        <div className="admin-modal-overlay" onClick={closeRoleModal}>
          <div className="admin-modal um-modal" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header um-modal-header">
              <div>
                <h3>{editingRole ? 'Edit Role' : 'Add New Role'}</h3>
                <div className="admin-modal-subtitle">
                  {editingRole ? 'Rename this role or change its default module access' : 'Define a role name and its default module access'}
                </div>
              </div>
              <button type="button" className="admin-modal-close" onClick={closeRoleModal} aria-label="Close">×</button>
            </div>

            <form onSubmit={handleRoleSubmit} noValidate>
              <div className="admin-modal-body">
                {roleSubmitted && Object.keys(roleErrors).length > 0 && (
                  <div className="admin-error-banner" role="alert" style={{ marginBottom: '1rem' }}>Please fix the highlighted fields before continuing.</div>
                )}
                {roleFormError && <div className="admin-error-banner" role="alert" style={{ marginBottom: '1rem' }}>{roleFormError}</div>}

                <label className="um-field" style={{ marginBottom: '1.25rem' }}>
                  <span>Role Name *</span>
                  <input
                    type="text"
                    className={`um-input${rf.name.cls}`}
                    {...rf.name.props}
                    value={roleForm.name}
                    maxLength={40}
                    autoComplete="off"
                    onChange={(e) => setRoleForm((f) => ({ ...f, name: e.target.value }))}
                    placeholder="e.g. Support Agent"
                  />
                  <FieldError id={rf.name.errorId} message={rf.name.error} />
                </label>

                <div className="um-form-section-label">Default Module Privileges</div>
                <p className="admin-modal-empty" style={{ marginBottom: '0.75rem' }}>
                  Applied automatically when a user with this role is created — still adjustable per user.
                </p>
                <div className="um-privileges-grid">
                  {privileges.map((priv) => (
                    <label className="um-priv-checkbox" key={priv.key}>
                      <input
                        type="checkbox"
                        checked={roleForm.permissions.includes(priv.key)}
                        onChange={() => toggleRolePermission(priv.key)}
                      />
                      <span>{priv.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="um-modal-footer">
                <button type="button" className="admin-btn ghost" onClick={closeRoleModal} disabled={roleSaving}>
                  Cancel
                </button>
                <button type="submit" className="admin-btn primary" disabled={roleSaving}>
                  {roleSaving ? 'Saving…' : editingRole ? 'Save Changes' : 'Create Role'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Delete Role Confirmation ── */}
      {pendingDeleteRole && (
        <div className="admin-modal-overlay" onClick={() => !deletingRole && setPendingDeleteRole(null)}>
          <div className="admin-modal um-confirm-modal" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h3>Remove Role</h3>
              <button type="button" className="admin-modal-close" onClick={() => setPendingDeleteRole(null)} aria-label="Close">×</button>
            </div>
            <div className="admin-modal-body">
              <p>
                Are you sure you want to permanently remove the <strong>{pendingDeleteRole.name}</strong> role?
                {pendingDeleteRole.userCount > 0
                  ? ` ${pendingDeleteRole.userCount} user(s) currently have this role — reassign them first.`
                  : ' This cannot be undone.'}
              </p>
            </div>
            <div className="um-modal-footer">
              <button type="button" className="admin-btn ghost" onClick={() => setPendingDeleteRole(null)} disabled={deletingRole}>
                Cancel
              </button>
              <button
                type="button"
                className="admin-btn danger"
                onClick={confirmDeleteRole}
                disabled={deletingRole || pendingDeleteRole.userCount > 0}
              >
                {deletingRole ? 'Removing…' : 'Remove Role'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Add / Edit Privilege Modal ── */}
      {privModalOpen && (
        <div className="admin-modal-overlay" onClick={closePrivModal}>
          <div className="admin-modal um-modal um-priv-modal" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header um-modal-header">
              <div className="um-modal-header-identity">
                <div className="um-modal-avatar um-priv-modal-icon">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                </div>
                <div>
                  <h3>{editingPriv ? 'Edit Privilege' : 'Add New Privilege'}</h3>
                  <div className="admin-modal-subtitle">
                    {editingPriv ? 'Update how this privilege is named and described' : 'Define something a role or user can be allowed to do'}
                  </div>
                </div>
              </div>
              <button type="button" className="admin-modal-close" onClick={closePrivModal} aria-label="Close">×</button>
            </div>

            <form onSubmit={handlePrivSubmit} noValidate>
              <div className="admin-modal-body">
                {privSubmitted && Object.keys(privErrors).length > 0 && (
                  <div className="admin-error-banner" role="alert" style={{ marginBottom: '1rem' }}>Please fix the highlighted fields before continuing.</div>
                )}
                {privFormError && <div className="admin-error-banner" role="alert" style={{ marginBottom: '1rem' }}>{privFormError}</div>}

                <div className="um-form-grid um-form-vertical">
                  <label className="um-field">
                    <span>Privilege Name *</span>
                    <input
                      type="text"
                      className={`um-input${pf.name.cls}`}
                      {...pf.name.props}
                      value={privForm.name}
                      maxLength={60}
                      autoComplete="off"
                      onChange={(e) => setPrivForm((f) => ({ ...f, name: e.target.value }))}
                      placeholder="e.g. Export Reports"
                    />
                    <FieldError id={pf.name.errorId} message={pf.name.error} />
                  </label>

                  {editingPriv && (
                    <label className="um-field">
                      <span>Key</span>
                      <input type="text" className="um-input" value={editingPriv.key} disabled readOnly />
                      <span className="um-field-hint">
                        {editingPriv.isSystem
                          ? 'Built-in key — it links this privilege to its admin page and cannot change.'
                          : 'Generated when the privilege was created and never changes, so roles keep working after a rename.'}
                      </span>
                    </label>
                  )}

                  <label className="um-field">
                    <span>What does it allow? *</span>
                    <textarea
                      className={`um-input um-textarea${pf.description.cls}`}
                      {...pf.description.props}
                      value={privForm.description}
                      maxLength={PRIVILEGE_DESCRIPTION_MAX}
                      rows={4}
                      onChange={(e) => setPrivForm((f) => ({ ...f, description: e.target.value }))}
                      placeholder="Explain in a sentence or two what someone holding this privilege can do."
                    />
                    <span className="um-field-hint um-char-count">{privForm.description.length} / {PRIVILEGE_DESCRIPTION_MAX}</span>
                    <FieldError id={pf.description.errorId} message={pf.description.error} />
                  </label>
                </div>
              </div>

              <div className="um-modal-footer">
                <button type="button" className="admin-btn ghost" onClick={closePrivModal} disabled={privSaving}>Cancel</button>
                <button type="submit" className="admin-btn primary" disabled={privSaving}>
                  {privSaving ? 'Saving…' : editingPriv ? 'Save Changes' : 'Create Privilege'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Delete Privilege Confirmation ── */}
      {pendingDeletePriv && (
        <div className="admin-modal-overlay" onClick={() => !deletingPriv && setPendingDeletePriv(null)}>
          <div className="admin-modal um-confirm-modal" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h3>Remove Privilege</h3>
              <button type="button" className="admin-modal-close" onClick={() => setPendingDeletePriv(null)} aria-label="Close">×</button>
            </div>
            <div className="admin-modal-body">
              <p>
                Are you sure you want to permanently remove the <strong>{pendingDeletePriv.name}</strong> privilege?
                {pendingDeletePriv.roleCount + pendingDeletePriv.userCount > 0
                  ? ` It is still assigned to ${pendingDeletePriv.roleCount} role(s) and ${pendingDeletePriv.userCount} user(s) — remove it from them first.`
                  : ' This cannot be undone.'}
              </p>
            </div>
            <div className="um-modal-footer">
              <button type="button" className="admin-btn ghost" onClick={() => setPendingDeletePriv(null)} disabled={deletingPriv}>Cancel</button>
              <button
                type="button"
                className="admin-btn danger"
                onClick={confirmDeletePriv}
                disabled={deletingPriv || pendingDeletePriv.roleCount + pendingDeletePriv.userCount > 0}
              >
                {deletingPriv ? 'Removing…' : 'Remove Privilege'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
