import { useState, useEffect } from 'react';
import { FilterState, filterCategories } from '../../lib/types';

interface SearchFilterPanelProps {
    filters: FilterState;
    setFilters: (filters: FilterState) => void;
}

interface BotanicalGroup {
    name: string;
    variants: string[];
    count: number;
}

export default function SearchFilterPanel({ filters, setFilters }: SearchFilterPanelProps) {
    const [botanicalGroups, setBotanicalGroups] = useState<BotanicalGroup[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());

    useEffect(() => {
        const fetchBotanicals = async () => {
            try {
                const response = await fetch('/api/knowledgebase/botanicals');
                if (!response.ok) throw new Error('Failed to fetch botanicals');
                const data = await response.json();
                setBotanicalGroups(data);
            } catch (error) {
                console.error('Error fetching botanicals:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchBotanicals();
    }, []);

    const filteredBotanicals = botanicalGroups.filter(group => 
        group.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        group.variants.some(v => v.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const toggleGroup = (name: string) => {
        setExpandedGroups(prev => {
            const next = new Set(prev);
            if (next.has(name)) {
                next.delete(name);
            } else {
                next.add(name);
            }
            return next;
        });
    };

    return (
        <div className="fixed left-0 top-0 h-full w-64 bg-white shadow-lg overflow-hidden
                        border-r border-sage-200 transition-all duration-300 z-20">
            <div className="p-4 h-full flex flex-col">
                <h3 className="text-lg font-semibold text-sage-700 mb-4">Filters</h3>
                
                {/* Search input */}
                <div className="mb-4">
                    <input
                        type="text"
                        placeholder="Search plants..."
                        value={filters.searchQuery}
                        onChange={(e) => setFilters({ ...filters, searchQuery: e.target.value })}
                        className="input-field"
                    />

                {/* Botanical Names */}
                <div className="mb-4">
                    <h4 className="form-label">Botanical Names</h4>
                    <input
                        type="text"
                        placeholder="Search botanical names..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="input-field mb-2"
                    />
                    <div className="h-48 overflow-y-auto border rounded p-2">
                        {isLoading ? (
                            <div className="text-center py-2">Loading...</div>
                        ) : (
                            filteredBotanicals.map((group) => (
                                <div key={group.name} className="mb-2">
                                    <div 
                                        className="flex items-center justify-between p-1 hover:bg-sage-50 cursor-pointer"
                                        onClick={() => toggleGroup(group.name)}
                                    >
                                        <label className="flex items-center flex-1">
                                            <input
                                                type="checkbox"
                                                checked={group.variants.some(v => filters.botanicalNames.includes(v))}
                                                onChange={(e) => {
                                                    const updated = e.target.checked
                                                        ? [...filters.botanicalNames, ...group.variants]
                                                        : filters.botanicalNames.filter(n => !group.variants.includes(n));
                                                    setFilters({ ...filters, botanicalNames: updated });
                                                }}
                                                className="mr-2"
                                            />
                                            <span>{group.name} ({group.count})</span>
                                        </label>
                                        <button className="text-xs text-sage-600">
                                            {expandedGroups.has(group.name) ? '▼' : '▶'}
                                        </button>
                                    </div>
                                    {expandedGroups.has(group.name) && (
                                        <div className="ml-6 text-sm text-gray-600">
                                            {group.variants.map(variant => (
                                                <div key={variant} className="py-1">
                                                    {variant}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Sun Exposure */}
                <div className="mb-4">
                    <h4 className="form-label">Sun Exposure</h4>
                    {filterCategories.sunExposure.map((option) => (
                        <label key={option} className="flex items-center p-1">
                            <input
                                type="checkbox"
                                checked={filters.sunExposure.includes(option)}
                                onChange={(e) => {
                                    const updated = e.target.checked
                                        ? [...filters.sunExposure, option]
                                        : filters.sunExposure.filter(item => item !== option);
                                    setFilters({ ...filters, sunExposure: updated });
                                }}
                                className="mr-2"
                            />
                            {option}
                        </label>
                    ))}
                </div>

                {/* Department */}
                <div className="mb-4"></div>
                    <h4 className="form-label">Department</h4>
                    {filterCategories.departments.map((dept) => (
                        <label key={dept} className="flex items-center p-1">
                            <input
                                type="checkbox"
                                checked={filters.departments.includes(dept)}
                                onChange={(e) => {
                                    const updated = e.target.checked
                                        ? [...filters.departments, dept]
                                        : filters.departments.filter(item => item !== dept);
                                    setFilters({ ...filters, departments: updated });
                                }}
                                className="mr-2"
                            />
                            {dept}
                        </label>
                    ))}
                </div>

                {/* Clear Filters Button */}
                <button
                    onClick={() => setFilters({
                        sunExposure: [],
                        foliageType: [],
                        lifespan: [],
                        zones: [],
                        departments: [],
                        botanicalNames: [],
                        searchQuery: ''
                    })}
                    className="btn-secondary mt-auto"
                >
                    Clear All Filters
                </button>
            </div>
        </div>
    );
}