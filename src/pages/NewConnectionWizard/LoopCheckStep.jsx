import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiCheckCircle,
  FiAlertTriangle,
  FiAlertCircle,
  FiMapPin,
  FiArrowRight,
  FiPhoneCall,
  FiRefreshCw,
  FiWifi,
  FiRadio,
  FiCpu,
  FiCheck,
  FiZap,
  FiClock,
  FiCompass,
  FiXCircle,
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import { queryOSSFeasibility, ALTERNATIVE_PACKAGES } from '../../services/ossService';

// ─────────────────────────────────────────────────────────────────────────────
// Area Unavailable Modal — shown when Fiber is selected but not available
// ─────────────────────────────────────────────────────────────────────────────
function AreaUnavailableModal({
  isOpen,
  selectedProduct,
  areaName = '',
  alternatives = [],
  fibreAvailable = false,
  lteAvailable = false,
  onChooseLTE,
  onGoBack,
  onDiscontinue,
}) {
  const lteAlternatives = alternatives.filter((product) =>
    /lte|4g/i.test(`${product.category || ''} ${product.productName || product.name || ''}`)
  );
  const availableLteList = lteAvailable
    ? lteAlternatives.length > 0 ? lteAlternatives : ALTERNATIVE_PACKAGES.LTE
    : [];
  const [selectedLteId, setSelectedLteId] = useState(null);
  useEffect(() => {
    if (isOpen) setSelectedLteId(null);
  }, [isOpen, selectedProduct]);

  if (!isOpen) return null;

  const productName = selectedProduct?.productName || selectedProduct?.name || 'Fibre Broadband';
  const displayArea = areaName || 'your selected location';
  const currentLte = availableLteList.find((p) => (p._id || p.id) === selectedLteId) || null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.72)',
            backdropFilter: 'blur(14px)',
            WebkitBackdropFilter: 'blur(14px)',
            zIndex: 99999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1.25rem',
          }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 20 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '24px',
              padding: '0',
              maxWidth: '580px',
              width: '100%',
              boxShadow: '0 30px 60px -12px rgba(0, 0, 0, 0.4)',
              border: '1.5px solid #fed7aa',
              overflow: 'hidden',
              maxHeight: '92vh',
              display: 'flex',
              flexDirection: 'column',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div
              style={{
                background: 'linear-gradient(135deg, #ea580c 0%, #c2410c 100%)',
                padding: '1.75rem 2rem 1.5rem',
                position: 'relative',
                color: '#ffffff',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', marginBottom: '0.75rem' }}>
                <div
                  style={{
                    width: '52px',
                    height: '52px',
                    borderRadius: '16px',
                    backgroundColor: 'rgba(255,255,255,0.2)',
                    display: 'grid',
                    placeItems: 'center',
                    flexShrink: 0,
                  }}
                >
                  <FiAlertTriangle size={28} color="#ffffff" />
                </div>
                <div>
                  <span
                    style={{
                      display: 'inline-block',
                      backgroundColor: 'rgba(255,255,255,0.25)',
                      padding: '0.2rem 0.6rem',
                      borderRadius: '9999px',
                      fontSize: '0.74rem',
                      fontWeight: 800,
                      letterSpacing: '0.4px',
                      textTransform: 'uppercase',
                      marginBottom: '0.25rem',
                    }}
                  >
                    Coverage Notice
                  </span>
                  <h2 style={{ margin: 0, fontSize: '1.35rem', fontWeight: 900, lineHeight: 1.25 }}>
                    Fibre Loop Not Available
                  </h2>
                </div>
              </div>

              <p style={{ margin: 0, fontSize: '0.88rem', color: 'rgba(255,255,255,0.92)', lineHeight: 1.45, fontWeight: 500 }}>
                The selected Fibre service <strong style={{ color: '#ffffff' }}>{productName}</strong> is not available in {displayArea}. Review the services available at this location and select an alternative to continue.
              </p>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '1.5rem 1.75rem', overflowY: 'auto' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '0.65rem', marginBottom: '1.25rem' }}>
                {[
                  { label: 'FTTH / Fibre loop', available: fibreAvailable },
                  { label: 'Mobitel 4G / LTE', available: lteAvailable },
                ].map((service) => (
                  <div
                    key={service.label}
                    style={{
                      border: `1.5px solid ${service.available ? '#86efac' : '#fecaca'}`,
                      backgroundColor: service.available ? '#f0fdf4' : '#fef2f2',
                      borderRadius: '10px',
                      padding: '0.75rem',
                      color: service.available ? '#166534' : '#991b1b',
                      fontSize: '0.82rem',
                      fontWeight: 800,
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.25rem' }}>
                      {service.available ? <FiCheckCircle size={15} /> : <FiXCircle size={15} />}
                      {service.label}
                    </div>
                    <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>
                      {service.available ? 'Available here' : 'Not available here'}
                    </span>
                  </div>
                ))}
              </div>

              {/* Highlight Box: Choose LTE instead */}
              {lteAvailable && <div
                style={{
                  backgroundColor: '#fff7ed',
                  border: '1.5px solid #fed7aa',
                  borderRadius: '14px',
                  padding: '1rem 1.15rem',
                  marginBottom: '1.25rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.65rem' }}>
                  <div
                    style={{
                      backgroundColor: '#ea580c',
                      color: '#ffffff',
                      borderRadius: '8px',
                      width: '26px',
                      height: '26px',
                      display: 'grid',
                      placeItems: 'center',
                      flexShrink: 0,
                      marginTop: '0.1rem',
                    }}
                  >
                    <FiWifi size={15} />
                  </div>
                  <div>
                    <h4 style={{ margin: '0 0 0.25rem 0', fontSize: '0.94rem', fontWeight: 800, color: '#9a3412' }}>
                      LTE service is available at your location
                    </h4>
                    <p style={{ margin: 0, fontSize: '0.84rem', color: '#7c2d12', lineHeight: 1.45 }}>
                      Continue to the package selection portal to view and select an LTE service.
                    </p>
                  </div>
                </div>

                {/* Key Benefits of LTE */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
                    gap: '0.6rem',
                    marginTop: '0.85rem',
                    paddingTop: '0.75rem',
                    borderTop: '1px solid #ffedd5',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.78rem', color: '#9a3412', fontWeight: 700 }}>
                    <FiCheckCircle size={14} color="#ea580c" />
                    <span>Instant Plug &amp; Play</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.78rem', color: '#9a3412', fontWeight: 700 }}>
                    <FiCheckCircle size={14} color="#ea580c" />
                    <span>No Cable Drilling</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.78rem', color: '#9a3412', fontWeight: 700 }}>
                    <FiCheckCircle size={14} color="#ea580c" />
                    <span>Free Doorstep Delivery</span>
                  </div>
                </div>
              </div>}

              {/* Package selection is handled in the external portal. */}
              {false && lteAvailable && <div style={{ marginBottom: '1.35rem' }}>
          <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 800, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.55rem' }}>
            Select One LTE Package to Continue:
                </label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                  {availableLteList.map((alt) => {
                    const isSelected = (alt._id || alt.id) === (currentLte?._id || currentLte?.id);
                    return (
                      <div
                        key={alt._id || alt.id}
                        onClick={() => setSelectedLteId(alt._id || alt.id)}
                        style={{
                          border: `2px solid ${isSelected ? '#ea580c' : '#e2e8f0'}`,
                          backgroundColor: isSelected ? '#fff7ed' : '#ffffff',
                          borderRadius: '12px',
                          padding: '0.9rem 1.1rem',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                          boxShadow: isSelected ? '0 4px 12px rgba(234, 88, 12, 0.12)' : 'none',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <input
                            type="radio"
                            name="selectedLtePackage"
                            checked={isSelected}
                            onChange={() => setSelectedLteId(alt._id || alt.id)}
                            style={{ accentColor: '#ea580c', width: '18px', height: '18px' }}
                          />
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                              <span style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0f172a' }}>
                                {alt.name || alt.productName}
                              </span>
                              <span style={{ backgroundColor: '#fed7aa', color: '#9a3412', fontSize: '0.68rem', fontWeight: 800, padding: '0.1rem 0.45rem', borderRadius: '5px' }}>
                                {alt.quota || alt.speed || 'LTE'}
                              </span>
                            </div>
                            <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '0.15rem' }}>
                              {alt.features?.slice(0, 2).join(' • ')}
                            </div>
                          </div>
                        </div>

                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontSize: '1.05rem', fontWeight: 900, color: '#ea580c' }}>
                            Rs. {(alt.monthlyPrice || alt.price || 3999).toLocaleString()}
                          </div>
                          <div style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 600 }}>/month</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>}

              {/* Action Buttons */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                <button
                  type="button"
                  onClick={() => window.open(import.meta.env.VITE_PACKAGE_SELECTION_PORTAL_URL || 'https://dpdlab1.slt.lk:703', '_blank', 'noopener,noreferrer')}
                  disabled={!lteAvailable}
                  style={{
                    backgroundColor: lteAvailable ? '#ea580c' : '#cbd5e1',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '12px',
                    padding: '0.95rem 1.4rem',
                    fontSize: '0.98rem',
                    fontWeight: 800,
                    cursor: lteAvailable ? 'pointer' : 'not-allowed',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.55rem',
                    boxShadow: lteAvailable ? '0 6px 20px rgba(234, 88, 12, 0.35)' : 'none',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <FiWifi size={20} />
                  <span>{lteAvailable ? 'Go to package selection portal' : 'No alternative service is available here'}</span>
                  <FiArrowRight size={18} />
                </button>

                <button
                  type="button"
                  onClick={onDiscontinue || onGoBack}
                  style={{
                    backgroundColor: '#ffffff',
                    color: '#991b1b',
                    border: '1.5px solid #fecaca',
                    borderRadius: '12px',
                    padding: '0.8rem 1.25rem',
                    fontSize: '0.9rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                  }}
                >
                  <FiXCircle size={16} />
                  Discontinue Fibre-only registration
                </button>
              </div>

              {/* Support Hotline */}
              <p style={{ margin: '1rem 0 0', fontSize: '0.78rem', color: '#94a3b8', textAlign: 'center', fontWeight: 500 }}>
                Need technical assistance? Call SLTMobitel Support at <a href="tel:1212" style={{ color: '#0f57a8', fontWeight: 700, textDecoration: 'none' }}>1212</a>
              </p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

export default function LoopCheckStep({
  formData = {},
  selectedProduct = null,
  onSelectAlternativeProduct,
  onAvailable,
  onGoBack,
  onDiscontinue,
}) {
  const [phase, setPhase] = useState('checking'); // 'checking' | 'completed'
  const [scanStep, setScanStep] = useState(1);
  const [ossData, setOssData] = useState(null);
  const [checkError, setCheckError] = useState('');
  const [waitlistRegistered, setWaitlistRegistered] = useState(false);
  const [showSurveyModal, setShowSurveyModal] = useState(false);
  const checkSequenceRef = useRef(0);
  const checkTimersRef = useRef([]);

  const address = formData.installAddress || formData.address || '';
  const city = formData.city || '';
  const district = formData.district || '';
  const latitude = formData.latitude || null;
  const longitude = formData.longitude || null;

  // Cancel previous visual timers to prevent out-of-date results from showing.
  const clearCheckTimers = () => {
    checkTimersRef.current.forEach(clearTimeout);
    checkTimersRef.current = [];
  };

  // Run OSS feasibility against the service implementation.
  const executeOSSCheck = async () => {
    const currentSequence = ++checkSequenceRef.current;
    clearCheckTimers();
    setPhase('checking');
    setScanStep(1);
    setCheckError('');
    setOssData(null);

    checkTimersRef.current = [
      setTimeout(() => setScanStep(2), 600),
      setTimeout(() => setScanStep(3), 1200),
      setTimeout(() => setScanStep(4), 1800),
    ];

    try {
      const data = await queryOSSFeasibility({
        address,
        city,
        district,
        latitude,
        longitude,
        requestedProduct: selectedProduct,
      });

      if (currentSequence !== checkSequenceRef.current) return;
      if (!data || typeof data !== 'object') {
        throw new Error('The coverage check returned no result.');
      }

      checkTimersRef.current.push(setTimeout(() => {
        if (currentSequence !== checkSequenceRef.current) return;
        setOssData(data);
        setPhase('completed');
      }, 2100));
    } catch (err) {
      if (currentSequence !== checkSequenceRef.current) return;
      console.error('OSS check failed:', err);
      clearCheckTimers();
      setCheckError('We couldn’t complete the coverage check. Please try again.');
      setPhase('error');
    }
  };

  const selectedProductKey = [
    selectedProduct?._id,
    selectedProduct?.id,
    selectedProduct?.category,
    selectedProduct?.productName,
    selectedProduct?.name,
  ].filter(Boolean).join('|');

  useEffect(() => {
    executeOSSCheck();
    return () => {
      ++checkSequenceRef.current;
      clearCheckTimers();
    };
    // Object identity of selectedProduct may change while its logical choice stays the same.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [address, city, district, latitude, longitude, selectedProductKey]);

  const handleSwitchAlternative = (altProduct) => {
    if (!altProduct || !onSelectAlternativeProduct) {
      return;
    }
    onSelectAlternativeProduct(altProduct);
    toast.success(`Selected ${altProduct.name || altProduct.productName}.`, {
      icon: '📶',
    });
    onAvailable?.();
  };

  // Handler: customer chooses LTE from the area-unavailable modal
  const handleChooseLTE = (lteProduct) => {
    handleSwitchAlternative(lteProduct);
  };

  // Handler: customer closes the coverage notice and returns to the previous step
  const handleGoBackFromModal = () => {
    onGoBack();
  };

  const handleRegisterWaitlist = () => {
    setWaitlistRegistered(true);
    toast('Demo only: Fibre waitlist interest saved on this page. No request has been submitted to SLTMobitel.');
  };

  // Derived states
  const fibre = ossData?.fibre || {};
  const lte = ossData?.lte || {};
  const productDescription = `${selectedProduct?.category || ''} ${selectedProduct?.productName || selectedProduct?.name || ''}`;
  const isFibreSelected = /fibre|fiber|ftth/i.test(productDescription);
  const isLteSelected = /lte|4g/i.test(productDescription);
  const selectedNetworkAvailable = isFibreSelected
    ? fibre.available === true
    : isLteSelected
      ? lte.available === true
      : fibre.available === true || lte.available === true;
  const isReqFeasible = ossData?.requestedServiceFeasible === true && selectedNetworkAvailable;
  const alternatives = ossData?.alternativeServices || [];
  const overallStatus = ossData?.overallStatus || 'UNAVAILABLE';

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      {/* ── Step Header ── */}
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div>
            <h3 style={{ color: '#0f172a', margin: '0 0 0.35rem 0', fontSize: '1.45rem', fontWeight: 800, letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <FiCpu color="#0f57a8" /> Fibre Loop Availability Check
            </h3>
            <p style={{ color: '#64748b', margin: 0, fontSize: '0.9rem' }}>
              We check FTTH loop availability first. If there is no loop, available services such as LTE will be offered before you continue.
            </p>
          </div>

        </div>
      </div>

      {/* ── Verified Installation Location Card with GPS Indicator ── */}
      <div
        style={{
          backgroundColor: '#f8fafc',
          border: '1.5px solid #e2e8f0',
          borderRadius: '16px',
          padding: '1.15rem 1.4rem',
          marginBottom: '1.75rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.02)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', maxWidth: '680px' }}>
          <div
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '10px',
              backgroundColor: '#eff6ff',
              color: '#0f57a8',
              display: 'grid',
              placeItems: 'center',
              flexShrink: 0,
              marginTop: '0.15rem',
            }}
          >
            <FiMapPin size={20} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.2rem' }}>
              <span style={{ fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px', color: '#64748b' }}>
                Evaluated Service Address
              </span>
              {latitude && longitude ? (
                <span
                  style={{
                    backgroundColor: '#dcfce7',
                    color: '#166534',
                    border: '1px solid #bbf7d0',
                    fontSize: '0.72rem',
                    fontWeight: 800,
                    padding: '0.15rem 0.5rem',
                    borderRadius: '9999px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.25rem',
                  }}
                >
                  <FiCompass size={11} /> GPS: {Number(latitude).toFixed(4)}°, {Number(longitude).toFixed(4)}°
                </span>
              ) : (
                <span
                  style={{
                    backgroundColor: '#f1f5f9',
                    color: '#475569',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    padding: '0.15rem 0.5rem',
                    borderRadius: '9999px',
                  }}
                >
                  Address Match
                </span>
              )}
            </div>
            <div style={{ fontSize: '0.96rem', fontWeight: 700, color: '#0f172a', lineHeight: 1.35 }}>
              {address || city || 'Current Service Location'}
            </div>
            {ossData?.location?.servingExchange && (
              <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600, marginTop: '0.25rem' }}>
                Serving Optical Node: <strong style={{ color: '#0f57a8' }}>{ossData.location.servingExchange.name}</strong> ({ossData.location.servingExchange.code})
              </div>
            )}
          </div>
        </div>

        <button
          type="button"
          onClick={onGoBack}
          style={{
            backgroundColor: '#ffffff',
            border: '1px solid #cbd5e1',
            borderRadius: '10px',
            padding: '0.5rem 0.9rem',
            fontSize: '0.82rem',
            fontWeight: 700,
            color: '#334155',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
          }}
        >
          Change Location
        </button>
      </div>

      {/* ── Main OSS Body ── */}
      <AnimatePresence mode="wait">
        {phase === 'checking' && (
          <motion.div
            key="checking"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '20px',
              padding: '3rem 2rem',
              textAlign: 'center',
              border: '1.5px solid #e2e8f0',
              boxShadow: '0 8px 30px rgba(0, 0, 0, 0.03)',
            }}
          >
            {/* Spinning Radar Animation */}
            <div
              style={{
                width: '68px',
                height: '68px',
                borderRadius: '50%',
                border: '3.5px solid #e2e8f0',
                borderTopColor: '#0f57a8',
                borderRightColor: '#0284c7',
                margin: '0 auto 1.5rem auto',
                animation: 'oss-spin 0.9s cubic-bezier(0.68, -0.55, 0.27, 1.55) infinite',
              }}
            />

            <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '1.3rem', fontWeight: 800, color: '#0f172a' }}>
              Querying OSS Network Inventory...
            </h4>
            <p style={{ margin: '0 auto 2rem auto', fontSize: '0.88rem', color: '#64748b', maxWidth: '480px' }}>
              Validating distribution loop parameters, optical splitters, and cellular signal coverage.
            </p>

            {/* Step Check Progression */}
            <div style={{ maxWidth: '440px', margin: '0 auto', textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.85rem', color: scanStep >= 1 ? '#0f57a8' : '#94a3b8', fontWeight: 700 }}>
                <span style={{ width: '20px', height: '20px', borderRadius: '50%', backgroundColor: scanStep >= 1 ? '#dbeafe' : '#f1f5f9', display: 'grid', placeItems: 'center', fontSize: '0.75rem' }}>
                  {scanStep > 1 ? <FiCheck color="#16a34a" /> : '1'}
                </span>
                <span>Connecting to Regional SLTMobitel OLT Core Exchange</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.85rem', color: scanStep >= 2 ? '#0f57a8' : '#94a3b8', fontWeight: 700 }}>
                <span style={{ width: '20px', height: '20px', borderRadius: '50%', backgroundColor: scanStep >= 2 ? '#dbeafe' : '#f1f5f9', display: 'grid', placeItems: 'center', fontSize: '0.75rem' }}>
                  {scanStep > 2 ? <FiCheck color="#16a34a" /> : '2'}
                </span>
                <span>Auditing Fibre Distribution Point (FDP) &amp; Port Capacity</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.85rem', color: scanStep >= 3 ? '#0f57a8' : '#94a3b8', fontWeight: 700 }}>
                <span style={{ width: '20px', height: '20px', borderRadius: '50%', backgroundColor: scanStep >= 3 ? '#dbeafe' : '#f1f5f9', display: 'grid', placeItems: 'center', fontSize: '0.75rem' }}>
                  {scanStep > 3 ? <FiCheck color="#16a34a" /> : '3'}
                </span>
                <span>Measuring Mobitel 4G LTE Base Station RF Signal Strength</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.85rem', color: scanStep >= 4 ? '#0f57a8' : '#94a3b8', fontWeight: 700 }}>
                <span style={{ width: '20px', height: '20px', borderRadius: '50%', backgroundColor: scanStep >= 4 ? '#dbeafe' : '#f1f5f9', display: 'grid', placeItems: 'center', fontSize: '0.75rem' }}>
                  4
                </span>
                <span>Compiling Comprehensive Feasibility Qualification Report</span>
              </div>
            </div>
          </motion.div>
        )}

        {phase === 'error' && (
          <motion.div
            key="error"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              backgroundColor: '#fff7ed',
              border: '1.5px solid #fed7aa',
              borderRadius: '16px',
              padding: '2rem',
              textAlign: 'center',
            }}
          >
            <FiAlertCircle size={32} color="#c2410c" />
            <h4 style={{ margin: '0.75rem 0 0.4rem', color: '#9a3412' }}>Coverage Check Could Not Be Completed</h4>
            <p style={{ margin: '0 0 1.25rem', color: '#7c2d12', fontSize: '0.9rem' }}>{checkError}</p>
            <button
              type="button"
              onClick={() => executeOSSCheck()}
              className="btn btn-primary"
              style={{ marginRight: '0.5rem' }}
            >
              Try Again
            </button>
            <button type="button" onClick={onGoBack} className="btn btn-secondary">
              Change Location
            </button>
          </motion.div>
        )}

        {phase === 'completed' && (
          <motion.div key="completed" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.3 }}>
            {/* ── Status Banner (Based on OSS Response) ── */}
            {isReqFeasible && overallStatus !== 'UNAVAILABLE' ? (
              <div
                style={{
                  backgroundColor: '#f0fdf4',
                  border: '1.5px solid #86efac',
                  borderRadius: '16px',
                  padding: '1.25rem 1.5rem',
                  marginBottom: '1.75rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  boxShadow: '0 4px 15px rgba(22, 163, 74, 0.06)',
                }}
              >
                <div
                  style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '50%',
                    backgroundColor: '#dcfce7',
                    color: '#16a34a',
                    display: 'grid',
                    placeItems: 'center',
                    flexShrink: 0,
                  }}
                >
                  <FiCheckCircle size={28} />
                </div>
                <div>
                  <h4 style={{ margin: '0 0 0.25rem 0', fontSize: '1.15rem', fontWeight: 800, color: '#14532d' }}>
                    Service Available at Your Location!
                  </h4>
                  <p style={{ margin: 0, fontSize: '0.88rem', color: '#166534', fontWeight: 600 }}>
                    {selectedProduct
                      ? `The coverage check reports that ${selectedProduct.productName || selectedProduct.name || 'your selected package'} may be available at this address, subject to final provider confirmation.`
                      : 'High-speed broadband network infrastructure is verified and available for your premises.'}
                  </p>
                </div>
              </div>
            ) : !isReqFeasible && alternatives.length > 0 ? (
              /* Requirement 4: Notify Customer when service is unavailable */
              <div
                style={{
                  backgroundColor: '#fffbeb',
                  border: '1.5px solid #fcd34d',
                  borderRadius: '16px',
                  padding: '1.25rem 1.5rem',
                  marginBottom: '1.75rem',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '1rem',
                  boxShadow: '0 4px 15px rgba(217, 119, 6, 0.08)',
                }}
              >
                <div
                  style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '50%',
                    backgroundColor: '#fef3c7',
                    color: '#d97706',
                    display: 'grid',
                    placeItems: 'center',
                    flexShrink: 0,
                    marginTop: '0.1rem',
                  }}
                >
                  <FiAlertTriangle size={26} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                    <span style={{ backgroundColor: '#fef3c7', color: '#b45309', padding: '0.15rem 0.5rem', borderRadius: '6px', fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase' }}>
                      OSS Feasibility Notice
                    </span>
                  </div>
                  <h4 style={{ margin: '0 0 0.35rem 0', fontSize: '1.15rem', fontWeight: 800, color: '#78350f' }}>
                    Selected Service Unavailable at this Exact Address
                  </h4>
                  <p style={{ margin: '0 0 0.85rem 0', fontSize: '0.88rem', color: '#92400e', lineHeight: 1.45, fontWeight: 500 }}>
                    {ossData?.requestedServiceMessage ||
                      'The nearest optical Fibre Distribution Point (FDP) has reached full capacity or is out of drop cable range.'}
                  </p>

                  <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                    <button
                      type="button"
                      onClick={handleRegisterWaitlist}
                      disabled={waitlistRegistered}
                      style={{
                        backgroundColor: waitlistRegistered ? '#dcfce7' : '#ffffff',
                        border: `1.5px solid ${waitlistRegistered ? '#86efac' : '#d97706'}`,
                        color: waitlistRegistered ? '#166534' : '#92400e',
                        padding: '0.45rem 0.9rem',
                        borderRadius: '8px',
                        fontSize: '0.82rem',
                        fontWeight: 800,
                        cursor: waitlistRegistered ? 'default' : 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.4rem',
                      }}
                    >
                      {waitlistRegistered ? <FiCheck size={14} /> : <FiClock size={14} />}
                      {waitlistRegistered ? 'Demo interest saved (not submitted)' : 'Join Priority Fibre Waitlist'}
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              /* Completely unserviced area */
              <div
                style={{
                  backgroundColor: '#fef2f2',
                  border: '1.5px solid #fca5a5',
                  borderRadius: '16px',
                  padding: '1.25rem 1.5rem',
                  marginBottom: '1.75rem',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '1rem',
                  boxShadow: '0 4px 15px rgba(220, 38, 38, 0.08)',
                }}
              >
                <div
                  style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '50%',
                    backgroundColor: '#fee2e2',
                    color: '#dc2626',
                    display: 'grid',
                    placeItems: 'center',
                    flexShrink: 0,
                  }}
                >
                  <FiAlertCircle size={28} />
                </div>
                <div>
                  <h4 style={{ margin: '0 0 0.35rem 0', fontSize: '1.15rem', fontWeight: 800, color: '#991b1b' }}>
                    Network Loop &amp; Wireless Coverage Unavailable
                  </h4>
                  <p style={{ margin: '0 0 0.75rem 0', fontSize: '0.88rem', color: '#b91c1c', lineHeight: 1.45 }}>
                    Unfortunately, this address is located outside SLTMobitel's immediate distribution loop and cellular coverage boundaries.
                  </p>
                  <button
                    type="button"
                    onClick={() => setShowSurveyModal(true)}
                    style={{
                      backgroundColor: '#dc2626',
                      color: '#ffffff',
                      border: 'none',
                      padding: '0.45rem 0.9rem',
                      borderRadius: '8px',
                      fontSize: '0.82rem',
                      fontWeight: 800,
                      cursor: 'pointer',
                    }}
                  >
                    Request Engineering Field Survey
                  </button>
                </div>
              </div>
            )}

            {/* ── 2-Column OSS Detailed Cards: Fibre FDP & LTE Coverage ── */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
              {/* ── CARD 1: Fibre FDP Availability ── */}
              <div
                style={{
                  backgroundColor: '#ffffff',
                  borderRadius: '16px',
                  border: `1.5px solid ${fibre.available ? '#bfdbfe' : '#e2e8f0'}`,
                  padding: '1.5rem',
                  boxShadow: '0 4px 15px rgba(0, 0, 0, 0.03)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                      <div
                        style={{
                          width: '40px',
                          height: '40px',
                          borderRadius: '10px',
                          backgroundColor: '#eff6ff',
                          color: '#0f57a8',
                          display: 'grid',
                          placeItems: 'center',
                        }}
                      >
                        <FiZap size={22} />
                      </div>
                      <div>
                        <h4 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: '#0f172a' }}>
                          Optical Fibre (FTTH)
                        </h4>
                        <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>
                          Fibre Distribution Point (FDP)
                        </span>
                      </div>
                    </div>

                    <span
                      style={{
                        backgroundColor: fibre.available ? '#dcfce7' : '#fee2e2',
                        color: fibre.available ? '#166534' : '#991b1b',
                        padding: '0.25rem 0.75rem',
                        borderRadius: '9999px',
                        fontSize: '0.78rem',
                        fontWeight: 800,
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.35rem',
                      }}
                    >
                      {fibre.available ? <FiCheck size={13} /> : <FiAlertCircle size={13} />}
                      {fibre.available ? 'FDP Available' : (fibre.status === 'PORTS_EXHAUSTED' ? 'Ports Full' : 'Unavailable')}
                    </span>
                  </div>

                  {/* FDP Technical Metrics */}
                  <div
                    style={{
                      backgroundColor: '#f8fafc',
                      borderRadius: '12px',
                      padding: '1rem',
                      marginBottom: '1rem',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.75rem',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem' }}>
                      <span style={{ color: '#64748b', fontWeight: 600 }}>FDP Terminal ID:</span>
                      <strong style={{ color: '#0f172a', fontFamily: 'monospace', fontSize: '0.9rem' }}>{fibre.fdpId || 'Not reported'}</strong>
                    </div>

                    {/* Distance Meter */}
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem', marginBottom: '0.3rem' }}>
                        <span style={{ color: '#64748b', fontWeight: 600 }}>Distance to FDP:</span>
                        <strong style={{ color: fibre.distanceMeters <= 350 ? '#15803d' : '#dc2626' }}>
                          {fibre.distanceMeters ?? 'Not reported'} meters (Max: 350m)
                        </strong>
                      </div>
                      <div style={{ width: '100%', height: '6px', backgroundColor: '#e2e8f0', borderRadius: '9999px', overflow: 'hidden' }}>
                        <div
                          style={{
                            width: `${Math.min(100, ((Number(fibre.distanceMeters) || 0) / 350) * 100)}%`,
                            height: '100%',
                            backgroundColor: fibre.distanceMeters <= 350 ? '#10b981' : '#ef4444',
                            borderRadius: '9999px',
                          }}
                        />
                      </div>
                    </div>

                    {/* Port Allocation Visualization */}
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem', marginBottom: '0.4rem' }}>
                        <span style={{ color: '#64748b', fontWeight: 600 }}>Splitter Ports:</span>
                        <strong style={{ color: '#0f172a' }}>
                          {fibre.availablePorts ?? 0} Free / {fibre.totalPorts ?? 0} Total
                        </strong>
                      </div>
                      {/* Port Dots */}
                      <div style={{ display: 'flex', gap: '0.35rem' }}>
                        {Array.from({ length: Math.max(0, Math.min(128, Number(fibre.totalPorts) || 0)) }).map((_, i) => {
                          const isFree = i < (fibre.availablePorts ?? 0);
                          return (
                            <div
                              key={i}
                              title={isFree ? 'Free Optical Port' : 'Allocated Port'}
                              style={{
                                flex: 1,
                                height: '10px',
                                borderRadius: '4px',
                                backgroundColor: isFree ? '#22c55e' : '#cbd5e1',
                              }}
                            />
                          );
                        })}
                      </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem' }}>
                      <span style={{ color: '#64748b', fontWeight: 600 }}>Max Fibre Speed:</span>
                      <strong style={{ color: '#0f57a8' }}>{fibre.maxSpeed || 'Not reported'}</strong>
                    </div>
                  </div>
                </div>

                <p style={{ margin: 0, fontSize: '0.8rem', color: '#475569', lineHeight: 1.4, fontStyle: 'italic' }}>
                  {fibre.reason}
                </p>
              </div>

              {/* ── CARD 2: Mobitel 4G/LTE Coverage ── */}
              <div
                style={{
                  backgroundColor: '#ffffff',
                  borderRadius: '16px',
                  border: `1.5px solid ${lte.available ? '#fed7aa' : '#e2e8f0'}`,
                  padding: '1.5rem',
                  boxShadow: '0 4px 15px rgba(0, 0, 0, 0.03)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                      <div
                        style={{
                          width: '40px',
                          height: '40px',
                          borderRadius: '10px',
                          backgroundColor: '#fff7ed',
                          color: '#ea580c',
                          display: 'grid',
                          placeItems: 'center',
                        }}
                      >
                        <FiRadio size={22} />
                      </div>
                      <div>
                        <h4 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: '#0f172a' }}>
                          Mobitel 4G / LTE Coverage
                        </h4>
                        <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>
                          Wireless Home Broadband
                        </span>
                      </div>
                    </div>

                    <span
                      style={{
                        backgroundColor: lte.available ? '#ffedd5' : '#fee2e2',
                        color: lte.available ? '#c2410c' : '#991b1b',
                        padding: '0.25rem 0.75rem',
                        borderRadius: '9999px',
                        fontSize: '0.78rem',
                        fontWeight: 800,
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.35rem',
                      }}
                    >
                      {lte.available ? <FiWifi size={13} /> : <FiAlertCircle size={13} />}
                      {lte.available ? `${lte.signalStrength || 'Available'} 4G` : 'No Signal'}
                    </span>
                  </div>

                  {/* LTE Technical Metrics */}
                  <div
                    style={{
                      backgroundColor: '#f8fafc',
                      borderRadius: '12px',
                      padding: '1rem',
                      marginBottom: '1rem',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.75rem',
                    }}
                  >
                    {/* Signal Strength Meter */}
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem', marginBottom: '0.3rem' }}>
                        <span style={{ color: '#64748b', fontWeight: 600 }}>Cellular Signal (RSRP):</span>
                        <strong style={{ color: '#ea580c' }}>
                          {lte.rsrp ?? 'Not reported'} dBm ({lte.signalPercent ?? 0}% Signal)
                        </strong>
                      </div>
                      <div style={{ display: 'flex', gap: '4px', alignItems: 'flex-end', height: '14px' }}>
                        {[25, 50, 75, 100].map((step, idx) => (
                          <div
                            key={idx}
                            style={{
                              flex: 1,
                              height: `${(idx + 1) * 25}%`,
                              borderRadius: '2px',
                              backgroundColor: (lte.signalPercent ?? 0) >= step ? '#f97316' : '#cbd5e1',
                            }}
                          />
                        ))}
                      </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem' }}>
                      <span style={{ color: '#64748b', fontWeight: 600 }}>Nearest Base Station:</span>
                      <strong style={{ color: '#0f172a', fontSize: '0.85rem' }}>{lte.nearestTower || 'Not reported'}</strong>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem' }}>
                      <span style={{ color: '#64748b', fontWeight: 600 }}>Tower Distance:</span>
                      <strong style={{ color: '#0f172a' }}>{lte.distanceKm ?? 'Not reported'} km</strong>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem' }}>
                      <span style={{ color: '#64748b', fontWeight: 600 }}>Carrier Bands:</span>
                      <strong style={{ color: '#0f172a', fontSize: '0.8rem' }}>{lte.carrierBands || 'Not reported'}</strong>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem' }}>
                      <span style={{ color: '#64748b', fontWeight: 600 }}>Provisioning ETA:</span>
                      <strong style={{ color: '#16a34a' }}>{lte.provisioningEta || 'To be confirmed'}</strong>
                    </div>
                  </div>
                </div>

                <p style={{ margin: 0, fontSize: '0.8rem', color: '#475569', lineHeight: 1.4, fontStyle: 'italic' }}>
                  {lte.reason}
                </p>
              </div>
            </div>

            {/* ── Requirement 4: DISPLAY ALTERNATIVE SERVICES when unavailable ── */}
            {alternatives.length > 0 && !isReqFeasible && (
              <div
                style={{
                  backgroundColor: '#ffffff',
                  borderRadius: '18px',
                  border: '2px solid #38bdf8',
                  padding: '1.75rem',
                  marginBottom: '2rem',
                  boxShadow: '0 8px 30px rgba(14, 165, 233, 0.08)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1.25rem' }}>
                  <div>
                    <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#0284c7', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      Alternative Packages
                    </span>
                    <h4 style={{ margin: '0.2rem 0 0 0', fontSize: '1.2rem', fontWeight: 800, color: '#0f172a' }}>
                      Choose another package if you want to continue
                    </h4>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
                  {alternatives.map((alt) => (
                    <div
                      key={alt._id}
                      style={{
                        border: '1.5px solid #cbd5e1',
                        borderRadius: '14px',
                        padding: '1.25rem',
                        backgroundColor: '#f8fafc',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        transition: 'all 0.2s ease',
                      }}
                    >
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                          <h5 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: '#0f172a' }}>
                            {alt.name}
                          </h5>
                          <span style={{ backgroundColor: '#fed7aa', color: '#9a3412', fontSize: '0.7rem', fontWeight: 800, padding: '0.15rem 0.5rem', borderRadius: '6px' }}>
                            {alt.speed}
                          </span>
                        </div>

                        <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f57a8', marginBottom: '0.75rem' }}>
                          Rs. {alt.monthlyPrice?.toLocaleString()}{' '}
                          <span style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 600 }}>/month</span>
                        </div>

                        <ul style={{ margin: '0 0 1.25rem 0', paddingLeft: '1.1rem', fontSize: '0.8rem', color: '#475569', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                          {alt.features?.slice(0, 3).map((f, i) => (
                            <li key={i}>{f}</li>
                          ))}
                        </ul>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleSwitchAlternative(alt)}
                        style={{
                          backgroundColor: '#0f57a8',
                          color: '#ffffff',
                          border: 'none',
                          borderRadius: '10px',
                          padding: '0.65rem 1rem',
                          fontSize: '0.88rem',
                          fontWeight: 800,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '0.4rem',
                          boxShadow: '0 4px 12px rgba(15, 87, 168, 0.2)',
                        }}
                      >
                        <span>Choose this package &amp; continue</span>
                        <FiArrowRight size={15} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── Bottom Action Bar ── */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', borderTop: '1px solid #e2e8f0', paddingTop: '1.5rem' }}>
              <button
                type="button"
                onClick={onGoBack}
                style={{
                  backgroundColor: '#f1f5f9',
                  border: '1px solid #cbd5e1',
                  color: '#334155',
                  padding: '0.75rem 1.4rem',
                  borderRadius: '12px',
                  fontWeight: 700,
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                }}
              >
                ← Back to Location Selection
              </button>

              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button
                  type="button"
                  onClick={() => executeOSSCheck()}
                  style={{
                    backgroundColor: '#ffffff',
                    border: '1px solid #cbd5e1',
                    color: '#0f57a8',
                    padding: '0.75rem 1.15rem',
                    borderRadius: '12px',
                    fontWeight: 700,
                    fontSize: '0.9rem',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                  }}
                >
                  <FiRefreshCw size={15} />
                  Re-check OSS
                </button>

                {/* Continue button is enabled when service is feasible */}
                {isReqFeasible && overallStatus !== 'UNAVAILABLE' ? (
                  <button
                    type="button"
                    onClick={onAvailable}
                    style={{
                      backgroundColor: '#16a34a',
                      color: '#ffffff',
                      border: 'none',
                      padding: '0.85rem 1.85rem',
                      borderRadius: '12px',
                      fontWeight: 800,
                      fontSize: '0.95rem',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      boxShadow: '0 4px 15px rgba(22, 163, 74, 0.25)',
                    }}
                  >
                    <span>Proceed to Identity Verification</span>
                    <FiArrowRight size={17} />
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled
                    style={{
                      backgroundColor: '#cbd5e1',
                      color: '#64748b',
                      border: 'none',
                      padding: '0.75rem 1.75rem',
                      borderRadius: '12px',
                      fontWeight: 700,
                      fontSize: '0.95rem',
                      cursor: 'not-allowed',
                    }}
                    title="Please switch to an available alternative service or change location to proceed"
                  >
                    Service Unavailable at Location
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Area Unavailable Modal (Fiber not available → suggest LTE) ── */}
      <AreaUnavailableModal
        isOpen={phase === 'completed' && isFibreSelected && fibre.available !== true}
        selectedProduct={selectedProduct}
        areaName={city || district || address || 'your area'}
        alternatives={ossData?.alternativeServices || []}
        fibreAvailable={fibre.available === true}
        lteAvailable={lte.available === true}
        onChooseLTE={handleChooseLTE}
        onGoBack={handleGoBackFromModal}
        onDiscontinue={onDiscontinue}
      />

      {/* ── Engineering Survey Modal (When Unserviced) ── */}
      <AnimatePresence>
        {showSurveyModal && (
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
            onClick={() => setShowSurveyModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              style={{
                backgroundColor: '#ffffff',
                borderRadius: '20px',
                padding: '2rem',
                maxWidth: '520px',
                width: '100%',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.3)',
                border: '1px solid #e2e8f0',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{ textAlign: 'center', marginBottom: '1.25rem' }}>
                <div
                  style={{
                    width: '56px',
                    height: '56px',
                    borderRadius: '50%',
                    backgroundColor: '#fee2e2',
                    color: '#dc2626',
                    display: 'grid',
                    placeItems: 'center',
                    margin: '0 auto 1rem auto',
                  }}
                >
                  <FiPhoneCall size={26} />
                </div>
                <h3 style={{ margin: '0 0 0.4rem 0', fontSize: '1.3rem', fontWeight: 800, color: '#0f172a' }}>
                  SLTMobitel Regional Support
                </h3>
                <p style={{ margin: 0, fontSize: '0.88rem', color: '#64748b' }}>
                  Our network planning team can evaluate special off-grid or dedicated line connectivity.
                </p>
              </div>

              <div
                style={{
                  backgroundColor: '#f8fafc',
                  borderRadius: '12px',
                  padding: '1rem',
                  marginBottom: '1.5rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.6rem',
                  fontSize: '0.85rem',
                }}
              >
                <div>
                  <strong>Customer Helpline:</strong> <a href="tel:1212" style={{ color: '#0f57a8', fontWeight: 700 }}>1212 (Toll Free)</a>
                </div>
                <div>
                  <strong>Regional Center:</strong> {ossData?.location?.servingExchange?.name || 'Nearest Regional Teleshop'}
                </div>
                <div>
                  <strong>Logged GPS Coordinates:</strong> {latitude ?? 'Not provided'}, {longitude ?? 'Not provided'}
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                <button
                  type="button"
                  onClick={() => {
                    setShowSurveyModal(false);
                    toast('This demo does not submit a field survey request. Please contact SLTMobitel Support at 1212.');
                  }}
                  style={{
                    backgroundColor: '#0f57a8',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '10px',
                    padding: '0.75rem',
                    fontWeight: 800,
                    cursor: 'pointer',
                  }}
                >
                  Submit Special Survey Request
                </button>
                <button
                  type="button"
                  onClick={() => setShowSurveyModal(false)}
                  style={{
                    backgroundColor: '#f1f5f9',
                    color: '#475569',
                    border: '1px solid #cbd5e1',
                    borderRadius: '10px',
                    padding: '0.75rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <style>{`
        @keyframes oss-spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </motion.div>
  );
}
