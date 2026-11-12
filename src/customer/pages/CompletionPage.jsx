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
  FiArrowRight,
} from 'react-icons/fi';
import { useTranslation } from 'react-i18next';
import { clearSessionCart } from '../../shared/utils/api';

/* ─────────────────────────────────────────────
   Responsive styles injected once via a <style>
   tag so we can use real media queries without
   a separate CSS file dependency.
───────────────────────────────────────────── */
const STYLES = `
  .cp-wrapper { min-height: 82vh; display: flex; align-items: center; justify-content: center;
    padding: var(--s5) var(--page-gutter); background: var(--grey-50); }
  .cp-card-stack { width: 100%; max-width: 680px; display: flex; flex-direction: column; gap: var(--s5); }

  .cp-ticket { background: #fff; border: 1px solid var(--grey-200); border-radius: var(--radius-lg);
    box-shadow: var(--shadow-md); overflow: hidden; }
  .cp-accent-bar { height: 4px; background: var(--green-500); }

  .cp-hero { padding: var(--s6) var(--s5) var(--s4); text-align: center; }
  .cp-check-circle { width: 64px; height: 64px; margin: 0 auto var(--s4); background: var(--green-100);
    color: var(--green-700); border-radius: 50%; display: flex; align-items: center; justify-content: center; }
  .cp-hero h2 { font-size: var(--text-2xl); margin: 0 0 var(--s2); }
  .cp-hero p { color: var(--grey-600); margin: 0; font-size: var(--text-base); }

  .cp-perforation { border-top: 1px solid var(--grey-200); margin: var(--s2) var(--s5); }
  .cp-perforation-dot, .cp-perforation-line { display: none; }

  .cp-body { padding: var(--s4) var(--s5) var(--s6); }

  .cp-ref-badge { background: var(--blue-50); border-radius: var(--radius); padding: var(--s4) var(--s5);
    margin-bottom: var(--s5); text-align: center; }
  .cp-ref-label { font-size: var(--text-xs); color: var(--grey-600); margin: 0 0 var(--s1);
    text-transform: uppercase; letter-spacing: 0.06em; font-weight: 600; }
  .cp-ref-row { display: flex; align-items: center; justify-content: center; gap: var(--s3); flex-wrap: wrap; }
  .cp-ref-number { font-family: var(--font-head); font-size: var(--text-3xl); font-weight: 700;
    font-variant-numeric: lining-nums; color: var(--blue-700); word-break: break-all; }
  .cp-copy-btn { background: #fff; border: 1px solid var(--grey-300); border-radius: var(--radius);
    min-height: 40px; padding: 0 var(--s3); color: var(--blue-600); font-size: var(--text-sm); font-weight: 600;
    cursor: pointer; display: flex; align-items: center; gap: var(--s2); white-space: nowrap; }
  .cp-copy-btn:hover { background: var(--blue-50); }
  .cp-copy-btn.copied { background: var(--green-100); border-color: var(--green-300); color: var(--green-800); }
  .cp-copied-msg { color: var(--green-700); font-size: var(--text-sm); margin: var(--s2) 0 0; font-weight: 600; }

  .cp-timeline { margin-bottom: var(--s4); }
  .cp-timeline-title { font-size: var(--text-xs); font-weight: 600; color: var(--grey-600);
    text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: var(--s3); }
  .cp-timeline-list { display: flex; flex-direction: column; gap: var(--s3); }
  .cp-timeline-item { display: flex; align-items: center; gap: var(--s3); font-size: var(--text-base); }
  .cp-timeline-dot { border-radius: 50%; width: 24px; height: 24px; display: flex; align-items: center;
    justify-content: center; font-size: var(--text-xs); font-weight: 700; flex-shrink: 0; color: #fff; }
  .cp-timeline-label { flex: 1; font-weight: 600; color: var(--grey-900); min-width: 0; }
  .cp-timeline-label.muted { font-weight: 500; color: var(--grey-600); }
  .cp-badge { font-size: var(--text-xs); font-weight: 600; padding: 2px var(--s2);
    border-radius: var(--radius-sm); white-space: nowrap; flex-shrink: 0; }

  .cp-helpline { display: flex; align-items: center; justify-content: center; gap: var(--s2);
    font-size: var(--text-sm); color: var(--grey-600); text-align: center; flex-wrap: wrap; }

  .cp-actions { display: flex; flex-direction: column; gap: var(--s3); }
  .cp-btn-row { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(200px, 100%), 1fr)); gap: var(--s3); }
  .cp-btn { min-height: var(--control-h); padding: 0 var(--s5); border-radius: var(--radius);
    font-size: var(--text-base); font-weight: 600; cursor: pointer; display: flex; align-items: center;
    justify-content: center; gap: var(--s2); width: 100%; border: 1px solid transparent; }
  .cp-btn-primary { background: var(--blue-600); color: #fff; }
  .cp-btn-primary:hover { background: var(--blue-700); }
  .cp-btn-secondary { background: #fff; border-color: var(--grey-300); color: var(--blue-600); }
  .cp-btn-secondary:hover { background: var(--blue-50); }
  .cp-btn-ghost { background: transparent; color: var(--blue-600); }
  .cp-btn-ghost:hover { background: var(--blue-50); }

  @media (max-width: 360px) {
    .cp-ref-row { flex-direction: column; }
  }
`;

/** Confirmation screen shown after an application is submitted. */
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
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 40px; color: #26344b; background: #ffffff; }
          .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 3px solid #0056a2; padding-bottom: 20px; margin-bottom: 30px; flex-wrap: wrap; gap: 8px; }
          .logo { font-size: 24px; font-weight: bold; color: #0056a2; }
          .logo span { color: #22c55e; }
          .title { font-size: 20px; font-weight: 700; color: #1e3a8a; margin-bottom: 10px; }
          .ref-box { background: #f1f7fd; border: 2px dashed #1a6cbd; border-radius: 12px; padding: 20px; text-align: center; margin: 25px 0; }
          .ref-label { font-size: 13px; color: #52627a; text-transform: uppercase; letter-spacing: 1.5px; font-weight: 700; }
          .ref-val { font-size: 28px; font-weight: 700; color: #0056a2; margin-top: 5px; word-break: break-all; }
          .info-table { width: 100%; border-collapse: collapse; margin: 25px 0; }
          .info-table td { padding: 12px; border-bottom: 1px solid #dfe5ee; font-size: 14px; }
          .info-table td.label { font-weight: 700; color: #3b4a61; width: 40%; }
          .notice { background: #f6f8fb; border-left: 4px solid #0056a2; padding: 15px; font-size: 13px; color: #3b4a61; margin-top: 30px; border-radius: 6px; }
          .footer { margin-top: 40px; text-align: center; font-size: 12px; color: #94a1b5; border-top: 1px solid #dfe5ee; padding-top: 20px; }
          @media print { body { padding: 0; } }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="logo">SLT<span>MOBITEL</span> EasyApply</div>
          <div style="font-size: 13px; color: #52627a;">Official Application Acknowledgement</div>
        </div>
        <div class="title">Application Submission Summary</div>
        <p style="color: #52627a; font-size: 14px;">Thank you for submitting your application via SLTMobitel EasyApply. Keep this document for your records.</p>
        <div class="ref-box">
          <div class="ref-label">Application Reference Number</div>
          <div class="ref-val">${referenceNumber}</div>
        </div>
        <table class="info-table">
          <tr><td class="label">Reference Number</td><td><strong>${referenceNumber}</strong></td></tr>
          <tr><td class="label">Submission Date &amp; Time</td><td>${todayStr}</td></tr>
          <tr><td class="label">Application Message</td><td>${message}</td></tr>
          <tr><td class="label">Estimated Processing Time</td><td>24 – 48 Hours</td></tr>
          <tr><td class="label">Application Status</td><td><strong style="color: #0f7a4d;">Submitted / Under Review</strong></td></tr>
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
            <div className="cp-perforation-dot" style={{ left: '-12px', borderRight: '1px solid #c3ccd9' }} />
            <div className="cp-perforation-line" />
            <div className="cp-perforation-dot" style={{ right: '-12px', borderLeft: '1px solid #c3ccd9' }} />
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
                  <div className="cp-timeline-dot" style={{ backgroundColor: '#0f7a4d' }}>
                    <FiCheck size={13} />
                  </div>
                  <div className="cp-timeline-label">Application Logged &amp; Received</div>
                  <span className="cp-badge" style={{ color: '#0f7a4d', backgroundColor: '#e2f4e3' }}>Done</span>
                </div>

                {/* Step 2 — In progress */}
                <div className="cp-timeline-item">
                  <div className="cp-timeline-dot" style={{ backgroundColor: '#1a6cbd' }}>
                    <FiClock size={13} />
                  </div>
                  <div className="cp-timeline-label">Technical Verification &amp; Dispatch</div>
                  <span className="cp-badge" style={{ color: '#0a4b8c', backgroundColor: '#e3effc' }}>24 - 48 Hours</span>
                </div>

                {/* Step 3 — Pending */}
                <div className="cp-timeline-item">
                  <div className="cp-timeline-dot" style={{ backgroundColor: '#c3ccd9' }}>
                    <FiCheckCircle size={13} />
                  </div>
                  <div className="cp-timeline-label muted">SMS Notification &amp; Line Activation</div>
                  <span className="cp-badge" style={{ color: '#52627a', backgroundColor: '#eef2f7' }}>Pending</span>
                </div>
              </div>
            </div>

            {/* Helpline notice */}
            <div className="cp-helpline">
              <FiPhoneCall size={14} style={{ color: '#0056a2', flexShrink: 0 }} />
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
          {/* Primary CTA: Track Application Status */}
          <button
            type="button"
            className="cp-btn cp-btn-primary"
            style={{
              background: 'var(--blue-600)',
              boxShadow: 'var(--shadow-md)',
              padding: '0.9rem 1.25rem',
              fontSize: '0.98rem',
              fontWeight: 700,
            }}
            onClick={handleTrackStatus}
          >
            <FiSearch size={20} />
            <span>Track Application Status</span>
            <FiArrowRight size={18} />
          </button>

          <div className="cp-btn-row">
            <button type="button" className="cp-btn cp-btn-secondary" onClick={handleDownloadPDF}>
              <FiDownload size={18} />
              <span>Download Summary PDF</span>
            </button>

            <button type="button" className="cp-btn cp-btn-ghost" onClick={() => navigate('/')}>
              <FiHome size={18} />
              <span>{t('completion.backToDashboard', 'Back to Dashboard')}</span>
            </button>
          </div>
        </motion.div>


      </div>
    </div>
  );
}