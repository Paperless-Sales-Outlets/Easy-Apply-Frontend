import React, { useEffect, useState, useMemo, useRef } from 'react';
import AdminNotice, { useAdminNotice } from '../components/AdminNotice';
import { useAdminAuth } from '../context/AdminAuthContext';
import {
  getMyStatistics,
  getMyApplications,
  getMyQr,
  renderQrToCanvas,
  downloadBrandedQrPng,
} from '../../../services/salesOfficerService';
import { statusBadgeClass, statusLabel, formatDate } from '../utils/applicationUtils';
import QrCodeModal from '../components/QrCodeModal';

export default function SalesOfficerDashboardPage({ initialTab = 'overview' }) {
  const { admin } = useAdminAuth();
  const [stats, setStats] = useState(null);
  const [applications, setApplications] = useState([]);
  const [qrRecord, setQrRecord] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const notice = useAdminNotice(4500);
  const [downloading, setDownloading] = useState(false);
  const canvasRef = useRef(null);

  const officerEmployeeNumber =
    admin?.employeeNumber || admin?.employeeId || '095756';
  const officerName = admin?.name || 'Sales Officer';

  // Fetch all officer data strictly through the authenticated endpoints
  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [statsRes, appsRes, qrRes] = await Promise.all([
        getMyStatistics().catch((e) => {
          console.warn('Could not load statistics:', e);
          return { statistics: null };
        }),
        getMyApplications({ limit: 50 }).catch((e) => {
          console.warn('Could not load applications:', e);
          return { applications: [] };
        }),
        getMyQr().catch((e) => {
          console.warn('Could not load QR code:', e);
          return { qr: null };
        }),
      ]);

      setStats(statsRes.statistics || null);
      setApplications(appsRes.applications || []);
      setQrRecord(qrRes.qr || null);
    } catch (err) {
      console.error('Failed to load Sales Officer dashboard:', err);
      notice.error('Could not load your officer dashboard records');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  // Render QR canvas on card
  useEffect(() => {
    if (!canvasRef.current || !qrRecord?.qrUrl) return;
    renderQrToCanvas(canvasRef.current, qrRecord.qrUrl, {
      width: 170,
      margin: 1,
    });
  }, [qrRecord]);

  // Copy tracking link
  const handleCopyLink = async () => {
    if (!qrRecord?.qrUrl) return;
    try {
      await navigator.clipboard.writeText(qrRecord.qrUrl);
      setCopied(true);
      notice.success('Your tracking link was copied to clipboard!');
      setTimeout(() => setCopied(false), 2500);
    } catch {
      notice.error('Failed to copy to clipboard');
    }
  };

  // Download branded PNG
  const handleDownloadPng = async () => {
    if (!qrRecord?.qrUrl) return;
    setDownloading(true);
    try {
      await downloadBrandedQrPng({
        trackingUrl: qrRecord.qrUrl,
        employeeNumber: officerEmployeeNumber,
        officerName,
      });
      notice.success('Downloaded your official QR card!');
    } catch (err) {
      console.error('Download error:', err);
      notice.error('Failed to download QR card');
    } finally {
      setDownloading(false);
    }
  };

  // Filter applications
  const filteredApps = useMemo(() => {
    return applications.filter((app) => {
      const ref = String(app.referenceNumber || '').toLowerCase();
      const customer = String(app.customerName || '').toLowerCase();
      const query = searchQuery.trim().toLowerCase();

      const matchesQuery = !query || ref.includes(query) || customer.includes(query);
      const matchesStatus = statusFilter === 'all' || app.status === statusFilter;

      return matchesQuery && matchesStatus;
    });
  }, [applications, searchQuery, statusFilter]);

  // Derived metrics from stats or apps
  const totalApps = stats?.totalApplications ?? applications.length;
  const inProgress =
    stats?.inProgress ??
    applications.filter((a) => ['pending', 'pending payment'].includes(a.status)).length;
  const approved =
    stats?.approved ??
    applications.filter((a) => ['approved', 'confirmed', 'completed'].includes(a.status)).length;
  const rejected =
    stats?.rejected ??
    applications.filter((a) => ['rejected', 'flagged'].includes(a.status)).length;
  const completedSales =
    stats?.totalCompletedSales ??
    applications.filter((a) => a.isCompletedSale || a.completedSale).length;
  const conversionRate =
    stats?.completionRate ??
    (totalApps > 0 ? Number(((completedSales / totalApps) * 100).toFixed(1)) : 0);

  return (
    <div className="admin-page-content" style={{ padding: '0 0 3rem 0' }}>
      <AdminNotice notice={notice.notice} onDismiss={notice.dismiss} />
      {/* ── Officer Welcome Hero Banner ── */}
      <div
        style={{
          background: 'linear-gradient(135deg, #0b4a91 0%, #083366 50%, #00543c 100%)',
          borderRadius: '24px',
          padding: '2rem 2.25rem',
          color: '#ffffff',
          boxShadow: '0 12px 36px rgba(11, 45, 91, 0.15)',
          marginBottom: '2rem',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Subtle decorative circles */}
        <div
          style={{
            position: 'absolute',
            right: '-30px',
            top: '-30px',
            width: '220px',
            height: '220px',
            borderRadius: '50%',
            background: 'rgba(255, 255, 255, 0.05)',
            pointerEvents: 'none',
          }}
        />

        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1.5rem',
            position: 'relative',
            zIndex: 1,
          }}
        >
          <div>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '4px 12px',
                borderRadius: '999px',
                background: 'rgba(255, 255, 255, 0.15)',
                backdropFilter: 'blur(4px)',
                fontSize: '0.8rem',
                fontWeight: 700,
                color: '#86efac',
                marginBottom: '10px',
              }}
            >
              <span>⭐</span> Sales Officer Portal • Verified Account
            </div>
            <h1
              style={{
                fontSize: '2rem',
                fontWeight: 800,
                letterSpacing: '-0.025em',
                margin: '0 0 6px 0',
              }}
            >
              Welcome back, {officerName}
            </h1>
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                alignItems: 'center',
                gap: '1rem',
                fontSize: '0.9rem',
                color: 'rgba(255, 255, 255, 0.85)',
              }}
            >
              <div>
                <strong>Employee ID:</strong>{' '}
                <span
                  style={{
                    fontFamily: 'monospace',
                    fontWeight: 800,
                    background: 'rgba(255, 255, 255, 0.2)',
                    padding: '2px 8px',
                    borderRadius: '6px',
                    color: '#ffffff',
                  }}
                >
                  {officerEmployeeNumber}
                </span>
              </div>
              <span>•</span>
              <div>{admin?.email || 'sasindu@slt.com.lk'}</div>
              <span>•</span>
              <div>
                <span style={{ color: '#86efac', fontWeight: 600 }}>Role:</span> Sales Officer
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={loadDashboardData}
              style={{
                background: 'rgba(255, 255, 255, 0.15)',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                color: '#ffffff',
                borderRadius: '12px',
                padding: '10px 18px',
                fontWeight: 600,
                fontSize: '0.875rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <span>🔄</span> Refresh
            </button>
            <button
              type="button"
              onClick={() => setQrModalOpen(true)}
              style={{
                background: '#ffffff',
                border: 'none',
                color: '#0b4a91',
                borderRadius: '12px',
                padding: '10px 22px',
                fontWeight: 800,
                fontSize: '0.9rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 4px 14px rgba(0,0,0,0.15)',
              }}
            >
              <span>📱</span> View My QR Code
            </button>
          </div>
        </div>
      </div>

      {/* ── Top Grid: Metrics + My QR Quick Widget ── */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '1.25rem',
          marginBottom: '2rem',
        }}
      >
        {/* KPI: Total Applications */}
        <div
          style={{
            background: '#ffffff',
            borderRadius: '18px',
            padding: '1.5rem',
            border: '1px solid #e2e8f0',
            boxShadow: '0 4px 12px rgba(11, 45, 91, 0.05)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#64748b' }}>
              TOTAL APPLICATIONS
            </span>
            <span
              style={{
                background: '#eff6ff',
                color: '#1d4ed8',
                padding: '4px 10px',
                borderRadius: '8px',
                fontSize: '0.75rem',
                fontWeight: 700,
              }}
            >
              All Time
            </span>
          </div>
          <div style={{ margin: '14px 0 6px 0' }}>
            <div style={{ fontSize: '2.4rem', fontWeight: 800, color: '#0b4a91', lineHeight: 1 }}>
              {totalApps}
            </div>
            <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '6px' }}>
              Generated via your QR code
            </div>
          </div>
          <div
            style={{
              display: 'flex',
              gap: '12px',
              fontSize: '0.75rem',
              color: '#475569',
              borderTop: '1px solid #f1f5f9',
              paddingTop: '10px',
            }}
          >
            <div>
              <strong>{inProgress}</strong> in progress
            </div>
            <span>•</span>
            <div>
              <strong>{approved}</strong> approved
            </div>
          </div>
        </div>

        {/* KPI: Completed Sales */}
        <div
          style={{
            background: 'linear-gradient(135deg, #ffffff 0%, #f0fdf4 100%)',
            borderRadius: '18px',
            padding: '1.5rem',
            border: '1.5px solid #86efac',
            boxShadow: '0 4px 14px rgba(22, 163, 74, 0.08)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#166534' }}>
              COMPLETED SALES
            </span>
            <span
              style={{
                background: '#dcfce7',
                color: '#15803d',
                padding: '4px 10px',
                borderRadius: '8px',
                fontSize: '0.75rem',
                fontWeight: 700,
              }}
            >
              Verified
            </span>
          </div>
          <div style={{ margin: '14px 0 6px 0' }}>
            <div style={{ fontSize: '2.4rem', fontWeight: 800, color: '#15803d', lineHeight: 1 }}>
              {completedSales}
            </div>
            <div style={{ fontSize: '0.8rem', color: '#166534', marginTop: '6px' }}>
              Confirmed & installation verified
            </div>
          </div>
          <div
            style={{
              fontSize: '0.75rem',
              color: '#15803d',
              borderTop: '1px solid #bbf7d0',
              paddingTop: '10px',
            }}
          >
            Actual backend completion criteria enforced
          </div>
        </div>

        {/* KPI: Conversion Rate */}
        <div
          style={{
            background: '#ffffff',
            borderRadius: '18px',
            padding: '1.5rem',
            border: '1px solid #e2e8f0',
            boxShadow: '0 4px 12px rgba(11, 45, 91, 0.05)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#64748b' }}>
              CONVERSION RATE
            </span>
            <span
              style={{
                background: '#faf5ff',
                color: '#7e22ce',
                padding: '4px 10px',
                borderRadius: '8px',
                fontSize: '0.75rem',
                fontWeight: 700,
              }}
            >
              Sales / Apps
            </span>
          </div>
          <div style={{ margin: '14px 0 6px 0' }}>
            <div style={{ fontSize: '2.4rem', fontWeight: 800, color: '#7e22ce', lineHeight: 1 }}>
              {conversionRate}%
            </div>
            {/* Visual Progress Bar */}
            <div
              style={{
                width: '100%',
                height: '8px',
                background: '#f3e8ff',
                borderRadius: '999px',
                marginTop: '10px',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  width: `${Math.min(100, Math.max(0, conversionRate))}%`,
                  height: '100%',
                  background: 'linear-gradient(90deg, #9333ea, #7e22ce)',
                  borderRadius: '999px',
                  transition: 'width 0.5s ease',
                }}
              />
            </div>
          </div>
          <div
            style={{
              fontSize: '0.75rem',
              color: '#64748b',
              borderTop: '1px solid #f1f5f9',
              paddingTop: '10px',
            }}
          >
            {completedSales} sales from {totalApps} total leads
          </div>
        </div>

        {/* My QR Code Card */}
        <div
          style={{
            background: '#ffffff',
            borderRadius: '18px',
            padding: '1.25rem 1.5rem',
            border: '1px solid #e2e8f0',
            boxShadow: '0 4px 12px rgba(11, 45, 91, 0.05)',
            display: 'flex',
            alignItems: 'center',
            gap: '1.25rem',
          }}
        >
          <div
            style={{
              background: '#f8fafc',
              padding: '8px',
              borderRadius: '12px',
              border: '1px solid #e2e8f0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              minWidth: '130px',
              minHeight: '130px',
            }}
          >
            {qrRecord?.qrUrl ? (
              <canvas ref={canvasRef} style={{ width: '120px', height: '120px' }} />
            ) : (
              <div style={{ fontSize: '0.75rem', color: '#94a3b8', textAlign: 'center' }}>
                Loading QR...
              </div>
            )}
          </div>

          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div>
              <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#64748b', fontWeight: 700 }}>
                My Personal QR
              </div>
              <div style={{ fontSize: '1rem', fontWeight: 800, color: '#0b2d5b' }}>
                ID: {officerEmployeeNumber}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#16a34a', fontWeight: 600 }}>
                {qrRecord?.scansCount || 0} customer scans
              </div>
            </div>

            <div style={{ display: 'flex', gap: '6px' }}>
              <button
                type="button"
                onClick={handleCopyLink}
                style={{
                  background: copied ? '#10b981' : '#eff6ff',
                  color: copied ? '#ffffff' : '#1d4ed8',
                  border: '1px solid #bfdbfe',
                  borderRadius: '8px',
                  padding: '6px 12px',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                }}
              >
                {copied ? '✓ Copied' : '🔗 Copy'}
              </button>
              <button
                type="button"
                onClick={handleDownloadPng}
                disabled={downloading}
                style={{
                  background: 'linear-gradient(135deg, #0b4a91, #00543c)',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '6px 14px',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  cursor: downloading ? 'not-allowed' : 'pointer',
                  whiteSpace: 'nowrap',
                }}
              >
                {downloading ? '...' : '📥 PNG'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Status Breakdown Quick Pills ── */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
          gap: '0.75rem',
          marginBottom: '2rem',
        }}
      >
        <div style={{ background: '#f8fafc', padding: '12px 16px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
          <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>Pending</div>
          <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#d97706' }}>
            {stats?.byStatus?.pending ?? applications.filter((a) => a.status === 'pending').length}
          </div>
        </div>
        <div style={{ background: '#f8fafc', padding: '12px 16px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
          <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>Pending Payment</div>
          <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ca8a04' }}>
            {stats?.byStatus?.['pending payment'] ?? applications.filter((a) => a.status === 'pending payment').length}
          </div>
        </div>
        <div style={{ background: '#f8fafc', padding: '12px 16px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
          <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>Approved</div>
          <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#16a34a' }}>
            {stats?.byStatus?.approved ?? applications.filter((a) => a.status === 'approved').length}
          </div>
        </div>
        <div style={{ background: '#f8fafc', padding: '12px 16px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
          <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>Confirmed</div>
          <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0284c7' }}>
            {stats?.byStatus?.confirmed ?? applications.filter((a) => a.status === 'confirmed').length}
          </div>
        </div>
        <div style={{ background: '#f8fafc', padding: '12px 16px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
          <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>Rejected / Flagged</div>
          <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#dc2626' }}>
            {rejected}
          </div>
        </div>
      </div>

      {/* ── Attributed Applications Section ── */}
      <div
        style={{
          background: '#ffffff',
          borderRadius: '20px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 4px 16px rgba(11, 45, 91, 0.05)',
          overflow: 'hidden',
        }}
      >
        {/* Table Controls Header */}
        <div
          style={{
            padding: '1.5rem',
            borderBottom: '1px solid #e2e8f0',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
          }}
        >
          <div>
            <h2
              style={{
                fontSize: '1.25rem',
                fontWeight: 800,
                color: '#0f172a',
                margin: '0 0 4px 0',
              }}
            >
              My Attributed Applications
            </h2>
            <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b' }}>
              Showing records generated through your QR tracking link. Only your applications are visible.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <input
              type="text"
              placeholder="Search reference # or customer..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                padding: '8px 14px',
                borderRadius: '10px',
                border: '1.5px solid #cbd5e1',
                fontSize: '0.85rem',
                outline: 'none',
                minWidth: '220px',
              }}
            />

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{
                padding: '8px 12px',
                borderRadius: '10px',
                border: '1.5px solid #cbd5e1',
                fontSize: '0.85rem',
                color: '#334155',
                background: '#ffffff',
                cursor: 'pointer',
              }}
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="pending payment">Pending Payment</option>
              <option value="approved">Approved</option>
              <option value="confirmed">Confirmed</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>

        {/* Applications Table */}
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
            <thead>
              <tr
                style={{
                  background: '#f8fafc',
                  borderBottom: '1px solid #e2e8f0',
                  color: '#475569',
                  fontSize: '0.78rem',
                  textTransform: 'uppercase',
                  fontWeight: 700,
                  letterSpacing: '0.04em',
                }}
              >
                <th style={{ padding: '14px 20px' }}>Reference Number</th>
                <th style={{ padding: '14px 20px' }}>Customer Name</th>
                <th style={{ padding: '14px 20px' }}>Package / Service</th>
                <th style={{ padding: '14px 20px' }}>Submission Date</th>
                <th style={{ padding: '14px 20px' }}>Application Status</th>
                <th style={{ padding: '14px 20px' }}>Payment Status</th>
                <th style={{ padding: '14px 20px' }}>Sale Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} style={{ padding: '3.5rem', textAlign: 'center', color: '#64748b' }}>
                    <div className="admin-spinner" style={{ marginBottom: '10px' }} />
                    <div>Loading your attributed applications...</div>
                  </td>
                </tr>
              ) : filteredApps.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ padding: '3.5rem', textAlign: 'center', color: '#64748b' }}>
                    <div style={{ fontSize: '2rem', marginBottom: '8px' }}>📋</div>
                    <div style={{ fontWeight: 700, fontSize: '1rem', color: '#1e293b' }}>
                      No Applications Found
                    </div>
                    <div style={{ fontSize: '0.85rem', color: '#94a3b8', marginTop: '4px' }}>
                      {searchQuery || statusFilter !== 'all'
                        ? 'No applications match your search criteria.'
                        : 'Share your QR code with prospective customers to begin tracking new connection sales.'}
                    </div>
                  </td>
                </tr>
              ) : (
                filteredApps.map((app) => (
                  <tr
                    key={app.id || app.referenceNumber}
                    style={{ borderBottom: '1px solid #f1f5f9' }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = '#f8fafc')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                  >
                    {/* Reference # */}
                    <td style={{ padding: '16px 20px' }}>
                      <span
                        style={{
                          fontFamily: 'monospace',
                          fontWeight: 800,
                          color: '#0b4a91',
                          background: '#eff6ff',
                          padding: '3px 8px',
                          borderRadius: '6px',
                        }}
                      >
                        {app.referenceNumber}
                      </span>
                    </td>

                    {/* Customer */}
                    <td style={{ padding: '16px 20px' }}>
                      <div style={{ fontWeight: 700, color: '#0f172a' }}>
                        {app.customerName || 'Customer'}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                        {app.phone ? `Phone: ${app.phone.slice(-4).padStart(app.phone.length, '•')}` : ''}
                      </div>
                    </td>

                    {/* Service */}
                    <td style={{ padding: '16px 20px', color: '#334155' }}>
                      {app.packageName || 'New Connection'}
                    </td>

                    {/* Submitted Date */}
                    <td style={{ padding: '16px 20px', color: '#64748b' }}>
                      {formatDate(app.createdAt)}
                    </td>

                    {/* Status */}
                    <td style={{ padding: '16px 20px' }}>
                      <span className={statusBadgeClass(app.status)}>
                        {statusLabel(app.status)}
                      </span>
                    </td>

                    {/* Payment Status */}
                    <td style={{ padding: '16px 20px' }}>
                      {app.paymentStatus === 'paid' ? (
                        <span
                          style={{
                            background: '#ecfdf5',
                            color: '#065f46',
                            padding: '3px 8px',
                            borderRadius: '6px',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                          }}
                        >
                          ✓ Paid
                        </span>
                      ) : (
                        <span
                          style={{
                            background: '#fffbeb',
                            color: '#92400e',
                            padding: '3px 8px',
                            borderRadius: '6px',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                          }}
                        >
                          Pending
                        </span>
                      )}
                    </td>

                    {/* Sale Status */}
                    <td style={{ padding: '16px 20px' }}>
                      {app.isCompletedSale || app.completedSale ? (
                        <div style={{ display: 'inline-flex', flexDirection: 'column' }}>
                          <span
                            style={{
                              background: 'linear-gradient(135deg, #059669, #047857)',
                              color: '#ffffff',
                              padding: '3px 10px',
                              borderRadius: '8px',
                              fontSize: '0.75rem',
                              fontWeight: 700,
                              boxShadow: '0 2px 6px rgba(4, 120, 87, 0.2)',
                            }}
                          >
                            ✓ Completed Sale
                          </span>
                          {app.completedSaleAt && (
                            <span style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '3px' }}>
                              {formatDate(app.completedSaleAt)}
                            </span>
                          )}
                        </div>
                      ) : (
                        <span style={{ color: '#94a3b8', fontSize: '0.75rem' }}>
                          In Progress
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── QR Code Preview Modal ── */}
      <QrCodeModal
        isOpen={qrModalOpen}
        onClose={() => setQrModalOpen(false)}
        officer={{
          name: officerName,
          employeeNumber: officerEmployeeNumber,
          email: admin?.email,
          qr: qrRecord,
        }}
        onOfficerUpdated={(upd) => {
          if (upd.qr) setQrRecord(upd.qr);
        }}
      />
    </div>
  );
}
