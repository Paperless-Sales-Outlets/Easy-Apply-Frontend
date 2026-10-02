import api from '../../../utils/api';

// GET /api/admin/dashboard-stats — summary, form stats, recent applications
export const getDashboardStats = async () => {
  const response = await api.get('/admin/dashboard-stats');
  return response.data;
};

// GET /api/admin/applications — paginated, filterable application list
export const getApplications = async (params = {}) => {
  const response = await api.get('/admin/applications', { params });
  return response.data;
};

// GET /api/admin/forms — pre-existing paginated forms API (fallback data source)
export const getAdminForms = async (params = {}) => {
  const response = await api.get('/admin/forms', { params });
  return response.data;
};

// PATCH /api/admin/applications/:id/status — approve / reject / flag / pending + staff notes
export const updateApplicationStatus = async (id, status, notes = '') => {
  const response = await api.patch(`/admin/applications/${id}/status`, { status, notes });
  return response.data;
};

// GET /api/admin/kyc — pending KYC review queue with (signed) document URLs
export const getKycQueue = async () => {
  const response = await api.get('/admin/kyc');
  return response.data;
};

// PATCH /api/admin/kyc/:id/review — approve / reject / flag / reopen + staff notes
export const reviewKycApplication = async (id, status, notes = '') => {
  const response = await api.patch(`/admin/kyc/${id}/review`, { status, notes });
  return response.data;
};

// GET /api/admin/analytics — submissions by service type, daily trend, status breakdown
// Accepts a shared report window: { from, to, serviceType, status }
export const getAnalytics = async (params = {}) => {
  const response = await api.get('/admin/analytics', { params });
  return response.data;
};

// GET /api/admin/analytics/reports — per-user progress report (tasks handled per staff member)
export const getUserReports = async (params = {}) => {
  const response = await api.get('/admin/analytics/reports', { params });
  return response.data;
};

// GET /api/admin/analytics/reports/applications — application report rows
// (product, customer, NIC, mobile, paid amount, apply date, reference number)
export const getApplicationReports = async (params = {}) => {
  const response = await api.get('/admin/analytics/reports/applications', { params });
  return response.data;
};

// PATCH /api/admin/applications/:id/office-fields — update CR Number, Amount Paid, Staff Signature, Appointment Date
export const updateOfficeFields = async (id, fields) => {
  const response = await api.patch(`/admin/applications/${id}/office-fields`, fields);
  return response.data;
};

// GET /api/admin/appointments — list appointments (filterable by date, technician, status)
export const getAppointments = async (params = {}) => {
  const response = await api.get('/admin/appointments', { params });
  return response.data;
};

// GET /api/admin/appointments/technicians — list staff who can be assigned
export const getTechnicians = async () => {
  const response = await api.get('/admin/appointments/technicians');
  return response.data;
};

// PATCH /api/admin/appointments/:id/assign — assign/unassign technician
export const assignTechnician = async (id, technicianId) => {
  const response = await api.patch(`/admin/appointments/${id}/assign`, { technicianId });
  return response.data;
};

// GET /api/field/appointments — get appointments assigned to logged-in technician
export const getMyJobs = async () => {
  const response = await api.get('/field/appointments');
  return response.data;
};

// PATCH /api/field/appointments/:id/status — update job status (field technician)
export const updateMyJobStatus = async (id, status) => {
  const response = await api.patch(`/field/appointments/${id}/status`, { status });
  return response.data;
};

// POST /api/admin/appointments — create an appointment from an application
export const createAppointment = async (data) => {
  const response = await api.post('/admin/appointments', data);
  return response.data;
};

// GET /api/auth/users — list all users (admin only)
export const getUsers = async () => {
  const response = await api.get('/auth/users');
  return response.data;
};

// GET /api/admin/users — list Manager/SalesOfficer/CustomerCareOfficer/Admin accounts
export const getAdminUsers = async () => {
  const response = await api.get('/admin/users');
  return response.data;
};

// POST /api/admin/users — create a staff account with role + module privileges
export const createAdminUser = async (data) => {
  const response = await api.post('/admin/users', data);
  return response.data;
};

// PATCH /api/admin/users/:id — update profile, role, privileges, status, or password
export const updateAdminUser = async (id, data) => {
  const response = await api.patch(`/admin/users/${id}`, data);
  return response.data;
};

// DELETE /api/admin/users/:id — remove a staff account
export const deleteAdminUser = async (id) => {
  const response = await api.delete(`/admin/users/${id}`);
  return response.data;
};

// GET /api/admin/roles — list roles an Admin has defined (name + default privileges + user count)
export const getStaffRoles = async () => {
  const response = await api.get('/admin/roles');
  return response.data;
};

// POST /api/admin/roles — create a new role
export const createStaffRole = async (data) => {
  const response = await api.post('/admin/roles', data);
  return response.data;
};

// PATCH /api/admin/roles/:id — rename a role and/or change its default privileges
export const updateStaffRole = async (id, data) => {
  const response = await api.patch(`/admin/roles/${id}`, data);
  return response.data;
};

// DELETE /api/admin/roles/:id — remove a role (blocked while any user still holds it)
export const deleteStaffRole = async (id) => {
  const response = await api.delete(`/admin/roles/${id}`);
  return response.data;
};

// GET /api/admin/privileges — every privilege with its description and usage counts
export const getPrivileges = async () => {
  const response = await api.get('/admin/privileges');
  return response.data;
};

// POST /api/admin/privileges — create a custom privilege
export const createPrivilege = async (data) => {
  const response = await api.post('/admin/privileges', data);
  return response.data;
};

// PATCH /api/admin/privileges/:id — change a privilege's name / description
export const updatePrivilege = async (id, data) => {
  const response = await api.patch(`/admin/privileges/${id}`, data);
  return response.data;
};

// DELETE /api/admin/privileges/:id — remove a custom privilege that nothing uses
export const deletePrivilege = async (id) => {
  const response = await api.delete(`/admin/privileges/${id}`);
  return response.data;
};

export default {
  getDashboardStats,
  getApplications,
  getAdminForms,
  updateApplicationStatus,
  getKycQueue,
  reviewKycApplication,
  getAnalytics,
  getUserReports,
  getApplicationReports,
  updateOfficeFields,
  getAppointments,
  getTechnicians,
  assignTechnician,
  getMyJobs,
  updateMyJobStatus,
  createAppointment,
  getUsers,
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
};
