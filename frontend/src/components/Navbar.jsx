import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../store/slices/authSlice';
import ThemeToggle from './ThemeToggle';

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { user } = useSelector((s) => s.auth);
  const { items } = useSelector((s) => s.cart);
  const { items: wishlistItems } = useSelector((s) => s.wishlist || { items: [] });
  const dispatch = useDispatch();
  const isAdmin = user?.role === 'ROLE_ADMIN';

  const linkClass = 'text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400';

  return (
    <nav className="bg-white dark:bg-gray-900 shadow-sm border-b dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="text-xl font-bold text-indigo-600">QuickVend</Link>

        <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden text-gray-600 dark:text-gray-300 text-2xl">
          {menuOpen ? '✕' : '☰'}
        </button>

        <div className={`${menuOpen ? 'flex' : 'hidden'} md:flex absolute md:static top-16 left-0 right-0 bg-white dark:bg-gray-900 md:bg-transparent flex-col md:flex-row items-start md:items-center gap-4 p-4 md:p-0 border-b md:border-0 dark:border-gray-700 shadow-md md:shadow-none z-50`}>
          <Link to="/products" className={linkClass} onClick={() => setMenuOpen(false)}>Products</Link>
          {user ? (
            <>
              <Link to="/wishlist" className={`${linkClass} relative`} onClick={() => setMenuOpen(false)}>
                Wishlist
                {wishlistItems.length > 0 && (
                  <span className="absolute -top-2 -right-4 bg-pink-500 text-white text-xs rounded-full px-1.5">
                    {wishlistItems.length}
                  </span>
                )}
              </Link>
              <Link to="/cart" className={`${linkClass} relative`} onClick={() => setMenuOpen(false)}>
                Cart
                {items.length > 0 && (
                  <span className="absolute -top-2 -right-4 bg-indigo-600 text-white text-xs rounded-full px-1.5">
                    {items.length}
                  </span>
                )}
              </Link>
              <Link to="/orders" className={linkClass} onClick={() => setMenuOpen(false)}>Orders</Link>
              {isAdmin && (
                <>
                  <Link to="/admin" className={`${linkClass} font-medium`} onClick={() => setMenuOpen(false)}>Admin</Link>
                  <Link to="/admin/coupons" className={linkClass} onClick={() => setMenuOpen(false)}>Coupons</Link>
                </>
              )}
              <Link to="/profile" className={`${linkClass} text-sm`} onClick={() => setMenuOpen(false)}>{user.name}</Link>
              <button onClick={() => { dispatch(logout()); setMenuOpen(false); }} className="text-red-500 hover:text-red-700 text-sm">
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className={linkClass} onClick={() => setMenuOpen(false)}>Login</Link>
              <Link to="/register" className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700" onClick={() => setMenuOpen(false)}>
                Register
              </Link>
            </>
          )}
          <ThemeToggle />
        </div>
      </div>
    </nav>
  );
}
