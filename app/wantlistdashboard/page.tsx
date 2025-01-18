'use client'
import React, { useState, useEffect } from 'react';
import WantListCard from '../components/cards/WantListCard';
import Modal from '../components/shared/Modal';
import { fetchWantListEntries, fetchCustomers, addWantListEntry, addCustomer } from '../lib/api';
import { WantListEntry, Plant, Customer } from '../lib/types';
import Link from 'next/link';

const WantListDashboard = () => {
    const [wantListEntries, setWantListEntries] = useState<WantListEntry[]>([]);
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [selectedEntry, setSelectedEntry] = useState<WantListEntry | null>(null);
    const [editData, setEditData] = useState<WantListEntry | null>(null);
    const [isAdding, setIsAdding] = useState(false);
    const [useNewCustomer, setUseNewCustomer] = useState(false);
    const [newEntryData, setNewEntryData] = useState({
        customer_id: '',
        initial: '',
        notes: '',
        plants: [{ name: '', size: '', quantity: 1 }],
    });
    const [newCustomerData, setNewCustomerData] = useState({
        first_name: '',
        last_name: '',
        phone: '',
        email: '',
    });

    const fetchEntries = async () => {
        try {
            const entries = await fetchWantListEntries();
            setWantListEntries(entries);
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const fetchCustomerList = async () => {
        try {
            const customerList = await fetchCustomers();
            setCustomers(customerList);
        } catch (error) {
            console.error('Error:', error);
        }
    };

    useEffect(() => {
        fetchEntries();
        fetchCustomerList();
    }, []);

    const closeModal = () => {
        setSelectedEntry(null);
        setEditData(null);
        setIsAdding(false);
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
                await fetchEntries(); // Re-fetch data after saving changes
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

    const handleNewEntryChange = (field: keyof typeof newEntryData, value: string | number | boolean) => {
        setNewEntryData((prev) => ({ ...prev, [field]: value }));
    };

    const handleNewPlantChange = (index: number, field: keyof Plant, value: string | number) => {
        const updatedPlants = [...newEntryData.plants];
        updatedPlants[index] = { ...updatedPlants[index], [field]: value };
        setNewEntryData({ ...newEntryData, plants: updatedPlants });
    };

    const handleAddNewPlant = () => {
        setNewEntryData({
            ...newEntryData,
            plants: [...newEntryData.plants, { name: '', size: '', quantity: 1 }],
        });
    };

    const handleNewCustomerChange = (field: keyof typeof newCustomerData, value: string) => {
        setNewCustomerData((prev) => ({ ...prev, [field]: value }));
    };

    const saveNewEntry = async () => {
        try {
            let customerId = newEntryData.customer_id;
            if (useNewCustomer) {
                const newCustomer = await addCustomer(newCustomerData);
                customerId = newCustomer.id.toString();
            }
            await addWantListEntry({
                ...newEntryData,
                customer_id: parseInt(customerId),
            });
            alert('New want list entry added successfully!');
            await fetchEntries(); // Re-fetch data after adding new entry
            closeModal();
        } catch (error) {
            console.error('Error adding new entry:', error);
            alert('An unexpected error occurred while adding new entry.');
        }
    };

    return (
        <main className="p-6 max-w-7xl mx-auto">
            <h1 className="text-3xl font-bold text-sage-700 mb-8">Want List Dashboard</h1>
            <div className="flex justify-end mb-4">
                <button
                    onClick={() => setIsAdding(true)}
                    className="btn-primary"
                >
                    Add New Want List Entry
                </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                {wantListEntries.map((entry) => (
                    <div key={entry.id}>
                        <WantListCard 
                            key={entry.id} 
                            entry={entry} 
                            onClick={() => {
                                setSelectedEntry(entry);
                                setEditData(entry);
                            }} 
                        />
                        <Link href={`/customers/${entry.customer_id}`} className="text-blue-500 underline">
                            View Customer
                        </Link>
                    </div>
                ))}
            </div>

            {selectedEntry && (
                <Modal
                    title={`Edit Entry for ${selectedEntry.customer_first_name} ${selectedEntry.customer_last_name}`}
                    onClose={closeModal}
                >
                    <div className="mb-4">
                        <label className="form-label">Initial:</label>
                        <input
                            type="text"
                            value={editData?.initial || ''}
                            onChange={(e) => handleEditChange('initial', e.target.value)}
                            className="input-field"
                        />
                    </div>
                    <div className="mb-4">
                        <label className="form-label">Notes:</label>
                        <textarea
                            value={editData?.notes || ''}
                            onChange={(e) => handleEditChange('notes', e.target.value)}
                            className="input-field"
                        ></textarea>
                    </div>
                    <div className="mb-4">
                        <label className="form-label">Spoken To:</label>
                        <input
                            type="text"
                            value={editData?.spoken_to || ''}
                            onChange={(e) => handleEditChange('spoken_to', e.target.value)}
                            className="input-field"
                        />
                    </div>
                    <div className="mb-4">
                        <label className="form-label">Status:</label>
                        <select
                            value={editData?.is_closed ? 'Closed' : 'Open'}
                            onChange={(e) => handleEditChange('is_closed', e.target.value === 'Closed')}
                            className="input-field"
                        >
                            <option value="Open">Open</option>
                            <option value="Closed">Closed</option>
                        </select>
                    </div>
                    <div className="mb-4">
                        <label className="form-label">Plants:</label>
                        <ul className="list-disc pl-4">
                            {editData?.plants?.map((plant, index) => (
                                <li key={index}>
                                    <input
                                        type="text"
                                        placeholder="Plant Name"
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
                                        placeholder="Quantity"
                                        value={plant.quantity}
                                        onChange={(e) => handlePlantChange(index, 'quantity', parseInt(e.target.value))}
                                        className="input-field"
                                    />
                                </li>
                            ))}
                        </ul>
                        <button
                            className="btn-primary mt-2"
                            onClick={handleAddPlant}
                        >
                            Add Plant
                        </button>
                    </div>

                    <div className="flex justify-end space-x-2">
                        <button
                            className="btn-primary"
                            onClick={saveChanges}
                        >
                            Save
                        </button>
                        <button
                            className="btn-secondary"
                            onClick={closeModal}
                        >
                            Cancel
                        </button>
                    </div>
                </Modal>
            )}

            {isAdding && (
                <Modal
                    title="Add New Want List Entry"
                    onClose={closeModal}
                >
                    <div className="mb-4">
                        <label className="form-label">New Customer:</label>
                        <input
                            type="checkbox"
                            checked={useNewCustomer}
                            onChange={(e) => setUseNewCustomer(e.target.checked)}
                            className="ml-2"
                        />
                    </div>
                    {!useNewCustomer && (
                        <div className="mb-4">
                            <label className="form-label">Customer:</label>
                            <select
                                value={newEntryData.customer_id}
                                onChange={(e) => handleNewEntryChange('customer_id', e.target.value)}
                                className="input-field"
                            >
                                <option value="">Select Existing Customer</option>
                                {customers.map((customer) => (
                                    <option key={customer.id} value={customer.id}>
                                        {customer.first_name} {customer.last_name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}
                    {useNewCustomer && (
                        <div className="mb-4">
                            <label className="form-label">First Name:</label>
                            <input
                                type="text"
                                placeholder="First Name"
                                value={newCustomerData.first_name}
                                onChange={(e) => handleNewCustomerChange('first_name', e.target.value)}
                                className="input-field"
                            />
                            <label className="form-label">Last Name:</label>
                            <input
                                type="text"
                                placeholder="Last Name"
                                value={newCustomerData.last_name}
                                onChange={(e) => handleNewCustomerChange('last_name', e.target.value)}
                                className="input-field"
                            />
                            <label className="form-label">Phone:</label>
                            <input
                                type="text"
                                placeholder="Phone"
                                value={newCustomerData.phone}
                                onChange={(e) => handleNewCustomerChange('phone', e.target.value)}
                                className="input-field"
                            />
                            <label className="form-label">Email:</label>
                            <input
                                type="text"
                                placeholder="Email"
                                value={newCustomerData.email}
                                onChange={(e) => handleNewCustomerChange('email', e.target.value)}
                                className="input-field"
                            />
                        </div>
                    )}
                    <div className="mb-4">
                        <label className="form-label">Initial:</label>
                        <input
                            type="text"
                            value={newEntryData.initial}
                            onChange={(e) => handleNewEntryChange('initial', e.target.value)}
                            className="input-field"
                        />
                    </div>
                    <div className="mb-4">
                        <label className="form-label">Notes:</label>
                        <textarea
                            value={newEntryData.notes}
                            onChange={(e) => handleNewEntryChange('notes', e.target.value)}
                            className="input-field"
                        ></textarea>
                    </div>
                    <div className="mb-4">
                        <label className="form-label">Plants:</label>
                        <ul className="list-disc pl-4">
                            {newEntryData.plants.map((plant, index) => (
                                <li key={index}>
                                    <input
                                        type="text"
                                        placeholder="Plant Name"
                                        value={plant.name}
                                        onChange={(e) => handleNewPlantChange(index, 'name', e.target.value)}
                                        className="input-field"
                                    />
                                    <input
                                        type="text"
                                        placeholder="Size"
                                        value={plant.size}
                                        onChange={(e) => handleNewPlantChange(index, 'size', e.target.value)}
                                        className="input-field"
                                    />
                                    <input
                                        type="number"
                                        placeholder="Quantity"
                                        value={plant.quantity}
                                        onChange={(e) => handleNewPlantChange(index, 'quantity', parseInt(e.target.value))}
                                        className="input-field"
                                    />
                                </li>
                            ))}
                        </ul>
                        <button
                            className="btn-primary mt-2"
                            onClick={handleAddNewPlant}
                        >
                            Add Plant
                        </button>
                    </div>

                    <div className="flex justify-end space-x-2">
                        <button
                            className="btn-primary"
                            onClick={saveNewEntry}
                        >
                            Save
                        </button>
                        <button
                            className="btn-secondary"
                            onClick={closeModal}
                        >
                            Cancel
                        </button>
                    </div>
                </Modal>
            )}
        </main>
    );
};

export default WantListDashboard;