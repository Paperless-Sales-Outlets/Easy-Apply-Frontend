import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiCopy,
  FiHome,
  FiCheck,
  FiDownload,
  FiClock,
  FiSearch,
  FiPhoneCall,
  FiCheckCircle,
} from 'react-icons/fi';
import { useTranslation } from 'react-i18next';
import { clearSessionCart } from '../utils/api';

/* ─────────────────────────────────────────────
   Responsive styles injected once via a <style>
   tag so we can use real media queries without
   a separate CSS file dependency.
───────────────────────────────────────────── */
const STYLES = `
  .cp-wrapper {
    min-height: 82vh;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: clamp(1rem, 4vw, 2.5rem) clamp(0.75rem, 4vw, 1.5rem);
    background-color: #f8fafc;
    box-sizing: border-box;
  }

  .cp-card-stack {
    width: 100%;
    max-width: min(720px, 100%);
    display: flex;
    flex-direction: column;
    gap: clamp(1rem, 3vw, 1.75rem);
  }

  /* ── Ticket card ── */
  .cp-ticket {
    background: #ffffff;
    border-radius: clamp(12px, 3vw, 24px);
    box-shadow: 0 20px 50px rgba(0,86,179,0.08);
    border: 1px solid #e2e8f0;
    overflow: hidden;
    position: relative;
  }

  .cp-accent-bar {
    height: 6px;
    background: linear-gradient(90deg, #10b981 0%, #0056b3 100%);
  }

  /* ── Hero section ── */
  .cp-hero {
    padding: clamp(1.5rem, 5vw, 2.5rem) clamp(1rem, 5vw, 2rem) clamp(1rem, 3vw, 1.5rem);
    text-align: center;
  }

  .cp-check-circle {
    width: clamp(56px, 12vw, 76px);
    height: clamp(56px, 12vw, 76px);
    margin: 0 auto clamp(0.75rem, 3vw, 1.25rem) auto;
    background-color: #dcfce7;
    color: #16a34a;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 8px 24px rgba(22,163,74,0.2);
  }

  .cp-hero h2 {
    margin: 0 0 0.5rem 0;
    color: #0f172a;
    font-size: clamp(1.3rem, 5vw, 1.8rem);
    font-weight: 900;
    letter-spacing: -0.02em;
    line-height: 1.2;
  }

  .cp-hero p {
    color: #64748b;
    margin: 0;
    font-size: clamp(0.85rem, 3vw, 0.98rem);
    font-weight: 600;
    line-height: 1.5;
  }

  /* ── Ticket perforation ── */
  .cp-perforation {
    position: relative;
    display: flex;
    align-items: center;
    margin: 0.5rem 0;
  }
  .cp-perforation-dot {
    width: 24px;
    height: 24px;
    border-radius: 50%;
    background: #f8fafc;
    position: absolute;
    z-index: 10;
    flex-shrink: 0;
  }
  .cp-perforation-line {
    flex: 1;
    border-top: 2px dashed #cbd5e1;
    margin: 0 16px;
  }

  /* ── Ticket body ── */
  .cp-body {
    padding: clamp(1rem, 4vw, 1.5rem) clamp(1rem, 5vw, 2rem) clamp(1.25rem, 5vw, 2.25rem);
  }

  /* ── Reference badge ── */
  .cp-ref-badge {
    background-color: #f0f9ff;
    border: 1.5px dashed #0284c7;
    border-radius: clamp(10px, 3vw, 16px);
    padding: clamp(0.85rem, 3vw, 1.25rem) clamp(0.75rem, 4vw, 1.5rem);
    margin-bottom: clamp(1rem, 4vw, 1.75rem);
    text-align: center;
  }

  .cp-ref-label {
    font-size: clamp(0.65rem, 2vw, 0.75rem);
    color: #0284c7;
    margin: 0 0 0.4rem 0;
    text-transform: uppercase;
    letter-spacing: 1.5px;
    font-weight: 900;
  }

  .cp-ref-row {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: clamp(0.4rem, 2vw, 0.75rem);
    flex-wrap: wrap;
  }

  .cp-ref-number {
    font-size: clamp(1.1rem, 5vw, 1.65rem);
    font-weight: 900;
    color: #0056b3;
    letter-spacing: 1px;
    word-break: break-all;
  }

  .cp-copy-btn {
    background-color: #ffffff;
    border: 1px solid #cbd5e1;
    border-radius: 8px;
    padding: 0.4rem 0.75rem;
    color: #0056b3;
    font-size: clamp(0.72rem, 2.5vw, 0.8rem);
    font-weight: 800;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 0.35rem;
    transition: all 0.15s ease;
    white-space: nowrap;
    flex-shrink: 0;
  }
  .cp-copy-btn.copied {
    background-color: #dcfce7;
    border-color: #86efac;
    color: #15803d;
  }

  .cp-copied-msg {
    color: #16a34a;
    font-size: 0.78rem;
    margin: 0.4rem 0 0 0;
    font-weight: 800;
  }

  /* ── Timeline ── */
  .cp-timeline {
    background-color: #f8fafc;
    border-radius: clamp(10px, 3vw, 16px);
    padding: clamp(0.85rem, 3vw, 1.25rem) clamp(0.75rem, 4vw, 1.5rem);
    border: 1px solid #e2e8f0;
    margin-bottom: clamp(0.85rem, 3vw, 1.25rem);
  }

  .cp-timeline-title {
    font-size: clamp(0.7rem, 2.5vw, 0.8rem);
    font-weight: 800;
    color: #475569;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    margin-bottom: clamp(0.6rem, 2vw, 0.85rem);
  }

  .cp-timeline-list {
    display: flex;
    flex-direction: column;
    gap: clamp(0.6rem, 2vw, 0.85rem);
  }

  .cp-timeline-item {
    display: flex;
    align-items: center;
    gap: clamp(0.5rem, 2vw, 0.75rem);
    font-size: clamp(0.8rem, 3vw, 0.88rem);
  }

  .cp-timeline-dot {
    border-radius: 50%;
    width: 22px;
    height: 22px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.75rem;
    font-weight: 900;
    flex-shrink: 0;
    color: #ffffff;
  }

  .cp-timeline-label {
    flex: 1;
    font-weight: 700;
    color: #0f172a;
    min-width: 0;
  }
  .cp-timeline-label.muted {
    font-weight: 600;
    color: #64748b;
  }

  .cp-badge {
    font-size: clamp(0.65rem, 2vw, 0.75rem);
    font-weight: 800;
    padding: 0.15rem 0.55rem;
    border-radius: 9999px;
    white-space: nowrap;
    flex-shrink: 0;
  }

  /* ── Helpline ── */
  .cp-helpline {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    font-size: clamp(0.75rem, 2.5vw, 0.82rem);
    color: #475569;
    font-weight: 600;
    text-align: center;
    flex-wrap: wrap;
  }

  /* ── Action buttons ── */
  .cp-actions {
    display: flex;
    flex-direction: column;
    gap: clamp(0.65rem, 2vw, 0.85rem);
  }

  .cp-btn-row {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(min(200px, 100%), 1fr));
    gap: clamp(0.65rem, 2vw, 0.85rem);
  }

  .cp-btn {
    padding: clamp(0.7rem, 3vw, 0.85rem) clamp(0.85rem, 3vw, 1.25rem);
    border-radius: clamp(8px, 2vw, 12px);
    font-size: clamp(0.82rem, 3vw, 0.92rem);
    font-weight: 800;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.55rem;
    width: 100%;
    box-sizing: border-box;
    border: none;
    transition: opacity 0.15s ease;
  }
  .cp-btn:active { opacity: 0.82; }

  .cp-btn-primary {
    background: linear-gradient(135deg, #0056b3 0%, #003b73 100%);
    color: #ffffff;
    box-shadow: 0 4px 16px rgba(0,86,179,0.3);
  }

  .cp-btn-secondary {
    background-color: #eff6ff;
    border: 1.5px solid #0284c7 !important;
    color: #0369a1;
  }

  .cp-btn-ghost {
    background-color: #ffffff;
    border: 1px solid #cbd5e1 !important;
    color: #334155;
  }

  /* ── Very small screens (< 360px wide) ── */
  @media (max-width: 360px) {
    .cp-ref-row { flex-direction: column; }
    .cp-copy-btn { align-self: center; }
  }

  /* ── Landscape phones (short viewport height) ── */
  @media (max-height: 500px) and (orientation: landscape) {
    .cp-wrapper { align-items: flex-start; padding-top: 0.75rem; }
    .cp-hero { padding-top: 1rem; padding-bottom: 0.75rem; }
    .cp-check-circle { width: 48px; height: 48px; }
  }
`;

export default function CompletionPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useTranslation();

  // Clear the cart + session on every successful completion so the user
  // always sees an empty cart when they browse again.
  useEffect(() => {
    clearSessionCart();
  }, []);

  // Inject the responsive stylesheet once into <head>
  useEffect(() => {
    const id = 'completion-page-styles';
    if (document.getElementById(id)) return;
    const tag = document.createElement('style');
    tag.id = id;
    tag.textContent = STYLES;
    document.head.appendChild(tag);
    return () => {
      const el = document.getElementById(id);
      if (el) el.remove();
    };
  }, []);

  // Read the real reference number returned by the API (passed via router state)
  const referenceNumber = location.state?.referenceNumber || 'SLT-REQ-883912';
  const [copied, setCopied] = useState(false);

  const messageKey = location.state?.messageKey || 'completion.defaultMessage';
  const message = t(messageKey, 'Your application has been received and logged successfully.');

  const handleCopy = () => {
    navigator.clipboard.writeText(referenceNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadPDF = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Please allow popups to download or print the Application Summary.');
      return;
    }

    const todayStr = new Date().toLocaleDateString('en-LK', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>SLTMobitel EasyApply - Application ${referenceNumber}</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 40px; color: #1e293b; background: #fff; }
          .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 3px solid #0056b3; padding-bottom: 20px; margin-bottom: 30px; flex-wrap: wrap; gap: 8px; }
          .logo { font-size: 24px; font-weight: bold; color: #0056b3; }
          .logo span { color: #22c55e; }
          .title { font-size: 20px; font-weight: 700; color: #1e3a8a; margin-bottom: 10px; }
          .ref-box { background: #f0f9ff; border: 2px dashed #0284c7; border-radius: 12px; padding: 20px; text-align: center; margin: 25px 0; }
          .ref-label { font-size: 13px; color: #64748b; text-transform: uppercase; letter-spacing: 1.5px; font-weight: 700; }
          .ref-val { font-size: 28px; font-weight: 900; color: #0056b3; margin-top: 5px; word-break: break-all; }
          .info-table { width: 100%; border-collapse: collapse; margin: 25px 0; }
          .info-table td { padding: 12px; border-bottom: 1px solid #e2e8f0; font-size: 14px; }
          .info-table td.label { font-weight: 700; color: #475569; width: 40%; }
          .notice { background: #f8fafc; border-left: 4px solid #0056b3; padding: 15px; font-size: 13px; color: #475569; margin-top: 30px; border-radius: 6px; }
          .footer { margin-top: 40px; text-align: center; font-size: 12px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 20px; }
          @media print { body { padding: 0; } }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="logo">SLT<span>MOBITEL</span> EasyApply</div>
          <div style="font-size: 13px; color: #64748b;">Official Application Acknowledgement</div>
        </div>
        <div class="title">Application Submission Summary</div>
        <p style="color: #64748b; font-size: 14px;">Thank you for submitting your application via SLTMobitel EasyApply. Keep this document for your records.</p>
        <div class="ref-box">
          <div class="ref-label">Application Reference Number</div>
          <div class="ref-val">${referenceNumber}</div>
        </div>
        <table class="info-table">
          <tr><td class="label">Reference Number</td><td><strong>${referenceNumber}</strong></td></tr>
          <tr><td class="label">Submission Date &amp; Time</td><td>${todayStr}</td></tr>
          <tr><td class="label">Application Message</td><td>${message}</td></tr>
          <tr><td class="label">Estimated Processing Time</td><td>24 – 48 Hours</td></tr>
          <tr><td class="label">Application Status</td><td><strong style="color: #10b981;">Submitted / Under Review</strong></td></tr>
        </table>
        <div class="notice">
          <strong>Important Information:</strong><br/>
          - Please quote reference number <strong>${referenceNumber}</strong> for all future inquiries regarding this application.<br/>
          - You will receive an SMS notification once your application is reviewed and processed by SLTMobitel.<br/>
          - For immediate support, call <strong>1212</strong> or visit your nearest SLT Teleshop.
        </div>
        <div class="footer">
          &copy; ${new Date().getFullYear()} Sri Lanka Telecom PLC. All rights reserved. | SLTMobitel EasyApply Digital Portal
        </div>
        <script>window.onload = function() { window.print(); };</script>
      </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  const handleTrackStatus = () => {
    if (referenceNumber && referenceNumber !== '—') {
      navigate(`/check-status?ref=${encodeURIComponent(referenceNumber)}`, {
        state: { ref: referenceNumber },
      });
    } else {
      navigate('/check-status');
    }
  };

  return (
    <div className="cp-wrapper">
      <div className="cp-card-stack">

        {/* ── Ticket Card ── */}
        <motion.div
          className="cp-ticket"
          initial={{ opacity: 0, scale: 0.94, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
        >
          {/* Top accent bar */}
          <div className="cp-accent-bar" />

          {/* Hero success message */}
          <div className="cp-hero">
            <motion.div
              className="cp-check-circle"
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.15 }}
            >
              <FiCheckCircle size={36} />
            </motion.div>

            <h2>Application Submitted Successfully!</h2>
            <p>{message}</p>
          </div>

          {/* Ticket perforation */}
          <div className="cp-perforation">
            <div className="cp-perforation-dot" style={{ left: '-12px', borderRight: '1px solid #cbd5e1' }} />
            <div className="cp-perforation-line" />
            <div className="cp-perforation-dot" style={{ right: '-12px', borderLeft: '1px solid #cbd5e1' }} />
          </div>

          {/* Ticket body */}
          <div className="cp-body">

            {/* Reference badge */}
            <div className="cp-ref-badge">
              <p className="cp-ref-label">Official Reference Number</p>

              <div className="cp-ref-row">
                <span className="cp-ref-number">{referenceNumber}</span>

                <button
                  onClick={handleCopy}
                  type="button"
                  className={`cp-copy-btn${copied ? ' copied' : ''}`}
                  title="Copy Reference Number"
                >
                  <FiCopy size={15} />
                  <span>{copied ? 'Copied!' : 'Copy'}</span>
                </button>
              </div>

              <AnimatePresence>
                {copied && (
                  <motion.p
                    className="cp-copied-msg"
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                  >
                    Reference number copied to clipboard!
                  </motion.p>
                )}
              </AnimatePresence>
            </div>

            {/* Processing timeline */}
            <div className="cp-timeline">
              <div className="cp-timeline-title">Application Processing Timeline</div>

              <div className="cp-timeline-list">
                {/* Step 1 — Done */}
                <div className="cp-timeline-item">
                  <div className="cp-timeline-dot" style={{ backgroundColor: '#10b981' }}>
                    <FiCheck size={13} />
                  </div>
                  <div className="cp-timeline-label">Application Logged &amp; Received</div>
                  <span className="cp-badge" style={{ color: '#15803d', backgroundColor: '#dcfce7' }}>Done</span>
                </div>

                {/* Step 2 — In progress */}
                <div className="cp-timeline-item">
                  <div className="cp-timeline-dot" style={{ backgroundColor: '#0284c7' }}>
                    <FiClock size={13} />
                  </div>
                  <div className="cp-timeline-label">Technical Verification &amp; Dispatch</div>
                  <span className="cp-badge" style={{ color: '#0369a1', backgroundColor: '#e0f2fe' }}>24 - 48 Hours</span>
                </div>

                {/* Step 3 — Pending */}
                <div className="cp-timeline-item">
                  <div className="cp-timeline-dot" style={{ backgroundColor: '#cbd5e1' }}>
                    <FiCheckCircle size={13} />
                  </div>
                  <div className="cp-timeline-label muted">SMS Notification &amp; Line Activation</div>
                  <span className="cp-badge" style={{ color: '#64748b', backgroundColor: '#f1f5f9' }}>Pending</span>
                </div>
              </div>
            </div>

            {/* Helpline notice */}
            <div className="cp-helpline">
              <FiPhoneCall size={14} style={{ color: '#0056b3', flexShrink: 0 }} />
              <span>Need help? Contact SLTMobitel Customer Helpline at <strong>1212</strong></span>
            </div>
          </div>
        </motion.div>

        {/* ── Action Buttons ── */}
        <motion.div
          className="cp-actions"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.2 }}
        >
          <div className="cp-btn-row">
            <button type="button" className="cp-btn cp-btn-primary" onClick={handleDownloadPDF}>
              <FiDownload size={18} />
              <span>Download Summary PDF</span>
            </button>

            <button type="button" className="cp-btn cp-btn-secondary" onClick={handleTrackStatus}>
              <FiSearch size={18} />
              <span>Track Application Status</span>
            </button>
          </div>

          <button type="button" className="cp-btn cp-btn-ghost" onClick={() => navigate('/')}>
            <FiHome size={18} />
            <span>{t('completion.backToDashboard', 'Back to Dashboard')}</span>
          </button>
        </motion.div>

      </div>
    </div>
  );
}