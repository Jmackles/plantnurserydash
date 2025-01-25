import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, 'app/database/database.sqlite');
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
    // Create plants table
    db.run(`
        CREATE TABLE IF NOT EXISTS plants (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            want_list_entry_id INTEGER,
            name TEXT,
            size TEXT,
            quantity INTEGER,
            FOREIGN KEY (want_list_entry_id) REFERENCES want_list(id)
        )
    `, (err) => {
        if (err) {
            console.error('Error creating plants table:', err.message);
        } else {
            console.log('Plants table created successfully.');
        }
    });

    // Add closed_by column to want_list table
    db.run(`
        ALTER TABLE want_list ADD COLUMN closed_by TEXT;
    `, (err) => {
        if (err) {
            // Column might already exist, which is fine
            console.log('closed_by column might already exist:', err.message);
        } else {
            console.log('closed_by column added successfully.');
        }
    });

    // Add any other necessary updates here
});

db.close((err) => {
    if (err) {
        console.error('Error closing the database connection:', err.message);
    } else {
        console.log('Database connection closed.');
    }
});
