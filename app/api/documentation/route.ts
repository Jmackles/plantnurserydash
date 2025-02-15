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
    const entityType = searchParams.get('entity_type');
    const entityId = searchParams.get('entity_id');

    if (!entityType || !entityId) {
        return NextResponse.json({ error: 'Missing entity_type or entity_id' }, { status: 400 });
    }

    try {
        const docs = await db.all('SELECT * FROM Documentation WHERE entity_type = ? AND entity_id = ?', [entityType, entityId]);
        return NextResponse.json(docs);
    } catch (error) {
        console.error('Error fetching documentation:', error);
        return NextResponse.json({ error: 'Failed to fetch documentation' }, { status: 500 });
    } finally {
        await db.close();
    }
}

export async function POST(request: Request) {
    const db = await openDb();
    const body = await request.json();

    try {
        const { entity_type, entity_id, doc_type, content } = body;
        if (!entity_type || !entity_id || !doc_type || !content) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const result = await db.run(`
            INSERT INTO Documentation (entity_type, entity_id, doc_type, content)
            VALUES (?, ?, ?, ?)
        `, [entity_type, entity_id, doc_type, content]);

        const newDoc = await db.get('SELECT * FROM Documentation WHERE id = ?', [result.lastID]);
        return NextResponse.json(newDoc, { status: 201 });
    } catch (error) {
        console.error('Error creating documentation:', error);
        return NextResponse.json({ error: 'Failed to create documentation' }, { status: 500 });
    } finally {
        await db.close();
    }
}

export async function PUT(request: Request) {
    const db = await openDb();
    const body = await request.json();

    try {
        const { id, content, acknowledged } = body;
        if (!id || (!content && acknowledged === undefined)) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        await db.run(`
            UPDATE Documentation
            SET content = COALESCE(?, content),
                acknowledged = COALESCE(?, acknowledged),
                updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        `, [content, acknowledged, id]);

        const updatedDoc = await db.get('SELECT * FROM Documentation WHERE id = ?', [id]);
        return NextResponse.json(updatedDoc);
    } catch (error) {
        console.error('Error updating documentation:', error);
        return NextResponse.json({ error: 'Failed to update documentation' }, { status: 500 });
    } finally {
        await db.close();
    }
}

export async function DELETE(request: Request) {
    const db = await openDb();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
        return NextResponse.json({ error: 'Missing id' }, { status: 400 });
    }

    try {
        await db.run('DELETE FROM Documentation WHERE id = ?', [id]);
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting documentation:', error);
        return NextResponse.json({ error: 'Failed to delete documentation' }, { status: 500 });
    } finally {
        await db.close();
    }
}