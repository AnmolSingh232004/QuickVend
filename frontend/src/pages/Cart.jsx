import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { fetchCart, updateCartItem, removeCartItem } from '../store/slices/cartSlice';
import Spinner from '../components/Spinner';

export default function Cart() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { items, loading } = useSelector((s) => s.cart);

  useEffect(() => {
    dispatch(fetchCart());
  }, [dispatch]);

  const handleQtyChange = (itemId, quantity) => {
    dispatch(updateCartItem({ itemId, quantity }));
  };

  const total = items.reduce((sum, item) => sum + item.subtotal, 0);

  if (loading) return <Spinner text="Loading cart..." />;

  if (items.length === 0) {
    return (
      <div className="text-center py-16">
        <h1 className="text-2xl font-bold mb-4 dark:text-gray-100">Your Cart is Empty</h1>
        <Link to="/products" className="text-indigo-600 hover:underline">Continue Shopping</Link>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6 dark:text-gray-100">Shopping Cart</h1>
      <div className="space-y-4">
        {items.map((item) => (
          <div key={item.id} className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border dark:border-gray-700 flex items-center gap-4">
            <div className="w-20 h-20 bg-gray-100 dark:bg-gray-700 rounded flex items-center justify-center text-gray-400 text-sm flex-shrink-0">
              {item.productImage ? (
                <img src={item.productImage} alt={item.productName} className="h-full w-full object-cover rounded" />
              ) : 'No Image'}
            </div>
            <div className="flex-1">
              <Link to={`/products/${item.productId}`} className="font-medium text-gray-900 dark:text-gray-100 hover:text-indigo-600">
                {item.productName}
              </Link>
              <p className="text-indigo-600 font-bold">${item.productPrice}</p>
            </div>
            <div className="flex items-center gap-2">
              <select value={item.quantity}
                onChange={(e) => handleQtyChange(item.id, Number(e.target.value))}
                className="border rounded px-2 py-1 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100">
                {[...Array(10).keys()].map((n) => (
                  <option key={n + 1} value={n + 1}>{n + 1}</option>
                ))}
              </select>
            </div>
            <p className="font-bold text-gray-900 dark:text-gray-100 w-24 text-right">${item.subtotal}</p>
            <button onClick={() => dispatch(removeCartItem(item.id))}
              className="text-red-500 hover:text-red-700 ml-2">Remove</button>
          </div>
        ))}
      </div>

      <div className="mt-6 text-right">
        <p className="text-xl font-bold dark:text-gray-100">Total: ${total.toFixed(2)}</p>
        <button onClick={() => navigate('/checkout')}
          className="mt-4 bg-indigo-600 text-white px-8 py-3 rounded-lg hover:bg-indigo-700">
          Proceed to Checkout
        </button>
      </div>
    </div>
  );
}
