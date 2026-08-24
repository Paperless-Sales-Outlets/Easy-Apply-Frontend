import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { getMyJobs, updateMyJobStatus } from '../services/adminService';

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

export default function FieldTechnicianPage() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    getMyJobs()
      .then(res => setJobs(res.appointments || []))
      .catch(err => setError(err.response?.data?.message || 'Failed to load jobs'))
      .finally(() => setLoading(false));
  }, []);

  const handleUpdateStatus = async (jobId, newStatus) => {
    try {
      await updateMyJobStatus(jobId, newStatus);
      setJobs(prev => prev.map(job => (job.id === jobId ? { ...job, status: newStatus } : job)));
      toast.success(`Job marked as ${newStatus}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update status');
    }
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
          Assigned field appointments and tasks
        </p>
      </div>

      {error && <div className="admin-error-banner">{error}</div>}

      <div className="tech-job-list">
        {loading ? (
          <div className="admin-loading">Loading jobs…</div>
        ) : jobs.length === 0 ? (
          <div className="admin-empty card" style={{ padding: '3rem 1rem' }}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--muted)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: '1rem' }}>
              <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
            </svg>
            <p>No jobs assigned to you.</p>
          </div>
        ) : (
          jobs.map((job, idx) => {
            const timeObj = new Date(job.scheduledAt);
            const timeStr = timeObj.toLocaleTimeString('en-US', {
              hour: '2-digit',
              minute: '2-digit',
            });
            const dateStr = timeObj.toLocaleDateString('en-GB', {
              day: 'numeric',
              month: 'short',
            });

            return (
              <div
                className={`tech-job-card ${getJobNumberClass(job.status)}`}
                key={job.id}
              >
                <div className="tech-job-number">
                  {job.status === 'completed' ? '✓' : idx + 1}
                </div>

                <div className="tech-job-details">
                  <h4>{job.customer || 'Unknown'}</h4>
                  <div className="tech-job-meta">
                    <span><strong>Time:</strong> {timeStr}</span>
                    <span><strong>Date:</strong> {dateStr}</span>
                    <span><strong>Ref:</strong> {job.referenceNumber}</span>
                    <span><strong>Service:</strong> {SERVICE_LABELS[job.serviceType] || job.serviceType}</span>
                  </div>
                  {job.address && (
                    <p style={{ fontSize: '0.82rem', color: 'var(--muted)', margin: '0.2rem 0' }}>{job.address}</p>
                  )}
                  {job.phone && (
                    <p style={{ fontSize: '0.82rem', color: 'var(--muted)', margin: '0.2rem 0' }}>{job.phone}</p>
                  )}
                  {job.notes && (
                    <p style={{ fontSize: '0.78rem', color: 'var(--muted)', margin: '0.3rem 0', fontStyle: 'italic' }}>
                      Dispatch Note: &ldquo;{job.notes}&rdquo;
                    </p>
                  )}
                </div>

                <div className="tech-job-actions">
                  <span style={{
                    display: 'inline-block',
                    padding: '0.2rem 0.65rem',
                    borderRadius: '100px',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    background: job.status === 'completed' ? 'rgba(87,181,49,0.14)' : job.status === 'in-progress' ? 'rgba(235,168,52,0.14)' : 'rgba(15,87,168,0.12)',
                    color: job.status === 'completed' ? 'var(--green-deep)' : job.status === 'in-progress' ? '#a06b00' : 'var(--blue)',
                    marginBottom: '0.5rem',
                  }}>
                    {job.status}
                  </span>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                    {job.status === 'scheduled' && (
                      <button className="admin-btn warning" style={{ fontSize: '0.78rem' }}
                        onClick={() => handleUpdateStatus(job.id, 'in-progress')}>
                        Start Job
                      </button>
                    )}
                    {job.status === 'in-progress' && (
                      <button className="admin-btn success" style={{ fontSize: '0.78rem' }}
                        onClick={() => handleUpdateStatus(job.id, 'completed')}>
                        Complete
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </>
  );
}
