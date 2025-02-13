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

export const addCustomer = async (customer: Partial<Customer>) => {
    try {
        const response = await fetch('/api/customers', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(customer),
        });

        const data = await response.json();

        // If we get a 409, it means the customer exists - return it
        if (response.status === 409) {
            return {
                isExisting: true,
                customer: data.existingCustomer
            };
        }

        if (!response.ok) {
            throw new Error(data.error || 'Failed to add customer');
        }

        return {
            isExisting: false,
            customer: data
        };
    } catch (error) {
        console.error('Error in addCustomer:', error);
        throw error;
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

export const addWantListEntry = async (data: Partial<WantList>) => {
    try {
        const response = await fetch('/api/want-list', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                customer_id: data.customer_id,
                initial: data.initial,
                general_notes: data.general_notes,
                status: 'pending',
                plants: data.plants?.map(plant => ({
                    name: plant.name,
                    size: plant.size || '',
                    quantity: parseInt(plant.quantity.toString()),
                    status: 'pending',
                    requested_at: new Date().toISOString()
                }))
            }),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to add want list entry');
        }

        return await response.json();
    } catch (error) {
        console.error('Error in addWantListEntry:', error);
        throw error;
    }
};

export const fetchWantListEntries = async (): Promise<WantList[]> => {
    const response = await fetch('/api/want-list');
    if (!response.ok) {
        throw new Error('Failed to fetch want list entries');
    }
    return response.json();
};
