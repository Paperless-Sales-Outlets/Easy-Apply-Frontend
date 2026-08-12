import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiCopy, FiHome } from 'react-icons/fi';
import { useTranslation } from 'react-i18next';

export default function CompletionPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useTranslation();

  // Read the real reference number returned by the API (passed via router state)
  const refNumber = location.state?.referenceNumber || '—';
  const [copied, setCopied] = useState(false);

  const messageKey = location.state?.messageKey || 'completion.defaultMessage';
  const message = t(messageKey);

  const handleCopy = () => {
    navigator.clipboard.writeText(refNumber);
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
        <title>SLTMobitel EasyApply - Application ${refNumber}</title>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 40px; color: #1e293b; background: #fff; }
          .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 3px solid #0056b3; padding-bottom: 20px; margin-bottom: 30px; }
          .logo { font-size: 24px; font-weight: bold; color: #0056b3; }
          .logo span { color: #22c55e; }
          .title { font-size: 20px; font-weight: 700; color: #1e3a8a; margin-bottom: 10px; }
          .ref-box { background: #f0f9ff; border: 2px dashed #0284c7; border-radius: 8px; padding: 20px; text-align: center; margin: 25px 0; }
          .ref-label { font-size: 13px; color: #64748b; text-transform: uppercase; letter-spacing: 1.5px; font-weight: 600; }
          .ref-val { font-size: 28px; font-weight: 800; color: #0056b3; margin-top: 5px; }
          .info-table { width: 100%; border-collapse: collapse; margin: 25px 0; }
          .info-table td { padding: 12px; border-bottom: 1px solid #e2e8f0; font-size: 14px; }
          .info-table td.label { font-weight: 600; color: #475569; width: 40%; }
          .notice { background: #f8fafc; border-left: 4px solid #0056b3; padding: 15px; font-size: 13px; color: #475569; margin-top: 30px; }
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
          <div class="ref-val">${refNumber}</div>
        </div>

        <table class="info-table">
          <tr>
            <td class="label">Reference Number</td>
            <td><strong>${refNumber}</strong></td>
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
            <td><strong style="color: #0284c7;">Received / Pending Review</strong></td>
          </tr>
        </table>

        <div class="notice">
          <strong>Important Information:</strong>
          <br/>
          - Please quote reference number <strong>${refNumber}</strong> for all future inquiries regarding this application.
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
    if (refNumber && refNumber !== '—') {
      navigate(`/check-status?ref=${encodeURIComponent(refNumber)}`);
    } else {
      navigate('/check-status');
    }
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', padding: '2rem' }}>
      <div style={{ maxWidth: '500px', width: '100%', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        
        {/* Ticket Container */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          style={{ 
            background: '#fff', 
            borderRadius: '16px', 
            boxShadow: '0 12px 32px rgba(0,0,0,0.08)',
            overflow: 'hidden',
            position: 'relative'
          }}
        >
          {/* Top Half - Success Message */}
          <div style={{ padding: '3rem 2rem 2rem 2rem', textAlign: 'center', background: 'linear-gradient(to bottom, rgba(0,166,80,0.05), #ffffff)' }}>
            <motion.div style={{ width: '80px', height: '80px', margin: '0 auto 1.5rem auto' }}>
              <svg viewBox="0 0 50 50" style={{ width: '100%', height: '100%' }}>
                <circle cx="25" cy="25" r="23" fill="none" stroke="var(--slt-green)" strokeWidth="4" />
                <motion.path 
                  d="M14,26 L22,34 L38,16" 
                  fill="none" 
                  stroke="var(--slt-green)" 
                  strokeWidth="5" 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 0.6, ease: "easeOut", delay: 0.2 }}
                />
              </svg>
            </motion.div>

            <h2 style={{ marginBottom: '0.75rem', color: 'var(--text-primary)', fontSize: '1.75rem' }}>{t('completion.successTitle')}</h2>
            <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: '1.05rem', lineHeight: '1.5' }}>
              {message}
            </p>
          </div>

          {/* Ticket Perforation */}
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: 'var(--background, #f4f7f6)', position: 'absolute', left: '-15px', boxShadow: 'inset -3px 0 5px rgba(0,0,0,0.02)' }} />
            <div style={{ flex: 1, borderTop: '2px dashed #e2e8f0', margin: '0 20px' }} />
            <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: 'var(--background, #f4f7f6)', position: 'absolute', right: '-15px', boxShadow: 'inset 3px 0 5px rgba(0,0,0,0.02)' }} />
          </div>

          {/* Bottom Half - Details */}
          <div style={{ padding: '2rem' }}>
            <div style={{ background: '#f8fafc', borderRadius: '12px', padding: '1.5rem', marginBottom: '1.5rem', textAlign: 'center' }}>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: '0 0 0.5rem 0', textTransform: 'uppercase', letterSpacing: '1.5px', fontWeight: 'bold' }}>
                {t('completion.referenceNumber')}
              </p>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem' }}>
                <span style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--slt-blue)', letterSpacing: '2px' }}>
                  {refNumber}
                </span>
                <button 
                  onClick={handleCopy}
                  style={{ background: 'none', border: 'none', color: 'var(--slt-blue)', cursor: 'pointer', padding: '0.5rem' }}
                  title="Copy Reference Number"
                >
                  <FiCopy size={20} color={copied ? "var(--slt-green)" : "currentColor"} />
                </button>
              </div>
              <AnimatePresence>
                {copied && <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ color: 'var(--slt-green)', fontSize: '0.75rem', margin: '0.5rem 0 0 0' }}>{t('completion.copiedToClipboard')}</motion.p>}
              </AnimatePresence>
            </div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              style={{ color: 'var(--text-secondary)', margin: 0, fontSize: '0.95rem', textAlign: 'center' }}
            >
              We have received your application. Standard processing takes <strong>24–48 hours</strong>. You will receive an SMS notification once your service is fully restored.
            </motion.p>
          </div>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}
        >
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button 
              type="button"
              className="btn btn-primary" 
              onClick={handleDownloadPDF}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                flex: 1,
                minWidth: '200px',
                justifyContent: 'center',
                cursor: 'pointer',
                backgroundColor: '#0056b3',
                color: '#ffffff',
                border: 'none',
                fontWeight: '600',
                borderRadius: '8px',
                padding: '0.75rem 1.25rem',
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
              Download Summary PDF
            </button>
            <button 
              type="button"
              className="btn btn-primary" 
              onClick={handleTrackStatus}
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1, minWidth: '200px', justifyContent: 'center', cursor: 'pointer' }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
              Track Status
            </button>
          </div>
          
          <button 
            type="button"
            className="btn btn-primary" 
            onClick={() => navigate('/')}
            style={{ width: '100%', padding: '1rem', fontSize: '1rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}
          >
            <FiHome /> {t('completion.backToDashboard')}
          </button>
        </motion.div>

      </div>
    </div>
  );
}
