import React, { useState } from 'react';
import {
  DUMMY_APPOINTMENTS,
  DUMMY_TECHNICIANS,
} from '../data/dummyData';

const SERVICE_LABELS = {
  'new-connection':    'New Connection',
  'reconnection':      'Reconnection',
  'termination':       'Termination',
  'package-migration': 'Package Migration',
  'ownership-change':  'Ownership Change',
  'location-change':   'Location Change',
  'refund-request':    'Refund Request',
};

export default function AppointmentsCalendarPage() {
  const [appointments, setAppointments] = useState(DUMMY_APPOINTMENTS);
  const [selectedDate, setSelectedDate] = useState('2026-07-20'); // Hardcoded demo anchor date matching dummyData

  const todaysAppointments = appointments.filter(apt =>
    apt.scheduledAt.startsWith(selectedDate)
  );

  const handleAssignTechnician = (aptId, techId) => {
    const tech = DUMMY_TECHNICIANS.find(t => t.id === techId);
    setAppointments(prev =>
      prev.map(apt => {
        if (apt.id === aptId) {
          return {
            ...apt,
            technicianId: techId || null,
            technicianName: tech ? tech.name : null,
          };
        }
        return apt;
      })
    );
  };

  const formatDateDisplay = (dateStr) => {
    const dateObj = new Date(dateStr);
    return dateObj.toLocaleDateString('en-GB', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const handleDateChange = (daysOffset) => {
    const current = new Date(selectedDate);
    current.setDate(current.getDate() + daysOffset);
    const newDateStr = current.toISOString().split('T')[0];
    setSelectedDate(newDateStr);
  };

  return (
    <>
      <div className="admin-page-header">
        <h1 className="admin-page-title">Appointments &amp; Dispatch</h1>
        <p className="admin-page-subtitle">
          Manage field service appointments and technician assignments
        </p>
      </div>

      {/* ── Calendar / Date Nav ── */}
      <div className="apt-calendar-header card" style={{ padding: '1rem 1.5rem', backgroundColor: 'var(--surface)', border: '1px solid var(--line)', marginBottom: '1.5rem' }}>
        <div className="apt-date-nav">
          <button
            className="admin-btn ghost"
            onClick={() => handleDateChange(-1)}
          >
            ◀ Previous Day
          </button>
          <div className="apt-date-label">
            {formatDateDisplay(selectedDate)}
          </div>
          <button
            className="admin-btn ghost"
            onClick={() => handleDateChange(1)}
          >
            Next Day ▶
          </button>
        </div>

        <button
          className="admin-btn ghost"
          onClick={() => setSelectedDate('2026-07-20')}
        >
          Today
        </button>
      </div>

      {/* ── Appointments List ── */}
      <div className="apt-list">
        {todaysAppointments.length === 0 ? (
          <div className="admin-empty card" style={{ padding: '3rem 1rem' }}>
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" />
            </svg>
            <p>No appointments scheduled for this day.</p>
          </div>
        ) : (
          todaysAppointments.map(apt => {
            const timeObj = new Date(apt.scheduledAt);
            const hour = timeObj.getHours().toString().padStart(2, '0');
            const min = timeObj.getMinutes().toString().padStart(2, '0');

            return (
              <div className="apt-card" key={apt.id}>
                {/* Time Indicator */}
                <div className="apt-time-block">
                  <span className="apt-time-hour">{hour}:{min}</span>
                  <span className="apt-time-min">HRS</span>
                </div>

                {/* Appointment Info */}
                <div className="apt-info">
                  <h4>{apt.customer}</h4>
                  <p style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.2rem' }}>
                    <span style={{ fontSize: '0.9rem' }}>📍</span> {apt.address}
                  </p>
                  <p style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.1rem' }}>
                    <span style={{ fontSize: '0.9rem' }}>📱</span> {apt.phone} | <span style={{ fontFamily: 'monospace' }}>{apt.referenceNumber}</span>
                  </p>
                  {apt.notes && (
                    <p style={{ fontStyle: 'italic', fontSize: '0.78rem', marginTop: '0.3rem', color: 'var(--muted)' }}>
                      Note: "{apt.notes}"
                    </p>
                  )}
                </div>

                {/* Service Type & Status Badge */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', alignItems: 'flex-start' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--blue)' }}>
                    {SERVICE_LABELS[apt.serviceType] || apt.serviceType}
                  </span>
                  <span className={`admin-badge ${apt.status}`}>
                    {apt.status.charAt(0).toUpperCase() + apt.status.slice(1)}
                  </span>
                </div>

                {/* Dispatch dropdown */}
                <div>
                  <label className="form-label" style={{ fontSize: '0.72rem', textTransform: 'uppercase', marginBottom: '0.2rem' }}>
                    Assign Technician
                  </label>
                  <select
                    className="apt-assign-select"
                    value={apt.technicianId || ''}
                    onChange={e => handleAssignTechnician(apt.id, e.target.value)}
                    aria-label={`Assign technician for ${apt.customer}`}
                  >
                    <option value="">-- Unassigned --</option>
                    {DUMMY_TECHNICIANS.map(tech => (
                      <option key={tech.id} value={tech.id}>
                        {tech.name} ({tech.zone})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            );
          })
        )}
      </div>
    </>
  );
}
