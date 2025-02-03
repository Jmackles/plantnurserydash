import { Customer, WantList } from "./types";

export const fetchCustomers = async (): Promise<Customer[]> => {
    try {
        const res = await fetch('/api/customers');
        if (!res.ok) {
            const error = await res.text();
            throw new Error(error || 'Failed to fetch customers');
        }
        const contentType = res.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
            return res.json();
        } else {
            throw new Error('Invalid response format');
        }
    } catch (error) {
        console.error('Error fetching customers:', error);
        throw error;
    }
};

export const fetchWantListEntries = async () => {
    try {
        const res = await fetch('/api/want-list');
        if (!res.ok) {
            const error = await res.text();
            throw new Error(error || 'Failed to fetch want list entries');
        }
        const contentType = res.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
            const response = await res.json();
            return response.data || [];
        } else {
            throw new Error('Invalid response format');
        }
    } catch (error) {
        console.error('Error fetching want list entries:', error);
        throw error;
    }
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
    const contentType = res.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
        return res.json();
    } else {
        throw new Error('Invalid response format');
    }
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

    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
        return response.json();
    } else {
        throw new Error('Invalid response format');
    }
};

export const fetchCustomerById = async (id: number): Promise<Customer> => {
    const res = await fetch(`/api/customers/${id}`);
    if (!res.ok) {
        const error = await res.text();
        throw new Error(error || 'Failed to fetch customer');
    }
    const contentType = res.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
        return res.json();
    } else {
        throw new Error('Invalid response format');
    }
};

export const addWantListEntry = async (entry: Omit<WantList, 'id'>): Promise<WantList> => {
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
    const contentType = res.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
        return res.json();
    } else {
        throw new Error('Invalid response format');
    }
};