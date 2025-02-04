import { NextResponse } from 'next/server';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

const openDb = async () => {
  return open({
    filename: './app/database/database.sqlite',
    driver: sqlite3.Database
  });
};

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const db = await openDb();
  const { id } = params;
  try {
    const plant = await db.get('SELECT * FROM PlantCatalog WHERE id = ?', [id]);
    if (!plant) {
      return NextResponse.json({ error: 'Plant not found' }, { status: 404 });
    }
    return NextResponse.json(plant);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch plant' }, { status: 500 });
  }
}
