import { NextResponse } from 'next/server';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

const openDb = async () => {
  return open({
    filename: './app/database/database.sqlite',
    driver: sqlite3.Database
  });
};

export async function GET(request: Request) {
    const db = await openDb();
    const { searchParams } = new URL(request.url);
    const notable_type = searchParams.get('notable_type');
    const notable_id = searchParams.get('notable_id');

    try {
        if (!notable_type || !notable_id) {
            return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
        }

        const notes = await db.all(
            `SELECT * FROM entity_notes 
             WHERE notable_type = ? AND notable_id = ?
             ORDER BY created_at DESC`,
            [notable_type, notable_id]
        );

        return NextResponse.json(notes);
    } catch (error) {
        console.error('Error fetching notes:', error);
        return NextResponse.json({ error: 'Failed to fetch notes' }, { status: 500 });
    } finally {
        await db.close();
    }
}

export async function POST(request: Request) {
    const db = await openDb();
    
    try {
        const body = await request.json();
        const { notable_type, notable_id, note_type, note_text, parent_note_id } = body;

        if (!notable_type || !notable_id || !note_type || !note_text) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const result = await db.run(
            `INSERT INTO entity_notes (
                notable_type, notable_id, note_type, note_text, 
                parent_note_id, created_at
            ) VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
            [notable_type, notable_id, note_type, note_text, parent_note_id || null]
        );

        const newNote = await db.get('SELECT * FROM entity_notes WHERE id = ?', [result.lastID]);
        return NextResponse.json(newNote, { status: 201 });
    } catch (error) {
        console.error('Error creating note:', error);
        return NextResponse.json({ error: 'Failed to create note' }, { status: 500 });
    } finally {
        await db.close();
    }
}
