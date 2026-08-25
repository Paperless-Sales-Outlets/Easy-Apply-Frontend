import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiSearch,
  FiCheck,
  FiCheckCircle,
  FiClock,
  FiAlertCircle,
  FiCopy,
  FiDownload,
  FiPhoneCall,
  FiX,
  FiRefreshCw,
  FiFileText,
  FiArrowRight,
  FiShield,
} from 'react-icons/fi';
import api from '../utils/api';

export default function CheckStatusPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [reference, setReference] = useState('');
  const [result, setResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const getServiceTypeLabel = (type) => {
    switch (type) {
      case 'new-connection':
        return t('wizards.newConnection.title', 'New Connection');
      case 'reconnection':
        return t('wizards.reconnection.title', 'Reconnection Request');
      case 'relocation':
      case 'location-change':
        return t('wizards.locationChange.title', 'Location Change (Relocation)');
      case 'termination':
        return t('wizards.termination.title', 'Line Termination');
      case 'transfer':
      case 'ownership-change':
        return t('wizards.ownershipChange.title', 'Ownership Transfer');
      case 'package-migration':
        return t('wizards.packageMigration.title', 'Package Migration');
      case 'service-vacation':
        return t('wizards.serviceVacation.title', 'Service Vacation');
      case 'refund-request':
        return t('wizards.refundRequest.title', 'Refund Request');
      default:
        return type || 'SLT Service Application';
    }
  };

  const fetchStatus = useCallback(async (refToSearch) => {
    if (!refToSearch || !refToSearch.trim()) return;

    setIsLoading(true);
    setResult(null);

    try {
      const response = await api.get(
        `/applications/check-status?ref=${encodeURIComponent(refToSearch.trim())}`
      );

      const data = response.data || {};
      setResult({
        status: data.status || 'pending', // 'pending' | 'approved' | 'rejected' | 'in_progress' | 'flagged'
        serviceType: data.serviceType || 'relocation',
        referenceNumber: data.referenceNumber || refToSearch.trim(),
        createdAt: data.createdAt || new Date().toLocaleDateString('en-LK'),
        message:
          data.message ||
          t(
            'checkStatusPage.statusDescription',
            'Your application is currently under review by our technical team.'
          ),
        customerName: data.customerName || '',
        telephone: data.telephone || '',
        notes: data.notes || '',
        actionedBy: data.actionedBy || null,
        actionedAt: data.actionedAt || null,
      });
    } catch (error) {
      setResult({
        status: 'not-found',
        referenceNumber: refToSearch.trim(),
        message: error.response?.data?.message || 'No application found with this reference number. Please verify and try again.',
      });
    } finally {
      setIsLoading(false);
    }
  }, [t]);

  // Read URL param on initial load & auto-trigger status search if ref present
  useEffect(() => {
    const urlRef = searchParams.get('ref');
    if (urlRef) {
      setReference(urlRef);
      fetchStatus(urlRef);
    }
  }, [searchParams, fetchStatus]);

  const handleCheck = (e) => {
    e.preventDefault();
    if (reference) {
      fetchStatus(reference);
    }
  };

  const handleCopy = () => {
    if (result?.referenceNumber) {
      navigator.clipboard.writeText(result.referenceNumber);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div
      style={{
        minHeight: '85vh',
        backgroundColor: '#f8fafc',
        padding: '2.5rem 1rem',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'flex-start',
      }}
    >
      <div style={{ maxWidth: '820px', width: '100%', display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
        
        {/* Main Card Container */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '24px',
            boxShadow: '0 20px 50px rgba(0, 86, 179, 0.07)',
            border: '1px solid #e2e8f0',
            overflow: 'hidden',
          }}
        >
          {/* Top Blue Accent Gradient Bar */}
          <div style={{ height: '6px', background: 'linear-gradient(90deg, #0056b3 0%, #003b73 50%, #10b981 100%)' }} />

          <div style={{ padding: '2.25rem 2.25rem 1.75rem 2.25rem' }}>
            {/* Header Badge & Title */}
            <div style={{ marginBottom: '1.5rem', textAlign: 'center' }}>
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  fontSize: '0.78rem',
                  fontWeight: 900,
                  color: '#0056b3',
                  backgroundColor: '#eff6ff',
                  padding: '0.35rem 0.9rem',
                  borderRadius: '9999px',
                  border: '1px solid #bfdbfe',
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                  marginBottom: '0.75rem',
                }}
              >
                <FiSearch size={14} />
                Real-Time Application Status
              </span>

              <h1 style={{ fontSize: '1.9rem', fontWeight: 900, color: '#0f172a', margin: '0 0 0.5rem 0', letterSpacing: '-0.02em' }}>
                Check Application Status
              </h1>

              <p style={{ fontSize: '0.94rem', color: '#64748b', margin: 0, fontWeight: 600 }}>
                Track live status updates and timeline for your SLTMobitel request.
              </p>
            </div>

            {/* Search Input Form */}
            <form onSubmit={handleCheck} style={{ marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: '280px', position: 'relative' }}>
                  <input
                    id="reference"
                    type="text"
                    value={reference}
                    onChange={(e) => setReference(e.target.value)}
                    placeholder="Enter Reference Number (e.g. REQ-36670371)"
                    style={{
                      width: '100%',
                      padding: '0.9rem 2.75rem 0.9rem 1.15rem',
                      borderRadius: '14px',
                      border: '1.5px solid #cbd5e1',
                      fontSize: '1rem',
                      fontWeight: 800,
                      color: '#0f172a',
                      outline: 'none',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
                      transition: 'all 0.2s ease',
                      boxSizing: 'border-box',
                    }}
                  />
                  {reference && (
                    <button
                      type="button"
                      onClick={() => setReference('')}
                      style={{
                        position: 'absolute',
                        right: '14px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'none',
                        border: 'none',
                        color: '#94a3b8',
                        cursor: 'pointer',
                        padding: '4px',
                        display: 'flex',
                      }}
                    >
                      <FiX size={18} />
                    </button>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isLoading || !reference.trim()}
                  style={{
                    padding: '0.9rem 2rem',
                    borderRadius: '14px',
                    background: isLoading || !reference.trim() ? '#cbd5e1' : 'linear-gradient(135deg, #0056b3 0%, #003b73 100%)',
                    color: '#ffffff',
                    border: 'none',
                    fontWeight: 800,
                    fontSize: '0.95rem',
                    cursor: isLoading || !reference.trim() ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    boxShadow: isLoading || !reference.trim() ? 'none' : '0 4px 16px rgba(0, 86, 179, 0.3)',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {isLoading ? (
                    <>
                      <FiRefreshCw className="spin" size={18} />
                      <span>Checking...</span>
                    </>
                  ) : (
                    <>
                      <span>Check Status</span>
                      <FiArrowRight size={18} />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </motion.div>

        {/* STATUS RESULT CARD */}
        <AnimatePresence mode="wait">
          {result && (
            <motion.div
              key={result.referenceNumber}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -14 }}
              transition={{ duration: 0.25 }}
            >
              {result.status === 'not-found' ? (
                /* NOT FOUND CARD */
                <div
                  style={{
                    backgroundColor: '#ffffff',
                    borderRadius: '20px',
                    padding: '2rem',
                    border: '1.5px solid #fecaca',
                    boxShadow: '0 8px 30px rgba(220, 38, 38, 0.05)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#dc2626', marginBottom: '1rem' }}>
                    <div style={{ backgroundColor: '#fef2f2', padding: '0.65rem', borderRadius: '12px' }}>
                      <FiAlertCircle size={28} />
                    </div>
                    <div>
                      <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 900, color: '#991b1b' }}>
                        No Record Found
                      </h3>
                      <span style={{ fontSize: '0.84rem', color: '#b91c1c', fontWeight: 600 }}>
                        Reference ID: <strong>{result.referenceNumber}</strong>
                      </span>
                    </div>
                  </div>

                  <p style={{ color: '#475569', fontSize: '0.9rem', lineHeight: 1.6, marginBottom: '1.25rem' }}>
                    {result.message} Please make sure you typed the exact reference code from your SMS acknowledgement or application confirmation slip.
                  </p>

                  <div style={{ backgroundColor: '#f8fafc', padding: '1rem 1.25rem', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '0.84rem', color: '#64748b' }}>
                    <strong>Need Help?</strong> Contact SLTMobitel Customer Care at <strong>1212</strong> or visit your nearest SLT Teleshop for assistance.
                  </div>
                </div>
              ) : (
                /* SUCCESSFUL RESULT CARD */
                <div
                  style={{
                    backgroundColor: '#ffffff',
                    borderRadius: '24px',
                    border: '1px solid #e2e8f0',
                    boxShadow: '0 12px 35px rgba(0, 0, 0, 0.06)',
                    overflow: 'hidden',
                  }}
                >
                  {/* Result Header Bar */}
                  <div
                    style={{
                      padding: '1.5rem 2rem',
                      backgroundColor: '#f8fafc',
                      borderBottom: '1px solid #e2e8f0',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      flexWrap: 'wrap',
                      gap: '1rem',
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.25rem' }}>
                        <span style={{ fontSize: '0.75rem', fontWeight: 900, textTransform: 'uppercase', color: '#64748b', letterSpacing: '1px' }}>
                          Reference Number
                        </span>
                        <button
                          onClick={handleCopy}
                          type="button"
                          style={{
                            background: 'none',
                            border: 'none',
                            color: '#0056b3',
                            fontSize: '0.75rem',
                            fontWeight: 800,
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.25rem',
                          }}
                        >
                          <FiCopy size={13} />
                          <span>{copied ? 'Copied!' : 'Copy'}</span>
                        </button>
                      </div>

                      <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#0056b3', letterSpacing: '0.5px' }}>
                        {result.referenceNumber}
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <span
                        style={{
                          backgroundColor: '#dcfce7',
                          color: '#15803d',
                          padding: '0.45rem 1rem',
                          borderRadius: '9999px',
                          fontWeight: 800,
                          fontSize: '0.88rem',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.4rem',
                          boxShadow: '0 2px 8px rgba(22, 163, 74, 0.15)',
                        }}
                      >
                        <FiCheckCircle size={17} />
                        <span>Under Review</span>
                      </span>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div style={{ padding: '2rem' }}>
                    {/* Key Details Grid */}
                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                        gap: '1.25rem',
                        marginBottom: '1.75rem',
                        backgroundColor: '#f0f9ff',
                        padding: '1.25rem 1.5rem',
                        borderRadius: '16px',
                        border: '1px solid #bae6fd',
                      }}
                    >
                      <div>
                        <span style={{ display: 'block', fontSize: '0.75rem', color: '#0369a1', fontWeight: 800, textTransform: 'uppercase', marginBottom: '0.2rem' }}>
                          Application Type
                        </span>
                        <span style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0f172a' }}>
                          {getServiceTypeLabel(result.serviceType)}
                        </span>
                      </div>

                      <div>
                        <span style={{ display: 'block', fontSize: '0.75rem', color: '#0369a1', fontWeight: 800, textTransform: 'uppercase', marginBottom: '0.2rem' }}>
                          Registered Phone
                        </span>
                        <span style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0f172a' }}>
                          {result.telephone}
                        </span>
                      </div>


                      <div>
                        <span style={{ display: 'block', fontSize: '0.75rem', color: '#0369a1', fontWeight: 800, textTransform: 'uppercase', marginBottom: '0.2rem' }}>
                          Submission Date
                        </span>
                        <span style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0f172a' }}>
                          {result.createdAt}
                        </span>
                      </div>

                      <div>
                        <span style={{ display: 'block', fontSize: '0.75rem', color: '#0369a1', fontWeight: 800, textTransform: 'uppercase', marginBottom: '0.2rem' }}>
                          Estimated SLA
                        </span>
                        <span style={{ fontSize: '0.95rem', fontWeight: 800, color: '#047857' }}>
                          24 – 48 Hours
                        </span>
                      </div>
                    </div>

                    {/* Progress Stepper Timeline */}
                    <div style={{ marginBottom: '1.75rem' }}>
                      <h4 style={{ margin: '0 0 1rem 0', color: '#0f172a', fontSize: '1rem', fontWeight: 800 }}>
                        Live Application Progress
                      </h4>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {/* Step 1 */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                          <div style={{ backgroundColor: '#047857', color: '#ffffff', width: '28px', height: '28px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '0.85rem' }}>
                            <FiCheck size={14} />
                          </div>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: 800, color: '#0f172a', fontSize: '0.92rem' }}>Application Submitted & Received</div>
                            <div style={{ fontSize: '0.78rem', color: '#64748b' }}>Reference ID generated and logged in database</div>
                          </div>
                          <span style={{ fontSize: '0.75rem', fontWeight: 800, backgroundColor: '#dcfce7', color: '#15803d', padding: '0.2rem 0.65rem', borderRadius: '9999px' }}>
                            Completed
                          </span>
                        </div>

                        {/* Step 2 */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                          <div style={{ backgroundColor: '#0284c7', color: '#ffffff', width: '28px', height: '28px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '0.85rem' }}>
                            <FiClock size={14} />
                          </div>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: 800, color: '#0f172a', fontSize: '0.92rem' }}>Technical Feasibility & Document Review</div>
                            <div style={{ fontSize: '0.78rem', color: '#64748b' }}>Verifying DP feasibility and uploaded credentials</div>
                          </div>
                          <span style={{ fontSize: '0.75rem', fontWeight: 800, backgroundColor: '#e0f2fe', color: '#0369a1', padding: '0.2rem 0.65rem', borderRadius: '9999px' }}>
                            In Progress
                          </span>
                        </div>

                        {/* Step 3 */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                          <div style={{ backgroundColor: '#cbd5e1', color: '#ffffff', width: '28px', height: '28px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '0.85rem' }}>
                            3
                          </div>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: 700, color: '#64748b', fontSize: '0.92rem' }}>Field Technician Dispatch</div>
                            <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>Assigning regional technical team for physical connection</div>
                          </div>
                          <span style={{ fontSize: '0.75rem', fontWeight: 700, backgroundColor: '#f1f5f9', color: '#64748b', padding: '0.2rem 0.65rem', borderRadius: '9999px' }}>
                            Pending
                          </span>
                        </div>

                        {/* Step 4 */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                          <div style={{ backgroundColor: '#cbd5e1', color: '#ffffff', width: '28px', height: '28px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '0.85rem' }}>
                            4
                          </div>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: 700, color: '#64748b', fontSize: '0.92rem' }}>Final Line Activation & SMS Alert</div>
                            <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>Service completion notification sent to your mobile</div>
                          </div>
                          <span style={{ fontSize: '0.75rem', fontWeight: 700, backgroundColor: '#f1f5f9', color: '#64748b', padding: '0.2rem 0.65rem', borderRadius: '9999px' }}>
                            Pending
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Latest Status Message */}
                    {result.message && (
                      <div
                        style={{
                          marginBottom: '1.25rem',
                          padding: '1rem 1.15rem',
                          borderRadius: '12px',
                          backgroundColor: '#f8fafc',
                          border: '1px solid #e2e8f0',
                          color: '#475569',
                          fontSize: '0.9rem',
                          lineHeight: 1.6,
                          fontWeight: 600,
                        }}
                      >
                        {result.message}
                      </div>
                    )}

                    {/* Admin Note */}
                    {result.notes && (
                      <div
                        style={{
                          marginBottom: '1.25rem',
                          padding: '1rem 1.15rem',
                          borderRadius: '12px',
                          backgroundColor: '#fff7ed',
                          border: '1px solid #fed7aa',
                        }}
                      >
                        <div
                          style={{
                            fontSize: '0.75rem',
                            fontWeight: 900,
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em',
                            color: '#c2410c',
                            marginBottom: '0.4rem',
                          }}
                        >
                          {t('checkStatusPage.adminNote', 'Admin Note')}
                        </div>
                        <div
                          style={{
                            fontSize: '0.9rem',
                            color: '#7c2d12',
                            whiteSpace: 'pre-wrap',
                            wordBreak: 'break-word',
                            lineHeight: 1.55,
                          }}
                        >
                          {result.notes}
                        </div>
                      </div>
                    )}

                    {/* Admin Action Metadata */}
                    {result.actionedBy && (
                      <div
                        style={{
                          marginBottom: '1.25rem',
                          fontSize: '0.82rem',
                          color: '#64748b',
                          lineHeight: 1.6,
                        }}
                      >
                        <strong>{t('checkStatusPage.actionedBy', 'Actioned By')}:</strong>{' '}
                        {result.actionedBy.name ||
                          result.actionedBy.email ||
                          result.actionedBy._id}
                        {result.actionedBy._id && (
                          <span
                            style={{
                              fontFamily: 'monospace',
                              fontSize: '0.75rem',
                            }}
                          >
                            {' '}
                            (ID: {result.actionedBy._id})
                          </span>
                        )}
                        {result.actionedAt && (
                          <span style={{ marginLeft: '0.5rem' }}>
                            {t('checkStatusPage.actionedAt', 'Actioned At')}:{' '}
                            {new Date(result.actionedAt).toLocaleString('en-GB', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                              hour12: false,
                            })}
                          </span>
                        )}
                      </div>
                    )}

                    {/* Bottom Action Helpline Bar */}
                    <div
                      style={{
                        paddingTop: '1.25rem',
                        borderTop: '1px solid #e2e8f0',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        flexWrap: 'wrap',
                        gap: '0.85rem',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.85rem', color: '#475569', fontWeight: 600 }}>
                        <FiPhoneCall size={15} style={{ color: '#0056b3' }} />
                        <span>Helpline: <strong>1212</strong> (Toll Free)</span>
                      </div>

                      <button
                        type="button"
                        onClick={() => navigate('/')}
                        style={{
                          backgroundColor: '#ffffff',
                          border: '1.5px solid #cbd5e1',
                          borderRadius: '10px',
                          padding: '0.55rem 1.25rem',
                          color: '#334155',
                          fontSize: '0.85rem',
                          fontWeight: 800,
                          cursor: 'pointer',
                        }}
                      >
                        Return to Dashboard
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

      </div>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        .spin {
          animation: spin 1s linear infinite;
        }
      `}</style>
    </div>
  );
}
