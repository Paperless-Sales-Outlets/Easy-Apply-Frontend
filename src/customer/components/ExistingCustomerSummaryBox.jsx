import { FiCheck } from 'react-icons/fi';
import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Icon from '../../shared/components/Icon';
import { useVerifiedContext } from './verification';

/** Summary card of an existing customer's account details. */
export default function ExistingCustomerSummaryBox({ customerData, customerExists }) {
  const { accountsList, switchAccount } = useVerifiedContext();
  const [showSwitchModal, setShowSwitchModal] = useState(false);

  if (!customerExists || !customerData) return null;

  return (
    <>
      <div
        style={{
          backgroundColor: 'var(--green-50)',
          border: '1.5px solid var(--green-300)',
          borderRadius: 'var(--radius-lg)',
          padding: '1.25rem 1.5rem',
          marginBottom: '1.5rem',
          boxShadow: 'var(--shadow-md)',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '1rem',
            borderBottom: '1px solid var(--green-200)',
            paddingBottom: '0.65rem',
            flexWrap: 'wrap',
            gap: '0.5rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem' }}>
            <div
              style={{
                backgroundColor: 'var(--green-700)',
                color: 'var(--paper)',
                borderRadius: '50%',
                width: '22px',
                height: '22px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.75rem',
                fontWeight: 700,
              }}
            >
              <FiCheck size={13} aria-hidden="true" />
            </div>
            <span style={{ fontSize: '0.95rem', fontWeight: 700, color: '#14532d' }}>
              Customer Information Verified
            </span>
          </div>

          {accountsList && accountsList.length > 1 && (
            <button
              onClick={() => setShowSwitchModal(true)}
              type="button"
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--blue-600)',
                fontSize: '0.82rem',
                fontWeight: 700,
                cursor: 'pointer',
                textDecoration: 'underline',
              }}
            >
              Switch Account
            </button>
          )}
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1rem',
            alignItems: 'start'
          }}
        >
          <div>
            <div style={{ fontSize: '0.75rem', color: '#3b4a61', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.03em' }}>
              Customer Name
            </div>
            <div style={{ fontSize: '0.92rem', fontWeight: 700, color: '#131f33', marginTop: '0.15rem' }}>
              {customerData.fullName || customerData.customerName || '—'}
            </div>
          </div>

          <div>
            <div style={{ fontSize: '0.75rem', color: '#3b4a61', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.03em' }}>
              Registered Address
            </div>
            <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#26344b', marginTop: '0.15rem' }}>
              {customerData.address || '—'}
            </div>
          </div>

          <div>
            <div style={{ fontSize: '0.75rem', color: '#3b4a61', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.03em' }}>
              Telephone Number
            </div>
            <div style={{ fontSize: '0.92rem', fontWeight: 700, color: '#131f33', marginTop: '0.15rem' }}>
              {customerData.telephone || customerData.phoneNumber || '—'}
            </div>
          </div>

          <div>
            <div style={{ fontSize: '0.75rem', color: '#3b4a61', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.03em' }}>
              Current Package
            </div>
            <div style={{ fontSize: '0.92rem', fontWeight: 700, color: '#131f33', marginTop: '0.15rem' }}>
              {customerData.package || customerData.packageName || '—'}
            </div>
          </div>
        </div>
      </div>

      {showSwitchModal && createPortal(
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed',
              inset: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.4)',
              backdropFilter: 'blur(4px)',
              zIndex: 9999,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              style={{
                background: 'rgba(255, 255, 255, 0.75)',
                backdropFilter: 'blur(24px)',
                WebkitBackdropFilter: 'blur(24px)',
                border: '1px solid rgba(255, 255, 255, 0.8)',
                borderRadius: 'var(--radius-lg)',
                padding: '2.5rem 2rem',
                width: '90%',
                maxWidth: '450px',
                boxShadow: '0 16px 40px rgba(0, 84, 166, 0.15), inset 0 4px 10px rgba(255,255,255,1)',
                maxHeight: '90vh',
                overflowY: 'auto',
                position: 'relative',
              }}
            >
              <button
                onClick={() => setShowSwitchModal(false)}
                style={{
                  position: 'absolute',
                  top: '1rem',
                  right: '1.25rem',
                  background: 'none',
                  border: 'none',
                  fontSize: '1.5rem',
                  color: 'var(--grey-600)',
                  cursor: 'pointer',
                  padding: '0.2rem',
                }}
              >
                &times;
              </button>

              <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                <div
                  style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: '50%',
                    background: 'var(--blue-100)',
                    color: 'var(--slt-blue)',
                    display: 'grid',
                    placeItems: 'center',
                    margin: '0 auto 1.25rem',
                    boxShadow: 'inset 0 2px 4px rgba(255,255,255,0.8), 0 4px 12px rgba(0, 174, 239, 0.1)',
                  }}
                >
                  <Icon name="link" size={28} />
                </div>
                <h3 style={{ margin: 0, color: 'var(--slt-blue)' }}>Multiple Connections Found</h3>
                <p style={{ margin: '0.5rem 0 0 0', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                  Please select the connection you want to switch to.
                </p>
              </div>

              <div style={{ display: 'grid', gap: '1rem' }}>
                {accountsList.map((conn, idx) => (
                  <motion.div
                    key={idx}
                    whileHover={{ scale: 1.02, background: 'rgba(255, 255, 255, 0.9)', boxShadow: 'var(--shadow-lg)' }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      switchAccount(conn);
                      setShowSwitchModal(false);
                      // Force a tiny delay and reload so the wizard catches the new selectedAccount
                      // Actually context handles this reactively if the wizard uses selectedAccount from context!
                      // If the wizard relies on location.state or local state, we should reload.
                      // Since we update sessionStorage and context in switchAccount, a reload ensures everything is in sync.
                      window.location.reload();
                    }}
                    style={{
                      padding: '1.25rem',
                      background: 'rgba(255, 255, 255, 0.5)',
                      border: '1px solid rgba(255, 255, 255, 0.8)',
                      borderRadius: 'var(--radius-lg)',
                      cursor: 'pointer',
                      transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '1rem',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.03), inset 0 2px 4px rgba(255,255,255,1)',
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
        </AnimatePresence>,
        document.body
      )}
    </>
  );
}
