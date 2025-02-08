'use client'
import React, { useEffect, useState, useMemo } from 'react';
import { PlantCatalog, FilterState, parsePlantSize } from './../lib/types';
import { useToast } from './../hooks/useToast';
import PlantSearchFilterPanel from './../components/shared/PlantSearchFilterPanel';
import PlantCard from './../components/cards/PlantCard';

const PlantKnowledgeBase = () => {
    const [plants, setPlants] = useState<PlantCatalog[]>([]);
    const [viewMode, setViewMode] = useState<'list' | 'card'>('card');
    const [currentPage, setCurrentPage] = useState(1);
    const [sortField, setSortField] = useState<'tag_name' | 'botanical' | 'deer_resistance' | 'no_warranty' | 'classification' | 'department'>('tag_name');
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(true);
    const initialFilterState: FilterState = {
        sunExposure: [],
        foliageType: [],
        lifespan: [],
        zones: [],
        departments: [],
        botanicalNames: [],
        searchQuery: '',
        winterizing: [],
        carNative: [],
        sizeCategories: []
    };
    const [filters, setFilters] = useState<FilterState>(initialFilterState);
    const { showToast } = useToast();
    const [isLoadingMore, setIsLoadingMore] = useState(false);

    const [isFilterPanelVisible, setIsFilterPanelVisible] = useState(false); // Changed to false by default

    const itemsPerPage = 10;

    const translateBooleanValue = (value: boolean | null) => {
        if (value === null) return 'N/A';
        return value ? 'Yes' : 'No';
    };

    const fallbackImageUrl = '/plantimage.jpg';

    useEffect(() => {
        setCurrentPage(1);
    }, [filters, sortField]);

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
                    sort: sortField,
                    includeImages: 'true'  // Add this parameter
                });

                // Add all filter parameters
                if (filters?.searchQuery) {
                    params.append('search', filters.searchQuery);
                }
                if (filters?.sunExposure?.length > 0) {
                    filters.sunExposure.forEach(value => 
                        params.append('sunExposure[]', value));
                }
                if (filters?.winterizing?.length > 0) {
                    filters.winterizing.forEach(value => 
                        params.append('winterizing[]', value));
                }
                if (filters?.carNative?.length > 0) {
                    filters.carNative.forEach(value => 
                        params.append('carNative[]', value));
                }
                if (filters?.sizeCategories?.length > 0) {
                    filters.sizeCategories.forEach(value => 
                        params.append('sizeCategories[]', value));
                }

                console.log('Fetching plants with params:', params.toString());

                const response = await fetch(`/api/knowledgebase?${params}`);
                if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
                
                const result = await response.json();
                console.log('Fetched plants:', result);
                
                if (mounted) {
                    setPlants(result.data);
                    setTotalPages(result.pagination?.totalPages || 1);
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
        console.log('Plants:', plants);
    }, [plants]);

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

    useEffect(() => {
        const storedFilters = localStorage.getItem('plantFilters');
        if (storedFilters) {
            setFilters(JSON.parse(storedFilters));
        }
    }, []);

    useEffect(() => {
        localStorage.setItem('plantFilters', JSON.stringify(filters));
    }, [filters]);

    // Remove client-side filtering since we're now doing it server-side
    const filteredPlants = plants;

    const handlePageClick = (pageNumber: number) => {
        setCurrentPage(pageNumber);
    };

    const renderPageNumbers = () => {
        const pageNumbers = [];
        const maxPagesToShow = 5;
        const startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
        const endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);

        if (startPage > 1) {
            pageNumbers.push(
                <button
                    key={1}
                    onClick={() => handlePageClick(1)}
                    className={`px-3 py-1 rounded-lg ${currentPage === 1 ? 'bg-sage-500 text-white' : 'bg-sage-200 text-sage-700 hover:bg-sage-300'}`}
                >
                    1
                </button>
            );
            if (startPage > 2) {
                pageNumbers.push(<span key="ellipsis-start" className="px-3 py-1">...</span>);
            }
        }

        for (let i = startPage; i <= endPage; i++) {
            pageNumbers.push(
                <button
                    key={i}
                    onClick={() => handlePageClick(i)}
                    className={`px-3 py-1 rounded-lg ${currentPage === i ? 'bg-sage-500 text-white' : 'bg-sage-200 text-sage-700 hover:bg-sage-300'}`}
                >
                    {i}
                </button>
            );
        }

        if (endPage < totalPages) {
            if (endPage < totalPages - 1) {
                pageNumbers.push(<span key="ellipsis-end" className="px-3 py-1">...</span>);
            }
            pageNumbers.push(
                <button
                    key={totalPages}
                    onClick={() => handlePageClick(totalPages)}
                    className={`px-3 py-1 rounded-lg ${currentPage === totalPages ? 'bg-sage-500 text-white' : 'bg-sage-200 text-sage-700 hover:bg-sage-300'}`}
                >
                    {totalPages}
                </button>
            );
        }

        return pageNumbers;
    };

    return (
        <div className="flex flex-col lg:flex-row min-h-screen bg-soft-pastel-green">
            <PlantSearchFilterPanel
                filters={filters}
                setFilters={setFilters}
                isVisible={isFilterPanelVisible}
                toggleVisibility={() => setIsFilterPanelVisible(!isFilterPanelVisible)}
            />
            
            <main className={`
                flex-1
                transition-all duration-300 
                min-h-screen
                w-full
                ${isFilterPanelVisible ? 'lg:ml-80' : ''}
            `}>
                <div className="border-b border-sage-200 bg-soft-pastel-green">
                    <div className="max-w-[95%] mx-auto py-2 px-4 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <button 
                                onClick={() => setIsFilterPanelVisible(!isFilterPanelVisible)}
                                className="text-sage-700 hover:text-sage-800 flex items-center gap-1 text-sm py-1 px-2 rounded
                                         hover:bg-sage-100/50 transition-colors duration-200"
                            >
                                <span>{isFilterPanelVisible ? '←' : '☰'}</span>
                                <span className="font-medium">
                                    {isFilterPanelVisible ? 'Hide' : 'Filters'}
                                </span>
                            </button>
                            <div className="h-4 w-px bg-sage-300 mx-2"></div>
                            <h1 className="text-base font-medium text-sage-800">Plant Knowledge Base</h1>
                        </div>
                        
                        {/* Add additional controls here if needed */}
                    </div>
                </div>

                <div className="max-w-[95%] mx-auto p-4 space-y-6">
                    {loading ? (
                        <div>Loading...</div>
                    ) : (
                        <div className="grid grid-cols-1 xl:grid-cols-2 2xl:grid-cols-3 gap-6">
                            {filteredPlants.map(plant => (
                                <PlantCard key={plant.id} plant={plant} />
                            ))}
                        </div>
                    )}
                    <div className="flex justify-between items-center mt-6">
                        <button
                            onClick={() => setCurrentPage(1)}
                            disabled={currentPage === 1}
                            className="btn-primary"
                        >
                            First
                        </button>
                        <button
                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                            disabled={currentPage === 1}
                            className="btn-primary"
                        >
                            Previous
                        </button>
                        <div className="flex gap-2">
                            {renderPageNumbers()}
                        </div>
                        <button
                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                            disabled={currentPage === totalPages}
                            className="btn-primary"
                        >
                            Next
                        </button>
                        <button
                            onClick={() => setCurrentPage(totalPages)}
                            disabled={currentPage === totalPages}
                            className="btn-primary"
                        >
                            Last
                        </button>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default PlantKnowledgeBase;
