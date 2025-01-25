import React, { useState } from 'react';
import Image from 'next/image';
import { BenchTags } from '../../lib/types';

interface PlantCardProps {
    plant: BenchTags;
}

const PlantCard: React.FC<PlantCardProps> = ({ plant }) => {
    const [imageError, setImageError] = useState(false);
    
    return (
        <div className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow">
            {plant.ImageUrl && (
                <img 
                    src={plant.ImageUrl}
                    alt={plant.TagName || ''}
                    className="w-full h-48 object-cover"
                />
            )}
            <div className="p-4">
                <h3 className="text-xl font-semibold">{plant.TagName}</h3>
                <p className="text-gray-600 italic">{plant.Botanical}</p>
                <p className="text-gray-500">{plant.Department}</p>
                <div className="mt-2">
                    <p>Size: {plant.Size || 'N/A'}</p>
                    <p>Price: {plant.Price || 'N/A'}</p>
                </div>
            </div>
        </div>
    );
};

export default PlantCard;
