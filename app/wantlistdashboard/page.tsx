'use client'
import React, { useState, useEffect } from 'react';
import WantListCard from '../components/cards/WantListCard';
import Modal from '../components/shared/Modal';
import BulkActionsBar from '../components/shared/BulkActionsBar';
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
    const [selectedEntries, setSelectedEntries] = useState<number[]>([]);
    const [bulkCloseData, setBulkCloseData] = useState({ initial: '', notes: '' });

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
                console.log('Changes saved successfully!');
                await fetchEntries(); // Re-fetch data after saving changes
                closeModal();
            } else {
                const errorData = await res.json();
                console.error(`Failed to save changes: ${errorData.error}`);
            }
        } catch (error) {
            console.error('Error saving changes:', error);
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
            console.log('New want list entry added successfully!');
            await fetchEntries(); // Re-fetch data after adding new entry
            closeModal();
        } catch (error) {
            console.error('Error adding new entry:', error);
        }
    };

    const handleMarkAsClosed = async (entryId: number, initial: string, notes: string) => {
        try {
            console.log(`Marking entry ${entryId} as closed with initial: ${initial} and notes: ${notes}`);
            const res = await fetch(`/api/want-list/${entryId}/close`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ initial, notes }),
            });
            if (res.ok) {
                setWantListEntries(prevEntries =>
                    prevEntries.map(entry =>
                        entry.id === entryId ? { ...entry, is_closed: true, closed_by: initial } : entry
                    )
                );
                console.log('Entry marked as closed successfully!');
            } else {
                const errorData = await res.json();
                console.error(`Failed to mark as closed: ${errorData.error}`);
            }
        } catch (error) {
            console.error('Error marking as closed:', error);
        }
    };

    const handleBulkClose = async () => {
        try {
            console.log(`Bulk closing entries: ${selectedEntries} with initial: ${bulkCloseData.initial} and notes: ${bulkCloseData.notes}`);
            await Promise.all(
                selectedEntries.map(entryId =>
                    fetch(`/api/want-list/${entryId}/close`, {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ initial: bulkCloseData.initial, notes: bulkCloseData.notes }),
                    })
                )
            );
            setWantListEntries(prevEntries =>
                prevEntries.map(entry =>
                    selectedEntries.includes(entry.id) ? { ...entry, is_closed: true, closed_by: bulkCloseData.initial } : entry
                )
            );
            console.log('Selected entries marked as closed successfully!');
            setSelectedEntries([]);
        } catch (error) {
            console.error('Error marking as closed:', error);
        }
    };

    const toggleSelectEntry = (entryId: number) => {
        setSelectedEntries(prev =>
            prev.includes(entryId) ? prev.filter(id => id !== entryId) : [...prev, entryId]
        );
    };

    const sortedEntries = [...wantListEntries].sort((a, b) => a.is_closed === b.is_closed ? 0 : a.is_closed ? 1 : -1);

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
            {selectedEntries.length > 0 && (
                <BulkActionsBar
                    onClose={() => setSelectedEntries([])}
                    onBulkClose={handleBulkClose}
                    bulkCloseData={bulkCloseData}
                    setBulkCloseData={setBulkCloseData}
                />
            )}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                {sortedEntries.map((entry) => (
                    <div key={entry.id} className={entry.is_closed ? 'opacity-50' : ''}>
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
                        <input
                            type="checkbox"
                            checked={selectedEntries.includes(entry.id)}
                            onChange={() => toggleSelectEntry(entry.id)}
                            className="ml-2"
                        />
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
                    {editData?.is_closed && (
                        <div className="mb-4">
                            <label className="form-label">Closed by:</label>
                            <input
                                type="text"
                                value={editData?.closed_by || ''}
                                onChange={(e) => handleEditChange('closed_by', e.target.value)}
                                className="input-field"
                                required
                            />
                        </div>
                    )}
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