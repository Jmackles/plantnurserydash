import { Customer, WantListEntry } from "./types";

const prependAppDirectory = (path: string) => `/app${path}`;

export const fetchCustomers = async (): Promise<Customer[]> => {
    const res = await fetch('/api/customers');
    if (!res.ok) {
        const error = await res.text();
        throw new Error(error || 'Failed to fetch customers');
    }
    return res.json();
};

export const fetchWantListEntries = async (): Promise<WantListEntry[]> => {
    const res = await fetch('/api/want-list-entries');
    if (!res.ok) {
        const error = await res.text();
        throw new Error(error || 'Failed to fetch want list entries');
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
        const error = await res.text();
        throw new Error(error || 'Failed to add customer');
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
        const errorData = await response.text();
        throw new Error(errorData || 'Failed to update customer');
    }

    const updatedCustomer = await response.json();
    return updatedCustomer;
};

export const fetchCustomerById = async (id: number): Promise<Customer> => {
    const res = await fetch(`/api/customers/${id}`);
    if (!res.ok) {
        const error = await res.text();
        throw new Error(error || 'Failed to fetch customer');
    }
    return res.json();
};

export const addWantListEntry = async (entry: Omit<WantListEntry, 'id' | 'customer_first_name' | 'customer_last_name' | 'created_at'>): Promise<WantListEntry> => {
    const res = await fetch('/api/want-list', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(entry),
    });
    if (!res.ok) {
        const error = await res.text();
        throw new Error(error || 'Failed to add want list entry');
    }
    return res.json();
};

// Example usage for fetching images
const fetchImage = async (imagePath: string) => {
    const fullPath = prependAppDirectory(imagePath);
    const res = await fetch(fullPath);
    if (!res.ok) {
        throw new Error(`Failed to fetch image at ${fullPath}`);
    }
    return res.blob();
};