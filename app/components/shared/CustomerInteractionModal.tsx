import React, { useState, useEffect } from 'react';
import { Customer, WantListEntry, Plant } from '../../lib/types';
import { fetchWantListEntries } from '../../lib/api';

interface CustomerInteractionModalProps {
    customer: Customer | null;
    onClose: () => void;
    onSave: (updatedCustomer: Customer, wantList?: { initial: string, notes: string, plants: Plant[] }) => void;
}

const CustomerInteractionModal: React.FC<CustomerInteractionModalProps> = ({ customer, onClose, onSave }) => {
    const [wantListEntries, setWantListEntries] = useState<WantListEntry[]>([]);
    const [editedCustomer, setEditedCustomer] = useState<Customer | null>(customer);
    const [includeWantList, setIncludeWantList] = useState(false);
    const [wantListData, setWantListData] = useState({
        initial: '',
        notes: '',
        plants: [] as Plant[]
    });

    useEffect(() => {
        console.log('CustomerInteractionModal mounted with customer:', customer);
        if (customer) {
            fetchWantListEntries()
                .then(entries => setWantListEntries(entries.filter(entry => entry.customer_id === customer.id)))
                .catch(error => console.error('Error fetching want list entries:', error));
        }
    }, [customer]);

    // Keep this effect to set a blank Customer when adding:
    useEffect(() => {
        if (customer) {
            setEditedCustomer(customer);
        } else {
            setEditedCustomer({
                id: 0, // Set default ID for new customers
                first_name: '',
                last_name: '',
                phone: '',
                email: '',
                is_active: true,
                notes: ''
            });            
        }
    }, [customer]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setEditedCustomer(prev => prev ? { ...prev, [name]: value } : null);
    };

    const handleWantListChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setWantListData(prev => ({ ...prev, [name]: value }));
    };

    const handleAddPlant = () => {
        setWantListData(prev => ({
            ...prev,
            plants: [...prev.plants, { name: '', size: '', quantity: 1 }]
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
        if (editedCustomer) {
            await onSave(
                editedCustomer, 
                includeWantList ? wantListData : undefined
            );
        }
    };

    const wantListForm = (
        <div className="border-t mt-4 pt-4">
            <div className="flex items-center mb-4">
                <input
                    type="checkbox"
                    checked={includeWantList}
                    onChange={(e) => setIncludeWantList(e.target.checked)}
                    className="mr-2"
                />
                <label>Include Want List</label>
            </div>

            {includeWantList && (
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Initial</label>
                        <input
                            type="text"
                            name="initial"
                            value={wantListData.initial}
                            onChange={handleWantListChange}
                            className="input-field"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Notes</label>
                        <textarea
                            name="notes"
                            value={wantListData.notes}
                            onChange={handleWantListChange}
                            className="input-field"
                        />
                    </div>
                    <div>
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
                </div>
            )}
        </div>
    );

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <h2 className="text-xl font-bold mb-4">{customer ? 'Edit Customer' : 'Add New Customer'}</h2>
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700">First Name</label>
                    <input
                        type="text"
                        name="first_name"
                        value={editedCustomer?.first_name || ''}
                        onChange={handleChange}
                        className="input-field"
                    />
                </div>
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700">Last Name</label>
                    <input
                        type="text"
                        name="last_name"
                        value={editedCustomer?.last_name || ''}
                        onChange={handleChange}
                        className="input-field"
                    />
                </div>
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700">Phone</label>
                    <input
                        type="text"
                        name="phone"
                        value={editedCustomer?.phone || ''}
                        onChange={handleChange}
                        className="input-field"
                    />
                </div>
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700">Email</label>
                    <input
                        type="text"
                        name="email"
                        value={editedCustomer?.email || ''}
                        onChange={handleChange}
                        className="input-field"
                    />
                </div>
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700">Status</label>
                    <select
                        name="is_active"
                        value={editedCustomer?.is_active ? 'active' : 'inactive'}
                        onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                            setEditedCustomer(prev => prev ? { ...prev, is_active: e.target.value === 'active' } : null);
                        }}
                        className="input-field"
                    >
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                    </select>
                </div>
                <div className="mb-4">
                    <label className="form-label">Notes:</label>
                    <textarea
                        name="notes"
                        className="input-field"
                        onChange={handleChange}
                    ></textarea>
                </div>
                <div className="mb-4">
                    <h3 className="text-lg font-semibold">Want List Items</h3>
                    <ul>
                        {wantListEntries.map(entry => (
                            <li key={entry.id} className="mb-2">
                                <div className="font-medium">{entry.initial}</div>
                                <div className="text-sm">{entry.notes}</div>
                                <div className="text-sm">{entry.is_closed ? 'Closed' : 'Open'}</div>
                            </li>
                        ))}
                    </ul>
                </div>
                {wantListForm}
                <div className="flex justify-end">
                    <button onClick={onClose} className="btn-secondary mr-2">Cancel</button>
                    <button onClick={handleSave} className="btn-primary">Save</button>
                </div>
            </div>
        </div>
    );
};

export default CustomerInteractionModal;