import { NextResponse } from 'next/server';
import { openDb } from '@/app/lib/db';

export async function PUT(
    request: Request,
    { params }: { params: { id: string } }
) {
    if (!params.id) {
        return NextResponse.json({ error: 'Missing ID parameter' }, { status: 400 });
    }

    const db = await openDb();
    
    try {
        const body = await request.json();
        if (!body.status || !body.initial) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        await db.run(
            'UPDATE want_list SET status = ?, initial = ?, general_notes = ? WHERE id = ?',
            [body.status, body.initial, body.general_notes || null, params.id]
        );

        const updatedEntry = await db.get('SELECT * FROM want_list WHERE id = ?', params.id);
        return NextResponse.json(updatedEntry);
    } catch (error) {
        console.error('Error:', error);
        return NextResponse.json({ error: 'Failed to update status' }, { status: 500 });
    } finally {
        await db.close();
    }
}
