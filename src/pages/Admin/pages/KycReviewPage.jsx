import React, { useCallback, useDeferredValue, useEffect, useId, useMemo, useRef, useState } from 'react';
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
  { status: 'approved', label: 'Approve', cls: 'success', icon: 'check' },
  { status: 'rejected', label: 'Reject', cls: 'danger', icon: 'x' },
  { status: 'flagged', label: 'Flag for review', cls: 'warning', icon: 'flag' },
];

// The four identity items every case shows, whether or not they were provided.
const DOC_SLOTS = [
  { slot: 'nicFront', label: 'NIC front', keys: ['nicFront'], fit: 'contain', icon: 'idCard' },
  { slot: 'nicBack', label: 'NIC back', keys: ['nicBack'], fit: 'contain', icon: 'idCard' },
  { slot: 'signature', label: 'Signature', keys: ['signature', 'signatureDoc', 'customerSignature'], fit: 'contain', icon: 'pen' },
  { slot: 'facePhoto', label: 'Live picture', keys: ['facePhoto'], fit: 'cover', icon: 'camera' },
];
const SLOT_KEYS = new Set(DOC_SLOTS.flatMap((d) => d.keys));

const CHECK_META = {
  pass: 'Passed',
  fail: 'Mismatch',
  unsure: 'Not sure',
  manual: 'Check by eye',
};
const CHECK_ORDER = ['pass', 'fail', 'unsure', 'manual'];
const CHECK_SEVERITY = { fail: 0, unsure: 1, manual: 2, pass: 3 };
const CHECK_ICON = { pass: 'check', fail: 'x', unsure: 'alert', manual: 'eye' };
const VERDICT_ICON = { approved: 'shieldCheck', rejected: 'shieldX', flagged: 'flag' };

const ICON_PATHS = {
  shield: <path d="M12 2 4 5v6c0 5 3.4 9.4 8 11 4.6-1.6 8-6 8-11V5l-8-3Z" />,
  shieldCheck: <><path d="M12 2 4 5v6c0 5 3.4 9.4 8 11 4.6-1.6 8-6 8-11V5l-8-3Z" /><path d="m9 12 2 2 4-4" /></>,
  shieldX: <><path d="M12 2 4 5v6c0 5 3.4 9.4 8 11 4.6-1.6 8-6 8-11V5l-8-3Z" /><path d="m9.5 9.5 5 5M14.5 9.5l-5 5" /></>,
  hourglass: <><path d="M6 2h12M6 22h12" /><path d="M7 2v4a5 5 0 0 0 10 0V2" /><path d="M7 22v-4a5 5 0 0 1 10 0v4" /></>,
  userCheck: <><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="m16 11 2 2 4-4" /></>,
  bolt: <path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z" />,
  refresh: <><path d="M21 12a9 9 0 1 1-2.64-6.36" /><path d="M21 3v6h-6" /></>,
  bot: <><rect x="4" y="8" width="16" height="12" rx="3" /><path d="M12 8V4" /><circle cx="12" cy="3" r="1" /><path d="M9 14h.01M15 14h.01" /></>,
  user: <><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></>,
  check: <path d="m5 12 4.5 4.5L19 7" />,
  x: <path d="M6 6l12 12M18 6 6 18" />,
  flag: <><path d="M4 22V4" /><path d="M4 4h12l-2 4 2 4H4" /></>,
  alert: <><path d="M12 7v6" /><path d="M12 17h.01" /></>,
  eye: <><path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12Z" /><circle cx="12" cy="12" r="3" /></>,
  search: <><circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" /></>,
  zoomIn: <><circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35M11 8v6M8 11h6" /></>,
  zoomOut: <><circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35M8 11h6" /></>,
  rotate: <><path d="M3 12a9 9 0 1 0 2.64-6.36" /><path d="M3 3v6h6" /></>,
  compare: <><rect x="2" y="4" width="8" height="16" rx="2" /><rect x="14" y="4" width="8" height="16" rx="2" /><path d="M12 2v20" /></>,
  idCard: <><rect x="2" y="5" width="20" height="14" rx="2.5" /><circle cx="8" cy="11" r="2" /><path d="M5 16c.6-1.4 1.7-2 3-2s2.4.6 3 2M14 10h5M14 14h3" /></>,
  pen: <><path d="M12 20h9" /><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" /></>,
  camera: <><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3Z" /><circle cx="12" cy="13" r="3" /></>,
  image: <><rect x="3" y="3" width="18" height="18" rx="3" /><circle cx="9" cy="9" r="2" /><path d="m21 15-5-5L5 21" /></>,
  file: <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z" /><path d="M14 2v6h6" /></>,
  hash: <path d="M4 9h16M4 15h16M10 3 8 21M16 3l-2 18" />,
  calendar: <><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" /></>,
  list: <><path d="M8 6h13M8 12h13M8 18h13" /><path d="M3 6h.01M3 12h.01M3 18h.01" /></>,
  history: <><path d="M3 12a9 9 0 1 0 3-6.7L3 8" /><path d="M3 3v5h5" /><path d="M12 7v5l3 2" /></>,
  message: <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />,
  lock: <><rect x="4" y="11" width="16" height="10" rx="2" /><path d="M8 11V7a4 4 0 0 1 8 0v4" /></>,
  chevronLeft: <path d="m15 18-6-6 6-6" />,
  chevronRight: <path d="m9 18 6-6-6-6" />,
  sparkle: <path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M6 18l2.5-2.5M15.5 8.5 18 6" />,
};

// ── helpers ──────────────────────────────────────────────────────────────────

function initials(name) {
  if (!name) return '?';
  return name.split(/\s+/).filter((w) => w && !/^(mr|mrs|ms|miss|dr)\.?$/i.test(w)).map((w) => w[0]).slice(0, 2).join('').toUpperCase() || '?';
}

// A stable colour for each person's avatar, so the same applicant is easy to spot again
// (titles, case and spacing are ignored, so "Mr. A B" and "A  b" share a colour).
function toneOf(name) {
  const key = String(name || '').toLowerCase().replace(/\b(mr|mrs|ms|miss|dr)\b\.?/g, ' ').replace(/\s+/g, ' ').trim();
  let h = 0;
  for (const ch of key) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return h % 6;
}

const isOpen = (item) => OPEN_STATUSES.includes(item.status);
const bySystem = (item) => item.decidedBy === 'system';
const byPerson = (item) => item.decidedBy === 'admin';

// Approved / rejected by the system and not yet confirmed or changed by a person.
// (A confirmed application is final, so it never waits for review.)
const awaitsConfirmation = (item) => bySystem(item) && !isOpen(item) && !item.locked;

// Everything that needs a person: open cases, plus every automated decision.
const needsReview = (item) => isOpen(item) || awaitsConfirmation(item);

// When a waiting case started waiting: open cases since submission, automated ones since the decision.
const waitingSince = (item) => (isOpen(item) ? item.submittedAt : item.decidedAt || item.submittedAt);

const typeKeyOf = (item) => (item.kind === 'account' ? 'account' : item.serviceType || 'other');
const typeLabelOf = (key) => (key === 'account' ? 'Account registration' : serviceLabel(key));

const isTyping = (el) => !!el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.tagName === 'SELECT' || el.isContentEditable);

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

function Icon({ name, size = 16, stroke = 2.2, className }) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {ICON_PATHS[name]}
    </svg>
  );
}

// Marks the parts of `text` that match the search words.
function Highlight({ text, tokens }) {
  const value = text == null ? '' : String(text);
  if (!tokens.length || !value) return value;
  const pattern = new RegExp(`(${tokens.map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})`, 'gi');
  return value.split(pattern).map((part, i) => (i % 2 ? <mark className="kycv-hl" key={i}>{part}</mark> : part));
}

function Ring({ value, size = 96, stroke = 9, children }) {
  const id = useId().replace(/:/g, '');
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const pct = Math.max(0, Math.min(100, Number(value) || 0));
  const mid = size / 2;
  return (
    <div className="kycv-ring" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden="true">
        <defs>
          <linearGradient id={`kycv-ring-${id}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#7fdc76" />
            <stop offset="100%" stopColor="#5aa9f0" />
          </linearGradient>
        </defs>
        <circle cx={mid} cy={mid} r={r} fill="none" stroke="rgba(255, 255, 255, 0.14)" strokeWidth={stroke} />
        <circle
          className="kycv-ring-value"
          cx={mid}
          cy={mid}
          r={r}
          fill="none"
          stroke={`url(#kycv-ring-${id})`}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - pct / 100)}
          transform={`rotate(-90 ${mid} ${mid})`}
        />
      </svg>
      <div className="kycv-ring-center">{children}</div>
    </div>
  );
}

function Actor({ item, compact }) {
  if (bySystem(item)) {
    return (
      <span className={`kycv-actor system${compact ? ' compact' : ''}`}>
        <Icon name="bot" size={12} />
        {compact ? 'Auto' : SYSTEM_NAME}
      </span>
    );
  }
  if (byPerson(item)) {
    return (
      <span className={`kycv-actor manual${compact ? ' compact' : ''}`}>
        <Icon name="user" size={12} />
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
      {checks.map((c, idx) => (
        <li className={`kycv-check ${c.result}`} key={c.key} style={{ '--c': idx }}>
          <span className="kycv-check-icon"><Icon name={CHECK_ICON[c.result]} size={14} stroke={2.6} /></span>
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

// One glance summary of every automated check: the verdict, a bar with one segment per check, and the counts.
function Scorecard({ item }) {
  const counts = CHECK_ORDER.reduce((acc, r) => ({ ...acc, [r]: item.checks.filter((c) => c.result === r).length }), {});
  const verdict = item.autoDecision || '';
  return (
    <div className={`kycv-scorecard ${verdict}`}>
      <div className="kycv-scorecard-verdict">
        <span className="kycv-scorecard-icon"><Icon name={VERDICT_ICON[verdict] || 'shield'} size={20} stroke={2.1} /></span>
        <div>
          <small>System verdict</small>
          <strong>{verdict ? statusLabel(verdict) : 'Not decided'}</strong>
        </div>
        <span className="kycv-scorecard-score">
          <b>{counts.pass}</b>/{item.checks.length - counts.manual} passed
        </span>
      </div>
      <div className="kycv-scorecard-bar" aria-hidden="true">
        {item.checks.map((c) => <span key={c.key} className={c.result} title={`${c.label}: ${CHECK_META[c.result]}`} />)}
      </div>
      <div className="kycv-scorecard-legend">
        {CHECK_ORDER.filter((r) => counts[r]).map((r) => (
          <span key={r} className={r}><i aria-hidden="true" />{counts[r]} {CHECK_META[r].toLowerCase()}</span>
        ))}
      </div>
    </div>
  );
}

function History({ history }) {
  return (
    <ol className="kycv-timeline">
      {history.map((h, i) => (
        <li className={`kycv-tl-item ${h.actor}`} key={`${h.at}-${i}`}>
          <span className="kycv-tl-dot"><Icon name={h.actor === 'system' ? 'bot' : 'user'} size={11} stroke={2.4} /></span>
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
        <div className="kycv-doc-label">
          <span><Icon name={spec.icon || 'file'} size={13} />{spec.label}</span>
          {!note && <span className="kycv-doc-flag">Missing</span>}
        </div>
        <div className="kycv-doc-empty">
          <Icon name="image" size={26} stroke={1.8} />
          <strong>Not provided</strong>
          {note ? <span>{note}</span> : null}
        </div>
      </div>
    );
  }
  return (
    <button type="button" className="kycv-doc" onClick={() => onZoom(doc.key)} aria-label={`Enlarge ${spec.label}`}>
      <div className="kycv-doc-label">
        <span><Icon name={spec.icon || 'file'} size={13} />{spec.label}</span>
        <span className="kycv-doc-zoom"><Icon name="zoomIn" size={13} /></span>
      </div>
      <div className={`kycv-doc-media ${spec.fit}`}>
        <AuthImage url={doc.url} alt={spec.label} style={{ width: '100%', height: '100%', objectFit: spec.fit, minHeight: 0 }} />
        <span className="kycv-doc-hover" aria-hidden="true"><Icon name="zoomIn" size={15} />Enlarge</span>
      </div>
    </button>
  );
}

// One enlarged image. Sideways turns swap the size limits so the picture still fits.
function ZoomImage({ doc, turn, scale, origin, onToggle, onPan }) {
  const sideways = turn % 2 === 1;
  return (
    <div
      className={`kycv-zoom-stage${scale > 1 ? ' zoomed' : ''}`}
      onClick={onToggle}
      onMouseMove={onPan}
    >
      <div className="kycv-zoom-frame" style={{ transform: `scale(${scale})`, transformOrigin: origin }}>
        <div className="kycv-zoom-turn" style={{ transform: `rotate(${turn * 90}deg)` }}>
          <AuthImage
            key={doc.key}
            url={doc.url}
            alt={doc.label}
            style={{
              maxWidth: sideways ? '100cqh' : '100cqw',
              maxHeight: sideways ? '100cqw' : '100cqh',
              objectFit: 'contain',
              minHeight: 0,
            }}
          />
        </div>
      </div>
    </div>
  );
}

// ── page ─────────────────────────────────────────────────────────────────────

export default function KycReviewPage() {
  const pageNotice = useAdminNotice(5000);
  const modalNotice = useAdminNotice(4500);

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState('');

  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [limit, setLimit] = useState(PAGE_SIZE);
  const deferredSearch = useDeferredValue(filters.search);

  const [openId, setOpenId] = useState(null);
  const [remark, setRemark] = useState('');
  const [remarkError, setRemarkError] = useState('');
  const [showPassed, setShowPassed] = useState(false);

  // Enlarged image: { index } for one document, { compare: true } for NIC beside live picture.
  const [zoom, setZoom] = useState(null);
  const [zoomTurn, setZoomTurn] = useState(0);
  const [zoomScale, setZoomScale] = useState(1);
  const [zoomOrigin, setZoomOrigin] = useState('50% 50%');

  const dialogRef = useRef(null);
  const bodyRef = useRef(null);
  const lightboxRef = useRef(null);
  const triggerRef = useRef(null);
  const searchRef = useRef(null);

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

  // Manual refresh keeps the list on screen and only spins the button.
  const refresh = async () => {
    if (refreshing || loading) return;
    setRefreshing(true);
    try {
      const data = await getKycQueue();
      setItems(data.queue || []);
      setError(null);
    } catch (err) {
      pageNotice.error(err.response?.data?.message || err.message || 'Could not refresh the KYC list.');
    } finally {
      setRefreshing(false);
    }
  };

  // "/" jumps to the search box (when nothing else is being typed in).
  useEffect(() => {
    if (openId) return undefined;
    const onKey = (e) => {
      if (e.key !== '/' || e.ctrlKey || e.metaKey || e.altKey || isTyping(e.target)) return;
      e.preventDefault();
      searchRef.current?.focus();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [openId]);

  // ── derived data ──
  const haystacks = useMemo(() => new Map(items.map((i) => [i.id, [
    i.name, i.nic, i.phone, i.referenceNumber, statusLabel(i.status), typeLabelOf(typeKeyOf(i)), i.decidedByName,
    bySystem(i) ? 'automated auto system' : byPerson(i) ? 'manual person' : '',
  ].join(' ').toLowerCase()])), [items]);

  const tokens = useMemo(() => deferredSearch.trim().toLowerCase().split(/\s+/).filter(Boolean), [deferredSearch]);

  // Summary cards and hero: always the whole picture, never affected by the filters.
  const totals = useMemo(() => ({
    attention: items.filter(needsReview).length,
    open: items.filter(isOpen).length,
    toConfirm: items.filter(awaitsConfirmation).length,
    autoApproved: items.filter((i) => bySystem(i) && i.status === 'approved').length,
    autoRejected: items.filter((i) => bySystem(i) && i.status === 'rejected').length,
    manual: items.filter(byPerson).length,
  }), [items]);

  const hero = useMemo(() => {
    const counts = Object.fromEntries(STATUS_ORDER.map((s) => [s, 0]));
    items.forEach((i) => { if (counts[i.status] != null) counts[i.status] += 1; });
    const auto = items.filter(bySystem).length;
    const decided = auto + items.filter(byPerson).length;
    const oldest = items.filter(needsReview).reduce((min, i) => {
      const t = new Date(waitingSince(i)).getTime();
      return Number.isFinite(t) && t < min ? t : min;
    }, Infinity);
    return {
      counts,
      auto,
      decided,
      rate: decided ? Math.round((auto / decided) * 100) : 0,
      oldest: Number.isFinite(oldest) ? oldest : null,
    };
  }, [items]);

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
  const viewIndex = Math.max(0, VIEWS.findIndex((v) => v.key === filters.view));

  // ── detail popup ──
  const current = openId ? items.find((i) => i.id === openId) || null : null;
  const currentIndex = current ? results.findIndex((i) => i.id === current.id) : -1;
  const modalOpen = !!current;

  // Every image this case has, in display order — the enlarged view pages through them.
  const gallery = useMemo(() => {
    if (!current) return [];
    const slotDocs = DOC_SLOTS
      .map((spec) => {
        const doc = pickDoc(current, spec.keys);
        return doc ? { ...doc, label: spec.label, icon: spec.icon } : null;
      })
      .filter(Boolean);
    const extras = (current.documents || [])
      .filter((d) => !SLOT_KEYS.has(d.key))
      .map((d) => ({ ...d, icon: 'file' }));
    return [...slotDocs, ...extras];
  }, [current]);

  const nicFrontDoc = gallery.find((d) => d.key === 'nicFront') || null;
  const faceDoc = gallery.find((d) => d.key === 'facePhoto') || null;
  const zoomItem = zoom && !zoom.compare ? gallery[zoom.index] || null : null;

  const resetZoomView = () => { setZoomTurn(0); setZoomScale(1); setZoomOrigin('50% 50%'); };

  const openZoom = (key) => {
    const index = gallery.findIndex((d) => d.key === key);
    if (index < 0) return;
    resetZoomView();
    setZoom({ index });
  };

  const openCompare = () => { resetZoomView(); setZoom({ compare: true }); };

  const stepZoom = (delta) => {
    if (!zoom || zoom.compare || gallery.length < 2) return;
    resetZoomView();
    setZoom({ index: (zoom.index + delta + gallery.length) % gallery.length });
  };

  const toggleZoomScale = (e) => {
    if (zoomScale > 1) { setZoomScale(1); return; }
    const rect = e.currentTarget.getBoundingClientRect();
    setZoomOrigin(`${((e.clientX - rect.left) / rect.width) * 100}% ${((e.clientY - rect.top) / rect.height) * 100}%`);
    setZoomScale(2);
  };

  const panZoom = (e) => {
    if (zoomScale <= 1) return;
    const rect = e.currentTarget.getBoundingClientRect();
    setZoomOrigin(`${((e.clientX - rect.left) / rect.width) * 100}% ${((e.clientY - rect.top) / rect.height) * 100}%`);
  };

  const openCase = (item, trigger) => {
    triggerRef.current = trigger || null;
    setOpenId(item.id);
    setZoom(null);
    setShowPassed(false);
    setRemark('');
    setRemarkError('');
    modalNotice.dismiss();
  };

  const closeCase = useCallback(() => {
    setZoom(null);
    setOpenId(null);
    triggerRef.current?.focus?.();
  }, []);

  const stepCase = (delta) => {
    const next = results[currentIndex + delta];
    if (!next) return;
    setOpenId(next.id);
    setZoom(null);
    setShowPassed(false);
    setRemark('');
    setRemarkError('');
    modalNotice.dismiss();
    bodyRef.current?.scrollTo?.({ top: 0 });
  };

  // A case that disappears (deleted elsewhere) closes the popup.
  useEffect(() => {
    if (openId && !loading && !items.some((i) => i.id === openId)) setOpenId(null);
  }, [openId, items, loading]);

  // Page scroll is locked while the popup is open; focus moves into it once.
  useEffect(() => {
    if (!modalOpen) return undefined;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    dialogRef.current?.focus();
    return () => { document.body.style.overflow = prevOverflow; };
  }, [modalOpen]);

  useEffect(() => { if (zoom) lightboxRef.current?.focus(); }, [zoom]);

  // Keyboard: Esc closes the enlarged image first, then the popup (inside the remark box it
  // only leaves the box, so a half-written remark is never lost by accident).
  // ← → move between cases (or between documents while one is enlarged); R turns the image.
  const keysRef = useRef({});
  keysRef.current = { zoom, stepCase, stepZoom, closeCase };
  useEffect(() => {
    if (!modalOpen) return undefined;
    const onKey = (e) => {
      const k = keysRef.current;
      if (e.key === 'Escape') {
        if (k.zoom) setZoom(null);
        else if (isTyping(e.target)) e.target.blur();
        else k.closeCase();
        return;
      }
      if (e.ctrlKey || e.metaKey || e.altKey || isTyping(e.target)) return;
      if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
        e.preventDefault();
        const delta = e.key === 'ArrowLeft' ? -1 : 1;
        if (k.zoom) k.stepZoom(delta);
        else k.stepCase(delta);
      } else if (k.zoom && (e.key === 'r' || e.key === 'R')) {
        setZoomTurn((t) => (t + 1) % 4);
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [modalOpen]);

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

  const total = items.length;
  const share = (n) => (total ? (n / total) * 100 : 0);

  const summaryCards = [
    {
      key: 'attention',
      tone: 'amber',
      icon: 'hourglass',
      label: 'Needs review',
      value: totals.attention,
      hint: totals.attention ? `${totals.open} open · ${totals.toConfirm} automated to confirm` : 'Nothing waiting',
      segments: [{ key: 'main', value: totals.open }, { key: 'soft', value: totals.toConfirm }],
    },
    { key: 'approved', tone: 'green', icon: 'shieldCheck', label: 'Auto-approved', value: totals.autoApproved, hint: 'Awaiting confirmation', segments: [{ key: 'main', value: totals.autoApproved }] },
    { key: 'rejected', tone: 'red', icon: 'shieldX', label: 'Auto-rejected', value: totals.autoRejected, hint: 'Awaiting confirmation', segments: [{ key: 'main', value: totals.autoRejected }] },
    { key: 'manual', tone: 'blue', icon: 'userCheck', label: 'Manual decisions', value: totals.manual, hint: 'Decided by a person', segments: [{ key: 'main', value: totals.manual }] },
  ];

  const overriding = current && bySystem(current);
  const extraDocs = current ? (current.documents || []).filter((d) => !SLOT_KEYS.has(d.key)) : [];

  // Problems first (mismatch → not sure → check by eye); passed checks fold away.
  const checkIssues = current
    ? current.checks.filter((c) => c.result !== 'pass').sort((a, b) => (CHECK_SEVERITY[a.result] ?? 9) - (CHECK_SEVERITY[b.result] ?? 9))
    : [];
  const checkPassed = current ? current.checks.filter((c) => c.result === 'pass') : [];

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
          <div className="kycv-modal-deco" aria-hidden="true"><span /><span /></div>
          <span className={`kycv-case-avatar t${toneOf(current.name)}`}>{initials(current.name)}</span>
          <div className="kycv-modal-id">
            <h2 id="kycv-modal-title">{current.name}</h2>
            <p><code>{current.nic}</code><span className="kycv-sep" />{current.phone || '—'}</p>
          </div>
          <StatusBadge status={current.status} />
          <div className="kycv-modal-nav">
            <button type="button" className="kycv-icon-btn" onClick={() => stepCase(-1)} disabled={currentIndex <= 0} aria-label="Previous case" title="Previous case (←)">
              <Icon name="chevronLeft" size={16} stroke={2.4} />
            </button>
            <span className="kycv-modal-count">{currentIndex >= 0 ? `${currentIndex + 1} / ${results.length}` : '—'}</span>
            <button type="button" className="kycv-icon-btn" onClick={() => stepCase(1)} disabled={currentIndex < 0 || currentIndex >= results.length - 1} aria-label="Next case" title="Next case (→)">
              <Icon name="chevronRight" size={16} stroke={2.4} />
            </button>
            <button type="button" className="kycv-icon-btn close" onClick={closeCase} aria-label="Close" title="Close (Esc)">
              <Icon name="x" size={16} stroke={2.4} />
            </button>
          </div>
        </header>

        <div className="kycv-modal-body" ref={bodyRef}>
          <AdminNotice notice={modalNotice.notice} onDismiss={modalNotice.dismiss} />

          <div className="kycv-meta">
            <div className="kycv-meta-item">
              <span className="kycv-meta-icon"><Icon name="file" size={15} /></span>
              <div><label>Request</label><span>{current.kind === 'account' ? 'Account registration' : serviceLabel(current.serviceType)}</span></div>
            </div>
            <div className="kycv-meta-item">
              <span className="kycv-meta-icon"><Icon name="hash" size={15} /></span>
              <div><label>Reference</label><span className="mono">{current.referenceNumber}</span></div>
            </div>
            <div className="kycv-meta-item">
              <span className="kycv-meta-icon"><Icon name="calendar" size={15} /></span>
              <div><label>Submitted</label><span>{formatDate(current.submittedAt)}</span><small>{timeAgo(current.submittedAt)}</small></div>
            </div>
            <div className="kycv-meta-item">
              <span className="kycv-meta-icon"><Icon name={bySystem(current) ? 'bot' : 'user'} size={15} /></span>
              <div>
                <label>Decided by</label>
                <span className="kycv-decider">
                  <Actor item={current} />
                  {current.decidedAt ? <small>{formatDate(current.decidedAt)}</small> : null}
                </span>
              </div>
            </div>
          </div>

          {current.locked && (
            <div className="kycv-locked" role="note">
              <Icon name="lock" size={15} />
              This application is already confirmed (payment or appointment completed), so the KYC decision is final and can no longer be changed.
            </div>
          )}

          <div className="kycv-columns">
            <div className="kycv-col">
              <section className="kycv-card">
                <div className="kycv-card-head">
                  <span className="kycv-card-icon blue"><Icon name="idCard" size={17} /></span>
                  <div><h3>Identity documents</h3><p>Compare the live picture with the NIC photo yourself — the system does not.</p></div>
                  {nicFrontDoc && faceDoc && (
                    <button type="button" className="kycv-compare-btn" onClick={openCompare}>
                      <Icon name="compare" size={14} />Compare faces
                    </button>
                  )}
                </div>
                <div className="kycv-docs">
                  {DOC_SLOTS.map((spec) => (
                    <DocSlot
                      key={spec.slot}
                      spec={spec}
                      doc={pickDoc(current, spec.keys)}
                      note={spec.slot === 'signature' && current.signatureMode === 'otp' ? 'Signed digitally by OTP — no drawn signature' : null}
                      onZoom={openZoom}
                    />
                  ))}
                </div>
                {extraDocs.length > 0 && (
                  <>
                    <div className="kycv-subhead">Other documents</div>
                    <div className="kycv-docs">
                      {extraDocs.map((d) => (
                        <DocSlot key={d.key} spec={{ slot: d.key, label: d.label, fit: 'contain', icon: 'file' }} doc={d} onZoom={openZoom} />
                      ))}
                    </div>
                  </>
                )}
              </section>

              <section className="kycv-card">
                <div className="kycv-card-head">
                  <span className="kycv-card-icon navy"><Icon name="user" size={17} /></span>
                  <div><h3>Applicant information</h3></div>
                </div>
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
                  <span className="kycv-card-icon green"><Icon name="bot" size={17} /></span>
                  <div>
                    <h3>Automated checks</h3>
                    <p>
                      {current.autoCheckedAt
                        ? <>Checked {timeAgo(current.autoCheckedAt)}{current.autoDecision && current.autoDecision !== current.status && byPerson(current) ? ' · a person changed the verdict' : ''}</>
                        : 'The system has not checked this case yet.'}
                    </p>
                  </div>
                  <button type="button" className="kycv-rerun-btn" onClick={rerun} disabled={!!busy || current.locked}>
                    <Icon name="refresh" size={14} className={busy === 'rerun' ? 'dash-spin' : ''} />
                    {busy === 'rerun' ? 'Checking…' : 'Re-run check'}
                  </button>
                </div>
                {current.checks.length ? (
                  <>
                    <Scorecard item={current} />
                    {checkIssues.length > 0 && <CheckList checks={checkIssues} />}
                    {checkPassed.length > 0 && (
                      <>
                        <button
                          type="button"
                          className={`kycv-passed-toggle${showPassed ? ' open' : ''}`}
                          onClick={() => setShowPassed((v) => !v)}
                          aria-expanded={showPassed}
                        >
                          <span className="kycv-passed-icon"><Icon name="check" size={12} stroke={2.8} /></span>
                          {checkIssues.length ? `${checkPassed.length} more ${checkPassed.length === 1 ? 'check' : 'checks'} passed` : `All ${checkPassed.length} checks passed`}
                          <span className="kycv-passed-action">
                            {showPassed ? 'Hide' : 'Show'}
                            <Icon name="chevronRight" size={13} stroke={2.4} />
                          </span>
                        </button>
                        {showPassed && <CheckList checks={checkPassed} />}
                      </>
                    )}
                  </>
                ) : (
                  <div className="kycv-nochecks">
                    New cases are reviewed automatically within a minute. You can also press <strong>Run automatic review</strong> on the page, or re-run this case.
                  </div>
                )}
              </section>

              <section className="kycv-card kycv-decision">
                <div className="kycv-card-head">
                  <span className="kycv-card-icon amber"><Icon name="message" size={17} /></span>
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
                  <span className="kycv-count">{remark.length} / 1900</span>
                  {remarkError && <em className="kycv-field-error" role="alert">{remarkError}</em>}
                </label>

                {awaitsConfirmation(current) && (
                  <div className="kycv-confirm">
                    <span className="kycv-confirm-icon"><Icon name="hourglass" size={17} /></span>
                    <div>
                      <strong>Waiting for your review</strong>
                      <span>The system {current.status === 'approved' ? 'approved' : 'rejected'} this case. Confirm it if you agree, or choose a different decision below.</span>
                    </div>
                    <button type="button" className="admin-btn primary" onClick={confirmDecision} disabled={!!busy}>
                      <Icon name="check" size={14} stroke={2.6} />
                      {busy === 'confirm' ? 'Confirming…' : `Confirm ${statusLabel(current.status).toLowerCase()}`}
                    </button>
                  </div>
                )}

                <div className="kycv-actions">
                  {DECISIONS.map((d) => (
                    <button
                      key={d.status}
                      type="button"
                      className={`admin-btn ${d.cls}${current.status === d.status ? ' is-current' : ''}`}
                      onClick={() => decide(d.status)}
                      disabled={!!busy || current.locked || current.status === d.status}
                      title={current.status === d.status ? `Already ${statusLabel(d.status).toLowerCase()}` : undefined}
                    >
                      <Icon name={d.icon} size={15} stroke={2.5} />
                      {busy === d.status ? 'Saving…' : d.label}
                    </button>
                  ))}
                </div>
              </section>
            </div>
          </div>

          <section className="kycv-card">
            <div className="kycv-card-head">
              <span className="kycv-card-icon navy"><Icon name="history" size={17} /></span>
              <div><h3>Decision history</h3><p>Every change to this case, newest first.</p></div>
            </div>
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

      {zoom && (zoom.compare ? nicFrontDoc && faceDoc : zoomItem) && (
        <div
          className="kycv-lightbox"
          ref={lightboxRef}
          tabIndex={-1}
          role="dialog"
          aria-modal="true"
          aria-label={zoom.compare ? 'Compare NIC photo and live picture' : zoomItem.label}
          onMouseDown={(e) => { if (e.target === e.currentTarget) setZoom(null); }}
        >
          <div className="kycv-lightbox-bar">
            <div className="kycv-lightbox-title">
              <strong>{zoom.compare ? 'Compare faces' : zoomItem.label}</strong>
              <span>
                {current.name}
                {!zoom.compare && gallery.length > 1 ? ` · ${zoom.index + 1} of ${gallery.length}` : ''}
              </span>
            </div>
            <div className="kycv-lightbox-tools">
              {!zoom.compare && (
                <div className="kycv-lb-group">
                  <button type="button" className="kycv-lb-btn" onClick={() => setZoomScale((s) => Math.max(1, s - 0.5))} disabled={zoomScale <= 1} aria-label="Zoom out" title="Zoom out">
                    <Icon name="zoomOut" size={16} />
                  </button>
                  <span className="kycv-lb-scale">{Math.round(zoomScale * 100)}%</span>
                  <button type="button" className="kycv-lb-btn" onClick={() => setZoomScale((s) => Math.min(3, s + 0.5))} disabled={zoomScale >= 3} aria-label="Zoom in" title="Zoom in">
                    <Icon name="zoomIn" size={16} />
                  </button>
                </div>
              )}
              <button
                type="button"
                className="kycv-lb-btn"
                onClick={() => setZoomTurn((t) => (t + 1) % 4)}
                aria-label={zoom.compare ? 'Rotate NIC photo' : 'Rotate'}
                title={zoom.compare ? 'Rotate NIC photo (R)' : 'Rotate (R)'}
              >
                <Icon name="rotate" size={16} />
              </button>
              {!zoom.compare && nicFrontDoc && faceDoc && (
                <button type="button" className="kycv-lb-btn wide" onClick={openCompare} title="NIC front beside the live picture">
                  <Icon name="compare" size={15} />Compare
                </button>
              )}
              <button type="button" className="kycv-lb-btn close" onClick={() => setZoom(null)} aria-label="Close enlarged image" title="Close (Esc)">
                <Icon name="x" size={16} stroke={2.4} />
              </button>
            </div>
          </div>

          {zoom.compare ? (
            <div className="kycv-compare">
              {[nicFrontDoc, faceDoc].map((d) => (
                <figure key={d.key}>
                  <figcaption><Icon name={d.icon} size={14} />{d.label}</figcaption>
                  <div className="kycv-compare-img">
                    {/* Only the NIC photo turns — the live picture is always upright */}
                    <ZoomImage doc={d} turn={d.key === 'nicFront' ? zoomTurn : 0} scale={1} origin="50% 50%" />
                  </div>
                </figure>
              ))}
            </div>
          ) : (
            <div className="kycv-lightbox-main">
              {gallery.length > 1 && (
                <button type="button" className="kycv-lb-nav" onClick={() => stepZoom(-1)} aria-label="Previous document" title="Previous document (←)">
                  <Icon name="chevronLeft" size={22} stroke={2.4} />
                </button>
              )}
              <div className="kycv-lightbox-img">
                <ZoomImage doc={zoomItem} turn={zoomTurn} scale={zoomScale} origin={zoomOrigin} onToggle={toggleZoomScale} onPan={panZoom} />
              </div>
              {gallery.length > 1 && (
                <button type="button" className="kycv-lb-nav" onClick={() => stepZoom(1)} aria-label="Next document" title="Next document (→)">
                  <Icon name="chevronRight" size={22} stroke={2.4} />
                </button>
              )}
            </div>
          )}

          <div className="kycv-lightbox-foot">
            {!zoom.compare && gallery.length > 1 && (
              <div className="kycv-lb-thumbs">
                {gallery.map((d, i) => (
                  <button
                    key={d.key}
                    type="button"
                    className={`kycv-lb-thumb${i === zoom.index ? ' active' : ''}`}
                    onClick={() => { resetZoomView(); setZoom({ index: i }); }}
                  >
                    <Icon name={d.icon} size={13} />{d.label}
                  </button>
                ))}
              </div>
            )}
            <div className="kycv-lb-keys" aria-hidden="true">
              {!zoom.compare && <><kbd>←</kbd><kbd>→</kbd> switch · click to zoom · </>}
              <kbd>R</kbd> rotate · <kbd>Esc</kbd> close
            </div>
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

      {/* ── Hero ── */}
      <section className="kycv-hero">
        <div className="kycv-hero-deco" aria-hidden="true">
          <span className="kycv-hero-orb" />
          <span className="kycv-hero-slash" />
          <span className="kycv-hero-grid" />
          <span className="kycv-hero-scan" />
        </div>

        <div className="kycv-hero-main">
          <span className="kycv-hero-eyebrow">
            <span className="dash-live-dot" />
            Identity verification · live
          </span>
          <h1>KYC Review</h1>
          <p>New cases are checked automatically. Open any case to see what the system decided — and change it whenever you disagree.</p>

          <div className="kycv-pipeline">
            <div className="kycv-pipeline-head">
              <span>Case pipeline</span>
              <span>{loading ? 'Loading…' : `${total} ${total === 1 ? 'case' : 'cases'} loaded`}</span>
            </div>
            <div className="kycv-pipeline-bar">
              {!loading && total > 0
                ? STATUS_ORDER.filter((s) => hero.counts[s]).map((s) => (
                  <span key={s} className={statusBadgeClass(s)} style={{ flexGrow: hero.counts[s] }} title={`${statusLabel(s)}: ${hero.counts[s]}`} />
                ))
                : <span className="kycv-pipeline-empty" />}
            </div>
            <div className="kycv-pipeline-legend">
              {STATUS_ORDER.map((s) => (
                <span key={s} className={`${statusBadgeClass(s)}${hero.counts[s] ? '' : ' is-zero'}`}>
                  <i aria-hidden="true" />{statusLabel(s)} <b>{loading ? '–' : hero.counts[s]}</b>
                </span>
              ))}
            </div>
          </div>
        </div>

        <aside className="kycv-hero-side">
          <div className="kycv-hero-rate">
            <Ring value={loading ? 0 : hero.rate}>
              <strong>{loading ? '–' : <><AnimatedNumber value={hero.rate} />%</>}</strong>
            </Ring>
            <div className="kycv-hero-rate-text">
              <span>Automation rate</span>
              <strong>{loading ? '—' : `${hero.auto} of ${hero.decided} decisions`}</strong>
              <small>made by {SYSTEM_NAME}</small>
            </div>
          </div>

          <div className="kycv-hero-fact">
            <Icon name="hourglass" size={14} />
            <span>Oldest waiting</span>
            <b>{loading ? '—' : hero.oldest ? timeAgo(hero.oldest) : 'Nothing waiting'}</b>
          </div>

          <div className="kycv-hero-actions">
            <button type="button" className="kycv-run-btn" onClick={sweep} disabled={!!busy || loading}>
              <span className="kycv-run-icon"><Icon name="bolt" size={15} className={busy === 'sweep' ? 'dash-spin' : ''} /></span>
              {busy === 'sweep' ? 'Reviewing…' : 'Run automatic review'}
            </button>
            <button
              type="button"
              className="kycv-hero-icon-btn"
              onClick={refresh}
              disabled={loading || refreshing}
              aria-label="Refresh"
              title="Refresh (updates every 30 seconds by itself)"
            >
              <Icon name="refresh" size={16} className={refreshing ? 'dash-spin' : ''} />
            </button>
          </div>
        </aside>
      </section>

      {/* Read-only overview — not clickable */}
      <section className="kycv-summary" aria-label="KYC overview">
        {summaryCards.map((c, idx) => (
          <div className={`kycv-stat ${c.tone}`} key={c.key} style={{ '--i': idx }}>
            <div className="kycv-stat-top">
              <span className="kycv-stat-icon"><Icon name={c.icon} size={20} stroke={2.1} /></span>
              <span className="kycv-stat-share" title="Share of all loaded cases">
                {loading || !total ? '—' : `${Math.round(share(c.value))}%`}
              </span>
            </div>
            <span className="kycv-stat-label">{c.label}</span>
            <span className="kycv-stat-value">
              {loading ? <span className="dash-skeleton dash-skeleton-num" /> : <AnimatedNumber value={c.value} />}
            </span>
            <div className="kycv-stat-meter" aria-hidden="true">
              {c.segments.map((seg) => (
                <span key={seg.key} className={seg.key} style={{ width: `${loading ? 0 : share(seg.value)}%` }} />
              ))}
            </div>
            <span className="kycv-stat-hint">{loading ? ' ' : c.hint}</span>
          </div>
        ))}
      </section>

      {loading ? (
        <section className="kycv-panel kycv-skeleton" aria-busy="true" aria-label="Loading KYC cases">
          <div className="kycv-panel-head">
            <span className="dash-skeleton kycv-skel-title" />
            <span className="dash-skeleton kycv-skel-search" />
          </div>
          {Array.from({ length: 6 }).map((_, i) => (
            <div className="kycv-skel-row" key={i}>
              <span className="dash-skeleton kycv-skel-avatar" />
              <span className="dash-skeleton kycv-skel-line" />
              <span className="dash-skeleton kycv-skel-line short" />
              <span className="dash-skeleton kycv-skel-pill" />
            </div>
          ))}
        </section>
      ) : error ? (
        <div className="admin-empty">
          <p>{error}</p>
          <button type="button" className="admin-btn primary" style={{ marginTop: '0.75rem' }} onClick={() => load()}>Retry</button>
        </div>
      ) : (
        <section className="kycv-panel">
          <div className="kycv-panel-head">
            <div className="kycv-panel-title">
              <span className="kycv-panel-icon"><Icon name="list" size={18} /></span>
              <div>
                <h2>Customer summary</h2>
                <p>
                  Showing <strong>{shown.length}</strong> of <strong>{results.length}</strong>
                  {results.length !== items.length ? ` matching cases (${items.length} in total)` : ' cases'}
                </p>
              </div>
            </div>
            <div className="admin-search kycv-search">
              <svg className="admin-search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
              </svg>
              <input
                ref={searchRef}
                type="text"
                placeholder="Search name, NIC, phone, reference…"
                title="Several words narrow the search — every word must match"
                value={filters.search}
                onChange={(e) => setFilter({ search: e.target.value })}
                onKeyDown={(e) => { if (e.key === 'Escape' && filters.search) { e.stopPropagation(); setFilter({ search: '' }); } }}
                aria-label="Search KYC cases"
              />
              {filters.search
                ? <button type="button" className="kycv-clear" onClick={() => setFilter({ search: '' })} aria-label="Clear search">×</button>
                : <kbd className="kycv-kbd" aria-hidden="true" title="Press / to search">/</kbd>}
            </div>
          </div>

          {/* Filters */}
          <div className="kycv-filterbar">
            <div className="kycv-filter-top">
              <div className="kycv-views" role="tablist" aria-label="View" style={{ '--view-index': viewIndex, '--view-count': VIEWS.length }}>
                <span className="kycv-views-indicator" aria-hidden="true" />
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
              {dirty && (
                <button type="button" className="kycv-reset" onClick={() => { setFilters(DEFAULT_FILTERS); setLimit(PAGE_SIZE); }}>
                  <Icon name="refresh" size={13} />Reset filters
                </button>
              )}
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
              </div>
            </div>
          </div>

          {/* Results */}
          {results.length === 0 ? (
            <div className="kycv-empty">
              <span className={`kycv-empty-icon${refinedBeyondView || filters.view !== 'attention' ? ' search' : ''}`}>
                <Icon
                  name={refinedBeyondView || filters.view !== 'attention' ? 'search' : 'shieldCheck'}
                  size={30}
                  stroke={2}
                />
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
                  {filters.view !== 'all' && <button type="button" className="admin-btn primary" onClick={() => setFilter({ view: 'all', status: 'all', type: 'all', search: '' })}>Show all cases</button>}
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
                    {shown.map((item, idx) => (
                      <tr
                        key={item.id}
                        className={`${statusBadgeClass(item.status)}${openId === item.id ? ' selected' : ''}${needsReview(item) ? ' waiting' : ''}`}
                        style={{ '--r': Math.min(idx, 14) }}
                        onClick={(e) => openCase(item, e.currentTarget.querySelector('.kycv-open'))}
                      >
                        <td data-label="Customer">
                          <div className="kycv-person">
                            <span className={`kycv-item-avatar t${toneOf(item.name)}`}>{initials(item.name)}</span>
                            <div>
                              <strong><Highlight text={item.name} tokens={tokens} /></strong>
                              <small>
                                <code><Highlight text={item.nic} tokens={tokens} /></code>
                                <span className="kycv-sep" />
                                <Highlight text={item.phone || '—'} tokens={tokens} />
                              </small>
                            </div>
                          </div>
                        </td>
                        <td data-label="Request">
                          <span className="kycv-req">{typeLabelOf(typeKeyOf(item))}</span>
                          {item.kind !== 'account' && item.referenceNumber
                            ? <small className="kycv-ref"><Highlight text={item.referenceNumber} tokens={tokens} /></small>
                            : null}
                        </td>
                        <td data-label="Submitted">
                          <span className="kycv-when">{formatDate(item.submittedAt)}</span>
                          <small>{timeAgo(item.submittedAt)}</small>
                        </td>
                        <td data-label="Status"><StatusBadge status={item.status} /></td>
                        <td data-label="Decided by">
                          <Actor item={item} compact />
                          {awaitsConfirmation(item)
                            ? <small className="kycv-await"><i aria-hidden="true" />Awaiting review</small>
                            : item.decidedAt ? <small>{timeAgo(item.decidedAt)}</small> : null}
                        </td>
                        <td className="kycv-action-cell">
                          <button type="button" className="kycv-open" onClick={(e) => { e.stopPropagation(); openCase(item, e.currentTarget); }} aria-label={`Review ${item.name}`}>
                            Review
                            <Icon name="chevronRight" size={14} stroke={2.4} />
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
