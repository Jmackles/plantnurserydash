import { NextResponse } from 'next/server';
import { openDb } from '@/app/lib/db';

export async function GET() {
    const db = await openDb();

    try {
        // Get basic stats
        const stats = await db.get(`
            SELECT 
                (SELECT COUNT(*) FROM PlantCatalog) as totalPlants,
                (SELECT COUNT(*) FROM customers) as totalCustomers,
                (SELECT COUNT(*) FROM want_list WHERE status = 'pending') as activeWantLists,
                (SELECT COUNT(*) FROM PlantCatalog WHERE price > 0 AND flat_count < 10) as lowStockItems
        `);

        // Get top requested plants
        const topPlants = await db.all(`
            SELECT 
                pc.id,
                pc.tag_name,
                pc.botanical,
                COUNT(p.id) as request_count
            FROM PlantCatalog pc
            JOIN plants p ON pc.id = p.plant_catalog_id
            GROUP BY pc.id
            ORDER BY request_count DESC
            LIMIT 5
        `);

        // Updated recentWantLists query to use entity_notes table
        const recentWantLists = await db.all(`
            SELECT 
                w.id,
                c.first_name || ' ' || c.last_name as customer_name,
                w.initial,
                w.status,
                w.created_at_text,
                GROUP_CONCAT(DISTINCT en.note_text) as notes,
                GROUP_CONCAT(DISTINCT COALESCE(p.name || ':' || p.quantity, '')) as plant_list
            FROM want_list w
            JOIN customers c ON w.customer_id = c.id
            LEFT JOIN plants p ON w.id = p.want_list_entry_id
            LEFT JOIN entity_notes en ON w.id = en.notable_id 
                AND en.notable_type = 'want_list'
            GROUP BY w.id
            ORDER BY w.created_at_text DESC
            LIMIT 5
        `);

        // Transform the results
        const transformedWantLists = recentWantLists.map(entry => ({
            ...entry,
            notes: entry.notes ? entry.notes.split(',') : [],
            plants: entry.plant_list && entry.plant_list !== '' 
                ? entry.plant_list.split(',').filter(Boolean).map(plant => {
                    const [name, quantity] = plant.split(':');
                    return { 
                        name: name || 'Unknown Plant', 
                        quantity: parseInt(quantity) || 1 
                    };
                })
                : []
        }));

        // Get recent customer activity
        const customerActivity = await db.all(`
            SELECT 
                c.id,
                c.first_name || ' ' || c.last_name as customer_name,
                MAX(w.created_at_text) as last_interaction,
                COUNT(w.id) as total_requests
            FROM customers c
            JOIN want_list w ON c.id = w.customer_id
            GROUP BY c.id
            ORDER BY last_interaction DESC
            LIMIT 5
        `);

        return NextResponse.json({
            stats,
            topPlants,
            recentWantLists: transformedWantLists,
            customerActivity
        });
    } catch (error) {
        console.error('Dashboard error:', error);
        return NextResponse.json({ error: 'Failed to fetch dashboard data' }, { status: 500 });
    } finally {
        await db.close();
    }
}
