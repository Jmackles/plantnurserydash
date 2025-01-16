import { NextRequest, NextResponse } from 'next/server';
import { open } from 'sqlite';
import sqlite3 from 'sqlite3';

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        const db = await open({
            filename: './database.sqlite',
            driver: sqlite3.Database
        });

        const customerData = await request.json();
        const result = await db.run(
            'UPDATE customers SET first_name = ?, last_name = ?, phone = ?, email = ?, is_active = ?, notes = ? WHERE id = ?',
            [customerData.first_name, customerData.last_name, customerData.phone, customerData.email, customerData.is_active, customerData.notes, params.id]
        );

        if (result.changes === 0) {
            return NextResponse.json({ error: 'Customer not found' }, { status: 404 });
        }

        // Fetch and return the updated customer
        const updatedCustomer = await db.get('SELECT * FROM customers WHERE id = ?', params.id);
        await db.close();
        
        return NextResponse.json(updatedCustomer);
    } catch (error) {
        console.error('Error updating customer:', error);
        return NextResponse.json({ error: 'Failed to update customer' }, { status: 500 });
    }
}