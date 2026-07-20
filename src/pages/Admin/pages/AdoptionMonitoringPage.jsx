import React from 'react';
import { DUMMY_ANALYTICS } from '../data/dummyData';

export default function AdoptionMonitoringPage() {
  const {
    submissionRatio,
    conversionRate,
    completionRate,
    dropOffPoints,
    byServiceType,
    weeklyTrend,
  } = DUMMY_ANALYTICS;

  return (
    <>
      <div className="admin-page-header">
        <h1 className="admin-page-title">Adoption &amp; Analytics</h1>
        <p className="admin-page-subtitle">
          Digital vs walk-in submission ratio, funnel analysis, and drop-off points
        </p>
      </div>

      {/* ── Metric Summary Row ── */}
      <div className="admin-summary-grid">
        <div className="admin-stat-card">
          <div className="admin-stat-icon blue">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
          </div>
          <div>
            <div className="admin-stat-label">Digital Adoption Rate</div>
            <div className="admin-stat-value">{submissionRatio.digital}%</div>
            <div className="admin-stat-trend">+2.5% this week</div>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-icon green">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><path d="m9 11 3 3L22 4" />
            </svg>
          </div>
          <div>
            <div className="admin-stat-label">Conversion Rate</div>
            <div className="admin-stat-value">{conversionRate}%</div>
            <div className="admin-stat-trend">+1.2% this week</div>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-icon amber">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" />
            </svg>
          </div>
          <div>
            <div className="admin-stat-label">Completion Rate</div>
            <div className="admin-stat-value">{completionRate}%</div>
            <div className="admin-stat-trend">+0.8% this week</div>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-icon red">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
            </svg>
          </div>
          <div>
            <div className="admin-stat-label">Drop-off Volume</div>
            <div className="admin-stat-value">18%</div>
            <div className="admin-stat-trend down">-1.5% this week</div>
          </div>
        </div>
      </div>

      {/* ── Two-Column Charts Grid ── */}
      <div className="analytics-grid">
        
        {/* Column 1: Submission Ratio & Trends */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          
          {/* Submission Channels */}
          <div className="analytics-card">
            <h3>Submission Channel Ratio</h3>
            <div className="ratio-bar-wrap">
              <div className="ratio-bar-digital" style={{ width: `${submissionRatio.digital}%` }}>
                {submissionRatio.digital}%
              </div>
              <div className="ratio-bar-walkin" style={{ width: `${submissionRatio.walkIn}%` }}>
                {submissionRatio.walkIn}%
              </div>
            </div>
            
            <div className="ratio-legend">
              <div className="ratio-legend-item">
                <span className="ratio-legend-dot" style={{ backgroundColor: 'var(--blue)' }} />
                <span>Digital (Online): <strong>{submissionRatio.digital}%</strong></span>
              </div>
              <div className="ratio-legend-item">
                <span className="ratio-legend-dot" style={{ backgroundColor: 'rgba(15,87,168,0.25)' }} />
                <span>Walk-in (Counter): <strong>{submissionRatio.walkIn}%</strong></span>
              </div>
            </div>
          </div>

          {/* Weekly Submission Trend */}
          <div className="analytics-card">
            <h3>Weekly Submission Trend (Count)</h3>
            <div className="bar-chart-wrap">
              {weeklyTrend.map(t => {
                const total = t.digital + t.walkIn;
                const digHeight = (t.digital / 65) * 100;
                const walkHeight = (t.walkIn / 65) * 100;

                return (
                  <div className="bar-chart-col" key={t.day}>
                    <div style={{ display: 'flex', width: '100%', gap: '3px', alignItems: 'flex-end', height: '100%' }}>
                      <div
                        className="bar-chart-bar"
                        style={{ height: `${digHeight}%`, title: `Digital: ${t.digital}` }}
                      />
                      <div
                        className="bar-chart-bar alt"
                        style={{ height: `${walkHeight}%`, title: `Walk-in: ${t.walkIn}` }}
                      />
                    </div>
                    <span className="bar-chart-label">{t.day}</span>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

        {/* Column 2: Drop-offs & Service Breakdown */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

          {/* Funnel Drop-off Points */}
          <div className="analytics-card">
            <h3>Drop-off Points (Abandonment Rate)</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--muted)', marginBottom: '1rem' }}>
              Where online customers tend to close the submission wizard
            </p>
            <div className="drop-off-list">
              {dropOffPoints.map(point => {
                const maxDrop = Math.max(...dropOffPoints.map(p => p.dropOff));
                const barWidth = (point.dropOff / maxDrop) * 100;

                return (
                  <div className="drop-off-item" key={point.step}>
                    <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                      <span style={{ fontWeight: 600 }}>{point.step}</span>
                      <div className="drop-off-bar-bg">
                        <div className="drop-off-bar" style={{ width: `${barWidth}%` }} />
                      </div>
                    </div>
                    <span className="drop-off-pct">{point.dropOff}%</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Applications by Service Type */}
          <div className="analytics-card">
            <h3>Applications by Service Type</h3>
            <div className="service-bar-list">
              {byServiceType.map(item => {
                const maxCount = Math.max(...byServiceType.map(s => s.count));
                const fillWidth = (item.count / maxCount) * 100;

                return (
                  <div className="service-bar-item" key={item.service}>
                    <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                      <span style={{ fontWeight: 600 }}>{item.service}</span>
                      <div className="service-bar-bg">
                        <div className="service-bar-fill" style={{ width: `${fillWidth}%` }} />
                      </div>
                    </div>
                    <span className="service-bar-count">{item.count}</span>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

      </div>
    </>
  );
}
