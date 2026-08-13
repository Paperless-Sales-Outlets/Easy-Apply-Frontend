import React, { useEffect } from 'react';
import {
  formatDate,
  getAssetUrl,
  serviceLabel,
  statusBadgeClass,
  statusLabel,
} from '../utils/applicationUtils';

const DOC_LABELS = {
  nicFront: 'NIC Front',
  nicBack: 'NIC Back',
  passportDoc: 'Passport',
  brcDoc: 'Business Registration',
  brc: 'Business Registration',
  vatDoc: 'VAT Certificate',
  taxExemptionDoc: 'Tax Exemption Certificate',
  proofOfAddress: 'Proof of Address',
  authorizationLetter: 'Authorization Letter',
  sketchFile: 'Site Sketch',
  signature: 'Signature',
  signatureUpload: 'Signature Upload',
  signatureFile: 'Signature',
};

// File-like fields are rendered in the Documents section, not the data grid.
const FILE_FIELD_KEYS = new Set([
  'documents', 'signature', 'signatureUpload', 'signatureFile', 'digitalSignature',
  'signatureBase64', 'digitalSignatureBase64', 'proofOfAddress', 'authorizationLetter',
  'sketchFile', 'brcFile', 'brc', 'nicFront', 'nicBack', 'passportDoc', 'brcDoc',
  'vatDoc', 'taxExemptionDoc',
]);

function looksLikeFileString(value) {
  return (
    typeof value === 'string' &&
    (value.startsWith('/uploads/') || value.startsWith('http') || value.startsWith('data:'))
  );
}

function flattenFormData(obj, prefix = '', acc = []) {
  Object.entries(obj || {}).forEach(([key, value]) => {
    const label = prefix ? `${prefix}.${key}` : key;
    if (!prefix && FILE_FIELD_KEYS.has(key)) return;
    if (value === null || value === undefined || value === '') return;

    if (typeof value === 'object' && !Array.isArray(value)) {
      if (value.name || value.path || value.url || value.preview) return; // file object
      flattenFormData(value, label, acc);
      return;
    }

    if (Array.isArray(value)) {
      if (value.length === 0) return;
      if (typeof value[0] === 'object') {
        acc.push({ key: label, value: `${value.length} item(s)` });
      } else {
        acc.push({ key: label, value: value.join(', ') });
      }
      return;
    }

    if (typeof value === 'string' && (looksLikeFileString(value) || value.length > 400)) return;
    acc.push({ key: label, value: String(value) });
  });
  return acc;
}

function collectDocuments(formData) {
  const docs = formData?.documents && typeof formData.documents === 'object' ? formData.documents : {};
  const all = { ...(formData || {}), ...docs };
  const items = [];

  Object.entries(all).forEach(([key, value]) => {
    if (key === 'documents') return;
    let url = '';
    if (typeof value === 'string' && (value.startsWith('/uploads/') || value.startsWith('http') || value.startsWith('data:'))) {
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

export default function ApplicationDetailModal({ application, onClose }) {
  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'Escape') onClose?.();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  if (!application) return null;

  const rows = flattenFormData(application.formData);
  const docs = collectDocuments(application.formData);

  return (
    <div className="admin-modal-overlay" onClick={onClose}>
      <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
        <div className="admin-modal-header">
          <div>
            <h3>{application.referenceNumber}</h3>
            <div className="admin-modal-subtitle">
              {serviceLabel(application.serviceType)}
              <span className={`admin-badge ${statusBadgeClass(application.status)}`}>
                {statusLabel(application.status)}
              </span>
            </div>
          </div>
          <button type="button" className="admin-modal-close" onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>

        <div className="admin-modal-body">
          <div className="admin-modal-meta">
            <div><span>Applicant</span><strong>{application.name || '—'}</strong></div>
            <div><span>NIC</span><strong>{application.nic || '—'}</strong></div>
            <div><span>Phone</span><strong>{application.phone || '—'}</strong></div>
            <div><span>Email</span><strong>{application.email || '—'}</strong></div>
            <div><span>Address</span><strong>{application.address || '—'}</strong></div>
            <div><span>Submitted</span><strong>{formatDate(application.submittedAt)}</strong></div>
          </div>

          <h4>Form Data</h4>
          {rows.length === 0 ? (
            <p className="admin-modal-empty">No additional form data captured.</p>
          ) : (
            <div className="admin-form-grid">
              {rows.map((row) => (
                <div className="admin-form-field" key={row.key}>
                  <span>{row.key}</span>
                  <strong>{row.value}</strong>
                </div>
              ))}
            </div>
          )}

          <h4>Documents</h4>
          {docs.length === 0 ? (
            <p className="admin-modal-empty">No documents attached.</p>
          ) : (
            <div className="admin-doc-grid">
              {docs.map((doc) => {
                const url = getAssetUrl(doc.url);
                return (
                  <a className="admin-doc-item" key={doc.key} href={url} target="_blank" rel="noreferrer">
                    {isImageUrl(url) ? (
                      <img src={url} alt={doc.label} loading="lazy" />
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
      </div>
    </div>
  );
}
