import React, { useState, forwardRef, useImperativeHandle } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import Icon from '../../components/Icon';

const FacilityCard = ({ id, icon, label, checked, onChange }) => (
  <motion.label
    whileHover={{
      scale: 1.02,
      y: -4,
      borderColor: 'rgba(15, 87, 168, 0.5)',
      boxShadow: '0 12px 28px rgba(15, 87, 168, 0.15)',
    }}
    whileTap={{ scale: 0.98 }}
    style={{
      display: 'flex', alignItems: 'center', gap: '1rem',
      padding: '1.25rem', borderRadius: '16px', minHeight: '92px', boxSizing: 'border-box',
      border: checked ? '2px solid var(--slt-blue)' : '1px solid rgba(0,0,0,0.06)',
      backgroundColor: checked ? 'rgba(15, 87, 168, 0.03)' : '#ffffff',
      boxShadow: checked ? '0 12px 24px rgba(15, 87, 168, 0.15)' : '0 4px 20px rgba(0,0,0,0.04)',
      cursor: 'pointer', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      position: 'relative', overflow: 'hidden'
    }}
  >
    <input type="checkbox" name={`facility_${id}`} style={{ display: 'none' }} checked={checked} onChange={() => onChange(id)} />

    {/* Soft Circular Icon Background */}
    <div style={{
      width: '48px', height: '48px', borderRadius: '50%', display: 'grid', placeItems: 'center',
      backgroundColor: checked ? 'var(--slt-blue)' : 'rgba(15, 87, 168, 0.08)',
      color: checked ? '#ffffff' : 'var(--slt-blue)',
      transition: 'all 0.3s ease'
    }}>
      <Icon name={icon} size={22} />
    </div>

    <span style={{
      fontWeight: 600, fontSize: '1.05rem', flex: 1, color: checked ? 'var(--slt-blue)' : 'var(--text-primary)', transition: 'color 0.3s',
    }}>
      {label}
    </span>

    {/* Modern Circular Checkbox Indicator */}
    <div style={{
      width: '24px', height: '24px', borderRadius: '50%',
      border: checked ? '2px solid var(--slt-blue)' : '2px solid #e2e8f0',
      backgroundColor: checked ? 'var(--slt-blue)' : 'transparent',
      display: 'grid', placeItems: 'center',
      transition: 'all 0.2s ease',
      flexShrink: 0
    }}>
      <AnimatePresence>
        {checked && (
          <motion.div initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0, opacity: 0 }} style={{ color: '#fff', display: 'flex' }}>
            <Icon name="check" size={14} strokeWidth={3} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  </motion.label>
);

const ReconnectionDetailsStep = forwardRef(function ReconnectionDetailsStep({ isActive, reconnectionData }, ref) {
  const { t } = useTranslation();

  const [checkedFacilities, setCheckedFacilities] = useState({});
  const [facilityError, setFacilityError] = useState(false);

  const anyFacilityChecked = Object.values(checkedFacilities).some(Boolean);

  const toggleFacility = (key) => {
    setCheckedFacilities(prev => {
      const next = { ...prev, [key]: !prev[key] };
      if (Object.values(next).some(Boolean)) setFacilityError(false);
      return next;
    });
  };

  // Expose validate() so the parent wizard can call it before advancing
  useImperativeHandle(ref, () => ({
    validate: () => {
      if (!anyFacilityChecked) {
        setFacilityError(true);
        toast.error(t('wizards.reconnection.reconnectionDetails.selectFacilityError', 'Please select at least one facility to reconnect'));
        return false;
      }
      return true;
    },
  }));

  return (
    <div>
      <h3 style={{ color: 'var(--slt-blue)', marginBottom: '1.5rem' }}>Select Services to Reactivate</h3>

      {/* Facilities — at least one required */}
      <div className="form-group">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>

          <FacilityCard id="voice" icon="phone" label={t('wizards.reconnection.reconnectionDetails.voice', 'Voice (Telephone)')} checked={!!checkedFacilities['voice']} onChange={toggleFacility} />
          <FacilityCard id="peoTv" icon="tv" label={t('wizards.reconnection.reconnectionDetails.peoTv')} checked={!!checkedFacilities['peoTv']} onChange={toggleFacility} />

          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <FacilityCard id="broadband" icon="wifi" label={t('wizards.reconnection.reconnectionDetails.broadband')} checked={!!checkedFacilities['broadband']} onChange={toggleFacility} />
            <AnimatePresence>
              {checkedFacilities['broadband'] && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} style={{ overflow: 'hidden' }}>
                  <div className="form-group" style={{ padding: '0.75rem 0 0 0' }}>
                    <input type="text" name="broadbandUsername" className="form-control" style={{ backgroundColor: 'rgba(15, 87, 168, 0.02)', border: '1px solid rgba(15, 87, 168, 0.2)' }} placeholder="Broadband Username *" defaultValue={reconnectionData?.broadbandUsername || ''} required={isActive && checkedFacilities['broadband']} />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

        </div>

        {/* Inline error shown when user tries to advance without selecting */}
        {facilityError && (
          <p style={{ color: 'var(--danger, #dc3545)', fontSize: '0.85rem', marginTop: '0.75rem' }}>
            {t('wizards.reconnection.reconnectionDetails.facilitiesRequired') || 'Please select at least one facility.'}
          </p>
        )}
      </div>

      {reconnectionData && (
        <>
          <hr style={{ margin: '3rem 0', borderColor: 'var(--line)' }} />

          {/* Hidden fields to preserve form submission data */}
          <input type="hidden" name="telephone" value={reconnectionData.telephone || ''} />
          <input type="hidden" name="fullName" value={reconnectionData.fullName || ''} />
          <input type="hidden" name="nic" value={reconnectionData.nic || ''} />
          <input type="hidden" name="addressLine1" value={reconnectionData.addressLine1 || ''} />
          <input type="hidden" name="addressLine2" value={reconnectionData.addressLine2 || ''} />
          <input type="hidden" name="amountToPay" value={reconnectionData.outstandingBalance || 0} />

          <div style={{ padding: '1.5rem', backgroundColor: 'rgba(0,166,80,0.05)', border: '1px solid rgba(0,166,80,0.2)', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h4 style={{ margin: '0 0 0.5rem 0', color: 'var(--text-primary)' }}>Reconnection Cart</h4>
              <p style={{ margin: 0, color: 'var(--text-secondary)' }}>Pending dues for <strong>{reconnectionData.fullName}</strong></p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <p style={{ margin: '0 0 0.25rem 0', fontSize: '0.85rem', textTransform: 'uppercase', color: 'var(--text-secondary)' }}>Total to Pay</p>
              <h2 style={{ margin: 0, color: '#0f7a4d' }}>Rs. {(reconnectionData.outstandingBalance || 0).toLocaleString()}</h2>
            </div>
          </div>
        </>
      )}

    </div>
  );
});

export default ReconnectionDetailsStep;
