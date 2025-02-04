import { NextResponse } from 'next/server'
import sqlite3 from 'sqlite3'
import { open } from 'sqlite'

const openDb = async () => {
  return open({
    filename: './app/database/database.sqlite',
    driver: sqlite3.Database
  })
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const customerId = searchParams.get('customerId')
  const db = await openDb()
  try {
    // First get want list entries
    const wantListQuery = customerId 
      ? 'SELECT * FROM want_list WHERE customer_id = ?'
      : 'SELECT * FROM want_list';
    const params = customerId ? [customerId] : [];
    const wantListEntries = await db.all(wantListQuery, params);

    // Then get associated plants for each entry
    const enrichedEntries = await Promise.all(
      wantListEntries.map(async (entry) => {
        const plants = await db.all(`
          SELECT p.*, pc.tag_name, pc.botanical
          FROM plants p
          LEFT JOIN PlantCatalog pc ON p.plant_catalog_id = pc.id
          WHERE p.want_list_entry_id = ?
        `, [entry.id]);
        
        return {
          ...entry,
          plants: plants
        };
      })
    );

    return NextResponse.json(enrichedEntries);
  } catch (error) {
    console.error('Error fetching want list entries:', error);
    return NextResponse.json({ error: 'Failed to fetch want list entries' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const db = await openDb()
  const body = await request.json()
  const { customer_id, initial, notes, is_closed, spoken_to, created_at_text, closed_by, plants } = body
  
  try {
    // Begin transaction
    await db.run('BEGIN TRANSACTION');

    // 1. Create want list entry
    const wantListResult = await db.run(
      'INSERT INTO want_list (customer_id, initial, notes, is_closed, spoken_to, created_at_text, closed_by) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [customer_id, initial, notes, is_closed || false, spoken_to, created_at_text, closed_by]
    );
    
    const wantListId = wantListResult.lastID;

    // 2. Add plants with the want_list_entry_id
    if (plants && plants.length > 0) {
      for (const plant of plants) {
        await db.run(
          'INSERT INTO plants (want_list_entry_id, name, size, quantity, status, plant_catalog_id, requested_at) VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)',
          [wantListId, plant.name, plant.size, plant.quantity, 'pending', plant.plant_catalog_id || null]
        );
      }
    }

    // 3. Fetch the complete want list entry with its plants
    const newEntry = await db.get('SELECT * FROM want_list WHERE id = ?', [wantListId]);
    const entryPlants = await db.all('SELECT * FROM plants WHERE want_list_entry_id = ?', [wantListId]);
    
    // Commit transaction
    await db.run('COMMIT');

    // Return the complete entry with its plants
    return NextResponse.json({
      ...newEntry,
      plants: entryPlants
    }, { status: 201 });

  } catch (error: any) {
    // Rollback transaction on error
    await db.run('ROLLBACK');
    
    console.error('Error in want list creation:', error);
    if (error.code === 'SQLITE_CONSTRAINT_FOREIGNKEY') {
      return NextResponse.json({ error: 'Foreign key constraint failed' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to add want list entry' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  const db = await openDb()
  const body = await request.json()
  const { id, customer_id, initial, notes, is_closed, spoken_to, created_at_text, closed_by } = body
  try {
    await db.run(
      'UPDATE want_list SET customer_id = ?, initial = ?, notes = ?, is_closed = ?, spoken_to = ?, created_at_text = ?, closed_by = ? WHERE id = ?',
      [customer_id, initial, notes, is_closed, spoken_to, created_at_text, closed_by, id]
    )
    const updatedEntry = await db.get('SELECT * FROM want_list WHERE id = ?', [id])
    return NextResponse.json(updatedEntry)
  } catch (error: any) {
    if (error.code === 'SQLITE_CONSTRAINT_FOREIGNKEY') {
      return NextResponse.json({ error: 'Foreign key constraint failed' }, { status: 400 })
    }
    return NextResponse.json({ error: 'Failed to update want list entry' }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  const db = await openDb()
  const body = await request.json()
  const { id } = body
  try {
    await db.run('DELETE FROM want_list WHERE id = ?', [id])
    return NextResponse.json({ message: 'Want list entry deleted successfully' })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete want list entry' }, { status: 500 })
  }
}
