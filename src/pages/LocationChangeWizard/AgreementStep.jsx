import React, { useRef, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  FiClipboard,
  FiFileText,
  FiCheckCircle,
  FiEdit3,
  FiUploadCloud,
  FiTrash2,
  FiShield,
  FiCheck,
  FiX,
} from 'react-icons/fi';

export default function AgreementStep({
  isActive,
  formData = {},
  agreed,
  setAgreed,
  signature,
  setSignature,
  signatureFile,
  setSignatureFile,
}) {
  const { t } = useTranslation();

  // State management
  const [signatureMethod, setSignatureMethod] = useState('digital');
  const [signatureFileError, setSignatureFileError] = useState('');
  const [isDrawing, setIsDrawing] = useState(false);
  const signatureData = signature;

  const canvasRef = useRef(null);

  useEffect(() => {
    if (isActive && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      ctx.lineWidth = 2.5;
      ctx.lineCap = 'round';
      ctx.strokeStyle = '#0056b3';
    }
  }, [isActive, signatureMethod]);

  const startDrawing = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    const clientX = e.clientX || (e.touches && e.touches[0].clientX);
    const clientY = e.clientY || (e.touches && e.touches[0].clientY);

    ctx.beginPath();
    ctx.moveTo(clientX - rect.left, clientY - rect.top);
    setIsDrawing(true);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    const clientX = e.clientX || (e.touches && e.touches[0].clientX);
    const clientY = e.clientY || (e.touches && e.touches[0].clientY);

    ctx.lineTo(clientX - rect.left, clientY - rect.top);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    const canvas = canvasRef.current;
    if (canvas) {
      const data = canvas.toDataURL();
      if (setSignature) {
        setSignature(data);
      }
    }
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      if (setSignature) {
        setSignature(null);
      }
    }
  };

  const handleSignatureFileChange = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) {
      setSignatureFile(null);
      setSignatureFileError('');
      return;
    }
    const allowedTypes = ['application/pdf', 'image/png', 'image/jpeg'];
    if (!allowedTypes.includes(file.type)) {
      setSignatureFile(null);
      setSignatureFileError('Unsupported file type. Upload JPG, PNG, or PDF.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setSignatureFile(null);
      setSignatureFileError('File size exceeds 5MB.');
      return;
    }
    setSignatureFileError('');
    setSignatureFile(file);
    if (setSignature) {
      setSignature(null);
    }
  };

  const handleCheckboxChange = (e) => {
    const checked = e.target.checked;
    if (setAgreed) {
      setAgreed(checked);
    }
  };

  return (
    <div style={{ width: '100%', margin: '0 auto', fontFamily: 'inherit' }}>
      {/* 1. APPLICATION SUMMARY CARD */}
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          padding: '1.75rem 2rem',
          marginBottom: '1.75rem',
          border: '1px solid #e2e8f0',
          boxShadow: '0 8px 30px rgba(0, 0, 0, 0.04)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '1.25rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.85rem' }}>
          <div style={{ backgroundColor: '#eff6ff', color: '#0056b3', width: '34px', height: '34px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <FiClipboard size={18} />
          </div>
          <h4 style={{ margin: 0, color: '#0f172a', fontSize: '1.1rem', fontWeight: 800 }}>
            Application Summary & Verification Review
          </h4>
        </div>

        {/* Customer Information */}
        <div style={{ marginBottom: '1.25rem' }}>
          <h5 style={{ fontWeight: 800, fontSize: '0.85rem', color: '#0056b3', textTransform: 'uppercase', marginBottom: '0.65rem' }}>
            Customer Identification
          </h5>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', backgroundColor: '#f8fafc', padding: '1rem 1.25rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
            <div>
              <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 700 }}>TELEPHONE NUMBER</div>
              <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0f172a', marginTop: '0.15rem' }}>{formData.telephone || '—'}</div>
            </div>
            <div>
              <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 700 }}>LEGAL OWNER</div>
              <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0f172a', marginTop: '0.15rem' }}>{formData.legalOwner || '—'}</div>
            </div>
            <div>
              <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 700 }}>SERVICE TYPE</div>
              <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0056b3', marginTop: '0.15rem' }}>{formData.serviceType || '—'}</div>
            </div>
          </div>
        </div>

        {/* Relocation Address Summary */}
        <div style={{ marginBottom: '1.25rem' }}>
          <h5 style={{ fontWeight: 800, fontSize: '0.85rem', color: '#0056b3', textTransform: 'uppercase', marginBottom: '0.65rem' }}>
            Relocation Address Details
          </h5>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem', backgroundColor: '#f8fafc', padding: '1rem 1.25rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
            <div>
              <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 700 }}>CURRENT ADDRESS</div>
              <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0f172a', marginTop: '0.15rem' }}>{formData.currentAddress || '—'}</div>
            </div>
            <div>
              <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 700 }}>NEW RELOCATION ADDRESS</div>
              <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#16a34a', marginTop: '0.15rem' }}>{formData.newAddress || 'To be specified'}</div>
            </div>
          </div>
        </div>

        {/* Preferences Summary */}
        <div>
          <h5 style={{ fontWeight: 800, fontSize: '0.85rem', color: '#0056b3', textTransform: 'uppercase', marginBottom: '0.65rem' }}>
            Transfer Preferences
          </h5>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', backgroundColor: '#f8fafc', padding: '1rem 1.25rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
            <div>
              <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 700 }}>RELOCATION DATE</div>
              <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#0f172a', marginTop: '0.15rem' }}>{formData.relocationDate || 'Immediate'}</div>
            </div>
            <div>
              <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 700 }}>CALL FORWARDING</div>
              <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#0f172a', marginTop: '0.15rem' }}>{formData.callForwarding ? 'Activated' : 'Not Requested'}</div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. UPLOADED DOCUMENTS SUMMARY CARD */}
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          padding: '1.75rem 2rem',
          marginBottom: '1.75rem',
          border: '1px solid #e2e8f0',
          boxShadow: '0 8px 30px rgba(0, 0, 0, 0.04)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '1.25rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.85rem' }}>
          <div style={{ backgroundColor: '#f0fdf4', color: '#16a34a', width: '34px', height: '34px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <FiFileText size={18} />
          </div>
          <h4 style={{ margin: 0, color: '#0f172a', fontSize: '1.1rem', fontWeight: 800 }}>
            Uploaded Verification Documents
          </h4>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          {[
            { label: 'Proof of New Address (Mandatory)', file: formData.proofOfAddress },
            { label: 'Authorization Letter', file: formData.authorizationLetter },
            { label: 'Business Registration Certificate (BRC)', file: formData.brc },
          ].map(({ label, file }, idx) => (
            <div
              key={idx}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '0.85rem 1.15rem',
                backgroundColor: file ? '#f0fdf4' : '#f8fafc',
                border: file ? '1px solid #bbf7d0' : '1px solid #e2e8f0',
                borderRadius: '10px',
              }}
            >
              <span style={{ fontSize: '0.88rem', fontWeight: 700, color: '#1e293b' }}>{label}</span>
              {file ? (
                <span style={{ fontSize: '0.82rem', fontWeight: 800, color: '#15803d', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <FiCheckCircle size={15} />
                  <span>{file.name || 'Uploaded'}</span>
                </span>
              ) : (
                <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#94a3b8' }}>Not Provided</span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 3. TERMS & DECLARATION CARD */}
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          padding: '1.75rem 2rem',
          marginBottom: '1.75rem',
          border: '1px solid #e2e8f0',
          boxShadow: '0 8px 30px rgba(0, 0, 0, 0.04)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '1.25rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.85rem' }}>
          <div style={{ backgroundColor: '#fef3c7', color: '#d97706', width: '34px', height: '34px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <FiShield size={18} />
          </div>
          <h4 style={{ margin: 0, color: '#0f172a', fontSize: '1.1rem', fontWeight: 800 }}>
            Customer Declaration & Service Terms
          </h4>
        </div>

        <div style={{ backgroundColor: '#f8fafc', padding: '1.25rem', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '1.25rem', fontSize: '0.88rem', color: '#475569', lineHeight: 1.6 }}>
          <p style={{ margin: '0 0 0.65rem 0' }}>
            I/We hereby declare that the details furnished in this application for service location change are true, accurate, and complete to the best of my knowledge.
          </p>
          <p style={{ margin: '0 0 0.65rem 0' }}>
            I/We agree to abide by the telecommunication service rules, tariffs, and standard terms and conditions of Sri Lanka Telecom PLC.
          </p>
          <p style={{ margin: 0 }}>
            I/We understand that technical feasibility will be confirmed prior to final line migration at the destination location.
          </p>
        </div>

        <label
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.65rem',
            padding: '1rem 1.25rem',
            backgroundColor: agreed ? '#dcfce7' : '#ffffff',
            border: agreed ? '2px solid #16a34a' : '1.5px solid #cbd5e1',
            borderRadius: '12px',
            cursor: 'pointer',
            fontWeight: 800,
            fontSize: '0.92rem',
            color: agreed ? '#15803d' : '#0f172a',
            transition: 'all 0.15s ease',
          }}
        >
          <input
            type="checkbox"
            checked={agreed}
            onChange={handleCheckboxChange}
            style={{ width: '18px', height: '18px', cursor: 'pointer' }}
          />
          <span>I agree to the Customer Declaration & Telecommunication Terms</span>
        </label>
      </div>

      {/* 4. DIGITAL SIGNATURE CARD */}
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          padding: '1.75rem 2rem',
          marginBottom: '1.75rem',
          border: '1px solid #e2e8f0',
          boxShadow: '0 8px 30px rgba(0, 0, 0, 0.04)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '1.25rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.85rem' }}>
          <div style={{ backgroundColor: '#eff6ff', color: '#0056b3', width: '34px', height: '34px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <FiEdit3 size={18} />
          </div>
          <h4 style={{ margin: 0, color: '#0f172a', fontSize: '1.1rem', fontWeight: 800 }}>
            Customer Signature Authorization
          </h4>
        </div>

        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.25rem' }}>
          {['digital', 'upload'].map((method) => (
            <div
              key={method}
              onClick={() => setSignatureMethod(method)}
              style={{
                flex: 1,
                padding: '0.85rem 1.25rem',
                borderRadius: '12px',
                border: signatureMethod === method ? '2px solid #0056b3' : '1.5px solid #cbd5e1',
                backgroundColor: signatureMethod === method ? '#eff6ff' : '#ffffff',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.65rem',
                fontWeight: 800,
                fontSize: '0.9rem',
                color: signatureMethod === method ? '#0056b3' : '#334155',
              }}
            >
              <input
                type="radio"
                name="signatureMethod"
                value={method}
                checked={signatureMethod === method}
                onChange={() => setSignatureMethod(method)}
                style={{ cursor: 'pointer' }}
              />
              <span>{method === 'digital' ? 'Draw Digital Signature' : 'Upload Signature Image/PDF'}</span>
            </div>
          ))}
        </div>

        {signatureMethod === 'digital' ? (
          <div>
            <div style={{ border: '2px dashed #93c5fd', borderRadius: '14px', backgroundColor: '#f8fafc', position: 'relative', overflow: 'hidden' }}>
              <canvas
                ref={canvasRef}
                width={650}
                height={160}
                style={{ width: '100%', height: '160px', display: 'block', cursor: 'crosshair' }}
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                onTouchStart={startDrawing}
                onTouchMove={draw}
                onTouchEnd={stopDrawing}
              />
              {!signatureData && !isDrawing && (
                <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', color: '#94a3b8', pointerEvents: 'none', fontSize: '0.9rem', fontWeight: 600 }}>
                  Draw your signature here using mouse or touchscreen
                </div>
              )}
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.75rem' }}>
              <button
                type="button"
                onClick={clearSignature}
                style={{
                  padding: '0.45rem 1rem',
                  fontSize: '0.82rem',
                  backgroundColor: '#fee2e2',
                  border: '1px solid #fca5a5',
                  borderRadius: '8px',
                  color: '#dc2626',
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                }}
              >
                <FiTrash2 size={14} />
                <span>Clear Signature Pad</span>
              </button>
            </div>
          </div>
        ) : (
          <div>
            <label
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '1.5rem',
                border: signatureFile ? '2px stroke #10b981' : '2px dashed #93c5fd',
                borderRadius: '12px',
                backgroundColor: signatureFile ? '#f0fdf4' : '#f8fafc',
                cursor: 'pointer',
              }}
            >
              <input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                style={{ display: 'none' }}
                onChange={handleSignatureFileChange}
              />
              <FiUploadCloud size={30} style={{ color: signatureFile ? '#16a34a' : '#0056b3', marginBottom: '0.5rem' }} />
              {signatureFile ? (
                <div style={{ textAlign: 'center' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#15803d', display: 'block' }}>
                    {signatureFile.name}
                  </span>
                  <span style={{ fontSize: '0.72rem', color: '#166534', fontWeight: 600 }}>File Uploaded</span>
                </div>
              ) : (
                <div style={{ textAlign: 'center' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#0056b3', display: 'block' }}>
                    Upload Signature Image / Document
                  </span>
                  <span style={{ fontSize: '0.72rem', color: '#64748b' }}>Accepted Formats: JPG, PNG, PDF (Max 5MB)</span>
                </div>
              )}
            </label>
            {signatureFileError && (
              <div style={{ color: '#dc2626', fontSize: '0.82rem', marginTop: '0.5rem', fontWeight: 700 }}>
                {signatureFileError}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
