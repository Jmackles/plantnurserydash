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
  const { searchParams } = new URL(request.url);
  const customerId = searchParams.get('customer_id');
  
  try {
    let query = `
      SELECT w.*, c.first_name, c.last_name
      FROM want_list w
      LEFT JOIN customers c ON w.customer_id = c.id
      ${customerId ? 'WHERE w.customer_id = ?' : ''}
      ORDER BY w.created_at_text DESC
    `;

    const entries = await db.all(query, customerId ? [customerId] : []);
    
    // Fetch plants for each want list
    const enrichedEntries = await Promise.all(entries.map(async (entry) => {
      const plants = await db.all(
        'SELECT * FROM plants WHERE want_list_entry_id = ?',
        [entry.id]
      );
      return { ...entry, plants };
    }));

    return NextResponse.json(enrichedEntries);
  } catch (error) {
    console.error('Error fetching want lists:', error);
    return NextResponse.json({ error: 'Failed to fetch want lists' }, { status: 500 });
  } finally {
    await db.close();
  }
}

export async function POST(request: Request) {
    const db = await openDb();
    try {
        await db.run('BEGIN TRANSACTION');
        const body = await request.json();
        console.log('Creating want list with:', body);

        // Insert want list
        const result = await db.run(
            `INSERT INTO want_list (
                customer_id, initial, general_notes, status, 
                created_at_text
            ) VALUES (?, ?, ?, ?, datetime('now'))`,
            [body.customer_id, body.initial, body.general_notes, 'pending']
        );

        const wantListId = result.lastID;

        // Insert plants
        if (body.plants && Array.isArray(body.plants)) {
            for (const plant of body.plants) {
                await db.run(
                    `INSERT INTO plants (
                        want_list_entry_id, name, size, quantity, 
                        status, requested_at
                    ) VALUES (?, ?, ?, ?, ?, datetime('now'))`,
                    [wantListId, plant.name, plant.size, plant.quantity, 'pending']
                );
            }
        }

        await db.run('COMMIT');

        // Fetch the complete want list with plants
        const newWantList = await db.get('SELECT * FROM want_list WHERE id = ?', [wantListId]);
        const plants = await db.all('SELECT * FROM plants WHERE want_list_entry_id = ?', [wantListId]);

        console.log('Created want list:', { ...newWantList, plants });
        return NextResponse.json({ ...newWantList, plants });
    } catch (error) {
        await db.run('ROLLBACK');
        console.error('Error creating want list:', error);
        return NextResponse.json({ error: 'Failed to create want list' }, { status: 500 });
    } finally {
        await db.close();
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
  } finally {
    await db.close();
  }
}
