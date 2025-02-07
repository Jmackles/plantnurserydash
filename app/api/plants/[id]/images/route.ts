import { NextResponse } from 'next/server';
import { openDb } from '@/app/lib/db';

export async function GET(
    request: Request,
    { params }: { params: { id: string } }
) {
    const db = await openDb();
    try {
        const images = await db.all(
            `SELECT id, image_path, caption, created_at, updated_at 
             FROM CatalogImages 
             WHERE plantcatalog_id = ?`,
            [params.id]
        );
        return NextResponse.json(images);
    } catch (error) {
        console.error('Error fetching images:', error);
        return NextResponse.json({ error: 'Failed to fetch images' }, { status: 500 });
    } finally {
        await db.close();
    }
}
