import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  getKycQueue,
  reviewKycApplication,
  runKycAutoReview,
  rerunKycAutoReview,
} from '../services/adminService';
import AuthImage from '../components/AuthImage';
import AdminNotice, { useAdminNotice } from '../components/AdminNotice';
import { AnimatedNumber, timeAgo } from '../components/AdminVisuals';
import { formatDate, serviceLabel, statusBadgeClass, statusLabel } from '../utils/applicationUtils';

const OPEN_STATUSES = ['pending', 'pending payment', 'flagged'];
const REFRESH_MS = 30000;
const SYSTEM_NAME = 'Automated KYC';

const FILTERS = [
  { key: 'attention', label: 'Needs review' },
  { key: 'auto', label: 'Automated' },
  { key: 'admin', label: 'By admin' },
  { key: 'all', label: 'All' },
];

const DECISIONS = [
  { status: 'approved', label: 'Approve', cls: 'success' },
  { status: 'rejected', label: 'Reject', cls: 'danger' },
  { status: 'flagged', label: 'Flag for review', cls: 'warning' },
];

const CHECK_META = {
  pass: { label: 'Passed', hint: 'Verified' },
  fail: { label: 'Mismatch', hint: 'Contradiction' },
  unsure: { label: 'Not sure', hint: 'Needs a person' },
  manual: { label: 'Check by eye', hint: 'Not machine-verified' },
};

const CHECK_ICONS = {
  pass: <path d="m5 12 4.5 4.5L19 7" />,
  fail: <><path d="M6 6l12 12" /><path d="M18 6 6 18" /></>,
  unsure: <><path d="M12 7v6" /><path d="M12 17h.01" /></>,
  manual: <><path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12Z" /><circle cx="12" cy="12" r="3" /></>,
};

function initials(name) {
  if (!name) return '?';
  return name.split(/\s+/).filter((w) => w && !/^(mr|mrs|ms|miss|dr)\.?$/i.test(w)).map((w) => w[0]).slice(0, 2).join('').toUpperCase() || '?';
}

const isOpen = (item) => OPEN_STATUSES.includes(item.status);
const bySystem = (item) => item.decidedBy === 'system';
const byAdmin = (item) => item.decidedBy === 'admin';

function matchesFilter(item, filter) {
  if (filter === 'attention') return isOpen(item);
  if (filter === 'auto') return bySystem(item);
  if (filter === 'admin') return byAdmin(item);
  return true;
}

// Cases that need a person come first (oldest first), then everything else by latest decision.
function sortItems(a, b) {
  const ao = isOpen(a);
  const bo = isOpen(b);
  if (ao !== bo) return ao ? -1 : 1;
  if (ao) return new Date(a.submittedAt) - new Date(b.submittedAt);
  return new Date(b.decidedAt || b.updatedAt) - new Date(a.decidedAt || a.updatedAt);
}

function Actor({ item, compact }) {
  if (bySystem(item)) {
    return (
      <span className={`kycv-actor system${compact ? ' compact' : ''}`}>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="4" y="8" width="16" height="12" rx="3" /><path d="M12 8V4" /><circle cx="12" cy="3" r="1" /><path d="M9 14h.01M15 14h.01" />
        </svg>
        {compact ? 'Auto' : SYSTEM_NAME}
      </span>
    );
  }
  if (byAdmin(item)) {
    return (
      <span className={`kycv-actor admin${compact ? ' compact' : ''}`}>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
        </svg>
        {compact ? 'Admin' : item.decidedByName || 'Admin'}
      </span>
    );
  }
  return <span className={`kycv-actor none${compact ? ' compact' : ''}`}>Awaiting decision</span>;
}

function StatusBadge({ status }) {
  return <span className={`admin-badge ${statusBadgeClass(status)}`}>{statusLabel(status)}</span>;
}

function CheckList({ checks }) {
  return (
    <ul className="kycv-checks">
      {checks.map((c) => (
        <li className={`kycv-check ${c.result}`} key={c.key}>
          <span className="kycv-check-icon" aria-hidden="true">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
              {CHECK_ICONS[c.result]}
            </svg>
          </span>
          <div className="kycv-check-body">
            <div className="kycv-check-head">
              <strong>{c.label}</strong>
              <span className="kycv-check-tag">{CHECK_META[c.result]?.label}</span>
            </div>
            <p>{c.detail}</p>
          </div>
        </li>
      ))}
    </ul>
  );
}

function History({ history }) {
  return (
    <ol className="kycv-timeline">
      {history.map((h, i) => (
        <li className={`kycv-tl-item ${h.actor}`} key={`${h.at}-${i}`}>
          <span className="kycv-tl-dot" aria-hidden="true" />
          <div className="kycv-tl-card">
            <div className="kycv-tl-head">
              <span className={`kycv-actor ${h.actor}`}>
                {h.actor === 'system' ? SYSTEM_NAME : h.actorName || 'Admin'}
              </span>
              <span className="kycv-tl-kind">
                {h.kind === 'manual' ? 'changed manually' : h.kind === 'rerun' ? 're-checked automatically' : 'decided automatically'}
              </span>
              <time dateTime={h.at}>{formatDate(h.at)}</time>
            </div>
            <div className="kycv-tl-change">
              {h.fromStatus ? <><StatusBadge status={h.fromStatus} /><span className="kycv-arrow">→</span></> : null}
              <StatusBadge status={h.toStatus} />
            </div>
            {h.remark ? <p className="kycv-tl-remark">{h.remark}</p> : <p className="kycv-tl-remark none">No remark added.</p>}
          </div>
        </li>
      ))}
    </ol>
  );
}

export default function KycReviewPage() {
  const notice = useAdminNotice(5000);
  const [items, setItems] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [filter, setFilter] = useState('attention');
  const [search, setSearch] = useState('');
  const [remark, setRemark] = useState('');
  const [remarkError, setRemarkError] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState('');
  const detailRef = useRef(null);

  const load = useCallback(async ({ silent } = {}) => {
    if (!silent) { setLoading(true); setError(null); }
    try {
      const data = await getKycQueue();
      setItems(data.queue || []);
    } catch (err) {
      if (!silent) setError(err.response?.data?.message || err.message || 'Failed to load the KYC review list.');
    } finally {
      if (!silent) setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  // Automated decisions arrive in the background, so keep the list fresh.
  useEffect(() => {
    const t = setInterval(() => { if (!document.hidden) load({ silent: true }); }, REFRESH_MS);
    return () => clearInterval(t);
  }, [load]);

  const counts = useMemo(() => ({
    attention: items.filter(isOpen).length,
    auto: items.filter(bySystem).length,
    admin: items.filter(byAdmin).length,
    all: items.length,
    autoApproved: items.filter((i) => bySystem(i) && i.status === 'approved').length,
    autoRejected: items.filter((i) => bySystem(i) && i.status === 'rejected').length,
    autoFlagged: items.filter((i) => bySystem(i) && i.status === 'flagged').length,
  }), [items]);

  const matching = useMemo(() => {
    const q = search.trim().toLowerCase();
    return items
      .filter((i) => matchesFilter(i, filter))
      .filter((i) => !q || [i.name, i.nic, i.phone, i.referenceNumber, i.status, i.decidedByName]
        .some((v) => String(v || '').toLowerCase().includes(q)))
      .sort(sortItems);
  }, [items, filter, search]);

  // Always have a case selected once there is one to show.
  useEffect(() => {
    if (!items.some((i) => i.id === selectedId) && matching[0]) setSelectedId(matching[0].id);
  }, [items, matching, selectedId]);

  // The selected case stays in the list even when a decision (yours or the
  // system's re-run) moves it out of the current filter, so the screen never
  // swaps to a different applicant while you are working on this one.
  const visible = useMemo(() => {
    const pinned = items.find((i) => i.id === selectedId);
    if (!pinned || matching.some((i) => i.id === pinned.id)) return matching;
    return [...matching, pinned].sort(sortItems);
  }, [items, matching, selectedId]);

  const current = items.find((i) => i.id === selectedId) || null;

  const select = (item) => {
    setSelectedId(item.id);
    setRemark('');
    setRemarkError('');
    if (window.innerWidth < 1100) detailRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const patchItem = (updated) => setItems((prev) => prev.map((i) => (i.id === updated.id ? updated : i)));

  const decide = async (status) => {
    if (!current || busy) return;
    const text = remark.trim();
    if (bySystem(current) && status !== current.status && !text) {
      setRemarkError('Add a remark explaining why you are changing the automated decision.');
      return;
    }
    setRemarkError('');
    setBusy(status);
    try {
      const res = await reviewKycApplication(current.id, status, text);
      patchItem(res.application);
      notice.success(`${current.name}: marked ${statusLabel(status).toLowerCase()} by you.`);
      setRemark('');

      // Move on to the next case that still needs a person.
      if (filter === 'attention') {
        const idx = visible.findIndex((i) => i.id === current.id);
        const next = visible.slice(idx + 1).concat(visible.slice(0, idx)).find((i) => i.id !== current.id && isOpen(i));
        if (next) setSelectedId(next.id);
      }
    } catch (err) {
      notice.error(err.response?.data?.message || err.message || 'Could not save the decision.');
    } finally {
      setBusy('');
    }
  };

  const rerun = async () => {
    if (!current || busy) return;
    setBusy('rerun');
    try {
      const res = await rerunKycAutoReview(current.id);
      patchItem(res.application);
      notice.info(res.applied
        ? `Re-checked automatically: now ${statusLabel(res.decision).toLowerCase()}.`
        : 'Checks refreshed — the status was not changed.');
    } catch (err) {
      notice.error(err.response?.data?.message || err.message || 'Could not re-run the automated check.');
    } finally {
      setBusy('');
    }
  };

  const sweep = async () => {
    if (busy) return;
    setBusy('sweep');
    try {
      const { summary } = await runKycAutoReview();
      await load({ silent: true });
      const decided = summary.approved + summary.rejected + summary.flagged;
      notice.info(decided
        ? `Automatic review finished: ${summary.approved} approved, ${summary.rejected} rejected, ${summary.flagged} flagged.`
        : 'Everything waiting has already been checked.');
    } catch (err) {
      notice.error(err.response?.data?.message || err.message || 'Automatic review failed.');
    } finally {
      setBusy('');
    }
  };

  const overriding = current && bySystem(current);

  const summaryCards = [
    { key: 'attention', tone: 'amber', label: 'Needs review', value: counts.attention, hint: counts.autoFlagged ? `${counts.autoFlagged} flagged by the system` : 'Pending or flagged', filter: 'attention' },
    { key: 'approved', tone: 'green', label: 'Auto-approved', value: counts.autoApproved, hint: 'Identity fully matched', filter: 'auto' },
    { key: 'rejected', tone: 'red', label: 'Auto-rejected', value: counts.autoRejected, hint: 'Definite mismatch', filter: 'auto' },
    { key: 'admin', tone: 'blue', label: 'Decided by admin', value: counts.admin, hint: 'Manual decisions', filter: 'admin' },
  ];

  return (
    <div className="kycv-page">
      <AdminNotice notice={notice.notice} onDismiss={notice.dismiss} />

      <header className="kycv-header">
        <div>
          <h1 className="admin-page-title">KYC Review</h1>
          <p className="admin-page-subtitle">
            New cases are checked automatically. Review what the system decided — and change it whenever you disagree.
          </p>
        </div>
        <div className="kycv-header-actions">
          <button type="button" className="admin-btn ghost" onClick={() => load()} disabled={loading || !!busy}>Refresh</button>
          <button type="button" className="kycv-run-btn" onClick={sweep} disabled={!!busy}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={busy === 'sweep' ? 'dash-spin' : ''}>
              <path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z" />
            </svg>
            {busy === 'sweep' ? 'Reviewing…' : 'Run automatic review'}
          </button>
        </div>
      </header>

      <section className="kycv-summary">
        {summaryCards.map((c, idx) => (
          <button
            type="button"
            key={c.key}
            className={`kycv-stat ${c.tone}${filter === c.filter ? ' active' : ''}`}
            style={{ '--i': idx }}
            onClick={() => { setFilter(c.filter); setSelectedId(null); }}
          >
            <span className="kycv-stat-label">{c.label}</span>
            <span className="kycv-stat-value">{loading ? '–' : <AnimatedNumber value={c.value} />}</span>
            <span className="kycv-stat-hint">{c.hint}</span>
          </button>
        ))}
      </section>

      {loading ? (
        <div className="admin-empty"><p>Loading KYC cases…</p></div>
      ) : error ? (
        <div className="admin-empty">
          <p>{error}</p>
          <button type="button" className="admin-btn" style={{ marginTop: '0.75rem' }} onClick={() => load()}>Retry</button>
        </div>
      ) : (
        <div className="kycv-layout">
          {/* ── Case list ── */}
          <aside className="kycv-list-panel">
            <div className="kycv-filters" role="tablist">
              {FILTERS.map((f) => (
                <button
                  key={f.key}
                  type="button"
                  role="tab"
                  aria-selected={filter === f.key}
                  className={`kycv-filter${filter === f.key ? ' active' : ''}`}
                  onClick={() => { setFilter(f.key); setSelectedId(null); }}
                >
                  {f.label}<span>{counts[f.key]}</span>
                </button>
              ))}
            </div>
            <div className="admin-search kycv-search">
              <svg className="admin-search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
              </svg>
              <input
                type="text"
                placeholder="Search name, NIC, phone or reference"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setSelectedId(null); }}
                aria-label="Search KYC cases"
              />
            </div>

            <div className="kycv-list">
              {visible.length === 0 ? (
                <div className="kycv-list-empty">
                  <strong>{filter === 'attention' ? 'All caught up' : 'Nothing here'}</strong>
                  <span>{search ? 'No cases match your search.' : filter === 'attention' ? 'No case needs your review right now.' : 'No cases in this view yet.'}</span>
                </div>
              ) : visible.map((item) => (
                <button
                  type="button"
                  key={item.id}
                  className={`kycv-item${current?.id === item.id ? ' selected' : ''} ${statusBadgeClass(item.status)}`}
                  onClick={() => select(item)}
                >
                  <span className="kycv-item-avatar">{initials(item.name)}</span>
                  <span className="kycv-item-main">
                    <span className="kycv-item-top">
                      <strong>{item.name}</strong>
                      <StatusBadge status={item.status} />
                    </span>
                    <span className="kycv-item-sub">
                      <code>{item.nic}</code>
                      <span>{item.kind === 'account' ? 'Account registration' : serviceLabel(item.serviceType)}</span>
                    </span>
                    <span className="kycv-item-foot">
                      <Actor item={item} compact />
                      <time dateTime={item.decidedAt || item.submittedAt}>{timeAgo(item.decidedAt || item.submittedAt)}</time>
                    </span>
                  </span>
                </button>
              ))}
            </div>
          </aside>

          {/* ── Case detail ── */}
          <main className="kycv-detail" ref={detailRef}>
            {!current ? (
              <div className="kycv-detail-empty">
                <span className="kycv-empty-icon">
                  <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><path d="m9 11 3 3L22 4" />
                  </svg>
                </span>
                <h2>{counts.all === 0 ? 'No KYC cases yet' : 'Select a case'}</h2>
                <p>{counts.all === 0 ? 'Cases appear here as soon as customers register or submit requests.' : 'Pick a case from the list to see what the system checked and decide.'}</p>
              </div>
            ) : (
              <>
                {/* Case summary */}
                <section className={`kycv-card kycv-case ${statusBadgeClass(current.status)}`}>
                  <div className="kycv-case-top">
                    <span className="kycv-case-avatar">{initials(current.name)}</span>
                    <div className="kycv-case-id">
                      <h2>{current.name}</h2>
                      <p>
                        <code>{current.nic}</code> · {current.phone}
                      </p>
                    </div>
                    <StatusBadge status={current.status} />
                  </div>
                  <div className="kycv-case-meta">
                    <div><label>Request</label><span>{current.kind === 'account' ? 'Account registration' : `${serviceLabel(current.serviceType)} · ${current.referenceNumber}`}</span></div>
                    <div><label>Submitted</label><span>{formatDate(current.submittedAt)}</span></div>
                    <div>
                      <label>Decided by</label>
                      <span className="kycv-decider">
                        <Actor item={current} />
                        {current.decidedAt ? <small>{formatDate(current.decidedAt)}</small> : null}
                      </span>
                    </div>
                  </div>
                  {current.locked && (
                    <div className="kycv-locked" role="note">
                      This application is already confirmed (payment or appointment completed), so the KYC decision is final and can no longer be changed.
                    </div>
                  )}
                </section>

                {/* Automated checks */}
                <section className="kycv-card">
                  <div className="kycv-card-head">
                    <div>
                      <h3>Automated checks</h3>
                      <p>
                        {current.autoCheckedAt
                          ? <>Checked {timeAgo(current.autoCheckedAt)} · system verdict <strong className={`kycv-verdict ${current.autoDecision}`}>{statusLabel(current.autoDecision)}</strong>
                            {current.autoDecision && current.autoDecision !== current.status && byAdmin(current) ? ' — changed by an admin' : ''}</>
                          : 'The system has not checked this case yet.'}
                      </p>
                    </div>
                    <button type="button" className="admin-btn ghost" onClick={rerun} disabled={!!busy || current.locked}>
                      {busy === 'rerun' ? 'Checking…' : 'Re-run check'}
                    </button>
                  </div>
                  {current.checks.length ? <CheckList checks={current.checks} /> : (
                    <div className="kycv-nochecks">
                      New cases are reviewed automatically within a minute. You can also press <strong>Run automatic review</strong> above, or re-run this case.
                    </div>
                  )}
                </section>

                {/* Documents */}
                <section className="kycv-card">
                  <div className="kycv-card-head"><div><h3>Identity documents</h3><p>Compare the live photo with the NIC photo yourself — the system does not.</p></div></div>
                  <div className="kycv-docs">
                    {(current.documents || []).length === 0 ? (
                      <div className="kyc-doc-frame">
                        <div className="kyc-doc-header">Documents</div>
                        <div className="kyc-doc-missing">No documents were captured for this applicant.</div>
                      </div>
                    ) : current.documents.map((doc) => (
                      <div className="kyc-doc-frame" key={doc.key}>
                        <div className="kyc-doc-header">{doc.label}</div>
                        <AuthImage
                          url={doc.url}
                          alt={doc.label}
                          style={{ minHeight: 200, objectFit: doc.key === 'facePhoto' ? 'cover' : 'contain' }}
                        />
                      </div>
                    ))}
                  </div>
                </section>

                {/* Review decision */}
                <section className="kycv-card kycv-decision">
                  <div className="kycv-card-head">
                    <div>
                      <h3>Review decision</h3>
                      <p>{overriding ? 'The system decided this case. You can keep it or change it — changing needs a remark.' : 'Record your decision and a remark for the audit trail.'}</p>
                    </div>
                  </div>

                  {current.notes ? (
                    <div className={`kycv-remark ${bySystem(current) ? 'system' : 'admin'}`}>
                      <div className="kycv-remark-head">
                        <span>Current remark</span>
                        <Actor item={current} />
                      </div>
                      <p>{current.notes}</p>
                    </div>
                  ) : (
                    <div className="kycv-remark none"><p>No remark has been recorded for this case.</p></div>
                  )}

                  <label className="kycv-field">
                    <span>Add remark{overriding ? ' (required to change the decision)' : ' (optional)'}</span>
                    <textarea
                      className={`kyc-note-area${remarkError ? ' invalid' : ''}`}
                      placeholder={overriding ? 'Explain why you are changing the automated decision…' : 'Add a remark about this decision…'}
                      value={remark}
                      maxLength={1900}
                      disabled={current.locked}
                      aria-invalid={remarkError ? true : undefined}
                      onChange={(e) => { setRemark(e.target.value); if (remarkError) setRemarkError(''); }}
                    />
                    {remarkError && <em className="kycv-field-error" role="alert">{remarkError}</em>}
                  </label>

                  <div className="kycv-actions">
                    {DECISIONS.map((d) => (
                      <button
                        key={d.status}
                        type="button"
                        className={`admin-btn ${d.cls}`}
                        onClick={() => decide(d.status)}
                        disabled={!!busy || current.locked || current.status === d.status}
                      >
                        {busy === d.status ? 'Saving…' : d.label}
                      </button>
                    ))}
                  </div>
                </section>

                {/* Applicant info */}
                <section className="kycv-card">
                  <div className="kycv-card-head"><div><h3>Applicant information</h3></div></div>
                  <div className="kycv-info">
                    <div><label>Full name</label><span>{current.name}</span></div>
                    <div><label>NIC / passport</label><span className="mono">{current.nic}</span></div>
                    <div><label>Phone</label><span>{current.phone}</span></div>
                    <div><label>Reference</label><span className="mono">{current.referenceNumber}</span></div>
                  </div>
                </section>

                {/* History */}
                <section className="kycv-card">
                  <div className="kycv-card-head"><div><h3>Decision history</h3><p>Every change to this case, newest first.</p></div></div>
                  {current.history.length ? <History history={current.history} /> : (
                    <div className="kycv-nochecks">
                      {byAdmin(current)
                        ? `Decided by ${current.decidedByName || 'an admin'} before decision history was recorded.`
                        : 'No decisions have been recorded yet.'}
                    </div>
                  )}
                </section>
              </>
            )}
          </main>
        </div>
      )}
    </div>
  );
}
