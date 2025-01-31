'use client'
import React, { useState, useEffect, useMemo } from 'react';
import { FilterState, filterCategories } from '../../lib/types';
import { parseBotanicalName } from '../../lib/utils/botanicalUtils';

// Default filter state
const defaultFilters: FilterState = {
    searchQuery: '',
    sunExposure: [],
    foliageType: [],
    lifespan: [],
    zones: [],
    departments: [],
    botanicalNames: [],
};

interface PlantSearchFilterPanelProps {
    filters: FilterState;
    setFilters: (filters: FilterState) => void;
    isVisible: boolean;
    toggleVisibility: () => void;
}

const PlantSearchFilterPanel: React.FC<PlantSearchFilterPanelProps> = ({
    filters = defaultFilters,
    setFilters,
    isVisible,
    toggleVisibility
}) => {
    const [botanicalGroups, setBotanicalGroups] = useState<BotanicalGroup[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
    const [selectedLetter, setSelectedLetter] = useState<string | null>(null);

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

    const alphabeticalGroups = useMemo(() => {
        const groups: { [key: string]: BotanicalGroup[] } = {};
        filteredBotanicals.forEach(group => {
            const letter = group.name.charAt(0).toUpperCase();
            if (!groups[letter]) {
                groups[letter] = [];
            }
            groups[letter].push(group);
        });

        return Object.entries(groups)
            .map(([letter, items]) => ({ letter, items }))
            .sort((a, b) => a.letter.localeCompare(b.letter));
    }, [filteredBotanicals]);

    const scrollToLetter = (letter: string) => {
        setSelectedLetter(letter);
        const element = document.getElementById(`botanical-letter-${letter}`);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
        }
    };

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

    const handleBotanicalSelection = (group: BotanicalGroup, checked: boolean) => {
        let updatedBotanicals: string[];
        
        if (checked) {
            const mainName = group.variants[0];
            updatedBotanicals = [...filters.botanicalNames, mainName];
        } else {
            updatedBotanicals = filters.botanicalNames.filter(name => 
                !group.variants.includes(name)
            );
        }

        setFilters({
            ...filters,
            botanicalNames: updatedBotanicals
        });
    };

    const renderVariantsList = (group: BotanicalGroup) => {
        const parsed = parseBotanicalName(group.name);
        return (
            <div className="ml-6 text-sm text-gray-600 border-l-2 border-sage-100">
                <div className="py-1 px-2 font-medium text-sage-700">
                    {parsed.genus} 
                    {parsed.species && <span className="italic"> {parsed.species}</span>}
                    {parsed.isHybrid && " (hybrid)"}
                </div>
                {group.variants.map(variant => (
                    <div key={variant} className="py-1 px-2 hover:bg-gray-50 text-xs">
                        {variant}
                    </div>
                ))}
            </div>
        );
    };

    const handleSearchChange = (value: string) => {
        setFilters({ ...filters, searchQuery: value });
    };

    return (
        <>
            <div className={`fixed left-0 top-0 h-full w-72 bg-white shadow-lg border-r border-sage-200 transition-transform duration-300 z-20 flex flex-col ${isVisible ? 'translate-x-0' : '-translate-x-full'}`}>
                <div className="p-4 border-b border-sage-200 bg-white flex justify-between items-center">
                    <h3 className="text-lg font-semibold text-sage-700">Filters</h3>
                    <button
                        onClick={toggleVisibility}
                        className="text-sage-600 hover:text-sage-800"
                    >
                        {isVisible ? '✕' : '☰'}
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto">
                    <div className="sticky top-0 bg-white/95 backdrop-blur-sm p-2 border-b z-10">
                        <div className="flex flex-wrap gap-1">
                            {alphabeticalGroups.map(({ letter }) => (
                                <button
                                    key={letter}
                                    onClick={() => scrollToLetter(letter)}
                                    className={`w-6 h-6 text-xs rounded-full flex items-center justify-center
                                            ${selectedLetter === letter 
                                                ? 'bg-sage-600 text-white' 
                                                : 'bg-sage-100 hover:bg-sage-200'}`}
                                >
                                    {letter}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="p-4">
                        {alphabeticalGroups.map(({ letter, items }) => (
                            <div key={letter} id={`botanical-letter-${letter}`}>
                                <div className="sticky top-0 bg-sage-50 px-2 py-1 text-sage-800 font-semibold">
                                    {letter}
                                </div>
                                {items.map((group) => (
                                    <div key={group.name} className="pl-2">
                                        <div className="flex items-center p-2 hover:bg-gray-50">
                                            <input
                                                type="checkbox"
                                                checked={filters.botanicalNames.includes(group.name)}
                                                onChange={(e) => handleBotanicalSelection(group, e.target.checked)}
                                                className="mr-2"
                                            />
                                            <div className="flex-1">
                                                <span className="font-medium">{group.name}</span>
                                                <span className="text-sm text-gray-500 ml-2">
                                                    ({group.variants.length})
                                                </span>
                                            </div>
                                            {group.variants.length > 1 && (
                                                <button
                                                    onClick={() => toggleGroup(group.name)}
                                                    className="text-sage-600 hover:text-sage-800"
                                                >
                                                    {expandedGroups.has(group.name) ? '▼' : '▶'}
                                                </button>
                                            )}
                                        </div>
                                        {expandedGroups.has(group.name) && group.variants.length > 1 && (
                                            renderVariantsList(group)
                                        )}
                                    </div>
                                ))}
                            </div>
                        ))}

                        <div className="mt-6 pt-4 border-t">
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

                        <div className="mt-6">
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
                    </div>
                </div>

                <div className="p-4 border-t border-sage-200 bg-white">
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
                        className="btn-secondary w-full"
                    >
                        Clear All Filters
                    </button>
                </div>
            </div>
            
            {!isVisible && (
                <div 
                    className="fixed left-0 top-16 transform translate-y-0 bg-sage-600 text-white px-2 py-1 rounded-r hover:bg-sage-700 cursor-pointer z-30"
                    onClick={toggleVisibility}
                    onMouseEnter={() => {/* Optional: Add tooltip or preview */}}
                >
                    ☰
                </div>
            )}
        </>
    );
};

export default PlantSearchFilterPanel;
