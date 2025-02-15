'use client'
import React, { useState, useEffect } from 'react';
import { WantList, Plant } from '@/app/lib/types';
import Link from 'next/link';
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline';

interface WantListTabPanelProps {
    wantLists: WantList[];
    onNewWantList: () => void;
    customerId: number;
}

function formatDate(dateString: string) {
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
}

const WantListTabPanel: React.FC<WantListTabPanelProps> = ({ wantLists = [], onNewWantList, customerId }) => {
    const [expandedLists, setExpandedLists] = useState<number[]>([]);
    const safeWantLists = Array.isArray(wantLists) ? wantLists : [];

    useEffect(() => {
        console.log('WantListTabPanel received customerId:', customerId);
        console.log('WantListTabPanel received wantLists:', wantLists);
    }, [customerId, wantLists]);

    // Filter want lists for this customer only
    const customerWantLists = wantLists.filter(list => list.customer_id === customerId);

    const toggleExpand = (id: number, e: React.MouseEvent) => {
        e.preventDefault(); // Prevent navigation when clicking the expand button
        setExpandedLists(prev => 
            prev.includes(id) ? prev.filter(listId => listId !== id) : [...prev, id]
        );
    };

    return (
        <div className="bg-white rounded-lg shadow p-4">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-sage-800">Want Lists</h2>
                <button 
                    onClick={onNewWantList}
                    className="btn-primary flex items-center gap-2"
                >
                    <span>➕</span> New Want List
                </button>
            </div>

            {customerWantLists.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                    <p>No want lists yet.</p>
                    <button 
                        onClick={onNewWantList}
                        className="text-sage-600 hover:text-sage-700 underline mt-2"
                    >
                        Create first want list
                    </button>
                </div>
            ) : (
                <div className="space-y-4">
                    {customerWantLists.map((list) => {
                        console.log('Rendering want list:', list);
                        return (
                            <div 
                                key={list.id}
                                className={`p-4 rounded-lg border transition-all duration-200
                                    ${list.status === 'pending' ? 'bg-yellow-50 border-yellow-200' :
                                      list.status === 'completed' ? 'bg-green-50 border-green-200' :
                                      'bg-gray-50 border-gray-200'}`}
                            >
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="font-medium">Want List #{list.id}</h3>
                                        <p className="text-sm text-gray-600">
                                            Created: {formatDate(list.created_at_text)}
                                        </p>
                                        {list.general_notes && (
                                            <p className="text-sm text-gray-600 mt-2">{list.general_notes}</p>
                                        )}
                                    </div>
                                    <span className={`px-2 py-1 rounded-full text-sm
                                        ${list.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                          list.status === 'completed' ? 'bg-green-100 text-green-800' :
                                          'bg-gray-100 text-gray-800'}`}
                                    >
                                        {list.status.charAt(0).toUpperCase() + list.status.slice(1)}
                                    </span>
                                </div>

                                {list.plants && list.plants.length > 0 && (
                                    <>
                                        <button
                                            onClick={(e) => toggleExpand(list.id, e)}
                                            className="mt-3 pt-3 border-t border-gray-200 w-full flex items-center justify-between text-sm text-gray-600 hover:text-gray-900"
                                        >
                                            <span>
                                                {list.plants.length} plant{list.plants.length === 1 ? '' : 's'} requested
                                            </span>
                                            {expandedLists.includes(list.id) ? (
                                                <ChevronUpIcon className="h-4 w-4" />
                                            ) : (
                                                <ChevronDownIcon className="h-4 w-4" />
                                            )}
                                        </button>

                                        {expandedLists.includes(list.id) && (
                                            <div className="mt-3 space-y-2">
                                                {list.plants.map((plant, idx) => (
                                                    <div 
                                                        key={idx}
                                                        className="p-2 bg-white rounded border border-gray-100 shadow-sm"
                                                    >
                                                        <div className="flex justify-between items-start">
                                                            <div>
                                                                <p className="font-medium">{plant.name}</p>
                                                                <p className="text-sm text-gray-600">
                                                                    Size: {plant.size || 'N/A'}
                                                                </p>
                                                            </div>
                                                            <span className="text-sm font-medium">
                                                                Qty: {plant.quantity}
                                                            </span>
                                                        </div>
                                                        {plant.status && (
                                                            <div className="mt-1">
                                                                <span className={`text-xs px-2 py-1 rounded-full
                                                                    ${plant.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                                                      plant.status === 'fulfilled' ? 'bg-green-100 text-green-800' :
                                                                      'bg-gray-100 text-gray-800'}`}
                                                                >
                                                                    {plant.status.charAt(0).toUpperCase() + plant.status.slice(1)}
                                                                </span>
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </>
                                )}

                                <Link 
                                    href={`/wantlistdashboard?id=${list.id}`}
                                    className="mt-3 text-sage-600 hover:text-sage-800 text-sm inline-block"
                                >
                                    View Details →
                                </Link>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default WantListTabPanel;
