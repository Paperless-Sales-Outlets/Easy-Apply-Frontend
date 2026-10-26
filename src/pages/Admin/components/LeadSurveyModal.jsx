import React, { useMemo, useState } from 'react';
import {
  LEAD_CHECK_STATUS_OPTIONS,
  checkOptionLabel,
  checkStatusLabel,
  checkStatusTone,
  rateCheck,
} from '../utils/leadUtils';

// Records the site survey. Every criterion in the catalogue gets a row so a
// technician cannot silently skip one — a reading or an option is rated
// against the threshold automatically, and the officer can still overrule it.
export default function LeadSurveyModal({ lead, catalog, onClose, onSave }) {
  const catalogByKey = useMemo(() => {
    const map = {};
    (catalog || []).forEach((entry) => { map[entry.key] = entry; });
    return map;
  }, [catalog]);

  const [checks, setChecks] = useState(() =>
    (lead?.checks || []).map((c) => {
      const status = c.status || 'pending';
      const rated = rateCheck(catalogByKey[c.key], c.value);
      // A result the rater itself produces can be brought back in line with
      // the reading; a result the officer chose (waived, N/A, an overrule)
      // is theirs to keep.
      const derived = ['pass', 'marginal', 'fail', 'pending'].includes(status);
      return {
        ...c,
        status: derived && rated ? rated : status,
        value: c.value || '',
        note: c.note || '',
        manual: !derived,
      };
    })
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const updateCheck = (key, patch) => {
    setChecks((prev) => prev.map((c) => (c.key === key ? { ...c, ...patch } : c)));
  };

  // Entering a reading decides the result on its own — for a numeric check
  // and a categorical one alike — unless the officer has taken over.
  const changeValue = (check, value) => {
    const rated = rateCheck(catalogByKey[check.key], value);
    const patch = { value };
    if (rated && !check.manual) patch.status = rated;
    updateCheck(check.key, patch);
  };

  const changeStatus = (check, status) =>
    updateCheck(check.key, { status, manual: true });

  const summary = useMemo(() => {
    const total = checks.length;
    const failed = checks.filter((c) => c.status === 'fail').length;
    const marginal = checks.filter((c) => c.status === 'marginal').length;
    const pending = checks.filter((c) => c.status === 'pending').length;
    const criticalFailed = checks.filter((c) => c.status === 'fail' && c.critical).length;
    return { total, failed, marginal, pending, criticalFailed };
  }, [checks]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (summary.pending === summary.total && summary.total > 0) {
      setError('Record at least one result before saving.');
      return;
    }

    setSaving(true);
    try {
      const payload = checks.map((c) => ({
        key: c.key,
        status: c.status,
        value: c.value,
        note: c.note,
      }));
      await onSave(payload);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to save the survey results.');
      setSaving(false);
    }
  };

  return (
    <div className="admin-modal-overlay ax-overlay-top" onClick={saving ? undefined : onClose}>
      <div className="admin-modal ax-modal lm-modal lm-survey-modal" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-labelledby="lm-survey-title">
        <div className="ax-modal-head">
          <span className="ax-modal-head-deco" aria-hidden="true" />
          <div className="ax-modal-identity">
            <span className="ax-modal-avatar">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 12h4l3 8 4-16 3 8h4" />
              </svg>
            </span>
            <div>
              <span className="ax-modal-eyebrow">Site survey</span>
              <h3 id="lm-survey-title">Record survey results</h3>
              <div className="ax-modal-sub">
                <span className="ax-mono-chip">{lead?.referenceNumber}</span>
                <span>{lead?.customerName}</span>
              </div>
            </div>
          </div>
          <button type="button" className="ax-modal-close" onClick={onClose} aria-label="Close" disabled={saving}>×</button>
        </div>

        <form onSubmit={handleSubmit} noValidate className="ax-modal-form">
          <div className="ax-modal-body">
            {error && <div className="admin-error-banner" role="alert" style={{ marginBottom: '1rem' }}>{error}</div>}

            <div className="lmx-survey-summary">
              <div className="lmx-survey-bar" aria-hidden="true">
                <span className="good" style={{ flexGrow: summary.total - summary.failed - summary.marginal - summary.pending }} />
                <span className="warn" style={{ flexGrow: summary.marginal }} />
                <span className="bad" style={{ flexGrow: summary.failed }} />
                <span className="pending" style={{ flexGrow: summary.pending }} />
              </div>
              <div className="lmx-survey-counts">
                <span className="lmx-count good"><strong>{summary.total - summary.failed - summary.marginal - summary.pending}</strong> cleared</span>
                <span className="lmx-count warn"><strong>{summary.marginal}</strong> marginal</span>
                <span className="lmx-count bad"><strong>{summary.failed}</strong> failed</span>
                <span className="lmx-count pending"><strong>{summary.pending}</strong> not measured</span>
              </div>
              {summary.criticalFailed > 0 && (
                <p className="lmx-survey-alert" role="alert">
                  {summary.criticalFailed} critical check{summary.criticalFailed === 1 ? '' : 's'} failed — this site cannot be served as surveyed.
                </p>
              )}
            </div>

            <div className="lm-check-list">
              {checks.map((check) => {
                const entry = catalogByKey[check.key];
                const rated = rateCheck(entry, check.value);
                return (
                  <div className={`lm-check-row lmx-check--${checkStatusTone(check.status)}${check.status === 'fail' ? ' is-fail' : ''}`} key={check.key}>
                    <div className="lm-check-head">
                      <div className="lm-check-title">
                        <span className="lm-check-label">{check.label}</span>
                        {check.critical && <span className="lm-critical-chip">Critical</span>}
                      </div>
                      <span className={`lm-pill lm-pill--${checkStatusTone(check.status)}`}>
                        {checkStatusLabel(check.status)}
                      </span>
                    </div>

                    <p className="lm-check-meta">
                      {check.metric || entry?.metric}
                      {check.threshold ? ` · ${check.threshold}` : ''}
                    </p>

                    <div className="lm-check-grid">
                      <label className="um-field">
                        <span>Result</span>
                        <select
                          className="um-input"
                          value={check.status}
                          onChange={(e) => changeStatus(check, e.target.value)}
                        >
                          {LEAD_CHECK_STATUS_OPTIONS.map((opt) => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                          ))}
                        </select>
                      </label>

                      <label className="um-field">
                        <span>
                          Reading
                          {check.unit ? ` (${check.unit})` : ''}
                        </span>
                        {check.type === 'numeric' ? (
                          <input
                            type="text"
                            className="um-input"
                            value={check.value}
                            placeholder={
                              check.valuePrefix
                                ? `e.g. 8 (shown as ${check.valuePrefix}8)`
                                : check.unit === 'dBm' ? 'e.g. -27.5' : 'e.g. 8'
                            }
                            onChange={(e) => changeValue(check, e.target.value)}
                          />
                        ) : (
                          <select
                            className="um-input"
                            value={check.value}
                            onChange={(e) => changeValue(check, e.target.value)}
                          >
                            <option value="">Select…</option>
                            {(check.options?.length ? check.options : entry?.options || []).map((opt) => (
                              <option key={opt} value={opt}>{checkOptionLabel(opt)}</option>
                            ))}
                          </select>
                        )}
                      </label>

                      <label className="um-field">
                        <span>Note</span>
                        <input
                          type="text"
                          className="um-input"
                          value={check.note}
                          placeholder="Optional detail"
                          onChange={(e) => updateCheck(check.key, { note: e.target.value })}
                        />
                      </label>
                    </div>

                    {check.value !== '' && (
                      <p className={`lm-auto-hint lm-auto-hint--${rated || 'manual'}`}>
                        {!rated
                          ? 'This reading cannot be rated automatically — set the result yourself.'
                          : rated === check.status
                            ? <>This reading rates as <strong>{checkStatusLabel(rated).toLowerCase()}</strong>.</>
                            : <>This reading would rate as <strong>{checkStatusLabel(rated).toLowerCase()}</strong>, not your {checkStatusLabel(check.status).toLowerCase()}.</>}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="ax-modal-foot">
            <button type="button" className="admin-btn ghost" onClick={onClose} disabled={saving}>Cancel</button>
            <button type="submit" className="admin-btn primary ax-btn-brand" disabled={saving}>
              {saving ? 'Saving…' : 'Save Survey Results'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
