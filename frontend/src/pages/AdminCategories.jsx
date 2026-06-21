import { useEffect, useState } from 'react';
import API from '../api/axios';

export default function AdminCategories() {
  const [categories, setCategories] = useState([]);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [editing, setEditing] = useState(null);

  const load = async () => {
    const res = await API.get('/categories');
    setCategories(res.data);
  };

  useEffect(() => { load(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = { name, description };
    if (editing) {
      await API.put(`/admin/categories/${editing}`, payload);
    } else {
      await API.post('/admin/categories', payload);
    }
    setName('');
    setDescription('');
    setEditing(null);
    load();
  };

  const handleEdit = (c) => {
    setName(c.name);
    setDescription(c.description || '');
    setEditing(c.id);
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this category?')) return;
    await API.delete(`/admin/categories/${id}`);
    load();
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6 dark:text-gray-100">Categories</h1>

      <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border dark:border-gray-700 mb-6 flex gap-4 items-end">
        <div className="flex-1">
          <label className="block text-sm font-medium mb-1 dark:text-gray-300">Name</label>
          <input required value={name} onChange={(e) => setName(e.target.value)} className="w-full border rounded px-3 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100" />
        </div>
        <div className="flex-1">
          <label className="block text-sm font-medium mb-1 dark:text-gray-300">Description</label>
          <input value={description} onChange={(e) => setDescription(e.target.value)} className="w-full border rounded px-3 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100" />
        </div>
        <button type="submit" className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700">
          {editing ? 'Update' : 'Create'}
        </button>
        {editing && <button type="button" onClick={() => { setName(''); setDescription(''); setEditing(null); }} className="text-gray-500 dark:text-gray-400 hover:text-gray-700">Cancel</button>}
      </form>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border dark:border-gray-700">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="text-left px-4 py-3 dark:text-gray-200">Name</th>
              <th className="text-left px-4 py-3 dark:text-gray-200">Slug</th>
              <th className="text-left px-4 py-3 dark:text-gray-200">Description</th>
              <th className="text-right px-4 py-3 dark:text-gray-200">Actions</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((c) => (
              <tr key={c.id} className="border-t dark:border-gray-700">
                <td className="px-4 py-3 font-medium dark:text-gray-200">{c.name}</td>
                <td className="px-4 py-3 text-gray-500 dark:text-gray-400">{c.slug}</td>
                <td className="px-4 py-3 text-gray-500 dark:text-gray-400">{c.description || '-'}</td>
                <td className="px-4 py-3 text-right">
                  <button onClick={() => handleEdit(c)} className="text-indigo-600 hover:text-indigo-800 mr-3">Edit</button>
                  <button onClick={() => handleDelete(c.id)} className="text-red-500 hover:text-red-700">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
