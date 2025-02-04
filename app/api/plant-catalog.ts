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
                const plants = await db.all('SELECT * FROM PlantCatalog');
                res.status(200).json(plants);
            } catch (error) {
                res.status(500).json({ error: 'Failed to fetch plants' });
            }
            break;
        case 'POST':
            try {
                const { tag_name, botanical, department, classification, no_warranty, deer_resistance, nativity, car_native, melting_sun, full_sun, part_sun, shade, growth_rate, avg_size, max_size, mature_size, zone_max, zone_min, winterizing, notes, show_top_notes, top_notes, price, size, pot_details_id, flat_pricing, flat_count, flat_price, print, botanical_id } = req.body;
                const result = await db.run(
                    'INSERT INTO PlantCatalog (tag_name, botanical, department, classification, no_warranty, deer_resistance, nativity, car_native, melting_sun, full_sun, part_sun, shade, growth_rate, avg_size, max_size, mature_size, zone_max, zone_min, winterizing, notes, show_top_notes, top_notes, price, size, pot_details_id, flat_pricing, flat_count, flat_price, print, botanical_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
                    [tag_name, botanical, department, classification, no_warranty, deer_resistance, nativity, car_native, melting_sun, full_sun, part_sun, shade, growth_rate, avg_size, max_size, mature_size, zone_max, zone_min, winterizing, notes, show_top_notes, top_notes, price, size, pot_details_id, flat_pricing, flat_count, flat_price, print, botanical_id]
                );
                const newPlant = await db.get('SELECT * FROM PlantCatalog WHERE id = ?', [result.lastID]);
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
                const { id, tag_name, botanical, department, classification, no_warranty, deer_resistance, nativity, car_native, melting_sun, full_sun, part_sun, shade, growth_rate, avg_size, max_size, mature_size, zone_max, zone_min, winterizing, notes, show_top_notes, top_notes, price, size, pot_details_id, flat_pricing, flat_count, flat_price, print, botanical_id } = req.body;
                await db.run(
                    'UPDATE PlantCatalog SET tag_name = ?, botanical = ?, department = ?, classification = ?, no_warranty = ?, deer_resistance = ?, nativity = ?, car_native = ?, melting_sun = ?, full_sun = ?, part_sun = ?, shade = ?, growth_rate = ?, avg_size = ?, max_size = ?, mature_size = ?, zone_max = ?, zone_min = ?, winterizing = ?, notes = ?, show_top_notes = ?, top_notes = ?, price = ?, size = ?, pot_details_id = ?, flat_pricing = ?, flat_count = ?, flat_price = ?, print = ?, botanical_id = ? WHERE id = ?',
                    [tag_name, botanical, department, classification, no_warranty, deer_resistance, nativity, car_native, melting_sun, full_sun, part_sun, shade, growth_rate, avg_size, max_size, mature_size, zone_max, zone_min, winterizing, notes, show_top_notes, top_notes, price, size, pot_details_id, flat_pricing, flat_count, flat_price, print, botanical_id, id]
                );
                const updatedPlant = await db.get('SELECT * FROM PlantCatalog WHERE id = ?', [id]);
                res.status(200).json(updatedPlant);
            } catch (error) {
                if (error.code === 'SQLITE_CONSTRAINT_FOREIGNKEY') {
                    res.status(400).json({ error: 'Foreign key constraint failed' });
                } else {
                    res.status(500).json({ error: 'Failed to update plant' });
                }
            }
            break;
        case 'DELETE':
            try {
                const { id } = req.body;
                await db.run('DELETE FROM PlantCatalog WHERE id = ?', [id]);
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
