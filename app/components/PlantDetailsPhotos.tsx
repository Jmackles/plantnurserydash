import React from 'react';
import { Carousel } from 'react-responsive-carousel';
import 'react-responsive-carousel/lib/styles/carousel.min.css';

const PlantDetailsPhotos = ({ images, onImageUpload, onImageReorder }: { images: string[], onImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void, onImageReorder: (newOrder: string[]) => void }) => {
    return (
        <div className="mt-8">
            <h2 className="text-2xl font-bold text-sage-700 mb-4">Photos</h2>
            <input type="file" multiple onChange={onImageUpload} className="mb-4" />
            <Carousel showThumbs={true} showArrows={true} dynamicHeight={true}>
                {images.map((image, index) => (
                    <div key={index}>
                        <img src={image} alt={`Plant image ${index + 1}`} />
                    </div>
                ))}
            </Carousel>
        </div>
    );
};

export default PlantDetailsPhotos;
