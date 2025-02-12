import React from 'react';
import Image from 'next/image';
import { PlantCatalog } from './../lib/types';

const PlantDetailsHeader = ({ plant }: { plant: PlantCatalog }) => {
    const fallbackImageUrl = '/plantimage.jpg';
    const imageUrl = (() => {
        const path = plant.images?.[0]?.image_path;
        if (!path) return fallbackImageUrl;
        return `/api/images?path=${encodeURIComponent(path)}`;
    })();

    return (
        <div>
            <h1 className="text-3xl font-bold text-muted-sage-green mb-8">{plant.tag_name}</h1>
            <Image 
                src={imageUrl}
                alt={plant.tag_name || 'Plant Image'}
                width={128}
                height={128}
                className="object-cover rounded-lg"
                onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.onerror = null;
                    target.src = fallbackImageUrl;
                }}
            />
        </div>
    );
};

export default PlantDetailsHeader;
