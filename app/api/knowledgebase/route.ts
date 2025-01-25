// filename: app/api/benchTags/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { open } from 'sqlite';
import sqlite3 from 'sqlite3';
import path from 'path';

export async function GET(req: NextRequest) {
    try {
        const url = new URL(req.url);
        const page = parseInt(url.searchParams.get('page') || '1', 10);
        const limit = parseInt(url.searchParams.get('limit') || '10', 10);
        const offset = (page - 1) * limit;

        const db = await open({
            filename: path.join(process.cwd(), 'app/database/database.sqlite'),
            driver: sqlite3.Database
        });

        // Get total count
        const [{ total }] = await db.all<{ total: number }>('SELECT COUNT(*) as total FROM BenchTags');

        // Get paginated data
        const plants = await db.all(`
            SELECT BenchTags.*, [BenchTag Images].Image
            FROM BenchTags
            LEFT JOIN [BenchTag Images] ON BenchTags.TagName = [BenchTag Images].TagName
            ORDER BY TagName
            LIMIT ? OFFSET ?
        `, [limit, offset]);

        // Generate image URLs
        const plantsWithImageUrls = plants.map(plant => {
            if (plant.Image) {
                plant.ImageUrl = `/api/knowledgebase/image/${plant.ID}`;
            }
            return plant;
        });

        await db.close();

        return NextResponse.json({
            data: plantsWithImageUrls,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            }
        });

    } catch (error: unknown) {
        console.error('Database error:', error);
        return NextResponse.json({
            error: 'Failed to fetch knowledgebase entries',
            details: error instanceof Error ? error.message : 'Unknown error',
            data: [],
            pagination: {
                total: 0,
                page: 1,
                limit: 10,
                totalPages: 0
            }
        }, { status: 500 });
    }
}
