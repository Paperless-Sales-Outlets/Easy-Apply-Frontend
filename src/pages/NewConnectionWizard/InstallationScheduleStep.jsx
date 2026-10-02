import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  FiCalendar,
  FiClock,
  FiMapPin,
  FiCheckCircle,
  FiArrowRight,
  FiArrowLeft,
  FiMessageSquare,
  FiShield,
  FiInfo,
  FiCheck,
} from 'react-icons/fi';

export default function InstallationScheduleStep({ formData, handleChange, setFields, selectedProduct }) {
  const dateScrollRef = useRef(null);

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

  // Selected date state
  const [selectedDate, setSelectedDate] = useState(
    formData.installationDate || next10Days[0].fullDate
  );

  // Defined 3 Time Slots with official operational hours
  const timeSlots = [
    {
      id: 'morning',
      name: 'Morning',
      timeRange: '08.30 AM – 12.00 PM',
      fullLabel: 'Morning (08.30 AM - 12.00 PM)',
      available: true,
      badgeText: 'Available',
    },
    {
      id: 'afternoon',
      name: 'Afternoon',
      timeRange: '12.00 PM – 02.00 PM',
      fullLabel: 'Afternoon (12.00 PM - 02.00 PM)',
      available: false, // Fully booked
      badgeText: 'Fully Booked',
    },
    {
      id: 'evening',
      name: 'Evening',
      timeRange: '02.00 PM – 04.30 PM',
      fullLabel: 'Evening (02.00 PM - 04.30 PM)',
      available: true,
      badgeText: 'Available',
    },
  ];

  const [selectedSlotId, setSelectedSlotId] = useState(() => {
    if (formData.installationTimeSlot) {
      const found = timeSlots.find(
        (s) => s.fullLabel === formData.installationTimeSlot || s.name === formData.installationTimeSlot
      );
      if (found && found.available) return found.id;
    }
    return 'morning';
  });

  // Sync to formData on mount / change
  useEffect(() => {
    const slot = timeSlots.find((s) => s.id === selectedSlotId);
    setFields({
      installationDate: selectedDate,
      installationTimeSlot: slot ? slot.fullLabel : 'Morning (08.30 AM - 12.00 PM)',
      timeSlot: slot ? slot.fullLabel : 'Morning (08.30 AM - 12.00 PM)',
      appointmentDate: selectedDate,
    });
  }, [selectedDate, selectedSlotId]);

  const scrollDates = (direction) => {
    if (dateScrollRef.current) {
      const scrollAmount = direction === 'left' ? -200 : 200;
      dateScrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const activeAddress =
    formData.installAddress ||
    formData.address ||
    `${formData.addressLine1 || ''} ${formData.city || ''}`.trim() ||
    'Installation Location';

  const opmcBranch = formData.city
    ? `${formData.city} Regional OPMC`
    : 'Colombo Central Regional OPMC';

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <h3
          style={{
            fontSize: '1.4rem',
            fontWeight: 900,
            color: '#0f172a',
            margin: '0 0 0.35rem 0',
            letterSpacing: '-0.02em',
          }}
        >
          Schedule Physical Installation Visit
        </h3>
        <p style={{ color: '#64748b', margin: 0, fontSize: '0.9rem', fontWeight: 500 }}>
          Select your preferred appointment date and arrival time window for the optical fibre technician visit.
        </p>
      </div>

      {/* 2-Column Responsive Layout */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 340px), 1fr))',
          gap: '1.5rem',
          alignItems: 'start',
        }}
      >
        {/* Left Column: Date Carousel & Time Slots */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* 1. Date Carousel Card */}
          <div
            style={{
              backgroundColor: '#ffffff',
              border: '1.5px solid #e2e8f0',
              borderRadius: '16px',
              padding: '1.25rem',
              boxShadow: '0 4px 15px rgba(0,0,0,0.03)',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '1rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span
                  style={{
                    backgroundColor: '#eff6ff',
                    color: '#0056b3',
                    padding: '0.35rem 0.65rem',
                    borderRadius: '8px',
                    fontWeight: 800,
                    fontSize: '0.85rem',
                  }}
                >
                  1
                </span>
                <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: '#0f172a' }}>
                  Select Preferred Installation Date
                </h4>
              </div>
            </div>

            {/* Date Carousel */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', position: 'relative' }}>
              <button
                type="button"
                onClick={() => scrollDates('left')}
                style={{
                  background: '#f8fafc',
                  border: '1px solid #cbd5e1',
                  borderRadius: '10px',
                  width: '36px',
                  height: '68px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: '#475569',
                  flexShrink: 0,
                  transition: 'all 0.15s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#e2e8f0';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#f8fafc';
                }}
              >
                <FiArrowLeft size={16} />
              </button>

              <div
                ref={dateScrollRef}
                style={{
                  display: 'flex',
                  gap: '0.5rem',
                  overflowX: 'auto',
                  padding: '0.3rem 0.1rem',
                  flex: 1,
                  scrollbarWidth: 'none',
                }}
              >
                {next10Days.map((d, index) => {
                  const isSelected = selectedDate === d.fullDate;
                  const isEarliest = index === 0;

                  return (
                    <button
                      key={d.fullDate}
                      type="button"
                      onClick={() => setSelectedDate(d.fullDate)}
                      style={{
                        position: 'relative',
                        flex: '0 0 74px',
                        height: '74px',
                        borderRadius: '12px',
                        border: isSelected ? '2px solid #0056b3' : '1.5px solid #e2e8f0',
                        backgroundColor: isSelected ? '#0056b3' : '#ffffff',
                        color: isSelected ? '#ffffff' : '#0f172a',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                        padding: '0.35rem 0.2rem',
                        boxShadow: isSelected ? '0 4px 14px rgba(0, 86, 179, 0.25)' : 'none',
                      }}
                    >
                      {isEarliest && (
                        <span
                          style={{
                            position: 'absolute',
                            top: '-8px',
                            background: '#10b981',
                            color: '#ffffff',
                            fontSize: '0.55rem',
                            fontWeight: 900,
                            padding: '0.1rem 0.35rem',
                            borderRadius: '4px',
                            textTransform: 'uppercase',
                            letterSpacing: '0.4px',
                          }}
                        >
                          Earliest
                        </span>
                      )}
                      <span
                        style={{
                          fontSize: '0.65rem',
                          fontWeight: 800,
                          opacity: isSelected ? 0.9 : 0.6,
                          textTransform: 'uppercase',
                        }}
                      >
                        {d.month}
                      </span>
                      <span style={{ fontSize: '1.25rem', fontWeight: 900, lineHeight: 1.1 }}>
                        {d.dayNumber}
                      </span>
                      <span
                        style={{
                          fontSize: '0.68rem',
                          fontWeight: 700,
                          opacity: isSelected ? 0.9 : 0.7,
                        }}
                      >
                        {d.dayName}
                      </span>
                    </button>
                  );
                })}
              </div>

              <button
                type="button"
                onClick={() => scrollDates('right')}
                style={{
                  background: '#f8fafc',
                  border: '1px solid #cbd5e1',
                  borderRadius: '10px',
                  width: '36px',
                  height: '68px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: '#475569',
                  flexShrink: 0,
                  transition: 'all 0.15s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#e2e8f0';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#f8fafc';
                }}
              >
                <FiArrowRight size={16} />
              </button>
            </div>
          </div>

          {/* 2. Time Slot Selection Card */}
          <div
            style={{
              backgroundColor: '#ffffff',
              border: '1.5px solid #e2e8f0',
              borderRadius: '16px',
              padding: '1.25rem',
              boxShadow: '0 4px 15px rgba(0,0,0,0.03)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
              <span
                style={{
                  backgroundColor: '#eff6ff',
                  color: '#0056b3',
                  padding: '0.35rem 0.65rem',
                  borderRadius: '8px',
                  fontWeight: 800,
                  fontSize: '0.85rem',
                }}
              >
                2
              </span>
              <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: '#0f172a' }}>
                Select Arrival Time Window
              </h4>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              {timeSlots.map((slot) => {
                const isSelected = selectedSlotId === slot.id;
                const isAvailable = slot.available;

                return (
                  <button
                    key={slot.id}
                    type="button"
                    disabled={!isAvailable}
                    onClick={() => setSelectedSlotId(slot.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.85rem 1.15rem',
                      borderRadius: '12px',
                      border: isSelected
                        ? '2px solid #0056b3'
                        : isAvailable
                        ? '1.5px solid #e2e8f0'
                        : '1.5px dashed #cbd5e1',
                      backgroundColor: isSelected
                        ? '#f0f9ff'
                        : isAvailable
                        ? '#ffffff'
                        : '#f8fafc',
                      cursor: isAvailable ? 'pointer' : 'not-allowed',
                      opacity: isAvailable ? 1 : 0.65,
                      transition: 'all 0.15s ease',
                      textAlign: 'left',
                    }}
                  >
                    <div>
                      <div
                        style={{
                          fontSize: '0.92rem',
                          fontWeight: 800,
                          color: isSelected ? '#0056b3' : '#0f172a',
                        }}
                      >
                        <strong>{slot.name}</strong> &nbsp;
                        <span style={{ fontWeight: 600, color: '#475569', fontSize: '0.86rem' }}>
                          {slot.timeRange}
                        </span>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span
                        style={{
                          fontSize: '0.72rem',
                          fontWeight: 800,
                          padding: '0.2rem 0.6rem',
                          borderRadius: '9999px',
                          backgroundColor: isAvailable ? '#dcfce7' : '#fee2e2',
                          color: isAvailable ? '#166534' : '#991b1b',
                          border: isAvailable ? '1px solid #bbf7d0' : '1px solid #fecaca',
                        }}
                      >
                        {slot.badgeText}
                      </span>
                      <div
                        style={{
                          width: '18px',
                          height: '18px',
                          borderRadius: '50%',
                          border: isSelected ? '5px solid #0056b3' : '2px solid #cbd5e1',
                          backgroundColor: '#ffffff',
                          boxSizing: 'border-box',
                        }}
                      />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3. Landmark / Directions Notes */}
          <div
            style={{
              backgroundColor: '#ffffff',
              border: '1.5px solid #e2e8f0',
              borderRadius: '16px',
              padding: '1.25rem',
              boxShadow: '0 4px 15px rgba(0,0,0,0.03)',
            }}
          >
            <label
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.45rem',
                fontSize: '0.88rem',
                fontWeight: 800,
                color: '#0f172a',
                marginBottom: '0.5rem',
              }}
            >
              <FiMessageSquare size={16} color="#0056b3" />
              <span>Installation Notes / Directions for Technician (Optional)</span>
            </label>
            <textarea
              rows={2}
              name="landmarkNotes"
              value={formData.landmarkNotes || ''}
              onChange={handleChange}
              placeholder="e.g. Near yellow post box, 2nd house with blue gate, please call 15 mins prior..."
              style={{
                width: '100%',
                padding: '0.75rem 0.9rem',
                borderRadius: '10px',
                border: '1.5px solid #cbd5e1',
                fontSize: '0.85rem',
                color: '#0f172a',
                outline: 'none',
                resize: 'vertical',
                boxSizing: 'border-box',
                backgroundColor: '#ffffff',
              }}
            />
          </div>
        </div>

        {/* Right Column: Appointment Summary Card */}
        <div
          style={{
            backgroundColor: '#ffffff',
            border: '1.5px solid #cbd5e1',
            borderRadius: '16px',
            padding: '1.5rem',
            boxShadow: '0 10px 30px rgba(0,86,179,0.06)',
            position: 'sticky',
            top: '1rem',
          }}
        >
          <h4
            style={{
              fontSize: '0.75rem',
              fontWeight: 800,
              color: '#0284c7',
              textTransform: 'uppercase',
              letterSpacing: '1px',
              margin: '0 0 1rem 0',
            }}
          >
            Installation &amp; Premises Summary
          </h4>

          {/* Package Details */}
          <div style={{ marginBottom: '1rem', paddingBottom: '1rem', borderBottom: '1px solid #f1f5f9' }}>
            <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>
              Selected Package
            </span>
            <div style={{ fontSize: '1.05rem', fontWeight: 900, color: '#0056b3', marginTop: '0.15rem' }}>
              {selectedProduct?.productName || 'SLT Fibre Broadband'}
            </div>
            <span style={{ fontSize: '0.8rem', color: '#16a34a', fontWeight: 700 }}>
              ⚡ High-Speed Fibre Connection
            </span>
          </div>

          {/* Booked Appointment Slot Preview */}
          <div
            style={{
              backgroundColor: '#f0f9ff',
              border: '1px solid #bae6fd',
              borderRadius: '12px',
              padding: '1rem',
              marginBottom: '1rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
              <FiCalendar size={16} color="#0284c7" />
              <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#0369a1', textTransform: 'uppercase' }}>
                Visit Date &amp; Window
              </span>
            </div>
            <div style={{ fontSize: '1rem', fontWeight: 900, color: '#0f172a' }}>
              {new Date(selectedDate).toLocaleDateString('en-LK', {
                weekday: 'short',
                year: 'numeric',
                month: 'short',
                day: 'numeric',
              })}
            </div>
            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0284c7', marginTop: '0.2rem' }}>
              {timeSlots.find((s) => s.id === selectedSlotId)?.fullLabel || 'Morning (08.30 AM - 12.00 PM)'}
            </div>
          </div>

          {/* Installation Premises Address */}
          <div style={{ marginBottom: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.25rem' }}>
              <FiMapPin size={15} color="#10b981" />
              <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 800, textTransform: 'uppercase' }}>
                Installation Premises
              </span>
            </div>
            <p style={{ margin: 0, fontSize: '0.88rem', fontWeight: 700, color: '#1e293b', lineHeight: 1.4 }}>
              {activeAddress}
            </p>
          </div>

          {/* Certified Technical Unit Badge */}
          <div
            style={{
              backgroundColor: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '10px',
              padding: '0.75rem 0.9rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}
          >
            <FiShield size={18} color="#0056b3" style={{ flexShrink: 0 }} />
            <div>
              <div style={{ fontSize: '0.78rem', fontWeight: 800, color: '#0f172a' }}>
                Certified SLT Technical Operations
              </div>
              <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600 }}>
                {opmcBranch} (Physical cabling, splicing, &amp; Wi-Fi testing)
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
