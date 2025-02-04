import React from 'react';
import { WantList } from '../../lib/types';

interface WantListCardProps {
    entry: WantList;
    onClick: () => void;
}

const WantListCard: React.FC<WantListCardProps> = ({ entry, onClick }) => {
    return (
        <div 
            className="bg-white rounded-lg shadow-md mb-4 overflow-hidden hover:shadow-lg transition-shadow duration-300"
            onClick={onClick}
        >
            <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <h3 className="text-xl font-semibold text-sage-800">
                            Want List #{entry.id}
                        </h3>
                        <p className="text-sage-600">
                            Initial: {entry.initial}
                        </p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        entry.is_closed 
                            ? 'bg-red-100 text-red-800' 
                            : 'bg-green-100 text-green-800'
                    }`}></span>
                        {entry.is_closed ? 'Closed' : 'Open'}
                    </span>
                </div>

                {entry.notes && (
                    <div className="mb-4"></div>
                        <h4 className="text-sm font-medium text-sage-700 mb-1">Notes:</h4>
                        <p className="text-sage-600 bg-sage-50 p-2 rounded">{entry.notes}</p>
                    </div>
                )}

                {entry.plants && entry.plants.length > 0 && (
                    <div>
                        <h4 className="text-sm font-medium text-sage-700 mb-2">Plants:</h4>
                        <div className="grid gap-2">
                            {entry.plants.map((plant, index) => (
                                <div 
                                    key={index}
                                    className="bg-sage-50 p-3 rounded-md flex justify-between items-center"
                                >
                                    <div className="flex-1">
                                        <p className="font-medium text-sage-800">
                                            {plant.name}
                                            {plant.tag_name && ` (${plant.tag_name})`}
                                        </p>
                                        <div className="flex gap-4 text-sm text-sage-600">
                                            <span>Size: {plant.size}</span>
                                            <span>Qty: {plant.quantity}</span>
                                            <span className={`${
                                                plant.status === 'pending' ? 'text-yellow-600' :
                                                plant.status === 'fulfilled' ? 'text-green-600' :
                                                'text-red-600'
                                            }`}>
                                                Status: {plant.status}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <div className="mt-4 pt-3 border-t border-sage-200 flex justify-between items-center text-sm text-sage-500"></div>
                    <span>Created: {new Date(entry.created_at_text).toLocaleDateString()}</span>
                    {entry.closed_by && (
                        <span>Closed by: {entry.closed_by}</span>
                    )}
                </div>
            </div>
        </div>
    );
};

export default WantListCard;
