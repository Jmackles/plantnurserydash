'use client'
import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { PlantCatalog } from '../../lib/types';
import { LoadingSpinner } from '../../components/shared/LoadingSpinner';
import { Toast } from '../../components/shared/Toast';
import { useToast } from '../../hooks/useToast';
import PlantDetailsHeader from '../../components/PlantDetailsHeader';
import PlantDetailsInfo from '../../components/PlantDetailsInfo';
import PlantDetailsPhotos from '../../components/PlantDetailsPhotos';

const PlantKnowledgeBase = () => {
    const params = useParams();
    const id = params?.id?.toString();
    const [plant, setPlant] = useState<PlantCatalog | null>(null);
    const [loading, setLoading] = useState(true);
    const { showToast, toast } = useToast();
    const [images, setImages] = useState<string[]>([]);

    useEffect(() => {
        const fetchPlant = async () => {
            setLoading(true);
            const apiUrl = `/api/plants/${id}`;
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

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files) return;

        const formData = new FormData();
        formData.append('plantId', id as string);
        for (const file of files) {
            formData.append('images', file);
        }

        try {
            const response = await fetch(`/api/plants/${id}/image`, {
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
        fetch(`/api/plants/${id}/image/order`, {
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
            <main className="flex-1 p-6">
                <PlantDetailsHeader plant={plant} />
                <PlantDetailsInfo plant={plant} />
                <PlantDetailsPhotos 
                    images={images} 
                    onImageUpload={handleImageUpload} 
                    onImageReorder={handleImageReorder} 
                />
                {toast && (
                    <Toast message={toast.message} type={toast.type} onClose={() => {}} />
                )}
            </main>
        </div>
    );
};

export default PlantKnowledgeBase;
