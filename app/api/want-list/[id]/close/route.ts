import { NextRequest, NextResponse } from 'next/server';
import { open } from 'sqlite';
import sqlite3 from 'sqlite3';
import path from 'path';

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        const { initial, notes } = await request.json();

        const db = await open({
            filename: path.join(process.cwd(), 'app/database/database.sqlite'),
            driver: sqlite3.Database
        });

        const result = await db.run(
            'UPDATE want_list SET is_closed = 1, closed_by = ?, notes = ? WHERE id = ?',
            [initial, notes, params.id]
        );

        await db.close();

        if (result.changes === 0) {
            throw new Error('No rows updated');
        }

        return NextResponse.json({ message: 'Want list entry closed successfully' });
    } catch (error) {
        console.error('Error closing want list entry:', error);
        return NextResponse.json(
            { error: 'Failed to close want list entry' },
            { status: 500 }
        );
    }
}