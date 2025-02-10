import React, { useState, useRef } from 'react';
import { Customer } from '../../lib/types';
import { addCustomer } from '../../lib/api';

interface CustomerCreationModalProps {
    onClose: () => void;
    onSave: (customer: Customer) => void;
}

const CustomerCreationModal: React.FC<CustomerCreationModalProps> = ({ onClose, onSave }) => {
    const [customerData, setCustomerData] = useState<Customer>({
        id: 0,
        first_name: '',
        last_name: '',
        phone: '',
        email: '',
        notes: '',
        address: '' // Added address field
    });
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const submitLock = useRef<boolean>(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setCustomerData(prev => ({ ...prev, [name]: value }));
        setError(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (submitLock.current) {
            return;
        }

        if (!customerData.first_name || !customerData.last_name) {
            setError('First name and last name are required.');
            return;
        }

        setIsLoading(true);
        setError(null);
        submitLock.current = true;

        try {
            const newCustomer = await addCustomer(customerData);
            onSave(newCustomer);
        } catch (error: any) {
            console.error('Error creating customer:', error);
            try {
                const errorData = JSON.parse(error.message);
                switch (errorData.status) {
                    case 409:
                        setError(`A customer with this ${errorData.duplicateField} already exists.`);
                        break;
                    case 429:
                        setError('Please wait for the previous request to complete.');
                        break;
                    default:
                        setError('Failed to create customer. Please try again.');
                }
            } catch {
                setError('Failed to create customer. Please try again.');
            }
        } finally {
            setIsLoading(false);
            submitLock.current = false;
        }
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <form onSubmit={handleSubmit}>
                    <h2 className="text-xl font-bold mb-4">Add New Customer</h2>
                    {error && <div className="text-red-500 mb-4">{error}</div>}
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700">First Name</label>
                        <input
                            type="text"
                            name="first_name"
                            value={customerData.first_name}
                            onChange={handleChange}
                            className="input-field"
                            disabled={isLoading}
                            required
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700">Last Name</label>
                        <input
                            type="text"
                            name="last_name"
                            value={customerData.last_name}
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
                            value={customerData.phone}
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
                            value={customerData.email}
                            onChange={handleChange}
                            className="input-field"
                            disabled={isLoading}
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700">Address</label>
                        <input
                            type="text"
                            name="address"
                            value={customerData.address}
                            onChange={handleChange}
                            className="input-field"
                            disabled={isLoading}
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700">Notes</label>
                        <textarea
                            name="notes"
                            value={customerData.notes}
                            onChange={handleChange}
                            className="input-field"
                            disabled={isLoading}
                        ></textarea>
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
                            disabled={isLoading}
                        >
                            {isLoading ? 'Saving...' : 'Save'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CustomerCreationModal;
