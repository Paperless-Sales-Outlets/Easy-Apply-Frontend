import React from 'react';

export default function SkeletonCard() {
  return (
    <div
      style={{
        backgroundColor: '#ffffff',
        borderRadius: '16px',
        overflow: 'hidden',
        border: '1px solid #e2e8f0',
        display: 'flex',
        flexDirection: 'column',
        height: '320px',
        animation: 'pulse 1.5s infinite ease-in-out',
      }}
    >
      <style>{`
        @keyframes pulse {
          0% { opacity: 0.6; }
          50% { opacity: 1; }
          100% { opacity: 0.6; }
        }
      `}</style>
      <div style={{ backgroundColor: '#cbd5e1', height: '180px', width: '100%' }} />
      <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', flex: 1, justifyContent: 'space-between' }}>
        <div style={{ backgroundColor: '#e2e8f0', height: '24px', width: '70%', borderRadius: '4px' }} />
        <div style={{ backgroundColor: '#e2e8f0', height: '16px', width: '40%', borderRadius: '4px' }} />
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <div style={{ backgroundColor: '#e2e8f0', height: '36px', flex: 1, borderRadius: '8px' }} />
          <div style={{ backgroundColor: '#e2e8f0', height: '36px', flex: 1, borderRadius: '8px' }} />
        </div>
      </div>
    </div>
  );
}
