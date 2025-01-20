const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const { open } = require('sqlite');
const axios = require('axios');

async function updateImages() {
    // Open database with write permissions
    const db = await open({
        filename: path.resolve(__dirname, '../converted_database.sqlite'),
        driver: sqlite3.Database
    });

    try {
        // Verify database connection
        const tableCheck = await db.get("SELECT name FROM sqlite_master WHERE type='table' AND name='BenchTags'");
        if (!tableCheck) {
            throw new Error('BenchTags table not found');
        }

        // Begin transaction
        await db.run('BEGIN TRANSACTION');

        // Read image pairs
        const imagePlantPairs = JSON.parse(fs.readFileSync(path.join(__dirname, '../imagePlantPairs.json'), 'utf8'));

        // Process each pair
        for (const pair of imagePlantPairs) {
            if (!pair.image || !pair.filePath || !pair.plants || !Array.isArray(pair.plants)) continue;

            // Normalize image path for web access
            const webImagePath = path.join('/app/assets', pair.filePath);
            const imagePath = path.join(__dirname, '..', 'assets', pair.filePath);

            // Check if the image file exists
            if (!fs.existsSync(imagePath)) {
                console.warn(`Image file not found: ${imagePath}`);
                continue;
            }

            // Read the image file as binary data
            const imageData = fs.readFileSync(imagePath);

            for (const plantName of pair.plants) {
                // Clean plant name for matching
                const formattedPlantName = plantName.toLowerCase().replace(/[^a-z0-9]/g, '');

                try {
                    // Find matching plant
                    const plant = await db.get(`
                        SELECT * FROM BenchTags 
                        WHERE LOWER(REPLACE(REPLACE(REPLACE(TagName, ' ', ''), '-', ''), '_', '')) = ?
                        OR LOWER(REPLACE(REPLACE(REPLACE(Botanical, ' ', ''), '-', ''), '_', '')) = ?
                    `, [formattedPlantName, formattedPlantName]);

                    if (plant) {
                        // Check if the image is a URL
                        if (plant.Image && plant.Image.startsWith('http')) {
                            try {
                                // Fetch the image from the URL
                                const response = await axios.get(plant.Image, { responseType: 'arraybuffer' });
                                const imageBlob = Buffer.from(response.data, 'binary');

                                // Update image with blob data
                                await db.run(
                                    'UPDATE BenchTags SET Image = ? WHERE ID = ?',
                                    [imageBlob, plant.ID]
                                );

                                // Verify update
                                const verified = await db.get('SELECT Image FROM BenchTags WHERE ID = ?', [plant.ID]);
                                console.log(`Updated ${plant.TagName} - Image path: ${verified.Image}`);
                            } catch (error) {
                                console.error(`Error fetching image from URL for ${plantName}:`, error);
                            }
                        } else {
                            // Update image path with local image data
                            await db.run(
                                'UPDATE BenchTags SET Image = ? WHERE ID = ?',
                                [imageData, plant.ID]
                            );

                            // Verify update
                            const verified = await db.get('SELECT Image FROM BenchTags WHERE ID = ?', [plant.ID]);
                            console.log(`Updated ${plant.TagName} - Image path: ${verified.Image}`);
                        }
                    }
                } catch (error) {
                    console.error(`Error processing ${plantName}:`, error);
                }
            }
        }

        // Commit changes
        await db.run('COMMIT');
        console.log('All updates committed successfully');

    } catch (error) {
        await db.run('ROLLBACK');
        console.error('Transaction failed:', error);
        throw error;
    } finally {
        await db.close();
    }
}

// Run with error handling
updateImages().catch(console.error);