import React, { useEffect, useMemo, useState } from 'react';
import {
  LEAD_SOURCE_OPTIONS,
  LEAD_STATUS_OPTIONS,
  LEAD_TECHNOLOGY_OPTIONS,
} from '../utils/leadUtils';

const EMPTY_FORM = {
  customerName: '',
  phone: '',
  email: '',
  nic: '',
  address: '',
  district: '',
  landmark: '',
  packageName: '',
  speed: '',
  technology: 'FTTH',
  source: 'portal',
  applicationRef: '',
  status: 'new',
  assignedTo: '',
  notes: '',
};

// A lead has to say who it is for and where it is going before it can be
// triaged — everything else can be filled in later.
function validateForm(form) {
  const errors = {};
  if (!form.customerName.trim()) errors.customerName = 'Customer name is required.';
  if (!form.phone.trim()) errors.phone = 'Contact number is required.';
  else if (!/^[0-9+\-\s()]{7,20}$/.test(form.phone.trim())) errors.phone = 'Enter a valid contact number.';
  if (!form.address.trim()) errors.address = 'Installation address is required.';
  if (form.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
    errors.email = 'Enter a valid email address.';
  }
  return errors;
}

// Creates a lead, or edits the details of an existing one.
export default function LeadFormModal({ lead, staff, onClose, onSave }) {
  const editing = !!lead;
  const [form, setForm] = useState(EMPTY_FORM);
  const [touched, setTouched] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!lead) {
      setForm(EMPTY_FORM);
      return;
    }
    setForm({
      customerName: lead.customerName || '',
      phone: lead.phone || '',
      email: lead.email || '',
      nic: lead.nic || '',
      address: lead.address || '',
      district: lead.district || '',
      landmark: lead.landmark || '',
      packageName: lead.packageName || '',
      speed: lead.speed || '',
      technology: lead.technology || 'FTTH',
      source: lead.source || 'portal',
      applicationRef: lead.applicationRef || '',
      status: lead.status || 'new',
      assignedTo: lead.assignedTo || '',
      notes: lead.notes || '',
    });
  }, [lead]);

  const errors = useMemo(() => validateForm(form), [form]);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));
  const touch = (key) => () => setTouched((t) => (t[key] ? t : { ...t, [key]: true }));

  const fieldClass = (key) => {
    if (!touched[key] && !submitted) return 'um-input';
    return `um-input${errors[key] ? ' invalid' : ' valid'}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitted(true);
    setTouched({ customerName: true, phone: true, address: true, email: true });

    if (Object.keys(errors).length > 0) return;

    setSaving(true);
    try {
      await onSave({
        customerName: form.customerName.trim(),
        phone: form.phone.trim(),
        email: form.email.trim(),
        nic: form.nic.trim(),
        address: form.address.trim(),
        district: form.district.trim(),
        landmark: form.landmark.trim(),
        packageName: form.packageName.trim(),
        speed: form.speed.trim(),
        technology: form.technology,
        source: form.source,
        applicationRef: form.applicationRef.trim(),
        notes: form.notes.trim(),
        ...(editing ? { status: form.status, assignedTo: form.assignedTo || null } : {}),
      });
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to save the lead.');
      setSaving(false);
    }
  };

  return (
    <div className="admin-modal-overlay" onClick={saving ? undefined : onClose}>
      <div className="admin-modal ax-modal um-user-modal lm-modal lm-form-modal" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-labelledby="lm-form-title">
        <div className="ax-modal-head">
          <span className="ax-modal-head-deco" aria-hidden="true" />
          <div className="ax-modal-identity">
            <span className="ax-modal-avatar">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M19 8v6M22 11h-6" />
              </svg>
            </span>
            <div>
              <span className="ax-modal-eyebrow">{editing ? lead.referenceNumber : 'Lead Management'}</span>
              <h3 id="lm-form-title">{editing ? 'Edit Lead' : 'Capture New Lead'}</h3>
              <div className="ax-modal-sub">
                {editing
                  ? 'Update the customer, site or product details'
                  : 'Log a new connection enquiry and open its serviceability checklist'}
              </div>
            </div>
          </div>
          <button type="button" className="ax-modal-close" onClick={onClose} aria-label="Close" disabled={saving}>×</button>
        </div>

        <form onSubmit={handleSubmit} noValidate className="ax-modal-form">
          <div className="ax-modal-body">
            {submitted && Object.keys(errors).length > 0 && (
              <div className="admin-error-banner" role="alert" style={{ marginBottom: '1rem' }}>
                Please fix the highlighted fields before continuing.
              </div>
            )}
            {error && <div className="admin-error-banner" role="alert" style={{ marginBottom: '1rem' }}>{error}</div>}

            <div className="um-form-grid um-form-vertical">
              <span className="um-form-section-label">Customer</span>

              <label className="um-field">
                <span>Customer Name *</span>
                <input
                  type="text"
                  className={fieldClass('customerName')}
                  value={form.customerName}
                  maxLength={80}
                  onBlur={touch('customerName')}
                  onChange={set('customerName')}
                  placeholder="e.g. Kasun Perera"
                />
                {touched.customerName && errors.customerName && (
                  <span className="um-field-error">{errors.customerName}</span>
                )}
              </label>

              <label className="um-field">
                <span>Contact Number *</span>
                <input
                  type="tel"
                  className={fieldClass('phone')}
                  value={form.phone}
                  maxLength={20}
                  onBlur={touch('phone')}
                  onChange={set('phone')}
                  placeholder="e.g. 0771234567"
                />
                {touched.phone && errors.phone && (
                  <span className="um-field-error">{errors.phone}</span>
                )}
              </label>

              <label className="um-field">
                <span>Email Address</span>
                <input
                  type="email"
                  className={fieldClass('email')}
                  value={form.email}
                  onBlur={touch('email')}
                  onChange={set('email')}
                  placeholder="name@example.lk"
                />
                {touched.email && errors.email && (
                  <span className="um-field-error">{errors.email}</span>
                )}
              </label>

              <label className="um-field">
                <span>NIC</span>
                <input
                  type="text"
                  className="um-input"
                  value={form.nic}
                  maxLength={20}
                  onChange={set('nic')}
                  placeholder="Optional"
                />
              </label>

              <span className="um-form-section-label">Installation site</span>

              <label className="um-field">
                <span>Installation Address *</span>
                <input
                  type="text"
                  className={fieldClass('address')}
                  value={form.address}
                  maxLength={200}
                  onBlur={touch('address')}
                  onChange={set('address')}
                  placeholder="House number, street"
                />
                {touched.address && errors.address && (
                  <span className="um-field-error">{errors.address}</span>
                )}
              </label>

              <label className="um-field">
                <span>District</span>
                <input
                  type="text"
                  className="um-input"
                  value={form.district}
                  maxLength={60}
                  onChange={set('district')}
                  placeholder="e.g. Colombo"
                />
              </label>

              <label className="um-field">
                <span>Landmark</span>
                <input
                  type="text"
                  className="um-input"
                  value={form.landmark}
                  maxLength={200}
                  onChange={set('landmark')}
                  placeholder="Helps the technician find the premises"
                />
              </label>

              <span className="um-form-section-label">Product</span>

              <label className="um-field">
                <span>Package</span>
                <input
                  type="text"
                  className="um-input"
                  value={form.packageName}
                  maxLength={120}
                  onChange={set('packageName')}
                  placeholder="e.g. 300 Mbps Fibre Broadband"
                />
              </label>

              <label className="um-field">
                <span>Speed</span>
                <input
                  type="text"
                  className="um-input"
                  value={form.speed}
                  maxLength={40}
                  onChange={set('speed')}
                  placeholder="e.g. 300 Mbps"
                />
              </label>

              <label className="um-field">
                <span>Technology</span>
                <select className="um-input" value={form.technology} onChange={set('technology')}>
                  {LEAD_TECHNOLOGY_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </label>

              <label className="um-field">
                <span>Lead Source</span>
                <select className="um-input" value={form.source} onChange={set('source')}>
                  {LEAD_SOURCE_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </label>

              {editing && (
                <label className="um-field">
                  <span>Status</span>
                  <select className="um-input" value={form.status} onChange={set('status')}>
                    {LEAD_STATUS_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </label>
              )}

              {editing && staff?.length > 0 && (
                <label className="um-field">
                  <span>Site Survey Assigned To</span>
                  <select className="um-input" value={form.assignedTo} onChange={set('assignedTo')}>
                    <option value="">Unassigned</option>
                    {staff.map((member) => (
                      <option key={member.id} value={member.id}>{member.name}</option>
                    ))}
                  </select>
                </label>
              )}

              <label className="um-field">
                <span>Application Reference</span>
                <input
                  type="text"
                  className="um-input"
                  value={form.applicationRef}
                  maxLength={40}
                  onChange={set('applicationRef')}
                  placeholder="Link to an EasyApply submission"
                />
              </label>

              <label className="um-field">
                <span>Notes</span>
                <textarea
                  className="um-textarea"
                  rows={3}
                  value={form.notes}
                  maxLength={2000}
                  onChange={set('notes')}
                  placeholder="Anything the next person should know"
                />
              </label>

              {staff?.length > 0 && !editing && (
                <p className="um-field-hint">
                  A site survey can be assigned once the lead is captured.
                </p>
              )}
            </div>
          </div>

          <div className="ax-modal-foot">
            <button type="button" className="admin-btn ghost" onClick={onClose} disabled={saving}>Cancel</button>
            <button type="submit" className="admin-btn primary ax-btn-brand" disabled={saving}>
              {saving ? 'Saving…' : editing ? 'Save Changes' : 'Capture Lead'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
