import { NextRequest, NextResponse } from 'next/server';
import { open } from 'sqlite';
import sqlite3 from 'sqlite3';
import path from 'path';
import { normalizeBotanicalName, groupBotanicalNames } from '../../../lib/utils/botanicalUtils';

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
        const db = await getDbConnection();
        
        const botanicals = await db.all(`
            SELECT DISTINCT Botanical 
            FROM BenchTags 
<<<<<<< HEAD
            WHERE Botanical IS NOT NULL AND Botanical != ''
            ORDER BY Botanical COLLATE NOCASE
        `);

        const names = botanicals
            .map(b => b.Botanical)
            .filter(Boolean);

        const grouped = groupBotanicalNames(names);

        // Enhanced response format
        const response = Object.entries(grouped).map(([key, variants]) => ({
            name: key,
            variants: variants.sort(),
            count: variants.length,
            isHybrid: key.includes('×'),
            level: key.split(' ').length // 1 = genus, 2 = species
=======
            WHERE Botanical IS NOT NULL 
            ORDER BY Botanical COLLATE NOCASE
        `);

        // Group similar names
        const names = botanicals.map(b => b.Botanical);
        const grouped = groupBotanicalNames(names);

        // Format response
        const response = Object.entries(grouped).map(([normalized, variants]) => ({
            name: normalized,
            variants: variants.sort(),
            count: variants.length
>>>>>>> f2985d72c6dca2efa7f8f889e5d28b789e96bbb3
        }));

        return NextResponse.json(response);
    } catch (error) {
        console.error('Error fetching botanical names:', error);
        return NextResponse.json({ error: 'Failed to fetch botanical names' }, { status: 500 });
    }
<<<<<<< HEAD
}
=======
}
>>>>>>> f2985d72c6dca2efa7f8f889e5d28b789e96bbb3
