import React, { useRef, useState, useEffect } from 'react';

export default function DigitalSignatureCanvas({ onChange, required, isActive }) {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isEmpty, setIsEmpty] = useState(true);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    // Set background to white instead of transparent so it converts to a good PNG
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
  }, []);

  const getCoordinates = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    if (e.touches && e.touches.length > 0) {
      return {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top
      };
    }
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
  };

  const startDrawing = (e) => {
    // Prevent scrolling when touching the canvas
    if (e.type === 'touchstart') e.preventDefault();
    setIsDrawing(true);
    const { x, y } = getCoordinates(e);
    const ctx = canvasRef.current.getContext('2d');
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    if (e.type === 'touchmove') e.preventDefault();
    const { x, y } = getCoordinates(e);
    const ctx = canvasRef.current.getContext('2d');
    ctx.lineTo(x, y);
    ctx.stroke();
    if (isEmpty) setIsEmpty(false);
  };

  const stopDrawing = () => {
    if (isDrawing) {
      setIsDrawing(false);
      canvasRef.current.getContext('2d').closePath();
      // Inform parent of the new base64 string
      if (onChange) {
        onChange(canvasRef.current.toDataURL('image/png'));
      }
    }
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    setIsEmpty(true);
    if (onChange) {
      onChange(''); // Pass empty string to indicate it was cleared
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', width: '100%', maxWidth: '500px' }}>
      <label className="form-label" style={{ marginBottom: 0 }}>
        Digital Signature {required && <span style={{ color: 'var(--danger, #dc3545)' }}>*</span>}
      </label>
      <div 
        style={{ 
          border: `1px solid ${isEmpty && required && isActive ? 'var(--danger, #dc3545)' : 'var(--border-color)'}`, 
          borderRadius: '8px', 
          overflow: 'hidden',
          backgroundColor: '#fff',
          boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.05)'
        }}
      >
        <canvas
          ref={canvasRef}
          width={500}
          height={200}
          style={{ display: 'block', width: '100%', touchAction: 'none', cursor: 'crosshair' }}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
        />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
          Please sign inside the box.
        </span>
        <button 
          type="button" 
          onClick={clearCanvas} 
          className="btn btn-secondary" 
          style={{ padding: '0.3rem 0.75rem', fontSize: '0.85rem' }}
        >
          Clear Signature
        </button>
      </div>
    </div>
  );
}
