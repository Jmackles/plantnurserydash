const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

async function getPlantImage(plantName) {
    const dbPath = path.resolve(__dirname, './converted_database.sqlite');
    const outputImagePath = path.resolve(__dirname, `./output_${plantName.replace(/ /g, '_')}.bmp`);

    const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READONLY, (err) => {
        if (err) {
            console.error('Error opening database:', err.message);
            process.exit(1);
        }
    });

    db.serialize(() => {
        // Query the plant database
        db.get(
            `
            SELECT Image 
            FROM BenchTags 
            WHERE LOWER(TagName) = ? OR LOWER(Botanical) = ?
            `,
            [plantName.toLowerCase(), plantName.toLowerCase()],
            (err, row) => {
                if (err) {
                    console.error('Error querying the database:', err.message);
                } else if (row && row.Image) {
                    if (row.Image.startsWith('assets/bmp')) {
                        // Case 1: Image stored as a file path
                        const imagePath = path.resolve(__dirname, `../${row.Image}`);
                        console.log(`Image file path: ${imagePath}`);
                        if (fs.existsSync(imagePath)) {
                            console.log(`Image for "${plantName}" is located at: ${imagePath}`);
                        } else {
                            console.error(`Image file does not exist: ${imagePath}`);
                        }
                    } else {
                        // Case 2: Image stored as binary (BLOB)
                        console.log(`Writing binary image for "${plantName}" to ${outputImagePath}`);
                        fs.writeFileSync(outputImagePath, row.Image);
                        console.log(`Image written to: ${outputImagePath}`);
                    }
                } else {
                    console.log(`No image found for plant: ${plantName}`);
                }
            }
        );
    });

    db.close((err) => {
        if (err) {
            console.error('Error closing database:', err.message);
        } else {
            console.log('Database connection closed.');
        }
    });
}

// Specify the plant name to query
getPlantImage('Canyon Creek Abelia');
