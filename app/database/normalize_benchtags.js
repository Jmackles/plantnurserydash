import sqlite3 from 'sqlite3';

const db = new sqlite3.Database('./database.sqlite', (err) => {
    if (err) {
        console.error('Error connecting to database:', err.message);
    } else {
        console.log('Connected to the SQLite database.');
    }
});

// Function to execute a query and log results
const executeQuery = (query, params = []) => {
    return new Promise((resolve, reject) => {
        db.run(query, params, function (err) {
            if (err) {
                console.error('Error executing query:', err.message);
                reject(err);
            } else {
                resolve(this);
            }
        });
    });
};

// Ensure all necessary tables exist
const ensureTablesExist = async () => {
    console.log('Ensuring required tables exist...');
    await executeQuery(`
        CREATE TABLE IF NOT EXISTS Genus (
            GenusID INTEGER PRIMARY KEY AUTOINCREMENT,
            GenusName TEXT NOT NULL UNIQUE
        );
    `);
    console.log('Genus table ensured.');

    await executeQuery(`
        CREATE TABLE IF NOT EXISTS Species (
            SpeciesID INTEGER PRIMARY KEY AUTOINCREMENT,
            SpeciesName TEXT NOT NULL UNIQUE
        );
    `);
    console.log('Species table ensured.');

    await executeQuery(`
        CREATE TABLE IF NOT EXISTS Botanical (
            BotanicalID INTEGER PRIMARY KEY AUTOINCREMENT,
            BotanicalName TEXT NOT NULL UNIQUE,
            GenusID INTEGER NOT NULL,
            SpeciesID INTEGER NOT NULL,
            FOREIGN KEY (GenusID) REFERENCES Genus (GenusID),
            FOREIGN KEY (SpeciesID) REFERENCES Species (SpeciesID)
        );
    `);
    console.log('Botanical table ensured.');

    // Add foreign key columns to BenchTags if not already present
    await executeQuery(`
        ALTER TABLE BenchTags ADD COLUMN GenusID INTEGER REFERENCES Genus(GenusID);
    `).catch(() => console.log('GenusID column already exists in BenchTags.'));

    await executeQuery(`
        ALTER TABLE BenchTags ADD COLUMN SpeciesID INTEGER REFERENCES Species(SpeciesID);
    `).catch(() => console.log('SpeciesID column already exists in BenchTags.'));

    await executeQuery(`
        ALTER TABLE BenchTags ADD COLUMN BotanicalID INTEGER REFERENCES Botanical(BotanicalID);
    `).catch(() => console.log('BotanicalID column already exists in BenchTags.'));

    console.log('All required tables and columns are ensured.');
};

// Function to validate and log inconsistent data
const validateData = async () => {
    console.log('Validating data...');

    // Find rows with missing or inconsistent Genus values
    const invalidGenusQuery = `
        SELECT DISTINCT Genus
        FROM BenchTags
        WHERE Genus IS NULL OR Genus NOT IN (SELECT GenusName FROM Genus);
    `;
    db.all(invalidGenusQuery, [], (err, rows) => {
        if (err) {
            console.error('Error validating Genus:', err.message);
        } else if (rows.length > 0) {
            console.log('Invalid or missing Genus values:', rows);
        } else {
            console.log('No issues found in Genus values.');
        }
    });

    // Find rows with missing or inconsistent Species values
    const invalidSpeciesQuery = `
        SELECT DISTINCT Species
        FROM BenchTags
        WHERE Species IS NULL OR Species NOT IN (SELECT SpeciesName FROM Species);
    `;
    db.all(invalidSpeciesQuery, [], (err, rows) => {
        if (err) {
            console.error('Error validating Species:', err.message);
        } else if (rows.length > 0) {
            console.log('Invalid or missing Species values:', rows);
        } else {
            console.log('No issues found in Species values.');
        }
    });
};

const normalizeData = async () => {
    try {
        await ensureTablesExist();

        // Ensure foreign key constraints are enforced
        await executeQuery('PRAGMA foreign_keys = ON;');

        // Populate Genus table
        await executeQuery(`
            INSERT INTO Genus (GenusName)
            SELECT DISTINCT Genus
            FROM BenchTags
            WHERE Genus IS NOT NULL AND Genus != '';
        `);
        console.log('Genus table populated.');

        // Populate Species table
        await executeQuery(`
            INSERT INTO Species (SpeciesName)
            SELECT DISTINCT Species
            FROM BenchTags
            WHERE Species IS NOT NULL AND Species != '';
        `);
        console.log('Species table populated.');

        // Populate Botanical table
        await executeQuery(`
            INSERT INTO Botanical (BotanicalName, GenusID, SpeciesID)
            SELECT DISTINCT bt.BotanicalName,
                   g.GenusID,
                   s.SpeciesID
            FROM BenchTags bt
            LEFT JOIN Genus g ON bt.Genus = g.GenusName
            LEFT JOIN Species s ON bt.Species = s.SpeciesName
            WHERE bt.BotanicalName IS NOT NULL AND bt.BotanicalName != '';
        `);
        console.log('Botanical table populated.');

        // Update BenchTags with foreign keys
        await executeQuery(`
            UPDATE BenchTags
            SET GenusID = (
                SELECT g.GenusID
                FROM Genus g
                WHERE BenchTags.Genus = g.GenusName
            );
        `);
        console.log('BenchTags updated with GenusID.');

        await executeQuery(`
            UPDATE BenchTags
            SET SpeciesID = (
                SELECT s.SpeciesID
                FROM Species s
                WHERE BenchTags.Species = s.SpeciesName
            );
        `);
        console.log('BenchTags updated with SpeciesID.');

        await executeQuery(`
            UPDATE BenchTags
            SET BotanicalID = (
                SELECT b.BotanicalID
                FROM Botanical b
                WHERE BenchTags.BotanicalName = b.BotanicalName
            );
        `);
        console.log('BenchTags updated with BotanicalID.');

        // Clean up any NULL values in the foreign keys
        await executeQuery(`
            UPDATE BenchTags
            SET GenusID = NULL
            WHERE GenusID IS NOT NULL AND GenusID NOT IN (SELECT GenusID FROM Genus);
        `);
        await executeQuery(`
            UPDATE BenchTags
            SET SpeciesID = NULL
            WHERE SpeciesID IS NOT NULL AND SpeciesID NOT IN (SELECT SpeciesID FROM Species);
        `);
        await executeQuery(`
            UPDATE BenchTags
            SET BotanicalID = NULL
            WHERE BotanicalID IS NOT NULL AND BotanicalID NOT IN (SELECT BotanicalID FROM Botanical);
        `);
        console.log('Foreign key cleanup complete.');

        // Validate data for potential issues
        await validateData();

        console.log('Normalization process completed successfully.');
    } catch (err) {
        console.error('Error during normalization:', err.message);
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

// Run the normalization process
normalizeData();
