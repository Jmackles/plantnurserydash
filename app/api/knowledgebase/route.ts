import { NextRequest, NextResponse } from 'next/server';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

export async function GET(req: NextRequest) {
    try {
        const db = await open({
            filename: './converted_database.sqlite',
            driver: sqlite3.Database
        });

        // Add indexes to improve query performance
        await db.exec('CREATE INDEX IF NOT EXISTS idx_tagname ON BenchTags (TagName)');
        await db.exec('CREATE INDEX IF NOT EXISTS idx_botanical ON BenchTags (Botanical)');

        // Fetch a limited number of records
        const entries = await db.all('SELECT * FROM BenchTags LIMIT 100');
        await db.close();

        // Convert image data to base64 string
        const processedEntries = entries.map(entry => ({
            ...entry,
            Image: entry.Image ? `data:image/bmp;base64,${Buffer.from(entry.Image).toString('base64')}` : null
        }));

        return NextResponse.json(processedEntries);
    } catch (error) {
        console.error('Error fetching knowledgebase entries:', error);
        return NextResponse.json({ error: 'Failed to fetch knowledgebase entries' }, { status: 500 });
    }
}
