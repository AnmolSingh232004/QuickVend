import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { fetchWishlist, removeFromWishlist } from '../store/slices/wishlistSlice';
import { addToCart } from '../store/slices/cartSlice';
import Spinner from '../components/Spinner';

export default function Wishlist() {
  const dispatch = useDispatch();
  const { items, loading } = useSelector((s) => s.wishlist);

  useEffect(() => {
    dispatch(fetchWishlist());
  }, [dispatch]);

  const handleAddToCart = (item) => {
    dispatch(addToCart({ productId: item.productId, quantity: 1 }));
    dispatch(removeFromWishlist(item.productId));
  };

  if (loading) return <Spinner text="Loading wishlist..." />;

  if (items.length === 0) {
    return (
      <div className="text-center py-16">
        <h1 className="text-2xl font-bold mb-4">Your Wishlist is Empty</h1>
        <Link to="/products" className="text-indigo-600 hover:underline">Browse Products</Link>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">My Wishlist</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {items.map((item) => (
          <div key={item.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border dark:border-gray-700 p-4">
            <Link to={`/products/${item.productId}`}>
              <div className="h-40 bg-gray-100 dark:bg-gray-700 rounded mb-3 flex items-center justify-center text-gray-400">
                {item.productImage ? (
                  <img src={item.productImage} alt={item.productName} className="h-full w-full object-cover rounded" />
                ) : <span>No Image</span>}
              </div>
            </Link>
            <Link to={`/products/${item.productId}`} className="font-medium text-gray-900 dark:text-gray-100 hover:text-indigo-600 block truncate">
              {item.productName}
            </Link>
            <p className="text-indigo-600 font-bold mt-1">${item.productPrice}</p>
            <div className="flex gap-2 mt-3">
              <button onClick={() => handleAddToCart(item)}
                className="flex-1 bg-indigo-600 text-white text-sm px-3 py-2 rounded-lg hover:bg-indigo-700">
                Add to Cart
              </button>
              <button onClick={() => dispatch(removeFromWishlist(item.productId))}
                className="text-red-500 hover:text-red-700 text-sm px-2">
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
