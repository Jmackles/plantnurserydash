'use client'
import React, { useState, useEffect } from 'react';
import WantListCard from '../components/cards/WantListCard';
import Modal from '../components/shared/Modal';
import BulkActionsBar from '../components/shared/BulkActionsBar';
import { fetchWantListEntries, fetchCustomers, addWantListEntry, addCustomer } from '../lib/api';
import { WantListEntry, Plant, Customer } from '../lib/types';

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
        created_at: new Date().toISOString(), // Add this line
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
                await fetchEntries();
                closeModal();
            } else {
                console.error('Failed to save changes');
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
                created_at: new Date().toISOString(), // Ensure created_at is set
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
                await fetchEntries();
            } else {
                console.error('Failed to mark as closed');
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
        } catch (error) {
            console.error('Error bulk closing entries:', error);
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
            {selectedEntries.length > 0 && (
                <BulkActionsBar
                    onClose={() => setSelectedEntries([])}
                    onBulkClose={handleBulkClose}
                    bulkCloseData={bulkCloseData}
                    setBulkCloseData={setBulkCloseData}
                />
            )}

            {selectedEntry && (
                <Modal onClose={closeModal}>
                    <WantListCard
                        entry={selectedEntry}
                        onEdit={() => setEditData(selectedEntry)}
                        onClose={() => handleMarkAsClosed(selectedEntry.id, selectedEntry.initial, selectedEntry.notes || '')}
                    />
                </Modal>
            )}

            {isAdding && (
                <Modal onClose={closeModal}>
                    <div>
                        <h2>Add New Want List Entry</h2>
                        <form onSubmit={saveNewEntry}>
                            {/* Form fields for new entry */}
                        </form>
                    </div>
                </Modal>
            )}

            <div>
                {sortedEntries.map(entry => (
                    <WantListCard
                        key={entry.id}
                        entry={entry}
                        onSelect={() => toggleSelectEntry(entry.id)}
                        onEdit={() => setSelectedEntry(entry)}
                    />
                ))}
            </div>
        </main>
    );
};

export default WantListDashboard;