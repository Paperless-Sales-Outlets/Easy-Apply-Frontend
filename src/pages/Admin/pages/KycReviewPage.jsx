import React, { useState } from 'react';
import { DUMMY_KYC_QUEUE } from '../data/dummyData';

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
  });
}

export default function KycReviewPage() {
  const [queue, setQueue]     = useState(DUMMY_KYC_QUEUE);
  const [index, setIndex]     = useState(0);
  const [note, setNote]       = useState('');
  const [toast, setToast]     = useState(null);

  const current = queue[index];

  const showToast = (msg, type) => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const updateStatus = (status) => {
    setQueue(prev => prev.map((k, i) => i === index ? { ...k, status } : k));
    showToast(`KYC ${status} successfully.`, status === 'approved' ? 'success' : status === 'rejected' ? 'danger' : 'warning');
    setNote('');
    // Advance to next pending item if possible
    const next = queue.findIndex((k, i) => i > index && k.status === 'pending');
    if (next !== -1) setIndex(next);
  };

  const pendingCount = queue.filter(k => k.status === 'pending').length;

  return (
    <>
      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed', top: '1.5rem', right: '1.5rem', zIndex: 999,
          padding: '0.75rem 1.25rem', borderRadius: 'var(--radius)',
          background: toast.type === 'success' ? 'var(--green)' : toast.type === 'danger' ? 'var(--danger)' : '#d97706',
          color: '#fff', fontWeight: 600, fontSize: '0.88rem',
          boxShadow: 'var(--shadow)', animation: 'none',
        }}>
          {toast.msg}
        </div>
      )}

      <div className="admin-page-header">
        <h1 className="admin-page-title">KYC Review Panel</h1>
        <p className="admin-page-subtitle">
          Review identity documents and selfie verification — {pendingCount} pending
        </p>
      </div>

      {queue.length === 0 || !current ? (
        <div className="admin-empty">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><path d="m9 11 3 3L22 4" />
          </svg>
          <p>No applications pending KYC review. All caught up!</p>
        </div>
      ) : (
        <>
          {/* ── Queue Navigator ── */}
          <div className="kyc-nav-controls">
            <button
              className="admin-btn ghost"
              onClick={() => { setIndex(i => Math.max(0, i - 1)); setNote(''); }}
              disabled={index === 0}
            >
              ← Previous
            </button>
            <span className="kyc-counter">
              Case {index + 1} of {queue.length}
            </span>
            <button
              className="admin-btn ghost"
              onClick={() => { setIndex(i => Math.min(queue.length - 1, i + 1)); setNote(''); }}
              disabled={index === queue.length - 1}
            >
              Next →
            </button>
            <span className={`admin-badge ${current.status}`} style={{ marginLeft: 'auto' }}>
              {current.status.charAt(0).toUpperCase() + current.status.slice(1)}
            </span>
          </div>

          {/* ── Document + Selfie Side-by-Side ── */}
          <div className="kyc-panel">
            <div className="kyc-doc-frame">
              <div className="kyc-doc-header">Identity Document</div>
              <img
                src={current.docUrl}
                alt="Identity document"
                style={{ minHeight: 220, objectFit: 'contain' }}
              />
            </div>
            <div className="kyc-doc-frame">
              <div className="kyc-doc-header">Selfie</div>
              <img
                src={current.selfieUrl}
                alt="Applicant selfie"
                style={{ minHeight: 220, objectFit: 'cover' }}
              />
            </div>
          </div>

          {/* ── Applicant Info ── */}
          <div className="kyc-info-panel">
            <h3 style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.9rem' }}>
              Applicant Information
            </h3>
            <div className="kyc-info-grid">
              <div className="kyc-info-item">
                <label>Full Name</label>
                <span>{current.name}</span>
              </div>
              <div className="kyc-info-item">
                <label>NIC / Passport</label>
                <span style={{ fontFamily: 'monospace' }}>{current.nic}</span>
              </div>
              <div className="kyc-info-item">
                <label>Phone</label>
                <span>{current.phone}</span>
              </div>
              <div className="kyc-info-item">
                <label>Submitted</label>
                <span>{formatDate(current.submittedAt)}</span>
              </div>
            </div>
          </div>

          {/* ── Review Actions ── */}
          <div className="kyc-info-panel">
            <h3 style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.75rem' }}>
              Review Decision
            </h3>
            <textarea
              className="kyc-note-area"
              placeholder="Add remarks or notes about this KYC review (optional)…"
              value={note}
              onChange={e => setNote(e.target.value)}
            />
            <div className="kyc-actions">
              <button
                className="admin-btn success"
                style={{ padding: '0.6rem 1.5rem', fontSize: '0.9rem' }}
                onClick={() => updateStatus('approved')}
                disabled={current.status === 'approved'}
              >
                ✓ Approve
              </button>
              <button
                className="admin-btn danger"
                style={{ padding: '0.6rem 1.5rem', fontSize: '0.9rem' }}
                onClick={() => updateStatus('rejected')}
                disabled={current.status === 'rejected'}
              >
                ✕ Reject
              </button>
              <button
                className="admin-btn warning"
                style={{ padding: '0.6rem 1.5rem', fontSize: '0.9rem' }}
                onClick={() => updateStatus('flagged')}
                disabled={current.status === 'flagged'}
              >
                ⚑ Flag for Review
              </button>
            </div>
          </div>
        </>
      )}
    </>
  );
}
