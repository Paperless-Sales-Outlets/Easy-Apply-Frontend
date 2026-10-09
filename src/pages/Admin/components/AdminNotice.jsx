import React, { useCallback, useEffect, useRef, useState } from 'react';

// Inline, in-page notification — deliberately not a floating/auto-popping
// toast. It renders as part of the page flow (call site decides where) and
// clears itself after a few seconds, or immediately on manual dismiss.
export function useAdminNotice(autoDismissMs = 4500) {
  const [notice, setNotice] = useState(null);
  const timerRef = useRef(null);

  const clear = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setNotice(null);
  }, []);

  const notify = useCallback((type, message) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setNotice({ type, message, id: Date.now() });
    if (autoDismissMs) {
      timerRef.current = setTimeout(() => setNotice(null), autoDismissMs);
    }
  }, [autoDismissMs]);

  useEffect(() => () => { if (timerRef.current) clearTimeout(timerRef.current); }, []);

  return {
    notice,
    success: (message) => notify('success', message),
    error: (message) => notify('error', message),
    info: (message) => notify('info', message),
    dismiss: clear,
  };
}

const ICONS = {
  success: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  ),
  error: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  ),
  info: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" />
    </svg>
  ),
};

export default function AdminNotice({ notice, onDismiss }) {
  if (!notice) return null;
  return (
    <div className={`admin-notice admin-notice-${notice.type}`} role="status">
      <span className="admin-notice-icon">{ICONS[notice.type] || ICONS.info}</span>
      <span className="admin-notice-text">{notice.message}</span>
      <button type="button" className="admin-notice-close" onClick={onDismiss} aria-label="Dismiss">×</button>
    </div>
  );
}
