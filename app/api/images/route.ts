import { NextResponse } from 'next/server';
import { writeFile, readFile } from 'fs/promises';
import { join } from 'path';
import { openDb, UPLOADS_DIR, getImagePath } from '@/app/lib/db';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const path = searchParams.get('path');
    
    if (!path) {
        console.error('No image path provided');
        return NextResponse.json({ error: 'No image path provided' }, { status: 400 });
    }

    try {
        // Get the actual filesystem path
        const fullPath = getImagePath(path);
        console.log('Reading image from:', fullPath);
        
        const imageBuffer = await readFile(fullPath);
        const contentType = path.toLowerCase().endsWith('.png') ? 'image/png' : 'image/jpeg';
        
        return new NextResponse(imageBuffer, {
            headers: {
                'Content-Type': contentType,
                'Cache-Control': 'public, max-age=31536000, immutable',
            },
        });
    } catch (error) {
        console.error('Image fetch error:', error);
        console.error('Attempted path:', path);
        return NextResponse.json({ error: 'Image not found' }, { status: 404 });
    }
}

export async function POST(request: Request) {
    try {
        const data = await request.formData();
        const file = data.get('image') as File;
        const plantId = data.get('plantId') as string;
        const caption = data.get('caption') as string;

        if (!file || !plantId) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const filename = `plant_${plantId}_${Date.now()}.jpg`;
        const filePath = join(UPLOADS_DIR, filename);

        // Save file
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        await writeFile(filePath, buffer);

        // Save to database
        const db = await openDb();
        try {
            const result = await db.run(
                'INSERT INTO CatalogImages (plantcatalog_id, image_path, caption) VALUES (?, ?, ?)',
                [plantId, filename, caption]
            );
            
            return NextResponse.json({ 
                success: true, 
                image: { 
                    id: result.lastID,
                    image_path: filename,
                    caption 
                } 
            });
        } finally {
            await db.close();
        }
    } catch (error) {
        console.error('Upload error:', error);
        return NextResponse.json({ error: 'Failed to upload image' }, { status: 500 });
    }
}
