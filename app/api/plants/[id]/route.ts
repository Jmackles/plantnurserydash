import { NextResponse } from 'next/server';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

const openDb = async () => {
    return open({
        filename: './app/database/database.sqlite',
        driver: sqlite3.Database
    });
};

export async function GET(request: Request, context: { params: { id: string } }) {
    const db = await openDb();
    try {
        const plant = await db.get('SELECT * FROM PlantCatalog WHERE id = ?', [context.params.id]);
        const images = await db.all('SELECT * FROM CatalogImages WHERE plantcatalog_id = ?', [context.params.id]);
        return NextResponse.json({ plant, images });
    } catch (error) {
        console.error('Database error:', error);
        return NextResponse.json({ error: 'Error fetching plant and images' }, { status: 500 });
    } finally {
        await db.close();
    }
}
