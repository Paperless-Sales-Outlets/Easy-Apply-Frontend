import React, { useEffect, useMemo, useState } from 'react';
import { FiCheck, FiCopy, FiFlag, FiMessageSquare, FiX } from 'react-icons/fi';
import {
  formatDate,
  getAssetUrl,
  serviceLabel,
  statusBadgeClass,
  statusLabel,
} from '../utils/applicationUtils';
import AuthImage from './AuthImage';
import AdminNotice, { useAdminNotice } from './AdminNotice';
import { updateApplicationStatus } from '../services/adminService';
import { getFormSections } from '../utils/formDataSchema';

const DOC_LABELS = {
  nicFront: 'NIC Front',
  nicBack: 'NIC Back',
  facePhoto: 'Live Face Photo',
  passportDoc: 'Passport',
  brcDoc: 'Business Registration',
  brc: 'Business Registration',
  vatDoc: 'VAT Certificate',
  taxExemptionDoc: 'Tax Exemption Certificate',
  proofOfAddress: 'Proof of Address',
  authorizationLetter: 'Authorization Letter',
  sketchFile: 'Site Sketch',
  premisesPhoto: 'Premises Photo',
  signature: 'Signature',
  signatureUpload: 'Signature Upload',
  signatureFile: 'Signature',
  signatureDoc: 'Signature Document',
  digitalSignature: 'Digital Signature',
  receiptUpload: 'Payment Receipt',
  paymentReceipt: 'Payment Receipt',
  requestDocument: 'Request Document',
  newOwnerNicPdf: 'New Owner NIC (PDF)',
  newOwnerNicFront: 'New Owner NIC Front',
  newOwnerNicBack: 'New Owner NIC Back',
};

const TABS = [
  { id: 'data', label: 'Application data' },
  { id: 'documents', label: 'Documents' },
];

// GridFS references (gridfs://<id> or a bare 24-hex id) are served by the protected /api/files/:id route
function fileRefToUrl(value) {
  if (typeof value !== 'string') return '';
  if (value.startsWith('gridfs://')) return `/api/files/${value.slice(9)}`;
  if (/^[0-9a-f]{24}$/i.test(value)) return `/api/files/${value}`;
  return value;
}

function collectDocuments(formData) {
  const docs = formData?.documents && typeof formData.documents === 'object' ? formData.documents : {};
  const all = { ...(formData || {}), ...docs };
  const items = [];

  Object.entries(all).forEach(([key, value]) => {
    if (key === 'documents') return;
    let url = '';
    value = fileRefToUrl(value);
    if (typeof value === 'string' && (value.startsWith('/api/files/') || value.startsWith('/uploads/') || value.startsWith('http') || value.startsWith('data:'))) {
      url = value;
    } else if (value && typeof value === 'object' && !Array.isArray(value)) {
      url = value.url || value.path || value.preview || '';
    }
    if (url) {
      items.push({ key, label: DOC_LABELS[key] || key, url });
    }
  });

  return items;
}

function isImageUrl(url) {
  return /\.(png|jpe?g|gif|webp|bmp|svg)$/i.test(url) || url.startsWith('data:image');
}

function getInitials(name) {
  const parts = String(name || '').trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

export default function ApplicationDetailModal({ application, onClose, onUpdated }) {
  const [activeTab, setActiveTab] = useState('data');
  const [copied, setCopied] = useState(false);
  const [localStatus, setLocalStatus] = useState('pending');
  const [localNotes, setLocalNotes] = useState('');
  const [comment, setComment] = useState('');
  const [busy, setBusy] = useState(false);
  const notice = useAdminNotice(4000);

  useEffect(() => {
    if (application) {
      setActiveTab('data');
      setCopied(false);
      setLocalStatus(application.status || 'pending');
      setLocalNotes(application.notes || '');
      setComment(application.notes || '');
      setBusy(false);
    }
  }, [application]);

  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'Escape') onClose?.();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previous;
    };
  }, []);

  const sections = useMemo(
    () => getFormSections(application?.serviceType, application?.formData),
    [application],
  );
  const docs = useMemo(() => collectDocuments(application?.formData), [application]);

  if (!application) return null;

  const handleCopyRef = async () => {
    const value = application.referenceNumber || '';
    if (!value) return;
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      notice.error('Could not copy the reference number.');
    }
  };

  const applyUpdate = (extra) => {
    onUpdated?.({ ...application, ...extra });
  };

  const runStatus = async (status) => {
    setBusy(true);
    try {
      const notes = comment.trim() || localNotes || '';
      const res = await updateApplicationStatus(application.id, status, notes);
      const nextNotes = res.application?.notes ?? notes;
      setLocalStatus(status);
      setLocalNotes(nextNotes);
      setComment(nextNotes);
      notice.success(`Application marked as ${statusLabel(status)}.`);
      applyUpdate({
        status,
        notes: nextNotes,
        actionedBy: res.application?.actionedBy,
        actionedAt: res.application?.actionedAt,
      });
    } catch (err) {
      notice.error(err.response?.data?.message || 'Failed to update status');
    } finally {
      setBusy(false);
    }
  };

  const saveComment = async () => {
    const text = comment.trim();
    if (!text) {
      notice.error('Enter a comment before saving.');
      return;
    }
    setBusy(true);
    try {
      const res = await updateApplicationStatus(application.id, localStatus, text);
      const nextNotes = res.application?.notes ?? text;
      setLocalNotes(nextNotes);
      setComment(nextNotes);
      notice.success('Comment saved.');
      applyUpdate({
        notes: nextNotes,
        actionedBy: res.application?.actionedBy,
        actionedAt: res.application?.actionedAt,
      });
    } catch (err) {
      notice.error(err.response?.data?.message || 'Failed to save comment');
    } finally {
      setBusy(false);
    }
  };

  const actionerName = application.actionedBy
    ? (application.actionedBy.name || application.actionedBy.email || '')
    : '';

  return (
    <div className="admin-modal-overlay" onClick={onClose}>
      <div className="admin-modal ax-modal adm-modal-wide" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-labelledby="adm-title">
        <div className="ax-modal-head">
          <span className="ax-modal-head-deco" aria-hidden="true" />
          <div className="ax-modal-identity">
            <span className="ax-modal-avatar" aria-hidden="true">{getInitials(application.name)}</span>
            <div>
              <span className="ax-modal-eyebrow">{serviceLabel(application.serviceType)} application</span>
              <h3 id="adm-title">{application.name || 'Unknown applicant'}</h3>
              <div className="ax-modal-sub">
                <span className="ax-mono-chip adm-ref-chip-x">
                  {application.referenceNumber}
                  <button
                    type="button"
                    className="adm-ref-copy-x"
                    onClick={handleCopyRef}
                    aria-label="Copy reference number"
                    title={copied ? 'Copied' : 'Copy reference number'}
                  >
                    {copied ? <FiCheck size={12} /> : <FiCopy size={12} />}
                  </button>
                </span>
                <span className={`admin-badge ax-head-badge ${statusBadgeClass(localStatus)}`}>
                  {statusLabel(localStatus)}
                </span>
                {application.submittedAt && <span>Submitted {formatDate(application.submittedAt)}</span>}
              </div>
            </div>
          </div>
          <button type="button" className="ax-modal-close" onClick={onClose} aria-label="Close">×</button>
        </div>

        <nav className="adm-tabs" aria-label="Application details">
          {TABS.map((tab) => (
            <button
              type="button"
              key={tab.id}
              className={`adm-tab${activeTab === tab.id ? ' is-active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
              {tab.id === 'documents' && docs.length > 0 && (
                <span className="adm-tab-count">{docs.length}</span>
              )}
            </button>
          ))}
        </nav>

        <div className="ax-modal-body adm-modal-body">
          {activeTab !== 'data' && <AdminNotice notice={notice.notice} onDismiss={notice.dismiss} />}
          {activeTab === 'data' && (
            <div className="adm-data">
              <div className="adm-customer-card">
                <span className="adm-customer-avatar" aria-hidden="true">{getInitials(application.name)}</span>
                <div className="adm-customer-text">
                  <div className="adm-customer-name">{application.name || 'Unknown applicant'}</div>
                  <div className="adm-customer-meta">
                    {application.phone && <span>{application.phone}</span>}
                    {application.email && <span>{application.email}</span>}
                  </div>
                </div>
                <span className="adm-customer-ref">{formatDate(application.submittedAt)}</span>
              </div>

              {sections.length === 0 ? (
                <p className="admin-modal-empty">No customer data captured for this application.</p>
              ) : (
                sections.map((section, index) => (
                  <section className="adm-data-section" key={section.title}>
                    <h4 className="adm-section-title">
                      <span className="adm-step-index">{index + 1}</span>
                      {section.title}
                    </h4>
                    <div className="adm-data-grid">
                      {section.entries.map((entry) => (
                        <div className="adm-data-field" key={entry.key}>
                          <span className="adm-data-label">{entry.label}</span>
                          <strong className="adm-data-value">{entry.display}</strong>
                        </div>
                      ))}
                    </div>
                  </section>
                ))
              )}

              <section className="adm-verify">
                <h4 className="adm-section-title">Verification &amp; Actions</h4>
                <p className="adm-verify-hint">
                  Review the customer details above, then approve, reject or flag the application.
                  A comment is saved with the decision.
                </p>
                <label className="adm-comment-field">
                  <span>Admin comment</span>
                  <textarea
                    rows={3}
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Add a note for the applicant file (optional)"
                  />
                </label>
                {localNotes && actionerName && (
                  <p className="adm-comment-author">Last updated by {actionerName}</p>
                )}
                <div className="adm-verify-actions">
                  <button
                    type="button"
                    className="adm-action approve"
                    disabled={busy || localStatus === 'approved'}
                    onClick={() => runStatus('approved')}
                  >
                    <FiCheck size={15} /> Approve
                  </button>
                  <button
                    type="button"
                    className="adm-action reject"
                    disabled={busy || localStatus === 'rejected'}
                    onClick={() => runStatus('rejected')}
                  >
                    <FiX size={15} /> Reject
                  </button>
                  <button
                    type="button"
                    className="adm-action flag"
                    disabled={busy || localStatus === 'flagged'}
                    onClick={() => runStatus('flagged')}
                  >
                    <FiFlag size={15} /> Flag
                  </button>
                  <button
                    type="button"
                    className="adm-action ghost"
                    disabled={busy}
                    onClick={saveComment}
                  >
                    <FiMessageSquare size={15} /> Save comment
                  </button>
                </div>
                <div className="adm-verify-notice">
                  <AdminNotice notice={notice.notice} onDismiss={notice.dismiss} />
                </div>
              </section>
            </div>
          )}

          {activeTab === 'documents' && (
            <div>
              {docs.length === 0 ? (
                <p className="admin-modal-empty">No documents attached.</p>
              ) : (
                <div className="admin-doc-grid">
                  {docs.map((doc) => {
                    const url = getAssetUrl(doc.url);
                    const isFile = doc.url.startsWith('/api/files/');
                    return (
                      <a className="admin-doc-item" key={doc.key} href={isFile ? undefined : url} target="_blank" rel="noreferrer">
                        {isFile || isImageUrl(url) ? (
                          <AuthImage url={doc.url} alt={doc.label} style={{ height: 96, minHeight: 96 }} />
                        ) : (
                          <span className="admin-doc-fallback">PDF</span>
                        )}
                        <span className="admin-doc-label">{doc.label}</span>
                      </a>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
