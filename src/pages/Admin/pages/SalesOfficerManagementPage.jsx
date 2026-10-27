import React, { useEffect, useMemo, useState } from 'react';
import {
  getSalesOfficers,
  createOrGetOfficerQr,
  getOfficerStatistics,
  getOfficerApplications,
  downloadBrandedQrPng,
} from '../../../services/salesOfficerService';
import QrCodeModal from '../components/QrCodeModal';
import AddSalesOfficerModal from '../components/AddSalesOfficerModal';
import AdminNotice, { useAdminNotice } from '../components/AdminNotice';
import { AnimatedNumber, timeAgo } from '../components/AdminVisuals';
import { statusBadgeClass, statusLabel, formatDate, formatDateOnly } from '../utils/applicationUtils';

const ICON_QR = (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" /><rect x="3" y="14" width="7" height="7" rx="1.5" />
    <path d="M14 14h3v3h-3zM20 14v.01M14 20h.01M17 20h4v-3" />
  </svg>
);

const ICON_USERS = (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

const ICON_ACTIVE = (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
  </svg>
);

const ICON_SCAN = (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 7V5a2 2 0 0 1 2-2h2M17 3h2a2 2 0 0 1 2 2v2M21 17v2a2 2 0 0 1-2 2h-2M7 21H5a2 2 0 0 1-2-2v-2M7 12h10" />
  </svg>
);

const ICON_SEARCH = (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

const ICON_REFRESH = (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12a9 9 0 1 1-2.64-6.36" /><path d="M21 3v6h-6" />
  </svg>
);

const ICON_DOWNLOAD = (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><path d="m7 10 5 5 5-5" /><path d="M12 15V3" />
  </svg>
);

const ICON_CHART = (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 3v18h18" /><path d="M7 16v-5M12 16V8M17 16v-3" />
  </svg>
);

const ICON_PLUS = (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

const QR_VIEWS = [
  { key: 'all', label: 'All' },
  { key: 'generated', label: 'With QR' },
  { key: 'not_generated', label: 'No QR' },
];

// The same brand gradients User Management uses, picked from the officer's
// employee number so a person keeps one colour everywhere.
const AVATAR_GRADIENTS = [
  'linear-gradient(135deg, #0f57a8, #0b2d5b)',
  'linear-gradient(135deg, #50b748, #2f7f2a)',
  'linear-gradient(135deg, #2b7de9, #0a3f7e)',
  'linear-gradient(135deg, #0f7a4d, #004d38)',
  'linear-gradient(135deg, #3d6fb6, #1b3f75)',
];

function avatarGradient(key) {
  const text = String(key || '');
  let hash = 0;
  for (let i = 0; i < text.length; i += 1) hash = (hash * 31 + text.charCodeAt(i)) >>> 0;
  return AVATAR_GRADIENTS[hash % AVATAR_GRADIENTS.length];
}

const initials = (name) => (name || '').split(' ').filter(Boolean).map((n) => n[0]).slice(0, 2).join('').toUpperCase() || '?';

const officerKey = (officer) => officer.employeeNumber || officer.employeeId || officer.id;

// A small donut for the conversion rate in the statistics popup.
function Ring({ value, size = 112, stroke = 11 }) {
  const pct = Math.max(0, Math.min(100, Number(value) || 0));
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  return (
    <svg className="qrm-ring" width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img" aria-label={`${pct}% conversion`}>
      <defs>
        <linearGradient id="qrm-ring-grad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#7fdc76" />
          <stop offset="100%" stopColor="#0f57a8" />
        </linearGradient>
      </defs>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#e7eef8" strokeWidth={stroke} />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke="url(#qrm-ring-grad)"
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeDasharray={`${(pct / 100) * c} ${c}`}
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
      />
      <text x="50%" y="48%" textAnchor="middle" dominantBaseline="middle" className="qrm-ring-value">{pct}%</text>
      <text x="50%" y="66%" textAnchor="middle" dominantBaseline="middle" className="qrm-ring-label">converted</text>
    </svg>
  );
}

function OfficerStatsModal({ officer, stats, applications, loading, onClose }) {
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const total = stats?.totalApplications || 0;
  const inProgress = stats?.inProgress
    || (stats?.byStatus?.pending || 0) + (stats?.byStatus?.['pending payment'] || 0);
  const approved = stats?.approved
    || (stats?.byStatus?.approved || 0) + (stats?.byStatus?.confirmed || 0);
  const rejected = stats?.rejected
    || (stats?.byStatus?.rejected || 0) + (stats?.byStatus?.flagged || 0);
  const completed = stats?.totalCompletedSales || 0;
  const share = (n) => (total ? Math.round((n / total) * 100) : 0);

  const kpis = [
    { key: 'total', label: 'Applications', value: total, tone: 'navy', foot: 'Through this QR code' },
    { key: 'progress', label: 'In progress', value: inProgress, tone: 'blue', foot: `${share(inProgress)}% of applications` },
    { key: 'approved', label: 'Approved', value: approved, tone: 'green', foot: `${share(approved)}% of applications` },
    { key: 'rejected', label: 'Rejected / flagged', value: rejected, tone: 'red', foot: `${share(rejected)}% of applications` },
  ];

  return (
    <div className="admin-modal-overlay" onClick={onClose}>
      <div className="admin-modal ax-modal qrm-stats-modal" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-labelledby="qrm-stats-title">
        <div className="ax-modal-head">
          <span className="ax-modal-head-deco" aria-hidden="true" />
          <div className="ax-modal-identity">
            <span className="ax-modal-avatar" style={{ background: avatarGradient(officerKey(officer)) }}>{initials(officer.name)}</span>
            <div>
              <span className="ax-modal-eyebrow">Officer performance</span>
              <h3 id="qrm-stats-title">{officer.name}</h3>
              <div className="ax-modal-sub">
                <span className="ax-mono-chip">{officer.employeeNumber || '—'}</span>
                {officer.email && <span>{officer.email}</span>}
              </div>
            </div>
          </div>
          <button type="button" className="ax-modal-close" onClick={onClose} aria-label="Close">×</button>
        </div>

        <div className="ax-modal-body">
          {loading ? (
            <div className="qrm-stats-loading">
              <div className="qrm-stats-skel-row">
                {Array.from({ length: 4 }).map((_, i) => <span className="dash-skeleton qrm-stats-skel" key={i} />)}
              </div>
              <span className="dash-skeleton qrm-stats-skel-wide" />
            </div>
          ) : (
            <>
              <div className="qrm-stats-top">
                <div className="qrm-conversion">
                  <Ring value={stats?.completionRate ?? 0} />
                  <div className="qrm-conversion-text">
                    <span className="qrm-conversion-label">Completed sales</span>
                    <strong><AnimatedNumber value={completed} /></strong>
                    <small>of {total} application{total === 1 ? '' : 's'}</small>
                  </div>
                </div>
                <div className="qrm-kpis">
                  {kpis.map((kpi) => (
                    <div className={`qrm-kpi qrm-kpi--${kpi.tone}`} key={kpi.key}>
                      <span className="qrm-kpi-label">{kpi.label}</span>
                      <strong className="qrm-kpi-value"><AnimatedNumber value={kpi.value} /></strong>
                      <span className="qrm-kpi-foot">{kpi.foot}</span>
                    </div>
                  ))}
                </div>
              </div>

              {total > 0 && (
                <div className="qrm-funnel" aria-label="Application outcome split">
                  <span className="qrm-funnel-seg green" style={{ flexGrow: approved }} title={`Approved: ${approved}`} />
                  <span className="qrm-funnel-seg blue" style={{ flexGrow: inProgress }} title={`In progress: ${inProgress}`} />
                  <span className="qrm-funnel-seg red" style={{ flexGrow: rejected }} title={`Rejected / flagged: ${rejected}`} />
                </div>
              )}

              <div className="qrm-apps-head">
                <h4>Attributed applications</h4>
                <span className="ax-count">{applications.length}</span>
              </div>

              {applications.length === 0 ? (
                <div className="um-empty-state qrm-apps-empty">
                  <span className="um-empty-icon">{ICON_QR}</span>
                  <h3>No applications yet</h3>
                  <p>Applications started from this officer&apos;s QR code will appear here.</p>
                </div>
              ) : (
                <div className="qrm-apps-wrap">
                  <table className="admin-table qrm-apps-table">
                    <thead>
                      <tr>
                        <th>Reference</th>
                        <th>Customer</th>
                        <th>Submitted</th>
                        <th>Status</th>
                        <th>Sale</th>
                      </tr>
                    </thead>
                    <tbody>
                      {applications.map((app) => (
                        <tr key={app.id || app.referenceNumber}>
                          <td><span className="qrm-ref">{app.referenceNumber}</span></td>
                          <td>
                            <div className="qrm-app-customer">
                              <strong>{app.customerName || 'Customer'}</strong>
                              <small>{app.packageName || 'New Connection'}</small>
                            </div>
                          </td>
                          <td className="qrm-app-date">{formatDate(app.createdAt) || '—'}</td>
                          <td><span className={`admin-badge ${statusBadgeClass(app.status)}`}>{statusLabel(app.status)}</span></td>
                          <td>
                            {app.isCompletedSale
                              ? <span className="ax-chip ax-chip--good">Completed sale</span>
                              : <span className="ax-chip ax-chip--neutral">In progress</span>}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}
        </div>

        <div className="ax-modal-foot">
          <button type="button" className="admin-btn ghost" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}

export default function SalesOfficerManagementPage() {
  const [officers, setOfficers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // all | active | inactive
  const [qrFilter, setQrFilter] = useState('all'); // all | generated | not_generated

  // Modal states
  const [selectedOfficerForQr, setSelectedOfficerForQr] = useState(null);
  const [qrModalOpen, setQrModalOpen] = useState(false);

  // Officer Stats Detail Modal
  const [selectedOfficerForStats, setSelectedOfficerForStats] = useState(null);
  const [statsData, setStatsData] = useState(null);
  const [officerApps, setOfficerApps] = useState([]);
  const [statsLoading, setStatsLoading] = useState(false);
  const [generatingForId, setGeneratingForId] = useState(null);
  const [addOpen, setAddOpen] = useState(false);
  const notice = useAdminNotice(5000);

  // Load all sales officers
  const loadOfficers = async () => {
    setLoading(true);
    try {
      const data = await getSalesOfficers();
      const list = data.salesOfficers || [];
      setOfficers(list);
    } catch (err) {
      console.error('Error fetching sales officers:', err);
      notice.error(err.response?.data?.message || 'Failed to load sales officers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOfficers();
  }, []);

  // Filter officers based on search query and account status (the QR view is applied after, so its counts stay honest)
  const searchedOfficers = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return officers.filter((officer) => {
      const empId = String(officer.employeeNumber || officer.employeeId || '').toLowerCase();
      const name = String(officer.name || '').toLowerCase();
      const email = String(officer.email || '').toLowerCase();

      const matchesSearch =
        !query || empId.includes(query) || name.includes(query) || email.includes(query);

      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'active' && officer.isActive !== false) ||
        (statusFilter === 'inactive' && officer.isActive === false);

      return matchesSearch && matchesStatus;
    });
  }, [officers, searchQuery, statusFilter]);

  const qrCounts = useMemo(() => {
    const generated = searchedOfficers.filter((o) => o.qr?.hasQr === true).length;
    return { all: searchedOfficers.length, generated, not_generated: searchedOfficers.length - generated };
  }, [searchedOfficers]);

  const filteredOfficers = useMemo(() => searchedOfficers.filter((officer) => {
    const hasQr = officer.qr?.hasQr === true;
    return qrFilter === 'all' || (qrFilter === 'generated' && hasQr) || (qrFilter === 'not_generated' && !hasQr);
  }), [searchedOfficers, qrFilter]);

  // Summary Metrics
  const metrics = useMemo(() => {
    const total = officers.length;
    const active = officers.filter((o) => o.isActive !== false).length;
    const withQr = officers.filter((o) => o.qr?.hasQr).length;
    const totalScans = officers.reduce((sum, o) => sum + (o.qr?.scansCount || 0), 0);
    const maxScans = officers.reduce((max, o) => Math.max(max, o.qr?.scansCount || 0), 0);
    return { total, active, withQr, totalScans, maxScans };
  }, [officers]);

  const pct = (n, d) => (d ? Math.round((n / d) * 100) : 0);

  const heroTiles = [
    { key: 'total', cls: 'total', icon: ICON_USERS, label: 'Sales officers', value: metrics.total, foot: `${metrics.total - metrics.active} inactive` },
    { key: 'active', cls: 'active', icon: ICON_ACTIVE, label: 'Active accounts', value: metrics.active, meter: pct(metrics.active, metrics.total), foot: 'Ready for attribution' },
    { key: 'qr', cls: 'roles', icon: ICON_QR, label: 'QR codes generated', value: metrics.withQr, suffix: ` / ${metrics.total}`, meter: pct(metrics.withQr, metrics.total), foot: `${pct(metrics.withQr, metrics.total)}% coverage` },
    { key: 'scans', cls: 'scans', icon: ICON_SCAN, label: 'Total QR scans', value: metrics.totalScans, foot: 'Across every officer code' },
  ];

  const hasFilters = Boolean(searchQuery || statusFilter !== 'all' || qrFilter !== 'all');
  const clearFilters = () => {
    setSearchQuery('');
    setStatusFilter('all');
    setQrFilter('all');
  };

  // Open QR modal
  const handleViewQr = (officer) => {
    setSelectedOfficerForQr(officer);
    setQrModalOpen(true);
  };

  // Generate / Regenerate QR directly
  const handleGenerateQr = async (officer) => {
    const empId = officerKey(officer);
    setGeneratingForId(empId);
    try {
      const res = await createOrGetOfficerQr(empId, { regenerate: false });
      notice.success(`QR code ready for ${empId}.`);
      // Update local state
      setOfficers((prev) =>
        prev.map((o) =>
          o.employeeNumber === officer.employeeNumber || o.id === officer.id
            ? { ...o, qr: { hasQr: true, ...res.qr } }
            : o
        )
      );
      // Auto open modal
      setSelectedOfficerForQr({ ...officer, qr: { hasQr: true, ...res.qr } });
      setQrModalOpen(true);
    } catch (err) {
      console.error('Failed to generate QR:', err);
      notice.error(err.response?.data?.message || 'Could not generate QR code');
    } finally {
      setGeneratingForId(null);
    }
  };

  // Quick download PNG
  const handleQuickDownload = async (officer) => {
    if (!officer.qr?.qrUrl) {
      handleGenerateQr(officer);
      return;
    }
    try {
      await downloadBrandedQrPng({
        trackingUrl: officer.qr.qrUrl,
        employeeNumber: officer.employeeNumber,
        officerName: officer.name,
      });
      notice.success(`Downloaded the QR code for ${officer.employeeNumber}.`);
    } catch (err) {
      console.error('Download error:', err);
      notice.error('Failed to download QR code');
    }
  };

  // Open Performance Statistics Modal
  const handleViewStats = async (officer) => {
    setSelectedOfficerForStats(officer);
    setStatsLoading(true);
    setStatsData(null);
    setOfficerApps([]);
    try {
      const empId = officer.employeeNumber || officer.id;
      const [statsRes, appsRes] = await Promise.all([
        getOfficerStatistics(empId).catch(() => ({
          statistics: { totalApplications: 0, totalCompletedSales: 0, completionRate: 0 },
        })),
        getOfficerApplications(empId, { limit: 20 }).catch(() => ({
          applications: [],
        })),
      ]);
      setStatsData(statsRes.statistics || null);
      setOfficerApps(appsRes.applications || []);
    } catch (err) {
      console.error('Failed to fetch officer stats:', err);
      notice.error('Could not load officer statistics');
    } finally {
      setStatsLoading(false);
    }
  };

  // A new officer from the Add Sales Officer form — show it, and its QR when one was generated.
  const handleOfficerCreated = (officer, { qrError } = {}) => {
    setAddOpen(false);
    setOfficers((prev) => [officer, ...prev]);
    if (qrError) {
      notice.error(`${officer.name} (${officer.employeeNumber}) was created, but ${qrError}`);
    } else if (officer.qr?.hasQr) {
      notice.success(`${officer.name} (${officer.employeeNumber}) was created and their QR code is ready.`);
      setSelectedOfficerForQr(officer);
      setQrModalOpen(true);
    } else {
      notice.success(`${officer.name} (${officer.employeeNumber}) was created. Generate their QR code from the list.`);
    }
  };

  const handleOfficerUpdated = (updatedOfficer) => {
    setOfficers((prev) =>
      prev.map((o) =>
        o.employeeNumber === updatedOfficer.employeeNumber || o.id === updatedOfficer.id
          ? updatedOfficer
          : o
      )
    );
    setSelectedOfficerForQr(updatedOfficer);
  };

  return (
    <div className="um-page qrm-page">
      {/* ── Hero ── */}
      <section className="um-hero qrm-hero">
        <div className="um-hero-deco" aria-hidden="true">
          <span className="um-hero-orb" />
          <span className="um-hero-slash" />
          <span className="um-hero-grid" />
        </div>

        <div className="um-hero-top">
          <div className="um-hero-text">
            <span className="um-hero-eyebrow">{ICON_QR} QR referral tracking</span>
            <h1>QR Management</h1>
            <p>Give every sales officer a personal QR code, then follow the applications and completed sales it brings in.</p>
          </div>
          <div className="qrm-hero-actions">
            <button
              type="button"
              className={`qrm-refresh${loading ? ' is-spinning' : ''}`}
              onClick={loadOfficers}
              disabled={loading}
              aria-label="Refresh the officer list"
              title="Refresh"
            >
              {ICON_REFRESH}
            </button>
            <button type="button" className="um-hero-action" onClick={() => setAddOpen(true)}>
              <span className="um-hero-action-icon">{ICON_PLUS}</span>
              Add Sales Officer
            </button>
          </div>
        </div>

        <div className="um-hero-tiles">
          {heroTiles.map((tile, idx) => (
            <div className={`um-hero-tile ${tile.cls}`} key={tile.key} style={{ '--i': idx }}>
              <div className="um-hero-tile-head">
                <span className="um-hero-tile-icon">{tile.icon}</span>
                {tile.label}
              </div>
              <div className="um-hero-tile-value">
                {loading ? <span className="dash-skeleton um-hero-skeleton" /> : (
                  <>
                    <AnimatedNumber value={tile.value} />
                    {tile.suffix && <span className="qrm-tile-suffix">{tile.suffix}</span>}
                  </>
                )}
              </div>
              {tile.meter != null && (
                <div className="um-hero-meter" aria-hidden="true">
                  <span style={{ width: `${loading ? 0 : tile.meter}%` }} />
                </div>
              )}
              <div className="um-hero-tile-foot">{loading ? ' ' : tile.foot}</div>
            </div>
          ))}
        </div>
      </section>

      <AdminNotice notice={notice.notice} onDismiss={notice.dismiss} />

      {/* ── Officers ── */}
      <section className="um-panel qrm-panel">
        <div className="um-panel-head">
          <div className="um-panel-title">
            <h2>Sales officers</h2>
            <p>
              {loading
                ? 'Loading…'
                : `Showing ${filteredOfficers.length} of ${officers.length} officer${officers.length === 1 ? '' : 's'}`}
            </p>
          </div>
          <div className="um-toolbar">
            <div className="admin-search um-search">
              <span className="admin-search-icon">{ICON_SEARCH}</span>
              <input
                type="text"
                placeholder="Search employee no, name or email"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                aria-label="Search sales officers"
              />
            </div>
            <div className="ax-seg" role="group" aria-label="QR code status">
              {QR_VIEWS.map((view) => (
                <button
                  key={view.key}
                  type="button"
                  className={`ax-seg-btn${qrFilter === view.key ? ' active' : ''}`}
                  aria-pressed={qrFilter === view.key}
                  onClick={() => setQrFilter(view.key)}
                >
                  {view.label}
                  <span className="ax-seg-count">{qrCounts[view.key]}</span>
                </button>
              ))}
            </div>
            <select
              className="admin-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              aria-label="Account status"
            >
              <option value="all">All accounts</option>
              <option value="active">Active only</option>
              <option value="inactive">Inactive only</option>
            </select>
            {hasFilters && (
              <button type="button" className="admin-btn ghost ax-clear" onClick={clearFilters}>Clear</button>
            )}
          </div>
        </div>

        {loading ? (
          <div className="dash-table-skeleton">
            {Array.from({ length: 4 }).map((_, i) => <div className="dash-skeleton dash-skeleton-row" key={i} />)}
          </div>
        ) : filteredOfficers.length === 0 ? (
          <div className="um-empty-state">
            <span className="um-empty-icon">{ICON_USERS}</span>
            <h3>{officers.length === 0 ? 'No sales officers yet' : 'No matches'}</h3>
            <p>
              {officers.length === 0
                ? 'Use “Add Sales Officer” to create the first profile.'
                : searchQuery
                  ? `No officer matches “${searchQuery}”. Try a different keyword or filter.`
                  : 'No officer matches the selected filters.'}
            </p>
          </div>
        ) : (
          <div className="admin-table-wrap um-table-wrap">
            <table className="admin-table um-table qrm-table">
              <thead>
                <tr>
                  <th>Officer</th>
                  <th>Employee no.</th>
                  <th>Account</th>
                  <th>QR code</th>
                  <th>Scans</th>
                  <th className="qrm-actions-head">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredOfficers.map((officer) => {
                  const empId = officer.employeeNumber || officer.employeeId || 'N/A';
                  const hasQr = officer.qr?.hasQr === true;
                  const scans = officer.qr?.scansCount || 0;
                  const isBusy = generatingForId === officerKey(officer);
                  const active = officer.isActive !== false;

                  return (
                    <tr key={officer.id || officer._id || empId} className={active ? '' : 'is-inactive'}>
                      <td>
                        <div className="um-user-cell">
                          <div className="um-avatar" style={{ background: avatarGradient(officerKey(officer)) }}>
                            {initials(officer.name)}
                            <span className={`um-presence ${active ? 'on' : 'off'}`} aria-hidden="true" />
                          </div>
                          <div className="qrm-officer-text">
                            <span className="um-user-name">{officer.name}</span>
                            <span className="qrm-officer-email">{officer.email || 'No email on file'}</span>
                          </div>
                        </div>
                      </td>
                      <td><span className="um-employee-no">{empId}</span></td>
                      <td>
                        <span className={`ax-chip ${active ? 'ax-chip--good' : 'ax-chip--bad'}`}>
                          {active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td>
                        {hasQr ? (
                          <div className="qrm-qr-cell">
                            <span className="ax-chip ax-chip--info">{ICON_QR} Generated</span>
                            {officer.qr?.createdAt && (
                              <small>
                                {officer.qr.regeneratedAt ? 'Renewed' : 'Since'} {formatDateOnly(officer.qr.regeneratedAt || officer.qr.createdAt)}
                              </small>
                            )}
                          </div>
                        ) : (
                          <span className="ax-chip ax-chip--warn">Not generated</span>
                        )}
                      </td>
                      <td>
                        <div className="qrm-scans" title={officer.qr?.lastScannedAt ? `Last scanned ${timeAgo(officer.qr.lastScannedAt)}` : 'Never scanned'}>
                          <span className={`qrm-scans-value${scans ? '' : ' is-zero'}`}>{scans}</span>
                          <span className="qrm-scans-track" aria-hidden="true">
                            <span style={{ width: `${metrics.maxScans ? Math.max(scans ? 6 : 0, (scans / metrics.maxScans) * 100) : 0}%` }} />
                          </span>
                        </div>
                      </td>
                      <td>
                        <div className="um-row-actions qrm-row-actions">
                          {hasQr ? (
                            <>
                              <button
                                type="button"
                                className="um-action-btn edit"
                                onClick={() => handleViewQr(officer)}
                                aria-label={`View the QR code for ${officer.name}`}
                              >
                                {ICON_QR}
                                <span className="um-action-label">View QR</span>
                              </button>
                              <button
                                type="button"
                                className="um-action-btn ax-action--green"
                                onClick={() => handleQuickDownload(officer)}
                                aria-label={`Download the QR code for ${officer.name}`}
                              >
                                {ICON_DOWNLOAD}
                                <span className="um-action-label">PNG</span>
                              </button>
                            </>
                          ) : (
                            <button
                              type="button"
                              className="um-action-btn ax-action--green is-labelled"
                              onClick={() => handleGenerateQr(officer)}
                              disabled={isBusy}
                            >
                              {ICON_PLUS}
                              <span className="um-action-label">{isBusy ? 'Generating…' : 'Generate QR'}</span>
                            </button>
                          )}
                          <button
                            type="button"
                            className="um-action-btn ax-action--navy"
                            onClick={() => handleViewStats(officer)}
                            aria-label={`View statistics for ${officer.name}`}
                          >
                            {ICON_CHART}
                            <span className="um-action-label">Statistics</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* ── QR Code Preview Modal ── */}
      <QrCodeModal
        isOpen={qrModalOpen}
        onClose={() => setQrModalOpen(false)}
        officer={selectedOfficerForQr}
        onOfficerUpdated={handleOfficerUpdated}
      />

      {/* ── Add Sales Officer ── */}
      {addOpen && (
        <AddSalesOfficerModal
          officers={officers}
          onClose={() => setAddOpen(false)}
          onCreated={handleOfficerCreated}
        />
      )}

      {/* ── Officer Statistics & Attributed Applications ── */}
      {selectedOfficerForStats && (
        <OfficerStatsModal
          officer={selectedOfficerForStats}
          stats={statsData}
          applications={officerApps}
          loading={statsLoading}
          onClose={() => setSelectedOfficerForStats(null)}
        />
      )}
    </div>
  );
}
