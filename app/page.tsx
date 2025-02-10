'use client'

import { useState, useEffect } from 'react';
import { useFetch } from './hooks/useFetch';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { DashboardStats, TopPlant, RecentWantList, CustomerActivity } from './types/dashboard';

const WantListEntry = ({ entry }: { entry: RecentWantList }) => {
    const router = useRouter();
    const [isHovered, setIsHovered] = useState(false);

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div
            className={`relative transform transition-all duration-300 ease-in-out cursor-pointer
                ${isHovered ? 'scale-102 shadow-lg -translate-y-1' : 'hover:shadow-md'}
                bg-white rounded-lg p-4 border border-sage-100`}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onClick={() => router.push(`/wantlistdashboard?entry=${entry.id}`)}
        >
            <div className="flex justify-between items-start mb-2">
                <div>
                    <span className="text-sm text-sage-600">{formatDate(entry.created_at_text)}</span>
                    <span className="ml-2 font-medium text-sage-800">Initial: {entry.initial}</span>
                </div>
                <span className={`px-2 py-1 text-xs rounded-full ${
                    entry.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    entry.status === 'completed' ? 'bg-green-100 text-green-800' :
                    'bg-red-100 text-red-800'
                }`}>
                    {entry.status}
                </span>
            </div>

            <div className="space-y-1">
                {entry.plants.map((plant, idx) => (
                    <div key={idx} className="text-sm text-gray-600">
                        {plant.quantity}x {plant.name}
                    </div>
                ))}
            </div>

            {isHovered && (entry.notes || entry.general_notes) && (
                <div className="absolute top-0 left-full ml-4 mt-2 text-sm text-gray-500 animate-fadeIn bg-white p-4 rounded-lg shadow-lg z-10 w-64">
                    {entry.general_notes && <p className="font-medium">General: {entry.general_notes}</p>}
                    {entry.notes && <p className="italic">Notes: {entry.notes}</p>}
                </div>
            )}
        </div>
    );
};

export default function Dashboard() {
    const { data, error, loading } = useFetch('/api/dashboard');

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-sage-500"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-4 text-red-500">
                Error loading dashboard: {error}
            </div>
        );
    }

    const { stats, topPlants, recentWantLists, customerActivity } = data || {};

    return (
        <main className="p-6 max-w-7xl mx-auto">
            <h1 className="text-3xl font-bold text-sage-800 mb-8">Nursery Dashboard</h1>
            
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatCard title="Total Plants" value={stats?.totalPlants || 0} />
                <StatCard title="Active Want Lists" value={stats?.activeWantLists || 0} />
                <StatCard title="Total Customers" value={stats?.totalCustomers || 0} />
                <StatCard title="Low Stock Items" value={stats?.lowStockItems || 0} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Want Lists */}
                <section className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-xl font-semibold mb-4">Recent Want Lists</h2>
                    <div className="space-y-4">
                        {recentWantLists?.map((entry: RecentWantList) => (
                            <WantListEntry key={entry.id} entry={entry} />
                        ))}
                    </div>
                    <Link href="/wantlistdashboard" className="mt-4 inline-block text-sage-600 hover:text-sage-800">
                        View all want lists →
                    </Link>
                </section>

                {/* Top Requested Plants */}
                <section className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-xl font-semibold mb-4">Most Requested Plants</h2>
                    <div className="space-y-4">
                        {topPlants?.map((plant: TopPlant) => (
                            <div key={plant.id} className="flex justify-between items-center border-b pb-2">
                                <div>
                                    <p className="font-medium">{plant.tag_name}</p>
                                    <p className="text-sm text-gray-500">{plant.botanical}</p>
                                </div>
                                <span className="bg-sage-100 text-sage-800 px-3 py-1 rounded-full text-sm">
                                    {plant.request_count} requests
                                </span>
                            </div>
                        ))}
                    </div>
                    <Link href="/plantknowledgebase" className="mt-4 inline-block text-sage-600 hover:text-sage-800">
                        View plant catalog →
                    </Link>
                </section>
            </div>
        </main>
    );
}

const StatCard = ({ title, value }: { title: string, value: number }) => (
    <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-gray-500 text-sm font-medium">{title}</h3>
        <p className="text-3xl font-bold text-sage-700 mt-2">{value}</p>
    </div>
);
