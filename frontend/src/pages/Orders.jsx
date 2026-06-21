import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchOrders, cancelOrder } from '../store/slices/orderSlice';
import { Link } from 'react-router-dom';
import Spinner from '../components/Spinner';

const statusColors = {
  PENDING: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  CONFIRMED: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  SHIPPED: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
  DELIVERED: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  CANCELLED: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
};

const steps = ['PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED'];

function OrderTimeline({ status }) {
  const currentIdx = steps.indexOf(status);
  const isCancelled = status === 'CANCELLED';

  return (
    <div className="flex items-center gap-1 mb-4">
      {steps.map((step, i) => {
        const done = !isCancelled && i <= currentIdx;
        const active = !isCancelled && i === currentIdx;
        return (
          <div key={step} className="flex items-center flex-1 last:flex-none">
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold
              ${isCancelled ? 'bg-red-200 text-red-700' :
                active ? 'bg-indigo-600 text-white' :
                done ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-500'}`}>
              {isCancelled ? '✕' : done ? '✓' : i + 1}
            </div>
            {i < steps.length - 1 && (
              <div className={`flex-1 h-0.5 mx-1 ${!isCancelled && i < currentIdx ? 'bg-green-400' : isCancelled ? 'bg-red-200' : 'bg-gray-200'}`} />
            )}
          </div>
        );
      })}
      {isCancelled && <span className="text-xs text-red-600 font-medium ml-2">Cancelled</span>}
    </div>
  );
}

export default function Orders() {
  const dispatch = useDispatch();
  const { orders, loading } = useSelector((s) => s.orders);
  const { user } = useSelector((s) => s.auth);

  useEffect(() => {
    dispatch(fetchOrders());
  }, [dispatch]);

  const handleCancel = (orderId) => {
    if (confirm('Are you sure you want to cancel this order?')) {
      dispatch(cancelOrder(orderId));
    }
  };

  const handleDownloadInvoice = async (orderId) => {
    try {
      const res = await fetch(`/api/orders/${orderId}/invoice`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      if (!res.ok) throw new Error('Failed to download invoice');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      window.open(url, '_blank');
      setTimeout(() => URL.revokeObjectURL(url), 10000);
    } catch {
      alert('Failed to download invoice');
    }
  };

  if (loading) return <Spinner text="Loading orders..." />;

  if (orders.length === 0) {
    return (
      <div className="text-center py-16">
        <h1 className="text-2xl font-bold mb-4">No Orders Yet</h1>
        <Link to="/products" className="text-indigo-600 hover:underline">Start Shopping</Link>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">My Orders</h1>
      <div className="space-y-4">
        {orders.map((order) => (
          <div key={order.id} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border dark:border-gray-700">
            <div className="flex justify-between items-start mb-2">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">{order.orderNumber}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">{new Date(order.createdAt).toLocaleDateString()}</p>
              </div>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColors[order.status]}`}>
                {order.status}
              </span>
            </div>

            <OrderTimeline status={order.status} />

            <div className="space-y-2">
              {order.items.map((item, idx) => (
                <div key={idx} className="flex justify-between text-sm">
                  <span>{item.productName} x{item.quantity}</span>
                  <span>${item.subtotal}</span>
                </div>
              ))}
            </div>
            <div className="flex justify-between items-center mt-4 pt-4 border-t dark:border-gray-700">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Shipping to: {order.shippingAddress}</p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Payment: {order.paymentMethod}</p>
                {(order.status === 'PENDING' || order.status === 'CONFIRMED') && (
                  <button onClick={() => handleCancel(order.id)}
                    className="text-red-500 hover:text-red-700 text-sm mt-1">
                    Cancel Order
                  </button>
                )}
              </div>
              <div className="text-right">
                <p className="font-bold text-lg">Total: ${order.totalAmount}</p>
                <button onClick={() => handleDownloadInvoice(order.id)}
                  className="text-indigo-600 hover:text-indigo-800 text-sm inline-block mt-1">
                  Download Invoice
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
