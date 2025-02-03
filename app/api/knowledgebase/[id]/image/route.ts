import { NextRequest, NextResponse } from 'next/server';
import { open, Database } from 'sqlite';
import sqlite3 from 'sqlite3';
import path from 'path';
import sharp from 'sharp';

let db: Database | null = null;

async function getDbConnection() {
  if (!db) {
    db = await open({
      filename: path.join(process.cwd(), 'app/database/database.sqlite'),
      driver: sqlite3.Database,
    });
  }
  return db;
}

export async function POST(req: NextRequest, context: { params: { id: string } }) {
  try {
    const { id } = await context.params;
    if (!id) {
      return NextResponse.json({ error: 'No ID provided' }, { status: 400 });
    }

    const formData = await req.formData();
    const file = formData.get('image') as Blob;

    if (!file) {
      return NextResponse.json({ error: 'No image provided' }, { status: 400 });
    }

    console.log('File type:', file.type);  // Log the file type
    console.log('File size:', file.size);  // Log the file size

    // Convert the incoming file to a Buffer
    const arrayBuffer = await file.arrayBuffer();
    let imageBuffer = Buffer.from(arrayBuffer);

    // If BMP, convert to PNG, otherwise process normally
    if (file.type === 'image/bmp') {
      console.log('Processing BMP image...');
      imageBuffer = await sharp(imageBuffer)
        .toFormat('png')  // Convert BMP to PNG
        .toBuffer();
      console.log('BMP image converted to PNG');
    }

    // Process the image (resize, rotate, etc.)
    const processedImageBuffer = await sharp(imageBuffer)
      .rotate()
      .resize(800, 600, {
        fit: 'inside',
        withoutEnlargement: true,
        fastShrinkOnLoad: true,
      })
      .toFormat('png', { quality: 80 })
      .toBuffer();

    // Store the processed (PNG) image buffer in the database
    const db = await getDbConnection();
    await db.run(
      `UPDATE BenchTags SET Image = ? WHERE ID = ?`,
      processedImageBuffer,
      id
    );

    const imageUrl = `data:image/png;base64,${processedImageBuffer.toString('base64')}`;
    return NextResponse.json({ imageUrl });

  } catch (error) {
    console.error('Error uploading image:', error);
    return NextResponse.json({ error: 'Failed to upload image' }, { status: 500 });
  }
}
