import React, { useState, useEffect } from 'react';
import { Customer, WantListEntry } from '../../lib/types';
import { fetchWantListEntries } from '../../lib/api';

interface CustomerInteractionModalProps {
    customer: Customer | null;
    onClose: () => void;
    onSave: (updatedCustomer: Customer) => void;
}

const CustomerInteractionModal: React.FC<CustomerInteractionModalProps> = ({ customer, onClose, onSave }) => {
    const [wantListEntries, setWantListEntries] = useState<WantListEntry[]>([]);
    const [editCustomer, setEditCustomer] = useState<Customer | null>(customer);

    useEffect(() => {
        if (customer) {
            fetchWantListEntries()
                .then(entries => setWantListEntries(entries.filter(entry => entry.customer_id === customer.id)))
                .catch(error => console.error('Error fetching want list entries:', error));
        }
    }, [customer]);

    useEffect(() => {
        setEditCustomer(customer);
    }, [customer]);

    if (!editCustomer) return null;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setEditCustomer(prev => prev ? { ...prev, [name]: value } : null);
    };

    const handleSave = () => {
        if (editCustomer) {
            console.log('Saving customer:', editCustomer);
            onSave(editCustomer);
        } else {
            console.log('No customer to save');
        }
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <h2 className="text-xl font-bold mb-4">Edit Customer</h2>
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700">Customer ID</label>
                    <input
                        type="text"
                        name="id"
                        value={editCustomer.id}
                        readOnly
                        className="input-field"
                    />
                </div>
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700">First Name</label>
                    <input
                        type="text"
                        name="first_name"
                        value={editCustomer.first_name}
                        onChange={handleChange}
                        className="input-field"
                    />
                </div>
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700">Last Name</label>
                    <input
                        type="text"
                        name="last_name"
                        value={editCustomer.last_name}
                        onChange={handleChange}
                        className="input-field"
                    />
                </div>
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700">Phone</label>
                    <input
                        type="text"
                        name="phone"
                        value={editCustomer.phone}
                        onChange={handleChange}
                        className="input-field"
                    />
                </div>
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700">Email</label>
                    <input
                        type="text"
                        name="email"
                        value={editCustomer.email}
                        onChange={handleChange}
                        className="input-field"
                    />
                </div>
                <div className="mb-4">
                    <label className="form-label">Notes:</label>
                    <textarea
                        name="notes"
                        className="input-field"
                        onChange={handleChange}
                    ></textarea>
                </div>
                <div className="mb-4">
                    <h3 className="text-lg font-semibold">Want List Items</h3>
                    <ul>
                        {wantListEntries.map(entry => (
                            <li key={entry.id} className="mb-2">
                                <div className="font-medium">{entry.initial}</div>
                                <div className="text-sm">{entry.notes}</div>
                                <div className="text-sm">{entry.is_closed ? 'Closed' : 'Open'}</div>
                            </li>
                        ))}
                    </ul>
                </div>
                <div className="flex justify-end">
                    <button onClick={onClose} className="btn-secondary mr-2">Cancel</button>
                    <button onClick={handleSave} className="btn-primary">Save</button>
                </div>
            </div>
        </div>
    );
};

export default CustomerInteractionModal;