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
    // Fetch the want list entry
    const wantList = await db.get('SELECT * FROM want_list WHERE id = ?', [id]);
    if (!wantList) {
      return NextResponse.json({ error: 'Want list entry not found' }, { status: 404 });
    }

    // Fetch associated plants
    const plants = await db.all('SELECT * FROM plants WHERE want_list_entry_id = ?', [id]);
    
    // Return the combined data
    return NextResponse.json({
      ...wantList,
      plants
    });
  } catch (error) {
    console.error('Error fetching want list entry:', error);
    return NextResponse.json({ error: 'Failed to fetch want list entry' }, { status: 500 });
  }
}
