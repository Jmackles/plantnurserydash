'use client'
import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import SearchFilterPanel from '../components/shared/SearchFilterPanel';
import PlantCard from '../components/cards/PlantCard';
import { BenchTags, KnowledgeBaseResponse } from '../lib/types';

const PlantKnowledgeBase = () => {
    const [plants, setPlants] = useState<BenchTags[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [filter, setFilter] = useState('');
    const [viewMode, setViewMode] = useState<'list' | 'card'>('card');
    const [currentPage, setCurrentPage] = useState(1);
    const [sortField, setSortField] = useState<'TagName' | 'Botanical'>('TagName');
    const [totalPages, setTotalPages] = useState(1);
    const itemsPerPage = 10;

    const translateBooleanValue = (value: boolean | null) => {
        if (value === null) return 'N/A';
        return value ? 'Yes' : 'No';
    };

    useEffect(() => {
        const fetchPlants = async () => {
            try {
                const response = await fetch(`/api/knowledgebase?page=${currentPage}&limit=${itemsPerPage}`);
                if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
                const result: KnowledgeBaseResponse = await response.json();
                
                // Validate data before setting state
                if (Array.isArray(result.data)) {
                    setPlants(result.data);
                    setTotalPages(result.pagination.totalPages);
                } else {
                    throw new Error('Invalid data format received');
                }
            } catch (error) {
                console.error('Error fetching plants:', error);
                setPlants([]);
            }
        };

        fetchPlants();
    }, [currentPage, itemsPerPage]);

    const filteredPlants = plants
        .filter((plant) => {
            const matchesSearchQuery = 
                (plant.TagName ?? '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                (plant.Botanical ?? '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                (plant.Department ?? '').toLowerCase().includes(searchQuery.toLowerCase());

            const matchesFilter = filter === '' || (plant.Department ?? '').toLowerCase() === filter.toLowerCase();

            return matchesSearchQuery && matchesFilter;
        })
        .sort((a, b) => {
            const aVal = a[sortField] || '';
            const bVal = b[sortField] || '';
            return aVal.localeCompare(bVal);
        });

    const paginatedPlants = filteredPlants.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    return (
        <main className="p-6 max-w-7xl mx-auto">
            <h1 className="text-3xl font-bold text-sage-700 mb-8">Plant Knowledge Base</h1>
            <SearchFilterPanel
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                filter={filter}
                setFilter={setFilter}
            />
            <div className="flex justify-between mb-4">
                <div>
                    <button onClick={() => setViewMode('list')} className={`btn ${viewMode === 'list' ? 'btn-primary' : 'btn-secondary'}`}>List View</button>
                    <button onClick={() => setViewMode('card')} className={`btn ${viewMode === 'card' ? 'btn-primary' : 'btn-secondary'} ml-2`}>Card View</button>
                </div>
                <div>
                    <label className="form-label">Sort by:</label>
                    <select value={sortField} onChange={(e) => setSortField(e.target.value as 'TagName' | 'Botanical')} className="input-field">
                        <option value="TagName">Tag Name</option>
                        <option value="Botanical">Botanical Name</option>
                    </select>
                </div>
            </div>
            {viewMode === 'card' ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                    {paginatedPlants.map((plant, index) => (
                        <PlantCard key={plant.ID || index} plant={plant} />
                    ))}
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="min-w-full bg-white shadow-md rounded-lg">
                        <thead>
                            <tr>
                                <th className="py-2 px-4 border-b">Image</th>
                                <th className="py-2 px-4 border-b">Tag Name</th>
                                <th className="py-2 px-4 border-b">Botanical</th>
                                <th className="py-2 px-4 border-b">Department</th>
                                <th className="py-2 px-4 border-b">Full Sun</th>
                                <th className="py-2 px-4 border-b">Part Sun</th>
                                <th className="py-2 px-4 border-b">Shade</th>
                                <th className="py-2 px-4 border-b">Growth Rate</th>
                                <th className="py-2 px-4 border-b">Mature Size</th>
                                <th className="py-2 px-4 border-b">Zones</th>
                                <th className="py-2 px-4 border-b">Notes</th>
                                <th className="py-2 px-4 border-b">Price</th>
                                <th className="py-2 px-4 border-b">Size</th>
                                <th className="py-2 px-4 border-b">Pot Details</th>
                            </tr>
                        </thead>
                        <tbody>
                            {paginatedPlants.map((plant, index) => (
                                <tr key={plant.ID || index} className="cursor-pointer hover:bg-gray-50" 
                                    onClick={() => window.location.href = `/plantknowledgebase/${plant.ID}`}>
                                    <td className="py-2 px-4 border-b">
                                        {plant.ImageUrl && (
                                            <img 
                                                src={plant.ImageUrl}
                                                alt={plant.TagName || ''}
                                                width={128}
                                                height={128}
                                                className="object-cover"
                                            />
                                        )}
                                    </td>
                                    <td className="py-2 px-4 border-b">{plant.TagName}</td>
                                    <td className="py-2 px-4 border-b">{plant.Botanical}</td>
                                    <td className="py-2 px-4 border-b">{plant.Department}</td>
                                    <td className="py-2 px-4 border-b">{translateBooleanValue(plant.FullSun)}</td>
                                    <td className="py-2 px-4 border-b">{translateBooleanValue(plant.PartSun)}</td>
                                    <td className="py-2 px-4 border-b">{translateBooleanValue(plant.Shade)}</td>
                                    <td className="py-2 px-4 border-b">{plant.GrowthRate || 'N/A'}</td>
                                    <td className="py-2 px-4 border-b">{plant.MatureSize || 'N/A'}</td>
                                    <td className="py-2 px-4 border-b">
                                        {plant.ZoneMin && plant.ZoneMax ? `${plant.ZoneMin}-${plant.ZoneMax}` : 'N/A'}
                                    </td>
                                    <td className="py-2 px-4 border-b">{plant.Notes || 'N/A'}</td>
                                    <td className="py-2 px-4 border-b">{plant.Price || 'N/A'}</td>
                                    <td className="py-2 px-4 border-b">{plant.Size || 'N/A'}</td>
                                    <td className="py-2 px-4 border-b">
                                        {plant.PotSize ? `${plant.PotSize}${plant.PotSizeUnit || ''} ${plant.PotType || ''}` : 'N/A'}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
            <div className="flex justify-between mt-4">
                <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="btn btn-secondary"
                >
                    Previous
                </button>
                <span>Page {currentPage} of {totalPages}</span>
                <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="btn btn-secondary"
                >
                    Next
                </button>
            </div>
        </main>
    );
};

export default PlantKnowledgeBase;
