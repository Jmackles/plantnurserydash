import { NextResponse } from 'next/server';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

const openDb = async () => {
  return open({
    filename: './app/database/database.sqlite',
    driver: sqlite3.Database
  });
};

export async function PUT(
    request: Request,
    { params }: { params: { id: string } }
) {
    const db = await openDb();
    const id = params.id;

    try {
        await db.run(
            `UPDATE entity_notes 
             SET dismissed_at = CURRENT_TIMESTAMP
             WHERE id = ?`,
            [id]
        );

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error dismissing note:', error);
        return NextResponse.json({ error: 'Failed to dismiss note' }, { status: 500 });
    } finally {
        await db.close();
    }
}
