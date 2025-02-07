import React from 'react';
import Image from 'next/image';
import { CatalogImage } from '../lib/types';
import { Carousel } from 'react-responsive-carousel';
import 'react-responsive-carousel/lib/styles/carousel.min.css';

interface PlantDetailsPhotosProps {
    images: CatalogImage[];
    onImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onDeleteImage?: (imageId: number) => Promise<void>;
}

const PlantDetailsPhotos: React.FC<PlantDetailsPhotosProps> = ({ 
    images, 
    onImageUpload,
    onDeleteImage 
}) => {
    return (
        <div className="mt-8">
            <h2 className="text-2xl font-bold text-sage-700 mb-4">Photos</h2>
            <input 
                type="file" 
                multiple 
                accept="image/*"
                onChange={onImageUpload} 
                className="mb-4" 
            />
            {images.length > 0 ? (
                <Carousel showThumbs={true} showArrows={true}>
                    {images.map((image) => (
                        <div key={image.id} className="relative">
                            <Image
                                src={`/api/images?path=${encodeURIComponent(image.image_path)}`}
                                alt={image.caption || 'Plant image'}
                                width={800}
                                height={600}
                                className="object-contain"
                            />
                            {image.caption && (
                                <p className="text-sm text-gray-600 mt-2">{image.caption}</p>
                            )}
                            {onDeleteImage && (
                                <button
                                    onClick={() => onDeleteImage(image.id)}
                                    className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full"
                                >
                                    Delete
                                </button>
                            )}
                        </div>
                    ))}
                </Carousel>
            ) : (
                <div className="text-gray-500">No images available</div>
            )}
        </div>
    );
};

export default PlantDetailsPhotos;
