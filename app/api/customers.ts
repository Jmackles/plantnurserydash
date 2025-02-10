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
                const { customer, wantList } = req.body;
                const { first_name, last_name, phone, email, notes } = customer;

                // Begin transaction
                await db.run('BEGIN TRANSACTION');

                // Insert customer
                const customerResult = await db.run(
                    'INSERT INTO customers (first_name, last_name, phone, email, notes) VALUES (?, ?, ?, ?, ?)',
                    [first_name, last_name, phone, email, notes]
                );

                let response = {
                    customer: await db.get('SELECT * FROM customers WHERE id = ?', [customerResult.lastID])
                };

                // If want list data is included, create the want list entry
                if (wantList) {
                    const wantListResult = await db.run(
                        'INSERT INTO want_list (customer_id, initial, general_notes, status, created_at_text) VALUES (?, ?, ?, ?, ?)',
                        [
                            customerResult.lastID,
                            wantList.initial,
                            wantList.notes,
                            'pending',
                            new Date().toISOString()
                        ]
                    );
                    
                    response.wantList = await db.get('SELECT * FROM want_list WHERE id = ?', [wantListResult.lastID]);
                }

                // Commit transaction
                await db.run('COMMIT');
                res.status(201).json(response);

            } catch (error) {
                // Rollback on error
                await db.run('ROLLBACK');
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
                const { id, first_name, last_name, phone, email, notes } = req.body;
                await db.run(
                    'UPDATE customers SET first_name = ?, last_name = ?, phone = ?, email = ?, notes = ? WHERE id = ?',
                    [first_name, last_name, phone, email, notes, id]
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
