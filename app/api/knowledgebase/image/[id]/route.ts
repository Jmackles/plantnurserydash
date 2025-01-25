import { NextRequest, NextResponse } from 'next/server';
import { open } from 'sqlite';
import sqlite3 from 'sqlite3';
import path from 'path';

export async function GET(
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await context.params;

        const db = await open({
            filename: path.join(process.cwd(), 'app/database/database.sqlite'),
            driver: sqlite3.Database
        });

        const plantImage = await db.get(`
            SELECT Image
            FROM [BenchTag Images]
            WHERE TagName = (SELECT TagName FROM BenchTags WHERE ID = ?)
        `, id);

        await db.close();

        if (!plantImage || !plantImage.Image) {
            return NextResponse.json({ error: 'Image not found' }, { status: 404 });
        }

        // Create a ReadableStream from the image buffer
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
