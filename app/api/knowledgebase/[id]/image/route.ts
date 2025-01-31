import { NextRequest, NextResponse } from 'next/server';
import { open } from 'sqlite';
import sqlite3 from 'sqlite3';
import path from 'path';
import sharp from 'sharp';

let db: sqlite3.Database | null = null;

async function getDbConnection() {
    if (!db) {
        db = await open({
            filename: path.join(process.cwd(), 'app/database/database.sqlite'),
            driver: sqlite3.Database
        });
    }
    return db;
}

export async function POST(
    req: NextRequest,
    context: { params: { id: string } }
) {
    const id = await context.params.id;

    if (!id) {
        return NextResponse.json({ error: 'No ID provided' }, { status: 400 });
    }

    try {
        const formData = await req.formData();
        const file = formData.get('image') as Blob;

        if (!file) {
            return NextResponse.json({ error: 'No image provided' }, { status: 400 });
        }

        // Convert the file to a Buffer
        const buffer = Buffer.from(await file.arrayBuffer());

        // Process the image with sharp
        const processedImageBuffer = await sharp(buffer)
            .resize(800, 600, {
                fit: 'inside',
                withoutEnlargement: true
            })
            .jpeg({ quality: 80 })
            .toBuffer();

        const db = await getDbConnection();

        // First update BenchTags
        await db.run(
            `UPDATE BenchTags SET Image = ? WHERE ID = ?`,
            processedImageBuffer, id
        );

        // Then handle BenchTag Images update
        const plant = await db.get('SELECT TagName FROM BenchTags WHERE ID = ?', id);
        
        if (plant?.TagName) {
            await db.run(
                `INSERT OR REPLACE INTO [BenchTag Images] (TagName, Image) VALUES (?, ?)`,
                plant.TagName, processedImageBuffer
            );
        }

        // Convert the processed image to base64 for immediate display
        const imageUrl = `data:image/jpeg;base64,${processedImageBuffer.toString('base64')}`;

        return NextResponse.json({ imageUrl });
    } catch (error) {
        console.error('Error processing image:', error);
        return NextResponse.json(
            { error: 'Failed to process image' }, 
            { status: 500 }
        );
    }
}
