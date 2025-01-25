// [id].ts
import { NextRequest, NextResponse } from 'next/server';
import { open } from 'sqlite';
import sqlite3 from 'sqlite3';
import path from 'path';

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        const db = await open({
            filename: path.join(process.cwd(), '../app/database/database.sqlite'), // Ensure this path is correct
            driver: sqlite3.Database
        });

        // Ensure that all required fields are sent in the request body
        const { first_name, last_name, phone, email, is_active, notes } = await request.json();

        // If any required fields are missing, return an error
        if (!first_name || !last_name || !phone || !email || is_active === undefined) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        const result = await db.run(
            'UPDATE customers SET first_name = ?, last_name = ?, phone = ?, email = ?, is_active = ?, notes = ? WHERE id = ?',
            [first_name, last_name, phone, email, is_active, notes, params.id]
        );

        // Check if any rows were updated
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
