import React, { useState } from 'react';
import { WantList, Plant, Customer } from '../../lib/types';
import { addWantListEntry } from '../../lib/api';

interface WantListEntryModalProps {
    customer: Customer;
    onClose: () => void;
    onSave: (wantListEntry: WantList) => void;
}

const WantListEntryModal: React.FC<WantListEntryModalProps> = ({ customer, onClose, onSave }) => {
    const [wantListData, setWantListData] = useState({
        initial: '',
        notes: '',
        plants: [] as Plant[]
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setWantListData(prev => ({ ...prev, [name]: value }));
    };

    const handleAddPlant = () => {
        setWantListData(prev => ({
            ...prev,
            plants: [
                ...prev.plants,
                {
                    id: Date.now(),
                    want_list_entry_id: 0,
                    name: '',
                    size: '',
                    quantity: 1,
                    status: 'pending',
                    plant_catalog_id: 0,
                    requested_at: '',
                    fulfilled_at: ''
                }
            ]
        }));
    };

    const handlePlantChange = (index: number, field: keyof Plant, value: string | number) => {
        setWantListData(prev => {
            const updatedPlants = [...prev.plants];
            updatedPlants[index] = { ...updatedPlants[index], [field]: value };
            return { ...prev, plants: updatedPlants };
        });
    };

    const handleSave = async () => {
        try {
            const wantListEntryData: WantList = {
                id: 0,
                customer_id: customer.id,
                initial: wantListData.initial,
                general_notes: wantListData.notes,
                status: 'pending',
                spoken_to: '',
                created_at_text: new Date().toISOString(),
                closed_by: '',
                plants: wantListData.plants
                    .filter(plant => plant.name && plant.quantity > 0)
                    .map(plant => ({
                        id: 0,
                        want_list_entry_id: 0,
                        name: plant.name,
                        size: plant.size || '',
                        quantity: plant.quantity,
                        status: 'pending',
                        plant_catalog_id: plant.plant_catalog_id || 0,
                        requested_at: '',
                        fulfilled_at: ''
                    }))
            };
            const newWantListEntry = await addWantListEntry(wantListEntryData);
            onSave(newWantListEntry);
        } catch (error) {
            console.error('Error creating want list entry:', error);
            alert('Failed to create want list entry');
        }
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <h2 className="text-xl font-bold mb-4">Add Want List Entry</h2>
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700">Initial</label>
                    <input
                        type="text"
                        name="initial"
                        value={wantListData.initial}
                        onChange={handleChange}
                        className="input-field"
                    />
                </div>
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700">Notes</label>
                    <textarea
                        name="notes"
                        value={wantListData.notes}
                        onChange={handleChange}
                        className="input-field"
                    ></textarea>
                </div>
                <div className="mb-4">
                    <div className="flex justify-between items-center mb-2">
                        <label className="block text-sm font-medium text-gray-700">Plants</label>
                        <button type="button" onClick={handleAddPlant} className="btn-secondary">
                            Add Plant
                        </button>
                    </div>
                    {wantListData.plants.map((plant, index) => (
                        <div key={index} className="grid grid-cols-3 gap-2 mb-2">
                            <input
                                type="text"
                                placeholder="Name"
                                value={plant.name}
                                onChange={(e) => handlePlantChange(index, 'name', e.target.value)}
                                className="input-field"
                            />
                            <input
                                type="text"
                                placeholder="Size"
                                value={plant.size}
                                onChange={(e) => handlePlantChange(index, 'size', e.target.value)}
                                className="input-field"
                            />
                            <input
                                type="number"
                                placeholder="Qty"
                                value={plant.quantity}
                                onChange={(e) => handlePlantChange(index, 'quantity', parseInt(e.target.value))}
                                className="input-field"
                            />
                        </div>
                    ))}
                </div>
                <div className="flex justify-end">
                    <button onClick={onClose} className="btn-secondary mr-2">Cancel</button>
                    <button onClick={handleSave} className="btn-primary">Save</button>
                </div>
            </div>
        </div>
    );
};

export default WantListEntryModal;
