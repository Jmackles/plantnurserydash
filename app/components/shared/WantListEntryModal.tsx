import React, { useState, useEffect } from 'react';
import { Customer, WantList, Plant } from '../../lib/types';
import { fetchCustomers, addCustomer } from '../../lib/api';
import CustomerInteractionModal from './CustomerInteractionModal';  // Add this import

interface WantListEntryModalProps {
    customer?: Customer | null; // Optional - if provided, skip customer selection
    onClose: () => void;
    onSave: (customer: Customer, wantList: WantList) => Promise<void>;
}

const WantListEntryModal: React.FC<WantListEntryModalProps> = ({
    customer: initialCustomer,
    onClose,
    onSave
}) => {
    const [step, setStep] = useState<'customer' | 'wantlist'>(initialCustomer ? 'wantlist' : 'customer');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(initialCustomer || null);
    const [isNewCustomer, setIsNewCustomer] = useState(false);
    const [showCustomerModal, setShowCustomerModal] = useState(false);
    
    const [wantListData, setWantListData] = useState<WantList>({
        id: 0,
        customer_id: initialCustomer?.id || 0,
        initial: '',
        notes: '',
        status: 'pending',
        plants: [],
        general_notes: '',
        spoken_to: '',
        created_at_text: new Date().toISOString(),
        closed_by: ''
    });

    useEffect(() => {
        if (!initialCustomer) {
            fetchCustomers().then(setCustomers).catch(console.error);
        }
    }, [initialCustomer]);

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

    const handleAddPlant = () => {
        setWantListData(prev => ({
            ...prev,
            plants: [
                ...prev.plants,
                {
                    id: Date.now(),
                    name: '',
                    size: '',
                    quantity: 1,
                    status: 'pending',
                    plant_catalog_id: 0,
                    requested_at: new Date().toISOString(),
                    fulfilled_at: ''
                }
            ]
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedCustomer) {
            setError('No customer selected');
            return;
        }

        if (!wantListData.initial) {
            setError('Initial is required');
            return;
        }

        if (!wantListData.plants.length) {
            setError('At least one plant is required');
            return;
        }

        // Validate plants
        const invalidPlants = wantListData.plants.filter(p => !p.name || p.quantity < 1);
        if (invalidPlants.length > 0) {
            setError('All plants must have a name and quantity');
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const wantListWithCustomer = {
                ...wantListData,
                customer_id: selectedCustomer.id,
                plants: wantListData.plants.map(plant => ({
                    ...plant,
                    quantity: parseInt(plant.quantity.toString()),
                    status: 'pending'
                }))
            };

            await onSave(selectedCustomer, wantListWithCustomer);
        } catch (error) {
            console.error('Error saving want list:', error);
            setError(error.message || 'Failed to save want list');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content max-w-4xl">
                {step === 'customer' && !initialCustomer ? (
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
                        <h2 className="text-xl font-bold mb-4">Create Want List Entry</h2>
                        {error && <div className="error-message mb-4">{error}</div>}
                        
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700">Initial</label>
                            <input
                                type="text"
                                value={wantListData.initial}
                                onChange={(e) => setWantListData(prev => ({ ...prev, initial: e.target.value }))}
                                className="input-field"
                                required
                            />
                        </div>

                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700">Notes</label>
                            <textarea
                                value={wantListData.notes}
                                onChange={(e) => setWantListData(prev => ({ ...prev, notes: e.target.value }))}
                                className="input-field"
                            />
                        </div>

                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700">Plants</label>
                            {wantListData.plants.map((plant, index) => (
                                <div key={plant.id} className="flex gap-2 mb-2">
                                    <input
                                        type="text"
                                        placeholder="Plant name"
                                        value={plant.name}
                                        onChange={(e) => {
                                            const newPlants = [...wantListData.plants];
                                            newPlants[index] = { ...plant, name: e.target.value };
                                            setWantListData(prev => ({ ...prev, plants: newPlants }));
                                        }}
                                        className="input-field flex-1"
                                    />
                                    <input
                                        type="number"
                                        value={plant.quantity}
                                        onChange={(e) => {
                                            const newPlants = [...wantListData.plants];
                                            newPlants[index] = { ...plant, quantity: parseInt(e.target.value) };
                                            setWantListData(prev => ({ ...prev, plants: newPlants }));
                                        }}
                                        className="input-field w-24"
                                        min="1"
                                    />
                                </div>
                            ))}
                            <button
                                type="button"
                                onClick={handleAddPlant}
                                className="btn-secondary mt-2"
                            >
                                Add Plant
                            </button>
                        </div>

                        <div className="flex justify-end gap-2">
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
                                {isLoading ? 'Saving...' : 'Save'}
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
