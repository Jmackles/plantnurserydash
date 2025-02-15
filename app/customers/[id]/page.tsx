'use client'
import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Customer, WantList } from '@/app/lib/types';
import { useDocumentation } from '@/app/context/DocumentationContext';
import { useCustomerContext } from '@/app/context/CustomerContext';
import DocumentationWidget from '@/app/components/shared/DocumentationWidget';
import WantListEntryModal from '@/app/components/shared/WantListEntryModal';

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

    if (loading) {
        return <div>Loading...</div>;
    }

    if (!customer) {
        return <div>Customer not found</div>;
    }

    return (
        <div className="container mx-auto p-4">
            {/* Customer info section */}
            <div className="mb-8 border-b pb-4">
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Want Lists section */}
                <div>
                    {/* ... existing want lists code ... */}
                </div>

                {/* Documentation Widget section */}
                <div className="bg-white shadow-md rounded-lg p-4">
                    <h2 className="text-xl font-bold mb-4">Documentation</h2>
                    <DocumentationWidget
                        docs={notes}
                        referenceType="customer"
                        referenceId={Number(id)}
                        onAddDoc={handleAddDoc}
                        onDismiss={dismissNote}
                        className="mt-4"
                    />
                </div>
            </div>

            {/* ... existing modal code ... */}
        </div>
    );
};

export default CustomerDetails;
