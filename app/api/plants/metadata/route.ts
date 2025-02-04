import { NextResponse } from 'next/server';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

const openDb = async () => {
  return open({
    filename: './app/database/database.sqlite',
    driver: sqlite3.Database
  });
};

export async function GET() {
  const db = await openDb();
  
  try {
    // Get unique classifications
    const classifications = await db.all(`
      SELECT DISTINCT classification 
      FROM PlantCatalog 
      WHERE classification IS NOT NULL 
      ORDER BY classification
    `);

    // Get unique deer resistance values
    const deerResistance = await db.all(`
      SELECT DISTINCT deer_resistance 
      FROM PlantCatalog 
      WHERE deer_resistance IS NOT NULL 
      ORDER BY deer_resistance
    `);

    // Analyze size patterns
    const sizeRanges = await db.all(`
      SELECT 
        DISTINCT 
        CASE 
          WHEN LOWER(size) LIKE '%gal%' THEN 'Gallon'
          WHEN LOWER(size) LIKE '%qt%' THEN 'Quart'
          WHEN LOWER(size) LIKE '%flat%' THEN 'Flat'
          WHEN LOWER(size) LIKE '%inch%' OR size LIKE '%"%' THEN 'Inch'
          ELSE 'Other'
        END as size_category,
        size as original_size
      FROM PlantCatalog 
      WHERE size IS NOT NULL 
      ORDER BY size_category
    `);

    // Group sizes into categories
    const sizeCategories = {
      Gallon: [] as string[],
      Quart: [] as string[],
      Flat: [] as string[],
      Inch: [] as string[],
      Other: [] as string[]
    };

    sizeRanges.forEach((item: any) => {
      if (sizeCategories[item.size_category as keyof typeof sizeCategories]) {
        sizeCategories[item.size_category as keyof typeof sizeCategories].push(item.original_size);
      }
    });

    return NextResponse.json({
      classifications: classifications.map(c => c.classification),
      deerResistance: deerResistance.map(d => d.deer_resistance),
      sizeCategories
    });
  } catch (error) {
    console.error('Error fetching metadata:', error);
    return NextResponse.json({ error: 'Failed to fetch metadata' }, { status: 500 });
  }
}
