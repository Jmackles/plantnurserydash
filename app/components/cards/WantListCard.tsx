'use client';
import React from 'react';
import { WantList } from '../../lib/types';

interface WantListCardProps {
    entry: WantList;
    onClick: () => void;
}

const WantListCard: React.FC<WantListCardProps> = ({ entry, onClick }) => {
    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pending':
                return 'bg-yellow-100 text-yellow-800';
            case 'completed':
                return 'bg-green-100 text-green-800';
            case 'canceled':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const status = entry.status || 'pending'; // Default to 'pending' if status is undefined

    return (
        <div 
            onClick={onClick}
            className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 p-4 cursor-pointer"
        >
            <div className="flex justify-between items-start mb-3">
                <div>
                    <h3 className="text-lg font-semibold text-sage-800">
                        Ticket #{entry.id}
                    </h3>
                    <p className="text-sage-600">
                        Initial: {entry.initial}
                    </p>
                </div>
                <span 
                    className={`px-2 py-1 rounded-full text-sm ${getStatusColor(status)}`}
                >
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                </span>
            </div>

            {entry.notes && (
                <div className="mb-3">
                    <p className="text-sage-600 text-sm">{entry.notes}</p>
                </div>
            )}

            {entry.plants && entry.plants.length > 0 && (
                <div className="space-y-2">
                    <h4 className="text-sm font-medium text-sage-700">Plants:</h4>
                    <div className="divide-y divide-sage-200">
                        {entry.plants.map((plant, index) => (
                            <div key={index} className="py-2">
                                <div className="flex justify-between">
                                    <span className="font-medium">
                                        {plant.name}
                                        {plant.tag_name && ` (${plant.tag_name})`}
                                    </span>
                                    <span className="text-sage-600">
                                        Qty: {plant.quantity}
                                    </span>
                                </div>
                                <div className="flex gap-3 text-sm text-sage-500">
                                    <span>Size: {plant.size}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default WantListCard;
