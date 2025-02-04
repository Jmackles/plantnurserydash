'use client'

import { useState, useEffect } from 'react';
import { WantList, Customer, Plant } from './../lib/types';
import { fetchWantListEntries, fetchCustomers, addCustomer, addWantListEntry } from '../../lib/api';
import WantListCard from './../components/cards/WantListCard';
import CustomerInteractionModal from '../components/shared/CustomerInteractionModal';

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
        status: 'pending',
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
        is_active: true,
        notes: ''
    });
    const [selectedEntries, setSelectedEntries] = useState<number[]>([]);
    const [bulkCloseData, setBulkCloseData] = useState({ initial: '', notes: '' });
    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

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

    useEffect(() => {
        if (selectedEntry) {
            setEditData(selectedEntry);
        }
    }, [selectedEntry]);

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
            plants: [...(editData.plants || []), { id: Date.now(), name: '', size: '', quantity: 1, status: 'pending', plant_catalog_id: 0, requested_at: '', fulfilled_at: '' }],
        });
    };

    const saveChanges = async () => {
        if (!selectedEntry || !editData) {
            console.error('No edit data available', { selectedEntry, editData });
            return;
        }
        
        try {
            console.log('Attempting to save changes for entry:', editData.id);
            console.log('Edit data:', editData);
            
            const res = await fetch(`/api/want-list/${selectedEntry.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(editData),
            });

            console.log('Response status:', res.status);
            const data = await res.json();
            console.log('Response data:', data);
            
            if (!res.ok) {
                throw new Error(data.error || 'Failed to save changes');
            }

            await fetchEntries(); // Refresh the list
            closeModal();
        } catch (error) {
            console.error('Error saving changes:', error);
            alert('Failed to save changes: ' + (error.message || 'Unknown error'));
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
            plants: [...newEntryData.plants, { id: Date.now(), name: '', size: '', quantity: 1, status: 'pending', plant_catalog_id: 0, requested_at: '', fulfilled_at: '' }],
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
                created_at_text: new Date().toISOString(),
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

    const handleBulkAction = async (action: 'complete' | 'cancel', data: { initial: string, notes: string }) => {
        if (!data.initial) {
            alert('Please enter your initials');
            return;
        }

        try {
            const updatedEntries = await Promise.all(
                selectedEntries.map(async (entryId) => {
                    const res = await fetch(`/api/want-list/${entryId}/status`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            status: action,
                            initial: data.initial,
                            notes: data.notes
                        })
                    });

                    if (!res.ok) {
                        throw new Error(`Failed to update entry ${entryId}`);
                    }

                    return await res.json();
                })
            );

            setWantListEntries(prevEntries =>
                prevEntries.map(entry => {
                    const updated = updatedEntries.find(u => u.id === entry.id);
                    return updated || entry;
                })
            );

            setSelectedEntries([]);
        } catch (error) {
            console.error('Error in bulk action:', error);
            alert('Failed to update some entries');
        }
    };

    const handleStatusChange = async (entryId: number, status: 'completed' | 'canceled', data: { initial: string, notes: string }) => {
        if (!data.initial) {
            alert('Please enter your initials');
            return;
        }

        try {
            const res = await fetch(`/api/want-list/${entryId}/status`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    status,
                    initial: data.initial,
                    notes: data.notes
                })
            });

            if (!res.ok) {
                const error = await res.json();
                throw new Error(error.message || 'Failed to update status');
            }

            const updatedEntry = await res.json();
            
            setWantListEntries(prevEntries =>
                prevEntries.map(entry =>
                    entry.id === entryId ? updatedEntry : entry
                )
            );
        } catch (error) {
            console.error('Error updating status:', error);
            alert(error.message || 'Failed to update status');
        }
    };

    const toggleSelectEntry = (entryId: number) => {
        setSelectedEntries(prev =>
            prev.includes(entryId) ? prev.filter(id => id !== entryId) : [...prev, entryId]
        );
    };

    const filteredEntries = wantListEntries.filter(entry => {
        const matchesSearchQuery = entry.initial.toLowerCase().includes(searchQuery.toLowerCase()) ||
            entry.notes.toLowerCase().includes(searchQuery.toLowerCase()) ||
            customers.find(c => c.id === entry.customer_id)?.first_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            customers.find(c => c.id === entry.customer_id)?.last_name.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesFilterStatus = filterStatus === '' || entry.status === filterStatus;

        return matchesSearchQuery && matchesFilterStatus;
    });

    const paginatedEntries = filteredEntries.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    const totalPages = Math.ceil(filteredEntries.length / itemsPerPage);

    return (
        <main className="p-6 max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-sage-800">Want List Dashboard</h1>
                <button
                    onClick={() => setIsAdding(true)}
                    className="btn-primary"
                >
                    Add New Want List Entry
                </button>
            </div>

            <div className="flex justify-between items-center mb-6">
                <input
                    type="text"
                    placeholder="Search..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="input-field"
                />
                <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="input-field"
                >
                    <option value="">All</option>
                    <option value="pending">Pending</option>
                    <option value="completed">Completed</option>
                    <option value="canceled">Canceled</option>
                </select>
            </div>

            {selectedEntries.length > 0 && (
                <div className="mb-6">
                    <BulkActionsBar
                        selectedCount={selectedEntries.length}
                        onClose={() => setSelectedEntries([])}
                        onBulkAction={handleBulkAction}
                        bulkActionData={bulkCloseData}
                        setBulkActionData={setBulkCloseData}
                    />
                </div>
            )}

            <div className="grid gap-6 mb-20">
                {paginatedEntries.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-lg shadow">
                        <p className="text-sage-600">No want list entries found.</p>
                    </div>
                ) : (
                    paginatedEntries.map(entry => (
                        <WantListCard 
                            key={entry.id} 
                            entry={entry} 
                            onClick={() => setSelectedEntry(entry)}
                            onStatusChange={(status, data) => handleStatusChange(entry.id, status, data)}
                            onSelect={(selected) => {
                                if (selected) {
                                    setSelectedEntries(prev => [...prev, entry.id]);
                                } else {
                                    setSelectedEntries(prev => prev.filter(id => id !== entry.id));
                                }
                            }}
                            isSelected={selectedEntries.includes(entry.id)}
                        />
                    ))
                )}
            </div>

            <div className="flex justify-between items-center mt-6">
                <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="btn-secondary"
                >
                    Previous
                </button>
                <span>Page {currentPage} of {totalPages}</span>
                <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="btn-secondary"
                >
                    Next
                </button>
            </div>

            {selectedEntry && (
                <CustomerInteractionModal
                    customer={customers.find(c => c.id === selectedEntry.customer_id) || null}
                    onClose={closeModal}
                    onSave={saveChanges}
                    wantListEntry={selectedEntry}
                    editData={editData}
                    setEditData={setEditData}
                />
            )}

            {isAdding && (
                <CustomerInteractionModal
                    customer={null}
                    onClose={() => setIsAdding(false)}
                    onSave={saveNewEntry}
                />
            )}
        </main>
    );
};

export default WantListDashboard;