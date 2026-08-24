import React, { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import {
  getAppointments,
  getTechnicians,
  assignTechnician,
} from '../services/adminService';

const SERVICE_LABELS = {
  'new-connection': 'New Connection',
  'reconnection': 'Reconnection',
  'relocation': 'Relocation',
  'termination': 'Termination',
  'transfer': 'Transfer',
  'package-migration': 'Package Migration',
  'service-vacation': 'Service Vacation',
  'refund-request': 'Refund Request',
  'customer-request-acceptance': 'Customer Request',
  'internet-services': 'Internet Services',
};

const STATUS_COLORS = {
  scheduled: 'var(--blue)',
  'in-progress': '#d97706',
  completed: 'var(--green)',
  cancelled: '#c4372c',
};

function toDateString(date) {
  return date.toISOString().split('T')[0];
}

function formatDateDisplay(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export default function AppointmentsCalendarPage() {
  const today = toDateString(new Date());
  const [selectedDate, setSelectedDate] = useState(today);
  const [appointments, setAppointments] = useState([]);
  const [technicians, setTechnicians] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchAppointments = useCallback(async (date) => {
    setLoading(true);
    setError('');
    try {
      const res = await getAppointments({ date });
      setAppointments(res.appointments || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load appointments');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAppointments(selectedDate);
  }, [selectedDate, fetchAppointments]);

  useEffect(() => {
    getTechnicians()
      .then(res => setTechnicians(res.technicians || []))
      .catch(() => {});
  }, []);

  const handleDateChange = (daysOffset) => {
    const current = new Date(selectedDate);
    current.setDate(current.getDate() + daysOffset);
    setSelectedDate(toDateString(current));
  };

  const handleAssignTechnician = async (aptId, techId) => {
    try {
      const res = await assignTechnician(aptId, techId || null);
      setAppointments(prev =>
        prev.map(apt =>
          apt.id === aptId
            ? { ...apt, technicianId: res.appointment.technicianId, technicianName: res.appointment.technicianName }
            : apt
        )
      );
      toast.success(techId ? 'Technician assigned' : 'Technician unassigned');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to assign technician');
    }
  };

  return (
    <>
      <div className="admin-page-header">
        <h1 className="admin-page-title">Appointments &amp; Dispatch</h1>
        <p className="admin-page-subtitle">
          Manage field service appointments and technician assignments
        </p>
      </div>

      {error && <div className="admin-error-banner">{error}</div>}

      {/* ── Date Navigation ── */}
      <div className="apt-calendar-header card" style={{ padding: '1rem 1.25rem', backgroundColor: 'var(--surface)', border: '1px solid var(--line)', marginBottom: '1.5rem' }}>
        <div className="apt-date-nav">
          <button className="admin-btn ghost" onClick={() => handleDateChange(-1)}>
            &larr; Prev
          </button>
          <div className="apt-date-label">
            {formatDateDisplay(selectedDate)}
          </div>
          <button className="admin-btn ghost" onClick={() => handleDateChange(1)}>
            Next &rarr;
          </button>
        </div>
        <button className="admin-btn ghost" onClick={() => setSelectedDate(today)}>
          Today
        </button>
      </div>

      {/* ── Appointments List ── */}
      {loading ? (
        <div className="admin-loading">Loading appointments…</div>
      ) : appointments.length === 0 ? (
        <div className="admin-empty card" style={{ padding: '3rem 1rem' }}>
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--muted)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: '1rem' }}>
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
          </svg>
          <p>No appointments scheduled for this day.</p>
        </div>
      ) : (
        <div className="apt-list">
          {appointments.map(apt => {
            const timeObj = new Date(apt.scheduledAt);
            const hour = timeObj.getHours().toString().padStart(2, '0');
            const min = timeObj.getMinutes().toString().padStart(2, '0');

            return (
              <div className="apt-card" key={apt.id}>
                {/* Time block */}
                <div className="apt-time-block">
                  <span className="apt-time-hour">{hour}:{min}</span>
                  <span className="apt-time-min">HRS</span>
                </div>

                {/* Info */}
                <div className="apt-info">
                  <h4>{apt.customer || 'Unknown'}</h4>
                  <p>{apt.address || 'No address'}</p>
                  <p>{apt.phone} &middot; {apt.referenceNumber}</p>
                  {apt.notes && (
                    <p style={{ marginTop: '0.3rem', fontStyle: 'italic', fontSize: '0.78rem' }}>
                      &ldquo;{apt.notes}&rdquo;
                    </p>
                  )}
                </div>

                {/* Service + Status */}
                <div className="apt-meta">
                  <span className="apt-service-name">
                    {SERVICE_LABELS[apt.serviceType] || apt.serviceType}
                  </span>
                  <span
                    className="apt-status-badge"
                    style={{
                      background: `${STATUS_COLORS[apt.status] || '#999'}18`,
                      color: STATUS_COLORS[apt.status] || '#999',
                    }}
                  >
                    {apt.status}
                  </span>
                </div>

                {/* Technician dropdown */}
                <div className="apt-tech">
                  <label className="apt-tech-label">Technician</label>
                  <select
                    className="apt-tech-select"
                    value={apt.technicianId || ''}
                    onChange={(e) => handleAssignTechnician(apt.id, e.target.value)}
                  >
                    <option value="">-- Unassigned --</option>
                    {technicians.map(tech => (
                      <option key={tech._id} value={tech._id}>
                        {tech.name}
                      </option>
                    ))}
                  </select>
                  {apt.technicianName && (
                    <div className="apt-tech-assigned">
                      Assigned: {apt.technicianName}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}
