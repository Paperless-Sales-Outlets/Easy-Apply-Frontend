import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
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

const DatePickerStyles = () => (
  <style>{`
    .modern-calendar-wrapper {
      position: relative;
    }
    .modern-calendar-wrapper .datepicker-full-width {
      width: 100%;
      display: block;
    }
    .modern-calendar-wrapper .modern-datepicker-input {
      height: 56px;
      font-size: 1.1rem;
      background: rgba(255, 255, 255, 0.5);
      backdrop-filter: blur(8px);
      -webkit-backdrop-filter: blur(8px);
      border: 1px solid rgba(255, 255, 255, 0.6);
      border-radius: 12px;
      box-shadow: 0 4px 12px rgba(31, 38, 135, 0.05);
      width: 100%;
      padding: 0.375rem 1rem;
      color: var(--text-primary);
      transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    }
    .modern-calendar-wrapper .modern-datepicker-input:focus {
      border-color: var(--slt-blue);
      box-shadow: 0 0 0 4px rgba(15, 87, 168, 0.1);
      outline: none;
      background: rgba(255, 255, 255, 0.8);
    }
    .modern-calendar-wrapper .modern-datepicker-input.input-error {
      border: 1.5px solid #dc2626 !important;
      background-color: #fef2f2 !important;
    }
    
    /* Calendar Popup UI */
    .modern-calendar-wrapper .react-datepicker {
      font-family: inherit;
      border: 1px solid rgba(255, 255, 255, 0.8);
      border-radius: 24px;
      background: rgba(255, 255, 255, 0.85);
      backdrop-filter: blur(24px);
      -webkit-backdrop-filter: blur(24px);
      box-shadow: 0 16px 40px rgba(0, 84, 166, 0.15), inset 0 4px 10px rgba(255,255,255,1);
      padding: 1.5rem;
      border-top-left-radius: 4px; /* Slight tip to indicate popover */
    }
    .modern-calendar-wrapper .react-datepicker__header {
      background: transparent;
      border-bottom: 1px dashed rgba(0, 0, 0, 0.1);
      padding-bottom: 0.75rem;
    }
    .modern-calendar-wrapper .react-datepicker__current-month {
      color: var(--slt-blue);
      font-size: 1.15rem;
      font-weight: 700;
      margin-bottom: 0.75rem;
    }
    .modern-calendar-wrapper .react-datepicker__day-name {
      color: var(--text-secondary);
      font-weight: 600;
      width: 2.5rem;
      margin: 0.2rem;
    }
    .modern-calendar-wrapper .react-datepicker__day {
      width: 2.5rem;
      line-height: 2.5rem;
      border-radius: 50%;
      transition: all 0.2s ease;
      color: var(--text-primary);
      font-weight: 500;
      margin: 0.2rem;
    }
    .modern-calendar-wrapper .react-datepicker__day:hover:not(.react-datepicker__day--disabled) {
      background: rgba(0, 174, 239, 0.15);
      color: var(--slt-blue);
      border-radius: 50%;
    }
    .modern-calendar-wrapper .react-datepicker__day--selected,
    .modern-calendar-wrapper .react-datepicker__day--keyboard-selected {
      background: linear-gradient(135deg, var(--slt-blue), #00AEEF) !important;
      color: white !important;
      border-radius: 50%;
      box-shadow: 0 4px 12px rgba(0, 174, 239, 0.3);
    }
    .modern-calendar-wrapper .react-datepicker__day--disabled {
      color: rgba(0,0,0,0.25);
    }
    .modern-calendar-wrapper .react-datepicker__navigation-icon::before {
      border-color: var(--slt-blue);
      border-width: 2.5px 2.5px 0 0;
    }
    .modern-calendar-wrapper .react-datepicker__triangle {
      display: none;
    }
  `}</style>
);

const parseDate = (val) => {
  if (!val) return null;
  if (val instanceof Date) return isNaN(val.getTime()) ? null : val;
  if (typeof val === 'string') {
    const parts = val.split('-');
    if (parts.length === 3) {
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const day = parseInt(parts[2], 10);
      const d = new Date(year, month, day);
      return isNaN(d.getTime()) ? null : d;
    }
    const d = new Date(val);
    return isNaN(d.getTime()) ? null : d;
  }
  return null;
};

const formatDate = (val) => {
  if (!val) return '';
  if (val instanceof Date && !isNaN(val.getTime())) {
    const year = val.getFullYear();
    const month = String(val.getMonth() + 1).padStart(2, '0');
    const day = String(val.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
  if (typeof val === 'string') return val;
  return '';
};

export default function PreferencesStep({
  isActive,
  formData = {},
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
  const [relocationDate, setRelocationDate] = useState(() => parseDate(formData?.relocationDate));
  const [disconnectDate, setDisconnectDate] = useState(() => parseDate(formData?.disconnectDate));
  const [disconnectAction, setDisconnectAction] = useState('all');
  const [keptServices, setKeptServices] = useState({
    incoming: false,
    outgoing: false,
    broadband: false,
    peoTv: false,
  });

  const [callForwarding, setCallForwarding] = useState('no');
  const [forwardingDuration, setForwardingDuration] = useState('');

  const [brcFile, setBrcFile] = useState(null);

  const formattedRelocationDate = formatDate(relocationDate);
  const formattedDisconnectDate = formatDate(disconnectDate);

  const handleCheckboxChange = (serviceKey) => {
    setKeptServices((prev) => ({ ...prev, [serviceKey]: !prev[serviceKey] }));
  };

  const isBrcValid = customerType !== 'business' || Boolean(brcFile);
  const isRelocationDateValid = Boolean(relocationDate);
  const isDisconnectDateValid = Boolean(disconnectDate);

  const isStepValid = isRelocationDateValid && isDisconnectDateValid && isBrcValid;

  useEffect(() => {
    if (onValidationChangeRef.current) {
      onValidationChangeRef.current(isStepValid);
    }
  }, [isStepValid]);

  useEffect(() => {
    if (onDataChangeRef.current) {
      onDataChangeRef.current({
        relocationDate: formattedRelocationDate,
        disconnectDate: formattedDisconnectDate,
        disconnectAction,
        keptServices,
        callForwarding,
        forwardingDuration,
        brcFile,
      });
    }
  }, [formattedRelocationDate, formattedDisconnectDate, disconnectAction, keptServices, callForwarding, forwardingDuration, brcFile]);

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
          <div style={{ backgroundColor: '#eff6ff', color: '#0056b3', width: '34px', height: '34px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <FiCalendar size={18} />
          </div>
          <h4 style={{ margin: 0, color: '#0f172a', fontSize: '1.1rem', fontWeight: 800 }}>
            Preferred Relocation & Disconnect Timeline
          </h4>
        </div>

        <div className="modern-calendar-wrapper" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.25rem' }}>
          <DatePickerStyles />
          <div style={{ flex: '1' }}>
            <label htmlFor="rel-relocationDate" style={{ fontWeight: 700, fontSize: '0.85rem', color: '#334155', display: 'block', marginBottom: '0.4rem' }}>
              Preferred Relocation Date <span style={{ color: '#dc2626' }}>*</span>
            </label>
            <DatePicker
              selected={relocationDate}
              onChange={(date) => setRelocationDate(date)}
              minDate={new Date()}
              dateFormat="MMMM d, yyyy"
              placeholderText="Select preferred relocation date"
              id="rel-relocationDate"
              className={`modern-datepicker-input ${showValidationErrors && !relocationDate ? 'input-error' : ''}`}
              wrapperClassName="datepicker-full-width"
              required={isActive}
            />
            <input
              type="hidden"
              name="relocationDate"
              value={formattedRelocationDate}
            />
            {showValidationErrors && !relocationDate && (
              <span style={{ fontSize: '0.8rem', color: '#dc2626', marginTop: '4px', display: 'block', fontWeight: 700 }}>
                Preferred Relocation Date is required.
              </span>
            )}
          </div>

          <div style={{ flex: '1' }}>
            <label htmlFor="rel-disconnectDate" style={{ fontWeight: 700, fontSize: '0.85rem', color: '#334155', display: 'block', marginBottom: '0.4rem' }}>
              Disconnect Date <span style={{ color: '#dc2626' }}>*</span>
            </label>
            <DatePicker
              selected={disconnectDate}
              onChange={(date) => setDisconnectDate(date)}
              dateFormat="MMMM d, yyyy"
              placeholderText="Select disconnect date"
              id="rel-disconnectDate"
              className={`modern-datepicker-input ${showValidationErrors && !disconnectDate ? 'input-error' : ''}`}
              wrapperClassName="datepicker-full-width"
              required={isActive}
            />
            <input
              type="hidden"
              name="disconnectDate"
              value={formattedDisconnectDate}
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
          <div style={{ backgroundColor: '#eff6ff', color: '#0056b3', width: '34px', height: '34px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <FiSliders size={18} />
          </div>
          <h4 style={{ margin: 0, color: '#0f172a', fontSize: '1.1rem', fontWeight: 800 }}>
            Present Services Action ({selectedServiceType || 'FTTH'})
          </h4>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem', marginBottom: '1.25rem' }}>
          {/* Option A */}
          <div
            onClick={() => setDisconnectAction('all')}
            style={{
              backgroundColor: disconnectAction === 'all' ? '#eff6ff' : '#ffffff',
              border: disconnectAction === 'all' ? '2px solid #0056b3' : '1.5px solid #cbd5e1',
              borderRadius: '16px',
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
              borderRadius: '16px',
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
                  borderRadius: '12px',
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
          <div style={{ backgroundColor: '#fef3c7', color: '#d97706', width: '34px', height: '34px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <FiPhoneCall size={18} />
          </div>
          <h4 style={{ margin: 0, color: '#0f172a', fontSize: '1.1rem', fontWeight: 800 }}>
            Call Forwarding Facility (Charges Applicable)
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '1rem', backgroundColor: '#f8fafc', padding: '1rem', borderRadius: '12px', border: '1px solid #cbd5e1' }}>
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
      {/* 5. Business Registration Card (business customers only) */}
      {/* ────────────────────────────────────────────────────────── */}
      {customerType === 'business' && (
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
            <div style={{ backgroundColor: '#f0fdf4', color: '#16a34a', width: '34px', height: '34px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <FiUserCheck size={18} />
            </div>
            <h4 style={{ margin: 0, color: '#0f172a', fontSize: '1.1rem', fontWeight: 800 }}>
              Business Registration
            </h4>
          </div>

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
          {showValidationErrors && !brcFile && (
            <span style={{ fontSize: '0.8rem', color: '#dc2626', marginTop: '4px', display: 'block', fontWeight: 700 }}>
              Business Registration Certificate is required.
            </span>
          )}
        </div>
      )}
    </div>
  );
}
