import React, { useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import {
  renderQrToCanvas,
  downloadBrandedQrPng,
  createOrGetOfficerQr,
} from '../../../services/salesOfficerService';

export default function QrCodeModal({
  isOpen,
  onClose,
  officer,
  onOfficerUpdated,
}) {
  const canvasRef = useRef(null);
  const [downloading, setDownloading] = useState(false);
  const [regenerating, setRegenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [qrData, setQrData] = useState(null);

  useEffect(() => {
    if (!isOpen || !officer) {
      setQrData(null);
      return;
    }

    // If officer already has QR data attached, use it
    if (officer.qr?.hasQr && officer.qr?.qrUrl) {
      setQrData(officer.qr);
    } else {
      // Otherwise fetch or generate it
      (async () => {
        try {
          const res = await createOrGetOfficerQr(officer.employeeNumber || officer.id, {
            regenerate: false,
          });
          if (res.qr) {
            setQrData(res.qr);
            onOfficerUpdated?.({
              ...officer,
              qr: { hasQr: true, ...res.qr },
            });
          }
        } catch (err) {
          console.error('Failed to load QR code for officer:', err);
          toast.error(err.response?.data?.message || 'Could not load QR code');
        }
      })();
    }
  }, [isOpen, officer]);

  // Render QR code to canvas whenever qrData changes
  useEffect(() => {
    if (!canvasRef.current || !qrData?.qrUrl) return;
    renderQrToCanvas(canvasRef.current, qrData.qrUrl, {
      width: 260,
      margin: 1,
    });
  }, [qrData]);

  if (!isOpen || !officer) return null;

  const employeeNumber = officer.employeeNumber || officer.employeeId || 'N/A';
  const officerName = officer.name || 'Sales Officer';
  const trackingUrl = qrData?.qrUrl || '';
  const scansCount = qrData?.scansCount || 0;
  const lastScanned = qrData?.lastScannedAt
    ? new Date(qrData.lastScannedAt).toLocaleString()
    : 'Never scanned yet';

  const handleCopyLink = async () => {
    if (!trackingUrl) return;
    try {
      await navigator.clipboard.writeText(trackingUrl);
      setCopied(true);
      toast.success('Tracking URL copied to clipboard!');
      setTimeout(() => setCopied(false), 2500);
    } catch {
      toast.error('Failed to copy to clipboard');
    }
  };

  const handleDownload = async () => {
    if (!trackingUrl) {
      toast.error('No QR URL available for download');
      return;
    }
    setDownloading(true);
    try {
      await downloadBrandedQrPng({
        trackingUrl,
        employeeNumber,
        officerName,
      });
      toast.success(`Downloaded QR code for ${employeeNumber}!`);
    } catch (err) {
      console.error('Download error:', err);
      toast.error('Failed to generate PNG download');
    } finally {
      setDownloading(false);
    }
  };

  const handleRegenerate = async () => {
    const confirmed = window.confirm(
      `Regenerate QR tracking code for officer ${officerName} (${employeeNumber})?\n\nThe previous QR code tracking link will be archived and superseded.`
    );
    if (!confirmed) return;

    setRegenerating(true);
    try {
      const res = await createOrGetOfficerQr(employeeNumber, { regenerate: true });
      if (res.qr) {
        setQrData(res.qr);
        onOfficerUpdated?.({
          ...officer,
          qr: { hasQr: true, ...res.qr },
        });
        toast.success(`New QR code generated for ${employeeNumber}!`);
      }
    } catch (err) {
      console.error('Regeneration error:', err);
      toast.error(err.response?.data?.message || 'Failed to regenerate QR code');
    } finally {
      setRegenerating(false);
    }
  };

  return (
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
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="admin-modal-card"
        style={{
          background: '#ffffff',
          borderRadius: '24px',
          width: '100%',
          maxWidth: '540px',
          boxShadow: '0 25px 60px -15px rgba(11, 45, 91, 0.35)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          maxHeight: '92vh',
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
              SLTMobitel Easy Apply • Tracking QR
            </div>
            <h2
              style={{
                margin: 0,
                fontSize: '1.35rem',
                fontWeight: 700,
                letterSpacing: '-0.02em',
              }}
            >
              Sales Officer QR Code
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
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
              transition: 'background 0.2s',
            }}
            aria-label="Close modal"
          >
            ✕
          </button>
        </div>

        {/* Modal Body */}
        <div
          style={{
            padding: '1.75rem',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '1.25rem',
          }}
        >
          {/* Officer Details Highlight Box */}
          <div
            style={{
              width: '100%',
              background: '#f8fafc',
              border: '1.5px solid #e2e8f0',
              borderRadius: '16px',
              padding: '1rem 1.25rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '1rem',
            }}
          >
            <div>
              <div
                style={{
                  fontSize: '1.1rem',
                  fontWeight: 700,
                  color: '#0f172a',
                }}
              >
                {officerName}
              </div>
              <div style={{ fontSize: '0.85rem', color: '#64748b' }}>
                {officer.email || 'No email provided'}
              </div>
            </div>
            <div
              style={{
                textAlign: 'right',
                background: '#eff6ff',
                padding: '6px 14px',
                borderRadius: '10px',
                border: '1px solid #bfdbfe',
              }}
            >
              <div
                style={{
                  fontSize: '0.7rem',
                  color: '#3b82f6',
                  textTransform: 'uppercase',
                  fontWeight: 700,
                }}
              >
                Employee ID
              </div>
              <div
                style={{
                  fontSize: '1.15rem',
                  fontWeight: 800,
                  color: '#1d4ed8',
                  fontFamily: 'monospace',
                }}
              >
                {employeeNumber}
              </div>
            </div>
          </div>

          {/* QR Code Canvas Container */}
          <div
            style={{
              background: '#ffffff',
              padding: '1.25rem',
              borderRadius: '20px',
              border: '2px solid #e2e8f0',
              boxShadow: '0 8px 24px rgba(11, 45, 91, 0.08)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              position: 'relative',
            }}
          >
            {trackingUrl ? (
              <canvas ref={canvasRef} style={{ borderRadius: '8px' }} />
            ) : (
              <div
                style={{
                  width: '260px',
                  height: '260px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#94a3b8',
                  flexDirection: 'column',
                  gap: '0.5rem',
                }}
              >
                <div className="admin-spinner" />
                <span>Loading QR code...</span>
              </div>
            )}
            <div
              style={{
                marginTop: '8px',
                fontSize: '0.8rem',
                fontWeight: 600,
                color: '#0b4a91',
                letterSpacing: '0.02em',
              }}
            >
              Scan to open Customer New Connection Portal
            </div>
          </div>

          {/* Telemetry Stats Bar */}
          <div
            style={{
              width: '100%',
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '0.75rem',
            }}
          >
            <div
              style={{
                background: '#f0fdf4',
                border: '1px solid #bbf7d0',
                padding: '0.75rem 1rem',
                borderRadius: '12px',
                textAlign: 'center',
              }}
            >
              <div style={{ fontSize: '0.75rem', color: '#166534', fontWeight: 600 }}>
                Total QR Scans
              </div>
              <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#15803d' }}>
                {scansCount}
              </div>
            </div>
            <div
              style={{
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                padding: '0.75rem 1rem',
                borderRadius: '12px',
                textAlign: 'center',
              }}
            >
              <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>
                Last Scanned
              </div>
              <div
                style={{
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  color: '#334155',
                  marginTop: '4px',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {lastScanned}
              </div>
            </div>
          </div>

          {/* Tracking Link Input Box with Copy Button */}
          <div style={{ width: '100%' }}>
            <label
              style={{
                fontSize: '0.75rem',
                fontWeight: 700,
                color: '#475569',
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
                marginBottom: '6px',
                display: 'block',
              }}
            >
              Direct Referral Tracking URL
            </label>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                type="text"
                readOnly
                value={trackingUrl}
                style={{
                  flex: 1,
                  background: '#f1f5f9',
                  border: '1px solid #cbd5e1',
                  borderRadius: '10px',
                  padding: '10px 12px',
                  fontSize: '0.82rem',
                  fontFamily: 'monospace',
                  color: '#1e293b',
                }}
              />
              <button
                type="button"
                onClick={handleCopyLink}
                style={{
                  background: copied ? '#10b981' : '#0f57a8',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '10px',
                  padding: '0 16px',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'background 0.2s',
                  whiteSpace: 'nowrap',
                }}
              >
                {copied ? '✓ Copied' : 'Copy'}
              </button>
            </div>
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div
          style={{
            padding: '1.25rem 1.75rem',
            background: '#f8fafc',
            borderTop: '1px solid #e2e8f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '0.75rem',
          }}
        >
          <button
            type="button"
            onClick={handleRegenerate}
            disabled={regenerating}
            style={{
              background: 'transparent',
              border: '1.5px solid #cbd5e1',
              borderRadius: '12px',
              padding: '10px 16px',
              color: '#475569',
              fontSize: '0.85rem',
              fontWeight: 600,
              cursor: regenerating ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            {regenerating ? 'Regenerating...' : '🔄 Regenerate QR'}
          </button>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                background: '#ffffff',
                border: '1.5px solid #cbd5e1',
                borderRadius: '12px',
                padding: '10px 18px',
                color: '#334155',
                fontSize: '0.875rem',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Close
            </button>
            <button
              type="button"
              onClick={handleDownload}
              disabled={downloading || !trackingUrl}
              style={{
                background: 'linear-gradient(135deg, #0b4a91 0%, #00543c 100%)',
                border: 'none',
                borderRadius: '12px',
                padding: '10px 22px',
                color: '#ffffff',
                fontSize: '0.875rem',
                fontWeight: 700,
                cursor: downloading ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 4px 12px rgba(11, 74, 145, 0.25)',
              }}
            >
              {downloading ? 'Preparing...' : '📥 Download PNG'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
