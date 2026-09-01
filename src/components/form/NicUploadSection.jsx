import React from 'react';
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
  return (
    <div>
      <div className="form-group">
        <label className="form-label" htmlFor={`${idPrefix}-format`}>{formatLabel}</label>
        <select
          id={`${idPrefix}-format`}
          className="form-control"
          value={format}
          onChange={(e) => onFormatChange(e.target.value)}
        >
          <option value="pdf">Single PDF (both sides)</option>
          <option value="jpeg">Two JPEG images (front &amp; back)</option>
        </select>
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
