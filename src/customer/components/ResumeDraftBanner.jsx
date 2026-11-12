import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPortal } from 'react-dom';
import toast from 'react-hot-toast';
import { FiClock, FiArrowRight, FiAlertCircle } from 'react-icons/fi';
import {
  getDraftSummary,
  deleteDraft,
  hasDraftAccess,
  draftDaysLeft,
  formatDraftDate,
  DRAFT_ACCESS_EVENT,
  DRAFT_EXPIRY_WARNING_DAYS,
} from '../services/draftService';
import DraftSignInNotice from './DraftSignInNotice';

const lastSavedText = (updatedAt) => {
  if (!updatedAt) return '';
  const minutes = Math.round((Date.now() - new Date(updatedAt).getTime()) / 60000);
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'} ago`;
  const days = Math.round(hours / 24);
  return `${days} day${days === 1 ? '' : 's'} ago`;
};

// Render into the slot above the nav bar so the banner spans the full width of the page.
const aboveNav = (node) => {
  const slot = typeof document !== 'undefined' ? document.getElementById('top-notice-root') : null;
  return slot ? createPortal(node, slot) : node;
};

// Calm blue normally; amber in the last few days before the 30-day limit.
const THEMES = {
  normal: { background: '#f0f7ff', border: '#c3dcf5', icon: '#0056a2', accent: '#0056a2' },
  warning: { background: '#fff8e8', border: '#f4d58f', icon: '#93560a', accent: '#93560a' },
};

/**
 * Tells a signed-in customer they have an unfinished New Connection
 * application, how long they have to finish it (30 days from when they started
 * it), and lets them carry on where they stopped. Renders nothing when there is
 * no saved progress, it has passed its 30 days, or it can't be checked. If this
 * browser can't reach saved applications at all, asks the customer to sign in
 * again rather than silently showing nothing.
 */
export default function ResumeDraftBanner() {
  const navigate = useNavigate();
  const [draft, setDraft] = useState(null);
  const [discarding, setDiscarding] = useState(false);
  const [access, setAccess] = useState(hasDraftAccess);

  useEffect(() => {
    const sync = () => setAccess(hasDraftAccess());
    window.addEventListener(DRAFT_ACCESS_EVENT, sync);
    return () => window.removeEventListener(DRAFT_ACCESS_EVENT, sync);
  }, []);

  // Re-checked whenever draft access changes, so a token stored just after
  // this banner mounted (e.g. right after sign-in) still finds the draft.
  useEffect(() => {
    if (!access) {
      setDraft(null);
      return undefined;
    }
    let cancelled = false;
    getDraftSummary()
      .then((summary) => { if (!cancelled) setDraft(summary); })
      .catch((err) => {
        // No banner if progress can't be checked.
        console.warn('Could not check for an unfinished application:', err?.message);
      });
    return () => { cancelled = true; };
  }, [access]);

  if (!access) {
    return aboveNav(
      <div style={{ backgroundColor: 'var(--page-bg)' }}>
        <div style={{ maxWidth: '1440px', margin: '0 auto', padding: '1.5rem 1.5rem 0 1.5rem' }}>
          <DraftSignInNotice message="Please sign in again to see any unfinished New Connection application and keep your progress saved." />
        </div>
      </div>
    );
  }

  if (!draft) return null;

  // Past the 30-day limit it can no longer be continued, so it isn't offered.
  const daysLeft = draftDaysLeft(draft.resumeUntil, draft.serverTime);
  if (daysLeft === 0) return null;

  const savedUntil = formatDraftDate(draft.resumeUntil);
  const closeToLimit = daysLeft !== null && daysLeft <= DRAFT_EXPIRY_WARNING_DAYS;
  const theme = closeToLimit ? THEMES.warning : THEMES.normal;

  let deadline = null;
  if (daysLeft === 1) {
    deadline = <>Expires within 24 hours ({savedUntil}). Complete it today to keep your details.</>;
  } else if (closeToLimit) {
    deadline = <>Expires in {daysLeft} days ({savedUntil}). Complete it before then to keep your details.</>;
  } else if (daysLeft !== null) {
    deadline = <>Saved until {savedUntil} · {daysLeft} days left to complete it.</>;
  }

  const handleStartOver = async () => {
    if (!window.confirm('Discard your unfinished application? Your saved details will be removed.')) return;
    setDiscarding(true);
    try {
      await deleteDraft();
      setDraft(null);
      toast.success('Unfinished application discarded.');
    } catch {
      toast.error('Could not discard the application. Please try again.');
      setDiscarding(false);
    }
  };

  return aboveNav(
    <div style={{ backgroundColor: 'var(--page-bg)' }}>
      {/* Full-width band right under the nav bar; the content inside lines up with the page */}
      <div
        role="region"
        aria-label="Unfinished application"
        style={{
          backgroundColor: theme.background,
          borderBottom: `1px solid ${theme.border}`,
        }}
      >
        <div
          style={{
            maxWidth: 'var(--page-max)',
            margin: '0 auto',
            padding: '1rem var(--page-gutter)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', minWidth: 0 }}>
            <div
              aria-hidden="true"
              style={{
                width: '42px',
                height: '42px',
                flexShrink: 0,
                borderRadius: 'var(--radius-lg)',
                backgroundColor: 'var(--paper)',
                color: theme.icon,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {closeToLimit ? <FiAlertCircle size={20} /> : <FiClock size={20} />}
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'baseline', gap: '0.15rem 0.75rem' }}>
                <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: 'var(--grey-900)' }}>
                  You have an unfinished New Connection application
                </h3>
                {draft.updatedAt && (
                  <span style={{ fontSize: '0.86rem', color: 'var(--grey-700)', whiteSpace: 'nowrap' }}>
                    Last saved {lastSavedText(draft.updatedAt)}
                  </span>
                )}
              </div>
              {deadline && (
                <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.84rem', fontWeight: 700, color: theme.accent }}>
                  {deadline}
                </p>
              )}
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <button
              type="button"
              onClick={handleStartOver}
              disabled={discarding}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--grey-600)',
                fontSize: '0.85rem',
                fontWeight: 600,
                cursor: 'pointer',
                textDecoration: 'underline',
                padding: '0.35rem',
              }}
            >
              Start over
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => navigate('/new-connection')}
              disabled={discarding}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.45rem',
                fontWeight: 700,
                fontSize: '0.92rem',
                padding: '0.65rem 1.25rem',
                borderRadius: 'var(--radius)',
              }}
            >
              Continue application <FiArrowRight size={16} aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
