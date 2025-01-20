import { NextRequest, NextResponse } from 'next/server';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
    const { id } = params;

    if (!id) {
        return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    try {
        const db = await open({
            filename: './converted_database.sqlite',
            driver: sqlite3.Database
        });

        // Add indexes to improve query performance
        await db.exec('CREATE INDEX IF NOT EXISTS idx_id ON BenchTags (ID)');

        const plant = await db.get('SELECT * FROM BenchTags WHERE ID = ?', [id]);
        await db.close();

        if (!plant) {
            return NextResponse.json({ error: 'Plant not found' }, { status: 404 });
        }

        // Convert image data to base64 string
        const processedPlant = {
            ...plant,
            Image: plant.Image ? `data:image/bmp;base64,${Buffer.from(plant.Image).toString('base64')}` : null
        };

        return NextResponse.json(processedPlant);
    } catch (error) {
        console.error('Error fetching plant:', error);
        return NextResponse.json({ error: 'Failed to fetch plant' }, { status: 500 });
    }
}
