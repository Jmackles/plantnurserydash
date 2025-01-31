'use client'
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Customer } from '@/app/lib/types';
import { updateCustomer } from '@/app/lib/api';
import { useFetch } from '@/app/hooks/useFetch';

const CustomerDetails = () => {
    const { id } = useParams();
    const { data: customer, error, loading } = useFetch<Customer>(`/api/customers/${id}`);
    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState<Customer | null>(null);

    useEffect(() => {
        if (customer) {
            setEditData(customer);
        }
    }, [customer]);

    const handleEditChange = (field: keyof Customer, value: string | boolean) => {
        setEditData((prev) => (prev ? { ...prev, [field]: value } : null));
    };

    const saveChanges = async () => {
        if (!editData) return;
        try {
            const updatedCustomer = await updateCustomer(editData);
            setEditData(updatedCustomer);
            setIsEditing(false);
        } catch (error) {
            console.error('Error updating customer:', error);
        }
    };

    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>Error loading customer details</div>;
    }

    if (!customer) {
        return <div>Customer not found</div>;
    }

    return (
        <main className="p-6 max-w-7xl mx-auto">
            <h1 className="text-3xl font-bold text-sage-700 mb-8">Customer Details</h1>
            <div className="bg-white shadow-md rounded-lg p-4">
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
                            <label className="form-label">Status:</label>
                            <select
                                value={editData?.is_active ? 'Active' : 'Inactive'}
                                onChange={(e) => handleEditChange('is_active', e.target.value === 'Active')}
                                className="input-field"
                            >
                                <option value="Active">Active</option>
                                <option value="Inactive">Inactive</option>
                            </select>
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
                        <p><strong>Status:</strong> {customer.is_active ? 'Active' : 'Inactive'}</p>
                        <p><strong>Notes:</strong> {customer.notes}</p>
                        <button className="btn-primary mt-4" onClick={() => setIsEditing(true)}>
                            Edit
                        </button>
                    </>
                )}
            </div>
        </main>
    );
};

export default CustomerDetails;
