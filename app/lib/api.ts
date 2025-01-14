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