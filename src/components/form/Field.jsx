import React, { useState, useId } from 'react';
import { useTranslation } from 'react-i18next';

/* Format-checkers keyed by rules.kind. Kept lenient — these gate on
   obvious mistakes, not on exhaustively validating every real-world format. */
const CHECKS = {
  email: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v),
  mobile: (v) => /^\d{9}$/.test(v),
  phone: (v) => /^\d{7,10}$/.test(v),
  nic: (v) => /^(\d{9}[vVxX]|\d{12}|[A-Za-z0-9/-]{5,})$/.test(v),
};

/* A labelled input with helper text and inline validation that only
   surfaces after the field is touched (blur). Self-contained: the parent
   passes declarative `rules` and doesn't wire per-field state. */
export default function Field({
  label,
  name,
  rules = {},
  type = 'text',
  helper,
  defaultValue = '',
  inputMode,
  autoComplete,
  placeholder,
  prefix,
  isActive = true,
}) {
  const { t } = useTranslation();
  const id = useId();
  const [value, setValue] = useState(defaultValue);
  const [touched, setTouched] = useState(false);

  const validate = () => {
    const v = value.trim();
    if (rules.required && !v) return t('validation.required');
    if (v && rules.kind && CHECKS[rules.kind] && !CHECKS[rules.kind](v)) {
      return t(`validation.${rules.kind}`);
    }
    return '';
  };

  const error = touched ? validate() : '';
  const valid = touched && !error && value.trim() !== '';
  const describedBy = error ? `${id}-err` : helper ? `${id}-help` : undefined;

  const input = (
    <input
      id={id}
      name={name}
      type={type}
      className="form-control"
      inputMode={inputMode}
      autoComplete={autoComplete}
      placeholder={placeholder}
      value={value}
      required={isActive && rules.required}
      data-valid={valid ? 'true' : 'false'}
      aria-invalid={error ? 'true' : undefined}
      aria-describedby={describedBy}
      onChange={(e) => setValue(e.target.value)}
      onBlur={() => setTouched(true)}
    />
  );

  return (
    <div className="field">
      <label className="field-label" htmlFor={id}>
        {label}
        {rules.required && (
          <span className="field-req" aria-hidden="true">
            *
          </span>
        )}
      </label>
      {prefix ? (
        <div className="input-prefixed">
          <span className="prefix">{prefix}</span>
          {input}
        </div>
      ) : (
        input
      )}
      {error ? (
        <p className="field-error" id={`${id}-err`} role="alert">
          {error}
        </p>
      ) : helper ? (
        <p className="field-helper" id={`${id}-help`}>
          {helper}
        </p>
      ) : null}
    </div>
  );
}
