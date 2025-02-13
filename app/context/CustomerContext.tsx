'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Customer } from '../lib/types';
import { fetchCustomers, addCustomer, updateCustomer } from '../lib/api';

interface CustomerContextProps {
    customers: Customer[];
    refreshCustomers: () => Promise<void>;
    addNewCustomer: (customer: Customer) => Promise<void>;
    updateExistingCustomer: (customer: Customer) => Promise<void>;
}

const CustomerContext = createContext<CustomerContextProps | undefined>(undefined);

export const CustomerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [customers, setCustomers] = useState<Customer[]>([]);

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

    const addNewCustomer = async (customer: Customer) => {
        try {
            await addCustomer(customer);
            await refreshCustomers();
        } catch (error) {
            console.error('Error adding customer:', error);
            throw error;
        }
    };

    const updateExistingCustomer = async (customer: Customer) => {
        try {
            await updateCustomer(customer);
            await refreshCustomers();
        } catch (error) {
            console.error('Error updating customer:', error);
            throw error;
        }
    };

    useEffect(() => {
        refreshCustomers();
    }, []);

    return (
        <CustomerContext.Provider value={{ customers, refreshCustomers, addNewCustomer, updateExistingCustomer }}>
            {children}
        </CustomerContext.Provider>
    );
};

export const useCustomerContext = () => {
    const context = useContext(CustomerContext);
    if (!context) {
        throw new Error('useCustomerContext must be used within a CustomerProvider');
    }
    return context;
};
