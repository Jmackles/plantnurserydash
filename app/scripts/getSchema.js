import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import { join } from 'path';
import { writeFile } from 'fs/promises';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

async function getSchema() {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);
    
    // Updated path to point to app/database instead of database
    const dbPath = join(__dirname, '..', 'database', 'database.sqlite');
    
    const db = await open({
        filename: dbPath,
        driver: sqlite3.Database
    });

    // Get comprehensive schema information
    const tables = await db.all("SELECT name, sql FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'");
    
    const fullSchema = {};
    
    // Get column details for each table - fix the PRAGMA query
    for (const table of tables) {
        const columns = await db.all(`PRAGMA table_info("${table.name}")`);
        fullSchema[table.name] = {
            sql: table.sql,
            columns: columns
        };
    }

    // Update schema path as well to match the database location
    const schemaPath = join(__dirname, '..', 'database', 'schema.json');
    await writeFile(schemaPath, JSON.stringify(fullSchema, null, 2));
    
    console.log('Schema has been saved to schema.json');
    await db.close();
}

getSchema().catch(err => {
    console.error('Error retrieving schema:', err);
    process.exit(1);
});
