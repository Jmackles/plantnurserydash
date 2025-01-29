'use client'
import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { BenchTags } from '../../lib/types';
import { LoadingSpinner } from '../../components/shared/LoadingSpinner';
import { Toast } from '../../components/shared/Toast';
import { useToast } from '../../hooks/useToast';

const PlantDetails = () => {
    const { id } = useParams();
    const [plant, setPlant] = useState<BenchTags | null>(null);
    const [loading, setLoading] = useState(true);
    const { showToast, toast } = useToast();

    const translateValue = (value: boolean | undefined) => {
        if (value === undefined) return 'N/A';
        return value ? 'Yes' : 'No';
    };

    useEffect(() => {
        const fetchPlant = async () => {
            setLoading(true);
            try {
                const response = await fetch(`/api/knowledgebase/${id}`);
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                const data = await response.json();
                setPlant(data);
            } catch (error) {
                console.error('Error fetching plant:', error);
                showToast('Error loading plant details. Please try again.', 'error');
            } finally {
                setLoading(false);
            }
        };

        fetchPlant();
    }, [id]);

    if (loading) {
        return <LoadingSpinner />;
    }

    if (!plant) {
        return <div className="text-center py-8 text-gray-500">Plant not found</div>;
    }

    const fallbackImageUrl = '/plantimage.jpg';

    return (
        <main className="p-6 max-w-7xl mx-auto">
            <h1 className="text-3xl font-bold text-sage-700 mb-8">{plant.TagName}</h1>
            <div className="bg-white shadow-md rounded-lg p-6">
                <div className="relative w-32 h-32 mb-4">
                    <img 
                        src={plant.ImageUrl || fallbackImageUrl}
                        alt={plant.TagName || 'Plant Image'}
                        className="w-32 h-32 object-cover rounded-lg"
                        onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.onerror = null;
                            target.src = fallbackImageUrl;
                        }}
                    />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <p><strong>Botanical:</strong> {plant.Botanical}</p>
                    <p><strong>Department:</strong> {plant.Department}</p>
                    <p><strong>Sun:</strong> {translateValue(plant.FullSun)}</p>
                    <p><strong>Part Sun:</strong> {translateValue(plant.PartSun)}</p>
                    <p><strong>Shade:</strong> {translateValue(plant.Shade)}</p>
                    <p><strong>Growth Rate:</strong> {plant.GrowthRate}</p>
                    <p><strong>Mature Size:</strong> {plant.MatureSize}</p>
                    <p><strong>Winterizing:</strong> {plant.Winterizing}</p>
                    <p><strong>Special Care/Attributes:</strong> {plant.Notes || 'N/A'}</p>
                    <p><strong>Price:</strong> {plant.Price}</p>
                    <p><strong>Size:</strong> {plant.Size}</p>
                    <p><strong>Pot Size:</strong> {plant.PotSize}</p>
                    <p><strong>Pot Type:</strong> {plant.PotType}</p>
                </div>
            </div>
            {toast && (
                <Toast message={toast.message} type={toast.type} />
            )}
        </main>
    );
};

export default PlantDetails;
