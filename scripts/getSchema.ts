const sqlite3 = require('sqlite3').verbose();
const { open } = require('sqlite');
const fs = require('fs');

async function getSchema() {
    try {
        const db = await open({
            filename: './converted_database.sqlite',
            driver: sqlite3.Database
        });

        const schema = await db.all("SELECT name, sql FROM sqlite_master WHERE type='table'");
        console.log('Database Schema:', schema);

        const schemaText = schema.map(table => `Table: ${table.name}\nSQL: ${table.sql}\n`).join('\n');
        fs.writeFileSync('schema.txt', schemaText);

        await db.close();
    } catch (error) {
        console.error('Error retrieving schema:', error);
    }
}

getSchema();
