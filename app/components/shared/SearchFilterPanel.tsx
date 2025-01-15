import React from 'react';

interface SearchFilterPanelProps {
    searchQuery: string;
    setSearchQuery: (query: string) => void;
    filter: string;
    setFilter: (filter: string) => void;
}

const SearchFilterPanel: React.FC<SearchFilterPanelProps> = ({ searchQuery, setSearchQuery, filter, setFilter }) => {
    return (
        <div className="p-4 bg-white shadow-md rounded-lg mb-4">
            <h2 className="text-xl font-bold mb-4">Search and Filter</h2>
            <div className="mb-4">
                <label className="form-label">Search:</label>
                <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="input-field"
                    placeholder="Search by name, phone, or email"
                />
            </div>
            <div>
                <label className="form-label">Filter:</label>
                <select
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    className="input-field"
                >
                    <option value="">All</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                </select>
            </div>
        </div>
    );
};

export default SearchFilterPanel;