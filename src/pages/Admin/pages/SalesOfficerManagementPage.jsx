import React, { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import {
  getSalesOfficers,
  createOrGetOfficerQr,
  getOfficerStatistics,
  getOfficerApplications,
  downloadBrandedQrPng,
} from '../../../services/salesOfficerService';
import QrCodeModal from '../components/QrCodeModal';
import { statusBadgeClass, statusLabel, formatDate } from '../utils/applicationUtils';

export default function SalesOfficerManagementPage({ onNavigateToOfficerDashboard }) {
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

  // Load all sales officers
  const loadOfficers = async () => {
    setLoading(true);
    try {
      const data = await getSalesOfficers();
      const list = data.salesOfficers || [];
      setOfficers(list);
    } catch (err) {
      console.error('Error fetching sales officers:', err);
      toast.error(err.response?.data?.message || 'Failed to load sales officers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOfficers();
  }, []);

  // Filter officers based on search query, account status, and QR status
  const filteredOfficers = useMemo(() => {
    return officers.filter((officer) => {
      const empId = String(officer.employeeNumber || officer.employeeId || '').toLowerCase();
      const name = String(officer.name || '').toLowerCase();
      const email = String(officer.email || '').toLowerCase();
      const query = searchQuery.trim().toLowerCase();

      const matchesSearch =
        !query || empId.includes(query) || name.includes(query) || email.includes(query);

      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'active' && officer.isActive !== false) ||
        (statusFilter === 'inactive' && officer.isActive === false);

      const hasQr = officer.qr?.hasQr === true;
      const matchesQr =
        qrFilter === 'all' ||
        (qrFilter === 'generated' && hasQr) ||
        (qrFilter === 'not_generated' && !hasQr);

      return matchesSearch && matchesStatus && matchesQr;
    });
  }, [officers, searchQuery, statusFilter, qrFilter]);

  // Summary Metrics
  const metrics = useMemo(() => {
    const total = officers.length;
    const active = officers.filter((o) => o.isActive !== false).length;
    const withQr = officers.filter((o) => o.qr?.hasQr).length;
    const totalScans = officers.reduce((sum, o) => sum + (o.qr?.scansCount || 0), 0);
    return { total, active, withQr, totalScans };
  }, [officers]);

  // Open QR modal
  const handleViewQr = (officer) => {
    setSelectedOfficerForQr(officer);
    setQrModalOpen(true);
  };

  // Generate / Regenerate QR directly
  const handleGenerateQr = async (officer) => {
    const empId = officer.employeeNumber || officer.employeeId || officer.id;
    setGeneratingForId(empId);
    try {
      const res = await createOrGetOfficerQr(empId, { regenerate: false });
      toast.success(`QR code ready for ${empId}!`);
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
      toast.error(err.response?.data?.message || 'Could not generate QR code');
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
      toast.success(`Downloaded QR code for ${officer.employeeNumber}!`);
    } catch (err) {
      console.error('Download error:', err);
      toast.error('Failed to download QR code');
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
        getOfficerStatistics(empId).catch((e) => ({
          statistics: { totalApplications: 0, totalCompletedSales: 0, completionRate: 0 },
        })),
        getOfficerApplications(empId, { limit: 20 }).catch((e) => ({
          applications: [],
        })),
      ]);
      setStatsData(statsRes.statistics || null);
      setOfficerApps(appsRes.applications || []);
    } catch (err) {
      console.error('Failed to fetch officer stats:', err);
      toast.error('Could not load officer statistics');
    } finally {
      setStatsLoading(false);
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
    <div className="admin-page-content" style={{ padding: '0 0 3rem 0' }}>
      {/* ── Page Header ── */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
          marginBottom: '2rem',
        }}
      >
        <div>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '4px 12px',
              borderRadius: '999px',
              background: '#eff6ff',
              color: '#1d4ed8',
              fontSize: '0.8rem',
              fontWeight: 700,
              marginBottom: '8px',
            }}
          >
            <span>🎯</span> QR Referral Tracking System
          </div>
          <h1
            style={{
              fontSize: '1.9rem',
              fontWeight: 800,
              color: '#0f172a',
              letterSpacing: '-0.025em',
              margin: '0 0 6px 0',
            }}
          >
            Sales Officer Management
          </h1>
          <p style={{ margin: 0, color: '#64748b', fontSize: '0.95rem' }}>
            Monitor sales officers, generate unique QR tracking codes, and track customer
            applications and completed sales.
          </p>
        </div>

        <button
          type="button"
          onClick={loadOfficers}
          style={{
            background: '#ffffff',
            border: '1.5px solid #cbd5e1',
            borderRadius: '12px',
            padding: '10px 18px',
            fontWeight: 600,
            color: '#334155',
            fontSize: '0.875rem',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            cursor: 'pointer',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
          }}
        >
          <span>🔄</span> Refresh
        </button>
      </div>

      {/* ── KPI Metric Cards ── */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1rem',
          marginBottom: '2rem',
        }}
      >
        <div
          style={{
            background: '#ffffff',
            borderRadius: '16px',
            padding: '1.25rem 1.5rem',
            border: '1px solid #e2e8f0',
            boxShadow: '0 4px 12px rgba(11, 45, 91, 0.04)',
          }}
        >
          <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#64748b' }}>
            Total Sales Officers
          </div>
          <div
            style={{
              fontSize: '1.85rem',
              fontWeight: 800,
              color: '#0b4a91',
              marginTop: '4px',
            }}
          >
            {metrics.total}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '4px' }}>
            Registered in system
          </div>
        </div>

        <div
          style={{
            background: '#ffffff',
            borderRadius: '16px',
            padding: '1.25rem 1.5rem',
            border: '1px solid #e2e8f0',
            boxShadow: '0 4px 12px rgba(11, 45, 91, 0.04)',
          }}
        >
          <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#64748b' }}>
            Active Accounts
          </div>
          <div
            style={{
              fontSize: '1.85rem',
              fontWeight: 800,
              color: '#15803d',
              marginTop: '4px',
            }}
          >
            {metrics.active}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#16a34a', marginTop: '4px' }}>
            Ready for attribution
          </div>
        </div>

        <div
          style={{
            background: '#ffffff',
            borderRadius: '16px',
            padding: '1.25rem 1.5rem',
            border: '1px solid #e2e8f0',
            boxShadow: '0 4px 12px rgba(11, 45, 91, 0.04)',
          }}
        >
          <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#64748b' }}>
            QR Codes Generated
          </div>
          <div
            style={{
              fontSize: '1.85rem',
              fontWeight: 800,
              color: '#0284c7',
              marginTop: '4px',
            }}
          >
            {metrics.withQr} / {metrics.total}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '4px' }}>
            {metrics.total > 0
              ? `${Math.round((metrics.withQr / metrics.total) * 100)}% coverage`
              : '0% coverage'}
          </div>
        </div>

        <div
          style={{
            background: '#ffffff',
            borderRadius: '16px',
            padding: '1.25rem 1.5rem',
            border: '1px solid #e2e8f0',
            boxShadow: '0 4px 12px rgba(11, 45, 91, 0.04)',
          }}
        >
          <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#64748b' }}>
            Total QR Scans
          </div>
          <div
            style={{
              fontSize: '1.85rem',
              fontWeight: 800,
              color: '#7c3aed',
              marginTop: '4px',
            }}
          >
            {metrics.totalScans}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '4px' }}>
            Customer portal impressions
          </div>
        </div>
      </div>

      {/* ── Search & Filter Controls ── */}
      <div
        style={{
          background: '#ffffff',
          borderRadius: '18px',
          padding: '1.25rem 1.5rem',
          border: '1px solid #e2e8f0',
          boxShadow: '0 4px 12px rgba(11, 45, 91, 0.04)',
          marginBottom: '1.5rem',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '1rem',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ flex: '1 1 300px', maxWidth: '460px', position: 'relative' }}>
          <span
            style={{
              position: 'absolute',
              left: '14px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: '#94a3b8',
              fontSize: '1rem',
            }}
          >
            🔍
          </span>
          <input
            type="text"
            placeholder="Search by Employee ID (e.g. 095756), name, or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '10px 14px 10px 40px',
              borderRadius: '12px',
              border: '1.5px solid #cbd5e1',
              fontSize: '0.9rem',
              color: '#1e293b',
              outline: 'none',
              background: '#f8fafc',
            }}
          />
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', alignItems: 'center' }}>
          {/* Account Status Filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#64748b' }}>Status:</span>
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
              <option value="all">All Accounts</option>
              <option value="active">Active Only</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          {/* QR Status Filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#64748b' }}>QR Status:</span>
            <select
              value={qrFilter}
              onChange={(e) => setQrFilter(e.target.value)}
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
              <option value="all">All QR Codes</option>
              <option value="generated">QR Generated</option>
              <option value="not_generated">No QR Code</option>
            </select>
          </div>
        </div>
      </div>

      {/* ── Sales Officers Table ── */}
      <div
        style={{
          background: '#ffffff',
          borderRadius: '18px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 4px 16px rgba(11, 45, 91, 0.05)',
          overflow: 'hidden',
        }}
      >
        <div style={{ overflowX: 'auto' }}>
          <table
            style={{
              width: '100%',
              borderCollapse: 'collapse',
              textAlign: 'left',
              fontSize: '0.9rem',
            }}
          >
            <thead>
              <tr
                style={{
                  background: '#f8fafc',
                  borderBottom: '1px solid #e2e8f0',
                  color: '#475569',
                  fontSize: '0.78rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  fontWeight: 700,
                }}
              >
                <th style={{ padding: '14px 20px' }}>Employee ID</th>
                <th style={{ padding: '14px 20px' }}>Officer Name</th>
                <th style={{ padding: '14px 20px' }}>Email</th>
                <th style={{ padding: '14px 20px' }}>Account Status</th>
                <th style={{ padding: '14px 20px' }}>QR Code Status</th>
                <th style={{ padding: '14px 20px', textAlign: 'center' }}>Scans</th>
                <th style={{ padding: '14px 20px', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} style={{ padding: '3.5rem', textAlign: 'center', color: '#64748b' }}>
                    <div style={{ display: 'inline-block', marginBottom: '8px' }}>
                      <div className="admin-spinner" />
                    </div>
                    <div>Loading registered sales officers...</div>
                  </td>
                </tr>
              ) : filteredOfficers.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ padding: '3.5rem', textAlign: 'center', color: '#64748b' }}>
                    <div style={{ fontSize: '2rem', marginBottom: '8px' }}>👤</div>
                    <div style={{ fontWeight: 700, fontSize: '1rem', color: '#1e293b' }}>
                      No Sales Officers Found
                    </div>
                    <div style={{ fontSize: '0.85rem', color: '#94a3b8', marginTop: '4px' }}>
                      {searchQuery
                        ? `No officer matches "${searchQuery}". Try a different keyword.`
                        : 'No sales officer accounts are registered under this filter.'}
                    </div>
                  </td>
                </tr>
              ) : (
                filteredOfficers.map((officer) => {
                  const empId = officer.employeeNumber || officer.employeeId || 'N/A';
                  const hasQr = officer.qr?.hasQr === true;
                  const scans = officer.qr?.scansCount || 0;
                  const isBusy = generatingForId === empId;

                  return (
                    <tr
                      key={officer.id || officer._id || empId}
                      style={{
                        borderBottom: '1px solid #f1f5f9',
                        transition: 'background 0.15s',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = '#f8fafc')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                    >
                      {/* Employee ID */}
                      <td style={{ padding: '16px 20px' }}>
                        <span
                          style={{
                            background: '#eff6ff',
                            color: '#1d4ed8',
                            fontFamily: 'monospace',
                            fontWeight: 800,
                            padding: '4px 10px',
                            borderRadius: '8px',
                            border: '1px solid #bfdbfe',
                            fontSize: '0.88rem',
                          }}
                        >
                          {empId}
                        </span>
                      </td>

                      {/* Officer Name */}
                      <td style={{ padding: '16px 20px' }}>
                        <div style={{ fontWeight: 700, color: '#0f172a' }}>{officer.name}</div>
                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{officer.role}</div>
                      </td>

                      {/* Email */}
                      <td style={{ padding: '16px 20px', color: '#475569' }}>
                        {officer.email || '—'}
                      </td>

                      {/* Account Status */}
                      <td style={{ padding: '16px 20px' }}>
                        {officer.isActive !== false ? (
                          <span
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '5px',
                              background: '#ecfdf5',
                              color: '#065f46',
                              padding: '3px 10px',
                              borderRadius: '999px',
                              fontSize: '0.75rem',
                              fontWeight: 700,
                            }}
                          >
                            <span
                              style={{
                                width: '6px',
                                height: '6px',
                                borderRadius: '50%',
                                background: '#10b981',
                              }}
                            />
                            Active
                          </span>
                        ) : (
                          <span
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '5px',
                              background: '#fef2f2',
                              color: '#991b1b',
                              padding: '3px 10px',
                              borderRadius: '999px',
                              fontSize: '0.75rem',
                              fontWeight: 700,
                            }}
                          >
                            <span
                              style={{
                                width: '6px',
                                height: '6px',
                                borderRadius: '50%',
                                background: '#ef4444',
                              }}
                            />
                            Inactive
                          </span>
                        )}
                      </td>

                      {/* QR Status */}
                      <td style={{ padding: '16px 20px' }}>
                        {hasQr ? (
                          <span
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '5px',
                              background: '#eff6ff',
                              color: '#1e40af',
                              padding: '3px 10px',
                              borderRadius: '999px',
                              fontSize: '0.75rem',
                              fontWeight: 700,
                            }}
                          >
                            <span>✓</span> Generated
                          </span>
                        ) : (
                          <span
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '5px',
                              background: '#fffbeb',
                              color: '#92400e',
                              padding: '3px 10px',
                              borderRadius: '999px',
                              fontSize: '0.75rem',
                              fontWeight: 700,
                            }}
                          >
                            <span>•</span> Not Generated
                          </span>
                        )}
                      </td>

                      {/* Scans Count */}
                      <td style={{ padding: '16px 20px', textAlign: 'center' }}>
                        <span style={{ fontWeight: 700, color: scans > 0 ? '#0b4a91' : '#94a3b8' }}>
                          {scans}
                        </span>
                      </td>

                      {/* Actions */}
                      <td style={{ padding: '16px 20px', textAlign: 'right' }}>
                        <div
                          style={{
                            display: 'inline-flex',
                            gap: '6px',
                            alignItems: 'center',
                          }}
                        >
                          {/* View QR Code */}
                          {hasQr ? (
                            <>
                              <button
                                type="button"
                                onClick={() => handleViewQr(officer)}
                                title="Preview QR code and copy link"
                                style={{
                                  background: '#eff6ff',
                                  border: '1px solid #bfdbfe',
                                  color: '#1d4ed8',
                                  borderRadius: '8px',
                                  padding: '6px 12px',
                                  fontSize: '0.8rem',
                                  fontWeight: 600,
                                  cursor: 'pointer',
                                }}
                              >
                                View QR
                              </button>
                              <button
                                type="button"
                                onClick={() => handleQuickDownload(officer)}
                                title="Download PNG"
                                style={{
                                  background: '#f8fafc',
                                  border: '1px solid #cbd5e1',
                                  color: '#334155',
                                  borderRadius: '8px',
                                  padding: '6px 10px',
                                  fontSize: '0.8rem',
                                  fontWeight: 600,
                                  cursor: 'pointer',
                                }}
                              >
                                📥 PNG
                              </button>
                            </>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleGenerateQr(officer)}
                              disabled={isBusy}
                              style={{
                                background: 'linear-gradient(135deg, #0b4a91, #00543c)',
                                border: 'none',
                                color: '#ffffff',
                                borderRadius: '8px',
                                padding: '6px 12px',
                                fontSize: '0.8rem',
                                fontWeight: 700,
                                cursor: isBusy ? 'not-allowed' : 'pointer',
                              }}
                            >
                              {isBusy ? 'Generating...' : '+ Generate QR'}
                            </button>
                          )}

                          {/* View Performance Statistics */}
                          <button
                            type="button"
                            onClick={() => handleViewStats(officer)}
                            title="View officer application & sales statistics"
                            style={{
                              background: '#f8fafc',
                              border: '1px solid #cbd5e1',
                              color: '#0f172a',
                              borderRadius: '8px',
                              padding: '6px 12px',
                              fontSize: '0.8rem',
                              fontWeight: 600,
                              cursor: 'pointer',
                            }}
                          >
                            📊 Statistics
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── QR Code Preview Modal ── */}
      <QrCodeModal
        isOpen={qrModalOpen}
        onClose={() => setQrModalOpen(false)}
        officer={selectedOfficerForQr}
        onOfficerUpdated={handleOfficerUpdated}
      />

      {/* ── Officer Statistics & Attributed Applications Modal ── */}
      {selectedOfficerForStats && (
        <div
          className="admin-modal-overlay"
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(11, 45, 91, 0.55)',
            backdropFilter: 'blur(5px)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1.25rem',
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setSelectedOfficerForStats(null);
          }}
        >
          <div
            style={{
              background: '#ffffff',
              borderRadius: '24px',
              width: '100%',
              maxWidth: '820px',
              boxShadow: '0 25px 60px -15px rgba(11, 45, 91, 0.35)',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              maxHeight: '90vh',
            }}
          >
            {/* Modal Header */}
            <div
              style={{
                background: 'linear-gradient(135deg, #0b4a91 0%, #00543c 100%)',
                padding: '1.5rem 1.75rem',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <div
                  style={{
                    fontSize: '0.75rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                    color: '#86efac',
                    fontWeight: 700,
                    marginBottom: '4px',
                  }}
                >
                  Officer Performance Dashboard
                </div>
                <h2
                  style={{
                    margin: 0,
                    fontSize: '1.35rem',
                    fontWeight: 700,
                    letterSpacing: '-0.02em',
                  }}
                >
                  {selectedOfficerForStats.name} (ID: {selectedOfficerForStats.employeeNumber})
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setSelectedOfficerForStats(null)}
                style={{
                  background: 'rgba(255, 255, 255, 0.15)',
                  border: 'none',
                  borderRadius: '50%',
                  width: '36px',
                  height: '36px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ffffff',
                  cursor: 'pointer',
                  fontSize: '1.2rem',
                }}
              >
                ✕
              </button>
            </div>

            {/* Modal Content */}
            <div style={{ padding: '1.75rem', overflowY: 'auto' }}>
              {statsLoading ? (
                <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>
                  <div className="admin-spinner" style={{ marginBottom: '12px' }} />
                  <div>Loading live statistics from backend...</div>
                </div>
              ) : (
                <>
                  {/* Stats Cards */}
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                      gap: '0.75rem',
                      marginBottom: '1.5rem',
                    }}
                  >
                    <div
                      style={{
                        background: '#f8fafc',
                        border: '1px solid #e2e8f0',
                        borderRadius: '12px',
                        padding: '1rem',
                        textAlign: 'center',
                      }}
                    >
                      <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>
                        Total Applications
                      </div>
                      <div
                        style={{
                          fontSize: '1.6rem',
                          fontWeight: 800,
                          color: '#0b4a91',
                          marginTop: '4px',
                        }}
                      >
                        {statsData?.totalApplications || 0}
                      </div>
                    </div>

                    <div
                      style={{
                        background: '#eff6ff',
                        border: '1px solid #bfdbfe',
                        borderRadius: '12px',
                        padding: '1rem',
                        textAlign: 'center',
                      }}
                    >
                      <div style={{ fontSize: '0.75rem', color: '#1d4ed8', fontWeight: 600 }}>
                        In Progress
                      </div>
                      <div
                        style={{
                          fontSize: '1.6rem',
                          fontWeight: 800,
                          color: '#1e40af',
                          marginTop: '4px',
                        }}
                      >
                        {statsData?.inProgress ||
                          (statsData?.byStatus?.pending || 0) +
                            (statsData?.byStatus?.['pending payment'] || 0)}
                      </div>
                    </div>

                    <div
                      style={{
                        background: '#f0fdf4',
                        border: '1px solid #bbf7d0',
                        borderRadius: '12px',
                        padding: '1rem',
                        textAlign: 'center',
                      }}
                    >
                      <div style={{ fontSize: '0.75rem', color: '#166534', fontWeight: 600 }}>
                        Approved
                      </div>
                      <div
                        style={{
                          fontSize: '1.6rem',
                          fontWeight: 800,
                          color: '#15803d',
                          marginTop: '4px',
                        }}
                      >
                        {statsData?.approved ||
                          (statsData?.byStatus?.approved || 0) +
                            (statsData?.byStatus?.confirmed || 0)}
                      </div>
                    </div>

                    <div
                      style={{
                        background: '#fef2f2',
                        border: '1px solid #fecaca',
                        borderRadius: '12px',
                        padding: '1rem',
                        textAlign: 'center',
                      }}
                    >
                      <div style={{ fontSize: '0.75rem', color: '#991b1b', fontWeight: 600 }}>
                        Rejected / Flagged
                      </div>
                      <div
                        style={{
                          fontSize: '1.6rem',
                          fontWeight: 800,
                          color: '#dc2626',
                          marginTop: '4px',
                        }}
                      >
                        {statsData?.rejected ||
                          (statsData?.byStatus?.rejected || 0) +
                            (statsData?.byStatus?.flagged || 0)}
                      </div>
                    </div>

                    <div
                      style={{
                        background: 'linear-gradient(135deg, #065f46 0%, #047857 100%)',
                        color: '#ffffff',
                        borderRadius: '12px',
                        padding: '1rem',
                        textAlign: 'center',
                        boxShadow: '0 4px 12px rgba(4, 120, 87, 0.2)',
                      }}
                    >
                      <div style={{ fontSize: '0.75rem', opacity: 0.9, fontWeight: 600 }}>
                        Completed Sales
                      </div>
                      <div style={{ fontSize: '1.6rem', fontWeight: 800, marginTop: '4px' }}>
                        {statsData?.totalCompletedSales || 0}
                      </div>
                    </div>

                    <div
                      style={{
                        background: '#faf5ff',
                        border: '1px solid #e9d5ff',
                        borderRadius: '12px',
                        padding: '1rem',
                        textAlign: 'center',
                      }}
                    >
                      <div style={{ fontSize: '0.75rem', color: '#7e22ce', fontWeight: 600 }}>
                        Conversion Rate
                      </div>
                      <div
                        style={{
                          fontSize: '1.6rem',
                          fontWeight: 800,
                          color: '#6b21a8',
                          marginTop: '4px',
                        }}
                      >
                        {statsData?.completionRate ?? 0}%
                      </div>
                    </div>
                  </div>

                  {/* Attributed Applications Table */}
                  <h3
                    style={{
                      fontSize: '1.05rem',
                      fontWeight: 700,
                      color: '#0f172a',
                      marginBottom: '10px',
                    }}
                  >
                    Attributed Applications ({officerApps.length})
                  </h3>

                  {officerApps.length === 0 ? (
                    <div
                      style={{
                        background: '#f8fafc',
                        border: '1px dashed #cbd5e1',
                        borderRadius: '12px',
                        padding: '2rem',
                        textAlign: 'center',
                        color: '#64748b',
                        fontSize: '0.9rem',
                      }}
                    >
                      No customer applications have been generated through this officer's QR code yet.
                    </div>
                  ) : (
                    <div
                      style={{
                        border: '1px solid #e2e8f0',
                        borderRadius: '12px',
                        overflow: 'hidden',
                      }}
                    >
                      <table
                        style={{
                          width: '100%',
                          borderCollapse: 'collapse',
                          fontSize: '0.82rem',
                          textAlign: 'left',
                        }}
                      >
                        <thead>
                          <tr
                            style={{
                              background: '#f1f5f9',
                              color: '#475569',
                              fontWeight: 700,
                              borderBottom: '1px solid #e2e8f0',
                            }}
                          >
                            <th style={{ padding: '10px 12px' }}>Ref Number</th>
                            <th style={{ padding: '10px 12px' }}>Customer / Product</th>
                            <th style={{ padding: '10px 12px' }}>Submitted</th>
                            <th style={{ padding: '10px 12px' }}>Status</th>
                            <th style={{ padding: '10px 12px' }}>Sale Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {officerApps.map((app) => (
                            <tr
                              key={app.id || app.referenceNumber}
                              style={{ borderBottom: '1px solid #f1f5f9' }}
                            >
                              <td
                                style={{
                                  padding: '10px 12px',
                                  fontFamily: 'monospace',
                                  fontWeight: 700,
                                  color: '#0b4a91',
                                }}
                              >
                                {app.referenceNumber}
                              </td>
                              <td style={{ padding: '10px 12px' }}>
                                <div style={{ fontWeight: 600, color: '#1e293b' }}>
                                  {app.customerName || 'Customer'}
                                </div>
                                <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
                                  {app.packageName || 'New Connection'}
                                </div>
                              </td>
                              <td style={{ padding: '10px 12px', color: '#64748b' }}>
                                {formatDate(app.createdAt)}
                              </td>
                              <td style={{ padding: '10px 12px' }}>
                                <span className={statusBadgeClass(app.status)}>
                                  {statusLabel(app.status)}
                                </span>
                              </td>
                              <td style={{ padding: '10px 12px' }}>
                                {app.isCompletedSale ? (
                                  <span
                                    style={{
                                      background: '#ecfdf5',
                                      color: '#065f46',
                                      padding: '2px 8px',
                                      borderRadius: '6px',
                                      fontWeight: 700,
                                      fontSize: '0.75rem',
                                    }}
                                  >
                                    ✓ Completed Sale
                                  </span>
                                ) : (
                                  <span style={{ color: '#94a3b8', fontSize: '0.75rem' }}>
                                    In Progress
                                  </span>
                                )}
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

            {/* Modal Footer */}
            <div
              style={{
                padding: '1rem 1.75rem',
                background: '#f8fafc',
                borderTop: '1px solid #e2e8f0',
                display: 'flex',
                justifyContent: 'flex-end',
              }}
            >
              <button
                type="button"
                onClick={() => setSelectedOfficerForStats(null)}
                style={{
                  background: '#ffffff',
                  border: '1.5px solid #cbd5e1',
                  borderRadius: '10px',
                  padding: '8px 20px',
                  color: '#334155',
                  fontWeight: 600,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
