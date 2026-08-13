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

export default {
  getDashboardStats,
  getApplications,
  getAdminForms,
  updateApplicationStatus,
  getKycQueue,
  reviewKycApplication,
};
