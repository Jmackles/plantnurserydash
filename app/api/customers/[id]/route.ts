import { NextResponse } from 'next/server';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

const openDb = async () => {
    return open({
        filename: './app/database/database.sqlite',
        driver: sqlite3.Database
    });
};

export async function GET(
    request: Request,
    { params }: { params: { id: string } }
) {
    const id = params.id;
    if (!id) {
        return NextResponse.json({ error: 'Missing ID parameter' }, { status: 400 });
    }

    const db = await openDb();
    try {
        const customer = await db.get('SELECT * FROM customers WHERE id = ?', [id]);
        
        if (!customer) {
            return NextResponse.json({ error: 'Customer not found' }, { status: 404 });
        }

        return NextResponse.json(customer);
    } catch (error) {
        console.error('Error fetching customer:', error);
        return NextResponse.json({ error: 'Failed to fetch customer' }, { status: 500 });
    } finally {
        await db.close();
    }
}

export async function PUT(
    request: Request,
    { params }: { params: { id: string } }
) {
    const id = params.id;
    if (!id) {
        return NextResponse.json({ error: 'Missing ID parameter' }, { status: 400 });
    }

    const db = await openDb();
    try {
        const body = await request.json();
        
        const result = await db.run(
            `UPDATE customers 
             SET first_name = ?, last_name = ?, phone = ?, email = ?, notes = ?
             WHERE id = ?`,
            [body.first_name, body.last_name, body.phone, body.email, body.notes, id]
        );

        if (result.changes === 0) {
            return NextResponse.json({ error: 'Customer not found' }, { status: 404 });
        }

        const updatedCustomer = await db.get('SELECT * FROM customers WHERE id = ?', [id]);
        return NextResponse.json(updatedCustomer);
    } catch (error) {
        console.error('Error updating customer:', error);
        return NextResponse.json({ error: 'Failed to update customer' }, { status: 500 });
    } finally {
        await db.close();
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: { id: string } }
) {
    const id = params.id;
    if (!id) {
        return NextResponse.json({ error: 'Missing ID parameter' }, { status: 400 });
    }

    const db = await openDb();
    try {
        const result = await db.run('DELETE FROM customers WHERE id = ?', [id]);
        
        if (result.changes === 0) {
            return NextResponse.json({ error: 'Customer not found' }, { status: 404 });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting customer:', error);
        return NextResponse.json({ error: 'Failed to delete customer' }, { status: 500 });
    } finally {
        await db.close();
    }
}
