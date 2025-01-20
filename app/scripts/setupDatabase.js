const sqlite3 = require('sqlite3');
const { open } = require('sqlite');

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
            is_active BOOLEAN DEFAULT 1,
            notes TEXT,
            UNIQUE (phone, email)
        );
    `);

    // Create the want_list_entries table if it doesn't exist
    await db.exec(`
        CREATE TABLE IF NOT EXISTS want_list_entries (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            customer_id INTEGER NOT NULL,
            initial TEXT NOT NULL,
            notes TEXT,
            is_closed BOOLEAN DEFAULT 0,
            spoken_to TEXT,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP, -- Add this line
            FOREIGN KEY (customer_id) REFERENCES customers(id)
        );
    `);

    console.log('Database setup complete.');
    await db.close();
})();