const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');
const axios = require('axios');

async function alterDatabase() {
    const dbPath = path.resolve(__dirname, './converted_database.sqlite');

    // Connect to the database
    const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READWRITE, (err) => {
        if (err) {
            console.error('Error connecting to database:', err.message);
            return;
        }
        console.log('Connected to the database.');
    });

    db.serialize(() => {
        // Add a new column for storing image blobs
        db.run('ALTER TABLE BenchTags ADD COLUMN ImageBlob BLOB', (err) => {
            if (err) {
                if (err.message.includes('duplicate column name')) {
                    console.log('Column ImageBlob already exists.');
                } else {
                    console.error('Error adding ImageBlob column:', err.message);
                    return;
                }
            } else {
                console.log('ImageBlob column added successfully.');
            }
        });

        // Create a temporary table with the updated schema
        db.run(`
            CREATE TABLE BenchTags_temp (
                ID TEXT,
                TagName TEXT,
                Botanical TEXT,
                Department TEXT,
                NoWarranty TEXT,
                DeerResistance TEXT,
                Native TEXT,
                Sun TEXT,
                PartSun TEXT,
                Shade TEXT,
                GrowthRate TEXT,
                MatureSize TEXT,
                Winterizing TEXT,
                SpecialCareAttributes TEXT,
                Image TEXT,
                ImageBlob BLOB,
                Price TEXT,
                Size TEXT,
                PotSize TEXT,
                PotSizeUnit TEXT,
                PotDepth TEXT,
                PotShape TEXT,
                PotType TEXT,
                PotCustomText TEXT,
                Print TEXT
            )
        `, (err) => {
            if (err) {
                console.error('Error creating temporary table:', err.message);
                return;
            }
            console.log('Temporary table created successfully.');

            // Copy data from the original table to the temporary table
            db.all('SELECT * FROM BenchTags', async (err, rows) => {
                if (err) {
                    console.error('Error selecting data from original table:', err.message);
                    return;
                }

                for (const row of rows) {
                    let imageBlob = null;

                    // Check if the image is a URL
                    if (row.Image && row.Image.startsWith('http')) {
                        try {
                            // Fetch the image from the URL
                            const response = await axios.get(row.Image, { responseType: 'arraybuffer' });
                            imageBlob = Buffer.from(response.data, 'binary');
                        } catch (error) {
                            console.error(`Error fetching image from URL for ${row.TagName}:`, error);
                        }
                    } else if (row.Image && fs.existsSync(path.join(__dirname, '..', row.Image))) {
                        // Read the image file as binary data
                        imageBlob = fs.readFileSync(path.join(__dirname, '..', row.Image));
                    }

                    // Insert data into the temporary table
                    db.run(`
                        INSERT INTO BenchTags_temp (
                            ID, TagName, Botanical, Department, NoWarranty, DeerResistance, Native, Sun, PartSun, Shade, GrowthRate, MatureSize, Winterizing, SpecialCareAttributes, Image, ImageBlob, Price, Size, PotSize, PotSizeUnit, PotDepth, PotShape, PotType, PotCustomText, Print
                        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    `, [
                        row.ID, row.TagName, row.Botanical, row.Department, row.NoWarranty, row.DeerResistance, row.Native, row.Sun, row.PartSun, row.Shade, row.GrowthRate, row.MatureSize, row.Winterizing, row.SpecialCareAttributes, row.Image, imageBlob, row.Price, row.Size, row.PotSize, row.PotSizeUnit, row.PotDepth, row.PotShape, row.PotType, row.PotCustomText, row.Print
                    ], (err) => {
                        if (err) {
                            console.error('Error inserting data into temporary table:', err.message);
                        }
                    });
                }

                // Drop the original table
                db.run('DROP TABLE BenchTags', (err) => {
                    if (err) {
                        console.error('Error dropping original table:', err.message);
                        return;
                    }
                    console.log('Original table dropped successfully.');

                    // Rename the temporary table to the original table name
                    db.run('ALTER TABLE BenchTags_temp RENAME TO BenchTags', (err) => {
                        if (err) {
                            console.error('Error renaming temporary table:', err.message);
                            return;
                        }
                        console.log('Temporary table renamed to original table name.');
                    });
                });
            });
        });
    });

    db.close((err) => {
        if (err) {
            console.error('Error closing database:', err.message);
        } else {
            console.log('Database alteration completed successfully.');
        }
    });
}

alterDatabase();