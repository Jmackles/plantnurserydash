import { Customer, WantListEntry } from "./types";

export const fetchCustomers = async (): Promise<Customer[]> => {
    const res = await fetch('/api/customers');
    if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Failed to fetch customers');
    }
    return res.json();
};

export const fetchWantListEntries = async (): Promise<WantListEntry[]> => {
    const res = await fetch('/api/want-list');
    if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Failed to fetch want list entries');
    }
    return res.json();
};

export const addCustomer = async (customer: Omit<Customer, 'id'>): Promise<Customer> => {
    const res = await fetch('/api/customers', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(customer),
    });
    if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Failed to add customer');
    }
    return res.json();
};

export const updateCustomer = async (customer: Customer): Promise<Customer> => {
    const response = await fetch(`/api/customers/${customer.id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(customer),
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update customer');
    }

    const updatedCustomer = await response.json();
    return updatedCustomer;
};