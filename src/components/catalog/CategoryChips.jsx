import React from 'react';
import { useTranslation } from 'react-i18next';
import { FiGrid, FiPhoneCall, FiWifi, FiTv } from 'react-icons/fi';

// `name` stays the stable English identifier the filtering logic elsewhere
// keys off (ProductCatalogPage compares activeCategory against these exact
// strings) — only `labelKey` (the displayed text) is translated.
const CATEGORIES = [
  { name: 'All Products', labelKey: 'catalog.categories.allProducts', icon: FiGrid },
  { name: 'Voice', labelKey: 'catalog.categories.voice', icon: FiPhoneCall },
  { name: 'Fibre Broadband', labelKey: 'catalog.categories.fibreBroadband', icon: FiWifi },
  { name: 'PEO TV', labelKey: 'catalog.categories.peoTv', icon: FiTv },
];

/**
 * `available` (optional) is the list of category names the API actually
 * returned products for. "All Products" always shows; anything else is hidden
 * when the catalogue has nothing in it, so the chips never lead to an empty page.
 */
export default function CategoryChips({ activeCategory, onSelectCategory, available }) {
  const { t } = useTranslation();
  const visible = CATEGORIES.filter(
    (cat) => cat.name === 'All Products' || !available || available.includes(cat.name)
  );

  return (
    <div className="chip-row" role="group" aria-label={t('catalog.categories.label', 'Categories')}>
      {visible.map((cat) => {
        const IconComp = cat.icon;
        return (
          <button
            key={cat.name}
            type="button"
            className="chip"
            aria-pressed={activeCategory === cat.name}
            onClick={() => onSelectCategory(cat.name)}
          >
            <IconComp size={18} aria-hidden="true" />
            <span>{t(cat.labelKey, cat.name)}</span>
          </button>
        );
      })}
    </div>
  );
}
