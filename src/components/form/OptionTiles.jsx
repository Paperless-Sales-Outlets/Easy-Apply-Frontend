import React from 'react';
import Icon from '../Icon';

/* Selectable icon tiles backed by real checkbox/radio inputs.
   Selected styling is driven by CSS :has(:checked) — no JS state. */
export default function OptionTiles({ legend, name, type = 'checkbox', options }) {
  return (
    <fieldset className="field-group">
      <legend className="field-group-label">{legend}</legend>
      <div className="tile-grid">
        {options.map((opt) => (
          <label className="tile" key={opt.value}>
            <input type={type} name={name} value={opt.value} />
            {opt.icon && (
              <span className="tile-ic">
                <Icon name={opt.icon} size={20} />
              </span>
            )}
            <span className="tile-name">{opt.label}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}
