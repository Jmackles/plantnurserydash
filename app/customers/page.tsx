'use client'
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import CustomerSearchFilterPanel from '../components/shared/CustomerSearchFilterPanel';
import CustomerInteractionModal from '../components/shared/CustomerInteractionModal';
import { Customer, Plant } from '../lib/types';

const fetchCustomers = async () => {
    const response = await fetch('/api/customers');
    console.log('Fetching customers from:', response.url);
    if (!response.ok) {
        const errorText = await response.text();
        console.error('Error fetching customers:', response.status, errorText);
        throw new Error(errorText || 'Failed to fetch customers');
    }
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
        return response.json();
    } else {
        throw new Error('Unexpected response format');
    }
};

const addCustomer = async (customer: Omit<Customer, 'id'>) => {
    const response = await fetch('/api/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(customer)
    });
    console.log('Adding customer to:', response.url);
    if (!response.ok) {
        const errorText = await response.text();
        console.error('Error adding customer:', response.status, errorText);
        throw new Error(errorText || 'Failed to add customer');
    }
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
        return response.json();
    } else {
        throw new Error('Unexpected response format');
    }
};

const updateCustomer = async (customer: Customer) => {
    const response = await fetch('/api/customers', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(customer)
    });
    console.log('Updating customer at:', response.url);
    if (!response.ok) {
        const errorText = await response.text();
        console.error('Error updating customer:', response.status, errorText);
        throw new Error(errorText || 'Failed to update customer');
    }
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
        return response.json();
    } else {
        throw new Error('Unexpected response format');
    }
};

const Dashboard = () => {
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [filter, setFilter] = useState('');
    const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
    const [isAdding, setIsAdding] = useState(false);
    const [isFilterPanelVisible, setIsFilterPanelVisible] = useState(false); // Set to false to hide by default

    useEffect(() => {
        fetchCustomers()
            .then((data) => {
                // Filter out invalid customer data
                const validCustomers = data.filter((customer: Customer) => 
                    customer && customer.id && customer.first_name && customer.last_name && customer.phone && customer.email
                );
                setCustomers(validCustomers);
            })
            .catch((error) => {
                console.error('Error:', error);
                setCustomers([]);
            });
    }, []);

    const filteredCustomers = customers.filter((customer) => {
        try {
            const matchesSearchQuery = 
                (customer.first_name && customer.first_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
                (customer.last_name && customer.last_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
                (customer.phone && customer.phone.includes(searchQuery)) ||
                (customer.email && customer.email.toLowerCase().includes(searchQuery.toLowerCase()));

            return matchesSearchQuery;
        } catch (error) {
            console.error('Error filtering customers:', error);
            return false;
        }
    });

    const handleAddCustomer = async (newCustomer: Omit<Customer, 'id'>, wantList?: { initial: string, notes: string, plants: Plant[] }) => {
        try {
            const addedCustomer = await addCustomer(newCustomer);
            
            if (wantList) {
                // Create want list for the new customer
                await fetch('/api/want-list', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        customer_id: addedCustomer.id,
                        ...wantList
                    }),
                });
            }
            
            setCustomers((prevCustomers) => [...prevCustomers, addedCustomer]);
            setIsAdding(false);
        } catch (error) {
            if (error.message.includes('A customer with this phone or email already exists')) {
                alert('A customer with this phone or email already exists.');
            } else {
                console.error('Error adding customer:', error);
                alert('Failed to add customer.');
            }
        }
    };

    const handleSaveCustomer = async (customer: Customer, wantList?: { initial: string, notes: string, plants: Plant[] }) => {
        try {
            const updatedCustomer = await updateCustomer(customer);
            
            if (wantList) {
                // Create want list for the existing customer
                await fetch('/api/want-list', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        customer_id: customer.id,
                        ...wantList
                    }),
                });
            }
            
            setCustomers((prevCustomers) =>
                prevCustomers.map((c) => (c.id === updatedCustomer.id ? updatedCustomer : c))
            );
            setSelectedCustomer(null);
        } catch (error) {
            console.error('Error updating customer:', error);
            // Optionally add user feedback here
        }
    };

    return (
        <main className="p-6 max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-bold">Customers</h1>
                <button
                    onClick={() => setIsAdding(true)}
                    className="btn-primary"
                >
                    Add New Customer
                </button>
            </div>
            <div className="flex">
                <CustomerSearchFilterPanel
                    searchQuery={searchQuery}
                    setSearchQuery={setSearchQuery}
                    filter={filter}
                    setFilter={setFilter}
                    isVisible={isFilterPanelVisible}
                    toggleVisibility={() => setIsFilterPanelVisible(!isFilterPanelVisible)}
                />
                <div className={`flex-1 ${isFilterPanelVisible ? 'ml-72' : 'ml-0'}`}>
                    <div className="overflow-x-auto">
                        <table className="min-w-full bg-white shadow-md rounded-lg">
                            <thead>
                                <tr>
                                    <th className="py-2 px-4 border-b">First Name</th>
                                    <th className="py-2 px-4 border-b">Last Name</th>
                                    <th className="py-2 px-4 border-b">Phone</th>
                                    <th className="py-2 px-4 border-b">Email</th>
                                    <th className="py-2 px-4 border-b">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredCustomers.map((customer) => (
                                    <tr key={customer.id} className="cursor-pointer">
                                        <td className="py-2 px-4 border-b">
                                            <Link href={`/customers/${customer.id}`} className="text-blue-500 underline">
                                                {customer.first_name || 'N/A'}
                                            </Link>
                                        </td>
                                        <td className="py-2 px-4 border-b">{customer.last_name || 'N/A'}</td>
                                        <td className="py-2 px-4 border-b">{customer.phone || 'N/A'}</td>
                                        <td className="py-2 px-4 border-b">{customer.email || 'N/A'}</td>
                                        <td className="py-2 px-4 border-b">
                                            <button
                                                onClick={() => setSelectedCustomer(customer)}
                                                className="text-blue-500 underline"
                                            >
                                                Edit
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
            {selectedCustomer && (
                <CustomerInteractionModal
                    customer={selectedCustomer}
                    onClose={() => setSelectedCustomer(null)}
                    onSave={handleSaveCustomer}
                />
            )}
            {isAdding && (
                <CustomerInteractionModal
                    customer={null}
                    onClose={() => {
                        console.log('Closing Add New Customer modal');
                        setIsAdding(false);
                    }}
                    onSave={handleAddCustomer}
                />
            )}
        </main>
    );
};

export default Dashboard;
