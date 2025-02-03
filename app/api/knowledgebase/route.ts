// filename: app/api/knowledgebase/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { open } from 'sqlite';
import sqlite3 from 'sqlite3';
import path from 'path';
import { PlantCatalog } from '../../lib/types';

let db: sqlite3.Database | null = null;

async function getDbConnection() {
    if (!db) {
        db = new sqlite3.Database(path.join(process.cwd(), 'app/database/database.sqlite'));
    }
    return db;
}

export async function GET(req: NextRequest) {
    try {
        const url = new URL(req.url);
        const page = parseInt(url.searchParams.get('page') || '1', 10);
        const limit = parseInt(url.searchParams.get('limit') || '10', 10);
        const offset = (page - 1) * limit;

        const searchQuery = url.searchParams.get('search') || '';
        const sunExposure = url.searchParams.getAll('sunExposure[]');
        const foliageType = url.searchParams.getAll('foliageType[]');
        const departments = url.searchParams.getAll('departments[]');
        // sortField received as PlantCatalog key; map to legacy DB column
        const clientSortField = url.searchParams.get('sort') || 'tag_name';
        const sortMapping: { [key: string]: string } = {
            tag_name: 'tag_name',
            botanical: 'Botanical',
            deer_resistance: 'DeerResistance',
            no_warranty: 'NoWarranty',
            classification: 'Classification',
            department: 'Department'
        };
        const sortField = sortMapping[clientSortField] || 'tag_name';
        const botanicalNames = url.searchParams.getAll('botanicalNames[]');

        const db = await getDbConnection();

        // Build dynamic WHERE clause using legacy column names
        const whereConditions = ['1=1'];
        const params: (string | number)[] = [];

        if (searchQuery) {
            whereConditions.push('(tag_name LIKE ? OR Botanical LIKE ?)');
            params.push(`%${searchQuery}%`, `%${searchQuery}%`);
        }

        if (sunExposure.length > 0) {
            const sunConditions = [];
            if (sunExposure.includes('full_sun')) sunConditions.push('FullSun = 1');
            if (sunExposure.includes('part_sun')) sunConditions.push('PartSun = 1');
            if (sunExposure.includes('shade')) sunConditions.push('Shade = 1');
            if (sunExposure.includes('melting_sun')) sunConditions.push('MeltingSun = 1');
            if (sunConditions.length > 0) {
                whereConditions.push(`(${sunConditions.join(' OR ')})`);
            }
        }

        if (departments.length > 0) {
            whereConditions.push(`Department IN (${departments.map(() => '?').join(',')})`);
            params.push(...departments);
        }

        if (foliageType.length > 0) {
            whereConditions.push(`Classification IN (${foliageType.map(() => '?').join(',')})`);
            params.push(...foliageType);
        }

        if (botanicalNames.length > 0) {
            const botanicalConditions = botanicalNames.map(() => `Botanical LIKE ?`).join(' OR ');
            params.push(...botanicalNames.map(name => `%${name}%`));
            whereConditions.push(`(${botanicalConditions})`);
        }

        const whereClause = whereConditions.join(' AND ');

        // Get total count with filters from the new table
        const totalResult = await db.get<{ total: number }>(
            `SELECT COUNT(*) as total 
             FROM PlantCatalog 
             WHERE ${whereClause}`, 
            params
        );
        const total = totalResult?.total || 0;

        // Get filtered, paginated data with alias mapping to PlantCatalog
        const plants = await db.all(`
            SELECT 
                id,
                tag_name,
                botanical,
                department,
                classification,
                no_warranty,
                deer_resistance,
                nativity,
                car_native,
                melting_sun,
                full_sun,
                part_sun,
                shade,
                growth_rate,
                avg_size,
                max_size,
                mature_size,
                zone_max,
                zone_min,
                winterizing,
                notes,
                show_top_notes,
                top_notes,
                price,
                size,
                pot_details_id,
                flat_pricing,
                flat_count,
                flat_price,
                print,
                botanical_id
            FROM PlantCatalog
            WHERE ${whereClause}
            ORDER BY ${sortField} COLLATE NOCASE
            LIMIT ? OFFSET ?
        `, [...params, limit, offset]);

        return NextResponse.json({
            data: plants,
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
