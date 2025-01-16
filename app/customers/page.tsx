'use client'
import React, { useState, useEffect } from 'react';
import SearchFilterPanel from '../components/shared/SearchFilterPanel';
import CustomerInteractionModal from '../components/shared/CustomerInteractionModal';
import { fetchCustomers, addCustomer, updateCustomer } from '../lib/api';
import { Customer } from '../lib/types';

const Dashboard = () => {
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [filter, setFilter] = useState('');
    const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
    const [isAdding, setIsAdding] = useState(false);

    useEffect(() => {
        fetchCustomers()
            .then(setCustomers)
            .catch((error) => {
                console.error('Error:', error);
                setCustomers([]);
            });
    }, []);

    const filteredCustomers = customers.filter((customer) => {
        try {
            if (!customer || !customer.first_name || !customer.last_name || !customer.phone || !customer.email) {
                console.warn('Invalid customer data:', customer);
                return false;
            }

            const matchesSearchQuery = 
                customer.first_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                customer.last_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                customer.phone.includes(searchQuery) ||
                customer.email.toLowerCase().includes(searchQuery.toLowerCase());

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
            console.error('Error adding customer:', error);
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
                                </tr>
                            </thead>
                            <tbody>
                                {filteredCustomers.map((customer) => (
                                    <tr key={customer.id} onClick={() => setSelectedCustomer(customer)} className="cursor-pointer">
                                        <td className="py-2 px-4 border-b">{customer.first_name}</td>
                                        <td className="py-2 px-4 border-b">{customer.last_name}</td>
                                        <td className="py-2 px-4 border-b">{customer.phone}</td>
                                        <td className="py-2 px-4 border-b">{customer.email}</td>
                                        <td className="py-2 px-4 border-b">{customer.is_active ? 'Active' : 'Inactive'}</td>
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
