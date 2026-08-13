import React, { useState, forwardRef, useImperativeHandle } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import Icon from '../../components/Icon';
import SLTLoader from '../../components/SLTLoader';
import api from '../../utils/api';

const FacilityCard = ({ id, icon, label, checked, onChange }) => (
  <motion.label
    whileHover={{ scale: 1.02, y: -4 }}
    whileTap={{ scale: 0.98 }}
    style={{
      display: 'flex', alignItems: 'center', gap: '1rem',
      padding: '1.25rem', borderRadius: '16px',
      border: checked ? '2px solid var(--slt-blue)' : '1px solid rgba(0,0,0,0.04)',
      backgroundColor: checked ? 'rgba(15, 87, 168, 0.03)' : '#ffffff',
      boxShadow: checked ? '0 12px 24px rgba(15, 87, 168, 0.15)' : '0 4px 20px rgba(0,0,0,0.04)',
      cursor: 'pointer', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
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

    <span style={{ fontWeight: 600, fontSize: '1.05rem', flex: 1, color: checked ? 'var(--slt-blue)' : 'var(--text-primary)', transition: 'color 0.3s' }}>
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

const ReconnectionDetailsStep = forwardRef(function ReconnectionDetailsStep({ isActive, reconnectionData, onVerifySuccess }, ref) {
  const { t } = useTranslation();

  const [checkedFacilities, setCheckedFacilities] = useState({});
  const [otherChecked, setOtherChecked] = useState(false);
  const [facilityError, setFacilityError] = useState(false);

  // Phone Lookup State
  const [telephone, setTelephone] = useState(reconnectionData?.telephone || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isVerified, setIsVerified] = useState(!!reconnectionData);

  const anyFacilityChecked = Object.values(checkedFacilities).some(Boolean);

  const toggleFacility = (key) => {
    setCheckedFacilities(prev => {
      const next = { ...prev, [key]: !prev[key] };
      if (Object.values(next).some(Boolean)) setFacilityError(false);
      return next;
    });
  };

  const handleVerify = async () => {
    if (!telephone) {
      setError('Please enter a telephone number');
      toast.error('Please enter a telephone number');
      return;
    }
    setLoading(true);
    setError('');

    try {
      const res = await api.get(`/applications/lookup-connection?phone=${telephone}`);
      if (res.data.success && res.data.data) {
        setIsVerified(true);
        if (onVerifySuccess) {
          onVerifySuccess(res.data.data);
        }
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Connection not found';
      setError(msg);
      toast.error(msg);
      setIsVerified(false);
      if (onVerifySuccess) {
        onVerifySuccess(null);
      }
    } finally {
      setLoading(false);
    }
  };

  // Expose validate() so the parent wizard can call it before advancing
  useImperativeHandle(ref, () => ({
    validate: () => {
      if (!anyFacilityChecked) {
        setFacilityError(true);
        toast.error(t('wizards.reconnection.reconnectionDetails.selectFacilityError', 'Please select at least one facility to reconnect'));
        return false;
      }
      if (!isVerified || !reconnectionData) {
        toast.error('Please enter and verify your telephone number to calculate dues.');
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

          <FacilityCard id="idd" icon="globe" label={t('wizards.reconnection.reconnectionDetails.idd')} checked={!!checkedFacilities['idd']} onChange={toggleFacility} />
          <FacilityCard id="peoTv" icon="tv" label={t('wizards.reconnection.reconnectionDetails.peoTv')} checked={!!checkedFacilities['peoTv']} onChange={toggleFacility} />
          <FacilityCard id="sltPlus" icon="plus-circle" label={t('wizards.reconnection.reconnectionDetails.sltPlus')} checked={!!checkedFacilities['sltPlus']} onChange={toggleFacility} />
          <FacilityCard id="cli" icon="phone" label={t('wizards.reconnection.reconnectionDetails.cli')} checked={!!checkedFacilities['cli']} onChange={toggleFacility} />

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

      <hr style={{ margin: '3rem 0', borderColor: 'var(--line)' }} />

      <h3 style={{ color: 'var(--slt-blue)', marginBottom: '1.5rem' }}>Verify Line to Check Dues</h3>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', alignItems: 'start' }}>
        <div className="form-group">
          <label className="form-label">Telephone / Account no</label>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <input
              name="telephone"
              type="tel"
              inputMode="numeric"
              pattern="^\d{10}$"
              title="Enter 10-digit Telephone or Account Number"
              placeholder="Enter 10-digit number"
              className="form-control"
              required={isActive}
              value={telephone}
              onChange={(e) => {
                setTelephone(e.target.value);
                setIsVerified(false);
                if (onVerifySuccess) onVerifySuccess(null);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleVerify();
                }
              }}
              style={{ flex: 1, maxWidth: '350px' }}
            />
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleVerify}
              disabled={loading}
              style={{ minWidth: '120px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              {loading ? <SLTLoader size={24} /> : 'Verify'}
            </button>
          </div>
          {error && <p style={{ color: 'var(--danger, red)', marginTop: '0.5rem', fontSize: '0.85rem' }}>{error}</p>}
        </div>

        <div>
          <AnimatePresence>
            {isVerified && reconnectionData && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                style={{ overflow: 'hidden' }}
              >
                {/* Hidden fields to preserve form submission data */}
                <input type="hidden" name="fullName" value={reconnectionData.fullName} />
                <input type="hidden" name="nic" value={reconnectionData.nic} />
                <input type="hidden" name="addressLine1" value={reconnectionData.addressLine1} />
                <input type="hidden" name="addressLine2" value={reconnectionData.addressLine2} />
                <input type="hidden" name="amountToPay" value={reconnectionData.outstandingBalance} />

                <div style={{ padding: '1.5rem', backgroundColor: 'rgba(0,166,80,0.05)', border: '1px solid rgba(0,166,80,0.2)', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h4 style={{ margin: '0 0 0.5rem 0', color: 'var(--text-primary)' }}>Reconnection Cart</h4>
                    <p style={{ margin: 0, color: 'var(--text-secondary)' }}>Pending dues for <strong>{reconnectionData.fullName}</strong></p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ margin: '0 0 0.25rem 0', fontSize: '0.85rem', textTransform: 'uppercase', color: 'var(--text-secondary)' }}>Total to Pay</p>
                    <h2 style={{ margin: 0, color: 'var(--slt-green)' }}>Rs. {reconnectionData.outstandingBalance}</h2>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

    </div>
  );
});

export default ReconnectionDetailsStep;
