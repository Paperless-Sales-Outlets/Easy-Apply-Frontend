import React, { useEffect, useRef, useState } from 'react';
import AdminNotice, { useAdminNotice } from './AdminNotice';
import { timeAgo } from './AdminVisuals';
import {
  renderQrToCanvas,
  downloadBrandedQrPng,
  createOrGetOfficerQr,
} from '../../../services/salesOfficerService';

const ICON_COPY = (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="9" y="9" width="13" height="13" rx="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
  </svg>
);

const ICON_CHECK = (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const ICON_DOWNLOAD = (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><path d="m7 10 5 5 5-5" /><path d="M12 15V3" />
  </svg>
);

const ICON_REFRESH = (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12a9 9 0 1 1-2.64-6.36" /><path d="M21 3v6h-6" />
  </svg>
);

const ICON_LINK = (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" /><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
  </svg>
);

const initials = (name) => (name || '').split(' ').filter(Boolean).map((n) => n[0]).slice(0, 2).join('').toUpperCase() || '?';

export default function QrCodeModal({
  isOpen,
  onClose,
  officer,
  onOfficerUpdated,
}) {
  const canvasRef = useRef(null);
  const [downloading, setDownloading] = useState(false);
  const [regenerating, setRegenerating] = useState(false);
  const [confirmRegenerate, setConfirmRegenerate] = useState(false);
  const [copied, setCopied] = useState(false);
  const [qrData, setQrData] = useState(null);
  const qrNotice = useAdminNotice(4000);

  useEffect(() => {
    setConfirmRegenerate(false);
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
          qrNotice.error(err.response?.data?.message || 'Could not load QR code');
        }
      })();
    }
  }, [isOpen, officer]);

  // Render QR code to canvas whenever qrData changes
  useEffect(() => {
    if (!canvasRef.current || !qrData?.qrUrl) return;
    renderQrToCanvas(canvasRef.current, qrData.qrUrl, {
      width: 220,
      margin: 1,
    });
  }, [qrData]);

  // Esc closes the confirmation first, then the popup
  useEffect(() => {
    if (!isOpen) return undefined;
    const onKey = (e) => {
      if (e.key !== 'Escape' || regenerating) return;
      if (confirmRegenerate) setConfirmRegenerate(false);
      else onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, confirmRegenerate, regenerating, onClose]);

  if (!isOpen || !officer) return null;

  const employeeNumber = officer.employeeNumber || officer.employeeId || 'N/A';
  const officerName = officer.name || 'Sales Officer';
  const trackingUrl = qrData?.qrUrl || '';
  const scansCount = qrData?.scansCount || 0;
  const lastScanned = qrData?.lastScannedAt ? timeAgo(qrData.lastScannedAt) : 'Never';
  const lastScannedTitle = qrData?.lastScannedAt ? new Date(qrData.lastScannedAt).toLocaleString() : 'Not scanned yet';
  const issuedOn = qrData?.regeneratedAt || qrData?.createdAt;

  const handleCopyLink = async () => {
    if (!trackingUrl) return;
    try {
      await navigator.clipboard.writeText(trackingUrl);
      setCopied(true);
      qrNotice.success('Tracking link copied.');
      setTimeout(() => setCopied(false), 2500);
    } catch {
      qrNotice.error('Failed to copy to clipboard');
    }
  };

  const handleDownload = async () => {
    if (!trackingUrl) {
      qrNotice.error('No QR URL available for download');
      return;
    }
    setDownloading(true);
    try {
      await downloadBrandedQrPng({
        trackingUrl,
        employeeNumber,
        officerName,
      });
      qrNotice.success(`Downloaded the QR code for ${employeeNumber}.`);
    } catch (err) {
      console.error('Download error:', err);
      qrNotice.error('Failed to generate PNG download');
    } finally {
      setDownloading(false);
    }
  };

  const handleRegenerate = async () => {
    setConfirmRegenerate(false);
    setRegenerating(true);
    try {
      const res = await createOrGetOfficerQr(employeeNumber, { regenerate: true });
      if (res.qr) {
        setQrData(res.qr);
        onOfficerUpdated?.({
          ...officer,
          qr: { hasQr: true, ...res.qr },
        });
        qrNotice.success(`New QR code generated for ${employeeNumber}. The old one no longer works.`);
      }
    } catch (err) {
      console.error('Regeneration error:', err);
      qrNotice.error(err.response?.data?.message || 'Failed to regenerate QR code');
    } finally {
      setRegenerating(false);
    }
  };

  return (
    <div className="admin-modal-overlay" onClick={regenerating ? undefined : onClose}>
      <div className="admin-modal ax-modal qrm-qr-modal" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-labelledby="qrm-qr-title">
        <div className="ax-modal-head">
          <span className="ax-modal-head-deco" aria-hidden="true" />
          <div className="ax-modal-identity">
            <span className="ax-modal-avatar">{initials(officerName)}</span>
            <div>
              <span className="ax-modal-eyebrow">Tracking QR code</span>
              <h3 id="qrm-qr-title">{officerName}</h3>
              <div className="ax-modal-sub">
                <span className="ax-mono-chip">{employeeNumber}</span>
                {officer.email && <span>{officer.email}</span>}
              </div>
            </div>
          </div>
          <button type="button" className="ax-modal-close" onClick={onClose} aria-label="Close" disabled={regenerating}>×</button>
        </div>

        <div className="ax-modal-body">
          <AdminNotice notice={qrNotice.notice} onDismiss={qrNotice.dismiss} />

          <div className="qrm-qr-layout">
            <div className={`qrm-qr-frame${regenerating ? ' is-busy' : ''}`}>
              <span className="qrm-qr-corner tl" aria-hidden="true" />
              <span className="qrm-qr-corner tr" aria-hidden="true" />
              <span className="qrm-qr-corner bl" aria-hidden="true" />
              <span className="qrm-qr-corner br" aria-hidden="true" />
              {trackingUrl ? (
                <canvas ref={canvasRef} className="qrm-qr-canvas" aria-label={`QR code for ${officerName}`} />
              ) : (
                <div className="qrm-qr-placeholder">
                  <span className="dash-skeleton" />
                  <small>Preparing QR code…</small>
                </div>
              )}
            </div>

            <div className="qrm-qr-side">
              <p className="qrm-qr-caption">Customers who scan this code open the New Connection form, and their application is credited to {officerName.split(' ')[0]}.</p>
              <div className="qrm-qr-stats">
                <div className="qrm-qr-stat">
                  <span>Scans</span>
                  <strong>{scansCount}</strong>
                </div>
                <div className="qrm-qr-stat" title={lastScannedTitle}>
                  <span>Last scan</span>
                  <strong>{lastScanned}</strong>
                </div>
                <div className="qrm-qr-stat" title={issuedOn ? new Date(issuedOn).toLocaleString('en-GB') : undefined}>
                  <span>{qrData?.regeneratedAt ? 'Renewed' : 'Issued'}</span>
                  <strong>{issuedOn ? new Date(issuedOn).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) : '—'}</strong>
                </div>
              </div>
            </div>
          </div>

          <div className="qrm-link">
            <label htmlFor="qrm-link-input">{ICON_LINK} Tracking link</label>
            <div className="qrm-link-row">
              <input id="qrm-link-input" type="text" readOnly value={trackingUrl} placeholder="Generating…" onFocus={(e) => e.target.select()} />
              <button type="button" className={`qrm-copy${copied ? ' is-copied' : ''}`} onClick={handleCopyLink} disabled={!trackingUrl}>
                {copied ? ICON_CHECK : ICON_COPY}
                {copied ? 'Copied' : 'Copy'}
              </button>
            </div>
          </div>

          {confirmRegenerate && (
            <div className="qrm-confirm" role="alertdialog" aria-labelledby="qrm-confirm-title">
              <div>
                <strong id="qrm-confirm-title">Replace this QR code?</strong>
                <p>The current code and link stop working straight away. Printed copies will need to be replaced.</p>
              </div>
              <div className="qrm-confirm-actions">
                <button type="button" className="admin-btn ghost" onClick={() => setConfirmRegenerate(false)} autoFocus>Cancel</button>
                <button type="button" className="admin-btn danger" onClick={handleRegenerate}>Regenerate</button>
              </div>
            </div>
          )}
        </div>

        <div className="ax-modal-foot ax-modal-foot--split">
          <button
            type="button"
            className="admin-btn ghost qrm-regen-btn"
            onClick={() => setConfirmRegenerate(true)}
            disabled={regenerating || confirmRegenerate || !trackingUrl}
          >
            <span className={regenerating ? 'qrm-spin' : ''}>{ICON_REFRESH}</span>
            {regenerating ? 'Regenerating…' : 'Regenerate'}
          </button>
          <div className="ax-modal-foot-group">
            <button type="button" className="admin-btn ghost" onClick={onClose} disabled={regenerating}>Close</button>
            <button type="button" className="admin-btn primary ax-btn-brand" onClick={handleDownload} disabled={downloading || !trackingUrl}>
              {ICON_DOWNLOAD}
              {downloading ? 'Preparing…' : 'Download PNG'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
