import { NextRequest, NextResponse } from 'next/server';
import { open } from 'sqlite';
import sqlite3 from 'sqlite3';
import path from 'path';

export async function GET() {
    try {
        const db = await open({
            filename: path.join(process.cwd(), 'app/database/database.sqlite'), // Ensure this path is correct
            driver: sqlite3.Database
        });
        
        const customers = await db.all('SELECT * FROM customers');
        await db.close();
        return NextResponse.json(customers);
    } catch (error: unknown) {
        console.error('Error fetching customers:', error);
        return NextResponse.json(
            { error: 'Failed to fetch customers' },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { first_name, last_name, phone, email } = body;
        
        const db = await open({
            filename: path.join(process.cwd(), 'app/database/database.sqlite'), // Ensure this path is correct
            driver: sqlite3.Database
        });

        const result = await db.run(
            'INSERT INTO customers (first_name, last_name, phone, email) VALUES (?, ?, ?, ?)',
            [first_name, last_name, phone, email]
        );
        await db.close();
        return NextResponse.json({ id: result.lastID }, { status: 201 });
    } catch (error) {
        if (error.code === 'SQLITE_CONSTRAINT') {
            return NextResponse.json(
                { error: 'A customer with this phone or email already exists' },
                { status: 409 }
            );
        }
        console.error('Error adding customer:', error);
        return NextResponse.json(
            { error: 'Failed to add customer' },
            { status: 500 }
        );
    }
}

// export async function PUT(request: NextRequest) {
//     try {
//         const { id, first_name, last_name, phone, email, is_active, notes } = await request.json();
        
//         const db = await open({
//             filename: './database.sqlite',
//             driver: sqlite3.Database
//         });

//         const result = await db.run(
//             'UPDATE customers SET first_name = ?, last_name = ?, phone = ?, email = ?, is_active = ?, notes = ? WHERE id = ?',
//             [first_name, last_name, phone, email, is_active, notes, id]
//         );

//         if (result.changes === 0) {
//             throw new Error('No rows updated');
//         }
//         await db.close();
//         return NextResponse.json({ message: 'Customer updated successfully' });
//     } catch (error: unknown) {
//         console.error('Error updating customer:', error);
//         return NextResponse.json(
//             { error: 'Failed to update customer', details: error instanceof Error ? error.message : String(error) },
//             { status: 500 }
//         );
//     }
// }