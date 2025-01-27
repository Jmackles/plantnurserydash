// filepath: /c:/Users/Head-Lee2021/OneDrive/Documents/GitHub/plantnurserydash/app/api/knowledgebase/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { open } from 'sqlite';
import sqlite3 from 'sqlite3';
import path from 'path';

let db: sqlite3.Database | null = null;

async function getDbConnection() {
    if (!db) {
        db = await open({
            filename: path.join(process.cwd(), 'app/database/database.sqlite'),
            driver: sqlite3.Database
        });
        await db.run('PRAGMA journaling_mode = WAL');
        await db.run('CREATE INDEX IF NOT EXISTS idx_BenchTags_ID ON BenchTags (ID)');
        await db.run('CREATE INDEX IF NOT EXISTS idx_BenchTags_TagName ON BenchTags (TagName)');
        await db.run('CREATE INDEX IF NOT EXISTS idx_BenchTagImages_TagName ON [BenchTag Images] (TagName)');
    }
    return db;
}

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        const { id } = params;

        const db = await getDbConnection();

        const plant = await db.get(`
            SELECT BenchTags.*, [BenchTag Images].Image
            FROM BenchTags
            LEFT JOIN [BenchTag Images] ON BenchTags.TagName = [BenchTag Images].TagName
            WHERE BenchTags.ID = ?
        `, id);

        if (plant && plant.Image) {
            try {
                // Convert binary data to base64
                const buffer = Buffer.from(plant.Image);
                plant.ImageUrl = `data:image/jpeg;base64,${buffer.toString('base64')}`;
            } catch (error) {
                console.error(`Error processing image for plant ${plant.ID}:`, error);
                plant.ImageUrl = null;
            }
        }

        if (!plant) {
            return NextResponse.json({ error: 'Plant not found' }, { status: 404 });
        }

        return NextResponse.json(plant);
    } catch (error: unknown) {
        console.error('Error fetching plant:', error);
        return NextResponse.json({ error: 'Failed to fetch plant' }, { status: 500 });
    }
}