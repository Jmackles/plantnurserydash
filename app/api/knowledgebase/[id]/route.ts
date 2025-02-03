// filepath: /c:/Users/Head-Lee2021/OneDrive/Documents/GitHub/plantnurserydash/app/api/knowledgebase/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { open, Database } from 'sqlite';
import sqlite3 from 'sqlite3';
import path from 'path';

let db: Database | null = null;

async function getDbConnection() {
    if (!db) {
        db = await open({
            filename: path.join(process.cwd(), 'app/database/database.sqlite'),
            driver: sqlite3.Database
        });
    }
    return db;
}

export async function GET(
    req: NextRequest,
    context: { params: { id: string } }
) {
    try {
        const { id } = context.params;

        const db = await getDbConnection();

        // Ensure the PlantImages table exists
        await db.run(`
            CREATE TABLE IF NOT EXISTS PlantImages (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                plantId INTEGER,
                imagePath TEXT,
                imageOrder INTEGER,
                FOREIGN KEY (plantId) REFERENCES BenchTags(ID)
            )
        `);

        const plant = await db.get('SELECT * FROM BenchTags WHERE ID = ?', [id]);
        
        if (!plant) {
            return NextResponse.json(
                { error: 'Plant not found' },
                { status: 404 }
            );
        }

        // Get all images for this plant
        const images = await db.all(
            'SELECT imagePath, imageOrder FROM PlantImages WHERE plantId = ? ORDER BY imageOrder',
            [id]
        );

        // Add images to plant object
        plant.ImageUrls = images.map(img => img.imagePath);

        if (plant.Image) {
            try {
                // Convert binary data to base64
                const buffer = Buffer.from(plant.Image);
                plant.ImageUrl = `data:image/jpeg;base64,${buffer.toString('base64')}`;
            } catch (error) {
                console.error(`Error processing image for plant ${id}:`, error);
                plant.ImageUrl = null;
            }
        } else {
            plant.ImageUrl = null;
        }
        
        // Remove the raw image data from the response
        delete plant.Image;

        return NextResponse.json(plant);
    } catch (error) {
        console.error('Error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch plant details' },
            { status: 500 }
        );
    }
}