'use client'
import React, { useState, useEffect } from 'react';
import { WantList, Customer, Plant } from './../lib/types';
import { fetchWantListEntries, fetchCustomers, addCustomer, addWantListEntry } from './../lib/api';
import WantListCard from './../components/cards/WantListCard';
import CustomerInteractionModal from '../components/shared/CustomerInteractionModal';
import WantListEntryModal from '../components/shared/WantListEntryModal';
import BulkActionsBar from '../components/shared/BulkActionsBar';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function formatDate(dateString: string) {
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
}

const WantListDashboard = () => {
    const [wantListEntries, setWantListEntries] = useState<WantList[]>([]);
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedEntry, setSelectedEntry] = useState<WantList | null>(null);
    const [editData, setEditData] = useState<WantList | null>(null);
    const [isAdding, setIsAdding] = useState(false);
    const [useNewCustomer, setUseNewCustomer] = useState(false);
    const [newEntryData, setNewEntryData] = useState<WantList>({
        id: 0,
        customer_id: 0,
        initial: '',
        general_notes: '',
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
        notes: ''
    });
    const [selectedEntries, setSelectedEntries] = useState<number[]>([]);
    const [bulkCloseData, setBulkCloseData] = useState({ initial: '', notes: '' });
    const [filterStatus, setFilterStatus] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;
    const [showNewEntryModal, setShowNewEntryModal] = useState(false);

    const fetchEntries = async () => {
        try {
            const response = await fetch('/api/want-list');
            if (!response.ok) {
                throw new Error('Failed to fetch want lists');
            }
            const data = await response.json();
            console.log('Fetched want lists:', data);
            
            // Fix: use setWantListEntries instead of setWantLists
            setWantListEntries(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Error fetching entries:', error);
            setWantListEntries([]); // Fix: use setWantListEntries here too
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
        const savedState = localStorage.getItem('wantListState');
        if (savedState) {
            const state = JSON.parse(savedState);
            setCurrentPage(state.currentPage || 1);
            setSearchQuery(state.searchQuery || '');
            setFilterStatus(state.filterStatus || '');
            window.scrollTo(0, state.scrollPosition || 0);
        }
        
        fetchEntries();
        fetchCustomerList();
    }, []);

    useEffect(() => {
        const state = {
            currentPage,
            searchQuery,
            filterStatus,
            scrollPosition: window.scrollY
        };
        localStorage.setItem('wantListState', JSON.stringify(state));
    }, [currentPage, searchQuery, filterStatus]);

    useEffect(() => {
        const handleScroll = () => {
            const state = JSON.parse(localStorage.getItem('wantListState') || '{}');
            localStorage.setItem('wantListState', JSON.stringify({
                ...state,
                scrollPosition: window.scrollY
            }));
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
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

            await fetchEntries();
            closeModal();
            toast.success('Changes saved successfully!');
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

    const saveNewEntry = async (customer: Customer, wantListEntry?: WantList) => {
        try {
            if (!wantListEntry || !wantListEntry.initial) {
                toast.error('Missing required information');
                return;
            }

            let customerToUse;

            try {
                const response = await addCustomer(customer);
                customerToUse = response.isExisting ? response.customer : response.customer;
                console.log('Customer response:', response);
                console.log('Customer to use:', customerToUse);
            } catch (error: any) {
                console.error('Customer creation error:', error);
                toast.error('Failed to create customer');
                return;
            }

            if (!customerToUse?.id) {
                console.error('No valid customer ID');
                toast.error('Failed to get valid customer ID');
                return;
            }

            const entryToSave = {
                customer_id: customerToUse.id,
                initial: wantListEntry.initial,
                general_notes: wantListEntry.general_notes || '',
                status: 'pending',
                created_at_text: new Date().toISOString(),
                plants: wantListEntry.plants
                    .filter(plant => plant.name && plant.quantity > 0)
                    .map(plant => ({
                        name: plant.name,
                        size: plant.size || '',
                        quantity: plant.quantity,
                        status: 'pending'
                    }))
            };

            console.log('Saving want list entry:', entryToSave);
            const savedEntry = await addWantListEntry(entryToSave);
            console.log('Saved want list entry:', savedEntry);
            
            await fetchEntries();
            closeModal();
            toast.success('Want list entry added successfully!');
        } catch (error: any) {
            console.error('Error in saveNewEntry:', error);
            toast.error('Failed to add entry: ' + (error.message || 'Unknown error'));
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
                toast.success('Entry marked as closed successfully!');
            } else {
                console.error('Failed to mark entry as closed');
                toast.error('Failed to mark entry as closed.');
            }
        } catch (error) {
            console.error('Error marking as closed:', error);
            toast.error('Error marking entry as closed.');
        }
    };

    const handleBulkAction = async (action: 'complete' | 'cancel', data: { initial: string, notes: string }) => {
        if (!data.initial) {
            alert('Please enter your initials');
            return;
        }

        try {
            const status = action === 'complete' ? 'completed' : 'canceled';
            
            const updatedEntries = await Promise.all(
                selectedEntries.map(async (entryId) => {
                    console.log(`Updating entry ${entryId} with status: ${status}`);
                    const res = await fetch(`/api/want-list/${entryId}/status`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            status,
                            initial: data.initial,
                            notes: data.notes || `Bulk ${action} by ${data.initial}`
                        })
                    });

                    if (!res.ok) {
                        const error = await res.json();
                        throw new Error(`Failed to update entry ${entryId}: ${error.message}`);
                    }

                    return await res.json();
                })
            );

            await fetchEntries();
            setSelectedEntries([]);
            toast.success('Bulk action completed successfully!');
        } catch (error) {
            console.error('Error in bulk action:', error);
            toast.error('Failed to update some entries.');
        }
    };

    const handleStatusChange = async (entryId: number, status: 'completed' | 'canceled', data: { initial: string, notes: string }) => {
        if (!data.initial) {
            alert('Please enter your initials');
            return;
        }

        try {
            console.log(`Updating status for entry ${entryId} to ${status} with data:`, data);
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
            toast.success('Status updated successfully!');
        } catch (error) {
            console.error('Error updating status:', error);
            toast.error('Failed to update status.');
        }
    };

    const toggleSelectEntry = (entryId: number) => {
        setSelectedEntries(prev =>
            prev.includes(entryId) ? prev.filter(id => id !== entryId) : [...prev, entryId]
        );
    };

    const statusPriority: { [key: string]: number } = {
        'pending': 1,     // Keep pending as highest priority (first)
        'completed': 0,   // Keep completed in middle
        'canceled': 2     // Keep canceled at end
    };

    const filteredAndSortedEntries = wantListEntries
        .filter(entry => {
            const matchesSearchQuery = entry.initial.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (entry.general_notes || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                customers.find(c => c.id === entry.customer_id)?.first_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                customers.find(c => c.id === entry.customer_id)?.last_name.toLowerCase().includes(searchQuery.toLowerCase());

            const matchesFilterStatus = filterStatus === '' || entry.status === filterStatus;

            return matchesSearchQuery && matchesFilterStatus;
        })
        .sort((a, b) => {
            // First sort by status priority
            const statusDiff = (statusPriority[a.status] || 999) - (statusPriority[b.status] || 999);
            if (statusDiff !== 0) return statusDiff;
            
            // Then sort by created date (newest first) within the same status
            return new Date(b.created_at_text).getTime() - new Date(a.created_at_text).getTime();
        });

    // Replace the existing pagination logic with this:
    const paginatedEntries = filteredAndSortedEntries.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const totalPages = Math.ceil(filteredAndSortedEntries.length / itemsPerPage);

    // Update useEffect to reset to first page when filter changes
    useEffect(() => {
        setCurrentPage(1);
    }, [filterStatus, searchQuery]);

    return (
        <main className="p-6 max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Want List Dashboard</h1>
                <button
                    onClick={() => setShowNewEntryModal(true)}
                    className="btn-primary"
                    suppressHydrationWarning
                >
                    Add New Want List Entry
                </button>
            </div>

            <div className="flex justify-between gap-4 mb-6">
                <input
                    type="text"
                    placeholder="Search..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="input-field"
                    suppressHydrationWarning
                />
                <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="input-field"
                    suppressHydrationWarning
                >
                    <option value="">All Status</option>
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

            <div className="space-y-4">
                {paginatedEntries.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-lg shadow">
                        <p className="text-sage-600">No want list entries found.</p>
                    </div>
                ) : (
                    paginatedEntries.map(entry => {
                        const customer = customers.find(c => c.id === entry.customer_id);
                        return (
                            <WantListCard
                                key={entry.id}
                                entry={entry}
                                customer={customer || null}
                                onClick={() => setSelectedEntry(entry)}
                                onSelect={(selected) => {
                                    if (selected) {
                                        setSelectedEntries(prev => [...prev, entry.id]);
                                    } else {
                                        setSelectedEntries(prev => prev.filter(id => id !== entry.id));
                                    }
                                }}
                                isSelected={selectedEntries.includes(entry.id)}
                                onStatusChange={(status, data) => handleStatusChange(entry.id, status, data)}
                            />
                        );
                    })
                )}
            </div>

            <div className="flex justify-between items-center mt-6">
                <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="btn-secondary"
                    suppressHydrationWarning
                >
                    Previous
                </button>
                <span>Page {currentPage} of {totalPages}</span>
                <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="btn-secondary"
                    suppressHydrationWarning
                >
                    Next
                </button>
            </div>

            {showNewEntryModal && (
                <WantListEntryModal
                    onClose={() => setShowNewEntryModal(false)}
                    onSave={async (customer, wantList) => {
                        try {
                            await saveNewEntry(customer, wantList);
                            setShowNewEntryModal(false);
                        } catch (error) {
                            console.error('Error saving new entry:', error);
                            toast.error('Failed to save new entry');
                        }
                    }}
                />
            )}

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
            <ToastContainer />
        </main>
    );
};

export default WantListDashboard;