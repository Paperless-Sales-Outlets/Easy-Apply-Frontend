import React from 'react';

/* Pill chips backed by real checkbox/radio inputs; selected state via
   CSS :has(:checked). */
export default function Chips({ legend, name, type = 'checkbox', options }) {
  return (
    <fieldset className="field-group">
      <legend className="field-group-label">{legend}</legend>
      <div className="chip-row">
        {options.map((opt) => (
          <label className="chip" key={opt.value}>
            <input type={type} name={name} value={opt.value} />
            {opt.label}
          </label>
        ))}
      </div>
    </fieldset>
  );
}
