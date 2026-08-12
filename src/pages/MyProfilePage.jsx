import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FiUser,
  FiMail,
  FiPhone,
  FiMapPin,
  FiEdit3,
  FiSave,
  FiX,
  FiCreditCard,
  FiWifi,
  FiFileText,
  FiClock,
  FiCheckCircle,
  FiAlertCircle,
  FiChevronRight,
} from 'react-icons/fi';

/* ── Demo data — persisted in localStorage ────────────────────────────────── */
const STORAGE_KEY = 'slt_user_profile';

const DEFAULT_PROFILE = {
  fullName: 'Janith Perera',
  email: 'janithperera@email.com',
  phone: '+94 70 123 4567',
  nic: '199012345678',
  address: '42, Galle Road, Colombo 03',
  city: 'Colombo',
  district: 'Colombo',
  province: 'Western',
  accountNumber: 'SLT-2024-00847',
  connectionType: 'FTTH (Fibre)',
  packageName: 'Fibre Broadband 100 Mbps',
  registeredDate: '2024-03-15',
};

const DEMO_APPLICATIONS = [
  {
    id: 'REF-20260801-001',
    type: 'New Connection',
    date: '2026-08-01',
    status: 'approved',
  },
  {
    id: 'REF-20260725-003',
    type: 'Package Migration',
    date: '2026-07-25',
    status: 'pending',
  },
  {
    id: 'REF-20260710-007',
    type: 'Refund Request',
    date: '2026-07-10',
    status: 'rejected',
  },
  {
    id: 'REF-20260615-012',
    type: 'Reconnection',
    date: '2026-06-15',
    status: 'approved',
  },
];

/* ── Helpers ──────────────────────────────────────────────────────────────── */
const statusConfig = {
  approved: { label: 'Approved', color: '#059669', bg: '#ecfdf5', icon: <FiCheckCircle size={14} /> },
  pending: { label: 'Pending', color: '#d97706', bg: '#fffbeb', icon: <FiClock size={14} /> },
  rejected: { label: 'Rejected', color: '#dc2626', bg: '#fef2f2', icon: <FiAlertCircle size={14} /> },
};

function InfoField({ label, value }) {
  return (
    <div style={{ marginBottom: '1rem' }}>
      <label
        style={{
          display: 'block',
          fontSize: '0.78rem',
          fontWeight: 600,
          color: '#64748b',
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
          marginBottom: '0.3rem',
        }}
      >
        {label}
      </label>
      <div
        style={{
          fontSize: '0.95rem',
          fontWeight: 600,
          color: '#0f172a',
        }}
      >
        {value || '—'}
      </div>
    </div>
  );
}

function EditableField({ label, name, value, onChange, type = 'text' }) {
  return (
    <div style={{ marginBottom: '1rem' }}>
      <label
        htmlFor={name}
        style={{
          display: 'block',
          fontSize: '0.78rem',
          fontWeight: 600,
          color: '#64748b',
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
          marginBottom: '0.35rem',
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
          padding: '0.6rem 0.85rem',
          border: '1px solid #cbd5e1',
          borderRadius: '8px',
          fontSize: '0.9rem',
          color: '#1e293b',
          outline: 'none',
          transition: 'border-color 0.2s',
          boxSizing: 'border-box',
        }}
      />
    </div>
  );
}

/* ── Main Page ────────────────────────────────────────────────────────────── */
export default function MyProfilePage() {
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState(DEFAULT_PROFILE);
  const [editDraft, setEditDraft] = useState(DEFAULT_PROFILE);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        setProfile(parsed);
        setEditDraft(parsed);
      }
    } catch {
      // ignore parse errors
    }
  }, []);

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditDraft((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    setProfile(editDraft);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(editDraft));
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditDraft(profile);
    setIsEditing(false);
  };

  return (
    <div style={{ backgroundColor: '#f4f7f9', minHeight: '100vh', paddingBottom: '4rem' }}>
      <div style={{ maxWidth: '1600px', margin: '0 auto', padding: '2rem 1.5rem' }}>

        {/* ── Page Header ──────────────────────────────────────────────── */}
        <div style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
            <div style={{ display: 'flex', gap: '4px', fontStyle: 'italic', fontSize: '1.8rem', fontWeight: 900 }}>
              <span style={{ color: '#10b981' }}>/</span><span style={{ color: '#0056b3' }}>/</span>
            </div>
            <h1 style={{ margin: 0, fontSize: '1.8rem', fontWeight: 800, color: '#0f172a' }}>
              My Profile
            </h1>
          </div>
        </div>

        {/* ── Profile Header Card ──────────────────────────────────────── */}
        <div
          style={{
            background: 'linear-gradient(135deg, #0056b3 0%, #0284c7 100%)',
            borderRadius: '16px',
            padding: '2rem',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            gap: '1.5rem',
            marginBottom: '2rem',
            flexWrap: 'wrap',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Decorative circles */}
          <div style={{ position: 'absolute', top: -30, right: -30, width: 120, height: 120, borderRadius: '50%', background: 'rgba(255,255,255,0.07)' }} />
          <div style={{ position: 'absolute', bottom: -20, right: 60, width: 80, height: 80, borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }} />

          {/* Avatar */}
          <div
            style={{
              width: '72px',
              height: '72px',
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              border: '3px solid rgba(255,255,255,0.3)',
            }}
          >
            <FiUser size={32} />
          </div>

          <div style={{ flex: 1, minWidth: '180px' }}>
            <h2 style={{ margin: '0 0 0.25rem', fontSize: '1.4rem', fontWeight: 800 }}>
              {profile.fullName}
            </h2>
            <p style={{ margin: '0 0 0.15rem', fontSize: '0.9rem', opacity: 0.85 }}>
              Account: {profile.accountNumber}
            </p>
            <p style={{ margin: 0, fontSize: '0.85rem', opacity: 0.7 }}>
              {profile.connectionType} • Member since {profile.registeredDate}
            </p>
          </div>

          {/* Edit Button */}
          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.6rem 1.2rem',
                borderRadius: '9999px',
                border: '2px solid rgba(255,255,255,0.4)',
                background: 'rgba(255,255,255,0.15)',
                color: '#fff',
                fontWeight: 600,
                fontSize: '0.85rem',
                cursor: 'pointer',
                transition: 'all 0.2s',
                backdropFilter: 'blur(4px)',
              }}
            >
              <FiEdit3 size={16} /> Edit Profile
            </button>
          ) : (
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                onClick={handleSave}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  padding: '0.55rem 1rem',
                  borderRadius: '9999px',
                  border: 'none',
                  background: '#10b981',
                  color: '#fff',
                  fontWeight: 600,
                  fontSize: '0.83rem',
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
                  padding: '0.55rem 1rem',
                  borderRadius: '9999px',
                  border: '2px solid rgba(255,255,255,0.4)',
                  background: 'transparent',
                  color: '#fff',
                  fontWeight: 600,
                  fontSize: '0.83rem',
                  cursor: 'pointer',
                }}
              >
                <FiX size={15} /> Cancel
              </button>
            </div>
          )}
        </div>

        {/* ── Content Grid ─────────────────────────────────────────────── */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 480px), 1fr))',
            gap: '1.5rem',
            marginBottom: '2rem',
          }}
        >
          {/* ── Personal Details Card ──────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            style={{
              backgroundColor: '#fff',
              borderRadius: '14px',
              padding: '1.75rem',
              boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
              border: '1px solid #f1f5f9',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: 'linear-gradient(90deg, #0056b3, #10b981)' }} />
            <h3
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                margin: '0 0 1.5rem',
                fontSize: '1.1rem',
                fontWeight: 700,
                color: '#0f172a',
              }}
            >
              <FiUser size={18} style={{ color: '#0056b3' }} />
              Personal Details
            </h3>

            {isEditing ? (
              <>
                <EditableField label="Full Name" name="fullName" value={editDraft.fullName} onChange={handleEditChange} />
                <EditableField label="Email" name="email" value={editDraft.email} onChange={handleEditChange} type="email" />
                <EditableField label="Phone" name="phone" value={editDraft.phone} onChange={handleEditChange} type="tel" />
                <EditableField label="NIC Number" name="nic" value={editDraft.nic} onChange={handleEditChange} />
                <EditableField label="Address" name="address" value={editDraft.address} onChange={handleEditChange} />
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 150px), 1fr))', gap: '0.75rem' }}>
                  <EditableField label="City" name="city" value={editDraft.city} onChange={handleEditChange} />
                  <EditableField label="District" name="district" value={editDraft.district} onChange={handleEditChange} />
                </div>
                <EditableField label="Province" name="province" value={editDraft.province} onChange={handleEditChange} />
              </>
            ) : (
              <>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))', gap: '1rem 2rem' }}>
                  <InfoField label="Full Name" value={profile.fullName} />
                  <InfoField label="Email" value={profile.email} />
                  <InfoField label="Phone" value={profile.phone} />
                  <InfoField label="NIC Number" value={profile.nic} />
                </div>
                <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '1rem', marginTop: '0.5rem' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))', gap: '1rem 2rem' }}>
                    <InfoField label="Address" value={profile.address} />
                    <InfoField label="City" value={profile.city} />
                    <InfoField label="District" value={profile.district} />
                    <InfoField label="Province" value={profile.province} />
                  </div>
                </div>
              </>
            )}
          </motion.div>

          {/* ── Account Information Card ───────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, delay: 0.05 }}
            style={{
              backgroundColor: '#fff',
              borderRadius: '14px',
              padding: '1.75rem',
              boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
              border: '1px solid #f1f5f9',
              position: 'relative',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: 'linear-gradient(90deg, #7c3aed, #0284c7)' }} />
            <h3
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                margin: '0 0 1.5rem',
                fontSize: '1.1rem',
                fontWeight: 700,
                color: '#0f172a',
              }}
            >
              <FiCreditCard size={18} style={{ color: '#7c3aed' }} />
              Account Information
            </h3>

            <div
              style={{
                backgroundColor: '#f8fafc',
                borderRadius: '12px',
                padding: '1.25rem',
                marginBottom: '1.25rem',
                border: '1px solid #e2e8f0',
              }}
            >
              <InfoField label="Account Number" value={profile.accountNumber} />
              <InfoField label="Connection Type" value={profile.connectionType} />
              <InfoField label="Current Package" value={profile.packageName} />
              <InfoField label="Registered Date" value={profile.registeredDate} />
            </div>

            {/* Quick Action Buttons */}
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginTop: 'auto' }}>
              <button
                onClick={() => navigate('/new-connection/products')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  padding: '0.55rem 1rem',
                  borderRadius: '8px',
                  border: '1px solid #e2e8f0',
                  background: '#fff',
                  color: '#0056b3',
                  fontWeight: 600,
                  fontSize: '0.83rem',
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                }}
              >
                <FiWifi size={15} /> View Packages
              </button>
              <button
                onClick={() => navigate('/package-migration')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  padding: '0.55rem 1rem',
                  borderRadius: '8px',
                  border: 'none',
                  background: '#0056b3',
                  color: '#fff',
                  fontWeight: 600,
                  fontSize: '0.83rem',
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                }}
              >
                <FiEdit3 size={15} /> Upgrade Package
              </button>
            </div>
          </motion.div>
        </div>

        {/* ── Application History ──────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, delay: 0.1 }}
          style={{
            backgroundColor: '#fff',
            borderRadius: '14px',
            padding: '1.75rem',
            boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
            border: '1px solid #f1f5f9',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: 'linear-gradient(90deg, #059669, #0284c7)' }} />
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '1.5rem',
              flexWrap: 'wrap',
              gap: '0.75rem',
            }}
          >
            <h3
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                margin: 0,
                fontSize: '1.1rem',
                fontWeight: 700,
                color: '#0f172a',
              }}
            >
              <FiFileText size={18} style={{ color: '#059669' }} />
              Application History
            </h3>
            <button
              onClick={() => navigate('/check-status')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                padding: '0.45rem 0.85rem',
                borderRadius: '8px',
                border: '1px solid #e2e8f0',
                background: '#f8fafc',
                color: '#0056b3',
                fontWeight: 600,
                fontSize: '0.8rem',
                cursor: 'pointer',
              }}
            >
              Check Status <FiChevronRight size={14} />
            </button>
          </div>

          {/* Table — desktop */}
          <div style={{ overflowX: 'auto' }}>
            <table
              style={{
                width: '100%',
                borderCollapse: 'collapse',
                fontSize: '0.88rem',
              }}
            >
              <thead>
                <tr>
                  {['Reference', 'Application Type', 'Date', 'Status'].map((h) => (
                    <th
                      key={h}
                      style={{
                        textAlign: 'left',
                        padding: '0.75rem 1rem',
                        fontWeight: 700,
                        fontSize: '0.78rem',
                        color: '#64748b',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                        borderBottom: '2px solid #f1f5f9',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {DEMO_APPLICATIONS.map((app) => {
                  const s = statusConfig[app.status] || statusConfig.pending;
                  return (
                    <tr
                      key={app.id}
                      style={{ borderBottom: '1px solid #f8fafc' }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#fafbfc';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }}
                    >
                      <td style={{ padding: '0.85rem 1rem', fontWeight: 600, color: '#0056b3' }}>
                        {app.id}
                      </td>
                      <td style={{ padding: '0.85rem 1rem', color: '#334155' }}>
                        {app.type}
                      </td>
                      <td style={{ padding: '0.85rem 1rem', color: '#64748b' }}>
                        {app.date}
                      </td>
                      <td style={{ padding: '0.85rem 1rem' }}>
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.3rem',
                            padding: '0.25rem 0.65rem',
                            borderRadius: '9999px',
                            fontSize: '0.76rem',
                            fontWeight: 700,
                            color: s.color,
                            backgroundColor: s.bg,
                          }}
                        >
                          {s.icon}
                          {s.label}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
