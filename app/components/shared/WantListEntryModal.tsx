'use client';
import React, { useState, useEffect } from 'react';
import { Customer, WantList, Plant } from '../../lib/types';
import { fetchCustomers, addCustomer } from '../../lib/api';
import CustomerInteractionModal from './CustomerInteractionModal';  // Add this import

interface WantListEntryModalProps {
    customer: Customer | null;
    onClose: () => void;
    onSave: (data: { initial: string; notes: string; plants: Plant[] }) => Promise<void>;
}

const WantListEntryModal: React.FC<WantListEntryModalProps> = ({
    customer,
    onClose,
    onSave
}) => {
    const [step, setStep] = useState<'customer' | 'wantlist'>(customer ? 'wantlist' : 'customer');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(customer || null);
    const [isNewCustomer, setIsNewCustomer] = useState(false);
    const [showCustomerModal, setShowCustomerModal] = useState(false);
    
    const [initial, setInitial] = useState('');
    const [notes, setNotes] = useState('');
    const [plants, setPlants] = useState<Plant[]>([]);
    const [loading, setLoading] = useState(false);
    const [currentPlant, setCurrentPlant] = useState({
        name: '',
        size: '',
        quantity: 1,
        status: 'pending'
    });

    useEffect(() => {
        if (!customer) {
            fetchCustomers().then(setCustomers).catch(console.error);
        }
    }, [customer]);

    const handleCustomerSearch = (query: string) => {
        setSearchQuery(query);
        // Filter customers based on query
        // This will be used to show matching customers in a dropdown
    };

    const handleNewCustomerSubmit = async (customerData: Customer) => {
        setIsLoading(true);
        try {
            const newCustomer = await addCustomer(customerData);
            setSelectedCustomer(newCustomer);
            setStep('wantlist');
        } catch (error) {
            setError(error.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleNewCustomerSave = async (newCustomer: Customer) => {
        try {
            const response = await addCustomer(newCustomer);
            const savedCustomer = response.isExisting ? response.customer : response.customer;
            
            // Refresh customers list and select the new customer
            const updatedCustomers = await fetchCustomers();
            setCustomers(updatedCustomers);
            setSelectedCustomer(savedCustomer);
            setShowCustomerModal(false);
            setStep('wantlist'); // Move to want list step after creating customer
        } catch (error) {
            console.error('Error creating customer:', error);
            setError('Failed to create customer');
        }
    };

    const handleAddPlant = (e: React.FormEvent) => {
        e.preventDefault(); // Prevent form submission
        if (!currentPlant.name || !currentPlant.quantity) {
            alert('Please enter both plant name and quantity');
            return;
        }

        setPlants(prevPlants => [...prevPlants, {
            ...currentPlant,
            id: 0,
            want_list_entry_id: 0,
            plant_catalog_id: 0,
            requested_at: new Date().toISOString(),
            fulfilled_at: '',
            status: 'pending'
        }]);

        // Reset the current plant form
        setCurrentPlant({
            name: '',
            size: '',
            quantity: 1,
            status: 'pending'
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!initial.trim()) {
            alert('Please enter your initials');
            return;
        }

        if (plants.length === 0) {
            alert('Please add at least one plant');
            return;
        }

        setLoading(true);
        try {
            await onSave({
                initial: initial.trim(),
                notes: notes.trim(),
                plants
            });
            onClose();
        } catch (error) {
            console.error('Error saving want list:', error);
            alert('Failed to save want list');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content max-w-4xl">
                {step === 'customer' && !customer ? (
                    <div>
                        <h2 className="text-xl font-bold mb-4">Select or Create Customer</h2>
                        <div className="mb-4">
                            <input
                                type="text"
                                placeholder="Search customers..."
                                value={searchQuery}
                                onChange={(e) => handleCustomerSearch(e.target.value)}
                                className="input-field"
                            />
                        </div>
                        
                        {/* Customer search results */}
                        <div className="mb-4 max-h-60 overflow-y-auto">
                            {customers
                                .filter(c => 
                                    c.first_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                    c.last_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                    c.phone.includes(searchQuery) ||
                                    c.email.toLowerCase().includes(searchQuery.toLowerCase())
                                )
                                .map(customer => (
                                    <div
                                        key={customer.id}
                                        className="p-2 hover:bg-gray-100 cursor-pointer"
                                        onClick={() => {
                                            setSelectedCustomer(customer);
                                            setStep('wantlist');
                                        }}
                                    >
                                        {customer.first_name} {customer.last_name} - {customer.phone}
                                    </div>
                                ))
                            }
                        </div>

                        <button
                            type="button"
                            onClick={() => setShowCustomerModal(true)} // Modified this line
                            className="btn-secondary w-full"
                        >
                            Create New Customer
                        </button>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit}>
                        <h2 className="text-xl font-bold mb-4">
                            New Want List for {customer?.first_name} {customer?.last_name}
                        </h2>
                        {error && <div className="error-message mb-4">{error}</div>}
                        
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700">Initial</label>
                            <input
                                type="text"
                                value={initial}
                                onChange={(e) => setInitial(e.target.value)}
                                className="input-field"
                                required
                            />
                        </div>

                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700">Notes</label>
                            <textarea
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                className="input-field"
                            />
                        </div>

                        <div className="mb-4">
                            <h3 className="text-lg font-medium mb-2">Add Plants</h3>
                            <div className="flex gap-2 mb-2">
                                <input
                                    type="text"
                                    placeholder="Plant name"
                                    value={currentPlant.name}
                                    onChange={(e) => setCurrentPlant({...currentPlant, name: e.target.value})}
                                    className="input-field flex-1"
                                />
                                <input
                                    type="text"
                                    placeholder="Size"
                                    value={currentPlant.size}
                                    onChange={(e) => setCurrentPlant({...currentPlant, size: e.target.value})}
                                    className="input-field w-24"
                                />
                                <input
                                    type="number"
                                    min="1"
                                    value={currentPlant.quantity}
                                    onChange={(e) => setCurrentPlant({
                                        ...currentPlant, 
                                        quantity: parseInt(e.target.value) || 1
                                    })}
                                    className="input-field w-20"
                                />
                                <button
                                    type="button"
                                    onClick={handleAddPlant}
                                    className="btn-secondary"
                                >
                                    Add Plant
                                </button>
                            </div>

                            {/* Display added plants */}
                            <div className="mt-4 space-y-2">
                                {plants.map((plant, index) => (
                                    <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                                        <div>
                                            <span className="font-medium">{plant.name}</span>
                                            {plant.size && <span className="ml-2 text-gray-600">({plant.size})</span>}
                                            <span className="ml-4">Qty: {plant.quantity}</span>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => setPlants(plants.filter((_, i) => i !== index))}
                                            className="text-red-600 hover:text-red-800"
                                        >
                                            Remove
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="flex justify-end gap-2 mt-6">
                            <button
                                type="button"
                                onClick={onClose}
                                className="btn-secondary"
                                disabled={isLoading}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="btn-primary"
                                disabled={isLoading}
                            >
                                {isLoading ? 'Saving...' : 'Save Want List'}
                            </button>
                        </div>
                    </form>
                )}

                {/* Add the CustomerInteractionModal */}
                {showCustomerModal && (
                    <CustomerInteractionModal
                        customer={null}
                        onClose={() => setShowCustomerModal(false)}
                        onSave={handleNewCustomerSave}
                    />
                )}
            </div>
        </div>
    );
};

export default WantListEntryModal;
