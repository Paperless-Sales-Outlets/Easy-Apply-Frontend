import React, { useMemo, useState } from 'react';
import { createSalesOfficer, createOrGetOfficerQr } from '../../../services/salesOfficerService';
import { EMPLOYEE_NUMBER_LENGTH, EMPLOYEE_NUMBER_HINT, employeeNumberError, normalizeEmployeeNumberInput } from '../utils/employeeNumber';

// Creates a Sales Officer profile from their 6-digit employee number, inside the
// QR Management module. Uses the same look and validation behaviour as User
// Management's Add User form (errors appear when a field is left, then live).

const EMAIL_DOMAIN = 'slt.com.lk';
const EMAIL_PATTERN = new RegExp(`^[a-zA-Z0-9._%+-]+@${EMAIL_DOMAIN.replace(/\./g, '\\.')}$`, 'i');
const NAME_PATTERN = /^[\p{L}][\p{L}\s.'-]*$/u;
const FIELDS = ['employeeNumber', 'name', 'email', 'password', 'confirmPassword'];
const EMPTY = { employeeNumber: '', name: '', email: '', password: '', confirmPassword: '' };

const sameText = (a, b) => String(a || '').trim().toLowerCase() === String(b || '').trim().toLowerCase();

function validate(form, officers) {
  const errors = {};
  const emp = form.employeeNumber.trim();
  const name = form.name.trim();
  const email = form.email.trim();

  const empError = employeeNumberError(emp);
  if (empError) errors.employeeNumber = empError;
  else if (officers.some((o) => sameText(o.employeeNumber, emp))) errors.employeeNumber = 'A sales officer with this employee number already exists.';

  if (!name) errors.name = 'Full name is required.';
  else if (name.length < 2) errors.name = 'Full name must be at least 2 characters.';
  else if (name.length > 60) errors.name = 'Full name must be 60 characters or fewer.';
  else if (!NAME_PATTERN.test(name)) errors.name = 'Use letters, spaces, apostrophes, hyphens or full stops only.';

  if (!email) errors.email = 'Email address is required.';
  else if (!EMAIL_PATTERN.test(email)) errors.email = `Must be a valid ${EMAIL_DOMAIN} address, e.g. name@${EMAIL_DOMAIN}.`;
  else if (officers.some((o) => sameText(o.email, email))) errors.email = 'Another sales officer already uses this email address.';

  if (!form.password) errors.password = 'Password is required.';
  else if (form.password.length < 6) errors.password = 'Password must be at least 6 characters.';
  else if (/\s/.test(form.password)) errors.password = 'Password cannot contain spaces.';

  if (!form.confirmPassword) errors.confirmPassword = 'Please confirm the password.';
  else if (form.password !== form.confirmPassword) errors.confirmPassword = 'Passwords do not match.';

  return errors;
}

function generatePassword() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%';
  let out = '';
  for (let i = 0; i < 10; i += 1) out += chars[Math.floor(Math.random() * chars.length)];
  return out;
}

const initials = (name) => (name || '').split(' ').filter(Boolean).map((n) => n[0]).slice(0, 2).join('').toUpperCase();

const EyeIcon = ({ open }) => (open ? (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
    <line x1="1" y1="1" x2="23" y2="23" />
  </svg>
) : (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8Z" /><circle cx="12" cy="12" r="3" />
  </svg>
));

function FieldError({ id, message }) {
  if (!message) return null;
  return <span id={id} className="um-field-error" role="alert">{message}</span>;
}

/**
 * @param {object[]} officers   existing officers (for instant duplicate checks)
 * @param {Function} onClose
 * @param {Function} onCreated  (officer, { qrError }) — officer includes `qr` when one was generated
 */
export default function AddSalesOfficerModal({ officers = [], onClose, onCreated }) {
  const [form, setForm] = useState(EMPTY);
  const [touched, setTouched] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [generateQr, setGenerateQr] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  const errors = useMemo(() => validate(form, officers), [form, officers]);

  const field = (key) => {
    const error = touched[key] ? errors[key] : undefined;
    const valid = !!touched[key] && !errors[key] && String(form[key] ?? '').length > 0;
    const errorId = `so-add-${key}-error`;
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
  const f = Object.fromEntries(FIELDS.map((k) => [k, field(k)]));
  const set = (key) => (e) => setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const close = () => { if (!saving) onClose(); };

  const handleGeneratePassword = () => {
    const pwd = generatePassword();
    setForm((prev) => ({ ...prev, password: pwd, confirmPassword: pwd }));
    setTouched((t) => ({ ...t, password: true, confirmPassword: true }));
    setShowPassword(true);
    setShowConfirm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setSubmitted(true);
    setTouched(Object.fromEntries(FIELDS.map((k) => [k, true])));
    if (Object.keys(errors).length > 0) return;

    setSaving(true);
    try {
      const res = await createSalesOfficer({
        employeeNumber: form.employeeNumber.trim(),
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
      });
      let officer = res.salesOfficer;
      let qrError = '';
      if (generateQr) {
        try {
          const qrRes = await createOrGetOfficerQr(officer.employeeNumber, { regenerate: false });
          officer = { ...officer, qr: { hasQr: true, ...qrRes.qr } };
        } catch (err) {
          qrError = err.response?.data?.message || 'The QR code could not be generated — use Generate QR on the list.';
        }
      }
      onCreated(officer, { qrError });
    } catch (err) {
      setFormError(err.response?.data?.message || 'Could not create the sales officer.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="admin-modal-overlay" onClick={close}>
      <div className="admin-modal um-modal um-user-modal" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-labelledby="so-add-title">
        <div className="admin-modal-header um-modal-header">
          <div className="um-modal-header-identity">
            <div className="um-modal-avatar" style={{ background: 'linear-gradient(135deg, #0b4a91, #003b73)' }}>
              {initials(form.name) || '?'}
            </div>
            <div>
              <h3 id="so-add-title">Add Sales Officer</h3>
              <div className="admin-modal-subtitle">Create a sales officer profile from their employee number</div>
            </div>
          </div>
          <button type="button" className="admin-modal-close" onClick={close} aria-label="Close">×</button>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <div className="admin-modal-body">
            {submitted && Object.keys(errors).length > 0 && (
              <div className="admin-error-banner" role="alert" style={{ marginBottom: '1rem' }}>Please fix the highlighted fields before continuing.</div>
            )}
            {formError && <div className="admin-error-banner" role="alert" style={{ marginBottom: '1rem' }}>{formError}</div>}

            <div className="um-form-grid um-form-vertical">
              <label className="um-field">
                <span>Employee Number *</span>
                <div className="um-input-icon-wrap">
                  <span className="um-input-icon-glyph">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="4" width="18" height="16" rx="2" /><path d="M7 8h10M7 12h6M3 16h18" />
                    </svg>
                  </span>
                  <input
                    type="text"
                    className={`um-input um-input-icon${f.employeeNumber.cls}`}
                    {...f.employeeNumber.props}
                    value={form.employeeNumber}
                    maxLength={EMPLOYEE_NUMBER_LENGTH}
                    inputMode="numeric"
                    autoComplete="off"
                    autoFocus
                    onChange={(e) => setForm((prev) => ({ ...prev, employeeNumber: normalizeEmployeeNumberInput(e.target.value) }))}
                    placeholder="e.g. 099885"
                  />
                </div>
                {f.employeeNumber.error
                  ? <FieldError id={f.employeeNumber.errorId} message={f.employeeNumber.error} />
                  : <span className="um-field-hint">{EMPLOYEE_NUMBER_HINT}. The QR code and every attributed sale are recorded under this number.</span>}
              </label>

              <label className="um-field">
                <span>Full Name *</span>
                <div className="um-input-icon-wrap">
                  <span className="um-input-icon-glyph">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
                    </svg>
                  </span>
                  <input
                    type="text"
                    className={`um-input um-input-icon${f.name.cls}`}
                    {...f.name.props}
                    value={form.name}
                    maxLength={60}
                    autoComplete="off"
                    onChange={set('name')}
                    placeholder="e.g. Kasun Perera"
                  />
                </div>
                <FieldError id={f.name.errorId} message={f.name.error} />
              </label>

              <label className="um-field">
                <span>Email Address *</span>
                <div className="um-input-icon-wrap">
                  <span className="um-input-icon-glyph">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="2" y="4" width="20" height="16" rx="2" /><path d="m22 6-10 7L2 6" />
                    </svg>
                  </span>
                  <input
                    type="email"
                    className={`um-input um-input-icon${f.email.cls}`}
                    {...f.email.props}
                    value={form.email}
                    autoComplete="off"
                    onChange={set('email')}
                    placeholder={`name@${EMAIL_DOMAIN}`}
                  />
                </div>
                <FieldError id={f.email.errorId} message={f.email.error} />
              </label>

              <label className="um-field">
                <span>Password *</span>
                <div className="um-input-icon-wrap">
                  <span className="um-input-icon-glyph">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </svg>
                  </span>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className={`um-input um-input-icon um-input-icon-both${f.password.cls}`}
                    {...f.password.props}
                    value={form.password}
                    autoComplete="new-password"
                    onChange={set('password')}
                    placeholder="Minimum 6 characters"
                  />
                  <button type="button" className="um-eye-btn" onClick={() => setShowPassword((s) => !s)} aria-label={showPassword ? 'Hide password' : 'Show password'}>
                    <EyeIcon open={showPassword} />
                  </button>
                </div>
                <button type="button" className="um-generate-link" onClick={handleGeneratePassword}>Generate a strong password</button>
                <FieldError id={f.password.errorId} message={f.password.error} />
              </label>

              <label className="um-field">
                <span>Confirm Password *</span>
                <div className="um-input-icon-wrap">
                  <span className="um-input-icon-glyph">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </svg>
                  </span>
                  <input
                    type={showConfirm ? 'text' : 'password'}
                    className={`um-input um-input-icon um-input-icon-both${f.confirmPassword.cls}`}
                    {...f.confirmPassword.props}
                    value={form.confirmPassword}
                    autoComplete="new-password"
                    onChange={set('confirmPassword')}
                    placeholder="Re-enter password"
                  />
                  <button type="button" className="um-eye-btn" onClick={() => setShowConfirm((s) => !s)} aria-label={showConfirm ? 'Hide password' : 'Show password'}>
                    <EyeIcon open={showConfirm} />
                  </button>
                </div>
                <FieldError id={f.confirmPassword.errorId} message={f.confirmPassword.error} />
              </label>

              <label className="um-field" style={{ flexDirection: 'row', alignItems: 'center', gap: '0.6rem', cursor: 'pointer' }}>
                <input type="checkbox" checked={generateQr} onChange={(e) => setGenerateQr(e.target.checked)} style={{ width: 16, height: 16 }} />
                <span style={{ textTransform: 'none', letterSpacing: 0, fontWeight: 600 }}>Generate their QR code now</span>
              </label>
            </div>
          </div>

          <div className="um-modal-footer">
            <button type="button" className="admin-btn ghost" onClick={close} disabled={saving}>Cancel</button>
            <button type="submit" className="admin-btn primary" disabled={saving}>
              {saving ? 'Creating…' : 'Create Sales Officer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
