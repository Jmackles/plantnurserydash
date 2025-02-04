import { WantList } from './types';

export async function fetchWantList(customerId?: number) {
    const url = customerId ? `/api/want-list?customerId=${customerId}` : '/api/want-list';
    const response = await fetch(url);
    if (!response.ok) throw new Error('Failed to fetch want list entries');
    return response.json();
}

export async function updateWantListEntry(id: number, data: Partial<WantList>) {
    const response = await fetch('/api/want-list', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...data })
    });
    if (!response.ok) throw new Error('Failed to update want list entry');
    return response.json();
}

export async function closeWantListEntry(id: number, initial: string, notes: string) {
    return updateWantListEntry(id, {
        is_closed: true,
        closed_by: initial,
        notes: notes
    });
}

export async function createWantListEntry(data: Omit<WantList, 'id'>) {
    const response = await fetch('/api/want-list', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Failed to create want list entry');
    return response.json();
}
