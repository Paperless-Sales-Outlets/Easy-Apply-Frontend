import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { FiClock, FiArrowRight } from 'react-icons/fi';
import {
  getDraftSummary,
  deleteDraft,
  hasDraftAccess,
  DRAFT_ACCESS_EVENT,
} from '../services/draftService';
import DraftSignInNotice from './DraftSignInNotice';

// Matches the stepper shown inside the New Connection wizard. The wizard's
// first two internal steps (location + coverage check) share step 1.
const STEP_LABELS = ['Service Location', 'Identity & KYC', 'Digital Signature', 'Payment', 'Review & Submit'];

const stepNumber = (stepIndex) => Math.min(Math.max(Number(stepIndex) || 0, 1), STEP_LABELS.length);

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

/**
 * Tells a signed-in customer they have an unfinished New Connection
 * application and lets them carry on where they stopped. Renders nothing when
 * there is no saved progress or it can't be checked. If this browser can't
 * reach saved applications at all, asks the customer to sign in again rather
 * than silently showing nothing.
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

  useEffect(() => {
    let cancelled = false;
    getDraftSummary()
      .then((summary) => { if (!cancelled) setDraft(summary); })
      .catch(() => { /* no banner if progress can't be checked */ });
    return () => { cancelled = true; };
  }, []);

  if (!access) {
    return (
      <div style={{ backgroundColor: 'var(--page-bg)' }}>
        <div style={{ maxWidth: '1440px', margin: '0 auto', padding: '1.5rem 1.5rem 0 1.5rem' }}>
          <DraftSignInNotice message="Please sign in again to see any unfinished New Connection application and keep your progress saved." />
        </div>
      </div>
    );
  }

  if (!draft) return null;

  const current = stepNumber(draft.stepIndex);
  const productName = draft.selectedProduct?.productName;

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

  return (
    <div style={{ backgroundColor: 'var(--page-bg)' }}>
      <div style={{ maxWidth: '1440px', margin: '0 auto', padding: '1.5rem 1.5rem 0 1.5rem' }}>
        <div
          role="region"
          aria-label="Unfinished application"
          style={{
            backgroundColor: '#f0f7ff',
            border: '1.5px solid #bfdbfe',
            borderRadius: '16px',
            padding: '1rem 1.35rem',
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
                borderRadius: '12px',
                backgroundColor: '#ffffff',
                color: '#0f57a8',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <FiClock size={20} />
            </div>
            <div style={{ minWidth: 0 }}>
              <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: '#0f172a' }}>
                You have an unfinished New Connection application
              </h3>
              <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.86rem', color: '#475569' }}>
                {productName && <><strong style={{ color: '#0f57a8' }}>{productName}</strong> · </>}
                Step {current} of {STEP_LABELS.length}: {STEP_LABELS[current - 1]}
                {draft.updatedAt && <> · Last saved {lastSavedText(draft.updatedAt)}</>}
              </p>
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
                color: '#64748b',
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
                fontWeight: 800,
                fontSize: '0.92rem',
                padding: '0.65rem 1.25rem',
                borderRadius: '10px',
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
