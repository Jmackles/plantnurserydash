import { NextResponse } from 'next/server';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import { subDays, subMonths, subQuarters, subYears } from 'date-fns';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const timeframe = searchParams.get('timeframe');

    const db = await open({
        filename: './app/database/database.sqlite',
        driver: sqlite3.Database
    });

    try {
        let startDate;
        switch (timeframe) {
            case 'week':
                startDate = subDays(new Date(), 7);
                break;
            case 'month':
                startDate = subMonths(new Date(), 1);
                break;
            case 'quarter':
                startDate = subQuarters(new Date(), 1);
                break;
            case 'year':
                startDate = subYears(new Date(), 1);
                break;
            default:
                startDate = subDays(new Date(), 7);
        }

        const stats = await getStats(db, startDate, type);
        return NextResponse.json(stats);
    } catch (error) {
        console.error('Error generating report:', error);
        return NextResponse.json({ error: 'Failed to generate report' }, { status: 500 });
    } finally {
        await db.close();
    }
}

async function getStats(db: any, startDate: Date, type: string | null) {
    const stats = {
        metrics: await getMetrics(db, startDate),
        trendData: await getTrendData(db, startDate),
        popularPlants: await getPopularPlants(db, startDate),
        customerDistribution: await getCustomerDistribution(db),
        pendingActions: await getPendingActions(db),
        topPlants: await getTopPlants(db),
        needsFollowup: await getNeedsFollowup(db),
        weekSummary: await getWeekSummary(db)
    };

    return stats;
}

async function getMetrics(db: any, startDate: Date) {
    const overdueCount = await db.get(`
        SELECT COUNT(*) as count
        FROM want_list
        WHERE status = 'pending'
        AND JULIANDAY('now') - JULIANDAY(created_at_text) > 3
    `);

    const todaysPending = await db.get(`
        SELECT COUNT(*) as count
        FROM want_list
        WHERE status = 'pending'
        AND date(created_at_text) = date('now')
    `);

    const unfulfilledPlants = await db.get(`
        SELECT 
            COUNT(*) as total_plants,
            COUNT(DISTINCT w.id) as active_lists
        FROM plants p
        JOIN want_list w ON p.want_list_entry_id = w.id
        WHERE w.status = 'pending'
        AND p.status = 'pending'
    `);

    return {
        overdueCount: overdueCount.count,
        todaysPending: todaysPending.count,
        unfulfilledPlants: unfulfilledPlants.total_plants,
        activeWantLists: unfulfilledPlants.active_lists
    };
}

async function getTrendData(db: any, startDate: Date) {
    return await db.all(`
        SELECT 
            date(created_at_text) as date,
            COUNT(*) as count
        FROM want_list
        WHERE created_at_text >= ?
        GROUP BY date(created_at_text)
        ORDER BY date
    `, [startDate.toISOString()]);
}

async function getPopularPlants(db: any, startDate: Date) {
    return await db.all(`
        SELECT 
            p.name,
            COUNT(*) as request_count,
            SUM(p.quantity) as total_quantity
        FROM plants p
        JOIN want_list w ON p.want_list_entry_id = w.id
        WHERE w.created_at_text >= ?
        GROUP BY p.name
        ORDER BY request_count DESC
        LIMIT 5
    `, [startDate.toISOString()]);
}

async function getCustomerDistribution(db: any) {
    return await db.get(`
        WITH CustomerCounts AS (
            SELECT 
                customer_id,
                COUNT(*) as request_count
            FROM want_list
            GROUP BY customer_id
        )
        SELECT 
            COUNT(CASE WHEN request_count = 1 THEN 1 END) as new_customers,
            COUNT(CASE WHEN request_count BETWEEN 2 AND 5 THEN 1 END) as regular_customers,
            COUNT(CASE WHEN request_count > 5 THEN 1 END) as vip_customers
        FROM CustomerCounts
    `);
}

async function getPendingActions(db: any) {
    const overdueLists = await db.all(`
        SELECT 
            w.id,
            c.first_name || ' ' || c.last_name as customer_name,
            ROUND(JULIANDAY('now') - JULIANDAY(w.created_at_text)) as days_pending
        FROM want_list w
        JOIN customers c ON w.customer_id = c.id
        WHERE w.status = 'pending'
        AND JULIANDAY('now') - JULIANDAY(w.created_at_text) > 3
        ORDER BY days_pending DESC
        LIMIT 5
    `);

    return overdueLists;
}

async function getTopPlants(db: any) {
    return await db.all(`
        SELECT 
            p.name,
            p.size,
            SUM(p.quantity) as total_quantity,
            COUNT(DISTINCT w.customer_id) as unique_customers,
            GROUP_CONCAT(DISTINCT p.size) as sizes
        FROM plants p
        JOIN want_list w ON p.want_list_entry_id = w.id
        WHERE w.status = 'pending'
        AND p.status = 'pending'
        GROUP BY p.name
        HAVING total_quantity > 1
        ORDER BY total_quantity DESC
        LIMIT 5
    `);
}

async function getNeedsFollowup(db: any) {
    return await db.all(`
        SELECT 
            w.id as want_list_id,
            c.first_name || ' ' || c.last_name as customer_name,
            ROUND(JULIANDAY('now') - JULIANDAY(w.created_at_text)) as days_waiting,
            GROUP_CONCAT(p.name || ' (' || p.quantity || ')') as items_summary
        FROM want_list w
        JOIN customers c ON w.customer_id = c.id
        JOIN plants p ON p.want_list_entry_id = w.id
        WHERE w.status = 'pending'
        AND p.status = 'pending'
        GROUP BY w.id
        HAVING days_waiting >= 2
        ORDER BY days_waiting DESC
        LIMIT 5
    `);
}

async function getWeekSummary(db: any) {
    return await db.get(`
        SELECT 
            COUNT(CASE WHEN status = 'pending' AND date(created_at_text) >= date('now', '-7 days') THEN 1 END) as new_requests,
            COUNT(CASE WHEN status = 'completed' AND date(created_at_text) >= date('now', '-7 days') THEN 1 END) as completed,
            ROUND(AVG(CASE 
                WHEN status = 'completed' 
                THEN (JULIANDAY(closed_by) - JULIANDAY(created_at_text)) * 24 
            END), 1) as avg_response_time,
            ROUND(COUNT(CASE WHEN status = 'completed' THEN 1 END) * 100.0 / NULLIF(COUNT(*), 0), 1) as completion_rate
        FROM want_list
        WHERE date(created_at_text) >= date('now', '-7 days')
    `);
}
