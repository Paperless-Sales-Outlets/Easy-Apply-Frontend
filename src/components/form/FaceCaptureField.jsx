import React, { useCallback, useEffect, useRef, useState } from 'react';
import { FiCamera, FiRefreshCw, FiCheckCircle, FiAlertTriangle, FiUpload, FiX, FiUser } from 'react-icons/fi';

/**
 * FaceCaptureField — live headshot capture for KYC.
 *
 * Opens the front camera, guides the customer to centre their face inside an
 * oval, and only unlocks the shutter once the frame passes the usual checks
 * (a single face, centred, close enough, and well lit). Where the browser has
 * no native face detection we fall back to lighting checks plus the on-screen
 * guide. A plain photo upload is always available so a customer on a device
 * without a camera is never stuck.
 *
 * Emits a square JPEG base64 Data URL via onChange.
 */

const OUTPUT_SIZE = 640;      // final square photo, in px
const ANALYSIS_INTERVAL = 350; // ms between live frame checks

export default function FaceCaptureField({
  label = 'Face Photo (Headshot)',
  required = false,
  value = '',
  onChange,
  error = '',
  helpText = 'We use this photo to confirm your identity against your NIC.',
}) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const analysisCanvasRef = useRef(null);
  const streamRef = useRef(null);
  const detectorRef = useRef(null);
  const timerRef = useRef(null);

  const [cameraOn, setCameraOn] = useState(false);
  const [starting, setStarting] = useState(false);
  const [cameraError, setCameraError] = useState('');
  const [guidance, setGuidance] = useState('Position your face inside the oval');
  const [ready, setReady] = useState(false);
  const [hasDetector, setHasDetector] = useState(false);

  const stopCamera = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) videoRef.current.srcObject = null;
    setCameraOn(false);
    setReady(false);
  }, []);

  // Always release the camera when this field goes away.
  useEffect(() => stopCamera, [stopCamera]);

  // Average luminance of the frame — catches photos taken in the dark or
  // completely blown out by a window behind the customer.
  const measureBrightness = (ctx, w, h) => {
    const { data } = ctx.getImageData(0, 0, w, h);
    let total = 0;
    // Sample every 16th pixel — plenty for an average, cheap enough for a live loop.
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
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    ctx.drawImage(video, 0, 0, w, h);

    const brightness = measureBrightness(ctx, w, h);
    if (brightness < 55) {
      setGuidance('Too dark — move somewhere brighter');
      setReady(false);
      return;
    }
    if (brightness > 215) {
      setGuidance('Too bright — move away from the light behind you');
      setReady(false);
      return;
    }

    // Native face detection where the browser offers it (Chrome on Android,
    // some desktop builds). Everywhere else we rely on the guide oval.
    if (detectorRef.current) {
      try {
        const faces = await detectorRef.current.detect(video);
        if (!faces.length) {
          setGuidance('No face detected — look straight at the camera');
          setReady(false);
          return;
        }
        if (faces.length > 1) {
          setGuidance('More than one face in frame — only you should be visible');
          setReady(false);
          return;
        }

        const box = faces[0].boundingBox;
        const faceCentreX = (box.x + box.width / 2) / video.videoWidth;
        const faceCentreY = (box.y + box.height / 2) / video.videoHeight;
        const faceHeight = box.height / video.videoHeight;

        if (Math.abs(faceCentreX - 0.5) > 0.13 || Math.abs(faceCentreY - 0.5) > 0.15) {
          setGuidance('Centre your face inside the oval');
          setReady(false);
          return;
        }
        if (faceHeight < 0.35) {
          setGuidance('Move a little closer to the camera');
          setReady(false);
          return;
        }
        if (faceHeight > 0.85) {
          setGuidance('Move back slightly');
          setReady(false);
          return;
        }
      } catch (err) {
        // Detector hiccup — don't block the customer over it.
      }
    }

    setGuidance(
      detectorRef.current
        ? 'Looking good — hold still and capture'
        : 'Fill the oval with your face, then capture'
    );
    setReady(true);
  }, []);

  const startCamera = async () => {
    setCameraError('');
    setStarting(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'user',
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });
      streamRef.current = stream;
      setCameraOn(true);

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play().catch(() => {});
      }

      if (!detectorRef.current && typeof window !== 'undefined' && 'FaceDetector' in window) {
        try {
          detectorRef.current = new window.FaceDetector({ fastMode: true, maxDetectedFaces: 3 });
          setHasDetector(true);
        } catch (err) {
          detectorRef.current = null;
        }
      }

      timerRef.current = setInterval(analyseFrame, ANALYSIS_INTERVAL);
    } catch (err) {
      const denied = err?.name === 'NotAllowedError' || err?.name === 'SecurityError';
      setCameraError(
        denied
          ? 'Camera access was blocked. Allow camera permission in your browser, or upload a photo instead.'
          : 'No camera available on this device. Please upload a photo instead.'
      );
      stopCamera();
    } finally {
      setStarting(false);
    }
  };

  // Square centre-crop of the live frame, written out un-mirrored (the preview
  // is mirrored only so it feels like a mirror to the customer).
  const capturePhoto = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || !video.videoWidth) return;

    const side = Math.min(video.videoWidth, video.videoHeight);
    const sx = (video.videoWidth - side) / 2;
    const sy = (video.videoHeight - side) / 2;

    canvas.width = OUTPUT_SIZE;
    canvas.height = OUTPUT_SIZE;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, sx, sy, side, side, 0, 0, OUTPUT_SIZE, OUTPUT_SIZE);

    const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
    stopCamera();
    if (onChange) onChange(dataUrl);
  };

  const handleUpload = (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setCameraError('Please choose an image file (JPG or PNG).');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setCameraError('Photo is larger than 5MB. Please choose a smaller image.');
      return;
    }
    setCameraError('');
    const reader = new FileReader();
    reader.onload = () => onChange && onChange(reader.result);
    reader.onerror = () => setCameraError('Could not read that file. Please try again.');
    reader.readAsDataURL(file);
  };

  const retake = () => {
    if (onChange) onChange('');
    startCamera();
  };

  const frameStyle = {
    position: 'relative',
    width: '100%',
    maxWidth: '340px',
    aspectRatio: '1 / 1',
    borderRadius: '16px',
    overflow: 'hidden',
    backgroundColor: '#0f172a',
  };

  return (
    <div className="form-group" style={{ marginBottom: '1.5rem' }}>
      <label className="form-label" style={{ fontWeight: 500, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
        {label}
        {required && <span style={{ color: 'var(--danger, #dc3545)' }}>*</span>}
      </label>

      <div
        style={{
          border: `2px dashed ${error ? 'var(--danger, #dc3545)' : 'var(--border-color, #ccc)'}`,
          borderRadius: '12px',
          padding: '1.25rem',
          backgroundColor: 'var(--surface-color, #ffffff)',
        }}
      >
        {/* ── Captured photo ─────────────────────────────────────────── */}
        {value ? (
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '1.25rem' }}>
            <img
              src={value}
              alt="Captured headshot"
              style={{
                width: '150px',
                height: '150px',
                objectFit: 'cover',
                borderRadius: '12px',
                border: '2px solid var(--slt-green, #28a745)',
              }}
            />
            <div>
              <p style={{ margin: '0 0 0.5rem 0', fontWeight: 700, color: 'var(--slt-green, #16a34a)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <FiCheckCircle /> Photo captured
              </p>
              <p style={{ margin: '0 0 0.85rem 0', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                Make sure your face is clearly visible and not blurred.
              </p>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                <button type="button" className="btn btn-secondary btn-sm" onClick={retake} style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', padding: '0.4rem 0.8rem', fontSize: '0.82rem' }}>
                  <FiRefreshCw size={14} /> Retake
                </button>
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => onChange && onChange('')} style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', padding: '0.4rem 0.8rem', fontSize: '0.82rem', color: 'var(--danger, #dc3545)' }}>
                  <FiX size={14} /> Remove
                </button>
              </div>
            </div>
          </div>
        ) : cameraOn ? (
          /* ── Live camera ──────────────────────────────────────────── */
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.85rem' }}>
            <div style={frameStyle}>
              <video
                ref={videoRef}
                playsInline
                muted
                autoPlay
                style={{ width: '100%', height: '100%', objectFit: 'cover', transform: 'scaleX(-1)' }}
              />
              {/* Oval face guide */}
              <div
                aria-hidden="true"
                style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  width: '58%',
                  height: '74%',
                  border: `3px solid ${ready ? '#22c55e' : '#f8fafc'}`,
                  borderRadius: '50%',
                  boxShadow: '0 0 0 9999px rgba(15, 23, 42, 0.45)',
                  transition: 'border-color 0.2s ease',
                }}
              />
              <div
                style={{
                  position: 'absolute',
                  bottom: '0.6rem',
                  left: '0.6rem',
                  right: '0.6rem',
                  textAlign: 'center',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  color: '#ffffff',
                  backgroundColor: ready ? 'rgba(22, 163, 74, 0.9)' : 'rgba(15, 23, 42, 0.75)',
                  borderRadius: '9999px',
                  padding: '0.35rem 0.75rem',
                }}
              >
                {guidance}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap', justifyContent: 'center' }}>
              <button
                type="button"
                className="btn btn-primary"
                onClick={capturePhoto}
                disabled={!ready}
                style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', opacity: ready ? 1 : 0.55 }}
              >
                <FiCamera size={16} /> Capture Photo
              </button>
              <button type="button" className="btn btn-secondary" onClick={stopCamera} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <FiX size={16} /> Cancel
              </button>
            </div>

            {!hasDetector && (
              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: 0, textAlign: 'center' }}>
                Automatic face detection isn't available in this browser — please centre your face in the oval yourself.
              </p>
            )}
          </div>
        ) : (
          /* ── Idle ─────────────────────────────────────────────────── */
          <div style={{ textAlign: 'center' }}>
            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                backgroundColor: 'var(--slt-blue-light, #eff6ff)',
                color: 'var(--slt-blue, #0056b3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 0.75rem auto',
              }}
            >
              <FiUser size={30} />
            </div>
            <p style={{ margin: '0 0 0.25rem 0', fontWeight: 700, color: 'var(--text-primary)' }}>
              Take a photo of your face
            </p>
            <ul
              style={{
                listStyle: 'none',
                padding: 0,
                margin: '0 auto 1rem auto',
                fontSize: '0.8rem',
                color: 'var(--text-secondary)',
                lineHeight: 1.7,
                maxWidth: '420px',
              }}
            >
              <li>Look straight at the camera in good, even lighting</li>
              <li>Centre your face in the oval and fill the frame</li>
              <li>No hat, sunglasses or face covering — you may keep prescription glasses on</li>
              <li>Only you should be in the photo, with a plain background</li>
            </ul>

            <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap', justifyContent: 'center' }}>
              <button
                type="button"
                className="btn btn-primary"
                onClick={startCamera}
                disabled={starting}
                style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
              >
                <FiCamera size={16} /> {starting ? 'Opening camera…' : 'Open Camera'}
              </button>
              <label
                className="btn btn-secondary"
                style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer', margin: 0 }}
              >
                <FiUpload size={16} /> Upload a Photo
                <input type="file" accept="image/*" capture="user" onChange={handleUpload} style={{ display: 'none' }} />
              </label>
            </div>
          </div>
        )}

        {cameraError && (
          <p style={{ marginTop: '0.85rem', marginBottom: 0, fontSize: '0.82rem', color: 'var(--danger, #dc3545)', display: 'flex', alignItems: 'center', gap: '0.35rem', justifyContent: 'center' }}>
            <FiAlertTriangle size={14} /> {cameraError}
          </p>
        )}

        <canvas ref={canvasRef} style={{ display: 'none' }} />
        <canvas ref={analysisCanvasRef} style={{ display: 'none' }} />
      </div>

      {helpText && !error && (
        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.35rem' }}>{helpText}</div>
      )}
      {error && (
        <div style={{ fontSize: '0.8rem', color: 'var(--danger, #dc3545)', marginTop: '0.35rem' }}>{error}</div>
      )}
    </div>
  );
}
