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
  
  try {
    // Get sorted entries using consistent sorting logic
    const entries = await db.all(`
      SELECT w.*, 
        CASE w.status
          WHEN 'pending' THEN 0
          WHEN 'completed' THEN 1
          WHEN 'canceled' THEN 2
          ELSE 3
        END as sort_order
      FROM want_list w
      ORDER BY sort_order ASC, created_at_text DESC
    `);

    // Get plants for all entries
    const enrichedEntries = await Promise.all(
      entries.map(async (entry) => {
        const plants = await db.all(
          'SELECT * FROM plants WHERE want_list_entry_id = ?', 
          [entry.id]
        );
        return { ...entry, plants };
      })
    );

    return NextResponse.json({ entries: enrichedEntries });

  } catch (error) {
    console.error('Error fetching entries:', error);
    return NextResponse.json(
      { error: 'Failed to fetch entries' }, 
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const db = await openDb()
  const body = await request.json()
  const { customer_id, initial, notes, status, spoken_to, created_at_text, closed_by, plants } = body
  
  try {
    // Begin transaction
    await db.run('BEGIN TRANSACTION');

    // 1. Create want list entry
    const wantListResult = await db.run(
      'INSERT INTO want_list (customer_id, initial, notes, status, spoken_to, created_at_text, closed_by) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [customer_id, initial, notes, status || 'pending', spoken_to, created_at_text, closed_by]
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
  if (!body) {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }
  
  try {
    console.log('Starting update with body:', body);
    await db.run('BEGIN TRANSACTION');

    // Update want list entry with new status field
    const { id, customer_id, initial, notes, status, spoken_to, created_at_text, closed_by, plants } = body;
    
    const updateResult = await db.run(
      `UPDATE want_list 
       SET customer_id = ?, 
           initial = ?, 
           notes = ?, 
           status = ?, 
           spoken_to = ?, 
           created_at_text = ?, 
           closed_by = ? 
       WHERE id = ?`,
      [
        customer_id,
        initial,
        notes,
        status || 'pending',
        spoken_to,
        created_at_text,
        closed_by,
        id
      ]
    );

    console.log('Update result:', updateResult);

    // Handle plants updates
    if (plants && plants.length > 0) {
      for (const plant of plants) {
        if (plant.id) {
          await db.run(
            `UPDATE plants 
             SET name = ?, 
                 size = ?, 
                 quantity = ?, 
                 status = ?, 
                 plant_catalog_id = ? 
             WHERE id = ? AND want_list_entry_id = ?`,
            [
              plant.name,
              plant.size,
              plant.quantity,
              plant.status || 'pending',
              plant.plant_catalog_id,
              plant.id,
              id
            ]
          );
        } else {
          await db.run(
            `INSERT INTO plants (
               want_list_entry_id, 
               name, 
               size, 
               quantity, 
               status, 
               plant_catalog_id, 
               requested_at
             ) VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
            [
              id,
              plant.name,
              plant.size,
              plant.quantity,
              'pending',
              plant.plant_catalog_id || null
            ]
          );
        }
      }
    }

    await db.run('COMMIT');

    const updatedEntry = await db.get('SELECT * FROM want_list WHERE id = ?', [id]);
    const updatedPlants = await db.all('SELECT * FROM plants WHERE want_list_entry_id = ?', [id]);

    return NextResponse.json({ ...updatedEntry, plants: updatedPlants });
  } catch (error: any) {
    await db.run('ROLLBACK');
    console.error('Update error:', error);
    return NextResponse.json({ 
      error: 'Failed to update want list entry', 
      details: error.message 
    }, { status: 500 });
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
