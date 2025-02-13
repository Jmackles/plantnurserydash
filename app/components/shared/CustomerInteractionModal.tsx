import React, { useState } from 'react';
import { Customer } from '../../lib/types';

interface CustomerInteractionModalProps {
    customer: Customer | null;
    onClose: () => void;
    onSave: (customer: Customer) => Promise<void>;
}

const CustomerInteractionModal: React.FC<CustomerInteractionModalProps> = ({
    customer,
    onClose,
    onSave
}) => {
    const [editedCustomer, setEditedCustomer] = useState<Customer>({
        id: customer?.id || 0,
        first_name: customer?.first_name || '',
        last_name: customer?.last_name || '',
        phone: customer?.phone || '',
        email: customer?.email || ''
    });
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<boolean>(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setEditedCustomer(prev => ({ ...prev, [name]: value }));
        setError(null);
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        
        if (isLoading) return;
        
        setIsLoading(true);
        setError(null);
        setSuccess(false);

        try {
            await onSave(editedCustomer);
            setSuccess(true);
            // Close modal after a brief delay to show success message
            setTimeout(() => {
                onClose();
            }, 1000);
        } catch (error: any) {
            console.error('Error saving customer:', error);
            setError(error?.message || 'Failed to save customer');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <form onSubmit={handleSubmit}>
                    <h2 className="text-xl font-bold mb-4">
                        {customer ? 'Edit Customer' : 'Add New Customer'}
                    </h2>
                    
                    {error && (
                        <div className="mb-4 p-2 bg-red-100 border border-red-400 text-red-700 rounded">
                            {error}
                        </div>
                    )}
                    
                    {success && (
                        <div className="mb-4 p-2 bg-green-100 border border-green-400 text-green-700 rounded">
                            Customer {customer ? 'updated' : 'added'} successfully!
                        </div>
                    )}
                    
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
                    
                    
                    <div className="flex justify-end">
                        <button 
                            type="button" 
                            onClick={onClose} 
                            className="btn-secondary mr-2" 
                            disabled={isLoading}
                        >
                            Cancel
                        </button>
                        <button 
                            type="submit" 
                            className="btn-primary" 
                            disabled={isLoading || success}
                        >
                            {isLoading ? 'Saving...' : success ? 'Saved!' : 'Save'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CustomerInteractionModal;