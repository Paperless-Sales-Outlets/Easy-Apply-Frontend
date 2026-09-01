import React, { useState, useRef } from 'react';
import { FiUploadCloud } from 'react-icons/fi';

/**
 * Reusable FileUploadField component supporting drag-and-drop,
 * file format validation (PDF/JPG/PNG), size checking, and thumbnail previews.
 */
export default function FileUploadField({
  name,
  label,
  required = false,
  accept = '.pdf,.jpg,.jpeg,.png',
  maxSizeMB = 5,
  value, // file object or base64 object { name, size, type, data }
  onChange,
  error: externalError,
  helpText,
}) {
  const [dragActive, setDragActive] = useState(false);
  const [internalError, setInternalError] = useState('');
  const inputRef = useRef(null);
  const labelId = `${name}-label`;
  const helpId = `${name}-help`;

  const error = externalError || internalError;

  const processFile = (file) => {
    setInternalError('');

    if (!file) return;

    // Check size
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      setInternalError(`File size exceeds maximum limit of ${maxSizeMB}MB.`);
      return;
    }

    // Check extension
    const allowedExtensions = accept.split(',').map((ext) => ext.trim().toLowerCase());
    const fileExt = `.${file.name.split('.').pop().toLowerCase()}`;
    const fileType = file.type.toLowerCase();

    const isValidExt = allowedExtensions.includes(fileExt);
    const isValidType = allowedExtensions.some(
      (ext) =>
        (ext === '.pdf' && fileType.includes('pdf')) ||
        (ext.match(/\.(jpg|jpeg|png)$/) && fileType.includes('image'))
    );

    if (!isValidExt && !isValidType) {
      setInternalError(`Invalid file format. Allowed formats: ${accept}`);
      return;
    }

    // Read as Base64 Data URL
    const reader = new FileReader();
    reader.onload = () => {
      const fileData = {
        name: file.name,
        size: file.size,
        type: file.type,
        data: reader.result, // base64 data URL
      };
      if (onChange) {
        onChange(name, fileData);
      }
    };
    reader.onerror = () => {
      setInternalError('Failed to read file. Please try again.');
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleRemove = (e) => {
    e.stopPropagation();
    setInternalError('');
    if (inputRef.current) inputRef.current.value = '';
    if (onChange) onChange(name, null);
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '';
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const isImage = value?.type?.startsWith('image/') || value?.data?.startsWith('data:image/');

  return (
    <div className="form-group" style={{ marginBottom: '1.25rem' }}>
      <span className="form-label" id={labelId} style={{ fontWeight: '500', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
        {label}
        {required && <span style={{ color: 'var(--danger, #dc3545)' }} aria-hidden="true">*</span>}
        {required && <span className="sr-only">(required)</span>}
      </span>

      {value ? (
        <div
          role="status"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0.75rem 1rem',
            border: '1px solid var(--slt-green, #28a745)',
            borderRadius: '8px',
            backgroundColor: 'var(--surface-color, #f8f9fa)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', overflow: 'hidden' }}>
            {isImage ? (
              <img
                src={value.data}
                alt="Preview"
                style={{ width: '42px', height: '42px', objectFit: 'cover', borderRadius: '4px', border: '1px solid var(--border-color)' }}
              />
            ) : (
              <div
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '4px',
                  backgroundColor: 'var(--slt-blue-light, #e9ecef)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 'bold',
                  fontSize: '0.75rem',
                  color: 'var(--slt-blue, #0056b3)',
                }}
              >
                PDF
              </div>
            )}
            <div style={{ overflow: 'hidden' }}>
              <div
                style={{
                  fontWeight: '600',
                  fontSize: '0.9rem',
                  color: 'var(--text-primary)',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {value.name}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                {formatFileSize(value.size)}
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={handleRemove}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--danger, #dc3545)',
              cursor: 'pointer',
              fontWeight: 'bold',
              fontSize: '1.1rem',
              padding: '0.25rem 0.5rem',
            }}
            aria-label={`Remove ${label || 'file'}`}
          >
            <span aria-hidden="true">✕</span>
          </button>
        </div>
      ) : (
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          role="button"
          tabIndex={0}
          aria-labelledby={labelId}
          aria-describedby={helpId}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              inputRef.current?.click();
            }
          }}
          style={{
            border: `2px dashed ${dragActive ? 'var(--slt-blue, #0056b3)' : error ? 'var(--danger, #dc3545)' : 'var(--border-color, #ccc)'}`,
            borderRadius: '8px',
            padding: '1.25rem',
            textAlign: 'center',
            backgroundColor: dragActive ? 'rgba(0, 86, 179, 0.05)' : 'var(--surface-color, #fafafa)',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}
        >
          <input
            ref={inputRef}
            type="file"
            name={name}
            accept={accept}
            onChange={handleFileChange}
            tabIndex={-1}
            aria-hidden="true"
            style={{ display: 'none' }}
          />

          <div style={{ color: 'var(--slt-blue, #0056b3)', marginBottom: '0.25rem' }}>
            <FiUploadCloud size={28} />
          </div>
          <div style={{ fontSize: '0.9rem', fontWeight: '500', color: 'var(--text-primary)' }}>
            Drag & drop your file here or <span style={{ color: 'var(--slt-blue)', textDecoration: 'underline' }}>browse</span>
          </div>
          <div id={helpId} style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
            Supports {accept.replace(/\./g, '').toUpperCase().replace(/,/g, ', ')} (Max {maxSizeMB}MB)
          </div>
        </div>
      )}

      {helpText && !error && (
        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
          {helpText}
        </div>
      )}

      <div role="alert" aria-live="assertive">
        {error && (
          <div style={{ fontSize: '0.8rem', color: 'var(--danger, #dc3545)', marginTop: '0.25rem', fontWeight: 600 }}>
            {error}
          </div>
        )}
      </div>
    </div>
  );
}
