import React from 'react';
import Link from 'next/link';
import { BenchTags } from '../../lib/types';

interface PlantCardProps {
    plant: BenchTags;
}

const PlantCard: React.FC<PlantCardProps> = ({ plant }) => {
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

    return (
        <Link href={`/plantknowledgebase/${plant.ID}`}>
            <div className="group bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-sage-100 hover:border-sage-300">
                {plant.ImageUrl && (
                    <div className="relative h-56 overflow-hidden bg-sage-50">
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent z-10" />
                        <img 
                            src={plant.ImageUrl}
                            alt={plant.TagName || ''}
                            className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute bottom-2 right-2 z-20 flex gap-1">
                            {getNativeIcon()}
                            {getDeerResistantIcon()}
                        </div>
                    </div>
                )}
                <div className="p-5">
                    <div className="mb-3 border-b border-sage-100 pb-3">
                        <h3 className="text-xl font-semibold text-sage-800 mb-1 line-clamp-2 group-hover:text-sage-600 transition-colors">
                            {plant.TagName}
                        </h3>
                        <p className="text-sm text-sage-600 italic line-clamp-1">
                            {plant.Botanical}
                        </p>
                    </div>

                    <div className="space-y-3">
                        {/* Sun & Growth Info */}
                        <div className="flex items-center justify-between text-lg">
                            <span className="tracking-wide">{getSunExposure()}</span>
                            <span title={`Growth Rate: ${plant.GrowthRate}`}>
                                {getGrowthRateIcon(plant.GrowthRate)}
                            </span>
                        </div>

                        {/* Growing Info */}
                        <div className="flex flex-wrap gap-2">
                            {plant.Department && (
                                <span className="bg-gradient-to-r from-sage-50 to-sage-100 text-sage-700 px-3 py-1 rounded-full text-xs font-medium">
                                    {plant.Department}
                                </span>
                            )}
                            {plant.ZoneMin && plant.ZoneMax && (
                                <span className="bg-gradient-to-r from-amber-50 to-amber-100 text-amber-700 px-3 py-1 rounded-full text-xs font-medium">
                                    Zone {plant.ZoneMin}-{plant.ZoneMax}
                                </span>
                            )}
                        </div>

                        {/* Size Details */}
                        <div className="grid grid-cols-2 gap-2 text-sm text-sage-700">
                            {plant.MatureSize && (
                                <p className="col-span-2 flex items-center gap-1">
                                    <span className="text-sage-400">📏</span>
                                    {plant.MatureSize}
                                </p>
                            )}
                            <div className="col-span-2 flex justify-between items-center mt-1">
                                {plant.Size && (
                                    <span className="text-sage-600 text-sm">
                                        Current: {plant.Size}
                                    </span>
                                )}
                                {plant.PotSize && (
                                    <span className="text-sage-600 text-sm">
                                        {plant.PotSize}{plant.PotSizeUnit}
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Price */}
                        {plant.Price && (
                            <div className="flex justify-between items-center pt-2 border-t border-sage-100 mt-2">
                                <span className="text-sage-600 text-sm">Price</span>
                                <span className="text-lg font-semibold text-sage-700">
                                    {formatPrice(plant.Price)}
                                </span>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </Link>
    );
};

export default PlantCard;
