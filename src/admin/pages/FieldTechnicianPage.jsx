import React, { useState, useEffect, useMemo } from 'react';
import { getMyJobs, updateMyJobStatus } from '../services/adminService';
import AdminNotice, { useAdminNotice } from '../components/AdminNotice';
import { AnimatedNumber } from '../components/AdminVisuals';
import { SERVICE_LABELS, splitTimeSlot } from '../utils/applicationUtils';

const STATUS_META = {
  scheduled: { label: 'Scheduled', tone: 'info' },
  'in-progress': { label: 'In progress', tone: 'warn' },
  completed: { label: 'Completed', tone: 'good' },
  cancelled: { label: 'Cancelled', tone: 'bad' },
};

const VIEWS = [
  { key: 'open', label: 'To do', match: (j) => j.status === 'scheduled' || j.status === 'in-progress' },
  { key: 'completed', label: 'Completed', match: (j) => j.status === 'completed' },
  { key: 'all', label: 'All jobs', match: () => true },
];

const dayKey = (value) => {
  const d = new Date(value);
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
};

// 'Today', 'Tomorrow', 'Yesterday' or the date, for a group heading.
function dayHeading(value) {
  const d = new Date(value);
  const start = (x) => new Date(x.getFullYear(), x.getMonth(), x.getDate()).getTime();
  const diff = Math.round((start(d) - start(new Date())) / 86400000);
  const date = d.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' });
  if (diff === 0) return { label: 'Today', date };
  if (diff === 1) return { label: 'Tomorrow', date };
  if (diff === -1) return { label: 'Yesterday', date };
  return { label: d.toLocaleDateString('en-GB', { weekday: 'long' }), date: d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) };
}

const ICONS = {
  wrench: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
    </svg>
  ),
  calendar: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" />
    </svg>
  ),
  play: <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M7 4.5v15a1 1 0 0 0 1.5.86l12.5-7.5a1 1 0 0 0 0-1.72L8.5 3.64A1 1 0 0 0 7 4.5z" /></svg>,
  check: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>,
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
};

/** A field technician's assigned installation jobs, grouped by day. */
export default function FieldTechnicianPage() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [view, setView] = useState('open');
  const [busyId, setBusyId] = useState(null);
  const notice = useAdminNotice();

  useEffect(() => {
    setLoading(true);
    getMyJobs()
      .then(res => setJobs(res.appointments || []))
      .catch(err => setError(err.response?.data?.message || 'Failed to load jobs'))
      .finally(() => setLoading(false));
  }, []);

  const handleUpdateStatus = async (jobId, newStatus) => {
    setBusyId(jobId);
    try {
      await updateMyJobStatus(jobId, newStatus);
      setJobs(prev => prev.map(job => (job.id === jobId ? { ...job, status: newStatus } : job)));
      notice.success(newStatus === 'completed' ? 'Job completed. Nice work.' : 'Job started.');
    } catch (err) {
      notice.error(err.response?.data?.message || 'Failed to update status');
    } finally {
      setBusyId(null);
    }
  };

  const todayKey = dayKey(new Date());
  const counts = useMemo(() => ({
    today: jobs.filter((j) => dayKey(j.scheduledAt) === todayKey && j.status !== 'cancelled').length,
    scheduled: jobs.filter((j) => j.status === 'scheduled').length,
    inProgress: jobs.filter((j) => j.status === 'in-progress').length,
    completed: jobs.filter((j) => j.status === 'completed').length,
  }), [jobs, todayKey]);

  const viewCounts = Object.fromEntries(VIEWS.map((v) => [v.key, jobs.filter(v.match).length]));
  const viewIndex = VIEWS.findIndex((v) => v.key === view);

  // Jobs in the chosen view, grouped by day (oldest day first; completed newest first).
  const groups = useMemo(() => {
    const match = VIEWS.find((v) => v.key === view).match;
    const list = jobs.filter(match).sort((a, b) => new Date(a.scheduledAt) - new Date(b.scheduledAt));
    if (view === 'completed') list.reverse();
    const out = [];
    list.forEach((job) => {
      const key = dayKey(job.scheduledAt);
      const last = out[out.length - 1];
      if (last && last.key === key) last.jobs.push(job);
      else out.push({ key, heading: dayHeading(job.scheduledAt), jobs: [job] });
    });
    return out;
  }, [jobs, view]);

  const tiles = [
    { key: 'today', cls: 'total', icon: ICONS.calendar, label: 'Today', value: counts.today, foot: counts.today ? 'Jobs booked for today' : 'Nothing booked today' },
    { key: 'scheduled', cls: 'roles', icon: ICONS.wrench, label: 'Scheduled', value: counts.scheduled, foot: 'Waiting to start' },
    { key: 'progress', cls: 'collected', icon: ICONS.play, label: 'In progress', value: counts.inProgress, foot: counts.inProgress ? 'Finish these first' : 'None on the go' },
    { key: 'done', cls: 'active', icon: ICONS.done, label: 'Completed', value: counts.completed, foot: 'All time' },
  ];

  let cardIndex = 0;

  return (
    <div className="um-page tjx-page">
      {/* ── Hero ── */}
      <section className="um-hero">
        <div className="um-hero-deco" aria-hidden="true">
          <span className="um-hero-orb" />
          <span className="um-hero-slash" />
          <span className="um-hero-grid" />
        </div>
        <div className="um-hero-top">
          <div className="um-hero-text">
            <span className="um-hero-eyebrow">{ICONS.wrench} Field Service</span>
            <h1>My Daily Jobs</h1>
            <p>The installations assigned to you. Start a job when you arrive and complete it when the customer is connected.</p>
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
      <AdminNotice notice={notice.notice} onDismiss={notice.dismiss} />

      {/* ── View tabs ── */}
      <div className="um-tabs" role="tablist" style={{ '--tab-index': viewIndex, '--tab-count': VIEWS.length }}>
        <span className="um-tabs-indicator" aria-hidden="true" />
        {VIEWS.map((v) => (
          <button
            key={v.key}
            type="button"
            role="tab"
            aria-selected={view === v.key}
            className={`um-tab${view === v.key ? ' active' : ''}`}
            onClick={() => setView(v.key)}
          >
            <span className="um-tab-label">{v.label}</span>
            <span className="um-tab-count">{viewCounts[v.key]}</span>
          </button>
        ))}
      </div>

      {/* ── Jobs ── */}
      {loading ? (
        <div className="tech-job-list">
          {Array.from({ length: 3 }).map((_, i) => <div className="dash-skeleton apx-card-skeleton" key={i} />)}
        </div>
      ) : groups.length === 0 ? (
        <section className="um-panel">
          <div className="um-empty-state">
            <span className="um-empty-icon">{ICONS.wrench}</span>
            <h3>{jobs.length === 0 ? 'No jobs assigned to you' : view === 'open' ? 'All caught up' : 'Nothing here yet'}</h3>
            <p>
              {jobs.length === 0
                ? 'When an administrator assigns you an installation, it will appear here.'
                : view === 'open' ? 'Every job assigned to you is finished.' : 'Completed jobs will be listed here.'}
            </p>
          </div>
        </section>
      ) : (
        <div className="tjx-groups">
          {groups.map((group) => (
            <section className="tjx-group" key={group.key}>
              <h2 className="tjx-day">
                <span>{group.heading.label}</span>
                <small>{group.heading.date}</small>
                <em>{group.jobs.length} {group.jobs.length === 1 ? 'job' : 'jobs'}</em>
              </h2>
              <div className="tech-job-list">
                {group.jobs.map((job) => {
                  const slot = splitTimeSlot(job.timeSlot);
                  const time = slot
                    ? [slot.name, slot.range].filter(Boolean).join(' · ')
                    : new Date(job.scheduledAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
                  const meta = STATUS_META[job.status] || { label: job.status, tone: 'info' };
                  const busy = busyId === job.id;
                  const idx = cardIndex++;
                  return (
                    <article className={`tjx-card is-${meta.tone}`} key={job.id} style={{ '--i': idx }}>
                      <div className="tjx-slot">
                        <span className="tjx-slot-icon" aria-hidden="true">{job.status === 'completed' ? ICONS.check : ICONS.wrench}</span>
                        <div>
                          <strong>{slot?.name || time}</strong>
                          {slot?.range && <small>{slot.range}</small>}
                        </div>
                      </div>

                      <div className="tjx-body">
                        <div className="tjx-title">
                          <h3>{job.customer || 'Unknown customer'}</h3>
                          <span className={`ax-chip ax-chip--${meta.tone}`}>{meta.label}</span>
                        </div>
                        <div className="tjx-facts">
                          {job.address && <span className="apx-line">{ICONS.pin}<span>{job.address}</span></span>}
                          {job.phone && (
                            <a className="apx-line tjx-phone" href={`tel:${job.phone}`}>{ICONS.phone}<span>{job.phone}</span></a>
                          )}
                        </div>
                        <div className="tjx-tags">
                          <span className="apt-service-name">{SERVICE_LABELS[job.serviceType] || job.serviceType}</span>
                          <span className="apx-ref">{job.referenceNumber}</span>
                        </div>
                        {job.notes && <p className="apx-note">Dispatch note: &ldquo;{job.notes}&rdquo;</p>}
                      </div>

                      <div className="tjx-actions">
                        {job.status === 'scheduled' && (
                          <button type="button" className="tjx-btn start" onClick={() => handleUpdateStatus(job.id, 'in-progress')} disabled={busy} aria-busy={busy}>
                            {ICONS.play}{busy ? 'Starting…' : 'Start Job'}
                          </button>
                        )}
                        {job.status === 'in-progress' && (
                          <button type="button" className="tjx-btn complete" onClick={() => handleUpdateStatus(job.id, 'completed')} disabled={busy} aria-busy={busy}>
                            {ICONS.check}{busy ? 'Saving…' : 'Complete'}
                          </button>
                        )}
                        {job.status === 'completed' && <span className="tjx-done">{ICONS.check} Done</span>}
                      </div>
                    </article>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
