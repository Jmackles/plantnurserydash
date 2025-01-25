import { NextRequest, NextResponse } from 'next/server';
import { open } from 'sqlite';
import sqlite3 from 'sqlite3';
import path from 'path';

export async function GET() {
    try {
        const db = await open({
            filename: path.join(process.cwd(), 'app/database/database.sqlite'), // Ensure this path is correct
            driver: sqlite3.Database
        });

        const wantListEntries = await db.all(`
            SELECT wl.*, p.id as plant_id, p.name as plant_name, p.size as plant_size, p.quantity as plant_quantity
            FROM want_list wl
            LEFT JOIN plants p ON wl.id = p.want_list_entry_id
        `);

        const entriesMap = new Map();
        wantListEntries.forEach(entry => {
            if (!entriesMap.has(entry.id)) {
                entriesMap.set(entry.id, {
                    id: entry.id,
                    customer_id: entry.customer_id,
                    initial: entry.initial,
                    notes: entry.notes,
                    created_at: entry.created_at,
                    is_closed: entry.is_closed,
                    closed_by: entry.closed_by,
                    spoken_to: entry.spoken_to,
                    plants: []
                });
            }
            if (entry.plant_id) {
                entriesMap.get(entry.id).plants.push({
                    id: entry.plant_id,
                    name: entry.plant_name,
                    size: entry.plant_size,
                    quantity: entry.plant_quantity
                });
            }
        });

        const entries = Array.from(entriesMap.values());

        await db.close();
        return NextResponse.json(entries);
    } catch (error) {
        console.error('Error fetching want list entries:', error);
        return NextResponse.json(
            { error: 'Failed to fetch want list entries' },
            { status: 500 }
        );
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