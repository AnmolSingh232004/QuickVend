import { useEffect, useState } from 'react';
import API from '../api/axios';
import { Link } from 'react-router-dom';
import Spinner from '../components/Spinner';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

const COLORS = ['#f59e0b', '#3b82f6', '#8b5cf6', '#22c55e', '#ef4444'];

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [basicStats, setBasicStats] = useState(null);

  useEffect(() => {
    Promise.all([
      API.get('/products'),
      API.get('/admin/orders'),
      API.get('/admin/users'),
      API.get('/admin/dashboard/stats'),
    ]).then(([p, o, u, s]) => {
      setBasicStats({ products: p.data.length, orders: o.data.length, users: u.data.length });
      setStats(s.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  if (loading) return <Spinner text="Loading dashboard..." />;

  const revenueData = stats?.monthlyRevenue ? Object.entries(stats.monthlyRevenue).map(([month, revenue]) => ({ month, revenue })) : [];
  const ordersByStatusData = stats?.ordersByStatus ? Object.entries(stats.ordersByStatus).map(([name, value]) => ({ name, value })) : [];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6 dark:text-gray-100">Admin Dashboard</h1>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border dark:border-gray-700">
          <p className="text-gray-500 dark:text-gray-400 text-xs">Products</p>
          <p className="text-2xl font-bold dark:text-gray-100">{stats.totalProducts}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border dark:border-gray-700">
          <p className="text-gray-500 dark:text-gray-400 text-xs">Orders</p>
          <p className="text-2xl font-bold dark:text-gray-100">{stats.totalOrders}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border dark:border-gray-700">
          <p className="text-gray-500 dark:text-gray-400 text-xs">Users</p>
          <p className="text-2xl font-bold dark:text-gray-100">{stats.totalUsers}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border dark:border-gray-700">
          <p className="text-gray-500 dark:text-gray-400 text-xs">Pending</p>
          <p className="text-2xl font-bold text-yellow-600">{stats.pendingOrders}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border dark:border-gray-700">
          <p className="text-gray-500 dark:text-gray-400 text-xs">Revenue</p>
          <p className="text-2xl font-bold text-green-600">${stats.totalRevenue}</p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border dark:border-gray-700">
          <h2 className="font-semibold mb-4 dark:text-gray-100">Monthly Revenue (6 months)</h2>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="month" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip />
              <Bar dataKey="revenue" fill="#4f46e5" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border dark:border-gray-700">
          <h2 className="font-semibold mb-4 dark:text-gray-100">Orders by Status</h2>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={ordersByStatusData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                {ordersByStatusData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link to="/admin/products"
          className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border dark:border-gray-700 hover:shadow-md transition text-center">
          <h2 className="font-semibold text-lg dark:text-gray-100">Manage Products</h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm">Add, edit, upload images</p>
        </Link>
        <Link to="/admin/categories"
          className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border dark:border-gray-700 hover:shadow-md transition text-center">
          <h2 className="font-semibold text-lg dark:text-gray-100">Manage Categories</h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm">Add, edit, delete categories</p>
        </Link>
        <Link to="/admin/orders"
          className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border dark:border-gray-700 hover:shadow-md transition text-center">
          <h2 className="font-semibold text-lg dark:text-gray-100">Manage Orders</h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm">View and update order status</p>
        </Link>
      </div>
    </div>
  );
}
