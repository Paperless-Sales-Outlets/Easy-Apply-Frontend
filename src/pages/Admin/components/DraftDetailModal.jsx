import React from 'react';
import { formatDate, formatDateTime } from '../utils/leadUtils';
import { getFormSections } from '../utils/formDataSchema';

const ICON_ALERT = (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z" />
    <line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
);

const PHOTO_LABELS = {
  nicFront: 'NIC front',
  nicBack: 'NIC back',
  facePhoto: 'Face photo',
};

const STEP_HINTS = {
  location: 'They left before finishing the customer and installation location details.',
  loop: 'They stopped at the fibre availability check for the site.',
  identity: 'They stopped while adding identity and KYC documents.',
  signature: 'They reached the declaration but did not complete the signature.',
  payment: 'They stopped at payment. Check the package price or the payment method.',
  review: 'They reached the final review. The summary or submission step may have confused them.',
};

function Field({ label, value }) {
  return (
    <div className="lm-field">
      <span className="lm-field-label">{label}</span>
      <span className="lm-field-value">{value || '—'}</span>
    </div>
  );
}

export default function DraftDetailModal({ draft, loading, error, onClose }) {
  if (!draft && !loading) return null;

  const formData = draft?.formData || {};
  const sections = draft
    ? getFormSections('new-connection', { ...formData, product: draft.selectedProduct || formData.product })
    : [];
  const photos = draft?.photos || {};
  const photoEntries = Object.entries(photos).filter(([, value]) => Boolean(value));

  const hint = draft?.isExpired
    ? 'The 30-day continuation window has passed. This draft can no longer be resumed by the customer.'
    : STEP_HINTS[draft?.stepKey] || 'The customer did not finish the application.';

  return (
    <div className="admin-modal-overlay" onClick={onClose}>
      <div className="admin-modal ax-modal lm-modal lm-detail-modal" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-labelledby="draft-detail-title">
        <div className="ax-modal-head">
          <span className="ax-modal-head-deco" aria-hidden="true" />
          <div className="ax-modal-identity">
            <span className="ax-modal-avatar">
              {draft?.customerName?.split(' ').filter(Boolean).map((n) => n[0]).slice(0, 2).join('').toUpperCase() || 'D'}
            </span>
            <div>
              <span className="ax-modal-eyebrow">Unfinished application</span>
              <h3 id="draft-detail-title">{draft?.customerName || (loading ? 'Loading…' : 'Draft')}</h3>
              <div className="ax-modal-sub">
                <span className="ax-mono-chip">{draft?.referenceNumber || '—'}</span>
                <span>{draft?.packageName || 'No package selected'}</span>
                {draft && <span>· {draft.phone}</span>}
              </div>
            </div>
          </div>
          <button type="button" className="ax-modal-close" onClick={onClose} aria-label="Close">×</button>
        </div>

        <div className="ax-modal-body">
          {error && <div className="admin-error-banner" role="alert">{error}</div>}

          {loading && (
            <div className="dash-table-skeleton">
              {Array.from({ length: 4 }).map((_, i) => <div className="dash-skeleton dash-skeleton-row" key={i} />)}
            </div>
          )}

          {draft && (
            <>
              <div className={`lm-banner ${draft.isExpired ? 'lm-banner--bad' : 'lm-banner--warn'}`} role="alert">
                <span className="lm-banner-icon">{ICON_ALERT}</span>
                <div>
                  <strong>{draft.reason}</strong>
                  <p>{hint}</p>
                </div>
              </div>

              <div className="lmx-summary">
                <div className="lmx-summary-item">
                  <span>Status</span>
                  <span className={`lm-pill lm-pill--${draft.isExpired ? 'bad' : 'info'}`}>
                    {draft.isExpired ? 'Expired' : 'In progress'}
                  </span>
                </div>
                <div className="lmx-summary-item lmx-summary-checks">
                  <span>Reached</span>
                  <strong>{draft.stepLabel}</strong>
                  <span className="lmx-summary-track" aria-hidden="true"><span style={{ width: `${draft.progress}%` }} /></span>
                </div>
                <div className="lmx-summary-item">
                  <span>Started</span>
                  <strong>{formatDate(draft.createdAt)}</strong>
                </div>
                <div className="lmx-summary-item">
                  <span>Last activity</span>
                  <strong>{formatDateTime(draft.updatedAt)}</strong>
                </div>
                <div className="lmx-summary-item">
                  <span>{draft.isExpired ? 'Expired on' : 'Resume until'}</span>
                  <strong>{formatDate(draft.isExpired ? draft.expiredAt : draft.resumeUntil)}</strong>
                </div>
              </div>

              <section className="lm-section">
                <h4 className="lm-section-title">Customer &amp; site</h4>
                <div className="lm-fields">
                  <Field label="Contact number" value={draft.phone} />
                  <Field label="Email" value={draft.email} />
                  <Field label="NIC" value={draft.nic} />
                  <Field label="City" value={draft.city} />
                  <Field label="District" value={draft.district} />
                  <Field label="Package" value={draft.packageName} />
                  <Field label="Speed" value={draft.speed} />
                  <Field label="Monthly price" value={draft.monthlyPrice ? `Rs. ${draft.monthlyPrice}` : ''} />
                  <Field label="Payment" value={draft.paymentCompleted ? 'Completed' : draft.hasPayment ? 'Started' : 'Not started'} />
                  <Field label="Technology" value={draft.technology} />
                </div>
                <div className="lm-address">
                  <div>
                    <strong>{draft.address || 'No installation address saved'}</strong>
                  </div>
                </div>
              </section>

              {photoEntries.length > 0 && (
                <section className="lm-section">
                  <h4 className="lm-section-title">Captured photos</h4>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '0.75rem' }}>
                    {photoEntries.map(([field, value]) => (
                      <figure key={field} style={{ margin: 0, border: '1px solid #e3ebf6', borderRadius: 12, overflow: 'hidden', background: '#f7faff' }}>
                        <img src={value} alt={PHOTO_LABELS[field] || field} style={{ display: 'block', width: '100%', height: 120, objectFit: 'cover' }} />
                        <figcaption style={{ padding: '0.45rem 0.6rem', fontSize: '0.72rem', fontWeight: 600, color: 'var(--muted)' }}>
                          {PHOTO_LABELS[field] || field}
                        </figcaption>
                      </figure>
                    ))}
                  </div>
                </section>
              )}

              {sections.map((section) => (
                <section className="lm-section" key={section.title}>
                  <h4 className="lm-section-title">{section.title}</h4>
                  <div className="lm-fields">
                    {section.entries.map((entry) => (
                      <Field key={entry.key} label={entry.label} value={entry.display} />
                    ))}
                  </div>
                </section>
              ))}

              {sections.length === 0 && (
                <p className="lm-muted">No form fields were saved before the customer left.</p>
              )}
            </>
          )}
        </div>

        <div className="ax-modal-foot">
          <button type="button" className="admin-btn primary" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}
