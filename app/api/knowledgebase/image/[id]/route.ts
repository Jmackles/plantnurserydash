import { NextRequest, NextResponse } from 'next/server';
import { open } from 'sqlite';
import sqlite3 from 'sqlite3';
import path from 'path';

const dbPromise = open({
    filename: path.join(process.cwd(), 'app/database/database.sqlite'),
    driver: sqlite3.Database
}).then(async (dbInstance) => {
    await dbInstance.run('PRAGMA journaling_mode = WAL');
    await dbInstance.run('CREATE INDEX IF NOT EXISTS idx_BenchTags_ID ON BenchTags (ID)');
    await dbInstance.run('CREATE INDEX IF NOT EXISTS idx_BenchTags_TagName ON BenchTags (TagName)');
    await dbInstance.run('CREATE INDEX IF NOT EXISTS idx_BenchTagImages_TagName ON [BenchTag Images] (TagName)');
    return dbInstance;
});

export async function GET(
    request: NextRequest,
    context: { params: { id: string } }
) {
    try {
        const { id } = context.params;

        const db = await dbPromise;

        const plantImage = await db.get(`
            SELECT bi.Image
            FROM [BenchTag Images] bi
            JOIN BenchTags bt ON bi.TagName = bt.TagName
            WHERE bt.ID = ?
        `, id);

        // Remove db.close() so the connection remains usable

        if (!plantImage || !plantImage.Image) {
            console.error(`Image not found for ID: ${id}`);
            return NextResponse.json({ error: 'Image not found' }, { status: 404 });
        }

        const stream = new ReadableStream({
            start(controller) {
                controller.enqueue(Buffer.from(plantImage.Image));
                controller.close();
            },
        });

        return new NextResponse(stream, {
            headers: {
                'Content-Type': 'image/jpeg',
                'Cache-Control': 'public, max-age=31536000, immutable',
            },
        });
    } catch (error: unknown) {
        console.error('Error fetching image:', error);
        return NextResponse.json({ error: 'Failed to fetch image' }, { status: 500 });
    }
}
