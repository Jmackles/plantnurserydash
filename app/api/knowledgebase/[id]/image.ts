import { NextRequest, NextResponse } from 'next/server';
import { open, Database } from 'sqlite';
import sqlite3 from 'sqlite3';
import path from 'path';
import formidable from 'formidable';
import fs from 'fs';
import * as http from 'http';

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

export async function POST(req: NextRequest) {
    const db = await getDbConnection();
    const form = new formidable.IncomingForm();

    return new Promise((resolve, reject) => {
        form.parse(req as unknown as http.IncomingMessage, async (err, fields, files) => {
            if (err) {
                reject(NextResponse.json({ error: 'Failed to parse form data' }, { status: 500 }));
                return;
            }

            const plantId = fields.plantId;
            const imageFiles = files.images;

            if (!plantId || !imageFiles) {
                reject(NextResponse.json({ error: 'Missing plant ID or images' }, { status: 400 }));
                return;
            }

            try {
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

                const imagePaths = [];
                if (Array.isArray(imageFiles)) {
                    for (const file of imageFiles) {
                        const newPath = path.join(process.cwd(), 'public/uploads', file.newFilename);
                        fs.renameSync(file.filepath, newPath);
                        imagePaths.push(`/uploads/${file.newFilename}`);
                    }
                } else {
                    const newPath = path.join(process.cwd(), 'public/uploads', imageFiles.newFilename);
                    fs.renameSync(imageFiles.filepath, newPath);
                    imagePaths.push(`/uploads/${imageFiles.newFilename}`);
                }

                // Insert each image path into the PlantImages table
                for (const imagePath of imagePaths) {
                    await db.run(
                        `INSERT INTO PlantImages (plantId, imagePath, imageOrder) VALUES (?, ?, ?)`,
                        [plantId, imagePath, 0]
                    );
                }

                resolve(NextResponse.json({ success: true, imagePaths }));
            } catch (error) {
                console.error('Error saving images:', error);
                reject(NextResponse.json({ error: 'Failed to save images' }, { status: 500 }));
            }
        });
    });
}
