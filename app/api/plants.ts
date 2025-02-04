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
                const plants = await db.all('SELECT * FROM plants');
                res.status(200).json(plants);
            } catch (error) {
                res.status(500).json({ error: 'Failed to fetch plants' });
            }
            break;
        case 'POST':
            try {
                const { want_list_entry_id, name, size, quantity, status, plant_catalog_id, requested_at, fulfilled_at } = req.body;
                const result = await db.run(
                    'INSERT INTO plants (want_list_entry_id, name, size, quantity, status, plant_catalog_id, requested_at, fulfilled_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
                    [want_list_entry_id, name, size, quantity, status, plant_catalog_id, requested_at, fulfilled_at]
                );
                const newPlant = await db.get('SELECT * FROM plants WHERE id = ?', [result.lastID]);
                res.status(201).json(newPlant);
            } catch (error) {
                if (error.code === 'SQLITE_CONSTRAINT_FOREIGNKEY') {
                    res.status(400).json({ error: 'Foreign key constraint failed' });
                } else {
                    res.status(500).json({ error: 'Failed to add plant' });
                }
            }
            break;
        case 'PUT':
            try {
                const { id, want_list_entry_id, name, size, quantity, status, plant_catalog_id, requested_at, fulfilled_at } = req.body;
                await db.run(
                    'UPDATE plants SET want_list_entry_id = ?, name = ?, size = ?, quantity = ?, status = ?, plant_catalog_id = ?, requested_at = ?, fulfilled_at = ? WHERE id = ?',
                    [want_list_entry_id, name, size, quantity, status, plant_catalog_id, requested_at, fulfilled_at, id]
                );
                const updatedPlant = await db.get('SELECT * FROM plants WHERE id = ?', [id]);
                res.status(200).json(updatedPlant);
            } catch (error) {
                if (error.code === 'SQLITE_CONSTRAINT_FOREIGNKEY') {
                    res.status(400).json({ error: 'Foreign key constraint failed' });
                } else {
                    res.status 500).json({ error: 'Failed to update plant' });
                }
            }
            break;
        case 'DELETE':
            try {
                const { id } = req.body;
                await db.run('DELETE FROM plants WHERE id = ?', [id]);
                res.status(200).json({ message: 'Plant deleted successfully' });
            } catch (error) {
                res.status(500).json({ error: 'Failed to delete plant' });
            }
            break;
        default:
            res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
            res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}
