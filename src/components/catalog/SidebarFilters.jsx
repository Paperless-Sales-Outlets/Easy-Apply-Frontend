import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { FiChevronDown, FiChevronRight, FiX, FiTv, FiGlobe, FiPhone, FiLayers, FiTag } from 'react-icons/fi';
import { getProductHierarchy } from '../../services/productService';

// Fallback option lists, used only when the page doesn't pass the options it
// derived from the live product API.
const DEFAULT_TYPES = [
  { id: 'PEO TV', label: 'PEO TV' },
  { id: 'Fibre Broadband', label: 'Fibre Broadband' },
  { id: 'LTE Home', label: 'LTE Home' },
  { id: 'Voice', label: 'Voice' },
];

const DEFAULT_SPEEDS = [
  { id: 'up_to_100', label: 'Up to 100 Mbps' },
  { id: '100_300', label: '100 – 300 Mbps' },
  { id: '300_500', label: '300 – 500 Mbps' },
  { id: 'above_500', label: 'Above 500 Mbps' },
];

const normalizeTreeName = (name = '') => String(name).toLowerCase().replace(/\s+/g, ' ').trim();

const iconFor = (name = '') => {
  const lower = name.toLowerCase();
  if (lower.includes('peo') || lower.includes('tv')) return <FiTv size={16} aria-hidden="true" />;
  if (lower.includes('fibre') || lower.includes('broadband') || lower.includes('lte')) return <FiGlobe size={16} aria-hidden="true" />;
  if (lower.includes('voice') || lower.includes('phone')) return <FiPhone size={16} aria-hidden="true" />;
  return <FiLayers size={16} aria-hidden="true" />;
};

function CheckGroup({ title, options, selected, counts, onToggle }) {
  const { t } = useTranslation();
  // One option can't narrow anything, so a single-choice group is just noise.
  if (options.length < 2) return null;
  return (
    <div className="filter-group">
      <h3>{title}</h3>
      {options.map((opt) => {
        const checked = selected.includes(opt.id);
        const count = counts ? counts[opt.id] || 0 : null;
        // A ticked option stays clickable so it can always be unticked
        const isEmpty = count === 0 && !checked;
        return (
          <label
            key={opt.id}
            className={`filter-opt${isEmpty ? ' is-empty' : ''}`}
            title={isEmpty ? t('catalog.filters.noProducts', 'No products available') : undefined}
          >
            <input type="checkbox" checked={checked} disabled={isEmpty} onChange={() => onToggle(opt.id)} />
            <span>{opt.label}</span>
            {count !== null && <span className="n">{count}</span>}
          </label>
        );
      })}
    </div>
  );
}

/**
 * Catalogue filters. Everything shown here comes from the live API:
 *  - the category tree is GET /products/hierarchy
 *  - product-type and speed options are derived by the page from the
 *    products the API returned (`typeOptions` / `speedOptions`), with
 *    live per-option counts.
 */
export default function SidebarFilters({
  activeCategory = 'All Products',
  onSelectCategory,
  // (node, parentNode) => void. When provided, tree clicks go here instead of
  // onSelectCategory so the page can filter by the exact node.
  onSelectTreeNode,
  activeTreeKey = null,
  typeOptions,
  speedOptions,
  typeCounts,
  speedCounts,
  selectedTypes = [],
  onTypeToggle,
  selectedSpeeds = [],
  onSpeedToggle,
  onClearAll,
  onApply,
  onCloseMobile,
}) {
  const { t } = useTranslation();
  const [hierarchy, setHierarchy] = useState([]);
  const [expandedNodes, setExpandedNodes] = useState({});
  const [loadingHierarchy, setLoadingHierarchy] = useState(true);

  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const data = await getProductHierarchy();
        if (!isMounted) return;
        // Categories start collapsed: the tree is a long list on the live API
        // and expanding it all would push the products off the first screen.
        setHierarchy(Array.isArray(data) ? data : []);
      } catch (e) {
        console.warn('Hierarchy fetch error:', e);
      } finally {
        if (isMounted) setLoadingHierarchy(false);
      }
    })();
    return () => {
      isMounted = false;
    };
  }, []);

  const toggleNode = (nodeId) => setExpandedNodes((prev) => ({ ...prev, [nodeId]: !prev[nodeId] }));

  return (
    <aside className="filter-panel" aria-label={t('catalog.filters.title', 'Filter products')}>
      <div className="filter-group">
        <div className="filter-head">
          <h3>{t('catalog.filters.title', 'Filter products')}</h3>
          <span style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <button type="button" className="filter-link" onClick={onClearAll}>
              {t('catalog.filters.clearAll', 'Clear all')}
            </button>
            {onCloseMobile && (
              <button type="button" className="nav-iconbtn" onClick={onCloseMobile} aria-label={t('common.close', 'Close')}>
                <FiX size={20} aria-hidden="true" />
              </button>
            )}
          </span>
        </div>
      </div>

      {/* Category tree — live from the product hierarchy API */}
      <div className="filter-group">
        <h3>{t('catalog.filters.categories', 'Categories')}</h3>
        {loadingHierarchy ? (
          <span style={{ color: 'var(--muted)', fontSize: 14 }}>{t('common.loading', 'Loading...')}</span>
        ) : hierarchy.length === 0 ? (
          <span style={{ color: 'var(--muted)', fontSize: 14 }}>{t('catalog.filters.noCategories', 'No categories found')}</span>
        ) : (
          hierarchy.map((node) => {
            const nodeKey = node.id || node.name;
            const hasChildren = Array.isArray(node.children) && node.children.length > 0;
            const expanded = !!expandedNodes[nodeKey];
            const childSelected = hasChildren && node.children.some((c) => (c.id || c.name) === activeTreeKey);
            // Case-insensitive so API names like "Peo TV" still highlight for the "PEO TV" category
            const active = activeTreeKey
              ? activeTreeKey === nodeKey || childSelected
              : activeCategory !== 'All Products' && normalizeTreeName(activeCategory) === normalizeTreeName(node.name);

            return (
              <div key={nodeKey}>
                <button
                  type="button"
                  className={`tree-node${active ? ' is-active' : ''}`}
                  aria-expanded={hasChildren ? expanded : undefined}
                  onClick={() => {
                    if (onSelectTreeNode) onSelectTreeNode(node, null);
                    else if (onSelectCategory) onSelectCategory(node.name);
                    if (hasChildren) toggleNode(nodeKey);
                  }}
                >
                  {iconFor(node.name)}
                  <span style={{ flex: 1 }}>{node.name}</span>
                  {hasChildren &&
                    (expanded ? (
                      <FiChevronDown size={16} aria-hidden="true" />
                    ) : (
                      <FiChevronRight size={16} aria-hidden="true" />
                    ))}
                </button>
                {hasChildren && expanded && (
                  <div className="tree-children">
                    {node.children.map((child) => {
                      const childActive = (child.id || child.name) === activeTreeKey;
                      return (
                        <button
                          key={child.id || child.name}
                          type="button"
                          className={`tree-node${childActive ? ' is-active' : ''}`}
                          onClick={() => {
                            if (onSelectTreeNode) onSelectTreeNode(child, node);
                            else if (onSelectCategory) onSelectCategory(node.name);
                          }}
                        >
                          <FiTag size={14} aria-hidden="true" />
                          <span>{child.name}</span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      <CheckGroup
        title={t('catalog.filters.productType', 'Product type')}
        options={typeOptions || DEFAULT_TYPES}
        selected={selectedTypes}
        counts={typeCounts}
        onToggle={onTypeToggle}
      />
      <CheckGroup
        title={t('catalog.filters.speed', 'Connection speed')}
        options={speedOptions || DEFAULT_SPEEDS}
        selected={selectedSpeeds}
        counts={speedCounts}
        onToggle={onSpeedToggle}
      />

      {onApply && (
        <button type="button" className="btn-ds btn-ds--primary btn-ds--block" onClick={onApply}>
          {t('catalog.filters.apply', 'Show results')}
        </button>
      )}
    </aside>
  );
}
