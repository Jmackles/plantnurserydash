'use client'
import React, { useState, useEffect, useMemo } from 'react';
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
    const [loading, setLoading] = useState(true);
    const itemsPerPage = 10;
    const [filters, setFilters] = useState<FilterState>({
        sunExposure: [],
        foliageType: [],
        lifespan: [],
        zones: [],
        departments: [],
        botanicalNames: [],
        searchQuery: ''
    });

    const translateBooleanValue = (value: boolean | null) => {
        if (value === null) return 'N/A';
        return value ? 'Yes' : 'No';
    };

    useEffect(() => {
        const fetchPlants = async () => {
            setLoading(true);
            try {
                // Build URL with filter parameters
                const params = new URLSearchParams({
                    page: currentPage.toString(),
                    limit: itemsPerPage.toString(),
                });

                // Add search query if present
                if (filters.searchQuery) {
                    params.append('search', filters.searchQuery);
                }

                // Add array parameters
                filters.sunExposure.forEach(value => 
                    params.append('sunExposure[]', value));
                filters.departments.forEach(value => 
                    params.append('departments[]', value));
                filters.foliageType.forEach(value => 
                    params.append('foliageType[]', value));

                params.append('sort', sortField);

                const response = await fetch(`/api/knowledgebase?${params}`);
                if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
                const result: KnowledgeBaseResponse = await response.json();
                
                // Validate data before setting state
                if (Array.isArray(result.data)) {
                    console.log(`Page ${currentPage} server response:`, result.data);
                    setPlants(result.data);
                    setTotalPages(result.pagination.totalPages);
                } else {
                    throw new Error('Invalid data format received');
                }
            } catch (error) {
                console.error('Error fetching plants:', error);
                setPlants([]);
            } finally {
                setLoading(false);
            }
        };

        fetchPlants();
    }, [currentPage, itemsPerPage, filters, sortField]); // Add filters to dependencies

    // Remove client-side filtering since it's now handled by the server
    const displayPlants = plants;

    return (
        <main className="p-6 max-w-7xl mx-auto">
            <h1 className="text-3xl font-bold text-sage-700 mb-8">Plant Knowledge Base</h1>
            <SearchFilterPanel
                filters={filters}
                setFilters={setFilters}
            />
            <div className="sticky top-0 z-10 bg-white py-3 border-b mb-4 flex justify-between">
                <div>
                    <label className="mr-2">Sort by:</label>
                    <select value={sortField} onChange={(e) => setSortField(e.target.value as typeof sortField)}>
                        <option value="TagName">TagName</option>
                        <option value="Botanical">Botanical</option>
                    </select>
                </div>
                <div>
                    <button onClick={() => setViewMode('list')}>List</button>
                    <button onClick={() => setViewMode('card')} className="ml-2">Card</button>
                </div>
            </div>
            {loading ? (
                <div>Loading...</div>
            ) : displayPlants.length === 0 ? (
                <div>No data found for page {currentPage}</div>
            ) : viewMode === 'card' ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                    {displayPlants.map((plant) => (
                        <PlantCard key={plant.ID} plant={plant} />
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
                            {displayPlants.map((plant) => (
                                <tr key={plant.ID} className="cursor-pointer hover:bg-gray-50" 
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
            <div className="sticky bottom-0 bg-white py-3 border-t flex flex-col items-center">
                {/* scroll to top button */}
                <button
                    onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                    className="btn btn-secondary mb-2"
                >
                    Scroll to Top
                </button>

                <div className="flex items-center space-x-1">
                    {/* first page */}
                    {currentPage > 1 && (
                        <>
                            <button onClick={() => setCurrentPage(1)}>First</button>
                            <button onClick={() => setCurrentPage(currentPage - 1)}>Prev</button>
                        </>
                    )}
                    {/* page links */}
                    {Array.from({ length: totalPages }, (_, i) => i + 1)
                        .filter(p => Math.abs(p - currentPage) < 5 || p === 1 || p === totalPages)
                        .map((p, idx, arr) => (
                            <React.Fragment key={p}>
                                {/* "..." ellipses */}
                                {idx > 0 && p - (arr[idx - 1]) > 1 && <span>...</span>}
                                <button
                                    onClick={() => setCurrentPage(p)}
                                    className={p === currentPage ? 'font-bold' : ''}
                                >
                                    {p}
                                </button>
                            </React.Fragment>
                        ))
                    }
                    {/* next page */}
                    {currentPage < totalPages && (
                        <>
                            <button onClick={() => setCurrentPage(currentPage + 1)}>Next</button>
                            <button onClick={() => setCurrentPage(totalPages)}>Last</button>
                        </>
                    )}
                </div>
            </div>
        </main>
    );
};

export default PlantKnowledgeBase;
