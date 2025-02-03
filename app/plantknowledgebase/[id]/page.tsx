'use client'
import React, { useEffect, useState, useMemo } from 'react';
import { useParams } from 'next/navigation';
import { PlantCatalog, FilterState } from '../../lib/types';
import { LoadingSpinner } from '../../components/shared/LoadingSpinner';
import { Toast } from '../../components/shared/Toast';
import { useToast } from '../../hooks/useToast';
import { Carousel } from 'react-responsive-carousel';
import 'react-responsive-carousel/lib/styles/carousel.min.css';
import { fetchImageFromGoogle } from '../../lib/imageUtils';
import PlantDetailsHeader from '../../components/PlantDetailsHeader';
import PlantDetailsInfo from '../../components/PlantDetailsInfo';
import PlantDetailsPhotos from '../../components/PlantDetailsPhotos';
import PlantSearchFilterPanel from '../../components/shared/PlantSearchFilterPanel';
import PlantCard from '../../components/cards/PlantCard';

const PlantKnowledgeBase = () => {
    const params = useParams();
    const id = params?.id?.toString();
    console.log('Component mounted with raw params:', params); // Add raw params logging

    const [plant, setPlant] = useState<PlantCatalog | null>(null);
    const [loading, setLoading] = useState(true);
    const { showToast, toast } = useToast();
    const [images, setImages] = useState<string[]>([]);
    const [plants, setPlants] = useState<PlantCatalog[]>([]);
    const [viewMode, setViewMode] = useState<'list' | 'card'>('card');
    const [currentPage, setCurrentPage] = useState(1);
    const [sortField, setSortField] = useState<'tag_name' | 'botanical' | 'deer_resistance' | 'no_warranty' | 'classification' | 'department'>('tag_name');
    const [totalPages, setTotalPages] = useState(1);
    const initialFilterState: FilterState = {
        sunExposure: [],
        foliageType: [],
        lifespan: [],
        zones: [],
        departments: [],
        botanicalNames: [],
        searchQuery: '',
        winterizing: [],
        carNative: []
    };
    const [filters, setFilters] = useState<FilterState>(initialFilterState);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [isFilterPanelVisible, setIsFilterPanelVisible] = useState(true);

    const itemsPerPage = 10;

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
                    sort: sortField
                });

                if (filters.searchQuery) {
                    params.append('search', filters.searchQuery);
                }

                filters.sunExposure.forEach(value => 
                    params.append('sunExposure[]', value));
                filters.departments.forEach(value => 
                    params.append('departments[]', value));
                filters.foliageType.forEach(value => 
                    params.append('foliageType[]', value));
                filters.botanicalNames.forEach(value => 
                    params.append('botanicalNames[]', value));
                filters.winterizing.forEach(value => 
                    params.append('winterizing[]', value));
                filters.carNative.forEach(value => 
                    params.append('carNative[]', value));

                const response = await fetch(`/api/knowledgebase?${params}`);
                if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
                
                const result: KnowledgeBaseResponse = await response.json();
                
                if (mounted) {
                    if (Array.isArray(result.data)) {
                        setPlants(result.data);
                        setTotalPages(result.pagination.totalPages);
                    } else {
                        setPlants([]);
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

    useEffect(() => {
        const storedFilters = localStorage.getItem('plantFilters');
        if (storedFilters) {
            setFilters(JSON.parse(storedFilters));
        }
    }, []);

    useEffect(() => {
        localStorage.setItem('plantFilters', JSON.stringify(filters));
    }, [filters]);

    const filteredPlants = useMemo(() => {
        let list = plants;
        if (filters.searchQuery) {
            const query = filters.searchQuery.toLowerCase();
            list = list.filter(plant =>
                (plant.tag_name || '').toLowerCase().includes(query) ||
                (plant.botanical || '').toLowerCase().includes(query)
            );
        }
        if (filters.sunExposure.length > 0) {
            list = list.filter(plant =>
                filters.sunExposure.some(sunKey => Boolean((plant as any)[sunKey]))
            );
        }
        if (filters.winterizing.length > 0) {
            list = list.filter(plant =>
                filters.winterizing.includes(String((plant as any).winterizing || ''))
            );
        }
        if (filters.carNative.length > 0) {
            list = list.filter(plant => {
                const isNative = !!plant.car_native;
                return (isNative && filters.carNative.includes('1')) ||
                       (!isNative && filters.carNative.includes('0'));
            });
        }
        return list;
    }, [plants, filters]);

    useEffect(() => {
        const fetchPlant = async () => {
            setLoading(true);
            const apiUrl = `/api/knowledgebase/${id}`;
            console.log('Fetching from URL:', apiUrl);

            try {
                const response = await fetch(apiUrl, {
                    method: 'GET',
                    headers: {
                        'Accept': 'application/json',
                    },
                });
                
                console.log('Response status:', response.status);
                const contentType = response.headers.get('content-type');
                console.log('Content-Type:', contentType);

                if (!response.ok) {
                    const errorText = await response.text();
                    throw new Error(`HTTP error! status: ${response.status}, body: ${errorText}`);
                }

                const data = await response.json();
                console.log('Received data:', data);

                if (!data || !data.tag_name) {
                    throw new Error('Invalid plant data received');
                }

                setPlant(data);
                setImages(data.ImageUrls || []);
            } catch (error) {
                console.error('Fetch error:', error);
                showToast(error.message, 'error');
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchPlant();
        } else {
            console.error('No ID provided in params');
            setLoading(false);
        }
    }, [id]);

    // Add loading state debug
    console.log('Current state:', { loading, plantExists: !!plant, imagesCount: images.length });

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files) return;

        const formData = new FormData();
        formData.append('plantId', id as string);
        for (const file of files) {
            formData.append('images', file);
        }

        try {
            const response = await fetch(`/api/knowledgebase/${id}/image`, {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                throw new Error('Failed to upload images');
            }

            const data = await response.json();
            setImages((prevImages) => [...prevImages, ...data.imagePaths]);
        } catch (error) {
            console.error('Error uploading images:', error);
            showToast('Error uploading images. Please try again.', 'error');
        }
    };

    const handleImageReorder = (newOrder: string[]) => {
        setImages(newOrder);
        // Save new order to the backend
        fetch(`/api/knowledgebase/${id}/image/order`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ order: newOrder }),
        }).catch((error) => {
            console.error('Error saving image order:', error);
            showToast('Error saving image order. Please try again.', 'error');
        });
    };

    if (loading) {
        return <LoadingSpinner />;
    }

    if (!plant) {
        return <div className="text-center py-8 text-gray-500">Plant not found</div>;
    }

    return (
        <div className="flex flex-col lg:flex-row min-h-screen bg-gray-50">
            <PlantSearchFilterPanel
                filters={filters}
                setFilters={setFilters}
                isVisible={isFilterPanelVisible}
                toggleVisibility={() => setIsFilterPanelVisible(!isFilterPanelVisible)}
            />
            <main className="flex-1 p-6">
                <PlantDetailsHeader plant={plant} />
                <PlantDetailsInfo plant={plant} />
                <PlantDetailsPhotos 
                    images={images} 
                    onImageUpload={handleImageUpload} 
                    onImageReorder={handleImageReorder} 
                />
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
                {toast && (
                    <Toast message={toast.message} type={toast.type} onClose={() => {}} />
                )}
            </main>
        </div>
    );
};

export default PlantKnowledgeBase;
