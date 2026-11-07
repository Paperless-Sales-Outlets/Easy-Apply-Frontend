import api from '../utils/api';

// Saved progress on the New Connection application. Drafts live on the server
// against the customer's verified mobile number, so they follow the customer
// to any device once they sign in again.
const DRAFT_URL = '/drafts/new-connection';

// Issued by POST /api/otp/verify when the customer signs in; proves which
// mobile number the drafts belong to. Cleared on logout (see authSession).
export const DRAFT_TOKEN_KEY = 'draftToken';

// Fired when the token is stored or dropped, so the banner and wizard can
// show or hide the "sign in again" prompt.
export const DRAFT_ACCESS_EVENT = 'easyapply:draft-access-changed';

// Thrown by saves when there is no token, so nothing is reported as saved.
export const NO_DRAFT_ACCESS = 'NO_DRAFT_ACCESS';

export const storeDraftToken = (token) => {
  try {
    if (token) localStorage.setItem(DRAFT_TOKEN_KEY, token);
    else localStorage.removeItem(DRAFT_TOKEN_KEY);
  } catch {
    /* storage unavailable — progress just won't be saved */
  }
  try { window.dispatchEvent(new Event(DRAFT_ACCESS_EVENT)); } catch { /* ignore */ }
};

const draftToken = () => {
  try {
    return localStorage.getItem(DRAFT_TOKEN_KEY);
  } catch {
    return null;
  }
};

/**
 * Whether this browser can save and load the customer's application. False
 * for a session that started before drafts existed, a sign-in completed while
 * the server couldn't be reached, or a token the server has since rejected —
 * in each case the customer needs to sign in again.
 */
export const hasDraftAccess = () => Boolean(draftToken());

const withDraftToken = (config = {}) => ({
  ...config,
  headers: { ...(config.headers || {}), 'x-draft-token': draftToken() },
});

const noDraftAccess = () =>
  Object.assign(new Error('Sign in again to save your application'), { code: NO_DRAFT_ACCESS });

// The server no longer accepts the token (expired or invalid): forget it so
// the customer is asked to sign in again instead of failing silently.
const forgetRejectedToken = (err) => {
  if (err?.response?.status === 401) storeDraftToken(null);
  throw err;
};

// ── 30-day limit ────────────────────────────────────────────────────────────
// A saved application can be continued for 30 days from when it was started
// (`resumeUntil`, set by the server and never extended). After that it is
// hidden from the customer; the server keeps it on record, marked expired.

const DAY_MS = 24 * 60 * 60 * 1000;

// Within this many days of the limit, the reminder becomes more prominent.
export const DRAFT_EXPIRY_WARNING_DAYS = 5;

/** True when a save was refused because the application passed its 30 days. */
export const isDraftExpiredError = (err) => err?.response?.status === 410;

/**
 * Days left before `resumeUntil`, rounded up (1 = less than 24 hours left,
 * 0 = passed). Measured with the server's clock so a wrong clock on the
 * customer's device doesn't change the answer.
 */
export const draftDaysLeft = (resumeUntil, serverTime) => {
  if (!resumeUntil) return null;
  const now = serverTime ? new Date(serverTime).getTime() : Date.now();
  return Math.max(0, Math.ceil((new Date(resumeUntil).getTime() - now) / DAY_MS));
};

/** e.g. "16 Nov 2026" */
export const formatDraftDate = (date) =>
  date ? new Date(date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '';

/**
 * Full active draft, including photos.
 * Returns { draft, expired, serverTime }: `draft` is null when there is none;
 * `expired` ({ id, expiredOn }) describes the most recent application that
 * passed its 30 days, if any.
 */
export const getDraft = async () => {
  if (!draftToken()) return { draft: null, expired: null, serverTime: null };
  const res = await api.get(DRAFT_URL, withDraftToken()).catch(forgetRejectedToken);
  return {
    draft: res.data?.draft || null,
    expired: res.data?.expired || null,
    serverTime: res.data?.serverTime || null,
  };
};

/** Step, package, last-saved time and 30-day limit only (no photos), or null. */
export const getDraftSummary = async () => {
  if (!draftToken()) return null;
  const res = await api.get(DRAFT_URL, withDraftToken({ params: { summary: true } })).catch(forgetRejectedToken);
  return res.data?.draft ? { ...res.data.draft, serverTime: res.data.serverTime } : null;
};

/**
 * Save the form fields, package and step. Kept small so it is quick; photos
 * go through saveDraftPhoto instead. `draftId` is the draft being edited (none
 * for a new one); a draft past its 30 days is refused (isDraftExpiredError).
 */
export const saveDraft = async ({ formData, selectedProduct, stepIndex, draftId }) => {
  if (!draftToken()) throw noDraftAccess();
  return api
    .put(DRAFT_URL, { formData, selectedProduct, stepIndex, draftId: draftId || undefined }, withDraftToken())
    .catch(forgetRejectedToken);
};

/**
 * Save one photo (nicFront, nicBack or facePhoto). `image` is the photo as the
 * form holds it; an empty string removes it.
 */
export const saveDraftPhoto = async (field, image, draftId) => {
  if (!draftToken()) throw noDraftAccess();
  const request = image
    ? api.put(`${DRAFT_URL}/photos/${field}`, { image, draftId: draftId || undefined }, withDraftToken())
    : api.delete(`${DRAFT_URL}/photos/${field}`, withDraftToken({ params: draftId ? { draftId } : undefined }));
  return request.catch(forgetRejectedToken);
};

export const deleteDraft = async () => {
  if (!draftToken()) return null;
  return api.delete(DRAFT_URL, withDraftToken()).catch(forgetRejectedToken);
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
