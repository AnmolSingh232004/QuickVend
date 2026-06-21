import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import API from '../api/axios';
import { Link } from 'react-router-dom';

const statusColors = {
  PENDING: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  CONFIRMED: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  SHIPPED: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
  DELIVERED: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  CANCELLED: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
};

export default function Profile() {
  const { user } = useSelector((s) => s.auth);
  const [name, setName] = useState(user?.name || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    API.get('/orders').then((res) => {
      setOrders(res.data);
      setLoadingOrders(false);
    }).catch(() => setLoadingOrders(false));
  }, []);

  const handleUpdateName = async (e) => {
    e.preventDefault();
    setUpdating(true);
    setMessage('');
    setError('');
    try {
      await API.put('/users/me', { name });
      setMessage('Name updated successfully');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update name');
    }
    setUpdating(false);
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setUpdating(true);
    setMessage('');
    setError('');
    try {
      await API.put('/users/me/password', { currentPassword, newPassword });
      setMessage('Password changed successfully');
      setCurrentPassword('');
      setNewPassword('');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to change password');
    }
    setUpdating(false);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6 dark:text-gray-100">My Profile</h1>

      {message && <p className="text-green-600 bg-green-50 dark:bg-green-900 dark:text-green-200 border border-green-200 dark:border-green-700 rounded-lg px-4 py-2 mb-4">{message}</p>}
      {error && <p className="text-red-600 bg-red-50 dark:bg-red-900 dark:text-red-200 border border-red-200 dark:border-red-700 rounded-lg px-4 py-2 mb-4">{error}</p>}

      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border dark:border-gray-700">
          <h2 className="font-semibold mb-4 dark:text-gray-100">Account Info</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Email</p>
          <p className="mb-4 dark:text-gray-200">{user?.email}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Role</p>
          <p className="mb-4 dark:text-gray-200">{user?.role?.replace('ROLE_', '')}</p>
          <form onSubmit={handleUpdateName}>
            <label className="block text-sm font-medium mb-1 dark:text-gray-300">Name</label>
            <input required value={name} onChange={(e) => setName(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 mb-3 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100" />
            <button type="submit" disabled={updating}
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50 text-sm">
              {updating ? 'Saving...' : 'Update Name'}
            </button>
          </form>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border dark:border-gray-700">
          <h2 className="font-semibold mb-4 dark:text-gray-100">Change Password</h2>
          <form onSubmit={handleChangePassword}>
            <label className="block text-sm font-medium mb-1 dark:text-gray-300">Current Password</label>
            <input type="password" required value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 mb-3 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100" />
            <label className="block text-sm font-medium mb-1 dark:text-gray-300">New Password</label>
            <input type="password" required minLength={6} value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 mb-3 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100" />
            <button type="submit" disabled={updating}
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50 text-sm">
              {updating ? 'Saving...' : 'Change Password'}
            </button>
          </form>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border dark:border-gray-700">
        <h2 className="font-semibold mb-4 dark:text-gray-100">Order History</h2>
        {loadingOrders ? (
          <p className="text-gray-500 dark:text-gray-400">Loading orders...</p>
        ) : orders.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400">No orders yet. <Link to="/products" className="text-indigo-600">Start shopping</Link></p>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div key={order.id} className="border dark:border-gray-600 rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="font-mono text-sm text-gray-500 dark:text-gray-400">{order.orderNumber}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{new Date(order.createdAt).toLocaleDateString()}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColors[order.status]}`}>
                    {order.status}
                  </span>
                </div>
                <div className="space-y-1">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between text-sm dark:text-gray-300">
                      <span>{item.productName} x{item.quantity}</span>
                      <span>${item.subtotal}</span>
                    </div>
                  ))}
                </div>
                <p className="text-right font-bold mt-2 dark:text-gray-100">Total: ${order.totalAmount}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
