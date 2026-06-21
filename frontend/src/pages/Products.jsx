import { useEffect, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useSearchParams } from 'react-router-dom';
import { fetchProducts, fetchCategories } from '../store/slices/productSlice';
import { addToWishlist, removeFromWishlist, fetchWishlist } from '../store/slices/wishlistSlice';

export default function Products() {
  const dispatch = useDispatch();
  const [searchParams, setSearchParams] = useSearchParams();
  const { products, categories, loading, totalPages, currentPage } = useSelector((s) => s.products);
  const { items: wishlistItems } = useSelector((s) => s.wishlist);
  const { token } = useSelector((s) => s.auth);

  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [categoryId, setCategoryId] = useState(searchParams.get('categoryId') || '');
  const [minPrice, setMinPrice] = useState(searchParams.get('minPrice') || '');
  const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || '');
  const [sort, setSort] = useState(searchParams.get('sort') || 'name');
  const [page, setPage] = useState(parseInt(searchParams.get('page') || '0'));

  const wishlistIds = new Set(wishlistItems.map((i) => i.productId));

  const buildParams = useCallback(() => {
    const params = { page, size: 12, sort };
    if (search) params.search = search;
    if (categoryId) params.categoryId = categoryId;
    if (minPrice) params.minPrice = minPrice;
    if (maxPrice) params.maxPrice = maxPrice;
    return params;
  }, [search, categoryId, minPrice, maxPrice, sort, page]);

  useEffect(() => {
    dispatch(fetchProducts(buildParams()));
    dispatch(fetchCategories());
    if (token) dispatch(fetchWishlist());
  }, [dispatch, buildParams, token]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(0);
    const params = { page: 0, size: 12, sort };
    if (search) params.search = search;
    if (categoryId) params.categoryId = categoryId;
    if (minPrice) params.minPrice = minPrice;
    if (maxPrice) params.maxPrice = maxPrice;
    setSearchParams({ search, categoryId, minPrice, maxPrice, sort });
    dispatch(fetchProducts(params));
  };

  const handleFilter = (field, value) => {
    if (field === 'categoryId') setCategoryId(value);
    else if (field === 'minPrice') setMinPrice(value);
    else if (field === 'maxPrice') setMaxPrice(value);
    else if (field === 'sort') setSort(value);
    setPage(0);
    const params = { page: 0, size: 12, sort: field === 'sort' ? value : sort };
    if (search) params.search = search;
    if (field === 'categoryId' ? value : categoryId) params.categoryId = field === 'categoryId' ? value : categoryId;
    if (field === 'minPrice' ? value : minPrice) params.minPrice = field === 'minPrice' ? value : minPrice;
    if (field === 'maxPrice' ? value : maxPrice) params.maxPrice = field === 'maxPrice' ? value : maxPrice;
    setSearchParams(Object.fromEntries(Object.entries({ search, categoryId: params.categoryId || '', minPrice: params.minPrice || '', maxPrice: params.maxPrice || '', sort: params.sort }).filter(([_, v]) => v)));
    dispatch(fetchProducts(params));
  };

  const goToPage = (p) => {
    setPage(p);
    dispatch(fetchProducts({ ...buildParams(), page: p, size: 12 }));
  };

  const toggleWishlist = (e, productId) => {
    e.preventDefault();
    e.stopPropagation();
    if (wishlistIds.has(productId)) {
      dispatch(removeFromWishlist(productId));
    } else {
      dispatch(addToWishlist(productId));
    }
  };

  return (
    <div>
      <div className="flex flex-col gap-4 mb-6">
        <form onSubmit={handleSearch} className="flex gap-2">
          <input type="text" placeholder="Search products..." value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 border rounded-lg px-3 py-2 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100" />
          <button type="submit" className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700">
            Search
          </button>
        </form>

        <div className="flex gap-4 flex-wrap items-center">
          <select value={categoryId} onChange={(e) => handleFilter('categoryId', e.target.value)}
            className="border rounded-lg px-3 py-2 text-sm dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100">
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
          <select value={sort} onChange={(e) => handleFilter('sort', e.target.value)}
            className="border rounded-lg px-3 py-2 text-sm dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100">
            <option value="name">Name A-Z</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
            <option value="newest">Newest First</option>
          </select>
          <input type="number" placeholder="Min $" value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            onBlur={() => handleFilter('minPrice', minPrice)}
            className="w-24 border rounded-lg px-3 py-2 text-sm dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100" />
          <input type="number" placeholder="Max $" value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            onBlur={() => handleFilter('maxPrice', maxPrice)}
            className="w-24 border rounded-lg px-3 py-2 text-sm dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100" />
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border dark:border-gray-700 p-4 animate-pulse">
              <div className="h-40 bg-gray-200 dark:bg-gray-700 rounded mb-3" />
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2" />
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-2" />
              <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-1/4" />
            </div>
          ))}
        </div>
      ) : products.length === 0 ? (
        <p className="text-gray-500 dark:text-gray-400 text-center py-10">No products found.</p>
      ) : (
        <>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">{totalPages > 0 ? `Page ${currentPage + 1} of ${totalPages}` : ''}</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <div key={product.id} className="relative">
                <Link to={`/products/${product.id}`}
                  className="block bg-white dark:bg-gray-800 rounded-lg shadow-sm border dark:border-gray-700 hover:shadow-md transition p-4">
                  {product.stockQuantity > 0 && product.stockQuantity <= 5 && (
                    <span className="absolute top-2 left-2 bg-orange-500 text-white text-xs px-2 py-0.5 rounded-full z-10">
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
                  <p className="text-sm text-gray-500 dark:text-gray-400">{product.categoryName}</p>
                  <p className="text-indigo-600 font-bold mt-1">${product.price}</p>
                </Link>
                {token && (
                  <button onClick={(e) => toggleWishlist(e, product.id)}
                    className="absolute top-2 right-2 text-2xl drop-shadow-sm hover:scale-110 transition"
                    title={wishlistIds.has(product.id) ? 'Remove from wishlist' : 'Add to wishlist'}>
                    {wishlistIds.has(product.id) ? '❤️' : '🤍'}
                  </button>
                )}
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-8">
              <button onClick={() => goToPage(0)} disabled={currentPage === 0}
                className="px-3 py-1 border dark:border-gray-600 rounded text-sm disabled:opacity-30 hover:bg-gray-50 dark:hover:bg-gray-800 dark:text-gray-300">
                First
              </button>
              <button onClick={() => goToPage(currentPage - 1)} disabled={currentPage === 0}
                className="px-3 py-1 border dark:border-gray-600 rounded text-sm disabled:opacity-30 hover:bg-gray-50 dark:hover:bg-gray-800 dark:text-gray-300">
                Prev
              </button>
              <span className="text-sm text-gray-600 dark:text-gray-400 px-3">
                Page {currentPage + 1} of {totalPages}
              </span>
              <button onClick={() => goToPage(currentPage + 1)} disabled={currentPage >= totalPages - 1}
                className="px-3 py-1 border dark:border-gray-600 rounded text-sm disabled:opacity-30 hover:bg-gray-50 dark:hover:bg-gray-800 dark:text-gray-300">
                Next
              </button>
              <button onClick={() => goToPage(totalPages - 1)} disabled={currentPage >= totalPages - 1}
                className="px-3 py-1 border dark:border-gray-600 rounded text-sm disabled:opacity-30 hover:bg-gray-50 dark:hover:bg-gray-800 dark:text-gray-300">
                Last
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
