// ─── Admin Dummy Data ────────────────────────────────────────────────────────
// Centralized mock data used across all Admin dashboard pages.
// Replace each dataset with real API calls when backend is wired up.

export const DUMMY_USER = {
  name: 'Saman Perera',
  email: 'saman.perera@slt.lk',
  role: 'Admin', // 'Admin' | 'Manager' | 'SalesOfficer'
};

// ── User Privileges ────────────────────────────────────────────────────────────
export const SYSTEM_ROLES = [
  'Admin',
  'Manager',
  'SalesOfficer',
];

export const MODULE_ACCESS = [
  { key: 'dashboard',    label: 'Dashboard',    roles: ['Admin', 'Manager', 'SalesOfficer'] },
  { key: 'kyc',          label: 'KYC Review',   roles: ['Admin', 'Manager'] },
  { key: 'appointments', label: 'Appointments', roles: ['Admin', 'Manager'] },
  { key: 'technician',   label: 'My Jobs',      roles: ['Admin', 'SalesOfficer'] },
  { key: 'forms',        label: 'Forms',        roles: ['Admin', 'Manager'] },
  { key: 'analytics',    label: 'Analytics',    roles: ['Admin', 'Manager'] },
];

// ── Applications ─────────────────────────────────────────────────────────────
export const DUMMY_APPLICATIONS = [
  {
    id: 'app-001', referenceNumber: 'REQ-10234871', name: 'Kamal Bandara',
    nic: '980123456V', phone: '0771234567', email: 'kamal@example.com',
    serviceType: 'new-connection', status: 'pending',
    submittedAt: '2026-07-18T09:12:00Z', kycStatus: 'pending',
    address: '42, Galle Road, Colombo 03',
  },
  {
    id: 'app-002', referenceNumber: 'REQ-20938471', name: 'Nimali Jayawardena',
    nic: '895678901V', phone: '0712345678', email: 'nimali@example.com',
    serviceType: 'reconnection', status: 'approved',
    submittedAt: '2026-07-17T14:30:00Z', kycStatus: 'approved',
    address: '18, Kandy Road, Kurunegala',
  },
  {
    id: 'app-003', referenceNumber: 'REQ-30112938', name: 'Ruwan Silva',
    nic: '750234567V', phone: '0759876543', email: 'ruwan@example.com',
    serviceType: 'termination', status: 'flagged',
    submittedAt: '2026-07-17T10:05:00Z', kycStatus: 'flagged',
    address: '7, Temple Road, Matara',
  },
  {
    id: 'app-004', referenceNumber: 'REQ-40987362', name: 'Dilani Wickramasinghe',
    nic: '920456789V', phone: '0769871234', email: 'dilani@example.com',
    serviceType: 'package-migration', status: 'pending',
    submittedAt: '2026-07-16T08:50:00Z', kycStatus: 'pending',
    address: '25, Station Road, Gampaha',
  },
  {
    id: 'app-005', referenceNumber: 'REQ-50234109', name: 'Chaminda Rajapaksa',
    nic: '881234567V', phone: '0701239876', email: 'chaminda@example.com',
    serviceType: 'ownership-change', status: 'rejected',
    submittedAt: '2026-07-15T15:40:00Z', kycStatus: 'rejected',
    address: '3, Lake Road, Negombo',
  },
  {
    id: 'app-006', referenceNumber: 'REQ-60823741', name: 'Priyanka Fernando',
    nic: '940123456V', phone: '0779870001', email: 'priyanka@example.com',
    serviceType: 'new-connection', status: 'pending',
    submittedAt: '2026-07-15T09:00:00Z', kycStatus: 'pending',
    address: '88, New Town Road, Jaffna',
  },
  {
    id: 'app-007', referenceNumber: 'REQ-70123456', name: 'Suresh Kumar',
    nic: '830923456V', phone: '0762345678', email: 'suresh@example.com',
    serviceType: 'location-change', status: 'approved',
    submittedAt: '2026-07-14T11:20:00Z', kycStatus: 'approved',
    address: '11, Kings Street, Kandy',
  },
  {
    id: 'app-008', referenceNumber: 'REQ-80312467', name: 'Amali Perera',
    nic: '960234501V', phone: '0778901234', email: 'amali@example.com',
    serviceType: 'refund-request', status: 'pending',
    submittedAt: '2026-07-20T07:30:00Z', kycStatus: 'pending',
    address: '5, Marine Drive, Galle',
  },
  {
    id: 'app-009', referenceNumber: 'REQ-91120834', name: 'Sunil Dissanayake',
    nic: '900123456V', phone: '0774561230', email: 'sunil@example.com',
    serviceType: 'new-connection', status: 'pending',
    submittedAt: '2026-07-28T10:15:00Z', kycStatus: 'pending',
    address: '212, Duplication Road, Colombo 03',
  },
  {
    id: 'app-010', referenceNumber: 'REQ-82039471', name: 'Madhavi Perera',
    nic: '930234567V', phone: '0712349887', email: 'madhavi@example.com',
    serviceType: 'reconnection', status: 'pending',
    submittedAt: '2026-07-26T16:45:00Z', kycStatus: 'pending',
    address: '61, High Level Road, Nugegoda',
  },
  {
    id: 'app-011', referenceNumber: 'REQ-73910284', name: 'Lasantha Weerasinghe',
    nic: '870345678V', phone: '0755678901', email: 'lasantha@example.com',
    serviceType: 'location-change', status: 'approved',
    submittedAt: '2026-07-25T09:30:00Z', kycStatus: 'approved',
    address: '9, Hospital Road, Kalutara',
  },
  {
    id: 'app-012', referenceNumber: 'REQ-61403928', name: 'Tharindu Jayasuriya',
    nic: '950456789V', phone: '0766789012', email: 'tharindu@example.com',
    serviceType: 'termination', status: 'pending',
    submittedAt: '2026-07-24T13:20:00Z', kycStatus: 'pending',
    address: '114, Main Street, Batticaloa',
  },
  {
    id: 'app-013', referenceNumber: 'REQ-57203918', name: 'Kumari Senanayake',
    nic: '780567890V', phone: '0707890123', email: 'kumari@example.com',
    serviceType: 'ownership-change', status: 'rejected',
    submittedAt: '2026-07-23T11:05:00Z', kycStatus: 'rejected',
    address: '28, Church Road, Ratnapura',
  },
  {
    id: 'app-014', referenceNumber: 'REQ-40827391', name: 'Nuwan Rathnayake',
    nic: '910678901V', phone: '0778901234', email: 'nuwan@example.com',
    serviceType: 'package-migration', status: 'approved',
    submittedAt: '2026-07-22T08:40:00Z', kycStatus: 'approved',
    address: '77, Lake View Road, Badulla',
  },
  {
    id: 'app-015', referenceNumber: 'REQ-31029847', name: 'Ishara Karunaratne',
    nic: '960789012V', phone: '0769012345', email: 'ishara@example.com',
    serviceType: 'service-vacation', status: 'pending',
    submittedAt: '2026-07-30T14:10:00Z', kycStatus: 'pending',
    address: '19, Flower Road, Anuradhapura',
  },
  {
    id: 'app-016', referenceNumber: 'REQ-29847103', name: 'Pradeep Gunawardena',
    nic: '820890123V', phone: '0710123456', email: 'pradeep@example.com',
    serviceType: 'service-vacation', status: 'approved',
    submittedAt: '2026-07-21T10:55:00Z', kycStatus: 'approved',
    address: '4, Harbour Road, Trincomalee',
  },
  {
    id: 'app-017', referenceNumber: 'REQ-19472038', name: 'Sanduni Alwis',
    nic: '970901234V', phone: '0751234567', email: 'sanduni@example.com',
    serviceType: 'refund-request', status: 'rejected',
    submittedAt: '2026-07-19T15:35:00Z', kycStatus: 'rejected',
    address: '52, Galle Face Terrace, Colombo 03',
  },
  {
    id: 'app-018', referenceNumber: 'REQ-08392741', name: 'Rukshan Fernando',
    nic: '880123456V', phone: '0762345678', email: 'rukshan@example.com',
    serviceType: 'customer-request-acceptance', status: 'pending',
    submittedAt: '2026-07-31T09:05:00Z', kycStatus: 'pending',
    address: '33, Temple Lane, Kurunegala',
  },
  {
    id: 'app-019', referenceNumber: 'REQ-91028473', name: 'Anusha Bandaranayake',
    nic: '940234567V', phone: '0773456789', email: 'anusha@example.com',
    serviceType: 'customer-request-acceptance', status: 'approved',
    submittedAt: '2026-07-27T17:25:00Z', kycStatus: 'approved',
    address: '6, Beach Road, Mount Lavinia',
  },
  {
    id: 'app-020', referenceNumber: 'REQ-83741029', name: 'Chamari Liyanage',
    nic: '980345678V', phone: '0714567890', email: 'chamari@example.com',
    serviceType: 'new-connection', status: 'flagged',
    submittedAt: '2026-08-01T08:50:00Z', kycStatus: 'flagged',
    address: '101, Peradeniya Road, Kandy',
  },
  {
    id: 'app-021', referenceNumber: 'REQ-72910483', name: 'Dinesh Wijesinghe',
    nic: '990456789V', phone: '0755678901', email: 'dinesh@example.com',
    serviceType: 'package-migration', status: 'pending',
    submittedAt: '2026-07-29T12:30:00Z', kycStatus: 'pending',
    address: '15, Negombo Road, Ja-Ela',
  },
  {
    id: 'app-022', referenceNumber: 'REQ-61829374', name: 'Sampath Herath',
    nic: '860567890V', phone: '0706789012', email: 'sampath@example.com',
    serviceType: 'reconnection', status: 'approved',
    submittedAt: '2026-07-18T09:40:00Z', kycStatus: 'approved',
    address: '2, Station Road, Kegalle',
  },
];

// ── KYC Documents (dummy image URLs using placeholder service) ────────────────
export const DUMMY_KYC_QUEUE = [
  {
    id: 'kyc-001', appId: 'app-001', name: 'Kamal Bandara', nic: '980123456V',
    phone: '0771234567', submittedAt: '2026-07-18T09:12:00Z',
    docUrl: 'https://placehold.co/400x260/d9e2ef/0b2d5b?text=NIC+Front',
    selfieUrl: 'https://placehold.co/260x320/d9e2ef/0b2d5b?text=Face Validation',
    status: 'pending',
  },
  {
    id: 'kyc-002', appId: 'app-004', name: 'Dilani Wickramasinghe', nic: '920456789V',
    phone: '0769871234', submittedAt: '2026-07-16T08:50:00Z',
    docUrl: 'https://placehold.co/400x260/d9e2ef/0b2d5b?text=NIC+Front',
    selfieUrl: 'https://placehold.co/260x320/d9e2ef/0b2d5b?text=Face Validation',
    status: 'pending',
  },
  {
    id: 'kyc-003', appId: 'app-006', name: 'Priyanka Fernando', nic: '940123456V',
    phone: '0779870001', submittedAt: '2026-07-15T09:00:00Z',
    docUrl: 'https://placehold.co/400x260/d9e2ef/0b2d5b?text=Passport',
    selfieUrl: 'https://placehold.co/260x320/d9e2ef/0b2d5b?text=Face Validation',
    status: 'pending',
  },
  {
    id: 'kyc-004', appId: 'app-008', name: 'Amali Perera', nic: '960234501V',
    phone: '0778901234', submittedAt: '2026-07-20T07:30:00Z',
    docUrl: 'https://placehold.co/400x260/d9e2ef/0b2d5b?text=NIC+Front',
    selfieUrl: 'https://placehold.co/260x320/d9e2ef/0b2d5b?text=Face Validation',
    status: 'pending',
  },
];

// ── Technicians ───────────────────────────────────────────────────────────────
export const DUMMY_TECHNICIANS = [
  { id: 'tech-01', name: 'Nimal Rathnayake', zone: 'Colombo', jobsToday: 3 },
  { id: 'tech-02', name: 'Lasith Madushanka', zone: 'Kandy', jobsToday: 2 },
  { id: 'tech-03', name: 'Prasad Herath', zone: 'Gampaha', jobsToday: 4 },
  { id: 'tech-04', name: 'Roshan Gunawardena', zone: 'Galle', jobsToday: 1 },
];

// ── Appointments ─────────────────────────────────────────────────────────────
const today = new Date();
const d = (daysOffset, hour = 9, min = 0) => {
  const dt = new Date(today);
  dt.setDate(today.getDate() + daysOffset);
  dt.setHours(hour, min, 0, 0);
  return dt.toISOString();
};

export const DUMMY_APPOINTMENTS = [
  {
    id: 'apt-001', referenceNumber: 'REQ-10234871', customer: 'Kamal Bandara',
    address: '42, Galle Road, Colombo 03', phone: '0771234567',
    serviceType: 'new-connection', scheduledAt: d(0, 9, 0),
    technicianId: 'tech-01', technicianName: 'Nimal Rathnayake',
    status: 'scheduled', notes: 'FTTH installation — 3rd floor apartment',
  },
  {
    id: 'apt-002', referenceNumber: 'REQ-60823741', customer: 'Priyanka Fernando',
    address: '88, New Town Road, Jaffna', phone: '0779870001',
    serviceType: 'new-connection', scheduledAt: d(0, 11, 0),
    technicianId: null, technicianName: null,
    status: 'scheduled', notes: 'Awaiting technician assignment',
  },
  {
    id: 'apt-003', referenceNumber: 'REQ-70123456', customer: 'Suresh Kumar',
    address: '11, Kings Street, Kandy', phone: '0762345678',
    serviceType: 'location-change', scheduledAt: d(0, 14, 30),
    technicianId: 'tech-02', technicianName: 'Lasith Madushanka',
    status: 'in-progress', notes: 'Line re-routing required',
  },
  {
    id: 'apt-004', referenceNumber: 'REQ-40987362', customer: 'Dilani Wickramasinghe',
    address: '25, Station Road, Gampaha', phone: '0769871234',
    serviceType: 'package-migration', scheduledAt: d(1, 10, 0),
    technicianId: 'tech-03', technicianName: 'Prasad Herath',
    status: 'scheduled', notes: '',
  },
  {
    id: 'apt-005', referenceNumber: 'REQ-80312467', customer: 'Amali Perera',
    address: '5, Marine Drive, Galle', phone: '0778901234',
    serviceType: 'refund-request', scheduledAt: d(2, 9, 30),
    technicianId: 'tech-04', technicianName: 'Roshan Gunawardena',
    status: 'scheduled', notes: 'Customer available 9–12',
  },
  {
    id: 'apt-006', referenceNumber: 'REQ-20938471', customer: 'Nimali Jayawardena',
    address: '18, Kandy Road, Kurunegala', phone: '0712345678',
    serviceType: 'reconnection', scheduledAt: d(-1, 10, 0),
    technicianId: 'tech-01', technicianName: 'Nimal Rathnayake',
    status: 'completed', notes: 'Completed without issues',
  },
];

// ── Dashboard Summary Cards ───────────────────────────────────────────────────
export const DUMMY_SUMMARY = {
  totalForms: 248,
  completedForms: 180,
  pendingForms: 48,
  trends: {
    totalForms: '+12%',
    completedForms: '+8%',
    pendingForms: '-5',
  },
};

// ── Recent Activity Feed ──────────────────────────────────────────────────────
export const DUMMY_RECENT_ACTIVITY = [
  { id: 'ra-1', type: 'approved', message: 'REQ-20938471 approved by Saman Perera', time: '12 min ago' },
  { id: 'ra-2', type: 'flagged',  message: 'REQ-30112938 flagged — NIC mismatch detected', time: '34 min ago' },
  { id: 'ra-3', type: 'new',      message: 'New application REQ-80312467 submitted', time: '1 hr ago' },
  { id: 'ra-4', type: 'assigned', message: 'Appointment APT-004 assigned to Prasad Herath', time: '2 hr ago' },
  { id: 'ra-5', type: 'completed',message: 'Appointment APT-006 marked complete by Nimal Rathnayake', time: '3 hr ago' },
  { id: 'ra-6', type: 'rejected', message: 'REQ-50234109 rejected — ownership documents invalid', time: '5 hr ago' },
];

// ── Two-Week Form Submission Data ─────────────────────────────────────────────
function generateDailyData() {
  const days = [];
  const start = new Date('2026-07-17');
  for (let i = 13; i >= 0; i--) {
    const d = new Date(start);
    d.setDate(start.getDate() - i);
    const dateStr = d.toISOString().slice(0, 10);
    const day = d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
    days.push({
      date: dateStr,
      day,
      submitted: Math.floor(Math.random() * 6) + 1,
      completed: Math.floor(Math.random() * 4),
    });
  }
  return days;
}

export const DUMMY_FORM_WEEKLY = [
  { id: 'new-connection', label: 'New Connection', daily: generateDailyData() },
  { id: 'reconnection', label: 'Reconnection', daily: generateDailyData() },
  { id: 'relocation', label: 'Relocation', daily: generateDailyData() },
  { id: 'termination', label: 'Termination', daily: generateDailyData() },
  { id: 'transfer', label: 'Transfer', daily: generateDailyData() },
  { id: 'package-migration', label: 'Package Migration', daily: generateDailyData() },
  { id: 'service-vacation', label: 'Service Vacation', daily: generateDailyData() },
  { id: 'refund-request', label: 'Refund Request', daily: generateDailyData() },
  { id: 'customer-request-acceptance', label: 'Customer Request Acceptance', daily: generateDailyData() },
];

// ── Form Stats (for dashboard bar charts) ──────────────────────────────────────
export const DUMMY_FORM_STATS = [
  { id: 'new-connection', label: 'New Connection', total: 98, completed: 72 },
  { id: 'reconnection', label: 'Reconnection', total: 42, completed: 35 },
  { id: 'relocation', label: 'Relocation', total: 27, completed: 20 },
  { id: 'termination', label: 'Termination', total: 19, completed: 15 },
  { id: 'transfer', label: 'Transfer', total: 14, completed: 10 },
  { id: 'package-migration', label: 'Package Migration', total: 36, completed: 28 },
  { id: 'service-vacation', label: 'Service Vacation', total: 11, completed: 8 },
  { id: 'refund-request', label: 'Refund Request', total: 8, completed: 5 },
  { id: 'customer-request-acceptance', label: 'Customer Request Acceptance', total: 6, completed: 4 },
];

// ── Analytics ────────────────────────────────────────────────────────────────
export const DUMMY_ANALYTICS = {
  submissionRatio: { digital: 74, walkIn: 26 },
  conversionRate: 68,
  completionRate: 82,
  dropOffPoints: [
    { step: 'OTP Verification', dropOff: 12 },
    { step: 'Customer Info', dropOff: 8 },
    { step: 'Service Info', dropOff: 15 },
    { step: 'Package Selection', dropOff: 22 },
    { step: 'Value Added Services', dropOff: 7 },
    { step: 'Declaration', dropOff: 5 },
  ],
  byServiceType: [
    { service: 'New Connection', count: 98 },
    { service: 'Reconnection', count: 42 },
    { service: 'Package Migration', count: 36 },
    { service: 'Location Change', count: 27 },
    { service: 'Termination', count: 19 },
    { service: 'Ownership Change', count: 14 },
    { service: 'Refund Request', count: 8 },
    { service: 'Other', count: 4 },
  ],
  weeklyTrend: [
    { day: 'Mon', digital: 32, walkIn: 11 },
    { day: 'Tue', digital: 28, walkIn: 9 },
    { day: 'Wed', digital: 41, walkIn: 14 },
    { day: 'Thu', digital: 35, walkIn: 10 },
    { day: 'Fri', digital: 49, walkIn: 16 },
    { day: 'Sat', digital: 22, walkIn: 7 },
    { day: 'Sun', digital: 14, walkIn: 3 },
  ],
};


