import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { getBranches, createBranch, updateBranch, deleteBranch } from '../services/adminService';
import AdminNotice, { useAdminNotice } from '../components/AdminNotice';
import { AnimatedNumber, timeAgo } from '../components/AdminVisuals';

// The branch hierarchy, top to bottom: Region → Province → RTO → Teleshop.
// Every level below Region is created under one entry of the level above.
const LEVELS = [
  {
    key: 'regions',
    label: 'Region',
    plural: 'Regions',
    parent: null,
    parentField: null,
    child: 'provinces',
    tile: 'total',
    placeholder: 'e.g. Metro Region',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" /><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
      </svg>
    ),
  },
  {
    key: 'provinces',
    label: 'Province',
    plural: 'Provinces',
    parent: 'regions',
    parentField: 'regionId',
    child: 'rtos',
    tile: 'active',
    placeholder: 'e.g. Western Province',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M1 6v16l7-4 8 4 7-4V2l-7 4-8-4-7 4z" /><path d="M8 2v16M16 6v16" />
      </svg>
    ),
  },
  {
    key: 'rtos',
    label: 'RTO',
    plural: 'RTOs',
    fullName: 'Regional Telecommunication Officer',
    parent: 'provinces',
    parentField: 'provinceId',
    child: 'teleshops',
    tile: 'roles',
    placeholder: 'e.g. Colombo Central RTO',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 21h18M5 21V7l7-4 7 4v14" /><path d="M9 21v-6h6v6M9 10h.01M15 10h.01" />
      </svg>
    ),
  },
  {
    key: 'teleshops',
    label: 'Teleshop',
    plural: 'Teleshops',
    parent: 'rtos',
    parentField: 'rtoId',
    child: null,
    tile: 'collected',
    placeholder: 'e.g. Bambalapitiya Teleshop',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l1.5-5h15L21 9" /><path d="M4 9v11h16V9" /><path d="M3 9h18M9 20v-6h6v6" />
      </svg>
    ),
  },
];
const LEVEL = Object.fromEntries(LEVELS.map((l) => [l.key, l]));

// 'region', 'province', 'teleshop' in a sentence — 'RTO' stays in capitals.
const noun = (label) => (label === 'RTO' ? label : label.toLowerCase());
const nounPlural = (level) => (level.label === 'RTO' ? level.plural : level.plural.toLowerCase());
const article = (label) => (label === 'RTO' ? 'an' : 'a');

const NAME_MIN = 2;
const NAME_MAX = 100;
const EMPTY = { regions: [], provinces: [], rtos: [], teleshops: [] };
const cleanName = (value) => String(value || '').trim().replace(/\s+/g, ' ');

const ICON_EDIT = (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4Z" />
  </svg>
);
const ICON_DELETE = (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" /><path d="M10 11v6M14 11v6M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
  </svg>
);
const ICON_SEARCH = (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);
const ICON_PLUS = (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

function FieldError({ id, message }) {
  if (!message) return null;
  return <span id={id} className="um-field-error" role="alert">{message}</span>;
}

/** Admin module: the region → province → RTO → teleshop branch structure. */
export default function BranchesPage() {
  const notice = useAdminNotice();
  const [data, setData] = useState(EMPTY);
  const [loading, setLoading] = useState(true);
  const [loadFailed, setLoadFailed] = useState(false);
  const [activeTab, setActiveTab] = useState('regions');
  const [search, setSearch] = useState('');
  const [parentFilter, setParentFilter] = useState('all');

  // Add / edit form
  const [modal, setModal] = useState(null); // { level, item } — item is null when adding
  const [form, setForm] = useState({ name: '', parentId: '' });
  const [touched, setTouched] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);

  // Delete confirmation
  const [pendingDelete, setPendingDelete] = useState(null); // { level, item }
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getBranches();
      setData({ regions: res.regions || [], provinces: res.provinces || [], rtos: res.rtos || [], teleshops: res.teleshops || [] });
      setLoadFailed(false);
    } catch {
      setLoadFailed(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const byId = useMemo(() => Object.fromEntries(
    LEVELS.map((l) => [l.key, new Map(data[l.key].map((item) => [item.id, item]))])
  ), [data]);

  // The chain of parents above an entry, nearest first: e.g. [RTO, Province, Region].
  const ancestorsOf = useCallback((levelKey, item) => {
    const chain = [];
    let level = LEVEL[levelKey];
    let current = item;
    while (level.parent && current) {
      const parent = byId[level.parent].get(current[level.parentField]);
      if (!parent) break;
      chain.push(parent);
      current = parent;
      level = LEVEL[level.parent];
    }
    return chain;
  }, [byId]);

  const level = LEVEL[activeTab];
  const parentLevel = level.parent ? LEVEL[level.parent] : null;
  const parentOptions = parentLevel ? data[parentLevel.key] : [];
  const tabIndex = LEVELS.findIndex((l) => l.key === activeTab);

  const switchTab = (key) => {
    setActiveTab(key);
    setSearch('');
    setParentFilter('all');
  };

  const rows = useMemo(() => {
    const q = search.trim().toLowerCase();
    return data[activeTab].filter((item) => {
      if (parentFilter !== 'all' && item[level.parentField] !== parentFilter) return false;
      if (!q) return true;
      const names = [item.name, ...ancestorsOf(activeTab, item).map((a) => a.name)].join(' ').toLowerCase();
      return names.includes(q);
    });
  }, [data, activeTab, search, parentFilter, level.parentField, ancestorsOf]);

  // ── Add / edit ──

  const openAdd = () => {
    setModal({ level: activeTab, item: null });
    setForm({ name: '', parentId: parentFilter !== 'all' ? parentFilter : '' });
    setTouched({});
    setSubmitted(false);
    setFormError('');
  };

  const openEdit = (item) => {
    setModal({ level: activeTab, item });
    setForm({ name: item.name, parentId: level.parentField ? item[level.parentField] : '' });
    setTouched({});
    setSubmitted(false);
    setFormError('');
  };

  const closeModal = () => { if (!saving) setModal(null); };

  const modalLevel = modal ? LEVEL[modal.level] : null;
  const modalParentLevel = modalLevel?.parent ? LEVEL[modalLevel.parent] : null;

  const errors = useMemo(() => {
    if (!modalLevel) return {};
    const out = {};
    const name = cleanName(form.name);
    if (!name) out.name = `Enter the ${noun(modalLevel.label)} name.`;
    else if (name.length < NAME_MIN) out.name = `Use at least ${NAME_MIN} characters.`;
    else if (name.length > NAME_MAX) out.name = `Use at most ${NAME_MAX} characters.`;
    else if (data[modalLevel.key].some((item) => item.id !== modal.item?.id && item.name.toLowerCase() === name.toLowerCase())) {
      out.name = `${article(modalLevel.label) === 'an' ? 'An' : 'A'} ${noun(modalLevel.label)} with this name already exists.`;
    }
    if (modalParentLevel && !form.parentId) out.parentId = `Select the ${noun(modalParentLevel.label)} it belongs to.`;
    return out;
  }, [form, modalLevel, modalParentLevel, data, modal]);

  const field = (key) => {
    const error = touched[key] || submitted ? errors[key] : undefined;
    const valid = (touched[key] || submitted) && !errors[key] && String(form[key] || '').length > 0;
    const errorId = `br-${key}-error`;
    return {
      cls: error ? ' invalid' : valid ? ' valid' : '',
      error,
      errorId,
      props: {
        onBlur: () => setTouched((t) => (t[key] ? t : { ...t, [key]: true })),
        'aria-invalid': error ? true : undefined,
        'aria-describedby': error ? errorId : undefined,
        'aria-required': true,
      },
    };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitted(true);
    setFormError('');
    if (Object.keys(errors).length) return;
    setSaving(true);
    const payload = { name: cleanName(form.name), ...(modalParentLevel ? { parentId: form.parentId } : {}) };
    try {
      if (modal.item) await updateBranch(modal.level, modal.item.id, payload);
      else await createBranch(modal.level, payload);
      notice.success(modal.item
        ? `${modalLevel.label} ${payload.name} updated.`
        : `${modalLevel.label} ${payload.name} added.`);
      setModal(null);
      await load();
    } catch (err) {
      setFormError(err.response?.data?.message || `Could not save the ${noun(modalLevel.label)}.`);
    } finally {
      setSaving(false);
    }
  };

  // ── Delete ──

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    const { level: levelKey, item } = pendingDelete;
    setDeleting(true);
    try {
      await deleteBranch(levelKey, item.id);
      notice.success(`${LEVEL[levelKey].label} ${item.name} deleted.`);
      setPendingDelete(null);
      await load();
    } catch (err) {
      notice.error(err.response?.data?.message || `Could not delete the ${noun(LEVEL[levelKey].label)}.`);
      setPendingDelete(null);
    } finally {
      setDeleting(false);
    }
  };

  const canAdd = !loading && !loadFailed && (!parentLevel || parentOptions.length > 0);
  const childLevel = level.child ? LEVEL[level.child] : null;
  const pendingChild = pendingDelete && LEVEL[pendingDelete.level].child ? LEVEL[LEVEL[pendingDelete.level].child] : null;

  return (
    <div className="um-page br-page">
      {/* ── Hero ── */}
      <section className="um-hero">
        <div className="um-hero-deco" aria-hidden="true">
          <span className="um-hero-orb" />
          <span className="um-hero-slash" />
          <span className="um-hero-grid" />
        </div>

        <div className="um-hero-top">
          <div className="um-hero-text">
            <span className="um-hero-eyebrow">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 21h18M5 21V7l7-4 7 4v14" />
              </svg>
              Organisation
            </span>
            <h1>Branches</h1>
            <p>Set up regions, the provinces in each, their Regional Telecommunication Officers and the teleshops under them.</p>
          </div>
          <button type="button" className="um-hero-action" onClick={openAdd} disabled={!canAdd}>
            <span className="um-hero-action-icon">{ICON_PLUS}</span>
            Add {level.label}
          </button>
        </div>

        <div className="um-hero-tiles">
          {LEVELS.map((l, idx) => (
            <div className={`um-hero-tile ${l.tile}`} key={l.key} style={{ '--i': idx }}>
              <div className="um-hero-tile-head">
                <span className="um-hero-tile-icon">{l.icon}</span>
                {l.plural}
              </div>
              <div className="um-hero-tile-value">
                {loading ? <span className="dash-skeleton um-hero-skeleton" /> : <AnimatedNumber value={data[l.key].length} />}
              </div>
              <div className="um-hero-tile-foot">
                {loading ? ' ' : l.parent ? `Each under ${article(LEVEL[l.parent].label)} ${noun(LEVEL[l.parent].label)}` : 'Top level'}
              </div>
            </div>
          ))}
        </div>
      </section>

      <AdminNotice notice={notice.notice} onDismiss={notice.dismiss} />
      {loadFailed && (
        <div className="admin-error-banner br-banner" role="alert">
          <span>Could not load the branches. Check your connection, then try again.</span>
          <button type="button" className="admin-btn ghost" onClick={load}>Retry</button>
        </div>
      )}
      {!loading && !loadFailed && parentLevel && parentOptions.length === 0 && (
        <div className="admin-notice admin-notice-info" role="status">
          <span className="admin-notice-text">
            Add {article(parentLevel.label)} {noun(parentLevel.label)} first — every {noun(level.label)} belongs to one.
          </span>
        </div>
      )}

      {/* ── Tabs ── */}
      <div className="um-tabs" role="tablist" style={{ '--tab-index': tabIndex, '--tab-count': LEVELS.length }}>
        <span className="um-tabs-indicator" aria-hidden="true" />
        {LEVELS.map((l) => (
          <button
            key={l.key}
            type="button"
            role="tab"
            aria-selected={activeTab === l.key}
            className={`um-tab${activeTab === l.key ? ' active' : ''}`}
            onClick={() => switchTab(l.key)}
            title={l.fullName || l.plural}
          >
            <span className="um-tab-icon">{l.icon}</span>
            <span className="um-tab-label">{l.plural}</span>
            <span className="um-tab-count">{data[l.key].length}</span>
          </button>
        ))}
      </div>

      {/* ── List ── */}
      <section className="um-panel" key={activeTab}>
        <div className="um-panel-head">
          <div className="um-panel-title">
            <h2>{level.fullName ? `${level.plural} — ${level.fullName}s` : level.plural}</h2>
            <p>{loading ? 'Loading…' : `Showing ${rows.length} of ${data[activeTab].length}`}</p>
          </div>
          <div className="um-toolbar">
            <div className="admin-search um-search">
              <span className="admin-search-icon">{ICON_SEARCH}</span>
              <input
                type="text"
                placeholder={parentLevel ? `Search ${nounPlural(level)} or where they belong` : `Search ${nounPlural(level)}`}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            {parentLevel && (
              <select className="admin-select" value={parentFilter} onChange={(e) => setParentFilter(e.target.value)} aria-label={`Filter by ${noun(parentLevel.label)}`}>
                <option value="all">All {nounPlural(parentLevel)}</option>
                {parentOptions.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            )}
          </div>
        </div>

        {loading ? (
          <div className="dash-table-skeleton">
            {Array.from({ length: 4 }).map((_, i) => <div className="dash-skeleton dash-skeleton-row" key={i} />)}
          </div>
        ) : rows.length === 0 ? (
          <div className="um-empty-state">
            <span className="um-empty-icon">{level.icon}</span>
            <h3>{data[activeTab].length ? 'No matches' : `No ${nounPlural(level)} yet`}</h3>
            <p>
              {data[activeTab].length
                ? 'Try a different search or clear the filter.'
                : canAdd
                  ? `Use “Add ${level.label}” to create the first one.`
                  : `Add ${article(parentLevel.label)} ${noun(parentLevel.label)} first.`}
            </p>
          </div>
        ) : (
          <div className="admin-table-wrap um-table-wrap">
            <table className="admin-table um-table br-table">
              <thead>
                <tr>
                  <th>{level.label} name</th>
                  {parentLevel && <th>Belongs to</th>}
                  {childLevel && <th>{childLevel.plural}</th>}
                  <th>Added</th>
                  <th style={{ textAlign: 'center' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((item) => {
                  const [parent, ...higher] = ancestorsOf(activeTab, item);
                  return (
                    <tr key={item.id}>
                      <td>
                        <div className="br-name-cell">
                          <span className="br-name-icon" aria-hidden="true">{level.icon}</span>
                          <span className="um-user-name">{item.name}</span>
                        </div>
                      </td>
                      {parentLevel && (
                        <td>
                          <div className="br-path">
                            <span>{parent?.name || '—'}</span>
                            {higher.length > 0 && <small>{higher.map((a) => a.name).join(' · ')}</small>}
                          </div>
                        </td>
                      )}
                      {childLevel && (
                        <td>
                          <span className={`br-count${item.childCount ? '' : ' is-zero'}`}>{item.childCount}</span>
                        </td>
                      )}
                      <td>
                        <div className="um-date">
                          <span>{new Date(item.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                          <small>{timeAgo(item.createdAt)}</small>
                        </div>
                      </td>
                      <td>
                        <div className="um-row-actions">
                          <button type="button" className="um-action-btn edit" onClick={() => openEdit(item)} aria-label={`Edit ${item.name}`}>
                            {ICON_EDIT}<span className="um-action-label">Edit</span>
                          </button>
                          <button type="button" className="um-action-btn delete" onClick={() => setPendingDelete({ level: activeTab, item })} aria-label={`Delete ${item.name}`}>
                            {ICON_DELETE}<span className="um-action-label">Delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* ── Add / Edit modal ── */}
      {modal && modalLevel && (
        <div className="admin-modal-overlay" onClick={closeModal}>
          <div className="admin-modal um-modal" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-labelledby="br-modal-title">
            <div className="admin-modal-header um-modal-header">
              <div className="um-modal-header-identity">
                <div className="um-modal-avatar br-modal-icon">{modalLevel.icon}</div>
                <div>
                  <h3 id="br-modal-title">{modal.item ? `Edit ${modalLevel.label}` : `Add ${modalLevel.label}`}</h3>
                  <div className="admin-modal-subtitle">
                    {modalParentLevel
                      ? `Name the ${noun(modalLevel.label)} and choose the ${noun(modalParentLevel.label)} it belongs to.`
                      : 'Type the region name.'}
                  </div>
                </div>
              </div>
              <button type="button" className="admin-modal-close" onClick={closeModal} aria-label="Close">×</button>
            </div>

            <form onSubmit={handleSubmit} noValidate>
              <div className="admin-modal-body">
                {submitted && Object.keys(errors).length > 0 && (
                  <div className="admin-error-banner" role="alert" style={{ marginBottom: '1rem' }}>Please fix the highlighted fields before continuing.</div>
                )}
                {formError && <div className="admin-error-banner" role="alert" style={{ marginBottom: '1rem' }}>{formError}</div>}

                <div className="um-form-grid um-form-vertical">
                  {modalParentLevel && (
                    <label className="um-field">
                      <span>{modalParentLevel.label} *</span>
                      <select
                        className={`um-input${field('parentId').cls}`}
                        {...field('parentId').props}
                        value={form.parentId}
                        onChange={(e) => setForm((f) => ({ ...f, parentId: e.target.value }))}
                        autoFocus={!modal.item}
                      >
                        <option value="">Select {article(modalParentLevel.label)} {noun(modalParentLevel.label)}</option>
                        {data[modalParentLevel.key].map((p) => {
                          const path = ancestorsOf(modalParentLevel.key, p).map((a) => a.name).join(' · ');
                          return <option key={p.id} value={p.id}>{path ? `${p.name} (${path})` : p.name}</option>;
                        })}
                      </select>
                      <FieldError id={field('parentId').errorId} message={field('parentId').error} />
                    </label>
                  )}

                  <label className="um-field">
                    <span>{modalLevel.label} name *</span>
                    <input
                      type="text"
                      className={`um-input${field('name').cls}`}
                      {...field('name').props}
                      value={form.name}
                      maxLength={NAME_MAX}
                      autoComplete="off"
                      autoFocus={!!modal.item || !modalParentLevel}
                      onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                      placeholder={modalLevel.placeholder}
                    />
                    <FieldError id={field('name').errorId} message={field('name').error} />
                  </label>
                </div>
              </div>

              <div className="um-modal-footer">
                <button type="button" className="admin-btn ghost" onClick={closeModal} disabled={saving}>Cancel</button>
                <button type="submit" className="admin-btn primary" disabled={saving}>
                  {saving ? 'Saving…' : modal.item ? 'Save Changes' : `Add ${modalLevel.label}`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Delete confirmation ── */}
      {pendingDelete && (
        <div className="admin-modal-overlay" onClick={() => !deleting && setPendingDelete(null)}>
          <div className="admin-modal um-confirm-modal" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-labelledby="br-delete-title">
            <div className="admin-modal-header">
              <h3 id="br-delete-title">Delete {LEVEL[pendingDelete.level].label}</h3>
              <button type="button" className="admin-modal-close" onClick={() => setPendingDelete(null)} aria-label="Close" disabled={deleting}>×</button>
            </div>
            <div className="admin-modal-body">
              <p>
                {pendingChild && pendingDelete.item.childCount > 0
                  ? <><strong>{pendingDelete.item.name}</strong> still has {pendingDelete.item.childCount} {pendingDelete.item.childCount === 1 ? noun(pendingChild.label) : nounPlural(pendingChild)} under it. Move {pendingDelete.item.childCount === 1 ? 'it' : 'them'} to another {noun(LEVEL[pendingDelete.level].label)} or delete {pendingDelete.item.childCount === 1 ? 'it' : 'them'} first.</>
                  : <>Are you sure you want to permanently delete <strong>{pendingDelete.item.name}</strong>? This cannot be undone.</>}
              </p>
            </div>
            <div className="um-modal-footer">
              <button type="button" className="admin-btn ghost" onClick={() => setPendingDelete(null)} disabled={deleting}>Cancel</button>
              <button
                type="button"
                className="admin-btn danger"
                onClick={confirmDelete}
                disabled={deleting || (pendingChild && pendingDelete.item.childCount > 0)}
              >
                {deleting ? 'Deleting…' : `Delete ${LEVEL[pendingDelete.level].label}`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
