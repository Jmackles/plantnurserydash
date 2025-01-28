import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { writeFile } from 'fs/promises';

async function getBotanicals() {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);
    
    const dbPath = join(__dirname, '..', 'database', 'database.sqlite');
    
    const db = await open({
        filename: dbPath,
        driver: sqlite3.Database
    });

    const botanicals = await db.all(`
        SELECT TagName, Botanical 
        FROM "BenchTags" 
        WHERE Botanical IS NOT NULL 
        ORDER BY Botanical
    `);

    // Transform the data into a more structured format
    const botanicalData = botanicals.map((plant, index) => ({
        id: index + 1,
        botanical: plant.Botanical,
        common: plant.TagName || null
    }));

    // Save to JSON file
    const outputPath = join(__dirname, '..', 'database', 'botanicals.json');
    await writeFile(outputPath, JSON.stringify(botanicalData, null, 2));
    
    console.log(`Botanical names have been saved to botanicals.json`);
    console.log(`Total entries: ${botanicalData.length}`);

    await db.close();
}

getBotanicals().catch(err => {
    console.error('Error retrieving botanicals:', err);
    process.exit(1);
});
