import React, { useState } from 'react';
import { DUMMY_APPOINTMENTS } from '../data/dummyData';

const SERVICE_LABELS = {
  'new-connection':    'New Connection',
  'reconnection':      'Reconnection',
  'termination':       'Termination',
  'package-migration': 'Package Migration',
  'ownership-change':  'Ownership Change',
  'location-change':   'Location Change',
  'refund-request':    'Refund Request',
};

export default function FieldTechnicianPage() {
  // Filter jobs for technician 'tech-01' (Nimal Rathnayake, who is our default mock tech)
  const [jobs, setJobs] = useState(() =>
    DUMMY_APPOINTMENTS.filter(apt => apt.technicianId === 'tech-01')
  );

  const handleUpdateStatus = (jobId, newStatus) => {
    setJobs(prev =>
      prev.map(job => (job.id === jobId ? { ...job, status: newStatus } : job))
    );
  };

  const getJobNumberClass = (status) => {
    if (status === 'completed') return 'completed';
    if (status === 'in-progress') return 'in-progress';
    return '';
  };

  return (
    <>
      <div className="admin-page-header">
        <h1 className="admin-page-title">My Daily Jobs</h1>
        <p className="admin-page-subtitle">
          Assigned field appointments and tasks for today
        </p>
      </div>

      <div className="tech-job-list">
        {jobs.length === 0 ? (
          <div className="admin-empty card">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
            </svg>
            <p>No jobs assigned to you for today.</p>
          </div>
        ) : (
          jobs.map((job, idx) => {
            const timeObj = new Date(job.scheduledAt);
            const timeStr = timeObj.toLocaleTimeString('en-US', {
              hour: '2-digit',
              minute: '2-digit',
            });

            return (
              <div className={`tech-job-card ${getJobNumberClass(job.status)}`} key={job.id}>
                {/* Index / Number circle indicator */}
                <div className="tech-job-number">
                  {job.status === 'completed' ? '✓' : idx + 1}
                </div>

                {/* Job Info Details */}
                <div className="tech-job-details">
                  <h4>{job.customer}</h4>
                  
                  <div className="tech-job-meta">
                    <span>
                      <strong>Time:</strong> {timeStr}
                    </span>
                    <span>
                      <strong>Ref:</strong> {job.referenceNumber}
                    </span>
                    <span>
                      <strong>Service:</strong> {SERVICE_LABELS[job.serviceType] || job.serviceType}
                    </span>
                  </div>

                  <p style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.5rem', fontSize: '0.85rem', color: 'var(--text)' }}>
                    📍 <strong>Address:</strong> {job.address}
                  </p>
                  <p style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.2rem', fontSize: '0.85rem', color: 'var(--text)' }}>
                    📱 <strong>Phone:</strong> {job.phone}
                  </p>
                  {job.notes && (
                    <p style={{ fontStyle: 'italic', fontSize: '0.8rem', marginTop: '0.4rem', color: 'var(--muted)', background: 'var(--paper)', padding: '0.4rem 0.75rem', borderRadius: '8px', borderLeft: '3px solid var(--blue)' }}>
                      <strong>Dispatch Note:</strong> "{job.notes}"
                    </p>
                  )}
                </div>

                {/* Job Action Button Column */}
                <div className="tech-job-actions">
                  <span className={`admin-badge ${job.status}`} style={{ marginBottom: '0.5rem' }}>
                    {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
                  </span>

                  {job.status === 'scheduled' && (
                    <button
                      className="admin-btn warning"
                      style={{ fontSize: '0.78rem', padding: '0.4rem 0.8rem', width: '110px' }}
                      onClick={() => handleUpdateStatus(job.id, 'in-progress')}
                    >
                      Start Job
                    </button>
                  )}

                  {job.status === 'in-progress' && (
                    <button
                      className="admin-btn success"
                      style={{ fontSize: '0.78rem', padding: '0.4rem 0.8rem', width: '110px' }}
                      onClick={() => handleUpdateStatus(job.id, 'completed')}
                    >
                      Complete
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </>
  );
}
