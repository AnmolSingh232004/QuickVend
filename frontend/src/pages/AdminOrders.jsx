import { useEffect, useState } from 'react';
import API from '../api/axios';
import Spinner from '../components/Spinner';

const statusColors = {
  PENDING: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  CONFIRMED: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  SHIPPED: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
  DELIVERED: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  CANCELLED: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
};

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const res = await API.get('/admin/orders');
    setOrders(res.data);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const updateStatus = async (id, status) => {
    await API.put(`/admin/orders/${id}/status`, { status });
    load();
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6 dark:text-gray-100">Orders</h1>
      {loading ? <Spinner text="Loading orders..." /> : (
      <div className="space-y-4">
        {orders.map((order) => (
          <div key={order.id} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border dark:border-gray-700">
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="font-mono text-sm text-gray-500 dark:text-gray-400">{order.orderNumber}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">{new Date(order.createdAt).toLocaleDateString()}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColors[order.status]}`}>
                  {order.status}
                </span>
                <select value={order.status} onChange={(e) => updateStatus(order.id, e.target.value)}
                  className="border rounded px-2 py-1 text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100">
                  <option value="PENDING">Pending</option>
                  <option value="CONFIRMED">Confirmed</option>
                  <option value="SHIPPED">Shipped</option>
                  <option value="DELIVERED">Delivered</option>
                  <option value="CANCELLED">Cancelled</option>
                </select>
              </div>
            </div>
            <div className="space-y-1">
              {order.items.map((item, idx) => (
                <div key={idx} className="flex justify-between text-sm dark:text-gray-300">
                  <span>{item.productName} x{item.quantity}</span>
                  <span>${item.subtotal}</span>
                </div>
              ))}
            </div>
            <div className="flex justify-between items-center mt-4 pt-4 border-t dark:border-gray-700">
              <p className="text-sm text-gray-500 dark:text-gray-400">Shipping: {order.shippingAddress}</p>
              <p className="font-bold text-lg dark:text-gray-100">Total: ${order.totalAmount}</p>
            </div>
          </div>
        ))}
        {orders.length === 0 && <p className="text-gray-500 dark:text-gray-400 text-center py-10">No orders yet.</p>}
      </div>
      )}
    </div>
  );
}
