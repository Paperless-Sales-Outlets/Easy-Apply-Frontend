import React, { useState, useId } from 'react';
import { useTranslation } from 'react-i18next';

/* Multi-line field with a live character counter. */
export default function Textarea({
  label,
  name,
  helper,
  placeholder,
  rules = {},
  maxLength = 500,
  rows = 5,
  isActive = true,
}) {
  const { t } = useTranslation();
  const id = useId();
  const [value, setValue] = useState('');
  const [touched, setTouched] = useState(false);

  const error = touched && isActive && rules.required && !value.trim() ? t('validation.required') : '';
  const describedBy = error ? `${id}-err` : helper ? `${id}-help` : undefined;

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
      <textarea
        id={id}
        name={name}
        className="form-control"
        rows={rows}
        maxLength={maxLength}
        placeholder={placeholder}
        value={value}
        required={isActive && rules.required}
        data-valid={touched && !error && value.trim() !== '' ? 'true' : 'false'}
        aria-invalid={error ? 'true' : undefined}
        aria-describedby={describedBy}
        onChange={(e) => setValue(e.target.value)}
        onBlur={() => setTouched(true)}
      />
      <div className="field-foot">
        {error ? (
          <p className="field-error" id={`${id}-err`} role="alert">
            {error}
          </p>
        ) : helper ? (
          <p className="field-helper" id={`${id}-help`}>
            {helper}
          </p>
        ) : (
          <span />
        )}
        <span className="field-counter" aria-hidden="true">
          {value.length}/{maxLength}
        </span>
      </div>
    </div>
  );
}
