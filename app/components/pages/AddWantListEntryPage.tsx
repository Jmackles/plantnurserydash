import React, { useState } from 'react';
import { Customer, WantList } from '../../lib/types';
import CustomerSelectionModal from '../shared/CustomerSelectionModal';
import WantListEntryModal from '../shared/WantListEntryModal';

const AddWantListEntryPage: React.FC = () => {
    const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

    const handleCustomerSelect = (customer: Customer) => {
        setSelectedCustomer(customer);
    };

    const handleWantListSave = (wantListEntry: WantList) => {
        console.log('Want list entry saved:', wantListEntry);
        setSelectedCustomer(null);
    };

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">Add Want List Entry</h1>
            {!selectedCustomer ? (
                <CustomerSelectionModal
                    onClose={() => setSelectedCustomer(null)}
                    onSelect={handleCustomerSelect}
                />
            ) : (
                <WantListEntryModal
                    customer={selectedCustomer}
                    onClose={() => setSelectedCustomer(null)}
                    onSave={handleWantListSave}
                />
            )}
        </div>
    );
};

export default AddWantListEntryPage;
