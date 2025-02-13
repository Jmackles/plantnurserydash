import { NextResponse } from 'next/server';
import { db } from '@/app/lib/db';

export async function GET(request: Request) {
    const url = new URL(request.url);
    const notableType = url.searchParams.get('notable_type');
    const notableId = url.searchParams.get('notable_id');

    try {
        const notes = await db.all(`
            SELECT n.*, 
                   GROUP_CONCAT(c.id) as child_ids,
                   GROUP_CONCAT(c.note_text) as child_texts
            FROM entity_notes n
            LEFT JOIN entity_notes c ON c.parent_note_id = n.id
            WHERE n.notable_type = ? AND n.notable_id = ?
            GROUP BY n.id
            ORDER BY n.created_at DESC
        `, [notableType, notableId]);

        return NextResponse.json(notes);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch notes' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        
        const result = await db.run(`
            INSERT INTO entity_notes (
                notable_type, notable_id, note_type, note_text,
                created_by, parent_note_id
            ) VALUES (?, ?, ?, ?, ?, ?)
        `, [
            body.notable_type,
            body.notable_id,
            body.note_type,
            body.note_text,
            body.created_by || null,
            body.parent_note_id || null
        ]);

        const newNote = await db.get('SELECT * FROM entity_notes WHERE id = ?', [result.lastID]);
        return NextResponse.json(newNote, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to create note' }, { status: 500 });
    }
}