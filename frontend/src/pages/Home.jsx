import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { fetchProducts, fetchCategories } from '../store/slices/productSlice';
import { ProductSkeleton } from '../components/Spinner';
import API from '../api/axios';

export default function Home() {
  const dispatch = useDispatch();
  const { products, categories, loading } = useSelector((s) => s.products);
  const [recentProducts, setRecentProducts] = useState([]);

  useEffect(() => {
    dispatch(fetchProducts());
    dispatch(fetchCategories());

    const recentIds = JSON.parse(localStorage.getItem('recentlyViewed') || '[]');
    if (recentIds.length > 0) {
      API.get(`/products/batch?ids=${recentIds.join(',')}`)
        .then((res) => setRecentProducts(res.data))
        .catch(() => {});
    }
  }, [dispatch]);

  return (
    <div>
      <section className="text-center py-16">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">Welcome to QuickVend</h1>
        <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">Discover amazing products at great prices.</p>
        <Link to="/products" className="bg-indigo-600 text-white px-8 py-3 rounded-lg text-lg hover:bg-indigo-700">
          Shop Now
        </Link>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-6 dark:text-gray-100">Categories</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {categories.map((cat) => (
            <Link key={cat.id} to={`/products?categoryId=${cat.id}`}
              className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border dark:border-gray-700 hover:shadow-md transition text-center">
              <h3 className="font-medium text-gray-900 dark:text-gray-100">{cat.name}</h3>
            </Link>
          ))}
        </div>
      </section>

      {recentProducts.length > 0 && (
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-6 dark:text-gray-100">Recently Viewed</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {recentProducts.slice(0, 4).map((product) => (
              <Link key={product.id} to={`/products/${product.id}`}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border dark:border-gray-700 hover:shadow-md transition p-4">
                <div className="h-32 bg-gray-100 dark:bg-gray-700 rounded mb-3 flex items-center justify-center text-gray-400">
                  {product.imageUrl ? (
                    <img src={product.imageUrl} alt={product.name} className="h-full w-full object-cover rounded" />
                  ) : (<span>No Image</span>)}
                </div>
                <h3 className="font-medium text-gray-900 dark:text-gray-100 text-sm truncate">{product.name}</h3>
                <p className="text-indigo-600 font-bold text-sm mt-1">${product.price}</p>
              </Link>
            ))}
          </div>
        </section>
      )}

      <section>
        <h2 className="text-2xl font-semibold mb-6 dark:text-gray-100">Featured Products</h2>
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => <ProductSkeleton key={i} />)}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {products.slice(0, 8).map((product) => (
              <Link key={product.id} to={`/products/${product.id}`}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border dark:border-gray-700 hover:shadow-md transition p-4">
                {product.stockQuantity > 0 && product.stockQuantity <= 5 && (
                  <span className="bg-orange-500 text-white text-xs px-2 py-0.5 rounded-full inline-block mb-2">
                    Only {product.stockQuantity} left!
                  </span>
                )}
                <div className="h-40 bg-gray-100 dark:bg-gray-700 rounded mb-3 flex items-center justify-center text-gray-400">
                  {product.imageUrl ? (
                    <img src={product.imageUrl} alt={product.name} className="h-full w-full object-cover rounded" />
                  ) : (
                    <span>No Image</span>
                  )}
                </div>
                <h3 className="font-medium text-gray-900 dark:text-gray-100 truncate">{product.name}</h3>
                <p className="text-indigo-600 font-bold mt-1">${product.price}</p>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
