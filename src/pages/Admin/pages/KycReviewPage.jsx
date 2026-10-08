import React, { useCallback, useDeferredValue, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
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
const STATUS_ORDER = ['pending', 'pending payment', 'flagged', 'approved', 'rejected', 'confirmed'];
const REFRESH_MS = 30000;
const PAGE_SIZE = 25;
const SYSTEM_NAME = 'Automated KYC';

const VIEWS = [
  { key: 'attention', label: 'Needs review', hint: 'Open cases and automated decisions nobody has confirmed yet' },
  { key: 'auto', label: 'Automated', hint: 'Decided by the system' },
  { key: 'manual', label: 'Manual', hint: 'Decided by a person' },
  { key: 'all', label: 'All cases', hint: 'Everything' },
];

const SORTS = [
  { key: 'smart', label: 'Smart order' },
  { key: 'newest', label: 'Newest submitted' },
  { key: 'oldest', label: 'Oldest submitted' },
  { key: 'name', label: 'Name A–Z' },
];

const DEFAULT_FILTERS = { view: 'attention', status: 'all', type: 'all', sort: 'smart', search: '' };

const DECISIONS = [
  { status: 'approved', label: 'Approve', cls: 'success' },
  { status: 'rejected', label: 'Reject', cls: 'danger' },
  { status: 'flagged', label: 'Flag for review', cls: 'warning' },
];

// The four identity items every case shows, whether or not they were provided.
const DOC_SLOTS = [
  { slot: 'nicFront', label: 'NIC front', keys: ['nicFront'], fit: 'contain' },
  { slot: 'nicBack', label: 'NIC back', keys: ['nicBack'], fit: 'contain' },
  { slot: 'signature', label: 'Signature', keys: ['signature', 'signatureDoc', 'customerSignature'], fit: 'contain' },
  { slot: 'facePhoto', label: 'Live picture', keys: ['facePhoto'], fit: 'cover' },
];
const SLOT_KEYS = new Set(DOC_SLOTS.flatMap((d) => d.keys));

const CHECK_META = {
  pass: 'Passed',
  fail: 'Mismatch',
  unsure: 'Not sure',
  manual: 'Check by eye',
};

const CHECK_ICONS = {
  pass: <path d="m5 12 4.5 4.5L19 7" />,
  fail: <><path d="M6 6l12 12" /><path d="M18 6 6 18" /></>,
  unsure: <><path d="M12 7v6" /><path d="M12 17h.01" /></>,
  manual: <><path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12Z" /><circle cx="12" cy="12" r="3" /></>,
};

// ── helpers ──────────────────────────────────────────────────────────────────

function initials(name) {
  if (!name) return '?';
  return name.split(/\s+/).filter((w) => w && !/^(mr|mrs|ms|miss|dr)\.?$/i.test(w)).map((w) => w[0]).slice(0, 2).join('').toUpperCase() || '?';
}

const isOpen = (item) => OPEN_STATUSES.includes(item.status);

// Approved / rejected by the system and not yet confirmed or changed by a person.
// (A confirmed application is final, so it never waits for review.)
const awaitsConfirmation = (item) => bySystem(item) && !isOpen(item) && !item.locked;

// Everything that needs a person: open cases, plus every automated decision.
const needsReview = (item) => isOpen(item) || awaitsConfirmation(item);
const bySystem = (item) => item.decidedBy === 'system';
const byPerson = (item) => item.decidedBy === 'admin';
const typeKeyOf = (item) => (item.kind === 'account' ? 'account' : item.serviceType || 'other');
const typeLabelOf = (key) => (key === 'account' ? 'Account registration' : serviceLabel(key));

function matchesView(item, view) {
  if (view === 'attention') return needsReview(item);
  if (view === 'auto') return bySystem(item);
  if (view === 'manual') return byPerson(item);
  return true;
}

// Needs-a-person first (oldest waiting first), then everything else by latest decision.
function smartSort(a, b) {
  const ao = needsReview(a);
  const bo = needsReview(b);
  if (ao !== bo) return ao ? -1 : 1;
  if (ao) return new Date(a.submittedAt) - new Date(b.submittedAt);
  return new Date(b.decidedAt || b.updatedAt) - new Date(a.decidedAt || a.updatedAt);
}

const SORT_FNS = {
  smart: smartSort,
  newest: (a, b) => new Date(b.submittedAt) - new Date(a.submittedAt),
  oldest: (a, b) => new Date(a.submittedAt) - new Date(b.submittedAt),
  name: (a, b) => String(a.name || '').localeCompare(String(b.name || '')),
};

// Faceted filtering: `skip` leaves one dimension out, so each chip can show how
// many cases it would give *with every other filter still applied*.
function filterItems(items, f, tokens, haystacks, skip) {
  return items.filter((i) => {
    if (skip !== 'view' && !matchesView(i, f.view)) return false;
    if (skip !== 'status' && f.status !== 'all' && i.status !== f.status) return false;
    if (skip !== 'type' && f.type !== 'all' && typeKeyOf(i) !== f.type) return false;
    if (tokens.length) {
      const text = haystacks.get(i.id) || '';
      if (!tokens.every((t) => text.includes(t))) return false;
    }
    return true;
  });
}

function pickDoc(item, keys) {
  for (const key of keys) {
    const doc = (item.documents || []).find((d) => d.key === key);
    if (doc) return doc;
  }
  return null;
}

// ── small components ─────────────────────────────────────────────────────────

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
  if (byPerson(item)) {
    return (
      <span className={`kycv-actor manual${compact ? ' compact' : ''}`}>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
        </svg>
        {item.decidedByName || 'Staff'}
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
              <span className="kycv-check-tag">{CHECK_META[c.result]}</span>
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
              <span className={`kycv-actor ${h.actor === 'system' ? 'system' : 'manual'}`}>
                {h.actor === 'system' ? SYSTEM_NAME : h.actorName || 'Staff'}
              </span>
              <span className="kycv-tl-kind">
                {h.kind === 'manual'
                  ? (h.fromStatus && h.fromStatus === h.toStatus ? 'confirmed the decision' : 'changed manually')
                  : h.kind === 'rerun' ? 're-checked automatically' : 'decided automatically'}
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

function DocSlot({ spec, doc, note, onZoom }) {
  if (!doc) {
    return (
      <div className="kycv-doc empty">
        <div className="kycv-doc-label">{spec.label}</div>
        <div className="kycv-doc-empty">
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="3" /><circle cx="9" cy="9" r="2" /><path d="m21 15-5-5L5 21" />
          </svg>
          <strong>Not provided</strong>
          {note ? <span>{note}</span> : null}
        </div>
      </div>
    );
  }
  return (
    <button type="button" className="kycv-doc" onClick={() => onZoom({ ...doc, label: spec.label, fit: spec.fit })} aria-label={`Enlarge ${spec.label}`}>
      <div className="kycv-doc-label">
        {spec.label}
        <span className="kycv-doc-zoom" aria-hidden="true">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35M11 8v6M8 11h6" />
          </svg>
        </span>
      </div>
      <div className={`kycv-doc-media ${spec.fit}`}>
        <AuthImage url={doc.url} alt={spec.label} style={{ width: '100%', height: '100%', objectFit: spec.fit, minHeight: 0 }} />
      </div>
    </button>
  );
}

// ── page ─────────────────────────────────────────────────────────────────────

export default function KycReviewPage() {
  const pageNotice = useAdminNotice(5000);
  const modalNotice = useAdminNotice(4500);

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState('');

  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [limit, setLimit] = useState(PAGE_SIZE);
  const deferredSearch = useDeferredValue(filters.search);

  const [openId, setOpenId] = useState(null);
  const [zoomDoc, setZoomDoc] = useState(null);
  const [remark, setRemark] = useState('');
  const [remarkError, setRemarkError] = useState('');

  const dialogRef = useRef(null);
  const triggerRef = useRef(null);

  const setFilter = (patch) => { setFilters((f) => ({ ...f, ...patch })); setLimit(PAGE_SIZE); };

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

  // ── derived data ──
  const haystacks = useMemo(() => new Map(items.map((i) => [i.id, [
    i.name, i.nic, i.phone, i.referenceNumber, statusLabel(i.status), typeLabelOf(typeKeyOf(i)), i.decidedByName,
    bySystem(i) ? 'automated auto system' : byPerson(i) ? 'manual person' : '',
  ].join(' ').toLowerCase()])), [items]);

  const tokens = useMemo(() => deferredSearch.trim().toLowerCase().split(/\s+/).filter(Boolean), [deferredSearch]);

  // Summary cards: always the whole picture, never affected by the filters.
  const totals = useMemo(() => ({
    attention: items.filter(needsReview).length,
    open: items.filter(isOpen).length,
    toConfirm: items.filter(awaitsConfirmation).length,
    autoApproved: items.filter((i) => bySystem(i) && i.status === 'approved').length,
    autoRejected: items.filter((i) => bySystem(i) && i.status === 'rejected').length,
    manual: items.filter(byPerson).length,
  }), [items]);

  const f = useMemo(() => ({ ...filters, search: deferredSearch }), [filters, deferredSearch]);

  const viewCounts = useMemo(() => Object.fromEntries(
    VIEWS.map((v) => [v.key, filterItems(items, { ...f, view: v.key }, tokens, haystacks, null).length])
  ), [items, f, tokens, haystacks]);

  const statusCounts = useMemo(() => {
    const pool = filterItems(items, f, tokens, haystacks, 'status');
    const map = {};
    pool.forEach((i) => { map[i.status] = (map[i.status] || 0) + 1; });
    return { total: pool.length, map };
  }, [items, f, tokens, haystacks]);

  const typeOptions = useMemo(() => {
    const pool = filterItems(items, f, tokens, haystacks, 'type');
    const map = {};
    pool.forEach((i) => { const k = typeKeyOf(i); map[k] = (map[k] || 0) + 1; });
    const keys = new Set([...Object.keys(map), ...items.map(typeKeyOf)]);
    return [...keys].sort((a, b) => typeLabelOf(a).localeCompare(typeLabelOf(b))).map((k) => ({ key: k, label: typeLabelOf(k), count: map[k] || 0 }));
  }, [items, f, tokens, haystacks]);

  const results = useMemo(
    () => filterItems(items, f, tokens, haystacks, null).sort(SORT_FNS[filters.sort] || smartSort),
    [items, f, tokens, haystacks, filters.sort]
  );
  const shown = results.slice(0, limit);

  const statusChips = STATUS_ORDER.filter((s) => statusCounts.map[s] || filters.status === s);
  const dirty = JSON.stringify({ ...filters, search: filters.search.trim() }) !== JSON.stringify(DEFAULT_FILTERS);
  const refinedBeyondView = filters.status !== 'all' || filters.type !== 'all' || filters.search.trim() !== '';

  // ── detail popup ──
  const current = openId ? items.find((i) => i.id === openId) || null : null;
  const currentIndex = current ? results.findIndex((i) => i.id === current.id) : -1;

  const openCase = (item, trigger) => {
    triggerRef.current = trigger || null;
    setOpenId(item.id);
    setRemark('');
    setRemarkError('');
    modalNotice.dismiss();
  };

  const closeCase = useCallback(() => {
    setZoomDoc(null);
    setOpenId(null);
    triggerRef.current?.focus?.();
  }, []);

  const stepCase = (delta) => {
    const next = results[currentIndex + delta];
    if (!next) return;
    setOpenId(next.id);
    setRemark('');
    setRemarkError('');
    modalNotice.dismiss();
    dialogRef.current?.scrollTo?.({ top: 0 });
  };

  // A case that disappears (deleted elsewhere) closes the popup.
  useEffect(() => {
    if (openId && !loading && !items.some((i) => i.id === openId)) setOpenId(null);
  }, [openId, items, loading]);

  // Escape closes the enlarged image first, then the popup; page scroll is locked while open.
  useEffect(() => {
    if (!current) return undefined;
    const onKey = (e) => {
      if (e.key !== 'Escape') return;
      if (zoomDoc) setZoomDoc(null);
      else closeCase();
    };
    document.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    dialogRef.current?.focus();
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [current?.id, zoomDoc, closeCase]); // eslint-disable-line react-hooks/exhaustive-deps

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
      modalNotice.success(`Marked ${statusLabel(status).toLowerCase()} by you. The change is recorded in the history below.`);
      setRemark('');
    } catch (err) {
      modalNotice.error(err.response?.data?.message || err.message || 'Could not save the decision.');
    } finally {
      setBusy('');
    }
  };

  // Sign off an automatic approve / reject without changing it.
  const confirmDecision = async () => {
    if (!current || busy) return;
    setBusy('confirm');
    try {
      const res = await reviewKycApplication(current.id, current.status, remark.trim());
      patchItem(res.application);
      modalNotice.success(`You confirmed the automated ${statusLabel(current.status).toLowerCase()} decision. It is no longer waiting for review.`);
      setRemark('');
    } catch (err) {
      modalNotice.error(err.response?.data?.message || err.message || 'Could not confirm the decision.');
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
      modalNotice.info(res.applied
        ? `Re-checked automatically: now ${statusLabel(res.decision).toLowerCase()}.`
        : 'Checks refreshed — the status was not changed.');
    } catch (err) {
      modalNotice.error(err.response?.data?.message || err.message || 'Could not re-run the automated check.');
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
      pageNotice.info(decided
        ? `Automatic review finished: ${summary.approved} approved, ${summary.rejected} rejected, ${summary.flagged} flagged.`
        : 'Everything waiting has already been checked.');
    } catch (err) {
      pageNotice.error(err.response?.data?.message || err.message || 'Automatic review failed.');
    } finally {
      setBusy('');
    }
  };

  const summaryCards = [
    { key: 'attention', tone: 'amber', label: 'Needs review', value: totals.attention, hint: totals.attention ? `${totals.open} open · ${totals.toConfirm} automated to confirm` : 'Nothing waiting' },
    { key: 'approved', tone: 'green', label: 'Auto-approved', value: totals.autoApproved, hint: 'Awaiting confirmation' },
    { key: 'rejected', tone: 'red', label: 'Auto-rejected', value: totals.autoRejected, hint: 'Awaiting confirmation' },
    { key: 'manual', tone: 'blue', label: 'Manual decisions', value: totals.manual, hint: 'Decided by a person' },
  ];

  const overriding = current && bySystem(current);
  const extraDocs = current ? (current.documents || []).filter((d) => !SLOT_KEYS.has(d.key)) : [];

  // ── popup ──
  const popup = current && createPortal(
    <div className="kycv-overlay" onMouseDown={(e) => { if (e.target === e.currentTarget) closeCase(); }}>
      <div
        className="kycv-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="kycv-modal-title"
        tabIndex={-1}
        ref={dialogRef}
      >
        <header className={`kycv-modal-head ${statusBadgeClass(current.status)}`}>
          <span className="kycv-case-avatar">{initials(current.name)}</span>
          <div className="kycv-modal-id">
            <h2 id="kycv-modal-title">{current.name}</h2>
            <p><code>{current.nic}</code> · {current.phone || '—'}</p>
          </div>
          <StatusBadge status={current.status} />
          <div className="kycv-modal-nav">
            <button type="button" className="kycv-icon-btn" onClick={() => stepCase(-1)} disabled={currentIndex <= 0} aria-label="Previous case" title="Previous case">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
            </button>
            <span className="kycv-modal-count">{currentIndex >= 0 ? `${currentIndex + 1} / ${results.length}` : '—'}</span>
            <button type="button" className="kycv-icon-btn" onClick={() => stepCase(1)} disabled={currentIndex < 0 || currentIndex >= results.length - 1} aria-label="Next case" title="Next case">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6" /></svg>
            </button>
            <button type="button" className="kycv-icon-btn close" onClick={closeCase} aria-label="Close" title="Close (Esc)">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M6 6l12 12M18 6 6 18" /></svg>
            </button>
          </div>
        </header>

        <div className="kycv-modal-body">
          <AdminNotice notice={modalNotice.notice} onDismiss={modalNotice.dismiss} />

          <div className="kycv-meta">
            <div><label>Request</label><span>{current.kind === 'account' ? 'Account registration' : serviceLabel(current.serviceType)}</span></div>
            <div><label>Reference</label><span className="mono">{current.referenceNumber}</span></div>
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

          <div className="kycv-columns">
            <div className="kycv-col">
              <section className="kycv-card">
                <div className="kycv-card-head">
                  <div><h3>Identity documents</h3><p>Compare the live picture with the NIC photo yourself — the system does not.</p></div>
                </div>
                <div className="kycv-docs">
                  {DOC_SLOTS.map((spec) => (
                    <DocSlot
                      key={spec.slot}
                      spec={spec}
                      doc={pickDoc(current, spec.keys)}
                      note={spec.slot === 'signature' && current.signatureMode === 'otp' ? 'Signed digitally by OTP — no drawn signature' : null}
                      onZoom={setZoomDoc}
                    />
                  ))}
                </div>
                {extraDocs.length > 0 && (
                  <>
                    <div className="kycv-subhead">Other documents</div>
                    <div className="kycv-docs">
                      {extraDocs.map((d) => (
                        <DocSlot key={d.key} spec={{ slot: d.key, label: d.label, fit: 'contain' }} doc={d} onZoom={setZoomDoc} />
                      ))}
                    </div>
                  </>
                )}
              </section>

              <section className="kycv-card">
                <div className="kycv-card-head"><div><h3>Applicant information</h3></div></div>
                <div className="kycv-info">
                  <div><label>Full name</label><span>{current.name}</span></div>
                  <div><label>NIC / passport</label><span className="mono">{current.nic}</span></div>
                  <div><label>Phone</label><span>{current.phone || '—'}</span></div>
                  <div><label>Reference</label><span className="mono">{current.referenceNumber}</span></div>
                </div>
              </section>
            </div>

            <div className="kycv-col">
              <section className="kycv-card">
                <div className="kycv-card-head">
                  <div>
                    <h3>Automated checks</h3>
                    <p>
                      {current.autoCheckedAt
                        ? <>Checked {timeAgo(current.autoCheckedAt)} · system verdict <strong className={`kycv-verdict ${current.autoDecision}`}>{statusLabel(current.autoDecision)}</strong>
                          {current.autoDecision && current.autoDecision !== current.status && byPerson(current) ? ' — changed by a person' : ''}</>
                        : 'The system has not checked this case yet.'}
                    </p>
                  </div>
                  <button type="button" className="admin-btn ghost" onClick={rerun} disabled={!!busy || current.locked}>
                    {busy === 'rerun' ? 'Checking…' : 'Re-run check'}
                  </button>
                </div>
                {current.checks.length ? <CheckList checks={current.checks} /> : (
                  <div className="kycv-nochecks">
                    New cases are reviewed automatically within a minute. You can also press <strong>Run automatic review</strong> on the page, or re-run this case.
                  </div>
                )}
              </section>

              <section className="kycv-card kycv-decision">
                <div className="kycv-card-head">
                  <div>
                    <h3>Review decision</h3>
                    <p>{overriding ? 'The system decided this case. You can keep it or change it — changing needs a remark.' : 'Record your decision and a remark for the audit trail.'}</p>
                  </div>
                </div>

                {current.notes ? (
                  <div className={`kycv-remark ${bySystem(current) ? 'system' : 'manual'}`}>
                    <div className="kycv-remark-head"><span>Current remark</span><Actor item={current} /></div>
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

                {awaitsConfirmation(current) && (
                  <div className="kycv-confirm">
                    <div>
                      <strong>Waiting for your review</strong>
                      <span>The system {current.status === 'approved' ? 'approved' : 'rejected'} this case. Confirm it if you agree, or choose a different decision below.</span>
                    </div>
                    <button type="button" className="admin-btn primary" onClick={confirmDecision} disabled={!!busy}>
                      {busy === 'confirm' ? 'Confirming…' : `Confirm ${statusLabel(current.status).toLowerCase()}`}
                    </button>
                  </div>
                )}

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
            </div>
          </div>

          <section className="kycv-card">
            <div className="kycv-card-head"><div><h3>Decision history</h3><p>Every change to this case, newest first.</p></div></div>
            {current.history.length ? <History history={current.history} /> : (
              <div className="kycv-nochecks">
                {byPerson(current)
                  ? `Decided by ${current.decidedByName || 'a team member'} before decision history was recorded.`
                  : 'No decisions have been recorded yet.'}
              </div>
            )}
          </section>
        </div>
      </div>

      {zoomDoc && (
        <div className="kycv-lightbox" onMouseDown={(e) => { if (e.target === e.currentTarget) setZoomDoc(null); }} role="dialog" aria-modal="true" aria-label={zoomDoc.label}>
          <div className="kycv-lightbox-bar">
            <strong>{zoomDoc.label}</strong>
            <span>{current.name}</span>
            <button type="button" className="kycv-icon-btn close" onClick={() => setZoomDoc(null)} aria-label="Close enlarged image">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M6 6l12 12M18 6 6 18" /></svg>
            </button>
          </div>
          <div className="kycv-lightbox-img">
            <AuthImage url={zoomDoc.url} alt={zoomDoc.label} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', minHeight: 0 }} />
          </div>
        </div>
      )}
    </div>,
    document.body
  );

  // ── render ──
  return (
    <div className="kycv-page">
      <AdminNotice notice={pageNotice.notice} onDismiss={pageNotice.dismiss} />

      <header className="kycv-header">
        <div>
          <h1 className="admin-page-title">KYC Review</h1>
          <p className="admin-page-subtitle">
            New cases are checked automatically. Open any case to see what the system decided — and change it whenever you disagree.
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

      {/* Read-only overview — not clickable */}
      <section className="kycv-summary" aria-label="KYC overview">
        {summaryCards.map((c, idx) => (
          <div className={`kycv-stat ${c.tone}`} key={c.key} style={{ '--i': idx }}>
            <span className="kycv-stat-label">{c.label}</span>
            <span className="kycv-stat-value">{loading ? '–' : <AnimatedNumber value={c.value} />}</span>
            <span className="kycv-stat-hint">{c.hint}</span>
          </div>
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
        <section className="kycv-panel">
          <div className="kycv-panel-head">
            <div className="kycv-panel-title">
              <h2>Customer summary</h2>
              <p>
                Showing <strong>{shown.length}</strong> of <strong>{results.length}</strong>
                {results.length !== items.length ? ` matching cases (${items.length} in total)` : ' cases'}
              </p>
            </div>
            <div className="admin-search kycv-search">
              <svg className="admin-search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
              </svg>
              <input
                type="text"
                placeholder="Search name, NIC, phone, reference… (words combine)"
                value={filters.search}
                onChange={(e) => setFilter({ search: e.target.value })}
                aria-label="Search KYC cases"
              />
              {filters.search && (
                <button type="button" className="kycv-clear" onClick={() => setFilter({ search: '' })} aria-label="Clear search">×</button>
              )}
            </div>
          </div>

          {/* Filters */}
          <div className="kycv-filterbar">
            <div className="kycv-views" role="tablist" aria-label="View">
              {VIEWS.map((v) => (
                <button
                  key={v.key}
                  type="button"
                  role="tab"
                  aria-selected={filters.view === v.key}
                  title={v.hint}
                  className={`kycv-view${filters.view === v.key ? ' active' : ''}`}
                  onClick={() => setFilter({ view: v.key })}
                >
                  {v.label}<span>{viewCounts[v.key]}</span>
                </button>
              ))}
            </div>

            <div className="kycv-filter-row">
              <div className="kycv-chips" role="group" aria-label="Status">
                <button type="button" className={`kycv-chip${filters.status === 'all' ? ' active' : ''}`} onClick={() => setFilter({ status: 'all' })}>
                  Any status<span>{statusCounts.total}</span>
                </button>
                {statusChips.map((s) => (
                  <button
                    key={s}
                    type="button"
                    className={`kycv-chip ${statusBadgeClass(s)}${filters.status === s ? ' active' : ''}`}
                    onClick={() => setFilter({ status: filters.status === s ? 'all' : s })}
                  >
                    <i aria-hidden="true" />{statusLabel(s)}<span>{statusCounts.map[s] || 0}</span>
                  </button>
                ))}
              </div>

              <div className="kycv-selects">
                <label className="kycv-select">
                  <span>Request</span>
                  <select value={filters.type} onChange={(e) => setFilter({ type: e.target.value })}>
                    <option value="all">All requests</option>
                    {typeOptions.map((t) => (
                      <option key={t.key} value={t.key}>{t.label} ({t.count})</option>
                    ))}
                  </select>
                </label>
                <label className="kycv-select">
                  <span>Sort</span>
                  <select value={filters.sort} onChange={(e) => setFilter({ sort: e.target.value })}>
                    {SORTS.map((s) => <option key={s.key} value={s.key}>{s.label}</option>)}
                  </select>
                </label>
                {dirty && (
                  <button type="button" className="kycv-reset" onClick={() => { setFilters(DEFAULT_FILTERS); setLimit(PAGE_SIZE); }}>
                    Reset
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Results */}
          {results.length === 0 ? (
            <div className="kycv-empty">
              <span className="kycv-empty-icon">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  {refinedBeyondView || filters.view !== 'attention'
                    ? <><circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" /></>
                    : <><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><path d="m9 11 3 3L22 4" /></>}
                </svg>
              </span>
              <h3>
                {items.length === 0 ? 'No KYC cases yet'
                  : refinedBeyondView ? 'No cases match these filters'
                    : filters.view === 'attention' ? 'All caught up' : 'Nothing in this view'}
              </h3>
              <p>
                {items.length === 0 ? 'Cases appear here as soon as customers register or submit requests.'
                  : refinedBeyondView ? 'Try removing a filter or searching for something else.'
                    : filters.view === 'attention' ? 'No open case and no automated decision is waiting for a person.' : 'There are no cases here yet.'}
              </p>
              {items.length > 0 && (
                <div className="kycv-empty-actions">
                  {refinedBeyondView && <button type="button" className="admin-btn ghost" onClick={() => { setFilters({ ...DEFAULT_FILTERS, view: filters.view }); setLimit(PAGE_SIZE); }}>Clear filters</button>}
                  {filters.view !== 'all' && <button type="button" className="admin-btn" onClick={() => setFilter({ view: 'all', status: 'all', type: 'all', search: '' })}>Show all cases</button>}
                </div>
              )}
            </div>
          ) : (
            <>
              <div className="kycv-table-wrap">
                <table className="kycv-table">
                  <thead>
                    <tr>
                      <th>Customer</th>
                      <th>Request</th>
                      <th>Submitted</th>
                      <th>Status</th>
                      <th>Decided by</th>
                      <th aria-label="Open" />
                    </tr>
                  </thead>
                  <tbody>
                    {shown.map((item) => (
                      <tr
                        key={item.id}
                        className={`${statusBadgeClass(item.status)}${openId === item.id ? ' selected' : ''}`}
                        onClick={(e) => openCase(item, e.currentTarget.querySelector('.kycv-open'))}
                      >
                        <td data-label="Customer">
                          <div className="kycv-person">
                            <span className="kycv-item-avatar">{initials(item.name)}</span>
                            <div>
                              <strong>{item.name}</strong>
                              <small><code>{item.nic}</code> · {item.phone || '—'}</small>
                            </div>
                          </div>
                        </td>
                        <td data-label="Request">
                          <span className="kycv-req">{typeLabelOf(typeKeyOf(item))}</span>
                          {item.kind !== 'account' && item.referenceNumber ? <small className="kycv-ref">{item.referenceNumber}</small> : null}
                        </td>
                        <td data-label="Submitted">
                          <span className="kycv-when">{formatDate(item.submittedAt)}</span>
                          <small>{timeAgo(item.submittedAt)}</small>
                        </td>
                        <td data-label="Status"><StatusBadge status={item.status} /></td>
                        <td data-label="Decided by">
                          <Actor item={item} compact />
                          {awaitsConfirmation(item)
                            ? <small className="kycv-await">Awaiting review</small>
                            : item.decidedAt ? <small>{timeAgo(item.decidedAt)}</small> : null}
                        </td>
                        <td className="kycv-action-cell">
                          <button type="button" className="kycv-open" onClick={(e) => { e.stopPropagation(); openCase(item, e.currentTarget); }} aria-label={`Review ${item.name}`}>
                            Review
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6" /></svg>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {results.length > shown.length && (
                <div className="kycv-more">
                  <button type="button" className="admin-btn ghost" onClick={() => setLimit((l) => l + PAGE_SIZE)}>
                    Show {Math.min(PAGE_SIZE, results.length - shown.length)} more
                  </button>
                  <span>{results.length - shown.length} not shown</span>
                </div>
              )}
            </>
          )}
        </section>
      )}

      {popup}
    </div>
  );
}
