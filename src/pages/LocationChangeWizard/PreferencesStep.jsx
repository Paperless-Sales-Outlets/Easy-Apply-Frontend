import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import {
  FiCalendar,
  FiSliders,
  FiPhoneCall,
  FiUserCheck,
  FiUploadCloud,
  FiCheckCircle,
  FiCheck,
  FiFileText,
} from 'react-icons/fi';

export default function PreferencesStep({
  isActive,
  selectedServiceType = 'FTTH',
  customerType = 'business',
  onValidationChange,
  onDataChange,
  showValidationErrors = false,
}) {
  const { t } = useTranslation();

  const onValidationChangeRef = useRef(onValidationChange);
  const onDataChangeRef = useRef(onDataChange);

  useEffect(() => {
    onValidationChangeRef.current = onValidationChange;
    onDataChangeRef.current = onDataChange;
  }, [onValidationChange, onDataChange]);

  // State Management
  const [relocationDate, setRelocationDate] = useState('');
  const [disconnectDate, setDisconnectDate] = useState('');
  const [disconnectAction, setDisconnectAction] = useState('all');
  const [keptServices, setKeptServices] = useState({
    incoming: false,
    outgoing: false,
    broadband: false,
    peoTv: false,
  });

  const [callForwarding, setCallForwarding] = useState('no');
  const [forwardingDuration, setForwardingDuration] = useState('');

  const [sltNumber1, setSltNumber1] = useState('');
  const [sltNumber2, setSltNumber2] = useState('');

  const [isRepresentative, setIsRepresentative] = useState('no');
  const [authLetter, setAuthLetter] = useState(null);
  const [brcFile, setBrcFile] = useState(null);

  // Errors state
  const [errors, setErrors] = useState({});

  // Minimum date selection for preferred relocation date (Today onwards)
  const today = new Date().toISOString().split('T')[0];

  const validatePhoneNumber = (value) => {
    return /^\d{10}$/.test(value);
  };

  const handlePhone1Change = (e) => {
    const val = e.target.value.replace(/\D/g, '').slice(0, 10);
    setSltNumber1(val);
    if (val && !validatePhoneNumber(val)) {
      setErrors((prev) => ({ ...prev, sltNumber1: 'Must be exactly 10 digits' }));
    } else {
      setErrors((prev) => ({ ...prev, sltNumber1: null }));
    }
  };

  const handlePhone2Change = (e) => {
    const val = e.target.value.replace(/\D/g, '').slice(0, 10);
    setSltNumber2(val);
    if (val && !validatePhoneNumber(val)) {
      setErrors((prev) => ({ ...prev, sltNumber2: 'Must be exactly 10 digits' }));
    } else {
      setErrors((prev) => ({ ...prev, sltNumber2: null }));
    }
  };

  const handleCheckboxChange = (serviceKey) => {
    setKeptServices((prev) => ({ ...prev, [serviceKey]: !prev[serviceKey] }));
  };

  const isFTTHOrMegaline = ['FTTH', 'Megaline'].includes(selectedServiceType);
  const isAuthLetterValid = isRepresentative !== 'yes' || Boolean(authLetter);
  const isBrcValid = customerType !== 'business' || Boolean(brcFile);
  const isSltNumber1Valid = !isFTTHOrMegaline || validatePhoneNumber(sltNumber1);
  const isSltNumber2Valid = !sltNumber2 || validatePhoneNumber(sltNumber2);
  const isSltNumbersValid = isSltNumber1Valid && isSltNumber2Valid;
  const isRelocationDateValid = Boolean(relocationDate);
  const isDisconnectDateValid = Boolean(disconnectDate);

  const isStepValid = isRelocationDateValid && isDisconnectDateValid && isSltNumbersValid && isAuthLetterValid && isBrcValid;

  useEffect(() => {
    if (onValidationChangeRef.current) {
      onValidationChangeRef.current(isStepValid);
    }
  }, [isStepValid]);

  useEffect(() => {
    if (onDataChangeRef.current) {
      onDataChangeRef.current({
        relocationDate,
        disconnectDate,
        disconnectAction,
        keptServices,
        callForwarding,
        forwardingDuration,
        sltNumber1,
        sltNumber2,
        isRepresentative,
        authLetter,
        brcFile,
      });
    }
  }, [relocationDate, disconnectDate, disconnectAction, keptServices, callForwarding, forwardingDuration, sltNumber1, sltNumber2, isRepresentative, authLetter, brcFile]);

  return (
    <div style={{ width: '100%', margin: '0 auto', fontFamily: 'inherit' }}>
      {/* ────────────────────────────────────────────────────────── */}
      {/* 1. Preferred Relocation & Disconnect Dates Card */}
      {/* ────────────────────────────────────────────────────────── */}
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          padding: '1.75rem 2rem',
          marginBottom: '1.75rem',
          border: '1px solid #e2e8f0',
          boxShadow: '0 8px 30px rgba(0, 0, 0, 0.04)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '1.25rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.85rem' }}>
          <div style={{ backgroundColor: '#eff6ff', color: '#0056b3', width: '34px', height: '34px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <FiCalendar size={18} />
          </div>
          <h4 style={{ margin: 0, color: '#0f172a', fontSize: '1.1rem', fontWeight: 800 }}>
            1. Preferred Relocation & Disconnect Timeline
          </h4>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.25rem' }}>
          <div>
            <label style={{ fontWeight: 700, fontSize: '0.85rem', color: '#334155', display: 'block', marginBottom: '0.4rem' }}>
              Preferred Relocation Date <span style={{ color: '#dc2626' }}>*</span>
            </label>
            <input
              type="date"
              min={today}
              value={relocationDate}
              onChange={(e) => setRelocationDate(e.target.value)}
              required={isActive}
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                borderRadius: '10px',
                border: showValidationErrors && !relocationDate ? '1.5px solid #dc2626' : '1px solid #cbd5e1',
                backgroundColor: showValidationErrors && !relocationDate ? '#fef2f2' : '#ffffff',
                fontSize: '0.9rem',
                fontWeight: 700,
                color: '#0f172a',
                outline: 'none',
              }}
            />
            {showValidationErrors && !relocationDate && (
              <span style={{ fontSize: '0.8rem', color: '#dc2626', marginTop: '4px', display: 'block', fontWeight: 700 }}>
                Preferred Relocation Date is required.
              </span>
            )}
          </div>

          <div>
            <label style={{ fontWeight: 700, fontSize: '0.85rem', color: '#334155', display: 'block', marginBottom: '0.4rem' }}>
              Disconnect Date <span style={{ color: '#dc2626' }}>*</span>
            </label>
            <input
              type="date"
              value={disconnectDate}
              onChange={(e) => setDisconnectDate(e.target.value)}
              required={isActive}
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                borderRadius: '10px',
                border: showValidationErrors && !disconnectDate ? '1.5px solid #dc2626' : '1px solid #cbd5e1',
                backgroundColor: showValidationErrors && !disconnectDate ? '#fef2f2' : '#ffffff',
                fontSize: '0.9rem',
                fontWeight: 700,
                color: '#0f172a',
                outline: 'none',
              }}
            />
            {showValidationErrors && !disconnectDate && (
              <span style={{ fontSize: '0.8rem', color: '#dc2626', marginTop: '4px', display: 'block', fontWeight: 700 }}>
                Disconnect Date is required.
              </span>
            )}
          </div>
        </div>
      </div>

      {/* ────────────────────────────────────────────────────────── */}
      {/* 2. Present Services Options Card */}
      {/* ────────────────────────────────────────────────────────── */}
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          padding: '1.75rem 2rem',
          marginBottom: '1.75rem',
          border: '1px solid #e2e8f0',
          boxShadow: '0 8px 30px rgba(0, 0, 0, 0.04)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '1.25rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.85rem' }}>
          <div style={{ backgroundColor: '#eff6ff', color: '#0056b3', width: '34px', height: '34px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <FiSliders size={18} />
          </div>
          <h4 style={{ margin: 0, color: '#0f172a', fontSize: '1.1rem', fontWeight: 800 }}>
            2. Present Services Action ({selectedServiceType || 'FTTH'})
          </h4>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem', marginBottom: '1.25rem' }}>
          {/* Option A */}
          <div
            onClick={() => setDisconnectAction('all')}
            style={{
              backgroundColor: disconnectAction === 'all' ? '#eff6ff' : '#ffffff',
              border: disconnectAction === 'all' ? '2px solid #0056b3' : '1.5px solid #cbd5e1',
              borderRadius: '14px',
              padding: '1.15rem 1.25rem',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '0.75rem',
            }}
          >
            <input
              type="radio"
              name="disconnectAction"
              value="all"
              checked={disconnectAction === 'all'}
              onChange={() => setDisconnectAction('all')}
              style={{ marginTop: '0.2rem', cursor: 'pointer' }}
            />
            <div>
              <div style={{ fontWeight: 800, fontSize: '0.92rem', color: '#0f172a' }}>
                Disconnect all existing services immediately
              </div>
              <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '0.2rem', fontWeight: 500 }}>
                Disconnect voice, broadband, and PEO TV at current address upon transfer request.
              </div>
            </div>
          </div>

          {/* Option B */}
          <div
            onClick={() => setDisconnectAction('keep')}
            style={{
              backgroundColor: disconnectAction === 'keep' ? '#eff6ff' : '#ffffff',
              border: disconnectAction === 'keep' ? '2px solid #0056b3' : '1.5px solid #cbd5e1',
              borderRadius: '14px',
              padding: '1.15rem 1.25rem',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '0.75rem',
            }}
          >
            <input
              type="radio"
              name="disconnectAction"
              value="keep"
              checked={disconnectAction === 'keep'}
              onChange={() => setDisconnectAction('keep')}
              style={{ marginTop: '0.2rem', cursor: 'pointer' }}
            />
            <div>
              <div style={{ fontWeight: 800, fontSize: '0.92rem', color: '#0f172a' }}>
                Keep specified services until new line active
              </div>
              <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '0.2rem', fontWeight: 500 }}>
                Maintain temporary active services at current address until installation completes.
              </div>
            </div>
          </div>
        </div>

        {disconnectAction === 'keep' && (
          <div
            style={{
              padding: '1.25rem',
              backgroundColor: '#f8fafc',
              border: '1px solid #cbd5e1',
              borderRadius: '12px',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
              gap: '0.85rem',
            }}
          >
            {[
              { key: 'incoming', label: 'Incoming Calls' },
              { key: 'outgoing', label: 'Outgoing Calls' },
              { key: 'broadband', label: 'Fibre Broadband' },
              { key: 'peoTv', label: 'PEO TV Pack' },
            ].map(({ key, label }) => (
              <label
                key={key}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.65rem 0.85rem',
                  backgroundColor: keptServices[key] ? '#dcfce7' : '#ffffff',
                  border: keptServices[key] ? '1.5px solid #16a34a' : '1px solid #cbd5e1',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  color: keptServices[key] ? '#15803d' : '#334155',
                  transition: 'all 0.15s ease',
                }}
              >
                <input
                  type="checkbox"
                  checked={keptServices[key]}
                  onChange={() => handleCheckboxChange(key)}
                  style={{ cursor: 'pointer' }}
                />
                <span>{label}</span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* ────────────────────────────────────────────────────────── */}
      {/* 3. Call Forwarding Facility Card */}
      {/* ────────────────────────────────────────────────────────── */}
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          padding: '1.75rem 2rem',
          marginBottom: '1.75rem',
          border: '1px solid #e2e8f0',
          boxShadow: '0 8px 30px rgba(0, 0, 0, 0.04)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.5rem' }}>
          <div style={{ backgroundColor: '#fef3c7', color: '#d97706', width: '34px', height: '34px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <FiPhoneCall size={18} />
          </div>
          <h4 style={{ margin: 0, color: '#0f172a', fontSize: '1.1rem', fontWeight: 800 }}>
            3. Call Forwarding Facility (Charges Applicable)
          </h4>
        </div>

        <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '1.25rem', fontWeight: 500 }}>
          Automatically transfer incoming calls from your existing telephone number to your new number during relocation.
        </p>

        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
          {['yes', 'no'].map((opt) => (
            <div
              key={opt}
              onClick={() => setCallForwarding(opt)}
              style={{
                flex: 1,
                padding: '0.85rem 1.25rem',
                borderRadius: '12px',
                border: callForwarding === opt ? '2px solid #0056b3' : '1.5px solid #cbd5e1',
                backgroundColor: callForwarding === opt ? '#eff6ff' : '#ffffff',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.65rem',
                fontWeight: 800,
                fontSize: '0.9rem',
                color: callForwarding === opt ? '#0056b3' : '#334155',
              }}
            >
              <input
                type="radio"
                name="callForwarding"
                value={opt}
                checked={callForwarding === opt}
                onChange={() => setCallForwarding(opt)}
                style={{ cursor: 'pointer' }}
              />
              <span>{opt === 'yes' ? 'Yes, Activate Call Forwarding' : 'No Call Forwarding Needed'}</span>
            </div>
          ))}
        </div>

        {callForwarding === 'yes' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '1rem', backgroundColor: '#f8fafc', padding: '1rem', borderRadius: '10px', border: '1px solid #cbd5e1' }}>
            <span style={{ fontSize: '0.88rem', fontWeight: 700, color: '#334155' }}>
              Forwarding Duration Required:
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', maxWidth: '160px' }}>
              <input
                type="number"
                min="1"
                max="12"
                placeholder="e.g. 3"
                value={forwardingDuration}
                onChange={(e) => setForwardingDuration(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.55rem 0.85rem',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.9rem',
                  fontWeight: 800,
                  color: '#0f172a',
                  outline: 'none',
                }}
              />
              <span style={{ fontSize: '0.88rem', fontWeight: 700, color: '#64748b' }}>Months</span>
            </div>
          </div>
        )}
      </div>

      {/* ────────────────────────────────────────────────────────── */}
      {/* 4. Nearest SLT Connection Lines Card */}
      {/* ────────────────────────────────────────────────────────── */}
      {isFTTHOrMegaline && (
        <div
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            padding: '1.75rem 2rem',
            marginBottom: '1.75rem',
            border: '1px solid #e2e8f0',
            boxShadow: '0 8px 30px rgba(0, 0, 0, 0.04)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '1.25rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.85rem' }}>
            <div style={{ backgroundColor: '#eff6ff', color: '#0056b3', width: '34px', height: '34px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <FiPhoneCall size={18} />
            </div>
            <h4 style={{ margin: 0, color: '#0f172a', fontSize: '1.1rem', fontWeight: 800 }}>
              4. Nearest SLT Telephone Connection Lines (DP Feasibility)
            </h4>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.25rem' }}>
            <div>
              <label style={{ fontWeight: 700, fontSize: '0.85rem', color: '#334155', display: 'block', marginBottom: '0.4rem' }}>
                Nearest SLT Telephone Number 1 <span style={{ color: '#dc2626' }}>*</span>
              </label>
              <input
                type="text"
                placeholder="e.g., 0112345678"
                value={sltNumber1}
                onChange={handlePhone1Change}
                required={isActive && isFTTHOrMegaline}
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  borderRadius: '10px',
                  border: errors.sltNumber1 ? '1.5px solid #dc2626' : '1px solid #cbd5e1',
                  backgroundColor: errors.sltNumber1 ? '#fef2f2' : '#ffffff',
                  fontSize: '0.9rem',
                  fontWeight: 700,
                  color: '#0f172a',
                  outline: 'none',
                }}
              />
              {errors.sltNumber1 && (
                <span style={{ fontSize: '0.8rem', color: '#dc2626', marginTop: '4px', display: 'block', fontWeight: 700 }}>
                  ⚠️ {errors.sltNumber1}
                </span>
              )}
            </div>

            <div>
              <label style={{ fontWeight: 700, fontSize: '0.85rem', color: '#334155', display: 'block', marginBottom: '0.4rem' }}>
                Nearest SLT Telephone Number 2 <span style={{ color: '#64748b', fontWeight: 500, fontSize: '0.8rem' }}>(Optional)</span>
              </label>
              <input
                type="text"
                placeholder="e.g., 0112345679"
                value={sltNumber2}
                onChange={handlePhone2Change}
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  borderRadius: '10px',
                  border: errors.sltNumber2 ? '1.5px solid #dc2626' : '1px solid #cbd5e1',
                  backgroundColor: errors.sltNumber2 ? '#fef2f2' : '#ffffff',
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  color: '#0f172a',
                  outline: 'none',
                }}
              />
              {errors.sltNumber2 && (
                <span style={{ fontSize: '0.8rem', color: '#dc2626', marginTop: '4px', display: 'block', fontWeight: 700 }}>
                  ⚠️ {errors.sltNumber2}
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ────────────────────────────────────────────────────────── */}
      {/* 5. Legal Ownership & Representative Authorization Card */}
      {/* ────────────────────────────────────────────────────────── */}
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          padding: '1.75rem 2rem',
          marginBottom: '1.75rem',
          border: '1px solid #e2e8f0',
          boxShadow: '0 8px 30px rgba(0, 0, 0, 0.04)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '1.25rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.85rem' }}>
          <div style={{ backgroundColor: '#f0fdf4', color: '#16a34a', width: '34px', height: '34px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <FiUserCheck size={18} />
          </div>
          <h4 style={{ margin: 0, color: '#0f172a', fontSize: '1.1rem', fontWeight: 800 }}>
            5. Legal Ownership & Representative Declaration
          </h4>
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ fontWeight: 700, fontSize: '0.88rem', color: '#334155', display: 'block', marginBottom: '0.75rem' }}>
            Are you applying on behalf of the Legal Owner?
          </label>

          <div style={{ display: 'flex', gap: '1rem' }}>
            {['yes', 'no'].map((opt) => (
              <div
                key={opt}
                onClick={() => setIsRepresentative(opt)}
                style={{
                  flex: 1,
                  padding: '0.85rem 1.25rem',
                  borderRadius: '12px',
                  border: isRepresentative === opt ? '2px solid #0056b3' : '1.5px solid #cbd5e1',
                  backgroundColor: isRepresentative === opt ? '#eff6ff' : '#ffffff',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.65rem',
                  fontWeight: 800,
                  fontSize: '0.9rem',
                  color: isRepresentative === opt ? '#0056b3' : '#334155',
                }}
              >
                <input
                  type="radio"
                  name="isRepresentative"
                  value={opt}
                  checked={isRepresentative === opt}
                  onChange={() => setIsRepresentative(opt)}
                  style={{ cursor: 'pointer' }}
                />
                <span>{opt === 'yes' ? 'Yes, I am an Authorized Representative' : 'No, I am the Legal Owner'}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Authorization Letter Upload */}
        {isRepresentative === 'yes' && (
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ fontWeight: 700, fontSize: '0.85rem', color: '#334155', display: 'block', marginBottom: '0.5rem' }}>
              Authorization Letter <span style={{ color: '#dc2626' }}>*</span>
            </label>

            <label
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '1.5rem',
                border: authLetter ? '2px stroke #10b981' : '2px dashed #93c5fd',
                borderRadius: '12px',
                backgroundColor: authLetter ? '#f0fdf4' : '#f8fafc',
                cursor: 'pointer',
              }}
            >
              <input
                type="file"
                accept=".pdf,.png,.jpg,.jpeg"
                style={{ display: 'none' }}
                onChange={(e) => setAuthLetter(e.target.files[0])}
              />
              <FiUploadCloud size={30} style={{ color: authLetter ? '#16a34a' : '#0056b3', marginBottom: '0.5rem' }} />
              {authLetter ? (
                <div style={{ textAlign: 'center' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#15803d', display: 'block' }}>
                    {authLetter.name}
                  </span>
                  <span style={{ fontSize: '0.72rem', color: '#166534', fontWeight: 600 }}>File Uploaded</span>
                </div>
              ) : (
                <div style={{ textAlign: 'center' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#0056b3', display: 'block' }}>
                    Upload Signed Authorization Letter
                  </span>
                  <span style={{ fontSize: '0.72rem', color: '#64748b' }}>Letter signed by legal owner (PDF, JPG up to 5MB)</span>
                </div>
              )}
            </label>
          </div>
        )}

        {/* BRC Upload for Business Type */}
        {customerType === 'business' && (
          <div>
            <label style={{ fontWeight: 700, fontSize: '0.85rem', color: '#334155', display: 'block', marginBottom: '0.5rem' }}>
              Business Registration Certificate (BRC) <span style={{ color: '#dc2626' }}>*</span>
            </label>

            <label
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '1.5rem',
                border: brcFile ? '2px stroke #10b981' : '2px dashed #93c5fd',
                borderRadius: '12px',
                backgroundColor: brcFile ? '#f0fdf4' : '#f8fafc',
                cursor: 'pointer',
              }}
            >
              <input
                type="file"
                accept=".pdf,.png,.jpg,.jpeg"
                style={{ display: 'none' }}
                onChange={(e) => setBrcFile(e.target.files[0])}
              />
              <FiUploadCloud size={30} style={{ color: brcFile ? '#16a34a' : '#0056b3', marginBottom: '0.5rem' }} />
              {brcFile ? (
                <div style={{ textAlign: 'center' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#15803d', display: 'block' }}>
                    {brcFile.name}
                  </span>
                  <span style={{ fontSize: '0.72rem', color: '#166534', fontWeight: 600 }}>File Uploaded</span>
                </div>
              ) : (
                <div style={{ textAlign: 'center' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#0056b3', display: 'block' }}>
                    Upload Business Registration Certificate (BRC)
                  </span>
                  <span style={{ fontSize: '0.72rem', color: '#64748b' }}>Official BRC Document (PDF, JPG up to 5MB)</span>
                </div>
              )}
            </label>
            {showValidationErrors && customerType === 'business' && !brcFile && (
              <span style={{ fontSize: '0.8rem', color: '#dc2626', marginTop: '4px', display: 'block', fontWeight: 700 }}>
                Business Registration Certificate is required.
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}