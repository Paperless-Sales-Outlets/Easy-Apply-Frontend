import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Wrench,
  Star,
  CheckCircle2,
  Sparkles,
  RefreshCw,
  Send,
  Check,
  Zap,
  X,
  Phone,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import api from '../../shared/utils/api';

/** Lets a customer review and confirm the installation details before booking. */
export default function InstallationReviewModal({
  isOpen,
  onClose,
  application,
  onSuccess,
}) {
  const referenceNumber =
    application?.referenceNumber ||
    application?.formData?.referenceNumber ||
    'SLT-REF-948210';

  const telephone =
    application?.formData?.contactNumber ||
    application?.formData?.telephone ||
    application?.phone ||
    '011-2849201';

  const existingFeedback =
    application?.formData?.installationReview ||
    application?.feedback ||
    null;

  const [rating, setRating] = useState(existingFeedback?.rating || 5);
  const [hoverRating, setHoverRating] = useState(0);
  const [feedbackText, setFeedbackText] = useState(
    existingFeedback?.feedbackText ||
    existingFeedback?.text ||
    'Installation completed on time. Clean cabling and service setup verified.'
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isServiceActive, setIsServiceActive] = useState(!!existingFeedback);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (isOpen) {
      if (existingFeedback) {
        setRating(existingFeedback.rating || 5);
        setFeedbackText(
          existingFeedback.feedbackText || existingFeedback.text || ''
        );
        setIsServiceActive(true);
      } else {
        setRating(5);
        setFeedbackText(
          'Installation completed on time. Clean cabling and service setup verified.'
        );
        setIsServiceActive(false);
      }
      setErrorMsg('');
    }
  }, [isOpen, existingFeedback]);

  if (!isOpen) return null;

  const handleAutoFill = () => {
    setRating(5);
    setFeedbackText(
      'Outstanding service! The optical technician arrived promptly and verified line installation cleanly.'
    );
  };

  const triggerConfetti = () => {
    try {
      confetti({
        particleCount: 110,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#0056a2', '#0f7a4d', '#f4d58f', '#4b92d6', '#6366f1'],
      });
    } catch {
      // Fallback if canvas is not ready
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg('');

    try {
      await api.post('/appointments/review', {
        referenceNumber,
        rating,
        feedbackText,
      });

      setIsServiceActive(true);
      triggerConfetti();
      if (onSuccess) {
        onSuccess({
          referenceNumber,
          rating,
          feedbackText,
        });
      }
    } catch (err) {
      setErrorMsg(
        err.response?.data?.message ||
        'Failed to submit verification. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const getRatingLabel = (val) => {
    switch (val) {
      case 5:
        return '5/5 — Outstanding & Excellent Service';
      case 4:
        return '4/5 — Very Good Experience';
      case 3:
        return '3/5 — Satisfactory Installation';
      case 2:
        return '2/5 — Needs Improvement';
      case 1:
        return '1/5 — Poor Service';
      default:
        return `${val}/5 Stars`;
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
        overflowY: 'auto',
      }}
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '740px',
          backgroundColor: 'var(--paper)',
          borderRadius: '20px',
          boxShadow: 'var(--shadow-xl)',
          border: '1px solid rgba(226, 232, 240, 0.8)',
          overflow: 'hidden',
          position: 'relative',
          maxHeight: '92vh',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Accent Bar */}
        <div
          style={{
            height: '6px',
            background:
              'var(--blue-600)',
          }}
        />

        {/* Scrollable Container */}
        <div
          style={{
            padding: '2rem 1.75rem',
            overflowY: 'auto',
            flex: 1,
          }}
        >
          {/* Close Button */}
          <button
            type="button"
            onClick={onClose}
            style={{
              position: 'absolute',
              top: '1.25rem',
              right: '1.25rem',
              background: 'var(--grey-100)',
              border: 'none',
              borderRadius: '50%',
              width: '34px',
              height: '34px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: 'var(--grey-600)',
              transition: 'all 0.15s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#dfe5ee';
              e.currentTarget.style.color = '#131f33';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#eef2f7';
              e.currentTarget.style.color = '#52627a';
            }}
          >
            <X size={18} />
          </button>

          {/* Header & Auto-Fill */}
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'space-between',
              marginBottom: '1.25rem',
              gap: '1rem',
              flexWrap: 'wrap',
              paddingRight: '2rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div
                style={{
                  background: 'rgba(16, 185, 129, 0.12)',
                  color: 'var(--green-700)',
                  padding: '0.75rem',
                  borderRadius: 'var(--radius-lg)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '1.5px solid rgba(16, 185, 129, 0.35)',
                  flexShrink: 0,
                }}
              >
                <Wrench size={22} />
              </div>
              <div>
                <span
                  style={{
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    color: 'var(--green-700)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.6px',
                  }}
                >
                  Phase 3 • Home Setup & Activation
                </span>
                <h2
                  style={{
                    fontSize: '1.35rem',
                    fontWeight: 700,
                    color: 'var(--grey-900)',
                    lineHeight: 1.2,
                    margin: '0.15rem 0 0 0',
                  }}
                >
                  Technician Verification & Sign-Off
                </h2>
              </div>
            </div>

            {/* Prominent Auto-Fill Button */}
            {!isServiceActive && (
              <button
                type="button"
                onClick={handleAutoFill}
                style={{
                  background: 'rgba(0, 86, 179, 0.08)',
                  border: '1.5px solid var(--blue-600)',
                  color: 'var(--blue-600)',
                  fontWeight: 700,
                  fontSize: '0.78rem',
                  padding: '0.45rem 0.85rem',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  borderRadius: 'var(--radius)',
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#0056a2';
                  e.currentTarget.style.color = '#ffffff';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(0, 86, 179, 0.08)';
                  e.currentTarget.style.color = '#0056a2';
                }}
                title="Auto-fill 5-star customer review"
              >
                <Zap size={14} /> Auto-Fill
              </button>
            )}
          </div>

          {/* Technician Setup / Optical Diagnostic Card */}
          <div
            style={{
              background: 'var(--grey-50)',
              border: '1px solid var(--grey-200)',
              borderRadius: 'var(--radius-lg)',
              padding: '1.25rem',
              marginBottom: '1.25rem',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '1rem',
                flexWrap: 'wrap',
                gap: '0.5rem',
              }}
            >
              <div>
                <span
                  style={{
                    fontSize: '0.75rem',
                    color: 'var(--grey-600)',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                  }}
                >
                  Work Order / Reference:
                </span>
                <div
                  style={{
                    fontSize: '1.05rem',
                    fontWeight: 700,
                    color: 'var(--blue-600)',
                    letterSpacing: '0.5px',
                  }}
                >
                  {referenceNumber}
                </div>
              </div>
              <span
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  color: 'var(--green-700)',
                  background: 'rgba(16, 185, 129, 0.12)',
                  border: '1px solid rgba(16, 185, 129, 0.3)',
                  padding: '0.3rem 0.75rem',
                  borderRadius: '9999px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                }}
              >
                <Check size={13} /> Physical Wiring Completed
              </span>
            </div>

            {/* Assigned Line Box */}
            <div
              style={{
                background: 'var(--paper)',
                border: '1px solid var(--grey-300)',
                borderRadius: 'var(--radius-lg)',
                padding: '1rem 1.25rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '0.75rem',
              }}
            >
              <div>
                <span
                  style={{
                    fontSize: '0.75rem',
                    color: 'var(--grey-600)',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                  }}
                >
                  Assigned Line:
                </span>
                <div
                  style={{
                    fontSize: '1.05rem',
                    fontWeight: 700,
                    color: 'var(--grey-900)',
                    margin: '0.2rem 0',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.45rem',
                  }}
                >
                  <Phone size={16} color="#0056a2" /> {telephone}
                </div>
              </div>
              <span
                style={{
                  fontSize: '0.75rem',
                  color: 'var(--blue-600)',
                  background: 'rgba(0, 86, 179, 0.08)',
                  border: '1px solid rgba(0, 86, 179, 0.25)',
                  padding: '0.35rem 0.85rem',
                  borderRadius: '9999px',
                  fontWeight: 700,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                }}
              >
                ● Voice Active
              </span>
            </div>
          </div>

          {/* Feedback Form or Completed Card */}
          {!isServiceActive ? (
            <form onSubmit={handleSubmit}>
              <div
                style={{
                  background: 'var(--grey-50)',
                  border: '1px solid var(--grey-200)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '1.25rem',
                  marginBottom: '1.25rem',
                }}
              >
                <h3
                  style={{
                    fontSize: '1rem',
                    fontWeight: 700,
                    color: 'var(--grey-900)',
                    margin: '0 0 0.25rem 0',
                  }}
                >
                  Installation & Service Quality Rating
                </h3>
                <p
                  style={{
                    fontSize: '0.82rem',
                    color: 'var(--grey-600)',
                    margin: '0 0 1rem 0',
                  }}
                >
                  Rate your technical installation quality and technician
                  courtesy to activate your line.
                </p>

                {/* Stars Interactive */}
                <div style={{ marginBottom: '1.25rem', textAlign: 'center' }}>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'center',
                      gap: '0.5rem',
                      marginBottom: '0.4rem',
                    }}
                  >
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        style={{
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          padding: '0.25rem',
                          transition: 'transform 0.15s ease',
                          transform:
                            (hoverRating || rating) >= star
                              ? 'scale(1.15)'
                              : 'scale(1)',
                        }}
                      >
                        <Star
                          size={32}
                          fill={
                            (hoverRating || rating) >= star
                              ? '#f4d58f'
                              : 'none'
                          }
                          color={
                            (hoverRating || rating) >= star
                              ? '#f4d58f'
                              : '#c3ccd9'
                          }
                          strokeWidth={1.75}
                          style={{
                            filter:
                              (hoverRating || rating) >= star
                                ? 'drop-shadow(0 0 6px rgba(251, 191, 36, 0.45))'
                                : 'none',
                          }}
                        />
                      </button>
                    ))}
                  </div>
                  <span
                    style={{
                      fontSize: '0.84rem',
                      fontWeight: 700,
                      color: 'var(--amber-700)',
                    }}
                  >
                    {getRatingLabel(hoverRating || rating)}
                  </span>
                </div>

                <div>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      color: 'var(--grey-700)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                      marginBottom: '0.4rem',
                    }}
                  >
                    Customer Remarks / Technician Sign-Off
                  </label>
                  <textarea
                    rows={2}
                    value={feedbackText}
                    onChange={(e) => setFeedbackText(e.target.value)}
                    required
                    style={{
                      width: '100%',
                      padding: '0.75rem 0.9rem',
                      borderRadius: 'var(--radius-lg)',
                      border: '1.5px solid var(--grey-300)',
                      fontSize: '0.88rem',
                      color: 'var(--grey-900)',
                      fontWeight: 600,
                      outline: 'none',
                      resize: 'vertical',
                      boxSizing: 'border-box',
                      backgroundColor: 'var(--paper)',
                      boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.02)',
                    }}
                  />
                </div>

                {errorMsg && (
                  <div
                    style={{
                      marginTop: '0.75rem',
                      padding: '0.6rem 0.85rem',
                      borderRadius: 'var(--radius)',
                      backgroundColor: 'var(--red-50)',
                      border: '1px solid var(--red-200)',
                      color: 'var(--red-700)',
                      fontSize: '0.82rem',
                      fontWeight: 700,
                    }}
                  >
                    {errorMsg}
                  </div>
                )}
              </div>

              <div style={{ textAlign: 'center' }}>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  style={{
                    width: '100%',
                    padding: '0.9rem 1.5rem',
                    borderRadius: 'var(--radius-lg)',
                    background: 'var(--brand-gradient-soft)',
                    color: 'var(--paper)',
                    border: 'none',
                    fontWeight: 700,
                    fontSize: '0.95rem',
                    cursor: isSubmitting ? 'not-allowed' : 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    boxShadow: 'var(--shadow-md)',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw className="spin" size={16} />
                      <span>Activating Line & Saving...</span>
                    </>
                  ) : (
                    <>
                      <span>Sign Off & Activate My SLT Connection</span>
                      <Send size={16} />
                    </>
                  )}
                </button>
              </div>
            </form>
          ) : (
            /* Final Activation Congratulations Screen */
            <div
              style={{
                textAlign: 'center',
                padding: '1.5rem 0.5rem',
                background:
                  'none',
              }}
            >
              <div
                style={{
                  background: 'rgba(16, 185, 129, 0.15)',
                  color: 'var(--green-700)',
                  border: '2px solid var(--green-700)',
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1rem auto',
                  boxShadow: 'var(--shadow-lg)',
                }}
              >
                <Sparkles size={34} />
              </div>

              <h3
                style={{
                  fontSize: '1.45rem',
                  fontWeight: 700,
                  color: 'var(--grey-900)',
                  marginBottom: '0.4rem',
                }}
              >
                Welcome to SLT High-Speed Fibre!
              </h3>

              <p
                style={{
                  color: 'var(--grey-600)',
                  fontSize: '0.9rem',
                  maxWidth: '500px',
                  margin: '0 auto 1.5rem auto',
                  lineHeight: 1.5,
                  fontWeight: 600,
                }}
              >
                Your connection is officially live and active with{' '}
                <strong style={{ color: '#0f7a4d' }}>{rating}/5 Stars</strong>{' '}
                satisfaction. Thank you for choosing SLTMobitel!
              </p>

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'center',
                  gap: '0.75rem',
                  flexWrap: 'wrap',
                }}
              >
                <button
                  type="button"
                  onClick={onClose}
                  style={{
                    padding: '0.75rem 1.75rem',
                    borderRadius: 'var(--radius-lg)',
                    background: 'var(--blue-600)',
                    color: 'var(--paper)',
                    border: 'none',
                    fontWeight: 700,
                    fontSize: '0.88rem',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    boxShadow: 'var(--shadow-md)',
                  }}
                >
                  <CheckCircle2 size={16} /> Done & Close
                </button>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
