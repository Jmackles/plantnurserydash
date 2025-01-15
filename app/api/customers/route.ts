import { NextRequest, NextResponse } from 'next/server';
import { open } from 'sqlite';
import sqlite3 from 'sqlite3';

export async function GET() {
    try {
        const db = await open({
            filename: './database.sqlite',
            driver: sqlite3.Database
        });
        
        const customers = await db.all('SELECT * FROM customers');
        return NextResponse.json(customers);
    } catch (error) {
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
            filename: './database.sqlite',
            driver: sqlite3.Database
        });

        const result = await db.run(
            'INSERT INTO customers (first_name, last_name, phone, email) VALUES (?, ?, ?, ?)',
            [first_name, last_name, phone, email]
        );
        
        return NextResponse.json({ id: result.lastID }, { status: 201 });
    } catch (error) {
        console.error('Error adding customer:', error);
        return NextResponse.json(
            { error: 'Failed to add customer' },
            { status: 500 }
        );
    }
}