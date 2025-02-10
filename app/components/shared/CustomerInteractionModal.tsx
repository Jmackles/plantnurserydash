import React, { useState, useEffect } from 'react';
import { Customer } from '../../lib/types';
import { addCustomer } from '../../lib/api';

interface CustomerInteractionModalProps {
    onClose: () => void;
    onSave: (customer: Customer) => void;
}

const CustomerInteractionModal: React.FC<CustomerInteractionModalProps> = ({
    onClose,
    onSave
}) => {
    const [editedCustomer, setEditedCustomer] = useState<Customer>({
        id: 0, // Set default ID for new customers
        first_name: '',
        last_name: '',
        phone: '',
        email: '',
        notes: ''
    });
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setEditedCustomer(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = async (): Promise<void> => {
        if (!editedCustomer) {
            console.error('No customer data');
            return;
        }

        setIsLoading(true);

        try {
            const newCustomer = await addCustomer(editedCustomer);
            onSave(newCustomer);
        } catch (error) {
            console.error('Error in handleSave:', error);
            alert('Failed to save changes');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <h2 className="text-xl font-bold mb-4">Add New Customer</h2>
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700">First Name</label>
                    <input
                        type="text"
                        name="first_name"
                        value={editedCustomer.first_name}
                        onChange={handleChange}
                        className="input-field"
                        disabled={isLoading}
                    />
                </div>
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700">Last Name</label>
                    <input
                        type="text"
                        name="last_name"
                        value={editedCustomer.last_name}
                        onChange={handleChange}
                        className="input-field"
                        disabled={isLoading}
                    />
                </div>
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700">Phone</label>
                    <input
                        type="text"
                        name="phone"
                        value={editedCustomer.phone}
                        onChange={handleChange}
                        className="input-field"
                        disabled={isLoading}
                    />
                </div>
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700">Email</label>
                    <input
                        type="text"
                        name="email"
                        value={editedCustomer.email}
                        onChange={handleChange}
                        className="input-field"
                        disabled={isLoading}
                    />
                </div>
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700">Notes</label>
                    <textarea
                        name="notes"
                        value={editedCustomer.notes}
                        onChange={handleChange}
                        className="input-field"
                        disabled={isLoading}
                    ></textarea>
                </div>
                <div className="flex justify-end">
                    <button onClick={onClose} className="btn-secondary mr-2" disabled={isLoading}>Cancel</button>
                    <button onClick={handleSave} className="btn-primary" disabled={isLoading}>
                        {isLoading ? 'Saving...' : 'Save'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CustomerInteractionModal;