import React from 'react';
import { FiFileText, FiImage } from 'react-icons/fi';
import FileUploadField from './FileUploadField';

/**
 * NIC upload block shared by the Ownership Change and New Connection wizards.
 *
 * The customer picks how they want to hand over their NIC — a single scanned
 * PDF, or a JPEG of each side — and only the matching upload fields are shown.
 * Field names are configurable so each wizard can keep its own form keys.
 */
export default function NicUploadSection({
  format,
  onFormatChange,
  values = {},
  onFileChange,
  required = false,
  idPrefix = 'nic',
  pdfName = 'nicPdf',
  frontName = 'nicFront',
  backName = 'nicBack',
  pdfLabel = 'NIC (PDF)',
  frontLabel = 'NIC — Front Side',
  backLabel = 'NIC — Back Side',
  pdfHelpText = 'Upload a single PDF containing both sides of the NIC (max 5MB).',
  formatLabel = 'How would you like to upload your NIC?',
}) {
  const groupId = `${idPrefix}-nic-group`;

  return (
    <div role="group" aria-labelledby={groupId}>
      <span id={groupId} className="sr-only">National Identity Card upload</span>
      <div className="form-group" style={{ marginBottom: '1.25rem' }}>
        <label className="form-label" style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.6rem' }}>
          {formatLabel}
        </label>
        <div
          style={{
            display: 'flex',
            backgroundColor: 'rgba(15, 87, 168, 0.06)',
            borderRadius: '12px',
            padding: '0.3rem',
            position: 'relative',
            border: '1px solid rgba(15, 87, 168, 0.15)',
          }}
        >
          {/* Animated Background Pill */}
          <div
            style={{
              position: 'absolute',
              top: '0.3rem',
              bottom: '0.3rem',
              left: format === 'pdf' ? '0.3rem' : '50%',
              width: 'calc(50% - 0.3rem)',
              backgroundColor: '#ffffff',
              borderRadius: '9px',
              boxShadow: '0 2px 8px rgba(0, 43, 73, 0.12)',
              transition: 'all 0.28s cubic-bezier(0.4, 0, 0.2, 1)',
            }}
          />
          <button
            type="button"
            onClick={() => onFormatChange('pdf')}
            style={{
              flex: 1,
              padding: '0.75rem 1rem',
              background: 'none',
              border: 'none',
              borderRadius: '9px',
              fontWeight: 700,
              fontSize: '0.92rem',
              cursor: 'pointer',
              position: 'relative',
              zIndex: 1,
              color: format === 'pdf' ? 'var(--slt-blue, #0f57a8)' : 'var(--text-secondary, #64748b)',
              transition: 'color 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
            }}
          >
            <FiFileText size={17} /> Single PDF Document
          </button>
          <button
            type="button"
            onClick={() => onFormatChange('jpeg')}
            style={{
              flex: 1,
              padding: '0.75rem 1rem',
              background: 'none',
              border: 'none',
              borderRadius: '9px',
              fontWeight: 700,
              fontSize: '0.92rem',
              cursor: 'pointer',
              position: 'relative',
              zIndex: 1,
              color: format === 'jpeg' ? 'var(--slt-blue, #0f57a8)' : 'var(--text-secondary, #64748b)',
              transition: 'color 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
            }}
          >
            <FiImage size={17} /> Two Photos (Front &amp; Back)
          </button>
        </div>
      </div>

      {format === 'pdf' ? (
        <FileUploadField
          name={pdfName}
          label={pdfLabel}
          accept=".pdf"
          required={required}
          value={values[pdfName]}
          onChange={onFileChange}
          helpText={pdfHelpText}
        />
      ) : (
        <div className="form-group flex flex-col-mobile gap-4">
          <div style={{ flex: 1, minWidth: 0 }}>
            <FileUploadField
              name={frontName}
              label={frontLabel}
              accept=".jpg,.jpeg"
              required={required}
              value={values[frontName]}
              onChange={onFileChange}
            />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <FileUploadField
              name={backName}
              label={backLabel}
              accept=".jpg,.jpeg"
              required={required}
              value={values[backName]}
              onChange={onFileChange}
            />
          </div>
        </div>
      )}
    </div>
  );
}
