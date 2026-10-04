import React from 'react';

/**
 * LiveStatusBadge
 * Displays connection state (Active / Disconnected) with a live blinking pulsating indicator dot.
 */
export default function LiveStatusBadge({ status, size = 'md', showDotOnly = false }) {
  const normalized = String(status || '').trim().toLowerCase();
  const isDisconnected = normalized === 'disconnected' || normalized === 'suspended' || normalized === 'inactive' || normalized === 'deactivated';

  const dotClass = isDisconnected ? 'live-pulse-red' : 'live-pulse-green';
  const label = isDisconnected ? 'Disconnected' : 'Active';

  const dotColor = isDisconnected ? '#dc2626' : '#16a34a';
  const bgColor = isDisconnected ? '#fee2e2' : '#dcfce7';
  const textColor = isDisconnected ? '#991b1b' : '#15803d';
  const borderColor = isDisconnected ? '#fca5a5' : '#86efac';

  if (showDotOnly) {
    return (
      <span
        title={label}
        className={dotClass}
        style={{
          width: size === 'sm' ? '7px' : '9px',
          height: size === 'sm' ? '7px' : '9px',
          borderRadius: '50%',
          backgroundColor: dotColor,
          display: 'inline-block',
          flexShrink: 0,
        }}
      />
    );
  }

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: size === 'sm' ? '0.35rem' : '0.45rem',
        padding: size === 'sm' ? '0.15rem 0.5rem' : '0.25rem 0.65rem',
        borderRadius: '9999px',
        backgroundColor: bgColor,
        color: textColor,
        border: `1px solid ${borderColor}`,
        fontSize: size === 'sm' ? '0.72rem' : '0.78rem',
        fontWeight: 800,
        letterSpacing: '0.03em',
        textTransform: 'uppercase',
        whiteSpace: 'nowrap',
        lineHeight: 1.2,
      }}
    >
      <span
        className={dotClass}
        style={{
          width: size === 'sm' ? '6px' : '8px',
          height: size === 'sm' ? '6px' : '8px',
          borderRadius: '50%',
          backgroundColor: dotColor,
          display: 'inline-block',
          flexShrink: 0,
        }}
      />
      <span>{label}</span>
    </span>
  );
}
