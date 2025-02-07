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
    const [isFilterPanelVisible, setIsFilterPanelVisible] = useState(true);

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

    return (
        <div className="flex flex-col lg:flex-row min-h-screen bg-gray-50">
            <PlantSearchFilterPanel
                filters={filters}
                setFilters={setFilters}
                isVisible={isFilterPanelVisible}
                toggleVisibility={() => setIsFilterPanelVisible(!isFilterPanelVisible)}
            />
            <main className={`
                flex-1 p-4 lg:p-8 
                transition-all duration-300 
                min-h-screen
                w-full
                ${isFilterPanelVisible ? 'lg:ml-80' : ''}
            `}>
                <div className={`
                    sticky top-0 z-40 mb-4 
                    ${isFilterPanelVisible ? 'lg:hidden' : ''}
                `}>
                    <button
                        onClick={() => setIsFilterPanelVisible(!isFilterPanelVisible)}
                        className="btn-primary"
                    >
                        Toggle Filters
                    </button>
                </div>
                <div className="max-w-7xl mx-auto space-y-6">
                    {loading ? (
                        <div>Loading...</div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredPlants.map(plant => (
                                <PlantCard key={plant.id} plant={plant} />
                            ))}
                        </div>
                    )}
                    <div className="flex justify-between items-center mt-6">
                        <button
                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                            disabled={currentPage === 1}
                            className="btn-secondary"
                        >
                            Previous
                        </button>
                        <span>Page {currentPage} of {totalPages}</span>
                        <button
                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                            disabled={currentPage === totalPages}
                            className="btn-secondary"
                        >
                            Next
                        </button>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default PlantKnowledgeBase;
