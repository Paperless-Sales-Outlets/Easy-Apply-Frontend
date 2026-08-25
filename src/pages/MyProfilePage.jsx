import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  FiUserPlus,
  FiChevronDown,
  FiEye,
  FiMessageSquare,
  FiDownload,
  FiZap,
  FiBox,
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
function formatKey(key) {
  const result = key.replace(/([A-Z])/g, " $1");
  return result.charAt(0).toUpperCase() + result.slice(1);
}

const statusConfig = {
  approved: { label: 'Approved', color: '#047857', bg: '#ecfdf5', icon: <FiCheckCircle size={14} /> },
  pending: { label: 'Pending', color: '#b45309', bg: '#fffbeb', icon: <FiClock size={14} /> },
  rejected: { label: 'Rejected', color: '#b91c1c', bg: '#fef2f2', icon: <FiAlertCircle size={14} /> },
};

function InfoField({ label, value }) {
  return (
    <div style={{ marginBottom: '1.25rem' }}>
      <label
        style={{
          display: 'block',
          fontSize: '0.75rem',
          fontWeight: 700,
          color: '#64748b',
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
          color: '#1e293b',
        }}
      >
        {value || '—'}
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
          color: '#64748b',
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
          border: '1.5px solid #cbd5e1',
          borderRadius: '10px',
          fontSize: '0.95rem',
          color: '#1e293b',
          fontWeight: 600,
          outline: 'none',
          transition: 'all 0.2s',
          boxSizing: 'border-box',
          backgroundColor: '#ffffff',
          boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.02)',
        }}
        onFocus={(e) => {
          e.target.style.borderColor = '#0056b3';
          e.target.style.boxShadow = '0 0 0 3px rgba(0, 86, 179, 0.15)';
        }}
        onBlur={(e) => {
          e.target.style.borderColor = '#cbd5e1';
          e.target.style.boxShadow = 'inset 0 2px 4px rgba(0,0,0,0.02)';
        }}
      />
    </div>
  );
}

/* ── Main Page ────────────────────────────────────────────────────────────── */
export default function MyProfilePage() {
  const navigate = useNavigate();
  const { mobileNumber, customerExists, selectedAccount, accountsList, switchAccount } = useVerifiedContext();
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState(() => accountToProfile(selectedAccount, mobileNumber));
  const [editDraft, setEditDraft] = useState(() => accountToProfile(selectedAccount, mobileNumber));
  const [applications, setApplications] = useState([]);
  const [loadingApplications, setLoadingApplications] = useState(true);
  const [showAccountMenu, setShowAccountMenu] = useState(false);
  const [selectedAppForView, setSelectedAppForView] = useState(null);
  const [selectedAppForComments, setSelectedAppForComments] = useState(null);

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
    // In a real app, you would POST this to the backend to update user profile
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

  // Soft UI / Claymorphism card style
  const cardStyle = {
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    borderRadius: '24px',
    padding: '2rem',
    boxShadow: '10px 10px 30px rgba(200, 208, 220, 0.5), -10px -10px 30px rgba(255, 255, 255, 0.9)',
    border: '1px solid rgba(255, 255, 255, 0.8)',
    position: 'relative',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
  };

  return (
    <div style={{ backgroundColor: '#eef2f6', minHeight: '100vh', paddingBottom: '4rem' }}>
      <div style={{ maxWidth: '1600px', margin: '0 auto', padding: '2.5rem 1.5rem' }}>

        {/* ── Page Header ──────────────────────────────────────────────── */}
        <div style={{ marginBottom: '2.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
            <div style={{ display: 'flex', gap: '4px', fontStyle: 'italic', fontSize: '1.8rem', fontWeight: 900 }}>
              <span style={{ color: '#10b981' }}>/</span><span style={{ color: '#0056b3' }}>/</span>
            </div>
            <h1 style={{ margin: 0, fontSize: '1.8rem', fontWeight: 900, color: '#0f172a', letterSpacing: '-0.5px' }}>
              My Profile
            </h1>
          </div>
          <p style={{ margin: 0, color: '#64748b', fontWeight: 600, fontSize: '0.95rem' }}>
            Manage your personal information and view your service applications.
          </p>
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
              {profile.fullName || 'SLTMobitel Customer'}
            </h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
              <p style={{ margin: 0, fontSize: '0.95rem', color: 'rgba(255,255,255,0.8)' }}>
                Account: <strong style={{ color: '#fff' }}>{profile.accountNumber || '—'}</strong>
              </p>
              <span style={{ color: 'rgba(255,255,255,0.3)' }}>|</span>
              <p style={{ margin: 0, fontSize: '0.9rem', color: 'rgba(255,255,255,0.75)' }}>
                {profile.connectionType || 'SLT Connection'}{profile.registeredDate ? ` • Member since ${profile.registeredDate}` : ''}
              </p>
            </div>
          </div>
        </motion.div>

        {/* ── Content Grid ─────────────────────────────────────────────── */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 480px), 1fr))',
            gap: '2rem',
            marginBottom: '3rem',
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
                  fontWeight: 800,
                  color: '#0f172a',
                }}
              >
                <div style={{ background: 'linear-gradient(135deg, rgb(0, 31, 63) 0%, rgb(0, 59, 115) 45%, rgb(0, 77, 56) 85%, rgb(1, 41, 30) 100%)', padding: '0.4rem', borderRadius: '8px', color: '#fff' }}>
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
                    borderRadius: '10px',
                    border: '1px solid rgba(0, 86, 179, 0.2)',
                    background: 'rgba(0, 86, 179, 0.05)',
                    color: '#0056b3',
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
                      borderRadius: '10px',
                      border: 'none',
                      background: '#10b981',
                      color: '#fff',
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
                      borderRadius: '10px',
                      border: '1px solid #cbd5e1',
                      background: '#fff',
                      color: '#475569',
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

            {isEditing ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <EditableField label="Full Name" name="fullName" value={editDraft.fullName} onChange={handleEditChange} />
                <EditableField label="Email" name="email" value={editDraft.email} onChange={handleEditChange} type="email" />
                <EditableField label="Phone" name="phone" value={editDraft.phone} onChange={handleEditChange} type="tel" />
                <EditableField label="NIC Number" name="nic" value={editDraft.nic} onChange={handleEditChange} />
                <EditableField label="Address" name="address" value={editDraft.address} onChange={handleEditChange} />
              </motion.div>
            ) : (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))', gap: '0.5rem 1.5rem' }}>
                  <InfoField label="Full Name" value={profile.fullName} />
                  <InfoField label="Email" value={profile.email} />
                  <InfoField label="Phone" value={profile.phone} />
                  <InfoField label="NIC Number" value={profile.nic} />
                  <InfoField label="Address" value={profile.address} />
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
                  fontWeight: 800,
                  color: '#0f172a',
                }}
              >
                <div style={{ background: 'linear-gradient(135deg, rgb(0, 31, 63) 0%, rgb(0, 59, 115) 45%, rgb(0, 77, 56) 85%, rgb(1, 41, 30) 100%)', padding: '0.4rem', borderRadius: '8px', color: '#fff' }}>
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
                      borderRadius: '10px',
                      border: '1px solid rgba(0, 86, 179, 0.3)',
                      background: 'rgba(0, 86, 179, 0.05)',
                      color: '#0056b3',
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
                          background: '#fff',
                          borderRadius: '12px',
                          boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
                          border: '1px solid #e2e8f0',
                          zIndex: 50,
                          width: '280px',
                          overflow: 'hidden',
                        }}
                      >
                        <div style={{ padding: '0.75rem 1rem', background: '#f8fafc', borderBottom: '1px solid #e2e8f0', fontSize: '0.75rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>
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
                                borderBottom: '1px solid #f1f5f9',
                                cursor: 'pointer',
                                background: acc.accountNumber === profile.accountNumber ? '#f1f5f9' : '#fff',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '0.25rem',
                              }}
                              onMouseEnter={(e) => {
                                if (acc.accountNumber !== profile.accountNumber) e.currentTarget.style.backgroundColor = '#f8fafc';
                              }}
                              onMouseLeave={(e) => {
                                if (acc.accountNumber !== profile.accountNumber) e.currentTarget.style.backgroundColor = '#fff';
                              }}
                            >
                              <span style={{ fontSize: '0.9rem', fontWeight: 800, color: '#0f172a' }}>{acc.accountNumber}</span>
                              <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>{acc.package || acc.packageName || 'SLT Connection'}</span>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))', gap: '0.5rem 1.5rem', marginBottom: '1.5rem' }}>
              <InfoField label="Account Number" value={profile.accountNumber} />
              <InfoField label="Connection Type" value={profile.connectionType} />
              <InfoField label="Current Package" value={profile.packageName} />
              <InfoField label="Registered Date" value={profile.registeredDate} />
            </div>

            {/* Quick Action Buttons */}
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginTop: 'auto' }}>
              <button
                onClick={() => navigate('/new-connection/products')}
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.4rem',
                  padding: '0.85rem 1rem',
                  borderRadius: '12px',
                  border: '1px solid rgba(0, 86, 179, 0.2)',
                  background: '#ffffff',
                  color: '#0056b3',
                  fontWeight: 800,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                  boxShadow: '0 2px 5px rgba(0,0,0,0.02)',
                }}
              >
                <FiBox size={16} /> View Packages
              </button>
              <button
                onClick={() => navigate('/package-migration')}
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.4rem',
                  padding: '0.85rem 1rem',
                  borderRadius: '12px',
                  border: 'none',
                  background: 'linear-gradient(135deg, #0056b3, #003b73)',
                  color: '#fff',
                  fontWeight: 800,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                  boxShadow: '0 4px 12px rgba(0, 86, 179, 0.25)',
                }}
              >
                <FiZap size={16} /> Upgrade Package
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
                fontWeight: 800,
                color: '#0f172a',
              }}
            >
              <div style={{ background: 'linear-gradient(135deg, #059669, #10b981)', padding: '0.4rem', borderRadius: '8px', color: '#fff' }}>
                <FiFileText size={18} />
              </div>
              Application History
            </h3>
            <button
              onClick={() => navigate('/check-status')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.5rem 1rem',
                borderRadius: '10px',
                border: '1px solid rgba(0, 0, 0, 0.05)',
                background: '#ffffff',
                color: '#0f172a',
                fontWeight: 700,
                fontSize: '0.85rem',
                cursor: 'pointer',
                transition: 'all 0.2s',
                boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = '#f1f5f9'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = '#f8fafc'; }}
            >
              Track Status <FiChevronRight size={14} />
            </button>
          </div>

          {/* Vibrant Table styling inside the soft card */}
          <div style={{ overflowX: 'auto', background: 'rgba(255,255,255,0.4)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.8)' }}>
            <table
              style={{
                width: '100%',
                borderCollapse: 'collapse',
                fontSize: '0.9rem',
              }}
            >
              <thead>
                <tr style={{ background: '#e3f0fe' }}>
                  {['Reference', 'Application Type', 'Date', 'Status', 'Actions'].map((h) => (
                    <th
                      key={h}
                      style={{
                        textAlign: h === 'Actions' ? 'center' : 'left',
                        padding: '1rem',
                        fontWeight: 800,
                        fontSize: '0.75rem',
                        color: '#0056b3',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                        borderBottom: '2px solid rgba(0, 86, 179, 0.2)',
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
                        borderBottom: '1px solid rgba(226, 232, 240, 0.4)',
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
                      <td style={{ padding: '1rem', fontWeight: 800, color: '#0056b3' }}>
                        {app.referenceNumber}
                      </td>
                      <td style={{ padding: '1rem', color: '#1e293b', fontWeight: 600 }}>
                        {SERVICE_TYPE_LABELS[app.serviceType] || app.serviceType}
                      </td>
                      <td style={{ padding: '1rem', color: '#64748b', fontWeight: 600 }}>
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
                            fontWeight: 800,
                            color: s.color,
                            backgroundColor: s.bg,
                            border: `1px solid ${s.color}20`,
                          }}
                        >
                          {s.icon}
                          {s.label}
                        </span>
                      </td>
                      <td style={{ padding: '1rem', textAlign: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                          <button
                            title="View Application Details"
                            onClick={() => setSelectedAppForView(app)}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              width: '32px',
                              height: '32px',
                              borderRadius: '8px',
                              border: '1px solid rgba(0, 86, 179, 0.2)',
                              background: '#ffffff',
                              color: '#0056b3',
                              cursor: 'pointer',
                              transition: 'all 0.2s',
                              boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
                            }}
                            onMouseEnter={(e) => { e.currentTarget.style.background = '#e3f0fe'; e.currentTarget.style.borderColor = '#0056b3'; }}
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
                              borderRadius: '8px',
                              border: '1px solid rgba(16, 185, 129, 0.2)',
                              background: '#ffffff',
                              color: '#10b981',
                              cursor: 'pointer',
                              transition: 'all 0.2s',
                              boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
                            }}
                            onMouseEnter={(e) => { e.currentTarget.style.background = '#ecfdf5'; e.currentTarget.style.borderColor = '#10b981'; }}
                            onMouseLeave={(e) => { e.currentTarget.style.background = '#ffffff'; e.currentTarget.style.borderColor = 'rgba(16, 185, 129, 0.2)'; }}
                          >
                            <FiMessageSquare size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {!loadingApplications && applications.length === 0 && (
                  <tr>
                    <td colSpan={5} style={{ padding: '2rem 1rem', textAlign: 'center', color: '#94a3b8', fontWeight: 600 }}>
                      No applications submitted yet.
                    </td>
                  </tr>
                )}
                {loadingApplications && (
                  <tr>
                    <td colSpan={5} style={{ padding: '2rem 1rem', textAlign: 'center', color: '#94a3b8', fontWeight: 600 }}>
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
                backgroundColor: '#f8fafc',
                borderRadius: '8px',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
                border: '1px solid #cbd5e1',
              }}
            >
              {/* PDF Header */}
              <div style={{ background: '#334155', padding: '1rem 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#fff' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <FiFileText size={20} />
                  <span style={{ fontWeight: 600, fontSize: '1.05rem' }}>Application_{selectedAppForView.referenceNumber}.pdf</span>
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <button style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }} title="Download PDF">
                    <FiDownload size={20} />
                  </button>
                  <button onClick={() => setSelectedAppForView(null)} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }} title="Close">
                    <FiX size={20} />
                  </button>
                </div>
              </div>

              {/* PDF Body (The Document) */}
              <div style={{ flex: 1, overflowY: 'auto', padding: '1rem', display: 'block', backgroundColor: '#e2e8f0', minWidth: 0, boxSizing: 'border-box' }}>
                <div
                  style={{
                    width: '100%',
                    maxWidth: '650px',
                    margin: '0 auto',
                    background: '#fff',
                    padding: '2rem',
                    boxSizing: 'border-box',
                    boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
                    border: '1px solid #cbd5e1',
                    borderRadius: '4px',
                    overflow: 'hidden',
                  }}
                >
                  <div style={{ textAlign: 'center', marginBottom: '2.5rem', borderBottom: '2px solid #0056b3', paddingBottom: '1.5rem', boxSizing: 'border-box' }}>
                    <h2 style={{ margin: '0 0 0.5rem', color: '#0056b3', fontSize: '1.5rem', fontWeight: 800 }}>SLTMobitel</h2>
                    <h3 style={{ margin: 0, color: '#334155', fontSize: '1.1rem' }}>Official Service Application</h3>
                  </div>

                  <div style={{ marginBottom: '2rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                      <strong style={{ color: '#64748b', fontSize: '0.9rem' }}>Reference No:</strong>
                      <span style={{ fontWeight: 700, color: '#0f172a' }}>{selectedAppForView.referenceNumber}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                      <strong style={{ color: '#64748b', fontSize: '0.9rem' }}>Service Type:</strong>
                      <span style={{ fontWeight: 700, color: '#0f172a' }}>{SERVICE_TYPE_LABELS[selectedAppForView.serviceType] || selectedAppForView.serviceType}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                      <strong style={{ color: '#64748b', fontSize: '0.9rem' }}>Date Submitted:</strong>
                      <span style={{ fontWeight: 700, color: '#0f172a' }}>{new Date(selectedAppForView.createdAt).toLocaleString()}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                      <strong style={{ color: '#64748b', fontSize: '0.9rem' }}>Current Status:</strong>
                      <span style={{ fontWeight: 700, color: '#0f172a' }}>{statusConfig[selectedAppForView.status]?.label || selectedAppForView.status}</span>
                    </div>
                  </div>

                  {/* Dynamic Fields payload */}
                  <div style={{ marginTop: '2.5rem' }}>
                    <h4 style={{ color: '#0056b3', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.5rem', marginBottom: '1rem' }}>Application Data</h4>
                    <div style={{ background: '#f8fafc', padding: '1rem 1.5rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                      {Object.entries(selectedAppForView.formData || selectedAppForView)
                        .filter(([k, v]) => {
                          const excludeKeys = ['_id', '__v', 'createdAt', 'updatedAt', 'adminComments', 'referenceNumber', 'status', 'serviceType', 'formData', 'documents', 'signature', 'declarationAccepted'];
                          if (excludeKeys.includes(k)) return false;
                          if (k.toLowerCase().includes('vas_')) return false;
                          return true;
                        })
                        .map(([key, val]) => {
                          if (val === null || val === undefined || val === '') return null;
                          return (
                            <div key={key} style={{ display: 'flex', borderBottom: '1px solid #e2e8f0', padding: '0.85rem 0' }}>
                              <strong style={{ width: '40%', color: '#64748b', fontSize: '0.9rem' }}>{formatKey(key)}:</strong>
                              <span style={{ width: '60%', color: '#0f172a', fontWeight: 600, wordBreak: 'break-word', fontSize: '0.9rem' }}>
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
                backgroundColor: '#ffffff',
                borderRadius: '20px',
                padding: '2rem',
                boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
                border: '1px solid #e2e8f0',
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
                  color: '#64748b',
                }}
              >
                <FiX size={18} />
              </button>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                <div style={{ background: 'linear-gradient(135deg, rgb(0, 31, 63) 0%, rgb(0, 59, 115) 45%, rgb(0, 77, 56) 85%, rgb(1, 41, 30) 100%)', padding: '0.6rem', borderRadius: '12px', color: '#fff' }}>
                  <FiMessageSquare size={22} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>Admin Messages</h3>
                  <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>Ref: {selectedAppForComments.referenceNumber}</p>
                </div>
              </div>

              <div style={{ background: '#ffffff', borderRadius: '16px', padding: '1.5rem', border: '1px solid #e2e8f0', minHeight: '120px' }}>
                {selectedAppForComments.adminComments && selectedAppForComments.adminComments.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {selectedAppForComments.adminComments.map((comment, i) => (
                      <div key={i} style={{ background: '#f8fafc', padding: '1rem', borderRadius: '12px', borderLeft: '4px solid #10b981' }}>
                        <p style={{ margin: '0 0 0.5rem', fontSize: '0.9rem', color: '#1e293b' }}>{comment.text || comment.message || comment}</p>
                        <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600 }}>From Administrator</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#94a3b8', gap: '0.5rem' }}>
                    <FiCheckCircle size={32} style={{ opacity: 0.5 }} />
                    <span style={{ fontWeight: 600, fontSize: '0.95rem' }}>No messages from admin yet.</span>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}