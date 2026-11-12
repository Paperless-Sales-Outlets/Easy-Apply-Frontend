import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiUser,
  FiEdit3,
  FiSave,
  FiX,
  FiCreditCard,
  FiFileText,
  FiClock,
  FiCheckCircle,
  FiAlertCircle,
  FiChevronRight,
  FiChevronDown,
  FiEye,
  FiMessageSquare,
  FiDownload,
  FiBox,
  FiStar,
} from 'react-icons/fi';
import { useVerifiedContext } from '../components/verification';
import { getAuthUser, notifyAuthUpdated } from '../../shared/utils/authSession';
import api from '../../shared/utils/api';
import toast from 'react-hot-toast';
import InstallationReviewModal from '../components/InstallationReviewModal';


const SERVICE_TYPE_LABELS = {
  'new-connection': 'New Connection',
};

/**
 * Builds the profile from two sources:
 *   - `account`  the SLT connection, when the customer has one
 *   - `user`     the registered EasyApply account, captured at sign-up
 *
 * A customer who has just registered has no SLT connection yet, so their
 * details come entirely from `user` — without this they'd see an empty page
 * despite having typed everything in during sign-up. Connection data wins
 * where both exist, since SLT's records are authoritative.
 */
function accountToProfile(account, mobileNumber, user) {
  const pick = (...values) => values.find((v) => v !== undefined && v !== null && String(v).trim() !== '') || '';

  const street = pick(
    account?.address,
    account?.addressLine1,
    [user?.addressLine1, user?.addressLine2].filter(Boolean).join(', ')
  );

  return {
    // Identity — verified, not editable here
    fullName: pick(account?.fullName, account?.customerName, account?.nameFull, user?.name, user?.fullName, user?.nameFull),
    nic: pick(account?.nic, user?.NIC, user?.nic),
    dob: pick(account?.dob, user?.dob),
    gender: pick(account?.gender, user?.gender),
    nationality: pick(account?.nationality, user?.nationality, 'Sri Lankan'),
    phone: pick(account?.mobileNumber, account?.phoneNumber, user?.phone, mobileNumber),

    // Contact & address — editable
    email: pick(user?.email, account?.email),
    // Fall back to the verified mobile rather than showing NA — it is a
    // contact number we definitely hold.
    contactNumber: pick(user?.contactNumber, account?.telephone, account?.mobileNumber, user?.phone, mobileNumber),
    address: street,
    addressLine1: pick(account?.addressLine1, user?.addressLine1, account?.address),
    addressLine2: pick(account?.addressLine2, user?.addressLine2),
    city: pick(account?.city, user?.city),
    district: pick(account?.district, user?.district),
    postalCode: pick(account?.postalCode, user?.postalCode),
    preferredContact: pick(user?.preferredContact, 'SMS'),

    // SLT connection — only exists for customers who hold a product
    accountNumber: pick(account?.accountNumber),
    connectionType: pick(account?.serviceType, account?.package),
    packageName: pick(account?.packageName, account?.package),
    registeredDate: account?.registeredDate
      ? new Date(account.registeredDate).toISOString().split('T')[0]
      : '',
  };
}

// Fields the customer may change themselves. Name, NIC, date of birth and the
// OTP-verified mobile number are deliberately excluded: they're identity data,
// and the mobile number is the sign-in credential.
const EDITABLE_FIELDS = [
  'email',
  'contactNumber',
  'addressLine1',
  'addressLine2',
  'city',
  'district',
  'postalCode',
  'preferredContact',
];

/* ── Helpers ──────────────────────────────────────────────────────────────── */
function formatKey(key) {
  const result = key.replace(/([A-Z])/g, " $1");
  return result.charAt(0).toUpperCase() + result.slice(1);
}

const statusConfig = {
  approved: { label: 'Approved', color: '#0f7a4d', bg: '#f1faf1', icon: <FiCheckCircle size={14} /> },
  pending: { label: 'Pending', color: '#93560a', bg: '#fff8e8', icon: <FiClock size={14} /> },
  rejected: { label: 'Rejected', color: '#b42318', bg: '#fef3f2', icon: <FiAlertCircle size={14} /> },
};

function InfoField({ label, value }) {
  return (
    <div style={{ marginBottom: '1.25rem' }}>
      <label
        style={{
          display: 'block',
          fontSize: '0.75rem',
          fontWeight: 700,
          color: 'var(--grey-600)',
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
          marginBottom: '0.4rem',
        }}
      >
        {label}
      </label>
      <div
        style={{
          fontSize: '0.98rem',
          fontWeight: 700,
          color: 'var(--grey-800)',
        }}
      >
        {value || <span style={{ color: '#52627a', fontWeight: 600 }}>NA</span>}
      </div>
    </div>
  );
}

function EditableField({ label, name, value, onChange, type = 'text' }) {
  return (
    <div style={{ marginBottom: '1.25rem' }}>
      <label
        htmlFor={name}
        style={{
          display: 'block',
          fontSize: '0.75rem',
          fontWeight: 700,
          color: 'var(--grey-600)',
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
          marginBottom: '0.4rem',
        }}
      >
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        className="form-control"
        style={{
          width: '100%',
          padding: '0.65rem 0.85rem',
          border: '1.5px solid var(--grey-300)',
          borderRadius: 'var(--radius-lg)',
          fontSize: '0.95rem',
          color: 'var(--grey-800)',
          fontWeight: 600,
          outline: 'none',
          transition: 'all 0.2s',
          boxSizing: 'border-box',
          backgroundColor: 'var(--paper)',
          boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.02)',
        }}
        onFocus={(e) => {
          e.target.style.borderColor = '#0056a2';
          e.target.style.boxShadow = '0 0 0 3px rgba(0, 86, 179, 0.15)';
        }}
        onBlur={(e) => {
          e.target.style.borderColor = '#c3ccd9';
          e.target.style.boxShadow = 'inset 0 2px 4px rgba(0,0,0,0.02)';
        }}
      />
    </div>
  );
}

/* ── Main Page ────────────────────────────────────────────────────────────── */
export default function MyProfilePage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { mobileNumber, customerExists, selectedAccount, accountsList, switchAccount } = useVerifiedContext();
  const [authUser, setAuthUser] = useState(getAuthUser);
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState(() => accountToProfile(selectedAccount, mobileNumber, getAuthUser()));
  const [editDraft, setEditDraft] = useState(() => accountToProfile(selectedAccount, mobileNumber, getAuthUser()));
  const [saveError, setSaveError] = useState('');
  const [applications, setApplications] = useState([]);
  const [loadingApplications, setLoadingApplications] = useState(true);
  const [showAccountMenu, setShowAccountMenu] = useState(false);
  const [selectedAppForView, setSelectedAppForView] = useState(null);
  const [selectedAppForComments, setSelectedAppForComments] = useState(null);
  const [selectedAppForReview, setSelectedAppForReview] = useState(null);

  // Re-sync whenever the SLT account or the registered user changes
  useEffect(() => {
    const mapped = accountToProfile(selectedAccount, mobileNumber, authUser);
    setProfile(mapped);
    setEditDraft(mapped);
  }, [selectedAccount, mobileNumber, authUser]);

  // Pull fresh customer profile from backend on mount so OCR and database updates reflect immediately
  useEffect(() => {
    const phone = mobileNumber || getAuthUser()?.phone || localStorage.getItem('verifiedPhone');
    const authEmail = getAuthUser()?.email || localStorage.getItem('verifiedEmail');
    if (!phone && !authEmail) return;
    let alive = true;
    const query = phone ? `phone=${encodeURIComponent(phone)}` : `email=${encodeURIComponent(authEmail)}`;
    api
      .get(`/customers/profile?${query}`)
      .then((res) => {
        const customerProfile = res.data?.customer;
        if (alive && customerProfile) {
          localStorage.setItem('authCustomer', JSON.stringify(customerProfile));
          localStorage.setItem('authUser', JSON.stringify(customerProfile));
          setAuthUser(customerProfile);
          notifyAuthUpdated();
        }
      })
      .catch(() => {
        // Fallback to /auth/me if token exists
        if (localStorage.getItem('accessToken')) {
          api.get('/auth/me').then((r) => {
            const p = r.data?.customer || r.data?.user;
            if (alive && p) {
              localStorage.setItem('authCustomer', JSON.stringify(p));
              localStorage.setItem('authUser', JSON.stringify(p));
              setAuthUser(p);
              notifyAuthUpdated();
            }
          }).catch(() => {});
        }
      });
    return () => { alive = false; };
  }, [mobileNumber]);

  // Fetch real application history for the verified phone number
  useEffect(() => {
    let isSubscribed = true;
    if (!mobileNumber) {
      setLoadingApplications(false);
      return;
    }
    setLoadingApplications(true);
    api
      .get(`/applications/by-phone?phone=${encodeURIComponent(mobileNumber)}`)
      .then((res) => {
        if (isSubscribed) setApplications(res.data?.applications || []);
      })
      .catch(() => {
        if (isSubscribed) setApplications([]);
      })
      .finally(() => {
        if (isSubscribed) setLoadingApplications(false);
      });
    return () => {
      isSubscribed = false;
    };
  }, [mobileNumber]);

  // Listen for query params e.g. /profile?review=true&ref=REQ-XXXXXX
  useEffect(() => {
    const reviewParam = searchParams.get('review') || searchParams.get('feedback') || searchParams.get('openReview');
    const refParam = searchParams.get('ref');
    if (applications.length > 0) {
      if (refParam) {
        const found = applications.find(a => a.referenceNumber === refParam.trim());
        if (found) {
          if (reviewParam === 'true' || reviewParam === '1') {
            setSelectedAppForReview(found);
          }
        }
      } else if (reviewParam === 'true' || reviewParam === '1') {
        setSelectedAppForReview(applications[0]);
      }
    }
  }, [applications, searchParams]);


  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditDraft((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    setSaveError('');

    if (editDraft.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(editDraft.email)) {
      setSaveError('Enter a valid email address.');
      return;
    }

    const phone = profile.phone || mobileNumber || getAuthUser()?.phone || localStorage.getItem('verifiedPhone');
    try {
      const res = await api.put('/customers/profile', {
        phone,
        email: editDraft.email,
        contactNumber: editDraft.contactNumber,
        addressLine1: editDraft.addressLine1,
        addressLine2: editDraft.addressLine2,
        city: editDraft.city,
        district: editDraft.district,
        postalCode: editDraft.postalCode,
        preferredContact: editDraft.preferredContact,
      });

      const updatedCustomer = res.data?.customer || {
        ...(authUser || {}),
        email: editDraft.email,
        contactNumber: editDraft.contactNumber,
        addressLine1: editDraft.addressLine1,
        addressLine2: editDraft.addressLine2,
        city: editDraft.city,
        district: editDraft.district,
        postalCode: editDraft.postalCode,
        preferredContact: editDraft.preferredContact,
      };

      localStorage.setItem('authCustomer', JSON.stringify(updatedCustomer));
      localStorage.setItem('authUser', JSON.stringify(updatedCustomer));
      setAuthUser(updatedCustomer);
      notifyAuthUpdated();
      setProfile(editDraft);
      setIsEditing(false);
      toast.success('Profile updated successfully!');
    } catch (err) {
      console.warn('Backend update failed, falling back to local storage:', err);
      const fallback = { ...(authUser || {}) };
      EDITABLE_FIELDS.forEach((f) => {
        fallback[f] = editDraft[f];
      });
      try {
        localStorage.setItem('authCustomer', JSON.stringify(fallback));
        localStorage.setItem('authUser', JSON.stringify(fallback));
        setAuthUser(fallback);
        notifyAuthUpdated();
      } catch {
        setSaveError('Could not save your changes in this browser.');
        return;
      }
      setProfile(editDraft);
      setIsEditing(false);
      toast.success('Profile saved locally.');
    }
  };

  const handleCancel = () => {
    setEditDraft(profile);
    setIsEditing(false);
  };

  // A customer who has registered but has no SLT connection yet still has a
  // profile worth showing — their sign-up details. The connection-specific
  // fields simply read NA until they take out a product.

  // Plain white card: one border, one light shadow, no blur or tint.
  const cardStyle = {
    backgroundColor: '#ffffff',
    borderRadius: 'var(--radius-lg)',
    padding: '1.5rem',
    boxShadow: 'var(--shadow-xs)',
    border: '1px solid var(--grey-200)',
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
  };

  return (
    <div style={{ backgroundColor: 'var(--page-bg)', minHeight: '100vh', paddingBottom: '4rem' }}>
      <div style={{ maxWidth: 'var(--page-max)', margin: '0 auto', padding: '2.5rem var(--page-gutter)' }}>

        {/* ── Page Header ──────────────────────────────────────────────── */}
        <div style={{ marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
            <h1 style={{ margin: 0, fontSize: 'var(--text-3xl)' }}>
              My Profile
            </h1>
          </div>
          <p style={{ margin: 0, color: 'var(--grey-600)', fontSize: 'var(--text-base)' }}>
            Manage your personal information and view your service applications.
          </p>
        </div>

        {/* ── Profile Header ───────────────────────────────────────────── */}
        <div style={{ ...cardStyle, flexDirection: 'row', alignItems: 'center', gap: '1.25rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: 'var(--blue-100)',
              color: 'var(--blue-700)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <FiUser size={28} aria-hidden="true" />
          </div>

          <div style={{ flex: 1, minWidth: '220px' }}>
            <h2 style={{ margin: '0 0 0.25rem', fontSize: 'var(--text-2xl)' }}>
              {profile.fullName || 'SLTMobitel Customer'}
            </h2>
            <p style={{ margin: 0, color: 'var(--grey-600)' }}>
              {customerExists ? (
                <>
                  Account <strong style={{ color: 'var(--grey-900)' }}>{profile.accountNumber || 'NA'}</strong>
                  {' · '}
                  {profile.connectionType || 'SLT Connection'}
                  {profile.registeredDate ? ` · Member since ${profile.registeredDate}` : ''}
                </>
              ) : (
                'Registered account · No SLT connection yet'
              )}
            </p>
          </div>
        </div>

        {/* ── Content Grid ─────────────────────────────────────────────── */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 480px), 1fr))',
            gap: '1.5rem',
            marginBottom: '1.5rem',
            alignItems: 'start',
          }}
        >
          {/* ── Personal Details Card ──────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            style={cardStyle}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
              <h3
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.6rem',
                  margin: 0,
                  fontSize: '1.25rem',
                  fontWeight: 700,
                  color: 'var(--grey-900)',
                }}
              >
                <div style={{ background: 'var(--blue-100)', width: '34px', height: '34px', borderRadius: 'var(--radius)', color: 'var(--blue-700)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <FiUser size={18} />
                </div>
                Personal Details
              </h3>

              {/* Edit Buttons Header */}
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    padding: '0.5rem 1rem',
                    borderRadius: 'var(--radius-lg)',
                    border: '1px solid rgba(0, 86, 179, 0.2)',
                    background: 'rgba(0, 86, 179, 0.05)',
                    color: 'var(--blue-600)',
                    fontWeight: 700,
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                >
                  <FiEdit3 size={16} /> Edit
                </button>
              ) : (
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button
                    onClick={handleSave}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      padding: '0.5rem 1rem',
                      borderRadius: 'var(--radius-lg)',
                      border: 'none',
                      background: 'var(--green-700)',
                      color: 'var(--paper)',
                      fontWeight: 700,
                      fontSize: '0.85rem',
                      cursor: 'pointer',
                    }}
                  >
                    <FiSave size={15} /> Save
                  </button>
                  <button
                    onClick={handleCancel}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      padding: '0.5rem 1rem',
                      borderRadius: 'var(--radius-lg)',
                      border: '1px solid var(--grey-300)',
                      background: 'var(--paper)',
                      color: 'var(--grey-700)',
                      fontWeight: 700,
                      fontSize: '0.85rem',
                      cursor: 'pointer',
                    }}
                  >
                    <FiX size={15} /> Cancel
                  </button>
                </div>
              )}
            </div>

            {saveError && (
              <div role="alert" style={{ marginBottom: '1rem', padding: '0.75rem 1rem', borderRadius: 'var(--radius-lg)', background: '#fef3f2', border: '1px solid #f5c2bd', color: '#b42318', fontSize: '0.85rem', fontWeight: 600 }}>
                {saveError}
              </div>
            )}

            {isEditing ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                {/* Verified identity — shown for context, not editable here */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))', gap: '0.5rem 1.5rem' }}>
                  <InfoField label="Full Name" value={profile.fullName} />
                  <InfoField label="NIC / Passport" value={profile.nic} />
                  <InfoField label="Mobile Number" value={profile.phone} />
                </div>
                <p style={{ margin: '0 0 1.25rem 0', fontSize: '0.78rem', color: '#5b6472', fontWeight: 600 }}>
                  Your name, NIC, date of birth and verified mobile number can't be changed here —
                  contact SLT support if any of these are wrong.
                </p>

                <EditableField label="Email" name="email" value={editDraft.email} onChange={handleEditChange} type="email" />
                <EditableField label="Contact Number" name="contactNumber" value={editDraft.contactNumber} onChange={handleEditChange} type="tel" />
                <EditableField label="Address Line 1" name="addressLine1" value={editDraft.addressLine1} onChange={handleEditChange} />
                <EditableField label="Address Line 2" name="addressLine2" value={editDraft.addressLine2} onChange={handleEditChange} />
                <EditableField label="City" name="city" value={editDraft.city} onChange={handleEditChange} />
                <EditableField label="District" name="district" value={editDraft.district} onChange={handleEditChange} />
                <EditableField label="Postal Code" name="postalCode" value={editDraft.postalCode} onChange={handleEditChange} />
                <EditableField label="Preferred Contact Method" name="preferredContact" value={editDraft.preferredContact} onChange={handleEditChange} />
              </motion.div>
            ) : (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))', gap: '0.5rem 1.5rem' }}>
                  <InfoField label="Full Name" value={profile.fullName} />
                  <InfoField label="NIC / Passport" value={profile.nic} />
                  <InfoField label="Mobile Number" value={profile.phone} />
                  <InfoField label="Email" value={profile.email} />
                  <InfoField label="Contact Number" value={profile.contactNumber} />
                  <InfoField label="Address Line 1" value={profile.addressLine1} />
                  <InfoField label="Address Line 2" value={profile.addressLine2} />
                  <InfoField label="City" value={profile.city} />
                  <InfoField label="District" value={profile.district} />
                  <InfoField label="Preferred Contact Method" value={profile.preferredContact} />
                </div>
              </motion.div>
            )}
          </motion.div>

          {/* ── Account Information Card ───────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            style={cardStyle}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem', position: 'relative' }}>
              <h3
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.6rem',
                  margin: 0,
                  fontSize: '1.25rem',
                  fontWeight: 700,
                  color: 'var(--grey-900)',
                }}
              >
                <div style={{ background: 'var(--blue-100)', width: '34px', height: '34px', borderRadius: 'var(--radius)', color: 'var(--blue-700)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <FiCreditCard size={18} />
                </div>
                Account Details
              </h3>

              {/* Account Switcher */}
              {accountsList && accountsList.length > 1 && (
                <div>
                  <button
                    onClick={() => setShowAccountMenu(!showAccountMenu)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                      padding: '0.5rem 0.85rem',
                      borderRadius: 'var(--radius-lg)',
                      border: '1px solid rgba(0, 86, 179, 0.3)',
                      background: 'rgba(0, 86, 179, 0.05)',
                      color: 'var(--blue-600)',
                      fontWeight: 700,
                      fontSize: '0.8rem',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                    }}
                  >
                    Switch Account <FiChevronDown size={14} style={{ transform: showAccountMenu ? 'rotate(180deg)' : 'none', transition: '0.2s' }} />
                  </button>

                  <AnimatePresence>
                    {showAccountMenu && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 10 }}
                        style={{
                          position: 'absolute',
                          top: '100%',
                          right: 0,
                          marginTop: '0.5rem',
                          background: 'var(--paper)',
                          borderRadius: 'var(--radius-lg)',
                          boxShadow: 'var(--shadow-xl)',
                          border: '1px solid var(--grey-200)',
                          zIndex: 50,
                          width: '280px',
                          overflow: 'hidden',
                        }}
                      >
                        <div style={{ padding: '0.75rem 1rem', background: '#f6f8fb', borderBottom: '1px solid #dfe5ee', fontSize: '0.75rem', fontWeight: 700, color: '#52627a', textTransform: 'uppercase' }}>
                          Select an Account
                        </div>
                        <div style={{ maxHeight: '220px', overflowY: 'auto' }}>
                          {accountsList.map(acc => (
                            <div
                              key={acc.accountNumber || acc.telephone}
                              onClick={() => {
                                switchAccount(acc);
                                setShowAccountMenu(false);
                              }}
                              style={{
                                padding: '0.75rem 1rem',
                                borderBottom: '1px solid var(--grey-100)',
                                cursor: 'pointer',
                                background: acc.accountNumber === profile.accountNumber ? '#eef2f7' : '#ffffff',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '0.25rem',
                              }}
                              onMouseEnter={(e) => {
                                if (acc.accountNumber !== profile.accountNumber) e.currentTarget.style.backgroundColor = '#f6f8fb';
                              }}
                              onMouseLeave={(e) => {
                                if (acc.accountNumber !== profile.accountNumber) e.currentTarget.style.backgroundColor = '#ffffff';
                              }}
                            >
                              <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#131f33' }}>{acc.accountNumber}</span>
                              <span style={{ fontSize: '0.8rem', color: '#52627a', fontWeight: 600 }}>{acc.package || acc.packageName || 'SLT Connection'}</span>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}
            </div>

            {!customerExists && (
              <div
                style={{
                  marginBottom: '1.25rem',
                  padding: '0.85rem 1rem',
                  borderRadius: 'var(--radius-lg)',
                  background: 'var(--blue-50)',
                  border: '1px solid var(--blue-200)',
                  color: '#1e40af',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                }}
              >
                You don't have an SLT connection on this number yet, so these details are not
                available. Browse the packages below to apply for one.
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))', gap: '0.5rem 1.5rem', marginBottom: '1.5rem' }}>
              <InfoField label="Account Number" value={profile.accountNumber} />
              <InfoField label="Connection Type" value={profile.connectionType} />
              <InfoField label="Current Package" value={profile.packageName} />
              <InfoField label="Registered Date" value={profile.registeredDate} />
            </div>

            {/* Quick Action Buttons */}
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginTop: 'auto' }}>
              <button
                onClick={() => navigate('/')}
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.4rem',
                  padding: '0.85rem 1rem',
                  borderRadius: 'var(--radius-lg)',
                  border: '1px solid rgba(0, 86, 179, 0.2)',
                  background: 'var(--paper)',
                  color: 'var(--blue-600)',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                  boxShadow: 'var(--shadow-sm)',
                }}
              >
                <FiBox size={16} /> View Packages
              </button>
            </div>
          </motion.div>
        </div>

        {/* ── Application History ──────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          style={cardStyle}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '2rem',
              flexWrap: 'wrap',
              gap: '1rem',
            }}
          >
            <h3
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.6rem',
                margin: 0,
                fontSize: '1.25rem',
                fontWeight: 700,
                color: 'var(--grey-900)',
              }}
            >
              <div style={{ background: 'var(--blue-100)', width: '34px', height: '34px', borderRadius: 'var(--radius)', color: 'var(--blue-700)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <FiFileText size={18} />
              </div>
              Application History
            </h3>
            <button className="btn btn-secondary" onClick={() => navigate('/check-status')}>
              Track Status <FiChevronRight size={14} />
            </button>
          </div>

          {/* Vibrant Table styling inside the soft card */}
          <div style={{ overflowX: 'auto', borderRadius: 'var(--radius)', border: '1px solid var(--grey-200)' }}>
            <table
              style={{
                width: '100%',
                borderCollapse: 'collapse',
                fontSize: '0.9rem',
              }}
            >
              <thead>
                <tr style={{ background: 'var(--grey-50)' }}>
                  {['Reference', 'Application Type', 'Date', 'Status', 'Actions'].map((h) => (
                    <th
                      key={h}
                      style={{
                        textAlign: h === 'Actions' ? 'center' : 'left',
                        padding: '0.85rem 1rem',
                        fontWeight: 600,
                        fontSize: '0.75rem',
                        color: 'var(--grey-600)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.06em',
                        borderBottom: '1px solid var(--grey-200)',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {applications.map((app) => {
                  const s = statusConfig[app.status] || statusConfig.pending;
                  return (
                    <tr
                      key={app.referenceNumber}
                      style={{
                        backgroundColor: 'var(--grey-50)',
                        borderBottom: '1px solid rgba(226, 232, 240, 0.4)',
                        transition: 'all 0.2s',
                        cursor: 'default',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#eef2f7';
                        e.currentTarget.style.transform = 'scale(1.002)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = '#f6f8fb';
                        e.currentTarget.style.transform = 'none';
                      }}
                    >
                      <td style={{ padding: '1rem', fontWeight: 700, color: '#0056a2' }}>
                        {app.referenceNumber}
                      </td>
                      <td style={{ padding: '1rem', color: '#26344b', fontWeight: 600 }}>
                        {SERVICE_TYPE_LABELS[app.serviceType] || app.serviceType}
                      </td>
                      <td style={{ padding: '1rem', color: '#52627a', fontWeight: 600 }}>
                        {app.createdAt ? new Date(app.createdAt).toISOString().split('T')[0] : ''}
                      </td>
                      <td style={{ padding: '1rem' }}>
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.35rem',
                            padding: '0.35rem 0.75rem',
                            borderRadius: '9999px',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            color: s.color,
                            backgroundColor: s.bg,
                            border: `1px solid ${s.color}`,
                          }}
                        >
                          {s.icon}
                          {s.label}
                        </span>
                      </td>
                      <td style={{ padding: '1rem', textAlign: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.45rem' }}>
                          <button
                            title="View Application Details"
                            onClick={() => setSelectedAppForView(app)}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              width: '32px',
                              height: '32px',
                              borderRadius: 'var(--radius)',
                              border: '1px solid rgba(0, 86, 179, 0.2)',
                              background: 'var(--paper)',
                              color: 'var(--blue-600)',
                              cursor: 'pointer',
                              transition: 'all 0.2s',
                              boxShadow: 'var(--shadow-xs)',
                            }}
                            onMouseEnter={(e) => { e.currentTarget.style.background = '#e3f0fe'; e.currentTarget.style.borderColor = '#0056a2'; }}
                            onMouseLeave={(e) => { e.currentTarget.style.background = '#ffffff'; e.currentTarget.style.borderColor = 'rgba(0, 86, 179, 0.2)'; }}
                          >
                            <FiEye size={16} />
                          </button>
                          <button
                            title="View Admin Messages"
                            onClick={() => setSelectedAppForComments(app)}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              width: '32px',
                              height: '32px',
                              borderRadius: 'var(--radius)',
                              border: '1px solid rgba(16, 185, 129, 0.2)',
                              background: 'var(--paper)',
                              color: 'var(--green-700)',
                              cursor: 'pointer',
                              transition: 'all 0.2s',
                              boxShadow: 'var(--shadow-xs)',
                            }}
                            onMouseEnter={(e) => { e.currentTarget.style.background = '#f1faf1'; e.currentTarget.style.borderColor = '#0f7a4d'; }}
                            onMouseLeave={(e) => { e.currentTarget.style.background = '#ffffff'; e.currentTarget.style.borderColor = 'rgba(16, 185, 129, 0.2)'; }}
                          >
                            <FiMessageSquare size={16} />
                          </button>
                          <button
                            title={
                              app.formData?.installationReview
                                ? `Installation Verified: ${app.formData.installationReview.rating || 5}/5 ⭐`
                                : 'Rate Technician & Sign-Off'
                            }
                            onClick={() => setSelectedAppForReview(app)}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '0.3rem',
                              padding: '0 0.6rem',
                              height: '32px',
                              borderRadius: 'var(--radius)',
                              border: app.formData?.installationReview
                                ? '1px solid rgba(251, 191, 36, 0.5)'
                                : '1px solid rgba(245, 158, 11, 0.4)',
                              background: app.formData?.installationReview
                                ? 'rgba(254, 243, 199, 0.6)'
                                : '#fff8e8',
                              color: 'var(--amber-700)',
                              fontWeight: 700,
                              fontSize: '0.75rem',
                              cursor: 'pointer',
                              transition: 'all 0.2s',
                              boxShadow: 'var(--shadow-xs)',
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background = '#fdf0d5';
                              e.currentTarget.style.borderColor = '#93560a';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = app.formData?.installationReview
                                ? 'rgba(254, 243, 199, 0.6)'
                                : '#fff8e8';
                              e.currentTarget.style.borderColor = app.formData?.installationReview
                                ? '1px solid rgba(251, 191, 36, 0.5)'
                                : 'rgba(245, 158, 11, 0.4)';
                            }}
                          >
                            <FiStar
                              size={14}
                              fill={app.formData?.installationReview ? '#f4d58f' : 'none'}
                            />
                            <span>
                              {app.formData?.installationReview
                                ? `${app.formData.installationReview.rating || 5}★`
                                : 'Rate'}
                            </span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {!loadingApplications && applications.length === 0 && (
                  <tr>
                    <td colSpan={5} style={{ padding: '2rem 1rem', textAlign: 'center', color: '#94a1b5', fontWeight: 600 }}>
                      No applications submitted yet.
                    </td>
                  </tr>
                )}
                {loadingApplications && (
                  <tr>
                    <td colSpan={5} style={{ padding: '2rem 1rem', textAlign: 'center', color: '#94a1b5', fontWeight: 600 }}>
                      Loading your application history...
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>

      {/* ── View Application Modal (PDF Style) ───────────────────────── */}
      <AnimatePresence>
        {selectedAppForView && (
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(15, 23, 42, 0.6)',
              backdropFilter: 'blur(4px)',
              zIndex: 9999,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '1rem',
            }}
            onClick={() => setSelectedAppForView(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              style={{
                width: '100%',
                maxWidth: '700px',
                height: '85vh',
                backgroundColor: 'var(--grey-50)',
                borderRadius: 'var(--radius)',
                boxShadow: 'var(--shadow-xl)',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
                border: '1px solid var(--grey-300)',
              }}
            >
              {/* PDF Header */}
              <div style={{ background: '#26344b', padding: '1rem 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#ffffff' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <FiFileText size={20} />
                  <span style={{ fontWeight: 600, fontSize: '1.05rem' }}>Application_{selectedAppForView.referenceNumber}.pdf</span>
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <button style={{ background: 'none', border: 'none', color: '#ffffff', cursor: 'pointer' }} title="Download PDF">
                    <FiDownload size={20} />
                  </button>
                  <button onClick={() => setSelectedAppForView(null)} style={{ background: 'none', border: 'none', color: '#ffffff', cursor: 'pointer' }} title="Close">
                    <FiX size={20} />
                  </button>
                </div>
              </div>

              {/* PDF Body (The Document) */}
              <div style={{ flex: 1, overflowY: 'auto', padding: '1rem', display: 'block', backgroundColor: '#dfe5ee', minWidth: 0, boxSizing: 'border-box' }}>
                <div
                  style={{
                    width: '100%',
                    maxWidth: '650px',
                    margin: '0 auto',
                    background: 'var(--paper)',
                    padding: '2rem',
                    boxSizing: 'border-box',
                    boxShadow: 'var(--shadow-lg)',
                    border: '1px solid var(--grey-300)',
                    borderRadius: 'var(--radius)',
                    overflow: 'hidden',
                  }}
                >
                  <div style={{ textAlign: 'center', marginBottom: '2.5rem', borderBottom: '2px solid #0056a2', paddingBottom: '1.5rem', boxSizing: 'border-box' }}>
                    <h2 style={{ margin: '0 0 0.5rem', color: '#0056a2', fontSize: '1.5rem', fontWeight: 700 }}>SLTMobitel</h2>
                    <h3 style={{ margin: 0, color: '#26344b', fontSize: '1.1rem' }}>Official Service Application</h3>
                  </div>

                  <div style={{ marginBottom: '2rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                      <strong style={{ color: '#52627a', fontSize: '0.9rem' }}>Reference No:</strong>
                      <span style={{ fontWeight: 700, color: '#131f33' }}>{selectedAppForView.referenceNumber}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                      <strong style={{ color: '#52627a', fontSize: '0.9rem' }}>Service Type:</strong>
                      <span style={{ fontWeight: 700, color: '#131f33' }}>{SERVICE_TYPE_LABELS[selectedAppForView.serviceType] || selectedAppForView.serviceType}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                      <strong style={{ color: '#52627a', fontSize: '0.9rem' }}>Date Submitted:</strong>
                      <span style={{ fontWeight: 700, color: '#131f33' }}>{new Date(selectedAppForView.createdAt).toLocaleString()}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                      <strong style={{ color: '#52627a', fontSize: '0.9rem' }}>Current Status:</strong>
                      <span style={{ fontWeight: 700, color: '#131f33' }}>{statusConfig[selectedAppForView.status]?.label || selectedAppForView.status}</span>
                    </div>
                  </div>

                  {/* Dynamic Fields payload */}
                  <div style={{ marginTop: '2.5rem' }}>
                    <h4 style={{ color: '#0056a2', borderBottom: '1px solid #dfe5ee', paddingBottom: '0.5rem', marginBottom: '1rem' }}>Application Data</h4>
                    <div style={{ background: '#f6f8fb', padding: '1rem 1.5rem', borderRadius: 'var(--radius)', border: '1px solid #dfe5ee' }}>
                      {Object.entries(selectedAppForView.formData || selectedAppForView)
                        .filter(([k]) => {
                          const excludeKeys = ['_id', '__v', 'createdAt', 'updatedAt', 'adminComments', 'referenceNumber', 'status', 'serviceType', 'formData', 'documents', 'signature', 'declarationAccepted'];
                          if (excludeKeys.includes(k)) return false;
                          if (k.toLowerCase().includes('vas_')) return false;
                          return true;
                        })
                        .map(([key, val]) => {
                          if (val === null || val === undefined || val === '') return null;
                          return (
                            <div key={key} style={{ display: 'flex', borderBottom: '1px solid #dfe5ee', padding: '0.85rem 0' }}>
                              <strong style={{ width: '40%', color: '#52627a', fontSize: '0.9rem' }}>{formatKey(key)}:</strong>
                              <span style={{ width: '60%', color: '#131f33', fontWeight: 600, wordBreak: 'break-word', fontSize: '0.9rem' }}>
                                {typeof val === 'object' ? JSON.stringify(val) : String(val)}
                              </span>
                            </div>
                          );
                        })}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── Admin Comments Modal (Claymorphism Popup) ──────────────── */}
      <AnimatePresence>
        {selectedAppForComments && (
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(15, 23, 42, 0.4)',
              backdropFilter: 'blur(6px)',
              zIndex: 9999,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '1rem',
            }}
            onClick={() => setSelectedAppForComments(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 15 }}
              onClick={(e) => e.stopPropagation()}
              style={{
                width: '100%',
                maxWidth: '450px',
                backgroundColor: 'var(--paper)',
                borderRadius: 'var(--radius-lg)',
                padding: '2rem',
                boxShadow: 'var(--shadow-xl)',
                border: '1px solid var(--grey-200)',
                position: 'relative',
              }}
            >
              <button
                onClick={() => setSelectedAppForComments(null)}
                style={{
                  position: 'absolute',
                  top: '1.25rem',
                  right: '1.25rem',
                  background: 'rgba(0,0,0,0.05)',
                  border: 'none',
                  borderRadius: '50%',
                  width: '32px',
                  height: '32px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: 'var(--grey-600)',
                }}
              >
                <FiX size={18} />
              </button>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                <div style={{ background: 'var(--blue-100)', padding: '0.6rem', borderRadius: 'var(--radius-lg)', color: 'var(--blue-700)' }}>
                  <FiMessageSquare size={22} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700, color: '#131f33' }}>Admin Messages</h3>
                  <p style={{ margin: 0, fontSize: '0.8rem', color: '#52627a', fontWeight: 600 }}>Ref: {selectedAppForComments.referenceNumber}</p>
                </div>
              </div>

              <div style={{ background: '#ffffff', borderRadius: 'var(--radius-lg)', padding: '1.5rem', border: '1px solid #dfe5ee', minHeight: '120px' }}>
                {selectedAppForComments.adminComments && selectedAppForComments.adminComments.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {selectedAppForComments.adminComments.map((comment, i) => (
                      <div key={i} style={{ background: '#f6f8fb', padding: '1rem', borderRadius: 'var(--radius-lg)', borderLeft: '4px solid #0f7a4d' }}>
                        <p style={{ margin: '0 0 0.5rem', fontSize: '0.9rem', color: '#26344b' }}>{comment.text || comment.message || comment}</p>
                        <span style={{ fontSize: '0.75rem', color: '#94a1b5', fontWeight: 600 }}>From Administrator</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#94a1b5', gap: '0.5rem' }}>
                    <FiCheckCircle size={32} style={{ opacity: 0.5 }} />
                    <span style={{ fontWeight: 600, fontSize: '0.95rem' }}>No messages from admin yet.</span>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── Installation & Technician Verification Modal ─────────────── */}
      <InstallationReviewModal
        isOpen={!!selectedAppForReview}
        onClose={() => setSelectedAppForReview(null)}
        application={selectedAppForReview}
        onSuccess={(feedbackData) => {
          setApplications((prev) =>
            prev.map((a) => {
              if (a.referenceNumber === feedbackData.referenceNumber) {
                return {
                  ...a,
                  status: 'confirmed',
                  formData: {
                    ...(a.formData || {}),
                    installationReview: {
                      rating: feedbackData.rating,
                      feedbackText: feedbackData.feedbackText,
                      submittedAt: new Date().toISOString(),
                    },
                  },
                };
              }
              return a;
            })
          );
        }}
      />
    </div>
  );
}
