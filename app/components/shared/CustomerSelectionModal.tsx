import React, { useState, useEffect } from 'react';
import { Customer } from '../../lib/types';
import { fetchCustomers } from '../../lib/api';
import CustomerCreationModal from './CustomerCreationModal';

interface CustomerSelectionModalProps {
    onClose: () => void;
    onSelect: (customer: Customer) => void;
}

const CustomerSelectionModal: React.FC<CustomerSelectionModalProps> = ({ onClose, onSelect }) => {
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [showCustomerCreation, setShowCustomerCreation] = useState(false);

    useEffect(() => {
        const loadCustomers = async () => {
            try {
                const fetchedCustomers = await fetchCustomers();
                setCustomers(fetchedCustomers);
            } catch (error) {
                console.error('Error fetching customers:', error);
            }
        };

        loadCustomers();
    }, []);

    const handleCustomerCreation = (newCustomer: Customer) => {
        setCustomers(prev => [...prev, newCustomer]);
        setShowCustomerCreation(false);
        onSelect(newCustomer);
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <h2 className="text-xl font-bold mb-4">Select Customer</h2>
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700">Existing Customers</label>
                    <select
                        className="input-field"
                        onChange={(e) => {
                            const selectedCustomer = customers.find(c => c.id === parseInt(e.target.value));
                            if (selectedCustomer) {
                                onSelect(selectedCustomer);
                            }
                        }}
                    >
                        <option value="">Select a customer</option>
                        {customers.map(customer => (
                            <option key={customer.id} value={customer.id}>
                                {customer.first_name} {customer.last_name}
                            </option>
                        ))}
                    </select>
                </div>
                <div className="flex justify-end">
                    <button onClick={() => setShowCustomerCreation(true)} className="btn-secondary mr-2">Add New Customer</button>
                    <button onClick={onClose} className="btn-secondary">Cancel</button>
                </div>
                {showCustomerCreation && (
                    <CustomerCreationModal
                        onClose={() => setShowCustomerCreation(false)}
                        onSave={handleCustomerCreation}
                    />
                )}
            </div>
        </div>
    );
};

export default CustomerSelectionModal;
