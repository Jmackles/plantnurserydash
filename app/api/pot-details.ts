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
                const potDetails = await db.all('SELECT * FROM PotDetails');
                res.status(200).json(potDetails);
            } catch (error) {
                res.status(500).json({ error: 'Failed to fetch pot details' });
            }
            break;
        case 'POST':
            try {
                const { pot_size, pot_size_unit, pot_depth, pot_shape, pot_type, pot_custom_text } = req.body;
                const result = await db.run(
                    'INSERT INTO PotDetails (pot_size, pot_size_unit, pot_depth, pot_shape, pot_type, pot_custom_text) VALUES (?, ?, ?, ?, ?, ?)',
                    [pot_size, pot_size_unit, pot_depth, pot_shape, pot_type, pot_custom_text]
                );
                const newPotDetail = await db.get('SELECT * FROM PotDetails WHERE id = ?', [result.lastID]);
                res.status(201).json(newPotDetail);
            } catch (error) {
                if (error.code === 'SQLITE_CONSTRAINT_FOREIGNKEY') {
                    res.status(400).json({ error: 'Foreign key constraint failed' });
                } else {
                    res.status(500).json({ error: 'Failed to add pot detail' });
                }
            }
            break;
        case 'PUT':
            try {
                const { id, pot_size, pot_size_unit, pot_depth, pot_shape, pot_type, pot_custom_text } = req.body;
                await db.run(
                    'UPDATE PotDetails SET pot_size = ?, pot_size_unit = ?, pot_depth = ?, pot_shape = ?, pot_type = ?, pot_custom_text = ? WHERE id = ?',
                    [pot_size, pot_size_unit, pot_depth, pot_shape, pot_type, pot_custom_text, id]
                );
                const updatedPotDetail = await db.get('SELECT * FROM PotDetails WHERE id = ?', [id]);
                res.status(200).json(updatedPotDetail);
            } catch (error) {
                if (error.code === 'SQLITE_CONSTRAINT_FOREIGNKEY') {
                    res.status(400).json({ error: 'Foreign key constraint failed' });
                } else {
                    res.status(500).json({ error: 'Failed to update pot detail' });
                }
            }
            break;
        case 'DELETE':
            try {
                const { id } = req.body;
                await db.run('DELETE FROM PotDetails WHERE id = ?', [id]);
                res.status(200).json({ message: 'Pot detail deleted successfully' });
            } catch (error) {
                res.status(500).json({ error: 'Failed to delete pot detail' });
            }
            break;
        default:
            res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
            res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}
