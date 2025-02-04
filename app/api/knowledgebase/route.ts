import { NextResponse } from 'next/server';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import { parseSizeString, getSizeCategory } from '../../utils/sizeParser';

const openDb = async () => {
  return open({
    filename: './app/database/database.sqlite',
    driver: sqlite3.Database
  });
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const db = await openDb();

  try {
    let query = `
      SELECT * FROM PlantCatalog 
      WHERE 1=1
    `;
    const params: any[] = [];

    // Basic search
    if (searchParams.has('search')) {
      const searchTerm = searchParams.get('search');
      query += ` AND (tag_name LIKE ? OR botanical LIKE ? OR classification LIKE ?)`;
      params.push(`%${searchTerm}%`, `%${searchTerm}%`, `%${searchTerm}%`);
    }

    // Sun exposure
    const sunExposure = searchParams.getAll('sunExposure[]');
    if (sunExposure.length > 0) {
      const sunConditions = sunExposure.map(type => {
        switch(type) {
          case 'MeltingSun': return 'melting_sun = 1';
          case 'Full': return 'full_sun = 1';
          case 'Partial': return 'part_sun = 1';
          case 'Shade': return 'shade = 1';
          default: return null;
        }
      }).filter(Boolean);
      
      if (sunConditions.length > 0) {
        query += ` AND (${sunConditions.join(' OR ')})`;
      }
    }

    // Size filters
    const sizeRanges = {
      small: searchParams.get('sizeRanges.small') === 'true',
      medium: searchParams.get('sizeRanges.medium') === 'true',
      large: searchParams.get('sizeRanges.large') === 'true',
      xlarge: searchParams.get('sizeRanges.xlarge') === 'true'
    };

    if (Object.values(sizeRanges).some(Boolean)) {
      query += ` AND (
        CASE 
          WHEN mature_size LIKE '%"%' THEN CAST(SUBSTR(mature_size, 1, INSTR(mature_size, '"')-1) AS INTEGER) <= 36
          WHEN mature_size LIKE '%\'%' THEN CAST(SUBSTR(mature_size, 1, INSTR(mature_size, '\'')-1) AS INTEGER) * 12 <= 432
          ELSE 1=1
        END
      )`;
    }

    // Classification filter
    const classifications = searchParams.getAll('classification[]');
    if (classifications.length) {
      query += ` AND classification IN (${classifications.map(() => '?').join(',')})`;
      params.push(...classifications);
    }

    // Deer resistance filter
    const deerResistance = searchParams.getAll('deerResistance[]');
    if (deerResistance.length) {
      query += ` AND deer_resistance IN (${deerResistance.map(() => '?').join(',')})`;
      params.push(...deerResistance);
    }

    // Winterizing
    const winterizing = searchParams.getAll('winterizing[]');
    if (winterizing.length > 0) {
      query += ` AND winterizing IN (${winterizing.map(() => '?').join(',')})`;
      params.push(...winterizing);
    }

    // Carolina native
    const carNative = searchParams.getAll('carNative[]');
    if (carNative.length > 0) {
      query += ` AND car_native = ?`;
      params.push(carNative.includes('1') ? 1 : 0);
    }

    // Add sorting
    const sort = searchParams.get('sort') || 'tag_name';
    const validSortFields = ['tag_name', 'botanical', 'classification', 'deer_resistance', 'size_category'];
    const safeSort = validSortFields.includes(sort) ? sort : 'tag_name';
    query += ` ORDER BY ${safeSort} ASC`;

    // Add pagination
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = (page - 1) * limit;
    query += ` LIMIT ? OFFSET ?`;
    params.push(limit, offset);

    console.log('Executing query:', query);
    console.log('With params:', params);

    const plants = await db.all(query, params);
    
    // Get total count for pagination
    const countQuery = query.replace(/SELECT \*[\s\S]*?FROM PlantCatalog/, 'SELECT COUNT(*) as total FROM PlantCatalog');
    const countResult = await db.get(countQuery, params);
    
    return NextResponse.json({
      data: plants,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(countResult.total / limit),
        totalItems: countResult.total,
        itemsPerPage: limit
      }
    });

  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Failed to fetch plants' }, { status: 500 });
  } finally {
    await db.close();
  }
}
