'use client'
import React, { useState, useEffect } from 'react';
import WantListCard from '../components/cards/WantListCard';
import Modal from '../components/shared/Modal';
import { fetchWantListEntries } from '../lib/api';
import { WantListEntry, Plant } from '../lib/types';

const WantListDashboard = () => {
    const [wantListEntries, setWantListEntries] = useState<WantListEntry[]>([]);
    const [selectedEntry, setSelectedEntry] = useState<WantListEntry | null>(null);
    const [editData, setEditData] = useState<WantListEntry | null>(null);

    useEffect(() => {
        fetchWantListEntries()
            .then(setWantListEntries)
            .catch((error) => console.error('Error:', error));
    }, []);

    const closeModal = () => {
        setSelectedEntry(null);
        setEditData(null);
    };

    const handleEditChange = (field: keyof WantListEntry, value: string | number | boolean) => {
        setEditData((prev) => (prev ? { ...prev, [field]: value } : null));
    };

    const handlePlantChange = (index: number, field: keyof Plant, value: string | number) => {
        if (!editData || !editData.plants) return;
        const updatedPlants = [...editData.plants];
        updatedPlants[index] = { ...updatedPlants[index], [field]: value };
        setEditData({ ...editData, plants: updatedPlants });
    };

    const handleAddPlant = () => {
        if (!editData) return;
        setEditData({
            ...editData,
            plants: [...(editData.plants || []), { name: '', size: '', quantity: 1 }],
        });
    };

    const saveChanges = async () => {
        try {
            const res = await fetch(`/api/want-list`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ id: editData?.id, updatedFields: editData }),
            });
            if (res.ok) {
                alert('Changes saved successfully!');
                const updatedEntries = wantListEntries.map((entry) =>
                    entry.id === editData?.id ? { ...entry, ...editData } : entry
                );
                setWantListEntries(updatedEntries);
                closeModal();
            } else {
                const errorData = await res.json();
                alert(`Failed to save changes: ${errorData.error}`);
            }
        } catch (error) {
            console.error('Error saving changes:', error);
            alert('An unexpected error occurred while saving changes.');
        }
    };

    return (
        <div className="p-8">
            <h1 className="text-2xl font-bold mb-4">Want List Dashboard</h1>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {wantListEntries.map((entry) => (
                    <WantListCard 
                        key={entry.id} 
                        entry={entry} 
                        onClick={() => {
                            setSelectedEntry(entry);
                            setEditData(entry);
                        }} 
                    />
                ))}
            </div>

            {selectedEntry && (
                <Modal
                    title={`Edit Entry for ${selectedEntry.customer_first_name} ${selectedEntry.customer_last_name}`}
                    onClose={closeModal}
                >
                    <div className="mb-4">
                        <label className="block text-sm font-medium mb-1">Initial:</label>
                        <input
                            type="text"
                            value={editData?.initial || ''}
                            onChange={(e) => handleEditChange('initial', e.target.value)}
                            className="w-full p-2 border rounded"
                        />
                        <div className="mb-4">
                            <label className="block text-sm font-medium mb-1">Notes:</label>
                            <textarea
                                value={editData?.notes || ''}
                                onChange={(e) => handleEditChange('notes', e.target.value)}
                                className="w-full p-2 border rounded"
                            ></textarea>
                        </div>
                        <div className="mb-4">
                            <label className="block text-sm font-medium mb-1">Spoken To:</label>
                            <input
                                type="text"
                                value={editData?.spoken_to || ''}
                                onChange={(e) => handleEditChange('spoken_to', e.target.value)}
                                className="w-full p-2 border rounded"
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block text-sm font-medium mb-1">Status:</label>
                            <select
                                value={editData?.is_closed ? 'Closed' : 'Open'}
                                onChange={(e) => handleEditChange('is_closed', e.target.value === 'Closed')}
                                className="w-full p-2 border rounded"
                            >
                                <option value="Open">Open</option>
                                <option value="Closed">Closed</option>
                            </select>
                        </div>
                        <div className="mb-4">
                            <label className="block text-sm font-medium mb-1">Plants:</label>
                            <ul className="list-disc pl-4">
                                {editData?.plants?.map((plant, index) => (
                                    <li key={index}>
                                        <input
                                            type="text"
                                            placeholder="Plant Name"
                                            value={plant.name}
                                            onChange={(e) => handlePlantChange(index, 'name', e.target.value)}
                                            className="w-full p-2 border rounded mb-2"
                                        />
                                        <input
                                            type="text"
                                            placeholder="Size"
                                            value={plant.size}
                                            onChange={(e) => handlePlantChange(index, 'size', e.target.value)}
                                            className="w-full p-2 border rounded mb-2"
                                        />
                                        <input
                                            type="number"
                                            placeholder="Quantity"
                                            value={plant.quantity}
                                            onChange={(e) => handlePlantChange(index, 'quantity', parseInt(e.target.value))}
                                            className="w-full p-2 border rounded mb-2"
                                        />
                                    </li>
                                ))}
                            </ul>
                            <button
                                className="bg-blue-500 text-white px-4 py-2 rounded mt-2"
                                onClick={handleAddPlant}
                            >
                                Add Plant
                            </button>
                        </div>

                        <div className="flex justify-end space-x-2">
                            <button
                                className="bg-green-500 text-white px-4 py-2 rounded"
                                onClick={saveChanges}
                            >
                                Save
                            </button>
                            <button
                                className="bg-gray-500 text-white px-4 py-2 rounded"
                                onClick={closeModal}
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </Modal>
            )}
        </div>
    );
};

export default WantListDashboard;