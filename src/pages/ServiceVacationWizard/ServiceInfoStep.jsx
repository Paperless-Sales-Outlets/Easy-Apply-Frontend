import React, { useState, forwardRef, useImperativeHandle } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import Icon from '../../components/Icon';
import toast from 'react-hot-toast';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

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

const FacilityCard = ({ id, icon, label, checked, onChange, disabled, disabledMessage }) => (
  <motion.label 
    variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
    onClick={(e) => {
      if (disabled) {
        e.preventDefault();
        if (disabledMessage) {
          toast(disabledMessage, { position: 'top-center' });
        }
      }
    }}
    whileHover={!disabled ? { scale: 1.02, y: -4, borderColor: 'rgba(15, 87, 168, 0.5)', boxShadow: '0 12px 28px rgba(15, 87, 168, 0.15)' } : {}}
    whileTap={!disabled ? { scale: 0.98 } : {}}
    style={{ 
      display: 'flex', alignItems: 'center', gap: '1rem', 
      padding: '1.25rem', borderRadius: '16px', 
      border: checked ? '2px solid var(--slt-blue)' : '1px solid rgba(255,255,255,0.6)',
      background: disabled ? 'rgba(248, 250, 252, 0.6)' : (checked ? 'rgba(15, 87, 168, 0.05)' : 'rgba(255, 255, 255, 0.6)'),
      backdropFilter: 'blur(12px)',
      WebkitBackdropFilter: 'blur(12px)',
      boxShadow: checked ? '0 0 20px rgba(15, 87, 168, 0.25), 0 12px 24px rgba(15, 87, 168, 0.15)' : '0 4px 20px rgba(31, 38, 135, 0.05)',
      cursor: disabled ? 'not-allowed' : 'pointer', 
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      position: 'relative', overflow: 'hidden',
      opacity: disabled ? 0.7 : 1
    }}
  >
    <input type="checkbox" name={`facility_${id}`} style={{ display: 'none' }} checked={checked} onChange={() => !disabled && onChange(id)} disabled={disabled} />
    
    <div style={{ 
      width: '48px', height: '48px', borderRadius: '50%', display: 'grid', placeItems: 'center', 
      backgroundColor: disabled ? '#e2e8f0' : (checked ? 'var(--slt-blue)' : 'rgba(15, 87, 168, 0.08)'), 
      color: disabled ? '#94a3b8' : (checked ? '#ffffff' : 'var(--slt-blue)'), 
      transition: 'all 0.3s ease' 
    }}>
      <Icon name={icon} size={22} />
    </div>

    <span style={{ fontWeight: 600, fontSize: '1.05rem', flex: 1, color: disabled ? '#64748b' : (checked ? 'var(--slt-blue)' : 'var(--text-primary)'), transition: 'color 0.3s' }}>
      {label}
    </span>
    
    <div style={{
      width: '24px', height: '24px', borderRadius: '50%',
      border: disabled ? '2px solid #cbd5e1' : (checked ? '2px solid var(--slt-blue)' : '2px solid #e2e8f0'),
      backgroundColor: disabled ? '#f1f5f9' : (checked ? 'var(--slt-blue)' : 'transparent'),
      display: 'grid', placeItems: 'center',
      transition: 'all 0.2s ease',
      flexShrink: 0
    }}>
      <AnimatePresence>
        {disabled && (
          <motion.div initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} style={{ color: '#94a3b8', display: 'flex' }}>
            <Icon name="lock" size={12} strokeWidth={3} />
          </motion.div>
        )}
        {checked && !disabled && (
          <motion.div initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0, opacity: 0 }} style={{ color: '#fff', display: 'flex' }}>
            <Icon name="check" size={14} strokeWidth={3} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  </motion.label>
);

const ServiceInfoStep = forwardRef(({ isActive }, ref) => {
  const { t } = useTranslation();
  
  const [checkedFacilities, setCheckedFacilities] = useState({
    voice: false,
    broadband: false,
    peotv: false,
  });

  const [deactivationDate, setDeactivationDate] = useState(null);
  const [resumeDate, setResumeDate] = useState(null);
  const [dateError, setDateError] = useState('');

  const toggleFacility = (key) => {
    setCheckedFacilities(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const validateDates = (start, end) => {
    if (!start || !end) return true;
    const startDate = new Date(start);
    const endDate = new Date(end);
    
    if (endDate <= startDate) {
      setDateError('Resume date must be after deactivation date.');
      return false;
    }

    const diffTime = Math.abs(endDate - startDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    // Approx 4 months = 122 days
    if (diffDays > 122) {
      setDateError('Service deactivation period cannot exceed 4 months.');
      return false;
    }

    setDateError('');
    return true;
  };

  useImperativeHandle(ref, () => ({
    validate: () => {
      const anyChecked = Object.values(checkedFacilities).some(Boolean);
      if (!anyChecked) {
        toast.error('Please select at least one facility to vacate.', { position: 'top-center' });
        return false;
      }
      if (!deactivationDate || !resumeDate) {
        toast.error('Please select both deactivation and resume dates.', { position: 'top-center' });
        return false;
      }
      if (!validateDates(deactivationDate, resumeDate)) {
        toast.error(dateError || 'Invalid vacation period.', { position: 'top-center' });
        return false;
      }
      return true;
    }
  }));

  // Calculate min date (tomorrow)
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDeactivationDate = tomorrow.toISOString().split('T')[0];

  return (
    <div>
      <h3 style={{ color: 'var(--slt-blue)', marginBottom: '1.5rem' }}>Vacation Details</h3>
      
      <div style={{ marginBottom: '2.5rem' }}>
        <h4 style={{ color: 'var(--text-primary)', marginBottom: '1rem', fontSize: '1.1rem' }}>Services to Vacate</h4>
        <motion.div 
          initial="hidden" animate="visible"
          variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
          style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.25rem' }}
        >
          <FacilityCard 
            id="voice" 
            icon="phone" 
            label="Voice" 
            checked={false} 
            onChange={toggleFacility} 
            disabled={true}
            disabledMessage="Voice connections cannot be vacated per company policy." 
          />
          <FacilityCard id="broadband" icon="wifi" label="Broadband" checked={checkedFacilities.broadband} onChange={toggleFacility} />
          <FacilityCard id="peotv" icon="tv" label="PEO TV" checked={checkedFacilities.peotv} onChange={toggleFacility} />
        </motion.div>

        <AnimatePresence>
          {(checkedFacilities.broadband || checkedFacilities.peotv) && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }} 
              animate={{ opacity: 1, height: 'auto' }} 
              exit={{ opacity: 0, height: 0 }}
              style={{ overflow: 'hidden', marginTop: '1rem' }}
            >
              <div style={{ 
                display: 'flex', alignItems: 'flex-start', gap: '0.75rem', 
                padding: '1rem', backgroundColor: 'rgba(15, 87, 168, 0.05)', 
                border: '1px solid rgba(15, 87, 168, 0.1)', borderRadius: '12px',
                color: 'var(--slt-blue)'
              }}>
                <Icon name="info" size={20} style={{ flexShrink: 0, marginTop: '2px' }} />
                <p style={{ margin: 0, fontSize: '0.9rem', lineHeight: '1.4' }}>
                  <strong>Note:</strong> Telephone line rental will continue to be charged during the vacation period for Megaline and SLT Fibre services.
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div style={{ marginBottom: '2.5rem' }}>
        <h4 style={{ color: 'var(--text-primary)', marginBottom: '0.5rem', fontSize: '1.1rem' }}>Service Deactivation Period</h4>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--slt-blue)', backgroundColor: 'rgba(15, 87, 168, 0.08)', padding: '0.75rem 1rem', borderRadius: '8px', marginBottom: '1.5rem' }}>
          <Icon name="info" size={18} />
          <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>Note: Service deactivation period shall not exceed 4 months.</span>
        </div>

        <div className="form-group flex flex-col-mobile gap-4 modern-calendar-wrapper">
          <DatePickerStyles />
          <div style={{ flex: '1' }}>
            <label className="form-label" htmlFor="sv-deactivationDate" style={{ fontWeight: 600 }}>Deactivation Date</label>
            <DatePicker 
              selected={deactivationDate}
              onChange={(date) => {
                setDeactivationDate(date);
                validateDates(date, resumeDate);
              }}
              minDate={new Date(minDeactivationDate)}
              dateFormat="MMMM d, yyyy"
              placeholderText="Select deactivation date"
              id="sv-deactivationDate"
              className="modern-datepicker-input"
              wrapperClassName="datepicker-full-width"
              required={isActive}
            />
            <input 
              type="hidden" 
              name="deactivationDate" 
              value={deactivationDate ? deactivationDate.toLocaleDateString('en-CA') : ''} 
            />
          </div>
          <div style={{ flex: '1' }}>
            <label className="form-label" htmlFor="sv-resumeDate" style={{ fontWeight: 600 }}>Resume Date</label>
            <DatePicker 
              selected={resumeDate}
              onChange={(date) => {
                setResumeDate(date);
                validateDates(deactivationDate, date);
              }}
              minDate={deactivationDate || new Date(minDeactivationDate)}
              dateFormat="MMMM d, yyyy"
              placeholderText="Select resume date"
              id="sv-resumeDate"
              className="modern-datepicker-input"
              wrapperClassName="datepicker-full-width"
              required={isActive}
            />
            <input 
              type="hidden" 
              name="resumeDate" 
              value={resumeDate ? resumeDate.toLocaleDateString('en-CA') : ''} 
            />
          </div>
        </div>
        {dateError && (
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ color: 'var(--danger)', fontSize: '0.9rem', marginTop: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Icon name="alert-circle" size={16} />
            {dateError}
          </motion.p>
        )}
      </div>

    </div>
  );
});

ServiceInfoStep.displayName = 'ServiceInfoStep';
export default ServiceInfoStep;
