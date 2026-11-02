import React, { useRef, useState, useEffect } from 'react';

/**
 * DigitalSignatureCanvas component (HTML5 Canvas)
 * Allows customers to draw their signature via touch or mouse.
 * Emits PNG base64 Data URL via onChange.
 */
export default function DigitalSignatureCanvas({
  label = 'Digital Signature',
  required = false,
  value = '',
  onChange,
  error = '',
}) {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isEmpty, setIsEmpty] = useState(!value);

  // Initialize Canvas stroke properties
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = '#002B49'; // SLT Navy Blue line color

    // If pre-populated value exists, render it on canvas
    if (value) {
      const img = new Image();
      img.onload = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
        setIsEmpty(false);
      };
      img.src = value;
    }
  }, [value]);

  const getCoordinates = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    let clientX = e.clientX;
    let clientY = e.clientY;

    if (e.touches && e.touches.length > 0) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    }

    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY,
    };
  };

  const startDrawing = (e) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const { x, y } = getCoordinates(e);

    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const { x, y } = getCoordinates(e);

    ctx.lineTo(x, y);
    ctx.stroke();
    setIsEmpty(false);
  };

  const stopDrawing = (e) => {
    if (!isDrawing) return;
    if (e) e.preventDefault();
    setIsDrawing(false);

    const canvas = canvasRef.current;
    if (canvas && onChange) {
      const dataUrl = canvas.toDataURL('image/png');
      onChange(dataUrl);
    }
  };

  // Attach touch listeners as NON-PASSIVE so that preventDefault() works.
  // React 17+ registers synthetic touch events as passive by default,
  // which silently ignores preventDefault() and causes console warnings.
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const opts = { passive: false };
    canvas.addEventListener('touchstart', startDrawing, opts);
    canvas.addEventListener('touchmove', draw, opts);
    canvas.addEventListener('touchend', stopDrawing, opts);

    return () => {
      canvas.removeEventListener('touchstart', startDrawing, opts);
      canvas.removeEventListener('touchmove', draw, opts);
      canvas.removeEventListener('touchend', stopDrawing, opts);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDrawing]);

  const handleClear = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setIsEmpty(true);
    if (onChange) onChange('');
  };

  return (
    <div className="form-group" style={{ marginBottom: '1.5rem' }}>
      <label className="form-label" style={{ fontWeight: '500', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
        {label}
        {required && <span style={{ color: 'var(--danger, #dc3545)' }}>*</span>}
      </label>

      <div
        style={{
          border: `2px dashed ${error ? 'var(--danger, #dc3545)' : 'var(--border-color, #ccc)'}`,
          borderRadius: '8px',
          backgroundColor: 'var(--surface-color, #ffffff)',
          position: 'relative',
          padding: '0.5rem',
          maxWidth: '500px',
        }}
      >
        <canvas
          ref={canvasRef}
          width={480}
          height={160}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          // Touch events are handled via native addEventListener with { passive: false }
          // in the useEffect above. Do NOT add onTouchStart/onTouchMove/onTouchEnd here
          // because React registers synthetic touch handlers as passive, which makes
          // preventDefault() a no-op and generates console warnings.
          style={{
            width: '100%',
            height: '160px',
            touchAction: 'none',
            cursor: 'crosshair',
            backgroundColor: '#ffffff',
            borderRadius: '8px',
          }}
        />

        {isEmpty && (
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              color: 'var(--text-secondary, #999)',
              pointerEvents: 'none',
              fontSize: '0.85rem',
              textAlign: 'center',
            }}
          >
            Draw your signature here
          </div>
        )}

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: '0.5rem',
            borderTop: '1px solid var(--border-color, #eee)',
            paddingTop: '0.5rem',
          }}
        >
          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
            {isEmpty ? 'No signature provided' : 'Signature captured'}
          </span>
          <button
            type="button"
            className="btn btn-sm btn-secondary"
            onClick={handleClear}
            style={{ padding: '0.25rem 0.6rem', fontSize: '0.8rem' }}
          >
            Clear Signature
          </button>
        </div>
      </div>

      {error && (
        <div style={{ fontSize: '0.8rem', color: 'var(--danger, #dc3545)', marginTop: '0.25rem' }}>
          {error}
        </div>
      )}
    </div>
  );
}
