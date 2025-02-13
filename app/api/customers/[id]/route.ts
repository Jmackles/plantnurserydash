import { NextResponse } from 'next/server'
import sqlite3 from 'sqlite3'
import { open } from 'sqlite'

const openDb = async () => {
    return open({
        filename: './app/database/database.sqlite',
        driver: sqlite3.Database
    })
}

export async function GET(
    request: Request,
    { params }: { params: { id: string } }
) {
    const db = await openDb()
    try {
        const customer = await db.get('SELECT * FROM customers WHERE id = ?', [params.id])
        if (!customer) {
            return NextResponse.json({ error: 'Customer not found' }, { status: 404 })
        }
        return NextResponse.json(customer)
    } catch (error) {
        console.error('Error fetching customer:', error)
        return NextResponse.json({ error: 'Failed to fetch customer' }, { status: 500 })
    } finally {
        await db.close()
    }
}
