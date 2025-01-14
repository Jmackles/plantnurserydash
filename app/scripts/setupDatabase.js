// scripts/setupDatabase.js
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

(async () => {
    const db = await open({ filename: './database.sqlite', driver: sqlite3.Database });

    // Create the customers table if it doesn't exist
    await db.exec(`
        CREATE TABLE IF NOT EXISTS customers (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            first_name TEXT NOT NULL,
            last_name TEXT NOT NULL,
            phone TEXT,
            email TEXT,
            UNIQUE (phone, email)
        );
    `);

    // Create the want_list table if it doesn't exist
    await db.exec(`
        CREATE TABLE IF NOT EXISTS want_list (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            customer_id INTEGER NOT NULL,
            initial TEXT,
            notes TEXT,
            is_closed BOOLEAN DEFAULT FALSE,
            spoken_to TEXT, -- Added the 'spoken_to' column
            FOREIGN KEY (customer_id) REFERENCES customers(id)
        );
    `);

    // Create the plants table if it doesn't exist
    await db.exec(`
        CREATE TABLE IF NOT EXISTS plants (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            want_list_id INTEGER NOT NULL,
            name TEXT NOT NULL,
            size TEXT,
            quantity INTEGER DEFAULT 1,
            FOREIGN KEY (want_list_id) REFERENCES want_list(id)
        );
    `);

    console.log('Database setup complete!');
    process.exit(0);
})();
