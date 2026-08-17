import React, { useState, forwardRef, useImperativeHandle } from 'react';
import { useTranslation } from 'react-i18next';
import {
  FiWifi,
  FiTv,
  FiPlusCircle,
  FiPhone,
  FiGlobe,
  FiMail,
  FiMonitor,
} from 'react-icons/fi';

const SERVICES = [
  { id: 'broadband', label: 'SLT Broadband Internet (ADSL/Wi-Max)', icon: FiWifi },
  { id: 'peoTv', label: 'PeoTV', icon: FiTv },
  { id: 'sltPlus', label: 'SLT Plus', icon: FiPlusCircle },
  { id: 'cli', label: 'CLI', icon: FiPhone },
  { id: 'idd', label: 'IDD', icon: FiGlobe },
  { id: 'email', label: 'Email', icon: FiMail },
  { id: 'dialUp', label: 'Dial-up Internet', icon: FiMonitor },
];

const ReconnectionDetailsStep = forwardRef(function ReconnectionDetailsStep({ isActive }, ref) {
  const { t } = useTranslation();

  const [selectedServices, setSelectedServices] = useState(['broadband']);
  const [otherChecked, setOtherChecked] = useState(false);
  const [otherRemarks, setOtherRemarks] = useState('');
  const [facilityError, setFacilityError] = useState(false);

  const toggleService = (id) => {
    setSelectedServices((prev) => {
      const next = prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id];
      if (next.length > 0) setFacilityError(false);
      return next;
    });
  };

  useImperativeHandle(ref, () => ({
    validate: () => {
      if (selectedServices.length === 0 && !otherChecked) {
        setFacilityError(true);
        return false;
      }
      return true;
    },
  }));

  return (
    <div>
      <h3 style={{ color: 'var(--slt-blue, #0F57A8)', marginBottom: '0.4rem', fontWeight: '800' }}>
        2. Required Services
      </h3>
      <p style={{ color: '#64748B', fontSize: '0.95rem', marginBottom: '1.75rem', fontWeight: '600' }}>
        Which services would you like to reactivate?
      </p>

      {/* Services Tiles Grid matching Screenshot 2 */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1rem',
          marginBottom: '1.75rem',
        }}
      >
        {SERVICES.map((srv) => {
          const IconComp = srv.icon;
          const isSelected = selectedServices.includes(srv.id);

          return (
            <div
              key={srv.id}
              onClick={() => toggleService(srv.id)}
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '16px',
                border: isSelected ? '2px solid #0F57A8' : '1px solid #E2E8F0',
                padding: '1.25rem 1rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.85rem',
                boxShadow: isSelected
                  ? '0 6px 16px rgba(15, 87, 168, 0.15)'
                  : '0 2px 8px rgba(0, 0, 0, 0.02)',
                transition: 'all 0.2s ease',
              }}
            >
              <div
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '12px',
                  backgroundColor: isSelected ? '#EFF6FF' : '#F1F5F9',
                  color: isSelected ? '#0F57A8' : '#64748B',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <IconComp size={20} />
              </div>

              <span
                style={{
                  fontSize: '0.88rem',
                  fontWeight: isSelected ? '700' : '600',
                  color: isSelected ? '#0F172A' : '#475569',
                  lineHeight: '1.3',
                }}
              >
                {srv.label}
              </span>
            </div>
          );
        })}
      </div>

      {/* Other Checkbox & Remarks */}
      <div style={{ marginBottom: '1.5rem' }}>
        <label style={{ display: 'inline-flex', alignItems: 'center', gap: '0.6rem', cursor: 'pointer', fontWeight: '600', fontSize: '0.92rem', color: '#1E293B' }}>
          <input
            type="checkbox"
            checked={otherChecked}
            onChange={(e) => setOtherChecked(e.target.checked)}
            style={{ width: '18px', height: '18px', accentColor: '#0F57A8' }}
          />
          <span>Other</span>
        </label>

        {otherChecked && (
          <div style={{ marginTop: '0.75rem' }}>
            <label className="form-label">Other remarks:</label>
            <textarea
              className="form-control"
              rows={3}
              placeholder="Specify additional services or special requests..."
              value={otherRemarks}
              onChange={(e) => setOtherRemarks(e.target.value)}
            />
          </div>
        )}
      </div>

      {facilityError && (
        <p style={{ color: '#EF4444', fontSize: '0.88rem', fontWeight: '600', marginBottom: '1rem' }}>
          Please select at least one service to reactivate.
        </p>
      )}
    </div>
  );
});

export default ReconnectionDetailsStep;
