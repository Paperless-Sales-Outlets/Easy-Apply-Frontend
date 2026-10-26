import React, { useState, useReducer, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import CustomerInfoStep from './CustomerInfoStep';
import LoopCheckStep from './LoopCheckStep';
import DeclarationStep from './DeclarationStep';
import IdentityStep from './IdentityStep';
import ReviewStep from './ReviewStep';
import PaymentStep from '../PaymentStep';
import { useTranslation } from 'react-i18next';
import api, { clearSessionCart } from '../../utils/api';
import { useVerifiedMobile, useVerifiedContext } from '../../components/verification';
import { getAuthUser } from '../../utils/authSession';
import {
  getDraft,
  saveDraft,
  saveDraftPhoto,
  deleteDraft,
  hasDraftAccess,
  isDraftExpiredError,
  draftDaysLeft,
  formatDraftDate,
  DRAFT_ACCESS_EVENT,
  DRAFT_EXPIRY_WARNING_DAYS,
  NO_DRAFT_ACCESS,
  readLegacyDraft,
  clearLegacyDrafts,
} from '../../services/draftService';
import WizardStepper, { SIX_WIZARD_STEPS, FULL_ONBOARDING_7_STEPS } from '../../components/WizardStepper';
import DraftSignInNotice from '../../components/DraftSignInNotice';
import ExistingCustomerSummaryBox from '../../components/ExistingCustomerSummaryBox';

const formReducer = (state, action) => {
  switch (action.type) {
    case 'UPDATE_FIELD':
      return {
        ...state,
        [action.payload.name]: action.payload.value,
      };
    case 'SET_FIELDS':
      return {
        ...state,
        ...action.payload,
      };
    default:
      return state;
  }
};

const initialState = {
  customerType: 'home',
  title: '',
  nameFull: '',
  dob: '',
  nic: '',
  taxExemption: '',
  address: '',
  contactName: '',
  fixedNumber: '',
  mobileNumber: '',
  faxNumber: '',
  email: '',
  installAddress: '',
  billingAddress: '',
  isExistingCustomer: 'no',
  existingNumber: '',
  separateBill: 'no',
  billingMode: 'email',
  deactIDD: 'no',
  broadbandPackage: '',
  otherBroadbandPackage: '',
  staticIP: 'no',
  declarationAccepted: false,
  signature: '',
  gender: '',
  nicAddress: '',
  nicFront: '',
  nicBack: '',
  facePhoto: '',
  locationType: 'current',
  city: '',
  district: '',
  latitude: null,
  longitude: null,
  gpsCoordinates: null,
};

// Image fields. They are large, so each is saved on its own, only when it
// changes, separately from the rest of the form.
const PHOTO_FIELDS = ['nicFront', 'nicBack', 'facePhoto'];

// Wait this long after the last change before saving progress. Moving to
// another step saves immediately.
const DRAFT_SAVE_DELAY_MS = 1500;

// After a failed save, try again after these pauses, then wait for the next
// change before trying again.
const SAVE_RETRY_DELAYS_MS = [2000, 5000, 10000];

// The browser has no valid draft token (see draftService): retrying won't
// help; the customer is asked to sign in again instead.
const isAccessError = (err) => err?.code === NO_DRAFT_ACCESS || err?.response?.status === 401;

// What the identity and signature steps require before Continue — used when
// resuming, so a customer is never taken past a step that wasn't fully saved.
const identityComplete = (data) => {
  const nicOnFile = data.isExistingCustomer === true; // NIC copies already held for this customer
  return Boolean(
    data.facePhoto
    && data.nic
    && String(data.nameFull || '').trim()
    && (nicOnFile || (data.nicFront && data.nicBack))
  );
};

const signatureComplete = (data) =>
  Boolean(data.declarationAccepted && String(data.signature || '').trim());

// Fields filled in automatically rather than by the customer, ignored when
// deciding whether an old browser-saved draft holds any real progress.
const AUTO_FILLED_FIELDS = ['mobileNumber', 'otherBroadbandPackage'];

// Remembers which expired application the customer has already been told
// about, so the "your previous application expired" notice shows only once.
const EXPIRY_NOTICE_KEY = 'draftExpiryNoticeSeen';

const expiredMessage = (expiredOn) =>
  `Your saved application ${expiredOn ? `expired on ${formatDraftDate(expiredOn)}` : 'passed its 30-day limit'} and can no longer be continued. Please start a new application.`;

const hasCustomerInput = (data) =>
  Object.keys(data || {}).some(
    (key) => !AUTO_FILLED_FIELDS.includes(key) && data[key] && data[key] !== initialState[key]
  );

const NEXT_LABEL = {
  location: 'Verify Loop Coverage →',
  identity: 'Continue to Signature →',
  signature: 'Continue to Payment →',
  review: 'Submit Application →',
};

// stepperMode='six' is optional compatibility with the legacy 6-node wizard.
export default function NewConnectionWizard({ stepperMode = 'seven' }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const verifiedMobile = useVerifiedMobile();
  const { customerExists, selectedAccount } = useVerifiedContext();
  const declarationRef = useRef(null);
  const identityRef = useRef(null);

  const [selectedProduct, setSelectedProduct] = useState(null);

  useEffect(() => {
    const fromState = location.state?.selectedProduct;
    if (fromState) {
      setSelectedProduct(fromState);
    } else {
      const stored = localStorage.getItem('selectedProduct');
      if (stored) {
        try {
          setSelectedProduct(JSON.parse(stored));
        } catch {
          // Ignore an invalid stored package; the customer must select one.
        }
      }
    }
  }, [location.state]);

  const [stepIndex, setStepIndex] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [formData, dispatch] = useReducer(formReducer, initialState);
  const [draftRestored, setDraftRestored] = useState(false);

  // Flow: Package Selection (Step 1) -> Service Location (Step 2) -> Identity & KYC (Step 3) -> Digital Signature (Step 4) -> Payment (Step 5) -> Review & Submit (Step 6) -> Tracking (Step 7)
  const STEPS = ['location', 'loop', 'identity', 'signature', 'payment', 'review'];
  const step = STEPS[stepIndex];

  // ── Saved progress (draft) ────────────────────────────────────────────────
  // Progress is kept on the server against the customer's verified mobile
  // number, so they can leave and continue later from any device. The form
  // (small, quick) and the photos (large, slower) are saved separately, so a
  // slow photo upload never holds back the step the customer has reached.
  // Draft requests never block the form: if one fails the wizard carries on.

  // Only start saving once the customer has actually changed something.
  const userEdited = useRef(false);
  // Set once the application is submitted or reset, so a late save can't
  // bring the old draft back.
  const draftClosed = useRef(false);
  // Old browser-saved progress waiting to be removed once it reaches the server.
  const legacyPending = useRef(false);
  // Latest values for the save routines, which run outside React's render.
  const latest = useRef({ formData, selectedProduct, stepIndex });
  latest.current = { formData, selectedProduct, stepIndex };
  const lastSavedStep = useRef(null);
  // Something has been saved since the form opened (drives "All changes saved").
  const hasSaved = useRef(false);

  // Form saves (fields, package, step) — run one at a time, in order.
  const formSaveInFlight = useRef(null);
  const formSaveQueued = useRef(false);
  const formTimer = useRef(null);
  const formRetryTimer = useRef(null);
  const formDirty = useRef(false);
  const formFailures = useRef(0);
  const formFailed = useRef(false);

  // Photo saves — one photo at a time, always its latest version.
  const savedPhotos = useRef({}); // what the server holds, per field
  const photoGaveUp = useRef({}); // field -> value that failed every retry
  const photoInFlight = useRef(null);
  const wakeRetry = useRef(null);

  // The saved draft being edited (none until the first save creates one) and
  // the last moment it can be continued: 30 days from when it was started.
  const draftIdRef = useRef(null);
  const resumeUntilRef = useRef(null);
  const [resumeUntil, setResumeUntil] = useState(null);
  // Server clock minus this device's clock, so the limit is judged by server time.
  const clockOffset = useRef(0);

  const rememberDraft = (info, serverTime) => {
    if (info?.id) draftIdRef.current = info.id;
    if (info?.resumeUntil) {
      resumeUntilRef.current = info.resumeUntil;
      setResumeUntil(info.resumeUntil);
    }
    if (serverTime) clockOffset.current = new Date(serverTime).getTime() - Date.now();
  };

  const isPastResumeLimit = () =>
    Boolean(resumeUntilRef.current)
    && Date.now() + clockOffset.current >= new Date(resumeUntilRef.current).getTime();

  const forgetDraft = () => {
    draftIdRef.current = null;
    resumeUntilRef.current = null;
    setResumeUntil(null);
  };

  // 'idle' | 'saving' | 'saved' | 'error', shown beside the buttons.
  const [saveStatus, setSaveStatus] = useState('idle');
  // Whether this browser can save at all; if not, a "sign in again" prompt shows.
  const [draftAccess, setDraftAccess] = useState(hasDraftAccess);

  useEffect(() => {
    const sync = () => {
      setDraftAccess(hasDraftAccess());
      refreshSaveStatus();
    };
    window.addEventListener(DRAFT_ACCESS_EVENT, sync);
    return () => window.removeEventListener(DRAFT_ACCESS_EVENT, sync);
  }, []);

  const photoValue = (field) => latest.current.formData[field] || '';

  const photosPending = () =>
    PHOTO_FIELDS.filter((field) => {
      const value = photoValue(field);
      const gaveUp = field in photoGaveUp.current && photoGaveUp.current[field] === value;
      return value !== (savedPhotos.current[field] || '') && !gaveUp;
    });

  const photosFailed = () =>
    PHOTO_FIELDS.some((field) => {
      const value = photoValue(field);
      return field in photoGaveUp.current && photoGaveUp.current[field] === value
        && value !== (savedPhotos.current[field] || '');
    });

  const isSaveActive = () =>
    Boolean(formTimer.current || formSaveInFlight.current || formRetryTimer.current || photoInFlight.current);

  const hasUnsavedWork = () =>
    !draftClosed.current && userEdited.current && hasDraftAccess()
    && (isSaveActive() || formDirty.current || photosPending().length > 0 || photosFailed());

  const refreshSaveStatus = () => {
    // Without access nothing is being saved, so never claim it is.
    if (draftClosed.current || !userEdited.current || !hasDraftAccess()) setSaveStatus('idle');
    else if (isSaveActive() || photosPending().length > 0) setSaveStatus('saving');
    else if ((formDirty.current && formFailed.current) || photosFailed()) setSaveStatus('error');
    else setSaveStatus(hasSaved.current ? 'saved' : 'idle');
  };

  // Browser-saved progress is removed once both form and photos are on the server.
  const finishLegacyMove = () => {
    if (legacyPending.current && !formDirty.current && photosPending().length === 0) {
      clearLegacyDrafts();
      legacyPending.current = false;
    }
  };

  // A pause between retries that ends early when the draft is closed.
  const waitBeforeRetry = (ms) =>
    new Promise((resolve) => {
      const timer = setTimeout(resolve, ms);
      wakeRetry.current = () => {
        clearTimeout(timer);
        resolve();
      };
    });

  const persistDraft = () => {
    formTimer.current = null;
    if (draftClosed.current || !hasDraftAccess()) return Promise.resolve();
    if (formSaveInFlight.current) {
      formSaveQueued.current = true;
      return formSaveInFlight.current;
    }
    if (formRetryTimer.current) {
      clearTimeout(formRetryTimer.current);
      formRetryTimer.current = null;
    }

    formSaveInFlight.current = (async () => {
      try {
        do {
          formSaveQueued.current = false;
          if (draftClosed.current) break;
          if (isPastResumeLimit()) {
            handleDraftExpired(resumeUntilRef.current);
            break;
          }

          const { formData: data, selectedProduct: product, stepIndex: index } = latest.current;
          const fields = { ...data };
          PHOTO_FIELDS.forEach((field) => delete fields[field]);

          formDirty.current = false;
          const res = await saveDraft({
            formData: fields,
            selectedProduct: product,
            stepIndex: index,
            draftId: draftIdRef.current,
          });
          rememberDraft(res?.data?.draft, res?.data?.serverTime);

          hasSaved.current = true;
          formFailures.current = 0;
          formFailed.current = false;
          finishLegacyMove();
        } while (formSaveQueued.current);
      } catch (err) {
        // Past the 30-day limit: can't be continued; start a fresh application.
        if (isDraftExpiredError(err)) {
          handleDraftExpired(err.response?.data?.expiredOn);
          return;
        }
        formDirty.current = true;
        formFailures.current += 1;
        console.warn('Could not save application progress:', err?.response?.data?.message || err.message);
        // Retry a few times, then wait for the customer's next change. A
        // missing or rejected token isn't retried: the sign-in prompt shows.
        if (isAccessError(err)) {
          formFailed.current = true;
        } else if (!draftClosed.current && formFailures.current <= SAVE_RETRY_DELAYS_MS.length) {
          formRetryTimer.current = setTimeout(() => {
            formRetryTimer.current = null;
            persistDraft();
          }, SAVE_RETRY_DELAYS_MS[formFailures.current - 1]);
        } else {
          formFailed.current = true;
        }
      } finally {
        formSaveInFlight.current = null;
        refreshSaveStatus();
      }
    })();

    refreshSaveStatus();
    return formSaveInFlight.current;
  };

  const uploadPhotos = () => {
    if (draftClosed.current || !hasDraftAccess()) return Promise.resolve();
    if (photoInFlight.current) return photoInFlight.current;
    if (photosPending().length === 0) return Promise.resolve();

    photoInFlight.current = (async () => {
      let attempt = 0;
      try {
        let pending = photosPending();
        while (!draftClosed.current && pending.length > 0) {
          if (isPastResumeLimit()) {
            handleDraftExpired(resumeUntilRef.current);
            break;
          }
          const field = pending[0];
          const value = photoValue(field);
          try {
            const res = await saveDraftPhoto(field, value, draftIdRef.current);
            rememberDraft(res?.data?.draft, res?.data?.serverTime);
            savedPhotos.current = { ...savedPhotos.current, [field]: value };
            hasSaved.current = true;
            attempt = 0;
          } catch (err) {
            // Past the 30-day limit: stop; a fresh application is started.
            if (isDraftExpiredError(err)) {
              handleDraftExpired(err.response?.data?.expiredOn);
              break;
            }
            console.warn(`Could not save ${field}:`, err?.response?.data?.message || err.message);
            // No valid token: stop; the sign-in prompt takes over.
            if (isAccessError(err)) break;
            // A rejected image (too large / not an image) won't succeed on retry.
            const rejected = err?.response?.status === 400;
            if (rejected || attempt >= SAVE_RETRY_DELAYS_MS.length) {
              photoGaveUp.current = { ...photoGaveUp.current, [field]: value };
              attempt = 0;
            } else {
              refreshSaveStatus();
              await waitBeforeRetry(SAVE_RETRY_DELAYS_MS[attempt]);
              attempt += 1;
            }
          }
          refreshSaveStatus();
          pending = photosPending();
        }
        finishLegacyMove();
      } finally {
        photoInFlight.current = null;
        wakeRetry.current = null;
        // A photo changed just as the last upload finished: pick it up.
        if (!draftClosed.current && photosPending().length > 0) setTimeout(uploadPhotos, 0);
        refreshSaveStatus();
      }
    })();

    refreshSaveStatus();
    return photoInFlight.current;
  };

  // 1. On open, load the customer's saved progress from the server. Progress
  //    saved in this browser by the previous version is picked up if the
  //    server has none, and moved to the server on the first save.
  useEffect(() => {
    let cancelled = false;

    const restore = async () => {
      let draft = null;
      let fromLegacy = false;
      let expiredInfo = null;
      let serverTime = null;

      try {
        ({ draft, expired: expiredInfo, serverTime } = await getDraft());
      } catch (err) {
        console.warn('Could not load saved application progress:', err?.response?.data?.message || err.message);
      }

      if (!draft) {
        const legacy = readLegacyDraft(verifiedMobile || getAuthUser()?.phone);
        if (legacy && hasCustomerInput(legacy.formData)) {
          draft = legacy;
          fromLegacy = true;
        } else {
          clearLegacyDrafts();
        }
      }

      if (cancelled) return;

      if (draft) {
        const restoredFormData = { ...(draft.formData || {}) };
        if (typeof restoredFormData.nic === 'string' && restoredFormData.nic.startsWith('NIC-')) {
          restoredFormData.nic = '';
        }

        // Arriving from the cart with a package means that package is the one
        // being bought; otherwise continue with the package saved in the draft.
        const productFromCart = location.state?.selectedProduct;
        if (productFromCart) {
          delete restoredFormData.otherBroadbandPackage;
        } else if (draft.selectedProduct) {
          setSelectedProduct(draft.selectedProduct);
        }

        dispatch({ type: 'SET_FIELDS', payload: restoredFormData });

        // Resume at the saved step. Coverage is re-checked rather than trusted.
        const savedIdx = Math.min(Math.max(Number(draft.stepIndex) || 0, 0), STEPS.length - 1);
        let resumeIdx = STEPS[savedIdx] === 'loop' ? 0 : savedIdx;

        // Never resume past a step whose requirements aren't all saved (e.g. a
        // photo that hadn't finished uploading): send the customer back to it,
        // using the same rules the steps check when Continue is pressed.
        const identityIdx = STEPS.indexOf('identity');
        const signatureIdx = STEPS.indexOf('signature');
        let backTo = '';
        if (resumeIdx > identityIdx && !identityComplete(restoredFormData)) {
          resumeIdx = identityIdx;
          backTo = 'identity';
        } else if (resumeIdx > signatureIdx && !signatureComplete(restoredFormData)) {
          resumeIdx = signatureIdx;
          backTo = 'signature';
        }

        // The address bar may point back to an earlier step, never past this one.
        const urlIdx = STEPS.indexOf(new URLSearchParams(location.search).get('step'));
        const targetIdx = urlIdx !== -1 && urlIdx <= resumeIdx ? urlIdx : resumeIdx;

        setStepIndex(targetIdx);
        lastSavedStep.current = targetIdx;
        navigate(`/new-connection?step=${STEPS[targetIdx]}`, { replace: true, state: location.state });

        // A draft already exists, so every change from here on is saved.
        userEdited.current = true;
        photoGaveUp.current = {};
        if (!fromLegacy) rememberDraft(draft, serverTime);
        if (fromLegacy) {
          // Copy the browser-saved progress, photos included, to the server.
          legacyPending.current = true;
          formDirty.current = true;
          savedPhotos.current = {};
        } else {
          savedPhotos.current = PHOTO_FIELDS.reduce(
            (acc, field) => ({ ...acc, [field]: restoredFormData[field] || '' }),
            {}
          );
          hasSaved.current = true;
        }

        if (backTo === 'identity') {
          toast('Some of your identity photos weren’t saved. Please complete this step again to continue.', { id: 'draft-restored', duration: 6000, icon: 'ℹ️' });
        } else if (backTo === 'signature') {
          toast('Your signature wasn’t saved. Please sign again to continue.', { id: 'draft-restored', duration: 6000, icon: 'ℹ️' });
        } else {
          toast.success('Resumed from your previously saved application progress.', { id: 'draft-restored', duration: 3500 });
        }
      } else {
        // Nothing saved, so there is nothing to skip ahead to.
        const stepParam = new URLSearchParams(location.search).get('step');
        if (stepParam && stepParam !== STEPS[0]) {
          navigate('/new-connection?step=location', { replace: true, state: location.state });
        }

        // Their previous application passed its 30 days: say so, once.
        if (expiredInfo?.id) {
          let alreadyTold = false;
          try { alreadyTold = localStorage.getItem(EXPIRY_NOTICE_KEY) === String(expiredInfo.id); } catch { /* ignore */ }
          if (!alreadyTold) {
            toast(expiredMessage(expiredInfo.expiredOn), { id: 'draft-expired', duration: 7000, icon: 'ℹ️' });
            try { localStorage.setItem(EXPIRY_NOTICE_KEY, String(expiredInfo.id)); } catch { /* ignore */ }
          }
        }
      }

      setDraftRestored(true);
      refreshSaveStatus();
    };

    restore();
    return () => { cancelled = true; };
  }, []);

  // 2. Save the form: moving to another step saves straight away, other
  //    changes once the customer pauses.
  useEffect(() => {
    if (!draftRestored || !userEdited.current || draftClosed.current) return undefined;

    const stepChanged = lastSavedStep.current !== stepIndex;
    lastSavedStep.current = stepIndex;
    formDirty.current = true;
    // A new change gets a fresh set of retries.
    formFailures.current = 0;
    formFailed.current = false;

    if (stepChanged && Object.keys(photoGaveUp.current).length > 0) {
      // Moving on is a good moment to try photos that failed earlier again.
      photoGaveUp.current = {};
      uploadPhotos();
    }

    const timer = setTimeout(persistDraft, stepChanged ? 0 : DRAFT_SAVE_DELAY_MS);
    formTimer.current = timer;
    refreshSaveStatus();
    return () => {
      clearTimeout(timer);
      if (formTimer.current === timer) formTimer.current = null;
    };
  }, [formData, selectedProduct, stepIndex, draftRestored]);

  // 3. Save photos as soon as they are taken or changed, separately from the form.
  useEffect(() => {
    if (!draftRestored || !userEdited.current || draftClosed.current) return;
    uploadPhotos();
  }, [formData.nicFront, formData.nicBack, formData.facePhoto, draftRestored]);

  // Leaving the wizard (e.g. Back to Cart) saves anything still waiting.
  useEffect(() => () => {
    if (draftClosed.current) return;
    if (formDirty.current) persistDraft();
    uploadPhotos();
  }, []);

  // Closing or reloading the tab while something is still saving: let the
  // browser ask "Leave site? Changes you made may not be saved."
  useEffect(() => {
    const warnIfSaving = (event) => {
      if (!hasUnsavedWork()) return undefined;
      if (formDirty.current) persistDraft();
      event.preventDefault();
      event.returnValue = '';
      return '';
    };
    window.addEventListener('beforeunload', warnIfSaving);
    return () => window.removeEventListener('beforeunload', warnIfSaving);
  }, []);

  // 4. Remove the saved progress once the application is submitted or reset.
  //    Waits for any save still on its way so it can't recreate the draft.
  const clearSavedDraft = async () => {
    draftClosed.current = true;
    userEdited.current = false;
    if (formTimer.current) clearTimeout(formTimer.current);
    if (formRetryTimer.current) clearTimeout(formRetryTimer.current);
    formTimer.current = null;
    formRetryTimer.current = null;
    if (wakeRetry.current) wakeRetry.current();

    await Promise.allSettled([formSaveInFlight.current, photoInFlight.current]);

    try {
      await deleteDraft();
    } catch (err) {
      console.warn('Could not remove saved application progress:', err?.response?.data?.message || err.message);
    }
    clearLegacyDrafts();

    formDirty.current = false;
    formFailures.current = 0;
    formFailed.current = false;
    savedPhotos.current = {};
    photoGaveUp.current = {};
    hasSaved.current = false;
    forgetDraft();
    setSaveStatus('idle');
  };

  // Empty the form and go back to the first step.
  const startFresh = () => {
    dispatch({
      type: 'SET_FIELDS',
      payload: {
        ...initialState,
        mobileNumber: verifiedMobile || '',
        otherBroadbandPackage: selectedProduct?.productName
          ? `${selectedProduct.productName} (Qty: ${selectedProduct.quantity || 1})`
          : '',
      },
    });
    lastSavedStep.current = 0;
    setStepIndex(0);
    navigate('/new-connection?step=location', { replace: true });
  };

  const handleResetDraft = async () => {
    if (window.confirm('Are you sure you want to clear your saved progress and start from the beginning?')) {
      await clearSavedDraft();
      // The fresh form can be saved again as soon as the customer edits it.
      draftClosed.current = false;
      startFresh();
      toast.success('Application form reset.');
    }
  };

  // The application passed its 30-day limit while being worked on. It can no
  // longer be continued (the server keeps it on record, marked expired), so
  // start a fresh form; the next change the customer makes starts a new one.
  const handleDraftExpired = (expiredOn) => {
    if (draftClosed.current) return;
    draftClosed.current = true;
    if (formTimer.current) clearTimeout(formTimer.current);
    if (formRetryTimer.current) clearTimeout(formRetryTimer.current);
    formTimer.current = null;
    formRetryTimer.current = null;
    if (wakeRetry.current) wakeRetry.current();

    userEdited.current = false;
    formDirty.current = false;
    formFailures.current = 0;
    formFailed.current = false;
    savedPhotos.current = {};
    photoGaveUp.current = {};
    hasSaved.current = false;
    forgetDraft();
    setSaveStatus('idle');
    startFresh();
    toast(expiredMessage(expiredOn), { id: 'draft-expired', duration: 7000, icon: 'ℹ️' });

    // Saving resumes once any request still on its way has finished.
    Promise.allSettled([formSaveInFlight.current, photoInFlight.current]).then(() => {
      draftClosed.current = false;
    });
  };

  useEffect(() => {
    if (selectedProduct?.productName) {
      dispatch({
        type: 'UPDATE_FIELD',
        payload: {
          name: 'otherBroadbandPackage',
          value: `${selectedProduct.productName} (Qty: ${selectedProduct.quantity || 1})`,
        },
      });
    }
  }, [selectedProduct]);

  // Auto-populate mobile number from OTP context
  useEffect(() => {
    if (verifiedMobile) {
      dispatch({
        type: 'SET_FIELDS',
        payload: {
          mobileNumber: verifiedMobile,
        },
      });
    }
  }, [verifiedMobile]);

  // Steps also use this to fill in profile details automatically when they
  // open, so it does not by itself count as the customer editing. Typing and
  // moving between steps do.
  const setFields = (fields) => dispatch({ type: 'SET_FIELDS', payload: fields });

  const handleChange = (e) => {
    userEdited.current = true;
    const { name, value, type, checked } = e.target;
    let finalValue = type === 'checkbox' ? checked : value;

    // Filter out non-numeric characters for phone/number fields and cap at 10 digits
    if (['mobileNumber', 'fixedNumber', 'existingNumber'].includes(name) && typeof finalValue === 'string') {
      finalValue = finalValue.replace(/\D/g, '').slice(0, 10);
    }

    dispatch({
      type: 'UPDATE_FIELD',
      payload: {
        name,
        value: finalValue,
      },
    });
  };

  const nextStep = () => {
    userEdited.current = true;
    const nextIdx = Math.min(stepIndex + 1, STEPS.length - 1);
    setStepIndex(nextIdx);
    navigate(`/new-connection?step=${STEPS[nextIdx]}`, { replace: false });
    window.scrollTo(0, 0);
  };

  const prevStep = () => {
    userEdited.current = true;
    const prevIdx = Math.max(stepIndex - 1, 0);
    setStepIndex(prevIdx);
    navigate(`/new-connection?step=${STEPS[prevIdx]}`, { replace: false });
    window.scrollTo(0, 0);
  };

  const goTo = (key) => {
    const targetIdx = STEPS.indexOf(key);
    if (targetIdx !== -1) {
      userEdited.current = true;
      setStepIndex(targetIdx);
      navigate(`/new-connection?step=${STEPS[targetIdx]}`, { replace: false });
      window.scrollTo(0, 0);
    }
  };

  const handleBackNavigation = () => {
    if (submitting) return;

    // At step 0 (location) -> Navigate back to Cart
    if (stepIndex === 0 || step === 'location') {
      navigate('/cart');
      return;
    }

    // At identity (step 2) -> Jump back directly to location (step 0), skipping loop check
    if (step === 'identity') {
      goTo('location');
      return;
    }

    // At loop check (step 1) -> Jump back to location (step 0)
    if (step === 'loop') {
      goTo('location');
      return;
    }

    // From signature, review, payment -> Step back normally
    prevStep();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitError('');

    if (step === 'location') {
      if (!selectedProduct) {
        toast.error('Please select a broadband package before continuing.');
        navigate('/new-connection/products');
        return;
      }
      let activeAddress = formData.installAddress || formData.address;
      if ((!activeAddress || activeAddress.trim().length === 0) && formData.city) {
        activeAddress = `${formData.city}, ${formData.district || 'Sri Lanka'}`;
        dispatch({
          type: 'SET_FIELDS',
          payload: { installAddress: activeAddress, address: activeAddress },
        });
      }
      if (!activeAddress || activeAddress.trim().length === 0) {
        toast.error('Please specify an installation address or choose your city.');
        return;
      }

    }
    if (step === 'identity' && !identityRef.current?.validate()) return;
    if (step === 'signature' && !declarationRef.current?.validate()) return;
    if (step === 'payment') {
      if (!formData.paymentReference && !formData.paymentCompleted) {
        toast.error('Please complete payment before proceeding.');
        return;
      }
    }
    if (step === 'review') {
      submitApplication();
      return;
    }

    nextStep();
  };

  // The coverage screen owns the unavailable-service flow and alternatives.
  // Returning to package selection clears the previous selection.
  const discontinueFibreRegistration = () => {
    try {
      localStorage.removeItem('selectedProduct');
      sessionStorage.removeItem('selectedProduct');
    } catch {
      // Storage may be disabled.
    }
    navigate('/new-connection/products', { replace: true });
  };

  // Final step: clear saved progress and cart, then open tracking.
  const goToTracking = async (ref) => {
    await clearSavedDraft();
    try {
      await clearSessionCart();
    } catch (err) {
      console.warn('Could not clear checkout cart after submission:', err?.message);
    }
    navigate(`/check-status?ref=${encodeURIComponent(ref)}`, {
      replace: true,
      state: { ref, justSubmitted: true },
    });
  };

  // Payment confirmation callback -> Advances flow from Payment to Review & Submit
  const handlePaymentSuccess = async (paymentOrderId, payerMobile) => {
    if (!paymentOrderId) {
      toast.error('Payment confirmation was missing an order reference. Please verify your payment status.');
      return;
    }
    const orderId = paymentOrderId;
    dispatch({
      type: 'SET_FIELDS',
      payload: {
        paymentReference: orderId,
        paymentCompleted: true,
        paymentStatus: 'PAID',
        paidAmount: selectedProduct?.installationFee ?? 2500,
        payerMobile: payerMobile || formData.mobileNumber,
      },
    });
    toast.success('Payment verified! Please review your application details below.');
    nextStep();
  };

  // Real submission — fired when user reviews all details and clicks Submit Application
  const submitApplication = async (paymentRef, phoneOverride) => {
    const authUser = getAuthUser();
    const sanitizeNic = (val) => (!val || typeof val !== 'string' || val.startsWith('NIC-') ? '' : val);
    const rawNic = formData.nic || authUser?.NIC || authUser?.nic || '';
    const nic = sanitizeNic(rawNic);
    const nameFull = formData.nameFull || authUser?.name || 'Customer';
    const effectivePaymentRef = paymentRef || formData.paymentReference;
    const phone = phoneOverride || verifiedMobile || formData.mobileNumber || authUser?.phone || '';

    if (submitting) return null;
    if (!effectivePaymentRef || !formData.paymentCompleted) {
      setSubmitError('A confirmed payment is required before submitting your application.');
      return null;
    }
    setSubmitting(true);
    setSubmitError('');
    try {
      const res = await api.post('/applications', {
        serviceType: 'new-connection',
        formData: {
          ...formData,
          nic,
          nameFull,
          mobileNumber: phone,
          declarationAccepted: Boolean(formData.declarationAccepted),
          signature: formData.signature || 'DIGITALLY_VERIFIED_OTP',
          paymentReference: effectivePaymentRef,
          product: selectedProduct,
        },
        phone,
      });

      const officialRef = res.data?.application?.referenceNumber || res.data?.referenceNumber;
      if (!officialRef) {
        throw new Error('The server did not return an application reference number.');
      }
      await goToTracking(officialRef);
      return officialRef;
    } catch (err) {
      setSubmitError(err.response?.data?.message || err.message || t('common.submitError'));
      setSubmitting(false);
      return null;
    }
  };

  // Package Selection is handled before this wizard; loop checking shares
  // the Service Location step in the progress bar.
  const MAP_TO_7_STEP = {
    location: 2,
    loop: 2,
    identity: 3,
    signature: 4,
    payment: 5,
    review: 6,
  };
  const MAP_TO_6_STEP = {
    location: 1,
    loop: 1,
    identity: 2,
    signature: 3,
    payment: 4,
    review: 5,
  };
  const useSixSteps = stepperMode === 'six';
  const activeDisplayStep = (useSixSteps ? MAP_TO_6_STEP : MAP_TO_7_STEP)[step] || (useSixSteps ? 1 : 2);

  // Stepper allows returning to completed steps only. Never skip ahead, and
  // never jump past the loop availability check automatically.
  const handleStepClick = (targetStepNumber) => {
    const targetStep = Number(targetStepNumber);
    if (!useSixSteps && targetStep === 1) {
      navigate('/cart');
      return;
    }

    const toInternalStep = useSixSteps
      ? { 1: 'location', 2: 'identity', 3: 'signature', 4: 'payment', 5: 'review' }
      : { 2: 'location', 3: 'identity', 4: 'signature', 5: 'payment', 6: 'review' };
    const targetKey = toInternalStep[targetStep];
    const targetIndex = STEPS.indexOf(targetKey);

    if (targetIndex >= 0 && targetIndex < stepIndex) {
      goTo(targetKey);
    } else if (targetIndex > stepIndex) {
      toast.error('Please complete the current step before proceeding.');
    }
  };

  return (
    <div className="card" style={{ padding: '2.5rem 2.75rem', width: '100%', margin: '0 auto', borderRadius: '24px', boxShadow: '0 12px 36px rgba(11, 45, 91, 0.08)' }}>
      {/* Seven-step onboarding by default; six-step legacy navigation remains supported. */}
      <WizardStepper
        currentStep={activeDisplayStep}
        steps={useSixSteps ? SIX_WIZARD_STEPS : FULL_ONBOARDING_7_STEPS}
        onStepClick={handleStepClick}
      />

      {draftRestored && !draftAccess && (
        <div style={{ marginBottom: '1.5rem' }}>
          <DraftSignInNotice message="Your progress isn’t being saved. Sign in again to save it and continue later from any device." />
        </div>
      )}

      {selectedProduct && (
        <div
          style={{
            backgroundColor: '#f0f7ff',
            border: '1.5px solid #bfdbfe',
            borderRadius: '16px',
            padding: '1rem 1.35rem',
            marginBottom: '1.75rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '0.75rem',
          }}
        >
          <div>
            <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#0f57a8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Selected Package</span>
            <h4 style={{ margin: '0.15rem 0 0 0', fontSize: '1.1rem', fontWeight: 800, color: '#0f172a' }}>
              {selectedProduct.productName}
            </h4>
          </div>
          <div style={{ display: 'flex', gap: '1.25rem', fontSize: '0.9rem', color: '#334155' }}>
            <span>Monthly: <strong style={{ color: '#0f57a8' }}>Rs. {(selectedProduct.monthlyPrice || 0).toLocaleString()}</strong></span>
            <span>Installation: <strong>Rs. {(selectedProduct.installationFee ?? 2500).toLocaleString()}</strong></span>
            {selectedProduct.quantity > 1 && <span>Qty: <strong>{selectedProduct.quantity}</strong></span>}
          </div>
        </div>
      )}

      <ExistingCustomerSummaryBox customerData={selectedAccount} customerExists={customerExists} />

      <form onSubmit={handleSubmit}>
        <div style={{ minHeight: '300px', marginBottom: '2rem' }}>
          {step === 'location' && (
            <CustomerInfoStep
              formData={formData}
              handleChange={handleChange}
              setFields={setFields}
              selectedProduct={selectedProduct}
            />
          )}

          {step === 'loop' && (
            <LoopCheckStep
              formData={formData}
              selectedProduct={selectedProduct}
              onSelectAlternativeProduct={(newProd) => {
                setSelectedProduct(newProd);
                try {
                  localStorage.setItem('selectedProduct', JSON.stringify(newProd));
                } catch (e) {}
                dispatch({
                  type: 'UPDATE_FIELD',
                  payload: {
                    name: 'otherBroadbandPackage',
                    value: `${newProd.name || newProd.productName} (Qty: 1)`,
                  },
                });
              }}
              onAvailable={nextStep}
              onGoBack={prevStep}
              onDiscontinue={discontinueFibreRegistration}
            />
          )}

          {step === 'identity' && (
            <IdentityStep
              ref={identityRef}
              formData={formData}
              setFields={setFields}
            />
          )}

          {step === 'signature' && (
            <DeclarationStep
              ref={declarationRef}
              formData={formData}
              handleChange={handleChange}
              setFields={setFields}
            />
          )}

          {step === 'payment' && (
            <PaymentStep
              isActive
              verifiedPhone={verifiedMobile}
              amount={selectedProduct?.installationFee ?? 2500}
              amountLabel="Installation Fee"
              onSuccess={handlePaymentSuccess}
            />
          )}

          {step === 'review' && (
            <ReviewStep
              formData={formData}
              selectedProduct={selectedProduct}
              goTo={goTo}
              onEditCart={() => navigate('/cart')}
            />
          )}
        </div>

        {submitError && (
          <p style={{ color: 'var(--danger, #dc3545)', marginBottom: '1rem', fontSize: '0.9rem' }}>
            {submitError}
          </p>
        )}

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1.5px solid #e2e8f0', paddingTop: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={handleBackNavigation}
              disabled={submitting}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.45rem',
                fontWeight: 700,
                fontSize: '0.92rem',
                padding: '0.65rem 1.25rem',
                borderRadius: '10px',
                cursor: 'pointer',
              }}
            >
              {stepIndex === 0 || step === 'location' ? '← Back to Cart' : '← Back'}
            </button>

            {draftRestored && (
              <button
                type="button"
                onClick={handleResetDraft}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#94a3b8',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  textDecoration: 'underline',
                  padding: '0.35rem',
                }}
                title="Clear saved draft and start from step 1"
              >
                Reset Form
              </button>
            )}

            {saveStatus !== 'idle' && (
              <span
                role="status"
                aria-live="polite"
                style={{
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  color: saveStatus === 'saved' ? '#15803d' : saveStatus === 'error' ? '#b45309' : '#64748b',
                }}
              >
                {saveStatus === 'saving' && 'Saving…'}
                {saveStatus === 'saved' && '✓ All changes saved'}
                {saveStatus === 'saved' && resumeUntil && (() => {
                  const daysLeft = draftDaysLeft(resumeUntil, new Date(Date.now() + clockOffset.current));
                  if (daysLeft !== null && daysLeft <= DRAFT_EXPIRY_WARNING_DAYS) {
                    return ` · Expires ${daysLeft <= 1 ? 'within 24 hours' : `in ${daysLeft} days`} (${formatDraftDate(resumeUntil)})`;
                  }
                  return ` · Saved until ${formatDraftDate(resumeUntil)}`;
                })()}
                {saveStatus === 'error' && '⚠ Some changes aren’t saved yet'}
              </span>
            )}
          </div>

          {(() => {
            const label = step === 'review'
              ? (submitting ? 'Submitting Application...' : 'Submit Application →')
              : (step === 'payment' && (formData.paymentReference || formData.paymentCompleted))
              ? 'Continue to Review →'
              : NEXT_LABEL[step];
            if (!label) return null;
            return (
              <button
                type="submit"
                className="btn btn-primary"
                disabled={submitting || !draftRestored}
                style={{
                  fontWeight: 800,
                  fontSize: '0.95rem',
                  padding: '0.7rem 1.5rem',
                  borderRadius: '10px',
                }}
              >
                {label}
              </button>
            );
          })()}
        </div>
      </form>

    </div>
  );
}
