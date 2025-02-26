import { NextResponse } from 'next/server';
import { openDb } from '@/app/lib/db';

export async function PUT(
    request: Request,
    { params }: { params: { id: string } }
) {
    const db = await openDb();
    
    try {
        const body = await request.json();
        const { status, initial, notes } = body;

        if (!status || !initial) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Begin transaction
        await db.run('BEGIN TRANSACTION');

        // Update want_list status
        await db.run(
            'UPDATE want_list SET status = ?, initial = ? WHERE id = ?',
            [status, initial, params.id]
        );

        // Create a note if provided
        if (notes) {
            await db.run(
                `INSERT INTO entity_notes (
                    notable_type, notable_id, note_type, note_text
                ) VALUES (?, ?, ?, ?)`,
                ['want_list', params.id, 'note', notes]
            );
        }

        // Commit transaction
        await db.run('COMMIT');

        const updatedEntry = await db.get('SELECT * FROM want_list WHERE id = ?', params.id);
        const entryNotes = await db.all(
            'SELECT * FROM entity_notes WHERE notable_type = ? AND notable_id = ? ORDER BY created_at DESC',
            ['want_list', params.id]
        );

        return NextResponse.json({ ...updatedEntry, notes: entryNotes });
    } catch (error) {
        await db.run('ROLLBACK');
        console.error('Error:', error);
        return NextResponse.json({ error: 'Failed to update status' }, { status: 500 });
    } finally {
        await db.close();
    }
}
