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

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { customer_id, initial, notes, plants } = body;
        
        const db = await open({
            filename: './database.sqlite',
            driver: sqlite3.Database
        });

        const result = await db.run(
            'INSERT INTO want_list (customer_id, initial, notes) VALUES (?, ?, ?)',
            [customer_id, initial, notes]
        );

        if (plants && plants.length > 0) {
            for (const plant of plants) {
                await db.run(
                    'INSERT INTO plants (want_list_id, name, size, quantity) VALUES (?, ?, ?, ?)',
                    [result.lastID, plant.name, plant.size, plant.quantity]
                );
            }
        }

        return NextResponse.json({ id: result.lastID }, { status: 201 });
    } catch (error) {
        console.error('Error adding want list entry:', error);
        return NextResponse.json(
            { error: 'Failed to add want list entry' },
            { status: 500 }
        );
    }
}