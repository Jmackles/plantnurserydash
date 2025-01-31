'use client'
import React from 'react';
import Card from './Cards';

type CustomerCardProps = {
  customer: {
    first_name: string;
    last_name: string;
    phone?: string;
    email?: string;
  };
  onClick: () => void;
};

const CustomerCard: React.FC<CustomerCardProps> = ({ customer, onClick }) => {
    return (
        <Card>
            <div onClick={onClick} className="cursor-pointer">
                <h2 className="text-lg font-semibold">
                    {customer.first_name} {customer.last_name}
                </h2>
                <p className="text-sm">Phone: {customer.phone}</p>
                <p className="text-sm">Email: {customer.email}</p>
            </div>
        </Card>
    );
};

export default CustomerCard;