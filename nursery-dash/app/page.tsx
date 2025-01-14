import Link from 'next/link';

export default function Dashboard() {
  const mockMetrics = {
    totalCustomers: 156,
    activeWantlists: 23,
    totalPlants: 450,
    pendingOrders: 12
  };

  const recentActivity = [
    { type: 'wantlist', customer: 'Jane Smith', time: '2h ago', action: 'New request for Monstera' },
    { type: 'customer', customer: 'Bob Wilson', time: '3h ago', action: 'Updated contact info' },
    { type: 'order', customer: 'Alice Brown', time: '5h ago', action: 'Completed order #123' },
  ];

  return (
    <main className="p-6 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold text-sage-700 mb-8">Nursery Dashboard</h1>
      
      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <Link href="/customers/new" className="btn-primary text-center">
          New Customer
        </Link>
        <Link href="/wantlist/new" className="btn-secondary text-center">
          New Want List
        </Link>
        <Link href="/customers" className="btn-primary text-center">
          View Customers
        </Link>
        <Link href="/wantlist" className="btn-secondary text-center">
          View Want Lists
        </Link>
      </div>

      {/* Metrics Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {Object.entries(mockMetrics).map(([key, value]) => (
          <div key={key} className="card-section text-center">
            <div className="text-3xl font-bold text-sage-600">{value}</div>
            <div className="text-sm text-sage-500 capitalize">
              {key.replace(/([A-Z])/g, ' $1').trim()}
            </div>
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