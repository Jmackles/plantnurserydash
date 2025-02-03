import React from 'react';
import { BenchTags } from './../lib/types';

const translateValue = (value: boolean | undefined) => {
    if (value === undefined) return 'N/A';
    return value ? 'Yes' : 'No';
};

const PlantDetailsInfo = ({ plant }: { plant: BenchTags }) => {
    return (
        <div className="bg-white shadow-md rounded-lg p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <p><strong>Botanical:</strong> {plant.botanical_id}</p>
                <p><strong>Department:</strong> {plant.Department}</p>
                <p><strong>Sun:</strong> {translateValue(!!plant.FullSun)}</p>
                <p><strong>Part Sun:</strong> {translateValue(!!plant.PartSun)}</p>
                <p><strong>Shade:</strong> {translateValue(!!plant.Shade)}</p>
                <p><strong>Growth Rate:</strong> {plant.GrowthRate}</p>
                <p><strong>Mature Size:</strong> {plant.MatureSize}</p>
                <p><strong>Winterizing:</strong> {plant.Winterizing}</p>
                <p><strong>Special Care/Attributes:</strong> {plant.Notes || 'N/A'}</p>
                <p><strong>Price:</strong> {plant.Price}</p>
                <p><strong>Size:</strong> {plant.Size}</p>
                <p><strong>Pot Size:</strong> {plant.PotSize}</p>
                <p><strong>Pot Type:</strong> {plant.PotType}</p>
            </div>
        </div>
    );
};

export default PlantDetailsInfo;
