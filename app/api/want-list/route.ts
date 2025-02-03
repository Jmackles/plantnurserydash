import { NextRequest, NextResponse } from 'next/server';
import { open } from 'sqlite';
import sqlite3 from 'sqlite3';
import path from 'path';
import { WantList } from '../../lib/types';

let db: sqlite3.Database | null = null;

async function getDbConnection() {
    if (!db) {
        db = new sqlite3.Database(path.join(process.cwd(), 'app/database/database.sqlite'));
    }
    return db;
}

export async function GET(req: NextRequest) {
    try {
        const db = await getDbConnection();

        const wantListEntries = await db.all<WantList[]>(`
            SELECT 
                id,
                customer_id,
                initial,
                notes,
                is_closed,
                spoken_to,
                created_at_text,
                closed_by
            FROM want_list
        `);

        return NextResponse.json({ data: wantListEntries });
    } catch (error: unknown) {
        console.error('Database error:', error);
        return NextResponse.json({
            error: 'Failed to fetch want list entries',
            details: error instanceof Error ? error.message : 'Unknown error',
        }, { status: 500 });
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