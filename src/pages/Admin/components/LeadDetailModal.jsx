import React, { useRef, useState } from 'react';
import {
  LEAD_RESOLUTION_META,
  LEAD_RESOLUTION_OPTIONS,
  LEAD_STATUS_OPTIONS,
  checkStatusLabel,
  checkStatusTone,
  displayReading,
  formatDate,
  formatDateTime,
  leadRiskLabel,
  leadRiskTone,
  leadStatusLabel,
  leadStatusTone,
  signalStrengthPercent,
  signalStrengthTone,
  sourceLabel,
} from '../utils/leadUtils';

const ICON_SIGNAL = (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 12h4l3 8 4-16 3 8h4" />
  </svg>
);

const ICON_LOCATION = (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0Z" /><circle cx="12" cy="10" r="3" />
  </svg>
);

const ICON_ALERT = (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z" />
    <line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
);

function Field({ label, value }) {
  return (
    <div className="lm-field">
      <span className="lm-field-label">{label}</span>
      <span className="lm-field-value">{value || '—'}</span>
    </div>
  );
}

// The read-only view of one lead, with the actions that close the loop:
// record the survey, or decide what happens to a site that cannot be served.
export default function LeadDetailModal({
  lead,
  onClose,
  onRecordSurvey,
  onResolve,
  onEdit,
  onStatusChange,
  onDelete,
}) {
  const [resolving, setResolving] = useState(false);
  const [resolution, setResolution] = useState(lead?.resolution || '');
  const [resolutionNote, setResolutionNote] = useState(lead?.resolutionNote || '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const resolveRef = useRef(null);

  if (!lead) return null;

  const checks = lead.checks || [];
  const signalCheck = checks.find((c) => c.key === 'signal-strength');
  const signalValue = signalCheck?.value || '';
  const signalPct = signalStrengthPercent(signalValue);
  const signalTone = signalStrengthTone(signalValue);
  const blocking = lead.blockingIssues || [];
  const cleared = checks.filter((c) => ['pass', 'waived', 'na'].includes(c.status)).length;

  const handleResolve = async (e) => {
    e.preventDefault();
    setError('');
    if (!resolution) {
      setError('Choose how this lead should be handled.');
      return;
    }
    setSaving(true);
    try {
      await onResolve({ resolution, note: resolutionNote });
      setSaving(false);
      setResolving(false);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to save the decision.');
      setSaving(false);
    }
  };

  const pctCleared = checks.length ? Math.round((cleared / checks.length) * 100) : 0;

  const openResolve = () => {
    setResolving(true);
    setTimeout(() => resolveRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' }), 30);
  };

  return (
    <div className="admin-modal-overlay" onClick={saving ? undefined : onClose}>
      <div className="admin-modal ax-modal lm-modal lm-detail-modal" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-labelledby="lm-detail-title">
        <div className="ax-modal-head">
          <span className="ax-modal-head-deco" aria-hidden="true" />
          <div className="ax-modal-identity">
            <span className="ax-modal-avatar">
              {lead.customerName?.split(' ').filter(Boolean).map((n) => n[0]).slice(0, 2).join('').toUpperCase() || 'L'}
            </span>
            <div>
              <span className="ax-modal-eyebrow">New connection lead</span>
              <h3 id="lm-detail-title">{lead.customerName}</h3>
              <div className="ax-modal-sub">
                <span className="ax-mono-chip">{lead.referenceNumber}</span>
                <span>{lead.packageName || 'No package'}</span>
                <span>· {sourceLabel(lead.source)}</span>
              </div>
            </div>
          </div>
          <button type="button" className="ax-modal-close" onClick={onClose} aria-label="Close" disabled={saving}>×</button>
        </div>

        <div className="ax-modal-body">
          {/* ── Blocking banner ── */}
          {blocking.length > 0 && (
            <div className="lm-banner lm-banner--bad" role="alert">
              <span className="lm-banner-icon">{ICON_ALERT}</span>
              <div>
                <strong>This service will be disrupted if it is activated as surveyed.</strong>
                <p>
                  Blocking {blocking.length === 1 ? 'issue' : 'issues'}: {blocking.join(', ')}.
                  Resolve the lead before the customer is committed to a connection.
                </p>
              </div>
            </div>
          )}

          {blocking.length === 0 && lead.riskLevel !== 'none' && lead.riskLevel !== 'low' && (
            <div className="lm-banner lm-banner--warn">
              <span className="lm-banner-icon">{ICON_ALERT}</span>
              <div>
                <strong>This site has unresolved risks.</strong>
                <p>Nothing critical has failed, but the survey raised warnings that need a decision before activation.</p>
              </div>
            </div>
          )}

          {/* ── Summary ── */}
          <div className="lmx-summary">
            <div className="lmx-summary-item">
              <span>Status</span>
              <span className={`lm-pill lm-pill--${leadStatusTone(lead.status)}`}>{leadStatusLabel(lead.status)}</span>
            </div>
            <div className="lmx-summary-item">
              <span>Risk</span>
              <span className={`lm-pill lm-pill--${leadRiskTone(lead.riskLevel)}`}>{leadRiskLabel(lead.riskLevel)}</span>
            </div>
            <div className="lmx-summary-item lmx-summary-checks">
              <span>Checks cleared</span>
              <strong>{cleared} / {checks.length}</strong>
              <span className="lmx-summary-track" aria-hidden="true"><span style={{ width: `${pctCleared}%` }} /></span>
            </div>
            <div className="lmx-summary-item">
              <span>Survey</span>
              <strong>{lead.surveyDate ? formatDate(lead.surveyDate) : 'Not booked'}</strong>
            </div>
            <div className="lmx-summary-item">
              <span>Assigned to</span>
              <strong>{lead.assignedToName || 'Unassigned'}</strong>
            </div>
          </div>

          {/* ── Customer & site ── */}
          <section className="lm-section">
            <h4 className="lm-section-title">Customer &amp; site</h4>
            <div className="lm-fields">
              <Field label="Contact number" value={lead.phone} />
              <Field label="Email" value={lead.email} />
              <Field label="NIC" value={lead.nic} />
              <Field label="District" value={lead.district} />
              <Field label="Package" value={lead.packageName} />
              <Field label="Speed" value={lead.speed} />
              <Field label="Technology" value={lead.technology} />
              <Field label="Source" value={sourceLabel(lead.source)} />
              <Field label="Application" value={lead.applicationRef} />
              <Field label="Captured" value={formatDateTime(lead.createdAt)} />
              <Field label="Last updated" value={formatDateTime(lead.updatedAt)} />
            </div>

            <div className="lm-address">
              <span className="lm-address-icon">{ICON_LOCATION}</span>
              <div>
                <strong>{lead.address}</strong>
                {lead.landmark && <small>{lead.landmark}</small>}
              </div>
            </div>
          </section>

          {/* ── Signal ── */}
          <section className="lm-section">
            <h4 className="lm-section-title">
              {ICON_SIGNAL} Optical signal strength
            </h4>
            {signalPct === null ? (
              <p className="lm-muted">Not measured yet.</p>
            ) : (
              <div className="lm-signal">
                <div className="lm-signal-head">
                  <span className={`lm-signal-value lm-signal-value--${signalTone}`}>{signalValue}</span>
                  <span className="lm-muted">{signalCheck.threshold}</span>
                </div>
                <div className="lm-signal-track">
                  <span className={`lm-signal-fill lm-signal-fill--${signalTone}`} style={{ width: `${signalPct}%` }} />
                </div>
                {signalCheck.note && <p className="lm-muted">{signalCheck.note}</p>}
              </div>
            )}
          </section>

          {/* ── Checklist ── */}
          <section className="lm-section">
            <h4 className="lm-section-title">Serviceability checks</h4>
            <div className="lm-check-table">
              {checks.map((check) => (
                <div className={`lm-check-line lmx-check--${checkStatusTone(check.status)}`} key={check.key}>
                  <div className="lm-check-line-main">
                    <span className="lm-check-line-label">{check.label}</span>
                    {check.critical && <span className="lm-critical-chip">Critical</span>}
                  </div>
                  <div className="lm-check-line-reading">
                    {check.value ? <span className="lm-reading">{displayReading(check)}</span> : <span className="lm-muted">—</span>}
                  </div>
                  <span className={`lm-pill lm-pill--${checkStatusTone(check.status)}`}>
                    {checkStatusLabel(check.status)}
                  </span>
                  {check.note && <p className="lm-check-line-note">{check.note}</p>}
                </div>
              ))}
            </div>
          </section>

          {/* ── Notes ── */}
          {lead.notes && (
            <section className="lm-section">
              <h4 className="lm-section-title">Notes</h4>
              <p className="lm-notes">{lead.notes}</p>
            </section>
          )}

          {/* ── Previous decision ── */}
          {lead.resolution && (
            <section className="lm-section">
              <h4 className="lm-section-title">Decision</h4>
              <div className="lm-banner lm-banner--neutral">
                <div>
                  <strong>{LEAD_RESOLUTION_META[lead.resolution]?.label || lead.resolution}</strong>
                  <p>{lead.resolutionNote || 'No note recorded.'}</p>
                  <small>
                    {lead.resolvedByName || 'Unknown'} · {formatDateTime(lead.resolvedAt)}
                  </small>
                </div>
              </div>
            </section>
          )}

          {/* ── Resolve ── */}
          {resolving && (
            <section className="lm-section lmx-resolve" ref={resolveRef}>
              <h4 className="lm-section-title">Resolve this lead</h4>
              <form onSubmit={handleResolve} className="lm-resolve-form">
                {error && <div className="admin-error-banner" role="alert">{error}</div>}
                <label className="um-field">
                  <span>How is this lead being handled? *</span>
                  <select
                    className="um-input"
                    value={resolution}
                    onChange={(e) => setResolution(e.target.value)}
                  >
                    <option value="">Choose an action…</option>
                    {LEAD_RESOLUTION_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                  {resolution && (
                    <span className="um-field-hint">{LEAD_RESOLUTION_META[resolution]?.hint}</span>
                  )}
                </label>
                <label className="um-field">
                  <span>Reason / instruction</span>
                  <textarea
                    className="um-textarea"
                    rows={3}
                    value={resolutionNote}
                    placeholder="What was agreed with the customer or the network team?"
                    onChange={(e) => setResolutionNote(e.target.value)}
                  />
                </label>
                <div className="lm-resolve-actions">
                  <button type="button" className="admin-btn ghost" onClick={() => setResolving(false)} disabled={saving}>Cancel</button>
                  <button type="submit" className="admin-btn primary" disabled={saving}>
                    {saving ? 'Saving…' : 'Save Decision'}
                  </button>
                </div>
              </form>
            </section>
          )}
        </div>

        <div className="ax-modal-foot ax-modal-foot--split lmx-foot">
          <div className="ax-modal-foot-group">
            <button type="button" className="admin-btn ghost ax-btn-danger-ghost" onClick={onDelete} disabled={saving}>Delete</button>
            <label className="lmx-status-field">
              <span>Status</span>
              <select
                className="admin-select lm-status-select"
                value={lead.status}
                onChange={(e) => onStatusChange(e.target.value)}
                aria-label="Change lead status"
                disabled={saving}
              >
                {LEAD_STATUS_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </label>
          </div>
          <div className="ax-modal-foot-group">
            <button type="button" className="admin-btn ghost" onClick={onEdit} disabled={saving}>Edit Details</button>
            <button type="button" className="admin-btn ghost" onClick={openResolve} disabled={saving || resolving}>Resolve Lead</button>
            <button type="button" className="admin-btn primary ax-btn-brand" onClick={onRecordSurvey} disabled={saving}>
              {ICON_SIGNAL} Record Survey
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
