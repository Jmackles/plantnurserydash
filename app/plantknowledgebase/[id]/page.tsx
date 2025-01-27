'use client'
import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { BenchTags } from '../../lib/types';

const PlantDetails = () => {
    const { id } = useParams();
    const [plant, setPlant] = useState<BenchTags | null>(null);
    const [loading, setLoading] = useState(true);

    const translateValue = (value: boolean | undefined) => {
        if (value === undefined) return 'N/A';
        return value ? 'Yes' : 'No';
    };

    useEffect(() => {
        const fetchPlant = async () => {
            setLoading(true);
            try {
                const response = await fetch(`/api/knowledgebase/access/${id}`);
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                const data = await response.json();
                setPlant(data);
            } catch (error) {
                console.error('Error fetching plant:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchPlant();
    }, [id]);

    if (loading) {
        return <div>Loading...</div>;
    }

    if (!plant) {
        return <div>Plant not found</div>;
    }

    return (
        <main className="p-6 max-w-7xl mx-auto">
            <h1 className="text-3xl font-bold text-sage-700 mb-8">{plant.TagName}</h1>
            <div className="bg-white shadow-md rounded-lg p-4">
                {plant.ImageUrl && (
                    <img src={plant.ImageUrl} alt={plant.TagName} className="w-32 h-32 object-cover mb-4" />
                )}
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
        </main>
    );
};

export default PlantDetails;
