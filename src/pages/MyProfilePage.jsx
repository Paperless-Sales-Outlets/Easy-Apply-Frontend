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
  FiUserPlus,
} from 'react-icons/fi';
import { useVerifiedContext } from '../components/verification';
import api from '../utils/api';

const SERVICE_TYPE_LABELS = {
  'new-connection': 'New Connection',
  'reconnection': 'Reconnection',
  'relocation': 'Relocation',
  'location-change': 'Relocation',
  'termination': 'Termination',
  'transfer': 'Ownership Transfer',
  'ownership-change': 'Ownership Transfer',
  'package-migration': 'Package Migration',
  'service-vacation': 'Service Vacation',
  'refund-request': 'Refund Request',
  'customer-request-acceptance': 'Customer Request',
  'internet-services': 'Internet Services',
};

function accountToProfile(account, mobileNumber) {
  return {
    fullName: account?.fullName || account?.customerName || '',
    email: account?.email || '',
    phone: account?.mobileNumber || account?.phoneNumber || mobileNumber || '',
    nic: account?.nic || '',
    address: account?.address || account?.addressLine1 || '',
    accountNumber: account?.accountNumber || '',
    connectionType: account?.serviceType || account?.package || '',
    packageName: account?.packageName || account?.package || '',
    registeredDate: account?.registeredDate
      ? new Date(account.registeredDate).toISOString().split('T')[0]
      : '',
  };
}

/* ── Helpers ──────────────────────────────────────────────────────────────── */
// Colors chosen to pass WCAG AA (4.5:1) against their tinted `bg`.
const statusConfig = {
  approved: { label: 'Approved', color: '#047857', bg: '#ecfdf5', icon: <FiCheckCircle size={14} /> },
  pending: { label: 'Pending', color: '#b45309', bg: '#fffbeb', icon: <FiClock size={14} /> },
  rejected: { label: 'Rejected', color: '#b91c1c', bg: '#fef2f2', icon: <FiAlertCircle size={14} /> },
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
  const { mobileNumber, customerExists, selectedAccount } = useVerifiedContext();
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState(() => accountToProfile(selectedAccount, mobileNumber));
  const [editDraft, setEditDraft] = useState(() => accountToProfile(selectedAccount, mobileNumber));
  const [applications, setApplications] = useState([]);
  const [loadingApplications, setLoadingApplications] = useState(true);

  // Re-sync from the verified account whenever it changes
  useEffect(() => {
    const mapped = accountToProfile(selectedAccount, mobileNumber);
    setProfile(mapped);
    setEditDraft(mapped);
  }, [selectedAccount, mobileNumber]);

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

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditDraft((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    setProfile(editDraft);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditDraft(profile);
    setIsEditing(false);
  };

  if (!customerExists) {
    return (
      <div style={{ backgroundColor: '#f4f7f9', minHeight: '100vh', paddingBottom: '4rem' }}>
        <div style={{ maxWidth: '640px', margin: '0 auto', padding: '4rem 1.5rem', textAlign: 'center' }}>
          <div
            style={{
              width: '72px',
              height: '72px',
              borderRadius: '50%',
              background: '#eff6ff',
              color: '#0056b3',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.5rem',
            }}
          >
            <FiUserPlus size={32} />
          </div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.5rem' }}>
            No SLT Account Found
          </h1>
          <p style={{ color: '#64748b', marginBottom: '2rem' }}>
            We couldn't find an existing SLT connection registered to {mobileNumber ? `+94 ${mobileNumber}` : 'this number'}.
            Get a new connection to start using SLTMobitel EasyApply.
          </p>
          <button
            onClick={() => navigate('/new-connection/products')}
            style={{
              padding: '0.75rem 1.5rem',
              borderRadius: '10px',
              border: 'none',
              background: '#0056b3',
              color: '#fff',
              fontWeight: 700,
              fontSize: '0.9rem',
              cursor: 'pointer',
            }}
          >
            Browse Products & Get Connected
          </button>
        </div>
      </div>
    );
  }

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
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          style={{
            background: 'linear-gradient(135deg, #001f3f 0%, #003b73 45%, #004d38 85%, #01291e 100%)',
            borderRadius: '24px',
            padding: '2.5rem',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            gap: '2rem',
            marginBottom: '2rem',
            flexWrap: 'wrap',
            position: 'relative',
            overflow: 'hidden',
            boxShadow: '0 20px 40px -10px rgba(0, 86, 179, 0.25)',
          }}
        >
          {/* Decorative Elements */}
          <div style={{ position: 'absolute', top: -150, right: -100, width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(16,185,129,0.15) 0%, transparent 70%)', filter: 'blur(40px)' }} />
          <div style={{ position: 'absolute', bottom: -100, left: 150, width: 350, height: 350, borderRadius: '50%', background: 'radial-gradient(circle, rgba(2,132,199,0.2) 0%, transparent 70%)', filter: 'blur(30px)' }} />

          {/* Avatar */}
          <div
            style={{
              width: '88px',
              height: '88px',
              borderRadius: '50%',
              background: 'rgba(255, 255, 255, 0.08)',
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              border: '1px solid rgba(255, 255, 255, 0.2)',
              boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.1)',
            }}
          >
            <FiUser size={36} color="rgba(255,255,255,0.9)" />
          </div>

          <div style={{ flex: 1, minWidth: '220px', zIndex: 1 }}>
            <h2 style={{ margin: '0 0 0.35rem', fontSize: '1.75rem', fontWeight: 800, letterSpacing: '-0.5px', color: '#ffffff' }}>
              {profile.fullName}
            </h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
              <p style={{ margin: 0, fontSize: '0.95rem', color: 'rgba(255,255,255,0.8)' }}>
                Account: <strong style={{ color: '#fff' }}>{profile.accountNumber}</strong>
              </p>
              <span style={{ color: 'rgba(255,255,255,0.3)' }}>|</span>
              <p style={{ margin: 0, fontSize: '0.9rem', color: 'rgba(255,255,255,0.75)' }}>
                {profile.connectionType} • Member since {profile.registeredDate}
              </p>
            </div>
          </div>

          {/* Edit Button */}
          <div style={{ zIndex: 1 }}>
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.75rem 1.5rem',
                  borderRadius: '9999px',
                  border: '1px solid rgba(255,255,255,0.15)',
                  background: 'rgba(255,255,255,0.1)',
                  color: '#fff',
                  fontWeight: 600,
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  backdropFilter: 'blur(8px)',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.15)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; }}
              >
                <FiEdit3 size={16} /> Edit Profile
              </button>
            ) : (
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button
                  onClick={handleSave}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    padding: '0.75rem 1.25rem',
                    borderRadius: '9999px',
                    border: 'none',
                    background: '#10b981',
                    color: '#fff',
                    fontWeight: 600,
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
                  }}
                >
                  <FiSave size={16} /> Save
                </button>
                <button
                  onClick={handleCancel}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    padding: '0.75rem 1.25rem',
                    borderRadius: '9999px',
                    border: '1px solid rgba(255,255,255,0.2)',
                    background: 'transparent',
                    color: '#fff',
                    fontWeight: 600,
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                  }}
                >
                  <FiX size={16} /> Cancel
                </button>
              </div>
            )}
          </div>
        </motion.div>

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
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1, ease: 'easeOut' }}
            style={{
              backgroundColor: '#fff',
              borderRadius: '24px',
              padding: '2rem',
              boxShadow: '0 4px 24px rgba(0,0,0,0.03)',
              border: '1px solid rgba(0,0,0,0.05)',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <FiUser size={20} style={{ color: '#0056b3' }} />
              </div>
              <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: '#0f172a' }}>
                Personal Details
              </h3>
            </div>

            {isEditing ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <EditableField label="Full Name" name="fullName" value={editDraft.fullName} onChange={handleEditChange} />
                <EditableField label="Email" name="email" value={editDraft.email} onChange={handleEditChange} type="email" />
                <EditableField label="Phone" name="phone" value={editDraft.phone} onChange={handleEditChange} type="tel" />
                <EditableField label="NIC Number" name="nic" value={editDraft.nic} onChange={handleEditChange} />
                <EditableField label="Address" name="address" value={editDraft.address} onChange={handleEditChange} />
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
                  <InfoField label="Full Name" value={profile.fullName} />
                  <InfoField label="Email" value={profile.email} />
                  <InfoField label="Phone" value={profile.phone} />
                  <InfoField label="NIC Number" value={profile.nic} />
                </div>
                <div style={{ borderTop: '1px dashed #e2e8f0', paddingTop: '1.5rem' }}>
                  <InfoField label="Address" value={profile.address} />
                </div>
              </div>
            )}
          </motion.div>

          {/* ── Account Information Card ───────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.15, ease: 'easeOut' }}
            style={{
              backgroundColor: '#f8fafc',
              borderRadius: '24px',
              padding: '2rem',
              boxShadow: '0 4px 24px rgba(0,0,0,0.02)',
              border: '1px solid rgba(0,0,0,0.03)',
              position: 'relative',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: '#f3e8ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <FiCreditCard size={20} style={{ color: '#9333ea' }} />
              </div>
              <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: '#0f172a' }}>
                Account Information
              </h3>
            </div>

            <div
              style={{
                backgroundColor: '#fff',
                borderRadius: '16px',
                padding: '1.5rem',
                marginBottom: '1.5rem',
                border: '1px solid rgba(0,0,0,0.04)',
                boxShadow: '0 2px 8px rgba(0,0,0,0.01)',
              }}
            >
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
                <InfoField label="Account Number" value={profile.accountNumber} />
                <InfoField label="Connection Type" value={profile.connectionType} />
                <InfoField label="Current Package" value={profile.packageName} />
                <InfoField label="Registered Date" value={profile.registeredDate} />
              </div>
            </div>

            {/* Quick Action Buttons */}
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginTop: 'auto' }}>
              <button
                onClick={() => navigate('/new-connection/products')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flex: 1,
                  minWidth: '160px',
                  gap: '0.5rem',
                  padding: '0.85rem 1.25rem',
                  borderRadius: '12px',
                  border: '1px solid #cbd5e1',
                  background: '#fff',
                  color: '#0f172a',
                  fontWeight: 700,
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#94a3b8';
                  e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.04)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#cbd5e1';
                  e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.02)';
                }}
              >
                <FiWifi size={18} /> View Packages
              </button>
              <button
                onClick={() => navigate('/package-migration')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flex: 1,
                  minWidth: '160px',
                  gap: '0.5rem',
                  padding: '0.85rem 1.25rem',
                  borderRadius: '12px',
                  border: 'none',
                  background: 'linear-gradient(135deg, #001f3f 0%, #003b73 45%, #004d38 85%, #01291e 100%)',
                  color: '#fff',
                  fontWeight: 700,
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  boxShadow: '0 4px 12px rgba(0, 59, 115, 0.3)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'linear-gradient(135deg, #002b5e 0%, #004d99 45%, #00664d 85%, #024030 100%)';
                  e.currentTarget.style.boxShadow = '0 6px 16px rgba(0, 59, 115, 0.4)';
                  e.currentTarget.style.transform = 'translateY(-1px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'linear-gradient(135deg, #001f3f 0%, #003b73 45%, #004d38 85%, #01291e 100%)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 59, 115, 0.3)';
                  e.currentTarget.style.transform = 'none';
                }}
              >
                <FiEdit3 size={18} /> Upgrade Package
              </button>
            </div>
          </motion.div>
        </div>

        {/* ── Application History ──────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2, ease: 'easeOut' }}
          style={{
            backgroundColor: '#fff',
            borderRadius: '24px',
            padding: '2rem',
            boxShadow: '0 4px 24px rgba(0,0,0,0.03)',
            border: '1px solid rgba(0,0,0,0.05)',
            position: 'relative',
            overflow: 'hidden',
          }}
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
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: '#ecfdf5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <FiFileText size={20} style={{ color: '#059669' }} />
              </div>
              <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: '#0f172a' }}>
                Application History
              </h3>
            </div>
            <button
              onClick={() => navigate('/check-status')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.6rem 1.25rem',
                borderRadius: '9999px',
                border: '1px solid #e2e8f0',
                background: '#f8fafc',
                color: '#0f172a',
                fontWeight: 700,
                fontSize: '0.85rem',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = '#f1f5f9'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = '#f8fafc'; }}
            >
              Check Status <FiChevronRight size={16} />
            </button>
          </div>

          {/* Table — desktop */}
          <div style={{ overflowX: 'auto' }}>
            <table
              style={{
                width: '100%',
                borderCollapse: 'separate',
                borderSpacing: '0 8px',
                fontSize: '0.9rem',
              }}
            >
              <thead>
                <tr>
                  {['Reference', 'Application Type', 'Date', 'Status'].map((h) => (
                    <th
                      key={h}
                      style={{
                        textAlign: 'left',
                        padding: '0 1.25rem 0.5rem',
                        fontWeight: 700,
                        fontSize: '0.75rem',
                        color: '#64748b',
                        textTransform: 'uppercase',
                        letterSpacing: '1px',
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
                        backgroundColor: '#f8fafc',
                        transition: 'all 0.2s',
                        cursor: 'default',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#f1f5f9';
                        e.currentTarget.style.transform = 'scale(1.002)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = '#f8fafc';
                        e.currentTarget.style.transform = 'none';
                      }}
                    >
                      <td style={{ padding: '1rem 1.25rem', fontWeight: 700, color: '#0056b3', borderRadius: '12px 0 0 12px' }}>
                        {app.referenceNumber}
                      </td>
                      <td style={{ padding: '1rem 1.25rem', color: '#1e293b', fontWeight: 600 }}>
                        {SERVICE_TYPE_LABELS[app.serviceType] || app.serviceType}
                      </td>
                      <td style={{ padding: '1rem 1.25rem', color: '#64748b', fontWeight: 500 }}>
                        {app.createdAt ? new Date(app.createdAt).toISOString().split('T')[0] : ''}
                      </td>
                      <td style={{ padding: '1rem 1.25rem', borderRadius: '0 12px 12px 0' }}>
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.4rem',
                            padding: '0.35rem 0.85rem',
                            borderRadius: '9999px',
                            fontSize: '0.8rem',
                            fontWeight: 800,
                            color: s.color,
                            backgroundColor: s.bg,
                            border: `1px solid ${s.color}30`,
                          }}
                        >
                          {s.icon}
                          {s.label}
                        </span>
                      </td>
                    </tr>
                  );
                })}
                {!loadingApplications && applications.length === 0 && (
                  <tr>
                    <td colSpan={4} style={{ padding: '3rem 1rem', textAlign: 'center', color: '#64748b', fontWeight: 500, backgroundColor: '#f8fafc', borderRadius: '12px' }}>
                      No applications submitted yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
