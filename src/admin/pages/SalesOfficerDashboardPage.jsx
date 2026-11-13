import React, { useEffect, useState, useMemo, useRef, useCallback } from 'react';
import AdminNotice, { useAdminNotice } from '../components/AdminNotice';
import { AnimatedNumber } from '../components/AdminVisuals';
import { useAdminAuth } from '../context/AdminAuthContext';
import {
  getMyStatistics,
  getMyApplications,
  getMyQr,
  renderQrToCanvas,
  downloadBrandedQrPng,
} from '../services/salesOfficerService';
import { statusBadgeClass, statusLabel, formatDate } from '../utils/applicationUtils';
import QrCodeModal from '../components/QrCodeModal';

const STATUS_FILTERS = [
  { key: 'all', label: 'All statuses' },
  { key: 'pending', label: 'Pending' },
  { key: 'pending payment', label: 'Pending Payment' },
  { key: 'approved', label: 'Approved' },
  { key: 'confirmed', label: 'Confirmed' },
  { key: 'rejected', label: 'Rejected' },
  { key: 'flagged', label: 'Flagged' },
];

const BREAKDOWN = [
  { key: 'pending', label: 'Pending', color: '#eba834' },
  { key: 'pending payment', label: 'Pending Payment', color: '#f6cf7a' },
  { key: 'approved', label: 'Approved', color: '#50b748' },
  { key: 'confirmed', label: 'Confirmed', color: '#5aa9f0' },
  { key: 'rejected', label: 'Rejected', color: '#e0645a' },
  { key: 'flagged', label: 'Flagged', color: '#a98bf0' },
];

const ICONS = {
  badge: (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2 4 5v6c0 5 3.4 9.4 8 11 4.6-1.6 8-6 8-11V5l-8-3Z" /><path d="m9 12 2 2 4-4" />
    </svg>
  ),
  qr: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" /><rect x="3" y="14" width="7" height="7" rx="1.5" />
      <path d="M14 14h3v3h-3zM20 14v.01M14 20h.01M17 20h4v-3" />
    </svg>
  ),
  refresh: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12a9 9 0 1 1-2.64-6.36" /><path d="M21 3v6h-6" />
    </svg>
  ),
  file: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><path d="M14 2v6h6M16 13H8M16 17H8" />
    </svg>
  ),
  clock: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
    </svg>
  ),
  check: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  ),
  trend: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /><polyline points="17 6 23 6 23 12" />
    </svg>
  ),
  copy: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="9" y="9" width="13" height="13" rx="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  ),
  tick: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>,
  download: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><path d="m7 10 5 5 5-5" /><path d="M12 15V3" />
    </svg>
  ),
  search: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  ),
};

// Only the last four digits of a customer's phone are shown to the officer.
const maskPhone = (phone) => (phone ? `•••• ${String(phone).slice(-4)}` : '');

/** A sales officer's own QR code, and the applications it has brought in. */
export default function SalesOfficerDashboardPage() {
  const { admin } = useAdminAuth();
  const [stats, setStats] = useState(null);
  const [applications, setApplications] = useState([]);
  const [qrRecord, setQrRecord] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const notice = useAdminNotice(4500);
  const canvasRef = useRef(null);

  const officerEmployeeNumber = admin?.employeeNumber || admin?.employeeId || '';
  const officerName = admin?.name || 'Sales Officer';
  const firstName = officerName.split(' ')[0];

  // Everything comes from the officer's own authenticated endpoints.
  const loadDashboardData = useCallback(async ({ silent } = {}) => {
    if (silent) setRefreshing(true); else setLoading(true);
    const [statsRes, appsRes, qrRes] = await Promise.all([
      getMyStatistics().catch((e) => {
        notice.error(`Could not load your statistics: ${e.response?.data?.message || e.message}`);
        return { statistics: null };
      }),
      getMyApplications({ limit: 50 }).catch((e) => {
        notice.error(`Could not load your applications: ${e.response?.data?.message || e.message}`);
        return { applications: [] };
      }),
      getMyQr().catch(() => ({ qr: null })),
    ]);
    setStats(statsRes.statistics || null);
    setApplications(appsRes.applications || []);
    setQrRecord(qrRes.qr || null);
    setLoading(false);
    setRefreshing(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => { loadDashboardData(); }, [loadDashboardData]);

  useEffect(() => {
    if (!canvasRef.current || !qrRecord?.qrUrl) return;
    renderQrToCanvas(canvasRef.current, qrRecord.qrUrl, { width: 170, margin: 1 });
  }, [qrRecord]);

  const handleCopyLink = async () => {
    if (!qrRecord?.qrUrl) return;
    try {
      await navigator.clipboard.writeText(qrRecord.qrUrl);
      setCopied(true);
      notice.success('Your tracking link is copied.');
      setTimeout(() => setCopied(false), 2500);
    } catch {
      notice.error('Could not copy the link. Select it in the QR code window and copy it instead.');
    }
  };

  const handleDownloadPng = async () => {
    if (!qrRecord?.qrUrl) return;
    setDownloading(true);
    try {
      await downloadBrandedQrPng({ trackingUrl: qrRecord.qrUrl, employeeNumber: officerEmployeeNumber, officerName });
      notice.success('Your QR card is downloaded.');
    } catch {
      notice.error('Could not download your QR card.');
    } finally {
      setDownloading(false);
    }
  };

  const filteredApps = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return applications.filter((app) => {
      const matchesQuery = !query
        || String(app.referenceNumber || '').toLowerCase().includes(query)
        || String(app.customerName || '').toLowerCase().includes(query);
      return matchesQuery && (statusFilter === 'all' || app.status === statusFilter);
    });
  }, [applications, searchQuery, statusFilter]);

  const totalApps = stats?.totalApplications ?? applications.length;
  const inProgress = stats?.inProgress ?? applications.filter((a) => ['pending', 'pending payment'].includes(a.status)).length;
  const completedSales = stats?.totalCompletedSales ?? applications.filter((a) => a.isCompletedSale || a.completedSale).length;
  const conversionRate = stats?.completionRate ?? (totalApps > 0 ? Number(((completedSales / totalApps) * 100).toFixed(1)) : 0);
  const byStatus = (key) => stats?.byStatus?.[key] ?? applications.filter((a) => a.status === key).length;
  const breakdown = BREAKDOWN.map((s) => ({ ...s, count: byStatus(s.key) }));
  const breakdownTotal = breakdown.reduce((sum, s) => sum + s.count, 0);

  const tiles = [
    { key: 'apps', cls: 'total', icon: ICONS.file, label: 'Applications', value: totalApps, foot: 'Brought in by your QR code' },
    { key: 'progress', cls: 'collected', icon: ICONS.clock, label: 'In progress', value: inProgress, foot: 'Pending or awaiting payment' },
    { key: 'sales', cls: 'active', icon: ICONS.check, label: 'Completed sales', value: completedSales, foot: 'Confirmed and installed' },
    { key: 'rate', cls: 'roles', icon: ICONS.trend, label: 'Conversion', value: conversionRate, suffix: '%', meter: Math.min(100, Math.max(0, conversionRate)), foot: `${completedSales} of ${totalApps} became sales` },
  ];

  return (
    <div className="um-page sod-page">
      {/* ── Hero ── */}
      <section className="um-hero">
        <div className="um-hero-deco" aria-hidden="true">
          <span className="um-hero-orb" />
          <span className="um-hero-slash" />
          <span className="um-hero-grid" />
        </div>
        <div className="um-hero-top">
          <div className="um-hero-text">
            <span className="um-hero-eyebrow">{ICONS.badge} Sales Officer</span>
            <h1>Welcome back, {firstName}</h1>
            <p className="sod-identity">
              {officerEmployeeNumber && <span className="sod-emp">{officerEmployeeNumber}</span>}
              {admin?.email && <span>{admin.email}</span>}
            </p>
          </div>
          <div className="sod-hero-actions">
            <button
              type="button"
              className={`qrm-refresh${refreshing ? ' is-spinning' : ''}`}
              onClick={() => loadDashboardData({ silent: true })}
              disabled={loading || refreshing}
              aria-label="Refresh"
              title="Refresh"
            >
              {ICONS.refresh}
            </button>
            <button type="button" className="um-hero-action" onClick={() => setQrModalOpen(true)}>
              <span className="um-hero-action-icon">{ICONS.qr}</span>
              My QR Code
            </button>
          </div>
        </div>
        <div className="um-hero-tiles">
          {tiles.map((tile, idx) => (
            <div className={`um-hero-tile ${tile.cls}`} key={tile.key} style={{ '--i': idx }}>
              <div className="um-hero-tile-head">
                <span className="um-hero-tile-icon">{tile.icon}</span>
                {tile.label}
              </div>
              <div className="um-hero-tile-value">
                {loading ? <span className="dash-skeleton um-hero-skeleton" /> : <><AnimatedNumber value={tile.value} />{tile.suffix || ''}</>}
              </div>
              {tile.meter != null && (
                <div className="um-hero-meter" aria-hidden="true"><span style={{ width: `${loading ? 0 : tile.meter}%` }} /></div>
              )}
              <div className="um-hero-tile-foot">{loading ? ' ' : tile.foot}</div>
            </div>
          ))}
        </div>
      </section>

      <AdminNotice notice={notice.notice} onDismiss={notice.dismiss} />

      {/* ── QR card + status breakdown ── */}
      <div className="sod-grid">
        <section className="um-panel sod-qr">
          <div className="sod-qr-frame">
            {qrRecord?.qrUrl
              ? <canvas ref={canvasRef} className="sod-qr-canvas" aria-label="Your QR code" />
              : <span className="dash-skeleton sod-qr-skeleton" aria-label={loading ? 'Loading your QR code' : 'QR code unavailable'} />}
          </div>
          <div className="sod-qr-body">
            <span className="sod-kicker">Your personal QR code</span>
            <h2>Share it with customers</h2>
            <p>Customers who scan it open the New Connection form, and their application is credited to you.</p>
            <div className="sod-qr-actions">
              <button type="button" className={`admin-btn ghost sod-copy${copied ? ' is-copied' : ''}`} onClick={handleCopyLink} disabled={!qrRecord?.qrUrl}>
                {copied ? ICONS.tick : ICONS.copy}{copied ? 'Copied' : 'Copy link'}
              </button>
              <button type="button" className="admin-btn primary" onClick={handleDownloadPng} disabled={!qrRecord?.qrUrl || downloading} aria-busy={downloading}>
                {ICONS.download}{downloading ? 'Preparing…' : 'Download card'}
              </button>
            </div>
          </div>
        </section>

        <section className="um-panel sod-breakdown">
          <div className="sod-breakdown-head">
            <h2>Where your applications stand</h2>
            <span>{breakdownTotal} total</span>
          </div>
          <div className="sod-bar" role="img" aria-label="Applications by status">
            {breakdownTotal > 0
              ? breakdown.filter((s) => s.count).map((s) => (
                <span key={s.key} style={{ flexGrow: s.count, background: s.color }} title={`${s.label}: ${s.count}`} />
              ))
              : <span className="is-empty" />}
          </div>
          <ul className="sod-legend">
            {breakdown.map((s) => (
              <li key={s.key} className={s.count ? '' : 'is-zero'}>
                <i style={{ background: s.color }} aria-hidden="true" />
                <span>{s.label}</span>
                <strong>{loading ? '–' : s.count}</strong>
              </li>
            ))}
          </ul>
        </section>
      </div>

      {/* ── Applications ── */}
      <section className="um-panel">
        <div className="um-panel-head">
          <div className="um-panel-title">
            <h2>My applications</h2>
            <p>{loading ? 'Loading…' : `Showing ${filteredApps.length} of ${applications.length}. Only applications from your QR code are listed.`}</p>
          </div>
          <div className="um-toolbar">
            <div className="admin-search um-search">
              <span className="admin-search-icon">{ICONS.search}</span>
              <input type="text" placeholder="Search reference or customer" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
            </div>
            <select className="admin-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} aria-label="Filter by status">
              {STATUS_FILTERS.map((f) => <option key={f.key} value={f.key}>{f.label}</option>)}
            </select>
          </div>
        </div>

        {loading ? (
          <div className="dash-table-skeleton">
            {Array.from({ length: 4 }).map((_, i) => <div className="dash-skeleton dash-skeleton-row" key={i} />)}
          </div>
        ) : filteredApps.length === 0 ? (
          <div className="um-empty-state">
            <span className="um-empty-icon">{ICONS.file}</span>
            <h3>{applications.length ? 'No matches' : 'No applications yet'}</h3>
            <p>
              {applications.length
                ? 'Try a different search or status.'
                : 'Share your QR code with customers. Their applications will appear here.'}
            </p>
          </div>
        ) : (
          <div className="admin-table-wrap um-table-wrap">
            <table className="admin-table um-table">
              <thead>
                <tr>
                  <th>Reference</th>
                  <th>Customer</th>
                  <th>Package</th>
                  <th>Submitted</th>
                  <th>Status</th>
                  <th>Payment</th>
                  <th>Sale</th>
                </tr>
              </thead>
              <tbody>
                {filteredApps.map((app) => {
                  const sold = app.isCompletedSale || app.completedSale;
                  return (
                    <tr key={app.id || app.referenceNumber}>
                      <td><span className="apx-ref">{app.referenceNumber}</span></td>
                      <td>
                        <div className="sod-customer">
                          <span className="um-user-name">{app.customerName || 'Customer'}</span>
                          {app.phone && <small>{maskPhone(app.phone)}</small>}
                        </div>
                      </td>
                      <td>{app.packageName || 'New Connection'}</td>
                      <td className="dash-muted-cell">{formatDate(app.createdAt)}</td>
                      <td><span className={`admin-badge ${statusBadgeClass(app.status)}`}>{statusLabel(app.status)}</span></td>
                      <td>
                        <span className={`ax-chip ${app.paymentStatus === 'paid' ? 'ax-chip--good' : 'ax-chip--warn'}`}>
                          {app.paymentStatus === 'paid' ? 'Paid' : 'Pending'}
                        </span>
                      </td>
                      <td>
                        {sold ? (
                          <div className="sod-sale">
                            <span className="ax-chip ax-chip--good">Completed</span>
                            {app.completedSaleAt && <small>{formatDate(app.completedSaleAt)}</small>}
                          </div>
                        ) : <span className="sod-muted">Not yet</span>}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <QrCodeModal
        ownQr
        isOpen={qrModalOpen}
        onClose={() => setQrModalOpen(false)}
        officer={{ name: officerName, employeeNumber: officerEmployeeNumber, email: admin?.email, qr: qrRecord }}
        onOfficerUpdated={(upd) => { if (upd.qr) setQrRecord(upd.qr); }}
      />
    </div>
  );
}
