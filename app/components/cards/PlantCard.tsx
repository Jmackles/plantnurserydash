import React, { useState, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { PlantCatalog } from '../../lib/types';
import WinterizingBadge from '../badges/WinterizingBadge';

interface PlantCardProps {
    plant: PlantCatalog;
}

const PlantCard: React.FC<PlantCardProps> = ({ plant }) => {
    const fallbackImageUrl = '/plantimage.jpg';
    const [imageUrl, setImageUrl] = useState(() => {
        const path = plant.images?.[0]?.image_path;
        if (!path) return fallbackImageUrl;
        return `/api/images?path=${encodeURIComponent(path)}`;
    });
    const [imageError, setImageError] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const [reloadKey, setReloadKey] = useState(Date.now()); // New state to force component reload
    const [tempPreviewUrl, setTempPreviewUrl] = useState<string | null>(null);

    const getSunExposure = () => {
        const exposures = [];
        if (plant.melting_sun) exposures.push('☀️☀️');
        if (plant.full_sun) exposures.push('☀️');
        if (plant.part_sun) exposures.push('⛅');
        if (plant.shade) exposures.push('🌥️');
        return exposures.join(' ');
    };

    const getGrowthRateIcon = (rate: string = '') => {
        switch(rate.toLowerCase()) {
            case 'fast': return '🚀';
            case 'moderate': return '⚡';
            case 'slow': return '🐌';
            default: return '🌱';
        }
    };

    const getNativeIcon = () => plant.car_native ? '🌿' : '';
    const getDeerResistantIcon = () => plant.deer_resistance ? '🦌' : '';

    const formatPrice = (price: number | undefined) => {
        if (!price) return 'N/A';
        return `$${price.toFixed(2)}`;
    };

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback(() => {
        setIsDragging(false);
    }, []);

    const handleDrop = useCallback(async (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const files = Array.from(e.dataTransfer.files);
        if (files.length === 0) return;

        const formData = new FormData();
        formData.append('image', files[0]);

        try {
            const response = await fetch(`/api/plants/${plant.id}/upload`, {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) throw new Error('Failed to upload image');

            const data = await response.json();
            if (data.imageUrl) {
                const timestamp = new Date().getTime();
                setImageUrl(`${data.imageUrl}?t=${timestamp}`);
                setImageError(false);
                setReloadKey(Date.now());
            }
        } catch (error) {
            console.error('Error uploading image:', error);
            if (error instanceof Error) {
                alert(error.message || 'Failed to upload image');
            } else {
                alert('Failed to upload image');
            }
        }
    }, [plant]);

    const displaySrc = (imageError && tempPreviewUrl) ? tempPreviewUrl : imageUrl;

    return (
        <Link href={`/plantknowledgebase/${plant.id}`} key={reloadKey}>
            <div>
                <div 
                    className={`group bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-sage-100 hover:border-sage-300 ${isDragging ? 'border-dashed border-4 border-sage-500' : ''}`}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                >
                    {displaySrc ? (
                        <div className="relative h-56 overflow-hidden bg-sage-50">
                            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent z-10" />
                            <Image 
                                src={displaySrc}
                                alt={plant.tag_name || 'Plant Image'}
                                fill
                                objectFit="cover"
                                className="transform group-hover:scale-105 transition-transform duration-500"
                                onError={() => setImageError(true)}
                            />
                            <div className="absolute top-2 left-2 flex flex-wrap gap-1">
                                {plant.winterizing && (
                                    <WinterizingBadge type={plant.winterizing} />
                                )}
                            </div>
                            <div className="absolute bottom-2 right-2 z-20 flex gap-1">
                                {getNativeIcon() && <span className="badge">{getNativeIcon()}</span>}
                                {getDeerResistantIcon() && <span className="badge">{getDeerResistantIcon()}</span>}
                                <span className="badge">{getGrowthRateIcon(plant.growth_rate)}</span>
                            </div>
                        </div>
                    ) : (
                        <div className="h-56 bg-sage-50 flex items-center justify-center">
                            <span className="text-sage-400">No Image Available</span>
                        </div>
                    )}
                    <div className="p-5 space-y-4">
                        <div className="border-b border-sage-100 pb-3">
                            <h3 className="text-xl font-semibold text-sage-800 mb-1 line-clamp-2">
                                {plant.tag_name}
                            </h3>
                            <p className="text-sm text-sage-600 italic">
                                {plant.botanical}
                            </p>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                            <div>
                                <span className="font-semibold">Price:</span> {formatPrice(plant.price)}
                            </div>
                            <div>
                                <span className="font-semibold">Size:</span> {plant.size || 'N/A'}
                            </div>
                            <div className="col-span-2 flex items-center justify-between">
                                <span className="font-semibold">Sun Exposure:</span> {getSunExposure()}
                            </div>
                            {plant.mature_size && (
                                <div className="col-span-2">
                                    <span className="font-semibold">Mature Size:</span> {plant.mature_size}
                                </div>
                            )}
                            {plant.notes && (
                                <div className="col-span-2">
                                    <span className="font-semibold">Notes:</span> {plant.notes}
                                </div>
                            )}
                            <div className="col-span-2 flex justify-between items-center pt-2 border-t border-sage-100">
                                <span className="font-semibold">Warranty:</span> {plant.no_warranty ? 'No' : 'Yes'}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Link>
    );
};

export default PlantCard;
