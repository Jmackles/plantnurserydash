import { NextResponse } from 'next/server';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

const openDb = async () => {
    return open({
        filename: './app/database/database.sqlite',
        driver: sqlite3.Database
    });
};

export async function PUT(request: Request, context: { params: { id: string } }) {
    const db = await openDb();
    let data;
    
    try {
        const body = await request.json();
        const { status, initial, general_notes } = body;
        const { id } = await context.params;

        console.log('Processing status update:', { id, status, initial, general_notes });

        if (!initial?.trim()) {
            console.error('Initials are required');
            return NextResponse.json({ error: 'Initials are required' }, { status: 400 });
        }

        if (!['completed', 'canceled', 'pending'].includes(status)) {
            console.error('Invalid status:', status);
            return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
        }

        await db.run('BEGIN TRANSACTION');

        // Update want list entry
        const result = await db.run(`
            UPDATE want_list 
            SET status = ?,
                closed_by = ?,
                general_notes = CASE 
                    WHEN general_notes IS NULL OR general_notes = '' THEN ?
                    ELSE general_notes || ' | ' || ?
                END
            WHERE id = ?
        `, [status, initial, general_notes || '', general_notes || '', id]);

        // Update associated plants
        await db.run(`
            UPDATE plants 
            SET status = ?
            WHERE want_list_entry_id = ? AND status = 'pending'
        `, [status, id]);

        // Fetch updated entry and its plants
        const updatedEntry = await db.get('SELECT * FROM want_list WHERE id = ?', [id]);
        const updatedPlants = await db.all('SELECT * FROM plants WHERE want_list_entry_id = ?', [id]);

        await db.run('COMMIT');

        console.log('Status update successful:', { id, status });
        return NextResponse.json({ ...updatedEntry, plants: updatedPlants });

    } catch (error) {
        console.error('Status update error:', error);
        await db.run('ROLLBACK');
        return NextResponse.json(
            { error: 'Failed to update status', details: error.message },
            { status: 500 }
        );
    } finally {
        await db.close();
    }
}
