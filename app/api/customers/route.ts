import { NextRequest, NextResponse } from 'next/server';
import { open } from 'sqlite';
import sqlite3 from 'sqlite3';
import path from 'path';

export async function GET() {
    try {
        const db = await open({
            filename: 'app/database/database.sqlite', // unify path
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
            filename: 'app/database/database.sqlite', // unify path
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