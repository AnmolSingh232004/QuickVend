import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { register, clearError } from '../store/slices/authSlice';
import { isTokenValid } from '../utils';

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error, token } = useSelector((s) => s.auth);

  useEffect(() => { dispatch(clearError()); }, [dispatch]);
  useEffect(() => { if (token && isTokenValid(token)) navigate('/'); }, [token, navigate]);

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(register(form));
  };

  return (
    <div className="max-w-md mx-auto mt-10">
      <h1 className="text-2xl font-bold text-center mb-6 dark:text-gray-100">Register</h1>
      {error && <p className="text-red-500 text-center mb-4">{error}</p>}
      <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border dark:border-gray-700 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name</label>
          <input type="text" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full border rounded-lg px-3 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
          <input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="w-full border rounded-lg px-3 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Password</label>
          <input type="password" required minLength={6} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })}
            className="w-full border rounded-lg px-3 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100" />
        </div>
        <button type="submit" disabled={loading}
          className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50">
          {loading ? 'Registering...' : 'Register'}
        </button>
        <p className="text-center text-sm text-gray-600 dark:text-gray-400">
          Already have an account? <Link to="/login" className="text-indigo-600">Login</Link>
        </p>
      </form>
    </div>
  );
}
