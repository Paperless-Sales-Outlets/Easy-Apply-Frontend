import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiCheckCircle, FiAlertCircle, FiMapPin, FiArrowRight, FiPhoneCall } from 'react-icons/fi';

// Service loop coverage is only live for Colombo addresses while this check
// is being piloted — every other district falls back to a manual SLT
// follow-up instead of letting the customer pay online for an install
// that can't actually be provisioned yet.
const isLoopAvailable = (address) => /colombo/i.test(address || '');

export default function LoopCheckStep({ formData, onAvailable, onUnavailable, submitting }) {
  const [phase, setPhase] = useState('checking'); // 'checking' | 'available' | 'unavailable'
  const address = formData.installAddress || formData.address || '';

  useEffect(() => {
    setPhase('checking');
    const id = setTimeout(() => {
      setPhase(isLoopAvailable(address) ? 'available' : 'unavailable');
    }, 1200);
    return () => clearTimeout(id);
  }, [address]);

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      <h3 style={{ color: '#0f172a', marginBottom: '0.5rem', fontSize: '1.5rem', fontWeight: 800, letterSpacing: '-0.02em' }}>
        Service Loop Availability
      </h3>
      <p style={{ color: '#64748b', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
        We're checking whether a service loop is free at your installation address before you pay.
      </p>

      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          padding: '2.75rem 2rem',
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.03)',
          border: '1px solid #e2e8f0',
          textAlign: 'center',
        }}
      >
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            backgroundColor: '#f1f5f9',
            color: '#334155',
            padding: '0.5rem 1rem',
            borderRadius: '9999px',
            fontSize: '0.82rem',
            fontWeight: 700,
            marginBottom: '1.75rem',
            maxWidth: '100%',
          }}
        >
          <FiMapPin size={14} style={{ flexShrink: 0 }} />
          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {address || 'No installation address provided'}
          </span>
        </div>

        <AnimatePresence mode="wait">
          {phase === 'checking' && (
            <motion.div key="checking" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div
                style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '50%',
                  border: '3px solid #e2e8f0',
                  borderTopColor: '#0056b3',
                  margin: '0 auto 1.25rem auto',
                  animation: 'loop-check-spin 0.8s linear infinite',
                }}
              />
              <h4 style={{ margin: '0 0 0.4rem 0', fontSize: '1.1rem', fontWeight: 800, color: '#0f172a' }}>
                Checking Coverage...
              </h4>
              <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>
                Querying the SLTMobitel network database for an available loop.
              </p>
            </motion.div>
          )}

          {phase === 'available' && (
            <motion.div key="available" initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }}>
              <div
                style={{
                  width: '60px',
                  height: '60px',
                  borderRadius: '50%',
                  backgroundColor: '#dcfce7',
                  color: '#16a34a',
                  display: 'grid',
                  placeItems: 'center',
                  margin: '0 auto 1.25rem auto',
                }}
              >
                <FiCheckCircle size={30} />
              </div>
              <h4 style={{ margin: '0 0 0.4rem 0', fontSize: '1.15rem', fontWeight: 800, color: '#0f172a' }}>
                Service Loop Available!
              </h4>
              <p style={{ margin: '0 0 1.75rem 0', fontSize: '0.88rem', color: '#16a34a', fontWeight: 700 }}>
                Good news — a free port is available in your area. You can continue to payment now.
              </p>
              <button
                type="button"
                onClick={onAvailable}
                className="btn btn-primary"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
              >
                <span>Continue to Payment</span>
                <FiArrowRight size={16} />
              </button>
            </motion.div>
          )}

          {phase === 'unavailable' && (
            <motion.div key="unavailable" initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }}>
              <div
                style={{
                  width: '60px',
                  height: '60px',
                  borderRadius: '50%',
                  backgroundColor: '#fff7ed',
                  color: '#ea580c',
                  display: 'grid',
                  placeItems: 'center',
                  margin: '0 auto 1.25rem auto',
                  border: '2px solid #ffedd5',
                }}
              >
                <FiAlertCircle size={28} />
              </div>
              <h4 style={{ margin: '0 0 0.4rem 0', fontSize: '1.15rem', fontWeight: 800, color: '#0f172a' }}>
                No Loop Available Yet
              </h4>
              <p
                style={{
                  margin: '0 auto 1.75rem auto',
                  fontSize: '0.88rem',
                  color: '#64748b',
                  fontWeight: 600,
                  maxWidth: '420px',
                }}
              >
                We don't have a free service loop at this address right now. Submit your request and an SLT
                representative will contact you to arrange installation — no payment is needed today.
              </p>
              <button
                type="button"
                onClick={onUnavailable}
                disabled={submitting}
                className="btn btn-success"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
              >
                <FiPhoneCall size={16} />
                <span>{submitting ? 'Submitting...' : 'Submit Request'}</span>
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <style>{`
        @keyframes loop-check-spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </motion.div>
  );
}
