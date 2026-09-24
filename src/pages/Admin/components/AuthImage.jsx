import React, { useEffect, useState } from 'react';
import api from '../../../utils/api';
import { getAssetUrl } from '../utils/applicationUtils';

// Protected KYC files (/api/files/:id) need the admin Authorization header, which a
// plain <img src> can't send — so fetch them as a blob. Other URLs (data:, http, /uploads) load directly.
export default function AuthImage({ url, alt, style, className }) {
  const isProtected = typeof url === 'string' && url.startsWith('/api/files/');
  const [src, setSrc] = useState(isProtected ? '' : getAssetUrl(url));
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
    if (!isProtected) {
      setSrc(getAssetUrl(url));
      return undefined;
    }
    let objectUrl;
    let cancelled = false;
    setSrc('');
    api.get(url.replace(/^\/api/, ''), { responseType: 'blob' })
      .then((res) => {
        if (cancelled) return;
        objectUrl = URL.createObjectURL(res.data);
        setSrc(objectUrl);
      })
      .catch(() => !cancelled && setFailed(true));
    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [url, isProtected]);

  if (!url) return <div className="kyc-doc-missing" style={{ minHeight: 220 }}>{alt || 'No image'}</div>;
  if (failed) return <div className="kyc-doc-missing" style={{ minHeight: 220 }}>Could not load image</div>;
  if (!src) return <div className="kyc-doc-missing" style={{ minHeight: 220 }}>Loading…</div>;
  return (
    <img
      src={src}
      alt={alt}
      className={className}
      style={style}
      loading="lazy"
      onError={() => setFailed(true)}
    />
  );
}
