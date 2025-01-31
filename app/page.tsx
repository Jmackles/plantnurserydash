"use client"
import { useEffect, useState } from 'react';
import { DashboardMetrics, ActivityItem } from '@/app/lib/types';
import { useFetch } from '@/app/hooks/useFetch';
import Link from 'next/link';
import { Tooltip } from 'react-tooltip';

export default function Dashboard() {
    const { data: customers, error: customersError, loading: customersLoading } = useFetch<Customer[]>('/api/customers');
    const { data: wantListEntries, error: wantListEntriesError, loading: wantListEntriesLoading } = useFetch<WantListEntry[]>('/api/want-list');
    const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
    const [recentActivity, setRecentActivity] = useState<ActivityItem[]>([]);

    useEffect(() => {
        if (customers && wantListEntries) {
            const orders: unknown[] = []; // Use a safer placeholder if needed
            const calculatedMetrics: DashboardMetrics = {
                totalCustomers: customers.length,
                activeWantlists: wantListEntries.filter(w => !w.is_closed).length,
                totalPlants: wantListEntries.reduce((acc, w) => acc + w.plants.length, 0),
                pendingOrders: orders.filter(o => !o.completed).length,
                averagePlantsPerWantList: wantListEntries.length ? 
                    Math.round(wantListEntries.reduce((acc, w) => acc + w.plants.length, 0) / wantListEntries.length) : 0,
                totalOrders: orders.length,
                completedOrders: orders.filter(o => o.completed).length
            };

            setMetrics(calculatedMetrics);

            const activity: ActivityItem[] = wantListEntries.map(entry => ({
                type: 'wantlist',
                customer: `${entry.customer_first_name} ${entry.customer_last_name}`,
                time: 'N/A', // Replace with actual time if available
                action: `New request for ${entry.initial}`,
                customer_id: entry.customer_id // Add customer_id to the activity item
            }));

            setRecentActivity(activity);
        }
    }, [customers, wantListEntries]);

    if (customersLoading || wantListEntriesLoading) {
        return <div>Loading...</div>;
    }

    if (customersError || wantListEntriesError) {
        return <div>Error loading data</div>;
    }

    if (!metrics) {
        return <div>Loading...</div>;
    }

    return (
        <main className="p-6 max-w-7xl mx-auto">
            {/* Metrics Overview */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                {Object.entries(metrics).map(([key, value]) => (
                    <div key={key} className="card-section text-center" data-tooltip-id={key}>
                        <div className="text-3xl font-bold text-sage-600">{value}</div>
                        <div className="text-sm text-sage-500 capitalize">
                            {key.replace(/([A-Z])/g, ' $1').trim()}
                        </div>
                        <Tooltip id={key} place="top" content={`This metric represents ${key.replace(/([A-Z])/g, ' $1').trim().toLowerCase()}.`} />
                    </div>
                ))}
            </div>

            {/* Recent Activity */}
            <div className="card-section">
                <h2 className="text-xl font-semibold text-sage-700 mb-4">Recent Activity</h2>
                <div className="divide-y divide-sage-200">
                    {recentActivity.map((activity, index) => (
                        <div key={index} className="py-3 flex items-center justify-between">
                            <div>
                                <span className="font-medium text-sage-600">{activity.customer}</span>
                                <p className="text-sm text-sage-500">{activity.action}</p>
                                <Link href={`/customers/${activity.customer_id}`} className="text-blue-500 underline">
                                    View Customer
                                </Link>
                            </div>
                            <span className="text-xs text-sage-400">{activity.time}</span>
                        </div>
                    ))}
                </div>
            </div>
        </main>
    );
}