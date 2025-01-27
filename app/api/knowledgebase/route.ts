// filename: app/api/benchTags/route.ts

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

export async function GET(req: NextRequest) {
    try {
        const url = new URL(req.url);
        const page = parseInt(url.searchParams.get('page') || '1', 10);
        const limit = parseInt(url.searchParams.get('limit') || '10', 10);
        const offset = (page - 1) * limit;
        
        // Get filter parameters
        const searchQuery = url.searchParams.get('search') || '';
        const sunExposure = url.searchParams.getAll('sunExposure[]');
        const foliageType = url.searchParams.getAll('foliageType[]');
        const departments = url.searchParams.getAll('departments[]');
        const lifespan = url.searchParams.getAll('lifespan[]');
        const sortField = url.searchParams.get('sort') || 'TagName';

        const db = await getDbConnection();

        // Build dynamic WHERE clause
        let whereConditions = ['1=1'];
        let params: any[] = [];

        if (searchQuery) {
            whereConditions.push('(TagName LIKE ? OR Botanical LIKE ?)');
            params.push(`%${searchQuery}%`, `%${searchQuery}%`);
        }

        if (sunExposure.length > 0) {
            const sunConditions = [];
            if (sunExposure.includes('Full Sun')) sunConditions.push('FullSun = 1');
            if (sunExposure.includes('Part Sun')) sunConditions.push('PartSun = 1');
            if (sunExposure.includes('Shade')) sunConditions.push('Shade = 1');
            if (sunConditions.length > 0) {
                whereConditions.push(`(${sunConditions.join(' OR ')})`);
            }
        }

        if (departments.length > 0) {
            whereConditions.push(`Department IN (${departments.map(() => '?').join(',')})`);
            params.push(...departments);
        }

        if (foliageType.length > 0) {
            whereConditions.push(`FoliageType IN (${foliageType.map(() => '?').join(',')})`);
            params.push(...foliageType);
        }

        // Build and execute queries
        const whereClause = whereConditions.join(' AND ');
        
        // Get total count with filters
        const [{ total }] = await db.all<{ total: number }>(
            `SELECT COUNT(*) as total 
             FROM BenchTags 
             WHERE ${whereClause}`, 
            params
        );

        // Get filtered and paginated data
        const plants = await db.all(`
            SELECT BenchTags.*, [BenchTag Images].Image
            FROM BenchTags
            LEFT JOIN [BenchTag Images] ON BenchTags.TagName = [BenchTag Images].TagName
            WHERE ${whereClause}
            ORDER BY ${sortField} COLLATE NOCASE
            LIMIT ? OFFSET ?
        `, [...params, limit, offset]);

        // Debug logs
        console.log(`Pagination Debug => page=${page}, limit=${limit}, offset=${offset}, total=${total}, plants.length=${plants?.length}`);

        // Generate image URLs
        const plantsWithImageUrls = plants.map(plant => {
            if (plant.Image) {
                plant.ImageUrl = `/api/knowledgebase/image/${plant.ID}`;
            }
            return plant;
        });

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
