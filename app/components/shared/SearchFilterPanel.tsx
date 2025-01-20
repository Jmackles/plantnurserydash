import React from 'react';

interface SearchFilterPanelProps {
    searchQuery: string;
    setSearchQuery: (query: string) => void;
    filter: string;
    setFilter: (filter: string) => void;
}

const SearchFilterPanel: React.FC<SearchFilterPanelProps> = ({ searchQuery, setSearchQuery, filter, setFilter }) => {
    return (
        <div className="mb-4">
            <div className="mb-2">
                <label className="form-label">Search:</label>
                <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="input-field"
                />
            </div>
            <div>
                <label className="form-label">Filter by Department:</label>
                <select
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    className="input-field"
                >
                    <option value="">All</option>
                    <option value="Sun">Sun</option>
                    <option value="Part Sun">Part Sun</option>
                    <option value="Shade">Shade</option>
                    {/* Add more filter options as needed */}
                </select>
            </div>
        </div>
    );
};

export default SearchFilterPanel;