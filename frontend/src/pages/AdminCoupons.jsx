import { useEffect, useState } from 'react';
import API from '../api/axios';
import Spinner from '../components/Spinner';

export default function AdminCoupons() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [code, setCode] = useState('');
  const [discountPercent, setDiscountPercent] = useState(10);
  const [maxUses, setMaxUses] = useState(100);
  const [expiresAt, setExpiresAt] = useState('');
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const res = await API.get('/coupons');
      setCoupons(res.data);
    } catch (e) {
      setError('Failed to load coupons');
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const body = { code, discountPercent, maxUses };
      if (expiresAt) body.expiresAt = new Date(expiresAt).toISOString();
      await API.post('/coupons', body);
      setCode('');
      setDiscountPercent(10);
      setMaxUses(100);
      setExpiresAt('');
      load();
    } catch (e) {
      setError(e.response?.data?.error || 'Failed to create coupon');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this coupon?')) return;
    await API.delete(`/coupons/${id}`);
    load();
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Coupons</h1>

      {error && <p className="text-red-500 mb-4">{error}</p>}

      <form onSubmit={handleCreate} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border dark:border-gray-700 mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Code</label>
          <input required value={code} onChange={(e) => setCode(e.target.value.toUpperCase())}
            className="w-full border rounded px-3 py-2 dark:bg-gray-700 dark:border-gray-600" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Discount %</label>
          <input type="number" min="1" max="100" required value={discountPercent}
            onChange={(e) => setDiscountPercent(Number(e.target.value))}
            className="w-full border rounded px-3 py-2 dark:bg-gray-700 dark:border-gray-600" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Max Uses</label>
          <input type="number" min="1" required value={maxUses}
            onChange={(e) => setMaxUses(Number(e.target.value))}
            className="w-full border rounded px-3 py-2 dark:bg-gray-700 dark:border-gray-600" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Expires</label>
          <input type="date" value={expiresAt} onChange={(e) => setExpiresAt(e.target.value)}
            className="w-full border rounded px-3 py-2 dark:bg-gray-700 dark:border-gray-600" />
        </div>
        <div className="md:col-span-4">
          <button type="submit" className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700">
            Create Coupon
          </button>
        </div>
      </form>

      {loading ? <Spinner text="Loading coupons..." /> : (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border dark:border-gray-700 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="text-left px-4 py-3">Code</th>
                <th className="text-left px-4 py-3">Discount</th>
                <th className="text-left px-4 py-3">Uses</th>
                <th className="text-left px-4 py-3">Active</th>
                <th className="text-left px-4 py-3">Expires</th>
                <th className="text-right px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {coupons.map((c) => (
                <tr key={c.id} className="border-t dark:border-gray-700">
                  <td className="px-4 py-3 font-mono font-medium">{c.code}</td>
                  <td className="px-4 py-3">{c.discountPercent}%</td>
                  <td className="px-4 py-3">{c.usedCount}/{c.maxUses}</td>
                  <td className="px-4 py-3">{c.isActive ? 'Yes' : 'No'}</td>
                  <td className="px-4 py-3">{c.expiresAt ? new Date(c.expiresAt).toLocaleDateString() : '-'}</td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => handleDelete(c.id)} className="text-red-500 hover:text-red-700">Delete</button>
                  </td>
                </tr>
              ))}
              {coupons.length === 0 && (
                <tr><td colSpan="6" className="text-center py-6 text-gray-500">No coupons yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
