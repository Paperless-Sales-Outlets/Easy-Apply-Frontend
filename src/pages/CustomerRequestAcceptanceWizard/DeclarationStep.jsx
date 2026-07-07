import React from 'react';
import { useTranslation } from 'react-i18next';

export default function DeclarationStep() {
  const { t } = useTranslation();
  const k = 'wizards.customerRequestAcceptance.declaration';

  return (
    <div className="declaration">
      <p className="declaration-text">{t(`${k}.declarationText`)}</p>
      <label className="agree-check">
        <input type="checkbox" className="checkbox-input" required />
        <span>{t(`${k}.agreeLabel`)}</span>
      </label>
    </div>
  );
}
