import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  getAppointments,
  getTechnicians,
  assignTechnician,
} from '../services/adminService';
import AdminNotice, { useAdminNotice } from '../components/AdminNotice';
import { AnimatedNumber } from '../components/AdminVisuals';
import { SERVICE_LABELS, splitTimeSlot } from '../utils/applicationUtils';

const STATUS_META = {
  scheduled: { label: 'Scheduled', tone: 'info' },
  'in-progress': { label: 'In progress', tone: 'warn' },
  completed: { label: 'Completed', tone: 'good' },
  cancelled: { label: 'Cancelled', tone: 'bad' },
};
const isFinished = (status) => status === 'completed' || status === 'cancelled';

// A 'YYYY-MM-DD' day in the browser's own timezone.
function toDateString(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

// Read a 'YYYY-MM-DD' day as local midnight, so moving a day never slips across a timezone.
const fromDateString = (day) => {
  const [y, m, d] = day.split('-').map(Number);
  return new Date(y, m - 1, d);
};

const ICONS = {
  calendar: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" />
    </svg>
  ),
  user: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /><path d="m17 3 4 4M21 3l-4 4" />
    </svg>
  ),
  progress: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
    </svg>
  ),
  done: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  ),
  pin: (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
    </svg>
  ),
  phone: (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  ),
  chevronLeft: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>,
  chevronRight: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6" /></svg>,
};

/** Calendar of customer installation appointments, and who is sent to each. */
export default function AppointmentsCalendarPage() {
  const today = toDateString(new Date());
  const [selectedDate, setSelectedDate] = useState(today);
  const [appointments, setAppointments] = useState([]);
  const [technicians, setTechnicians] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const notice = useAdminNotice();

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

  // 'loading' | 'ready' | 'failed' — an empty dropdown alone can't say which.
  const [techLoad, setTechLoad] = useState('loading');
  const [techAttempt, setTechAttempt] = useState(0);

  useEffect(() => {
    setTechLoad('loading');
    getTechnicians()
      .then(res => { setTechnicians(res.technicians || []); setTechLoad('ready'); })
      .catch(() => setTechLoad('failed'));
  }, [techAttempt]);

  const handleDateChange = (daysOffset) => {
    const current = fromDateString(selectedDate);
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
      notice.success(techId ? 'Technician assigned.' : 'Technician unassigned.');
    } catch (err) {
      notice.error(err.response?.data?.message || 'Failed to assign technician');
    }
  };

  // The selected day at a glance.
  const counts = useMemo(() => ({
    total: appointments.length,
    unassigned: appointments.filter((a) => !a.technicianId && !isFinished(a.status)).length,
    inProgress: appointments.filter((a) => a.status === 'in-progress').length,
    completed: appointments.filter((a) => a.status === 'completed').length,
  }), [appointments]);

  const dayDate = fromDateString(selectedDate);
  const isToday = selectedDate === today;
  const dayLabel = dayDate.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  const relative = (() => {
    const diff = Math.round((dayDate - fromDateString(today)) / 86400000);
    if (diff === 0) return 'Today';
    if (diff === 1) return 'Tomorrow';
    if (diff === -1) return 'Yesterday';
    return diff > 0 ? `In ${diff} days` : `${-diff} days ago`;
  })();

  const tiles = [
    { key: 'total', cls: 'total', icon: ICONS.calendar, label: 'Booked', value: counts.total, foot: isToday ? 'Installations today' : `Installations on ${dayDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}` },
    { key: 'unassigned', cls: 'collected', icon: ICONS.user, label: 'Unassigned', value: counts.unassigned, foot: counts.unassigned ? 'Need a technician' : 'Everyone is covered' },
    { key: 'progress', cls: 'status', icon: ICONS.progress, label: 'In progress', value: counts.inProgress, foot: 'Technician on site' },
    { key: 'done', cls: 'active', icon: ICONS.done, label: 'Completed', value: counts.completed, foot: counts.total ? `${Math.round((counts.completed / counts.total) * 100)}% of the day` : 'Nothing booked' },
  ];

  return (
    <div className="um-page apx-page">
      {/* ── Hero ── */}
      <section className="um-hero">
        <div className="um-hero-deco" aria-hidden="true">
          <span className="um-hero-orb" />
          <span className="um-hero-slash" />
          <span className="um-hero-grid" />
        </div>
        <div className="um-hero-top">
          <div className="um-hero-text">
            <span className="um-hero-eyebrow">{ICONS.calendar} Field Service</span>
            <h1>Appointments &amp; Dispatch</h1>
            <p>Installations customers have booked, and the technician sent to each one.</p>
          </div>
        </div>
        <div className="um-hero-tiles">
          {tiles.map((tile, idx) => (
            <div className={`um-hero-tile ${tile.cls}`} key={tile.key} style={{ '--i': idx }}>
              <div className="um-hero-tile-head">
                <span className="um-hero-tile-icon">{tile.icon}</span>
                {tile.label}
              </div>
              <div className="um-hero-tile-value">
                {loading ? <span className="dash-skeleton um-hero-skeleton" /> : <AnimatedNumber value={tile.value} />}
              </div>
              <div className="um-hero-tile-foot">{loading ? ' ' : tile.foot}</div>
            </div>
          ))}
        </div>
      </section>

      {error && <div className="admin-error-banner">{error}</div>}
      {techLoad === 'failed' && (
        <div className="admin-error-banner apt-tech-banner" role="alert">
          <span>Could not load the technician list, so jobs can't be assigned right now.</span>
          <button type="button" className="admin-btn ghost" onClick={() => setTechAttempt((n) => n + 1)}>Retry</button>
        </div>
      )}
      {techLoad === 'ready' && technicians.length === 0 && (
        <div className="admin-notice admin-notice-info apt-tech-banner" role="status">
          <span className="admin-notice-text">
            No technicians yet. Give a role the My Jobs privilege in User Management, then assign that role to staff.
          </span>
        </div>
      )}
      <AdminNotice notice={notice.notice} onDismiss={notice.dismiss} />

      {/* ── Day picker ── */}
      <section className="um-panel apx-daybar">
        <button type="button" className="apx-nav-btn" onClick={() => handleDateChange(-1)} aria-label="Previous day">{ICONS.chevronLeft}</button>
        <div className="apx-day" aria-live="polite">
          <span className="apx-day-relative">{relative}</span>
          <strong>{dayLabel}</strong>
        </div>
        <button type="button" className="apx-nav-btn" onClick={() => handleDateChange(1)} aria-label="Next day">{ICONS.chevronRight}</button>
        <div className="apx-day-tools">
          <input
            type="date"
            className="admin-select apx-date-input"
            value={selectedDate}
            onChange={(e) => e.target.value && setSelectedDate(e.target.value)}
            aria-label="Go to a date"
          />
          <button type="button" className="admin-btn ghost" onClick={() => setSelectedDate(today)} disabled={isToday}>Today</button>
        </div>
      </section>

      {/* ── Appointments ── */}
      {loading ? (
        <div className="apt-list">
          {Array.from({ length: 3 }).map((_, i) => <div className="dash-skeleton apx-card-skeleton" key={i} />)}
        </div>
      ) : appointments.length === 0 ? (
        <section className="um-panel">
          <div className="um-empty-state">
            <span className="um-empty-icon">{ICONS.calendar}</span>
            <h3>No installations booked</h3>
            <p>Nothing is scheduled for {isToday ? 'today' : 'this day'}. Use the arrows or pick a date to see other days.</p>
          </div>
        </section>
      ) : (
        <div className="apt-list">
          {appointments.map((apt, idx) => {
            const timeObj = new Date(apt.scheduledAt);
            const hour = timeObj.getHours().toString().padStart(2, '0');
            const min = timeObj.getMinutes().toString().padStart(2, '0');
            // The customer books a slot; the stored time is only the day.
            const slot = splitTimeSlot(apt.timeSlot);
            const meta = STATUS_META[apt.status] || { label: apt.status, tone: 'info' };
            const finished = isFinished(apt.status);

            return (
              <div className={`apt-card apx-card is-${meta.tone}`} key={apt.id} style={{ '--i': idx }}>
                {slot ? (
                  <div className="apt-time-block is-slot" title={apt.timeSlot}>
                    <span className="apt-time-hour">{slot.name}</span>
                    {slot.range && <span className="apt-time-min">{slot.range}</span>}
                  </div>
                ) : (
                  <div className="apt-time-block">
                    <span className="apt-time-hour">{hour}:{min}</span>
                    <span className="apt-time-min">HRS</span>
                  </div>
                )}

                <div className="apt-info">
                  <h4>{apt.customer || 'Unknown customer'}</h4>
                  <p className="apx-line">{ICONS.pin}<span>{apt.address || 'No address'}</span></p>
                  <p className="apx-line">{ICONS.phone}<span>{apt.phone || 'No phone'}</span><span className="apx-ref">{apt.referenceNumber}</span></p>
                  {apt.notes && <p className="apx-note">&ldquo;{apt.notes}&rdquo;</p>}
                </div>

                <div className="apt-meta">
                  <span className="apt-service-name">{SERVICE_LABELS[apt.serviceType] || apt.serviceType}</span>
                  <span className={`ax-chip ax-chip--${meta.tone}`}>{meta.label}</span>
                </div>

                <div className="apt-tech">
                  <label className="apt-tech-label" htmlFor={`apt-tech-${apt.id}`}>Technician</label>
                  <select
                    id={`apt-tech-${apt.id}`}
                    className="apt-tech-select"
                    value={apt.technicianId || ''}
                    onChange={(e) => handleAssignTechnician(apt.id, e.target.value)}
                    disabled={techLoad !== 'ready' || finished}
                    title={finished ? `This job is ${apt.status}, so its technician can't be changed.` : undefined}
                  >
                    <option value="">
                      {techLoad === 'loading' ? 'Loading technicians…' : techLoad === 'failed' ? 'Technicians unavailable' : '-- Unassigned --'}
                    </option>
                    {technicians.map(tech => (
                      <option key={tech._id} value={tech._id}>{tech.name}</option>
                    ))}
                  </select>
                  {apt.technicianName
                    ? <div className="apt-tech-assigned">Assigned: {apt.technicianName}</div>
                    : !finished && <div className="apx-unassigned">Needs a technician</div>}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
