import React, { useState } from 'react';
import { FilterState, filterCategories } from '../../lib/types';

interface SearchFilterPanelProps {
    filters: FilterState;
    setFilters: (filters: FilterState) => void;
}

const SearchFilterPanel: React.FC<SearchFilterPanelProps> = ({ filters, setFilters }) => {
    const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['sunExposure']));

    const toggleSection = (section: string) => {
        const newExpanded = new Set(expandedSections);
        if (newExpanded.has(section)) {
            newExpanded.delete(section);
        } else {
            newExpanded.add(section);
        }
        setExpandedSections(newExpanded);
    };

    const updateFilters = (category: keyof typeof filterCategories, value: string) => {
        const currentValues = filters[category] as string[];
        const newValues = currentValues.includes(value)
            ? currentValues.filter(v => v !== value)
            : [...currentValues, value];
        
        setFilters({
            ...filters,
            [category]: newValues
        });
    };

    return (
        <div className="flex gap-4 p-4 bg-white shadow mb-4">
            {/* Search Input */}
            <div className="flex-1">
                <input
                    type="text"
                    placeholder="Search all plants..."
                    className="w-full p-3 border rounded text-lg"
                    value={filters.searchQuery}
                    onChange={(e) => setFilters({ ...filters, searchQuery: e.target.value })}
                />
            </div>

            {/* Filter Sections */}
            <div className="w-64 space-y-4 max-h-[600px] overflow-y-auto">
                {Object.entries(filterCategories).map(([category, options]) => (
                    <div key={category} className="border rounded p-2">
                        <button
                            className="w-full flex justify-between items-center"
                            onClick={() => toggleSection(category)}
                        >
                            <span className="font-medium">{category}</span>
                            <span>{expandedSections.has(category) ? '−' : '+'}</span>
                        </button>
                        
                        {expandedSections.has(category) && (
                            <div className="mt-2 space-y-2 max-h-40 overflow-y-auto">
                                {options.map(option => (
                                    <label key={option} className="flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            checked={filters[category as keyof FilterState].includes(option)}
                                            onChange={() => updateFilters(category as keyof typeof filterCategories, option)}
                                        />
                                        <span>{option}</span>
                                    </label>
                                ))}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default SearchFilterPanel;