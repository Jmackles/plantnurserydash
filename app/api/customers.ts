import { NextApiRequest, NextApiResponse } from 'next';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

const openDb = async () => {
    return open({
        filename: './app/database/database.sqlite',
        driver: sqlite3.Database
    });
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const db = await openDb();

    switch (req.method) {
        case 'POST':
            try {
                const { first_name, last_name, phone, email, notes, address } = req.body;

                if (!first_name || !last_name) {
                    return res.status(400).json({ 
                        error: 'First name and last name are required',
                        status: 400 
                    });
                }

                // Check for existing customer
                const existingCustomer = await db.get(
                    'SELECT * FROM customers WHERE phone = ? OR email = ?',
                    [phone, email]
                );

                if (existingCustomer) {
                    console.log('Found existing customer:', existingCustomer);
                    return res.status(409).json({
                        error: 'A customer with this phone number or email already exists',
                        status: 409,
                        existingCustomer,
                        duplicateField: existingCustomer.phone === phone ? 'phone' : 'email'
                    });
                }

                // Begin transaction
                await db.run('BEGIN TRANSACTION');

                // Insert customer
                const customerResult = await db.run(
                    'INSERT INTO customers (first_name, last_name, phone, email, notes, address) VALUES (?, ?, ?, ?, ?, ?)',
                    [first_name, last_name, phone, email, notes, address]
                );

                // Confirm insertion
                const newCustomer = await db.get('SELECT * FROM customers WHERE id = ?', [customerResult.lastID]);
                if (!newCustomer) {
                    throw new Error('Failed to confirm customer insertion');
                }

                // Commit transaction
                await db.run('COMMIT');
                console.log('Customer inserted successfully:', newCustomer);
                res.status(201).json(newCustomer);

            } catch (error) {
                // Rollback on error
                await db.run('ROLLBACK');
                console.error('Error adding customer:', error);
                res.status(500).json({ 
                    error: 'Failed to add customer',
                    status: 500 
                });
            }
            break;

        case 'GET':
            try {
                const { id } = req.query;
                const customer = await db.get('SELECT * FROM customers WHERE id = ?', [id]);
                if (!customer) {
                    return res.status(404).json({ 
                        error: 'Customer not found',
                        status: 404 
                    });
                }
                res.status(200).json(customer);
            } catch (error) {
                console.error('Error fetching customer:', error);
                res.status(500).json({ 
                    error: 'Failed to fetch customer',
                    status: 500 
                });
            }
            break;

        default:
            res.setHeader('Allow', ['POST', 'GET']);
            res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}
