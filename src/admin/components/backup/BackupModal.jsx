import React, { useEffect } from 'react';

/**
 * Shared dialog shell for the Backup Dashboard, using the portal's existing
 * modal look (ax-modal). `busy` blocks closing while a request is in flight.
 */
export default function BackupModal({ title, eyebrow = 'Backups', subtitle, onClose, busy = false, wide = false, children, footer, titleId = 'bk-modal-title' }) {
  useEffect(() => {
    const onKey = (event) => {
      if (event.key === 'Escape' && !busy) onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [busy, onClose]);

  const close = () => {
    if (!busy) onClose();
  };

  return (
    <div className="admin-modal-overlay" onClick={close}>
      <div
        className={`admin-modal ax-modal bk-modal${wide ? ' bk-modal-wide' : ''}`}
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
      >
        <div className="ax-modal-head">
          <span className="ax-modal-head-deco" aria-hidden="true" />
          <div className="ax-modal-identity">
            <div>
              <span className="ax-modal-eyebrow">{eyebrow}</span>
              <h3 id={titleId}>{title}</h3>
              {subtitle && <div className="ax-modal-sub">{subtitle}</div>}
            </div>
          </div>
          <button type="button" className="ax-modal-close" onClick={close} aria-label="Close" disabled={busy}>×</button>
        </div>
        <div className="ax-modal-form">
          <div className="ax-modal-body">{children}</div>
          {footer && <div className="ax-modal-foot">{footer}</div>}
        </div>
      </div>
    </div>
  );
}
