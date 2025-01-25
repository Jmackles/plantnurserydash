const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
    // Create customers table
    db.run(`
        CREATE TABLE IF NOT EXISTS customers (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            first_name TEXT NOT NULL,
            last_name TEXT NOT NULL,
            phone TEXT NOT NULL,
            email TEXT NOT NULL,
            is_active BOOLEAN NOT NULL,
            notes TEXT
        )
    `);

    // Create want_list table
    db.run(`
        CREATE TABLE IF NOT EXISTS want_list (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            customer_id INTEGER NOT NULL,
            initial TEXT NOT NULL,
            notes TEXT,
            created_at TEXT NOT NULL,
            is_closed BOOLEAN,
            closed_by TEXT,
            spoken_to TEXT,
            FOREIGN KEY (customer_id) REFERENCES customers(id)
        )
    `);

    // Create plants table
    db.run(`
        CREATE TABLE IF NOT EXISTS plants (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            want_list_entry_id INTEGER NOT NULL,
            name TEXT NOT NULL,
            size TEXT,
            quantity INTEGER NOT NULL,
            FOREIGN KEY (want_list_entry_id) REFERENCES want_list(id)
        )
    `);
});

db.close((err) => {
    if (err) {
        console.error('Error closing the database connection:', err);
    } else {
        console.log('Database schema updated successfully.');
    }
});
