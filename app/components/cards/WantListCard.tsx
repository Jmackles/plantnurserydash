'use client';
import React from 'react';
import { WantList, Customer } from '../../lib/types';
import { Tooltip } from 'react-tooltip';

interface WantListCardProps {
    entry: WantList;
    customer: Customer | null;
    onClick: () => void;
    onSelect?: (selected: boolean) => void;
    isSelected?: boolean;
    onStatusChange?: (status: 'completed' | 'canceled', data: { initial: string, general_notes: string }) => void;
}

const WantListCard: React.FC<WantListCardProps> = ({ entry, customer, onClick, onSelect, isSelected, onStatusChange }) => {
    const [isChangingStatus, setIsChangingStatus] = React.useState(false);
    const [statusData, setStatusData] = React.useState({ initial: '', general_notes: '' });

    const handleStatusChange = (status: 'completed' | 'canceled') => {
        if (onStatusChange && statusData.initial) {
            onStatusChange(status, statusData);
            setIsChangingStatus(false);
            setStatusData({ initial: '', general_notes: '' });
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pending':
                return 'bg-yellow-100 text-yellow-800';
            case 'completed':
                return 'bg-green-500 text-white';
            case 'canceled':
                return 'bg-gray-300 text-gray-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getCardStyle = (status: string) => {
        switch (status) {
            case 'completed':
                return 'bg-green-50 border-l-4 border-green-500 ring-1 ring-green-200';
            case 'canceled':
                return 'bg-gray-100 border-l-4 border-gray-500 opacity-75';
            default:
                return 'border-l-4 border-transparent';
        }
    };

    const status = entry.status || 'pending';

    return (
        <div className={`relative bg-white rounded-lg shadow-md transition-all duration-300 p-4 
            ${isSelected ? 'ring-2 ring-blue-500 bg-blue-50' : 'hover:shadow-lg'} ${getCardStyle(status)}`}
            onMouseEnter={() => setIsChangingStatus(true)}
            onMouseLeave={() => setIsChangingStatus(false)}
        >
            <div className="absolute top-2 left-2">
                <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={(e) => onSelect?.(e.target.checked)}
                    onClick={(e) => e.stopPropagation()}
                    className="h-5 w-5 text-blue-600"
                />
            </div>

            <div className="ml-8" onClick={onClick}>
                <div className="flex justify-between items-start mb-3">
                    <div>
                        <h3 className="text-lg font-semibold text-sage-800">
                            Ticket #{entry.id} - {customer?.first_name} {customer?.last_name}
                        </h3>
                        <p className="text-sage-600">
                            Initial: {entry.initial}
                        </p>
                        {customer && (
                            <p className="text-sage-600">
                                Phone: {customer.phone} {customer.email && `| Email: ${customer.email}`}
                            </p>
                        )}
                    </div>
                    <span 
                        className={`px-2 py-1 rounded-full text-sm ${getStatusColor(status)}`}
                        title={status.charAt(0).toUpperCase() + status.slice(1)}
                        data-tooltip-id={`status-tooltip-${entry.id}`}
                    >
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                    </span>
                    <Tooltip id={`status-tooltip-${entry.id}`} place="top" effect="solid">
                        {status === 'pending' ? 'This ticket is pending' : status === 'completed' ? 'This ticket is completed' : 'This ticket is canceled'}
                    </Tooltip>
                </div>

                {entry.general_notes && (
                    <div className="mb-3">
                        <p className="text-sage-600 text-sm">{entry.general_notes}</p>
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

                {entry.status === 'pending' && isChangingStatus && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                        <div className="flex gap-2">
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleStatusChange('completed');
                                }}
                                className="btn-primary bg-green-600 hover:bg-green-700 flex-1"
                            >
                                Complete
                            </button>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleStatusChange('canceled');
                                }}
                                className="btn-primary bg-red-600 hover:bg-red-700 flex-1"
                            >
                                Cancel Request
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default WantListCard;
