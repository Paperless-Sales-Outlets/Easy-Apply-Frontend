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

// GET /api/admin/analytics — submissions by service type, daily trend (30 days), status breakdown
export const getAnalytics = async () => {
  const response = await api.get('/admin/analytics');
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

export default {
  getDashboardStats,
  getApplications,
  getAdminForms,
  updateApplicationStatus,
  getKycQueue,
  reviewKycApplication,
  getAnalytics,
  updateOfficeFields,
  getAppointments,
  getTechnicians,
  assignTechnician,
  getMyJobs,
  updateMyJobStatus,
  createAppointment,
  getUsers,
};
