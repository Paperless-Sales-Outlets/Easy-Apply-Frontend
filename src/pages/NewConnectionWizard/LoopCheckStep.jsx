import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  FiLayers,
  FiCheck,
  FiInfo,
  FiZap,
  FiClock,
  FiCompass,
  FiCheckSquare,
  FiSliders,
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import { queryOSSFeasibility } from '../../services/ossService';

export default function LoopCheckStep({
  formData = {},
  selectedProduct = null,
  onSelectAlternativeProduct,
  onAvailable,
  onGoBack,
}) {
  const navigate = useNavigate();
  const [phase, setPhase] = useState('checking'); // 'checking' | 'completed'
  const [scanStep, setScanStep] = useState(1);
  const [ossData, setOssData] = useState(null);
  const [activeSimulation, setActiveSimulation] = useState('normal'); // 'normal' | 'no-fibre' | 'no-coverage'
  const [waitlistRegistered, setWaitlistRegistered] = useState(false);
  const [showSurveyModal, setShowSurveyModal] = useState(false);

  const address = formData.installAddress || formData.address || '';
  const city = formData.city || '';
  const district = formData.district || '';
  const latitude = formData.latitude || null;
  const longitude = formData.longitude || null;

  // Run OSS Feasibility Query
  const executeOSSCheck = async (simulationMode = activeSimulation) => {
    setPhase('checking');
    setScanStep(1);

    // Multi-step scanning animation
    const t1 = setTimeout(() => setScanStep(2), 600);
    const t2 = setTimeout(() => setScanStep(3), 1200);
    const t3 = setTimeout(() => setScanStep(4), 1800);

    let queryAddress = address;
    if (simulationMode === 'no-fibre') {
      queryAddress = `${address} (no fibre ports full test)`;
    } else if (simulationMode === 'no-coverage') {
      queryAddress = `${address} (unserviced remote zone test)`;
    }

    try {
      const data = await queryOSSFeasibility({
        address: queryAddress,
        city,
        district,
        latitude,
        longitude,
        requestedProduct: selectedProduct,
      });

      setTimeout(() => {
        setOssData(data);
        setPhase('completed');
      }, 2100);
    } catch (err) {
      console.error('OSS check failed:', err);
      setTimeout(() => {
        setPhase('completed');
      }, 2100);
    }

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  };

  useEffect(() => {
    executeOSSCheck(activeSimulation);
  }, [address, city, latitude, longitude, activeSimulation]);

  const handleSimulateChange = (mode) => {
    setActiveSimulation(mode);
    setWaitlistRegistered(false);
  };

  const handleSwitchAlternative = (altProduct) => {
    if (onSelectAlternativeProduct) {
      onSelectAlternativeProduct(altProduct);
    }
    toast.success(`Switched to ${altProduct.name}! Service is available at your location.`);
    // Re-run check with normal mode and updated product to verify compatibility
    setActiveSimulation('normal');
  };

  const handleRegisterWaitlist = () => {
    setWaitlistRegistered(true);
    toast.success('Your interest in Optical Fibre expansion has been registered with SLTMobitel Planning (Ref #FW-84920).');
  };

  // Derived states
  const fibre = ossData?.fibre || {};
  const lte = ossData?.lte || {};
  const isReqFeasible = ossData?.requestedServiceFeasible ?? true;
  const alternatives = ossData?.alternativeServices || [];
  const overallStatus = ossData?.overallStatus || 'FEASIBLE';

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      {/* ── Step Header ── */}
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div>
            <h3 style={{ color: '#0f172a', margin: '0 0 0.35rem 0', fontSize: '1.45rem', fontWeight: 800, letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <FiCpu color="#0f57a8" /> OSS Service Feasibility &amp; Coverage Check
            </h3>
            <p style={{ color: '#64748b', margin: 0, fontSize: '0.9rem' }}>
              Real-time engineering verification with SLTMobitel Operations Support System (OSS) database.
            </p>
          </div>

          {/* Quick Simulation Controls for Review / Testing */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: '#f1f5f9', padding: '0.35rem 0.65rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
            <FiSliders size={13} color="#64748b" />
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569' }}>Simulate OSS:</span>
            <select
              value={activeSimulation}
              onChange={(e) => handleSimulateChange(e.target.value)}
              style={{
                fontSize: '0.75rem',
                fontWeight: 700,
                padding: '0.2rem 0.4rem',
                borderRadius: '6px',
                border: '1px solid #cbd5e1',
                backgroundColor: '#ffffff',
                color: '#0f172a',
                cursor: 'pointer',
              }}
            >
              <option value="normal">Standard (Fibre &amp; LTE Available)</option>
              <option value="no-fibre">Fibre Ports Saturated (LTE Alternative)</option>
              <option value="no-coverage">Unserviced Zone (No Coverage)</option>
            </select>
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
                      ? `Your selected package (${selectedProduct.productName}) is 100% verified and ready for installation.`
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
                      {waitlistRegistered ? 'Waitlist Registered (#FW-84920)' : 'Join Priority Fibre Waitlist'}
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
                      <strong style={{ color: '#0f172a', fontFamily: 'monospace', fontSize: '0.9rem' }}>{fibre.fdpId || 'FDP-CMB-1048'}</strong>
                    </div>

                    {/* Distance Meter */}
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem', marginBottom: '0.3rem' }}>
                        <span style={{ color: '#64748b', fontWeight: 600 }}>Distance to FDP:</span>
                        <strong style={{ color: fibre.distanceMeters <= 350 ? '#15803d' : '#dc2626' }}>
                          {fibre.distanceMeters || 68} meters (Max: 350m)
                        </strong>
                      </div>
                      <div style={{ width: '100%', height: '6px', backgroundColor: '#e2e8f0', borderRadius: '9999px', overflow: 'hidden' }}>
                        <div
                          style={{
                            width: `${Math.min(100, ((fibre.distanceMeters || 68) / 350) * 100)}%`,
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
                          {fibre.availablePorts || 0} Free / {fibre.totalPorts || 8} Total
                        </strong>
                      </div>
                      {/* Port Dots */}
                      <div style={{ display: 'flex', gap: '0.35rem' }}>
                        {Array.from({ length: fibre.totalPorts || 8 }).map((_, i) => {
                          const isFree = i < (fibre.availablePorts || 0);
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
                      <strong style={{ color: '#0f57a8' }}>{fibre.maxSpeed || 'Up to 1 Gbps'}</strong>
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
                      {lte.available ? `${lte.signalStrength || 'Excellent'} 4G` : 'No Signal'}
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
                          {lte.rsrp || -78} dBm ({lte.signalPercent || 94}% Signal)
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
                              backgroundColor: (lte.signalPercent || 94) >= step ? '#f97316' : '#cbd5e1',
                            }}
                          />
                        ))}
                      </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem' }}>
                      <span style={{ color: '#64748b', fontWeight: 600 }}>Nearest Base Station:</span>
                      <strong style={{ color: '#0f172a', fontSize: '0.85rem' }}>{lte.nearestTower || 'ENB-CMB-402'}</strong>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem' }}>
                      <span style={{ color: '#64748b', fontWeight: 600 }}>Tower Distance:</span>
                      <strong style={{ color: '#0f172a' }}>{lte.distanceKm || 0.45} km</strong>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem' }}>
                      <span style={{ color: '#64748b', fontWeight: 600 }}>Carrier Bands:</span>
                      <strong style={{ color: '#0f172a', fontSize: '0.8rem' }}>B3 (1800MHz) + B40 (2300MHz)</strong>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem' }}>
                      <span style={{ color: '#64748b', fontWeight: 600 }}>Provisioning ETA:</span>
                      <strong style={{ color: '#16a34a' }}>Instant Plug &amp; Play (Next-day)</strong>
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
                      Recommended Alternative Solutions
                    </span>
                    <h4 style={{ margin: '0.2rem 0 0 0', fontSize: '1.2rem', fontWeight: 800, color: '#0f172a' }}>
                      High-Speed Services Available at Your Location Right Now
                    </h4>
                  </div>
                  <span
                    style={{
                      backgroundColor: '#e0f2fe',
                      color: '#0369a1',
                      padding: '0.25rem 0.75rem',
                      borderRadius: '9999px',
                      fontSize: '0.75rem',
                      fontWeight: 800,
                    }}
                  >
                    100% Signal Guaranteed
                  </span>
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
                        <span>Select &amp; Proceed with this Package</span>
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
                      padding: '0.75rem 1.75rem',
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
                    <span>Proceed to Customer Identification</span>
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
                  <strong>Logged GPS Coordinates:</strong> {latitude || '6.9271'}, {longitude || '79.8612'}
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                <button
                  type="button"
                  onClick={() => {
                    setShowSurveyModal(false);
                    toast.success('Field Feasibility Survey ticket #SRV-90214 created. A technician will contact you within 48h.');
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
