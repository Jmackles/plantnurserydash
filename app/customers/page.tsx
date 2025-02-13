'use client'
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import CustomerSearchFilterPanel from '../components/shared/CustomerSearchFilterPanel';
import CustomerInteractionModal from '../components/shared/CustomerInteractionModal';
import { Customer, Plant } from '../lib/types';
import { fetchCustomers, addCustomer, updateCustomer } from '../lib/api';

const Dashboard = () => {
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [filter, setFilter] = useState('');
    const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
    const [isAdding, setIsAdding] = useState(false);
    const [isFilterPanelVisible, setIsFilterPanelVisible] = useState(false); // Set to false to hide by default

    const refreshCustomers = async () => {
        try {
            const data = await fetchCustomers();
            const validCustomers = data.filter((customer: Customer) => 
                customer && customer.id && customer.first_name && customer.last_name
            );
            setCustomers(validCustomers);
        } catch (error) {
            console.error('Error refreshing customers:', error);
        }
    };

    useEffect(() => {
        refreshCustomers();
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

    const handleCustomerSave = async (customer: Customer, wantList?: { initial: string, notes: string, plants: Plant[] }) => {
        try {
            if (customer.id) {
                // Update existing customer
                const updatedCustomer = await updateCustomer(customer);
                await refreshCustomers(); // Refresh the full list
                setSelectedCustomer(null);
            } else {
                // Add new customer
                const newCustomer = await addCustomer(customer);
                await refreshCustomers(); // Refresh the full list
                setIsAdding(false);
            }

            if (wantList) {
                // Create want list for the customer
                await fetch('/api/want-list', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        customer_id: customer.id,
                        ...wantList
                    }),
                });
            }
        } catch (error) {
            console.error('Error saving customer:', error);
            throw error; // Re-throw to be handled by the modal
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
                    onSave={handleCustomerSave}
                />
            )}
            {isAdding && (
                <CustomerInteractionModal
                    customer={null}
                    onClose={() => {
                        console.log('Closing Add New Customer modal');
                        setIsAdding(false);
                    }}
                    onSave={handleCustomerSave}
                />
            )}
        </main>
    );
};

export default Dashboard;
