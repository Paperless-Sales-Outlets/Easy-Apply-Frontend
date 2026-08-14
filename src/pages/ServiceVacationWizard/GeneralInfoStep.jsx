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
  const [matchedConnections, setMatchedConnections] = useState([]);

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
      if (data.length === 1) {
        selectConnection(data[0]);
      } else if (data.length > 1) {
        setMatchedConnections(data);
      } else {
        toast.error('No active connections found for this number.');
      }
    } else {
      selectConnection(data);
    }
  };

  const selectConnection = (connection) => {
    setMatchedConnections([]);
    if (onVerifySuccess) {
      onVerifySuccess(connection);
    }
    toast.success('Connection details loaded securely.', { position: 'top-center' });
  };

  useEffect(() => {
    if (verifiedMobile && !vacationData && !loading && matchedConnections.length === 0) {
      const autoVerify = async () => {
        setLoading(true);
        try {
          const res = await api.get(`/applications/lookup-connection?phone=${verifiedMobile}`);
          if (res.data.success && res.data.data) {
            handleApiResponse(res.data.data);
          }
        } catch (err) {
          toast.error('Could not find existing connections. Please contact support.', { position: 'top-center' });
        } finally {
          setLoading(false);
        }
      };
      autoVerify();
    }
  }, [verifiedMobile, vacationData, loading, matchedConnections.length]);

  return (
    <div>

      <h3 style={{ color: 'var(--slt-blue)', marginBottom: '1.5rem' }}>{t('wizards.serviceVacation.generalInfo.connectionLookupTitle')}</h3>
      
      {loading ? (
        <div style={{ padding: '3rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem' }}>
          <SLTLoader size={48} />
          <p style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>Searching for your connections...</p>

        </div>
      ) : !vacationData && matchedConnections.length === 0 ? (
        <div style={{ padding: '2rem', textAlign: 'center', backgroundColor: '#fafafa', borderRadius: '12px' }}>
          <p style={{ color: 'var(--text-secondary)' }}>No connection loaded. Please refresh or contact support.</p>
        </div>
      ) : null}

      <AnimatePresence>
        {vacationData && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            style={{ 
              marginTop: '1.5rem', padding: '1.5rem', borderRadius: '16px',
              background: 'rgba(255, 255, 255, 0.4)',
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
              border: '1px solid rgba(255, 255, 255, 0.5)',
              boxShadow: '0 8px 32px rgba(31, 38, 135, 0.05)',
              position: 'relative', overflow: 'hidden'
            }}
          >
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', background: 'linear-gradient(90deg, var(--slt-blue), var(--slt-green))' }} />
            
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1.5rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>
              <div style={{ width: '56px', height: '56px', borderRadius: '16px', backgroundColor: 'rgba(15, 87, 168, 0.1)', color: 'var(--slt-blue)', display: 'grid', placeItems: 'center' }}>
                <Icon name="user" size={28} />
              </div>
              
              <div style={{ flex: 1, minWidth: '250px' }}>
                <h4 style={{ margin: '0 0 0.25rem 0', fontSize: '1.25rem', color: 'var(--text-primary)' }}>
                  {vacationData.fullName || vacationData.customerName || 'Valued Customer'}
                </h4>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap', marginTop: '0.75rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                    <Icon name="tag" size={16} />
                    <span style={{ fontWeight: 600 }}>{vacationData.customerType === 'office' ? 'Business' : 'Home'} Connection</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                    <Icon name="phone" size={16} />
                    <span>{vacationData.telephone || vacationData.accountNo}</span>
                  </div>
                </div>
              </div>

              <div style={{ padding: '1rem 1.5rem', background: 'rgba(255, 255, 255, 0.6)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.4)', textAlign: 'right' }}>
                <span style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.25rem' }}>Outstanding</span>
                <span style={{ display: 'block', fontSize: '1.25rem', fontWeight: 800, color: 'var(--danger)' }}>
                  Rs. {(vacationData.outstandingBalance || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>
            
            <input type="hidden" name="telephone" value={vacationData.telephone || vacationData.accountNo || ''} />
            <input type="hidden" name="fullName" value={vacationData.fullName || vacationData.customerName || ''} />
            <input type="hidden" name="outstandingBalance" value={vacationData.outstandingBalance || 0} />
            <input type="hidden" name="nic" value={vacationData.nic || ''} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Multiple Connections Modal */}
      {createPortal(
        <AnimatePresence>
          {matchedConnections.length > 1 && (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              style={{ 
                position: 'fixed', inset: 0, backgroundColor: 'rgba(0, 0, 0, 0.4)', backdropFilter: 'blur(4px)', 
                zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' 
              }}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
                style={{
                  backgroundColor: '#fff', borderRadius: '16px', padding: '2rem', width: '90%', maxWidth: '500px',
                  boxShadow: '0 24px 48px rgba(0,0,0,0.2)', maxHeight: '90vh', overflowY: 'auto'
                }}
              >
                <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'rgba(15, 87, 168, 0.1)', color: 'var(--slt-blue)', display: 'grid', placeItems: 'center', margin: '0 auto 1rem' }}>
                    <Icon name="layers" size={24} />
                  </div>
                  <h3 style={{ margin: 0, color: 'var(--slt-blue)' }}>{t('wizards.serviceVacation.generalInfo.multipleConnectionsTitle')}</h3>
                  <p style={{ margin: '0.5rem 0 0 0', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                    {t('wizards.serviceVacation.generalInfo.multipleConnectionsSubtitle')}
                  </p>
                </div>

                <div style={{ display: 'grid', gap: '1rem' }}>
                  {matchedConnections.map((conn, idx) => (
                    <motion.div
                      key={idx}
                      whileHover={{ scale: 1.02, backgroundColor: 'rgba(15, 87, 168, 0.03)' }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => selectConnection(conn)}
                      style={{
                        padding: '1rem', border: '1px solid var(--border-color)', borderRadius: '12px',
                        cursor: 'pointer', transition: 'all 0.2s ease', display: 'flex', alignItems: 'center', gap: '1rem'
                      }}
                    >
                      <div style={{ flex: 1 }}>
                        <h5 style={{ margin: '0 0 0.25rem 0', color: 'var(--text-primary)', fontSize: '1rem' }}>
                          {conn.telephone || conn.accountNo}
                        </h5>
                        <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                          {conn.customerType === 'office' ? 'Business' : 'Home'} Connection
                        </span>
                      </div>
                      <div style={{ color: 'var(--slt-blue)' }}>
                        <Icon name="chevron-right" size={20} />
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}

    </div>
  );
});

GeneralInfoStep.displayName = 'GeneralInfoStep';
export default GeneralInfoStep;