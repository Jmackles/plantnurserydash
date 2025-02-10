import { Customer, WantList } from './types';

export const addCustomer = async (customer: Customer): Promise<{ customer: Customer, isExisting?: boolean }> => {
    const response = await fetch('/api/customers', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(customer),
    });

    const data = await response.json();

    if (response.status === 409) {
        return { 
            customer: data.existingCustomer, 
            isExisting: true 
        };
    }

    if (!response.ok) {
        const error = new Error(data.error || 'Failed to add customer') as any;
        error.status = response.status;
        error.data = data;
        throw error;
    }

    return { customer: data };
};

export const addWantListEntry = async (wantListEntry: any): Promise<WantList> => {
    if (!wantListEntry.customer_id) {
        throw new Error('Missing customer ID');
    }

    console.log('Sending want list entry:', wantListEntry);
    
    const response = await fetch('/api/want-list', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(wantListEntry),
    });

    const data = await response.json();

    if (!response.ok) {
        const error = new Error(data.error || 'Failed to add want list entry') as any;
        error.data = data;
        throw error;
    }

    return data;
};

// ...existing code...
