import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { fetchProductById } from '../store/slices/productSlice';
import { addToCart } from '../store/slices/cartSlice';
import { addToWishlist, removeFromWishlist, fetchWishlist } from '../store/slices/wishlistSlice';
import Spinner from '../components/Spinner';
import ReviewSection from '../components/ReviewSection';

export default function ProductDetail() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { selectedProduct: product, loading } = useSelector((s) => s.products);
  const { token } = useSelector((s) => s.auth);
  const { items: wishlistItems } = useSelector((s) => s.wishlist);
  const [qty, setQty] = useState(1);
  const wishlistIds = new Set(wishlistItems.map((i) => i.productId));

  useEffect(() => {
    dispatch(fetchProductById(id));
    if (token) dispatch(fetchWishlist());
  }, [dispatch, id, token]);

  useEffect(() => {
    if (product?.id) {
      const recent = JSON.parse(localStorage.getItem('recentlyViewed') || '[]');
      const updated = [product.id, ...recent.filter((rid) => rid !== product.id)].slice(0, 10);
      localStorage.setItem('recentlyViewed', JSON.stringify(updated));
    }
  }, [product?.id]);

  const handleAddToCart = () => {
    if (!token) return navigate('/login');
    dispatch(addToCart({ productId: product.id, quantity: qty }));
  };

  const handleToggleWishlist = () => {
    if (!token) return navigate('/login');
    if (wishlistIds.has(product.id)) {
      dispatch(removeFromWishlist(product.id));
    } else {
      dispatch(addToWishlist(product.id));
    }
  };

  if (loading) return <Spinner text="Loading product..." />;
  if (!product) return <p className="text-gray-500 dark:text-gray-400 text-center py-10">Product not found.</p>;

  const inWishlist = wishlistIds.has(product.id);

  return (
    <div className="max-w-4xl mx-auto">
      <nav className="text-sm text-gray-500 dark:text-gray-400 mb-4">
        <Link to="/" className="hover:text-indigo-600">Home</Link>
        <span className="mx-2">/</span>
        <Link to="/products" className="hover:text-indigo-600">Products</Link>
        {product.categoryName && (
          <>
            <span className="mx-2">/</span>
            <Link to={`/products?categoryId=${product.categoryId}`} className="hover:text-indigo-600">{product.categoryName}</Link>
          </>
        )}
        <span className="mx-2">/</span>
        <span className="text-gray-900 dark:text-gray-100">{product.name}</span>
      </nav>
      <div className="grid md:grid-cols-2 gap-8">
        <div className="h-80 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center text-gray-400">
          {product.imageUrl ? (
            <img src={product.imageUrl} alt={product.name} className="h-full w-full object-cover rounded-lg" />
          ) : (
            <span className="text-4xl">No Image</span>
          )}
        </div>
        <div>
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">{product.name}</h1>
            {token && (
              <button onClick={handleToggleWishlist} className="text-3xl hover:scale-110 transition" title={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}>
                {inWishlist ? '❤️' : '🤍'}
              </button>
            )}
          </div>
          {product.categoryName && (
            <p className="text-sm text-indigo-600 mb-2">{product.categoryName}</p>
          )}
          <p className="text-3xl font-bold text-indigo-600 mb-4">${product.price}</p>
          {product.avgRating != null && (
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              {'★'.repeat(Math.round(product.avgRating))}{'☆'.repeat(5 - Math.round(product.avgRating))}
              {' '}({product.reviewCount} {product.reviewCount === 1 ? 'review' : 'reviews'})
            </p>
          )}
          <p className="text-gray-600 dark:text-gray-300 mb-4">{product.description || 'No description available.'}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">SKU: {product.sku} | Stock: {product.stockQuantity}</p>

          <div className="flex items-center gap-4 mb-4">
            <label className="text-sm font-medium dark:text-gray-300">Qty:</label>
            <select value={qty} onChange={(e) => setQty(Number(e.target.value))}
              className="border dark:border-gray-600 rounded px-3 py-1 dark:bg-gray-800 dark:text-gray-100">
              {[...Array(Math.min(product.stockQuantity, 10)).keys()].map((n) => (
                <option key={n + 1} value={n + 1}>{n + 1}</option>
              ))}
            </select>
          </div>

          <button onClick={handleAddToCart}
            disabled={product.stockQuantity === 0}
            className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 disabled:bg-gray-400">
            {product.stockQuantity === 0 ? 'Out of Stock' : 'Add to Cart'}
          </button>
        </div>
      </div>
      <ReviewSection productId={product.id} />
    </div>
  );
}
