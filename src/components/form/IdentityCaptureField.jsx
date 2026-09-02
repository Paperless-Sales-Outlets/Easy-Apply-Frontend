import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  FiCamera, FiRefreshCw, FiCheckCircle, FiAlertTriangle,
  FiUpload, FiX, FiUser, FiCreditCard, FiRepeat,
} from 'react-icons/fi';

/**
 * Capture an identity image either from the device camera or from a file.
 *
 * Two variants:
 *   'document' — NIC front/back. Rear camera by default, card-shaped guide.
 *   'face'     — headshot. Front camera by default, oval guide, plus live
 *                framing checks where the browser supports face detection.
 *
 * On phones and tablets with more than one camera a swap control is shown, so a
 * customer can use the rear camera for their NIC and the front one for their
 * photo without leaving the step.
 */

const ANALYSIS_INTERVAL = 350;

export default function IdentityCaptureField({
  label,
  variant = 'document',
  value = '',
  onChange,
  required = false,
  error = '',
  helpText = '',
  instructions = [],
}) {
  const isFace = variant === 'face';

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const analysisCanvasRef = useRef(null);
  const uploadInputRef = useRef(null);
  const streamRef = useRef(null);
  const detectorRef = useRef(null);
  const timerRef = useRef(null);

  const [cameraOn, setCameraOn] = useState(false);
  const [starting, setStarting] = useState(false);
  const [videoReady, setVideoReady] = useState(false);
  const [cameraError, setCameraError] = useState('');
  const [facingMode, setFacingMode] = useState(isFace ? 'user' : 'environment');
  const [canSwapCamera, setCanSwapCamera] = useState(false);
  const [guidance, setGuidance] = useState('');
  const [ready, setReady] = useState(!isFace);

  const stopCamera = useCallback(() => {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (videoRef.current) videoRef.current.srcObject = null;
    setCameraOn(false);
    setVideoReady(false);
    setReady(!isFace);
  }, [isFace]);

  useEffect(() => stopCamera, [stopCamera]);

  // Only offer the swap control when the device actually has more than one camera.
  useEffect(() => {
    if (!navigator.mediaDevices?.enumerateDevices) return;
    let alive = true;
    navigator.mediaDevices
      .enumerateDevices()
      .then((devices) => {
        if (!alive) return;
        setCanSwapCamera(devices.filter((d) => d.kind === 'videoinput').length > 1);
      })
      .catch(() => {});
    return () => { alive = false; };
  }, [cameraOn]);

  const measureBrightness = (ctx, w, h) => {
    const { data } = ctx.getImageData(0, 0, w, h);
    let total = 0;
    for (let i = 0; i < data.length; i += 64) {
      total += 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
    }
    return total / (data.length / 64);
  };

  const analyseFrame = useCallback(async () => {
    const video = videoRef.current;
    const canvas = analysisCanvasRef.current;
    if (!video || !canvas || video.readyState < 2 || !video.videoWidth) return;

    const w = 160;
    const h = Math.round((video.videoHeight / video.videoWidth) * w) || 120;
    canvas.width = w; canvas.height = h;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    ctx.drawImage(video, 0, 0, w, h);

    const brightness = measureBrightness(ctx, w, h);
    if (brightness < 55) { setGuidance('Too dark — move somewhere brighter'); setReady(false); return; }
    if (brightness > 215) { setGuidance('Too bright — reduce glare on the card'); setReady(false); return; }

    if (isFace && detectorRef.current) {
      try {
        const faces = await detectorRef.current.detect(video);
        if (!faces.length) { setGuidance('No face detected — look at the camera'); setReady(false); return; }
        if (faces.length > 1) { setGuidance('Only you should be in frame'); setReady(false); return; }
        const box = faces[0].boundingBox;
        const cx = (box.x + box.width / 2) / video.videoWidth;
        const cy = (box.y + box.height / 2) / video.videoHeight;
        const fh = box.height / video.videoHeight;
        if (Math.abs(cx - 0.5) > 0.13 || Math.abs(cy - 0.5) > 0.15) { setGuidance('Centre your face in the oval'); setReady(false); return; }
        if (fh < 0.35) { setGuidance('Move a little closer'); setReady(false); return; }
        if (fh > 0.85) { setGuidance('Move back slightly'); setReady(false); return; }
      } catch (err) { /* detector hiccup — don't block */ }
    }

    setGuidance(isFace ? 'Looking good — hold still and capture' : 'Fill the frame with your NIC, then capture');
    setReady(true);
  }, [isFace]);

  // Attach the stream only once the <video> is mounted — assigning it during
  // the same tick leaves the element with no source and a black frame.
  useEffect(() => {
    if (!cameraOn) return;
    const video = videoRef.current;
    const stream = streamRef.current;
    if (!video || !stream) return;

    let cancelled = false;
    video.srcObject = stream;

    const onReady = () => {
      if (cancelled || !video.videoWidth) return;
      setVideoReady(true);
      if (!timerRef.current) timerRef.current = setInterval(analyseFrame, ANALYSIS_INTERVAL);
    };

    video.addEventListener('loadedmetadata', onReady);
    video.addEventListener('playing', onReady);
    video.play().catch(() => {});
    if (video.readyState >= 2) onReady();

    return () => {
      cancelled = true;
      video.removeEventListener('loadedmetadata', onReady);
      video.removeEventListener('playing', onReady);
    };
  }, [cameraOn, analyseFrame]);

  const openCamera = async (mode = facingMode) => {
    setCameraError('');
    setStarting(true);
    try {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      }
      if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: mode }, width: { ideal: 1920 }, height: { ideal: 1080 } },
        audio: false,
      });
      streamRef.current = stream;

      if (isFace && !detectorRef.current && typeof window !== 'undefined' && 'FaceDetector' in window) {
        try {
          detectorRef.current = new window.FaceDetector({ fastMode: true, maxDetectedFaces: 3 });
        } catch (err) { detectorRef.current = null; }
      }

      setFacingMode(mode);
      setVideoReady(false);
      setCameraOn(true);
    } catch (err) {
      const denied = err?.name === 'NotAllowedError' || err?.name === 'SecurityError';
      setCameraError(
        denied
          ? 'Camera access was blocked. Allow camera permission, or upload a photo instead.'
          : 'No camera available on this device. Please upload a photo instead.'
      );
      stopCamera();
    } finally {
      setStarting(false);
    }
  };

  const swapCamera = () => openCamera(facingMode === 'user' ? 'environment' : 'user');

  const capturePhoto = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || !video.videoWidth) return;

    // A headshot is squared off; a document keeps the frame's own proportions
    // so the whole card is retained.
    let sx = 0, sy = 0, sw = video.videoWidth, sh = video.videoHeight;
    if (isFace) {
      const side = Math.min(video.videoWidth, video.videoHeight);
      sx = (video.videoWidth - side) / 2;
      sy = (video.videoHeight - side) / 2;
      sw = side; sh = side;
    }

    const maxW = isFace ? 640 : 1280;
    const scale = Math.min(1, maxW / sw);
    canvas.width = Math.round(sw * scale);
    canvas.height = Math.round(sh * scale);

    const ctx = canvas.getContext('2d');
    // The preview is mirrored for the front camera so it feels like a mirror;
    // the saved image must not be.
    ctx.drawImage(video, sx, sy, sw, sh, 0, 0, canvas.width, canvas.height);

    const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
    stopCamera();
    if (onChange) onChange(dataUrl);
  };

  const handleUpload = (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    if (!file.type.startsWith('image/')) { setCameraError('Please choose an image file (JPG or PNG).'); return; }
    if (file.size > 5 * 1024 * 1024) { setCameraError('Image is larger than 5MB. Please choose a smaller file.'); return; }
    setCameraError('');
    const reader = new FileReader();
    reader.onload = () => onChange && onChange(reader.result);
    reader.onerror = () => setCameraError('Could not read that file. Please try again.');
    reader.readAsDataURL(file);
  };

  const labelId = `${variant}-${(label || '').replace(/\W+/g, '-').toLowerCase()}`;
  const guidanceId = `${labelId}-guidance`;
  const mirrored = facingMode === 'user';

  return (
    <div className="form-group" role="group" aria-labelledby={labelId} style={{ marginBottom: '1.5rem' }}>
      <span className="form-label" id={labelId} style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
        {label}
        {required && <span style={{ color: 'var(--danger, #dc3545)' }} aria-hidden="true">*</span>}
        {required && <span className="sr-only">(required)</span>}
      </span>

      <div
        style={{
          border: `2px dashed ${error ? 'var(--danger, #dc3545)' : 'var(--border-color, #ccc)'}`,
          borderRadius: 'var(--radius-card, 16px)',
          padding: '1.25rem',
          backgroundColor: '#ffffff',
        }}
      >
        {value ? (
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '1.25rem' }}>
            <img
              src={value}
              alt={`${label} preview`}
              style={{
                width: isFace ? '140px' : '190px',
                height: isFace ? '140px' : '120px',
                objectFit: 'cover',
                borderRadius: 'var(--radius-control, 12px)',
                border: '2px solid #0f7a4d',
              }}
            />
            <div>
              <p style={{ margin: '0 0 0.5rem 0', fontWeight: 700, color: '#0f7a4d', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <FiCheckCircle aria-hidden="true" /> Captured
              </p>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => { onChange(''); openCamera(); }}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', padding: '0.4rem 0.8rem', fontSize: '0.82rem' }}>
                  <FiRefreshCw size={14} aria-hidden="true" /> Retake
                </button>
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => onChange('')}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', padding: '0.4rem 0.8rem', fontSize: '0.82rem', color: 'var(--danger, #dc3545)' }}>
                  <FiX size={14} aria-hidden="true" /> Remove
                </button>
              </div>
            </div>
          </div>
        ) : cameraOn ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.85rem' }}>
            <div
              style={{
                position: 'relative',
                width: '100%',
                maxWidth: isFace ? '340px' : '460px',
                aspectRatio: isFace ? '1 / 1' : '4 / 3',
                borderRadius: 'var(--radius-card, 16px)',
                overflow: 'hidden',
                backgroundColor: '#0f172a',
              }}
            >
              <video
                ref={videoRef}
                playsInline
                muted
                autoPlay
                aria-label={`Live camera preview for ${label}`}
                style={{ width: '100%', height: '100%', objectFit: 'cover', transform: mirrored ? 'scaleX(-1)' : 'none' }}
              />

              {!videoReady && (
                <div role="status" style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '0.85rem', backgroundColor: '#0f172a', color: '#fff', fontSize: '0.85rem', fontWeight: 600, zIndex: 2 }}>
                  <span className="face-capture-spinner" aria-hidden="true" />
                  Starting camera…
                </div>
              )}

              {/* Framing guide: an oval for a face, a card outline for a NIC */}
              <div
                aria-hidden="true"
                style={{
                  position: 'absolute',
                  top: '50%', left: '50%',
                  transform: 'translate(-50%, -50%)',
                  width: isFace ? '58%' : '86%',
                  height: isFace ? '74%' : '76%',
                  border: `3px solid ${ready ? '#22c55e' : '#f8fafc'}`,
                  borderRadius: isFace ? '50%' : 'var(--radius-control, 12px)',
                  boxShadow: '0 0 0 9999px rgba(15, 23, 42, 0.45)',
                  transition: 'border-color 0.2s ease',
                  opacity: videoReady ? 1 : 0,
                }}
              />

              <div
                id={guidanceId}
                role="status"
                aria-live="polite"
                style={{
                  position: 'absolute', bottom: '0.6rem', left: '0.6rem', right: '0.6rem',
                  textAlign: 'center', fontSize: '0.8rem', fontWeight: 700, color: '#fff',
                  backgroundColor: ready ? 'rgba(13, 110, 52, 0.95)' : 'rgba(15, 23, 42, 0.85)',
                  borderRadius: '9999px', padding: '0.35rem 0.75rem',
                  opacity: videoReady ? 1 : 0,
                }}
              >
                {guidance}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap', justifyContent: 'center' }}>
              <button type="button" className="btn btn-primary" onClick={capturePhoto}
                disabled={!ready || !videoReady} aria-describedby={guidanceId}
                style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', opacity: ready && videoReady ? 1 : 0.6 }}>
                <FiCamera size={16} aria-hidden="true" /> Capture
              </button>

              {canSwapCamera && (
                <button type="button" className="btn btn-secondary" onClick={swapCamera} disabled={starting}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <FiRepeat size={16} aria-hidden="true" />
                  {facingMode === 'user' ? 'Use back camera' : 'Use front camera'}
                </button>
              )}

              <button type="button" className="btn btn-secondary" onClick={stopCamera}
                style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <FiX size={16} aria-hidden="true" /> Cancel
              </button>
            </div>
          </div>
        ) : (
          <div style={{ textAlign: 'center' }}>
            <div style={{ width: '56px', height: '56px', borderRadius: 'var(--radius-control, 12px)', backgroundColor: '#eff6ff', color: '#0b4a91', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 0.75rem auto' }} aria-hidden="true">
              {isFace ? <FiUser size={26} /> : <FiCreditCard size={26} />}
            </div>

            {instructions.length > 0 && (
              <ul role="list" style={{ listStyle: 'none', padding: 0, margin: '0 auto 1rem auto', fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.7, maxWidth: '420px' }}>
                {instructions.map((line) => <li key={line}>{line}</li>)}
              </ul>
            )}

            <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap', justifyContent: 'center' }}>
              <button type="button" className="btn btn-primary" onClick={() => openCamera()} disabled={starting} aria-busy={starting}
                style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                {starting
                  ? <><span className="face-capture-spinner face-capture-spinner--sm" aria-hidden="true" /> Opening camera…</>
                  : <><FiCamera size={16} aria-hidden="true" /> Take Photo</>}
              </button>

              <button type="button" className="btn btn-secondary" onClick={() => uploadInputRef.current?.click()}
                style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <FiUpload size={16} aria-hidden="true" /> Upload
              </button>

              <input
                ref={uploadInputRef}
                type="file"
                accept="image/*"
                onChange={handleUpload}
                tabIndex={-1}
                aria-hidden="true"
                style={{ position: 'absolute', width: 1, height: 1, opacity: 0, pointerEvents: 'none' }}
              />
            </div>
          </div>
        )}

        {cameraError && (
          <p role="alert" style={{ marginTop: '0.85rem', marginBottom: 0, fontSize: '0.82rem', color: 'var(--danger, #dc3545)', display: 'flex', alignItems: 'center', gap: '0.35rem', justifyContent: 'center' }}>
            <FiAlertTriangle size={14} aria-hidden="true" /> {cameraError}
          </p>
        )}

        <canvas ref={canvasRef} style={{ display: 'none' }} />
        <canvas ref={analysisCanvasRef} style={{ display: 'none' }} />
      </div>

      {helpText && !error && (
        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.35rem' }}>{helpText}</div>
      )}
      <div role="alert" aria-live="assertive">
        {error && <div style={{ fontSize: '0.8rem', color: 'var(--danger, #dc3545)', marginTop: '0.35rem', fontWeight: 600 }}>{error}</div>}
      </div>
    </div>
  );
}
