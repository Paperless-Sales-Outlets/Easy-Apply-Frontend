import { FiCheck } from 'react-icons/fi';
import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Icon from './Icon';
import { useVerifiedContext } from './verification';

export default function ExistingCustomerSummaryBox({ customerData, customerExists }) {
  const { accountsList, switchAccount } = useVerifiedContext();
  const [showSwitchModal, setShowSwitchModal] = useState(false);

  if (!customerExists || !customerData) return null;

  return (
    <>
      <section className="verified-box" aria-label="Customer information">
        <div className="verified-box__head">
          <span className="verified-box__title">
            <span className="verified-box__tick" aria-hidden="true">
              <FiCheck size={14} />
            </span>
            Customer Information Verified
          </span>
          {accountsList && accountsList.length > 1 && (
            <button onClick={() => setShowSwitchModal(true)} type="button" className="btn-ds btn-ds--text" style={{ minHeight: 40 }}>
              Switch Account
            </button>
          )}
        </div>

        <dl className="verified-box__grid">
          <div>
            <dt>Customer Name</dt>
            <dd>{customerData.fullName || customerData.customerName || '—'}</dd>
          </div>
          <div>
            <dt>Registered Address</dt>
            <dd>{customerData.address || '—'}</dd>
          </div>
          <div>
            <dt>Telephone Number</dt>
            <dd>{customerData.telephone || customerData.phoneNumber || '—'}</dd>
          </div>
          <div>
            <dt>Current Package</dt>
            <dd>{customerData.package || customerData.packageName || '—'}</dd>
          </div>
        </dl>
      </section>

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
                borderRadius: '16px',
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
                  color: '#64748b',
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
                    background: 'linear-gradient(135deg, rgba(0, 174, 239, 0.15), rgba(77, 184, 72, 0.15))',
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
                    whileHover={{ scale: 1.02, background: 'rgba(255, 255, 255, 0.9)', boxShadow: '0 8px 24px rgba(0, 174, 239, 0.12)' }}
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
                      borderRadius: '16px',
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
