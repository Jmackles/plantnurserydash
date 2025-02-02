import React, { useState, useCallback } from 'react';
import Link from 'next/link';
import { BenchTags } from '../../lib/types';

interface PlantCardProps {
    plant: BenchTags;
}

const PlantCard: React.FC<PlantCardProps> = ({ plant }) => {
    const [imageError, setImageError] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const [imageUrl, setImageUrl] = useState(plant.ImageUrl || ''); // Manage ImageUrl in local state
    const [reloadKey, setReloadKey] = useState(Date.now()); // New state to force component reload
    // New state to store the temporary preview URL for the dragged image.
    const [tempPreviewUrl, setTempPreviewUrl] = useState<string | null>(null);

    const getSunExposure = () => {
        const exposures = [];
        if (plant.MeltingSun) exposures.push('☀️☀️');
        if (plant.FullSun) exposures.push('☀️');
        if (plant.PartSun) exposures.push('⛅');
        if (plant.Shade) exposures.push('🌥️');
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

    const getNativeIcon = () => plant.CarNative ? '🌿' : '';
    const getDeerResistantIcon = () => plant.DeerResistance ? '🦌' : '';

    const formatPrice = (price: string | undefined) => {
        if (!price) return 'N/A';
        return price.startsWith('$') ? price : `$${price}`;
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

        const file = e.dataTransfer.files[0];
        if (!file) return;

        // Set temporary preview from the local file.
        const blobUrl = URL.createObjectURL(file);
        setTempPreviewUrl(blobUrl);

        // Check for supported image types including BMP
        const supportedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/bmp'];
        if (!supportedTypes.includes(file.type)) {
            alert('Please upload a supported image format (JPEG, PNG, GIF, or BMP)');
            return;
        }

        const formData = new FormData();
        formData.append('image', file);

        try {
            const response = await fetch(`/api/knowledgebase/${plant.ID}/image`, {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Failed to upload image');
            }

            const data = await response.json();
            if (data.imageUrl) {
                // Update the state with the new image URL
                const timestamp = new Date().getTime();
                setImageUrl(`${data.imageUrl}?t=${timestamp}`); // Force re-render with timestamp
                setImageError(false); // Reset error if image is loaded
                setReloadKey(Date.now()); // Force reload of the plant card
            }
        } catch (error) {
            console.error('Error uploading image:', error);
            alert(error.message || 'Failed to upload image');
        }
    }, [plant]);

    // Determine which image src to display.
    const displaySrc = (imageError && tempPreviewUrl) ? tempPreviewUrl : imageUrl;

    return (
        // Apply key directly to Link so that the card fully re-mounts on update
        <Link href={`/plantknowledgebase/${plant.ID}`} key={reloadKey}>
            <div>
                <div 
                    className={`group bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-sage-100 hover:border-sage-300 ${isDragging ? 'border-dashed border-4 border-sage-500' : ''}`}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                >
                    {displaySrc && (
                        <div className="relative h-56 overflow-hidden bg-sage-50">
                            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent z-10" />
                            <img 
                                src={displaySrc}  // Use the computed displaySrc
                                alt={plant.TagName || ''}
                                className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                                onError={() => setImageError(true)}
                            />
                            {/* Plant Status Badges */}
                            <div className="absolute top-2 left-2 flex flex-wrap gap-1">
                                {plant.Winterizing && (
                                    <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                                        {plant.Winterizing}
                                    </span>
                                )}
                                {plant.Classification && (
                                    <span className="px-2 py-1 text-xs rounded-full bg-purple-100 text-purple-800">
                                        {plant.Classification}
                                    </span>
                                )}
                            </div>
                            {/* Icons */}
                            <div className="absolute bottom-2 right-2 z-20 flex gap-1">
                                {getNativeIcon()}
                                {getDeerResistantIcon()}
                            </div>
                        </div>
                    )}
                    {!displaySrc && (
                        <div className="h-56 bg-sage-50 flex items-center justify-center">
                            <span className="text-sage-400">No Image Available</span>
                        </div>
                    )}
                    
                    <div className="p-5 space-y-4">
                        {/* Title Section */}
                        <div className="border-b border-sage-100 pb-3">
                            <h3 className="text-xl font-semibold text-sage-800 mb-1 line-clamp-2">
                                {plant.TagName}
                            </h3>
                            <p className="text-sm text-sage-600 italic">
                                {plant.Botanical}
                            </p>
                        </div>

                        {/* Main Info Grid */}
                        <div className="grid grid-cols-2 gap-2 text-sm">
                            {/* Growing Conditions */}
                            <div className="col-span-2 flex items-center justify-between">
                                <span>{getSunExposure()}</span>
                                <span title={plant.GrowthRate}>{getGrowthRateIcon(plant.GrowthRate)}</span>
                            </div>
                            
                            {/* Department & Zones */}
                            <div className="col-span-2 flex flex-wrap gap-2">
                                {plant.Department && (
                                    <span className="bg-sage-50 text-sage-700 px-2 py-1 rounded-full text-xs">
                                        {plant.Department}
                                    </span>
                                )}
                                {plant.ZoneMin && plant.ZoneMax && (
                                    <span className="bg-amber-50 text-amber-700 px-2 py-1 rounded-full text-xs">
                                        Zone {plant.ZoneMin}-{plant.ZoneMax}
                                    </span>
                                )}
                            </div>

                            {/* Sizes */}
                            {plant.MatureSize && (
                                <div className="col-span-2 text-sage-700">
                                    <span className="font-medium">Mature Size:</span> {plant.MatureSize}
                                </div>
                            )}
                            
                            {/* Notes Preview */}
                            {plant.Notes && (
                                <div className="col-span-2 text-sage-600 line-clamp-2 text-xs italic">
                                    {plant.Notes}
                                </div>
                            )}

                            {/* Price & Size Info */}
                            <div className="col-span-2 flex justify-between items-center pt-2 border-t border-sage-100">
                                {plant.Price && (
                                    <span className="text-lg font-semibold text-sage-700">
                                        {formatPrice(plant.Price)}
                                    </span>
                                )}
                                {plant.Size && (
                                    <span className="text-sage-600 text-sm">
                                        Size: {plant.Size}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Link>
    );
};

export default PlantCard;
