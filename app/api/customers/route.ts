import { NextResponse } from 'next/server'
import sqlite3 from 'sqlite3'
import { open } from 'sqlite'

const openDb = async () => {
  return open({
    filename: './app/database/database.sqlite',
    driver: sqlite3.Database
  })
}

// GET: fetch customers
export async function GET() {
  const db = await openDb()
  try {
    const customers = await db.all('SELECT * FROM customers')
    return NextResponse.json(customers)
  } catch (error) {
    console.error('Error fetching customers:', error)
    return NextResponse.json({ error: 'Failed to fetch customers' }, { status: 500 })
  }
}

// POST: add a new customer
export async function POST(request: Request) {
  const db = await openDb()
  const body = await request.json()
  const { first_name, last_name, phone, email, is_active, notes } = body
  try {
    const result = await db.run(
      'INSERT INTO customers (first_name, last_name, phone, email, is_active, notes) VALUES (?, ?, ?, ?, ?, ?)',
      [first_name, last_name, phone, email, is_active, notes]
    )
    const newCustomer = await db.get('SELECT * FROM customers WHERE id = ?', [result.lastID])
    return NextResponse.json(newCustomer, { status: 201 })
  } catch (error: any) {
    console.error('Error adding customer:', error)
    if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      return NextResponse.json({ error: 'A customer with this phone or email already exists' }, { status: 400 })
    }
    return NextResponse.json({ error: 'Failed to add customer' }, { status: 500 })
  }
}

// PUT: update an existing customer
export async function PUT(request: Request) {
  const db = await openDb()
  const body = await request.json()
  const { id, first_name, last_name, phone, email, is_active, notes } = body
  try {
    await db.run(
      'UPDATE customers SET first_name = ?, last_name = ?, phone = ?, email = ?, is_active = ?, notes = ? WHERE id = ?',
      [first_name, last_name, phone, email, is_active, notes, id]
    )
    const updatedCustomer = await db.get('SELECT * FROM customers WHERE id = ?', [id])
    return NextResponse.json(updatedCustomer)
  } catch (error) {
    console.error('Error updating customer:', error)
    return NextResponse.json({ error: 'Failed to update customer' }, { status: 500 })
  }
}
