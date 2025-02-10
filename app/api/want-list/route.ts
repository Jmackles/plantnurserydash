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
    const entries = await db.all(`
      SELECT w.*, c.first_name, c.last_name,
        CASE w.status
          WHEN 'pending' THEN 0
          WHEN 'completed' THEN 1
          WHEN 'canceled' THEN 2
        END as sort_order
      FROM want_list w
      LEFT JOIN customers c ON w.customer_id = c.id
      ORDER BY w.created_at_text DESC, sort_order ASC
    `);

    const plants = await db.all(`
      SELECT p.* 
      FROM plants p
      WHERE p.want_list_entry_id IN (${entries.map(e => e.id).join(',')})
    `);

    const enrichedEntries = entries.map(entry => ({
      ...entry,
      plants: plants.filter(p => p.want_list_entry_id === entry.id)
    }));

    return NextResponse.json({ entries: enrichedEntries });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Failed to fetch entries' }, { status: 500 });
  } finally {
    await db.close();
  }
}

export async function POST(request: Request) {
    const db = await openDb();
    
    try {
        const body = await request.json();
        console.log('Received POST body:', body);

        // Validate required fields with more detail
        if (!body.customer_id) {
            console.error('Missing customer_id');
            return NextResponse.json({ 
                error: 'Missing customer_id',
                receivedData: body
            }, { status: 400 });
        }

        if (!body.initial) {
            console.error('Missing initial');
            return NextResponse.json({ 
                error: 'Missing initial',
                receivedData: body
            }, { status: 400 });
        }

        // Verify customer exists
        const customer = await db.get('SELECT id FROM customers WHERE id = ?', [body.customer_id]);
        if (!customer) {
            console.error('Customer not found:', body.customer_id);
            return NextResponse.json({ 
                error: 'Customer not found',
                customer_id: body.customer_id
            }, { status: 404 });
        }

        await db.run('BEGIN TRANSACTION');

        console.log('Inserting want list entry...');
        const wantListResult = await db.run(`
            INSERT INTO want_list (
                customer_id, 
                initial, 
                general_notes, 
                status, 
                created_at_text
            ) VALUES (?, ?, ?, ?, ?)
        `, [
            body.customer_id,
            body.initial,
            body.general_notes || '',
            'pending',
            body.created_at_text || new Date().toISOString()
        ]);

        const wantListId = wantListResult.lastID;
        console.log('Created want list entry with ID:', wantListId);

        // Insert plants
        if (body.plants && Array.isArray(body.plants) && body.plants.length > 0) {
            console.log('Inserting plants:', body.plants);
            for (const plant of body.plants) {
                if (plant.name && plant.quantity > 0) {
                    await db.run(`
                        INSERT INTO plants (
                            want_list_entry_id,
                            name,
                            size,
                            quantity,
                            status,
                            requested_at
                        ) VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
                    `, [
                        wantListId,
                        plant.name,
                        plant.size || '',
                        plant.quantity,
                        'pending'
                    ]);
                }
            }
        }

        // Fetch complete entry
        const newEntry = await db.get('SELECT * FROM want_list WHERE id = ?', [wantListId]);
        const entryPlants = await db.all('SELECT * FROM plants WHERE want_list_entry_id = ?', [wantListId]);

        await db.run('COMMIT');
        console.log('Transaction committed successfully');

        return NextResponse.json({
            ...newEntry,
            plants: entryPlants
        }, { status: 201 });

    } catch (error) {
        await db.run('ROLLBACK');
        console.error('Error creating want list entry:', error);
        return NextResponse.json({ 
            error: 'Failed to create want list entry',
            details: error.message
        }, { status: 500 });
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
