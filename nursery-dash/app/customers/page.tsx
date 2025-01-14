'use client'
import React, { useState, useEffect } from 'react';
import InputForm from '../components/forms/InputForm';
import CustomerCard from '../components/cards/CustomerCard';
import Modal from '../components/shared/Modal';
import { fetchCustomers, fetchWantListEntries } from '../lib/api';
import { FormData, Customer, WantListEntry, Plant, ApiResponse } from '../lib/types';

const Dashboard = () => {
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
    const [editCustomerData, setEditCustomerData] = useState<Partial<Customer>>({});
    const [editMode, setEditMode] = useState(false);
    const [wantListEntries, setWantListEntries] = useState<WantListEntry[]>([]);
    const [selectedEntry, setSelectedEntry] = useState<WantListEntry | null>(null);
    const [editData, setEditData] = useState<Partial<WantListEntry> | null>(null);
    const [isFormOpen, setIsFormOpen] = useState(false);

    useEffect(() => {
        fetchCustomers()
            .then(setCustomers)
            .catch((error) => {
                console.error('Error:', error);
                setCustomers([]);
            });
    }, []);

    useEffect(() => {
        fetchWantListEntries()
            .then(setWantListEntries)
            .catch((error) => console.error('Error:', error));
    }, []);

    const handleFormSubmit = async (formData: FormData): Promise<ApiResponse> => {
        const { firstName, lastName, phone, email, initial, notes, plants, spokenTo } = formData;

        try {
            // Add or fetch customer
            const customerRes = await fetch('/api/customers', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    first_name: firstName,
                    last_name: lastName,
                    phone,
                    email,
                }),
            });

            if (!customerRes.ok) {
                const errorData = await customerRes.json();
                throw new Error(errorData.error || 'Failed to add or fetch customer.');
            }

            const customerData = await customerRes.json();
            const customer_id = customerData.id || customerData.customer?.id;

            // If plants are provided, submit want-list entry
            if (plants && plants.length > 0) {
                const wantListRes = await fetch('/api/want-list', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        customer_id,
                        initial,
                        notes,
                        plants,
                    }),
                });

                if (!wantListRes.ok) {
                    const errorData = await wantListRes.json();
                    throw new Error(errorData.error || 'Failed to add want list entry.');
                }
            }

            // If spokenTo is specified, log it
            if (spokenTo) {
                await fetch('/api/spoken-to', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        name: spokenTo,
                        customer_id,
                    }),
                });
            }

            return { success: true };
        } catch (error) {
            console.error('Error in handleFormSubmit:', (error as Error).message);
            return { success: false, error: (error as Error).message };
        }
    };

    const handleEditCustomer = async () => {
        const res = await fetch('/api/customers', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: editCustomerData.id, updatedFields: editCustomerData }),
        });
        if (res.ok) {
            alert('Customer updated successfully!');
            setCustomers((prev) =>
                prev.map((customer) =>
                    customer.id === editCustomerData.id ? { ...customer, ...editCustomerData } : customer
                )
            );
            setEditMode(false);
        } else {
            alert('Failed to update customer.');
        }
    };

    const handleInputChange = (field: keyof Customer, value: string | number) => {
        setEditCustomerData((prev) => ({ ...prev, [field]: value }));
    };

    const closeModal = () => {
        setSelectedCustomer(null);
        setEditCustomerData({});
        setEditMode(false);
    };

    const handleEditChange = (field: keyof WantListEntry, value: string | number) => {
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
            <button
                onClick={() => setIsFormOpen(true)}
                className="btn-primary mb-4"
            >
                Add New Customer
            </button>

            <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mt-8">
                {customers.map((customer) => (
                    <CustomerCard
                        key={customer.id}
                        customer={customer}
                        onClick={() => {
                            setSelectedCustomer(customer);
                            setEditMode(true);
                            setEditCustomerData(customer);
                        }}
                    />
                ))}
            </div>

            {isFormOpen && (
                <InputForm
                    onSubmit={handleFormSubmit}
                    onClose={() => setIsFormOpen(false)}
                />
            )}

            {editMode && selectedCustomer && (
                <Modal 
                    title={`Edit Customer: ${selectedCustomer.first_name} ${selectedCustomer.last_name}`}
                    onClose={() => setEditMode(false)}
                >
                    <input
                        type="text"
                        value={editCustomerData.first_name || ''}
                        onChange={(e) => handleInputChange('first_name', e.target.value)}
                        className="mb-2 p-2 border w-full"
                    />
                    <input
                        type="text"
                        value={editCustomerData.last_name || ''}
                        onChange={(e) => handleInputChange('last_name', e.target.value)}
                        className="mb-2 p-2 border w-full"
                    />
                    <input
                        type="text"
                        value={editCustomerData.phone || ''}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        className="mb-2 p-2 border w-full"
                    />
                    <input
                        type="email"
                        value={editCustomerData.email || ''}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        className="mb-2 p-2 border w-full"
                    />
                    <button
                        onClick={handleEditCustomer}
                        className="p-2 bg-green-500 text-white rounded mt-2"
                    >
                        Save Changes
                    </button>
                </Modal>
            )}
        </div>
    );
};

export default Dashboard;
