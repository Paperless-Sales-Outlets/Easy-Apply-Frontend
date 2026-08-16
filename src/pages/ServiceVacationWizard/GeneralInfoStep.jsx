import React, { forwardRef, useImperativeHandle } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import Icon from '../../components/Icon';
import toast from 'react-hot-toast';

const GeneralInfoStep = forwardRef(({ isActive, vacationData }, ref) => {
  const { t } = useTranslation();

  useImperativeHandle(ref, () => ({
    validate: () => {
      if (!vacationData) {
        toast.error('Please select a connection to proceed.', { position: 'top-center' });
        return false;
      }
      return true;
    }
  }));

  const customerTypeColors = {
    bg: vacationData?.customerType === 'office' ? 'var(--purple, #6d28d9)' : 'var(--slt-blue, #1d4ed8)',
  };

  return (
    <div>
      <h3 style={{ color: 'var(--slt-blue)', marginBottom: '1.5rem' }}>{t('wizards.serviceVacation.generalInfo.connectionLookupTitle', 'Connection Details')}</h3>

      <AnimatePresence>
        {vacationData && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            style={{ 
              marginTop: '1.5rem',
              borderRadius: '16px',
              overflow: 'hidden',
              backgroundColor: '#ffffff',
              boxShadow: '0 8px 32px rgba(0,0,0,0.06)',
              border: '1px solid rgba(0,0,0,0.05)',
              maxWidth: '650px',
              margin: '1.5rem auto 0',
            }}
          >
            {/* Modern Solid Color Top Block */}
            <div style={{ 
              backgroundColor: customerTypeColors.bg, 
              padding: '1.5rem 2rem', 
              color: '#ffffff',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div>
                <span style={{ 
                  display: 'inline-block',
                  backgroundColor: 'rgba(255,255,255,0.2)',
                  padding: '0.2rem 0.6rem',
                  borderRadius: '12px',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  marginBottom: '0.5rem'
                }}>
                  {vacationData.customerType === 'office' ? 'Business Profile' : 'Residential Profile'}
                </span>
                <h4 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 600 }}>
                  {vacationData.fullName || vacationData.customerName || 'Valued Customer'}
                </h4>
              </div>
              <div style={{ 
                width: '56px', height: '56px', borderRadius: '50%', display: 'grid', placeItems: 'center', 
                backgroundColor: 'rgba(255,255,255,0.15)', color: '#ffffff'
              }}>
                <Icon name="user" size={28} />
              </div>
            </div>

            {/* White Bottom Block with Info */}
            <div style={{ padding: '2rem' }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2rem', alignItems: 'center' }}>
                {/* Left Side: User Details */}
                <div style={{ flex: '1 1 250px' }}>
                  <div style={{ marginBottom: '1.5rem' }}>
                    <p style={{ margin: '0 0 0.25rem 0', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Telephone / Account</p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Icon name="phone" size={16} color="var(--slt-blue)" />
                      <span style={{ color: 'var(--text-primary)', fontWeight: 600, fontSize: '1.05rem' }}>{vacationData.telephone || vacationData.accountNo}</span>
                    </div>
                  </div>
                  <div>
                    <p style={{ margin: '0 0 0.25rem 0', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Service Type</p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Icon name="tag" size={16} color="var(--slt-green)" />
                      <span style={{ color: 'var(--text-primary)', fontWeight: 600, fontSize: '1.05rem' }}>{vacationData.serviceType || 'Broadband'}</span>
                    </div>
                  </div>
                </div>
                
                {/* Vertical Divider (Hidden on small screens) */}
                <div style={{ width: '1px', alignSelf: 'stretch', backgroundColor: '#e2e8f0', display: 'none', '@media (min-width: 600px)': { display: 'block' } }}></div>

                {/* Right Side: Fees Breakdown */}
                <div style={{ flex: '1 1 250px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Outstanding Dues</span>
                    <span style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                      Rs. {(vacationData.outstandingBalance || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Vacation Fee</span>
                    <span style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                      Rs. 500.00
                    </span>
                  </div>
                  <div style={{ borderTop: '1px dashed #e2e8f0', margin: '1rem 0' }}></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.9rem', color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 700 }}>Total Due</span>
                    <span style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--slt-blue)' }}>
                      Rs. {((vacationData.outstandingBalance || 0) + 500).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            
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

export default GeneralInfoStep;