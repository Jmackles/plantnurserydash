import { NextRequest, NextResponse } from 'next/server';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

export async function GET() {
    try {
        const db = await open({
            filename: './database.sqlite',
            driver: sqlite3.Database
        });
        
        const entries = await db.all(`
            SELECT 
                w.*,
                c.first_name as customer_first_name,
                c.last_name as customer_last_name,
                json_group_array(
                    json_object(
                        'name', p.name,
                        'size', p.size,
                        'quantity', p.quantity
                    )
                ) as plants
            FROM want_list w
            JOIN customers c ON w.customer_id = c.id
            LEFT JOIN plants p ON w.id = p.want_list_id
            GROUP BY w.id
        `);

        const parsedEntries = entries.map(entry => ({
            ...entry,
            plants: JSON.parse(entry.plants || '[]')
        }));

        return NextResponse.json(parsedEntries);
    } catch (error) {
        console.error('Error fetching want list entries:', error);
        return NextResponse.json(
            { error: 'Failed to fetch want list entries' },
            { status: 500 }
        );
    }
}

export async function POST(req: NextRequest) {
    const { customer_id, initial, notes, plants } = await req.json();

    try {
        const db = await open({
            filename: './database.sqlite',
            driver: sqlite3.Database
        });

        const result = await db.run(
            'INSERT INTO want_list (customer_id, initial, notes, is_closed) VALUES (?, ?, ?, 0)',
            [customer_id, initial, notes]
        );

        const entryId = result.lastID;

        for (const plant of plants) {
            await db.run(
                'INSERT INTO plants (want_list_id, name, size, quantity) VALUES (?, ?, ?, ?)',
                [entryId, plant.name, plant.size, plant.quantity]
            );
        }

        await db.close();

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error adding want list entry:', error);
        return NextResponse.json({ error: 'Failed to add want list entry' }, { status: 500 });
    }
}

export async function PUT(request: NextRequest) {
    try {
        const body = await request.json();
        const { id, updatedFields } = body;

        const db = await open({
            filename: './database.sqlite',
            driver: sqlite3.Database
        });

        const { initial, notes, spoken_to, is_closed, plants } = updatedFields;

        await db.run(
            'UPDATE want_list SET initial = ?, notes = ?, spoken_to = ?, is_closed = ? WHERE id = ?',
            [initial, notes, spoken_to, is_closed, id]
        );

        await db.run('DELETE FROM plants WHERE want_list_id = ?', [id]);

        if (plants && plants.length > 0) {
            for (const plant of plants) {
                await db.run(
                    'INSERT INTO plants (want_list_id, name, size, quantity) VALUES (?, ?, ?, ?)',
                    [id, plant.name, plant.size, plant.quantity]
                );
            }
        }

        return NextResponse.json({ message: 'Entry updated successfully' });
    } catch (error) {
        console.error('Error updating want list entry:', error);
        return NextResponse.json(
            { error: 'Failed to update want list entry' },
            { status: 500 }
        );
    }
}