import React from 'react';
import { useTranslation } from 'react-i18next';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import {
  FiCalendar,
  FiFileText,
  FiArrowRight,
  FiCheckCircle,
  FiInfo,
  FiZap,
  FiClock,
  FiShield,
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
      height: 54px;
      font-size: 1rem;
      font-weight: 600;
      background: #ffffff;
      border: 1.5px solid #cbd5e1;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(15, 23, 42, 0.04);
      width: 100%;
      padding: 0.5rem 1rem 0.5rem 2.85rem;
      color: #0f172a;
      transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    }
    .modern-calendar-wrapper .modern-datepicker-input:focus {
      border-color: #0056b3;
      box-shadow: 0 0 0 4px rgba(0, 86, 179, 0.12);
      outline: none;
      background: #ffffff;
    }
    .modern-calendar-wrapper .modern-datepicker-input.input-error {
      border: 1.5px solid #dc2626 !important;
      background-color: #fef2f2 !important;
    }
    
    /* Calendar Popup UI */
    .modern-calendar-wrapper .react-datepicker {
      font-family: inherit;
      border: 1px solid rgba(226, 232, 240, 0.9);
      border-radius: 20px;
      background: #ffffff;
      box-shadow: 0 20px 40px rgba(15, 87, 168, 0.16), 0 4px 12px rgba(0,0,0,0.06);
      padding: 1.25rem;
      z-index: 50;
    }
    .modern-calendar-wrapper .react-datepicker__header {
      background: transparent;
      border-bottom: 1px dashed rgba(203, 213, 225, 0.8);
      padding-bottom: 0.75rem;
    }
    .modern-calendar-wrapper .react-datepicker__current-month {
      color: #0056b3;
      font-size: 1.1rem;
      font-weight: 800;
      margin-bottom: 0.6rem;
    }
    .modern-calendar-wrapper .react-datepicker__day-name {
      color: #64748b;
      font-weight: 700;
      width: 2.4rem;
      margin: 0.15rem;
    }
    .modern-calendar-wrapper .react-datepicker__day {
      width: 2.4rem;
      line-height: 2.4rem;
      border-radius: 50%;
      transition: all 0.2s ease;
      color: #1e293b;
      font-weight: 600;
      margin: 0.15rem;
    }
    .modern-calendar-wrapper .react-datepicker__day:hover:not(.react-datepicker__day--disabled) {
      background: rgba(0, 174, 239, 0.15);
      color: #0056b3;
      border-radius: 50%;
    }
    .modern-calendar-wrapper .react-datepicker__day--selected,
    .modern-calendar-wrapper .react-datepicker__day--keyboard-selected {
      background: linear-gradient(135deg, #0056b3, #00aeef) !important;
      color: #ffffff !important;
      border-radius: 50%;
      box-shadow: 0 4px 12px rgba(0, 174, 239, 0.35);
    }
    .modern-calendar-wrapper .react-datepicker__day--disabled {
      color: #cbd5e1;
    }
    .modern-calendar-wrapper .react-datepicker__navigation-icon::before {
      border-color: #0056b3;
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

export default function PackageDetailsStep({
  isActive,
  customerPackage,
  requiredPackage,
  effectiveDate,
  setEffectiveDate,
  remarks,
  setRemarks,
  showValidationErrors,
}) {
  const { t } = useTranslation();
  const selectedDate = parseDate(effectiveDate);

  const handleDateChange = (date) => {
    setEffectiveDate(formatDate(date));
  };

  return (
    <div style={{ width: '100%', margin: '0 auto' }}>
      <DatePickerStyles />

      {/* Step Header */}
      <div style={{ marginBottom: '1.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.35rem' }}>
          <div
            style={{
              backgroundColor: '#eff6ff',
              color: '#0056b3',
              width: '36px',
              height: '36px',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <FiCalendar size={20} />
          </div>
          <h3 style={{ margin: 0, color: '#0056b3', fontSize: '1.3rem', fontWeight: 800 }}>
            {t('wizards.packageMigration.packageDetails.heading', 'Step 2 – Upgradation Schedule')}
          </h3>
        </div>
        <p style={{ margin: 0, color: '#64748b', fontSize: '0.92rem', paddingLeft: '2.8rem' }}>
          Specify your preferred effective date and any special instructions for activating your upgraded package.
        </p>
      </div>

      {/* Package Upgrade Transition Comparison Card */}
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          padding: '1.75rem 2rem',
          border: '1.5px solid #e2e8f0',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.04)',
          marginBottom: '1.75rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.25rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.85rem' }}>
          <FiZap size={18} style={{ color: '#0284c7' }} />
          <h4 style={{ margin: 0, color: '#0f172a', fontSize: '1.05rem', fontWeight: 800 }}>
            Service Upgradation Overview
          </h4>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: '1.25rem',
            alignItems: 'center',
          }}
        >
          {/* Current Connected Package */}
          <div
            style={{
              backgroundColor: '#f8fafc',
              border: '1.5px solid #e2e8f0',
              borderRadius: '14px',
              padding: '1.25rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Current Package
              </span>
              <span style={{ fontSize: '0.72rem', backgroundColor: '#e2e8f0', color: '#475569', padding: '0.2rem 0.55rem', borderRadius: '9999px', fontWeight: 700 }}>
                Active
              </span>
            </div>
            <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#1e293b', marginBottom: '0.4rem' }}>
              {customerPackage?.packageName || customerPackage?.currentPackage || customerPackage?.package || 'N/A'}
            </div>
            <div style={{ fontSize: '0.85rem', color: '#64748b', display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
              {customerPackage?.speed && (
                <span><strong>Speed:</strong> {customerPackage.speed}</span>
              )}
              {customerPackage?.telephone && (
                <span><strong>Line:</strong> {customerPackage.telephone}</span>
              )}
            </div>
          </div>

          {/* Upgraded Target Package */}
          <div
            style={{
              backgroundColor: '#eff6ff',
              border: '1.5px solid #93c5fd',
              borderRadius: '14px',
              padding: '1.25rem',
              position: 'relative',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#0056b3', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Upgrading To
              </span>
              <span style={{ fontSize: '0.72rem', backgroundColor: '#dcfce7', color: '#15803d', padding: '0.2rem 0.6rem', borderRadius: '9999px', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <FiCheckCircle size={11} /> Upgraded
              </span>
            </div>
            <div style={{ fontSize: '1.08rem', fontWeight: 800, color: '#0056b3', marginBottom: '0.4rem' }}>
              {requiredPackage || 'No package selected'}
            </div>
            <div style={{ fontSize: '0.82rem', color: '#0284c7', fontWeight: 600 }}>
              Higher Bandwidth &middot; Enhanced Experience
            </div>
          </div>
        </div>
      </div>

      {/* Date & Schedule Card */}
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          padding: '1.75rem 2rem',
          border: '1.5px solid #e2e8f0',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.04)',
          marginBottom: '1.75rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.25rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.85rem' }}>
          <FiClock size={18} style={{ color: '#0056b3' }} />
          <h4 style={{ margin: 0, color: '#0f172a', fontSize: '1.05rem', fontWeight: 800 }}>
            Preferred Activation Schedule
          </h4>
        </div>

        {/* Modern DatePicker Input */}
        <div className="modern-calendar-wrapper" style={{ marginBottom: '1.5rem' }}>
          <label
            htmlFor="pm-effectiveDate"
            style={{ fontWeight: 700, fontSize: '0.9rem', color: '#1e293b', display: 'block', marginBottom: '0.5rem' }}
          >
            {t('wizards.packageMigration.packageDetails.effectiveDate', 'Effective Date')} <span style={{ color: '#dc2626' }}>*</span>
          </label>

          <div style={{ position: 'relative', width: '100%' }}>
            <div
              style={{
                position: 'absolute',
                left: '1rem',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#0056b3',
                pointerEvents: 'none',
                zIndex: 2,
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <FiCalendar size={19} />
            </div>

            <DatePicker
              selected={selectedDate}
              onChange={handleDateChange}
              minDate={new Date()}
              dateFormat="MMMM d, yyyy"
              placeholderText="Select preferred effective date"
              id="pm-effectiveDate"
              className={`modern-datepicker-input ${showValidationErrors && !effectiveDate ? 'input-error' : ''}`}
              wrapperClassName="datepicker-full-width"
              required={isActive}
            />
          </div>

          <input type="hidden" name="effectiveDate" value={effectiveDate} />

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.5rem', color: '#64748b', fontSize: '0.82rem' }}>
            <FiInfo size={14} style={{ flexShrink: 0, color: '#0284c7' }} />
            <span>Date from which new package features & billing will apply (today or a future date).</span>
          </div>

          {showValidationErrors && !effectiveDate && (
            <div style={{ color: '#dc2626', fontSize: '0.84rem', marginTop: '0.4rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <span>Effective Date is required.</span>
            </div>
          )}
        </div>

        {/* Remarks Section */}
        <div>
          <label
            htmlFor="pm-remarks"
            style={{ fontWeight: 700, fontSize: '0.9rem', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '0.45rem', marginBottom: '0.5rem' }}
          >
            <FiFileText size={16} style={{ color: '#64748b' }} />
            <span>{t('wizards.packageMigration.packageDetails.remarks', 'Additional Remarks / Special Instructions')}</span>
            <span style={{ fontSize: '0.78rem', color: '#94a3b8', fontWeight: 500 }}>(Optional)</span>
          </label>
          <textarea
            id="pm-remarks"
            name="remarks"
            rows="3"
            className="form-control"
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            placeholder="Any specific instructions or preferences regarding the service upgradation..."
            style={{
              width: '100%',
              padding: '0.85rem 1rem',
              borderRadius: '12px',
              border: '1.5px solid #cbd5e1',
              fontSize: '0.92rem',
              fontFamily: 'inherit',
              transition: 'all 0.2s ease',
              outline: 'none',
              resize: 'vertical',
            }}
            onFocus={(e) => (e.target.style.borderColor = '#0056b3')}
            onBlur={(e) => (e.target.style.borderColor = '#cbd5e1')}
          />
        </div>
      </div>
    </div>
  );
}
