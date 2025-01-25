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

    const formatPrice = (price: string | undefined) => {
        if (!price) return 'N/A';
        return price.startsWith('$') ? price : `$${price}`;
    };

    return (
        <Link href={`/plantknowledgebase/${plant.ID}`}>
            <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden">
                {plant.ImageUrl && (
                    <div className="relative h-48 overflow-hidden">
                        <img 
                            src={plant.ImageUrl}
                            alt={plant.TagName || ''}
                            className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-300"
                        />
                    </div>
                )}
                <div className="p-4">
                    <div className="mb-2">
                        <h3 className="text-xl font-semibold text-gray-800 mb-1 line-clamp-2">
                            {plant.TagName}
                        </h3>
                        <p className="text-sm text-gray-600 italic mb-2 line-clamp-1">
                            {plant.Botanical}
                        </p>
                    </div>

                    <div className="space-y-2 text-sm">
                        {/* Sun Exposure */}
                        <p className="text-lg mb-2">{getSunExposure()}</p>

                        {/* Department and Growth Info */}
                        <div className="flex flex-wrap gap-2 mb-2">
                            {plant.Department && (
                                <span className="bg-sage-100 text-sage-800 px-2 py-1 rounded-full text-xs">
                                    {plant.Department}
                                </span>
                            )}
                            {plant.GrowthRate && (
                                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                                    {plant.GrowthRate}
                                </span>
                            )}
                        </div>

                        {/* Size and Details */}
                        <div className="grid grid-cols-2 gap-2 text-gray-600">
                            {plant.MatureSize && (
                                <p className="col-span-2">
                                    <span className="font-medium">Mature:</span> {plant.MatureSize}
                                </p>
                            )}
                            {plant.Size && (
                                <p>
                                    <span className="font-medium">Current:</span> {plant.Size}
                                </p>
                            )}
                            {plant.PotSize && (
                                <p>
                                    <span className="font-medium">Pot:</span> {plant.PotSize}
                                    {plant.PotSizeUnit}
                                </p>
                            )}
                        </div>

                        {/* Price */}
                        {plant.Price && (
                            <p className="text-lg font-bold text-green-700 mt-2">
                                {formatPrice(plant.Price)}
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </Link>
    );
};

export default PlantCard;
