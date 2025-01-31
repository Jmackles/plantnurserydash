'use client'
import React from 'react';

interface CustomerSearchFilterPanelProps {
    searchQuery: string;
    setSearchQuery: (query: string) => void;
    filter: string;
    setFilter: (filter: string) => void;
}

const CustomerSearchFilterPanel: React.FC<CustomerSearchFilterPanelProps> = ({
    searchQuery,
    setSearchQuery,
    filter,
    setFilter
}) => {
    return (
        <div className="fixed left-0 top-0 h-full w-72 bg-white shadow-lg border-r border-sage-200 transition-all duration-300 z-20 flex flex-col">
            <div className="p-4 border-b border-sage-200 bg-white">
                <h3 className="text-lg font-semibold text-sage-700">Filters</h3>
                <input
                    type="text"
                    placeholder="Search customers..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="input-field mt-2"
                />
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
    );
};

export default CustomerSearchFilterPanel;
