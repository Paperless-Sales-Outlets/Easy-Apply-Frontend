import api from '../../../utils/api';

// The 9 service form types tracked in the operations dashboard.
export const FORM_TYPES = [
  { id: 'new-connection', label: 'New Connection' },
  { id: 'reconnection', label: 'Reconnection' },
  { id: 'relocation', label: 'Relocation' },
  { id: 'termination', label: 'Termination' },
  { id: 'transfer', label: 'Transfer' },
  { id: 'package-migration', label: 'Package Migration' },
  { id: 'service-vacation', label: 'Service Vacation' },
  { id: 'refund-request', label: 'Refund Request' },
  { id: 'customer-request-acceptance', label: 'Customer Request Acceptance' },
];

export const SERVICE_LABELS = Object.fromEntries(
  FORM_TYPES.map((f) => [f.id, f.label])
);

export const STATUS_LABELS = {
  pending: 'Pending',
  'pending payment': 'Pending Payment',
  approved: 'Approved',
  confirmed: 'Confirmed',
  rejected: 'Rejected',
  flagged: 'Flagged',
};

function pick(obj, keys) {
  for (const key of keys) {
    const value = obj && obj[key];
    if (value !== undefined && value !== null && value !== '') return value;
  }
  return '';
}

// Map a raw Application document to the display shape used by the admin UI.
export function normalizeApplication(app) {
  const fd = app.formData || {};
  const address = pick(fd, [
    'address',
    'fullAddress',
    'residentialAddress',
    'serviceAddress',
    'permanentAddress',
    'billingAddress',
  ]) || [fd.addressLine1, fd.addressLine2].filter(Boolean).join(', ');

  return {
    id: app._id || app.id,
    referenceNumber: app.referenceNumber,
    name: pick(fd, [
      'nameFull',
      'fullName',
      'contactName',
      'customerName',
      'legalOwner',
      'currentCustomerName',
      'applicantName',
    ]),
    nic: app.nic || pick(fd, ['nic', 'NIC']),
    phone: app.phone || '',
    email: pick(fd, ['email', 'emailAddress']),
    serviceType: app.serviceType,
    status: app.status || 'pending',
    submittedAt: app.createdAt || app.submittedAt,
    updatedAt: app.updatedAt || '',
    actionedAt: app.actionedAt || '',
    actionedBy: app.actionedBy || null,
    notes: app.notes || '',
    address,
    formData: fd,
    documents: fd.documents || {},
  };
}

// Map a raw Form document (the pre-existing forms API) to the same display shape.
export function normalizeForm(form) {
  const data = form.data || {};
  const address = [data.addressLine1, data.addressLine2].filter(Boolean).join(', ')
    || pick(data, [
      'address',
      'fullAddress',
      'residentialAddress',
      'serviceAddress',
      'permanentAddress',
      'billingAddress',
    ]);

  return {
    id: form._id || form.id,
    referenceNumber: pick(data, ['referenceNumber', 'refNumber'])
      || `F-${String(form._id || form.id || '').slice(-6)}`,
    name: pick(data, [
      'fullName',
      'nameFull',
      'contactName',
      'customerName',
      'legalOwner',
      'currentCustomerName',
      'applicantName',
    ]),
    nic: pick(data, ['nic', 'NIC']),
    phone: pick(data, ['telephone', 'contactNo', 'mobile', 'phone']),
    email: pick(data, ['email', 'emailAddress']),
    serviceType: form.formType,
    status: form.status || 'pending',
    submittedAt: form.createdAt || form.submittedAt,
    address,
    formData: data,
    documents: data.documents || {},
  };
}

// Derive dashboard stats from a list of Form documents (fallback when
// /admin/dashboard-stats is unavailable). Mirrors the dashboard-stats contract:
// { pendingKyc, approvedToday, rejectedToday, todaySubmissions, byServiceType }
export function deriveStatsFromForms(forms) {
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  const isToday = (value) => {
    if (!value) return false;
    return new Date(value) >= startOfToday;
  };

  let pendingKyc = 0;
  let approvedToday = 0;
  let rejectedToday = 0;
  let todaySubmissions = 0;
  const totalByType = {};
  const completedByType = {};

  forms.forEach((form) => {
    const type = form.formType;
    const status = String(form.status || 'pending').toLowerCase();
    totalByType[type] = (totalByType[type] || 0) + 1;
    if (isToday(form.createdAt || form.submittedAt)) todaySubmissions += 1;

    if (status === 'approved' || status === 'confirmed') {
      completedByType[type] = (completedByType[type] || 0) + 1;
      if (isToday(form.updatedAt || form.createdAt)) approvedToday += 1;
    } else if (status === 'rejected') {
      if (isToday(form.updatedAt || form.createdAt)) rejectedToday += 1;
    } else if (status === 'pending' || status === 'pending payment') {
      pendingKyc += 1;
    }
  });

  return {
    pendingKyc,
    approvedToday,
    rejectedToday,
    todaySubmissions,
    byServiceType: FORM_TYPES.map((t) => ({
      id: t.id,
      label: t.label,
      total: totalByType[t.id] || 0,
      completed: completedByType[t.id] || 0,
    })),
  };
}

// Derive the same dashboard stats directly from a list of Application
// documents (normalizeApplication output), so the operations dashboard can
// render its pie/bar charts and counters straight from the applications API.
export function deriveStatsFromApplications(apps) {
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  const isToday = (value) => {
    if (!value) return false;
    return new Date(value) >= startOfToday;
  };

  let pendingKyc = 0;
  let approvedToday = 0;
  let rejectedToday = 0;
  let todaySubmissions = 0;
  const totalByType = {};
  const completedByType = {};

  apps.forEach((app) => {
    const type = app.serviceType;
    const status = String(app.status || 'pending').toLowerCase();
    const actionedOn = app.actionedAt || app.updatedAt;

    totalByType[type] = (totalByType[type] || 0) + 1;
    if (isToday(app.submittedAt)) todaySubmissions += 1;

    if (status === 'approved' || status === 'confirmed') {
      completedByType[type] = (completedByType[type] || 0) + 1;
      if (isToday(actionedOn)) approvedToday += 1;
    } else if (status === 'rejected') {
      if (isToday(actionedOn)) rejectedToday += 1;
    } else if (status === 'pending' || status === 'pending payment') {
      pendingKyc += 1;
    }
  });

  return {
    pendingKyc,
    approvedToday,
    rejectedToday,
    todaySubmissions,
    byServiceType: FORM_TYPES.map((t) => ({
      id: t.id,
      label: t.label,
      total: totalByType[t.id] || 0,
      completed: completedByType[t.id] || 0,
    })),
  };
}

// Count today's submissions and today's completions (approved/confirmed)
// grouped by application type, for the "Today Application Distribution" chart.
export function deriveTodayDistribution(apps) {
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  const isToday = (value) => value && new Date(value) >= startOfToday;
  const submitted = {};
  const completed = {};
  apps.forEach((app) => {
    const type = app.serviceType;
    const status = String(app.status || 'pending').toLowerCase();
    if (isToday(app.submittedAt)) {
      submitted[type] = (submitted[type] || 0) + 1;
    }
    if ((status === 'approved' || status === 'confirmed') && isToday(app.actionedAt || app.updatedAt)) {
      completed[type] = (completed[type] || 0) + 1;
    }
  });
  return FORM_TYPES.map((t) => ({
    id: t.id,
    label: t.label,
    submitted: submitted[t.id] || 0,
    completed: completed[t.id] || 0,
  }));
}

export function serviceLabel(serviceType) {
  return SERVICE_LABELS[serviceType] || (serviceType ? serviceType.replace(/-/g, ' ') : '');
}

export function statusLabel(status) {
  return STATUS_LABELS[status] || (status ? status.charAt(0).toUpperCase() + status.slice(1) : 'Pending');
}

export function statusBadgeClass(status) {
  return status ? String(status).toLowerCase().replace(/\s+/g, '-') : 'pending';
}

export function formatDate(iso) {
  if (!iso) return '';
  return new Date(iso).toLocaleString('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false,
  });
}

export function formatDateOnly(iso) {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric',
  });
}

// Resolve a stored document path/URL to a usable asset URL.
export function getAssetUrl(path) {
  if (!path) return '';
  if (/^https?:\/\//.test(path)) return path;
  if (path.startsWith('/uploads/')) {
    const origin = api.defaults.baseURL.replace(/\/api\/?$/, '');
    return `${origin}${path}`;
  }
  return path;
}
