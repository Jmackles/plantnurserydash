import { Customer, WantList } from './types';

let isCustomerRequestInProgress = false;

export const fetchCustomers = async (): Promise<Customer[]> => {
    const response = await fetch('/api/customers');
    if (!response.ok) {
        throw new Error('Failed to fetch customers');
    }
    return response.json();
};

export const fetchCustomerById = async (id: number): Promise<Customer> => {
    const response = await fetch(`/api/customers?id=${id}`);
    if (!response.ok) {
        throw new Error('Failed to fetch customer');
    }
    return response.json();
};

export const addCustomer = async (customer: Customer): Promise<Customer> => {
    if (isCustomerRequestInProgress) {
        throw new Error(JSON.stringify({
            error: 'A request is already in progress',
            status: 429
        }));
    }

    isCustomerRequestInProgress = true;

    try {
        const response = await fetch('/api/customers', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(customer)
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(JSON.stringify({
                ...data,
                status: response.status
            }));
        }

        return data;
    } finally {
        isCustomerRequestInProgress = false;
    }
};

export const updateCustomer = async (customer: Customer): Promise<Customer> => {
    const response = await fetch('/api/customers', {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(customer)
    });

    if (!response.ok) {
        throw new Error('Failed to update customer');
    }

    return response.json();
};

export const addWantListEntry = async (wantListEntry: WantList): Promise<WantList> => {
    const response = await fetch('/api/want-list', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(wantListEntry)
    });
    if (!response.ok) {
        throw new Error('Failed to add want list entry');
    }
    return response.json();
};
