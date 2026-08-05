import React, { useState, forwardRef, useImperativeHandle } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import Icon from '../../components/Icon';

const FacilityCard = ({ id, icon, label, checked, onChange }) => (
  <motion.label 
    whileHover={{ scale: 1.02, y: -2 }}
    whileTap={{ scale: 0.98 }}
    style={{ 
      display: 'flex', alignItems: 'center', gap: '1rem', 
      padding: '1rem', borderRadius: '12px', 
      border: checked ? '2px solid var(--blue)' : '2px solid var(--line)',
      backgroundColor: checked ? 'rgba(15, 87, 168, 0.05)' : 'var(--surface)',
      boxShadow: checked ? '0 8px 16px rgba(15, 87, 168, 0.12)' : '0 2px 4px rgba(0,0,0,0.02)',
      cursor: 'pointer', transition: 'all 0.3s ease'
    }}
  >
    <input type="checkbox" name={`facility_${id}`} style={{ display: 'none' }} checked={checked} onChange={() => onChange(id)} />
    <div style={{ width: '40px', height: '40px', borderRadius: '8px', display: 'grid', placeItems: 'center', backgroundColor: checked ? 'var(--blue)' : 'var(--paper)', color: checked ? '#fff' : 'var(--muted)', transition: 'all 0.3s' }}>
      <Icon name={icon} size={20} />
    </div>
    <span style={{ fontWeight: 600, flex: 1, color: checked ? 'var(--blue)' : 'var(--text)', transition: 'color 0.3s' }}>{label}</span>
    <AnimatePresence>
      {checked && (
        <motion.div initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0, opacity: 0 }} style={{ color: 'var(--blue)' }}>
          <Icon name="check-circle" size={20} />
        </motion.div>
      )}
    </AnimatePresence>
  </motion.label>
);

const ReconnectionDetailsStep = forwardRef(function ReconnectionDetailsStep({ isActive, reconnectionData }, ref) {
  const { t } = useTranslation();

  const [checkedFacilities, setCheckedFacilities] = useState({});
  const [otherChecked, setOtherChecked] = useState(false);
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
      <h3 style={{ color: 'var(--slt-blue)', marginBottom: '1.5rem' }}>{t('wizards.reconnection.reconnectionDetails.heading')}</h3>

      {/* Facilities — at least one required */}
      <h4 style={{ marginTop: '1rem', marginBottom: '1rem', color: 'var(--text-primary)' }}>
        {t('wizards.reconnection.reconnectionDetails.facilitiesHeading')}
      </h4>

      <div className="form-group">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
          
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

          <FacilityCard id="peoTv" icon="tv" label={t('wizards.reconnection.reconnectionDetails.peoTv')} checked={!!checkedFacilities['peoTv']} onChange={toggleFacility} />
          <FacilityCard id="sltPlus" icon="plus-circle" label={t('wizards.reconnection.reconnectionDetails.sltPlus')} checked={!!checkedFacilities['sltPlus']} onChange={toggleFacility} />
          <FacilityCard id="cli" icon="phone" label={t('wizards.reconnection.reconnectionDetails.cli')} checked={!!checkedFacilities['cli']} onChange={toggleFacility} />
          <FacilityCard id="idd" icon="globe" label={t('wizards.reconnection.reconnectionDetails.idd')} checked={!!checkedFacilities['idd']} onChange={toggleFacility} />

          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <FacilityCard id="email" icon="mail" label={t('wizards.reconnection.reconnectionDetails.email')} checked={!!checkedFacilities['email']} onChange={toggleFacility} />
            <AnimatePresence>
              {checkedFacilities['email'] && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} style={{ overflow: 'hidden' }}>
                  <div className="form-group" style={{ padding: '0.75rem 0 0 0' }}>
                    <input type="text" name="emailUsername" className="form-control" style={{ backgroundColor: 'rgba(15, 87, 168, 0.02)', border: '1px solid rgba(15, 87, 168, 0.2)' }} placeholder="Email Username *" required={isActive && checkedFacilities['email']} />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <FacilityCard id="dialUp" icon="monitor" label={t('wizards.reconnection.reconnectionDetails.dialUp')} checked={!!checkedFacilities['dialUp']} onChange={toggleFacility} />
            <AnimatePresence>
              {checkedFacilities['dialUp'] && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} style={{ overflow: 'hidden' }}>
                  <div className="form-group" style={{ padding: '0.75rem 0 0 0' }}>
                    <input type="text" name="dialUpUsername" className="form-control" style={{ backgroundColor: 'rgba(15, 87, 168, 0.02)', border: '1px solid rgba(15, 87, 168, 0.2)' }} placeholder="Dial-up Username *" required={isActive && checkedFacilities['dialUp']} />
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

      {/* Other — specify field appears below when checked */}
      <div className="form-group mt-5">
        <label className="checkbox-label" style={{ fontSize: '1.05rem', fontWeight: 600 }}>
          <input
            type="checkbox"
            name="facility_other"
            className="checkbox-input"
            checked={otherChecked}
            onChange={() => setOtherChecked(v => !v)}
          /> {t('wizards.reconnection.reconnectionDetails.other')}
        </label>
        <AnimatePresence>
        {otherChecked && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            style={{ overflow: 'hidden' }}
          >
            <div className="form-group mt-3" style={{ paddingLeft: '1.75rem' }}>
              <label className="form-label">{t('wizards.reconnection.reconnectionDetails.specify')} <span style={{ color: 'var(--danger, #dc3545)' }}>*</span></label>
            <input type="text" name="otherService" className="form-control" required={isActive && otherChecked} />
            </div>
          </motion.div>
        )}
        </AnimatePresence>
      </div>

      {/* Remarks — optional */}
      <div className="form-group mt-4">
        <label className="form-label">{t('wizards.reconnection.reconnectionDetails.remarks')}</label>
        <textarea className="form-control" rows="3"></textarea>
      </div>

    </div>
  );
});

export default ReconnectionDetailsStep;
