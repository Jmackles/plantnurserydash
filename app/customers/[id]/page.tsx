'use client'
import React, { useState, useEffect, useMemo } from 'react';
import { useParams } from 'next/navigation';
import { Customer, WantList } from '@/app/lib/types';
import { useDocumentation } from '@/app/context/DocumentationContext';
import { useCustomerContext } from '@/app/context/CustomerContext';
import DocumentationWidget from '@/app/components/shared/DocumentationWidget';
import WantListEntryModal from '@/app/components/shared/WantListEntryModal';
import { Tab } from '@headlessui/react';

const CustomerDetails = () => {
    const { id } = useParams();
    const { notes, loadNotes, addNote, dismissNote } = useDocumentation();
    const { updateExistingCustomer } = useCustomerContext();
    const [customer, setCustomer] = useState<Customer | null>(null);
    const [wantLists, setWantLists] = useState<WantList[]>([]);
    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState<Customer | null>(null);
    const [showWantListModal, setShowWantListModal] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            if (!id) return;
            try {
                const [customerRes, wantListRes] = await Promise.all([
                    fetch(`/api/customers/${id}`),
                    fetch(`/api/want-list?customer_id=${id}`)
                ]);
                
                const customerData = await customerRes.json();
                const wantListData = await wantListRes.json();
                
                setCustomer(customerData);
                setEditData(customerData);
                setWantLists(wantListData);
                await loadNotes('customer', Number(id));
            } catch (error) {
                console.error('Error:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id, loadNotes]);

    const handleAddDoc = async (type: 'flag' | 'memo' | 'comment' | 'note') => {
        const text = await prompt(`Enter ${type} text:`);
        if (text && customer) {
            try {
                await addNote({
                    notable_type: 'customer',
                    notable_id: customer.id,
                    note_type: type,
                    note_text: text
                });
                await loadNotes('customer', customer.id);
            } catch (error) {
                console.error('Failed to add note:', error);
                alert(`Failed to save note: ${error.message}`);
            }
        }
    };

    const handleEditChange = (field: keyof Customer, value: string | boolean) => {
        setEditData((prev) => (prev ? { ...prev, [field]: value } : null));
    };

    const saveChanges = async () => {
        if (!editData) return;
        try {
            const updatedCustomer = await updateExistingCustomer(editData);
            setEditData(updatedCustomer);
            setIsEditing(false);
        } catch (error) {
            console.error('Error updating customer:', error);
        }
    };

    // Group notes by type for better organization
    const groupedNotes = useMemo(() => {
        const groups = {
            flags: notes.filter(n => n.note_type === 'flag' && !n.dismissed_at),
            alerts: notes.filter(n => n.note_type === 'alert' && !n.dismissed_at),
            memos: notes.filter(n => n.note_type === 'memo'),
            notes: notes.filter(n => n.note_type === 'note')
        };
        return groups;
    }, [notes]);

    if (loading) {
        return <div>Loading...</div>;
    }

    if (!customer) {
        return <div>Customer not found</div>;
    }

    return (
        <div className="container mx-auto p-4">
            {/* Customer Header with Quick Actions */}
            <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
                <div className="flex justify-between items-start">
                    <div>
                        <h1 className="text-2xl font-bold">{customer?.first_name} {customer?.last_name}</h1>
                        <div className="flex gap-4 mt-2 text-gray-600">
                            <span>{customer?.phone}</span>
                            <span>{customer?.email}</span>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={() => handleAddDoc('flag')}
                            className="btn-warning flex items-center gap-1"
                        >
                            🚩 Add Flag
                        </button>
                        <button
                            onClick={() => setIsEditing(true)}
                            className="btn-primary"
                        >
                            Edit Details
                        </button>
                    </div>
                </div>
                
                {/* Active Flags/Alerts Banner */}
                {(groupedNotes.flags.length > 0 || groupedNotes.alerts.length > 0) && (
                    <div className="mt-4 border-t pt-4">
                        {groupedNotes.flags.map(flag => (
                            <div key={flag.id} className="flex items-center gap-2 text-yellow-700 bg-yellow-50 p-2 rounded mb-2">
                                <span>🚩</span>
                                <span>{flag.note_text}</span>
                                <button 
                                    onClick={() => dismissNote(flag.id)}
                                    className="ml-auto text-sm text-yellow-600 hover:text-yellow-800"
                                >
                                    Resolve
                                </button>
                            </div>
                        ))}
                        {groupedNotes.alerts.map(alert => (
                            <div key={alert.id} className="flex items-center gap-2 text-red-700 bg-red-50 p-2 rounded mb-2">
                                <span>⚠️</span>
                                <span>{alert.note_text}</span>
                                <button 
                                    onClick={() => dismissNote(alert.id)}
                                    className="ml-auto text-sm text-red-600 hover:text-red-800"
                                >
                                    Acknowledge
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Main Content Tabs */}
            <Tab.Group>
                <Tab.List className="flex space-x-1 rounded-xl bg-sage-100 p-1 mb-4">
                    <Tab className={({ selected }) =>
                        `w-full rounded-lg py-2.5 text-sm font-medium leading-5
                        ${selected 
                            ? 'bg-white shadow text-sage-700' 
                            : 'text-sage-600 hover:bg-white/[0.12] hover:text-sage-800'}`
                    }>
                        Details
                    </Tab>
                    <Tab className={({ selected }) =>
                        `w-full rounded-lg py-2.5 text-sm font-medium leading-5
                        ${selected 
                            ? 'bg-white shadow text-sage-700' 
                            : 'text-sage-600 hover:bg-white/[0.12] hover:text-sage-800'}`
                    }>
                        Want Lists
                    </Tab>
                    <Tab className={({ selected }) =>
                        `w-full rounded-lg py-2.5 text-sm font-medium leading-5
                        ${selected 
                            ? 'bg-white shadow text-sage-700' 
                            : 'text-sage-600 hover:bg-white/[0.12] hover:text-sage-800'}`
                    }>
                        History & Notes
                    </Tab>
                </Tab.List>
                
                <Tab.Panels>
                    <Tab.Panel>
                        {/* Customer Details Panel */}
                        <div className="bg-white rounded-lg shadow p-4">
                            {isEditing ? (
                                <>
                                    <div className="mb-4">
                                        <label className="form-label">First Name:</label>
                                        <input
                                            type="text"
                                            value={editData?.first_name || ''}
                                            onChange={(e) => handleEditChange('first_name', e.target.value)}
                                            className="input-field"
                                        />
                                    </div>
                                    <div className="mb-4">
                                        <label className="form-label">Last Name:</label>
                                        <input
                                            type="text"
                                            value={editData?.last_name || ''}
                                            onChange={(e) => handleEditChange('last_name', e.target.value)}
                                            className="input-field"
                                        />
                                    </div>
                                    <div className="mb-4">
                                        <label className="form-label">Phone:</label>
                                        <input
                                            type="text"
                                            value={editData?.phone || ''}
                                            onChange={(e) => handleEditChange('phone', e.target.value)}
                                            className="input-field"
                                        />
                                    </div>
                                    <div className="mb-4">
                                        <label className="form-label">Email:</label>
                                        <input
                                            type="text"
                                            value={editData?.email || ''}
                                            onChange={(e) => handleEditChange('email', e.target.value)}
                                            className="input-field"
                                        />
                                    </div>
                                    <div className="mb-4">
                                        <label className="form-label">Notes:</label>
                                        <textarea
                                            value={editData?.notes || ''}
                                            onChange={(e) => handleEditChange('notes', e.target.value)}
                                            className="input-field"
                                        ></textarea>
                                    </div>
                                    <div className="flex justify-end space-x-2">
                                        <button className="btn-primary" onClick={saveChanges}>
                                            Save
                                        </button>
                                        <button className="btn-secondary" onClick={() => setIsEditing(false)}>
                                            Cancel
                                        </button>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <p><strong>First Name:</strong> {customer.first_name}</p>
                                    <p><strong>Last Name:</strong> {customer.last_name}</p>
                                    <p><strong>Phone:</strong> {customer.phone}</p>
                                    <p><strong>Email:</strong> {customer.email}</p>
                                    <p><strong>Notes:</strong> {customer.notes}</p>
                                    <button className="btn-primary mt-4" onClick={() => setIsEditing(true)}>
                                        Edit
                                    </button>
                                </>
                            )}
                        </div>
                    </Tab.Panel>

                    <Tab.Panel>
                        {/* Want Lists Panel */}
                        <div className="bg-white rounded-lg shadow p-4">
                            <div className="flex justify-between mb-4">
                                <h2 className="text-xl font-bold">Want Lists</h2>
                                <button 
                                    onClick={() => setShowWantListModal(true)}
                                    className="btn-primary"
                                >
                                    New Want List
                                </button>
                            </div>
                            {/* ...existing want lists... */}
                        </div>
                    </Tab.Panel>

                    <Tab.Panel>
                        {/* Notes & History Panel */}
                        <div className="bg-white rounded-lg shadow p-4">
                            <div className="flex gap-2 mb-4">
                                {(['note', 'memo', 'flag', 'alert'] as const).map(type => (
                                    <button
                                        key={type}
                                        onClick={() => handleAddDoc(type)}
                                        className={`btn-secondary flex items-center gap-1 ${
                                            type === 'flag' ? 'text-yellow-700' :
                                            type === 'alert' ? 'text-red-700' :
                                            'text-sage-700'
                                        }`}
                                    >
                                        {type === 'flag' && '🚩'}
                                        {type === 'alert' && '⚠️'}
                                        {type === 'memo' && '📌'}
                                        {type === 'note' && '📝'}
                                        Add {type.charAt(0).toUpperCase() + type.slice(1)}
                                    </button>
                                ))}
                            </div>
                            
                            <div className="space-y-4">
                                {notes
                                    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                                    .map(note => (
                                        <div 
                                            key={note.id}
                                            className={`p-3 rounded-lg ${
                                                note.note_type === 'flag' ? 'bg-yellow-50' :
                                                note.note_type === 'alert' ? 'bg-red-50' :
                                                note.note_type === 'memo' ? 'bg-blue-50' :
                                                'bg-gray-50'
                                            }`}
                                        >
                                            <div className="flex items-center gap-2 mb-2">
                                                <span>{
                                                    note.note_type === 'flag' ? '🚩' :
                                                    note.note_type === 'alert' ? '⚠️' :
                                                    note.note_type === 'memo' ? '📌' : '📝'
                                                }</span>
                                                <span className="text-sm text-gray-500">
                                                    {new Date(note.created_at).toLocaleString()}
                                                </span>
                                                {!note.dismissed_at && (
                                                    <button
                                                        onClick={() => dismissNote(note.id)}
                                                        className="ml-auto text-sm text-gray-500 hover:text-gray-700"
                                                    >
                                                        Dismiss
                                                    </button>
                                                )}
                                            </div>
                                            <p className="text-gray-700">{note.note_text}</p>
                                        </div>
                                    ))
                                }
                            </div>
                        </div>
                    </Tab.Panel>
                </Tab.Panels>
            </Tab.Group>

            {/* ...existing modals... */}
        </div>
    );
};

export default CustomerDetails;
