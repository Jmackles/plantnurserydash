'use client'
import React, { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import SearchFilterPanel from '../components/shared/SearchFilterPanel';
import PlantCard from '../components/cards/PlantCard';
import { BenchTags, KnowledgeBaseResponse } from '../lib/types';
import { useToast } from '../hooks/useToast'; // Create this custom hook
import { LoadingSpinner } from '../components/shared/LoadingSpinner'; // Create this component

const PlantKnowledgeBase = () => {
    const [plants, setPlants] = useState<BenchTags[]>([]);
    const [viewMode, setViewMode] = useState<'list' | 'card'>('card');
    const [currentPage, setCurrentPage] = useState(1);
    const [sortField, setSortField] = useState<'TagName' | 'Botanical'>('TagName');
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState<FilterState>({
        sunExposure: [],
        foliageType: [],
        lifespan: [],
        zones: [],
        departments: [],
        botanicalNames: [],
        searchQuery: ''
    });
    const { showToast } = useToast();
    const [isLoadingMore, setIsLoadingMore] = useState(false);

    const itemsPerPage = 10;

    const translateBooleanValue = (value: boolean | null) => {
        if (value === null) return 'N/A';
        return value ? 'Yes' : 'No';
    };

    const fallbackImageUrl = '/plantimage.jpg';

    useEffect(() => {
        let mounted = true;

        const fetchPlants = async () => {
            if (!mounted) return;
            setLoading(true);
            setIsLoadingMore(true);
            
            try {
                const params = new URLSearchParams({
                    page: currentPage.toString(),
                    limit: itemsPerPage.toString(),
                    sort: sortField
                });

                // Add filters to params
                if (filters.searchQuery) {
                    params.append('search', filters.searchQuery);
                }

                filters.sunExposure.forEach(value => 
                    params.append('sunExposure[]', value));
                filters.departments.forEach(value => 
                    params.append('departments[]', value));
                filters.foliageType.forEach(value => 
                    params.append('foliageType[]', value));
<<<<<<< HEAD
                filters.botanicalNames.forEach(value => 
                    params.append('botanicalNames[]', value));
=======
>>>>>>> f2985d72c6dca2efa7f8f889e5d28b789e96bbb3

                const response = await fetch(`/api/knowledgebase?${params}`);
                if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
                
                const result: KnowledgeBaseResponse = await response.json();
                
                if (mounted) {
                    if (Array.isArray(result.data)) {
                        setPlants(result.data);
                        setTotalPages(result.pagination.totalPages);
                    } else {
                        throw new Error('Invalid data format received');
                    }
                }
            } catch (error) {
                console.error('Error fetching plants:', error);
                showToast('Error loading plants. Please try again.', 'error');
                if (mounted) setPlants([]);
            } finally {
                if (mounted) {
                    setLoading(false);
                    setIsLoadingMore(false);
                }
            }
        };

        fetchPlants();

        return () => {
            mounted = false;
        };
    }, [currentPage, sortField, filters]);

    useEffect(() => {
        const handleKeyPress = (e: KeyboardEvent) => {
            if (e.key === 'ArrowLeft' && currentPage > 1) {
                setCurrentPage(prev => prev - 1);
            } else if (e.key === 'ArrowRight' && currentPage < totalPages) {
                setCurrentPage(prev => prev + 1);
            }
        };

        window.addEventListener('keydown', handleKeyPress);
        return () => window.removeEventListener('keydown', handleKeyPress);
    }, [currentPage, totalPages]);

    const displayPlants = plants;

    const LoadingSkeleton = () => (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
                <div key={i} className="loading-skeleton h-64 rounded-lg"></div>
            ))}
        </div>
    );

    return (
<<<<<<< HEAD
        <div className="flex min-h-screen bg-gray-50">
=======
        <div className="flex min-h-screen">
>>>>>>> f2985d72c6dca2efa7f8f889e5d28b789e96bbb3
            <SearchFilterPanel
                filters={filters}
                setFilters={setFilters}
            />
<<<<<<< HEAD
            <main className="flex-1 p-8 ml-80 max-w-[calc(100vw-320px)] min-h-screen">
                <div className="max-w-7xl mx-auto space-y-6">
                    <h1 className="text-4xl font-bold text-sage-700 tracking-tight">
                        Plant Knowledge Base
                    </h1>

                    {/* Controls Section */}
                    <div className="sticky top-4 z-10 bg-white/95 backdrop-blur-sm p-4 rounded-xl shadow-sm 
                                  border border-sage-100 transition-shadow duration-200 hover:shadow-md">
                        <div className="flex justify-between items-center">
                            <div className="flex items-center space-x-4">
                                <label className="text-sage-600 font-medium">Sort by:</label>
                                <select 
                                    value={sortField} 
                                    onChange={(e) => setSortField(e.target.value as typeof sortField)}
                                    className="border border-sage-200 rounded-lg p-2 bg-white hover:border-sage-300 
                                             focus:outline-none focus:ring-2 focus:ring-sage-500 focus:border-transparent
                                             transition-all duration-200"
                                >
                                    <option value="TagName">Tag Name</option>
                                    <option value="Botanical">Botanical Name</option>
                                </select>
                            </div>
                            <div className="flex items-center space-x-2">
                                <button 
                                    onClick={() => setViewMode('list')}
                                    className={`px-4 py-2 rounded-lg transition-all duration-200
                                              ${viewMode === 'list' 
                                                ? 'bg-sage-600 text-white shadow-md' 
                                                : 'bg-white border border-sage-200 text-sage-600 hover:bg-sage-50'}`}
                                >
                                    List View
                                </button>
                                <button 
                                    onClick={() => setViewMode('card')}
                                    className={`px-4 py-2 rounded-lg transition-all duration-200
                                              ${viewMode === 'card' 
                                                ? 'bg-sage-600 text-white shadow-md' 
                                                : 'bg-white border border-sage-200 text-sage-600 hover:bg-sage-50'}`}
                                >
                                    Card View
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Content Section */}
                    <div className="bg-white rounded-xl shadow-sm p-6 border border-sage-100
                                  transition-shadow duration-200 hover:shadow-md">
                        {loading ? (
                            <LoadingSkeleton />
                        ) : displayPlants.length === 0 ? (
                            <div className="text-center py-8 text-gray-500">
                                <p className="text-xl">No plants found</p>
                                <button 
                                    onClick={() => setFilters({ ...filters, searchQuery: '' })}
                                    className="mt-4 text-sage-600 hover:text-sage-700"
                                >
                                    Clear filters
                                </button>
                            </div>
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
                                                    <div className="relative w-16 h-16">
                                                        <img 
                                                            src={plant.ImageUrl || fallbackImageUrl}
                                                            alt={plant.TagName || 'Plant Image'}
                                                            className="w-16 h-16 object-cover rounded-lg"
                                                            onError={(e) => {
                                                                const target = e.target as HTMLImageElement;
                                                                target.onerror = null; // Prevent infinite loop
                                                                target.src = fallbackImageUrl;
                                                            }}
                                                        />
                                                    </div>
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
                    </div>

                    {/* Pagination Section */}
                    <div className="sticky bottom-6 mt-6">
                        <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-lg py-4 px-6 
                                      border border-sage-100 transition-all duration-300">
                            <button
                                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                                className="mb-4 px-4 py-2 text-sage-600 hover:text-sage-700 
                                         flex items-center space-x-2 mx-auto
                                         transition-all duration-200 hover:scale-105"
                            >
                                <span>↑</span>
                                <span>Scroll to Top</span>
                            </button>

                            <div className="flex items-center justify-center space-x-2">
                                {currentPage > 1 && (
                                    <>
                                        <button 
                                            onClick={() => setCurrentPage(1)}
                                            className="px-3 py-1 rounded hover:bg-sage-100 transition-colors"
                                            disabled={isLoadingMore}
                                        >
                                            ←← First
                                        </button>
                                        <button onClick={() => setCurrentPage(currentPage - 1)}>Prev</button>
                                    </>
                                )}
                                {Array.from({ length: totalPages }, (_, i) => i + 1)
                                    .filter(p => Math.abs(p - currentPage) < 5 || p === 1 || p === totalPages)
                                    .map((p, idx, arr) => (
                                            <React.Fragment key={p}>
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
                                {currentPage < totalPages && (
                                    <>
                                        <button onClick={() => setCurrentPage(currentPage + 1)}>Next</button>
                                        <button onClick={() => setCurrentPage(totalPages)}>Last</button>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
=======
            <main className="flex-1 p-6 ml-64"> {/* Add margin-left to accommodate sidebar */}
                <h1 className="text-3xl font-bold text-sage-700 mb-8">Plant Knowledge Base</h1>
                <div className="sticky top-0 z-10 bg-white py-3 border-b mb-4 flex justify-between items-center">
                    <div className="flex items-center">
                        <label className="mr-2">Sort by:</label>
                        <select 
                            value={sortField} 
                            onChange={(e) => setSortField(e.target.value as typeof sortField)}
                            className="border rounded p-1"
                        >
                            <option value="TagName">TagName</option>
                            <option value="Botanical">Botanical</option>
                        </select>
                    </div>
                    <div className="flex items-center">
                        <button 
                            onClick={() => setViewMode('list')}
                            className={`px-4 py-2 ${viewMode === 'list' ? 'bg-sage-700 text-white' : 'bg-gray-200'}`}
                        >
                            List
                        </button>
                        <button 
                            onClick={() => setViewMode('card')} 
                            className={`ml-2 px-4 py-2 ${viewMode === 'card' ? 'bg-sage-700 text-white' : 'bg-gray-200'}`}
                        >
                            Card
                        </button>
                    </div>
                </div>
                {loading ? (
                    <LoadingSkeleton />
                ) : displayPlants.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                        <p className="text-xl">No plants found</p>
                        <button 
                            onClick={() => setFilters({ ...filters, searchQuery: '' })}
                            className="mt-4 text-sage-600 hover:text-sage-700"
                        >
                            Clear filters
                        </button>
                    </div>
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
                                            {plant.ImageUrl ? (
                                                <img 
                                                    src={plant.ImageUrl}
                                                    alt={plant.TagName || ''}
                                                    width={128}
                                                    height={128}
                                                    className="object-cover"
                                                    onError={(e) => e.currentTarget.src = fallbackImageUrl}
                                                />
                                            ) : (
                                                <img 
                                                    src={fallbackImageUrl}
                                                    alt="Fallback Image"
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
                <div className="sticky bottom-0 bg-white/80 backdrop-blur-sm py-3 border-t 
                              flex flex-col items-center transition-all duration-300">
                    {/* scroll to top button */}
                    <button
                        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                        className="btn-secondary mb-2 hover:scale-105 transition-transform"
                    >
                        ↑ Scroll to Top
                    </button>

                    <div className="flex items-center space-x-2">
                        {/* first page */}
                        {currentPage > 1 && (
                            <>
                                <button 
                                    onClick={() => setCurrentPage(1)}
                                    className="px-3 py-1 rounded hover:bg-sage-100 transition-colors"
                                    disabled={isLoadingMore}
                                >
                                    ←← First
                                </button>
                                <button onClick={() => setCurrentPage(currentPage - 1)}>Prev</button>
                            </>
                        )}
                        {/* page links */}
                        {Array.from({ length: totalPages }, (_, i) => i + 1)
                            .filter(p => Math.abs(p - currentPage) < 5 || p === 1 || p === totalPages)
                            .map((p, idx, arr) => (
                                <React.Fragment key={p}>
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
>>>>>>> f2985d72c6dca2efa7f8f889e5d28b789e96bbb3
            </main>
        </div>
    );
};

export default PlantKnowledgeBase;
