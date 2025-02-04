import { NextResponse } from 'next/server';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

const openDb = async () => {
  return open({
    filename: './app/database/database.sqlite',
    driver: sqlite3.Database
  });
};

export async function GET(request: Request) {
  const db = await openDb();
  const url = new URL(request.url);
  const filters = {
    search: url.searchParams.get('search'),
    sunExposure: url.searchParams.getAll('sunExposure[]'),
    departments: url.searchParams.getAll('departments[]'),
    foliageType: url.searchParams.getAll('foliageType[]'),
    botanicalNames: url.searchParams.getAll('botanicalNames[]'),
    winterizing: url.searchParams.getAll('winterizing[]'),
    carNative: url.searchParams.getAll('carNative[]'),
    sizeRange: url.searchParams.getAll('sizeRange[]'),
    deerResistance: url.searchParams.getAll('deerResistance[]'),
    classification: url.searchParams.getAll('classification[]')
  };

  let query = 'SELECT * FROM PlantCatalog WHERE 1=1';
  const params: any[] = [];

  if (filters.search) {
    query += ' AND (tag_name LIKE ? OR botanical LIKE ?)';
    params.push(`%${filters.search}%`, `%${filters.search}%`);
  }
  if (filters.sunExposure.length > 0) {
    query += ' AND (' + filters.sunExposure.map(() => 'sun_exposure = ?').join(' OR ') + ')';
    params.push(...filters.sunExposure);
  }
  if (filters.departments.length > 0) {
    query += ' AND (' + filters.departments.map(() => 'department = ?').join(' OR ') + ')';
    params.push(...filters.departments);
  }
  if (filters.foliageType.length > 0) {
    query += ' AND (' + filters.foliageType.map(() => 'foliage_type = ?').join(' OR ') + ')';
    params.push(...filters.foliageType);
  }
  if (filters.botanicalNames.length > 0) {
    query += ' AND (' + filters.botanicalNames.map(() => 'botanical = ?').join(' OR ') + ')';
    params.push(...filters.botanicalNames);
  }
  if (filters.winterizing.length > 0) {
    query += ' AND (' + filters.winterizing.map(() => 'winterizing = ?').join(' OR ') + ')';
    params.push(...filters.winterizing);
  }
  if (filters.carNative.length > 0) {
    query += ' AND (' + filters.carNative.map(() => 'car_native = ?').join(' OR ') + ')';
    params.push(...filters.carNative);
  }
  if (filters.sizeRange.length > 0) {
    query += ' AND (' + filters.sizeRange.map(() => 'size LIKE ?').join(' OR ') + ')';
    params.push(...filters.sizeRange.map(size => `%${size}%`));
  }
  if (filters.deerResistance.length > 0) {
    query += ' AND (' + filters.deerResistance.map(() => 'deer_resistance = ?').join(' OR ') + ')';
    params.push(...filters.deerResistance);
  }
  if (filters.classification.length > 0) {
    query += ' AND (' + filters.classification.map(() => 'classification = ?').join(' OR ') + ')';
    params.push(...filters.classification);
  }

  try {
    const plants = await db.all(query, params);
    return NextResponse.json(plants);
  } catch (error) {
    console.error('Error fetching plants:', error);
    return NextResponse.json({ error: 'Failed to fetch plants' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const db = await openDb();
  const body = await request.json();
  const { want_list_entry_id, name, size, quantity, status, plant_catalog_id, requested_at, fulfilled_at } = body;
  try {
    const result = await db.run(
      'INSERT INTO plants (want_list_entry_id, name, size, quantity, status, plant_catalog_id, requested_at, fulfilled_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [want_list_entry_id, name, size, quantity, status, plant_catalog_id, requested_at, fulfilled_at]
    );
    const newPlant = await db.get('SELECT * FROM plants WHERE id = ?', [result.lastID]);
    return NextResponse.json(newPlant, { status: 201 });
  } catch (error: any) {
    if (error.code === 'SQLITE_CONSTRAINT_FOREIGNKEY') {
      return NextResponse.json({ error: 'Foreign key constraint failed' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to add plant' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  const db = await openDb();
  const body = await request.json();
  const { id, want_list_entry_id, name, size, quantity, status, plant_catalog_id, requested_at, fulfilled_at } = body;
  try {
    await db.run(
      'UPDATE plants SET want_list_entry_id = ?, name = ?, size = ?, quantity = ?, status = ?, plant_catalog_id = ?, requested_at = ?, fulfilled_at = ? WHERE id = ?',
      [want_list_entry_id, name, size, quantity, status, plant_catalog_id, requested_at, fulfilled_at, id]
    );
    const updatedPlant = await db.get('SELECT * FROM plants WHERE id = ?', [id]);
    return NextResponse.json(updatedPlant);
  } catch (error: any) {
    if (error.code === 'SQLITE_CONSTRAINT_FOREIGNKEY') {
      return NextResponse.json({ error: 'Foreign key constraint failed' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to update plant' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const db = await openDb();
  const body = await request.json();
  const { id } = body;
  try {
    await db.run('DELETE FROM plants WHERE id = ?', [id]);
    return NextResponse.json({ message: 'Plant deleted successfully' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete plant' }, { status: 500 });
  }
}
