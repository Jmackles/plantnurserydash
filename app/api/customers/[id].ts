import { NextRequest, NextResponse } from 'next/server';
import { open } from 'sqlite';
import sqlite3 from 'sqlite3';

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        const db = await open({
            filename: './database.sqlite',
            driver: sqlite3.Database
        });
        
        const { first_name, last_name, phone, email, is_active } = await request.json();
        const result = await db.run(
            'UPDATE customers SET first_name = ?, last_name = ?, phone = ?, email = ?, is_active = ? WHERE id = ?',
            [first_name, last_name, phone, email, is_active, params.id]
        );

        if (result.changes === 0) {
            throw new Error('No rows updated');
        }
        
        return NextResponse.json({ message: 'Customer updated successfully' });
    } catch (error) {
        console.error('Error updating customer:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json(
            { error: 'Failed to update customer', details: errorMessage },
            { status: 500 }
        );
    }
}