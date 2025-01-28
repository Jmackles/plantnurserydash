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
        }));

        return NextResponse.json(response);
    } catch (error) {
        console.error('Error fetching botanical names:', error);
        return NextResponse.json({ error: 'Failed to fetch botanical names' }, { status: 500 });
    }
}
