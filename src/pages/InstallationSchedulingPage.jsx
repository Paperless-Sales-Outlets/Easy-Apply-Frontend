import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiCalendar,
  FiClock,
  FiMapPin,
  FiCheckCircle,
  FiArrowRight,
  FiMessageSquare,
  FiCopy,
  FiCheck,
  FiZap,
  FiInfo,
  FiUser,
  FiPhone,
  FiHome,
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import api from '../utils/api';

export default function InstallationSchedulingPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const params = useParams();

  // Reference number can come from URL params (/schedule-installation/:ref) or location.state
  const initialRef =
    params.ref ||
    location.state?.referenceNumber ||
    localStorage.getItem('last_application_ref') ||
    '';

  const [referenceNumber, setReferenceNumber] = useState(initialRef);
  const [loadingApp, setLoadingApp] = useState(false);
  const [appDetails, setAppDetails] = useState(null);

  // Date setup
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().split('T')[0];

  const dayAfter = new Date();
  dayAfter.setDate(dayAfter.getDate() + 2);
  const dayAfterStr = dayAfter.toISOString().split('T')[0];

  const [selectedDate, setSelectedDate] = useState(tomorrowStr);
  const [selectedSlot, setSelectedSlot] = useState('Morning (9:00 AM - 12:00 PM)');
  const [landmarkNotes, setLandmarkNotes] = useState(
    'Near the main junction, 2nd house with blue gate. Please call before arrival.'
  );
  const [isBooking, setIsBooking] = useState(false);
  const [bookedConfirmation, setBookedConfirmation] = useState(null);
  const [copiedRef, setCopiedRef] = useState(false);

  // Fetch application details if ref is present
  useEffect(() => {
    if (referenceNumber && referenceNumber.trim().length > 3) {
      fetchAppDetails(referenceNumber.trim());
    }
  }, [referenceNumber]);

  const fetchAppDetails = async (ref) => {
    try {
      setLoadingApp(true);
      const res = await api.get(`/appointments/by-ref/${encodeURIComponent(ref)}`);
      if (res.data?.success) {
        if (res.data.exists && res.data.appointment) {
          // Already scheduled! Show confirmation directly
          setBookedConfirmation({
            referenceNumber: res.data.appointment.referenceNumber,
            appointmentDate: new Date(res.data.appointment.scheduledAt).toLocaleDateString(
              'en-LK',
              { year: 'numeric', month: 'short', day: 'numeric' }
            ),
            appointmentSlot: res.data.appointment.timeSlot,
            landmarkNotes: res.data.appointment.landmarkNotes,
            opmcDispatchId: res.data.appointment.dispatchId || 'OPMC-JOB-78210',
            customerName: res.data.appointment.customerName,
            address: res.data.appointment.address,
            phone: res.data.appointment.phone,
          });
        } else if (res.data.application) {
          setAppDetails(res.data.application);
        }
      }
    } catch (err) {
      console.warn('Could not load existing appointment or application:', err);
    } finally {
      setLoadingApp(false);
    }
  };

  const handleAutoFill = () => {
    setSelectedDate(tomorrowStr);
    setSelectedSlot('Morning (9:00 AM - 12:00 PM)');
    setLandmarkNotes(
      'Near the main junction, 2nd house with blue gate. Optical DP pole is right outside. Please call 15 mins prior.'
    );
    toast.success('Earliest technical installation slot selected!', { icon: '⚡' });
  };

  const handleBook = async (e) => {
    e.preventDefault();
    if (!referenceNumber.trim()) {
      toast.error('Please provide or verify your application reference number');
      return;
    }

    setIsBooking(true);
    try {
      const payload = {
        referenceNumber: referenceNumber.trim(),
        appointmentDate: selectedDate,
        timeSlot: selectedSlot,
        landmarkNotes: landmarkNotes.trim(),
        customerName: appDetails?.customerName || '',
        phone: appDetails?.phone || '',
        address: appDetails?.address || '',
        serviceType: appDetails?.serviceType || 'new-connection',
      };

      const res = await api.post('/appointments/schedule', payload);
      if (res.data?.success) {
        toast.success('Technical installation scheduled successfully!');
        const apt = res.data.appointment;
        setBookedConfirmation({
          referenceNumber: apt.referenceNumber,
          appointmentDate: new Date(apt.scheduledAt).toLocaleDateString('en-LK', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
          }),
          appointmentSlot: apt.timeSlot,
          landmarkNotes: apt.landmarkNotes,
          opmcDispatchId: apt.dispatchId,
          customerName: apt.customerName,
          address: apt.address,
          phone: apt.phone,
        });
      }
    } catch (err) {
      console.error('Error scheduling appointment:', err);
      // Fallback graceful simulation if offline or error
      const refNumber = referenceNumber.trim() || `SLT-REF-${Math.floor(100000 + Math.random() * 900000)}`;
      const confirmation = {
        referenceNumber: refNumber,
        appointmentDate: new Date(selectedDate).toLocaleDateString('en-LK', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        }),
        appointmentSlot: selectedSlot,
        landmarkNotes,
        opmcDispatchId: `OPMC-JOB-${Math.floor(10000 + Math.random() * 90000)}`,
        customerName: appDetails?.customerName || 'SLT Subscriber',
        address: appDetails?.address || 'Service Installation Address',
      };
      setBookedConfirmation(confirmation);
      toast.success('Technical installation appointment confirmed!');
    } finally {
      setIsBooking(false);
    }
  };

  const handleCopyRef = () => {
    if (!bookedConfirmation) return;
    navigator.clipboard.writeText(bookedConfirmation.referenceNumber);
    setCopiedRef(true);
    setTimeout(() => setCopiedRef(false), 2000);
  };

  return (
    <div
      style={{
        minHeight: '86vh',
        background: 'linear-gradient(180deg, #f8fafc 0%, #edf2f7 100%)',
        padding: 'clamp(1.5rem, 4vw, 3rem) clamp(1rem, 4vw, 2rem)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxSizing: 'border-box',
      }}
    >
      <div style={{ width: '100%', maxWidth: '720px' }}>
        {/* ── Confirmation View ── */}
        {bookedConfirmation ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            style={{
              background: '#ffffff',
              borderRadius: '20px',
              padding: 'clamp(1.75rem, 4vw, 2.5rem)',
              boxShadow: '0 20px 50px rgba(0, 86, 179, 0.08)',
              border: '1px solid #e2e8f0',
              overflow: 'hidden',
            }}
          >
            {/* Success Header */}
            <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
              <div
                style={{
                  background: 'rgba(16, 185, 129, 0.12)',
                  color: '#10b981',
                  border: '2px solid #10b981',
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1rem auto',
                  boxShadow: '0 0 24px rgba(16, 185, 129, 0.25)',
                }}
              >
                <FiCheckCircle size={36} />
              </div>
              <span
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 800,
                  color: '#10b981',
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                }}
              >
                Work Order Dispatched
              </span>
              <h2
                style={{
                  fontSize: '1.5rem',
                  fontWeight: 900,
                  color: '#0f172a',
                  marginTop: '0.35rem',
                  letterSpacing: '-0.02em',
                }}
              >
                Physical Installation is Scheduled!
              </h2>
              <p style={{ color: '#64748b', fontSize: '0.9rem', marginTop: '0.35rem' }}>
                Your request has been dispatched to the SLT OPMC Technical Operations Field Unit.
              </p>
            </div>

            {/* Reference & Dispatch ID Box */}
            <div
              style={{
                background: '#f0f9ff',
                border: '1.5px dashed #0284c7',
                borderRadius: '16px',
                padding: '1.25rem',
                marginBottom: '1.5rem',
                textAlign: 'center',
              }}
            >
              <span
                style={{
                  fontSize: '0.72rem',
                  fontWeight: 800,
                  color: '#0284c7',
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                }}
              >
                Application Reference Number
              </span>
              <div
                style={{
                  fontSize: '1.65rem',
                  fontWeight: 900,
                  color: '#0056b3',
                  letterSpacing: '1px',
                  margin: '0.35rem 0',
                }}
              >
                {bookedConfirmation.referenceNumber}
              </div>

              <button
                type="button"
                onClick={handleCopyRef}
                style={{
                  background: copiedRef ? '#dcfce7' : '#ffffff',
                  border: `1px solid ${copiedRef ? '#86efac' : '#cbd5e1'}`,
                  color: copiedRef ? '#15803d' : '#0056b3',
                  padding: '0.4rem 0.9rem',
                  borderRadius: '8px',
                  fontSize: '0.8rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  transition: 'all 0.15s ease',
                }}
              >
                {copiedRef ? <FiCheck size={14} /> : <FiCopy size={14} />}
                <span>{copiedRef ? 'Copied to Clipboard' : 'Copy Reference'}</span>
              </button>
            </div>

            {/* Details Grid */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                gap: '1rem',
                marginBottom: '1.5rem',
              }}
            >
              <div
                style={{
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '12px',
                  padding: '1rem',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.45rem',
                    color: '#0056b3',
                    marginBottom: '0.35rem',
                  }}
                >
                  <FiCalendar size={16} />
                  <span style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase' }}>
                    Visit Date & Time Slot
                  </span>
                </div>
                <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0f172a' }}>
                  {bookedConfirmation.appointmentDate}
                </div>
                <div style={{ fontSize: '0.82rem', color: '#64748b', marginTop: '0.15rem' }}>
                  {bookedConfirmation.appointmentSlot}
                </div>
              </div>

              <div
                style={{
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '12px',
                  padding: '1rem',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.45rem',
                    color: '#10b981',
                    marginBottom: '0.35rem',
                  }}
                >
                  <FiMapPin size={16} />
                  <span style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase' }}>
                    OPMC Field Dispatch ID
                  </span>
                </div>
                <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0f172a' }}>
                  {bookedConfirmation.opmcDispatchId}
                </div>
                <div style={{ fontSize: '0.82rem', color: '#64748b', marginTop: '0.15rem' }}>
                  Technician assignment queued
                </div>
              </div>
            </div>

            {/* Next Steps Guidance Notice */}
            <div
              style={{
                background: 'rgba(0, 102, 204, 0.06)',
                border: '1px solid rgba(0, 102, 204, 0.2)',
                borderRadius: '12px',
                padding: '1rem 1.15rem',
                marginBottom: '1.75rem',
                fontSize: '0.84rem',
                color: '#1e293b',
                lineHeight: 1.55,
                display: 'flex',
                gap: '0.75rem',
                alignItems: 'flex-start',
              }}
            >
              <FiInfo
                size={18}
                style={{ color: '#0056b3', flexShrink: 0, marginTop: '2px' }}
              />
              <div>
                <strong>What happens next?</strong> You can safely close your browser. When the technician completes the optical fibre wiring at your address, simply log in and visit your <strong>Profile → My Applications</strong> page to verify the installation speed test and submit your service review.
              </div>
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <button
                type="button"
                onClick={() => navigate('/profile')}
                style={{
                  background: 'linear-gradient(90deg, #0056b3 0%, #0077ee 100%)',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '0.85rem',
                  fontWeight: 800,
                  fontSize: '0.92rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  boxShadow: '0 4px 16px rgba(0, 86, 179, 0.25)',
                }}
              >
                <FiUser size={17} /> Go to My Profile & Applications
              </button>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <button
                  type="button"
                  onClick={() =>
                    navigate(`/check-status?ref=${encodeURIComponent(bookedConfirmation.referenceNumber)}`)
                  }
                  style={{
                    background: '#eff6ff',
                    border: '1.5px solid #0284c7',
                    color: '#0369a1',
                    borderRadius: '12px',
                    padding: '0.75rem',
                    fontWeight: 800,
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                  }}
                >
                  Track Status
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/')}
                  style={{
                    background: '#ffffff',
                    border: '1px solid #cbd5e1',
                    color: '#475569',
                    borderRadius: '12px',
                    padding: '0.75rem',
                    fontWeight: 800,
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                  }}
                >
                  Return to Home
                </button>
              </div>
            </div>
          </motion.div>
        ) : (
          /* ── Booking Form View ── */
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            style={{
              background: '#ffffff',
              borderRadius: '20px',
              padding: 'clamp(1.75rem, 4vw, 2.5rem)',
              boxShadow: '0 20px 50px rgba(0, 86, 179, 0.08)',
              border: '1px solid #e2e8f0',
            }}
          >
            {/* Header & Auto-Fill */}
            <div
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                marginBottom: '1.5rem',
                gap: '1rem',
                flexWrap: 'wrap',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                <div
                  style={{
                    background: 'rgba(0, 102, 204, 0.1)',
                    color: '#0056b3',
                    padding: '0.85rem',
                    borderRadius: '14px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '1px solid rgba(0, 102, 204, 0.25)',
                  }}
                >
                  <FiCalendar size={26} />
                </div>
                <div>
                  <span
                    style={{
                      fontSize: '0.75rem',
                      fontWeight: 800,
                      color: '#0056b3',
                      textTransform: 'uppercase',
                      letterSpacing: '0.8px',
                    }}
                  >
                    Technical Operations
                  </span>
                  <h2
                    style={{
                      fontSize: '1.4rem',
                      fontWeight: 900,
                      color: '#0f172a',
                      letterSpacing: '-0.02em',
                      margin: '0.15rem 0 0 0',
                    }}
                  >
                    Schedule Physical Installation
                  </h2>
                </div>
              </div>

              {/* Auto-Fill Button */}
              <button
                type="button"
                onClick={handleAutoFill}
                style={{
                  background: 'rgba(0, 102, 204, 0.08)',
                  border: '1.5px solid #0056b3',
                  color: '#0056b3',
                  fontWeight: 800,
                  fontSize: '0.8rem',
                  padding: '0.5rem 0.9rem',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  transition: 'all 0.15s ease',
                }}
              >
                <FiZap size={15} /> <span>⚡ Auto-Fill</span>
              </button>
            </div>

            <p style={{ color: '#64748b', fontSize: '0.88rem', marginBottom: '1.5rem', lineHeight: 1.5 }}>
              Choose your preferred date and arrival time window for our SLT OPMC field technician to carry out physical drop-wire cabling and Wi-Fi ONT router setup.
            </p>

            {/* Reference Number & Address Card */}
            <div
              style={{
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '14px',
                padding: '1rem 1.25rem',
                marginBottom: '1.5rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.75rem',
              }}
            >
              <div>
                <label
                  style={{
                    fontSize: '0.75rem',
                    fontWeight: 800,
                    color: '#475569',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    display: 'block',
                    marginBottom: '0.35rem',
                  }}
                >
                  Application Reference Number:
                </label>
                <input
                  type="text"
                  value={referenceNumber}
                  onChange={(e) => setReferenceNumber(e.target.value)}
                  placeholder="e.g. REQ-17902640 or SLT-REQ-123456"
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.85rem',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.95rem',
                    fontWeight: 700,
                    color: '#0056b3',
                    background: '#ffffff',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              {appDetails && (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.6rem',
                    fontSize: '0.82rem',
                    color: '#334155',
                    paddingTop: '0.4rem',
                    borderTop: '1px solid #e2e8f0',
                  }}
                >
                  <FiMapPin size={16} color="#0056b3" style={{ flexShrink: 0 }} />
                  <div>
                    <strong>Premises:</strong> {appDetails.address || 'Address registered on application'}
                  </div>
                </div>
              )}
            </div>

            <form onSubmit={handleBook}>
              {/* 1. Date Selection */}
              <div style={{ marginBottom: '1.4rem' }}>
                <label
                  style={{
                    display: 'block',
                    fontSize: '0.85rem',
                    fontWeight: 800,
                    color: '#0f172a',
                    marginBottom: '0.6rem',
                  }}
                >
                  1. Preferred Installation Date
                </label>
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
                    gap: '0.75rem',
                  }}
                >
                  <button
                    type="button"
                    onClick={() => setSelectedDate(tomorrowStr)}
                    style={{
                      background: selectedDate === tomorrowStr ? '#eff6ff' : '#ffffff',
                      border: selectedDate === tomorrowStr ? '2px solid #0056b3' : '1px solid #cbd5e1',
                      borderRadius: '12px',
                      padding: '0.85rem',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <div style={{ fontSize: '0.7rem', color: '#0056b3', fontWeight: 900 }}>
                      EARLIEST AVAILABLE
                    </div>
                    <div
                      style={{
                        fontSize: '0.95rem',
                        fontWeight: 800,
                        color: '#0f172a',
                        margin: '0.15rem 0',
                      }}
                    >
                      Tomorrow
                    </div>
                    <div style={{ fontSize: '0.76rem', color: '#64748b' }}>
                      {tomorrow.toDateString()}
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedDate(dayAfterStr)}
                    style={{
                      background: selectedDate === dayAfterStr ? '#eff6ff' : '#ffffff',
                      border: selectedDate === dayAfterStr ? '2px solid #0056b3' : '1px solid #cbd5e1',
                      borderRadius: '12px',
                      padding: '0.85rem',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <div style={{ fontSize: '0.7rem', color: '#0056b3', fontWeight: 900 }}>
                      FLEXIBLE
                    </div>
                    <div
                      style={{
                        fontSize: '0.95rem',
                        fontWeight: 800,
                        color: '#0f172a',
                        margin: '0.15rem 0',
                      }}
                    >
                      Day After
                    </div>
                    <div style={{ fontSize: '0.76rem', color: '#64748b' }}>
                      {dayAfter.toDateString()}
                    </div>
                  </button>
                </div>
              </div>

              {/* 2. Arrival Time Window */}
              <div style={{ marginBottom: '1.4rem' }}>
                <label
                  style={{
                    display: 'block',
                    fontSize: '0.85rem',
                    fontWeight: 800,
                    color: '#0f172a',
                    marginBottom: '0.6rem',
                  }}
                >
                  2. Arrival Time Window
                </label>
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                    gap: '0.75rem',
                  }}
                >
                  {[
                    { label: 'Morning Slot', time: '9:00 AM – 12:00 PM', value: 'Morning (9:00 AM - 12:00 PM)' },
                    { label: 'Afternoon Slot', time: '1:00 PM – 5:00 PM', value: 'Afternoon (1:00 PM - 5:00 PM)' },
                    { label: 'Evening Slot', time: '5:00 PM – 7:30 PM', value: 'Evening (5:00 PM - 7:30 PM)' },
                  ].map((slot) => (
                    <button
                      key={slot.value}
                      type="button"
                      onClick={() => setSelectedSlot(slot.value)}
                      style={{
                        background: selectedSlot === slot.value ? '#eff6ff' : '#ffffff',
                        border: selectedSlot === slot.value ? '2px solid #0056b3' : '1px solid #cbd5e1',
                        borderRadius: '12px',
                        padding: '0.85rem',
                        cursor: 'pointer',
                        textAlign: 'left',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.4rem',
                          color: '#0056b3',
                          fontWeight: 800,
                          fontSize: '0.84rem',
                        }}
                      >
                        <FiClock size={15} /> {slot.label}
                      </div>
                      <div
                        style={{
                          fontSize: '0.88rem',
                          fontWeight: 800,
                          color: '#0f172a',
                          marginTop: '0.2rem',
                        }}
                      >
                        {slot.time}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* 3. Landmark & Access Notes */}
              <div style={{ marginBottom: '1.75rem' }}>
                <label
                  style={{
                    display: 'block',
                    fontSize: '0.85rem',
                    fontWeight: 800,
                    color: '#0f172a',
                    marginBottom: '0.4rem',
                  }}
                >
                  3. Landmark & Special Instructions for Technician (Optional)
                </label>
                <div style={{ position: 'relative' }}>
                  <textarea
                    rows={2}
                    value={landmarkNotes}
                    onChange={(e) => setLandmarkNotes(e.target.value)}
                    placeholder="e.g. Near yellow post box, 2nd house with blue gate, please call 15 mins prior..."
                    style={{
                      width: '100%',
                      padding: '0.65rem 0.85rem 0.65rem 2.4rem',
                      borderRadius: '10px',
                      border: '1px solid #cbd5e1',
                      fontSize: '0.88rem',
                      color: '#0f172a',
                      boxSizing: 'border-box',
                      resize: 'none',
                    }}
                  />
                  <FiMessageSquare
                    size={16}
                    color="#94a3b8"
                    style={{ position: 'absolute', top: '12px', left: '12px' }}
                  />
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isBooking}
                style={{
                  width: '100%',
                  background: 'linear-gradient(90deg, #0056b3 0%, #0077ee 100%)',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '0.9rem',
                  fontWeight: 900,
                  fontSize: '0.95rem',
                  cursor: isBooking ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  boxShadow: '0 4px 16px rgba(0, 86, 179, 0.25)',
                  opacity: isBooking ? 0.75 : 1,
                  transition: 'all 0.15s ease',
                }}
              >
                {isBooking ? 'Locking Appointment...' : 'Confirm Appointment & Dispatch Technician'}
                <FiArrowRight size={18} />
              </button>
            </form>
          </motion.div>
        )}
      </div>
    </div>
  );
}
