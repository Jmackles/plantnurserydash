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
        case 'GET':
            try {
                const customers = await db.all('SELECT * FROM customers');
                res.status(200).json(customers);
            } catch (error) {
                console.error('Error fetching customers:', error);
                res.status(500).json({ error: 'Failed to fetch customers' });
            }
            break;
        case 'POST':
            try {
                const { first_name, last_name, phone, email, is_active, notes } = req.body;
                const result = await db.run(
                    'INSERT INTO customers (first_name, last_name, phone, email, is_active, notes) VALUES (?, ?, ?, ?, ?, ?)',
                    [first_name, last_name, phone, email, is_active, notes]
                );
                const newCustomer = await db.get('SELECT * FROM customers WHERE id = ?', [result.lastID]);
                res.status(201).json(newCustomer);
            } catch (error) {
                console.error('Error adding customer:', error);
                if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
                    res.status(400).json({ error: 'A customer with this phone or email already exists' });
                } else {
                    res.status(500).json({ error: 'Failed to add customer' });
                }
            }
            break;
        case 'PUT':
            try {
                const { id, first_name, last_name, phone, email, is_active, notes } = req.body;
                await db.run(
                    'UPDATE customers SET first_name = ?, last_name = ?, phone = ?, email = ?, is_active = ?, notes = ? WHERE id = ?',
                    [first_name, last_name, phone, email, is_active, notes, id]
                );
                const updatedCustomer = await db.get('SELECT * FROM customers WHERE id = ?', [id]);
                res.status(200).json(updatedCustomer);
            } catch (error) {
                console.error('Error updating customer:', error);
                res.status(500).json({ error: 'Failed to update customer' });
            }
            break;
        default:
            res.setHeader('Allow', ['GET', 'POST', 'PUT']);
            res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}
