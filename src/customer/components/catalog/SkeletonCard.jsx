import React from 'react';

/** Loading placeholder shaped like a ProductCard. */
export default function SkeletonCard() {
  return (
    <div
      style={{
        backgroundColor: 'var(--paper)',
        borderRadius: 'var(--radius-lg)',
        overflow: 'hidden',
        border: '1px solid var(--grey-200)',
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
      <div style={{ backgroundColor: '#c3ccd9', height: '180px', width: '100%' }} />
      <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', flex: 1, justifyContent: 'space-between' }}>
        <div style={{ backgroundColor: '#dfe5ee', height: '24px', width: '70%', borderRadius: 'var(--radius)' }} />
        <div style={{ backgroundColor: '#dfe5ee', height: '16px', width: '40%', borderRadius: 'var(--radius)' }} />
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <div style={{ backgroundColor: '#dfe5ee', height: '36px', flex: 1, borderRadius: 'var(--radius)' }} />
          <div style={{ backgroundColor: '#dfe5ee', height: '36px', flex: 1, borderRadius: 'var(--radius)' }} />
        </div>
      </div>
    </div>
  );
}
