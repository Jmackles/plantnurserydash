import React, { useState, useCallback, useEffect } from 'react';
import Link from 'next/link';
import { BenchTags } from '../../lib/types';

interface PlantCardProps {
    plant: BenchTags;
}

const GOOGLE_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_API_KEY;
const GOOGLE_CX = process.env.NEXT_PUBLIC_GOOGLE_CX;

const PlantCard: React.FC<PlantCardProps> = ({ plant }) => {
    const [imageError, setImageError] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const [imageUrl, setImageUrl] = useState(plant.ImageUrls?.[0] || ''); // Use the first image as the default
    const [reloadKey, setReloadKey] = useState(Date.now()); // New state to force component reload
    const [tempPreviewUrl, setTempPreviewUrl] = useState<string | null>(null);

    useEffect(() => {
        if (!imageUrl) {
            fetchImageFromGoogle(plant.TagName).then((googleImage) => {
                if (googleImage) {
                    setImageUrl(googleImage);
                }
            });
        }
    }, [imageUrl, plant.TagName]);

    const fetchImageFromGoogle = async (query: string) => {
        try {
            const response = await fetch(`https://www.googleapis.com/customsearch/v1?q=${query}&cx=${GOOGLE_CX}&key=${GOOGLE_API_KEY}&searchType=image&num=1`);
            const data = await response.json();
            if (data.items && data.items.length > 0) {
                return data.items[0].link;
            }
        } catch (error) {
            console.error('Error fetching image from Google:', error);
        }
        return null;
    };

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

        const blobUrl = URL.createObjectURL(file);
        setTempPreviewUrl(blobUrl);

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
                const timestamp = new Date().getTime();
                setImageUrl(`${data.imageUrl}?t=${timestamp}`);
                setImageError(false);
                setReloadKey(Date.now());
            }
        } catch (error) {
            console.error('Error uploading image:', error);
            alert(error.message || 'Failed to upload image');
        }
    }, [plant]);

    const displaySrc = (imageError && tempPreviewUrl) ? tempPreviewUrl : imageUrl;

    return (
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
                                src={displaySrc}
                                alt={plant.TagName || ''}
                                className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                                onError={() => setImageError(true)}
                            />
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
                        <div className="border-b border-sage-100 pb-3">
                            <h3 className="text-xl font-semibold text-sage-800 mb-1 line-clamp-2">
                                {plant.TagName}
                            </h3>
                            <p className="text-sm text-sage-600 italic">
                                {plant.Botanical}
                            </p>
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-sm">
                            <div className="col-span-2 flex items-center justify-between">
                                <span>{getSunExposure()}</span>
                                <span title={plant.GrowthRate}>{getGrowthRateIcon(plant.GrowthRate)}</span>
                            </div>
                            
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

                            {plant.MatureSize && (
                                <div className="col-span-2 text-sage-700">
                                    <span className="font-medium">Mature Size:</span> {plant.MatureSize}
                                </div>
                            )}
                            
                            {plant.Notes && (
                                <div className="col-span-2 text-sage-600 line-clamp-2 text-xs italic">
                                    {plant.Notes}
                                </div>
                            )}

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
