import React from 'react';
import { useTranslation } from 'react-i18next';

// `name` stays the stable English identifier the filtering logic elsewhere
// keys off (ProductCatalogPage compares activeCategory against these exact
// strings) — only `labelKey` (the displayed text) is translated.
const CATEGORIES = [
  { name: 'All Products', labelKey: 'catalog.categories.allProducts' },
  { name: 'Fibre Broadband', labelKey: 'catalog.categories.fibreBroadband' },
  { name: 'PEO TV', labelKey: 'catalog.categories.peoTv' },
  { name: 'Voice', labelKey: 'catalog.categories.voice' },
];

/** Category tabs above the product grid: the active tab is underlined, the rest recede. */
export default function CategoryChips({ activeCategory, onSelectCategory }) {
  const { t } = useTranslation();

  return (
    <nav className="category-tabs" aria-label="Product categories">
      {CATEGORIES.map((cat) => {
        const active = activeCategory === cat.name;
        return (
          <button
            key={cat.name}
            type="button"
            className={`category-tab${active ? ' is-active' : ''}`}
            aria-current={active ? 'true' : undefined}
            onClick={() => onSelectCategory(cat.name)}
          >
            {t(cat.labelKey, cat.name)}
          </button>
        );
      })}
    </nav>
  );
}
