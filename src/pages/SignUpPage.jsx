import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiShield, FiX, FiRefreshCw, FiCheck } from 'react-icons/fi';
import './SignUpPage.css';
import signupBgImage from '../assets/team_laptop.jpg';
import api from '../utils/api';
import { saveSession } from '../utils/authSession';
import IdentityCaptureField from '../components/form/IdentityCaptureField';

const RESEND_SECONDS = 30;
const TOTAL_STEPS = 4;

/* ── SVG icons (inline, zero dependencies) ─────────────────────── */
const IconUser = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
  </svg>
);

const IconMail = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
    <rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
  </svg>
);

const IconPhone = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.41 12 19.79 19.79 0 0 1 1.21 3.18 2 2 0 0 1 3.22 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.09 8.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21 16v.92z"/>
  </svg>
);

const IconLock = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
    <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
  </svg>
);

const IconEye = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/>
  </svg>
);

const IconEyeOff = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
    <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/><line x1="2" y1="2" x2="22" y2="22"/>
  </svg>
);

const IconShield = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="24" height="24">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/>
  </svg>
);

const IconZap = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="24" height="24">
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
  </svg>
);

const IconHeadphones = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="24" height="24">
    <path d="M3 18v-6a9 9 0 0 1 18 0v6"/><path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"/>
  </svg>
);

const IconCard = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
    <rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/>
  </svg>
);

const IconCalendar = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
  </svg>
);

const IconGlobe = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
    <circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
  </svg>
);

const IconMapPin = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
  </svg>
);

const IconBuilding = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
    <rect x="4" y="2" width="16" height="20" rx="2" ry="2"/><path d="M9 22v-4h6v4"/><path d="M8 6h.01"/><path d="M16 6h.01"/><path d="M12 6h.01"/><path d="M12 10h.01"/><path d="M12 14h.01"/><path d="M16 10h.01"/><path d="M16 14h.01"/><path d="M8 10h.01"/><path d="M8 14h.01"/>
  </svg>
);

const IconArrowLeft = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="18" height="18">
    <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
  </svg>
);

const IconArrowRight = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="18" height="18">
    <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
  </svg>
);

/* ── SLTMobitel Logo ─────────────────────────────────────────────── */
const SLTLogo = () => (
  <svg width="170" height="48" viewBox="0 0 170 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <line x1="4" y1="42" x2="18" y2="6" stroke="#0f57a8" strokeWidth="4" strokeLinecap="round"/>
    <line x1="14" y1="42" x2="28" y2="6" stroke="#50b748" strokeWidth="4" strokeLinecap="round"/>
    <text x="34" y="32" fontFamily="var(--font-head)" fontWeight="800" fontSize="20" fill="#ffffff">SLT</text>
    <text x="74" y="32" fontFamily="var(--font-head)" fontWeight="800" fontSize="20" fill="#50b748">MOBITEL</text>
    <text x="34" y="44" fontFamily="var(--font-body)" fontWeight="400" fontSize="8" fill="rgba(255,255,255,0.45)" letterSpacing="1.5">The Connection</text>
  </svg>
);

/* ── Helpers ─────────────────────────────────────────────────────── */
const API = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5050/api';

/* ── Main Component ──────────────────────────────────────────────── */
export default function SignUpPage() {
  const navigate = useNavigate();

  const prefilledPhone = (() => {
    const stored = localStorage.getItem('signupPhone') || '';
    if (stored) localStorage.removeItem('signupPhone');
    return stored;
  })();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  const [form, setForm] = useState({
    // Step 1
    phone: prefilledPhone,
    email: '',
    // Step 2 — identity documents
    nicFront: '',
    nicBack: '',
    facePhoto: '',
    // Step 3
    title: 'Mr.',
    fullName: '',
    dob: '',
    gender: 'Male',
    nic: '',
    nationality: 'Sri Lankan',
    contactNumber: '',
    // Step 4
    addressLine1: '',
    addressLine2: '',
    city: '',
    district: 'Colombo',
    postalCode: '',
    preferredContact: 'SMS',
  });


  /* ──────────────────────────────────────────────────────────────────
   * EMAIL VERIFICATION — TEMPORARILY DISABLED
   *
   * SLT asked for this to come out of registration for now, but the BRD still
   * requires email verification, so the implementation is kept here rather
   * than deleted. To re-enable: uncomment this block, the dialog further down,
   * the Verify button on the email field, and the emailVerified check in
   * validateStep1 — all four are marked with this same banner.
   * ────────────────────────────────────────────────────────────────── */
/*
  // ── Inline email verification ────────────────────────────────────
  // Mirrors the phone flow. Sending a real email is not wired up yet, so the
  // code is accepted locally — swap sendEmailOtp/submitEmailOtp for API calls
  // once the mail service exists.
  const [emailVerified, setEmailVerified] = useState(false);
  const [emailModalOpen, setEmailModalOpen] = useState(false);
  const [sendingEmailOtp, setSendingEmailOtp] = useState(false);
  const [verifyingEmailOtp, setVerifyingEmailOtp] = useState(false);
  const [emailOtp, setEmailOtp] = useState(['', '', '', '', '', '']);
  const [emailOtpError, setEmailOtpError] = useState('');
  const [emailResendIn, setEmailResendIn] = useState(RESEND_SECONDS);
  const emailOtpRefs = useRef([]);
  const verifyEmailBtnRef = useRef(null);
  const emailModalRef = useRef(null);

  useEffect(() => {
    if (!emailModalOpen) return;
    setEmailResendIn(RESEND_SECONDS);
    const id = setTimeout(() => emailOtpRefs.current[0]?.focus(), 50);

    const onKeyDown = (e) => {
      if (e.key === 'Escape') { e.stopPropagation(); setEmailModalOpen(false); return; }
      if (e.key !== 'Tab' || !emailModalRef.current) return;
      const focusable = emailModalRef.current.querySelectorAll(
        'button:not([disabled]), input:not([disabled]), [href], select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    };
    document.addEventListener('keydown', onKeyDown, true);
    return () => { clearTimeout(id); document.removeEventListener('keydown', onKeyDown, true); };
  }, [emailModalOpen]);

  const wasEmailModalOpen = useRef(false);
  useEffect(() => {
    if (wasEmailModalOpen.current && !emailModalOpen) verifyEmailBtnRef.current?.focus();
    wasEmailModalOpen.current = emailModalOpen;
  }, [emailModalOpen]);

  useEffect(() => {
    if (!emailModalOpen || emailResendIn <= 0) return;
    const id = setTimeout(() => setEmailResendIn((s) => s - 1), 1000);
    return () => clearTimeout(id);
  }, [emailModalOpen, emailResendIn]);

  const sendEmailOtp = async () => {
    const address = (form.email || '').trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(address)) {
      setFieldErrors((fe) => ({ ...fe, email: 'Enter a valid email address first' }));
      return;
    }
    setSendingEmailOtp(true);
    // No mail service yet — this is where the send request will go.
    await new Promise((r) => setTimeout(r, 400));
    setSendingEmailOtp(false);
    setEmailOtp(['', '', '', '', '', '']);
    setEmailOtpError('');
    setEmailModalOpen(true);
  };

  const submitEmailOtp = (code) => {
    setVerifyingEmailOtp(true);
    setEmailOtpError('');
    // Until email delivery is wired up, the demo code stands in for a real one.
    setTimeout(() => {
      if (code === '000000') {
        setEmailVerified(true);
        setEmailModalOpen(false);
        setFieldErrors((fe) => ({ ...fe, email: undefined }));
      } else {
        setEmailOtpError('Invalid or expired verification code.');
        setEmailOtp(['', '', '', '', '', '']);
        setTimeout(() => emailOtpRefs.current[0]?.focus(), 50);
      }
      setVerifyingEmailOtp(false);
    }, 300);
  };

  const handleEmailOtpChange = (index, raw) => {
    if (verifyingEmailOtp) return;
    const value = raw.replace(/\D/g, '');
    const next = [...emailOtp];
    next[index] = value.slice(-1) || '';
    setEmailOtp(next);
    if (value && index < 5) emailOtpRefs.current[index + 1]?.focus();
    const joined = next.join('');
    if (joined.length === 6) submitEmailOtp(joined);
    else if (emailOtpError) setEmailOtpError('');
  };

  const handleEmailOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !emailOtp[index] && index > 0) emailOtpRefs.current[index - 1]?.focus();
    else if (e.key === 'ArrowLeft' && index > 0) { e.preventDefault(); emailOtpRefs.current[index - 1]?.focus(); }
    else if (e.key === 'ArrowRight' && index < 5) { e.preventDefault(); emailOtpRefs.current[index + 1]?.focus(); }
  };

  const handleResendEmailOtp = () => {
    if (emailResendIn > 0 || verifyingEmailOtp) return;
    setEmailOtp(['', '', '', '', '', '']);
    setEmailOtpError('');
    setEmailResendIn(RESEND_SECONDS);
    setTimeout(() => emailOtpRefs.current[0]?.focus(), 50);
  };
*/

  // ── Inline phone verification ────────────────────────────────────
  // The number is confirmed by OTP right here on the form, the same way the
  // Ownership Transfer wizard verifies a new applicant's number.
  const [phoneVerified, setPhoneVerified] = useState(false);
  const [otpModalOpen, setOtpModalOpen] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [otpError, setOtpError] = useState('');
  const [resendIn, setResendIn] = useState(RESEND_SECONDS);
  const otpRefs = useRef([]);

  const verifyBtnRef = useRef(null);
  const modalRef = useRef(null);

  useEffect(() => {
    if (!otpModalOpen) return;
    setResendIn(RESEND_SECONDS);
    const id = setTimeout(() => otpRefs.current[0]?.focus(), 50);

    // Escape closes the dialog, and Tab is kept inside it while it's open.
    const onKeyDown = (e) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        setOtpModalOpen(false);
        return;
      }
      if (e.key !== 'Tab' || !modalRef.current) return;
      const focusable = modalRef.current.querySelectorAll(
        'button:not([disabled]), input:not([disabled]), [href], select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', onKeyDown, true);
    return () => {
      clearTimeout(id);
      document.removeEventListener('keydown', onKeyDown, true);
    };
  }, [otpModalOpen]);

  // Send focus back to the Verify button when the dialog closes, so keyboard
  // users aren't dumped at the top of the page.
  const wasModalOpen = useRef(false);
  useEffect(() => {
    if (wasModalOpen.current && !otpModalOpen) verifyBtnRef.current?.focus();
    wasModalOpen.current = otpModalOpen;
  }, [otpModalOpen]);

  useEffect(() => {
    if (!otpModalOpen || resendIn <= 0) return;
    const id = setTimeout(() => setResendIn((s) => s - 1), 1000);
    return () => clearTimeout(id);
  }, [otpModalOpen, resendIn]);

  const normalisedPhone = () => {
    let digits = form.phone.replace(/\D/g, '');
    if (digits.startsWith('0')) digits = digits.slice(1);
    return digits;
  };

  const sendOtp = async () => {
    const digits = normalisedPhone();
    if (digits.length !== 9) {
      setFieldErrors((fe) => ({ ...fe, phone: 'Enter a valid 9-digit mobile number first' }));
      return;
    }

    setSendingOtp(true);
    try {
      // Don't let someone register a number that already has an account.
      const check = await api.post('/auth/check-phone', { phone: digits });
      if (check.data?.registered) {
        setFieldErrors((fe) => ({ ...fe, phone: 'This number already has an account. Please sign in instead.' }));
        setSendingOtp(false);
        return;
      }
    } catch (err) {
      // Lookup unavailable — carry on; the register call still guards duplicates.
    }

    try {
      await api.post('/otp/send', { phone: digits });
    } catch (err) {
      // Offline/demo mode — still open the code entry.
    }
    setSendingOtp(false);
    setOtp(['', '', '', '', '', '']);
    setOtpError('');
    setOtpModalOpen(true);
  };

  const submitOtp = async (code) => {
    const digits = normalisedPhone();
    setVerifyingOtp(true);
    setOtpError('');
    try {
      const res = await api.post('/otp/verify', { phone: digits, otp: code });
      if (res.data?.success) {
        setPhoneVerified(true);
        setOtpModalOpen(false);
      } else {
        setOtpError(res.data?.message || 'Invalid or expired verification code.');
        setOtp(['', '', '', '', '', '']);
        setTimeout(() => otpRefs.current[0]?.focus(), 50);
      }
    } catch (err) {
      // Demo bypass — 000000 (or a backend outage) counts as verified.
      if (code === '000000' || !err.response) {
        setPhoneVerified(true);
        setOtpModalOpen(false);
      } else {
        setOtpError(err.response?.data?.message || 'Invalid or expired verification code.');
        setOtp(['', '', '', '', '', '']);
        setTimeout(() => otpRefs.current[0]?.focus(), 50);
      }
    } finally {
      setVerifyingOtp(false);
    }
  };

  const handleOtpChange = (index, raw) => {
    if (verifyingOtp) return;
    const value = raw.replace(/\D/g, '');
    const next = [...otp];
    next[index] = value.slice(-1) || '';
    setOtp(next);
    if (value && index < 5) otpRefs.current[index + 1]?.focus();

    const joined = next.join('');
    if (joined.length === 6) submitOtp(joined);
    else if (otpError) setOtpError('');
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowLeft' && index > 0) {
      e.preventDefault();
      otpRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < 5) {
      e.preventDefault();
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleResendOtp = async () => {
    if (resendIn > 0 || verifyingOtp) return;
    setOtp(['', '', '', '', '', '']);
    setOtpError('');
    try {
      await api.post('/otp/send', { phone: normalisedPhone() });
    } catch (err) {
      // demo code still works offline
    }
    setResendIn(RESEND_SECONDS);
    setTimeout(() => otpRefs.current[0]?.focus(), 50);
  };

  const set = (field) => (e) => {
    let value = e.target.value;
    if (field === 'phone' || field === 'contactNumber') {
      value = value.replace(/\D/g, '').slice(0, 10);
    }
    // Editing either contact invalidates the code already confirmed for it.
    if (field === 'phone') setPhoneVerified(false);
    // EMAIL VERIFICATION — TEMPORARILY DISABLED (see banner near the top)
    // if (field === 'email') setEmailVerified(false);
    if (field === 'nic') {
      value = value.slice(0, 12);
    }
    setForm(f => ({ ...f, [field]: value }));
    setFieldErrors(fe => ({ ...fe, [field]: undefined }));
    setError('');
  };

  const validateStep1 = () => {
    const fe = {};
    if (!form.phone?.trim()) fe.phone = 'Phone number is required';
    else if (!/^\d{9,10}$/.test(form.phone.replace(/[\s+\-()]/g, ''))) fe.phone = 'Enter a valid phone number';
    
    // EMAIL ADDRESS — TEMPORARILY REMOVED FROM REGISTRATION (see the note in step 1)
    // if (!form.email?.trim()) fe.email = 'Email address is required';
    // else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) fe.email = 'Enter a valid email';
    // EMAIL VERIFICATION — TEMPORARILY DISABLED (see banner near the top)
    // else if (!emailVerified) fe.email = 'Please verify your email address to continue';
    
    if (!form.phone?.trim()) fe.phone = 'Phone number is required';
    else if (!phoneVerified) fe.phone = 'Please verify your mobile number to continue';


    return fe;
  };

  // Identity documents are captured here, at registration, so the customer is
  // never asked for them again when applying for a service.
  const validateStep2 = () => {
    const fe = {};
    if (!form.nicFront) fe.nicFront = 'A photo of the front of your NIC is required';
    if (!form.nicBack) fe.nicBack = 'A photo of the back of your NIC is required';
    if (!form.facePhoto) fe.facePhoto = 'A headshot is required';
    return fe;
  };

  const validateStep3 = () => {
    const fe = {};
    if (!form.title) fe.title = 'Title is required';
    if (!form.fullName?.trim()) fe.fullName = 'Full Name is required';
    if (!form.dob) fe.dob = 'Date of birth is required';
    if (!form.gender) fe.gender = 'Gender is required';
    if (!form.nic?.trim()) fe.nic = 'NIC / Passport is required';
    if (!form.nationality) fe.nationality = 'Nationality is required';
    return fe;
  };

  const validateStep4 = () => {
    const fe = {};
    if (!form.addressLine1?.trim()) fe.addressLine1 = 'Address Line 1 is required';
    if (!form.city?.trim()) fe.city = 'City is required';
    if (!form.district) fe.district = 'District is required';
    if (!form.postalCode?.trim()) fe.postalCode = 'Postal Code is required';
    if (!form.preferredContact) fe.preferredContact = 'Preferred contact method is required';
    return fe;
  };

  const nextStep = () => {
    let fe = {};
    if (step === 1) fe = validateStep1();
    if (step === 2) fe = validateStep2();
    if (step === 3) fe = validateStep3();
    
    if (Object.keys(fe).length > 0) {
      setFieldErrors(fe);
      return;
    }
    setStep(s => Math.min(s + 1, TOTAL_STEPS));
    window.scrollTo(0, 0);
  };

  const prevStep = () => {
    setStep(s => Math.max(s - 1, 1));
    window.scrollTo(0, 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (step < TOTAL_STEPS) return nextStep();

    const fe = validateStep4();
    if (Object.keys(fe).length > 0) { 
      setFieldErrors(fe); 
      return; 
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch(`${API}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: `${form.title} ${form.fullName.trim()}`,
          // EMAIL ADDRESS — TEMPORARILY REMOVED FROM REGISTRATION (see step 1).
          // The account is created without one; the customer supplies it on the
          // New Connection form. Restore this line with the field.
          // email: form.email.trim(),
          phone: form.phone.replace(/[\s+\-()]/g, ''),
          NIC: form.nic.trim().toUpperCase(),
          role: 'Customer',
          title: form.title,
          dob: form.dob,
          gender: form.gender,
          nationality: form.nationality,
          contactNumber: form.contactNumber.trim(),
          addressLine1: form.addressLine1.trim(),
          addressLine2: form.addressLine2.trim(),
          city: form.city.trim(),
          district: form.district,
          postalCode: form.postalCode.trim(),
          preferredContact: form.preferredContact,
          // Identity documents captured in step 2. The API stores these in
          // GridFS and keeps only the file ids on the user record.
          nicFront: form.nicFront,
          nicBack: form.nicBack,
          facePhoto: form.facePhoto
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || 'Registration failed. Please try again.');
      } else {
        // Registered and phone-verified — sign them straight in. A brand new
        // account has no SLT connections yet, so the lookup usually comes back
        // empty and they'll only be offered New Connection.
        let accounts = [];
        try {
          const lookup = await api.post('/customers/lookup', { phoneNumber: normalisedPhone() });
          if (lookup.data?.customerExists && Array.isArray(lookup.data.customers)) {
            accounts = lookup.data.customers;
          }
        } catch (lookupErr) {
          // Non-fatal — they can still apply for a new connection.
        }

        saveSession({
          phone: normalisedPhone(),
          user: data.user || null,
          accountsList: accounts,
          tokens: { accessToken: data.accessToken, refreshToken: data.refreshToken },
        });
        navigate('/', { replace: true });
      }
    } catch {
      setError('Unable to connect to the server. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="signup-root">
      <div className="signup-card">
        
        {/* LEFT SIDEBAR */}
        <div 
          className="signup-sidebar" 
          style={{ 
            backgroundImage: `linear-gradient(160deg, rgba(6, 40, 110, 0.95) 0%, rgba(6, 40, 110, 0.88) 40%, rgba(3, 70, 50, 0.95) 100%), url(${signupBgImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center bottom',
            backgroundRepeat: 'no-repeat'
          }}
        >
          <div className="signup-sidebar-inner">
            <div className="signup-badge">
              <IconLock /> Secure &amp; Trusted
            </div>
            <h1 className="signup-sidebar-title">Create Your Account</h1>
            <p className="signup-sidebar-desc">
              Join SLTMobitel EasyApply and enjoy seamless self-service for connections, relocations and upgrades.
            </p>
            <div className="signup-features">
              <div className="signup-feature-item">
                <div className="signup-feature-icon"><IconShield /></div>
                <div>
                  <p className="signup-feature-title">100% Secure Process</p>
                  <p>Your data is safe with us</p>
                </div>
              </div>
              <div className="signup-feature-item">
                <div className="signup-feature-icon"><IconZap /></div>
                <div>
                  <p className="signup-feature-title">Instant Verification</p>
                  <p>Quick and easy account setup</p>
                </div>
              </div>
              <div className="signup-feature-item">
                <div className="signup-feature-icon"><IconHeadphones /></div>
                <div>
                  <p className="signup-feature-title">24/7 Support</p>
                  <p>We're here to help you anytime</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT SIDE (Form) */}
        <div className="signup-form-section">
          
          {/* Stepper Header */}
          <div className="signup-stepper">
            {[
              { n: 1, label: 'Account Details' },
              { n: 2, label: 'Identity' },
              { n: 3, label: 'Personal Details' },
              { n: 4, label: 'Address Details' },
            ].map(({ n, label }) => (
              <React.Fragment key={n}>
                {n > 1 && <div className={`signup-step-line ${step >= n ? 'active-line' : ''}`}></div>}
                <div className={`signup-step ${step >= n ? 'active' : ''}`}>
                  <div className="signup-step-num">{n}</div>
                  <span>{label}</span>
                </div>
              </React.Fragment>
            ))}
          </div>

          <div className="signup-form-header">
            <div className="signup-form-header-icon">
              {step === 1 && <IconUser />}
              {step === 2 && <IconCard />}
              {step === 3 && <IconUser />}
              {step === 4 && <IconMapPin />}
            </div>
            <div>
              <h2>{
                step === 1 ? 'Account Information'
                : step === 2 ? 'Identity Verification'
                : step === 3 ? 'Personal Information'
                : 'Address Information'
              }</h2>
              <p>
                {step === 1 ? 'Please fill in your details to create your account'
                 : step === 2 ? 'Upload or photograph your NIC and a headshot'
                 : step === 3 ? 'Please provide your personal details'
                 : 'Please provide your address details'}
              </p>
            </div>
          </div>

          <div role="alert" aria-live="assertive">{error && <div className="signup-error">{error}</div>}</div>

          <form onSubmit={handleSubmit} noValidate className="signup-form">
            
            {/* STEP 1 FIELDS */}
            {step === 1 && (
              <>
                {/* EMAIL ADDRESS — TEMPORARILY REMOVED FROM REGISTRATION.
                    SLT asked for the email field to come out of sign-up for now; the
                    address is collected on the New Connection form instead. The BRD
                    still requires it, so the markup is commented out below rather than
                    deleted. While it is out this two-column row holds only the phone
                    field, so it is forced to a single column — drop the style prop
                    when the email field is restored. */}
                <div className="signup-row" style={{ gridTemplateColumns: '1fr' }}>
                  <div className="signup-field">
                    <label className="signup-label" htmlFor="signup-phone">
                      Mobile Number <span className="signup-required" aria-hidden="true">*</span>
                    </label>
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'stretch' }}>
                      <div className={`signup-input-wrap ${fieldErrors.phone ? 'has-error' : ''}`} style={{ flex: 1 }}>
                        <span className="signup-input-icon" aria-hidden="true"><IconPhone /></span>
                        <span className="signup-input-prefix" aria-hidden="true">+94</span>
                        <input
                          id="signup-phone"
                          name="phone"
                          type="tel"
                          required
                          inputMode="numeric"
                          autoComplete="tel-national"
                          className="signup-input"
                          placeholder="77 123 4567"
                          value={form.phone}
                          onChange={set('phone')}
                          maxLength="10"
                          readOnly={phoneVerified}
                          aria-invalid={!!fieldErrors.phone}
                          aria-describedby={fieldErrors.phone ? 'signup-phone-error' : 'signup-phone-help'}
                        />
                      </div>
                      {phoneVerified ? (
                        <span className="auth-verified-badge">
                          <FiCheck size={15} aria-hidden="true" /> Verified
                        </span>
                      ) : (
                        <button
                          type="button"
                          ref={verifyBtnRef}
                          className="auth-verify-btn"
                          onClick={sendOtp}
                          disabled={sendingOtp}
                          aria-busy={sendingOtp}
                        >
                          {sendingOtp ? 'Sending…' : 'Verify'}
                        </button>
                      )}
                    </div>
                    {fieldErrors.phone
                      ? <p className="signup-field-error" id="signup-phone-error">{fieldErrors.phone}</p>
                      : <p className="signup-field-help" id="signup-phone-help">
                          {phoneVerified
                            ? 'Mobile number confirmed.'
                            : "Select Verify to receive a 6-digit code. We'll use this number for important updates."}
                        </p>}
                  </div>

                  {/* ────────────────────────────────────────────────────────────
                      EMAIL ADDRESS FIELD — TEMPORARILY REMOVED (see the note above).
                      Two variants are kept here: (A) the plain field as it stood
                      before this change, and (B) the same field with inline email
                      verification, which the BRD asks for. Restore A to bring the
                      field back, or B to bring back verification as well — B also
                      needs the four EMAIL VERIFICATION blocks near the top of this
                      file, the email checks in validateStep1, and the email key in
                      the register payload.

                      (A) plain email field
                      <div className="signup-field">
                        <label className="signup-label" htmlFor="signup-email">
                          Email Address <span className="signup-required" aria-hidden="true">*</span>
                        </label>
                        <div className={`signup-input-wrap ${fieldErrors.email ? 'has-error' : ''}`}>
                          <span className="signup-input-icon" aria-hidden="true"><IconMail /></span>
                          <input
                            type="email"
                            className="signup-input"
                            placeholder="example@email.com"
                            id="signup-email"
                            autoComplete="email"
                            value={form.email}
                            onChange={set('email')}
                            aria-invalid={!!fieldErrors.email}
                            aria-describedby={fieldErrors.email ? 'signup-email-error' : undefined}
                          />
                        </div>
                        {fieldErrors.email && <p className="signup-field-error" id="signup-email-error">{fieldErrors.email}</p>}
                      </div>

                      (B) email field with inline verification
                      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'stretch' }}>
                        <div className={`signup-input-wrap ${fieldErrors.email ? 'has-error' : ''}`} style={{ flex: 1 }}>
                          <span className="signup-input-icon" aria-hidden="true"><IconMail /></span>
                          <input type="email" className="signup-input" placeholder="example@email.com" id="signup-email"
                            autoComplete="email" value={form.email} onChange={set('email')} readOnly={emailVerified} />
                        </div>
                        {emailVerified ? (
                          <span className="auth-verified-badge"><FiCheck size={15} aria-hidden="true" /> Verified</span>
                        ) : (
                          <button type="button" ref={verifyEmailBtnRef} className="auth-verify-btn"
                            onClick={sendEmailOtp} disabled={sendingEmailOtp} aria-busy={sendingEmailOtp}>
                            {sendingEmailOtp ? 'Sending…' : 'Verify'}
                          </button>
                        )}
                      </div>
                      <p className="signup-field-help" id="signup-email-help">
                        {emailVerified ? 'Email address confirmed.' : 'Select Verify to receive a 6-digit code at this address.'}
                      </p>
                      ──────────────────────────────────────────────────────────── */}
                </div>
                
              </>
            )}

            {/* STEP 2 FIELDS */}
            {step === 2 && (
              <>
                <p style={{ margin: '0 0 1.25rem 0', fontSize: '0.88rem', color: '#475569' }}>
                  We need to see your NIC and a photo of you to confirm your identity.
                  Capturing them now means you won't be asked again when you apply for a service.
                </p>

                <IdentityCaptureField
                  label="NIC — Front Side"
                  variant="document"
                  required
                  value={form.nicFront}
                  error={fieldErrors.nicFront}
                  onChange={(v) => { setForm(f => ({ ...f, nicFront: v })); setFieldErrors(fe => ({ ...fe, nicFront: undefined })); }}
                  instructions={[
                    'Place the front of your NIC on a flat, dark surface',
                    'Make sure all four corners are inside the frame',
                    'Avoid glare — the photo and number must be readable',
                  ]}
                  helpText="Use the back camera for the clearest result."
                />

                <IdentityCaptureField
                  label="NIC — Back Side"
                  variant="document"
                  required
                  value={form.nicBack}
                  error={fieldErrors.nicBack}
                  onChange={(v) => { setForm(f => ({ ...f, nicBack: v })); setFieldErrors(fe => ({ ...fe, nicBack: undefined })); }}
                  instructions={[
                    'Turn the card over and capture the reverse side',
                    'Keep the whole card inside the frame',
                  ]}
                />

                <IdentityCaptureField
                  label="Your Photo (Headshot)"
                  variant="face"
                  required
                  value={form.facePhoto}
                  error={fieldErrors.facePhoto}
                  onChange={(v) => { setForm(f => ({ ...f, facePhoto: v })); setFieldErrors(fe => ({ ...fe, facePhoto: undefined })); }}
                  instructions={[
                    'Look straight at the camera in good, even lighting',
                    'Centre your face in the oval and fill the frame',
                    'No hat, sunglasses or face covering — prescription glasses are fine',
                  ]}
                  helpText="We check this against your NIC photo."
                />
              </>
            )}

            {step === 3 && (
              <>
                <div className="signup-row">
                  <div className="signup-field">
                    <label className="signup-label" htmlFor="signup-title">Title <span className="signup-required" aria-hidden="true">*</span></label>
                    <div className={`signup-input-wrap ${fieldErrors.title ? 'has-error' : ''}`}>
                      <span className="signup-input-icon"><IconUser /></span>
                      <select className="signup-input signup-select" id="signup-title" value={form.title} onChange={set('title')}>
                        <option value="Mr.">Mr.</option>
                        <option value="Mrs.">Mrs.</option>
                        <option value="Ms.">Ms.</option>
                        <option value="Dr.">Dr.</option>
                        <option value="Rev.">Rev.</option>
                      </select>
                    </div>
                    {fieldErrors.title && <p className="signup-field-error">{fieldErrors.title}</p>}
                  </div>
                  <div className="signup-field">
                    <label className="signup-label" htmlFor="signup-dob">Date of Birth <span className="signup-required" aria-hidden="true">*</span></label>
                    <div className={`signup-input-wrap ${fieldErrors.dob ? 'has-error' : ''}`}>
                      <span className="signup-input-icon"><IconCalendar /></span>
                      <input type="date" className="signup-input" id="signup-dob" value={form.dob} onChange={set('dob')} />
                    </div>
                    {fieldErrors.dob && <p className="signup-field-error">{fieldErrors.dob}</p>}
                  </div>
                </div>

                <div className="signup-row">
                  <div className="signup-field">
                    <label className="signup-label" htmlFor="signup-fullname">Full Name (As per NIC/Passport) <span className="signup-required" aria-hidden="true">*</span></label>
                    <div className={`signup-input-wrap ${fieldErrors.fullName ? 'has-error' : ''}`}>
                      <span className="signup-input-icon"><IconUser /></span>
                      <input type="text" className="signup-input" placeholder="John Michael Perera" id="signup-fullname" value={form.fullName} onChange={set('fullName')} />
                    </div>
                    {fieldErrors.fullName && <p className="signup-field-error">{fieldErrors.fullName}</p>}
                  </div>
                  <div className="signup-field">
                    <span className="signup-label" id="signup-gender-label">Gender <span className="signup-required" aria-hidden="true">*</span></span>
                    <div className="signup-radio-group" role="radiogroup" aria-labelledby="signup-gender-label">
                      <label className="signup-radio-label">
                        <input type="radio" name="gender" value="Male" checked={form.gender === 'Male'} onChange={set('gender')} /> Male
                      </label>
                      <label className="signup-radio-label">
                        <input type="radio" name="gender" value="Female" checked={form.gender === 'Female'} onChange={set('gender')} /> Female
                      </label>
                      <label className="signup-radio-label">
                        <input type="radio" name="gender" value="Other" checked={form.gender === 'Other'} onChange={set('gender')} /> Other
                      </label>
                    </div>
                    {fieldErrors.gender && <p className="signup-field-error">{fieldErrors.gender}</p>}
                  </div>
                </div>

                <div className="signup-row">
                  <div className="signup-field">
                    <label className="signup-label" htmlFor="signup-nic">NIC / Passport / BR Number <span className="signup-required" aria-hidden="true">*</span></label>
                    <div className={`signup-input-wrap ${fieldErrors.nic ? 'has-error' : ''}`}>
                      <span className="signup-input-icon"><IconCard /></span>
                      <input type="text" className="signup-input" placeholder="e.g. 199012345678" id="signup-nic" value={form.nic} onChange={set('nic')} maxLength="12" />
                    </div>
                    {fieldErrors.nic ? <p className="signup-field-error">{fieldErrors.nic}</p> : <p className="signup-field-help">Enter your National Identity Card, Passport or Birth Registration number</p>}
                  </div>
                  <div className="signup-field">
                    <label className="signup-label" htmlFor="signup-nationality">Nationality <span className="signup-required" aria-hidden="true">*</span></label>
                    <div className={`signup-input-wrap ${fieldErrors.nationality ? 'has-error' : ''}`}>
                      <span className="signup-input-icon"><IconGlobe /></span>
                      <select className="signup-input signup-select" id="signup-nationality" value={form.nationality} onChange={set('nationality')}>
                        <option value="Sri Lankan">Sri Lankan</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    {fieldErrors.nationality && <p className="signup-field-error">{fieldErrors.nationality}</p>}
                  </div>
                </div>

                <div className="signup-row">
                  <div className="signup-field">
                    <label className="signup-label" htmlFor="signup-contact">Contact Number (Optional)</label>
                    <div className="signup-input-wrap">
                      <span className="signup-input-icon"><IconPhone /></span>
                      <input type="tel" className="signup-input" placeholder="011 2 345 678" id="signup-contact" value={form.contactNumber} onChange={set('contactNumber')} maxLength="10" />
                    </div>
                  </div>
                  <div></div>
                </div>
              </>
            )}

            {/* STEP 3 FIELDS */}
            {step === 4 && (
              <>
                <div className="signup-row">
                  <div className="signup-field">
                    <label className="signup-label" htmlFor="signup-address1">Address Line 1 <span className="signup-required" aria-hidden="true">*</span></label>
                    <div className={`signup-input-wrap ${fieldErrors.addressLine1 ? 'has-error' : ''}`}>
                      <span className="signup-input-icon"><IconMapPin /></span>
                      <input type="text" className="signup-input" placeholder="123, Galle Road" id="signup-address1" value={form.addressLine1} onChange={set('addressLine1')} />
                    </div>
                    {fieldErrors.addressLine1 && <p className="signup-field-error">{fieldErrors.addressLine1}</p>}
                  </div>
                  <div className="signup-field">
                    <label className="signup-label" htmlFor="signup-address2">Address Line 2 (Optional)</label>
                    <div className="signup-input-wrap">
                      <input type="text" className="signup-input" style={{ paddingLeft: '1rem' }} placeholder="Colombo 03" id="signup-address2" value={form.addressLine2} onChange={set('addressLine2')} />
                    </div>
                  </div>
                </div>

                <div className="signup-row">
                  <div className="signup-field">
                    <label className="signup-label" htmlFor="signup-city">City <span className="signup-required" aria-hidden="true">*</span></label>
                    <div className={`signup-input-wrap ${fieldErrors.city ? 'has-error' : ''}`}>
                      <span className="signup-input-icon"><IconBuilding /></span>
                      <input type="text" className="signup-input" placeholder="Colombo" id="signup-city" value={form.city} onChange={set('city')} />
                    </div>
                    {fieldErrors.city && <p className="signup-field-error">{fieldErrors.city}</p>}
                  </div>
                  <div className="signup-field">
                    <label className="signup-label" htmlFor="signup-district">District <span className="signup-required" aria-hidden="true">*</span></label>
                    <div className={`signup-input-wrap ${fieldErrors.district ? 'has-error' : ''}`}>
                      <span className="signup-input-icon"><IconBuilding /></span>
                      <select className="signup-input signup-select" id="signup-district" value={form.district} onChange={set('district')}>
                        <option value="Ampara">Ampara</option>
                        <option value="Anuradhapura">Anuradhapura</option>
                        <option value="Badulla">Badulla</option>
                        <option value="Batticaloa">Batticaloa</option>
                        <option value="Colombo">Colombo</option>
                        <option value="Galle">Galle</option>
                        <option value="Gampaha">Gampaha</option>
                        <option value="Hambantota">Hambantota</option>
                        <option value="Jaffna">Jaffna</option>
                        <option value="Kalutara">Kalutara</option>
                        <option value="Kandy">Kandy</option>
                        <option value="Kegalle">Kegalle</option>
                        <option value="Kilinochchi">Kilinochchi</option>
                        <option value="Kurunegala">Kurunegala</option>
                        <option value="Mannar">Mannar</option>
                        <option value="Matale">Matale</option>
                        <option value="Matara">Matara</option>
                        <option value="Monaragala">Monaragala</option>
                        <option value="Mullaitivu">Mullaitivu</option>
                        <option value="Nuwara Eliya">Nuwara Eliya</option>
                        <option value="Polonnaruwa">Polonnaruwa</option>
                        <option value="Puttalam">Puttalam</option>
                        <option value="Ratnapura">Ratnapura</option>
                        <option value="Trincomalee">Trincomalee</option>
                        <option value="Vavuniya">Vavuniya</option>
                      </select>
                    </div>
                    {fieldErrors.district && <p className="signup-field-error">{fieldErrors.district}</p>}
                  </div>
                </div>

                <div className="signup-row">
                  <div className="signup-field">
                    <label className="signup-label" htmlFor="signup-postal">Postal Code <span className="signup-required" aria-hidden="true">*</span></label>
                    <div className={`signup-input-wrap ${fieldErrors.postalCode ? 'has-error' : ''}`}>
                      <span className="signup-input-icon"><IconBuilding /></span>
                      <input type="text" className="signup-input" placeholder="00300" id="signup-postal" value={form.postalCode} onChange={set('postalCode')} />
                    </div>
                    {fieldErrors.postalCode && <p className="signup-field-error">{fieldErrors.postalCode}</p>}
                  </div>
                  <div className="signup-field">
                    <span className="signup-label" id="signup-contact-label">Preferred Contact Method <span className="signup-required" aria-hidden="true">*</span></span>
                    <div className="signup-contact-methods" role="radiogroup" aria-labelledby="signup-contact-label">
                      {[
                        { value: 'Email', Icon: IconMail },
                        { value: 'SMS', Icon: IconPhone },
                        { value: 'Call', Icon: IconPhone },
                      ].map(({ value, Icon }) => (
                        <button
                          key={value}
                          type="button"
                          role="radio"
                          aria-checked={form.preferredContact === value}
                          className={`signup-contact-method ${form.preferredContact === value ? 'active' : ''}`}
                          onClick={() => setForm({ ...form, preferredContact: value })}
                        >
                          <Icon aria-hidden="true" /> {value}
                        </button>
                      ))}
                    </div>
                    {fieldErrors.preferredContact && <p className="signup-field-error">{fieldErrors.preferredContact}</p>}
                  </div>
                </div>

                <div className="signup-secure-box">
                  <div className="signup-secure-icon">
                    <IconShield />
                  </div>
                  <div>
                    <p className="signup-secure-title">Your Information is Secure</p>
                    <p>We use industry-standard encryption to protect your personal data.<br/>Your information will only be used to provide you with our services.</p>
                  </div>
                </div>
              </>
            )}

            {/* BUTTONS */}
            <div className="signup-action-row">
              {step === 1 ? (
                <>
                  <button type="button" className="signup-btn-secondary" onClick={() => navigate(-1)}>Cancel</button>
                  <button type="submit" className="signup-btn">
                    Continue <IconArrowRight />
                  </button>
                </>
              ) : (
                <>
                  <button type="button" className="signup-btn-secondary" onClick={prevStep}>
                    <IconArrowLeft /> Back
                  </button>
                  <button type="submit" className={`signup-btn ${loading ? 'loading' : ''}`} disabled={loading}>
                    {loading ? <div className="signup-spinner" /> : (step === TOTAL_STEPS ? 'Create Account' : 'Continue')}
                    {!loading && <IconArrowRight />}
                  </button>
                </>
              )}
            </div>
            
            {step === 1 && (
              <p className="signup-footer-text">
                Already have an account? <Link to="/login" className="signup-link signup-link--accent">Sign In</Link>
              </p>
            )}
          </form>
        </div>
      </div>

      {/* EMAIL VERIFICATION — TEMPORARILY DISABLED (see banner near the top).
          The dialog below is intact and only needs uncommenting. */}
      {/*
            {emailModalOpen && (
        <div className="otp-overlay" onClick={() => setEmailModalOpen(false)}>
          <div
            className="otp-dialog"
            ref={emailModalRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="email-otp-title"
            aria-describedby="email-otp-desc"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setEmailModalOpen(false)}
              style={{ position: 'absolute', top: '0.6rem', right: '0.6rem', background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '40px', height: '40px', borderRadius: '8px' }}
              aria-label="Close verification dialog"
            >
              <FiX size={20} aria-hidden="true" />
            </button>

            <div style={{ backgroundColor: '#eff6ff', color: '#0b4a91', width: '54px', height: '54px', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem auto' }}>
              <IconMail />
            </div>

            <h3 id="email-otp-title" style={{ fontSize: '1.25rem', fontWeight: 900, color: '#0f172a', margin: '0 0 0.3rem 0' }}>
              Verify Your Email Address
            </h3>
            <p id="email-otp-desc" style={{ fontSize: '0.85rem', color: '#5b6472', marginBottom: '1.5rem', fontWeight: 500 }}>
              Enter the 6-digit code sent to <strong style={{ color: '#0f172a' }}>{form.email}</strong>
            </p>

            <div role="group" aria-labelledby="email-otp-desc" className="otp-boxes" style={{ justifyContent: 'center', marginBottom: '1rem' }}>
              {emailOtp.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => { emailOtpRefs.current[index] = el; }}
                  type="text"
                  inputMode="numeric"
                  autoComplete={index === 0 ? 'one-time-code' : 'off'}
                  maxLength={1}
                  value={digit}
                  disabled={verifyingEmailOtp}
                  aria-label={`Email verification code digit ${index + 1} of 6`}
                  aria-invalid={!!emailOtpError}
                  onChange={(e) => handleEmailOtpChange(index, e.target.value)}
                  onKeyDown={(e) => handleEmailOtpKeyDown(index, e)}
                  className={`otp-box ${digit ? 'is-filled' : ''} ${emailOtpError ? 'is-error' : ''}`}
                  style={{ flex: '0 0 44px', width: '44px' }}
                />
              ))}
            </div>

            <div role="alert" aria-live="assertive">
              {emailOtpError && (
                <p style={{ color: '#b91c1c', fontSize: '0.82rem', marginBottom: '1rem', fontWeight: 700 }}>{emailOtpError}</p>
              )}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
              {emailResendIn > 0 ? (
                <span style={{ fontSize: '0.8rem', color: '#5b6472', fontWeight: 600 }} aria-live="polite">
                  Resend code in <strong style={{ color: '#0f172a' }}>{emailResendIn}s</strong>
                </span>
              ) : (
                <button type="button" className="auth-link-btn" onClick={handleResendEmailOtp} disabled={verifyingEmailOtp}>
                  <FiRefreshCw size={13} aria-hidden="true" />
                  <span>Resend Code</span>
                </button>
              )}

              {import.meta.env.DEV && (
                <p className="auth-dev-hint" style={{ margin: 0 }}>
                  Email delivery is not wired up yet — use code <strong>000000</strong>.
                </p>
              )}
            </div>
          </div>
        </div>
      )}
      */}

      {/* OTP Verification Modal — blurs everything behind it */}
      {otpModalOpen && (
        <div className="otp-overlay" onClick={() => setOtpModalOpen(false)}>
            <div
              className="otp-dialog"
              onClick={(e) => e.stopPropagation()}
              ref={modalRef}
              role="dialog"
              aria-modal="true"
              aria-labelledby="otp-dialog-title"
              aria-describedby="otp-dialog-desc"
            >
              <button
                type="button"
                onClick={() => setOtpModalOpen(false)}
                style={{ position: 'absolute', top: '0.6rem', right: '0.6rem', background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '40px', height: '40px', borderRadius: '12px' }}
                aria-label="Close verification dialog"
              >
                <FiX size={20} aria-hidden="true" />
              </button>

              <div
                style={{
                  backgroundColor: '#dcfce7',
                  color: '#16a34a',
                  width: '54px',
                  height: '54px',
                  borderRadius: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1.25rem auto',
                }}
              >
                <FiShield size={26} aria-hidden="true" />
              </div>

              <h3 id="otp-dialog-title" style={{ fontSize: '1.25rem', fontWeight: 900, color: '#0f172a', margin: '0 0 0.3rem 0' }}>
                Verify Your Mobile Number
              </h3>
              <p id="otp-dialog-desc" style={{ fontSize: '0.85rem', color: '#5b6472', marginBottom: '1.5rem', fontWeight: 500 }}>
                Enter the 6-digit code sent to <strong style={{ color: '#0f172a' }}>+94 {normalisedPhone()}</strong>
              </p>

              <div
                role="group"
                aria-labelledby="otp-dialog-desc"
                className="otp-boxes"
                style={{ justifyContent: 'center', marginBottom: '1rem' }}
              >
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => { otpRefs.current[index] = el; }}
                    type="text"
                    inputMode="numeric"
                    autoComplete={index === 0 ? 'one-time-code' : 'off'}
                    maxLength={1}
                    value={digit}
                    disabled={verifyingOtp}
                    aria-label={`Verification code digit ${index + 1} of 6`}
                    aria-invalid={!!otpError}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(index, e)}
                    className={`otp-box ${digit ? 'is-filled' : ''} ${otpError ? 'is-error' : ''}`}
                    style={{ flex: '0 0 44px', width: '44px' }}
                  />
                ))}
              </div>

              <div role="alert" aria-live="assertive">
                {otpError && (
                  <p style={{ color: '#b91c1c', fontSize: '0.82rem', marginBottom: '1rem', fontWeight: 700 }}>
                    {otpError}
                  </p>
                )}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
                {resendIn > 0 ? (
                  <span style={{ fontSize: '0.8rem', color: '#5b6472', fontWeight: 600 }} aria-live="polite">
                    Resend code in <strong style={{ color: '#0f172a' }}>{resendIn}s</strong>
                  </span>
                ) : (
                  <button type="button" className="auth-link-btn" onClick={handleResendOtp} disabled={verifyingOtp}>
                    <FiRefreshCw size={13} aria-hidden="true" />
                    <span>Resend Code</span>
                  </button>
                )}

                {import.meta.env.DEV && (
                  <p className="auth-dev-hint" style={{ margin: 0 }}>
                    Development only — demo code <strong>000000</strong> is accepted.
                  </p>
                )}
              </div>
            </div>
        </div>
      )}
    </div>
  );
}
