import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { FiFileText, FiArrowRight } from 'react-icons/fi';
import {
  getDraftSummary,
  deleteDraft,
  hasDraftAccess,
  DRAFT_ACCESS_EVENT,
} from '../services/draftService';
import DraftSignInNotice from './DraftSignInNotice';
import { FULL_ONBOARDING_7_STEPS } from './WizardStepper';

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

// Saved stepIndex (location, loop, identity, signature, payment, review) ->
// its number on the wizard's progress bar, so the banner matches the wizard.
// The coverage check is part of Service Location there.
const DISPLAY_STEP_BY_INDEX = [2, 2, 3, 4, 5, 6];
const TOTAL_STEPS = FULL_ONBOARDING_7_STEPS.length;

const stepOf = (stepIndex) => {
  const index = Math.min(Math.max(Number.parseInt(stepIndex, 10) || 0, 0), DISPLAY_STEP_BY_INDEX.length - 1);
  const number = DISPLAY_STEP_BY_INDEX[index];
  return { number, label: FULL_ONBOARDING_7_STEPS[number - 1] };
};

const styles = `
.rdb-section { padding: 1.25rem 0 0; background: var(--page-bg); }
.rdb-card {
  position: relative;
  max-width: var(--page-max);
  margin: 0 auto;
  width: calc(100% - 2 * var(--page-gutter));
  box-sizing: border-box;
  background: var(--paper);
  border: 1px solid var(--grey-200);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
  overflow: hidden;
  display: flex;
  align-items: center;
  gap: 1.25rem;
  padding: 1.1rem 1.25rem 1.1rem 1.5rem;
}
.rdb-card::before {
  content: '';
  position: absolute;
  inset: 0 auto 0 0;
  width: 4px;
  background: var(--blue-600);
}
.rdb-icon {
  width: 48px; height: 48px; flex-shrink: 0;
  border-radius: var(--radius-lg);
  background: var(--blue-50);
  color: var(--blue-600);
  display: flex; align-items: center; justify-content: center;
}
.rdb-body { flex: 1; min-width: 0; }
.rdb-eyebrow {
  margin: 0 0 0.15rem;
  font-size: 0.72rem; font-weight: 700; letter-spacing: 0.06em;
  text-transform: uppercase; color: var(--blue-600);
}
.rdb-title { margin: 0; font-size: 1.02rem; font-weight: 700; color: var(--grey-900); line-height: 1.35; }
.rdb-meta {
  margin: 0.3rem 0 0;
  display: flex; flex-wrap: wrap; align-items: center; gap: 0.25rem 0.5rem;
  font-size: 0.84rem; color: var(--grey-600);
}
.rdb-meta strong { color: var(--grey-700); font-weight: 600; }
.rdb-dot { width: 3px; height: 3px; border-radius: 50%; background: var(--grey-500); }
.rdb-progress { width: 180px; flex-shrink: 0; }
.rdb-progress-label {
  display: flex; justify-content: space-between;
  font-size: 0.75rem; font-weight: 600; color: var(--grey-600); margin-bottom: 0.35rem;
}
.rdb-track { height: 6px; border-radius: 999px; background: var(--grey-100); overflow: hidden; }
.rdb-fill { height: 100%; border-radius: 999px; background: var(--blue-600); }
.rdb-actions { display: flex; align-items: center; gap: 0.5rem; flex-shrink: 0; }
.rdb-discard {
  background: none; border: 1px solid transparent; border-radius: var(--radius);
  color: var(--grey-600); font-size: 0.86rem; font-weight: 600;
  padding: 0.6rem 0.9rem; cursor: pointer;
}
.rdb-discard:hover:not(:disabled) { background: var(--grey-100); color: var(--grey-900); }
.rdb-continue {
  display: inline-flex; align-items: center; gap: 0.45rem;
  font-weight: 700; font-size: 0.9rem; padding: 0.65rem 1.2rem;
  border-radius: var(--radius); white-space: nowrap;
}
.rdb-discard:focus-visible, .rdb-continue:focus-visible { outline: 2px solid var(--blue-400); outline-offset: 2px; }

@media (max-width: 900px) {
  .rdb-progress { display: none; }
}
@media (max-width: 640px) {
  .rdb-card { flex-wrap: wrap; gap: 0.9rem; padding: 1rem 1rem 1rem 1.25rem; }
  .rdb-icon { width: 40px; height: 40px; }
  .rdb-body { flex-basis: calc(100% - 56px); }
  .rdb-actions { width: 100%; flex-direction: column-reverse; align-items: stretch; }
  .rdb-continue { justify-content: center; }
}
`;

/**
 * Shown under the header on the signed-in home page when the customer has an
 * unfinished New Connection application: what they picked, where they
 * stopped, and a way to carry on or discard it. Saved applications never
 * expire. Renders nothing when there is no saved progress or it can't be
 * checked. If this browser can't reach saved applications at all, asks the
 * customer to sign in again rather than silently showing nothing.
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
    return (
      <div className="rdb-section">
        <style>{styles}</style>
        <div style={{ maxWidth: 'var(--page-max)', margin: '0 auto', padding: '0 var(--page-gutter)' }}>
          <DraftSignInNotice message="Please sign in again to see any unfinished New Connection application and keep your progress saved." />
        </div>
      </div>
    );
  }

  if (!draft) return null;

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

  const step = stepOf(draft.stepIndex);
  const percent = Math.round(((step.number - 1) / TOTAL_STEPS) * 100);
  const packageName = draft.selectedProduct?.productName || draft.selectedProduct?.name || '';
  const lastSaved = lastSavedText(draft.updatedAt);

  return (
    <section className="rdb-section" aria-label="Unfinished application">
      <style>{styles}</style>
      <div className="rdb-card">
        <div className="rdb-icon" aria-hidden="true">
          <FiFileText size={22} />
        </div>

        <div className="rdb-body">
          <p className="rdb-eyebrow">Continue where you left off</p>
          <h2 className="rdb-title">Your New Connection application is saved</h2>
          <p className="rdb-meta">
            {packageName && (
              <>
                <strong>{packageName}</strong>
                <span className="rdb-dot" aria-hidden="true" />
              </>
            )}
            <span>Next: {step.label}</span>
            {lastSaved && (
              <>
                <span className="rdb-dot" aria-hidden="true" />
                <span>Last saved {lastSaved}</span>
              </>
            )}
          </p>
        </div>

        <div className="rdb-progress" aria-hidden="true">
          <div className="rdb-progress-label">
            <span>Step {step.number} of {TOTAL_STEPS}</span>
            <span>{percent}%</span>
          </div>
          <div className="rdb-track">
            <div className="rdb-fill" style={{ width: `${Math.max(percent, 4)}%` }} />
          </div>
        </div>

        <div className="rdb-actions">
          <button
            type="button"
            className="rdb-discard"
            onClick={handleStartOver}
            disabled={discarding}
          >
            {discarding ? 'Discarding…' : 'Discard'}
          </button>
          <button
            type="button"
            className="btn btn-primary rdb-continue"
            onClick={() => navigate('/new-connection')}
            disabled={discarding}
          >
            Continue application <FiArrowRight size={16} aria-hidden="true" />
          </button>
        </div>
      </div>
    </section>
  );
}
