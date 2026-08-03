import React, { useState, forwardRef, useImperativeHandle } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import Icon from '../../components/Icon';

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

      {/* Disconnection date range */}
      <div className="form-group flex flex-col-mobile gap-4 items-center">
        <label className="form-label" style={{ margin: 0, flexShrink: 0 }}>
          {t('wizards.reconnection.reconnectionDetails.disconnectedFrom')}
        </label>
        <input type="date" name="disconnectedFrom" className="form-control" style={{ flex: '1' }} required={isActive} value={reconnectionData?.disconnectedFrom || ''} readOnly />
        <span style={{ padding: '0 0.5rem' }}>{t('wizards.reconnection.reconnectionDetails.disconnectedTo')}</span>
        <input type="date" name="disconnectedTo" className="form-control" style={{ flex: '1' }} required={isActive} value={reconnectionData?.disconnectedTo || ''} readOnly />
      </div>

      {/* Amount to pay */}
      <div className="form-group flex gap-4 items-center">
        <label className="form-label" style={{ margin: 0 }}>
          {t('wizards.reconnection.reconnectionDetails.amountToPay')}
        </label>
        <input type="text" name="amountToPay" className="form-control" style={{ maxWidth: '200px' }} required={isActive} value={reconnectionData?.outstandingBalance !== undefined ? reconnectionData.outstandingBalance : ''} readOnly />
      </div>

      {/* Facilities — at least one required */}
      <h4 style={{ marginTop: '2rem', marginBottom: '1rem', color: 'var(--text-primary)' }}>
        {t('wizards.reconnection.reconnectionDetails.facilitiesHeading')}
      </h4>

      <div className="form-group">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
          
          <motion.label 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            style={{ 
              display: 'flex', alignItems: 'center', gap: '1rem', 
              padding: '1rem', borderRadius: '12px', 
              border: checkedFacilities['broadband'] ? '2px solid var(--blue)' : '2px solid var(--line)',
              backgroundColor: checkedFacilities['broadband'] ? 'rgba(15, 87, 168, 0.05)' : 'var(--surface)',
              cursor: 'pointer', transition: 'border 0.3s, background 0.3s'
            }}
          >
            <input type="checkbox" name="facility_broadband" style={{ display: 'none' }} checked={!!checkedFacilities['broadband']} onChange={() => toggleFacility('broadband')} />
            <div style={{ width: '40px', height: '40px', borderRadius: '8px', display: 'grid', placeItems: 'center', backgroundColor: checkedFacilities['broadband'] ? 'var(--blue)' : 'var(--paper)', color: checkedFacilities['broadband'] ? '#fff' : 'var(--muted)', transition: 'all 0.3s' }}>
              <Icon name="wifi" size={20} />
            </div>
            <span style={{ fontWeight: 600, color: checkedFacilities['broadband'] ? 'var(--blue)' : 'var(--text)', transition: 'color 0.3s' }}>{t('wizards.reconnection.reconnectionDetails.broadband')}</span>
          </motion.label>

          <motion.label 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            style={{ 
              display: 'flex', alignItems: 'center', gap: '1rem', 
              padding: '1rem', borderRadius: '12px', 
              border: checkedFacilities['peoTv'] ? '2px solid var(--blue)' : '2px solid var(--line)',
              backgroundColor: checkedFacilities['peoTv'] ? 'rgba(15, 87, 168, 0.05)' : 'var(--surface)',
              cursor: 'pointer', transition: 'border 0.3s, background 0.3s'
            }}
          >
            <input type="checkbox" name="facility_peoTv" style={{ display: 'none' }} checked={!!checkedFacilities['peoTv']} onChange={() => toggleFacility('peoTv')} />
            <div style={{ width: '40px', height: '40px', borderRadius: '8px', display: 'grid', placeItems: 'center', backgroundColor: checkedFacilities['peoTv'] ? 'var(--blue)' : 'var(--paper)', color: checkedFacilities['peoTv'] ? '#fff' : 'var(--muted)', transition: 'all 0.3s' }}>
              <Icon name="tv" size={20} />
            </div>
            <span style={{ fontWeight: 600, color: checkedFacilities['peoTv'] ? 'var(--blue)' : 'var(--text)', transition: 'color 0.3s' }}>{t('wizards.reconnection.reconnectionDetails.peoTv')}</span>
          </motion.label>

          <motion.label 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            style={{ 
              display: 'flex', alignItems: 'center', gap: '1rem', 
              padding: '1rem', borderRadius: '12px', 
              border: checkedFacilities['sltPlus'] ? '2px solid var(--blue)' : '2px solid var(--line)',
              backgroundColor: checkedFacilities['sltPlus'] ? 'rgba(15, 87, 168, 0.05)' : 'var(--surface)',
              cursor: 'pointer', transition: 'border 0.3s, background 0.3s'
            }}
          >
            <input type="checkbox" name="facility_sltPlus" style={{ display: 'none' }} checked={!!checkedFacilities['sltPlus']} onChange={() => toggleFacility('sltPlus')} />
            <div style={{ width: '40px', height: '40px', borderRadius: '8px', display: 'grid', placeItems: 'center', backgroundColor: checkedFacilities['sltPlus'] ? 'var(--blue)' : 'var(--paper)', color: checkedFacilities['sltPlus'] ? '#fff' : 'var(--muted)', transition: 'all 0.3s' }}>
              <Icon name="plus-circle" size={20} />
            </div>
            <span style={{ fontWeight: 600, color: checkedFacilities['sltPlus'] ? 'var(--blue)' : 'var(--text)', transition: 'color 0.3s' }}>{t('wizards.reconnection.reconnectionDetails.sltPlus')}</span>
          </motion.label>

          <motion.label 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            style={{ 
              display: 'flex', alignItems: 'center', gap: '1rem', 
              padding: '1rem', borderRadius: '12px', 
              border: checkedFacilities['cli'] ? '2px solid var(--blue)' : '2px solid var(--line)',
              backgroundColor: checkedFacilities['cli'] ? 'rgba(15, 87, 168, 0.05)' : 'var(--surface)',
              cursor: 'pointer', transition: 'border 0.3s, background 0.3s'
            }}
          >
            <input type="checkbox" name="facility_cli" style={{ display: 'none' }} checked={!!checkedFacilities['cli']} onChange={() => toggleFacility('cli')} />
            <div style={{ width: '40px', height: '40px', borderRadius: '8px', display: 'grid', placeItems: 'center', backgroundColor: checkedFacilities['cli'] ? 'var(--blue)' : 'var(--paper)', color: checkedFacilities['cli'] ? '#fff' : 'var(--muted)', transition: 'all 0.3s' }}>
              <Icon name="phone" size={20} />
            </div>
            <span style={{ fontWeight: 600, color: checkedFacilities['cli'] ? 'var(--blue)' : 'var(--text)', transition: 'color 0.3s' }}>{t('wizards.reconnection.reconnectionDetails.cli')}</span>
          </motion.label>

          <motion.label 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            style={{ 
              display: 'flex', alignItems: 'center', gap: '1rem', 
              padding: '1rem', borderRadius: '12px', 
              border: checkedFacilities['idd'] ? '2px solid var(--blue)' : '2px solid var(--line)',
              backgroundColor: checkedFacilities['idd'] ? 'rgba(15, 87, 168, 0.05)' : 'var(--surface)',
              cursor: 'pointer', transition: 'border 0.3s, background 0.3s'
            }}
          >
            <input type="checkbox" name="facility_idd" style={{ display: 'none' }} checked={!!checkedFacilities['idd']} onChange={() => toggleFacility('idd')} />
            <div style={{ width: '40px', height: '40px', borderRadius: '8px', display: 'grid', placeItems: 'center', backgroundColor: checkedFacilities['idd'] ? 'var(--blue)' : 'var(--paper)', color: checkedFacilities['idd'] ? '#fff' : 'var(--muted)', transition: 'all 0.3s' }}>
              <Icon name="globe" size={20} />
            </div>
            <span style={{ fontWeight: 600, color: checkedFacilities['idd'] ? 'var(--blue)' : 'var(--text)', transition: 'color 0.3s' }}>{t('wizards.reconnection.reconnectionDetails.idd')}</span>
          </motion.label>

          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <motion.label 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              style={{ 
                display: 'flex', alignItems: 'center', gap: '1rem', 
                padding: '1rem', borderRadius: '12px', 
                border: checkedFacilities['email'] ? '2px solid var(--blue)' : '2px solid var(--line)',
                backgroundColor: checkedFacilities['email'] ? 'rgba(15, 87, 168, 0.05)' : 'var(--surface)',
                cursor: 'pointer', transition: 'border 0.3s, background 0.3s'
              }}
            >
              <input type="checkbox" name="facility_email" style={{ display: 'none' }} checked={!!checkedFacilities['email']} onChange={() => toggleFacility('email')} />
              <div style={{ width: '40px', height: '40px', borderRadius: '8px', display: 'grid', placeItems: 'center', backgroundColor: checkedFacilities['email'] ? 'var(--blue)' : 'var(--paper)', color: checkedFacilities['email'] ? '#fff' : 'var(--muted)', transition: 'all 0.3s' }}>
                <Icon name="mail" size={20} />
              </div>
              <span style={{ fontWeight: 600, color: checkedFacilities['email'] ? 'var(--blue)' : 'var(--text)', transition: 'color 0.3s' }}>{t('wizards.reconnection.reconnectionDetails.email')}</span>
            </motion.label>
            <AnimatePresence>
              {checkedFacilities['email'] && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  style={{ overflow: 'hidden' }}
                >
                  <div className="form-group" style={{ padding: '0.75rem 0 0 0' }}>
                    <input type="text" name="emailUsername" className="form-control" placeholder="Email Username *" required={isActive && checkedFacilities['email']} />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <motion.label 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              style={{ 
                display: 'flex', alignItems: 'center', gap: '1rem', 
                padding: '1rem', borderRadius: '12px', 
                border: checkedFacilities['dialUp'] ? '2px solid var(--blue)' : '2px solid var(--line)',
                backgroundColor: checkedFacilities['dialUp'] ? 'rgba(15, 87, 168, 0.05)' : 'var(--surface)',
                cursor: 'pointer', transition: 'border 0.3s, background 0.3s'
              }}
            >
              <input type="checkbox" name="facility_dialUp" style={{ display: 'none' }} checked={!!checkedFacilities['dialUp']} onChange={() => toggleFacility('dialUp')} />
              <div style={{ width: '40px', height: '40px', borderRadius: '8px', display: 'grid', placeItems: 'center', backgroundColor: checkedFacilities['dialUp'] ? 'var(--blue)' : 'var(--paper)', color: checkedFacilities['dialUp'] ? '#fff' : 'var(--muted)', transition: 'all 0.3s' }}>
                <Icon name="monitor" size={20} />
              </div>
              <span style={{ fontWeight: 600, color: checkedFacilities['dialUp'] ? 'var(--blue)' : 'var(--text)', transition: 'color 0.3s' }}>{t('wizards.reconnection.reconnectionDetails.dialUp')}</span>
            </motion.label>
            <AnimatePresence>
              {checkedFacilities['dialUp'] && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  style={{ overflow: 'hidden' }}
                >
                  <div className="form-group" style={{ padding: '0.75rem 0 0 0' }}>
                    <input type="text" name="dialUpUsername" className="form-control" placeholder="Dial-up Username *" required={isActive && checkedFacilities['dialUp']} />
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
