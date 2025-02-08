import React, { useState, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { PlantCatalog, SunCategory, generateTooltip } from '../../lib/types';
import { getWinterizingTooltip, getDeerResistanceTooltip, getGrowthRateTooltip } from '../../lib/tooltips';
import Tooltip from '../shared/Tooltip';
import WinterizingBadge from '../badges/WinterizingBadge';
import SunExposureIcon from '../icons/SunExposureIcon';

interface PlantCardProps {
    plant: PlantCatalog;
}

const PlantCard: React.FC<PlantCardProps> = ({ plant }) => {
    const fallbackImageUrl = '/plantimage.jpg';
    const deerIconUrl = '/Icons/new/v3/deer.png';
    const [imageUrl, setImageUrl] = useState(() => {
        const path = plant.images?.[0]?.image_path;
        if (!path) return fallbackImageUrl;
        return `/api/images?path=${encodeURIComponent(path)}`;
    });
    const [imageError, setImageError] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const [reloadKey, setReloadKey] = useState(Date.now()); // New state to force component reload
    const [tempPreviewUrl, setTempPreviewUrl] = useState<string | null>(null);
    const [tooltipVisible, setTooltipVisible] = useState(false);
    const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });

    const handleMouseEnter = (e: React.MouseEvent) => {
        const rect = e.currentTarget.getBoundingClientRect();
        setTooltipPosition({
            x: rect.left + (rect.width / 2),
            y: rect.top - 10 // Position above the element
        });
        setTooltipVisible(true);
    };

    const getSunExposure = () => {
        const acceptedCategories: SunCategory[] = [];
        if (plant.melting_sun === 1) acceptedCategories.push(SunCategory.MELTING);
        if (plant.full_sun === 1) acceptedCategories.push(SunCategory.FULL);
        if (plant.part_sun === 1) acceptedCategories.push(SunCategory.PART);
        if (plant.shade === 1) acceptedCategories.push(SunCategory.SHADE);

        const tooltip = generateTooltip(acceptedCategories);

        return (
            <div className="flex items-center gap-2">
                {acceptedCategories.map((category) => (
                    <div 
                        key={category} 
                        className="relative"
                        onMouseEnter={handleMouseEnter}
                        onMouseLeave={() => setTooltipVisible(false)}
                    >
                        <SunExposureIcon 
                            type={category.toLowerCase().includes('melting') ? 'melting' : 
                                 category.toLowerCase().includes('full') ? 'full' :
                                 category.toLowerCase().includes('part') ? 'part' : 'shade'} 
                            active 
                            intensity="high"
                        />
                        {tooltipVisible && (
                            <div
                                className="fixed z-[9999] pointer-events-none"
                                style={{
                                    left: `${tooltipPosition.x}px`,
                                    top: `${tooltipPosition.y}px`,
                                    transform: 'translate(-50%, -100%)'
                                }}
                            >
                                <div className="bg-gray-900/95 text-white px-6 py-4 rounded-lg shadow-xl 
                                            backdrop-blur-sm border border-gray-700/50 
                                            animate-fade-in max-w-[400px] text-sm leading-relaxed">
                                    {tooltip}
                                    <div className="absolute left-1/2 bottom-0 w-3 h-3 bg-gray-900/95 
                                                transform -translate-x-1/2 translate-y-1/2 rotate-45 
                                                border-r border-b border-gray-700/50"></div>
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        );
    };

    const getGrowthRateIcon = (rate: string = '') => {
        // Only return the icon if there's a valid growth rate
        if (!rate) return null;
        
        const icon = {
            'fast': '🚀',
            'moderate': '⚡',
            'slow': '🐌',
            'default': '🌱'
        }[rate.toLowerCase()];

        // Only render if we have a valid icon
        return icon ? (
            <Tooltip content={getGrowthRateTooltip(rate)}>
                <span className="badge">{icon}</span>
            </Tooltip>
        ) : null;
    };

    const getDeerResistantIcon = () => {
        if (!plant.deer_resistance) return null;

        const resistanceLevels = {
            none: { text: 'NONE', color: 'black' },
            fair: { text: 'FAIR', color: 'black' },
            good: { text: 'GOOD', color: 'black' },
            'very good': { text: 'VERY GOOD', color: 'black' }
        };

        const level = resistanceLevels[plant.deer_resistance.toLowerCase()];
        if (!level) return null;

        return (
            <Tooltip content={getDeerResistanceTooltip(plant.deer_resistance)}>
                <div className="flex items-center gap-2">
                    <Image 
                        src={deerIconUrl} 
                        alt="Deer Resistance" 
                        width={24} 
                        height={24}
                    />
                    <span className="text-xs text-black font-medium">
                        {level.text}
                    </span>
                </div>
            </Tooltip>
        );
    };

    const getZoneDisplay = () => {
        if (!plant.zone_min || !plant.zone_max) return 'Zones: N/A';
        if (plant.zone_min === plant.zone_max) return `Zone ${plant.zone_min}`;
        return `Zones ${plant.zone_min}-${plant.zone_max}`;
    };

    const formatNotes = () => {
        if (!plant.notes && !plant.top_notes) return null;
        
        return (
            <div className="mt-2 space-y-2 text-sm text-gray-600">
                {plant.top_notes && plant.show_top_notes && (
                    <div className="bg-sage-50 p-2 rounded-lg">
                        <p className="font-medium text-sage-800">{plant.top_notes}</p>
                    </div>
                )}
                {plant.notes && (
                    <div className="overflow-y-auto custom-scrollbar max-h-[120px] bg-gray-50/50 p-2 rounded-lg">
                        <p className="pr-2 text-gray-700">{plant.notes}</p>
                    </div>
                )}
            </div>
        );
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

    const getNativeStatus = () => {
        if (!plant.nativity && !plant.car_native) return null;

        return (
            <div className="flex items-center gap-2">
                {plant.car_native && (
                    <Tooltip content="Carolina Native Plant">
                        <span className="badge bg-sage-100 text-sage-800 px-2 py-1 rounded-full text-xs">
                            CAR Native 🌿
                        </span>
                    </Tooltip>
                )}
                {plant.nativity && (
                    <Tooltip content={`Native to: ${plant.nativity}`}>
                        <span className="badge bg-mint-100 text-mint-800 px-2 py-1 rounded-full text-xs">
                            {plant.nativity} 🌱
                        </span>
                    </Tooltip>
                )}
            </div>
        );
    };

    const displaySrc = (imageError && tempPreviewUrl) ? tempPreviewUrl : imageUrl;

    return (
        <Link href={`/plantknowledgebase/${plant.id}`} key={reloadKey}>
            <div className="h-full">
                <div 
                    className={`group bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-muted-sage-green hover:border-light-grayish-green h-[250px] flex flex-col ${isDragging ? 'border-dashed border-4 border-sage-500' : ''}`}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                >
                    <div className="flex flex-row h-48">
                        {/* Image section */}
                        <div className="w-1/3 relative">
                            {displaySrc ? (
                                <div className="relative h-full overflow-hidden bg-light-grayish-green">
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
                                            <Tooltip content={getWinterizingTooltip(plant.winterizing)}>
                                                <WinterizingBadge type={plant.winterizing} />
                                            </Tooltip>
                                        )}
                                    </div>
                                    <div className="absolute bottom-2 right-2 z-20 flex gap-1">
                                        {plant.growth_rate && getGrowthRateIcon(plant.growth_rate)}
                                    </div>
                                </div>
                            ) : (
                                <div className="h-full bg-light-grayish-green flex items-center justify-center">
                                    <span className="text-muted-sage-green">No Image Available</span>
                                </div>
                            )}
                        </div>

                        {/* Content section */}
                        <div className="w-2/3 p-4 flex flex-col">
                            <div className="border-b border-muted-sage-green pb-2">
                                <h3 className="text-lg font-semibold text-sage-800 mb-1">
                                    {plant.tag_name}
                                </h3>
                                <p className="text-sm text-sage-600 italic">
                                    {plant.botanical}
                                </p>
                            </div>
                            
                            <div className="mt-2 space-y-2 flex-1 flex flex-col">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium text-sage-700">
                                        {getZoneDisplay()}
                                    </span>
                                    <div className="flex items-center gap-2">
                                        {getSunExposure()}
                                    </div>
                                </div>

                                <div className="flex flex-wrap gap-2 items-center">
                                    {plant.deer_resistance && getDeerResistantIcon()}
                                    {getNativeStatus()}
                                </div>
                                
                                <div className="flex-1 min-h-0">
                                    {formatNotes()}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Link>
    );
};

export default PlantCard;
