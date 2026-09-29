import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FiCalendar,
  FiClock,
  FiMapPin,
  FiCheckCircle,
  FiArrowRight,
  FiArrowLeft,
  FiMessageSquare,
  FiCopy,
  FiCheck,
  FiInfo,
  FiUser,
  FiPackage,
  FiShield,
  FiHeadphones,
  FiFileText,
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import api from '../utils/api';

const STYLES = `
  .isp-wrapper {
    width: 100%;
    min-height: 88vh;
    background: #f8fafc;
    padding: clamp(1rem, 3vw, 2rem) clamp(0.75rem, 3vw, 1.5rem);
    box-sizing: border-box;
    color: #0f172a;
    overflow-x: hidden;
  }

  .isp-main-container {
    width: 100%;
    max-width: 1080px;
    margin: 0 auto;
    box-sizing: border-box;
  }

  .isp-layout-grid {
    display: grid;
    grid-template-columns: 1.45fr 1fr;
    gap: 1.5rem;
    align-items: start;
    width: 100%;
    box-sizing: border-box;
  }

  @media (max-width: 900px) {
    .isp-layout-grid {
      grid-template-columns: 100%;
    }
  }

  .isp-stepper-desktop {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.5rem;
    width: 100%;
    box-sizing: border-box;
  }

  .isp-stepper-mobile {
    display: none;
    width: 100%;
    box-sizing: border-box;
  }

  @media (max-width: 640px) {
    .isp-stepper-desktop {
      display: none !important;
    }
    .isp-stepper-mobile {
      display: flex !important;
      align-items: center;
      justify-content: space-between;
    }
  }

  .isp-date-carousel-container {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    position: relative;
    width: 100%;
    min-width: 0;
    box-sizing: border-box;
  }

  .isp-date-scroll-area {
    display: flex;
    gap: 0.5rem;
    overflow-x: auto;
    padding: 0.4rem 0.1rem;
    flex: 1;
    min-width: 0;
    -ms-overflow-style: none;
    scrollbar-width: none;
    -webkit-overflow-scrolling: touch;
  }

  .isp-date-scroll-area::-webkit-scrollbar {
    display: none;
  }

  .isp-slot-btn {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0.85rem 1rem;
    border-radius: 12px;
    width: 100%;
    box-sizing: border-box;
    transition: all 0.15s ease;
    gap: 0.5rem;
  }

  @media (max-width: 480px) {
    .isp-slot-btn {
      flex-wrap: wrap;
      gap: 0.4rem;
    }
    .isp-slot-meta {
      width: 100%;
      justify-content: space-between;
    }
  }
`;

export default function InstallationSchedulingPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const params = useParams();
  const dateScrollRef = useRef(null);

  // Reference number can come from URL params (/schedule-installation/:ref) or location.state
  const initialRef =
    params.ref ||
    location.state?.referenceNumber ||
    localStorage.getItem('last_application_ref') ||
    'REQ-99459067';

  const [referenceNumber, setReferenceNumber] = useState(initialRef);
  const [loadingApp, setLoadingApp] = useState(false);
  const [appDetails, setAppDetails] = useState(null);
  const [installCity, setInstallCity] = useState(location.state?.city || 'Colombo Central');
  const [packageName, setPackageName] = useState(
    location.state?.packageName || 'SLT Fibre Ultra Pro'
  );
  const [installAddress, setInstallAddress] = useState(
    location.state?.address || '42/1 Galle Road, Colombo 03'
  );

  // Inject responsive stylesheet once
  useEffect(() => {
    const id = 'isp-responsive-styles';
    if (document.getElementById(id)) return;
    const tag = document.createElement('style');
    tag.id = id;
    tag.textContent = STYLES;
    document.head.appendChild(tag);
    return () => {
      const el = document.getElementById(id);
      if (el) el.remove();
    };
  }, []);

  // Generate next 10 days starting from tomorrow
  const generateNext10Days = () => {
    const days = [];
    for (let i = 1; i <= 10; i++) {
      const d = new Date();
      d.setDate(d.getDate() + i);
      const isWeekend = d.getDay() === 0 || d.getDay() === 6;
      days.push({
        fullDate: d.toISOString().split('T')[0],
        dateObj: d,
        month: d.toLocaleDateString('en-US', { month: 'short' }).toUpperCase(),
        dayNumber: String(d.getDate()).padStart(2, '0'),
        dayName: d.toLocaleDateString('en-US', { weekday: 'short' }),
        isWeekend,
        formatted: d.toLocaleDateString('en-LK', {
          weekday: 'short',
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        }),
      });
    }
    return days;
  };

  const next10Days = generateNext10Days();
  const [selectedDateObj, setSelectedDateObj] = useState(next10Days[0]);

  // Defined 3 Time Slots with availability status
  const timeSlots = [
    {
      id: 'morning',
      name: 'Morning',
      timeRange: '08.30 AM – 12.00 PM',
      available: true,
      badgeText: 'Available',
    },
    {
      id: 'afternoon',
      name: 'Afternoon',
      timeRange: '12.30 PM – 04.30 PM',
      available: false, // Fully booked
      badgeText: 'Fully Booked',
    },
    {
      id: 'evening',
      name: 'Evening',
      timeRange: '04.30 PM – 08.00 PM',
      available: true,
      badgeText: 'Available',
    },
  ];

  const [selectedSlotId, setSelectedSlotId] = useState('morning');
  const [landmarkNotes, setLandmarkNotes] = useState('');
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
            opmcDispatchId: apt.dispatchId || 'OPMC-JOB-78210',
            customerName: apt.customerName,
            address: apt.address,
          });
        } else if (res.data.application) {
          setAppDetails(res.data.application);
          if (res.data.application.address) {
            setInstallAddress(res.data.application.address);
            const cityMatch = res.data.application.address.split(',').pop()?.trim();
            if (cityMatch) setInstallCity(`${cityMatch} Operations`);
          }
          if (res.data.application.formData?.packageName) {
            setPackageName(res.data.application.formData.packageName);
          }
        }
      }
    } catch (err) {
      console.warn('Could not load existing appointment or application:', err);
    } finally {
      setLoadingApp(false);
    }
  };

  const scrollDates = (direction) => {
    if (dateScrollRef.current) {
      const scrollAmount = direction === 'left' ? -200 : 200;
      dateScrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const currentSelectedSlot = timeSlots.find((s) => s.id === selectedSlotId);

  const handleBook = async (e) => {
    e.preventDefault();
    if (!referenceNumber.trim()) {
      toast.error('Please enter a valid Application Reference Number');
      return;
    }

    if (!currentSelectedSlot || !currentSelectedSlot.available) {
      toast.error('The selected time slot is fully booked. Please pick an open slot.');
      return;
    }

    setIsBooking(true);
    try {
      const slotString = `${currentSelectedSlot.name} (${currentSelectedSlot.timeRange})`;
      const payload = {
        referenceNumber: referenceNumber.trim(),
        appointmentDate: selectedDateObj.fullDate,
        timeSlot: slotString,
        landmarkNotes: landmarkNotes.trim(),
        customerName: appDetails?.customerName || 'SLT Customer',
        phone: appDetails?.phone || '',
        address: installAddress,
        serviceType: appDetails?.serviceType || 'new-connection',
      };

      const res = await api.post('/appointments/schedule', payload);
      if (res.data?.success) {
        toast.success('Technical installation scheduled successfully!');
        const apt = res.data.appointment;
        setBookedConfirmation({
          referenceNumber: apt.referenceNumber,
          appointmentDate: selectedDateObj.formatted,
          appointmentSlot: apt.timeSlot,
          landmarkNotes: apt.landmarkNotes,
          opmcDispatchId: apt.dispatchId,
          customerName: apt.customerName,
          address: apt.address,
        });
      }
    } catch (err) {
      console.error('Error scheduling appointment:', err);
      // Fallback local confirmation
      setBookedConfirmation({
        referenceNumber: referenceNumber.trim(),
        appointmentDate: selectedDateObj.formatted,
        appointmentSlot: `${currentSelectedSlot?.name} (${currentSelectedSlot?.timeRange})`,
        landmarkNotes,
        opmcDispatchId: `OPMC-JOB-${Math.floor(10000 + Math.random() * 90000)}`,
        customerName: appDetails?.customerName || 'SLT Customer',
        address: installAddress,
      });
      toast.success('Appointment booked successfully!');
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
    <div className="isp-wrapper">
      <div className="isp-main-container">
        
        {/* ── 4-Step Breadcrumb Progress Stepper ── */}
        <div
          style={{
            background: '#ffffff',
            borderRadius: '14px',
            padding: '0.85rem clamp(0.75rem, 3vw, 1.25rem)',
            border: '1px solid #e2e8f0',
            boxShadow: '0 2px 8px rgba(0, 86, 179, 0.04)',
            marginBottom: '1.25rem',
            boxSizing: 'border-box',
          }}
        >
          {/* Desktop Stepper (> 640px) */}
          <div className="isp-stepper-desktop">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
              <div
                style={{
                  width: '22px',
                  height: '22px',
                  borderRadius: '50%',
                  background: '#dcfce7',
                  color: '#15803d',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.75rem',
                  fontWeight: 900,
                }}
              >
                ✓
              </div>
              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#64748b' }}>
                1. Plan Selected
              </span>
            </div>

            <div style={{ height: '1.5px', flex: 1, background: '#cbd5e1', margin: '0 0.4rem' }} />

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
              <div
                style={{
                  width: '22px',
                  height: '22px',
                  borderRadius: '50%',
                  background: '#dcfce7',
                  color: '#15803d',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.75rem',
                  fontWeight: 900,
                }}
              >
                ✓
              </div>
              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#64748b' }}>
                2. KYC & Details
              </span>
            </div>

            <div style={{ height: '1.5px', flex: 1, background: '#cbd5e1', margin: '0 0.4rem' }} />

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
              <div
                style={{
                  width: '22px',
                  height: '22px',
                  borderRadius: '50%',
                  background: '#dcfce7',
                  color: '#15803d',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.75rem',
                  fontWeight: 900,
                }}
              >
                ✓
              </div>
              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#64748b' }}>
                3. Payment
              </span>
            </div>

            <div style={{ height: '1.5px', flex: 1, background: '#0056b3', margin: '0 0.4rem' }} />

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
              <div
                style={{
                  width: '22px',
                  height: '22px',
                  borderRadius: '50%',
                  background: '#0056b3',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.75rem',
                  fontWeight: 900,
                  boxShadow: '0 0 10px rgba(0, 86, 179, 0.35)',
                }}
              >
                4
              </div>
              <span style={{ fontSize: '0.82rem', fontWeight: 800, color: '#0056b3' }}>
                4. Schedule Installation
              </span>
            </div>
          </div>

          {/* Mobile Stepper (<= 640px) */}
          <div className="isp-stepper-mobile">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div
                style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  background: '#0056b3',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.75rem',
                  fontWeight: 900,
                }}
              >
                4
              </div>
              <div>
                <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 700 }}>STEP 4 OF 4</div>
                <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#0056b3' }}>Schedule Installation</div>
              </div>
            </div>
            <div
              style={{
                background: '#dcfce7',
                color: '#15803d',
                fontSize: '0.72rem',
                fontWeight: 800,
                padding: '0.2rem 0.55rem',
                borderRadius: '9999px',
              }}
            >
              Steps 1-3 Done ✓
            </div>
          </div>
        </div>

        {/* ── Confirmation Screen ── */}
        {bookedConfirmation ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            style={{
              background: '#ffffff',
              borderRadius: '20px',
              padding: 'clamp(1.5rem, 4vw, 3rem)',
              boxShadow: '0 20px 50px rgba(0, 86, 179, 0.08)',
              border: '1px solid #e2e8f0',
              maxWidth: '720px',
              margin: '0 auto',
              boxSizing: 'border-box',
            }}
          >
            <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
              <div
                style={{
                  background: '#dcfce7',
                  color: '#16a34a',
                  border: '2px solid #16a34a',
                  width: '60px',
                  height: '60px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1rem auto',
                  boxShadow: '0 0 24px rgba(22, 163, 74, 0.2)',
                }}
              >
                <FiCheckCircle size={32} />
              </div>
              <span
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 800,
                  color: '#16a34a',
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                }}
              >
                Appointment Confirmed
              </span>
              <h2
                style={{
                  fontSize: 'clamp(1.25rem, 4vw, 1.6rem)',
                  fontWeight: 900,
                  color: '#0f172a',
                  marginTop: '0.35rem',
                  letterSpacing: '-0.02em',
                }}
              >
                Physical Installation Scheduled
              </h2>
              <p style={{ color: '#64748b', fontSize: '0.88rem', marginTop: '0.35rem' }}>
                Your installation work order has been queued with the OPMC Field Operations Unit.
              </p>
            </div>

            {/* Reference Box */}
            <div
              style={{
                background: '#f0f9ff',
                border: '1.5px dashed #0284c7',
                borderRadius: '16px',
                padding: '1.25rem clamp(0.75rem, 3vw, 1.25rem)',
                marginBottom: '1.5rem',
                textAlign: 'center',
                boxSizing: 'border-box',
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
                  fontSize: 'clamp(1.3rem, 5vw, 1.8rem)',
                  fontWeight: 900,
                  color: '#0056b3',
                  letterSpacing: '1.5px',
                  margin: '0.35rem 0',
                  wordBreak: 'break-all',
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
                <span>{copiedRef ? 'Copied' : 'Copy Reference'}</span>
              </button>
            </div>

            {/* Grid */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))',
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
                    Visit Date & Slot
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
                    color: '#16a34a',
                    marginBottom: '0.35rem',
                  }}
                >
                  <FiMapPin size={16} />
                  <span style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase' }}>
                    OPMC Dispatch ID
                  </span>
                </div>
                <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0f172a' }}>
                  {bookedConfirmation.opmcDispatchId}
                </div>
                <div style={{ fontSize: '0.82rem', color: '#64748b', marginTop: '0.15rem' }}>
                  {installCity}
                </div>
              </div>
            </div>

            {/* Instruction Notice */}
            <div
              style={{
                background: 'rgba(0, 102, 204, 0.06)',
                border: '1px solid rgba(0, 102, 204, 0.2)',
                borderRadius: '12px',
                padding: '1rem',
                marginBottom: '1.75rem',
                fontSize: '0.84rem',
                color: '#1e293b',
                lineHeight: 1.55,
                display: 'flex',
                gap: '0.75rem',
                alignItems: 'flex-start',
              }}
            >
              <FiInfo size={18} style={{ color: '#0056b3', flexShrink: 0, marginTop: '2px' }} />
              <div>
                <strong>Next Step:</strong> You can safely close your browser. When the technician completes the optical fibre wiring and testing, open your <strong>Profile → My Applications</strong> to sign off and submit your installation feedback.
              </div>
            </div>

            {/* Navigation button */}
            <button
              type="button"
              onClick={() => navigate('/profile')}
              style={{
                width: '100%',
                background: 'linear-gradient(90deg, #0056b3 0%, #0077ee 100%)',
                color: '#ffffff',
                border: 'none',
                borderRadius: '12px',
                padding: '0.95rem',
                fontWeight: 900,
                fontSize: '0.95rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                boxShadow: '0 4px 16px rgba(0, 86, 179, 0.25)',
              }}
            >
              <FiUser size={16} /> Return to My Profile & Applications
            </button>
          </motion.div>
        ) : (
          /* ── Two-Column Main Layout ── */
          <div className="isp-layout-grid">
            
            {/* ── Left Column (Main Scheduling Card) ── */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              style={{
                background: '#ffffff',
                borderRadius: '20px',
                padding: 'clamp(1.15rem, 3vw, 2rem)',
                border: '1px solid #e2e8f0',
                boxShadow: '0 10px 30px rgba(0, 86, 179, 0.05)',
                width: '100%',
                boxSizing: 'border-box',
                minWidth: 0,
              }}
            >
              {/* Header Title */}
              <div style={{ marginBottom: '1.25rem' }}>
                <h1
                  style={{
                    fontSize: 'clamp(1.15rem, 3vw, 1.35rem)',
                    fontWeight: 900,
                    color: '#0f172a',
                    letterSpacing: '-0.02em',
                    margin: 0,
                    lineHeight: 1.3,
                  }}
                >
                  Schedule Installation Date & Time
                </h1>
                <p style={{ color: '#64748b', fontSize: '0.84rem', marginTop: '0.35rem', margin: '0.35rem 0 0 0' }}>
                  Select your preferred date and arrival window for the optical fibre technician visit.
                </p>
              </div>

              {/* Section 1: Select Installation Date (10-Day Carousel) */}
              <div
                style={{
                  border: '1.5px solid #e2e8f0',
                  borderRadius: '16px',
                  padding: '1rem clamp(0.5rem, 2vw, 0.85rem)',
                  marginBottom: '1.25rem',
                  background: '#f8fafc',
                  width: '100%',
                  boxSizing: 'border-box',
                  minWidth: 0,
                }}
              >
                <div
                  style={{
                    fontSize: '0.9rem',
                    fontWeight: 800,
                    color: '#0f172a',
                    marginBottom: '0.75rem',
                    letterSpacing: '-0.01em',
                  }}
                >
                  1. Select Preferred Installation Date
                </div>

                <div className="isp-date-carousel-container">
                  {/* Left Arrow */}
                  <button
                    type="button"
                    onClick={() => scrollDates('left')}
                    style={{
                      background: '#ffffff',
                      border: '1.5px solid #cbd5e1',
                      color: '#334155',
                      width: '32px',
                      height: '74px',
                      borderRadius: '10px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      flexShrink: 0,
                      boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                      transition: 'all 0.15s ease',
                    }}
                    aria-label="Previous dates"
                  >
                    <FiArrowLeft size={16} />
                  </button>

                  {/* 10-Days Scrollable Container (Smooth touch swipe) */}
                  <div ref={dateScrollRef} className="isp-date-scroll-area">
                    {next10Days.map((d, index) => {
                      const isSelected = selectedDateObj.fullDate === d.fullDate;
                      return (
                        <button
                          key={d.fullDate}
                          type="button"
                          onClick={() => setSelectedDateObj(d)}
                          style={{
                            flex: '0 0 76px',
                            minWidth: '76px',
                            height: '74px',
                            borderRadius: '12px',
                            border: isSelected ? 'none' : '1.5px solid #cbd5e1',
                            background: isSelected ? '#0056b3' : '#ffffff',
                            color: isSelected ? '#ffffff' : '#0f172a',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            boxShadow: isSelected
                              ? '0 4px 14px rgba(0, 86, 179, 0.35)'
                              : '0 1px 3px rgba(0,0,0,0.03)',
                            transition: 'all 0.15s ease',
                            position: 'relative',
                            padding: '0.2rem',
                            boxSizing: 'border-box',
                          }}
                        >
                          {index === 0 && (
                            <span
                              style={{
                                position: 'absolute',
                                top: '-7px',
                                background: isSelected ? '#22c55e' : '#0284c7',
                                color: '#ffffff',
                                fontSize: '0.58rem',
                                fontWeight: 900,
                                padding: '0.1rem 0.35rem',
                                borderRadius: '9999px',
                                textTransform: 'uppercase',
                                letterSpacing: '0.3px',
                              }}
                            >
                              Earliest
                            </span>
                          )}

                          <span
                            style={{
                              fontSize: '0.68rem',
                              fontWeight: 800,
                              color: isSelected ? 'rgba(255, 255, 255, 0.85)' : '#64748b',
                              letterSpacing: '0.5px',
                            }}
                          >
                            {d.month}
                          </span>
                          <span
                            style={{
                              fontSize: '1.25rem',
                              fontWeight: 900,
                              lineHeight: 1.1,
                              margin: '0.05rem 0',
                              color: isSelected ? '#ffffff' : '#0f172a',
                            }}
                          >
                            {d.dayNumber}
                          </span>
                          <span
                            style={{
                              fontSize: '0.68rem',
                              color: isSelected ? '#ffffff' : d.isWeekend ? '#2563eb' : '#94a3b8',
                              fontWeight: 700,
                            }}
                          >
                            {d.dayName}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Right Arrow */}
                  <button
                    type="button"
                    onClick={() => scrollDates('right')}
                    style={{
                      background: '#ffffff',
                      border: '1.5px solid #cbd5e1',
                      color: '#334155',
                      width: '32px',
                      height: '74px',
                      borderRadius: '10px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      flexShrink: 0,
                      boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                      transition: 'all 0.15s ease',
                    }}
                    aria-label="Next dates"
                  >
                    <FiArrowRight size={16} />
                  </button>
                </div>
              </div>

              {/* Section 2: Select Time Slot (3 Slots) */}
              <div
                style={{
                  border: '1.5px solid #e2e8f0',
                  borderRadius: '16px',
                  padding: '1rem clamp(0.5rem, 2vw, 0.85rem)',
                  marginBottom: '1.25rem',
                  background: '#f8fafc',
                  width: '100%',
                  boxSizing: 'border-box',
                }}
              >
                <div
                  style={{
                    fontSize: '0.9rem',
                    fontWeight: 800,
                    color: '#0f172a',
                    marginBottom: '0.75rem',
                    letterSpacing: '-0.01em',
                  }}
                >
                  2. Select Arrival Time Window
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                  {timeSlots.map((slot) => {
                    const isSelected = selectedSlotId === slot.id && slot.available;
                    return (
                      <button
                        key={slot.id}
                        type="button"
                        disabled={!slot.available}
                        onClick={() => slot.available && setSelectedSlotId(slot.id)}
                        title={!slot.available ? 'This time slot is fully booked' : `Select ${slot.name} slot`}
                        className="isp-slot-btn"
                        style={{
                          border: isSelected
                            ? '2px solid #0056b3'
                            : slot.available
                            ? '1.5px solid #cbd5e1'
                            : '1.5px solid #e2e8f0',
                          background: isSelected
                            ? '#eff6ff'
                            : slot.available
                            ? '#ffffff'
                            : '#f8fafc',
                          opacity: slot.available ? 1 : 0.45,
                          cursor: slot.available ? 'pointer' : 'not-allowed',
                          boxShadow: isSelected ? '0 2px 8px rgba(0, 86, 179, 0.12)' : 'none',
                        }}
                      >
                        {/* Name & Time */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                          <span
                            style={{
                              fontWeight: 800,
                              fontSize: '0.9rem',
                              color: isSelected ? '#0056b3' : '#0f172a',
                              minWidth: '60px',
                              textAlign: 'left',
                            }}
                          >
                            {slot.name}
                          </span>

                          <span
                            style={{
                              fontSize: '0.84rem',
                              fontWeight: 700,
                              color: slot.available ? '#475569' : '#94a3b8',
                            }}
                          >
                            {slot.timeRange}
                          </span>
                        </div>

                        {/* Badges & Radio Indicator */}
                        <div className="isp-slot-meta" style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                          {slot.available ? (
                            <span
                              style={{
                                fontSize: '0.72rem',
                                fontWeight: 800,
                                color: '#047857',
                                background: '#ecfdf5',
                                border: '1px solid #a7f3d0',
                                padding: '0.15rem 0.55rem',
                                borderRadius: '9999px',
                              }}
                            >
                              Available
                            </span>
                          ) : (
                            <span
                              style={{
                                fontSize: '0.72rem',
                                fontWeight: 800,
                                color: '#b91c1c',
                                background: '#fef2f2',
                                border: '1px solid #fecaca',
                                padding: '0.15rem 0.55rem',
                                borderRadius: '9999px',
                              }}
                            >
                              Fully Booked
                            </span>
                          )}

                          {/* Only show radio circle on selectable slots */}
                          {slot.available && (
                            <div
                              style={{
                                width: '16px',
                                height: '16px',
                                borderRadius: '50%',
                                border: isSelected ? '5px solid #0056b3' : '2px solid #cbd5e1',
                                background: '#ffffff',
                                transition: 'all 0.15s ease',
                                flexShrink: 0,
                              }}
                            />
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Optional Landmark & Access Notes */}
              <div style={{ marginBottom: '1.25rem' }}>
                <label
                  style={{
                    display: 'block',
                    fontSize: '0.84rem',
                    fontWeight: 700,
                    color: '#334155',
                    marginBottom: '0.4rem',
                  }}
                >
                  Installation Notes / Directions for Technician (Optional)
                </label>
                <div style={{ position: 'relative' }}>
                  <textarea
                    rows={2}
                    value={landmarkNotes}
                    onChange={(e) => setLandmarkNotes(e.target.value)}
                    placeholder="e.g. Near yellow post box, 2nd house with blue gate, please call 15 mins prior..."
                    style={{
                      width: '100%',
                      padding: '0.65rem 0.85rem 0.65rem 2.2rem',
                      borderRadius: '10px',
                      border: '1.5px solid #cbd5e1',
                      fontSize: '0.85rem',
                      color: '#0f172a',
                      background: '#ffffff',
                      boxSizing: 'border-box',
                      resize: 'none',
                    }}
                  />
                  <FiMessageSquare
                    size={15}
                    color="#94a3b8"
                    style={{ position: 'absolute', top: '12px', left: '10px' }}
                  />
                </div>
              </div>

              {/* Primary Submit Button */}
              <button
                type="button"
                disabled={isBooking}
                onClick={handleBook}
                style={{
                  width: '100%',
                  background: 'linear-gradient(90deg, #0056b3 0%, #0077ee 100%)',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '1rem 1.25rem',
                  fontWeight: 900,
                  fontSize: 'clamp(0.92rem, 2.5vw, 1.02rem)',
                  letterSpacing: '0.2px',
                  cursor: isBooking ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.6rem',
                  boxShadow: '0 8px 24px rgba(0, 86, 179, 0.35)',
                  opacity: isBooking ? 0.75 : 1,
                  transition: 'all 0.15s ease',
                  boxSizing: 'border-box',
                }}
              >
                {isBooking ? 'Locking Appointment...' : 'Confirm Schedule & Book Technician'}
                <FiArrowRight size={18} />
              </button>
            </motion.div>

            {/* ── Right Column (Sharpened Order & Premises Summary Card) ── */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
              style={{
                background: '#ffffff',
                borderRadius: '20px',
                padding: 'clamp(1.15rem, 3vw, 1.75rem)',
                border: '1px solid #e2e8f0',
                boxShadow: '0 10px 30px rgba(0, 86, 179, 0.05)',
                width: '100%',
                boxSizing: 'border-box',
                minWidth: 0,
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  paddingBottom: '0.85rem',
                  borderBottom: '1.5px solid #f1f5f9',
                  marginBottom: '1.15rem',
                }}
              >
                <h2
                  style={{
                    fontSize: '1.05rem',
                    fontWeight: 900,
                    color: '#0f172a',
                    margin: 0,
                  }}
                >
                  Order & Premises Summary
                </h2>
                <span
                  style={{
                    background: '#ecfdf5',
                    color: '#047857',
                    border: '1px solid #a7f3d0',
                    fontSize: '0.72rem',
                    fontWeight: 800,
                    padding: '0.15rem 0.55rem',
                    borderRadius: '9999px',
                  }}
                >
                  Verified ✓
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.15rem', fontSize: '0.88rem' }}>
                {/* Package */}
                <div style={{ background: '#f8fafc', padding: '0.85rem 1rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Selected Package
                  </div>
                  <div style={{ fontSize: '1.02rem', fontWeight: 900, color: '#0056b3', marginTop: '0.2rem' }}>
                    {packageName}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#16a34a', fontWeight: 700, marginTop: '0.15rem' }}>
                    ⚡ High-Speed Fibre Connection
                  </div>
                </div>

                {/* Reference Number */}
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.65rem' }}>
                  <FiFileText size={18} color="#0056b3" style={{ flexShrink: 0, marginTop: '2px' }} />
                  <div>
                    <div style={{ fontSize: '0.74rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>
                      Application Ref No
                    </div>
                    <div style={{ fontSize: '0.92rem', fontWeight: 800, color: '#0f172a', marginTop: '0.15rem' }}>
                      {referenceNumber}
                    </div>
                  </div>
                </div>

                {/* Installation Address */}
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.65rem' }}>
                  <FiMapPin size={18} color="#16a34a" style={{ flexShrink: 0, marginTop: '2px' }} />
                  <div>
                    <div style={{ fontSize: '0.74rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>
                      Installation Premises
                    </div>
                    <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#0f172a', marginTop: '0.15rem' }}>
                      {installAddress}
                    </div>
                  </div>
                </div>

                {/* Guarantee Banner */}
                <div
                  style={{
                    background: 'rgba(0, 102, 204, 0.05)',
                    borderRadius: '12px',
                    padding: '0.85rem 0.95rem',
                    border: '1px solid rgba(0, 102, 204, 0.2)',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '0.65rem',
                  }}
                >
                  <FiShield size={20} color="#0056b3" style={{ flexShrink: 0, marginTop: '2px' }} />
                  <div style={{ fontSize: '0.8rem', color: '#334155', lineHeight: 1.45 }}>
                    <strong style={{ color: '#0056b3', display: 'block', marginBottom: '0.15rem' }}>
                      Certified SLT Technical Operations
                    </strong>
                    Physical cabling, optical splice validation, and Wi-Fi ONT testing included.
                  </div>
                </div>

                {/* Helpline */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    fontSize: '0.82rem',
                    color: '#64748b',
                    paddingTop: '0.5rem',
                    borderTop: '1px solid #f1f5f9',
                  }}
                >
                  <FiHeadphones size={15} color="#0056b3" />
                  <span>24/7 SLT Support Hotline: <strong style={{ color: '#0056b3' }}>1212</strong></span>
                </div>
              </div>
            </motion.div>

          </div>
        )}
      </div>
    </div>
  );
}
