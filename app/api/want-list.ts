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
                const { customerId } = req.query;
                const query = customerId 
                    ? 'SELECT * FROM want_list WHERE customer_id = ?'
                    : 'SELECT * FROM want_list';
                const params = customerId ? [customerId] : [];
                const wantListEntries = await db.all(query, params);
                res.status(200).json(wantListEntries);
            } catch (error) {
                res.status(500).json({ error: 'Failed to fetch want list entries' });
            }
            break;
        case 'POST':
            try {
                const { customer_id, initial, notes, is_closed, spoken_to, created_at_text, closed_by } = req.body;
                const result = await db.run(
                    'INSERT INTO want_list (customer_id, initial, notes, is_closed, spoken_to, created_at_text, closed_by) VALUES (?, ?, ?, ?, ?, ?, ?)',
                    [customer_id, initial, notes, is_closed, spoken_to, created_at_text, closed_by]
                );
                const newEntry = await db.get('SELECT * FROM want_list WHERE id = ?', [result.lastID]);
                res.status(201).json(newEntry);
            } catch (error) {
                if (error.code === 'SQLITE_CONSTRAINT_FOREIGNKEY') {
                    res.status(400).json({ error: 'Foreign key constraint failed' });
                } else {
                    res.status(500).json({ error: 'Failed to add want list entry' });
                }
            }
            break;
        case 'PUT':
            try {
                const { id, customer_id, initial, notes, is_closed, spoken_to, created_at_text, closed_by } = req.body;
                await db.run(
                    'UPDATE want_list SET customer_id = ?, initial = ?, notes = ?, is_closed = ?, spoken_to = ?, created_at_text = ?, closed_by = ? WHERE id = ?',
                    [customer_id, initial, notes, is_closed, spoken_to, created_at_text, closed_by, id]
                );
                const updatedEntry = await db.get('SELECT * FROM want_list WHERE id = ?', [id]);
                res.status(200).json(updatedEntry);
            } catch (error) {
                if (error.code === 'SQLITE_CONSTRAINT_FOREIGNKEY') {
                    res.status(400).json({ error: 'Foreign key constraint failed' });
                } else {
                    res.status(500).json({ error: 'Failed to update want list entry' });
                }
            }
            break;
        case 'DELETE':
            try {
                const { id } = req.body;
                await db.run('DELETE FROM want_list WHERE id = ?', [id]);
                res.status(200).json({ message: 'Want list entry deleted successfully' });
            } catch (error) {
                res.status(500).json({ error: 'Failed to delete want list entry' });
            }
            break;
        default:
            res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
            res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}
