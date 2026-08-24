import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import {
  formatDate,
  getAssetUrl,
  serviceLabel,
  statusBadgeClass,
  statusLabel,
} from '../utils/applicationUtils';
import { updateOfficeFields, createAppointment } from '../services/adminService';

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
      if (value.name || value.path || value.url || value.preview) return;
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

function toInputDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return '';
  return d.toISOString().slice(0, 10);
}

export default function ApplicationDetailModal({ application, onClose }) {
  const [officeFields, setOfficeFields] = useState({
    crNumber: '',
    amountPaid: '',
    staffSignature: '',
    appointmentDate: '',
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (application) {
      const of = application.officeFields || {};
      setOfficeFields({
        crNumber: of.crNumber || '',
        amountPaid: of.amountPaid != null ? of.amountPaid : '',
        staffSignature: of.staffSignature || '',
        appointmentDate: toInputDate(of.appointmentDate),
      });
    }
  }, [application]);

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

  const handleOfficeChange = (field, value) => {
    setOfficeFields(prev => ({ ...prev, [field]: value }));
  };

  const handleSaveOffice = async () => {
    setSaving(true);
    try {
      const payload = {
        crNumber: officeFields.crNumber || '',
        amountPaid: officeFields.amountPaid !== '' ? Number(officeFields.amountPaid) : null,
        staffSignature: officeFields.staffSignature || '',
        appointmentDate: officeFields.appointmentDate || null,
      };
      await updateOfficeFields(application.id, payload);

      // Auto-create appointment when appointment date is set
      if (officeFields.appointmentDate) {
        const scheduledAt = new Date(officeFields.appointmentDate);
        scheduledAt.setHours(9, 0, 0, 0); // default to 09:00

        await createAppointment({
          applicationId: application.id,
          referenceNumber: application.referenceNumber || '',
          customer: application.name || '',
          customerName: application.name || '',
          phone: application.phone || '',
          address: application.address || '',
          serviceType: application.serviceType || 'new-connection',
          scheduledAt: scheduledAt.toISOString(),
          notes: `Auto-created from application ${application.referenceNumber}`,
        });
        toast.success('Office fields saved & appointment created');
      } else {
        toast.success('Office fields saved');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save office fields');
    } finally {
      setSaving(false);
    }
  };

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

          {/* ── Office Processing ── */}
          <h4>Office Processing</h4>
          <div className="admin-form-grid" style={{ marginBottom: '1rem' }}>
            <div className="admin-form-field">
              <span>CR Number</span>
              <input
                type="text"
                value={officeFields.crNumber}
                onChange={(e) => handleOfficeChange('crNumber', e.target.value)}
                placeholder="Enter CR number"
                style={{
                  width: '100%', padding: '0.55rem 0.75rem', border: '1px solid var(--line)',
                  borderRadius: '8px', fontSize: '0.88rem', fontFamily: 'inherit',
                }}
              />
            </div>
            <div className="admin-form-field">
              <span>Amount Paid (LKR)</span>
              <input
                type="number"
                min="0"
                step="0.01"
                value={officeFields.amountPaid}
                onChange={(e) => handleOfficeChange('amountPaid', e.target.value)}
                placeholder="0.00"
                style={{
                  width: '100%', padding: '0.55rem 0.75rem', border: '1px solid var(--line)',
                  borderRadius: '8px', fontSize: '0.88rem', fontFamily: 'inherit',
                }}
              />
            </div>
            <div className="admin-form-field">
              <span>Staff Signature</span>
              <input
                type="text"
                value={officeFields.staffSignature}
                onChange={(e) => handleOfficeChange('staffSignature', e.target.value)}
                placeholder="Staff member name"
                style={{
                  width: '100%', padding: '0.55rem 0.75rem', border: '1px solid var(--line)',
                  borderRadius: '8px', fontSize: '0.88rem', fontFamily: 'inherit',
                }}
              />
            </div>
            <div className="admin-form-field">
              <span>Appointment Date</span>
              <input
                type="date"
                value={officeFields.appointmentDate}
                onChange={(e) => handleOfficeChange('appointmentDate', e.target.value)}
                style={{
                  width: '100%', padding: '0.55rem 0.75rem', border: '1px solid var(--line)',
                  borderRadius: '8px', fontSize: '0.88rem', fontFamily: 'inherit',
                }}
              />
            </div>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem' }}>
            <button
              type="button"
              onClick={handleSaveOffice}
              disabled={saving}
              className="admin-btn primary"
              style={{ minWidth: '140px' }}
            >
              {saving ? 'Saving…' : 'Save Office Fields'}
            </button>
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
