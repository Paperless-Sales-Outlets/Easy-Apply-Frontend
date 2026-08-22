import React, { useState } from 'react';
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
  FiFileText,
} from 'react-icons/fi';
import { useTranslation } from 'react-i18next';

export default function CompletionPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useTranslation();

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
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 40px; color: #1e293b; background: #fff; }
          .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 3px solid #0056b3; padding-bottom: 20px; margin-bottom: 30px; }
          .logo { font-size: 24px; font-weight: bold; color: #0056b3; }
          .logo span { color: #22c55e; }
          .title { font-size: 20px; font-weight: 700; color: #1e3a8a; margin-bottom: 10px; }
          .ref-box { background: #f0f9ff; border: 2px dashed #0284c7; border-radius: 12px; padding: 20px; text-align: center; margin: 25px 0; }
          .ref-label { font-size: 13px; color: #64748b; text-transform: uppercase; letter-spacing: 1.5px; font-weight: 700; }
          .ref-val { font-size: 28px; font-weight: 900; color: #0056b3; margin-top: 5px; }
          .info-table { width: 100%; border-collapse: collapse; margin: 25px 0; }
          .info-table td { padding: 12px; border-bottom: 1px solid #e2e8f0; font-size: 14px; }
          .info-table td.label { font-weight: 700; color: #475569; width: 40%; }
          .notice { background: #f8fafc; border-left: 4px solid #0056b3; padding: 15px; font-size: 13px; color: #475569; margin-top: 30px; border-radius: 6px; }
          .footer { margin-top: 40px; text-align: center; font-size: 12px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 20px; }
          @media print {
            body { padding: 0; }
          }
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
          <tr>
            <td class="label">Reference Number</td>
            <td><strong>${referenceNumber}</strong></td>
          </tr>
          <tr>
            <td class="label">Submission Date & Time</td>
            <td>${todayStr}</td>
          </tr>
          <tr>
            <td class="label">Application Message</td>
            <td>${message}</td>
          </tr>
          <tr>
            <td class="label">Estimated Processing Time</td>
            <td>24 – 48 Hours</td>
          </tr>
          <tr>
            <td class="label">Application Status</td>
            <td><strong style="color: #10b981;">Submitted / Under Review</strong></td>
          </tr>
        </table>

        <div class="notice">
          <strong>Important Information:</strong>
          <br/>
          - Please quote reference number <strong>${referenceNumber}</strong> for all future inquiries regarding this application.
          <br/>
          - You will receive an SMS notification once your application is reviewed and processed by SLTMobitel.
          <br/>
          - For immediate support, call <strong>1212</strong> or visit your nearest SLT Teleshop.
        </div>

        <div class="footer">
          &copy; ${new Date().getFullYear()} Sri Lanka Telecom PLC. All rights reserved. | SLTMobitel EasyApply Digital Portal
        </div>

        <script>
          window.onload = function() {
            window.print();
          };
        </script>
      </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  const handleTrackStatus = () => {
    navigate('/check-status', { state: { ref: referenceNumber } });
  };

  return (
    <div
      style={{
        minHeight: '82vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2.5rem 1rem',
        backgroundColor: '#f8fafc',
      }}
    >
      <div style={{ maxWidth: '720px', width: '100%', display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
        {/* Ticket Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '24px',
            boxShadow: '0 20px 50px rgba(0, 86, 179, 0.08)',
            border: '1px solid #e2e8f0',
            overflow: 'hidden',
            position: 'relative',
          }}
        >
          {/* Top Green Accent Bar */}
          <div
            style={{
              height: '6px',
              background: 'linear-gradient(90deg, #10b981 0%, #0056b3 100%)',
            }}
          />

          {/* Hero Success Message */}
          <div style={{ padding: '2.5rem 2rem 1.5rem 2rem', textAlign: 'center' }}>
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.15 }}
              style={{
                width: '76px',
                height: '76px',
                margin: '0 auto 1.25rem auto',
                backgroundColor: '#dcfce7',
                color: '#16a34a',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 8px 24px rgba(22, 163, 74, 0.2)',
              }}
            >
              <FiCheckCircle size={44} />
            </motion.div>

            <h2 style={{ marginBottom: '0.5rem', color: '#0f172a', fontSize: '1.8rem', fontWeight: 900, letterSpacing: '-0.02em' }}>
              Application Submitted Successfully!
            </h2>
            <p style={{ color: '#64748b', margin: 0, fontSize: '0.98rem', fontWeight: 600, lineHeight: 1.5 }}>
              {message}
            </p>
          </div>

          {/* Ticket Perforation Cuts */}
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center', margin: '0.5rem 0' }}>
            <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: '#f8fafc', borderRight: '1px solid #cbd5e1', position: 'absolute', left: '-12px', zIndex: 10 }} />
            <div style={{ flex: 1, borderTop: '2px dashed #cbd5e1', margin: '0 16px' }} />
            <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: '#f8fafc', borderLeft: '1px solid #cbd5e1', position: 'absolute', right: '-12px', zIndex: 10 }} />
          </div>

          {/* Ticket Details & Reference Box */}
          <div style={{ padding: '1.5rem 2rem 2.25rem 2rem' }}>
            {/* Reference Badge */}
            <div
              style={{
                backgroundColor: '#f0f9ff',
                border: '1.5px dashed #0284c7',
                borderRadius: '16px',
                padding: '1.25rem 1.5rem',
                marginBottom: '1.75rem',
                textAlign: 'center',
              }}
            >
              <p style={{ fontSize: '0.75rem', color: '#0284c7', margin: '0 0 0.4rem 0', textTransform: 'uppercase', letterSpacing: '1.5px', fontWeight: 900 }}>
                Official Reference Number
              </p>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem' }}>
                <span style={{ fontSize: '1.65rem', fontWeight: 900, color: '#0056b3', letterSpacing: '1px' }}>
                  {referenceNumber}
                </span>

                <button
                  onClick={handleCopy}
                  type="button"
                  style={{
                    backgroundColor: copied ? '#dcfce7' : '#ffffff',
                    border: copied ? '1px solid #86efac' : '1px solid #cbd5e1',
                    borderRadius: '8px',
                    padding: '0.4rem 0.75rem',
                    color: copied ? '#15803d' : '#0056b3',
                    fontSize: '0.8rem',
                    fontWeight: 800,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    transition: 'all 0.15s ease',
                  }}
                  title="Copy Reference Number"
                >
                  <FiCopy size={15} />
                  <span>{copied ? 'Copied!' : 'Copy'}</span>
                </button>
              </div>

              <AnimatePresence>
                {copied && (
                  <motion.p
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    style={{ color: '#16a34a', fontSize: '0.78rem', margin: '0.4rem 0 0 0', fontWeight: 800 }}
                  >
                    Reference number copied to clipboard!
                  </motion.p>
                )}
              </AnimatePresence>
            </div>

            {/* Stepper Process Timeline */}
            <div style={{ backgroundColor: '#f8fafc', borderRadius: '16px', padding: '1.25rem 1.5rem', border: '1px solid #e2e8f0', marginBottom: '1.25rem' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.85rem' }}>
                Application Processing Timeline
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.88rem' }}>
                  <div style={{ backgroundColor: '#10b981', color: '#ffffff', borderRadius: '50%', width: '22px', height: '22px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 900 }}>
                    <FiCheck size={13} />
                  </div>
                  <div style={{ flex: 1, fontWeight: 700, color: '#0f172a' }}>Application Logged & Received</div>
                  <span style={{ fontSize: '0.75rem', color: '#15803d', fontWeight: 800, backgroundColor: '#dcfce7', padding: '0.15rem 0.55rem', borderRadius: '9999px' }}>Done</span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.88rem' }}>
                  <div style={{ backgroundColor: '#0284c7', color: '#ffffff', borderRadius: '50%', width: '22px', height: '22px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 900 }}>
                    <FiClock size={13} />
                  </div>
                  <div style={{ flex: 1, fontWeight: 700, color: '#0f172a' }}>Technical Verification & Dispatch</div>
                  <span style={{ fontSize: '0.75rem', color: '#0369a1', fontWeight: 800, backgroundColor: '#e0f2fe', padding: '0.15rem 0.55rem', borderRadius: '9999px' }}>24 - 48 Hours</span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.88rem' }}>
                  <div style={{ backgroundColor: '#cbd5e1', color: '#ffffff', borderRadius: '50%', width: '22px', height: '22px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 900 }}>
                    <FiCheckCircle size={13} />
                  </div>
                  <div style={{ flex: 1, fontWeight: 600, color: '#64748b' }}>SMS Notification & Line Activation</div>
                  <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 700, backgroundColor: '#f1f5f9', padding: '0.15rem 0.55rem', borderRadius: '9999px' }}>Pending</span>
                </div>
              </div>
            </div>

            {/* Helpline Notice Pill */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', fontSize: '0.82rem', color: '#475569', fontWeight: 600 }}>
              <FiPhoneCall size={14} style={{ color: '#0056b3' }} />
              <span>Need help? Contact SLTMobitel Customer Helpline at <strong>1212</strong></span>
            </div>
          </div>
        </motion.div>

        {/* Action Buttons Toolbar */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.2 }}
          style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}
        >
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.85rem' }}>
            <button
              type="button"
              onClick={handleDownloadPDF}
              style={{
                padding: '0.85rem 1.25rem',
                borderRadius: '12px',
                border: 'none',
                background: 'linear-gradient(135deg, #0056b3 0%, #003b73 100%)',
                color: '#ffffff',
                fontSize: '0.92rem',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.55rem',
                boxShadow: '0 4px 16px rgba(0, 86, 179, 0.3)',
              }}
            >
              <FiDownload size={18} />
              <span>Download Summary PDF</span>
            </button>

            <button
              type="button"
              onClick={handleTrackStatus}
              style={{
                padding: '0.85rem 1.25rem',
                borderRadius: '12px',
                border: '1.5px solid #0284c7',
                backgroundColor: '#eff6ff',
                color: '#0369a1',
                fontSize: '0.92rem',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.55rem',
              }}
            >
              <FiSearch size={18} />
              <span>Track Application Status</span>
            </button>
          </div>

          <button
            type="button"
            onClick={() => navigate('/')}
            style={{
              width: '100%',
              padding: '0.85rem 1.25rem',
              borderRadius: '12px',
              border: '1px solid #cbd5e1',
              backgroundColor: '#ffffff',
              color: '#334155',
              fontSize: '0.92rem',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.55rem',
            }}
          >
            <FiHome size={18} />
            <span>{t('completion.backToDashboard', 'Back to Dashboard')}</span>
          </button>
        </motion.div>
      </div>
    </div>
  );
}