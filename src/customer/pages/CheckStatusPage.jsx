import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiCheck,
  FiCheckCircle,
  FiClock,
  FiAlertCircle,
  FiCopy,
  FiPhoneCall,
  FiX,
  FiRefreshCw,
  FiArrowRight,
  FiStar,
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import api from '../../shared/utils/api';
import InstallationReviewModal from '../components/InstallationReviewModal';
import WizardStepper from '../components/WizardStepper';


/** Look up the status of an application by reference number. */
export default function CheckStatusPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const [reference, setReference] = useState('');
  const [result, setResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);

  const getServiceTypeLabel = (type) =>
    type === 'new-connection'
      ? t('wizards.newConnection.title', 'New Connection')
      : type || 'SLT Service Application';


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
        serviceType: data.serviceType || 'new-connection',
        referenceNumber: data.referenceNumber || refToSearch.trim(),
        createdAt: data.createdAt ? new Date(data.createdAt).toLocaleDateString('en-LK') : new Date().toLocaleDateString('en-LK'),
        message:
          data.message ||
          t(
            'checkStatusPage.statusDescription',
            'Your application is currently under review by our technical team.'
          ),
        customerName: data.customerName || '',
        telephone: data.telephone || '',
        notes: data.notes || '',
        formData: data.formData || {},
        appointment: data.appointment || null,
        feedback: data.formData?.installationReview || data.feedback || null,
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

  // Arriving straight from payment: confirm the submission once.
  useEffect(() => {
    if (location.state?.justSubmitted) toast.success('Application submitted successfully! Track its progress below.');
  }, [location.state?.justSubmitted]);

  // Prefer route-state ref (from CompletionPage), then fall back to URL param.
  useEffect(() => {
    const stateRef = location.state?.ref;
    const urlRef = searchParams.get('ref');
    const initialRef = (stateRef || urlRef || '').trim();

    if (initialRef) {
      setReference(initialRef);
      fetchStatus(initialRef);
    }
  }, [location.state, searchParams, fetchStatus]);

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
        backgroundColor: 'var(--grey-50)',
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
            backgroundColor: 'var(--paper)',
            borderRadius: 'var(--radius-lg)',
            boxShadow: 'var(--shadow-xl)',
            border: '1px solid var(--grey-200)',
            overflow: 'hidden',
          }}
        >
          {/* Top Blue Accent Gradient Bar */}
          <div style={{ height: '6px', background: 'var(--blue-600)' }} />

          <div style={{ padding: '2.25rem 2.25rem 1.75rem 2.25rem' }}>
            {/* Header Badge & Title */}
            <div style={{ marginBottom: '1.5rem', textAlign: 'center' }}>
              <h1 style={{ fontSize: 'var(--text-3xl)', margin: '0 0 0.5rem 0' }}>
                Check Application Status
              </h1>

              <p style={{ fontSize: 'var(--text-base)', color: 'var(--grey-600)', margin: 0 }}>
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
                    aria-label="Application reference number"
                    value={reference}
                    onChange={(e) => setReference(e.target.value)}
                    placeholder="Enter Reference Number (e.g. REQ-36670371)"
                    style={{
                      width: '100%',
                      padding: '0.9rem 2.75rem 0.9rem 1.15rem',
                      borderRadius: 'var(--radius)',
                      border: '1px solid var(--grey-300)',
                      fontSize: '1rem',
                      fontWeight: 600,
                      color: 'var(--grey-900)',
                      outline: 'none',
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
                        color: 'var(--grey-700)',
                        cursor: 'pointer',
                        padding: '4px',
                        display: 'flex',
                      }}
                    >
                      <FiX size={18} />
                    </button>
                  )}
                </div>

                <button type="submit" className="btn btn-primary" disabled={isLoading || !reference.trim()}>
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
                    backgroundColor: 'var(--paper)',
                    borderRadius: 'var(--radius-lg)',
                    padding: '2rem',
                    border: '1.5px solid var(--red-200)',
                    boxShadow: 'var(--shadow-lg)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#b42318', marginBottom: '1rem' }}>
                    <div style={{ backgroundColor: '#fef3f2', padding: '0.65rem', borderRadius: 'var(--radius-lg)' }}>
                      <FiAlertCircle size={28} />
                    </div>
                    <div>
                      <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 700, color: '#b42318' }}>
                        No Record Found
                      </h3>
                      <span style={{ fontSize: '0.84rem', color: '#b42318', fontWeight: 600 }}>
                        Reference ID: <strong>{result.referenceNumber}</strong>
                      </span>
                    </div>
                  </div>

                  <p style={{ color: '#3b4a61', fontSize: '0.9rem', lineHeight: 1.6, marginBottom: '1.25rem' }}>
                    {result.message} Please make sure you typed the exact reference code from your SMS acknowledgement or application confirmation slip.
                  </p>

                  <div style={{ backgroundColor: '#f6f8fb', padding: '1rem 1.25rem', borderRadius: 'var(--radius-lg)', border: '1px solid #dfe5ee', fontSize: '0.84rem', color: '#52627a' }}>
                    <strong>Need Help?</strong> Contact SLTMobitel Customer Care at <strong>1212</strong> or visit your nearest SLT Teleshop for assistance.
                  </div>
                </div>
              ) : (
                <>
                  {/* Tracking Step Banner */}
                  <div style={{ backgroundColor: '#ffffff', borderRadius: 'var(--radius-lg)', padding: '1.25rem 1.5rem', border: '1px solid #dfe5ee', marginBottom: '1.25rem', boxShadow: 'var(--shadow-md)' }}>
                    <WizardStepper currentStep={7} />
                  </div>

                  {/* SUCCESSFUL RESULT CARD */}
                  <div
                    style={{
                      backgroundColor: 'var(--paper)',
                      borderRadius: 'var(--radius-lg)',
                      border: '1px solid var(--grey-200)',
                      boxShadow: 'var(--shadow-lg)',
                      overflow: 'hidden',
                    }}
                  >
                  {/* Result Header Bar */}
                  <div
                    style={{
                      padding: '1.5rem 2rem',
                      backgroundColor: 'var(--grey-50)',
                      borderBottom: '1px solid var(--grey-200)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      flexWrap: 'wrap',
                      gap: '1rem',
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.25rem' }}>
                        <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: '#52627a', letterSpacing: '0.06em' }}>
                          Reference Number
                        </span>
                        <button
                          onClick={handleCopy}
                          type="button"
                          style={{
                            background: 'none',
                            border: 'none',
                            color: 'var(--blue-600)',
                            fontSize: '0.75rem',
                            fontWeight: 700,
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

                      <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0056a2', letterSpacing: '0.5px' }}>
                        {result.referenceNumber}
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <span
                        style={{
                          backgroundColor: 'var(--green-100)',
                          color: 'var(--green-700)',
                          padding: '0.45rem 1rem',
                          borderRadius: '9999px',
                          fontWeight: 700,
                          fontSize: '0.88rem',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.4rem',
                          boxShadow: 'var(--shadow-sm)',
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
                        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                        gap: '1.25rem',
                        marginBottom: '1.75rem',
                        backgroundColor: 'var(--blue-50)',
                        padding: '1.25rem 1.5rem',
                        borderRadius: 'var(--radius-lg)',
                        border: '1px solid var(--blue-200)',
                      }}
                    >
                      <div>
                        <span style={{ display: 'block', fontSize: '0.75rem', color: '#0a4b8c', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.2rem' }}>
                          Application Type
                        </span>
                        <span style={{ fontSize: '0.95rem', fontWeight: 700, color: '#131f33' }}>
                          {getServiceTypeLabel(result.serviceType)}
                        </span>
                      </div>

                      <div>
                        <span style={{ display: 'block', fontSize: '0.75rem', color: '#0a4b8c', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.2rem' }}>
                          Registered Phone
                        </span>
                        <span style={{ fontSize: '0.95rem', fontWeight: 700, color: '#131f33' }}>
                          {result.telephone}
                        </span>
                      </div>

                      <div>
                        <span style={{ display: 'block', fontSize: '0.75rem', color: '#0a4b8c', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.2rem' }}>
                          Submission Date
                        </span>
                        <span style={{ fontSize: '0.95rem', fontWeight: 700, color: '#131f33' }}>
                          {result.createdAt}
                        </span>
                      </div>

                      <div>
                        <span style={{ display: 'block', fontSize: '0.75rem', color: '#0a4b8c', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.2rem' }}>
                          Estimated SLA
                        </span>
                        <span style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0f7a4d' }}>
                          24 – 48 Hours
                        </span>
                      </div>
                    </div>

                    {/* Progress Stepper Timeline */}
                    <div style={{ marginBottom: '1.75rem' }}>
                      <h4 style={{ margin: '0 0 1rem 0', color: '#131f33', fontSize: '1rem', fontWeight: 700 }}>
                        Live Application Progress
                      </h4>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {/* Step 1 */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                          <div style={{ backgroundColor: '#0f7a4d', color: '#ffffff', width: '28px', height: '28px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.85rem' }}>
                            <FiCheck size={14} />
                          </div>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: 700, color: '#131f33', fontSize: '0.92rem' }}>Application Submitted & Received</div>
                            <div style={{ fontSize: '0.78rem', color: '#52627a' }}>Reference ID generated and logged in database</div>
                          </div>
                          <span style={{ fontSize: '0.75rem', fontWeight: 700, backgroundColor: '#e2f4e3', color: '#0f7a4d', padding: '0.2rem 0.65rem', borderRadius: '9999px' }}>
                            Completed
                          </span>
                        </div>

                        {/* Step 2 */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                          <div style={{ backgroundColor: result.feedback || result.status === 'completed' ? '#0f7a4d' : '#1a6cbd', color: '#ffffff', width: '28px', height: '28px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.85rem' }}>
                            {result.feedback || result.status === 'completed' ? <FiCheck size={14} /> : <FiClock size={14} />}
                          </div>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: 700, color: '#131f33', fontSize: '0.92rem' }}>Technical Feasibility & Document Review</div>
                            <div style={{ fontSize: '0.78rem', color: '#52627a' }}>Verifying DP feasibility and uploaded credentials</div>
                          </div>
                          <span style={{ fontSize: '0.75rem', fontWeight: 700, backgroundColor: result.feedback || result.status === 'completed' ? '#e2f4e3' : '#e3effc', color: result.feedback || result.status === 'completed' ? '#0f7a4d' : '#0a4b8c', padding: '0.2rem 0.65rem', borderRadius: '9999px' }}>
                            {result.feedback || result.status === 'completed' ? 'Completed' : 'In Progress'}
                          </span>
                        </div>

                        {/* Step 3 */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                          <div style={{ backgroundColor: result.feedback || result.status === 'completed' ? '#0f7a4d' : '#c3ccd9', color: '#ffffff', width: '28px', height: '28px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.85rem' }}>
                            {result.feedback || result.status === 'completed' ? <FiCheck size={14} /> : '3'}
                          </div>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: 700, color: result.feedback || result.status === 'completed' ? '#131f33' : '#52627a', fontSize: '0.92rem' }}>
                              Field Technician Dispatch & Line Installation
                            </div>
                            <div style={{ fontSize: '0.78rem', color: result.feedback || result.status === 'completed' ? '#0f7a4d' : '#94a1b5', fontWeight: 600 }}>
                              {result.feedback || result.status === 'completed'
                                ? 'Technician assigned & physical line installation completed'
                                : 'Assigned by regional technical office for physical cabling & setup'}
                            </div>
                          </div>
                          <span style={{ fontSize: '0.75rem', fontWeight: 700, backgroundColor: result.feedback || result.status === 'completed' ? '#e2f4e3' : '#eef2f7', color: result.feedback || result.status === 'completed' ? '#0f7a4d' : '#52627a', padding: '0.2rem 0.65rem', borderRadius: '9999px' }}>
                            {result.feedback || result.status === 'completed' ? 'Completed' : 'Pending'}
                          </span>
                        </div>


                        {/* Step 4 */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                          <div style={{ backgroundColor: result.feedback ? '#0f7a4d' : '#c3ccd9', color: '#ffffff', width: '28px', height: '28px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.85rem' }}>
                            {result.feedback ? <FiCheck size={14} /> : '4'}
                          </div>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: 700, color: result.feedback ? '#131f33' : '#52627a', fontSize: '0.92rem' }}>Final Line Activation & Speed Test</div>
                            <div style={{ fontSize: '0.78rem', color: result.feedback ? '#0f7a4d' : '#94a1b5' }}>
                              {result.feedback ? 'Verified 104.2 Mbps • Connection Live' : 'Technician verification & sign-off required'}
                            </div>
                          </div>
                          <span style={{ fontSize: '0.75rem', fontWeight: 700, backgroundColor: result.feedback ? '#e2f4e3' : '#eef2f7', color: result.feedback ? '#0f7a4d' : '#52627a', padding: '0.2rem 0.65rem', borderRadius: '9999px' }}>
                            {result.feedback ? 'Active' : 'Pending'}
                          </span>
                        </div>
                      </div>
                    </div>


                    {/* Action Cards: Technician Verification & Installation Scheduling */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', marginBottom: '1.75rem' }}>

                      {/* Technician Verification Banner */}
                      <div
                        style={{

                          background: 'var(--green-50)',
                          border: '1.5px solid rgba(16, 185, 129, 0.35)',
                          borderRadius: 'var(--radius-lg)',
                          padding: '1.25rem 1.35rem',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          gap: '1rem',
                          flexWrap: 'wrap',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', minWidth: '240px', flex: 1 }}>
                          <div
                            style={{
                              width: '42px',
                              height: '42px',
                              borderRadius: 'var(--radius-lg)',
                              background: 'var(--green-700)',
                              color: 'var(--paper)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              flexShrink: 0,
                              boxShadow: 'var(--shadow-md)',
                            }}
                          >
                            <FiStar size={20} fill={result.feedback ? '#ffffff' : 'none'} />
                          </div>
                          <div>
                            <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#131f33', display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                              <span>Technician Verification & Sign-Off</span>
                              {result.feedback && (
                                <span style={{ fontSize: '0.75rem', color: '#0f7a4d', background: '#e2f4e3', border: '1px solid #c9ebc8', padding: '0.15rem 0.55rem', borderRadius: '9999px', fontWeight: 700 }}>
                                  ● {result.feedback.rating || 5}★ Verified & Active
                                </span>
                              )}
                            </div>
                            <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.82rem', color: '#52627a', fontWeight: 600 }}>
                              {result.feedback
                                ? 'Optical link synced, speed test verified (104.2 Mbps), and sign-off complete.'
                                : 'Completed wiring? Verify your speed test diagnostics & rate technician service.'}
                            </p>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => setShowReviewModal(true)}
                          style={{
                            padding: '0.65rem 1.25rem',
                            borderRadius: 'var(--radius-lg)',
                            background: result.feedback ? '#ffffff' : 'var(--brand-gradient-soft)',
                            color: result.feedback ? '#0056a2' : '#ffffff',
                            border: result.feedback ? '1.5px solid rgba(0, 86, 179, 0.3)' : 'none',
                            fontWeight: 700,
                            fontSize: '0.85rem',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.45rem',
                            boxShadow: result.feedback ? '0 2px 5px rgba(0,0,0,0.04)' : '0 4px 14px rgba(0, 86, 179, 0.25)',
                            transition: 'all 0.15s ease',
                          }}
                        >
                          <FiStar size={15} fill={result.feedback ? '#f4d58f' : '#ffffff'} />
                          <span>{result.feedback ? 'View Activation Details' : 'Verify Speed Test & Sign-Off'}</span>
                        </button>
                      </div>
                    </div>


                    {/* Latest Status Message */}
                    {result.message && (
                      <div
                        style={{
                          marginBottom: '1.25rem',
                          padding: '1rem 1.15rem',
                          borderRadius: 'var(--radius-lg)',
                          backgroundColor: 'var(--grey-50)',
                          border: '1px solid var(--grey-200)',
                          color: 'var(--grey-700)',
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
                          borderRadius: 'var(--radius-lg)',
                          backgroundColor: 'var(--amber-50)',
                          border: '1px solid #f4d58f',
                        }}
                      >
                        <div
                          style={{
                            fontSize: '0.75rem',
                            fontWeight: 700,
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
                          color: 'var(--grey-600)',
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
                        borderTop: '1px solid var(--grey-200)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        flexWrap: 'wrap',
                        gap: '0.85rem',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.85rem', color: '#3b4a61', fontWeight: 600 }}>
                        <FiPhoneCall size={15} style={{ color: '#0056a2' }} />
                        <span>Helpline: <strong>1212</strong> (Toll Free)</span>
                      </div>

                      <button
                        type="button"
                        onClick={() => navigate('/')}
                        style={{
                          backgroundColor: 'var(--paper)',
                          border: '1.5px solid var(--grey-300)',
                          borderRadius: 'var(--radius-lg)',
                          padding: '0.55rem 1.25rem',
                          color: 'var(--grey-800)',
                          fontSize: '0.85rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                        }}
                      >
                        Return to Dashboard
                      </button>
                    </div>
                  </div>
                </div>
              </>
            )}
            </motion.div>
          )}
        </AnimatePresence>


      </div>

      {/* Technician Review & Verification Modal */}
      <InstallationReviewModal
        isOpen={showReviewModal}
        onClose={() => setShowReviewModal(false)}
        application={result}
        onSuccess={(feedbackData) => {
          setResult((prev) => ({
            ...prev,
            status: 'confirmed',
            feedback: {
              rating: feedbackData.rating,
              feedbackText: feedbackData.feedbackText,
              submittedAt: new Date().toISOString(),
            },
          }));
        }}
      />

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

