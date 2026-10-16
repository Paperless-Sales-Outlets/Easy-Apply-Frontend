import api from '../utils/api';

// Saved progress on the New Connection application. Drafts live on the server
// against the customer's verified mobile number, so they follow the customer
// to any device once they sign in again.
const DRAFT_URL = '/drafts/new-connection';

// Issued by POST /api/otp/verify when the customer signs in; proves which
// mobile number the drafts belong to. Cleared on logout (see authSession).
export const DRAFT_TOKEN_KEY = 'draftToken';

export const storeDraftToken = (token) => {
  try {
    if (token) localStorage.setItem(DRAFT_TOKEN_KEY, token);
    else localStorage.removeItem(DRAFT_TOKEN_KEY);
  } catch {
    /* storage unavailable — progress just won't be saved */
  }
};

const draftToken = () => {
  try {
    return localStorage.getItem(DRAFT_TOKEN_KEY);
  } catch {
    return null;
  }
};

const withDraftToken = (config = {}) => ({
  ...config,
  headers: { ...(config.headers || {}), 'x-draft-token': draftToken() },
});

/** Full draft, including photos, or null when there is none. */
export const getDraft = async () => {
  if (!draftToken()) return null;
  const res = await api.get(DRAFT_URL, withDraftToken());
  return res.data?.draft || null;
};

/** Step, package and last-saved time only (no photos), or null. */
export const getDraftSummary = async () => {
  if (!draftToken()) return null;
  const res = await api.get(DRAFT_URL, withDraftToken({ params: { summary: true } }));
  return res.data?.draft || null;
};

/**
 * Save the form fields, package and step. Kept small so it is quick; photos
 * go through saveDraftPhoto instead.
 */
export const saveDraft = async ({ formData, selectedProduct, stepIndex }) => {
  if (!draftToken()) return null;
  return api.put(DRAFT_URL, { formData, selectedProduct, stepIndex }, withDraftToken());
};

/**
 * Save one photo (nicFront, nicBack or facePhoto). `image` is the photo as the
 * form holds it; an empty string removes it.
 */
export const saveDraftPhoto = async (field, image) => {
  if (!draftToken()) return null;
  if (!image) return api.delete(`${DRAFT_URL}/photos/${field}`, withDraftToken());
  return api.put(`${DRAFT_URL}/photos/${field}`, { image }, withDraftToken());
};

export const deleteDraft = async () => {
  if (!draftToken()) return null;
  return api.delete(DRAFT_URL, withDraftToken());
};

// ── Browser-saved drafts from the previous version ──────────────────────────
// Progress used to be kept in localStorage. It is read once so customers who
// were midway through don't lose it, then moved to the server and removed.
const LEGACY_PREFIX = 'slt_new_conn_draft_';

export const legacyDraftKey = (phone) => `${LEGACY_PREFIX}${phone || 'active_user'}`;

export const readLegacyDraft = (phone) => {
  try {
    const raw = localStorage.getItem(legacyDraftKey(phone));
    const saved = raw ? JSON.parse(raw) : null;
    if (!saved?.formData) return null;
    return { formData: saved.formData, stepIndex: saved.stepIndex, selectedProduct: null };
  } catch {
    return null;
  }
};

export const clearLegacyDrafts = () => {
  try {
    Object.keys(localStorage)
      .filter((key) => key.startsWith(LEGACY_PREFIX))
      .forEach((key) => localStorage.removeItem(key));
  } catch {
    /* storage unavailable — nothing to clear */
  }
};
