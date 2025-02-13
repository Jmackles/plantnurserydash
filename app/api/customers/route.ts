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
export async function GET(request: Request) {
  const db = await openDb()
  const url = new URL(request.url)
  const id = url.searchParams.get('id')

  try {
    if (id) {
      const customer = await db.get('SELECT * FROM customers WHERE id = ?', [id])
      if (!customer) {
        return NextResponse.json({ error: 'Customer not found' }, { status: 404 })
      }
      return NextResponse.json(customer)
    } else {
      const customers = await db.all('SELECT * FROM customers')
      return NextResponse.json(customers)
    }
  } catch (error) {
    console.error('Error fetching customers:', error)
    return NextResponse.json({ error: 'Failed to fetch customers' }, { status: 500 })
  }
}

// POST: add a new customer
export async function POST(request: Request) {
  const db = await openDb()
  try {
    const body = await request.json()
    const { first_name, last_name, phone, email, notes } = body

    // Convert empty strings to null for UNIQUE constraint
    const phoneValue = phone?.trim() || null
    const emailValue = email?.trim() || null

    // First check if customer exists
    const existingCustomer = await db.get(
      'SELECT * FROM customers WHERE (phone = ? AND phone IS NOT NULL) OR (email = ? AND email IS NOT NULL)',
      [phoneValue, emailValue]
    )

    if (existingCustomer) {
      console.log('Found existing customer:', existingCustomer)
      return NextResponse.json({ 
        error: 'A customer with this phone number or email already exists',
        existingCustomer,
        status: 409
      }, { 
        status: 409 
      })
    }

    const result = await db.run(
      'INSERT INTO customers (first_name, last_name, phone, email, notes) VALUES (?, ?, ?, ?, ?)',
      [first_name, last_name, phoneValue, emailValue, notes]
    )
    
    const newCustomer = await db.get('SELECT * FROM customers WHERE id = ?', [result.lastID])
    console.log('Created new customer:', newCustomer)
    return NextResponse.json(newCustomer, { status: 201 })

  } catch (error: any) {
    console.error('Error in customer creation:', error)
    return NextResponse.json({ 
      error: 'Failed to add customer',
      details: error.message 
    }, { 
      status: 500 
    })
  } finally {
    await db.close()
  }
}

// PUT: update an existing customer
export async function PUT(request: Request) {
  const db = await openDb()
  const body = await request.json()
  const { id, first_name, last_name, phone, email, notes } = body
  try {
    await db.run(
      'UPDATE customers SET first_name = ?, last_name = ?, phone = ?, email = ?, notes = ? WHERE id = ?',
      [first_name, last_name, phone, email, notes, id]
    )
    const updatedCustomer = await db.get('SELECT * FROM customers WHERE id = ?', [id])
    return NextResponse.json(updatedCustomer)
  } catch (error) {
    console.error('Error updating customer:', error)
    return NextResponse.json({ error: 'Failed to update customer' }, { status: 500 })
  }
}
