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

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        const { id } = params;
        const db = await getDbConnection();

        const formData = await req.formData();
        const imageFile = formData.get('image') as File;

        if (!imageFile) {
            return NextResponse.json({ error: 'No image file provided' }, { status: 400 });
        }

        const buffer = await imageFile.arrayBuffer();
        const imageData = Buffer.from(buffer);

        // Process the image
        let processedImageBuffer;
        try {
            processedImageBuffer = await sharp(imageData)
                .rotate() // Auto-rotate based on EXIF
                .resize(800, 600, {
                    fit: 'inside',
                    withoutEnlargement: true,
                    fastShrinkOnLoad: true
                })
                .toFormat('jpeg', {
                    quality: 80,
                    mozjpeg: true
                })
                .toBuffer();

        } catch (error) {
            console.error('Error processing image:', error);
            return NextResponse.json(
                { error: 'Failed to process image. Please ensure it is a valid image file.' },
                { status: 400 }
            );
        }

        await db.run(`
            UPDATE BenchTags
            SET Image = ?
            WHERE ID = ?
        `, processedImageBuffer, id);

        const imageUrl = `data:image/jpeg;base64,${processedImageBuffer.toString('base64')}`;

        return NextResponse.json({ imageUrl });
    } catch (error: unknown) {
        console.error('Error uploading image:', error);
        return NextResponse.json({ error: 'Failed to upload image' }, { status: 500 });
    }
}
