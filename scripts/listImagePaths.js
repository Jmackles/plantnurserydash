import { open } from 'sqlite';
import sqlite3 from 'sqlite3';
import path from 'path';

async function listImagePaths() {
    try {
        const db = await open({
            filename: path.join(process.cwd(), 'app/database/database.sqlite'),
            driver: sqlite3.Database
        });

        const images = await db.all(`
            SELECT TagName, Image
            FROM [BenchTag Images]
            WHERE Image IS NOT NULL
        `);

        await db.close();

        if (images.length === 0) {
            console.log('No images found.');
            return;
        }

        images.forEach(image => {
            console.log(`TagName: ${image.TagName}, Image: ${image.Image ? 'Valid' : 'Invalid'}`);
        });
    } catch (error) {
        console.error('Error querying database:', error);
    }
}

listImagePaths();
