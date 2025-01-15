"use client"
import { useEffect, useState } from 'react';
import { DashboardMetrics, ActivityItem, Customer, WantListEntry } from './lib/types';
import { fetchCustomers, fetchWantListEntries } from './lib/api';
import { getMetrics } from './utils/Metrics';
import Link from 'next/link';
import { Tooltip } from 'react-tooltip';

export default function Dashboard() {
    const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
    const [recentActivity, setRecentActivity] = useState<ActivityItem[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [customers, wantListEntries] = await Promise.all([
                    fetchCustomers(),
                    fetchWantListEntries()
                ]);

                const orders = []; // Fetch orders if you have an API for it
                const calculatedMetrics = getMetrics(customers, wantListEntries, orders);

                setMetrics(calculatedMetrics);

                // Assuming recent activity can be derived from wantListEntries or another source
                const activity: ActivityItem[] = wantListEntries.map(entry => ({
                    type: 'wantlist',
                    customer: `${entry.customer_first_name} ${entry.customer_last_name}`,
                    time: 'N/A', // Replace with actual time if available
                    action: `New request for ${entry.initial}`
                }));

                setRecentActivity(activity);
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };

        fetchData();
    }, []);

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
                        <Tooltip id={key} place="top" effect="solid">
                            {`This metric represents ${key.replace(/([A-Z])/g, ' $1').trim().toLowerCase()}.`}
                        </Tooltip>
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
                            </div>
                            <span className="text-xs text-sage-400">{activity.time}</span>
                        </div>
                    ))}
                </div>
            </div>
        </main>
    );
}