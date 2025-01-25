'use client'
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import SearchFilterPanel from '../components/shared/SearchFilterPanel';
import CustomerInteractionModal from '../components/shared/CustomerInteractionModal';
import { fetchCustomers, addCustomer, updateCustomer } from '../lib/api';
import { Customer, Plant } from '../lib/types';

const Dashboard = () => {
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [filter, setFilter] = useState('');
    const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
    const [isAdding, setIsAdding] = useState(false);

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

            const matchesFilter = filter === '' || (filter === 'active' && customer.is_active) || (filter === 'inactive' && !customer.is_active);

            return matchesSearchQuery && matchesFilter;
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
            <h1 className="text-3xl font-bold text-sage-700 mb-8">Customer Dashboard</h1>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="md:col-span-1">
                    <SearchFilterPanel
                        searchQuery={searchQuery}
                        setSearchQuery={setSearchQuery}
                        filter={filter}
                        setFilter={setFilter}
                    />
                    <button
                        onClick={() => {
                            console.log('Add New Customer button clicked');
                            setIsAdding(true);
                        }}
                        className="btn-primary mt-4"
                    >
                        Add New Customer
                    </button>
                </div>
                <div className="md:col-span-3">
                    <div className="overflow-x-auto">
                        <table className="min-w-full bg-white shadow-md rounded-lg">
                            <thead>
                                <tr>
                                    <th className="py-2 px-4 border-b">First Name</th>
                                    <th className="py-2 px-4 border-b">Last Name</th>
                                    <th className="py-2 px-4 border-b">Phone</th>
                                    <th className="py-2 px-4 border-b">Email</th>
                                    <th className="py-2 px-4 border-b">Status</th>
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
                                        <td className="py-2 px-4 border-b">{customer.is_active ? 'Active' : 'Inactive'}</td>
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
