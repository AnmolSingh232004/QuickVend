import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { login, clearError } from '../store/slices/authSlice';
import { isTokenValid } from '../utils';

const DEMO_ACCOUNTS = [
  { role: 'Admin', email: 'admin@shop.com', password: 'admin123', style: 'purple' },
  { role: 'Customer', email: 'user@shop.com', password: 'user123', style: 'green' },
];

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error, token } = useSelector((s) => s.auth);

  useEffect(() => { dispatch(clearError()); }, [dispatch]);
  useEffect(() => { if (token && isTokenValid(token)) navigate('/'); }, [token, navigate]);

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(login(form));
  };

  const fillAndLogin = (email, password) => {
    setForm({ email, password });
    dispatch(login({ email, password }));
  };

  return (
    <div className="max-w-md mx-auto mt-10">
      <h1 className="text-2xl font-bold text-center mb-6 dark:text-gray-100">Login</h1>

      <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg p-3 mb-4 text-sm text-yellow-800 dark:text-yellow-200">
        ⏳ The backend runs on a free tier and may take ~1 minute to wake up (cold start).
        If login seems stuck, wait a moment and try again.
      </div>

      {error && <p className="text-red-500 text-center mb-4">{error}</p>}
      <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border dark:border-gray-700 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
          <input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="w-full border rounded-lg px-3 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Password</label>
          <input type="password" required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })}
            className="w-full border rounded-lg px-3 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100" />
        </div>
        <button type="submit" disabled={loading}
          className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50">
          {loading ? 'Logging in... (backend may be waking up)' : 'Login'}
        </button>
        <p className="text-center text-sm text-gray-600 dark:text-gray-400">
          Don't have an account? <Link to="/register" className="text-indigo-600">Register</Link>
        </p>
      </form>

      <div className="mt-6 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border dark:border-gray-700">
        <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Demo Accounts</p>
        <div className="space-y-2">
          {DEMO_ACCOUNTS.map((acc) => (
            <div key={acc.email} className="flex items-center justify-between p-2.5 rounded bg-gray-50 dark:bg-gray-700/50">
              <div className="flex items-center gap-2 min-w-0">
                <span className={`shrink-0 text-xs font-semibold px-2 py-0.5 rounded ${
                  acc.style === 'purple'
                    ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300'
                    : 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300'
                }`}>
                  {acc.role}
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400 truncate">{acc.email}</span>
              </div>
              <button type="button" onClick={() => fillAndLogin(acc.email, acc.password)}
                className="shrink-0 text-xs font-medium bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300 px-3 py-1 rounded hover:bg-indigo-200 dark:hover:bg-indigo-900/60 transition-colors">
                Fill & Login
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
