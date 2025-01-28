import sqlite3 from 'sqlite3';

const db = new sqlite3.Database('./database.sqlite', (err) => {
    if (err) {
        console.error('Error connecting to database:', err.message);
    } else {
        console.log('Connected to the SQLite database.');
    }
});

const getColumns = async (tableName) => {
    return new Promise((resolve, reject) => {
        db.all(`PRAGMA table_info(${tableName});`, [], (err, rows) => {
            if (err) {
                console.error('Error retrieving columns:', err.message);
                reject(err);
            } else {
                resolve(rows.map(row => row.name));
            }
        });
    });
};

const main = async () => {
    try {
        const columns = await getColumns('BenchTags');
        console.log('Columns in BenchTags table:', columns);
    } catch (err) {
        console.error('Error:', err.message);
    } finally {
        db.close((err) => {
            if (err) {
                console.error('Error closing the database:', err.message);
            } else {
                console.log('Database connection closed.');
            }
        });
    }
};

main();
