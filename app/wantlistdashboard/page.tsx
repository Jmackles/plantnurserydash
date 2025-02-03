'use client'

import { useState, useEffect } from 'react';
import { WantList, Customer, Plant } from './../lib/types';
import { fetchWantListEntries, fetchCustomers, addCustomer, addWantListEntry } from './../lib/api';
import WantListCard from './../components/cards/WantListCard'; // Add this import

const WantListDashboard = () => {
    const [wantListEntries, setWantListEntries] = useState<WantList[]>([]);
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [selectedEntry, setSelectedEntry] = useState<WantList | null>(null);
    const [editData, setEditData] = useState<WantList | null>(null);
    const [isAdding, setIsAdding] = useState(false);
    const [useNewCustomer, setUseNewCustomer] = useState(false);
    const [newEntryData, setNewEntryData] = useState<WantList>({
        id: 0,
        customer_id: 0,
        initial: '',
        notes: '',
        is_closed: false,
        spoken_to: '',
        created_at_text: '',
        closed_by: '',
        plants: []
    });
    const [newCustomerData, setNewCustomerData] = useState<Customer>({
        id: 0,
        first_name: '',
        last_name: '',
        phone: '',
        email: '',
        notes: ''
    });
    const [selectedEntries, setSelectedEntries] = useState<number[]>([]);
    const [bulkCloseData, setBulkCloseData] = useState({ initial: '', notes: '' });

    const fetchEntries = async () => {
        try {
            const entries = await fetchWantListEntries();
            if (Array.isArray(entries)) {
                setWantListEntries(entries);
            } else {
                console.warn('Unexpected data format:', entries);
                setWantListEntries([]);
            }
        } catch (error) {
            console.error('Error:', error);
            setWantListEntries([]);
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

    useEffect(() => {
        console.log('Want list entries:', wantListEntries);
    }, [wantListEntries]);

    const closeModal = () => {
        setSelectedEntry(null);
        setEditData(null);
        setIsAdding(false);
    };

    const handleEditChange = (field: keyof WantList, value: string | number | boolean) => {
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
            plants: [...(editData.plants || []), { id: Date.now(), name: '', size: '', quantity: 1, status: '', plant_catalog_id: 0, requested_at: '', fulfilled_at: '' }],
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
                fetchEntries();
                closeModal();
            } else {
                console.error('Failed to save changes');
            }
        } catch (error) {
            console.error('Error saving changes:', error);
        }
    };

    const handleNewEntryChange = (field: keyof WantList, value: string | number | boolean) => {
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
            plants: [...newEntryData.plants, { id: Date.now(), name: '', size: '', quantity: 1, status: '', plant_catalog_id: 0, requested_at: '', fulfilled_at: '' }],
        });
    };

    const handleNewCustomerChange = (field: keyof Customer, value: string) => {
        setNewCustomerData((prev) => ({ ...prev, [field]: value }));
    };

    const saveNewEntry = async () => {
        try {
            let customerId = newEntryData.customer_id;
            if (useNewCustomer) {
                const newCustomer = await addCustomer(newCustomerData);
                customerId = newCustomer.id;
            }
            await addWantListEntry({
                ...newEntryData,
                customer_id: customerId,
                created_at: new Date().toISOString(),
            });
            console.log('New want list entry added successfully!');
            await fetchEntries();
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
                console.log('Entry marked as closed successfully!');
                fetchEntries();
            } else {
                console.error('Failed to mark entry as closed');
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
                <div>
                    {/* Render selected entry details */}
                </div>
            )}

            {isAdding && (
                <div>
                    {/* Render form for adding new entry */}
                </div>
            )}

            <div>
                {wantListEntries.length === 0 ? (
                    <p>No want list entries found.</p>
                ) : (
                    wantListEntries.map(entry => (
                        <WantListCard key={entry.id} entry={entry} onClick={() => setSelectedEntry(entry)} />
                    ))
                )}
            </div>
        </main>
    );
};

export default WantListDashboard;