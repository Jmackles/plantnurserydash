'use client'
import React from 'react';

interface SearchFilterPanelProps {
    filter: string;
    setFilter: (filter: string) => void;
    isVisible: boolean;
    toggleVisibility: () => void;
}

const SearchFilterPanel: React.FC<SearchFilterPanelProps> = ({
    searchQuery,
    setFilter,
    isVisible,
    toggleVisibility
}) => {
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

                <div className="flex-1 overflow-y-auto p-4">
                    <h4 className="form-label">Status</h4>
                    <label className="flex items-center p-1">
                        <input
                            type="radio"
                            name="status"
                            value=""
                            checked={filter === ''}
                            onChange={() => setFilter('')}
                            className="mr-2"
                        />
                        All
                    </label>
                    <label className="flex items-center p-1">
                        <input
                            type="radio"
                            name="status"
                            value="active"
                            checked={filter === 'active'}
                            onChange={() => setFilter('active')}
                            className="mr-2"
                        />
                        Active
                    </label>
                    <label className="flex items-center p-1">
                        <input
                            type="radio"
                            name="status"
                            value="inactive"
                            checked={filter === 'inactive'}
                            onChange={() => setFilter('inactive')}
                            className="mr-2"
                        />
                        Inactive
                    </label>
                </div>

                <div className="p-4 border-t border-sage-200 bg-white">
                    <button
                        onClick={() => {
                            setSearchQuery('');
                            setFilter('');
                        }}
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

export default SearchFilterPanel;