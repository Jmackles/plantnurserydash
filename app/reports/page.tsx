'use client';
import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';

// Dynamic imports for each chart type with loading states
const LineChart = dynamic(
  () => import('react-chartjs-2').then(mod => ({ default: mod.Line })),
  { ssr: false, loading: () => <div>Loading line chart...</div> }
);

const BarChart = dynamic(
  () => import('react-chartjs-2').then(mod => ({ default: mod.Bar })),
  { ssr: false, loading: () => <div>Loading bar chart...</div> }
);

const PieChart = dynamic(
  () => import('react-chartjs-2').then(mod => ({ default: mod.Pie })),
  { ssr: false, loading: () => <div>Loading pie chart...</div> }
);

// Separate component for ChartJS registration
const ChartJsConfig = dynamic(
  () => import('@/app/components/charts/ChartConfig').then(mod => mod.default),
  { ssr: false }
);

const ReportsDashboard = () => {
    const [timeframe, setTimeframe] = useState('week');
    const [reportType, setReportType] = useState('overview');
    const [reportData, setReportData] = useState({
        metrics: {
            totalWantLists: 0,
            pendingCount: 0,
            completedCount: 0,
            canceledCount: 0,
            totalPlants: 0,
            uniqueCustomers: 0,
            overdueCount: 0,
            todaysPending: 0,
            unfulfilledPlants: 0,
            activeWantLists: 0
        },
        trendData: [],
        topPlants: [],
        customerActivity: [],
        pendingWantLists: [],
        needsFollowup: [],
        weekSummary: {
            new_requests: 0,
            completed: 0,
            avg_response_time: 0,
            completion_rate: 0
        }
    });
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchReportData = async () => {
            setIsLoading(true);
            try {
                const response = await fetch(`/api/reports?type=${reportType}&timeframe=${timeframe}`);
                if (!response.ok) throw new Error('Failed to fetch report data');
                const data = await response.json();
                setReportData(data);
            } catch (error) {
                console.error('Error fetching report data:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchReportData();
    }, [timeframe, reportType]);

    return (
        <Suspense fallback={<div>Loading dashboard...</div>}>
            <div className="p-6 max-w-7xl mx-auto">
                <ChartJsConfig />
                
                {/* Simplified, more focused header */}
                <div className="mb-6">
                    <h1 className="text-2xl font-bold mb-4">Want List Operations</h1>
                    <div className="flex gap-4 mb-6">
                        <select
                            value={timeframe}
                            onChange={(e) => setTimeframe(e.target.value)}
                            className="input-field"
                        >
                            <option value="today">Today</option>
                            <option value="week">This Week</option>
                            <option value="month">This Month</option>
                        </select>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Urgent Action Items */}
                    <div className="bg-white rounded-lg shadow p-4 col-span-2">
                        <h3 className="text-lg font-semibold mb-4">Needs Attention</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="bg-red-50 p-4 rounded-lg">
                                <p className="text-sm text-red-600">Overdue Want Lists (>3 days)</p>
                                <p className="text-2xl font-bold text-red-800">
                                    {reportData.metrics.overdueCount}
                                </p>
                                <Link href="/wantlistdashboard?filter=overdue" 
                                    className="text-sm text-red-600 hover:underline">
                                    View all overdue
                                </Link>
                            </div>
                            <div className="bg-yellow-50 p-4 rounded-lg">
                                <p className="text-sm text-yellow-600">Today's Pending</p>
                                <p className="text-2xl font-bold text-yellow-800">
                                    {reportData.metrics.todaysPending}
                                </p>
                                <Link href="/wantlistdashboard?filter=today" 
                                    className="text-sm text-yellow-600 hover:underline">
                                    View today's list
                                </Link>
                            </div>
                            <div className="bg-blue-50 p-4 rounded-lg">
                                <p className="text-sm text-blue-600">Unfulfilled Plants</p>
                                <p className="text-2xl font-bold text-blue-800">
                                    {reportData.metrics.unfulfilledPlants}
                                </p>
                                <span className="text-sm text-blue-600">
                                    Across {reportData.metrics.activeWantLists} lists
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Most Requested Plants - Actionable Version */}
                    <div className="bg-white rounded-lg shadow p-4">
                        <h3 className="text-lg font-semibold mb-4">High Demand Plants</h3>
                        <div className="space-y-3">
                            {reportData.topPlants.map((plant, idx) => (
                                <div key={idx} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                                    <div>
                                        <p className="font-medium">{plant.name}</p>
                                        <p className="text-sm text-gray-600">
                                            {plant.size ? `Size: ${plant.size}` : 'Various Sizes'}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-bold">{plant.total_quantity} requested</p>
                                        <p className="text-sm text-gray-600">
                                            {plant.unique_customers} customers waiting
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Customer Follow-ups Needed */}
                    <div className="bg-white rounded-lg shadow p-4">
                        <h3 className="text-lg font-semibold mb-4">Need Follow-up</h3>
                        <div className="space-y-3">
                            {reportData.needsFollowup.map((item, idx) => (
                                <div key={idx} className="p-3 bg-gray-50 rounded">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="font-medium">{item.customer_name}</p>
                                            <p className="text-sm text-gray-600">
                                                Want List #{item.want_list_id}
                                            </p>
                                        </div>
                                        <span className="text-sm bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                                            {item.days_waiting} days
                                        </span>
                                    </div>
                                    <div className="mt-2 text-sm text-gray-600">
                                        {item.items_summary}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Weekly Performance Summary */}
                <div className="mt-6 bg-white rounded-lg shadow p-4">
                    <h3 className="text-lg font-semibold mb-4">This Week's Summary</h3>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="p-3 bg-gray-50 rounded">
                            <p className="text-sm text-gray-600">New Requests</p>
                            <p className="text-xl font-bold">{reportData.weekSummary.new_requests}</p>
                        </div>
                        <div className="p-3 bg-gray-50 rounded">
                            <p className="text-sm text-gray-600">Completed</p>
                            <p className="text-xl font-bold">{reportData.weekSummary.completed}</p>
                        </div>
                        <div className="p-3 bg-gray-50 rounded">
                            <p className="text-sm text-gray-600">Avg Response Time</p>
                            <p className="text-xl font-bold">{reportData.weekSummary.avg_response_time}h</p>
                        </div>
                        <div className="p-3 bg-gray-50 rounded">
                            <p className="text-sm text-gray-600">Completion Rate</p>
                            <p className="text-xl font-bold">{reportData.weekSummary.completion_rate}%</p>
                        </div>
                    </div>
                </div>
            </div>
        </Suspense>
    );
};

export default ReportsDashboard;
