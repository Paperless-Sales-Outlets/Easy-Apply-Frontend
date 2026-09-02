import React, { useState } from 'react';
import Icon from '../Icon';

const FilterPanel = ({ categories, onFilterChange, onPriceRangeChange }) => {
  const [selectedCategory, setSelectedCategory] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');

  const handleCategoryChange = (category) => {
    const newCategory = selectedCategory === category ? '' : category;
    setSelectedCategory(newCategory);
    onFilterChange(newCategory);
  };

  const handleMinPriceChange = (e) => {
    const value = e.target.value;
    setMinPrice(value);
    onPriceRangeChange(value, maxPrice);
  };

  const handleMaxPriceChange = (e) => {
    const value = e.target.value;
    setMaxPrice(value);
    onPriceRangeChange(minPrice, value);
  };

  const handleClearFilters = () => {
    setSelectedCategory('');
    setMinPrice('');
    setMaxPrice('');
    onFilterChange('');
    onPriceRangeChange('', '');
  };

  const hasActiveFilters = selectedCategory || minPrice || maxPrice;

  return (
    <div
      style={{
        backgroundColor: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: '12px',
        padding: '1.5rem',
        marginBottom: '1.5rem',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1.25rem',
          paddingBottom: '1rem',
          borderBottom: '1px solid #e2e8f0',
        }}
      >
        <h3
          style={{
            fontSize: '1.1rem',
            fontWeight: 600,
            color: '#1e293b',
            margin: 0,
          }}
        >
          Filters
        </h3>
        {hasActiveFilters && (
          <button
            onClick={handleClearFilters}
            style={{
              background: 'none',
              border: 'none',
              color: '#0056b3',
              fontSize: '0.85rem',
              fontWeight: 500,
              cursor: 'pointer',
              padding: '0.25rem 0.5rem',
              borderRadius: '8px',
              transition: 'background-color 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#f0f7ff';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            Clear All
          </button>
        )}
      </div>

      {/* Category Filter */}
      <div style={{ marginBottom: '1.5rem' }}>
        <label
          style={{
            display: 'block',
            fontSize: '0.9rem',
            fontWeight: 600,
            color: '#475569',
            marginBottom: '0.75rem',
          }}
        >
          Category
        </label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
          {categories && categories.length > 0 ? (
            categories.map((category) => (
              <button
                key={category}
                onClick={() => handleCategoryChange(category)}
                style={{
                  padding: '0.5rem 1rem',
                  border: `1px solid ${selectedCategory === category ? '#0056b3' : '#e2e8f0'}`,
                  borderRadius: '16px',
                  backgroundColor: selectedCategory === category ? '#0056b3' : '#ffffff',
                  color: selectedCategory === category ? '#ffffff' : '#475569',
                  fontSize: '0.85rem',
                  fontWeight: 500,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  if (selectedCategory !== category) {
                    e.currentTarget.style.borderColor = '#0056b3';
                    e.currentTarget.style.backgroundColor = '#f0f7ff';
                  }
                }}
                onMouseLeave={(e) => {
                  if (selectedCategory !== category) {
                    e.currentTarget.style.borderColor = '#e2e8f0';
                    e.currentTarget.style.backgroundColor = '#ffffff';
                  }
                }}
              >
                {category}
              </button>
            ))
          ) : (
            <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>No categories available</span>
          )}
        </div>
      </div>

      {/* Price Range Filter */}
      <div>
        <label
          style={{
            display: 'block',
            fontSize: '0.9rem',
            fontWeight: 600,
            color: '#475569',
            marginBottom: '0.75rem',
          }}
        >
          Price Range (LKR)
        </label>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <div style={{ flex: 1 }}>
            <input
              type="number"
              value={minPrice}
              onChange={handleMinPriceChange}
              placeholder="Min"
              min="0"
              style={{
                width: '100%',
                padding: '0.6rem 0.75rem',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                fontSize: '0.85rem',
                transition: 'border-color 0.2s ease',
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#0056b3';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#e2e8f0';
              }}
            />
          </div>
          <span style={{ color: '#94a3b8' }}>—</span>
          <div style={{ flex: 1 }}>
            <input
              type="number"
              value={maxPrice}
              onChange={handleMaxPriceChange}
              placeholder="Max"
              min="0"
              style={{
                width: '100%',
                padding: '0.6rem 0.75rem',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                fontSize: '0.85rem',
                transition: 'border-color 0.2s ease',
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#0056b3';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#e2e8f0';
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default FilterPanel;
