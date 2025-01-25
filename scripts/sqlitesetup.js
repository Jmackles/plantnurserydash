import sqlite3 from 'sqlite3';
// Create a new database file
let db = new sqlite3.Database('Plants.SQLite', (err) => {
    if (err) {
        console.error(err.message);
        throw err;
    }
    console.log('Connected to the Plants.SQLite database.');
});

// Create a table for storing plant data
db.run(`CREATE TABLE IF NOT EXISTS plants (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    species TEXT NOT NULL,
    age INTEGER,
    location TEXT
)`, (err) => {
    if (err) {
        console.error(err.message);
        throw err;
    }
    console.log('Plants table created.');
});

// Close the database connection
db.close((err) => {
    if (err) {
        console.error(err.message);
        throw err;
    }
    console.log('Closed the database connection.');
});