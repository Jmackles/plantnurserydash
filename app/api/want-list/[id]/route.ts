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

export async function PUT(request: Request, { params }: { params: { id: string } }) {
    const db = await openDb();
    let body;
    
    try {
        body = await request.json();
        console.log('Received PUT request for id:', params.id);
        console.log('Request body:', body);
    } catch (error) {
        console.error('Error parsing request body:', error);
        return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
    }

    if (!body) {
        console.error('Missing request body');
        return NextResponse.json({ error: 'Missing request body' }, { status: 400 });
    }

    const { id } = params;
    const { customer_id, initial, notes, status, spoken_to, created_at_text, closed_by, plants } = body;

    try {
        console.log('Starting transaction for update...');
        await db.run('BEGIN TRANSACTION');

        // 1. Update want list entry
        const updateResult = await db.run(
            'UPDATE want_list SET customer_id = ?, initial = ?, notes = ?, status = ?, spoken_to = ?, created_at_text = ?, closed_by = ? WHERE id = ?',
            [customer_id, initial, notes, status || 'pending', spoken_to, created_at_text, closed_by, id]
        );
        console.log('Want list update result:', updateResult);

        // 2. Update plants
        if (plants && plants.length > 0) {
            console.log('Updating plants:', plants);
            for (const plant of plants) {
                if (plant.id) {
                    const plantUpdateResult = await db.run(
                        'UPDATE plants SET name = ?, size = ?, quantity = ?, status = ?, plant_catalog_id = ? WHERE id = ? AND want_list_entry_id = ?',
                        [plant.name, plant.size, plant.quantity, plant.status || 'pending', plant.plant_catalog_id, plant.id, id]
                    );
                    console.log('Plant update result:', plantUpdateResult);
                } else {
                    const plantInsertResult = await db.run(
                        'INSERT INTO plants (want_list_entry_id, name, size, quantity, status, plant_catalog_id, requested_at) VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)',
                        [id, plant.name, plant.size, plant.quantity, 'pending', plant.plant_catalog_id || null]
                    );
                    console.log('Plant insert result:', plantInsertResult);
                }
            }
        }

        await db.run('COMMIT');
        console.log('Transaction committed');

        const updatedEntry = await db.get('SELECT * FROM want_list WHERE id = ?', [id]);
        const updatedPlants = await db.all('SELECT * FROM plants WHERE want_list_entry_id = ?', [id]);
        console.log('Final updated entry:', { ...updatedEntry, plants: updatedPlants });

        return NextResponse.json({
            ...updatedEntry,
            plants: updatedPlants
        });

    } catch (error) {
        console.error('Error in PUT handler:', error);
        await db.run('ROLLBACK');
        return NextResponse.json({ error: 'Failed to update want list entry', details: error.message }, { status: 500 });
    }
}
