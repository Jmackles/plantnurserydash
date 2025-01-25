import { NextRequest, NextResponse } from 'next/server';
import { open } from 'sqlite';
import sqlite3 from 'sqlite3';
import path from 'path';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        const { id } = params;

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

        return new NextResponse(plantImage.Image, {
            headers: {
                'Content-Type': 'image/jpeg',
                'Content-Disposition': `inline; filename="${id}.jpg"`
            }
        });
    } catch (error: unknown) {
        console.error('Error fetching image:', error);
        return NextResponse.json({ error: 'Failed to fetch image' }, { status: 500 });
    }
}
