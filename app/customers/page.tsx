'use client'
import React, { useState, useEffect } from 'react';
import SearchFilterPanel from '../components/shared/SearchFilterPanel';
import CustomerInteractionModal from '../components/shared/CustomerInteractionModal';
import { fetchCustomers } from '../lib/api';
import { Customer } from '../lib/types';

const Dashboard = () => {
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [filter, setFilter] = useState('');
    const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

    useEffect(() => {
        fetchCustomers()
            .then(setCustomers)
            .catch((error) => {
                console.error('Error:', error);
                setCustomers([]);
            });
    }, []);

    const filteredCustomers = customers.filter((customer) => {
        const matchesSearchQuery = 
            customer.first_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            customer.last_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            customer.phone.includes(searchQuery) ||
            customer.email.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesFilter = filter === '' || (filter === 'active' && customer.is_active) || (filter === 'inactive' && !customer.is_active);

        return matchesSearchQuery && matchesFilter;
    });

    const handleSave = async (updatedCustomer: Customer) => {
        try {
            console.log('Sending updated customer to server:', updatedCustomer);
            const res = await fetch(`/api/customers/${updatedCustomer.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(updatedCustomer),
            });
            if (res.ok) {
                const updatedCustomerFromServer = await res.json();
                console.log('Customer saved successfully:', updatedCustomerFromServer);
                setCustomers(customers.map(customer => customer.id === updatedCustomer.id ? updatedCustomerFromServer : customer));
                setSelectedCustomer(null);
            } else {
                const errorText = await res.text();
                console.error('Failed to save customer:', res.status, errorText);
            }
        } catch (error) {
            console.error('Error saving customer:', error);
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
                    onSave={handleSave}
                />
            )}
        </main>
    );
};

export default Dashboard;