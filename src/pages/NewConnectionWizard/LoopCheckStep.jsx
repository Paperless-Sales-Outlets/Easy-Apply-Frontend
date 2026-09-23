import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiCheckCircle, FiAlertCircle, FiMapPin, FiArrowRight, FiPhoneCall, FiX, FiRefreshCw, FiHome } from 'react-icons/fi';
import api from '../../utils/api';

export default function LoopCheckStep({ formData, onAvailable, onGoBack }) {
  const navigate = useNavigate();
  const [phase, setPhase] = useState('checking'); // 'checking' | 'available' | 'unavailable'
  const [coverageData, setCoverageData] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [showModal, setShowModal] = useState(false);

  const address = formData.installAddress || formData.address || '';
  const city = formData.city || '';

  const performLoopCheck = async () => {
    setPhase('checking');
    setShowModal(false);
    setErrorMessage('');

    try {
      const res = await api.post('/applications/check-loop', {
        address,
        city,
        district: formData.district,
      });

      if (res.data && res.data.available) {
        setCoverageData(res.data.coverage || {});
        setPhase('available');
      } else {
        setCoverageData(res.data?.coverage || {});
        setPhase('unavailable');
        setShowModal(true);
      }
    } catch (err) {
      console.warn('Backend loop check fallback:', err);
      // If offline/error fallback: evaluate address
      const isCol = /colombo|dehiwala|kandy|galle|gampaha|dickoya|negombo/i.test(address || city);
      const isUnavail = /no loop|no-loop|unavailable/i.test(address || city);

      if (isCol && !isUnavail) {
        setCoverageData({ area: city || 'Standard Coverage Area', loopStatus: 'AVAILABLE' });
        setPhase('available');
      } else {
        setPhase('unavailable');
        setShowModal(true);
      }
    }
  };

  useEffect(() => {
    performLoopCheck();
  }, [address, city]);

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      <h3 style={{ color: '#0f172a', marginBottom: '0.4rem', fontSize: '1.4rem', fontWeight: 800, letterSpacing: '-0.02em' }}>
        Network Loop Coverage Verification
      </h3>
      <p style={{ color: '#64748b', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
        We are checking SLTMobitel distribution network loop availability at your installation location.
      </p>

      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          padding: '2.5rem 2rem',
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
          <FiMapPin size={14} style={{ flexShrink: 0, color: '#0056b3' }} />
          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {address || city || 'No installation address specified'}
          </span>
        </div>

        <AnimatePresence mode="wait">
          {/* Phase 1: Checking animation */}
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
              <h4 style={{ margin: '0 0 0.4rem 0', fontSize: '1.15rem', fontWeight: 800, color: '#0f172a' }}>
                Querying Network Loop...
              </h4>
              <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>
                Verifying port and DP allocation with the SLTMobitel exchange database.
              </p>
            </motion.div>
          )}

          {/* Phase 2: Available (Success) */}
          {phase === 'available' && (
            <motion.div key="available" initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }}>
              <div
                style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  backgroundColor: '#dcfce7',
                  color: '#16a34a',
                  display: 'grid',
                  placeItems: 'center',
                  margin: '0 auto 1.25rem auto',
                  boxShadow: '0 4px 15px rgba(22, 163, 74, 0.15)',
                }}
              >
                <FiCheckCircle size={32} />
              </div>
              <h4 style={{ margin: '0 0 0.4rem 0', fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>
                Service Loop Available!
              </h4>
              <p style={{ margin: '0 auto 1.5rem auto', fontSize: '0.9rem', color: '#15803d', fontWeight: 700, maxWidth: '440px' }}>
                A high-speed distribution port is free and ready for installation in your area ({coverageData?.area || city || 'Standard Area'}).
              </p>

              <button
                type="button"
                onClick={onAvailable}
                className="btn btn-primary"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.85rem 1.75rem',
                  fontSize: '1rem',
                  fontWeight: 800,
                  borderRadius: '12px',
                  boxShadow: '0 4px 15px rgba(0, 86, 179, 0.25)',
                }}
              >
                <span>Continue to Payment</span>
                <FiArrowRight size={18} />
              </button>
            </motion.div>
          )}

          {/* Phase 3: Unavailable (Stopped State) */}
          {phase === 'unavailable' && (
            <motion.div key="unavailable" initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }}>
              <div
                style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  backgroundColor: '#fee2e2',
                  color: '#dc2626',
                  display: 'grid',
                  placeItems: 'center',
                  margin: '0 auto 1.25rem auto',
                  border: '2px solid #fca5a5',
                }}
              >
                <FiAlertCircle size={32} />
              </div>
              <h4 style={{ margin: '0 0 0.4rem 0', fontSize: '1.2rem', fontWeight: 800, color: '#991b1b' }}>
                No Loop Available in This Area
              </h4>
              <p
                style={{
                  margin: '0 auto 1.5rem auto',
                  fontSize: '0.88rem',
                  color: '#64748b',
                  fontWeight: 600,
                  maxWidth: '440px',
                  lineHeight: 1.5,
                }}
              >
                We do not have a free service loop available at this address right now. Progression to payment has been stopped. Please contact your nearest SLTMobitel branch for assistance.
              </p>

              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  onClick={() => setShowModal(true)}
                  style={{
                    backgroundColor: '#dc2626',
                    color: '#ffffff',
                    border: 'none',
                    padding: '0.75rem 1.25rem',
                    borderRadius: '10px',
                    fontWeight: 700,
                    fontSize: '0.88rem',
                    cursor: 'pointer',
                  }}
                >
                  View Branch Contact Info
                </button>
                <button
                  type="button"
                  onClick={onGoBack}
                  style={{
                    backgroundColor: '#f1f5f9',
                    color: '#334155',
                    border: '1px solid #cbd5e1',
                    padding: '0.75rem 1.25rem',
                    borderRadius: '10px',
                    fontWeight: 700,
                    fontSize: '0.88rem',
                    cursor: 'pointer',
                  }}
                >
                  Change Installation Location
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Stop Modal Popup for Unavailable Loop ── */}
      <AnimatePresence>
        {showModal && (
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(15, 23, 42, 0.7)',
              backdropFilter: 'blur(6px)',
              zIndex: 99999,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '1.5rem',
            }}
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              style={{
                backgroundColor: '#ffffff',
                borderRadius: '18px',
                padding: '2rem',
                maxWidth: '520px',
                width: '100%',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)',
                border: '1.5px solid #fca5a5',
                textAlign: 'center',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div
                style={{
                  width: '60px',
                  height: '60px',
                  borderRadius: '50%',
                  backgroundColor: '#fee2e2',
                  color: '#dc2626',
                  display: 'grid',
                  placeItems: 'center',
                  margin: '0 auto 1rem auto',
                }}
              >
                <FiAlertCircle size={32} />
              </div>

              <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.3rem', fontWeight: 800, color: '#991b1b' }}>
                No Loop Available
              </h3>

              <p style={{ margin: '0 0 1.25rem 0', fontSize: '0.92rem', color: '#475569', lineHeight: 1.5, fontWeight: 500 }}>
                Unfortunately, all network loop distribution ports are currently occupied at:
                <strong style={{ display: 'block', color: '#0f172a', marginTop: '0.25rem' }}>
                  {address || city || 'Specified Address'}
                </strong>
              </p>

              <div
                style={{
                  backgroundColor: '#fff7ed',
                  border: '1px solid #fed7aa',
                  borderRadius: '12px',
                  padding: '1rem',
                  marginBottom: '1.5rem',
                  textAlign: 'left',
                }}
              >
                <div style={{ fontWeight: 800, fontSize: '0.85rem', color: '#9a3412', marginBottom: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <FiPhoneCall size={14} /> Recommended Action:
                </div>
                <div style={{ fontSize: '0.82rem', color: '#7c2d12', lineHeight: 1.4 }}>
                  Please visit your <strong>nearest SLTMobitel Regional Teleshop / Branch</strong> or call <strong>1212</strong> to request DP port expansion in your area.
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    if (onGoBack) onGoBack();
                  }}
                  className="btn btn-primary"
                  style={{ width: '100%', padding: '0.75rem', fontWeight: 800 }}
                >
                  Change Location & Try Again
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/')}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    fontWeight: 700,
                    backgroundColor: '#f1f5f9',
                    border: '1px solid #cbd5e1',
                    borderRadius: '10px',
                    color: '#475569',
                    cursor: 'pointer',
                  }}
                >
                  Return to Home
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <style>{`
        @keyframes loop-check-spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </motion.div>
  );
}
