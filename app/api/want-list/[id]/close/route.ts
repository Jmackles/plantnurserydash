import { NextRequest, NextResponse } from 'next/server';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
    const { id } = params;
    const { initial, notes } = await req.json();

    if (!id) {
        return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    try {
        const db = await open({
            filename: './database.sqlite',
            driver: sqlite3.Database
        });

        await db.run('UPDATE want_list SET is_closed = 1, closed_by = ?, notes = ? WHERE id = ?', [initial, notes, id]);
        await db.close();

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error closing want list entry:', error);
        return NextResponse.json({ error: 'Failed to close want list entry' }, { status: 500 });
    }
}