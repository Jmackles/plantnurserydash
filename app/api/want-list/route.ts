import { NextRequest, NextResponse } from 'next/server';
import { open } from 'sqlite';
import sqlite3 from 'sqlite3';
import path from 'path';
import { WantList } from '../../lib/types';

async function getDbConnection() {
    try {
        return await open({
            filename: path.join(process.cwd(), 'app/database/database.sqlite'),
            driver: sqlite3.Database
        });
    } catch (error) {
        console.error('Database connection error:', error);
        throw error;
    }
}

export async function GET(req: NextRequest) {
    let db = null;
    try {
        db = await getDbConnection();
        console.log('Database connected successfully');

        // First get the want list entries
        const wantListEntries = await db.all(`
            SELECT 
                w.id,
                w.customer_id,
                w.initial,
                w.notes,
                w.is_closed,
                w.spoken_to,
                w.created_at_text,
                w.closed_by,
                c.first_name,
                c.last_name
            FROM want_list w
            LEFT JOIN customers c ON w.customer_id = c.id
            ORDER BY w.created_at_text DESC
        `);

        console.log('Found want list entries:', wantListEntries.length);

        // For each want list entry, get its plants
        const entriesWithPlants = await Promise.all(wantListEntries.map(async (entry) => {
            try {
                // Get legacy plants
                const oldPlants = await db.all(`
                    SELECT 
                        id,
                        want_list_entry_id,
                        name,
                        size,
                        quantity,
                        'legacy' as status,
                        NULL as plant_catalog_id,
                        NULL as requested_at,
                        NULL as fulfilled_at
                    FROM plants_old
                    WHERE want_list_entry_id = ?
                `, [entry.id]);

                // Get new plants
                const newPlants = await db.all(`
                    SELECT 
                        id,
                        want_list_entry_id,
                        name,
                        size,
                        quantity,
                        status,
                        plant_catalog_id,
                        requested_at,
                        fulfilled_at
                    FROM plants
                    WHERE want_list_entry_id = ?
                `, [entry.id]);

                return {
                    ...entry,
                    plants: [...oldPlants, ...newPlants]
                };
            } catch (error) {
                console.error(`Error fetching plants for entry ${entry.id}:`, error);
                return {
                    ...entry,
                    plants: []
                };
            }
        }));

        console.log('Successfully processed all entries');

        return NextResponse.json({
            success: true,
            data: entriesWithPlants
        });

    } catch (error) {
        console.error('Database error:', error);
        return NextResponse.json({
            success: false,
            error: 'Failed to fetch want list entries',
            details: error instanceof Error ? error.message : 'Unknown error',
            data: []
        }, { status: 500 });
    } finally {
        if (db) {
            try {
                await db.close();
                console.log('Database connection closed');
            } catch (error) {
                console.error('Error closing database:', error);
            }
        }
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { customer_id, initial, notes, plants, created_at } = body;

        const db = await open({
            filename: path.join(process.cwd(), 'app/database/database.sqlite'), // Ensure this path is correct
            driver: sqlite3.Database
        });

        const result = await db.run(
            'INSERT INTO want_list (customer_id, initial, notes, created_at) VALUES (?, ?, ?, ?)',
            [customer_id, initial, notes, created_at]
        );

        const entryId = result.lastID;

        for (const plant of plants) {
            await db.run(
                'INSERT INTO plants (want_list_entry_id, name, size, quantity) VALUES (?, ?, ?, ?)',
                [entryId, plant.name, plant.size, plant.quantity]
            );
        }

        await db.close();
        return NextResponse.json({ id: entryId }, { status: 201 });
    } catch (error) {
        console.error('Error adding want list entry:', error);
        return NextResponse.json(
            { error: 'Failed to add want list entry' },
            { status: 500 }
        );
    }
}

export async function PUT(request: NextRequest) {
    try {
        const body = await request.json();
        const { id, updatedFields } = body;

        const db = await open({
            filename: path.join(process.cwd(), 'app/database/database.sqlite'), // Ensure this path is correct
            driver: sqlite3.Database
        });

        const { initial, notes, spoken_to, is_closed, plants } = updatedFields;

        await db.run(
            'UPDATE want_list SET initial = ?, notes = ?, spoken_to = ?, is_closed = ? WHERE id = ?',
            [initial, notes, spoken_to, is_closed, id]
        );

        await db.run('DELETE FROM plants WHERE want_list_entry_id = ?', [id]);

        if (plants && plants.length > 0) {
            for (const plant of plants) {
                await db.run(
                    'INSERT INTO plants (want_list_entry_id, name, size, quantity) VALUES (?, ?, ?, ?)',
                    [id, plant.name, plant.size, plant.quantity]
                );
            }
        }

        await db.close();
        return NextResponse.json({ message: 'Entry updated successfully' });
    } catch (error) {
        console.error('Error updating want list entry:', error);
        return NextResponse.json(
            { error: 'Failed to update want list entry' },
            { status: 500 }
        );
    }
}