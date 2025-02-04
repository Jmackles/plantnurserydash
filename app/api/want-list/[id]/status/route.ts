import { NextResponse } from 'next/server';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

const openDb = async () => {
    return open({
        filename: './app/database/database.sqlite',
        driver: sqlite3.Database
    });
};

export async function PUT(request: Request, { params }: { params: { id: string } }) {
    const db = await openDb();
    let data;
    
    try {
        const body = await request.json();
        const { status, initial, notes } = body;

        if (!initial?.trim()) {
            return NextResponse.json({ error: 'Initials are required' }, { status: 400 });
        }

        if (!['completed', 'canceled', 'pending'].includes(status)) {
            return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
        }

        await db.run('BEGIN TRANSACTION');

        // Update want list entry and check for changes
        const result = await db.run(`
            UPDATE want_list 
            SET status = ?,
                closed_by = ?,
                notes = CASE 
                    WHEN notes IS NULL OR notes = '' THEN ?
                    ELSE notes || ' | ' || ?
                END,
                closed_at = CURRENT_TIMESTAMP
            WHERE id = ?
        `, [status, initial, notes || '', notes || '', params.id]);

        if (result.changes === 0) {
            throw new Error('No want list entry found or update not performed');
        }

        // Update associated plants
        await db.run(`
            UPDATE plants 
            SET status = ?
            WHERE want_list_entry_id = ? AND status = 'pending'
        `, [status, params.id]);

        // Fetch updated entry and its plants
        const updatedEntry = await db.get('SELECT * FROM want_list WHERE id = ?', [params.id]);
        const updatedPlants = await db.all('SELECT * FROM plants WHERE want_list_entry_id = ?', [params.id]);

        data = { ...updatedEntry, plants: updatedPlants };

        await db.run('COMMIT');

        return NextResponse.json(data);
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
