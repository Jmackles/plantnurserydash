// filename: app/api/benchTags/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { open } from 'sqlite';
import sqlite3 from 'sqlite3';
import path from 'path';
import { botanicalNameMatches, parseBotanicalName } from '../../lib/utils/botanicalUtils';

let db: sqlite3.Database | null = null;

async function getDbConnection() {
    if (!db) {
        db = await open({
            filename: path.join(process.cwd(), 'app/database/database.sqlite'),
            driver: sqlite3.Database
        });
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
        const botanicalNames = url.searchParams.getAll('botanicalNames[]');

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

        if (botanicalNames.length > 0) {
            const botanicalConditions = botanicalNames.map((filterName) => {
                const parsed = parseBotanicalName(filterName);
                if (parsed.isHybrid) {
                    // Match hybrids: both "Genus x" and "Genus x species"
                    return `(
                        Botanical LIKE '${parsed.genus} x%' OR 
                        Botanical LIKE '${parsed.genus} ×%'
                    )`;
                } else if (parsed.species) {
                    // Match specific species, including cultivars
                    return `(
                        Botanical LIKE '${parsed.genus} ${parsed.species}%'
                    )`;
                } else {
                    // Match genus only
                    return `(
                        Botanical LIKE '${parsed.genus}%' AND
                        Botanical NOT LIKE '${parsed.genus}aceae%'
                    )`; // Avoid matching family names
                }
            }).join(' OR ');

            whereConditions.push(`(${botanicalConditions})`);
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
            SELECT BenchTags.*
            FROM BenchTags
            WHERE ${whereClause}
            ORDER BY ${sortField} COLLATE NOCASE
            LIMIT ? OFFSET ?
        `, [...params, limit, offset]);

        // Process images correctly
        const plantsWithImages = await Promise.all(plants.map(async (plant) => {
            if (plant.Image) {
                try {
                    // Convert binary data to base64
                    const buffer = Buffer.from(plant.Image);
                    plant.ImageUrl = `data:image/jpeg;base64,${buffer.toString('base64')}`;
                } catch (error) {
                    console.error(`Error processing image for plant ${plant.ID}:`, error);
                    plant.ImageUrl = null;
                }
            } else {
                plant.ImageUrl = null;
            }
            // Remove the raw image data from the response
            delete plant.Image;
            return plant;
        }));

        // Debug logs
        console.log(`Pagination Debug => page=${page}, limit=${limit}, offset=${offset}, total=${total}, plants.length=${plants?.length}`);

        return NextResponse.json({
            data: plantsWithImages,
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
