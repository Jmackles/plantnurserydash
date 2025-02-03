import React from 'react';
import { BenchTags } from '../../lib/types';

const PlantDetailsHeader = ({ plant }: { plant: BenchTags }) => {
    const fallbackImageUrl = '/plantimage.jpg';

    return (
        <div>
            <h1 className="text-3xl font-bold text-sage-700 mb-8">{plant.TagName}</h1>
            <div className="relative w-32 h-32 mb-4">
                <img 
                    src={plant.ImageUrls && plant.ImageUrls.length > 0 ? plant.ImageUrls[0] : fallbackImageUrl}
                    alt={plant.TagName || 'Plant Image'}
                    className="w-32 h-32 object-cover rounded-lg"
                    onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.onerror = null;
                        target.src = fallbackImageUrl;
                    }}
                />
            </div>
        </div>
    );
};

export default PlantDetailsHeader;
