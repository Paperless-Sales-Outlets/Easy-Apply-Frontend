import React, { useState, useEffect } from 'react';
import { getKycQueue, reviewKycApplication } from '../services/adminService';
import { getAssetUrl } from '../utils/applicationUtils';

function formatDate(iso) {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
  });
}

const PRIMARY_DOC_KEYS = ['passportDoc', 'nicFront', 'brcDoc'];
const SECONDARY_DOC_KEYS = ['nicBack', 'vatDoc', 'taxExemptionDoc'];

function pickDoc(docs, keys) {
  for (const key of keys) {
    const doc = docs.find(d => d.key === key);
    if (doc) return doc;
  }
  return null;
}

function DocImage({ url, alt, style }) {
  const [failed, setFailed] = useState(false);
  const src = getAssetUrl(url);
  if (!src) {
    return <div className="kyc-doc-missing" style={{ minHeight: 220 }}>{alt || 'No image'}</div>;
  }
  if (failed) {
    return <div className="kyc-doc-missing" style={{ minHeight: 220 }}>Could not load image</div>;
  }
  return (
    <img src={src} alt={alt} style={{ minHeight: 220, objectFit: 'contain', ...style }} onError={() => setFailed(true)} />
  );
}

export default function KycReviewPage() {
  const [queue, setQueue]     = useState([]);
  const [index, setIndex]     = useState(0);
  const [note, setNote]       = useState('');
  const [toast, setToast]     = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);
  const [busy, setBusy]       = useState(false);

  const current = queue[index];

  const showToast = (msg, type) => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const loadQueue = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getKycQueue();
      setQueue(data.queue || []);
      setIndex(0);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to load KYC queue.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadQueue();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const searchResults = searchQuery.trim()
    ? queue.filter(k => {
        const q = searchQuery.trim().toLowerCase();
        return (
          k.name?.toLowerCase().includes(q) ||
          k.nic?.toLowerCase().includes(q) ||
          k.phone?.toLowerCase().includes(q) ||
          k.status?.toLowerCase().includes(q)
        );
      })
    : [];

  const jumpToResult = (item) => {
    setIndex(queue.indexOf(item));
    setSearchQuery('');
    setNote('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const updateStatus = async (status) => {
    if (!current || busy) return;
    setBusy(true);
    try {
      await reviewKycApplication(current.id, status, note.trim());
      const updated = queue.map((k, i) => i === index ? { ...k, status, notes: note.trim() } : k);
      setQueue(updated);
      showToast(`KYC ${status} successfully.`, status === 'approved' ? 'success' : status === 'rejected' ? 'danger' : 'warning');
      setNote('');
      const next = updated.findIndex((k, i) => i > index && k.status === 'pending');
      if (next !== -1) setIndex(next);
    } catch (err) {
      showToast(err.response?.data?.message || err.message || 'Review failed. Please try again.', 'danger');
    } finally {
      setBusy(false);
    }
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

      {loading ? (
        <div className="admin-empty">
          <p>Loading KYC review queue…</p>
        </div>
      ) : error ? (
        <div className="admin-empty">
          <p>{error}</p>
          <button className="admin-btn" style={{ marginTop: '0.75rem' }} onClick={loadQueue}>
            Retry
          </button>
        </div>
      ) : queue.length === 0 || !current ? (
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
              {(current.status || 'pending').charAt(0).toUpperCase() + (current.status || 'pending').slice(1)}
            </span>
          </div>

          {/* ── Document + Reverse / Face Side-by-Side ── */}
          <div className="kyc-panel">
            <div className="kyc-doc-frame">
              <div className="kyc-doc-header">Identity Document</div>
              <DocImage
                url={(pickDoc(current.documents || [], PRIMARY_DOC_KEYS) || (current.documents || [])[0])?.url}
                alt="Identity document"
              />
            </div>
            <div className="kyc-doc-frame">
              <div className="kyc-doc-header">
                {current.selfieUrl ? 'Face Validation' : 'Document Reverse'}
              </div>
              {current.selfieUrl ? (
                <DocImage url={current.selfieUrl} alt="Applicant selfie" style={{ objectFit: 'cover' }} />
              ) : (
                <DocImage
                  url={(pickDoc(current.documents || [], SECONDARY_DOC_KEYS) || (current.documents || []).find(d => d.key !== (pickDoc(current.documents || [], PRIMARY_DOC_KEYS) || (current.documents || [])[0])?.key))?.url}
                  alt="Reverse side document"
                />
              )}
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
                disabled={busy || current.status === 'approved'}
              >
                ✓ Approve
              </button>
              <button
                className="admin-btn danger"
                style={{ padding: '0.6rem 1.5rem', fontSize: '0.9rem' }}
                onClick={() => updateStatus('rejected')}
                disabled={busy || current.status === 'rejected'}
              >
                ✕ Reject
              </button>
              <button
                className="admin-btn warning"
                style={{ padding: '0.6rem 1.5rem', fontSize: '0.9rem' }}
                onClick={() => updateStatus('flagged')}
                disabled={busy || current.status === 'flagged'}
              >
                ⚑ Flag for Review
              </button>
            </div>
          </div>
        </>
      )}

      {/* ── Search KYC Queue ── */}
      <div className="kyc-search">
        <h3 className="kyc-search-title">Search KYC Queue</h3>
        <p className="kyc-search-sub">
          Find an application by name, NIC / passport, phone, or status to jump straight to it.
        </p>
        <div className="admin-search" style={{ minWidth: 0 }}>
          <svg className="admin-search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
          </svg>
          <input
            type="text"
            placeholder="Search the review queue…"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            aria-label="Search KYC queue"
          />
        </div>
        {searchResults.length > 0 && (
          <div className="kyc-search-results">
            {searchResults.map(item => (
              <button
                key={item.id}
                className="kyc-search-result"
                onClick={() => jumpToResult(item)}
              >
                <span className="kyc-search-result-name">
                  {item.name}
                  <span className="kyc-search-result-nic">{item.nic}</span>
                </span>
                <span className={`admin-badge ${item.status}`}>
                  {(item.status || 'pending').charAt(0).toUpperCase() + (item.status || 'pending').slice(1)}
                </span>
                <span className="kyc-search-result-phone">{item.phone}</span>
              </button>
            ))}
          </div>
        )}
        {searchQuery.trim() && searchResults.length === 0 && (
          <div className="kyc-search-no-results">No applications match “{searchQuery.trim()}”.</div>
        )}
      </div>
    </>
  );
}
