import React, { useState, forwardRef, useImperativeHandle, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import Icon from '../../components/Icon';
import SLTLoader from '../../components/SLTLoader';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const GeneralInfoStep = forwardRef(({ isActive, vacationData, onVerifySuccess, verifiedMobile }, ref) => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);

  useImperativeHandle(ref, () => ({
    validate: () => {
      if (!vacationData) {
        toast.error('Please select a connection to proceed.', { position: 'top-center' });
        return false;
      }
      return true;
    }
  }));

  const handleApiResponse = (data) => {
    if (Array.isArray(data)) {
      if (data.length > 0) {
        selectConnection(data[0]);
      } else {
        toast.error('No active connections found for this number.');
      }
    } else {
      selectConnection(data);
    }
  };

  const selectConnection = (connection) => {
    if (onVerifySuccess) {
      onVerifySuccess(connection);
    }
    toast.success('Connection details loaded securely.', { position: 'top-center' });
  };

  const [errorOccurred, setErrorOccurred] = useState(false);
  const [showManualLookup, setShowManualLookup] = useState(false);
  const [manualLookupNumber, setManualLookupNumber] = useState('');

  const performLookup = async (searchNumber) => {
    const sanitizedNumber = (searchNumber || '').toString().replace(/\D/g, '');
    if (!sanitizedNumber) return;
    
    setLoading(true);
    setErrorOccurred(false);
    try {
      const res = await api.get(`/applications/lookup-connection?phone=${sanitizedNumber}`);
      if (res.data.success && res.data.data) {
        handleApiResponse(res.data.data);
        setShowManualLookup(false);
      }
    } catch (err) {
      setErrorOccurred(true);
      setShowManualLookup(true);
      if (searchNumber !== verifiedMobile) {
        toast.error('No connection found for that number. Please check and try again.', { position: 'top-center' });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>

      <h3 style={{ color: 'var(--slt-blue)', marginBottom: '1.5rem' }}>{t('wizards.serviceVacation.generalInfo.connectionLookupTitle')}</h3>
      
      {loading ? (
        <div style={{ padding: '3rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem' }}>
          <SLTLoader size={120} />
          <p style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>Searching for your connections...</p>
        </div>
      ) : showManualLookup && !vacationData ? (
        <div style={{
          padding: '2.5rem',
          background: 'rgba(255, 255, 255, 0.4)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          border: '1px solid rgba(255, 255, 255, 0.5)',
          borderRadius: '16px',
          boxShadow: '0 8px 32px rgba(31, 38, 135, 0.05)',
          textAlign: 'center'
        }}>
          <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'center' }}>
            <div style={{ background: 'rgba(239, 68, 68, 0.1)', padding: '1rem', borderRadius: '50%', color: '#ef4444' }}>
              <Icon name="alert-circle" size={32} />
            </div>
          </div>
          <h4 style={{ color: 'var(--text-primary)', marginBottom: '0.5rem', fontSize: '1.25rem' }}>No Connection Found</h4>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', maxWidth: '450px', margin: '0 auto 2rem', lineHeight: 1.5 }}>
            We couldn't automatically link this mobile number to an existing SLT service. Please enter your Telephone or Account Number below to continue.
          </p>
          <div style={{ display: 'flex', gap: '1rem', maxWidth: '400px', margin: '0 auto', flexDirection: 'column' }}>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <input 
                type="text" 
                className="form-control"
                placeholder="e.g. 0112345678"
                value={manualLookupNumber}
                onChange={(e) => setManualLookupNumber(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter' && manualLookupNumber.length >= 9) performLookup(manualLookupNumber); }}
                style={{
                  flex: 1,
                  background: 'rgba(255,255,255,0.7)',
                  border: '1.5px solid rgba(15, 87, 168, 0.2)',
                  borderRadius: '12px'
                }}
              />
              <button 
                type="button"
                className="btn btn-primary"
                disabled={!manualLookupNumber || manualLookupNumber.length < 9}
                onClick={() => performLookup(manualLookupNumber)}
                style={{ borderRadius: '12px', padding: '0 1.5rem' }}
              >
                Search
              </button>
            </div>
          </div>
        </div>
      ) : null}

      <AnimatePresence>
        {vacationData && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            style={{ 
              marginTop: '2rem',
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', 
              gap: '1.5rem' 
            }}
          >
            {/* Left Card: Customer Details */}
            <div style={{
              background: 'rgba(255, 255, 255, 0.75)',
              backdropFilter: 'blur(24px)',
              WebkitBackdropFilter: 'blur(24px)',
              border: '1px solid rgba(255, 255, 255, 0.8)',
              borderRadius: '24px',
              padding: '2rem',
              boxShadow: '0 16px 40px rgba(0, 84, 166, 0.1), inset 0 4px 10px rgba(255,255,255,1)',
              position: 'relative', overflow: 'hidden'
            }}>
              <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '6px', background: 'linear-gradient(90deg, var(--slt-blue), #00AEEF)' }} />
              <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                <div style={{ 
                  width: '64px', height: '64px', borderRadius: '50%', flexShrink: 0,
                  background: 'linear-gradient(135deg, rgba(0, 84, 166, 0.1), rgba(0, 174, 239, 0.1))', 
                  color: 'var(--slt-blue)', display: 'grid', placeItems: 'center',
                  boxShadow: 'inset 0 2px 4px rgba(255,255,255,0.8), 0 4px 12px rgba(0, 84, 166, 0.05)'
                }}>
                  <Icon name="user" size={32} />
                </div>
                <div>
                  <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '1.25rem', color: 'var(--slt-blue)', fontWeight: 700 }}>
                    {vacationData.fullName || vacationData.customerName || 'Valued Customer'}
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
                      <Icon name="tag" size={16} />
                      <span style={{ fontWeight: 600 }}>{vacationData.customerType === 'office' ? 'Business' : 'Home'} Connection</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
                      <Icon name="phone" size={16} />
                      <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{vacationData.telephone || vacationData.accountNo}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Card: Payment Breakdown */}
            <div style={{
              background: 'rgba(255, 255, 255, 0.75)',
              backdropFilter: 'blur(24px)',
              WebkitBackdropFilter: 'blur(24px)',
              border: '1px solid rgba(255, 255, 255, 0.8)',
              borderRadius: '24px',
              padding: '2rem',
              boxShadow: '0 16px 40px rgba(77, 184, 72, 0.1), inset 0 4px 10px rgba(255,255,255,1)',
              position: 'relative', overflow: 'hidden',
              display: 'flex', flexDirection: 'column', justifyContent: 'center'
            }}>
              <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '6px', background: 'linear-gradient(90deg, var(--slt-green), #00AEEF)' }} />
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', paddingBottom: '1.25rem', borderBottom: '1px dashed rgba(0,0,0,0.15)' }}>
                <span style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>Outstanding Dues</span>
                <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Rs. {(vacationData.outstandingBalance || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', paddingBottom: '1.25rem', borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
                <span style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>Vacation Fee</span>
                <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Rs. 500.00</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: 'var(--slt-green)', fontWeight: 700, fontSize: '1.1rem' }}>Total Payable</span>
                <span style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--slt-green)' }}>
                  Rs. {((vacationData.outstandingBalance || 0) + 500).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>
            
            {/* Hidden fields */}
            <input type="hidden" name="telephone" value={vacationData.telephone || vacationData.accountNo || ''} />
            <input type="hidden" name="fullName" value={vacationData.fullName || vacationData.customerName || ''} />
            <input type="hidden" name="outstandingBalance" value={vacationData.outstandingBalance || 0} />
            <input type="hidden" name="nic" value={vacationData.nic || ''} />
          </motion.div>
        )}
      </AnimatePresence>



    </div>
  );
});

GeneralInfoStep.displayName = 'GeneralInfoStep';
export default GeneralInfoStep;
