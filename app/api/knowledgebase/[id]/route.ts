// filepath: /c:/Users/Head-Lee2021/OneDrive/Documents/GitHub/plantnurserydash/app/api/knowledgebase/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { open } from 'sqlite';
import sqlite3 from 'sqlite3';
import path from 'path';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        const { id } = params;

        const db = await open({
            filename: path.join(process.cwd(), 'app/database/database.sqlite'), // Ensure this path is correct
            driver: sqlite3.Database
        });

        const plant = await db.get(`
            SELECT BenchTags.*, [BenchTag Images].Image
            FROM BenchTags
            LEFT JOIN [BenchTag Images] ON BenchTags.TagName = [BenchTag Images].TagName
            WHERE BenchTags.ID = ?
        `, id);

        if (plant && plant.Image) {
            plant.ImageUrl = `/api/knowledgebase/image/${plant.ID}`;
        }

        await db.close();

        if (!plant) {
            return NextResponse.json({ error: 'Plant not found' }, { status: 404 });
        }

        return NextResponse.json(plant);
    } catch (error: unknown) {
        console.error('Error fetching plant:', error);
        return NextResponse.json({ error: 'Failed to fetch plant' }, { status: 500 });
    }
}