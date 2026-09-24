import React, { useState, useEffect } from 'react';
import { FiFilter, FiChevronDown, FiChevronRight, FiX, FiLayers, FiTv, FiGlobe, FiPhone, FiTag } from 'react-icons/fi';
import { getProductHierarchy } from '../../services/productService';

const PRODUCT_TYPES = [
  { id: 'PEO TV', label: 'PEO TV' },
  { id: 'Fibre Broadband', label: 'Fibre Broadband' },
  { id: 'LTE Home', label: 'LTE Home' },
  { id: 'Voice', label: 'Voice' },
];

const SPEEDS = [
  { id: 'up_to_100', label: 'Up to 100 Mbps' },
  { id: '100_300', label: '100 – 300 Mbps' },
  { id: '300_500', label: '300 – 500 Mbps' },
  { id: 'above_500', label: 'Above 500 Mbps' },
];

export default function SidebarFilters({
  activeCategory = 'All Products',
  onSelectCategory,
  selectedTypes = [],
  onTypeToggle,
  selectedSpeeds = [],
  onSpeedToggle,
  onClearAll,
  onApply,
  onCloseMobile,
}) {
  const [hierarchy, setHierarchy] = useState([]);
  const [expandedNodes, setExpandedNodes] = useState({});
  const [loadingHierarchy, setLoadingHierarchy] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const loadHierarchy = async () => {
      try {
        const data = await getProductHierarchy();
        if (isMounted) {
          setHierarchy(Array.isArray(data) ? data : []);
          // Auto-expand all root nodes by default
          const initialExpanded = {};
          (Array.isArray(data) ? data : []).forEach((node) => {
            initialExpanded[node.id || node.name] = true;
          });
          setExpandedNodes(initialExpanded);
        }
      } catch (e) {
        console.warn('Hierarchy fetch error:', e);
      } finally {
        if (isMounted) setLoadingHierarchy(false);
      }
    };
    loadHierarchy();
    return () => {
      isMounted = false;
    };
  }, []);

  const toggleNode = (nodeId) => {
    setExpandedNodes((prev) => ({
      ...prev,
      [nodeId]: !prev[nodeId],
    }));
  };

  const getCategoryIcon = (name = '') => {
    const lower = name.toLowerCase();
    if (lower.includes('peo') || lower.includes('tv')) return <FiTv size={14} color="#0056b3" />;
    if (lower.includes('fibre') || lower.includes('broadband')) return <FiGlobe size={14} color="#0056b3" />;
    if (lower.includes('voice') || lower.includes('phone')) return <FiPhone size={14} color="#0056b3" />;
    return <FiLayers size={14} color="#0056b3" />;
  };

  return (
    <aside
      style={{
        backgroundColor: '#ffffff',
        borderRadius: '16px',
        border: '1px solid #e2e8f0',
        padding: '1.25rem',
        boxShadow: '0 4px 15px rgba(0,0,0,0.03)',
        width: '100%',
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingBottom: '1rem',
          borderBottom: '1px solid #f1f5f9',
          marginBottom: '1.2rem',
        }}
      >
        <div style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <FiFilter size={16} color="#0056b3" /> Filter Products
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button
            onClick={onClearAll}
            style={{
              background: 'none',
              border: 'none',
              color: '#0056b3',
              fontSize: '0.82rem',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            Clear All
          </button>
          {onCloseMobile && (
            <button
              type="button"
              onClick={onCloseMobile}
              aria-label="Close filters"
              className="catalog-filter-close-btn"
              style={{
                background: '#f1f5f9',
                border: 'none',
                borderRadius: '8px',
                width: '30px',
                height: '30px',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#334155',
                cursor: 'pointer',
              }}
            >
              <FiX size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Filter Body */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.4rem' }}>
        {/* Section 1: Live Category Hierarchy Tree */}
        <div>
          <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <FiLayers size={14} color="#0056b3" /> Category Tree (Live API)
          </div>

          {loadingHierarchy ? (
            <div style={{ fontSize: '0.8rem', color: '#94a3b8', fontStyle: 'italic' }}>Loading categories...</div>
          ) : hierarchy.length === 0 ? (
            <div style={{ fontSize: '0.8rem', color: '#64748b' }}>No subcategories found</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              {hierarchy.map((node) => {
                const isExpanded = expandedNodes[node.id || node.name];
                const hasChildren = Array.isArray(node.children) && node.children.length > 0;
                const isNodeActive = activeCategory === node.name;

                return (
                  <div key={node.id || node.name} style={{ borderRadius: '8px', overflow: 'hidden' }}>
                    {/* Root Node Header */}
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '0.45rem 0.6rem',
                        borderRadius: '8px',
                        backgroundColor: isNodeActive ? '#eff6ff' : '#f8fafc',
                        border: `1px solid ${isNodeActive ? '#bfdbfe' : '#e2e8f0'}`,
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                      }}
                      onClick={() => {
                        if (onSelectCategory) onSelectCategory(node.name);
                        if (hasChildren) toggleNode(node.id || node.name);
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.84rem', fontWeight: 700, color: isNodeActive ? '#0056b3' : '#1e293b' }}>
                        {getCategoryIcon(node.name)}
                        <span>{node.name}</span>
                      </div>
                      {hasChildren && (
                        <span style={{ color: '#64748b', display: 'flex', alignItems: 'center' }}>
                          {isExpanded ? <FiChevronDown size={14} /> : <FiChevronRight size={14} />}
                        </span>
                      )}
                    </div>

                    {/* Subcategory / Child Nodes */}
                    {hasChildren && isExpanded && (
                      <div style={{ paddingLeft: '1.25rem', paddingTop: '0.35rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                        {node.children.map((child) => (
                          <div
                            key={child.id || child.name}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.4rem',
                              padding: '0.35rem 0.5rem',
                              borderRadius: '6px',
                              fontSize: '0.8rem',
                              color: '#475569',
                              fontWeight: 600,
                              cursor: 'pointer',
                              backgroundColor: '#ffffff',
                              border: '1px solid transparent',
                              transition: 'all 0.15s ease',
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = '#f1f5f9';
                              e.currentTarget.style.color = '#0056b3';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = '#ffffff';
                              e.currentTarget.style.color = '#475569';
                            }}
                            onClick={() => {
                              if (onSelectCategory) onSelectCategory(node.name);
                            }}
                          >
                            <FiTag size={11} color="#94a3b8" />
                            <span>{child.name}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Section 2: Product Type */}
        <div>
          <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.75rem' }}>
            Product Type
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            {PRODUCT_TYPES.map((pt) => {
              const checked = selectedTypes.includes(pt.id);
              return (
                <label
                  key={pt.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.6rem',
                    fontSize: '0.85rem',
                    color: '#334155',
                    cursor: 'pointer',
                  }}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => onTypeToggle(pt.id)}
                    style={{
                      width: '16px',
                      height: '16px',
                      accentColor: '#0056b3',
                      cursor: 'pointer',
                    }}
                  />
                  <span>{pt.label}</span>
                </label>
              );
            })}
          </div>
        </div>

        {/* Section 3: Speed */}
        <div>
          <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.75rem' }}>
            Connection Speed
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            {SPEEDS.map((sp) => {
              const checked = selectedSpeeds.includes(sp.id);
              return (
                <label
                  key={sp.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.6rem',
                    fontSize: '0.85rem',
                    color: '#334155',
                    cursor: 'pointer',
                  }}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => onSpeedToggle(sp.id)}
                    style={{
                      width: '16px',
                      height: '16px',
                      accentColor: '#0056b3',
                      cursor: 'pointer',
                    }}
                  />
                  <span>{sp.label}</span>
                </label>
              );
            })}
          </div>
        </div>

        {/* Apply Filters Button */}
        {onApply && (
          <div style={{ marginTop: '0.5rem' }}>
            <button
              onClick={onApply}
              style={{
                width: '100%',
                backgroundColor: '#0056b3',
                color: '#ffffff',
                border: 'none',
                borderRadius: '8px',
                padding: '0.65rem 1rem',
                fontWeight: 700,
                fontSize: '0.88rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.45rem',
                boxShadow: '0 3px 10px rgba(0,86,179,0.25)',
              }}
            >
              <FiFilter size={15} />
              <span>Apply Filters</span>
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}
