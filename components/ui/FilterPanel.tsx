// components/controls/FilterPanel.tsx
'use client';

import { FilterConfig } from '@/lib/types';

interface FilterPanelProps {
  filter: FilterConfig;
  onFilterChange: (filter: FilterConfig) => void;
  availableCategories: string[];
}

export default function FilterPanel({
  filter,
  onFilterChange,
  availableCategories
}: FilterPanelProps) {
  const handleCategoryToggle = (category: string) => {
    const newCategories = filter.categories.includes(category)
      ? filter.categories.filter(c => c !== category)
      : [...filter.categories, category];
    
    onFilterChange({
      ...filter,
      categories: newCategories
    });
  };

  const handleAggregationChange = (aggregation: FilterConfig['aggregation']) => {
    onFilterChange({
      ...filter,
      aggregation
    });
  };

  const handleSelectAll = () => {
    onFilterChange({
      ...filter,
      categories: availableCategories
    });
  };

  const handleClearAll = () => {
    onFilterChange({
      ...filter,
      categories: []
    });
  };

  return (
    <div className="filter bg-white p-4 rounded-lg border border-gray-200">
      <h3 className="text-lg font-semibold mb-4">Filters</h3>

      {/* Categories */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <label className="block text-sm font-medium text-gray-700">
            Categories
          </label>
          <div className="space-x-6">
            <button
              onClick={handleSelectAll}
              className="spacing text-xs text-blue-600 hover:text-blue-700"
            >
              Select All
            </button>
            <button
              onClick={handleClearAll}
              className="spacing text-xs text-gray-600 hover:text-gray-700"
            >
              Clear
            </button>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-2">
          {availableCategories.map(category => (
            <button
              key={category}
              onClick={() => handleCategoryToggle(category)}
              className={`filter-btn px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                filter.categories.includes(category) || filter.categories.length === 0
                  ? 'bg-blue-100 text-blue-700 border-2 border-blue-500'
                  : 'bg-gray-100 text-gray-600 border-2 border-gray-300'
              }`}
            >
              Category {category}
            </button>
          ))}
        </div>
      </div>

      {/* Aggregation */}
      <div className='time-aggregation '>
        <label className="block text-sm font-medium text-gray-700 mb-4">
          Time Aggregation
        </label>
        
        <div className="grid grid-cols-2 gap-2">
          {(['none', '1min', '5min', '1hour'] as const).map(agg => (
            <button
              key={agg}
              onClick={() => handleAggregationChange(agg)}
              className={`filter-btn px-3 py-2 rounded text-sm font-medium transition-colors ${
                filter.aggregation === agg
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {agg === 'none' ? 'No Aggregation' : agg.toUpperCase()}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}