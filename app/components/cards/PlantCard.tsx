import React from 'react';
import Link from 'next/link';
import { BenchTag } from '../../lib/types';

interface PlantCardProps {
    plant: BenchTag;
}

const PlantCard: React.FC<PlantCardProps> = ({ plant }) => {
    return (
        <Link href={`/plantknowledgebase/${plant.ID}`} className="card-section">
            {plant.Image && (
                <img src={plant.Image} alt={plant.TagName} className="w-full h-32 object-cover mb-2" />
            )}
            <h2 className="text-xl font-semibold">{plant.TagName}</h2>
            <p><strong>Botanical:</strong> {plant.Botanical}</p>
            <p><strong>Department:</strong> {plant.Department}</p>
            <p><strong>Sun:</strong> {plant.Sun}</p>
            <p><strong>Part Sun:</strong> {plant.PartSun}</p>
            <p><strong>Shade:</strong> {plant.Shade}</p>
            <p><strong>Growth Rate:</strong> {plant.GrowthRate}</p>
            <p><strong>Mature Size:</strong> {plant.MatureSize}</p>
            <p><strong>Winterizing:</strong> {plant.Winterizing}</p>
            <p><strong>Special Care/Attributes:</strong> {plant.SpecialCareAttributes}</p>
            <p><strong>Price:</strong> {plant.Price}</p>
            <p><strong>Size:</strong> {plant.Size}</p>
            <p><strong>Pot Size:</strong> {plant.PotSize}</p>
            <p><strong>Pot Type:</strong> {plant.PotType}</p>
        </Link>
    );
};

export default PlantCard;
