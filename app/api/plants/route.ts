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
    const plants = await db.all('SELECT * FROM PlantCatalog');
    return NextResponse.json(plants);
  } catch (error) {
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
